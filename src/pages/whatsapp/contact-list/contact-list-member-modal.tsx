/* eslint-disable jsx-a11y/anchor-is-valid */
import {
  Button,
  Modal,
  Table,
} from "flowbite-react";
import React, { useState, useEffect } from "react";
import { useContactLists } from "../../../hooks/whatsapp/useContactList";
import { ContactList } from "../../../types/contactListTypes";
import { Contact } from "../../../types/contactTypes";
import { MdDelete } from "react-icons/md";
import { CiViewTable } from "react-icons/ci";

interface ContactListMemberModalProps {
  contact_list: ContactList;
}

const ContactListMemberModal: React.FC<ContactListMemberModalProps> = function ({ contact_list }) {
  const [isOpen, setOpen] = useState(false);
  const { fetchContactListMembers, removeContactFromContactList } = useContactLists();
  const [contactListMembers, setContactListMembers] = useState<Contact[]>([]);

  const handleRemoveContact = async (contact_id: number) => {
    await removeContactFromContactList(contact_list.contact_list_id, contact_id);
    // Refresh the page to show the new contact
    window.location.reload();
  }

  useEffect(() => { 
    const fetchData = async () => {
      const members = await fetchContactListMembers(contact_list.contact_list_id);
      if (members) {
        setContactListMembers(members);
      }
    };

    fetchData();
  }, [contact_list.contact_list_id, fetchContactListMembers]);

  return (
    <>
      <Button color="primary" onClick={() => setOpen(true)}>
        <div className="flex items-center gap-x-3">
          <CiViewTable className="text-xs" />
          View Members
        </div>
      </Button>
      <Modal onClose={() => setOpen(false)} show={isOpen} size="4xl">
        <Modal.Header className="border-b border-gray-200 !p-6 dark:border-gray-700">
          <strong>Contact List Members</strong>
        </Modal.Header>
        <Modal.Body>
          <div className="flex flex-col p-4 max-h-96">
            <div className="overflow-x-auto">
              <div className="inline-block min-w-full align-middle">
                <div className="overflow-hidden shadow">

                  <Table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
                    <Table.Head className="bg-gray-100 dark:bg-gray-700">
                      <Table.HeadCell>Name</Table.HeadCell>
                      <Table.HeadCell>Phone</Table.HeadCell>
                      <Table.HeadCell>Actions</Table.HeadCell>
                    </Table.Head>
                    <Table.Body className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
                      {contactListMembers.map((contact) => (
                        <Table.Row key={contact.contact_id} className="hover:bg-gray-100 dark:hover:bg-gray-700">
                          <Table.Cell>{contact.name}</Table.Cell>
                          <Table.Cell>{contact.wa_id}</Table.Cell>
                          <Table.Cell>
                            <Button color="primary" onClick={() => handleRemoveContact(contact.contact_id)}>
                              <div className="flex items-center gap-x-3">
                                <MdDelete className="text-xs" />
                                Remove
                              </div>
                            </Button>
                          </Table.Cell>
                        </Table.Row>
                      ))}
                    </Table.Body>
                  </Table>
                </div>
              </div>
            </div>
          </div>

        </Modal.Body>
      </Modal>
    </>
  );
};

export default ContactListMemberModal;