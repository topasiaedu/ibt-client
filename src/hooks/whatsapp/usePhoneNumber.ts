import { useState, useCallback, useEffect } from 'react';
import * as phoneNumberService from '../../services/phoneNumberService';
import { PhoneNumber } from '../../types/phoneNumberTypes';

export const usePhoneNumbers = () => {
  const [phoneNumbers, setPhoneNumbers] = useState<PhoneNumber[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false); 
  
  const fetchPhoneNumbers = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await phoneNumberService.getPhoneNumbers();
      setPhoneNumbers(data);
    } catch (error) {
      console.error('Failed to fetch phone numbers:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPhoneNumbers();
  }, [fetchPhoneNumbers]);

  return { phoneNumbers, isLoading, fetchPhoneNumbers };
}

