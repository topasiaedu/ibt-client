/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useEffect } from "react";
import { useContacts } from "../../../hooks/useContact";
import { Contact } from "../../../types/contactTypes";
import { Button } from "flowbite-react";
import { HiChevronLeft } from "react-icons/hi";
interface ContactProfileProps {
  wa_id: string;
}

const ContactProfile: React.FC<ContactProfileProps> = ({ wa_id }) => {
  const { findContact } = useContacts();
  const [contact, setContact] = React.useState<Contact | null>(null);
  useEffect(() => {
    findContact({
      wa_id: wa_id,
      name: "",
      email: "",
      phone: "",
    } as Contact).then((data) => {
      if (!data) return;
      setContact(data);
    });
  }, [findContact, wa_id]);

  if (!contact) {
    return <div>
      <img alt="" src="/images/illustrations/500.svg" className="lg:max-w-md" />
      <h1 className="mb-3 w-4/5 text-center text-2xl font-bold dark:text-white md:text-5xl">
        Something has gone seriously wrong
      </h1>
      <p className="mb-6 w-4/5 text-center text-lg text-gray-500 dark:text-gray-300">
        It&apos;s always time for a coffee break. We should be back by the time you
        finish your coffee.
      </p>
      <Button href="/">
        <div className="mr-1 flex items-center gap-x-2">
          <HiChevronLeft className="text-xl" /> Go back home
        </div>
      </Button>
    </div>
  }

  return (
    <div className="px-4 py-6 xl:sticky xl:mb-0 xl:pb-0">
      <div className="sm:flex sm:space-x-4 xl:block xl:space-x-0">
        {/* <img
          className="mb-2 h-20 w-20 rounded-lg"
          src="../../images/users/jese-leos-2x.png"
          alt="Jese portrait"
        /> */}
        <div>
          {contact && (
            <h2 className="text-xl font-bold dark:text-white">{contact.name}</h2>
          )}
        </div>
      </div>
      <div className="mb-6 sm:flex xl:block xl:space-y-4">
        <div className="sm:flex-1">
          <address className="text-sm font-normal not-italic text-gray-500 dark:text-gray-400">
            <div className="mt-4 dark:text-gray-400">Phone number</div>
            <div className="text-sm font-medium text-gray-900 dark:text-white">
              {contact?.wa_id}
            </div>
          </address>
        </div>
      </div>
      {/* <h3 className="mb-4 text-base font-bold text-gray-900 dark:text-white">
        Tags
      </h3> */}
      {/* Generate Tags */}
      {/* <div className="flex flex-wrap gap-2">
        {getTags(["Family", "Friends", "Work", "School"])}
      </div> */}
    </div>
  );
};

// const getTags = (tags: string[]) => {
//   return tags.map((tag) => (
//     <span key={tag} className="bg-blue-100 text-blue-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300">{tag}</span>

//   ));
// }
export default ContactProfile;