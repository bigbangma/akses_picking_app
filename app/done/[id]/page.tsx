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
        acc[date].push({...transfer,date: new Date(transfer.date)});
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
      <Button>Back</Button>
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
                      <div className="flex flex-col gap-2">
                        {transfers.map((transfer: Transfer) => (
                          <div key={transfer.id} className="flex justify-between border shadow bg-white px-2 rounded-xl">
                            <Accordion type="single" className="w-full" collapsible>
                            <AccordionItem value={"" + transfer.id} key={transfer.id}>
                              <AccordionTrigger>
                                <div className="flex items-center">
                                  <span className="mr-2 text-sm font-medium text-gray-900 dark:text-white">
                                    #{transfer.id}
                                  </span>
                                  <span className="text-sm text-gray-500 dark:text-gray-400">
                                    {transfer.date.toLocaleTimeString()}
                                  </span>
                                </div>
                              </AccordionTrigger>
                              <AccordionContent>
                                <div className="flex flex-col gap-2">
                                  {transfer.moves.map((item: Item) => (
                                    <div key={item.id} className="flex justify-between">
                                      <div className="flex">
                                      <Image
                                        src={"data:image/png;base64," + item.product_image}
                                        alt={item.product_name}
                                        width={50}
                                        height={50}
                                        className="mr-2 p-1 rounded-xl aspect-square object-contain border bg-white"
                                      />
                                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                                        {item.product_name}
                                      </span>
                                      </div>
                                      <span className="text-sm font-bold bg-gray-50 h-fit p-1 rounded-full border text-gray-900 dark:text-white">
                                        {item.done_quantity}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                            </Accordion>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))
              }
              {
                // transfers.map((transfer: Transfer) => (
                //   <AccordionItem value={"" + transfer.id} key={transfer.id}>
                //     <AccordionTrigger>
                //       <div className="flex justify-between">
                //         <div className="flex items-center">
                //           <span className="mr-2 text-sm font-medium text-gray-900 dark:text-white">
                //             #{transfer.id}
                //           </span>
                //           <span className="text-sm text-gray-500 dark:text-gray-400">
                //             {transfer.date}
                //           </span>
                //         </div>
                //         <Badge className="ml-2">
                //           {transfer.state}
                //         </Badge>
                //       </div>
                //     </AccordionTrigger>
                //     <AccordionContent>
                //       <div className="flex flex-col gap-2">
                //         {transfer.moves.map((item: Item) => (
                //           <div key={item.id} className="flex justify-between">
                //             <div className="flex">
                //             <Image
                //               src={"data:image/png;base64," + item.product_image}
                //               alt={item.product_name}
                //               width={50}
                //               height={50}
                //               className="mr-2 p-1 rounded-xl aspect-square object-contain border bg-white"
                //             />
                //             <span className="text-sm font-medium text-gray-900 dark:text-white">
                //               {item.product_name}
                //             </span>
                //             </div>
                //             <span className="text-sm font-medium text-gray-900 dark:text-white">
                //               {item.done_quantity}
                //             </span>
                //           </div>
                //         ))}
                //       </div>
                //     </AccordionContent>
                //   </AccordionItem>
                // ))
              }
            </Accordion>
    </div>
  )
}