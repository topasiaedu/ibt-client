/* eslint-disable jsx-a11y/anchor-is-valid */
import {
  Button,
  Checkbox,
  Label,
  Modal,
  Table,
  TextInput,
} from "flowbite-react";
import React, { useState } from "react";
import {
  HiPlus,
} from "react-icons/hi";
import { useContactContext } from "../../../context/ContactContext";
import { useContactListContext, ContactList } from "../../../context/ContactListContext";

interface AddContactModalProps {
  // Define the props type here
  contact_list: ContactList
}

const AddContactModal: React.FC<AddContactModalProps> = function ({ contact_list }) {
  const [isOpen, setOpen] = useState(false);
  const { contacts } = useContactContext();
  const [searchValue, setSearchValue] = React.useState("");
  const [selectedContacts, setSelectedContacts] = React.useState<number[]>([]);
  const { addContactToContactList } = useContactListContext();

  const handleAddContact = async () => {
    // Add your code here
    selectedContacts.forEach(async (contact_id) => {
      await addContactToContactList(contact_list.contact_list_id, contact_id);
    });
    
    // Close the modal
    setOpen(false);
  };

  return (
    <>
      <Button color="primary" onClick={() => setOpen(true)}>
        <div className="flex items-center gap-x-3">
          <HiPlus className="text-xl" />
          Add Contact
        </div>
      </Button>
      <Modal onClose={() => setOpen(false)} show={isOpen} size="7xl">
        <Modal.Header className="border-b border-gray-200 !p-6 dark:border-gray-700">
          <strong>Add new Contact List</strong>
        </Modal.Header>
        <Modal.Body>


          <div className="flex flex-col p-2 max-h-96">
            <form className="w-full mb-4">
              <Label htmlFor="users-search" className="sr-only">
                Search
              </Label>
              <div className="relative mt-1 lg:w-64 xl:w-96">
                <TextInput
                  id="users-search"
                  name="users-search"
                  placeholder="Search for Contacts"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                />
              </div>
            </form>
            <div className="overflow-x-auto">
              <div className="inline-block min-w-full align-middle">
                <div className="overflow-hidden shadow">
                  <Table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
                    <Table.Head className="bg-gray-100 dark:bg-gray-700">
                      <Table.HeadCell>
                        <Label htmlFor="select-all" className="sr-only">
                          Select all
                        </Label>
                        <Checkbox id="select-all" name="select-all" />
                      </Table.HeadCell>
                      <Table.HeadCell>Name</Table.HeadCell>
                      <Table.HeadCell>Phone Number</Table.HeadCell>
                    </Table.Head>
                    <Table.Body className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
                      {contacts.filter((contact) => contact.name.toLowerCase().includes(searchValue.toLowerCase()) || contact.wa_id.toLowerCase().includes(searchValue.toLowerCase())).map((contact) => (
                        <Table.Row key={contact.contact_id} className="hover:bg-gray-100 dark:hover:bg-gray-700">
                          <Table.Cell className="w-4 p-4">
                            <div className="flex items-center">
                              <Checkbox aria-describedby="checkbox-1" id="checkbox-1" onChange={() => setSelectedContacts([...selectedContacts, contact.contact_id])} />
                              <label htmlFor="checkbox-1" className="sr-only">
                                checkbox
                              </label>
                            </div>
                          </Table.Cell>
                          <Table.Cell>{contact.name}</Table.Cell>
                          <Table.Cell >{contact.wa_id}</Table.Cell>
                        </Table.Row>
                      ))}
                    </Table.Body>
                  </Table>
                </div>
              </div>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button color="primary" onClick={handleAddContact}>
            Add Contact List
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}

export default AddContactModal;