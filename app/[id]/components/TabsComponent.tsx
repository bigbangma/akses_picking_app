import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ListIcon, Check, Clock } from "lucide-react";
import { TodoItemsTab } from "./TodoItemsTab";
import { DoneItemsTab } from "./DoneItemsTab";
import { Item } from "@/components/PointOfSaleCard";

interface TabsComponentProps {
  todoItems: Item[];
  waitingItems: Item[];
  doneItems: Item[];
  waitingDoneItems: Item[];
  handleCheck: (item: Item) => void;
  handleCancel: (item: Item) => void;
  handleUncheck: (item: Item) => void;
  handleQuantityChange: (itemId: number, newQuantity: number) => void;
  handleMarkAsDone: () => void;
}

export const TabsComponent = ({
  todoItems,
  waitingItems,
  doneItems,
  waitingDoneItems,
  handleCheck,
  handleCancel,
  handleUncheck,
  handleQuantityChange,
  handleMarkAsDone,
}: TabsComponentProps) => {
  return (
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
        <TodoItemsTab
          items={todoItems}
          onCheck={handleCheck}
          onCancel={handleCancel}
          onQuantityChange={handleQuantityChange}
          emptyMessage="Tous les articles ont été traités"
        />
      </TabsContent>

      <TabsContent value="done">
        <DoneItemsTab
          doneItems={doneItems}
          waitingDoneItems={waitingDoneItems}
          onUncheck={handleUncheck}
          onMarkAsDone={handleMarkAsDone}
        />
      </TabsContent>

      {waitingItems.length > 0 && (
        <TabsContent value="waiting">
          <TodoItemsTab
            items={waitingItems}
            onCheck={handleCheck}
            onCancel={handleCancel}
            onQuantityChange={handleQuantityChange}
            emptyMessage="Tous les articles ont été traités"
          />
        </TabsContent>
      )}
    </Tabs>
  );
};
