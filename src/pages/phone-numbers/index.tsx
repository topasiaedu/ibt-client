import React, { useEffect } from "react";
import NavbarSidebarLayout from "../../layouts/navbar-sidebar";
import { useProjectContext } from "../../context/ProjectContext";
import {
  PhoneNumbers,
  usePhoneNumberContext,
} from "../../context/PhoneNumberContext";
import {
  Badge,
  Breadcrumb,
  Button,
  Label,
  Table,
  TextInput,
} from "flowbite-react";
import { HiHome } from "react-icons/hi";
import { FaFacebook } from "react-icons/fa";

const PhoneNumbersPage: React.FC = function () {
  const { currentProject } = useProjectContext();
  const { phoneNumbers } = usePhoneNumberContext();
  const [searchValue, setSearchValue] = React.useState("");

  useEffect(() => {
    // Load the Facebook SDK script asynchronously
    const loadFacebookSDK = () => {
      if (document.getElementById("facebook-jssdk")) return;

      const js = document.createElement("script");
      js.id = "facebook-jssdk";
      js.src = "https://connect.facebook.net/en_US/sdk.js";
      js.onload = initializeFacebookSDK;
      document.body.appendChild(js);
    };

    // Initialize the Facebook SDK
    const initializeFacebookSDK = () => {
      window.fbAsyncInit = function () {
        window.FB.init({
          appId: "421461570288196", // Replace with your actual Facebook App ID
          cookie: true,
          xfbml: true,
          version: "v21.0", // Graph API version
        });
      };
    };

    loadFacebookSDK();
  }, []);

  // Function to launch WhatsApp signup with Facebook login
  const launchWhatsAppSignup = () => {
    // Conversion tracking code
    if (window.fbq) {
      window.fbq("trackCustom", "WhatsAppOnboardingStart", {
        appId: "421461570288196",
        feature: "whatsapp_embedded_signup",
      });
    }

    // Launch Facebook login
    window.FB.login(
      function (response: any) {
        if (response.authResponse) {
          const code = response.authResponse.code;
          // You can send this code to your backend for further processing
          console.log("Code: ", code);
          console.log(response.authResponse);
        } else {
          console.log("User cancelled login or did not fully authorize.");
        }
      },
      {
        config_id: "<CONFIG_ID>", // Replace with your configuration ID
        response_type: "code", // must be 'code' for System User access token
        override_default_response_type: true,
        extras: {
          setup: {
            // Prefilled data can go here
          },
        },
      }
    );
  };

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
              <Breadcrumb.Item>All PhoneNumber</Breadcrumb.Item>
            </Breadcrumb>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white sm:text-2xl">
              All PhoneNumbers
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
                    placeholder="Search for PhoneNumbers"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                  />
                </div>
              </form>
            </div>

            <div className="ml-auto flex items-center space-x-2 sm:space-x-3">
              {/* <AddPhoneNumberModal /> */}
              <button
                onClick={launchWhatsAppSignup}
                className="bg-blue-600 hover:bg-blue-700 border-0 rounded text-white cursor-pointer font-sans font-bold h-10 px-6">
                <FaFacebook className="inline-block mr-2" />
                <span>Launch WhatsApp Signup</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col p-4 ">
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full align-middle">
            <div className="overflow-hidden shadow">
              <PhoneNumbersTable
                phone_numbers={phoneNumbers
                  .filter(
                    (phoneNumber) =>
                      phoneNumber.project_id === currentProject?.project_id
                  )
                  .filter(
                    (phoneNumber) =>
                      phoneNumber.name?.includes(searchValue) ||
                      phoneNumber.number?.includes(searchValue)
                  )
                  .sort((a, b) => {
                    if (a.name && b.name) {
                      if (a.name < b.name) return -1;
                      if (a.name > b.name) return 1;
                    }
                    return 0;
                  })}
              />
            </div>
          </div>
        </div>
      </div>
    </NavbarSidebarLayout>
  );
};

const PhoneNumbersTable: React.FC<PhoneNumbers> = function ({ phone_numbers }) {
  const { deletePhoneNumber } = usePhoneNumberContext();

  return (
    <Table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
      <Table.Head className="bg-gray-100 dark:bg-gray-700">
        <Table.HeadCell>Name</Table.HeadCell>
        <Table.HeadCell>Phone Number</Table.HeadCell>
        <Table.HeadCell>Quality Rating</Table.HeadCell>
        <Table.HeadCell>Actions</Table.HeadCell>
      </Table.Head>
      <Table.Body className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
        {phone_numbers.map((phoneNumber) => (
          <Table.Row
            key={phoneNumber.phone_number_id}
            className="hover:bg-gray-100 dark:hover:bg-gray-700">
            <Table.Cell>{phoneNumber.name}</Table.Cell>
            <Table.Cell>{phoneNumber.number}</Table.Cell>
            <Table.Cell>
              <Badge
                color={generateBadgeColor(phoneNumber.quality_rating)}
                className="w-fit">
                {phoneNumber.quality_rating}
              </Badge>
            </Table.Cell>

            <Table.Cell>
              <Button
                onClick={() => deletePhoneNumber(phoneNumber.phone_number_id)}
                color="red">
                Delete
              </Button>
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  );
};

const generateBadgeColor = function (qualityRating: string | null) {
  if (!qualityRating) {
    return "info";
  }
  // LOW | MEDIUM | HEALTHY
  switch (qualityRating) {
    case "LOW":
      return "red";
    case "MEDIUM":
      return "yellow";
    case "HEALTHY":
      return "green";
    default:
      return qualityRating.toLowerCase();
  }
};
export default PhoneNumbersPage;
