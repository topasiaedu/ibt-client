/* eslint-disable jsx-a11y/anchor-is-valid */
import {
  Button,
  Label,
  Modal,
  TextInput,
} from "flowbite-react";
import type { FC } from "react";
import React, { useState } from "react";
import {
  HiPlus,
} from "react-icons/hi";
import { useContactListContext, ContactList } from "../../../context/ContactListContext";

const AddContactListModal: FC = function () {
  const [isOpen, setOpen] = useState(false);
  const { addContactList } = useContactListContext();
  const [contactListData, setContactListData] = useState({
    name: "",
    description: "",
  });

  const handleAddContactList = async () => {
    await addContactList(contactListData as ContactList);
    setOpen(false);
    // Refresh the page to show the new contact
    window.location.reload();
  };

  return (
    <>
      <Button color="primary" onClick={() => setOpen(true)}>
        <div className="flex items-center gap-x-3">
          <HiPlus className="text-xl" />
          Add Contact List
        </div>
      </Button>
      <Modal onClose={() => setOpen(false)} show={isOpen} >
        <Modal.Header className="border-b border-gray-200 !p-6 dark:border-gray-700">
          <strong>Add new Contact List</strong>
        </Modal.Header>
        <Modal.Body>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <Label htmlFor="name">
                Name
              </Label>
              <TextInput
                id="name"
                name="name"
                placeholder="Enter name"
                value={contactListData.name}
                onChange={(e) => setContactListData({ ...contactListData, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="description">
                Description
              </Label>
              <TextInput
                id="description"
                name="description"
                placeholder="Enter description"
                value={contactListData.description}
                onChange={(e) => setContactListData({ ...contactListData, description: e.target.value })}
              />
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button color="primary" onClick={handleAddContactList}>
            Add Contact List
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default AddContactListModal;