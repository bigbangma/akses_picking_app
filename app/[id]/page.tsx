"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Check,
  CheckIcon,
  Clock,
  Layers,
  ListIcon,
  PackageCheck,
  PackageX,
  StoreIcon,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Item, Transfer } from "@/components/PointOfSaleCard";
import ItemCard from "./components/ItemCard";
import useTransfers, { API_ENDPOINT } from "./hooks/useTransfers";

const PointOfSalePage = () => {
  const { id } = useParams();
  const { transfers, loading, error } = useTransfers(id as string);
  const [todoItems, setTodoItems] = useState<Item[]>([]);
  const [waitingItems, setWaitingItems] = useState<Item[]>([]);
  const [doneItems, setDoneItems] = useState<Item[]>([]);
  const [waitingDoneItems, setWaitingDoneItems] = useState<Item[]>([]);

  useEffect(() => {
    if (loading) return;
    if (!transfers) return;
    if (!transfers.length) return;

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

  const handleCheck = (item: Item) => {
    if (item.backorder) {
      setWaitingItems((prev) => prev.filter((i) => i.id !== item.id));
      setWaitingDoneItems((prev) => [
        ...prev,
        {
          ...item,
          done_quantity:
            item.done_quantity === 0
              ? item.demand_quantity
              : item.done_quantity,
        },
      ]);
    } else {
      setTodoItems((prev) => prev.filter((i) => i.id !== item.id));
      setDoneItems((prev) => [
        ...prev,
        {
          ...item,
          done_quantity:
            item.done_quantity === 0
              ? item.demand_quantity
              : item.done_quantity,
        },
      ]);
    }
  };

  const handleCancel = (item: Item) => {
    if (item.backorder) {
      setWaitingItems((prev) => prev.filter((i) => i.id !== item.id));
      setWaitingDoneItems((prev) => [...prev, { ...item, done_quantity: 0 }]);
    } else {
      setTodoItems((prev) => prev.filter((i) => i.id !== item.id));
      setDoneItems((prev) => [...prev, { ...item, done_quantity: 0 }]);
    }
  };

  const handleUncheck = (item: Item) => {
    if (item.backorder) {
      setWaitingDoneItems((prev) => prev.filter((i) => i.id !== item.id));
      setWaitingItems((prev) => [...prev, { ...item, done_quantity: 0 }]);
    } else {
      setDoneItems((prev) => prev.filter((i) => i.id !== item.id));
      setTodoItems((prev) => [...prev, { ...item, done_quantity: 0 }]);
    }
  };

  const handleQuantityChange = (itemId: number, newQuantity: number) => {
    const isTodoItem = todoItems.some((item) => item.id === itemId);

    if (isTodoItem) {
      setTodoItems((prev) =>
        prev.map((item) =>
          item.id === itemId ? { ...item, done_quantity: newQuantity } : item,
        ),
      );
    } else {
      setWaitingItems((prev) =>
        prev.map((item) =>
          item.id === itemId ? { ...item, done_quantity: newQuantity } : item,
        ),
      );
    }
  };

  const handleMarkAsDone = async () => {
    const updatedTransfers = transfers.filter((t) => t.state !== "done");

    const confirmTransfer = async (transfer: Transfer) => {
      const isBackorder = !!transfer.backorder_id;
      const workingItems = isBackorder ? waitingDoneItems : doneItems;

      const isAllDone = transfer.moves.every((move) => {
        return (
          workingItems.some((item) => item.product_id === move.product_id) ||
          move.done_quantity > 0
        );
      });

      await fetch(`${API_ENDPOINT}/transfer/${transfer.id}/confirm`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: transfer.id,
          state: isAllDone ? "done" : "assigned",
          body: {
            moves: transfer.moves.map((move) => ({
              id: move.id,
              quantity: move.done_quantity,
            })),
          },
        }),
      });
    };

    const distributeDoneQuantity = (items: Item[], backorder: boolean) => {
      items.forEach((doneItem) => {
        let remainingQuantity = doneItem.done_quantity;

        const relevantTransfers = updatedTransfers.filter(
          (transfer) =>
            (backorder ? transfer.backorder_id : !transfer.backorder_id) &&
            transfer.moves.some(
              (move) => move.product_id === doneItem.product_id,
            ),
        );

        relevantTransfers.forEach((transfer) => {
          const move = transfer.moves.find(
            (move) => move.product_id === doneItem.product_id,
          );
          if (move && remainingQuantity > 0) {
            const quantityToAssign = Math.min(
              move.demand_quantity,
              remainingQuantity,
            );
            move.done_quantity = quantityToAssign;
            remainingQuantity -= quantityToAssign;
          }
        });
      });
    };

    if (doneItems.length > 0) {
      distributeDoneQuantity(doneItems, false);
    }

    if (waitingDoneItems.length > 0) {
      distributeDoneQuantity(waitingDoneItems, true);
    }

    await Promise.all(
      updatedTransfers.map(async (transfer) => {
        if (
          (transfer.backorder_id && waitingDoneItems.length > 0) ||
          (!transfer.backorder_id && doneItems.length > 0)
        ) {
          await confirmTransfer(transfer);
        }
      }),
    );

    setDoneItems([]);
    setTodoItems([]);
    setWaitingItems([]);
    setWaitingDoneItems([]);

    setTimeout(() => window.location.reload(), 3000);
  };

  if (loading)
    return (
      <div className="flex min-h-screen items-center justify-center">
        Chargement...
      </div>
    );
  if (error)
    return (
      <div className="flex min-h-screen items-center justify-center">
        Erreur: {error}
      </div>
    );

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold mb-4 flex items-center">
          <StoreIcon className="w-6 h-6 mr-2" /> Point de Vente {id}
        </h1>
        <div>
          <Link href={`/done/${id}`}>
            <Button variant="outline" className="mb-4 bg-transparent">
              <Layers className="w-6 h-6 mr-2" />
              Commandes
            </Button>
          </Link>
        </div>
      </div>
      <Link href="/">
        <Button variant="outline" className="mb-4">
          <ArrowLeft className="w-6 h-6 mr-2" />
          Retour
        </Button>
      </Link>
      <Tabs defaultValue="todo" className="w-full">
        <TabsList className="bg-slate-200 rounded-full mx-auto w-fit flex justify-center">
          <TabsTrigger className="h-8 px-8 rounded-full" value="todo">
            <ListIcon className="w-4 h-4 mr-2" /> À Faire{" "}
            {todoItems.length > 0 ? todoItems.length : ""}
          </TabsTrigger>
          <TabsTrigger className="h-8 px-8 rounded-full" value="done">
            <Check className="w-4 h-4 mr-2" /> Terminé{" "}
            {doneItems.length + waitingDoneItems.length > 0
              ? doneItems.length + waitingDoneItems.length
              : ""}
          </TabsTrigger>
          {waitingItems.length > 0 && (
            <TabsTrigger className="h-8 px-8 rounded-full" value="waiting">
              <Clock className="w-4 h-4 mr-2" /> Reliquats{" "}
              {waitingItems.length ?? ""}
            </TabsTrigger>
          )}
        </TabsList>
        <TabsContent value="todo" className="w-full">
          <div className="space-y-2">
            {!todoItems.length ? (
              <div className="flex gap-3 justify-center items-center h-32">
                <PackageCheck size={40} strokeWidth={1} />
                <p> Tous les articles ont été traités</p>
              </div>
            ) : (
              todoItems.map((item) => (
                <ItemCard
                  key={item.id}
                  item={item}
                  onCheck={handleCheck}
                  onCancel={handleCancel}
                  onUncheck={handleUncheck}
                  onQuantityChange={handleQuantityChange}
                />
              ))
            )}
          </div>
        </TabsContent>
        <TabsContent value="done">
          <div className="space-y-2">
            {!doneItems.length && !waitingDoneItems.length ? (
              <div className="flex gap-3 justify-center items-center h-32">
                <PackageX size={40} strokeWidth={1} />
                <p>Panier vide, ajoutez des articles</p>
              </div>
            ) : (
              <>
                {doneItems.length > 0 && (
                  <h4 className="text-lg font-medium">Nouveaux Articles</h4>
                )}
                {[
                  ...doneItems.map((item) => (
                    <ItemCard
                      key={item.id}
                      item={item}
                      done
                      onCheck={handleCheck}
                      onCancel={handleCancel}
                      onQuantityChange={handleQuantityChange}
                      onUncheck={handleUncheck}
                    />
                  )),
                ].reverse()}
                {waitingDoneItems.length > 0 && (
                  <h4 className="text-lg font-medium">Articles en Reliquat</h4>
                )}
                {[
                  ...waitingDoneItems.map((item) => (
                    <ItemCard
                      key={item.id}
                      item={item}
                      done
                      onCheck={handleCheck}
                      onCancel={handleCancel}
                      onQuantityChange={handleQuantityChange}
                      onUncheck={handleUncheck}
                    />
                  )),
                ].reverse()}
              </>
            )}
          </div>
          <div className="flex justify-center mt-10">
            <Button
              onClick={handleMarkAsDone}
              disabled={!doneItems.length && !waitingDoneItems.length}
              size={"lg"}
              className="text-lg py-6"
            >
              Marquer comme Terminé <CheckIcon className="w-6 h-6 ml-2" />
            </Button>
          </div>
        </TabsContent>
        <TabsContent value="waiting">
          <div className="space-y-2 flex-col flex justify-center ">
            {!waitingItems.length ? (
              <div className="flex gap-3 justify-center items-center h-32">
                <PackageCheck size={40} strokeWidth={1} />
                <p> Tous les articles ont été traités</p>
              </div>
            ) : (
              waitingItems.map((item) => (
                <ItemCard
                  key={item.id}
                  item={item}
                  onCheck={handleCheck}
                  onCancel={handleCancel}
                  onQuantityChange={handleQuantityChange}
                  onUncheck={handleUncheck}
                />
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PointOfSalePage;
