import { Button, Datepicker, Label, Select, TextInput, Textarea } from 'flowbite-react';
import debounce from 'lodash.debounce';
import React, { useCallback, useEffect } from 'react';
import { Handle, NodeProps, Position } from 'reactflow';
import { useFlowContext } from '../../../../context/FlowContext';

export type SendMessageData = {
  message?: string;
  postTime?: string;
  timePostType?: string;
  postDate?: Date;
};

export default function SendMessageNode(props: NodeProps<SendMessageData>) {
  const [message, setMessage] = React.useState(props.data?.message ?? '');
  const [postTime, setPostTime] = React.useState(props.data?.postTime ?? '09:00');
  const [timePostType, setTimePostType] = React.useState(props.data?.timePostType ?? 'immediately');
  const [postDate, setPostDate] = React.useState(props.data?.postDate ?? new Date());
  const { removeNode, updateNodeData } = useFlowContext();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedUpdateNodeData = useCallback(
    debounce((id, data) => updateNodeData(id, data), 500),
    []
  );

  useEffect(() => {
    debouncedUpdateNodeData(props.id, { message, postTime, timePostType, postDate });
  }, [message, postTime, timePostType, postDate, debouncedUpdateNodeData, props.id]);

  return (
    <div className="dark:bg-gray-800 dark:text-white p-4 rounded-lg shadow-lg max-w-sm flex flex-col gap-2">
      <h1 className="text-lg font-semibold">Send Message Node</h1>
      <div>
        <Label className='mt-4'>Message</Label>
        <Textarea
          value={message} onChange={(e) => setMessage(e.target.value)} />
      </div>
      <div>
        <Label className='mt-4'>Time to send</Label>
        <Select
          className='mt-2'
          value={timePostType}
          onChange={(e) => setTimePostType(e.target.value)}
        >
          <option value="immediately">Immediately</option> {/* Default value */}
          {/* Specific Date Time */}
          <option value="specific_date_time">Specific Date Time</option>
          {/* X minutes after the previous node */}
          <option value="minutes_after">X minutes after the previous node</option>
          {/* X hours after the previous node */}
        </Select>
      </div>

      {timePostType === 'specific_date_time' && (
        <>
          <div className="mb-4">
            <Label htmlFor="postTime" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Select date:</Label>
            <Datepicker
              id="postTime"
              name="postTime"
              value={postDate.toISOString().split('T')[0]}
              onSelectedDateChanged={(e) => { setPostDate(e); }}
            />
          </div>
          <div className="mb-4">
            <label htmlFor="time" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Select time:</label>
            <div className="relative">
              <div className="absolute inset-y-0 end-0 top-0 flex items-center pe-3.5 pointer-events-none">
                <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm11-4a1 1 0 1 0-2 0v4a1 1 0 0 0 .293.707l3 3a1 1 0 0 0 1.414-1.414L13 11.586V8Z" clipRule="evenodd" />
                </svg>
              </div>
              <input type="time" id="time" className="bg-gray-50 border leading-none border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" min="09:00" max="18:00" value={postTime} required
                onChange={(e) => setPostTime(e.target.value)} />
            </div>
          </div>
        </>
      )}

      {timePostType === 'minutes_after' && (
        <div className="mb-4">
          <Label htmlFor="minutes" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Minutes after the previous node:</Label>
          <TextInput
            id="minutes"
            name="minutes"
            type="number"
            value={timePostType}
            onChange={(e) => console.log(e.target.value)}
          />
        </div>
      )}
      <Button className="w-full" color={'red'} onClick={() => { removeNode(props.id) }}>Delete</Button>
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
    </div>
  );
}