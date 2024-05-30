import React from 'react';
import { Handle, NodeProps, Position } from 'reactflow';
import { useContactListContext } from '../../../../context/ContactListContext';
import { Select, Label } from 'flowbite-react';

export type AddToContactListData = {
  listId?: string;
  contactId?: string;
};

export default function AddToContactListNode(props: NodeProps<AddToContactListData>) {
  const [listId, setListId] = React.useState(props.data?.listId ?? '');
  const { contactLists } = useContactListContext();


  return (
    <div className="dark:bg-gray-800 dark:text-white p-4 rounded-lg shadow-lg">
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
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}