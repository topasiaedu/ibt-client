import React, {
  LegacyRef,
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";
import {
  Connection,
  Edge,
  Node,
  OnEdgesChange,
  OnNodesChange,
  ReactFlowInstance,
  addEdge,
  useEdgesState,
  useNodesState,
} from "reactflow";
import { useAlertContext } from "./AlertContext";
import {
  ActionInsert,
  TriggerInsert,
  WorkflowInsert,
  WorkflowUpdate,
  useWorkflowContext,
} from "./WorkflowContext";
import { useProjectContext } from "./ProjectContext";
import { Json } from "../../database.types";

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
    throw new Error("useFlowContext must be used within a FlowProvider");
  }
  return context;
};

interface FlowProviderProps {
  children: ReactNode;
}

const TriggerNodeTypes = [
  "webhook",
  "keyword",
  "contact-added-to-contact-list",
];
const ActionNodeTypes = [
  "add-to-contact-list",
  "send-message",
  "send-template",
  "zoom"
];

export const FlowProvider: React.FC<FlowProviderProps> = ({ children }) => {
  const reactFlowWrapper = useRef<HTMLDivElement | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [reactFlowInstance, setReactFlowInstance] =
    useState<ReactFlowInstance | null>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [triggers, setTriggers] = useState<Node[]>([]);
  const [actions, setActions] = useState<Node[]>([]);
  const [currentWorkflowId, setCurrentWorkflowId] = useState<string>("");
  const { showAlert } = useAlertContext();
  const { currentProject } = useProjectContext();
  const {
    workflows,
    createWorkflow,
    updateWorkflow,
    createTrigger,
    updateTrigger,
    createAction,
    updateAction,
  } = useWorkflowContext();

  const addNode = useCallback(
    (node: Node) => {
      setNodes((nds) => [...nds, node]);
      const isTrigger = TriggerNodeTypes.includes(node.type ?? "");
      const isAction = ActionNodeTypes.includes(node.type ?? "");

      if (isTrigger) {
        setTriggers((nds) => [...nds, node]);
      } else if (isAction) {
        setActions((nds) => [...nds, node]);
      }
    },
    [setNodes]
  );

  const removeNode = useCallback(
    (id: string) => {
      setNodes((nds) => nds.filter((node) => node.id !== id));
      setEdges((eds) =>
        eds.filter((edge) => edge.source !== id || edge.target !== id)
      );

      const triggerNode = triggers.find((node) => node.id === id);
      if (triggerNode) {
        setTriggers((nds) => nds.filter((node) => node.id !== id));
      }

      const actionNode = actions.find((node) => node.id === id);
      if (actionNode) {
        setActions((nds) => nds.filter((node) => node.id !== id));
      }
    },
    [actions, setEdges, setNodes, triggers]
  );

  const removeEdge = useCallback(
    (id: string) => {
      setEdges((eds) => eds.filter((edge) => edge.id !== id));
    },
    [setEdges]
  );

  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) => addEdge(connection, eds));
    },
    [setEdges]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData("application/reactflow");

      if (!type || !reactFlowInstance) {
        return;
      }

      // Check if there is already a trigger node
      const triggerNode = nodes.find((node) =>
        TriggerNodeTypes.includes(node.type ?? "")
      );
      if (type === "keyword" && triggerNode) {
        showAlert("Only one trigger node is allowed", "error");
        return;
      }

      const position = reactFlowInstance.project({
        x:
          event.clientX -
          (reactFlowWrapper.current?.getBoundingClientRect().left || 0),
        y:
          event.clientY -
          (reactFlowWrapper.current?.getBoundingClientRect().top || 0),
      });

      let newNode: Node = {
        id: `${+new Date()}`, // Ensure unique id
        type,
        position,
        data: {
          onNodesDelete: removeNode,
          currentWorkflowId,
          existing: false,
        },
      };

      if (type === "webhook") {
        newNode = {
          ...newNode,
          data: {
            ...newNode.data,
            url: `https://ibts.whatsgenie.com/ibt/webhook/${currentWorkflowId}`,
          },
        };
      }

      addNode(newNode);
    },
    [
      addNode,
      currentWorkflowId,
      nodes,
      reactFlowInstance,
      removeNode,
      showAlert,
    ]
  );

  const saveWorkflow = async () => {
    if (!currentProject) {
      showAlert("Project not found", "error");
      return;
    }

    // Collect unique node IDs from edges
    const connectedNodeIds = new Set(
      edges.flatMap((edge) => [edge.source, edge.target])
    );
    const connectedNodes = nodes.filter((node) =>
      connectedNodeIds.has(node.id)
    );
    const workflowNode = connectedNodes.find(
      (node) => node.type === "workflow"
    );

    if (!workflowNode) {
      showAlert("Workflow node not found", "error");
      return;
    }

    // Define workflow data
    const workflowData: WorkflowInsert = {
      id: currentWorkflowId || "1",
      name: workflowNode.data.name,
      description: workflowNode.data.description,
      run: workflowNode.data.run,
      phone_numbers: workflowNode.data.phone_numbers,
      canvas_state: { nodes, edges } as unknown as Json | undefined,
      project_id: currentProject.project_id,
    };

    // Prepare trigger and action data
    const prepareTriggerData = (
      nodes: Node[],
      workflowId: string
    ): TriggerInsert[] => {
      return nodes.map((node) => ({
        id: node.id,
        type: node.type || "",
        details: node.data,
        workflow_id: workflowId,
        project_id: currentProject.project_id,
        active: true,
      }));
    };

    const prepareActionData = (
      nodes: Node[],
      workflowId: string
    ): ActionInsert[] => {
      return nodes.map((node, index) => ({
        id: node.id,
        type: node.type || "",
        details: node.data,
        workflow_id: workflowId,
        project_id: currentProject.project_id,
        execution_order: index + 1,
        active: true,
      }));
    };

    const triggerNodes = connectedNodes.filter((node) =>
      TriggerNodeTypes.includes(node.type ?? "")
    );
    const actionNodes = connectedNodes.filter((node) =>
      ActionNodeTypes.includes(node.type ?? "")
    );
    const triggerData = prepareTriggerData(triggerNodes, currentWorkflowId);
    const actionData = prepareActionData(actionNodes, currentWorkflowId);
    

    // Function to update or create data
    const updateOrCreateData = async (
      newData: (TriggerInsert | ActionInsert)[],
      existingData: (TriggerInsert | ActionInsert)[] | undefined,
      updateFn: (data: TriggerInsert | ActionInsert) => Promise<void>,
      createFn: (data: TriggerInsert | ActionInsert) => Promise<void>
    ) => {
      const existingIds = existingData?.map((item) => item.id) || [];
      for (const data of newData) {
        if (existingIds.includes(data.id)) {
          await updateFn(data);
        } else {
          await createFn(data);
        }
      }

      if (existingData) {
        for (const existing of existingData) {
          if (!newData.some((newItem) => newItem.id === existing.id)) {
            await updateFn({ ...existing, active: false });
          }
        }
      }
    };

    if (currentWorkflowId && workflowData.id !== "1") {
      // Update existing workflow
      const workflowUpdate: WorkflowUpdate = {
        id: workflowData.id,
        name: workflowData.name,
        description: workflowData.description,
        run: workflowData.run,
        canvas_state: workflowData.canvas_state,
      };
      await updateWorkflow(workflowUpdate, workflowData.phone_numbers);

      const existingWorkflow = workflows.find(
        (wf) => wf.id === currentWorkflowId
      );
      await updateOrCreateData(
        triggerData,
        existingWorkflow?.trigger,
        updateTrigger,
        createTrigger
      );
      await updateOrCreateData(
        actionData,
        existingWorkflow?.actions,
        updateAction,
        createAction
      );
    } else {
      // Create new workflow
      const newWorkflowId = await createWorkflow(
        {
          name: workflowData.name,
          description: workflowData.description,
          run: workflowData.run,
          project_id: currentProject.project_id,
          canvas_state: workflowData.canvas_state,
          phone_numbers: workflowData.phone_numbers,
        },
        workflowData.phone_numbers
      );

      if (!newWorkflowId) {
        showAlert("Workflow not saved", "error");
        return;
      }

      // Update Trigger if type is webhook
      const webhookTrigger = triggerData.find((trigger) => trigger.type === "webhook");
      if (webhookTrigger) {
        await updateTrigger({ ...webhookTrigger, details: {           
          url: `https://ibts3.whatsgenie.com/ibt/webhook/${newWorkflowId}` 
        } });
        
        // Update the one in the state too
        const webhookNode = nodes.find((node) => node.id === webhookTrigger.id);
        if (webhookNode) {
          updateNodeData(webhookNode.id, { ...webhookNode.data, url: `https://ibts3.whatsgenie.com/ibt/webhook/${newWorkflowId}` });
        }
      }

      await Promise.all([
        ...triggerData.map((trigger) =>
          createTrigger({ ...trigger, workflow_id: newWorkflowId })
        ),
        ...actionData.map((action) =>
          createAction({ ...action, workflow_id: newWorkflowId })
        ),
      ]);

      setCurrentWorkflowId(newWorkflowId);
    }

    showAlert("Workflow saved", "success");
  };

  const loadWorkflow = (nodes: Node[], edges: Edge[]) => {
    setLoading(true);
    setNodes(nodes);
    setEdges(edges);
    setLoading(false);
  };

  const updateNodeData = (id: string, data: any) => {
    setNodes((prevNodes) =>
      prevNodes.map((node) => (node.id === id ? { ...node, data } : node))
    );
  };

  return (
    <FlowContext.Provider
      value={{
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
        updateNodeData,
      }}>
      {children}
    </FlowContext.Provider>
  );
};
