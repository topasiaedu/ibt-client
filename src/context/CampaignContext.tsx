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
import { useProjectContext } from "./ProjectContext";
import { useAlertContext } from "./AlertContext";
import isEqual from "lodash/isEqual"; // Import lodash's isEqual for deep comparison

export type Campaign = Database["public"]["Tables"]["campaigns"]["Row"] & {
  read_count: number;
  total_contacts: number;
};
export type Campaigns = { campaigns: Campaign[] };
export type CampaignInsert =
  Database["public"]["Tables"]["campaigns"]["Insert"];

export type CampaignList =
  Database["public"]["Tables"]["campaign_lists"]["Row"];

export type CampaignListInsert =
  Database["public"]["Tables"]["campaign_lists"]["Insert"];

interface CampaignContextType {
  fetchCampaigns: () => Promise<void>;
  campaigns: Campaign[];
  addCampaign: (
    campaign: CampaignInsert,
    includes: any,
    excludes: any
  ) => Promise<any>;
  updateCampaign: (campaign: Campaign) => void;
  deleteCampaign: (campaignId: number) => void;
  loading: boolean;
}

const CampaignContext = createContext<CampaignContextType>(undefined!);

export const CampaignProvider: React.FC<PropsWithChildren<{}>> = ({
  children,
}) => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const { currentProject } = useProjectContext();
  const { showAlert } = useAlertContext();

  const fetchCampaigns = useCallback(async () => {
    // Just Testing  - Clear out the campaigns
    setCampaigns([]);

    if (!currentProject) return;

    const { data: campaigns, error } = await supabase.rpc("fetch_campaigns", {
      project_id_param: currentProject.project_id,
    });

    if (error) {
      console.error("Error fetching campaigns:", error);
      showAlert("Error fetching campaigns", "error");
      return;
    }

    setCampaigns((prevCampaigns) => {
      if (!isEqual(prevCampaigns, campaigns)) {
        return campaigns;
      }
      return prevCampaigns;
    });
  }, [currentProject, showAlert]);

  useEffect(() => {
    setLoading(true);

    fetchCampaigns();

    const handleChanges = (payload: any) => {
      if (payload.eventType === "INSERT") {
        setCampaigns((prev) => [payload.new, ...prev]);
      } else if (payload.eventType === "UPDATE") {
        setCampaigns((prev) =>
          prev.map((campaign) =>
            campaign.campaign_id === payload.new.campaign_id
              ? payload.new
              : campaign
          )
        );
      } else if (payload.eventType === "DELETE") {
        setCampaigns((prev) =>
          prev.filter(
            (campaign) => campaign.campaign_id !== payload.old.campaign_id
          )
        );
      }
    };

    const subscription = supabase
      .channel("campaigns")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "campaigns" },
        (payload) => {
          handleChanges(payload);
        }
      )
      .subscribe();

    setLoading(false);
    return () => {
      subscription.unsubscribe();
    };
  }, [currentProject, fetchCampaigns, showAlert]);

  const addCampaign = useCallback(
    async (campaign: CampaignInsert, includes: any, excludes: any) => {
      setLoading(true);
      const { data, error } = await supabase
        .from("campaigns")
        .insert([{ ...campaign, project_id: currentProject?.project_id }])
        .select();

      if (error) {
        console.error("Error adding campaign:", error);
        showAlert("Error adding campaign", "error");
        setLoading(false);
        return;
      }

      // Add the excludes and includes to the campaign_list for each entry, it could be contact list or contact
      const campaign_id = data[0].campaign_id;
      const campaignListInserts = [
        ...includes.map((include: any) => ({
          campaign_id,
          contact_list_id: include.contact_id ? undefined : include.id,
          contact_id: include.contact_id ? include.id : undefined,
          type: include.contact_id ? "include-contact" : "include-list",
        })),
        ...excludes.map((exclude: any) => ({
          campaign_id,
          contact_list_id: exclude.contact_id ? undefined : exclude.id,
          contact_id: exclude.contact_id ? exclude.id : undefined,
          type: exclude.contact_id ? "exclude-contact" : "exclude-list",
        })),
      ];

      const { error: campaignListError } = await supabase
        .from("campaign_lists")
        .insert(campaignListInserts);

      if (campaignListError) {
        console.error("Error adding campaign list:", campaignListError);
        showAlert("Error adding campaign list", "error");
        setLoading(false);

        await supabase
          .from("campaigns")
          .delete()
          .eq("campaign_id", campaign_id);
        return;
      }

      // Add Phone Numbers too

      showAlert("Campaign added successfully", "success");
      setLoading(false);
      return data[0];
    },
    [currentProject, showAlert]
  );

  const updateCampaign = useCallback(
    async (campaign: Campaign) => {
      try {
        await supabase
          .from("campaigns")
          .update(campaign)
          .eq("campaign_id", campaign.campaign_id)
          .single();
      } catch (error) {
        console.error("Error updating campaign:", error);
        showAlert("Error updating campaign", "error");
      }
    },
    [showAlert]
  );

  const deleteCampaign = useCallback(
    async (campaignId: number) => {
      try {
        await supabase
          .from("campaign_phone_numbers")
          .delete()
          .eq("campaign_id", campaignId);

        await supabase.from("campaigns").delete().eq("campaign_id", campaignId);

        showAlert("Campaign deleted successfully", "success");
      } catch (error) {
        console.error("Error deleting campaign:", error);
        showAlert("Error deleting campaign", "error");
      }
    },
    [showAlert]
  );

  const contextValue = useMemo(
    () => ({
      fetchCampaigns,
      campaigns,
      addCampaign,
      updateCampaign,
      deleteCampaign,
      loading,
    }),
    [
      fetchCampaigns,
      campaigns,
      addCampaign,
      updateCampaign,
      deleteCampaign,
      loading,
    ]
  );

  return (
    <CampaignContext.Provider value={contextValue}>
      {children}
    </CampaignContext.Provider>
  );
};
// Add the whyDidYouRender property after defining the component
(CampaignProvider as any).whyDidYouRender = true; // Add this line
export const useCampaignContext = () => {
  const context = useContext(CampaignContext);
  if (!context) {
    throw new Error(
      "useCampaignContext must be used within a CampaignProvider"
    );
  }
  return context;
};
