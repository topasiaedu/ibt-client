/* eslint-disable jsx-a11y/anchor-is-valid */
import classNames from "classnames";
import { DarkThemeToggle, Sidebar, Tooltip } from "flowbite-react";
import React, { useEffect, useState } from "react";
import { FaListUl } from "react-icons/fa6";
import {
  HiAdjustments,
  HiChartPie,
  HiCog,
  HiInboxIn,
  HiInformationCircle,
  HiTemplate,
} from "react-icons/hi";
import { IoMdContact } from "react-icons/io";
import { TbBrandCampaignmonitor } from "react-icons/tb";
import { useSidebarContext } from "../context/SidebarContext";
import isSmallScreen from "../helpers/is-small-screen";
import ProjectDropdown from "./ProjectDropdown";
import { GoWorkflow } from "react-icons/go";
import { FaImage } from "react-icons/fa";
import { useAuthContext } from "../context/AuthContext";
import { FaConnectdevelop } from "react-icons/fa";
import { BsTelephoneFill } from "react-icons/bs";

const ExampleSidebar: React.FC = function () {
  const { isOpenOnSmallScreens: isSidebarOpenOnSmallScreens } =
    useSidebarContext();
  const [currentPage, setCurrentPage] = useState("");
  const { user } = useAuthContext();
  // const [isWhatsAppOpen, setWhatsAppOpen] = useState(true);

  useEffect(() => {
    const newPage = window.location.pathname;

    setCurrentPage(newPage);
    // setWhatsAppOpen(newPage.includes("/whatsapp/"));
  }, [setCurrentPage]);

  return (
    <div
      className={classNames("lg:!block", {
        hidden: !isSidebarOpenOnSmallScreens,
      })}>
      <Sidebar
        aria-label="Sidebar with multi-level dropdown example"
        className="pt-2"
        collapsed={isSidebarOpenOnSmallScreens && !isSmallScreen()}>
        <Sidebar.Logo href="/" img="/images/logo.svg" imgAlt="LuminoChat logo">
          <div className="flex items-center justify-between gap-2">
            <span className="bg-gradient-to-r from-[#CBB26B] to-[#CBB26B] bg-clip-text text-transparent font-bold text-xl">
              LuminoChat
            </span>
            <DarkThemeToggle />
          </div>
        </Sidebar.Logo>

        <div>
          <ProjectDropdown
            collapsed={isSidebarOpenOnSmallScreens && !isSmallScreen()}
          />

          <Sidebar.Items>
            <Sidebar.ItemGroup>
              <Sidebar.Item
                href="/"
                icon={HiChartPie}
                className={
                  "/" === currentPage ? "bg-gray-100 dark:bg-gray-700" : ""
                }>
                Dashboard
              </Sidebar.Item>
              {/* Contacts */}
              <Sidebar.Item
                href="/contacts"
                icon={IoMdContact}
                className={
                  "/contacts" === currentPage
                    ? "bg-gray-100 dark:bg-gray-700"
                    : ""
                }>
                Contacts
              </Sidebar.Item>
              {/* <Sidebar.Collapse
                  icon={IoLogoWhatsapp}
                  label="Whatsapp"
                  open={isWhatsAppOpen}
                > */}
              <Sidebar.Item
                href="/whatsapp/conversation"
                icon={HiInboxIn}
                className={
                  "/whatsapp/conversation" === currentPage
                    ? "bg-gray-100 dark:bg-gray-700"
                    : ""
                }>
                Conversation
              </Sidebar.Item>
              <Sidebar.Item
                href="/whatsapp/campaigns"
                icon={TbBrandCampaignmonitor}
                className={
                  "/whatsapp/campaigns" === currentPage
                    ? "bg-gray-100 dark:bg-gray-700"
                    : ""
                }>
                Campaigns
              </Sidebar.Item>
              {/* Template */}
              <Sidebar.Item
                href="/whatsapp/templates"
                icon={HiTemplate}
                className={
                  "/whatsapp/templates" === currentPage
                    ? "bg-gray-100 dark:bg-gray-700"
                    : ""
                }>
                Templates
              </Sidebar.Item>
              {/* Contact List */}
              <Sidebar.Item
                href="/whatsapp/contact-list"
                icon={FaListUl}
                className={
                  "/whatsapp/contact-list" === currentPage
                    ? "bg-gray-100 dark:bg-gray-700"
                    : ""
                }>
                Contact List
              </Sidebar.Item>

              {/* Workflow */}
              <Sidebar.Item
                href="/whatsapp/workflow"
                icon={GoWorkflow}
                className={
                  "/whatsapp/workflow" === currentPage
                    ? "bg-gray-100 dark:bg-gray-700"
                    : ""
                }>
                Workflow
              </Sidebar.Item>

              {/* Personalized Image */}
              <Sidebar.Item
                href="/personalized-image"
                icon={FaImage}
                className={
                  "/personalized-image" === currentPage
                    ? "bg-gray-100 dark:bg-gray-700"
                    : ""
                }>
                Personalized Image
              </Sidebar.Item>

                  {/* Phone Numbers */}
                  <Sidebar.Item
                  href="/phone-numbers"
                  icon={BsTelephoneFill}
                  className={
                    "/phone-numbers" === currentPage
                      ? "bg-gray-100 dark:bg-gray-700"
                      : ""
                  }>
                  Phone Numbers
                </Sidebar.Item>

                {/* If user.id === 7300284e-52cc-4592-b48f-3f517e6414ad show this dev tab */}
                {user?.id === "7300284e-52cc-4592-b48f-3f517e6414ad" && (
                  <Sidebar.Item
                    href="/dev"
                    icon={FaConnectdevelop}
                    className={
                      "/dev" === currentPage
                        ? "bg-gray-100 dark:bg-gray-700"
                        : ""
                    }>
                    Stanley&apos;s Tools
                  </Sidebar.Item>
                )}
                {/* </Sidebar.Collapse> */}
              </Sidebar.ItemGroup>
              <Sidebar.ItemGroup>
                <Sidebar.Item
                  href="/dev"
                  icon={FaConnectdevelop}
                  className={
                    "/dev" === currentPage ? "bg-gray-100 dark:bg-gray-700" : ""
                  }>
                  Stanley&apos;s Tools
                </Sidebar.Item>
              )}
              {/* </Sidebar.Collapse> */}
            </Sidebar.ItemGroup>
            <Sidebar.ItemGroup>
              <Sidebar.Item
                href="https://api.whatsapp.com/send/?phone=60139968817&text&type=phone_number&app_absent=0"
                target="_blank"
                icon={HiInformationCircle}>
                Help
              </Sidebar.Item>
            </Sidebar.ItemGroup>
          </Sidebar.Items>
        </div>
      </Sidebar>
    </div>
  );
};

// const BottomMenu: React.FC = function () {
//   return (
//     <div className="flex items-center justify-center gap-x-5">
//       {/* <button className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-700">
//         <span className="sr-only">Tweaks</span>
//         <HiAdjustments className="text-2xl text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white " />
//       </button>

//       <div>
//         <Tooltip content="Settings page">
//           <a
//             href="/users/settings"
//             className="inline-flex cursor-pointer justify-center rounded p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-700 dark:hover:text-white">
//             <span className="sr-only">Settings page</span>
//             <HiCog className="text-2xl text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white" />
//           </a>
//         </Tooltip>
//       </div> */}
//       <DarkThemeToggle />
//     </div>
//   );
// };

export default ExampleSidebar;
