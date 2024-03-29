import { ContactList } from "../types/contactListTypes";
import { supabase } from "../utils/supabaseClient";

export const getContactLists = async (): Promise<ContactList[]> => {
  let { data: contactLists, error } = await supabase
    .from("contact_lists")
    .select("*");

  if (error) throw new Error(error.message);
  return contactLists as ContactList[];
};

export const getContactList = async (id: number): Promise<ContactList> => {
  let { data: contactList, error } = await supabase
    .from("contact_lists")
    .select("*")
    .match({ id })
    .single(); // Use .single() if you're fetching one row to get an object instead of an array back

  if (error) throw new Error(error.message);
  return contactList as ContactList;
}

export const createContactList = async (formData: ContactList): Promise<ContactList> => {
  const { data, error } = await supabase
    .from("contact_lists")
    .insert([formData])
    .single(); // Use .single() if you're inserting one row to get an object instead of an array back

  if (error) throw new Error(error.message);
  return data;
}

export const updateContactList = async (id: number, formData: ContactList): Promise<ContactList | null> => {
  const { data, error } = await supabase
    .from("contact_lists")
    .update(formData)
    .match({ id });

  if (error) throw new Error(error.message);
  return data as ContactList | null;
}

export const deleteContactList = async (id: number): Promise<ContactList | null> => {
  const { data, error } = await supabase
    .from("contact_lists")
    .delete()
    .match({ id });

  if (error) throw new Error(error.message);
  return data as ContactList | null;
};