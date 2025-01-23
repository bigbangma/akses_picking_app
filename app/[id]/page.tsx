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
import { ArrowLeft, CheckIcon, Clock, PackageCheck, PackageX, StoreIcon, XIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

type Item = {
  id: number
  product_id: number
  product_name: string
  product_image: string
  demand_quantity: number
  done_quantity: number
}

export default function PointOfSalePage() {
  const { id } = useParams()
  const [todoItems, setTodoItems] = useState<Item[]>([])
  const [doneItems, setDoneItems] = useState<Item[]>([])

  useEffect(() => {
    // Fetch data from the endpoint
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/pos/${id}/transfers`)
        const data = await response.json()
        // setTodoItems(data.transfers[0].moves) // Assuming the data is an array of items
        // join all the transfers
        // const moves = data.transfers.map((transfer: {moves:Item[]}) => transfer.moves)
        // join all the moves with quantity of all the moves with same product id
        setTodoItems(data.transfers[data.transfers.length - 1].moves.map(
          (move: Item) => ({
            ...move,
            done_quantity: 0,
          })
        ))
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    fetchData()
  }, [id])

  const handleCheck = (item: Item) => {
    setTodoItems(todoItems.filter((i) => i.id !== item.id))
    setDoneItems([...doneItems, {
      ...item,
      done_quantity: item.done_quantity == 0 ? item.demand_quantity : item.done_quantity
    }])
  }

  const handleCancel = (item: Item) => {
    setTodoItems(todoItems.filter((i) => i.id !== item.id))
    setDoneItems([...doneItems, {
      ...item,
      done_quantity: 0 // Assuming the item is canceled
    }])
  }

  const handleUncheck = (item: Item) => {
    setDoneItems(doneItems.filter((i) => i.id !== item.id))
    setTodoItems([...todoItems, item])
  }

  const handleQuantityChange = (itemId: number, newQuantity: number) => {
    setTodoItems(todoItems.map((item) => 
      item.id === itemId ? { ...item, done_quantity: newQuantity } : item
    ))
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold mb-4 flex items-center"><StoreIcon className="w-6 h-6 mr-2" /> Point of Sale {id}</h1>
        <p className=" flex items-center mb-4"><Clock className="w-6 h-6 mr-2" /> {new Date().toLocaleDateString()}</p>
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
              <TabsTrigger className="h-8 px-8 rounded-full" value="done">Done ({doneItems.length})</TabsTrigger>
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
                          <Image src={"data:image/jpeg;base64,"+item.product_image || "/placeholder.svg"} alt={item.product_name} width={50} height={50} className="rounded-xl size-16 object-contain p-1 bg-slate-100 border" />
                          <p className="">
                            {item.product_name}
                            <Badge className="ml-2 p-0 border-none absolute top-2 right-2 text-gray-800 rounded-full text-md" variant="outline"> {item.demand_quantity}</Badge>
                          </p>
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
                {!doneItems.length ? (
                  <div className="flex gap-3 justify-center items-center h-32">
                    <PackageX size={40} strokeWidth={1} />
                    <p>No items have been checked</p>
                  </div>
                ) : (
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
                )}
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-center mt-10">
            <Button disabled={todoItems.length > 0} size={"lg"} className="text-lg py-6">
              Mark as Done <CheckIcon className="w-6 h-6 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}