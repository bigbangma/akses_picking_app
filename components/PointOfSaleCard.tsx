import Link from "next/link";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { AlertCircle, ArrowRight, Package, Store, Users } from "lucide-react";
import { cn } from "@/lib/utils";

export type POS = {
  id: number;
  name: string;
  has_active_session: boolean;
  current_user_id: [number, string];
  current_session_id: [number, string];
  warehouse_id: [number, string];
  default_dest_location: [number, string];
  internal_transfers?: {
    assigned?: number;
    confirmed?: number;
    draft?: number;
  };
  processingStatus?: string;
  errorMessage?: string;
};

const PointOfSaleCard = ({ pos }: { pos: POS }) => {
  const isError = pos.processingStatus === "error";
  const isLoading = pos.processingStatus === "loading";
  
  const totalTransfers = 
    (pos?.internal_transfers?.assigned ?? 0) +
    (pos?.internal_transfers?.confirmed ?? 0) +
    (pos?.internal_transfers?.draft ?? 0);

  const cardClasses = cn(
    "group/card relative flex flex-col justify-between overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm transition-all duration-300 ease-in-out",
    {
      "border-destructive/50 bg-destructive/5 hover:border-destructive": isError,
      "hover:shadow-lg hover:border-primary/80": !isError,
      "animate-pulse": isLoading,
    }
  );

  return (
    <Link href={`/${pos.id}`} key={pos.id} className="no-underline">
      <Card className={cardClasses}>
        <CardHeader className="p-4 pb-2">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className={cn("flex h-12 w-12 items-center justify-center rounded-lg", isError ? "bg-destructive/10" : "bg-primary/10")}>
                <Store className={cn("h-6 w-6", isError ? "text-destructive" : "text-primary")} />
              </div>
              <div className="space-y-1">
                <CardTitle className="text-base font-semibold leading-tight">{pos.name}</CardTitle>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Users className="h-3 w-3" />
                  <span>{pos.current_user_id[1]}</span>
                </div>
              </div>
            </div>
            {pos.has_active_session && (
              <div className="flex h-5 w-5 items-center justify-center">
                <div className="absolute h-2 w-2 rounded-full bg-green-500" />
                <div className="h-4 w-4 animate-ping rounded-full bg-green-400/50" />
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-4 pt-2">
          {isError ? (
            <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-2 text-xs font-medium text-destructive">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">{pos.errorMessage || "Erreur de chargement"}</span>
            </div>
          ) : (
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              {totalTransfers > 0 ? (
                <Badge variant="secondary" className="font-normal">
                  <Package className="mr-1.5 h-3 w-3" />
                  {totalTransfers} {totalTransfers === 1 ? 'commande' : 'commandes'}
                </Badge>
              ) : (
                <span className="text-xs">Aucune commande</span>
              )}
              <div className="flex items-center gap-1 text-primary opacity-0 transition-opacity duration-300 group-hover/card:opacity-100">
                <span className="text-xs font-medium">Détails</span>
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover/card:translate-x-1" />
              </div>
            </div>
          )}
        </CardContent>
        
        <div className={cn(
          "absolute inset-x-0 bottom-0 h-1",
          {
            "bg-destructive": isError,
            "bg-primary/70": !isError,
          }
        )} />
      </Card>
    </Link>
  );
};

export default PointOfSaleCard;
