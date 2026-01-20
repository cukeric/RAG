import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RAG Decision Support System",
  description: "AI-Powered Manufacturing & Quality Analytics Platform",
  keywords: ["Manufacturing", "Quality Analytics", "Enterprise", "RAG", "Decision Support"],
  authors: [{ name: "AI RAG Team" }],
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "RAG Decision Support System",
    description: "AI-Powered Manufacturing & Quality Analytics Platform",
    url: "https://rag-decision-support.systems",
    siteName: "RAG Decision Support System",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "RAG Decision Support System",
    description: "AI-Powered Manufacturing & Quality Analytics Platform",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
