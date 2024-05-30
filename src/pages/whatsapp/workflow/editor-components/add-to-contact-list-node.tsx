import debounce from 'lodash.debounce';
import React, { useCallback, useEffect } from 'react'; import { Handle, NodeProps, Position } from 'reactflow';
import { useContactListContext } from '../../../../context/ContactListContext';
import { Select, Label, Button } from 'flowbite-react';
import { useFlowContext } from '../../../../context/FlowContext';

export type AddToContactListData = {
  listId?: string;
  contactId?: string;
};

export default function AddToContactListNode(props: NodeProps<AddToContactListData>) {
  const [listId, setListId] = React.useState(props.data?.listId ?? '');
  const { contactLists } = useContactListContext();
  const { removeNode, updateNodeData } = useFlowContext();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedUpdateNodeData = useCallback(
    debounce((id, data) => updateNodeData(id, data), 500),
    []
  );

  useEffect(() => {
    debouncedUpdateNodeData(props.id, { listId });
  }, [listId, debouncedUpdateNodeData, props.id]);
  
  return (
    <div className="dark:bg-gray-800 dark:text-white p-4 rounded-lg shadow-lg max-w-sm flex flex-col gap-2">
      <h1 className="text-lg font-semibold">Add to Contact List Node</h1>
      <Label className='mt-4'>Contact List</Label>
      <Select
        className='mt-2'
        value={listId}
        onChange={(e) => setListId(e.target.value)}
      >
        {contactLists.map((list, index) => (
          <option key={index} value={list.contact_list_id}>{list.name}</option>
        ))}
      </Select>
      <Button className="w-full" color={'red'} onClick={() => { removeNode(props.id) }}>Delete</Button>
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
    </div>
  );
}