/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState } from 'react';
import type { FC } from 'react';
import { Button, Label, Modal, TextInput } from 'flowbite-react';
import { HiOutlinePencilAlt } from 'react-icons/hi';
import { Contact } from '../../types/contactTypes';
import { useContacts } from '../../hooks/useContact';

// Defining props type
interface EditContactModalProps {
  contact: Contact;
}

const EditContactModal: FC<EditContactModalProps> = ({ contact }) => {
  const [isOpen, setOpen] = useState(false);
  const { updateContact } = useContacts();
  const [contactData, setContactData] = useState({
    contact_id: contact.contact_id,
    name: contact.name,
    email: contact.email,
    wa_id: contact.wa_id
});

  const handleUpdateContact = async (contact_id: number, formData: Contact) => {
    await updateContact(contact_id, formData);
    setOpen(false);
    // Refresh the page to show the new contact
    window.location.reload();
  }  

  return (
    <>
      <Button color="primary" onClick={() => setOpen(true)} className=''>
        <div className="flex items-center gap-x-2">
          <HiOutlinePencilAlt className="text-xs" />
          Edit Contact
        </div>
      </Button>
      <Modal onClose={() => setOpen(false)} show={isOpen}>
        <Modal.Header className="border-b border-gray-200 !p-6 dark:border-gray-700">
          <strong>Edit user</strong>
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
                  onChange={(e) => setContactData({...contactData, name: e.target.value})}
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
                  value={contactData.email || ''}
                  onChange={(e) => setContactData({...contactData, email: e.target.value})}
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
                  value={contactData.wa_id || ''}
                  onChange={(e) => setContactData({...contactData, wa_id: e.target.value})}
                />
              </div>
            </div>
          
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button color="primary" onClick={() => {
            handleUpdateContact(contactData.contact_id, {
              ...contactData,
              created_at: contact.created_at,
              phone: contact.phone
            });
          }}>
            Save all
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default EditContactModal;