'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Clock, Code, CheckCircle, XCircle, ExternalLink, Copy, Check } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

// Sidebar Navigation Component
function X402Sidebar() {
  const [activeSection, setActiveSection] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll('section[id]');
      let current = '';

      sections.forEach((section) => {
        const sectionTop = (section as HTMLElement).offsetTop;
        if (window.pageYOffset >= sectionTop - 200) {
          current = section.getAttribute('id') || '';
        }
      });

      setActiveSection(current);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const menuItems = [
    { id: 'promo', label: 'Free Promo', icon: '🎉' },
    { id: 'comparison', label: 'Free vs Pro', icon: '⚖️' },
    { id: 'prerequisites', label: 'Prerequisites', icon: '📋' },
    { id: 'installation', label: 'Installation', icon: '📦' },
    { id: 'quick-start', label: 'Quick Start', icon: '🚀' },
    { id: 'api-reference', label: 'API Reference', icon: '📖' },
    { id: 'troubleshooting', label: 'Troubleshooting', icon: '🔧' },
    { id: 'faq', label: 'FAQ', icon: '❓' },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-[#000E1B] border-r border-lime-400/20 overflow-y-auto pt-20 hidden lg:block z-40">
      <div className="px-4 py-6">
        <h3 className="text-xs font-semibold text-lime-400 uppercase tracking-wider mb-4">
          x402 Integration
        </h3>
        <nav className="space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => scrollToSection(item.id)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all flex items-center space-x-2 ${
                activeSection === item.id
                  ? 'bg-lime-400/20 text-lime-400 font-semibold'
                  : 'text-gray-400 hover:cursor-pointer hover:text-lime-400 hover:bg-lime-400/10'
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </aside>
  );
}

// Quick Links Sidebar Component
function QuickLinksSidebar() {
  return (
    <aside className="fixed right-0 top-0 h-screen w-64 bg-[#000E1B] border-l border-lime-400/20 overflow-y-auto pt-20 hidden xl:block z-40">
      <div className="px-4 py-6">
        <h3 className="text-xs font-semibold text-lime-400 uppercase tracking-wider mb-4">
          Quick Links
        </h3>
        <div className="space-y-3">
          <Link
            href="/"
            className="block p-3 glass-effect border border-lime-400/20 rounded-lg hover:border-lime-400/40 transition-all"
          >
            <div className="text-lime-400 text-xs font-semibold mb-1">
              🏠 Home
            </div>
            <div className="text-gray-400 text-xs">Back to main page</div>
          </Link>

          <Link
            href="/docs"
            className="block p-3 glass-effect border border-lime-400/20 rounded-lg hover:border-lime-400/40 transition-all"
          >
            <div className="text-lime-400 text-xs font-semibold mb-1">
              📖 Documentation
            </div>
            <div className="text-gray-400 text-xs">How to use Hexific</div>
          </Link>

          <Link
            href="/faq"
            className="block p-3 glass-effect border border-lime-400/20 rounded-lg hover:border-lime-400/40 transition-all"
          >
            <div className="text-lime-400 text-xs font-semibold mb-1">
              ❓ FAQ
            </div>
            <div className="text-gray-400 text-xs">Common questions</div>
          </Link>

          <Link
            href="/"
            className="block p-3 glass-effect border border-lime-400/20 rounded-lg hover:border-lime-400/40 transition-all"
          >
            <div className="text-lime-400 text-xs font-semibold mb-1">
              🔬 Start Audit
            </div>
            <div className="text-gray-400 text-xs">Free audit tool</div>
          </Link>

          <div className="pt-4 border-t border-lime-400/20 mt-4">
            <h4 className="text-xs font-semibold text-gray-500 uppercase mb-3">
              Resources
            </h4>
            <div className="space-y-2">
              <a
                href="https://x402.org"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-xs text-gray-400 hover:text-lime-400 transition-colors"
              >
                → x402 Protocol
              </a>
              <a
                href="https://x402.gitbook.io/x402"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-xs text-gray-400 hover:text-lime-400 transition-colors"
              >
                → x402 Documentation
              </a>
              <a
                href="https://github.com/base-org"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-xs text-gray-400 hover:text-lime-400 transition-colors"
              >
                → Base Sepolia Docs
              </a>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

// Main Layout
function X402Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#000E1B]">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-[#000E1B]/95 backdrop-blur-lg border-b border-lime-400/20 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-lime-400 gradient-text">HEXIFIC</span>
              <span className="text-xs text-gray-500">x402</span>
            </Link>
            <nav className="hidden md:flex items-center space-x-6">
              <Link
                href="/docs"
                className="text-gray-400 hover:text-lime-400 transition-colors text-sm"
              >
                Documentation
              </Link>
              <Link
                href="/x402"
                className="text-lime-400 font-semibold text-sm"
              >
                x402
              </Link>
              <Link
                href="/faq"
                className="text-gray-400 hover:text-lime-400 transition-colors text-sm"
              >
                FAQ
              </Link>
              <Link
                href="/"
                className="bg-lime-400 text-black px-4 py-2 rounded-lg font-semibold hover:bg-lime-300 transition-all text-sm pulse-glow"
              >
                Start Free Audit
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Sidebars */}
      <X402Sidebar />
      <QuickLinksSidebar />

      {/* Main Content */}
      <main className="lg:ml-64 xl:mr-64 pt-16">
        {children}
      </main>

      {/* Footer */}
      <footer className="lg:ml-64 xl:mr-64 border-t border-lime-400/20 mt-20 bg-[#000E1B]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center text-gray-400 text-sm">
            <p>© 2025 Hexific. All rights reserved.</p>
            <div className="flex justify-center space-x-4 mt-4">
              <Link href="/privacy" className="hover:text-lime-400 transition-colors">
                Privacy
              </Link>
              <span className="text-gray-600">•</span>
              <Link href="/terms-of-service" className="hover:text-lime-400 transition-colors">
                Terms
              </Link>
              <span className="text-gray-600">•</span>
              <a href="mailto:admin@hexific.com" className="hover:text-lime-400 transition-colors">
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Main Page Component
export default function X402DocsPage() {
//   const [timeLeft, setTimeLeft] = useState(24 * 60 * 60);
  const [copied, setCopied] = useState(false);

//   useEffect(() => {
//     const timer = setInterval(() => {
//       setTimeLeft(prev => prev > 0 ? prev - 1 : 0);
//     }, 1000);
//     return () => clearInterval(timer);
//   }, []);

//   const formatTime = (seconds: number): string => {
//     const h: number = Math.floor(seconds / 3600);
//     const m: number = Math.floor((seconds % 3600) / 60);
//     const s: number = seconds % 60;
//     return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
//   };

  const copyToClipboard = (text: string): void => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const quickStartCode = `import { wrapFetchWithPayment, decodeXPaymentResponse } from "x402-fetch";
import { createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { baseSepolia } from "viem/chains";
import fs from 'fs';

// ====================================
// 1. Setup Wallet
// ====================================
const PRIVATE_KEY = "0xYourPrivateKey";
const account = privateKeyToAccount(PRIVATE_KEY);

console.log("✅ Wallet Address:", account.address);

// ====================================
// 2. Wrap Fetch with Payment
// ====================================
const fetchWithPayment = wrapFetchWithPayment(fetch, account);

// ====================================
// 3. Upload Contract for Professional Audit
// ====================================
async function testProfessionalAudit() {
  try {
    console.log("\\n🚀 Starting Professional Audit with x402 Payment...");
    
    const zipFile = fs.readFileSync('./test-contract.zip');
    const formData = new FormData();
    const blob = new Blob([zipFile], { type: 'application/zip' });
    formData.append('file', blob, 'test-contract.zip');
    
    console.log("📤 Uploading contract and processing payment...");
    
    const response = await fetchWithPayment('https://api.hexific.com/ai-audit-pro', {
      method: 'POST',
      body: formData,
    });
    
    console.log("✅ Response Status:", response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Server Error:", errorText);
      
      try {
        const errorJson = JSON.parse(errorText);
        console.error("Error detail:", errorJson.detail);
      } catch {
        console.error("Raw error:", errorText);
      }
      return;
    }
    
    const xPaymentHeader = response.headers.get("x-payment-response");
    if (xPaymentHeader) {
      const paymentResponse = decodeXPaymentResponse(xPaymentHeader);
      console.log("\\n💳 Payment Details:");
      console.log(paymentResponse);
    }
    
    const result = await response.json();
    
    console.log("\\n📊 Audit Results:");
    console.log("Analysis ID:", result.analysis_id);
    console.log("AI Model:", result.ai_model);
    console.log("Cost:", result.cost_usd, "USD");
    console.log("\\n📝 Detailed Audit Report:");
    console.log(result.detailed_audit);
    
    if (result.detailed_audit) {
      fs.writeFileSync(
        \`audit-report-\${result.analysis_id}.txt\`, 
        result.detailed_audit
      );
      console.log("\\n✅ Report saved to:", \`audit-report-\${result.analysis_id}.txt\`);
    }
    
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

// ====================================
// 4. Run the test
// ====================================
testProfessionalAudit();`;

  // Custom style untuk syntax highlighter dengan Hexific theme
  const customStyle = {
    ...vscDarkPlus,
    'pre[class*="language-"]': {
      ...vscDarkPlus['pre[class*="language-"]'],
      background: 'rgba(0, 0, 0, 0.5)',
      border: '1px solid rgba(214, 237, 23, 0.2)',
      borderRadius: '0.5rem',
      padding: '1.5rem',
      margin: 0,
    },
    'code[class*="language-"]': {
      ...vscDarkPlus['code[class*="language-"]'],
      background: 'transparent',
      fontSize: '0.875rem',
      lineHeight: '1.7',
    },
  };

  return (
    <X402Layout>
      {/* Free Promo Banner */}
      {/* <section id="promo">
        <div className="bg-gradient-to-r from-lime-400 to-lime-500 text-black py-6 px-4 shadow-lg">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="bg-black/20 p-3 rounded-lg">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">🎉 FREE Professional Audit for 24 Hours!</h2>
                  <p className="text-black/80 text-sm">Pay only $0.01 USDC on Base Sepolia (testnet) - We cover the cost!</p>
                </div>
              </div>
              <div className="bg-black/20 backdrop-blur-sm px-6 py-3 rounded-lg">
                <div className="text-xs uppercase tracking-wider opacity-90">Datetime UTC:</div>
                <div className="text-1xl font-mono font-bold">6 PM, 4rd Wednesday December 2025.</div>
              </div>
            </div>
          </div>
        </div>
      </section> */}

      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-5xl font-bold text-white text-white mb-4">x402 Payment Integration</h1>
          <p className="text-xl text-gray-400">Seamless micropayments for AI-powered smart contract audits</p>
        </div>

        {/* Comparison Table */}
        <section id="comparison" className="scroll-mt-20 mb-12">
          <div className="glass-effect rounded-xl shadow-lg p-8 border border-lime-400/20">
            <h2 className="text-2xl font-bold text-white gradient-text mb-6">Free vs Professional Audit</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-lime-400/20">
                    <th className="text-left py-4 px-4 text-white font-semibold">Feature</th>
                    <th className="text-center py-4 px-4 text-white font-semibold">Free Audit</th>
                    <th className="text-center py-4 px-4 text-white font-semibold">x402 Pro Audit</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-lime-400/10">
                    <td className="py-4 px-4 font-medium text-gray-300">AI Model</td>
                    <td className="py-4 px-4 text-center text-gray-400">Slither & Groq</td>
                    <td className="py-4 px-4 text-center text-lime-400 font-semibold">Claude Sonnet 4.5</td>
                  </tr>
                  <tr className="border-b border-lime-400/10">
                    <td className="py-4 px-4 font-medium text-gray-300">Cost</td>
                    <td className="py-4 px-4 text-center text-gray-400">Free</td>
                    <td className="py-4 px-4 text-center text-lime-400 font-semibold">$0.01 USDC</td>
                  </tr>
                  <tr className="border-b border-lime-400/10">
                    <td className="py-4 px-4 font-medium text-gray-300">Response Time</td>
                    <td className="py-4 px-4 text-center text-gray-400">~1 min</td>
                    <td className="py-4 px-4 text-center text-lime-400 font-semibold">~2 min</td>
                  </tr>
                  <tr className="border-b border-lime-400/10">
                    <td className="py-4 px-4 font-medium text-gray-300">Audit Depth</td>
                    <td className="py-4 px-4 text-center text-gray-400">Basic</td>
                    <td className="py-4 px-4 text-center text-lime-400 font-semibold">Deep Analysis</td>
                  </tr>
                  <tr>
                    <td className="py-4 px-4 font-medium text-gray-300">API Access</td>
                    {/* <XCircle className="w-5 h-5 text-red-400 mx-auto" /> */}
                    <td className="py-4 px-4 text-center"><CheckCircle className="w-5 h-5 text-lime-400 mx-auto" /></td>
                    <td className="py-4 px-4 text-center"><CheckCircle className="w-5 h-5 text-lime-400 mx-auto" /></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Prerequisites */}
        <section id="prerequisites" className="scroll-mt-20 mb-12">
          <div className="glass-effect rounded-xl shadow-lg p-8 border border-lime-400/20">
            <h2 className="text-2xl font-bold text-white gradient-text mb-6">Prerequisites</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-lime-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-white">Node.js & npm</h3>
                  <p className="text-gray-400">Version 16.x or higher</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-lime-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-white">Wallet with USDC</h3>
                  <p className="text-gray-400">MetaMask or compatible wallet on Base Sepolia</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-lime-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-white">Private Key</h3>
                  <p className="text-gray-400">For programmatic access (keep secure!)</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Installation */}
        <section id="installation" className="scroll-mt-20 mb-12">
          <div className="glass-effect rounded-xl shadow-lg p-8 border border-lime-400/20">
            <h2 className="text-2xl font-bold text-white gradient-text mb-6">Installation</h2>
            <div className="relative group">
              <SyntaxHighlighter
                language="bash"
                style={customStyle}
                customStyle={{
                  background: 'rgba(0, 0, 0, 0.5)',
                  border: '1px solid rgba(214, 237, 23, 0.2)',
                  borderRadius: '0.5rem',
                  padding: '1.5rem',
                }}
              >
                npm install x402-fetch viem
              </SyntaxHighlighter>
            </div>
          </div>
        </section>

        {/* Quick Start */}
        <section id="quick-start" className="scroll-mt-20 mb-12">
          <div className="glass-effect rounded-xl shadow-lg p-8 border border-lime-400/20">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white gradient-text">Quick Start</h2>
              <button
                onClick={() => copyToClipboard(quickStartCode)}
                className="flex items-center gap-2 px-4 py-2 bg-lime-400 text-black rounded-lg hover:cursor-pointer hover:bg-lime-300 transition-colors font-semibold pulse-glow"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied!' : 'Copy Code'}
              </button>
            </div>
            <div className="bg-black/50 border border-lime-400/20 rounded-lg p-6 text-gray-100 font-mono text-xs overflow-x-auto">
              <SyntaxHighlighter
                language="typescript"
                style={customStyle}
                showLineNumbers
                wrapLines
                customStyle={{
                  background: 'rgba(0, 0, 0, 0.5)',
                  border: '1px solid rgba(214, 237, 23, 0.2)',
                  borderRadius: '0.5rem',
                  padding: '1.5rem',
                  margin: 0,
                }}
              >
                {quickStartCode}
              </SyntaxHighlighter>
            </div>
          </div>
        </section>

        {/* API Reference - Add more sections as needed */}
        <section id="api-reference" className="scroll-mt-20 mb-12">
          <div className="glass-effect rounded-xl shadow-lg p-8 border border-lime-400/20">
            <h2 className="text-2xl font-bold text-white gradient-text mb-6">API Reference</h2>
            <p className="text-gray-300">Coming soon...</p>
          </div>
        </section>

        {/* Troubleshooting */}
        <section id="troubleshooting" className="scroll-mt-20 mb-12">
          <div className="glass-effect rounded-xl shadow-lg p-8 border border-lime-400/20">
            <h2 className="text-2xl font-bold text-white gradient-text mb-6">Troubleshooting</h2>
            <div className="space-y-4">
              <div className="border-l-4 border-red-500 bg-red-500/10 p-4 rounded-r-lg">
                <h3 className="font-semibold text-red-400 mb-2">❌ Insufficient USDC Balance</h3>
                <p className="text-gray-300 text-sm">Ensure your wallet has at least $0.01 USDC on Base Sepolia testnet.</p>
              </div>
              <div className="border-l-4 border-yellow-500 bg-yellow-500/10 p-4 rounded-r-lg">
                <h3 className="font-semibold text-yellow-400 mb-2">⚠️ Invalid Contract Format</h3>
                <p className="text-gray-300 text-sm">Contract must be a valid .zip file containing .sol files.</p>
              </div>
              <div className="border-l-4 border-lime-400 bg-lime-400/10 p-4 rounded-r-lg">
                <h3 className="font-semibold text-lime-400 mb-2">ℹ️ Payment Transaction Failed</h3>
                <p className="text-gray-300 text-sm">Check your wallet connection and approve the transaction.</p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="scroll-mt-20 mb-12">
          <div className="glass-effect rounded-xl shadow-lg p-8 border border-lime-400/20">
            <h2 className="text-2xl font-bold text-white gradient-text mb-6">FAQ</h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-white mb-2">What is x402?</h3>
                <p className="text-gray-400">x402 is a decentralized micropayment protocol that enables seamless pay-per-use API access. Learn more at <a href="https://x402.org" target="_blank" rel="noopener noreferrer" className="text-lime-400 hover:underline inline-flex items-center gap-1">x402.org <ExternalLink className="w-3 h-3" /></a></p>
              </div>
              <div>
                <h3 className="font-semibold text-white mb-2">Why Base Sepolia?</h3>
                <p className="text-gray-400">Base Sepolia is a testnet that allows you to test the payment flow without spending real money during our beta phase.</p>
              </div>
              <div>
                <h3 className="font-semibold text-white mb-2">Is my private key safe?</h3>
                <p className="text-gray-400">Your private key is only used locally to sign transactions. Never share it or commit it to version control. Use environment variables.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Support */}
        <div className="bg-gradient-to-r from-lime-400/20 to-lime-500/20 border border-lime-400/30 rounded-xl shadow-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-white gradient-text mb-4">Need Help?</h2>
          <p className="text-gray-300 mb-6">We&apos;re here to support your integration journey.</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <a href="https://x402.gitbook.io/x402" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-lime-400 text-black px-6 py-3 rounded-lg font-semibold hover:bg-lime-300 transition-colors pulse-glow">
              <Code className="w-5 h-5" />
              x402 Documentation
              <ExternalLink className="w-4 h-4" />
            </a>
            <a href="mailto:admin@hexific.com" className="flex items-center gap-2 glass-effect border border-lime-400/30 text-lime-400 px-6 py-3 rounded-lg font-semibold hover:bg-lime-400/10 transition-colors">
              Contact Support
            </a>
          </div>
        </div>
      </div>
    </X402Layout>
  );
}