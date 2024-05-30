import React from 'react';
import { Handle, NodeProps, Position } from 'reactflow';
import { Select } from 'flowbite-react';
import { useContactListContext } from '../../../../context/ContactListContext';

export type ContactAddedToContactListData = {
  contactListId?: string;
};

export default function ContactAddedToContactListNode(props: NodeProps<ContactAddedToContactListData>) {
  const { contactLists } = useContactListContext();
 const [contactListId, setContactListId] = React.useState<string | undefined>(props.data.contactListId);

  return (
    <div className="dark:bg-gray-800 dark:text-white p-4 rounded-lg shadow-lg">
      <p>Contact Added to Contact List</p>
      <Select
        value={contactListId}
        onChange={(e) => {
          setContactListId(e.target.value);
        }}
      >
        <option value="">Select a contact list</option>
        {contactLists.map((contactList) => (
          <option key={contactList.contact_list_id} value={contactList.contact_list_id}>
            {contactList.name}
          </option>
        ))}
      </Select>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}