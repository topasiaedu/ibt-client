import { useState, useEffect, useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../../utils/supabaseClient';

/**
 * Hook to manage user authentication state and actions in a Supabase application.
 * @returns An object with the current user, signIn, and signOut functions.
 */
const useSupabaseAuth = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Retrieve current session and set user state accordingly
    const user = supabase.auth.getUser();
    user.then((data) => setUser(data.data.user));


    // Listen for authentication state changes
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
    });

    // Cleanup listener on component unmount
    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const response = await supabase.auth.signInWithPassword({ email, password });
    setUser(response.data.user);
    return response;
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
  }, []);

  return { user, signIn, signOut };
};

export { useSupabaseAuth }
