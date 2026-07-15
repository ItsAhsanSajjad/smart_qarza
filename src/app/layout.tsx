import type { Metadata } from "next";
import { Inter, Poppins, IBM_Plex_Mono, Noto_Naskh_Arabic } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import ImpersonationBanner from "@/components/impersonation-banner";
import LiveChat from "@/components/live-chat";

// Clean, technical body sans.
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

// Friendly, professional display face for headings (PK fintech feel).
const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

// Clean, professional Urdu/Arabic typeface for all Urdu text.
const notoUrdu = Noto_Naskh_Arabic({
  variable: "--font-urdu-face",
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Smart Qarz — آسان قرض، روشن مستقبل",
  description:
    "Smart Qarz — easy loans for a brighter future. Register, complete KYC, choose a loan package, and manage repayments in one secure app.",
  keywords: ["Smart Qarz", "SmartQarz", "Loan", "Qarz", "Pakistan", "EasyPaisa", "JazzCash", "Personal Loan", "Digital Lending"],
  authors: [{ name: "Smart Qarz" }],
  applicationName: "Smart Qarz",
  icons: { icon: "/logo-sq.png", apple: "/logo-sq.png" },
};

export const viewport = {
  themeColor: "#0f9d58",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${poppins.variable} ${plexMono.variable} ${notoUrdu.variable}`}
    >
      <body className="font-sans antialiased bg-background text-foreground">
        {children}
        <ImpersonationBanner />
        <Toaster />
        <SonnerToaster position="top-center" richColors />
        {/* Live chat — loads only when the super admin has it enabled */}
        <LiveChat />
      </body>
    </html>
  );
}
