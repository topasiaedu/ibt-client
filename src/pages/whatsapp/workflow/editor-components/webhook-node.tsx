import React from 'react';
import { Handle, NodeProps, Position } from 'reactflow';

export type WebhookData = {
  url?: string;
};

export default function WebhookNode(props: NodeProps<WebhookData>) {
  const url = props.data?.url ?? 'https://ibts.whatsgenie.com/webhook/id'

  return (
    <div className="dark:bg-gray-800 dark:text-white p-4 rounded-lg shadow-lg w-sm">
      <h1 className="text-lg font-semibold">Trigger - Webhook Node</h1>
      <p>URL: {url}</p>
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}