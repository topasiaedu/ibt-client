/* eslint-disable jsx-a11y/anchor-is-valid */
import {
  Breadcrumb,
  Label,
  Table,
  TextInput,
} from "flowbite-react";
import type { FC } from "react";
import React from "react";
import {
  HiChevronLeft,
  HiChevronRight,
  HiHome,
} from "react-icons/hi";
import NavbarSidebarLayout from "../../../layouts/navbar-sidebar";
import AddCampaignModal from "./add-campaign-modal";
// import EditCampaignModal from "./edit-campaign-modal";

const CampaignListPage: FC = function () {
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
              <Breadcrumb.Item>All Campaign</Breadcrumb.Item>
            </Breadcrumb>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white sm:text-2xl">
              All Campaigns
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
                  />
                </div>
              </form>
              {/* <div className="mt-3 flex space-x-1 pl-0 sm:mt-0 sm:pl-2">
                <a
                  href="#"
                  className="inline-flex cursor-pointer justify-center rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                >
                  <span className="sr-only">Configure</span>
                  <HiCog className="text-2xl" />
                </a>
                <a
                  href="#"
                  className="inline-flex cursor-pointer justify-center rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                >
                  <span className="sr-only">Delete</span>
                  <HiTrash className="text-2xl" />
                </a>
                <a
                  href="#"
                  className="inline-flex cursor-pointer justify-center rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                >
                  <span className="sr-only">Purge</span>
                  <HiExclamationCircle className="text-2xl" />
                </a>
                <a
                  href="#"
                  className="inline-flex cursor-pointer justify-center rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                >
                  <span className="sr-only">Settings</span>
                  <HiDotsVertical className="text-2xl" />
                </a>
              </div> */}
            </div>
            <div className="ml-auto flex items-center space-x-2 sm:space-x-3">
              <AddCampaignModal />
              {/* <Button color="gray">
                <div className="flex items-center gap-x-3">
                  <HiDocumentDownload className="text-xl" />
                  <span>Export</span>
                </div>
              </Button> */}
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col p-4 ">
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full align-middle">
            <div className="overflow-hidden shadow">
              <CampaignsTable />
            </div>
          </div>
        </div>
      </div>
      {/* <Pagination /> */}
    </NavbarSidebarLayout>
  );
};
// Placeholder for campaign data and statistics
const campaigns = [
  {
    id: 1,
    name: 'Spring Promo',
    template: 'Marketing',
    status: 'Completed',
    totalContacts: 150, // Example statistic
    totalSent: 145, // Example statistic
    totalFailed: 5, // Example statistic
  },
  // Additional campaigns...
];

const CampaignsTable: FC = function () {
  return (
    <Table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
      <Table.Head className="bg-gray-100 dark:bg-gray-700">
        {/* <Table.HeadCell>
          <Label htmlFor="select-all-campaigns" className="sr-only">
            Select all
          </Label>
          <Checkbox id="select-all-campaigns" name="select-all-campaigns" />
        </Table.HeadCell> */}
        <Table.HeadCell>Name</Table.HeadCell>
        <Table.HeadCell>Template</Table.HeadCell>
        <Table.HeadCell>Status</Table.HeadCell>
        <Table.HeadCell className="text-center">Total Contacts</Table.HeadCell>
        <Table.HeadCell className="text-center">Total Sent</Table.HeadCell>
        <Table.HeadCell className="text-center">Total Failed</Table.HeadCell>
        {/* <Table.HeadCell>Actions</Table.HeadCell>  */}
      </Table.Head>
      <Table.Body className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
        {campaigns.map((campaign) => (
          <Table.Row key={campaign.id} className="hover:bg-gray-100 dark:hover:bg-gray-700">
            {/* Campaign Row Content */}
            {/* <Table.Cell>Checkbox and other cells</Table.Cell> */}
            <Table.Cell>{campaign.name}</Table.Cell>
            <Table.Cell>{campaign.template}</Table.Cell>
            <Table.Cell>
              <div className="flex items-center">
                {getStatusIndicator(campaign.status)}
                {campaign.status}
              </div>
            </Table.Cell>
            <Table.Cell className="text-center">{campaign.totalContacts}</Table.Cell>
            <Table.Cell className="text-center">{campaign.totalSent}</Table.Cell>
            <Table.Cell className="text-center">{campaign.totalFailed}</Table.Cell>
            {/* <Table.Cell>
              <div className="flex items-center gap-x-3 whitespace-nowrap">
                <EditCampaignModal campaignId={campaign.id} />
              </div>
            </Table.Cell> */}
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  );
};

const getStatusIndicator = (status: string) => {
  switch (status) {
    case 'Active':
      return <div className="mr-2 h-2.5 w-2.5 rounded-full bg-green-400" />;
    case 'Completed':
      return <div className="mr-2 h-2.5 w-2.5 rounded-full bg-blue-400" />;
    case 'Running':
      return <div className="mr-2 h-2.5 w-2.5 rounded-full bg-yellow-400" />;
    case 'Scheduled':
      return <div className="mr-2 h-2.5 w-2.5 rounded-full bg-purple-400" />;
    case 'Draft':
      return <div className="mr-2 h-2.5 w-2.5 rounded-full bg-gray-400" />;
    default:
      return <div className="mr-2 h-2.5 w-2.5 rounded-full bg-red-400" />;
  }
};

export const Pagination: FC = function () {
  return (
    <div className="sticky bottom-0 right-0 w-full items-center border-t border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800 sm:flex sm:justify-between">
      <div className="mb-4 flex items-center sm:mb-0">
        <a
          href="#"
          className="inline-flex cursor-pointer justify-center rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
        >
          <span className="sr-only">Previous page</span>
          <HiChevronLeft className="text-2xl" />
        </a>
        <a
          href="#"
          className="mr-2 inline-flex cursor-pointer justify-center rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
        >
          <span className="sr-only">Next page</span>
          <HiChevronRight className="text-2xl" />
        </a>
        <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
          Showing&nbsp;
          <span className="font-semibold text-gray-900 dark:text-white">
            1-20
          </span>
          &nbsp;of&nbsp;
          <span className="font-semibold text-gray-900 dark:text-white">
            2290
          </span>
        </span>
      </div>
      <div className="flex items-center space-x-3">
        <a
          href="#"
          className="inline-flex flex-1 items-center justify-center rounded-lg bg-primary-700 px-3 py-2 text-center text-sm font-medium text-white hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
        >
          <HiChevronLeft className="mr-1 text-base" />
          Previous
        </a>
        <a
          href="#"
          className="inline-flex flex-1 items-center justify-center rounded-lg bg-primary-700 px-3 py-2 text-center text-sm font-medium text-white hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
        >
          Next
          <HiChevronRight className="ml-1 text-base" />
        </a>
      </div>
    </div>
  );
};

export default CampaignListPage;
