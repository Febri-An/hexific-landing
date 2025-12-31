import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from 'next/script'
import '@rainbow-me/rainbowkit/styles.css';
import { Providers } from './providers';
import { SolanaProvider } from "../components/solana-provider";
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
      <head>
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-8V9N97MJ33"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-8V9N97MJ33');
          `}
        </Script>
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <Providers>
          <SolanaProvider>{children}</SolanaProvider>
        </Providers>
      </body>
    </html>
  );
}
