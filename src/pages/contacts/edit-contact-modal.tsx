/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState } from 'react';
import type { FC } from 'react';
import { Button, Label, Modal, TextInput } from 'flowbite-react';
import { HiOutlinePencilAlt } from 'react-icons/hi';
import { useContactContext, Contact } from '../../context/ContactContext';

// Defining props type
interface EditContactModalProps {
  contact: Contact;
}

const EditContactModal: FC<EditContactModalProps> = ({ contact }) => {
  const [isOpen, setOpen] = useState(false);
  const { updateContact } = useContactContext();
  const [contactData, setContactData] = useState<Contact>(contact);

  const handleUpdateContact = async (formData: Contact) => {
    await updateContact(formData);
    setOpen(false);
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
          <Button color="primary" onClick={() => handleUpdateContact(contactData)}>
            Save all
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default EditContactModal;