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

    // Check the edges to get all connected nodes and put it in an array of [workflow, trigger, action]
    const connectedNodes: string[] = [];
    edges.forEach((edge) => {
      const sourceNode = nodes.find((node) => node.id === edge.source);
      const targetNode = nodes.find((node) => node.id === edge.target);
      if (!connectedNodes.includes(sourceNode?.id ?? "")) {
        connectedNodes.push(sourceNode?.id ?? "");
      }
      if (!connectedNodes.includes(targetNode?.id ?? "")) {
        connectedNodes.push(targetNode?.id ?? "");
      }
    });

    // Filter workflow, trigger, and action nodes
    const workflowNodes = nodes.filter((node) =>
      connectedNodes.includes(node.id)
    );
    const triggerNodes = workflowNodes.filter((node) =>
      TriggerNodeTypes.includes(node.type ?? "")
    );
    const actionNodes = workflowNodes.filter((node) =>
      ActionNodeTypes.includes(node.type ?? "")
    );
    const workflowNode = nodes.find((node) => node.type === "workflow");
    if (!workflowNode) {
      showAlert("Workflow node not found", "error");
      return;
    }

    const workflowData = {
      id: currentWorkflowId || "1",
      name: workflowNode.data.name,
      description: workflowNode.data.description,
      run: workflowNode.data.run,
      phone_numbers: workflowNode.data.phone_numbers,
      canvas_state: { nodes, edges } as unknown as Json | undefined,
      project_id: currentProject?.project_id,
    };

    // Prepare trigger data
    const prepareTriggerData = (workflowId: string) => {
      return triggerNodes.map((node) => {
        if (node.type === "webhook" && node.data) {
          (
            node.data as { url: string }
          ).url = `https://ibts.whatsgenie.com/ibt/webhook/${workflowId}`;
        }
        return {
          id: node.id,
          type: node.type,
          details: node.data,
          workflow_id: workflowId,
          project_id: currentProject?.project_id,
          active: true,
        } as TriggerInsert;
      });
    };

    const triggerData = prepareTriggerData(currentWorkflowId);

    const actionData = actionNodes.map((node, index) => {
      return {
        id: node.id,
        type: node.type,
        details: node.data,
        workflow_id: currentWorkflowId,
        project_id: currentProject?.project_id,
        execution_order: index + 1,
        active: true,
      } as ActionInsert;
    });

    if (workflowData.id !== "1" || currentWorkflowId) {
      // Update the workflow
      const workflow: WorkflowUpdate = {
        id: workflowData.id,
        name: workflowData.name,
        description: workflowData.description,
        run: workflowData.run,
        canvas_state: workflowData.canvas_state,
      };
      await updateWorkflow(workflow, workflowData.phone_numbers);

      // Update or deactivate existing triggers and actions
      const existingTriggers = workflows.find(
        (workflow) => workflow.id === currentWorkflowId
      )?.trigger;
      const existingActions = workflows.find(
        (workflow) => workflow.id === currentWorkflowId
      )?.actions;

      if (existingTriggers) {
        triggerData.forEach((trigger) => {
          if (
            existingTriggers.map((trigger) => trigger.id).includes(trigger.id)
          ) {
            updateTrigger(trigger);
          }
        });

        existingTriggers.forEach((trigger) => {
          if (!triggerData.map((trigger) => trigger.id).includes(trigger.id)) {
            updateTrigger({ ...trigger, active: false });
          }
        });
      }

      // Create new triggers
      triggerData.forEach((trigger) => {
        if (
          !existingTriggers?.map((trigger) => trigger.id).includes(trigger.id)
        ) {
          createTrigger(trigger);
        }
      });

      // Update or deactivate existing actions
      if (existingActions) {
        actionData.forEach((action) => {
          if (existingActions.map((action) => action.id).includes(action.id)) {
            updateAction(action);
          }
        });

        existingActions.forEach((action) => {
          if (!actionData.map((action) => action.id).includes(action.id)) {
            updateAction({ ...action, active: false });
          }
        });
      }

      // Create new actions
      actionData.forEach((action) => {
        if (!existingActions?.map((action) => action.id).includes(action.id)) {
          createAction(action);
        }
      });
    } else {
      // Create the workflow
      const newWorkflowId = await createWorkflow(
        {
          name: workflowData.name,
          description: workflowData.description,
          run: workflowData.run,
          project_id: currentProject?.project_id,
          canvas_state: workflowData.canvas_state,
        },
        workflowData.phone_numbers
      );
      if (!newWorkflowId) {
        showAlert("Workflow not saved", "error");
        return;
      }

      // Prepare trigger data with the new workflow ID
      const newTriggerData = prepareTriggerData(newWorkflowId);

      // Create the triggers
      for (const trigger of newTriggerData) {
        await createTrigger(trigger);
      }

      // Create the actions
      for (const action of actionData) {
        action.workflow_id = newWorkflowId;
        await createAction(action);
      }

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
