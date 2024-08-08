import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { supabase } from "../utils/supabaseClient";
import { Database } from "../../database.types";
import { useProjectContext } from "./ProjectContext";
import isEqual from "lodash.isequal";

export type ConversationHistory =
  Database["public"]["Tables"]["conversation_history"]["Row"];
export type ConversationHistories = {
  conversation_histories: ConversationHistory[];
};
export type ConversationHistoryInsert =
  Database["public"]["Tables"]["conversation_history"]["Insert"];

interface ConversationHistoryContextProps {
  conversationHistories: ConversationHistory[];
  loading: boolean;
}

const ConversationHistoryContext =
  createContext<ConversationHistoryContextProps>(undefined!);

export function ConversationHistoryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [conversationHistories, setConversationHistories] = useState<
    ConversationHistory[]
  >([]);
  const [loading, setLoading] = useState<boolean>(false);
  const { currentProject } = useProjectContext();

  useEffect(() => {
    setLoading(true);
    const fetchConversationHistories = async () => {
      if (!currentProject) return;

      const { data: conversationHistories, error } = await supabase
        .from("conversation_history")
        .select("*")
        .order("conversation_id", { ascending: false });

      if (error) {
        console.error("Error fetching conversationHistories:", error);
        return;
      }

      setConversationHistories((prevConversationHistories) => {
        if (isEqual(prevConversationHistories, conversationHistories)) {
          return prevConversationHistories;
        }
        return conversationHistories;
      });
    };

    fetchConversationHistories();

    const handleChanges = (payload: any) => {
      if (payload.eventType === "INSERT") {
        setConversationHistories((prevConversationHistories) => {
          return [payload.new, ...prevConversationHistories];
        });
      } else if (payload.eventType === "UPDATE") {
        setConversationHistories((prevConversationHistories) => {
          return prevConversationHistories.map((conversationHistory) =>
            conversationHistory.conversation_id === payload.new.conversation_id
              ? payload.new
              : conversationHistory
          );
        });
      } else if (payload.eventType === "DELETE") {
        setConversationHistories((prevConversationHistories) => {
          return prevConversationHistories.filter(
            (conversationHistory) =>
              conversationHistory.conversation_id !==
              payload.old.conversation_id
          );
        });
      }
    };

    const subscription = supabase
      .channel("conversation_history")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "conversation_history" },
        (payload) => {
          handleChanges(payload);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [currentProject]);

  const value = useMemo(
    () => ({
      conversationHistories,
      loading,
    }),
    [conversationHistories, loading]
  );

  return (
    <ConversationHistoryContext.Provider value={value}>
      {children}
    </ConversationHistoryContext.Provider>
  );
}

export function useConversationHistoryContext() {
  const context = useContext(ConversationHistoryContext);
  if (!context) {
    throw new Error(
      "useConversationHistoryContext must be used within a ConversationHistoryProvider"
    );
  }
  return context;
}
