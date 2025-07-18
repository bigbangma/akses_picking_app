import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import AuthWrapper from "@/components/AuthWrapper";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AKSES Picking",
  description: "L'application de Stock Picking d'AKSES",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthWrapper>
          <main className="min-h-screen bg-gray-100">{children}</main>
        </AuthWrapper>
        <Toaster />
      </body>
    </html>
  );
}

