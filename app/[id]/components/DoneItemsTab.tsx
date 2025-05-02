import ItemCard from "./ItemCard";
import { CheckIcon, PackageX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Item } from "./TodoItemsTab";

interface DoneItemsTabProps {
  todoItems: Item[];
  waitingItems: Item[];
  doneItems: Item[];
  waitingDoneItems: Item[];
  onUncheck: (item: Item) => void;
  onMarkAsDone: () => void;
}

export const DoneItemsTab = ({
  todoItems,
  waitingItems,
  doneItems,
  waitingDoneItems,
  onUncheck,
  onMarkAsDone,
}: DoneItemsTabProps) => {
  // const valid = (
  //             // if there is something done in todo or waiting
  //             (doneItems.length || waitingDoneItems.length) &&
  //             // if all the items in todo is completed or nothing at all
  //           (( doneItems.length == 0 && todoItems.length > 0 ||(doneItems.length > 0 && todoItems.length == 0)) &&
  //             // if all the items in waiting is completed or nothing at all
  //            ( waitingItems.length || waitingDoneItems.length ) ||
  //           (waitingDoneItems.length == 0 && waitingItems.length > 0 ||(waitingDoneItems.length > 0 && waitingItems.length == 0)) )
  //           )
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
        <div>

        {/* <p> todo items {todoItems.length}</p>
        <p> waiting items {waitingItems.length}</p>
        <p> done items {doneItems.length}</p>
        <p> waiting done items {waitingDoneItems.length}</p>


         <p>valid todo {
            ( doneItems.length == 0 && todoItems.length > 0 ||(doneItems.length > 0 && todoItems.length == 0)) ? "true" : "false"
          }</p>
          <p>valid waiting {
            ( waitingDoneItems.length == 0 && waitingItems.length > 0 ||(waitingDoneItems.length > 0 && waitingItems.length == 0)) ? "true" : "false"
          }</p>  */}



        </div>
        {
          // messages to let users understand why the button is disabled
          // !valid && (
          //   <p className="text-red-500 text-center">
          //     {doneItems.length == 0 && todoItems.length > 0
          //       ? "Marquer comme Terminé n'est pas disponible car il y a des articles en attente de traitement."
          //       : waitingDoneItems.length == 0 && waitingItems.length > 0
          //       ? "Marquer comme Terminé n'est pas disponible car il y a des articles en attente de traitement."
          //       : "Marquer comme Terminé n'est pas disponible car il y a des articles en attente de traitement."}
          //   </p>
          // )
        }
      <div className="flex justify-center mt-10">
        {
        <Button
          onClick={onMarkAsDone}
          disabled={    
            !(
              // doneItems.length || waitingDoneItems.length &&
              (((doneItems.length > 0) ? todoItems.length == 0 : true) &&
              ((waitingDoneItems.length > 0) ? waitingItems.length == 0 : true))
            ) || (doneItems.length == 0 && waitingDoneItems.length == 0)
          }
          size={"lg"}
          className="text-lg py-6"
        >
          Marquer comme Terminé <CheckIcon className="w-6 h-6 ml-2" />
        </Button>
        }
      </div>
    </div>
  );
};
