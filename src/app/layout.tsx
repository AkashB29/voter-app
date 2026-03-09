// src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EPIC Voter Lookup — Karnataka Electoral",
  description:
    "Search Karnataka BBMP electoral voter records by EPIC ID. Find voter name, ward, polling school and more.",
  manifest: "/manifest.json",
  themeColor: "#00d4ff",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "EPIC Lookup",
  },
  // ── Open Graph (WhatsApp, Facebook, Telegram, LinkedIn) ──
  openGraph: {
    title: "EPIC Voter Lookup — Karnataka Electoral",
    description:
      "Search BBMP electoral records by EPIC ID. Instant voter details lookup.",
    url: "https://your-domain.com", // ← replace with your actual URL
    siteName: "EPIC Voter Lookup",
    images: [
      {
        url: "https://your-domain.com/og-image.png", // ← replace with your actual URL
        width: 1200,
        height: 630,
        alt: "EPIC Voter Lookup — Karnataka Electoral",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  // ── Twitter / X card ──
  twitter: {
    card: "summary_large_image",
    title: "EPIC Voter Lookup — Karnataka Electoral",
    description:
      "Search BBMP electoral records by EPIC ID. Instant voter details lookup.",
    images: ["https://your-domain.com/og-image.png"], // ← replace
  },
  icons: {
    icon: [
      { url: "/icons/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/icons/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
    shortcut: "/icons/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/icons/favicon.ico" sizes="any" />
        <link
          rel="icon"
          href="/icons/favicon-32x32.png"
          type="image/png"
          sizes="32x32"
        />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#00d4ff" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
