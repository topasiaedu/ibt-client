import { useState, useEffect, useCallback } from 'react';
import * as projectService from '../services/projectServices';
import { Database } from '../../database.types';

type Project = Database['public']['Tables']['project']['Row'];

export const useProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchProjects = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await projectService.getProjects();
      setProjects(data);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchProject = async (project_id: string) => {
    setIsLoading(true);
    try {
      const data = await projectService.getProject(project_id);
      return data;
    } catch (error) {
      console.error('Failed to fetch project:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addProject = async (formData: Project) => {
    console.log("Form Data: ", formData);
    try {
      const newProject = await projectService.createProject(formData);
      setProjects(prev => [...prev, newProject]);
      return newProject;
    } catch (error) {
      console.error('Failed to add project:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProject = async (project_id: number, formData: Project) => {
    setIsLoading(true);
    try {
      const updatedProject = await projectService.updateProject(project_id, formData);
      setProjects(prev => prev.map(project => project.project_id === project_id ? updatedProject : project).filter(Boolean) as Project[]);
    } catch (error) {
      console.error('Failed to update project:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteProject = async (project_id: number) => {
    setIsLoading(true);
    try {
      const deletedProject = await projectService.deleteProject(project_id);
      setProjects(prev => prev.filter(project => project.project_id !== project_id));
      return deletedProject;
    } catch (error) {
      console.error('Failed to delete project:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return {
    projects,
    isLoading,
    fetchProjects,
    fetchProject,
    addProject,
    updateProject,
    deleteProject,
  };
};