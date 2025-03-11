import Link from "next/link";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { ArrowRight, StoreIcon } from "lucide-react";

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
};

export type Item = {
  id: number;
  product_id: number;
  product_name: string;
  product_image: string;
  demand_quantity: number;
  done_quantity: number;
  backorder: boolean;
  product_available_qty: number;
};

export type Transfer = {
  id: number;
  date: Date;
  date_done: string;
  name: string;
  state: string;
  moves: Item[];
  backorder_id: number;
};

const PointOfSaleCard = ({ pos }: { pos: POS }) => {
  // if(!transfers) return <></>

  return (
    <Link href={`/${pos.id}`} key={pos.id} className="no-underline">
      <Card className="hover:shadow-lg group transition-shadow relative">
        <CardHeader>
          {pos.has_active_session && (
            <Badge className="absolute size-3 p-0 top-2 right-2"></Badge>
          )}
          <CardTitle className="flex justify-between items-center">
            <div className="flex items-center">
              <StoreIcon className="w-6 h-6 mr-2" />
              <div className="flex flex-col ">
                <span>{pos.name}</span>
                <span className="text-xs text-muted-foreground">
                  {pos.current_user_id[1]}
                </span>
              </div>
            </div>
            {(() => {
              const transfers =
                (pos?.internal_transfers?.assigned ?? 0) +
                (pos?.internal_transfers?.confirmed ?? 0) +
                (pos?.internal_transfers?.draft ?? 0) +
                (pos?.internal_transfers?.assigned ?? 0);

              return transfers ? (
                <div className="flex flex-col gap-2 items-end">
                  <Badge>{transfers} commandes</Badge>
                </div>
              ) : null;
            })()}
          </CardTitle>
        </CardHeader>
        <CardContent className="">
          <ArrowRight className="w-4 h-4 ml-auto ease-in-out -translate-x-10 group-hover:translate-x-0 duration-200 opacity-0 group-hover:opacity-100" />
        </CardContent>
      </Card>
    </Link>
  );
};

export default PointOfSaleCard;

