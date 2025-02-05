"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Item, Transfer } from "@/components/PointOfSaleCard"
import Link from "next/link"
import { Button } from "@/components/ui/button"


import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import Image from "next/image"
import { ArrowLeft } from "lucide-react"



export default function PointOfSalePage() {
  const { id } = useParams()
  // const [transfers, setTransfers] = useState<Transfer[]>([])
  const [transfersByDay, setTransfersByDay] = useState<{ [key: string]: Transfer[] }>({})

useEffect(() => {
  // Fetch data from the endpoint
  const fetchData = async () => {
    try {
      const response = await fetch(`/api/pos/${id}/transfers`);
      const data = await response.json();
      // setTransfers(data.transfers.reverse().map((t:Transfer)=>(
      //   {...t,date: new Date(t.date)}
      // )));
      console.log(data.transfers.reverse().map((t:Transfer)=>(
        {...t,date: new Date(t.date)}
      )))
      const tranfersByDay = data.transfers.reduce((acc: { [key: string]: Transfer[] }, transfer: Transfer) => {
        const date = new Date(transfer.date).toLocaleDateString();
        if (!acc[date]) {
          acc[date] = [];
        }
        if(transfer.state==="done") {
          acc[date].push({...transfer,date: new Date(transfer.date)});
        }
        return acc;
      }, {});
      setTransfersByDay(tranfersByDay)
      console.log(tranfersByDay)
      // Use a map to accumulate quantities for each product_id
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  fetchData();
}, [id]);


  return (
    <div className="container mx-auto p-4">
      <Link className="" href={"/" + id}>
      <Button variant={"outline"}><ArrowLeft />Back</Button>
      </Link>
            <Accordion className="mt-10" type="multiple" >
              {
                // render by day
                Object.entries(transfersByDay).map(([date, transfers]) => (
                  <AccordionItem value={date} key={date}>
                    <AccordionTrigger>
                      <div className="flex justify-between">
                        <div className="flex items-center">
                          <span className="mr-2 text-sm font-medium text-gray-900 dark:text-white">
                            {date} 
                          </span>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {transfers.length} transfers
                          </span>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4">
                      {
                        (()=>{
                          const products = new Map<number, Item>()

                          transfers.forEach((transfer) => {
                            transfer.moves.forEach((move) => {
                              if (products.has(move.product_id)) {
                                const existingItem = products.get(move.product_id)!
                                existingItem.demand_quantity += move.demand_quantity
                              } else {
                                products.set(move.product_id, {
                                  ...move,
                                  demand_quantity: move.demand_quantity,
                                })
                              }
                            })
                          })

                          return (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-1">
                              {Array.from(products.values()).map((item) => (
                                <div key={item.id} className="p-2 bg-white border rounded-xl flex gap-4">
                                  <Image
                                    src={"data:image/jpeg;base64," + item.product_image || "/placeholder.svg"}
                                    alt={item.product_name}
                                    width={50}
                                    height={50}
                                    className="size-12 object-contain bg-slate-50 p-[2px] rounded-xl border "
                                  />
                                  <div className="">
                                    <h5 className="mb-2 text-sm tracking-tight text-gray-900 dark:text-white">
                                      {item.product_name}
                                    </h5>
                                    <p className="mb-3 font-normal text-xs text-gray-700 dark:text-gray-400">
                                      Quantity: <span className="font-bold text-black">{item.demand_quantity}</span>
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )
                        })()
                      }
                    </AccordionContent>
                  </AccordionItem>
                ))
              }
            </Accordion>
    </div>
  )
}