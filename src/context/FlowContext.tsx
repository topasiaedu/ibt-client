import React, { LegacyRef, ReactNode, createContext, useCallback, useContext, useRef, useState } from 'react';
import {
  Connection,
  Edge,
  Node,
  OnEdgesChange,
  OnNodesChange,
  ReactFlowInstance,
  addEdge,
  useEdgesState,
  useNodesState
} from 'reactflow';
import { useAlertContext } from './AlertContext';
import {
  ActionInsert,
  TriggerInsert,
  WorkflowUpdate,
  useWorkflowContext
} from './WorkflowContext';
import { useProjectContext } from './ProjectContext';
import { Json } from '../../database.types';

interface FlowContextProps {
  nodes: Node[];
  edges: Edge[];
  reactFlowInstance: ReactFlowInstance | null;
  reactFlowWrapper: LegacyRef<HTMLDivElement> | undefined;
  setReactFlowInstance: (instance: ReactFlowInstance | null) => void;
  addNode: (node: Node) => void;
  removeNode: (id: string) => void;
  removeEdge: (id: string) => void;
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onDragOver: (event: React.DragEvent) => void;
  onDrop: (event: React.DragEvent) => void;
  onConnect: (connection: Connection) => void;
  currentWorkflowId: string;
  saveWorkflow: () => void;
  loadWorkflow: (nodes: Node[], edges: Edge[]) => void;
  loading: boolean;
  setCurrentWorkflowId: (workflowId: string) => void;
  updateNodeData: (id: string, data: any) => void;
}

const FlowContext = createContext<FlowContextProps | undefined>(undefined);

export const useFlowContext = (): FlowContextProps => {
  const context = useContext(FlowContext);
  if (!context) {
    throw new Error('useFlowContext must be used within a FlowProvider');
  }
  return context;
};

interface FlowProviderProps {
  children: ReactNode;
}

const TriggerNodeTypes = ['webhook', 'keyword', 'contact-added-to-contact-list'];
const ActionNodeTypes = ['add-to-contact-list', 'send-message', 'send-template'];

