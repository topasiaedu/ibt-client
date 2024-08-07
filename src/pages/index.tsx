/* eslint-disable jsx-a11y/anchor-is-valid */
import NavbarSidebarLayout from "../layouts/navbar-sidebar";
import React from "react";
import PemniVipLogs from "./dashboard/pemniVipLogs";
import PhoneNumberStatus from "./dashboard/phoneNumberStatus";
import { useProjectContext } from "../context/ProjectContext";
import UserStatisticsCard from "../components/Dashboard/EstimatedCost";

const DashboardPage: React.FC = () => {
  const { currentProject } = useProjectContext();

  return (
    <NavbarSidebarLayout>
      <div className="px-4 pt-6">
        {/* <SalesThisWeek /> */}
        <div className="my-4 grid grid-cols-1 xl:gap-4 2xl:grid-cols-3">
          {/* <SessionsByCountry /> */}
          <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-1">
            {/* <LatestCustomers /> */}
            {/* <AcquisitionOverview /> */}
          </div>
        </div>
        <div className="mt-4 grid w-full grid-cols-1 gap-4 md:grid-cols-1 xl:grid-cols-1">
          {currentProject?.project_id === 2 && <PemniVipLogs />}
        </div>
        <div className="mt-4 grid w-full grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          <PhoneNumberStatus />
          <div className="col-span-2">
            <UserStatisticsCard />
          </div>
        </div>


        {/* <Transactions /> */}
      </div>
    </NavbarSidebarLayout>
  );
};

export default DashboardPage;
