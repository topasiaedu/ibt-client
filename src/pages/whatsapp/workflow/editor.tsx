import React, { useCallback, useRef, useState } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  BackgroundVariant,
  ReactFlowProvider,
  ReactFlowInstance,
  Node,
} from 'reactflow';

import 'reactflow/dist/style.css';
import NavbarSidebarLayout from '../../../layouts/navbar-sidebar';
import CustomNode from './editor-components/custom-node';
import FlowSidebar from './editor-components/flow-sidebar';

import './editor.css';
import CounterNode from './editor-components/custom-node';

const initialNodes = [
  {
    id: '1',
    type: 'input',
    data: { label: 'input node' },
    position: { x: 250, y: 5 },
  },
];

let id = 0;
const getId = () => `dndnode_${id++}`;

const FlowEditor = () => {
  const reactFlowWrapper = useRef(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);

  const onConnect = useCallback(
    (params: any) => setEdges((eds) => addEdge(params, eds)),
    [],
  );

  const onDragOver = useCallback((event: any) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: any) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');

      // check if the dropped element is valid
      if (typeof type === 'undefined' || !type) {
        return;
      }

      if (!reactFlowInstance) {
        return;
      }

      // reactFlowInstance.project was renamed to reactFlowInstance.screenToFlowPosition
      // and you don't need to subtract the reactFlowBounds.left/top anymore
      // details: https://reactflow.dev/whats-new/2023-11-10
      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      const newNode = {
        id: getId(),
        type,
        position,
        data: { label: `${type} node` },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance],
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
              nodeTypes={
                {
                  counter: CounterNode
                }
              }
            >
              {/* Style both controls and mini map based on light/dark theme from tailwind */}
              <Controls />
              
              <MiniMap className="dark:bg-gray-800 bg-gray-200" nodeColor={(node) => {
                switch (node.type) {
                  case 'input':
                    return 'blue';
                  case 'default':
                    return 'red';
                  case 'output':
                    return 'green';
                  default:
                    return '#eee';
                }
              }} pannable zoomable />
            </ReactFlow>
          </div>
          <FlowSidebar />
        </ReactFlowProvider>
      </div>
    </NavbarSidebarLayout >
  );
}


export default FlowEditor;