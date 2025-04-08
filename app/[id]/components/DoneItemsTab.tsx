import { Item } from "@/components/PointOfSaleCard";
import ItemCard from "./ItemCard";
import { CheckIcon, PackageX } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DoneItemsTabProps {
  doneItems: Item[];
  waitingDoneItems: Item[];
  onUncheck: (item: Item) => void;
  onMarkAsDone: () => void;
}

export const DoneItemsTab = ({
  doneItems,
  waitingDoneItems,
  onUncheck,
  onMarkAsDone,
}: DoneItemsTabProps) => {
  return (
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
          {[...doneItems].reverse().map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              done
              onUncheck={onUncheck}
              onQuantityChange={() => {}}
              onCheck={() => {}}
              onCancel={() => {}}
            />
          ))}
          {waitingDoneItems.length > 0 && (
            <h4 className="text-lg font-medium">Articles en Reliquat</h4>
          )}
          {[...waitingDoneItems].reverse().map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              done
              onUncheck={onUncheck}
              onQuantityChange={() => {}}
              onCheck={() => {}}
              onCancel={() => {}}
            />
          ))}
        </>
      )}
      <div className="flex justify-center mt-10">
        <Button
          onClick={onMarkAsDone}
          disabled={!doneItems.length && !waitingDoneItems.length}
          size={"lg"}
          className="text-lg py-6"
        >
          Marquer comme Terminé <CheckIcon className="w-6 h-6 ml-2" />
        </Button>
      </div>
    </div>
  );
};
