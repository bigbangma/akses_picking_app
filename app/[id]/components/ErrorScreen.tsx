interface ErrorScreenProps {
  error: string;
}

export const ErrorScreen = ({ error }: ErrorScreenProps) => (
  <div className="flex min-h-screen items-center justify-center">
    Erreur: {error}
  </div>
);
