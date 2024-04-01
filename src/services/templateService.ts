import { Template, TemplateFormData } from "../types/templateTypes";
import { supabase } from "../utils/supabaseClient";

export const getTemplates = async (): Promise<Template[]> => {
  let { data: templates, error } = await supabase
    .from("templates")
    .select("*");

  if (error) throw new Error(error.message);
  return templates as Template[];
};

export const getTemplate = async (template_id: number): Promise<Template> => {
  let { data: template, error } = await supabase
    .from("templates")
    .select("*")
    .match({ template_id })
    .single(); // Use .single() if you're fetching one row to get an object instead of an array back

  if (error) throw new Error(error.message);
  return template as Template;
}

export const createTemplate = async (formData: TemplateFormData): Promise<Template> => {
  const { data, error } = await supabase
    .from("templates")
    .insert([formData])
    .single(); // Use .single() if you're inserting one row to get an object instead of an array back

  if (error) throw new Error(error.message);
  return data;
}

export const updateTemplate = async (template_id: number, formData: TemplateFormData): Promise<Template | null> => {
  const { data, error } = await supabase
    .from("templates")
    .update(formData)
    .match({ template_id });

  if (error) throw new Error(error.message);
  return data as Template | null;
}

export const deleteTemplate = async (template_id: number): Promise<Template | null> => {
  const { data, error } = await supabase
    .from("templates")
    .delete()
    .match({ template_id });

  if (error) throw new Error(error.message);
  return data as Template | null;
};