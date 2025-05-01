import { Item } from "../components/TodoItemsTab";
import { API_ENDPOINT, Transfer } from "../hooks/useTransfers";

export const confirmTransfer = async (transfer: Transfer, items: Item[]) => {
  const isAllDone = transfer.moves.every((move) => {
    return (
      items.some((item) => item.product_id === move.product_id) ||
      move.done_quantity > 0
    );
  });


  console.log("Moves before confirmation:", transfer.moves);

  return fetch(`${API_ENDPOINT}/transfer/${transfer.id}/confirm`, {
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

export const distributeDoneQuantity = (
  items: Item[],
  transfers: Transfer[],
  backorder: boolean,
) => {
  const updatedTransfers = [...transfers];

  items.forEach((doneItem) => {
    // Use the actual done_quantity from the item, which will be 0 for canceled items
    let remainingQuantity = doneItem.done_quantity;

    const relevantTransfers = updatedTransfers.filter(
      (transfer) =>
        (backorder ? transfer.backorder_id : !transfer.backorder_id) &&
        transfer.moves.some((move) => move.product_id === doneItem.product_id),
    );

    relevantTransfers.forEach((transfer) => {
      const move = transfer.moves.find(
        (move) => move.product_id === doneItem.product_id,
      );
      if (move) {
        // Only assign quantity if there's something to assign
        if (remainingQuantity > 0) {
          const quantityToAssign = Math.min(
            move.demand_quantity,
            remainingQuantity,
          );
          move.done_quantity = quantityToAssign;
          remainingQuantity -= quantityToAssign;
        } else {
          // Explicitly set to 0 for canceled items
          move.done_quantity = 0;
        }
      }
    });
  });

  return updatedTransfers;
};
