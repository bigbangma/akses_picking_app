import { Button } from "@/components/ui/button";
import { StoreIcon, Layers } from "lucide-react";
import Link from "next/link";

interface HeaderProps {
  id: string;
}

export const Header = ({ id }: HeaderProps) => {
  return (
    <div className="flex justify-between items-center mb-4">
      <h1 className="text-2xl font-bold mb-4 flex items-center">
        <StoreIcon className="w-6 h-6 mr-2" /> Point de Vente {id}
      </h1>
      <div>
        <Link href={`/done/${id}`}>
          <Button variant="outline" className="mb-4 bg-transparent">
            <Layers className="w-6 h-6 mr-2" />
            Commandes
          </Button>
        </Link>
      </div>
    </div>
  );
};
