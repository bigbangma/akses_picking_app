import { useState } from "react";
import { Item } from "../components/TodoItemsTab";

export const useItemsManagement = () => {
  const [todoItems, setTodoItems] = useState<Item[]>([]);
  const [waitingItems, setWaitingItems] = useState<Item[]>([]);
  const [doneItems, setDoneItems] = useState<Item[]>([]);
  const [waitingDoneItems, setWaitingDoneItems] = useState<Item[]>([]);

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
          item.id === itemId
            ? { ...item, done_quantity: Math.max(newQuantity, 0) }
            : item,
        ),
      );
    } else {
      setWaitingItems((prev) =>
        prev.map((item) =>
          item.id === itemId
            ? { ...item, done_quantity: Math.max(newQuantity, 0) }
            : item,
        ),
      );
    }
  };

  return {
    todoItems,
    waitingItems,
    doneItems,
    setDoneItems,
    waitingDoneItems,
    setWaitingDoneItems,
    setTodoItems,
    setWaitingItems,
    handleCheck,
    handleCancel,
    handleUncheck,
    handleQuantityChange,
  };
};
