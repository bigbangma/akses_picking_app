import { Transfer } from "@/components/PointOfSaleCard";
import { useEffect, useState } from "react";

export const API_ENDPOINT = `/api/pos`;

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