export const FlowProvider: React.FC<FlowProviderProps> = ({ children }) => {
  const reactFlowWrapper = useRef<HTMLDivElement | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [triggers, setTriggers] = useState<Node[]>([]);
  const [actions, setActions] = useState<Node[]>([]);
  const [currentWorkflowId, setCurrentWorkflowId] = useState<string>('');
  const { showAlert } = useAlertContext();
  const { currentProject } = useProjectContext();
  const {
    workflows,
    createWorkflow,
    updateWorkflow,
    createTrigger,
    deleteTrigger,
    createAction,
    deleteAction,
    loading: workflowLoading
  } = useWorkflowContext();

  const addNode = useCallback((node: Node) => {
    setNodes((nds) => [...nds, node]);
    const isTrigger = TriggerNodeTypes.includes(node.type ?? '');
    const isAction = ActionNodeTypes.includes(node.type ?? '');

    if (isTrigger) {
      setTriggers((nds) => [...nds, node]);
    } else if (isAction) {
      setActions((nds) => [...nds, node]);
    }
  }, [setNodes]);


  const removeNode = useCallback((id: string) => {
    setNodes((nds) => nds.filter((node) => node.id !== id));
    setEdges((eds) => eds.filter((edge) => edge.source !== id || edge.target !== id));

    const triggerNode = triggers.find((node) => node.id === id);
    if (triggerNode) {
      setTriggers((nds) => nds.filter((node) => node.id !== id));
    }

    const actionNode = actions.find((node) => node.id === id);
    if (actionNode) {
      setActions((nds) => nds.filter((node) => node.id !== id));
    }
  }, [actions, setEdges, setNodes, triggers]);

  const removeEdge = useCallback((id: string) => {
    setEdges((eds) => eds.filter((edge) => edge.id !== id));
  }, [setEdges]);

  const onConnect = useCallback((connection: Connection) => {
    setEdges((eds) => addEdge(connection, eds));
  }, [setEdges]);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');

      if (!type || !reactFlowInstance) {
        return;
      }

      // Check if there is already a trigger node
      const triggerNode = nodes.find((node) => TriggerNodeTypes.includes(node.type ?? ''));
      if (type === 'keyword' && triggerNode) {
        showAlert("Only one trigger node is allowed", "error");
        return;
      }

      const position = reactFlowInstance.project({
        x: event.clientX - (reactFlowWrapper.current?.getBoundingClientRect().left || 0),
        y: event.clientY - (reactFlowWrapper.current?.getBoundingClientRect().top || 0),
      });

      let newNode: Node = {
        id: `${+new Date()}`, // Ensure unique id
        type,
        position,
        data: {
          onNodesDelete: removeNode,
          currentWorkflowId,
          existing: false
        },
      };

      if (type === 'webhook') {
        newNode = {
          ...newNode,
          data: { ...newNode.data, url: `https://ibts.whatsgenie.com/webhook/${currentWorkflowId}` }
        }
      }
      

      addNode(newNode);
    }, [addNode, currentWorkflowId, nodes, reactFlowInstance, removeNode, showAlert]);

  const saveWorkflow = async () => {
    if (!currentProject) { showAlert("Project not found", "error"); return; }

    // Check the edges to get all connected nodes and put it in an array of [workflow, trigger, action]
    const connectedNodes: string[] = [];
    edges.forEach((edge) => {
      const sourceNode = nodes.find((node) => node.id === edge.source);
      const targetNode = nodes.find((node) => node.id === edge.target);
      if (! connectedNodes.includes(sourceNode?.id ?? '')) { connectedNodes.push(sourceNode?.id ?? ''); }
      if (! connectedNodes.includes(targetNode?.id ?? '')) { connectedNodes.push(targetNode?.id ?? ''); }
    });

    // Save the workflow
    // Check if the workflow is new or existing by checking the id ( id = '1' means new )
    // If the workflow is new, create a new workflow
    // If the workflow is existing, update the workflow
    // If the workflow is existing, delete all the triggers and actions and recreate them
    // If the workflow is existing, update the triggers and actions
    const workflowNodes = nodes.filter((node) => connectedNodes.includes(node.id));
    const triggerNodes = workflowNodes.filter((node) => TriggerNodeTypes.includes(node.type ?? ''));
    const actionNodes = workflowNodes.filter((node) => ActionNodeTypes.includes(node.type ?? ''));
    const workflowNode = nodes.find((node) => node.type === 'workflow');
    if (!workflowNode) { showAlert("Workflow node not found", "error"); return; }
    const workflowData = {
      id: workflowNode.id,
      name: workflowNode.data.name,
      description: workflowNode.data.description,
      run: workflowNode.data.run,
      phone_numbers: workflowNode.data.phone_numbers,
      canvas_state: { nodes, edges } as unknown as Json | undefined,
      project_id: currentProject?.project_id
    }
    const triggerData = triggerNodes.map((node) => {
      return {
        id: node.id,
        type: node.type,
        details: node.data,
        workflow_id: currentWorkflowId,
        project_id: currentProject?.project_id
      } as TriggerInsert
    });
    const actionData = actionNodes.map((node, index) => {
      return {
        id: node.id,
        type: node.type,
        details: node.data,
        workflow_id: currentWorkflowId,
        project_id: currentProject?.project_id,
        execution_order: index + 1
      } as ActionInsert
    });

    // Check if the workflow is new or existing
    if (workflowData.id !== '1') {
      // Update the workflow
      const workflow: WorkflowUpdate = {
        id: workflowData.id,
        name: workflowData.name,
        description: workflowData.description,
        run: workflowData.run,
        canvas_state: workflowData.canvas_state 
      }
      await updateWorkflow(workflow, workflowData.phone_numbers);

      console.log("Workflow updated, data: ", workflowData, triggerData, actionData)
      // Delete all the triggers and actions
      const existingTriggers = workflows.find((workflow) => workflow.id === currentWorkflowId)?.trigger;
      const existingActions = workflows.find((workflow) => workflow.id === currentWorkflowId)?.actions;

      if (existingTriggers) { existingTriggers.forEach((trigger) => deleteTrigger(trigger.id)); }
      if (existingActions) { existingActions.forEach((action) => deleteAction(action.id)); }

      // Create the triggers and actions
      for (const trigger of triggerData) {  await createTrigger(trigger); }
      for (const action of actionData) { await createAction(action); }

    } else {
      // Create the workflow
      const workflow = await createWorkflow(workflowData, workflowData.phone_numbers);
      if (!workflow) { showAlert("Workflow not saved", "error"); return; }
      // Create the triggers
      for (const trigger of triggerData) { 
        // Replace the workflow id with the new workflow id
        trigger.workflow_id = workflow;
        await createTrigger(trigger);
      }
      // Create the actions
      for (const action of actionData) { 
        // Replace the workflow id with the new workflow id
        action.workflow_id = workflow;
        await createAction(action);
      }
    }
    showAlert("Workflow saved", "success");
  }

  const loadWorkflow = (nodes: Node[], edges: Edge[]) => {
    setNodes(nodes);
    setEdges(edges);
  }

  const updateNodeData = (id: string, data: any) => {
    setNodes(prevNodes =>
      prevNodes.map(node => (node.id === id ? { ...node, data } : node))
    );
  }

  return (
    <FlowContext.Provider value={{
      nodes,
      edges,
      reactFlowInstance,
      reactFlowWrapper,
      setReactFlowInstance,
      addNode,
      removeNode,
      removeEdge,
      onNodesChange,
      onEdgesChange,
      onDragOver,
      onDrop,
      onConnect,
      currentWorkflowId,
      saveWorkflow,
      loadWorkflow,
      loading,
      setCurrentWorkflowId,
      updateNodeData
    }}>
      {children}
    </FlowContext.Provider>
  );
};
