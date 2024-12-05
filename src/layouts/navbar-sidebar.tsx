import classNames from "classnames";
import type { PropsWithChildren } from "react";
import React from "react";
import { Link } from "react-router-dom";
import Sidebar from "../components/sidebar";
import { SidebarProvider, useSidebarContext } from "../context/SidebarContext";

interface NavbarSidebarLayoutProps {
  isFooter?: boolean;
}

const NavbarSidebarLayout: React.FC<PropsWithChildren<NavbarSidebarLayoutProps>> =
  function ({ children, isFooter = true }) {
    return (
      <SidebarProvider>
        {/* <Navbar /> */}
        <div className="flex items-start">
          <Sidebar />
          <MainContent isFooter={isFooter}>{children}</MainContent>
        </div>
      </SidebarProvider>
    );
  };

const MainContent: React.FC<PropsWithChildren<NavbarSidebarLayoutProps>> = function ({
  children,
  isFooter,
}) {
  const { isOpenOnSmallScreens: isSidebarOpen } = useSidebarContext();

  return (
    <main
      className={classNames(
        "flex flex-col justify-between relative w-full h-full bg-gray-50 dark:bg-gray-900 min-h-screen",
        isSidebarOpen ? "lg:ml-16" : "lg:ml-64"
      )}>
      {/* Content Area */}
      <div className="flex-grow">{children}</div>

      {/* Footer */}
      {isFooter && (
        <footer className="mx-4 mt-4">
          <MainContentFooter />
        </footer>
      )}
    </main>
  );
};

const MainContentFooter: React.FC = function () {
  return (
    <>
      <p className="my-2 text-center text-sm text-gray-500 dark:text-gray-300">
        &copy; 2024 All rights reserved by NM Media | NM Media Sdn Bhd
        (1452711-W) |{" "}
        <Link to="/legal/privacy" className="mr-3 mb-3 lg:mb-0" target="_blank">
          Privacy Policy
        </Link>
      </p>
    </>
  );
};

export default NavbarSidebarLayout;
