import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  PropsWithChildren,
  useCallback,
  useMemo,
} from "react";
import { supabase } from "../utils/supabaseClient";
import { Database } from "../../database.types";
import { useProjectContext } from "./ProjectContext";
import { useAlertContext } from "./AlertContext";
import isEqual from "lodash/isEqual"; // Add this import

export type WhatsAppBusinessAccount = Database["public"]["Tables"]["whatsapp_business_accounts"]["Row"];
export type WhatsAppBusinessAccounts = {
  whatsapp_business_accounts: WhatsAppBusinessAccount[];
};
export type WhatsAppBusinessAccountInsert = Database["public"]["Tables"]["whatsapp_business_accounts"]["Insert"];

interface WhatsAppBusinessAccountContextType {
  whatsAppBusinessAccounts: WhatsAppBusinessAccount[];
  addWhatsAppBusinessAccount: (whatsAppBusinessAccount: WhatsAppBusinessAccountInsert) => void;
  updateWhatsAppBusinessAccount: (whatsAppBusinessAccount: WhatsAppBusinessAccount) => void;
  deleteWhatsAppBusinessAccount: (whatsAppBusinessAccountId: number) => void;
  // selectedWhatsAppBusinessAccount: WhatsAppBusinessAccount | null;
  // setSelectedWhatsAppBusinessAccount: (whatsAppBusinessAccount: WhatsAppBusinessAccount | null) => void;
  loading: boolean;
}

const WhatsAppBusinessAccountContext = createContext<WhatsAppBusinessAccountContextType>(undefined!);

export const WhatsAppBusinessAccountProvider: React.FC<PropsWithChildren<{}>> = ({ children }) => {
  // const storage = window.localStorage.getItem("selectedWhatsAppBusinessAccount");
  const [whatsAppBusinessAccounts, setWhatsAppBusinessAccounts] = useState<WhatsAppBusinessAccount[]>([]);
  // const [selectedWhatsAppBusinessAccount, setSelectedWhatsAppBusinessAccount] = useState<WhatsAppBusinessAccount | null>(
  //   storage ? JSON.parse(storage) : null
  // );
  const [loading, setLoading] = useState<boolean>(false);
  const { currentProject } = useProjectContext();
  const { showAlert } = useAlertContext();

  useEffect(() => {
    setLoading(true);
    const fetchWhatsAppBusinessAccounts = async () => {
      if (!currentProject) return;

      const { data: whatsAppBusinessAccounts, error } = await supabase
        .from("whatsapp_business_accounts")
        .select("*")
        .eq("project_id", currentProject.project_id)
        .order("account_id", { ascending: false });

      if (error) {
        console.error("Error fetching WhatsApp Business Accounts:", error);
        showAlert("Error fetching WhatsApp Business Accounts", "error");
        return;
      }

      setWhatsAppBusinessAccounts((prevWhatsAppBusinessAccounts) => {
        if (!isEqual(prevWhatsAppBusinessAccounts, whatsAppBusinessAccounts)) {
          console.log("Updating WhatsApp Business Accounts state");
          return whatsAppBusinessAccounts!;
        }
        return prevWhatsAppBusinessAccounts;
      });

      // if (!selectedWhatsAppBusinessAccount && whatsAppBusinessAccounts!.length > 0) {
      //   setSelectedWhatsAppBusinessAccount(whatsAppBusinessAccounts![0]);
      // }
    };

    fetchWhatsAppBusinessAccounts();

    const handleChanges = (payload: any) => {
      if (payload.eventType === "INSERT") {
        setWhatsAppBusinessAccounts((prev) => [payload.new, ...prev]);
      } else if (payload.eventType === "UPDATE") {
        setWhatsAppBusinessAccounts((prev) =>
          prev.map((whatsAppBusinessAccount) =>
            whatsAppBusinessAccount.account_id === payload.new.account_id
              ? payload.new
              : whatsAppBusinessAccount
          )
        );
      } else if (payload.eventType === "DELETE") {
        setWhatsAppBusinessAccounts((prev) =>
          prev.filter((whatsAppBusinessAccount) =>
            whatsAppBusinessAccount.account_id !== payload.old.account_id
          )
        );
      }
    };

    const subscription = supabase
      .channel("whatsapp_business_accounts")
      .on("postgres_changes", { event: "*", schema: "public", table: "whatsapp_business_accounts" }, (payload) => {
        handleChanges(payload);
      })
      .subscribe();

    setLoading(false);
    return () => {
      subscription.unsubscribe();
    };
  }, [currentProject, showAlert]);

  const addWhatsAppBusinessAccount = useCallback(
    async (whatsAppBusinessAccount: WhatsAppBusinessAccountInsert) => {
      const { error } = await supabase
        .from("whatsapp_business_accounts")
        .insert(whatsAppBusinessAccount)
        .single();

      if (error) {
        console.error("Error adding WhatsApp Business Account:", error);
        showAlert("Error adding WhatsApp Business Account", "error");
        return null;
      }
    },
    [showAlert]
  );

  const updateWhatsAppBusinessAccount = useCallback(
    async (whatsAppBusinessAccount: WhatsAppBusinessAccount) => {
      const { error } = await supabase
        .from("whatsapp_business_accounts")
        .update(whatsAppBusinessAccount)
        .eq("account_id", whatsAppBusinessAccount.account_id)
        .single();

      if (error) {
        console.error("Error updating WhatsApp Business Account:", error);
        showAlert("Error updating WhatsApp Business Account", "error");
        return;
      }
    },
    [showAlert]
  );

  const deleteWhatsAppBusinessAccount = useCallback(
    async (whatsAppBusinessAccountId: number) => {
      const { error } = await supabase
        .from("whatsapp_business_accounts")
        .delete()
        .eq("account_id", whatsAppBusinessAccountId);

      if (error) {
        console.error("Error deleting WhatsApp Business Account:", error);
        showAlert("Error deleting WhatsApp Business Account", "error");
        return;
      }
    },
    [showAlert]
  );

  const contextValue = useMemo(
    () => ({
      whatsAppBusinessAccounts,
      addWhatsAppBusinessAccount,
      updateWhatsAppBusinessAccount,
      deleteWhatsAppBusinessAccount,
      // selectedWhatsAppBusinessAccount,
      // setSelectedWhatsAppBusinessAccount,
      loading,
    }),
    [
      whatsAppBusinessAccounts,
      addWhatsAppBusinessAccount,
      updateWhatsAppBusinessAccount,
      deleteWhatsAppBusinessAccount,
      // selectedWhatsAppBusinessAccount,
      // setSelectedWhatsAppBusinessAccount,
      loading,
    ]
  );

  return (
    <WhatsAppBusinessAccountContext.Provider value={contextValue}>
      {children}
    </WhatsAppBusinessAccountContext.Provider>
  );
};

// Add the whyDidYouRender property after defining the component
(WhatsAppBusinessAccountProvider as any).whyDidYouRender = true;

export const useWhatsAppBusinessAccountContext = () => {
  const context = useContext(WhatsAppBusinessAccountContext);
  if (!context) {
    throw new Error("useWhatsAppBusinessAccountContext must be used within a WhatsAppBusinessAccountProvider");
  }
  return context;
};
