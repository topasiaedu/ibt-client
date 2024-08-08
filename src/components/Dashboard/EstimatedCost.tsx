/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState, useEffect } from "react";
import { supabase } from "../../utils/supabaseClient";
import { useProjectContext } from "../../context/ProjectContext";
import { Dropdown } from "flowbite-react";

interface ConversationData {
  time_interval: string;
  conversation_count: number;
  project_id: number;
}

const UserStatisticsCard = () => {
  const [data, setData] = useState<ConversationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [intervalType, setIntervalType] = useState("Last 7 days");
  const { currentProject } = useProjectContext();
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      let startDate, endDate, intervalTypeQuery;
      const now = new Date();

      switch (intervalType) {
        case "Today":
          startDate = new Date(now.setHours(0, 0, 0, 0)).toISOString();
          endDate = new Date().toISOString();
          intervalTypeQuery = "day";
          break;
        case "Last 7 days":
          startDate = new Date(now.setDate(now.getDate() - 7)).toISOString();
          endDate = new Date().toISOString();
          intervalTypeQuery = "day";
          break;
        case "Last 30 days":
          startDate = new Date(now.setDate(now.getDate() - 30)).toISOString();
          endDate = new Date().toISOString();
          intervalTypeQuery = "week";
          break;
        case "Last 90 days":
          startDate = new Date(now.setDate(now.getDate() - 90)).toISOString();
          endDate = new Date().toISOString();
          intervalTypeQuery = "month";
          break;
        default:
          startDate = new Date(now.setDate(now.getDate() - 7)).toISOString();
          endDate = new Date().toISOString();
          intervalTypeQuery = "day";
      }

      const { data, error } = await supabase.rpc("get_conversation_counts", {
        start_date: startDate,
        end_date: endDate,
        interval_type: intervalTypeQuery,
      });

      if (error) {
        console.error("Error fetching data:", error);
      } else {
        setData(data);
      }
      setLoading(false);
    };

    fetchData();
  }, [intervalType]);

  useEffect(() => {
    if (!currentProject || data.length === 0) {
      return;
    }
    if (!loading && data.length > 0) {
      const filteredData = data.filter(
        (item) => item.project_id === currentProject.project_id
      );

      const total = filteredData.reduce((acc, item) => {
        return acc + item.conversation_count;
      }, 0);

      setTotal(total);
    }
  }, [loading, data, currentProject]);

  return (
    <div className="max-w-sm w-full bg-white rounded-lg shadow dark:bg-gray-800 p-4 md:p-6">
      <div className="flex justify-between items-center">
        <div className="flex flex-col gap-1">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            Estimated Cost
          </h3>
          <Dropdown label={intervalType} inline={true}>
            <Dropdown.Item onClick={() => setIntervalType("Today")}>
              Today
            </Dropdown.Item>
            <Dropdown.Item onClick={() => setIntervalType("Last 7 days")}>
              Last 7 days
            </Dropdown.Item>
            <Dropdown.Item onClick={() => setIntervalType("Last 30 days")}>
              Last 30 days
            </Dropdown.Item>
            <Dropdown.Item onClick={() => setIntervalType("Last 90 days")}>
              Last 90 days
            </Dropdown.Item>
          </Dropdown>
        </div>
        <h5 className="leading-none text-3xl font-bold text-gray-900 dark:text-white pb-2">
          {total.toFixed(2)}
          <span className="text-base font-normal text-gray-500 dark:text-gray-400">
            {" "}
            USD
          </span>
        </h5>
      </div>
    </div>
  );
};

export default UserStatisticsCard;
