/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState } from 'react';
import type { FC } from 'react';
import { Button, Label, Modal, TextInput } from 'flowbite-react';
import { HiOutlinePencilAlt } from 'react-icons/hi';
import { ContactList } from '../../../types/contactListTypes';
import { useContactLists } from '../../../hooks/whatsapp/useContactList';

// Defining props type
interface EditContactListModalProps {
  contact_list: ContactList;
}

const EditContactListModal: FC<EditContactListModalProps> = ({ contact_list }) => {
  const [isOpen, setOpen] = useState(false);
  const { updateContactList } = useContactLists();
  const [contactListData, setContactListData] = useState({
    contact_list_id: contact_list.contact_list_id,
    name: contact_list.name,
    description: contact_list.description,
    created_at: contact_list.created_at,
  });

  const handleUpdateContactList = async (contact_list_id: number, formData: ContactList) => {
    await updateContactList(contact_list_id, formData);
    setOpen(false);
    // Refresh the page to show the new contact
    window.location.reload();
  }

  return (
    <>
      <Button color="primary" onClick={() => setOpen(true)}>
        <div className="flex items-center gap-x-2">
          <HiOutlinePencilAlt className="text-xs" />
          Edit Contact List
        </div>
      </Button>
      <Modal onClose={() => setOpen(false)} show={isOpen}>
        <Modal.Header className="border-b border-gray-200 !p-6 dark:border-gray-700">
          <strong>Edit Contact List</strong>
        </Modal.Header>
        <Modal.Body>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <Label htmlFor="name">Name</Label>
              <div className="mt-1">
                <TextInput
                  id="name"
                  name="name"
                  placeholder="Contact List Name"
                  value={contactListData.name}
                  onChange={(e) => setContactListData({ ...contactListData, name: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <div className="mt-1">
                <TextInput
                  id="description"
                  name="description"
                  placeholder="Contact List Description"
                  value={contactListData.description || ''}
                  onChange={(e) => setContactListData({ ...contactListData, description: e.target.value })}
                />
              </div>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button color="primary" onClick={() => handleUpdateContactList(contactListData.contact_list_id, {
            ...contactListData,
            name: contactListData.name,
            description: contactListData.description,
          })}>
            Save all
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default EditContactListModal;