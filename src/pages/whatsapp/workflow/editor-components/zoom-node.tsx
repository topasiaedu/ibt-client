import { Button, Label, TextInput } from "flowbite-react";
import debounce from "lodash.debounce";
import React, { useCallback, useEffect } from "react";
import { Handle, NodeProps, Position } from "reactflow";
import { useFlowContext } from "../../../../context/FlowContext";

export type ZoomData = {
  meetingId?: string;
};

export default function ZoomNode(props: NodeProps<ZoomData>) {
  const { removeNode, updateNodeData } = useFlowContext();
  const [meetingId, setMeetingId] = React.useState(props.data?.meetingId ?? "");

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedUpdateNodeData = useCallback(
    debounce((id, data) => updateNodeData(id, data), 500),
    []
  );

  useEffect(() => {
    debouncedUpdateNodeData(props.id, { meetingId });
  }, [meetingId, debouncedUpdateNodeData, props.id]);

  return (
    <div className="dark:bg-gray-800 dark:text-white p-4 rounded-lg shadow-lg max-w-sm flex flex-col gap-2">
      <h1 className="text-lg font-semibold">Zoom Node</h1>
      {/* Helper Text saying that remember not to include space */}
      <p className="text-sm text-gray-500">
        Remember to include the meeting ID without any spaces.
      </p>
      <Label>Meeting ID</Label>
      <TextInput
        value={meetingId}
        id="meetingId"
        name="meetingId"
        onChange={(e) => setMeetingId(e.target.value)}
      />
      <Button
        className="w-full"
        color={"red"}
        onClick={() => {
          removeNode(props.id);
        }}>
        Delete
      </Button>
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
    </div>
  );
}
