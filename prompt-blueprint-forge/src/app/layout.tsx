import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { AnnouncementBar } from "@/components/AnnouncementBar";
import { Footer } from "@/components/Footer";
import { BackToTop } from "@/components/BackToTop";
import { AppProvider } from "@/lib/store";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Prompt Blueprint Forge - AI Prompt Marketplace",
    template: "%s | Prompt Blueprint Forge",
  },
  description:
    "Discover, buy, and sell premium AI prompt chains and blueprints. The ultimate marketplace for structured prompt engineering.",
  openGraph: {
    title: "Prompt Blueprint Forge - AI Prompt Marketplace",
    description:
      "Discover, buy, and sell premium AI prompt chains and blueprints. The ultimate marketplace for structured prompt engineering.",
    type: "website",
    siteName: "Prompt Blueprint Forge",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Prompt Blueprint Forge - AI Prompt Marketplace",
    description:
      "Discover, buy, and sell premium AI prompt chains and blueprints. The ultimate marketplace for structured prompt engineering.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
    >
      <body className="min-h-screen flex flex-col bg-(--background) text-(--foreground)">
        <AppProvider>
          <AnnouncementBar />
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <BackToTop />
        </AppProvider>
      </body>
    </html>
  );
}
