/* eslint-disable react/style-prop-object */
/* eslint-disable jsx-a11y/anchor-is-valid */
import { Button, Modal, Tabs } from "flowbite-react";
import React, { ChangeEvent, useState } from "react";
import { BsFiletypeCsv, BsTextareaResize } from "react-icons/bs";
import { MdCloudUpload } from "react-icons/md";
import { Textarea } from "flowbite-react";
import {
  useContactContext,
  Contact,
  ContactInsert,
} from "../../../context/ContactContext";
import { useProjectContext } from "../../../context/ProjectContext";
import {
  useContactListContext,
  ContactList,
} from "../../../context/ContactListContext";

// Defining props type
interface EditContactListModalProps {
  contact_list: ContactList;
}

const CSVImportModal: React.FC<EditContactListModalProps> = ({
  contact_list,
}) => {
  const [isOpen, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const { addContact, findContact } = useContactContext();
  const { addContactToContactList } = useContactListContext();
  const [formInput, setFormInput] = useState("");
  const { currentProject } = useProjectContext();
  const [progress, setProgress] = useState(0);
  const [completedContacts, setCompletedContacts] = useState(0);
  const [totalContacts, setTotalContacts] = useState(0);
  const [importing, setImporting] = useState(false);

  // Handler for file input change
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFile(event.target.files[0]);
    }
  };

  // Handler for import button click
  const handleImport = async () => {
    if (file) {
      setImporting(true);
      const reader = new FileReader();
      reader.readAsText(file);
      reader.onload = async () => {
        const contacts = reader.result as string;
        const contactsArray = contacts
          .split("\n")
          .slice(1)
          .map((contact) => {
            const [name, phone] = contact.split(",");
            return { name, phone, project_id: currentProject?.project_id };
          });
        setTotalContacts(contactsArray.length);

        for (let i = 0; i < contactsArray.length; i++) {
          const contact = contactsArray[i];
          const tempContact = {
            name: contact.name,
            wa_id: contact.phone,
          } as Contact;

          // Check if the contact already exists
          const data = await findContact(tempContact);
          if (data) {
            // Add the contact to the contact list
            await addContactToContactList(
              contact_list.contact_list_id,
              data.contact_id
            );
          } else {
            // Add the contact to the contacts table
            const response = await addContact({
              name: contact.name,
              wa_id: contact.phone,
            } as ContactInsert);
            if (response) {
              await addContactToContactList(
                contact_list.contact_list_id,
                response.contact_id
              );
            }
          }

          // Update progress
          setProgress(Math.round(((i + 1) / contactsArray.length) * 100));
          setCompletedContacts(i + 1);
        }

        setImporting(false);
        // Reload the page
        window.location.reload();
      };
    } else {
      setImporting(true);
      const contacts = formInput;
      const contactsArray = contacts.split("\n").map((contact) => {
        const parts = contact.split(",");
        const phone = parts[0].trim();
        const name = parts.length === 2 ? parts[1].trim() : undefined;
        return { name, phone };
      });

      const filteredContactsArray = contactsArray.filter(
        (contact) => contact.phone !== ""
      );
      setTotalContacts(filteredContactsArray.length);

      for (let i = 0; i < filteredContactsArray.length; i++) {
        const contact = filteredContactsArray[i];
        const tempContact = {
          name: contact.name || "Unknown",
          wa_id: contact.phone,
        } as Contact;

        const data = await findContact(tempContact);
        if (data) {
          await addContactToContactList(
            contact_list.contact_list_id,
            data.contact_id
          );
        } else {
          const createContactData: ContactInsert = {
            wa_id: contact.phone,
            name: contact.name || "",
            phone: null,
            email: null,
            contact_id: 0,
            created_at: new Date().toISOString(),
            last_contacted_by: null,
            project_id: currentProject?.project_id || 0,
            tsv_name_waid: undefined
          };

          const response = await addContact(createContactData);
          if (response) {
            await addContactToContactList(
              contact_list.contact_list_id,
              response.contact_id
            );
          }
        }

        // Update progress
        setProgress(Math.round(((i + 1) / filteredContactsArray.length) * 100));
        setCompletedContacts(i + 1);
      }

      setImporting(false);
      // Reload the page
      window.location.reload();
    }
  };

  return (
    <>
      <Button color="primary" onClick={() => setOpen(true)}>
        <div className="flex items-center gap-x-2">
          <MdCloudUpload className="text-xs" />
          Import
        </div>
      </Button>
      <Modal onClose={() => setOpen(false)} show={isOpen}>
        <Modal.Header className="border-b border-gray-200 !p-6 dark:border-gray-700">
          <strong>Import</strong>
        </Modal.Header>
        <Modal.Body>
          <div className="overflow-x-auto">
            <Tabs aria-label="Full width tabs" style="fullWidth">
              <Tabs.Item active title="CSV" icon={BsFiletypeCsv}>
                {/* Helper Text to guide the user on what the csv should be like */}
                <div className="flex flex-col items-center justify-center w-full">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    The CSV should be in the format: Name, Phone Number
                    (optional)
                  </p>
                </div>
                <div className="flex items-center justify-center w-full">
                  <label
                    htmlFor="dropzone-file"
                    className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <svg
                        className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 20 16">
                        <path
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                        />
                      </svg>
                      <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                        <span className="font-semibold">Click to upload</span>{" "}
                        or drag and drop
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Supported File Format: CSV
                      </p>

                      {/* Uploaded File */}
                      {file && (
                        <div className="flex items-center justify-center mt-4">
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {file.name}
                          </p>
                        </div>
                      )}
                    </div>
                    <input
                      id="dropzone-file"
                      type="file"
                      onChange={handleFileChange}
                      className="hidden"
                    />
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
              </Tabs.Item>
              <Tabs.Item title="Form" icon={BsTextareaResize}>
                <div className="flex items-center justify-center w-full">
                  <Textarea
                    placeholder="Phone Number, Name (optional), ..."
                    value={formInput}
                    onChange={(e) => setFormInput(e.target.value)}
                    className="w-full h-64"
                    disabled={importing}
                  />
                </div>
              </Tabs.Item>
            </Tabs>
          </div>
        </Modal.Body>
        <Modal.Footer>
          {importing && (
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-x-2">
                <div className="flex items-center gap-x-2">
                  <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
                  <div className="flex flex-col">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Importing...
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {progress}% ({completedContacts}/{totalContacts})
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
          {!importing && (
            <Button color="primary" onClick={handleImport}>
              Import
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default CSVImportModal;
