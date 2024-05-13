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
import AddCampaignModal from "./add-campaign-modal";
import { Campaigns, useCampaignContext } from "../../../context/CampaignContext";
import { useContactListContext } from "../../../context/ContactListContext";
import { useTemplateContext } from "../../../context/TemplateContext";
import LoadingPage from "../../pages/loading";

const CampaignListPage: React.FC = function () {
  const { campaigns, loading } = useCampaignContext();
  const [searchValue, setSearchValue] = React.useState("");
  const resultingCampaigns: Campaigns = {
    campaigns: campaigns.filter((campaign) =>
      campaign.name.toLowerCase().includes(searchValue.toLowerCase())
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
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                  />
                </div>
              </form>

            </div>
            <div className="ml-auto flex items-center space-x-2 sm:space-x-3">
              <AddCampaignModal />
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col p-4 ">
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full align-middle">
            <div className="overflow-hidden shadow">
              <CampaignsTable campaigns={resultingCampaigns.campaigns} />
            </div>
          </div>
        </div>
      </div>
      {/* <Pagination /> */}
    </NavbarSidebarLayout>
  );
};

const CampaignsTable: React.FC<Campaigns> = function ({ campaigns }) {
  const { templates } = useTemplateContext();
  const { contactLists } = useContactListContext();

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
        <Table.HeadCell>Scheduled Time</Table.HeadCell>
        <Table.HeadCell>Status</Table.HeadCell>
        <Table.HeadCell className="text-center">Total Contacts</Table.HeadCell>
        <Table.HeadCell className="text-center">Total Read</Table.HeadCell>
        <Table.HeadCell className="text-center">Total Sent</Table.HeadCell>
        <Table.HeadCell className="text-center">Total Failed</Table.HeadCell>
        {/* <Table.HeadCell>Actions</Table.HeadCell>  */}
      </Table.Head>
      <Table.Body className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
        {campaigns.map((campaign) => (
          <Table.Row key={campaign.campaign_id} className="hover:bg-gray-100 dark:hover:bg-gray-700">
            <Table.Cell>{campaign.name}</Table.Cell>
            <Table.Cell>{templates.find(template => template.template_id === campaign.template_id)?.name}</Table.Cell>
            <Table.Cell>{new Date(campaign.post_time).toLocaleString()}</Table.Cell>
            <Table.Cell>
              <div className="flex items-center gap-x-3">
                {getStatusIndicator(campaign.status)}
                <span>{campaign.status}</span>
              </div>
            </Table.Cell>
            <Table.Cell className="text-center">{contactLists.find(contactList => contactList.contact_list_id === campaign.contact_list_id)?.contact_list_members.length}</Table.Cell>
            <Table.Cell className="text-center">{campaign.read_count}</Table.Cell>
            <Table.Cell className="text-center">{campaign.sent}</Table.Cell>
            <Table.Cell className="text-center">{campaign.failed}</Table.Cell>
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

const getStatusIndicator = (status: string | null) => {
  switch (status) {
    case 'RUNNING':
      return <div className="mr-2 h-2.5 w-2.5 rounded-full bg-green-400" />;
    case 'COMPLETED':
      return <div className="mr-2 h-2.5 w-2.5 rounded-full bg-blue-400" />;
    case 'PENDING':
      return <div className="mr-2 h-2.5 w-2.5 rounded-full bg-yellow-400" />;
    case 'SCHEDULED':
      return <div className="mr-2 h-2.5 w-2.5 rounded-full bg-purple-400" />;
    case 'DRAFT':
      return <div className="mr-2 h-2.5 w-2.5 rounded-full bg-gray-400" />;
    default:
      return <div className="mr-2 h-2.5 w-2.5 rounded-full bg-red-400" />;
  }
};

export default CampaignListPage;
