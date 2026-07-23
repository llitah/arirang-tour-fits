import "./globals.css";
import type { Metadata } from "next";
import { ToastProvider } from "@/components/ui/Toast";

export const metadata: Metadata = {
  title: "Arirang Looks",
  description: "Looks e viagens — Letícia & Stella",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
