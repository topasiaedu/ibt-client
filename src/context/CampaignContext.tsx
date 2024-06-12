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
};
export type Campaigns = { campaigns: Campaign[] };
export type CampaignInsert =
  Database["public"]["Tables"]["campaigns"]["Insert"];

interface CampaignContextType {
  campaigns: Campaign[];
  addCampaign: (campaign: CampaignInsert) => Promise<Campaign | undefined>;
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

  useEffect(() => {
    setLoading(true);
    const fetchCampaigns = async () => {
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
          console.log("Updating campaigns state");
          return campaigns;
        }
        return prevCampaigns;
      });
    };

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
  }, [currentProject, showAlert]);

  const addCampaign = useCallback(
    async (campaign: CampaignInsert) => {
      setLoading(true);
      const { data, error } = await supabase
        .from("campaigns")
        .insert([{ ...campaign, project_id: currentProject?.project_id }])
        .select();
      console.log("data", data);
      if (error) {
        console.error("Error adding campaign:", error);
        showAlert("Error adding campaign", "error");
        setLoading(false);
        return;
      }

      setLoading(false);
      return data![0];
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
        await supabase.from("campaign_phone_numbers").delete().eq("campaign_id", campaignId);

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
    () => ({ campaigns, addCampaign, updateCampaign, deleteCampaign, loading }),
    [campaigns, addCampaign, updateCampaign, deleteCampaign, loading]
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
