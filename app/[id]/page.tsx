"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { ArrowLeft, CheckIcon, Package, PackageCheck, PackageX, StoreIcon, XIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Item, Transfer } from "@/components/PointOfSaleCard"


export default function PointOfSalePage() {
  const { id } = useParams()
  const [todoItems, setTodoItems] = useState<Item[]>([])
  const [waitingItems, setWaitingItems] = useState<Item[]>([])
  const [doneItems, setDoneItems] = useState<Item[]>([])
  const [waitingDoneItems, setWaitingDoneItems] = useState<Item[]>([])
  const [transfers, setTransfers] = useState<Transfer[]>([])

useEffect(() => {
  // Fetch data from the endpoint
  const fetchData = async () => {
    try {
      const response = await fetch(`/api/pos/${id}/transfers`);
      const data = await response.json();
      console.log(data)
      setTransfers(data.transfers);
      // Use a map to accumulate quantities for each product_id
      const productMap = new Map();
      const productMap2 = new Map(); // for waiting items that comes from backorder

      // get only transfers that are not backorder
      data.transfers
      .filter((t:{state:string})=>t.state !== "done")
      .forEach((transfer: { moves: Item[], backorder_id:number }) => {
        if(!transfer.backorder_id){
          transfer.moves.forEach((move: Item) => {
            if (productMap.has(move.product_id)) {
              // If the product_id already exists in the map, update the quantity
              const existingItem = productMap.get(move.product_id);
              existingItem.demand_quantity += move.demand_quantity;
            } else {
              // If the product_id doesn't exist, add it to the map
              productMap.set(move.product_id, { ...move, backorder:false });
            }
          });
        }else{
          transfer.moves.forEach((move: Item) => {
            if (productMap2.has(move.product_id)) {
              // If the product_id already exists in the map, update the quantity
              const existingItem = productMap2.get(move.product_id);
              existingItem.demand_quantity += move.demand_quantity;
            } else {
              // If the product_id doesn't exist, add it to the map
              productMap2.set(move.product_id, { ...move, backorder:true });
            }
          });
        }
      });

      // Convert the map values to an array
      const uniqueProducts = Array.from(productMap.values());
      const uniqueProducts2 = Array.from(productMap2.values());


    console.log("backorder count", 
      data.transfers.filter((t:{state:string})=>t.state !== "done")
      .filter((t:{backorder_id:number})=>t.backorder_id)
      .length
    )
    console.log("normal count", 
      data.transfers.filter((t:{state:string})=>t.state !== "done")
      .filter((t:{backorder_id:number})=>!t.backorder_id)
      .length
    )


      // Set the state with the unique products
      setTodoItems(uniqueProducts);
      setWaitingItems(uniqueProducts2);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  fetchData();
}, [id]);

  const handleCheck = (item: Item) => {
    if(!item.backorder){
    setTodoItems(todoItems.filter((i) => i.id !== item.id))
    setDoneItems([...doneItems, {
      ...item,
      done_quantity: item.done_quantity == 0 ? item.demand_quantity : item.done_quantity
    }])
    }else{
      setWaitingItems(waitingItems.filter((i) => i.id !== item.id))
      setWaitingDoneItems([... waitingDoneItems, {
        ...item,
        done_quantity: item.done_quantity == 0 ? item.demand_quantity : item.done_quantity
      }])
    }
  }

  const handleCancel = (item: Item) => {
    if(!item.backorder){
    setTodoItems(todoItems.filter((i) => i.id !== item.id))
    setDoneItems([...doneItems, {
      ...item,
      done_quantity: 0 // Assuming the item is canceled
    }])
    }else{
      setWaitingItems(waitingItems.filter((i) => i.id !== item.id))
      setWaitingDoneItems([... waitingDoneItems,{
        ...item,
        done_quantity: 0 // Assuming the item is canceled
      }])
    }
  }

  const handleUncheck = (item: Item) => {
    if(!item.backorder){
      setDoneItems(doneItems.filter((i) => i.id !== item.id))
      setTodoItems([...todoItems, item])
    }else{
      setWaitingDoneItems(waitingDoneItems.filter((i) => i.id !== item.id))
      setWaitingItems([...waitingItems, item])
    }
  }

  const handleQuantityChange = (itemId: number, newQuantity: number) => {
    const from = todoItems.find(item => item.id === itemId) ? "todo" : "waiting"
    if(from === "todo"){
      setTodoItems(todoItems.map((item) => 
        item.id === itemId ? { ...item, done_quantity: newQuantity } : item
      ))
    }else{
      setWaitingItems(waitingItems.map((item) =>
        item.id === itemId ? { ...item, done_quantity: newQuantity } : item
      ))
    }
  }

const handleMarkAsDone = () => {
  // Create a copy of the transfers to avoid mutating the state directly
  const updatedTransfers = [...transfers.filter((t) => t.state !== "done")];

  function normalTransfer() {
    // Iterate through each product in the doneItems
    doneItems.forEach((doneItem) => {
      let remainingQuantity = doneItem.done_quantity;

      // Find all transfers that contain this product and are not backorders
      const relevantTransfers = updatedTransfers
        .filter((transfer) => !transfer.backorder_id)
        .filter((transfer) =>
          transfer.moves.some((move) => move.product_id === doneItem.product_id)
        );

      // Distribute the done_quantity across the relevant transfers
      relevantTransfers.forEach((transfer) => {
        const move = transfer.moves.find((move) => move.product_id === doneItem.product_id);
        if (move && remainingQuantity > 0) {
          const quantityToAssign = Math.min(move.demand_quantity, remainingQuantity);
          move.done_quantity = quantityToAssign;
          remainingQuantity -= quantityToAssign;
        }
      });
    });

    // Confirm the updated transfers
    updatedTransfers
    .filter((transfer) => !transfer.backorder_id)
    .forEach((transfer) => {
      fetch(`/api/pos/transfer/${transfer.id}/confirm`, {
        method: "POST",
        body: JSON.stringify({
          id: transfer.id,
          state: "done",
          body: {
            moves: [
              ...transfer.moves.map((move) => ({
                id: move.id,
                quantity: move.done_quantity,
              })),
            ],
          },
        }),
      });
    });
  }

  function backorderTransfer() {

    // Iterate through each product in the doneItems
    waitingDoneItems.forEach((doneItem) => {
      let remainingQuantity = doneItem.done_quantity;

      // Find all transfers that contain this product and are backorders
      const relevantTransfers = updatedTransfers
        .filter((transfer) => transfer.backorder_id)
        .filter((transfer) =>
          transfer.moves.some((move) => move.product_id === doneItem.product_id)
        );

      // Distribute the done_quantity across the relevant backorder transfers
      relevantTransfers.forEach((transfer) => {
        const move = transfer.moves.find((move) => move.product_id === doneItem.product_id);
        if (move && remainingQuantity > 0) {
          const quantityToAssign = Math.min(move.demand_quantity, remainingQuantity);
          move.done_quantity = quantityToAssign;
          remainingQuantity -= quantityToAssign;
        }
      });
    });

    // Confirm the updated backorder transfers
    updatedTransfers
    .filter((transfer) => transfer.backorder_id)
    .forEach((transfer) => {
      fetch(`/api/pos/transfer/${transfer.id}/confirm`, {
        method: "POST",
        body: JSON.stringify({
          id: transfer.id,
          state: "done",
          body: {
            moves: [
              ...transfer.moves.map((move) => ({
                id: move.id,
                quantity: move.done_quantity,
              })),
            ],
          },
        }),
      });
    });
  }

  // Determine which transfer function to call based on the presence of backorders

  if(waitingDoneItems.length > 0){
    backorderTransfer()
  }
  if(doneItems.length > 0){
    normalTransfer()
  }

  setDoneItems([]);
  setTodoItems([]);
  setWaitingItems([]);
  setWaitingDoneItems([]);
  // Clear the todo and done items
  setTimeout(() => {
    window.location.reload();
  }, 1000);
};


  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold mb-4 flex items-center"><StoreIcon className="w-6 h-6 mr-2" /> Point of Sale {id}</h1>
        <div>
          <Link href={`/done/${id}`}>
            <Button variant="outline" className="mb-4 bg-transparent">
              POS transfers
            </Button>
          </Link>
        </div>
      </div>
      <Link href="/">
        <Button variant="outline" className="mb-4">
          <ArrowLeft className="w-6 h-6 mr-2" />
          Back
        </Button>
      </Link>
      <div className="">
        <div>
          <Tabs defaultValue="todo" className="w-full">
            <TabsList className="bg-slate-200 rounded-full mx-auto w-fit flex justify-center">
              <TabsTrigger className="h-8 px-8 rounded-full" value="todo">Todo ({todoItems.length})</TabsTrigger>
              <TabsTrigger className="h-8 px-8 rounded-full" value="done">Done ({doneItems.length + waitingDoneItems.length})</TabsTrigger>
              <TabsTrigger className="h-8 px-8 rounded-full" value="waiting">
                Backorders ({waitingItems.length})
              </TabsTrigger>
            </TabsList>
            <TabsContent value="todo" className="w-full">
              <div className="space-y-2">
                {!todoItems.length ? (
                  <div className="flex gap-3 justify-center items-center h-32">
                    <PackageCheck size={40} strokeWidth={1} />
                    <p>All items have been checked</p>
                  </div>
                ) : (
                  todoItems&& 
                  todoItems.map((item) => (
                    <Card key={item.id} className="relative">
                      <CardContent className="p-4 flex flex-col justify-between ">
                        <div className="flex flex-1  space-x-4">
                          <Image src={"data:image/jpeg;base64,"+item.product_image || "/placeholder.svg"} alt={item.product_name} width={50} height={50} className="rounded-xl size-16 object-contain p-1 bg-white border" />
                          <div>
                            <p className="">
                              {item.product_name}
                              <Badge className="ml-2 p-0 border-none absolute top-2 right-2 text-gray-800 rounded-full text-md" variant="outline"> {item.demand_quantity}</Badge>
                            </p>
                            <p className="flex items-center gap-1 bg-slate-50 rounded-xl border w-fit px-3">{item.product_available_qty??0} <Package size={18} /></p>
                          </div>
                        </div>
                        <div className="flex gap-2 items-center">
                          <Input
                            type="number"
                            value={item.done_quantity}
                            onChange={(e) => handleQuantityChange(item.id, Math.min(Number.parseInt(e.target.value), item.demand_quantity))}
                            className="w-20 ml-auto"
                            max={item.demand_quantity}
                          />
                          <Button size={"icon"} onClick={() => handleCheck(item)}>
                            <CheckIcon className="w-6 h-6" />
                          </Button>
                          <Button className="ml-3" variant="destructive" size={"icon"} onClick={() => handleCancel(item)}>
                            <XIcon className="w-6 h-6" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>
            <TabsContent value="done">
              <div className="space-y-2">
                {!doneItems.length && !waitingDoneItems.length ? (
                  <div className="flex gap-3 justify-center items-center h-32">
                    <PackageX size={40} strokeWidth={1} />
                    <p>No items have been checked</p>
                  </div>
                ) : (
                  <>
                  {
                  doneItems &&
                  doneItems.length > 0 &&
                  <h4 className="text-lg font-medium">New Items</h4>
                  }
                  {
                  doneItems &&
                  doneItems.map((item) => (
                    <Card key={item.id}>
                      <CardContent className="p-4 flex justify-between items-center text-gray-500">
                        <div className="flex items-center space-x-4">
                          <Image src={"data:image/png;base64," + item.product_image || "/placeholder.svg"} alt={item.product_name} width={50} height={50} className="rounded-xl size-12 object-contain p-1 bg-slate-100 border" />
                          <div>
                            <p className="font-medium">{item.product_name}
                              <Badge variant="secondary" className={cn("text-sm ml-2 rounded-full",
                                (item.done_quantity == 0 && "bg-red-500 text-white hover:bg-red-600"),
                                (item.done_quantity != 0 && "bg-yellow-500 text-black hover:bg-yellow-600"),
                                (item.done_quantity == item.demand_quantity && "bg-green-500 text-white hover:bg-green-600")
                              )}>
                                {item.done_quantity}
                                {item.demand_quantity != item.done_quantity && <span className="ml-1"> / {item.demand_quantity}</span>}
                              </Badge>
                            </p>
                          </div>
                        </div>
                        <Checkbox className="w-6 h-6" checked={true} onCheckedChange={() => handleUncheck(item)} />
                      </CardContent>
                    </Card>
                  ))
                  }
                  {
                  waitingDoneItems &&
                  waitingDoneItems.length > 0 &&
                  <h4 className="text-lg font-medium">Backorders Items</h4>
                  }
                  {
                  waitingDoneItems &&
                  waitingDoneItems.map((item) => (
                    <Card key={item.id}>
                      <CardContent className="p-4 flex justify-between items-center text-gray-500">
                        <div className="flex items-center space-x-4">
                          <Image src={"data:image/png;base64," + item.product_image || "/placeholder.svg"} alt={item.product_name} width={50} height={50} className="rounded-xl size-12 object-contain p-1 bg-slate-100 border" />
                          <div>
                            <p className="font-medium">{item.product_name}
                              <Badge variant="secondary" className={cn("text-sm ml-2 rounded-full",
                                (item.done_quantity == 0 && "bg-red-500 text-white hover:bg-red-600"),
                                (item.done_quantity != 0 && "bg-yellow-500 text-black hover:bg-yellow-600"),
                                (item.done_quantity == item.demand_quantity && "bg-green-500 text-white hover:bg-green-600")
                              )}>
                                {item.done_quantity}
                                {item.demand_quantity != item.done_quantity && <span className="ml-1"> / {item.demand_quantity}</span>}
                              </Badge>
                            </p>
                          </div>
                        </div>
                        <Checkbox className="w-6 h-6" checked={true} onCheckedChange={() => handleUncheck(item)} />
                      </CardContent>
                    </Card>
                  ))
                  }
                  </>
                )}
              </div>

          <div className="flex justify-center mt-10">
            <Button
             onClick={handleMarkAsDone}
             disabled={(doneItems.length ==0) && (waitingDoneItems.length ==0)} size={"lg"} className="text-lg py-6">
              Mark as Done <CheckIcon className="w-6 h-6 ml-2" />
            </Button>
          </div>
            </TabsContent>
            <TabsContent value="waiting">
              <div className="space-y-2 flex-col flex justify-center items-center ">
                {
                  !waitingItems.length ? (
                    <div className="flex gap-3 justify-center items-center h-32">
                      <PackageX size={40} strokeWidth={1} />
                      <p>No items have been checked</p>
                    </div>
                  ) : (
                    waitingItems.map((item) => (
                      <Card key={item.id} className="w-full">
                        <CardContent className="p-4 relative flex justify-between items-center ">
                        <div className="flex flex-1  space-x-4">
                          <Image src={"data:image/jpeg;base64,"+item.product_image || "/placeholder.svg"} alt={item.product_name} width={50} height={50} className="rounded-xl size-16 object-contain p-1 bg-white border" />
                          <div>
                            <p className="">
                              {item.product_name}
                              <Badge className="ml-2 p-0 border-none absolute top-2 right-2  rounded-full text-md" variant="outline"> {item.demand_quantity}</Badge>
                            </p>
                            <p className="flex items-center gap-1 bg-slate-50 rounded-xl border w-fit px-3">{400} <Package size={18} /></p>
                          </div>
                        </div>
                        <div className="flex gap-2 items-center">
                          <Input
                            type="number"
                            value={item.done_quantity}
                            onChange={(e) => handleQuantityChange(item.id, Math.min(Number.parseInt(e.target.value), item.demand_quantity))}
                            className="w-20 ml-auto"
                            max={item.demand_quantity}
                          />
                          <Button size={"icon"} onClick={() => handleCheck(item)}>
                            <CheckIcon className="w-6 h-6" />
                          </Button>
                          <Button className="ml-3" variant="destructive" size={"icon"} onClick={() => handleCancel(item)}>
                            <XIcon className="w-6 h-6" />
                          </Button>
                        </div>
                        </CardContent>
                      </Card>
                    ))
                  )


                }
              </div>
            </TabsContent>
          </Tabs>

        </div>
      </div>
    </div>
  )
}