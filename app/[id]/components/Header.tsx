import { Button } from "@/components/ui/button";
import { StoreIcon, Layers } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface PosData {
  id: number;
  name: string;
  has_active_session: boolean;
  current_user_id: [number, string];
  current_session_id: [number, string];
}

interface HeaderProps {
  id: string;
}

export const Header = ({ id }: HeaderProps) => {
  const [posData, setPosData] = useState<PosData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosData = async () => {
      try {
        const response = await fetch("/api/pos");
        const data = await response.json();

        if (data.success) {
          const pos = data.pos.find((p: PosData) => p.id.toString() === id);
          if (pos) {
            setPosData(pos);
          } else {
            setError(`POS with ID ${id} not found`);
          }
        } else {
          setError("Failed to fetch POS data");
        }
      } catch (err) {
        setError("Error fetching POS data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPosData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold mb-4 flex items-center">
          <StoreIcon className="w-6 h-6 mr-2" /> Loading POS...
        </h1>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold mb-4 flex items-center">
          <StoreIcon className="w-6 h-6 mr-2" /> {error}
        </h1>
      </div>
    );
  }

  return (
    <div className="mb-4 bg-white flex h-full items-center p-2 border-b ">
      <div className="flex justify-between h-fit  items-center container mx-auto ">
        <h1 className="text-lg md:text-2xl  font-bold  flex items-center">
          <StoreIcon className="w-6 h-6 mr-2" />
          {posData ? posData.name : `Point de Vente ${id}`} |
          <div className="flex ml-2 flex-col">
            {posData?.has_active_session && (
              <span className=" text-xs font-bold text-green-600">
                Session active &#9679;
              </span>
            )}
            <span className="text-xs text-slate-700">{`Point de Vente ${id}`}</span>
          </div>
        </h1>
        <div>
          <Link href={`/done/${id}`}>
            <Button variant="outline" className=" bg-transparent">
              <Layers className="w-6 h-6 md:mr-2" />
              <span className="hidden md:inline">Commandes</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
