import React, { useState } from "react";
import { Breadcrumb, Button, FileInput, Label } from "flowbite-react";
import { HiHome } from "react-icons/hi";
import NavbarSidebarLayout from "../../layouts/navbar-sidebar";
import {
  Contact,
  ContactInsert,
  useContactContext,
} from "../../context/ContactContext";
import {
  useContactEventContext,
  ContactEventInsert,
} from "../../context/ContactEventContext";

const DevToolsPage: React.FC = function () {
  const [file, setFile] = useState<File | null>(null);
  const [totalValidContacts, setTotalValidContacts] = useState(0);
  const [totalContacts, setTotalContacts] = useState(0);
  const [oldContactCount, setOldContactCount] = useState(0);
  const [newContactCount, setNewContactCount] = useState(0);
  const { findContactByWaId, addContact } = useContactContext();
  const { addContactEvent, bulkAddContactEvents } = useContactEventContext();
  const [errorCount, setErrorCount] = useState(0);

  type CSVData = Record<string, string | null>;

  const processCSV = async () => {
    if (!file) {
      console.error("No file selected");
      return;
    }
  
    try {
      // Reading the file as text
      const text = await file.text();
  
      // Splitting the file content into rows
      const rows = text.split("\n").filter((row) => row.trim() !== "");
  
      // Extracting headers
      const headers = rows[0].split(",").map((header) => header.trim());
  
      // Processing each row into a JSON object
      const data: CSVData[] = rows.slice(1).map((row) => {
        const columns = row.split(",").map((col) => col.trim());
  
        // Create a JSON object from the columns
        const rowData: CSVData = headers.reduce<CSVData>(
          (acc, header, index) => {
            // Check if the index exists in columns; if not, assign null
            let value = columns[index] !== undefined ? columns[index] : null;
  
            // Check if phone is empty, if empty skip
            if (header.toLowerCase() === "phone" && !value) {
              return acc;
            }
  
            // Format the phone number if this is the "Phone" column
            if (header.toLowerCase() === "phone" && value !== null) {
              value = formatPhoneNumber(value);
              setTotalContacts((prev) => prev + 1);
            }
  
            if (
              header.toLowerCase() === "date" &&
              value !== null &&
              value !== ""
            ) {
              const dateString = value;
  
              // Split the date and time
              const [datePart, timePart] = dateString.split(" ");
  
              // Split the day, month, and year
              const [day, month, year] = datePart.split("/");
  
              // Check if date values are valid
              if (
                isNaN(parseInt(day)) ||
                isNaN(parseInt(month)) ||
                isNaN(parseInt(year)) ||
                parseInt(day) > 31 ||
                parseInt(month) > 12 ||
                parseInt(year) < 1900 ||
                parseInt(year) > new Date().getFullYear()
              ) {
                console.error("Invalid date:", datePart);
                setErrorCount((prev) => prev + 1);
                return acc;
              }
  
              // Rearrange into a format that the Date object understands (YYYY-MM-DDTHH:mm:ss)
              const formattedDateString = `${year}-${month}-${day}T${timePart}`;
  

              console.log("Formatted date string:", formattedDateString);
              // Create a Date object
              const dateObject = new Date(formattedDateString);
  
              value = dateObject.toISOString();
            }
  
            acc[header.toLowerCase()] = value;
            return acc;
          },
          {}
        );
  
        return rowData;
      });
  
      let contactEvents: ContactEventInsert[] = [];
  
      // Create contacts from the data
      for (const contactData of data) {
        // Skip if the phone number is invalid
        if (contactData.phone === "Invalid") {
          continue;
        }
  
        if (!contactData.phone) {
          // console.log("Skipping contact without phone number:", contactData);
          continue;
        }
  
        // Find the contact by phone number
        const existingContact = await findContactByWaId(contactData.phone);
  
        // If the contact doesn't exist, create a new contact
        if (!existingContact) {
          // Create a new contact
          const newContact: ContactInsert = {
            name: contactData.name || "",
            wa_id: contactData.phone || "",
            email: contactData.email || "",
            project_id: 1,
          };
  
          // Add the contact to the database
          const contact = await addContact(newContact);
  
          if (!contact) {
            console.error("Error adding contact:", newContact);
            setErrorCount((prev) => prev + 1);
            continue;
          }
  
          // Create a new contact event
          const newContactEvent: ContactEventInsert = {
            contact_id: contact.contact_id,
            type: contactData.type || "Unknown",
            created_at: contactData.date || new Date().toISOString(),
            project_id: 1,
            tag: contactData.tag,
            tag_2: contactData.tag_2,
            amount: contactData.amount ? parseFloat(contactData.amount) : 0,
            description: `Purchased ${contactData.tag} on ${
              contactData.date || new Date().toISOString()
            } in the amount of ${contactData.amount} (${contactData.tag_2})`,
          };
  
          contactEvents.push(newContactEvent);
          setNewContactCount((prev) => prev + 1);
        } else {
          // Create a new contact event
          const newContactEvent: ContactEventInsert = {
            contact_id: existingContact.contact_id,
            type: contactData.type || "Unknown",
            created_at: contactData.date || new Date().toISOString(),
            project_id: 1,
            tag: contactData.tag,
            tag_2: contactData.tag_2,
            amount: contactData.amount ? parseFloat(contactData.amount) : 0,
            description: `Purchased ${contactData.tag} on ${
              contactData.date || new Date().toISOString()
            } in the amount of ${contactData.amount} (${contactData.tag_2})`,
          };
  
          contactEvents.push(newContactEvent);
          setOldContactCount((prev) => prev + 1);
        }
      }
  
      console.log("Contact events:", contactEvents.length);
      // Bulk add contact events
      const result = await bulkAddContactEvents(contactEvents);
      if (!result) {
        console.error("Error adding contact events:");
        setErrorCount((prev) => prev + 1);
      } else {
        console.log("Successfully added contact events:", result);
      }
    } catch (error) {
      console.error("Error reading file:", error);
    }
  };
  
  const [totalInvalid, setTotalInvalid] = useState(0);

  const formatPhoneNumber = (phone: string): string => {
    if (!phone) {
      // Skip
      return phone;
    }
    // Remove '+' if present
    if (phone.startsWith("+")) {
      phone = phone.substring(1);
    }

    // Remove " if present
    phone = phone.replace(/"/g, "");

    // Remove spaces and - in the middle
    phone = phone.replace(/[\s-]/g, "");

    // Remove leading '0' if present
    if (phone.startsWith("0")) {
      phone = phone.substring(1);
    }

    // Check if the number starts with "60" (Malaysia)
    if (phone.startsWith("60")) {
      const numberAfterCountryCode = phone.substring(2);
      // Check if it's a valid Singaporean number (8 digits long)
      if (/^\d{8}$/.test(numberAfterCountryCode)) {
        // Convert to Singapore number by replacing "60" with "65"
        phone = `65${numberAfterCountryCode}`;
      } else if (/^[13-8]/.test(numberAfterCountryCode)) {
        // Otherwise, assume it's a valid Malaysian number (no change needed)
        phone = `60${numberAfterCountryCode}`;
      } else {
        // If it doesn't match any criteria, mark as invalid
        phone = "Invalid";
      }
    }
    // Check if the number starts with "1" and has 9 or 10 or 11 digits (Malaysian mobile number)
    else if (
      phone.startsWith("1") &&
      (phone.length === 9 || phone.length === 10 || phone.length === 11)
    ) {
      // Prepend "60" to make it a valid Malaysian number
      phone = `60${phone}`;
    }
    // Check if the number starts with "65" (Singapore)
    else if (phone.startsWith("65")) {
      const numberAfterCountryCode = phone.substring(2);
      // Ensure it's a valid Singaporean number (must be 8 digits)
      if (!/^\d{8}$/.test(numberAfterCountryCode)) {
        phone = "Invalid";
      }
    }
    // Check if the number starts with "673" (Brunei)
    else if (phone.startsWith("673")) {
      const numberAfterCountryCode = phone.substring(3);
      // Assuming Brunei numbers are 7 digits long
      if (!/^\d{7}$/.test(numberAfterCountryCode)) {
        phone = "Invalid";
      }
    } else {
      // If it doesn't start with "60", "65", or "673", mark as invalid
      phone = "Invalid";
    }

    if (phone === "Invalid") {
      setTotalInvalid((prev) => prev + 1);
    } else {
      setTotalValidContacts((prev) => prev + 1);
    }
    return phone;
  };

  return (
    <NavbarSidebarLayout>
      <div className="block items-center justify-between border-b border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800 sm:flex">
        <div className="mb-1 w-full">
          <div className="mb-4">
            <Breadcrumb className="mb-4">
              <Breadcrumb.Item href="/">
                <div className="flex items-center gap-x-3">
                  <HiHome className="text-xl" />
                  <span className="dark:text-white">Home</span>
                </div>
              </Breadcrumb.Item>
              <Breadcrumb.Item href="#">WhatsApp</Breadcrumb.Item>
              <Breadcrumb.Item>All Stanley&apos;s Tool</Breadcrumb.Item>
            </Breadcrumb>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white sm:text-2xl">
              All Stanley&apos;s Tool
            </h1>
          </div>
        </div>
      </div>
      <div className="flex flex-col p-4 ">
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full align-middle">
            <div className="overflow-hidden shadow">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {/* Show all stats */}
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Stats
                  </h2>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <Label>Total Contacts</Label>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {totalContacts}
                      </p>
                    </div>
                    <div>
                      <Label>Total Valid Contacts</Label>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {totalValidContacts}
                      </p>
                    </div>
                    <div>
                      <Label>Total Invalid Contacts</Label>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {totalInvalid}
                      </p>
                    </div>
                    <div>
                      <Label>Old Contacts</Label>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {oldContactCount}
                      </p>
                    </div>
                    <div>
                      <Label>New Contacts</Label>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {newContactCount}
                      </p>
                    </div>

                    <div>
                      <Label>Errors</Label>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {errorCount}
                      </p>
                    </div>
                  </div>
                </div>
                {/* Create a temporary file upload function to process CSV */}
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Upload CSV
                  </h2>
                  <FileInput
                    id="file-upload"
                    name="file-upload"
                    accept=".csv"
                    onChange={(e) => {
                      if (e.target.files) {
                        setFile(e.target.files[0]);
                      }
                    }}
                  />
                  <Button
                    color="primary"
                    onClick={processCSV}
                    disabled={!file}
                    className="mt-4">
                    Process CSV
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </NavbarSidebarLayout>
  );
};

export default DevToolsPage;
