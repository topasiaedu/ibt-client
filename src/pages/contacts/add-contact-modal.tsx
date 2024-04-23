/* eslint-disable jsx-a11y/anchor-is-valid */
import {
  Button,
  Label,
  Modal,
  TextInput,
} from "flowbite-react";
import React, { useState } from "react";
import {
  HiPlus,
} from "react-icons/hi";
import { Contact, useContactContext } from "../../context/ContactContext";
import { useProjectContext } from "../../context/ProjectContext";
import { useAlertContext } from "../../context/AlertContext";

const AddContactModal: React.FC = function () {
  const [isOpen, setOpen] = useState(false);
  const { addContact } = useContactContext();
  const { currentProject } = useProjectContext();
  const { showAlert } = useAlertContext();
  const [contactData, setContactData] = useState({
    name: "",
    email: "",
    wa_id: "",
    project_id: currentProject?.project_id
  });

  const handleAddContact = async () => {
    await addContact(contactData as Contact).then(() => {
      setOpen(false);
      showAlert("Contact added successfully", "success");
    }).catch((error) => {
      showAlert(error.message, "error");
    });
  };

  return (
    <>
      <Button color="primary" onClick={() => setOpen(true)}>
        <div className="flex items-center gap-x-3">
          <HiPlus className="text-xl" />
          Add Contact
        </div>
      </Button>
      <Modal onClose={() => setOpen(false)} show={isOpen}>
        <Modal.Header className="border-b border-gray-200 !p-6 dark:border-gray-700">
          <strong>Add new user</strong>
        </Modal.Header>
        <Modal.Body>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <Label htmlFor="firstName">Full name</Label>
              <div className="mt-1">
                <TextInput
                  id="firstName"
                  name="firstName"
                  placeholder="Bonnie"
                  value={contactData.name}
                  onChange={(e) => setContactData({ ...contactData, name: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <div className="mt-1">
                <TextInput
                  id="email"
                  name="email"
                  placeholder="example@company.com"
                  type="email"
                  value={contactData.email}
                  onChange={(e) => setContactData({ ...contactData, email: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="phone">Phone number</Label>
              <div className="mt-1">
                <TextInput
                  id="phone"
                  name="phone"
                  placeholder="e.g., +(12)3456 789"
                  type="tel"
                  value={contactData.wa_id}
                  onChange={(e) => setContactData({ ...contactData, wa_id: e.target.value })}
                />
              </div>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button color="primary" onClick={handleAddContact}>
            Add user
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default AddContactModal;