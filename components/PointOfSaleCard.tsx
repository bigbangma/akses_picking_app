import Link from "next/link";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { AlertCircle, ArrowRight, PackageIcon, StoreIcon, Users } from "lucide-react";

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
  const totalTransfers = 
    (pos?.internal_transfers?.assigned ?? 0) +
    (pos?.internal_transfers?.confirmed ?? 0) +
    (pos?.internal_transfers?.draft ?? 0);

  return (
    <Link href={`/${pos.id}`} key={pos.id} className="no-underline group/card">
      <Card className={`
        relative overflow-hidden
        transition-all duration-300 ease-in-out
        hover:shadow-lg hover:scale-[1.02]
        ${isError ? 'border-red-500/50 bg-red-50/50' : 'hover:border-primary/50'}
      `}>
        {/* Active Session Indicator */}
        {pos.has_active_session && (
          <div className="absolute top-0 right-0 p-4">
            <div className="relative">
              <div className="absolute inset-0 animate-ping rounded-full bg-green-400 opacity-25" />
              <div className="relative rounded-full bg-green-500 h-2 w-2" />
            </div>
          </div>
        )}

        <CardHeader className="pb-4">
          <CardTitle className="flex justify-between items-start gap-4">
            <div className="flex items-start gap-3">
              <div className={`
                p-2 border  rounded-lg
                ${isError ? 'bg-red-100 border-red-100' : 'bg-primary/5 border-green-100'}
                transition-colors duration-300
              `}>
                <StoreIcon className={`
                  w-6 h-6
                  ${isError ? 'text-red-500' : 'text-primary'}
                `} />
              </div>
              
              <div className="space-y-1">
                <span className="font-semibold text-base leading-none block">
                  {pos.name}
                </span>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Users className="w-3 h-3" />
                  <span className="text-xs">
                    {pos.current_user_id[1]}
                  </span>
                </div>
                {isError && (
                  <div className="flex items-center gap-1.5 text-red-500 bg-red-100 rounded-md px-2 py-1">
                    <AlertCircle className="w-3 h-3" />
                    <span className="text-xs font-medium">
                      {pos.errorMessage || "Erreur de chargement"}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {totalTransfers > 0 && (
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="font-normal">
                  <PackageIcon className="w-3 h-3 mr-1" />
                  {totalTransfers} {totalTransfers === 1 ? 'commande' : 'commandes'}
                </Badge>
              </div>
            )}
          </CardTitle>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="flex justify-between items-center text-sm text-muted-foreground">
            <span className="text-xs">
              ID: {pos.id}
            </span>
            <div className="flex items-center gap-2 text-primary">
              <span className="text-xs font-medium">Voir détails</span>
              <ArrowRight className="w-4 h-4 transition-transform duration-300 ease-out transform group-hover/card:translate-x-1" />
            </div>
          </div>
        </CardContent>

        {/* Status Gradient Overlay */}
        {/* <div className={`
          absolute inset-x-0 bottom-0 h-1
          ${isError ? 'bg-red-500' : pos.has_active_session ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gradient-to-r from-primary/30 to-primary'}
          opacity-50 group-hover/card:opacity-100
          transition-opacity duration-300
        `} /> */}
      </Card>
    </Link>
  );
};

export default PointOfSaleCard;
