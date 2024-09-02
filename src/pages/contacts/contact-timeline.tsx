/* eslint-disable jsx-a11y/anchor-is-valid */
import type { FC } from "react";
import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { Contact, useContactContext } from "../../context/ContactContext";
import {
  ContactEvent,
  useContactEventContext,
} from "../../context/ContactEventContext";
import NavbarSidebarLayout from "../../layouts/navbar-sidebar";
import LoadingPage from "../pages/loading";
import { Badge, Timeline } from "flowbite-react";

const ContactEventPage: FC = function () {
  const { contacts, searchResults } = useContactContext();
  const { contactId } = useParams();
  const { fetchContactEventsByContactId } = useContactEventContext();
  const [contactEvents, setContactEvents] = React.useState<ContactEvent[]>([]);
  const [contact, setContact] = React.useState<Contact | undefined>();

  useEffect(() => {
    if (!contactId) return;
    const tempContact: Contact | undefined =
      searchResults.find(
        (contact) => contact.contact_id === parseInt(contactId)
      ) ||
      contacts.find((contact) => contact.contact_id === parseInt(contactId));

    setContact(tempContact);
    fetchContactEventsByContactId(parseInt(contactId)).then((contactEvents) =>
      setContactEvents(contactEvents)
    );
  }, [contactId, contacts, fetchContactEventsByContactId, searchResults]);

  if (!contacts || !contactId) {
    return <LoadingPage />;
  }

  return (
    <NavbarSidebarLayout>
      <div className="relative grid grid-cols-1 overflow-y-hidden xl:h-[calc(100vh-7rem)] xl:grid-cols-4 xl:gap-4">
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
            </div>
          </div>
        </div>

        <div className="col-span-3 mt-4 overflow-y-auto hide-scrollbar">
          <Timeline>
            {contactEvents.map((contactEvent) => (
              <Timeline.Item key={contactEvent.id}>
                <Timeline.Point />
                <Timeline.Content>
                  <Timeline.Time>
                    {new Date(contactEvent.created_at).toLocaleString()}
                  </Timeline.Time>
                  <Timeline.Title className="flex items-center">
                    {contactEvent.type}
                    {contactEvent.tag && (
                      <Badge className="ms-2 w-fit">{contactEvent.tag}</Badge>
                    )}
                    {contactEvent.tag_2 && (
                      <Badge className="ms-2 w-fit">{contactEvent.tag_2}</Badge>
                    )}
                  </Timeline.Title>
                  <Timeline.Body>{contactEvent.description}</Timeline.Body>
                </Timeline.Content>
              </Timeline.Item>
            ))}
          </Timeline>
        </div>
      </div>
    </NavbarSidebarLayout>
  );
};

// const getTags = (tags: string[]) => {
//   return tags.map((tag) => (
//     <span key={tag} className="bg-blue-100 text-blue-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300">{tag}</span>

//   ));
// }

export default ContactEventPage;
