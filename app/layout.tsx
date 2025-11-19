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
