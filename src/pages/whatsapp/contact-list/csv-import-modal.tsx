/* eslint-disable jsx-a11y/anchor-is-valid */
import { Button, Modal } from 'flowbite-react';
import React, { ChangeEvent, useState } from 'react';
import { MdCloudUpload } from "react-icons/md";
import { useContacts } from '../../../hooks/useContact';
import { useContactLists } from '../../../hooks/whatsapp/useContactList';
import { ContactList } from '../../../types/contactListTypes';
import { Contact, CreateContactFormData } from '../../../types/contactTypes';

// Defining props type
interface EditContactListModalProps {
  contact_list: ContactList;
}

const CSVImportModal: React.FC<EditContactListModalProps> = ({ contact_list }) => {
  const [isOpen, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const { addContact, findContact } = useContacts();
  const { addContactToContactList } = useContactLists();

  // Handler for file input change
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFile(event.target.files[0]);
    }
  };

  // const handleDownloadSample = () => {
  //   const link = document.createElement('a');
  //   link.href = '/example-format.csv'; // Adjust the path if your file is in a subdirectory within the public folder
  //   link.setAttribute('download', 'example-format.csv'); // This forces the download
  //   document.body.appendChild(link);
  //   link.click();
  //   document.body.removeChild(link);
  // };


  // Handler for import button click
  const handleImport = async () => {
    if (file) {
      const reader = new FileReader();
      reader.readAsText(file);
      reader.onload = async () => {
        const contacts = reader.result as string;
        // Skip the first line (header)
        
        const contactsArray = contacts.split('\n').slice(1).map((contact) => {
          const [name, phone] = contact.split(',');
          return { name, phone };
        });
        
        contactsArray.forEach((contact) => {
          const tempContact = { name: contact.name, wa_id: contact.phone } as Contact;
          // Check if the contact already exists
          findContact(tempContact).then((data) => {
            if (data) {
              // Add the contact to the contact list
              addContactToContactList(contact_list.contact_list_id, data.contact_id).catch((error) => {
                console.error('Failed to add contact to contact list:', error);
              });
            } else {
              // Add the contact to the contacts table
              addContact({ name: contact.name, wa_id: contact.phone } as CreateContactFormData).then((newContact) => {
                if (!newContact) return;
                addContactToContactList(contact_list.contact_list_id, newContact.contact_id);
              }).catch((error) => {
                console.error('Failed to add contact:', error);
              });
            }
          });

        });
        // Refresh the page to show the new contact
        // window.location.reload();
      };
    }
  };

  return (
    <>
      <Button color="primary" onClick={() => setOpen(true)}>
        <div className="flex items-center gap-x-2">
          <MdCloudUpload  className="text-xs" />
          Import through CSV
        </div>
      </Button>
      <Modal onClose={() => setOpen(false)} show={isOpen}>
        <Modal.Header className="border-b border-gray-200 !p-6 dark:border-gray-700">
          <strong>Import through CSV</strong>
        </Modal.Header>
        <Modal.Body>
          <div className="flex items-center justify-center w-full">
            <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <svg className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2" />
                </svg>
                <p className="mb-2 text-sm text-gray-500 dark:text-gray-400"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Supported File Format: CSV</p>

                {/* Uploaded File */}
                {file && (
                  <div className="flex items-center justify-center mt-4">
                    <p className="text-xs text-gray-500 dark:text-gray-400">{file.name}</p>
                  </div>
                )}
              </div>
              <input id="dropzone-file" type="file" onChange={handleFileChange} className="hidden" />
            </label>
          </div>

          {/* Sample File Download Button */}
          {/* <div className="flex items-center justify-center mt-4">
            <Button color="primary" className="!text-xs" onClick={handleDownloadSample}>
              <div className="flex items-center gap-x-2">
                <HiOutlinePencilAlt className="text-xs" />
                Download Sample File
              </div>
            </Button>
          </div> */}

        </Modal.Body>
        <Modal.Footer>
          <Button color="primary" onClick={handleImport}>
            Import
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default CSVImportModal;