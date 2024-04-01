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
import AddTemplateModal from "./add-template-modal";
import { useTemplates } from "../../../hooks/whatsapp/useTemplate";
import { TemplateList } from "../../../types/templateTypes";
import LoadingPage from "../../pages/loading";

const TemplateListPage: React.FC = function () {
  const { templates, isLoading } = useTemplates();
  const [searchValue, setSearchValue] = React.useState("");

  const resultingTemplates: TemplateList = {
    templates: templates.filter((template) =>
      template.name.toLowerCase().includes(searchValue.toLowerCase())
    ),
  };

  if (isLoading) {
    return <LoadingPage />
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
              <Breadcrumb.Item>All Template</Breadcrumb.Item>
            </Breadcrumb>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white sm:text-2xl">
              All Templates
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
              <AddTemplateModal />
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col p-4 ">
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full align-middle">
            <div className="overflow-hidden shadow">
              <TemplatesTable templates={resultingTemplates.templates} />
            </div>
          </div>
        </div>
      </div>
      {/* <Pagination /> */}
    </NavbarSidebarLayout>
  );
};

const TemplatesTable: React.FC<TemplateList> = function ({ templates }) {
  return (
    <Table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
      <Table.Head className="bg-gray-100 dark:bg-gray-700">
        <Table.HeadCell>Name</Table.HeadCell>
        <Table.HeadCell>Category</Table.HeadCell>
        <Table.HeadCell>Status</Table.HeadCell>
      </Table.Head>
      <Table.Body className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
        {templates.map((template) => (
          <Table.Row key={template.template_id} className="hover:bg-gray-100 dark:hover:bg-gray-700">
            <Table.Cell>{template.name}</Table.Cell>
            <Table.Cell>{template.category}</Table.Cell>
            <Table.Cell>
              <div className="flex items-center">
                {getStatusIndicator(template.status)}
                {template.status}
              </div>
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  );
};

const getStatusIndicator = (status: string) => {
  // Pending, Approved, Draft, Rejected
  // Eg. <div className="mr-2 h-2.5 w-2.5 rounded-full bg-green-400" />
  switch (status) {
    case 'PENDING':
      return <div className="mr-2 h-2.5 w-2.5 rounded-full bg-yellow-400" />;
    case 'APPROVED':
      return <div className="mr-2 h-2.5 w-2.5 rounded-full bg-green-400" />;
    case 'DRAFT':
      return <div className="mr-2 h-2.5 w-2.5 rounded-full bg-blue-400" />;
    case 'REJECTED':
      return <div className="mr-2 h-2.5 w-2.5 rounded-full bg-red-400" />;
    default:
      return <div className="mr-2 h-2.5 w-2.5 rounded-full bg-gray-400" />;
  }
};


export default TemplateListPage;
