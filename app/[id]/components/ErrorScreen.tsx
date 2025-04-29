import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface ErrorScreenProps {
  error: string;
}

export const ErrorScreen = ({ error }: ErrorScreenProps) => (
  <div className="flex min-h-screen items-center justify-center p-4">
    <div className="text-center space-y-4">
      <div className="flex flex-col items-center gap-2">
        <div className="rounded-full bg-red-100 p-3">
          <AlertCircle className="h-8 w-8 text-red-600" />
        </div>
        <h2 className="text-2xl font-semibold tracking-tight">
          Une erreur est survenue
        </h2>
        <p className="text-muted-foreground max-w-[500px]">
          {error}
        </p>
      </div>
      
      <div className="flex justify-center gap-4 mt-8">
        <Button
          variant="outline"
          onClick={() => window.location.reload()}
          className="gap-2"
        >
          Réessayer
        </Button>
        <Link href="/">
          <Button className="gap-2">
            Retour à l{"'"}accueil
          </Button>
        </Link>
      </div>
    </div>
  </div>
);
