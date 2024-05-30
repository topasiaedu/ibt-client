import React from 'react';
import { Handle, NodeProps, Position } from 'reactflow';

export type DelayData = {
  delay?: number;
};

export default function DelayNode(props: NodeProps<DelayData>) {
  const delay = props.data?.delay ?? 0;

  return (
    <div className="dark:bg-gray-800 dark:text-white p-4 rounded-lg shadow-lg">
      <p>Delay</p>
      <p>Delay: {delay}</p>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}
