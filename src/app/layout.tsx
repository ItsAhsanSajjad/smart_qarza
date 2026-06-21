import type { Metadata } from "next";
import { Geist, Geist_Mono, Noto_Naskh_Arabic } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Clean, professional Urdu/Arabic typeface for all Urdu text.
const notoUrdu = Noto_Naskh_Arabic({
  variable: "--font-urdu-face",
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "GEO Loan.pk — آسان قرض، روشن مستقبل",
  description:
    "GEO Loan.pk — easy loans for a brighter future. Register, complete KYC, choose a loan package, and manage repayments in one secure app.",
  keywords: ["GEO Loan", "GEO Loan.pk", "Loan", "Pakistan", "EasyPaisa", "JazzCash", "Personal Loan", "Digital Lending"],
  authors: [{ name: "GEO Loan.pk" }],
  applicationName: "GEO Loan.pk",
  icons: { icon: "/icon.png", apple: "/icon.png" },
};

export const viewport = {
  themeColor: "#15783a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${notoUrdu.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
        <SonnerToaster position="top-center" richColors />
      </body>
    </html>
  );
}
