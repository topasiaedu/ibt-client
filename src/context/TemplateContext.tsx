import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { supabase } from "../utils/supabaseClient";
import { Database } from "../../database.types";
import { useWhatsAppBusinessAccountContext } from "./WhatsAppBusinessAccountContext";
import { useAlertContext } from "./AlertContext";
import { useProjectContext } from "./ProjectContext";
import isEqual from "lodash/isEqual"; // Import lodash's isEqual for deep comparison

export type Template = Database["public"]["Tables"]["templates"]["Row"];
export type Templates = { templates: Template[] };
export type TemplateInsert =
  Database["public"]["Tables"]["templates"]["Insert"];

const WHATSAPP_ACCESS_TOKEN =
  "Bearer EAAFZCUSsuZBkQBO7vI52BiAVIVDPsZAATo0KbTLYdZBQ7hCq59lPYf5FYz792HlEN13MCPGDaVP93VYZASXz9ZBNXaiATyIToimwDx0tcCB2sz0TwklEoof3K0mZASJtcYugK1hfdnJGJ1pnRXtnTGmlXiIgkyQe0ZC2DOh4qZAeRhJ9nd9hgKKedub4eaCgvZBWrOHBa3NadCqdlZCx0zO";

export type Component = {
  type: string;
  format: string | null;
  example: JSON | null;
  text: string | null;
  parameters: string[] | null;
  buttons: TemplateButton[] | null;
};

export type TemplateButton = {
  type: string;
  text: string | null;
  url: string | null;
  phone_number: string | null;
};

interface TemplateContextType {
  templates: Template[];
  addTemplate: (template: TemplateInsert) => void;
  updateTemplate: (template: Template) => void;
  deleteTemplate: (templateId: number) => void;
  loading: boolean;
}

const TemplateContext = createContext<TemplateContextType>(undefined!);

export function TemplateProvider({ children }: { children: React.ReactNode }) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const { whatsAppBusinessAccounts } = useWhatsAppBusinessAccountContext();
  const { showAlert } = useAlertContext();
  const { currentProject } = useProjectContext();

  useEffect(() => {
    setLoading(true);
    const fetchTemplates = async () => {
      const wabaIds = whatsAppBusinessAccounts.map((waba) =>
        waba.project_id === currentProject?.project_id ? waba.account_id : null
      );

      const { data: templates, error } = await supabase
        .from("templates")
        .select("*")
        .in("account_id", wabaIds)
        .order("template_id", { ascending: false });

      if (error) {
        console.error("Error fetching templates:", error);
        return;
      }

      setTemplates((prevTemplates) => {
        if (!isEqual(prevTemplates, templates)) {
          console.log("Updating templates state");
          return templates!;
        }
        return prevTemplates;
      });
    };

    fetchTemplates();

    const handleChanges = (payload: any) => {
      if (payload.eventType === "INSERT") {
        setTemplates((prev) => [payload.new, ...prev]);
      } else if (payload.eventType === "UPDATE") {
        setTemplates((prev) =>
          prev.map((template) =>
            template.template_id === payload.new.template_id
              ? payload.new
              : template
          )
        );
      } else if (payload.eventType === "DELETE") {
        setTemplates((prev) =>
          prev.filter(
            (template) => template.template_id !== payload.old.template_id
          )
        );
      }
    };

    const subscription = supabase
      .channel("templates")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "templates" },
        (payload) => {
          handleChanges(payload);
        }
      )
      .subscribe();

    setLoading(false);
    return () => {
      subscription.unsubscribe();
    };
  }, [currentProject?.project_id, whatsAppBusinessAccounts]);

  const addTemplate = useCallback(
    async (template: TemplateInsert) => {
      try {
        // Fetch Waba ID using template.account_id
        const waba = whatsAppBusinessAccounts.find(
          (waba) => waba.account_id === template.account_id
        );

        if (!waba) {
          showAlert("WhatsApp Business Account not found", "error");
          return;
        }

        const components = template.components as any;

        const body = JSON.stringify({
          name: template.name,
          category: template.category,
          language: template.language,
          components: components?.data,
        });

        console.log("body", body);
        console.log("waba", waba.waba_id);

        const response = await fetch(
          `https://graph.facebook.com/v19.0/${waba.waba_id}/message_templates`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: WHATSAPP_ACCESS_TOKEN,
            },
            body: body,
          }
        );
        const responseData = await response.json();
        const templateId = responseData.id;

        if (!response.ok) {
          console.error("Error adding template:", response.statusText);
          showAlert("Error adding template", "error");
          return;
        }

        // Add template to database
        const { error } = await supabase
          .from("templates")
          .insert([
            {
              ...template,
              account_id: waba.account_id,
              wa_template_id: templateId,
            },
          ]);

        if (error) {
          console.error("Error adding template:", error);
          showAlert("Error adding template", "error");
        }
      } catch (error) {
        console.error("Error adding template:", error);
        showAlert("Error adding template", "error");
      }
    },
    [showAlert, whatsAppBusinessAccounts]
  );

  const updateTemplate = useCallback(
    async (template: Template) => {
      const { error } = await supabase
        .from("templates")
        .update(template)
        .eq("template_id", template.template_id);
      if (error) {
        console.error("Error updating template:", error);
        showAlert("Error updating template", "error");
      } else {
        setTemplates((prevTemplates) =>
          prevTemplates.map((prevTemplate) =>
            prevTemplate.template_id === template.template_id
              ? { ...prevTemplate, ...template }
              : prevTemplate
          )
        );
      }
    },
    [showAlert]
  );

  const deleteTemplate = useCallback(
    async (templateId: number) => {
      const { error } = await supabase
        .from("templates")
        .delete()
        .eq("template_id", templateId);
      if (error) {
        console.error("Error deleting template:", error);
        showAlert("Error deleting template", "error");
      } else {
        setTemplates((prevTemplates) =>
          prevTemplates.filter(
            (prevTemplate) => prevTemplate.template_id !== templateId
          )
        );
      }
    },
    [showAlert]
  );

  const contextValue = useMemo(
    () => ({
      templates,
      addTemplate,
      updateTemplate,
      deleteTemplate,
      loading,
    }),
    [templates, loading, addTemplate, updateTemplate, deleteTemplate]
  );

  return (
    <TemplateContext.Provider value={contextValue}>
      {children}
    </TemplateContext.Provider>
  );
}
// Add the whyDidYouRender property after defining the component
(TemplateProvider as any).whyDidYouRender = true; // Add this line
export function useTemplateContext() {
  const context = useContext(TemplateContext);
  if (!context) {
    throw new Error(
      "useTemplateContext must be used within a TemplateProvider"
    );
  }
  return context;
}
