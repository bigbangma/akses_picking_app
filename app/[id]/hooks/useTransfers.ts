import { useEffect, useState } from "react";
import { Item } from "../components/TodoItemsTab";

export const API_ENDPOINT = `/api/pos`;

export type Transfer = {
  id: number;
  product_id: number;
  product_name: string;
  product_image: string;
  demand_quantity: number;
  done_quantity: number;
  backorder: boolean;
  product_available_qty: number;
  state: string;
  moves: Item[];
  date: Date;
  backorder_id?:number[];
};


// Custom Hook for Fetching Transfers
const useTransfers = (id: string) => {
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${API_ENDPOINT}/${id}/transfers`);
        if (!response.ok) throw new Error("Failed to fetch data");
        const data = await response.json();
        console.log("Fetched transfers:", data);
        setTransfers(data.transfers);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  return { transfers, loading, error };
};

export default useTransfers;

