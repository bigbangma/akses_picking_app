import { Item } from '@/app/[id]/components/TodoItemsTab';
import {  POS } from '@/components/PointOfSaleCard';
import { create } from 'zustand';


export type POSData = {
  id: number,
  pos:POS,
  todo:Item[],
  waiting:Item[],
  todoDone:Item[],
  waitingDone:Item[]
}

interface StoreState {
  pos: POSData[]
  setPos: (pos: POSData[]) => void
}

const usePOS = create<StoreState>((set) => ({
  pos: [],
  setPos: (pos: POSData[]) => set({ pos }),
}));

export default usePOS;