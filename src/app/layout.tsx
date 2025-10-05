import "@/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";

import { PropertyInvestmentProvider } from "@/contexts/property-investment-context";
import { ChatProvider } from "@/contexts/chat-context";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "Simulateur LMNP - Micro-BIC vs Réel",
  description: "Simulateur intelligent d'investissement locatif meublé non professionnel",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" className={`${geist.variable}`}>
      <body>
        <PropertyInvestmentProvider>
          <ChatProvider>
            {children}
            <Toaster />
          </ChatProvider>
        </PropertyInvestmentProvider>
      </body>
    </html>
  );
}
