import React, { useCallback, useMemo, useRef, useState } from 'react';
import ReactFlow, {
  Controls,
  Edge,
  MiniMap,
  ReactFlowInstance,
  ReactFlowProvider,
  addEdge,
  useEdgesState,
  useNodesState,
} from 'reactflow';
import 'reactflow/dist/style.css';
import NavbarSidebarLayout from '../../../layouts/navbar-sidebar';
import AddToContactListNode from './editor-components/add-to-contact-list-node';
import FlowSidebar from './editor-components/flow-sidebar';
import './editor.css';
import { Node } from 'reactflow';
import DelayNode from './editor-components/delay-node';
import KeywordNode from './editor-components/keyword-node';
import SendMessageNode from './editor-components/send-message-node';
import SendTemplateNode from './editor-components/send-template-node';
import WebhookNode from './editor-components/webhook-node';
import WorkflowNode from './editor-components/workflow-node';
import { useParams } from 'react-router-dom';
import { useWorkflowContext } from '../../../context/WorkflowContext';

const nodeTypes = {
  'add-to-contact-list': React.memo(AddToContactListNode),
  keyword: React.memo(KeywordNode),
  webhook: React.memo(WebhookNode),
  delay: React.memo(DelayNode),
  'send-message': React.memo(SendMessageNode),
  'send-template': React.memo(SendTemplateNode),
  'workflow': React.memo(WorkflowNode),
};
const FlowEditor: React.FC = () => {
  const reactFlowWrapper = useRef<HTMLDivElement | null>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  var initialNodes: Node[] = [];
  var initialEdges: Edge[] = [];
  const { workflows } = useWorkflowContext();
  const workflowId = useParams().id || null;

  //  If no workflow id is found, create a new workflow node, else populate the whole workflow
  if (!workflowId) {
    initialNodes = [
      {
        id: '1',
        type: 'workflow',
        position: { x: 250, y: 5 },
        data: { name: '', description: ''},
      },
    ];

  } else {
    // Populate the workflow
    const workflow = workflows.find((workflow) => workflow.id === workflowId);

    if (workflow) {
      initialNodes = [
        {
          id: '1',
          type: 'workflow',
          position: { x: 250, y: 5 },
          data: { name: workflow.name, description: workflow.description, existingPhoneNumbers: workflow.phone_numbers }, 
        },
      ];

      // const nodes = workflow.nodes;
      // const edges = workflow.edges;

      // for (const node of nodes) {
      //   initialNodes.push({
      //     id: node.id,
      //     type: node.type,
      //     position: node.position,
      //     data: node.data,
      //   });
      // }

      // for (const edge of edges) {
      //   initialEdges.push({
      //     id: edge.id,
      //     source: edge.source,
      //     target: edge.target,
      //   });
      // }
    }

  }

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: any) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

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

      const position = reactFlowInstance.project({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode: Node = {
        id: `${+new Date()}`, // Ensure unique id
        type,
        position,
        data: { label: `${type} node` },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes]
  );

  return (
    <NavbarSidebarLayout isFooter={false}>
      <div className="dndflow">
        <ReactFlowProvider>
          <div className="reactflow-wrapper" ref={reactFlowWrapper}>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onInit={setReactFlowInstance}
              onDrop={onDrop}
              onDragOver={onDragOver}
              fitView
              nodeTypes={nodeTypes}
            >
              <Controls />
              <MiniMap
                className="dark:bg-gray-800 bg-gray-200"
                pannable
                zoomable
              />
            </ReactFlow>
          </div>
          <FlowSidebar />
        </ReactFlowProvider>
      </div>
    </NavbarSidebarLayout>
  );
}

export default React.memo(FlowEditor);
