/* eslint-disable jsx-a11y/anchor-is-valid */
import { Button } from "flowbite-react";
import React, { useEffect } from "react";
import { HiChevronLeft } from "react-icons/hi";
import { Contact } from "../../../context/ContactContext";
import { useMessagesContext } from "../../../context/MessagesContext";
import { Conversation } from "../../../context/ConversationContext";
import { useProjectContext } from "../../../context/ProjectContext";

interface ContactProfileProps {
  conversation: Conversation;
  contact: Contact;
  close_at: string | null;
}

const ContactProfile: React.FC<ContactProfileProps> = ({
  conversation,
  contact,
  close_at,
}) => {
  const [close_at_date_time, setCloseAtDateTime] = React.useState<
    string | null
  >(null);
  const { sendReEngagementMessage } = useMessagesContext();
  const { currentProject } = useProjectContext();

  useEffect(() => {
    if (close_at) {
      const date = new Date(close_at);
      // Add 8 hours to show in Asia/Kuala_Lumpur timezone (GMT+8)
      date.setHours(date.getHours() + 8);
      setCloseAtDateTime(date.toLocaleString());
    }
  }, [close_at]);

  if (!contact) {
    return (
      <div>
        <img
          alt=""
          src="/images/illustrations/500.svg"
          className="lg:max-w-md"
        />
        <h1 className="mb-3 w-4/5 text-center text-2xl font-bold dark:text-white md:text-5xl">
          Something has gone seriously wrong
        </h1>
        <p className="mb-6 w-4/5 text-center text-lg text-gray-500 dark:text-gray-300">
          It&apos;s always time for a coffee break. We should be back by the
          time you finish your coffee.
        </p>
        <Button href="/">
          <div className="mr-1 flex items-center gap-x-2">
            <HiChevronLeft className="text-xl" /> Go back home
          </div>
        </Button>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 xl:sticky xl:mb-0 xl:pb-0">
      <div className="sm:flex sm:space-x-4 xl:block xl:space-x-0">
        {/* <img
          className="mb-2 h-20 w-20 rounded-lg"
          src="../../images/users/jese-leos-2x.png"
          alt="Jese portrait"kz
        /> */}
        <div>
          {contact && (
            <h2 className="text-xl font-bold dark:text-white">
              {contact.name}
            </h2>
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
          {close_at && (
            <address className="text-sm font-normal not-italic text-gray-500 dark:text-gray-400">
              <div className="mt-4 dark:text-gray-400">Window closes at</div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                {close_at_date_time}
              </div>
            </address>
          )}
        </div>
      </div>
      {currentProject?.name === "Pemni" && (
        <div>
          <Button onClick={() => sendReEngagementMessage(conversation)}>
            <div className="mr-1 flex items-center gap-x-2">
              <HiChevronLeft className="text-xl" /> Send re-engagement message
            </div>
          </Button>
        </div>
      )}
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
