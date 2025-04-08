"use client";

import { useEffect, useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import PointOfSaleCard, { POS } from "@/components/PointOfSaleCard";
import { Skeleton } from "@/components/ui/skeleton"; // For loading state
import { CheckCheck, CircleDot, ClockIcon, Loader2 } from "lucide-react";

// Define the shape of a Transfer object (adjust based on your actual API response)
interface Transfer {
  id: number; // Or string
  state: string;
  backorder_id: boolean | unknown; // Assuming 'false' or non-existence means not a backorder
  // Add other relevant transfer properties if needed
}

// Define an extended POS type to include its processing status
type POSWithStatus = POS & {
  processingStatus:
    | "initial"
    | "loading"
    | "pending"
    | "backorderOnly"
    | "done"
    | "error";
  errorMessage?: string;
};

// --- IMPORTANT: Set your API endpoint ---
const API_ENDPOINT = `/api/pos`;
// -----------------------------------------

export default function Home() {
  const [allPOSs, setAllPOSs] = useState<POSWithStatus[]>([]);
  const [isLoadingInitial, setIsLoadingInitial] = useState(true);
  const [initialError, setInitialError] = useState<string | null>(null);

  // Helper: Calculate pending internal transfers count from summary
  const getPendingTransfersCount = (pos: POS): number => {
    // Use the summary data fetched initially
    const transfers = pos?.internal_transfers ?? {};
    return (
      (transfers.assigned ?? 0) +
      (transfers.confirmed ?? 0) +
      (transfers.draft ?? 0)
    );
  };

  // --- Effect 1: Fetch the initial list of POS ---
  useEffect(() => {
    setIsLoadingInitial(true);
    setInitialError(null);
    fetch("/api/pos") // Your initial endpoint
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Failed to fetch initial POS list (${res.status})`);
        }
        return res.json();
      })
      .then((data) => {
        if (!data || !Array.isArray(data.pos)) {
          throw new Error("Invalid data format received for POS list");
        }
        // Initialize POS list with status
        const initialPOSList = (data.pos as POS[]).map(
          (pos): POSWithStatus => ({
            ...pos,
            // Determine initial status based on summary count
            processingStatus:
              getPendingTransfersCount(pos) === 0 ? "done" : "initial",
          }),
        );
        setAllPOSs(initialPOSList);
      })
      .catch((err) => {
        console.error("Error fetching initial POS:", err);
        setInitialError(
          err instanceof Error ? err.message : "An unknown error occurred",
        );
        setAllPOSs([]); // Clear POSs on error
      })
      .finally(() => {
        setIsLoadingInitial(false);
      });
  }, []); // Run only once on mount

  // --- Effect 2: Fetch detailed transfers for relevant POS ---
  useEffect(() => {
    // Find POS that need details fetched (status is 'initial')
    const posNeedingDetails = allPOSs.filter(
      (pos) => pos.processingStatus === "initial",
    );

    if (posNeedingDetails.length === 0) {
      return; // No details to fetch
    }

    // Mark them as loading
    setAllPOSs((currentPOSs) =>
      currentPOSs.map((pos) =>
        pos.processingStatus === "initial"
          ? { ...pos, processingStatus: "loading" }
          : pos,
      ),
    );

    // --- Function to fetch and process transfers for a single POS ---
    const fetchAndProcessTransfers = async (
      posToProcess: POSWithStatus,
    ): Promise<POSWithStatus> => {
      if (!API_ENDPOINT) {
        console.error("API_ENDPOINT is not configured!");
        return {
          ...posToProcess,
          processingStatus: "error",
          errorMessage: "API endpoint not configured",
        };
      }
      try {
        const response = await fetch(
          `${API_ENDPOINT}/${posToProcess.id}/transfers`,
        );
        if (!response.ok) {
          throw new Error(
            `Failed to fetch transfers for POS ${posToProcess.id} (${response.status})`,
          );
        }
        const data = await response.json();

        if (!data || !Array.isArray(data.transfers)) {
          throw new Error(
            `Invalid data format received for transfers of POS ${posToProcess.id}`,
          );
        }

        const transfers = data.transfers as Transfer[];

        // Filter for transfers that are NOT done
        const notDoneTransfers = transfers.filter(
          (transfer) => transfer.state !== "done",
        );

        if (notDoneTransfers.length === 0) {
          // Should not happen if getPendingTransfersCount > 0, but handle defensively
          console.warn(
            `POS ${posToProcess.id} had pending count but no non-done transfers found in details.`,
          );
          return { ...posToProcess, processingStatus: "done" }; // Treat as done if no non-done transfers found
        }

        // Check if ALL non-done transfers are backorders
        const allAreBackorders = notDoneTransfers.every(
          (transfer) =>
            transfer.backorder_id && transfer.backorder_id !== false,
        );

        return {
          ...posToProcess,
          processingStatus: allAreBackorders ? "backorderOnly" : "pending",
        };
      } catch (err) {
        console.error(`Error processing POS ${posToProcess.id}:`, err);
        return {
          ...posToProcess,
          processingStatus: "error",
          errorMessage:
            err instanceof Error ? err.message : "Failed to process details",
        };
      }
    };
    // --- End of fetchAndProcessTransfers ---

    // Fetch details for all relevant POS concurrently
    Promise.all(posNeedingDetails.map(fetchAndProcessTransfers)).then(
      (updatedPOSs) => {
        // Create a map for easy lookup
        const updatesMap = new Map(updatedPOSs.map((p) => [p.id, p]));
        // Update the main state
        setAllPOSs((currentPOSs) =>
          currentPOSs.map(
            (pos) => updatesMap.get(pos.id) || pos, // Use updated POS if available, otherwise keep current
          ),
        );
      },
    );

    // Note: No .catch here as errors are handled per-POS and stored in their status/errorMessage
    // Note: No .finally here to set a loading flag, as loading is per-POS
  }, [allPOSs]); // Re-run when allPOSs changes (specifically when 'initial' statuses appear)

  // --- Memoized filtering for rendering ---
  const { pendingPOS, backorderOnlyPOS, donePOS, loadingPOS, errorPOS } =
    useMemo(() => {
      return {
        pendingPOS: allPOSs.filter((pos) => pos.processingStatus === "pending"),
        backorderOnlyPOS: allPOSs.filter(
          (pos) => pos.processingStatus === "backorderOnly",
        ),
        donePOS: allPOSs.filter((pos) => pos.processingStatus === "done"),
        loadingPOS: allPOSs.filter((pos) => pos.processingStatus === "loading"), // To show loading state
        errorPOS: allPOSs.filter((pos) => pos.processingStatus === "error"), // To show errors
      };
    }, [allPOSs]); // Recalculate when allPOSs changes

  // --- Render Logic ---

  if (isLoadingInitial) {
    return <div className="p-4">Chargement initial des points de vente...</div>; // Or a spinner/skeleton
  }

  if (initialError) {
    return <div className="p-4 text-red-600">Erreur: {initialError}</div>;
  }

  // Helper to render a grid section
  const renderGridSection = (
    title: string,
    posList: POSWithStatus[],
    emptyMessage: string,
    isLoading?: boolean,
    icon?: React.ReactNode,
  ) => (
    <AccordionItem value={title.toLowerCase().replace(/\s+/g, "-")}>
      <AccordionTrigger>
        <div className="flex justify-between items-center gap-3 w-full">
          <div className="flex justify-center items-center gap-3">
            {icon}
            {title}
          </div>
          <Badge>
            {posList.length}
            {isLoading ? (
              <Loader2 className="animate-spin size-4 ml-2" />
            ) : null}
          </Badge>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <div className="grid grid-cols-1 p-2 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {posList.length === 0 && !isLoading ? (
            <p className="col-span-full">{emptyMessage}</p>
          ) : (
            <>
              {/* Render actual POS cards */}
              {posList.map((pos) => (
                <PointOfSaleCard key={pos.id} pos={pos} />
              ))}
              {/* Optional: Render skeletons for loading items */}
              {isLoading &&
                loadingPOS.length > 0 &&
                title === "Points de Vente en Attente" &&
                Array.from({ length: loadingPOS.length }).map((_, index) => (
                  <Skeleton
                    key={`loading-${index}`}
                    className="h-24 w-full rounded-lg"
                  /> // Adjust skeleton appearance
                ))}
              {/* Optional: Render error items */}
              {errorPOS.length > 0 &&
                title === "Points de Vente en Attente" &&
                errorPOS.map((pos) => (
                  <div
                    key={`error-${pos.id}`}
                    className="border border-red-500 p-2 rounded-lg col-span-full md:col-span-1"
                  >
                    <p className="font-semibold text-red-600">
                      Erreur: {pos.name || `POS ID ${pos.id}`}
                    </p>
                    <p className="text-sm text-red-500">
                      {pos.errorMessage || "Impossible de charger les détails."}
                    </p>
                  </div>
                ))}
            </>
          )}
        </div>
      </AccordionContent>
    </AccordionItem>
  );

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Points de Vente</h1>

      <div className="container mx-auto p-0">
        {/* Add a general loading indicator for detail fetching if desired */}
        {/* {loadingPOS.length > 0 && <p>Chargement des détails...</p>} */}

        <Accordion type="multiple" defaultValue={["pending", "backorder-only"]}>
          {" "}
          {/* Allow multiple open */}
          {/* Pending POS Section (True Pending) */}
          {renderGridSection(
            "Points de Vente en Attente",
            // Include loading and error POS in the first section for visibility
            [...pendingPOS, ...loadingPOS, ...errorPOS],
            "Aucun point de vente en attente.",
            loadingPOS.length > 0, // Pass loading state to show indicator in badge
            <CircleDot size={18} />,
          )}
          {/* Backorder Only POS Section */}
          {renderGridSection(
            "Commandes avec Reliquats", // Changed title for clarity
            backorderOnlyPOS,
            "Aucun point de vente avec reliquats.",
            loadingPOS.length > 0,
            <ClockIcon size={18} />,
          )}
          {/* Done POS Section */}
          {renderGridSection(
            "Points de Vente Terminés",
            donePOS,
            "Aucun point de vente terminé.",
            false,
            <CheckCheck size={18} />,
          )}
        </Accordion>
      </div>
    </div>
  );
}
