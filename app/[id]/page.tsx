"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import useTransfers from "./hooks/useTransfers";
import { useItemsManagement } from "./hooks/useItemsManagement";
import {
  confirmTransfer,
  distributeDoneQuantity,
} from "./services/transferService";
import { Header } from "./components/Header";
import { TabsComponent } from "./components/TabsComponent";
import { Item } from "@/components/PointOfSaleCard";
import { LoadingScreen } from "./components/LoadingScreen";
import { ErrorScreen } from "./components/ErrorScreen";

const PointOfSalePage = () => {
  const { id } = useParams();
  const { transfers, loading, error } = useTransfers(id as string);
  const {
    todoItems,
    waitingItems,
    doneItems,
    setDoneItems,
    setWaitingDoneItems,
    waitingDoneItems,
    setTodoItems,
    setWaitingItems,
    handleCheck,
    handleCancel,
    handleUncheck,
    handleQuantityChange,
  } = useItemsManagement();

  useEffect(() => {
    if (loading || !transfers?.length) return;

    const productMap = new Map<number, Item>();
    const productMap2 = new Map<number, Item>();

    transfers
      .filter((t) => t.state !== "done")
      .forEach((transfer) => {
        transfer.moves.forEach((move) => {
          const map = transfer.backorder_id ? productMap2 : productMap;
          if (map.has(move.product_id)) {
            const existingItem = map.get(move.product_id)!;
            existingItem.demand_quantity += move.demand_quantity;
          } else {
            map.set(move.product_id, {
              ...move,
              backorder: !!transfer.backorder_id,
            });
          }
        });
      });

    setTodoItems(Array.from(productMap.values()));
    setWaitingItems(Array.from(productMap2.values()));
  }, [transfers, loading]);

  const handleMarkAsDone = async () => {
    const updatedTransfers = transfers?.filter((t) => t.state !== "done") || [];

    // Distribute quantities
    const withRegularItems = distributeDoneQuantity(
      doneItems,
      updatedTransfers,
      false,
    );
    const withAllItems = distributeDoneQuantity(
      waitingDoneItems,
      withRegularItems,
      true,
    );

    // Confirm transfers
    await Promise.all(
      withAllItems.map(async (transfer) => {
        const itemsToCheck = transfer.backorder_id
          ? waitingDoneItems
          : doneItems;
        if (itemsToCheck.length > 0) {
          await confirmTransfer(transfer, itemsToCheck);
        }
      }),
    );

    // Reset state
    setDoneItems([]);
    setTodoItems([]);
    setWaitingItems([]);
    setWaitingDoneItems([]);

    setTimeout(() => window.location.reload(), 3000);
  };

  if (loading) return <LoadingScreen />;
  if (error) return <ErrorScreen error={error} />;

  return (
    <div className="container mx-auto p-4">
      <Header id={id as string} />

      <Link href="/">
        <Button variant="outline" className="mb-4">
          <ArrowLeft className="w-6 h-6 mr-2" />
          Retour
        </Button>
      </Link>

      <TabsComponent
        todoItems={todoItems}
        waitingItems={waitingItems}
        doneItems={doneItems}
        waitingDoneItems={waitingDoneItems}
        handleCheck={handleCheck}
        handleCancel={handleCancel}
        handleUncheck={handleUncheck}
        handleQuantityChange={handleQuantityChange}
        handleMarkAsDone={handleMarkAsDone}
      />
    </div>
  );
};

export default PointOfSalePage;
