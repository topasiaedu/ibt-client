import { Handle, NodeProps, Position } from 'reactflow';
import { useState } from 'react';
import React from 'react';
import { Button } from 'flowbite-react';

export type CounterData = {
  initialCount?: number;
};
 
export default function CounterNode(props: NodeProps<CounterData>) {
  const [count, setCount] = useState(props.data?.initialCount ?? 0);
 
  return (
    <div className="dark:bg-gray-800 dark:text-white p-4 rounded-lg shadow-lg">
      <Handle type="target" position={Position.Top} />
      <p>Count: {count}</p>
      <Button className="nodrag" onClick={() => setCount(count + 1)}>
        Increment
      </Button>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}