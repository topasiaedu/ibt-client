import debounce from 'lodash.debounce';
import React, { useCallback, useEffect, useState } from 'react';
import { Handle, NodeProps, Position } from 'reactflow';
import { Label, Button } from 'flowbite-react';
import { useFlowContext } from '../../../../context/FlowContext';

export type DelayData = {
  delay?: number;
};

export default function DelayNode(props: NodeProps<DelayData>) {
  const [delay, setDelay] = useState<number>(props.data?.delay ?? 0);
  const { updateNodeData, removeNode } = useFlowContext();

  const handleDelayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0; // Convert input to a number
    setDelay(value);
  };

  // Debounced function to update node data in context
  const debouncedUpdateNodeData = useCallback(
    debounce((id, data) => updateNodeData(id, data), 500),
    []
  );

  useEffect(() => {
    debouncedUpdateNodeData(props.id, { delay });
  }, [delay, debouncedUpdateNodeData, props.id]);

  return (
    <div className="dark:bg-gray-800 dark:text-white p-4 rounded-lg shadow-lg max-w-sm flex flex-col gap-2">
      <h1 className="text-lg font-semibold">Delay Node</h1>
      <Label htmlFor="delay">Set Delay (in seconds)</Label>
      <input
        id="delay"
        type="number"
        value={delay}
        onChange={handleDelayChange}
        className="block w-full p-2.5 text-sm bg-gray-50 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
      />
      <Button
        className="w-full mt-2"
        color="red"
        onClick={() => removeNode(props.id)}
      >
        Delete
      </Button>
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
    </div>
  );
}
