import React, { createContext, useContext, useState, PropsWithChildren, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import { Database } from '../../database.types';
import { useProjectContext } from './ProjectContext';
import { useAlertContext } from './AlertContext';

export type Message = Database['public']['Tables']['messages']['Row'];
export type Messages = { messages: Message[] };
export type Conversation = {
  contact_id: number;
  messages: Message[];
};
