"use client";

import { useEffect, useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PointOfSaleCard, { POS } from "@/components/PointOfSaleCard";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCheck, CircleDot, ClockIcon, Loader2, AlertCircle } from "lucide-react";

// Define the shape of a Transfer object
interface Transfer {
  id: number;
  state: string;
  backorder_id: boolean | unknown;
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

const API_ENDPOINT = `/api/pos`;

export default function Home() {
  const [allPOSs, setAllPOSs] = useState<POSWithStatus[]>([]);
  const [isLoadingInitial, setIsLoadingInitial] = useState(true);
  const [initialError, setInitialError] = useState<string | null>(null);

  const getPendingTransfersCount = (pos: POS): number => {
    const transfers = pos?.internal_transfers ?? {};
    return (
      (transfers.assigned ?? 0) +
      (transfers.confirmed ?? 0) +
      (transfers.draft ?? 0)
    );
  };

  useEffect(() => {
    setIsLoadingInitial(true);
    setInitialError(null);
    fetch("/api/pos")
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to fetch initial POS list (${res.status})`);
        return res.json();
      })
      .then((data) => {
        if (!data || !Array.isArray(data.pos)) {
          throw new Error("Invalid data format received for POS list");
        }
        const initialPOSList = (data.pos as POS[]).map(
          (pos): POSWithStatus => ({
            ...pos,
            processingStatus:
              getPendingTransfersCount(pos) === 0 ? "done" : "initial",
          }),
        );
        setAllPOSs(initialPOSList);
      })
      .catch((err) => {
        console.error("Error fetching initial POS:", err);
        setInitialError(err instanceof Error ? err.message : "An unknown error occurred");
        setAllPOSs([]);
      })
      .finally(() => setIsLoadingInitial(false));
  }, []);

  useEffect(() => {
    const posNeedingDetails = allPOSs.filter(
      (pos) => pos.processingStatus === "initial",
    );

    if (posNeedingDetails.length === 0) return;

    setAllPOSs((currentPOSs) =>
      currentPOSs.map((pos) =>
        pos.processingStatus === "initial"
          ? { ...pos, processingStatus: "loading" }
          : pos,
      ),
    );

    const fetchAndProcessTransfers = async (
      posToProcess: POSWithStatus,
    ): Promise<POSWithStatus> => {
      if (!API_ENDPOINT) {
        return {
          ...posToProcess,
          processingStatus: "error",
          errorMessage: "API endpoint not configured",
        };
      }
      try {
        const response = await fetch(`${API_ENDPOINT}/${posToProcess.id}/transfers`);
        if (!response.ok) {
          throw new Error(`Failed to fetch transfers for POS ${posToProcess.id} (${response.status})`);
        }
        const data = await response.json();
        if (!data || !Array.isArray(data.transfers)) {
          throw new Error(`Invalid data format for transfers of POS ${posToProcess.id}`);
        }
        const transfers = data.transfers as Transfer[];
        const notDoneTransfers = transfers.filter((t) => t.state !== "done");

        if (notDoneTransfers.length === 0) {
          return { ...posToProcess, processingStatus: "done" };
        }

        const allAreBackorders = notDoneTransfers.every((t) => t.backorder_id);
        return {
          ...posToProcess,
          processingStatus: allAreBackorders ? "backorderOnly" : "pending",
        };
      } catch (err) {
        return {
          ...posToProcess,
          processingStatus: "error",
          errorMessage: err instanceof Error ? err.message : "Failed to process details",
        };
      }
    };

    Promise.all(posNeedingDetails.map(fetchAndProcessTransfers)).then(
      (updatedPOSs) => {
        const updatesMap = new Map(updatedPOSs.map((p) => [p.id, p]));
        setAllPOSs((currentPOSs) =>
          currentPOSs.map((pos) => updatesMap.get(pos.id) || pos),
        );
      },
    );
  }, [allPOSs]);

  const { pendingPOS, backorderOnlyPOS, donePOS, loadingPOS, errorPOS } = useMemo(() => ({
    pendingPOS: allPOSs.filter((pos) => pos.processingStatus === "pending"),
    backorderOnlyPOS: allPOSs.filter((pos) => pos.processingStatus === "backorderOnly"),
    donePOS: allPOSs.filter((pos) => pos.processingStatus === "done"),
    loadingPOS: allPOSs.filter((pos) => pos.processingStatus === "loading"),
    errorPOS: allPOSs.filter((pos) => pos.processingStatus === "error"),
  }), [allPOSs]);

  const renderGrid = (posList: POSWithStatus[], isLoading: boolean, emptyMessage: string) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pt-6">
      {isLoading ? (
        Array.from({ length: posList.length || 4 }).map((_, index) => (
          <Skeleton key={`loading-${index}`} className="h-32 w-full rounded-lg" />
        ))
      ) : posList.length === 0 ? (
        <p className="col-span-full text-center text-muted-foreground py-8">{emptyMessage}</p>
      ) : (
        posList.map((pos) => <PointOfSaleCard key={pos.id} pos={pos} />)
      )}
    </div>
  );

  if (isLoadingInitial) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-primary h-12 w-12" />
          <p className="text-muted-foreground">Chargement des points de vente...</p>
        </div>
      </div>
    );
  }

  if (initialError) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center gap-4 text-destructive">
          <AlertCircle className="h-12 w-12" />
          <h2 className="text-xl font-semibold">Erreur de chargement</h2>
          <p className="text-center max-w-md">{initialError}</p>
        </div>
      </div>
    );
  }

  const allPending = [...pendingPOS, ...loadingPOS, ...errorPOS];

  return (
    <div className="container mx-auto p-4 sm:p-6 md:p-8">
      <header className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 sm:mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2 sm:mb-0">
          Points de Vente
        </h1>
        {loadingPOS.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground animate-pulse">
            <Loader2 className="animate-spin h-4 w-4" />
            <span>Mise à jour des statuts...</span>
          </div>
        )}
      </header>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-muted/50">
          <TabsTrigger value="pending">
            <CircleDot className="h-4 w-4 mr-2" />
            En Attente
            <Badge variant="secondary" className="ml-2">{allPending.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="backorder-only">
            <ClockIcon className="h-4 w-4 mr-2" />
            Reliquats
            <Badge variant="secondary" className="ml-2">{backorderOnlyPOS.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="done">
            <CheckCheck className="h-4 w-4 mr-2" />
            Terminés
            <Badge variant="secondary" className="ml-2">{donePOS.length}</Badge>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="pending">
          {renderGrid(allPending, loadingPOS.length > 0, "Aucun point de vente en attente.")}
        </TabsContent>
        <TabsContent value="backorder-only">
          {renderGrid(backorderOnlyPOS, false, "Aucun point de vente avec uniquement des reliquats.")}
        </TabsContent>
        <TabsContent value="done">
          {renderGrid(donePOS, false, "Aucun point de vente terminé.")}
        </TabsContent>
      </Tabs>
    </div>
  );
}

