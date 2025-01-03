/* eslint-disable jsx-a11y/anchor-is-valid */
import { Breadcrumb, Dropdown, Label, Table, TextInput } from "flowbite-react";
import debounce from "lodash.debounce";
import type { FC } from "react";
import React, { useEffect } from "react";
import { HiHome } from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import { Contacts, useContactContext } from "../../context/ContactContext";
import { usePhoneNumberContext } from "../../context/PhoneNumberContext";
import NavbarSidebarLayout from "../../layouts/navbar-sidebar";
import LoadingPage from "../pages/loading";
import AddContactModal from "./add-contact-modal";
import EditContactModal from "./edit-contact-modal";

const ContactListPage: FC = function () {
  const { contacts, loading, searchResults, searchContacts } =
    useContactContext();
  const [searchValue, setSearchValue] = React.useState("");
  const [sortValue, setSortValue] = React.useState("Latest");

  const debouncedSearchConversations = debounce((searchPattern: string) => {
    searchContacts(searchPattern);
  }, 1000);
  useEffect(() => {
    if (searchValue === "") {
      return;
    }
    debouncedSearchConversations(searchValue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchValue]);

  if (loading || !contacts || !contacts.length) {
    return <LoadingPage />;
  }

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
              <Breadcrumb.Item>All Contact</Breadcrumb.Item>
            </Breadcrumb>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white sm:text-2xl">
              All Contacts
            </h1>
          </div>
          <div className="sm:flex">
            <div className="mb-3 hidden items-center dark:divide-gray-700 sm:mb-0 sm:flex sm:divide-x sm:divide-gray-100">
              <form className="lg:pr-3">
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
            </div>

            {/* Sort by */}
            <Dropdown label="Sort By">
              <Dropdown.Item onClick={() => setSortValue("Latest")}>
                Latest
              </Dropdown.Item>
              <Dropdown.Item onClick={() => setSortValue("Times Opted In")}>
                Times Opted In
              </Dropdown.Item>
              <Dropdown.Item onClick={() => setSortValue("Total Paid")}>
                Total Paid
              </Dropdown.Item>
            </Dropdown>
            <div className="ml-auto flex items-center space-x-2 sm:space-x-3">
              <AddContactModal />
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col p-4 ">
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full align-middle">
            <div className="overflow-hidden shadow">
              {searchResults.length > 0 && (
                <ContactsTable
                  contacts={searchResults.sort((a, b) => {
                    if (sortValue === "Times Opted In") {
                      return b.times_opted_in - a.times_opted_in;
                    } else if (sortValue === "Total Paid") {
                      return b.total_paid - a.total_paid;
                    }
                    return 0;
                  })}
                />
              )}
              {contacts.length > 0 && searchResults.length === 0 ? (
                <ContactsTable
                  contacts={contacts
                    .sort((a, b) => {
                      if (sortValue === "Times Opted In") {
                        return b.times_opted_in - a.times_opted_in;
                      } else if (sortValue === "Total Paid") {
                        return b.total_paid - a.total_paid;
                      }
                      return 0;
                    })
                    .filter(
                      (contact) =>
                        contact.name
                          .toLowerCase()
                          .includes(searchValue.toLowerCase()) ||
                        contact.wa_id
                          .toLowerCase()
                          .includes(searchValue.toLowerCase())
                    )}
                />
              ) : (
                <div className="p-4 text-center">No contacts found</div>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* <Pagination /> */}
    </NavbarSidebarLayout>
  );
};

const ContactsTable: React.FC<Contacts> = function ({ contacts }) {
  const { phoneNumbers } = usePhoneNumberContext();
  const navigate = useNavigate();

  return (
    <Table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
      <Table.Head className="bg-gray-100 dark:bg-gray-700">
        <Table.HeadCell>Name</Table.HeadCell>
        <Table.HeadCell>Phone Number</Table.HeadCell>
        <Table.HeadCell>Last Contacted By</Table.HeadCell>
        <Table.HeadCell>Times Opted In</Table.HeadCell>
        <Table.HeadCell>Total Paid</Table.HeadCell>
        <Table.HeadCell>Actions</Table.HeadCell>
      </Table.Head>
      <Table.Body className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
        {contacts.map((contact) => (
          <Table.Row
            key={contact.contact_id}
            onClick={() => {
              // Redirect them to the contact timeline page
              navigate(`/contacts/events/${contact.contact_id}`);
            }}
            className="hover:bg-gray-100 dark:hover:bg-gray-700">
            <Table.Cell>{contact.name}</Table.Cell>
            <Table.Cell>{contact.wa_id}</Table.Cell>
            <Table.Cell>
              {contact.last_contacted_by
                ? phoneNumbers.find(
                    (phoneNumber) =>
                      phoneNumber.phone_number_id === contact.last_contacted_by
                  )?.number
                : "Not contacted yet"}
            </Table.Cell>
            <Table.Cell>{contact.times_opted_in}</Table.Cell>
            <Table.Cell>{contact.total_paid}</Table.Cell>
            {/* <Table.Cell>
              {getTags(contact.tags)}
            </Table.Cell> */}
            <Table.Cell>
              <div className="flex items-center gap-x-3 whitespace-nowrap">
                <EditContactModal contact={contact} />
                {/* Removed DeleteUserModal from Actions */}
              </div>
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  );
};

// const getTags = (tags: string[]) => {
//   return tags.map((tag) => (
//     <span key={tag} className="bg-blue-100 text-blue-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300">{tag}</span>

//   ));
// }

export default ContactListPage;
