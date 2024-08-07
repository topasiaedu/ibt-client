import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { supabase } from "../utils/supabaseClient";
import { Database } from "../../database.types";
import { useAuthContext } from "./AuthContext";
import isEqual from "lodash.isequal";

export type Project = Database["public"]["Tables"]["project"]["Row"];
export type Projects = { projects: Project[] };
export type ProjectInsert = Database["public"]["Tables"]["project"]["Insert"];
interface ProjectContextProps {
  projects: Project[];
  addProject: (project: Project) => void;
  updateProject: (project: Project) => void;
  deleteProject: (projectId: number) => void;
  currentProject: Project | null;
  setCurrentProject: (project: Project) => void;
}

const ProjectContext = createContext<ProjectContextProps>(undefined!);

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const storage = window.localStorage.getItem("currentProject");
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(
    storage ? JSON.parse(storage) : null
  );
  const { user } = useAuthContext();

  useEffect(() => {
    const fetchProjects = async () => {
      if (!user) return;

      const { data: projectPermissions, error: projectPermissionsError } =
        await supabase
          .from("project_permission")
          .select("project_id")
          .eq("user_id", user.id);

      if (projectPermissionsError) {
        console.error(
          "Error fetching project permissions:",
          projectPermissionsError
        );
        return;
      }

      const projectIds = projectPermissions!.map(
        (permission) => permission.project_id
      );

      const { data: projects, error } = await supabase
        .from("project")
        .select("*")
        .in("project_id", projectIds);

      if (error) {
        console.error("Error fetching projects:", error);
        return;
      }

      setProjects((prev) => {
        if (isEqual(prev, projects)) {
          return prev;
        }

        return projects!;
      });
      if (!currentProject && projects!.length > 0) {
        setCurrentProject(projects![0]);
      }
    };

    fetchProjects();

    const handleChanges = (payload: any) => {
      if (payload.eventType === "INSERT") {
        setProjects((prev) => [...prev, payload.new]);
      } else if (payload.eventType === "UPDATE") {
        const updatedProjects = projects.map((project) =>
          project.project_id === payload.new.project_id ? payload.new : project
        );

        setProjects((prev) => {
          if (!isEqual(prev, updatedProjects)) {
            return updatedProjects;
          }

          return prev;
        });
      } else if (payload.eventType === "DELETE") {
        setProjects((prev) =>
          prev.filter(
            (project) => project.project_id !== payload.old.project_id
          )
        );
      }
    };

    const subscription = supabase
      .channel("project")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "project" },
        (payload) => {
          handleChanges(payload);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentProject, user]);

  //Save the latest state into localStorage
  useEffect(() => {
    window.localStorage.setItem(
      "currentProject",
      JSON.stringify(currentProject)
    );
  }, [currentProject]);

  const addProject = useCallback(async (project: Project) => {
    const { error } = await supabase.from("project").insert(project).single();

    if (error) {
      console.error("Error adding project:", error);
      return;
    }
  }, []);

  const updateProject = useCallback(async (project: Project) => {
    const { error } = await supabase
      .from("project")
      .update(project)
      .match({ project_id: project.project_id })
      .single();

    if (error) {
      console.error("Error updating project:", error);
      return;
    }
  }, []);

  const deleteProject = useCallback(async (projectId: number) => {
    const { error } = await supabase
      .from("project")
      .delete()
      .match({ project_id: projectId });

    if (error) {
      console.error("Error deleting project:", error);
      return;
    }
  }, []);

  const contextValue = useMemo(
    () => ({
      projects,
      addProject,
      updateProject,
      deleteProject,
      currentProject,
      setCurrentProject,
    }),
    [projects, currentProject, addProject, updateProject, deleteProject]
  );

  return (
    <ProjectContext.Provider value={contextValue}>
      {children}
    </ProjectContext.Provider>
  );
}
// Add the whyDidYouRender property after defining the component
(ProjectProvider as any).whyDidYouRender = true; // Add this line
export function useProjectContext() {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error("useProjectContext must be used within a ProjectProvider");
  }

  return context;
}
