import type { Metadata } from "next";
import localFont from "next/font/local";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const rebondGrotesque = localFont({
  src: [
    {
      path: "../public/fonts/Rebond-Woff2/RebondGrotesque-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/Rebond-Woff2/RebondGrotesque-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../public/fonts/Rebond-Woff2/RebondGrotesque-Semibold.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "../public/fonts/Rebond-Woff2/RebondGrotesque-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  display: "swap",
  adjustFontFallback: false,
  variable: "--font-rebond",
  preload: true,
  fallback: ["system-ui", "sans-serif"],
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ZZP vs Detacheren Vergelijker",
  description: "Vergelijk netto inkomen per maand tussen ZZP en detacheren met reële aannames (2026)",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  openGraph: {
    title: "ZZP vs Detacheren Vergelijker",
    description: "Vergelijk netto inkomen per maand tussen ZZP en detacheren met reële aannames (2026)",
    type: "website",
    locale: "nl_NL",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "ZZP vs Detacheren Vergelijker",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ZZP vs Detacheren Vergelijker",
    description: "Vergelijk netto inkomen per maand tussen ZZP en detacheren met reële aannames (2026)",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${rebondGrotesque.variable} ${rebondGrotesque.className}`}>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
