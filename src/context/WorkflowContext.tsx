import React, { createContext, useContext, useState, PropsWithChildren, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import { Database } from '../../database.types';
import { useProjectContext } from './ProjectContext';
import { useAlertContext } from './AlertContext';
import { PhoneNumber, usePhoneNumberContext } from './PhoneNumberContext';

export type WorkflowPhoneNumber = Database['public']['Tables']['workflow_phone_numbers']['Row'];
export type WorkflowPhoneNumberInsert = Database['public']['Tables']['workflow_phone_numbers']['Insert'];

export type Workflow = Database['public']['Tables']['workflows']['Row'] & { phone_numbers: PhoneNumber[], trigger: Trigger[], actions: Action[] };
export type Workflows = { workflows: Workflow[] };
export type WorkflowInsert = Database['public']['Tables']['workflows']['Insert'];
export type WorkflowUpdate = Database['public']['Tables']['workflows']['Update'];


export type Trigger = Database['public']['Tables']['triggers']['Row'];
export type Triggers = { triggers: Trigger[] };
export type TriggerInsert = Database['public']['Tables']['triggers']['Insert'];
export type TriggerUpdate = Database['public']['Tables']['triggers']['Update'];

export type Action = Database['public']['Tables']['actions']['Row'];
export type Actions = { actions: Action[] };
export type ActionInsert = Database['public']['Tables']['actions']['Insert'];
export type ActionUpdate = Database['public']['Tables']['actions']['Update'];

export type WorkflowLogInsert = Database['public']['Tables']['workflow_logs']['Insert'];

export type EventInsert = Database['public']['Tables']['events']['Insert'];

export type WorkflowContextType = {
  workflows: Workflow[];
  createWorkflow: (workflow: WorkflowInsert, phoneNumbers: PhoneNumber[]) => Promise<void>;
  updateWorkflow: (workflow: WorkflowUpdate, phoneNumbers: PhoneNumber[]) => Promise<void>;
  deleteWorkflow: (workflowId: number) => Promise<void>;
  createTrigger: (trigger: TriggerInsert) => Promise<void>;
  updateTrigger: (trigger: TriggerUpdate) => Promise<void>;
  deleteTrigger: (triggerId: number) => Promise<void>;
  createAction: (action: ActionInsert) => Promise<void>;
  updateAction: (action: ActionUpdate) => Promise<void>;
  deleteAction: (actionId: number) => Promise<void>;
  createWorkflowLog: (workflowLog: WorkflowLogInsert) => Promise<void>;
  createEvent: (event: EventInsert) => Promise<void>;
  loading: boolean;
};

const WorkflowContext = createContext<WorkflowContextType>({} as WorkflowContextType);

export const WorkflowProvider: React.FC<PropsWithChildren<{}>> = ({ children }) => {
  const { currentProject } = useProjectContext();
  const { showAlert } = useAlertContext();
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const { phoneNumbers } = usePhoneNumberContext();

  useEffect(() => {
    setLoading(true);
    const getWorkflows = async () => {
      if (!currentProject) { return; }

      const { data: workflows, error } = await supabase
        .from('workflows')
        .select(`
          *,
          trigger: triggers(*),
          actions: actions(*)
        `)
        .eq('project_id', currentProject?.project_id)

      if (error) { showAlert(error.message, 'error'); return; }

      // fetch the phone numbers related in the table workflow_phone_numbers
      for (const workflow of workflows) {
        const { data: phoneNumbers, error } = await supabase
          .from('workflow_phone_numbers')
          .select('*')
          .eq('workflow_id', workflow.id);

        if (error) { showAlert(error.message, 'error'); return; }

        // Populate the phone numbers in the workflow as we only get the id from the table workflow_phone_numbers
        workflow.phone_numbers = phoneNumbers;

        // Populate the phone numbers in the workflow as we only get the id from the table workflow_phone_numbers
        workflow.phone_numbers = phoneNumbers.map((phoneNumber) => {
          return phoneNumbers.find((el) => el.id === phoneNumber.id);
        });
      }

      if (workflows) {
        setWorkflows(workflows);
      }
    };

    getWorkflows();
    setLoading(false);
  }, [currentProject, showAlert]);


  const createWorkflow = async (workflow: WorkflowInsert, phoneNumbers: PhoneNumber[]) => {
    const { data, error } = await supabase.from('workflows').insert({ ...workflow, project_id: currentProject?.project_id }).select('id');
    if (error) { showAlert(error.message, 'error'); return; }

    // Add the phone numbers in the workflow
    const workflowId = (data?.[0] as unknown as { id: number })?.id;
    for (const phoneNumber of phoneNumbers) {
      await supabase.from('workflow_phone_numbers').insert({ workflow_id: workflowId, phone_number_id: phoneNumber.phone_number_id });
    }
  };

  const updateWorkflow = async (workflow: WorkflowUpdate, phoneNumbers: PhoneNumber[]) => {
    const { error } = await supabase.from('workflows').update({
      name: workflow.name,
      description: workflow.description,
      run: workflow.run    
    }).eq('id', workflow.id);
    if (error) { showAlert(error.message, 'error'); console.error(error); return; }

    // Update the phone numbers in the workflow by deleting all previous one and add the new ones
    await supabase.from('workflow_phone_numbers').delete().eq('workflow_id', workflow.id);
    for (const phoneNumber of phoneNumbers) {
      await supabase.from('workflow_phone_numbers').insert({ workflow_id: workflow.id, phone_number_id: phoneNumber.phone_number_id });
    }
  };

  const deleteWorkflow = async (workflowId: number) => {
    const { error } = await supabase.from('workflows').delete().eq('id', workflowId);
    if (error) { showAlert(error.message, 'error'); return; }
  };

  const createTrigger = async (trigger: TriggerInsert) => {
    const { error } = await supabase.from('triggers').insert({ ...trigger, project_id: currentProject?.project_id });
    if (error) { showAlert(error.message, 'error'); return; }
  };

  const updateTrigger = async (trigger: TriggerUpdate) => {
    const { error } = await supabase.from('triggers').update(trigger).eq('id', trigger.id);
    if (error) { showAlert(error.message, 'error'); return; }
  };

  const deleteTrigger = async (triggerId: number) => {
    const { error } = await supabase.from('triggers').delete().eq('id', triggerId);
    if (error) { showAlert(error.message, 'error'); return; }
  };

  const createAction = async (action: ActionInsert) => {
    const { error } = await supabase.from('actions').insert({ ...action, project_id: currentProject?.project_id });
    if (error) { showAlert(error.message, 'error'); return; }
  };

  const updateAction = async (action: ActionUpdate) => {
    const { error } = await supabase.from('actions').update(action).eq('id', action.id);
    if (error) { showAlert(error.message, 'error'); return; }
  };

  const deleteAction = async (actionId: number) => {
    const { error } = await supabase.from('actions').delete().eq('id', actionId);
    if (error) { showAlert(error.message, 'error'); return; }
  };

  const createWorkflowLog = async (workflowLog: WorkflowLogInsert) => {
    const { error } = await supabase.from('workflow_logs').insert(workflowLog);
    if (error) { showAlert(error.message, 'error'); return; }
  };

  const createEvent = async (event: EventInsert) => {
    const { error } = await supabase.from('events').insert(event);
    if (error) { showAlert(error.message, 'error'); return; }
  };

  return (
    <WorkflowContext.Provider
      value={{
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
        loading
      }}
    >
      {children}
    </WorkflowContext.Provider>
  );

}

export const useWorkflowContext = () => {
  const context = useContext(WorkflowContext);

  if (!context) {
    throw new Error('useWorkflowContext must be used within a WorkflowProvider');
  }

  return context;
};

