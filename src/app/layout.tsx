import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Smart Contract Audit | HEXIFIC",
  description: "HEXIFIC provides professional smart contract audits, security consulting, and monitoring for blockchain projects.",
  keywords: ["smart contract audit", "blockchain security", "HEXIFIC", "web3 security"],
  icons: {
    icon: ['/favicon.svg'],
  },
  openGraph: {
    title: "Smart Contract Audit | HEXIFIC",
    description: "Professional and trusted smart contract audits for blockchain projects.",
    url: "https://hexific.com",
    siteName: "HEXIFIC",
    images: [
      {
        url: "https://hexific.com/og-image.jpg",
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {children}
      </body>
    </html>
  );
}
