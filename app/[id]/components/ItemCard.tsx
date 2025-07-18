import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { CheckIcon, Package, X, XIcon } from "lucide-react";
import Image from "next/image";
import React from "react";
import { Item } from "./TodoItemsTab";

// ItemCard Component
const ItemCard = ({
  done,
  item,
  onCheck,
  onCancel,
  onQuantityChange,
  onUncheck,
}: {
  done?: boolean;
  item: Item;
  onCheck: (item: Item) => void;
  onCancel: (item: Item) => void;
  onQuantityChange: (id: number, quantity: number) => void;
  onUncheck: (item: Item) => void;
}) => (
  <Card className="shadow-none relative">
    <CardContent className="p-4 flex flex-col justify-between">
      <div className="flex flex-1 space-x-4">
        <Image
          src={
            "data:image/jpeg;base64," + item.product_image || "/placeholder.svg"
          }
          alt={item.product_name}
          width={50}
          height={50}
          className="rounded-xl size-20 aspect-square object-contain p-1 bg-white border"
        />
        <div>
          <div className="max-w-[90%]">
            <div className="text-sm md:text-base font-semibold text-gray-800">
              {item.product_name}
            </div>
            {!done ? (
              <Badge
                className="ml-2 p-0 border-none absolute top-3 right-3 text-black font-semibold text-md rounded-full "
                variant="outline"
              >
                {item.demand_quantity}
              </Badge>
            ) : (
              <Badge
                variant="secondary"
                className={cn(
                  "text-sm absolute top-3 right-3 ml-auto  rounded-full",
                  item.done_quantity == 0 &&
                    "bg-red-500 text-white hover:bg-red-600",
                  item.done_quantity != 0 &&
                    "bg-yellow-500 text-black hover:bg-yellow-600",
                  item.done_quantity == item.demand_quantity &&
                    "bg-green-500 text-white hover:bg-green-600",
                )}
              >
                {item.done_quantity}
                {item.demand_quantity != item.done_quantity && (
                  <span className="ml-1"> / {item.demand_quantity}</span>
                )}
              </Badge>
            )}
          </div>
          <p className="flex  items-center gap-1 bg-slate-50 rounded-xl border w-fit px-3">
            {item.product_available_qty ?? 0} <Package size={18} />
          </p>
        </div>
      </div>
      {!done ? (
        <div className="flex gap-2 items-center">
          <Input
            type="number"
            value={item.done_quantity}
            onChange={(e) =>
              onQuantityChange(
                item.id,
                Math.min(Number.parseInt(e.target.value), item.demand_quantity),
              )
            }
            className="w-20 ml-auto bg-slate-100 shadow-none"
            max={item.demand_quantity}
          />
          <Button size={"icon"} onClick={() => onCheck(item)}>
            <CheckIcon className="w-6 h-6" />
          </Button>
          <div className="h-8 mx-1 border-l"></div>
          <Button
            className=""
            variant="destructive"
            size={"icon"}
            onClick={() => onCancel(item)}
          >
            <XIcon className="w-6 h-6" />
          </Button>
        </div>
      ) : (
        <div className="flex gap-2 items-center ml-auto">
          <Button
            size={"icon"}
            variant={"secondary"}
            className="border"
            onClick={() => onUncheck(item)}
          >
            <X className="w-6 h-6" />
          </Button>
        </div>
      )}
    </CardContent>
  </Card>
);

export default ItemCard;
