import { useState, useEffect, useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../../utils/supabaseClient';

const useSupabaseAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true); // Added loading state

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error) {
        console.error('Error getting user:', error);
      }

      setUser(user);
      setLoading(false); // Update loading state after user is set
    };

    fetchUser();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      setLoading(false); // Ensure to set loading to false here as well
    });

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    setLoading(true); // Consider setting loading to true to indicate starting the sign-in process
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      console.error('Error during sign in:', error);
      setLoading(false); // Ensure to set loading to false in case of an error
      return { error };
    }
    setUser(data.user);
    setLoading(false);
    return { user: data.user };
  }, []);

    const signOut = useCallback(async () => {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error during sign out:', error);
        setLoading(false);
        return { error };
      }
      setUser(null);
      setLoading(false);
    }, []);

    return { user, signIn, signOut, loading };
  } 

  export default useSupabaseAuth;