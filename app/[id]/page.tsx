"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { ArrowLeft, CheckIcon,  Clock,  PackageCheck,  PackageX,  StoreIcon,  XIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"


const items = [
  { id: 1, name: "Paper Towels", quantity: 30,quantityOut:0, image: "/placeholder.svg?height=50&width=50" },
  { id: 2, name: "Dish Soap", quantity: 50,quantityOut:0, image: "/placeholder.svg?height=50&width=50" },
  { id: 3, name: "Trash Bags", quantity: 30,quantityOut:0, image: "/placeholder.svg?height=50&width=50" },
  { id: 4, name: "Cleaning Spray", quantity: 20,quantityOut:0, image: "/placeholder.svg?height=50&width=50" },
  { id: 5, name: "Sponges", quantity: 50, quantityOut:0,  image: "/placeholder.svg?height=50&width=50" },
  { id: 6, name: "Toilet Paper", quantity: 40, quantityOut:0, image: "/placeholder.svg?height=50&width=50" },
  { id: 7, name: "Hand Soap", quantity: 30, quantityOut:0, image: "/placeholder.svg?height=50&width=50" },
  { id: 8, name: "Laundry Detergent", quantity: 20, quantityOut:0, image: "/placeholder.svg?height=50&width=50" },
  { id: 9, name: "Bleach", quantity: 20, quantityOut:0, image: "/placeholder.svg?height=50&width=50" },
  { id: 10, name: "Dishwasher Detergent", quantity: 20, quantityOut:0, image: "/placeholder.svg?height=50&width=50" },
  { id: 11, name: "Fabric Softener", quantity: 20, quantityOut:0, image: "/placeholder.svg?height=50&width=50" },
  { id: 12, name: "All-Purpose Cleaner", quantity: 20, quantityOut:0, image: "/placeholder.svg?height=50&width=50" },
  { id: 13, name: "Glass Cleaner", quantity: 20, quantityOut:0, image: "/placeholder.svg?height=50&width=50" },
  { id: 14, name: "Air Freshener", quantity: 20, quantityOut:0, image: "/placeholder.svg?height=50&width=50" },
  { id: 15, name: "Toilet Bowl Cleaner", quantity: 20, quantityOut:0, image: "/placeholder.svg?height=50&width=50" },
  { id: 16, name: "Disinfecting Wipes", quantity: 20, quantityOut:0, image: "/placeholder.svg?height=50&width=50" },
  { id: 17, name: "Stain Remover", quantity: 20, quantityOut:0, image: "/placeholder.svg?height=50&width=50" },
  { id: 18, name: "Oven Cleaner", quantity: 20, quantityOut:0, image: "/placeholder.svg?height=50&width=50" },
  { id: 19, name: "Drain Cleaner", quantity: 20, quantityOut:0, image: "/placeholder.svg?height=50&width=50" },
  { id: 20, name: "Carpet Cleaner", quantity: 20, quantityOut:0, image: "/placeholder.svg?height=50&width=50" },
]

const pointsOfSale = [
  { id: 1, name: "Cashier 1", date: "2023-07-15" },
  { id: 2, name: "Cashier 2", date: "2023-07-16" },
  { id: 3, name: "Self-Checkout", date: "2023-07-17" },
]

