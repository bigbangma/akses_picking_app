"use client"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, StoreIcon } from "lucide-react"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { useEffect, useState } from "react"


const pointsOfSale = [
  { id: 1, name: "Cashier 1", itemCount: 5, date: "2023-07-15" },
  { id: 2, name: "Cashier 2", itemCount: 3, date: "2023-07-16" },
  { id: 3, name: "Self-Checkout", itemCount: 7, date: "2023-07-17" },
]



type POS = {
  id:number,
  name:string,
  has_active_session:boolean,
  current_user_id:[number,string],
  current_session_id:[number,string],
  warehouse_id:[number,string],
  default_dest_location:[number,string]
}

export default function Home() {
  const [POSs, setPOSs] = useState<POS[]>([])
  useEffect(()=>{
    fetch("/api/pos",{
      method: "GET",
    }).then((res) => res.json()).then((data) => {
      setPOSs(data.pos as POS[])
    })
  },[])
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Points of Sale</h1>

<div className="container mx-auto p-0">
<Accordion type="single"  collapsible className="" defaultValue="pending">
  <AccordionItem value="pending" >
    <AccordionTrigger>
      <div className="flex justify-between items-center gap-3">
      Pending Point of Sales <Badge>{pointsOfSale.length}</Badge>
      </div>
    </AccordionTrigger>
    <AccordionContent>
      <div className="grid grid-cols-1 p-2 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {
          !pointsOfSale.length ?
          <p>No pending point of sales</p>
          :
        POSs.map((pos) => (
          <Link href={`/${pos.id}`} key={pos.id} className="no-underline">
            <Card className="hover:shadow-lg group transition-shadow relative">
              <CardHeader>
                {
                  pos.has_active_session &&
                <Badge className="absolute size-3 p-0 top-2 right-2"></Badge>
                }
                <CardTitle className="flex justify-between items-center">
                  <div className="flex items-center">
                  <StoreIcon className="w-6 h-6 mr-2" />
                  <div className="flex flex-col ">
                   <span>
                  {pos.name}
                    </span>
                    <span className="text-xs text-muted-foreground">{pos.current_user_id[1]}</span>
                  </div>
                  </div>
                  <Badge variant="secondary">{3} items</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="">
                {/* <div className="flex items-center">
                <p className="">Click to view items</p>
                </div> */}
                <ArrowRight className="w-4 h-4 ml-auto ease-in-out -translate-x-10 group-hover:translate-x-0 duration-200 opacity-0 group-hover:opacity-100" />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </AccordionContent>
  </AccordionItem>
  <AccordionItem value="done">
    <AccordionTrigger>
      <div className="flex justify-between items-center gap-3">
        Done Point of Sales
      <Badge>3</Badge>
      </div>
</AccordionTrigger>
    <AccordionContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pointsOfSale.map((pos) => (
            <Link href={`/${pos.id}`} key={pos.id} className="no-underline">
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    <div className="flex items-center">
                    <StoreIcon className="w-6 h-6 mr-2" />
                    {pos.name}
                    </div>
                    <Badge variant="secondary">{pos.itemCount} items</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Date: {pos.date}</p>
                  <p className="mt-2">Click to view items</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
    </AccordionContent>
  </AccordionItem>
</Accordion>

    </div>

    </div>
    
  )
}

