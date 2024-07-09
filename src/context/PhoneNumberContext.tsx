import React, {
  createContext,
  useContext,
  useState,
  PropsWithChildren,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { supabase } from "../utils/supabaseClient";
import { Database } from "../../database.types";
import { useAlertContext } from "./AlertContext";
import isEqual from "lodash.isequal";

export type PhoneNumber = Database["public"]["Tables"]["phone_numbers"]["Row"];
export type PhoneNumbers = { phone_numbers: PhoneNumber[] };
export type PhoneNumberInsert =
  Database["public"]["Tables"]["phone_numbers"]["Insert"];

interface PhoneNumberContextType {
  phoneNumbers: PhoneNumber[];
  addPhoneNumber: (phoneNumber: PhoneNumber) => void;
  updatePhoneNumber: (phoneNumber: PhoneNumber) => void;
  deletePhoneNumber: (phoneNumberId: number) => void;
  loading: boolean;
}

const PhoneNumberContext = createContext<PhoneNumberContextType>(undefined!);

export const PhoneNumberProvider: React.FC<PropsWithChildren<{}>> = ({
  children,
}) => {
  const [phoneNumbers, setPhoneNumbers] = useState<PhoneNumber[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const { showAlert } = useAlertContext();

  useEffect(() => {
    setLoading(true);
    const fetchPhoneNumbers = async () => {
      const { data: phoneNumbers, error } = await supabase
        .from("phone_numbers")
        .select("*")
        .order("phone_number_id", { ascending: false });

      if (error) {
        console.error("Error fetching phone numbers:", error);
        showAlert("Error fetching phone numbers", "error");
        return;
      }

      setPhoneNumbers((prevPhoneNumbers) => {
        if (isEqual(prevPhoneNumbers, phoneNumbers)) {
          return prevPhoneNumbers;
        }
        return phoneNumbers;
      });
    };

    fetchPhoneNumbers();

    const handleChanges = (payload: any) => {
      if (payload.eventType === "INSERT") {
        setPhoneNumbers((prev) => [payload.new, ...prev]);
      } else if (payload.eventType === "UPDATE") {
        setPhoneNumbers((prev) =>
          prev.map((phoneNumber) =>
            phoneNumber.phone_number_id === payload.new.phone_number_id
              ? payload.new
              : phoneNumber
          )
        );
      } else if (payload.eventType === "DELETE") {
        setPhoneNumbers((prev) =>
          prev.filter(
            (phoneNumber) =>
              phoneNumber.phone_number_id !== payload.old.phone_number_id
          )
        );
      }
    };

    const subscription = supabase
      .channel("phone_numbers")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "phone_numbers" },
        (payload) => {
          handleChanges(payload);
        }
      )
      .subscribe();

    setLoading(false);
    return () => {
      subscription.unsubscribe();
    };
  }, [showAlert]);

  const addPhoneNumber = useCallback(
    async (phoneNumber: PhoneNumber) => {
      const { error } = await supabase
        .from("phone_numbers")
        .insert(phoneNumber);

      if (error) {
        console.error("Error adding phone number:", error);
        showAlert("Error adding phone number", "error");
        return null;
      }
    },
    [showAlert]
  );

  const updatePhoneNumber = useCallback(
    async (phoneNumber: PhoneNumber) => {
      const { error } = await supabase
        .from("phone_numbers")
        .update(phoneNumber)
        .eq("phone_number_id", phoneNumber.phone_number_id);

      if (error) {
        console.error("Error updating phone number:", error);
        showAlert("Error updating phone number", "error");
      }
    },
    [showAlert]
  );

  const deletePhoneNumber = useCallback(
    async (phoneNumberId: number) => {
      const { error } = await supabase
        .from("phone_numbers")
        .delete()
        .eq("phone_number_id", phoneNumberId);

      if (error) {
        console.error("Error deleting phone number:", error);
        showAlert("Error deleting phone number", "error");
      }
    },
    [showAlert]
  );

  const contextValue = useMemo(
    () => ({
      phoneNumbers,
      addPhoneNumber,
      updatePhoneNumber,
      deletePhoneNumber,
      loading,
    }),
    [
      phoneNumbers,
      loading,
      addPhoneNumber,
      updatePhoneNumber,
      deletePhoneNumber,
    ]
  );

  return (
    <PhoneNumberContext.Provider value={contextValue}>
      {children}
    </PhoneNumberContext.Provider>
  );
};
// Add the whyDidYouRender property after defining the component
(PhoneNumberProvider as any).whyDidYouRender = true; // Add this line
export const usePhoneNumberContext = () => {
  const context = useContext(PhoneNumberContext);

  if (!context) {
    throw new Error(
      "usePhoneNumberContext must be used within PhoneNumberProvider"
    );
  }

  return context;
};
