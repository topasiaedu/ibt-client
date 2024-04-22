/* eslint-disable jsx-a11y/anchor-is-valid */
import {
  Breadcrumb,
  Label,
  Table,
  TextInput,
} from "flowbite-react";
import React from "react";
import {
  HiHome,
} from "react-icons/hi";
import NavbarSidebarLayout from "../../../layouts/navbar-sidebar";
import LoadingPage from "../../pages/loading";
import AddContactListModal from "./add-contact-list-modal";
import CSVImportModal from "./csv-import-modal";
import EditContactListModal from "./edit-contact-list-modal";
import ContactListMemberModal from "./contact-list-member-modal";
import AddContactModal from "./add-contact-to-contact-list-modal";
import { useContactListContext, ContactLists } from "../../../context/ContactListContext";

const WhatsAppContactListPage: React.FC = function () {
  const { contactLists, loading } = useContactListContext();
  const [searchValue, setSearchValue] = React.useState("");

  if (loading) {
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
              <Breadcrumb.Item>All ContactList</Breadcrumb.Item>
            </Breadcrumb>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white sm:text-2xl">
              All ContactLists
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
                    placeholder="Search for users"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                  />
                </div>
              </form>
            </div>
            <div className="ml-auto flex items-center space-x-2 sm:space-x-3">
              <AddContactListModal />           
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col p-4 ">
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full align-middle">
            <div className="overflow-hidden shadow">
              <ContactListsTable contact_lists={contactLists.filter((contactList) => contactList.name.toLowerCase().includes(searchValue.toLowerCase()))} />
            </div>
        </div>
        </div>
      </div>
      {/* <Pagination /> */}
    </NavbarSidebarLayout>
  );
};
const ContactListsTable: React.FC<ContactLists> = function ({contact_lists}) {
  return (
    <Table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
      <Table.Head className="bg-gray-100 dark:bg-gray-700">
        <Table.HeadCell>Name</Table.HeadCell>
        <Table.HeadCell>description</Table.HeadCell>
        {/* <Table.HeadCell>Total Contacts</Table.HeadCell> */}
        <Table.HeadCell>Actions</Table.HeadCell> 
      </Table.Head>
      <Table.Body className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
        {contact_lists.map((contactList) => (
          <Table.Row key={contactList.contact_list_id} className="hover:bg-gray-100 dark:hover:bg-gray-700">
            <Table.Cell>{contactList.name}</Table.Cell>
            <Table.Cell>{contactList.description}</Table.Cell>
            {/* <Table.Cell>{contactList.total_contacts}</Table.Cell> */}
            <Table.Cell>
              <div className="flex items-center gap-x-3 whitespace-nowrap">
                <EditContactListModal contact_list={contactList} />
                {/* <DeleteContactListModal contact_list={contactList} /> */}      
                {/* Import through CSV modal */}
                <CSVImportModal contact_list={contactList} />
                <ContactListMemberModal contact_list={contactList} />
                <AddContactModal contact_list={contactList} />
              </div>
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  );
};

export default WhatsAppContactListPage;
