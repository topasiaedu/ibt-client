import React, {
  createContext,
  useContext,
  useState,
  PropsWithChildren,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { supabase } from "../utils/supabaseClient";
import { Database } from "../../database.types";
import { useProjectContext } from "./ProjectContext";
import { useAlertContext } from "./AlertContext";
import { PhoneNumber } from "./PhoneNumberContext";
import isEqual from "lodash/isEqual"; // Import lodash's isEqual for deep comparison

export type WorkflowPhoneNumber =
  Database["public"]["Tables"]["workflow_phone_numbers"]["Row"];
export type WorkflowPhoneNumberInsert =
  Database["public"]["Tables"]["workflow_phone_numbers"]["Insert"];

export type Workflow = Database["public"]["Tables"]["workflows"]["Row"] & {
  phone_numbers: PhoneNumber[];
  trigger: Trigger[];
  actions: Action[];
  total_read: number;
  total_sent: number;
  total_failed: number;
  total_unique_contacts: number;
};
export type Workflows = { workflows: Workflow[] };
export type WorkflowInsert =
  Database["public"]["Tables"]["workflows"]["Insert"] & {
    phone_numbers: PhoneNumber[];
  };

export type WorkflowUpdate =
  Database["public"]["Tables"]["workflows"]["Update"];

export type Trigger = Database["public"]["Tables"]["triggers"]["Row"];
export type Triggers = { triggers: Trigger[] };
export type TriggerInsert = Database["public"]["Tables"]["triggers"]["Insert"];
export type TriggerUpdate = Database["public"]["Tables"]["triggers"]["Update"];

export type Action = Database["public"]["Tables"]["actions"]["Row"];
export type Actions = { actions: Action[] };
export type ActionInsert = Database["public"]["Tables"]["actions"]["Insert"];
export type ActionUpdate = Database["public"]["Tables"]["actions"]["Update"];

export type WorkflowLogInsert =
  Database["public"]["Tables"]["workflow_logs"]["Insert"];

export type EventInsert = Database["public"]["Tables"]["events"]["Insert"];

export type WorkflowContextType = {
  workflows: Workflow[];
  createWorkflow: (
    workflow: WorkflowInsert,
    phoneNumbers: PhoneNumber[]
  ) => Promise<string | undefined>;
  updateWorkflow: (
    workflow: WorkflowUpdate,
    phoneNumbers: PhoneNumber[]
  ) => Promise<void>;
  deleteWorkflow: (workflowId: string) => Promise<void>;
  createTrigger: (trigger: TriggerInsert) => Promise<void>;
  updateTrigger: (trigger: TriggerUpdate) => Promise<void>;
  deleteTrigger: (triggerId: string) => Promise<void>;
  createAction: (action: ActionInsert) => Promise<void>;
  updateAction: (action: ActionUpdate) => Promise<void>;
  deleteAction: (actionId: string) => Promise<void>;
  createWorkflowLog: (workflowLog: WorkflowLogInsert) => Promise<void>;
  createEvent: (event: EventInsert) => Promise<void>;
  loading: boolean;
  startDate: Date;
  setStartDate: (date: Date) => void;
  endDate: Date;
  setEndDate: (date: Date) => void;
};

const WorkflowContext = createContext<WorkflowContextType>(
  {} as WorkflowContextType
);

export const WorkflowProvider: React.FC<PropsWithChildren<{}>> = ({
  children,
}) => {
  const { currentProject } = useProjectContext();
  const { showAlert } = useAlertContext();
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  // Set the default start date to the beginning of the current month
  const [startDate, setStartDate] = useState<Date>(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  );
  const [endDate, setEndDate] = useState<Date>(new Date());

  useEffect(() => {
    setLoading(true);
    const getWorkflows = async () => {
      if (!currentProject) {
        return;
      }

      const { data: workflowData, error: workflowError } = await supabase.rpc(
        "fetch_workflows",
        {
          project_id_param: currentProject.project_id,
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
        }
      );

      if (workflowError) {
        showAlert(workflowError.message, "error");
        console.error(workflowError);
        return;
      }

      if (workflowData) {
        setWorkflows((prevWorkflows) => {
          if (!isEqual(prevWorkflows, workflowData)) {
            return workflowData;
          } else {
            return prevWorkflows;
          }
        });
      }
    };

    getWorkflows();
    setLoading(false);
  }, [currentProject, endDate, showAlert, startDate]);

  const createWorkflow = useCallback(
    async (workflow: WorkflowInsert, phoneNumbers: PhoneNumber[]) => {
      const { data, error } = await supabase
        .from("workflows")
        .insert({ ...workflow, project_id: currentProject?.project_id })
        .select("id");
      if (error) {
        showAlert(error.message, "error");
        console.error(error);
        return;
      }

      // Add the phone numbers in the workflow
      const workflowId = (data?.[0] as unknown as { id: string })?.id;
      for (const phoneNumber of phoneNumbers) {
        await supabase.from("workflow_phone_numbers").insert({
          workflow_id: workflowId,
          phone_number_id: phoneNumber.phone_number_id,
        });
      }

      return workflowId;
    },
    [currentProject, showAlert]
  );

  const updateWorkflow = useCallback(
    async (workflow: WorkflowUpdate, phoneNumbers: PhoneNumber[]) => {
      const { error } = await supabase
        .from("workflows")
        .update(workflow)
        .eq("id", workflow.id);
      if (error) {
        showAlert(error.message, "error");
        console.error(error);
        return;
      }

      // Update the phone numbers in the workflow by deleting all previous one and add the new ones
      await supabase
        .from("workflow_phone_numbers")
        .delete()
        .eq("workflow_id", workflow.id);

      for (const phoneNumber of phoneNumbers) {
        await supabase.from("workflow_phone_numbers").insert({
          workflow_id: workflow.id,
          phone_number_id: phoneNumber.phone_number_id,
        });
      }
    },
    [showAlert]
  );

  const deleteWorkflow = useCallback(
    async (workflowId: string) => {
      const { error } = await supabase
        .from("workflows")
        .delete()
        .eq("id", workflowId);
      if (error) {
        showAlert(error.message, "error");
        console.error(error);
        return;
      }
    },
    [showAlert]
  );

  const createTrigger = useCallback(
    async (trigger: TriggerInsert) => {
      const { error } = await supabase
        .from("triggers")
        .insert({ ...trigger, project_id: currentProject?.project_id });
      if (error) {
        showAlert(error.message, "error");
        console.error(error);
        return;
      }
    },
    [currentProject?.project_id, showAlert]
  );

  const updateTrigger = useCallback(
    async (trigger: TriggerUpdate) => {
      const { error } = await supabase
        .from("triggers")
        .update(trigger)
        .eq("id", trigger.id);
      if (error) {
        showAlert(error.message, "error");
        console.error(error);
        return;
      }
    },
    [showAlert]
  );

  const deleteTrigger = useCallback(
    async (triggerId: string) => {
      const { error } = await supabase
        .from("triggers")
        .delete()
        .eq("id", triggerId);
      if (error) {
        showAlert(error.message, "error");
        console.error(error);
        return;
      }
    },
    [showAlert]
  );

  const createAction = useCallback(
    async (action: ActionInsert) => {
      const { error } = await supabase
        .from("actions")
        .insert({ ...action, project_id: currentProject?.project_id });
      if (error) {
        showAlert(error.message, "error");
        console.error(error);
        return;
      }
    },
    [currentProject?.project_id, showAlert]
  );

  const updateAction = useCallback(
    async (action: ActionUpdate) => {
      const { error } = await supabase
        .from("actions")
        .update(action)
        .eq("id", action.id);
      if (error) {
        showAlert(error.message, "error");
        console.error(error);
        return;
      }
    },
    [showAlert]
  );

  const deleteAction = useCallback(
    async (actionId: string) => {
      const { error } = await supabase
        .from("actions")
        .delete()
        .eq("id", actionId);
      if (error) {
        showAlert(error.message, "error");
        console.error(error);
        return;
      }
    },
    [showAlert]
  );

  const createWorkflowLog = useCallback(
    async (workflowLog: WorkflowLogInsert) => {
      const { error } = await supabase
        .from("workflow_logs")
        .insert(workflowLog);
      if (error) {
        showAlert(error.message, "error");
        console.error(error);
        return;
      }
    },
    [showAlert]
  );

  const createEvent = useCallback(
    async (event: EventInsert) => {
      const { error } = await supabase.from("events").insert(event);
      if (error) {
        showAlert(error.message, "error");
        console.error(error);
        return;
      }
    },
    [showAlert]
  );

  const contextValue = useMemo(
    () => ({
      workflows,
      createWorkflow,
      updateWorkflow,
      deleteWorkflow,
      createTrigger,
      updateTrigger,
      deleteTrigger,
      createAction,
      updateAction,
      deleteAction,
      createWorkflowLog,
      createEvent,
      loading,
      startDate,
      setStartDate,
      endDate,
      setEndDate,
    }),
    [
      workflows,
      createWorkflow,
      updateWorkflow,
      deleteWorkflow,
      createTrigger,
      updateTrigger,
      deleteTrigger,
      createAction,
      updateAction,
      deleteAction,
      createWorkflowLog,
      createEvent,
      loading,
      startDate,
      setStartDate,
      endDate,
      setEndDate,
    ]
  );

  return (
    <WorkflowContext.Provider value={contextValue}>
      {children}
    </WorkflowContext.Provider>
  );
};
// Add the whyDidYouRender property after defining the component
(WorkflowProvider as any).whyDidYouRender = true; // Add this line
export const useWorkflowContext = () => {
  const context = useContext(WorkflowContext);

  if (!context) {
    throw new Error(
      "useWorkflowContext must be used within a WorkflowProvider"
    );
  }

  return context;
};
