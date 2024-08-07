import { Button, Label, TextInput } from 'flowbite-react';
import debounce from 'lodash.debounce';
import React, { useCallback, useEffect } from 'react';
import { Handle, NodeProps, Position } from 'reactflow';
import { useAlertContext } from '../../../../context/AlertContext';
import { useFlowContext } from '../../../../context/FlowContext';

export type WebhookData = {
  url?: string;
  onNodesDelete: (id: string) => void;
  onTriggerSave: (id: string) => boolean;
  workflowId: string;
  existing: boolean;
};

export default function WebhookNode(props: NodeProps<WebhookData>) {
  const url = props.data?.url ?? 'https://ibts3.whatsgenie.com/webhook/id'
  const { showAlert } = useAlertContext();
  const { removeNode, updateNodeData } = useFlowContext();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedUpdateNodeData = useCallback(
    debounce((id, data) => updateNodeData(id, data), 500),
    []
  );

  useEffect(() => {
    debouncedUpdateNodeData(props.id, { url });
  }, [url, debouncedUpdateNodeData, props.id]);
  return (
    <div className="dark:bg-gray-800 dark:text-white p-4 rounded-lg shadow-lg max-w-sm flex flex-col gap-2">
      <h1 className="text-lg font-semibold">Trigger - Webhook Node</h1>
      <Label>URL</Label>
      <TextInput
        value={url}
        disabled
      />
      {/* Copy to clipboard button */}
      <Button
        color={'blue'}
        onClick={() => {
          navigator.clipboard.writeText(url);
          showAlert('URL copied to clipboard', 'success');
        }}
      >Copy URL</Button>
      <Button className="w-full" color={'red'} onClick={() => { removeNode(props.id) }}>Delete</Button>
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
    </div>
  );
}