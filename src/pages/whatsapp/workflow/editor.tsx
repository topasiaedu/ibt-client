import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ReactFlow, { Controls, MiniMap, ReactFlowProvider } from 'reactflow';
import 'reactflow/dist/style.css';
import { useFlowContext } from '../../../context/FlowContext';
import { useWorkflowContext } from '../../../context/WorkflowContext';
import NavbarSidebarLayout from '../../../layouts/navbar-sidebar';
import LoadingPage from '../../pages/loading';
import AddToContactListNode from './editor-components/add-to-contact-list-node';
import DelayNode from './editor-components/delay-node';
import FlowSidebar from './editor-components/flow-sidebar';
import KeywordNode from './editor-components/keyword-node';
import SendMessageNode from './editor-components/send-message-node';
import SendTemplateNode from './editor-components/send-template-node';
import WebhookNode from './editor-components/webhook-node';
import WorkflowNode from './editor-components/workflow-node';
import './editor.css';

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
  const { workflows, loading: workflowLoading } = useWorkflowContext();
  const workflowId = useParams().id || null;
  const {
    nodes,
    edges,
    reactFlowWrapper,
    setReactFlowInstance,
    addNode,
    onNodesChange,
    onEdgesChange,
    onDragOver,
    onDrop,
    onConnect,
    loadWorkflow,
    loading,
    setCurrentWorkflowId
  } = useFlowContext();


  useEffect(() => {
    //  If no workflow id is found, create a new workflow node, else populate the whole workflow
    if (!workflowId) {
      const newNode = {
        id: '1',
        type: 'workflow',
        position: { x: 250, y: 5 },
        data: {
          name: '',
          description: ''
        },
      }
      addNode(newNode);

    } else {
      const workflow = workflows.find((workflow) => workflow.id === workflowId);
      if (workflow) {
        const canvas_state = workflow.canvas_state as { nodes: any[]; edges: any[]; };
        if (!canvas_state) return;
        const nodes = canvas_state.nodes;
        const edges = canvas_state.edges;
        loadWorkflow(nodes, edges);


        setCurrentWorkflowId(workflowId);
      }
    }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addNode, setCurrentWorkflowId, workflowId, workflows]);

  if (loading || workflowLoading) {
    return <LoadingPage />;
  }

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
              <MiniMap
                className="dark:bg-gray-800 bg-gray-200"
                pannable
                zoomable
              />
              <Controls />
            </ReactFlow>
          </div>
          <FlowSidebar />
        </ReactFlowProvider>
      </div>
    </NavbarSidebarLayout>
  );
}

export default React.memo(FlowEditor);
