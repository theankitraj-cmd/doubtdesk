import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DoubtDesk — Your Personal AI Teacher",
  description:
    "Ask doubts, get clear explanations, and learn with a live AI teacher. 24/7 tutoring for CBSE, ICSE, JEE & NEET.",
  keywords: ["AI tutor", "doubt clearing", "JEE", "NEET", "CBSE", "online tuition", "AI teacher"],
  manifest: "/manifest.json",
  openGraph: {
    title: "DoubtDesk — Your Personal AI Teacher",
    description: "Ask doubts, get clear explanations, and learn with a live AI teacher avatar. 24/7 tutoring.",
    type: "website",
    locale: "en_IN",
    siteName: "DoubtDesk",
  },
  twitter: {
    card: "summary_large_image",
    title: "DoubtDesk — AI Tutoring Platform",
    description: "Ask doubts, learn with a live AI teacher. For CBSE, ICSE, JEE & NEET.",
  },
};

export const viewport: Viewport = {
  themeColor: "#2D5F2D",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
}; export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="DoubtDesk" />
      </head>
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
