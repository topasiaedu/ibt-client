import { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabaseClient';

/**
 * Custom hook for querying data from a Supabase table.
 * @param table The name of the Supabase table to query from.
 * @returns A tuple containing the data array, loading state, and any error encountered.
 */
export const useSupabaseQuery = <T = any>(table: string): [T[], boolean, any] => {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data: supabaseData, error } = await supabase.from(table as any).select("*");
      setLoading(false);

      if (error) setError(error);
      else setData(supabaseData || []);
    };

    fetchData();
  }, [table]);

  return [data, loading, error];
};
