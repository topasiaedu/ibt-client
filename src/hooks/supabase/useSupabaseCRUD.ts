import { useState, useCallback } from 'react';
import { supabase } from '../../utils/supabaseClient';

/**
 * Provides CRUD operations for a specific Supabase table.
 * @param table The name of the table to perform operations on.
 * @returns Object containing functions for creating, updating, and deleting records, along with any error encountered.
 */
export const useSupabaseCRUD = <T = any>(table: string) => {
  const [error, setError] = useState<any>(null);

  const createRecord = useCallback(async (record: T) => {
    const { error } = await supabase.from(table as any).insert([record]);
    setError(error);
  }, [table]);

  const updateRecord = useCallback(async (id: string, updates: Partial<T>) => {
    const { error } = await supabase.from(table as any).update(updates).match({ id });
    setError(error);
  }, [table]);

  const deleteRecord = useCallback(async (id: string) => {
    const { error } = await supabase.from(table as any).delete().match({ id });
    setError(error);
  }, [table]);

  return { createRecord, updateRecord, deleteRecord, error };
};
