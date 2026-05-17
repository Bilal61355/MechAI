import type { Metadata } from "next";
import "./globals.css";
import Cursor from "@/components/Cursor";

export const metadata: Metadata = {
  title: "MechanicAI — Never get cheated at a service center again",
  description: "AI-powered vehicle diagnosis for Indian vehicle owners",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <Cursor />
        {children}
      </body>
    </html>
  );
}