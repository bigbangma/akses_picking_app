import { Item } from "@/components/PointOfSaleCard";
import { PackageCheck } from "lucide-react";
import ItemCard from "./ItemCard";

interface TodoItemsTabProps {
  items: Item[];
  onCheck: (item: Item) => void;
  onCancel: (item: Item) => void;
  onQuantityChange: (itemId: number, newQuantity: number) => void;
  emptyMessage: string;
  emptyIcon?: React.ReactNode;
}

export const TodoItemsTab = ({
  items,
  onCheck,
  onCancel,
  onQuantityChange,
  emptyMessage,
  emptyIcon = <PackageCheck size={40} strokeWidth={1} />,
}: TodoItemsTabProps) => {
  if (!items.length) {
    return (
      <div className="flex gap-3 justify-center items-center h-32">
        {emptyIcon}
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {items.map((item) => (
        <ItemCard
          key={item.id}
          item={item}
          onCheck={onCheck}
          onCancel={onCancel}
          onQuantityChange={onQuantityChange}
          onUncheck={() => {}}
        />
      ))}
    </div>
  );
};
