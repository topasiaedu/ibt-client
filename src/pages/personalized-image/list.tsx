import React, { useEffect, useState } from "react";
import { Breadcrumb, Button, Label, TextInput } from "flowbite-react";
import { HiHome, HiOutlinePencilAlt, HiPlus } from "react-icons/hi";
import NavbarSidebarLayout from "../../layouts/navbar-sidebar";
import LoadingPage from "../pages/loading";
import { usePersonalizedImageContext } from "../../context/PersonalizedImageContext";
import * as fabric from "fabric";

const PersonalizedImageListPage: React.FC = function () {
  const [searchValue, setSearchValue] = useState("");
  const { personalizedImages, loading } = usePersonalizedImageContext();

  useEffect(() => {}, [personalizedImages]);

  if (loading || !personalizedImages || !personalizedImages.length) {
    console.log("loading", loading);
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
              <Breadcrumb.Item>All Personalized Images</Breadcrumb.Item>
            </Breadcrumb>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white sm:text-2xl">
              All Personalized Images
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
              <Button
                color="primary"
                onClick={() =>
                  (window.location.href = "/whatsapp/personalizedImage/editor")
                }>
                <div className="flex items-center gap-x-3">
                  <HiPlus className="text-xl" />
                  Add Personalized Image
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
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {personalizedImages.map((personalizedImage, index) => (
                  <div
                    key={personalizedImage.id}
                    onClick={() => window.location.href = `/personalized-image/editor/${personalizedImage.id}`}
                    className="flex flex-col rounded-lg shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700 cursor-pointer">
                    <div className="flex-shrink-0">
                      {personalizedImage.media_url && (
                        <img
                          className="h-48 w-full object-cover"
                          src={personalizedImage.media_url}
                          alt={personalizedImage.name}
                        />
                      )}
                    </div>
                    <div className="flex-1 bg-white p-6 flex flex-col justify-between dark:bg-gray-800">
                      <div className="flex-1">
                        <p className="text-sm font-medium dark:text-white text-gray-900">
                          {personalizedImage.name}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </NavbarSidebarLayout>
  );
};

export default PersonalizedImageListPage;
