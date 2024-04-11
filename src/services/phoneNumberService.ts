import { supabase } from "../utils/supabaseClient";
import { PhoneNumber } from "../types/phoneNumberTypes";

export const getPhoneNumbers = async (): Promise<PhoneNumber[]> => {
  let { data: phoneNumbers, error } = await supabase
    .from('phone_numbers')
    .select(`
      *,
      whatsapp_business_accounts (
        waba_id,
        name,
        account_id
      )
    `)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);

  return phoneNumbers as PhoneNumber[];
};