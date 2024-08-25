import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { supabase } from "../utils/supabaseClient";
import { Database } from "../../database.types";
import { useProjectContext } from "./ProjectContext";
import isEqual from "lodash.isequal";
import { useAlertContext } from "./AlertContext";

export type PersonalizedImage =
  Database["public"]["Tables"]["personalized_images"]["Row"];
export type PersonalizedImages = { personalizedImages: PersonalizedImage[] };
export type PersonalizedImageInsert =
  Database["public"]["Tables"]["personalized_images"]["Insert"];
export type PersonalizedImageUpdate =
  Database["public"]["Tables"]["personalized_images"]["Update"];

interface PersonalizedImageContextProps {
  personalizedImages: PersonalizedImage[];
  addPersonalizedImage: (
    personalizedImage: PersonalizedImageInsert
  ) => Promise<PersonalizedImage | null>;
  updatePersonalizedImage: (personalizedImage: PersonalizedImageUpdate) => void;
  deletePersonalizedImage: (personalizedImageId: number) => void;
  findPersonalizedImage: (
    personalizedImage: PersonalizedImage
  ) => Promise<PersonalizedImage | null>;
  loading: boolean;
}

const PersonalizedImageContext = createContext<PersonalizedImageContextProps>(
  undefined!
);

export function PersonalizedImageProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [personalizedImages, setPersonalizedImages] = useState<
    PersonalizedImage[]
  >([]);
  const [loading, setLoading] = useState<boolean>(false);
  const { currentProject } = useProjectContext();
  const { showAlert } = useAlertContext();

  useEffect(() => {
    setLoading(true);
    const fetchPersonalizedImages = async () => {
      if (!currentProject) return;

      const { data: personalizedImages, error } = await supabase
        .from("personalized_images")
        .select("*")
        .eq("project_id", currentProject.project_id)
        .order("id", { ascending: false });

      if (error) {
        console.error("Error fetching personalized images:", error);
        setLoading(false);
        showAlert("Error fetching personalized images", "error");
        return;
      }

      setPersonalizedImages((prevPersonalizedImages) => {
        if (isEqual(prevPersonalizedImages, personalizedImages)) {
          return prevPersonalizedImages;
        }
        return personalizedImages;
      });
    };

    fetchPersonalizedImages();

    const handleChanges = (payload: any) => {
      if (payload.table === "personalized_images") {
        if (payload.eventType === "INSERT") {
          setPersonalizedImages((prevPersonalizedImages) => {
            return [payload.new, ...prevPersonalizedImages];
          });
        } else if (payload.eventType === "UPDATE") {
          setPersonalizedImages((prevPersonalizedImages) => {
            return prevPersonalizedImages.map((personalizedImage) => {
              if (personalizedImage.id === payload.new.id) {
                return payload.new;
              }
              return personalizedImage;
            });
          });
        } else if (payload.eventType === "DELETE") {
          setPersonalizedImages((prevPersonalizedImages) => {
            return prevPersonalizedImages.filter(
              (personalizedImage) => personalizedImage.id !== payload.old.id
            );
          });
        }
      }
    };

    const subscription = supabase
      .channel("personalized_images")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "personalized_images" },
        (payload) => {
          handleChanges(payload);
        }
      )
      .subscribe();

    setLoading(false);
    return () => {
      subscription.unsubscribe();
    };
  }, [currentProject]);

  const addPersonalizedImage = useCallback(
    async (personalizedImage: PersonalizedImageInsert) => {
      const { data, error } = await supabase
        .from("personalized_images")
        .insert(personalizedImage)
        .single();

      if (error) {
        console.error("Error adding personalized image:", error);
        return null;
      }

      return data;
    },
    []
  );

  const updatePersonalizedImage = useCallback(
    async (personalizedImage: PersonalizedImageUpdate) => {
      const { data, error } = await supabase
        .from("personalized_images")
        .update(personalizedImage)
        .eq("id", personalizedImage.id);

      if (error) {
        console.error("Error updating personalized image:", error);
        return;
      }
    },
    []
  );

  const deletePersonalizedImage = useCallback(
    async (personalizedImageId: number) => {
      const { data, error } = await supabase
        .from("personalized_images")
        .delete()
        .eq("id", personalizedImageId);

      if (error) {
        console.error("Error deleting personalized image:", error);
        return;
      }
    },
    []
  );

  const findPersonalizedImage = useCallback(
    async (personalizedImage: PersonalizedImage) => {
      const { data, error } = await supabase
        .from("personalized_images")
        .select("*")
        .eq("id", personalizedImage.id)
        .single();

      if (error) {
        console.error("Error finding personalized image:", error);
        return null;
      }

      return data;
    },
    []
  );

  const value = useMemo(
    () => ({
      personalizedImages,
      addPersonalizedImage,
      updatePersonalizedImage,
      deletePersonalizedImage,
      findPersonalizedImage,
      loading,
    }),
    [
      personalizedImages,
      addPersonalizedImage,
      updatePersonalizedImage,
      deletePersonalizedImage,
      findPersonalizedImage,
      loading,
    ]
  );

  return (
    <PersonalizedImageContext.Provider value={value}>
      {children}
    </PersonalizedImageContext.Provider>
  );
}

export function usePersonalizedImageContext() {
  const context = useContext(PersonalizedImageContext);
  if (!context) {
    throw new Error(
      "usePersonalizedImageContext must be used within a PersonalizedImageProvider"
    );
  }
  return context;
}