export default function PointOfSalePage() {
  const { id } = useParams()
  const [todoItems, setTodoItems] = useState(items)
  const [doneItems, setDoneItems] = useState<typeof items>([])

  const handleCheck = (item: (typeof items)[0]) => {
    setTodoItems(todoItems.filter((i) => i.id !== item.id))
    setDoneItems([...doneItems, {
      ...item,
      quantityOut: item.quantityOut == 0 ? item.quantity : item.quantityOut
    }])
  }
  const handleCancel = (item: (typeof items)[0]) => {
    setTodoItems(todoItems.filter((i) => i.id !== item.id))
    setDoneItems([...doneItems, {
      ...item,
      quantityOut: 0
    }])
  }

  const handleUncheck = (item: (typeof items)[0]) => {
    setDoneItems(doneItems.filter((i) => i.id !== item.id))
    setTodoItems([...todoItems, item])
  }

  const handleQuantityChange = (itemId: number, newQuantity: number) => {
    setTodoItems(todoItems.map((item) => (item.id === itemId ? { ...item, quantityOut: newQuantity } : item)))
  }

  const pos = pointsOfSale.find((pos) => pos.id === Number(id))

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold mb-4 flex items-center"><StoreIcon className="w-6 h-6 mr-2" /> Point of Sale {id}</h1>
        <p className="text-lg flex items-center mb-4"><Clock className="w-6 h-6 mr-2" /> {pos?.date}</p>
      </div>
      <Link href="/">
        <Button variant="outline" className="mb-4">
          <ArrowLeft className="w-6 h-6 mr-2" />
          Back
        </Button>
      </Link>
      <div className="">
        <div>

<Tabs defaultValue="todo"  className="w-full">
  <TabsList className="bg-slate-200 rounded-full mx-auto w-fit flex justify-center">
    <TabsTrigger className="h-8 px-8 rounded-full" value="todo">Todo ({todoItems.length})</TabsTrigger>
    <TabsTrigger className="h-8 px-8 rounded-full" value="done">Done ({doneItems.length})</TabsTrigger>
  </TabsList>
  <TabsContent value="todo" className="w-full">
<div className="space-y-2">
            {
              !todoItems.length ?
              <div className="flex gap-3 justify-center items-center h-32">
                <PackageCheck size={40} strokeWidth={1}/>
                <p>All items have been checked</p>
              </div>
              :
            todoItems.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-4 flex justify-between items-center">
                  <div className="flex flex-1 items-center space-x-4">
                    <Image src={item.image || "/placeholder.svg"} alt={""} width={50} height={50} className="rounded-xl bg-slate-100 border"/>
                      <p className="font-medium">{item.name}
                        <Badge className="ml-2 text-sm rounded-full" variant="outline" > {item.quantity}</Badge>
                      </p>
                  </div>
                  <div className="flex gap-2 items-center">
                          <Input
                            type="number"
                            value={item.quantityOut}
                            onChange={(e) => handleQuantityChange(item.id, 
                            Math.min(
                            Number.parseInt(e.target.value),
                            item.quantity
                            )
                            )}
                            className="w-20 ml-auto"
                            max={item.quantity}
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
            ))}
          </div>
  </TabsContent>
  <TabsContent value="done">
<div className="space-y-2">
            {
              !doneItems.length ?
              <div className="flex gap-3 justify-center items-center h-32">
                <PackageX size={40} strokeWidth={1}/>
                <p>No items have been checked</p>
              </div>
              :
            doneItems.map((item) => (
              <Card key={item.id} >
                <CardContent className="p-4 flex justify-between items-center text-gray-500">
                  <div className="flex items-center space-x-4">
                    <Image
                      src={item.image || "/placeholder.svg"}
                      alt={""}
                      width={50}
                      height={50}
                      className="rounded bg-slate-100 border"
                    />
                    <div>
                      <p className="font-medium">{item.name}
                      <Badge variant="secondary" className={cn("text-sm ml-2 rounded-full",
                        (item.quantityOut == 0 && "bg-red-500 text-white hover:bg-red-600"),
                        (item.quantityOut != 0 && "bg-yellow-500 text-black hover:bg-yellow-600"),
                        (item.quantityOut == item.quantity && "bg-green-500 text-white hover:bg-green-600")
                      )}>
                        {item.quantityOut}
                        {
                          item.quantity != item.quantityOut &&
                          <span className="ml-1"> / {item.quantity}</span>
                        } 
                      </Badge>
                      </p>
                    </div>
                  </div>
                  <Checkbox className="w-6 h-6" checked={true} onCheckedChange={() => handleUncheck(item)} />
                </CardContent>
              </Card>
            ))}
          </div>
  </TabsContent>
</Tabs>

  <div className="flex justify-center mt-10">
    <Button
      disabled={todoItems.length > 0}
      size={"lg"} className="text-lg py-6">
      Mark as Done <CheckIcon className="w-6 h-6 ml-2" />
    </Button>
  </div>







        </div>
      </div>
    </div>
  )
}

