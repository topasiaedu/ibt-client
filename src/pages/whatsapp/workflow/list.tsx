/* eslint-disable jsx-a11y/anchor-is-valid */
import {
  Breadcrumb,
  Button,
  Label,
  Table,
  TextInput,
  ToggleSwitch
} from "flowbite-react";
import React from "react";
import {
  HiHome,
  HiOutlinePencilAlt,
  HiPlus,
} from "react-icons/hi";
import { useAlertContext } from "../../../context/AlertContext";
import { Workflows, useWorkflowContext } from "../../../context/WorkflowContext";
import NavbarSidebarLayout from "../../../layouts/navbar-sidebar";
import LoadingPage from "../../pages/loading";

const WorkflowListPage: React.FC = function () {
  const [searchValue, setSearchValue] = React.useState("");
  // const projectWabaIds = workflows.filter((waba) => waba.project_id === currentProject?.project_id).map((waba) => waba.account_id);
  const { workflows, loading } = useWorkflowContext();

  const resultingTemplates: Workflows = {
    workflows: workflows.filter((workflow) =>
      workflow.name.toLowerCase().includes(searchValue.toLowerCase()) ||
      (workflow.description && workflow.description.toLowerCase().includes(searchValue.toLowerCase()))
    ),
  };

  if (loading) {
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
              <Breadcrumb.Item>All Workflow</Breadcrumb.Item>
            </Breadcrumb>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white sm:text-2xl">
              All Workflows
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
              {/* Redirect to editor */}
              <Button color="primary" onClick={() => window.location.href = "/whatsapp/workflow/editor"}>
                <div className="flex items-center gap-x-3">
                  <HiPlus className="text-xl" />
                  Add Workflow
                </div>
              </Button>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col p-4 ">
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full align-middle">
            <div className="overflow-hidden shadow">
              <TemplatesTable workflows={resultingTemplates.workflows} />
            </div>
          </div>
        </div>
      </div>
      {/* <Pagination /> */}
    </NavbarSidebarLayout>
  );
};

const TemplatesTable: React.FC<Workflows> = function ({ workflows }) {
  const { updateWorkflow } = useWorkflowContext();
  const { showAlert } = useAlertContext();

  const updateRunStatus = async (workflowId: string, run: boolean) => {
    try {
      const workflow = workflows.find((workflow) => workflow.id === workflowId);
      if (!workflow) return;
      await updateWorkflow({ 
        id: workflow.id,
        name: workflow.name,
        description: workflow.description,
        run: run,
       }, workflow.phone_numbers);
      showAlert("Workflow updated successfully", "success");
    } catch (error) {
      showAlert((error as unknown as Error).message, "error");
    }
  };

  return (
    <Table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
      <Table.Head className="bg-gray-100 dark:bg-gray-700">
        <Table.HeadCell>Name</Table.HeadCell>
        <Table.HeadCell>Description</Table.HeadCell>
        <Table.HeadCell>Status</Table.HeadCell>
        <Table.HeadCell>Action</Table.HeadCell>
      </Table.Head>
      <Table.Body className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
        {workflows.map((workflow) => (
          <Table.Row key={workflow.id} className="hover:bg-gray-100 dark:hover:bg-gray-700">
            <Table.Cell>{workflow.name}</Table.Cell>
            <Table.Cell>{workflow.description}</Table.Cell>
            <Table.Cell>
              <div className="flex items-center">
                <ToggleSwitch
                  checked={workflow.run}
                  onChange={(e) => {
                    updateRunStatus(workflow.id, e);
                  }}
                />
              </div>
            </Table.Cell>
            <Table.Cell>
              {/* Redirect them to editor with id at the end */}
              <Button color="primary" onClick={() => window.location.href = `/whatsapp/workflow/editor/${workflow.id}`}>
                <HiOutlinePencilAlt className="text-sm" />
                Edit
              </Button>
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  );
};



export default WorkflowListPage;
