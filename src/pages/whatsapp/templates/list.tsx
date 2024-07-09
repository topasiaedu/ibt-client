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
import { useTemplateContext, Templates, Template } from "../../../context/TemplateContext";
import { useWhatsAppBusinessAccountContext } from "../../../context/WhatsAppBusinessAccountContext";
import { useProjectContext } from "../../../context/ProjectContext";
import LoadingPage from "../../pages/loading";
import EditTemplateModal from "./edit-template-modal";
import TemplateApprovalModal from "./contact-list-member-modal";

const TemplateListPage: React.FC = function () {
  const { templates, loading } = useTemplateContext();
  const [searchValue, setSearchValue] = React.useState<string>("");
  const { whatsAppBusinessAccounts } = useWhatsAppBusinessAccountContext();
  const { currentProject } = useProjectContext();
  const projectWabaIds = whatsAppBusinessAccounts.filter((waba) => waba.project_id === currentProject?.project_id).map((waba) => waba.account_id);

  const resultingTemplates: Templates = {
    templates: templates.filter((template) =>
      template.name.toLowerCase().includes(searchValue.toLowerCase()) && projectWabaIds.includes(template.account_id ?? 0)
    ),
  };

  if (loading || !templates || !templates.length) {
    console.log("Loading templates..., templates: ", templates);
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

interface GroupedTemplates {
  [key: string]: Template[];
}

const TemplatesTable: React.FC<{ templates: Template[] }> = function ({ templates }) {
  const { whatsAppBusinessAccounts } = useWhatsAppBusinessAccountContext();

  const groupedTemplates: GroupedTemplates = templates.reduce((acc: GroupedTemplates, template: Template) => {
    if (!acc[template.name + template.category]) {
      acc[template.name + template.category] = [];
    }
    const alreadyExists = acc[template.name + template.category].some(t => t.account_id === template.account_id);
    if (!alreadyExists) {
      acc[template.name + template.category].push(template);
    }
    return acc;
  }, {});

  const getStatusSummary = (templates: Template[]) => {
    const statusCounts = templates.reduce((acc: { [key: string]: number }, template: Template) => {
      acc[template.status] = (acc[template.status] || 0) + 1;
      return acc;
    }, {});

    const total = templates.length;
    const approved = statusCounts.APPROVED || 0;

    return `${approved}/${total} Approved`;
  };

  return (
    <Table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
      <Table.Head className="bg-gray-100 dark:bg-gray-700">
        <Table.HeadCell>Name</Table.HeadCell>
        <Table.HeadCell>Category</Table.HeadCell>
        <Table.HeadCell>Status</Table.HeadCell>
        <Table.HeadCell>Action</Table.HeadCell>
      </Table.Head>
      <Table.Body className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
        {Object.entries(groupedTemplates).map(([name, templates]) => (
          <Table.Row key={name} className="hover:bg-gray-100 dark:hover:bg-gray-700">
            <Table.Cell>{templates[0].name}</Table.Cell>
            <Table.Cell>{templates[0].category}</Table.Cell>
            <Table.Cell>
              <div className="flex items-center gap-x-2">
                {getStatusSummary(templates)}
                <TemplateApprovalModal templates={templates} />
              </div>
            </Table.Cell>
            <Table.Cell>
              <EditTemplateModal template={templates[0]} /> {/* Modify as needed to handle multiple templates */}
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  );
};

export default TemplateListPage;
