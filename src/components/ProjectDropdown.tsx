import React, { useState } from "react";
import { useProjectContext } from "../context/ProjectContext";
import { GrRadialSelected } from "react-icons/gr";

const ProjectDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { projects, currentProject, setCurrentProject } = useProjectContext();

  const toggleDropdown = () => setIsOpen(!isOpen);

  return (
    <div className="mb-3" style={{ position: "relative" }}>
      <button
        id="dropdownProjectNameButton"
        onClick={toggleDropdown}
        className="flex justify-between items-center p-4 w-full rounded-lg hover:bg-gray-100 dark:hover:bg-gray-70"
        type="button">
        <span className="sr-only">Open project menu</span>
        <div className="flex items-center">
          <div className="text-left">
            <div className="font-semibold leading-none text-gray-900 dark:text-white mb-0.5">
              {currentProject ? currentProject.name : "Select a project"}
            </div>
          </div>
        </div>
        <svg
          aria-hidden="true"
          className="w-5 h-5 text-gray-500 dark:text-gray-400"
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg">
          <path
            fillRule="evenodd"
            d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
            clipRule="evenodd"></path>
        </svg>
      </button>
      {/* Dropdown menu */}
      <div
        id="dropdownProjectName"
        className={`${
          isOpen ? "" : "hidden"
        } absolute z-50 w-60 bg-white rounded divide-y divide-gray-100 shadow dark:bg-gray-700 dark:divide-gray-600`}
        data-popper-placement="bottom">
        {/* Map Projects */}
        {projects.map((project) => (
          <button
            key={project.project_id}
            onClick={() => {
              setCurrentProject(project);
              setIsOpen(false);
            }}
            className="flex items-center justify-between w-full px-4 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700"
            type="button">
            <span>{project.name}</span>
            {project.project_id === currentProject?.project_id && (
              <GrRadialSelected className="text-gray-500 dark:text-gray-400" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ProjectDropdown;
