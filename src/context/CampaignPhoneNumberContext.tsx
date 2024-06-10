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
import isEqual from "lodash/isEqual"; // Add this import

export type CampaignPhoneNumber =
  Database["public"]["Tables"]["campaign_phone_numbers"]["Row"];
export type CampaignPhoneNumbers = {
  campaign_phone_numbers: CampaignPhoneNumber[];
};
export type CampaignPhoneNumberInsert =
  Database["public"]["Tables"]["campaign_phone_numbers"]["Insert"];

interface CampaignPhoneNumberContextType {
  campaignPhoneNumbers: CampaignPhoneNumber[];
  addCampaignPhoneNumber: (
    campaignPhoneNumber: CampaignPhoneNumberInsert
  ) => void;
  updateCampaignPhoneNumber: (campaignPhoneNumber: CampaignPhoneNumber) => void;
  deleteCampaignPhoneNumber: (campaignPhoneNumberId: number) => void;
  loading: boolean;
}

const CampaignPhoneNumberContext =
  createContext<CampaignPhoneNumberContextType>(undefined!);

export const CampaignPhoneNumberProvider: React.FC<PropsWithChildren<{}>> = ({
  children,
}) => {
  const [campaignPhoneNumbers, setCampaignPhoneNumbers] = useState<
    CampaignPhoneNumber[]
  >([]);
  const [loading, setLoading] = useState<boolean>(false);
  const { showAlert } = useAlertContext();

  useEffect(() => {
    setLoading(true);
    const fetchCampaignPhoneNumbers = async () => {
      const { data: campaignPhoneNumbers, error } = await supabase
        .from("campaign_phone_numbers")
        .select("*")
        .order("id", { ascending: false });

      if (error) {
        console.error("Error fetching campaign phone numbers:", error);
        showAlert("Error fetching campaign phone numbers", "error");
        return;
      }

      setCampaignPhoneNumbers((prevCampaignPhoneNumbers) => {
        if (!isEqual(prevCampaignPhoneNumbers, campaignPhoneNumbers)) {
          console.log("Updating campaign phone numbers state");
          return campaignPhoneNumbers;
        }
        return prevCampaignPhoneNumbers;
      });
    };

    fetchCampaignPhoneNumbers();

    const handleChanges = (payload: any) => {
      if (payload.eventType === "INSERT") {
        setCampaignPhoneNumbers((prev) => [payload.new, ...prev]);
      } else if (payload.eventType === "UPDATE") {
        setCampaignPhoneNumbers((prev) =>
          prev.map((campaignPhoneNumber) =>
            campaignPhoneNumber.id === payload.new.id
              ? payload.new
              : campaignPhoneNumber
          )
        );
      } else if (payload.eventType === "DELETE") {
        setCampaignPhoneNumbers((prev) =>
          prev.filter(
            (campaignPhoneNumber) => campaignPhoneNumber.id !== payload.old.id
          )
        );
      }
    };

    const subscription = supabase
      .channel("campaign_phone_numbers")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "campaign_phone_numbers" },
        (payload) => {
          handleChanges(payload);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [showAlert]);

  const addCampaignPhoneNumber = useCallback(
    async (campaignPhoneNumber: CampaignPhoneNumberInsert) => {
      const { error } = await supabase
        .from("campaign_phone_numbers")
        .insert(campaignPhoneNumber);

      if (error) {
        console.error("Error adding campaign phone number:", error);
        showAlert("Error adding campaign phone number", "error");
        return;
      }
    },
    [showAlert]
  );

  const updateCampaignPhoneNumber = useCallback(
    async (campaignPhoneNumber: CampaignPhoneNumber) => {
      const { error } = await supabase
        .from("campaign_phone_numbers")
        .update(campaignPhoneNumber)
        .eq("id", campaignPhoneNumber.id);

      if (error) {
        console.error("Error updating campaign phone number:", error);
        showAlert("Error updating campaign phone number", "error");
        return;
      }
    },
    [showAlert]
  );

  const deleteCampaignPhoneNumber = useCallback(
    async (campaignPhoneNumberId: number) => {
      const { error } = await supabase
        .from("campaign_phone_numbers")
        .delete()
        .eq("id", campaignPhoneNumberId);

      if (error) {
        console.error("Error deleting campaign phone number:", error);
        showAlert("Error deleting campaign phone number", "error");
        return;
      }
    },
    [showAlert]
  );

  const contextValue = useMemo(
    () => ({
      campaignPhoneNumbers,
      addCampaignPhoneNumber,
      updateCampaignPhoneNumber,
      deleteCampaignPhoneNumber,
      loading,
    }),
    [
      campaignPhoneNumbers,
      addCampaignPhoneNumber,
      updateCampaignPhoneNumber,
      deleteCampaignPhoneNumber,
      loading,
    ]
  );

  return (
    <CampaignPhoneNumberContext.Provider value={contextValue}>
      {children}
    </CampaignPhoneNumberContext.Provider>
  );
};
// Add the whyDidYouRender property after defining the component
(CampaignPhoneNumberProvider as any).whyDidYouRender = true; // Add this line
export const useCampaignPhoneNumberContext = () => {
  const context = useContext(CampaignPhoneNumberContext);
  if (!context) {
    throw new Error(
      "useCampaignPhoneNumberContext must be used within a CampaignPhoneNumberProvider"
    );
  }
  return context;
};
