/* eslint-disable jsx-a11y/anchor-is-valid */
import React from "react";

const ContactProfile: React.FC = function () {
  return (
    <div className="px-4 py-6 xl:sticky xl:mb-0 xl:pb-0">
      <div className="sm:flex sm:space-x-4 xl:block xl:space-x-0">
        <img
          className="mb-2 h-20 w-20 rounded-lg"
          src="../../images/users/jese-leos-2x.png"
          alt="Jese portrait"
        />
        <div>
          <h2 className="text-xl font-bold dark:text-white">Jese Leos</h2>
        </div>
      </div>
      <div className="mb-6 sm:flex xl:block xl:space-y-4">
        <div className="sm:flex-1">
          <address className="text-sm font-normal not-italic text-gray-500 dark:text-gray-400">
            <div className="mt-4">Email address</div>
            <a
              className="text-sm font-medium text-gray-900 dark:text-white"
              href="mailto:webmaster@flowbite.com"
            >
              yourname@example.com
            </a>
            <div className="mt-4 dark:text-gray-400">Phone number</div>
            <div className="text-sm font-medium text-gray-900 dark:text-white">
              +00 123 456 789 / +12 345 678
            </div>
          </address>
        </div>
      </div>
      <h3 className="mb-4 text-base font-bold text-gray-900 dark:text-white">
        Tags
      </h3>
      {/* Generate Tags */}
      <div className="flex flex-wrap gap-2">
        {getTags(["Family", "Friends", "Work", "School"])}
      </div>
    </div>
  );
};

const getTags = (tags: string[]) => {
  return tags.map((tag) => (
    <span key={tag} className="bg-blue-100 text-blue-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300">{tag}</span>

  ));
}
export default ContactProfile;