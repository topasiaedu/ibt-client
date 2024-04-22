import { supabase } from '../utils/supabaseClient';
import { Database } from '../../database.types';

type Project = Database['public']['Tables']['project']['Row'];

export const getProjects = async (): Promise<Project[]> => {
  let { data: projects, error } = await supabase
    .from('project')
    .select('*');

  console.log(projects);
  if (error) throw new Error(error.message);
  return projects as Project[];
}

export const getProject = async (project_id: string): Promise<Project> => {
  let { data: project, error } = await supabase
    .from('project')
    .select('*')
    .match({ project_id })
    .single(); // Use .single() if you're fetching one row to get an object instead of an array back

  if (error) throw new Error(error.message);
  return project as Project;
}

export const createProject = async (formData: Project): Promise<Project> => {
  const { data, error } = await supabase
    .from('project')
    .insert([formData])
    .single(); // Use .single() if you're inserting one row to get an object instead of an array back

  if (error) throw new Error(error.message);
  console.log(data);
  return data;
};

export const updateProject = async (project_id: number, formData: Project): Promise<Project | null> => {
  const { data, error } = await supabase
    .from('project')
    .update(formData)
    .match({ project_id });

  if (error) throw new Error(error.message);
  return data as Project | null;
};

export const deleteProject = async (project_id: number): Promise<Project | null> => {
  const { data, error } = await supabase
    .from('project')
    .delete()
    .match({ project_id });

  if (error) throw new Error(error.message);
  return data as Project | null;
};
