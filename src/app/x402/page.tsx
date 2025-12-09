'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Code, CheckCircle, XCircle, ExternalLink, Copy, Check, FileArchive, MapPin } from 'lucide-react';
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
    { id: 'overview', label: 'Overview', icon: '📋' },
    { id: 'comparison', label: 'Methods Comparison', icon: '⚖️' },
    { id: 'prerequisites', label: 'Prerequisites', icon: '📦' },
    { id: 'installation', label: 'Installation', icon: '⚙️' },
    { id: 'zip-audit', label: 'ZIP Upload Audit', icon: '📁' },
    { id: 'address-audit', label: 'Address-Based Audit', icon: '📍' },
    { id: 'api-reference', label: 'API Reference', icon: '📖' },
    { id: 'response-format', label: 'Response Format', icon: '📊' },
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
              🔬 Free Audit
            </div>
            <div className="text-gray-400 text-xs">Try free audit tool</div>
          </Link>

          <div className="pt-4 border-t border-lime-400/20 mt-4">
            <h4 className="text-xs font-semibold text-gray-500 uppercase mb-3">
              API Endpoints
            </h4>
            <div className="space-y-2">
              <div className="text-xs text-gray-400 font-mono bg-black/30 px-2 py-1 rounded">
                /ai-audit-pro
              </div>
              <div className="text-xs text-gray-400 font-mono bg-black/30 px-2 py-1 rounded">
                /ai-audit-address
              </div>
            </div>
          </div>

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
                href="https://etherscan.io"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-xs text-gray-400 hover:text-lime-400 transition-colors"
              >
                → Etherscan
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
      <style dangerouslySetInnerHTML={{ __html: `
        .gradient-text {
          background: linear-gradient(135deg, #D6ED17, #ffffff);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .glass-effect {
          background: rgba(214, 237, 23, 0.05);
          backdrop-filter: blur(20px);
        }
        
        .pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }
        
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(214, 237, 23, 0.3); }
          50% { box-shadow: 0 0 40px rgba(214, 237, 23, 0.6); }
        }
      `}} />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-[#000E1B]/95 backdrop-blur-lg border-b border-lime-400/20 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-lime-400 gradient-text">HEXIFIC</span>
              <span className="text-xs text-gray-500">x402</span>
            </Link>
            <nav className="hidden md:flex items-center space-x-6">
              <Link href="/docs" className="text-gray-400 hover:text-lime-400 transition-colors text-sm">
                Documentation
              </Link>
              <Link href="/x402" className="text-lime-400 font-semibold text-sm">
                x402
              </Link>
              <Link href="/faq" className="text-gray-400 hover:text-lime-400 transition-colors text-sm">
                FAQ
              </Link>
              <Link href="/" className="bg-lime-400 text-black px-4 py-2 rounded-lg font-semibold hover:bg-lime-300 transition-all text-sm pulse-glow">
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
              <Link href="/privacy-policy" className="hover:text-lime-400 transition-colors">Privacy</Link>
              <span className="text-gray-600">•</span>
              <Link href="/terms-of-service" className="hover:text-lime-400 transition-colors">Terms</Link>
              <span className="text-gray-600">•</span>
              <a href="mailto:admin@hexific.com" className="hover:text-lime-400 transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Audit Method Tab Component
function AuditMethodTabs({ activeTab, setActiveTab }: { activeTab: string; setActiveTab: (tab: string) => void }) {
  return (
    <div className="flex space-x-2 mb-6">
      <button
        onClick={() => setActiveTab('zip')}
        className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-all ${
          activeTab === 'zip'
            ? 'bg-lime-400 text-black'
            : 'glass-effect border border-lime-400/30 text-lime-400 hover:bg-lime-400/10 hover:cursor-pointer'
        }`}
      >
        <FileArchive className="w-5 h-5" />
        <span>ZIP Upload</span>
      </button>
      <button
        onClick={() => setActiveTab('address')}
        className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-all ${
          activeTab === 'address'
            ? 'bg-lime-400 text-black'
            : 'glass-effect border border-lime-400/30 text-lime-400 hover:bg-lime-400/10 hover:cursor-pointer'
        }`}
      >
        <MapPin className="w-5 h-5" />
        <span>Address-Based</span>
      </button>
    </div>
  );
}

// Main Page Component
export default function X402DocsPage() {
  const [activeTab, setActiveTab] = useState('zip');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string): void => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Code examples
  const zipAuditCode = `import { wrapFetchWithPayment, decodeXPaymentResponse } from "x402-fetch";
import { privateKeyToAccount } from "viem/accounts";
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
// 3. Upload ZIP for Professional Audit
// ====================================
async function auditByZip() {
  try {
    console.log("\\n🚀 Starting ZIP-Based Audit with x402 Payment...");
    console.log("💰 Price: $0.10 USDC");
    
    // Read your contract ZIP file
    const zipFile = fs.readFileSync('./my-contract.zip');
    const formData = new FormData();
    const blob = new Blob([zipFile], { type: 'application/zip' });
    formData.append('file', blob, 'my-contract.zip');
    
    console.log("📤 Uploading contract and processing payment...");
    
    const response = await fetchWithPayment('https://api.hexific.com/ai-audit-pro', {
      method: 'POST',
      body: formData,
    });
    
    console.log("✅ Response Status:", response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Server Error:", errorText);
      return;
    }
    
    // Check payment details
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
    
    // Save report to file
    if (result.detailed_audit) {
      const filename = \`audit-report-\${result.analysis_id}.txt\`;
      fs.writeFileSync(filename, result.detailed_audit);
      console.log("\\n✅ Report saved to:", filename);
    }
    
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

// ====================================
// 4. Run Audit
// ====================================
auditByZip();`;

  const addressAuditCode = `import { wrapFetchWithPayment, decodeXPaymentResponse } from "x402-fetch";
import { privateKeyToAccount } from "viem/accounts";
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
// 3. Audit by Contract Address
// ====================================
async function auditByAddress() {
  try {
    console.log("\\n🚀 Starting Address-Based Audit with x402 Payment...");
    console.log("💰 Price: $0.05 USDC (50% cheaper!)");
    
    // Example: USDT contract on Ethereum mainnet
    const contractAddress = "0xdAC17F958D2ee523a2206206994597C13D831ec7";
    
    console.log("📍 Contract Address:", contractAddress);
    console.log("🔍 Fetching verified source from Etherscan...");
    
    const response = await fetchWithPayment('https://api.hexific.com/ai-audit-address', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contract_address: contractAddress,
        network: "ethereum"
      }),
    });
    
    console.log("✅ Response Status:", response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Server Error:", errorText);
      return;
    }
    
    // Check payment details
    const xPaymentHeader = response.headers.get("x-payment-response");
    if (xPaymentHeader) {
      const paymentResponse = decodeXPaymentResponse(xPaymentHeader);
      console.log("\\n💳 Payment Details:");
      console.log(paymentResponse);
    }
    
    const result = await response.json();
    
    console.log("\\n📊 Audit Results:");
    console.log("Analysis ID:", result.analysis_id);
    console.log("Contract:", result.contract_name);
    console.log("Address:", result.contract_address);
    console.log("Network:", result.network);
    console.log("Compiler:", result.compiler_version);
    console.log("AI Model:", result.ai_model);
    console.log("Cost:", result.cost_usd, "USD");
    console.log("\\n📝 Detailed Audit Report:");
    console.log(result.detailed_audit);
    
    // Save report to file
    if (result.detailed_audit) {
      const filename = \`audit-\${result.contract_name}-\${result.analysis_id}.txt\`;
      fs.writeFileSync(filename, result.detailed_audit);
      console.log("\\n✅ Report saved to:", filename);
    }
    
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

// ====================================
// 4. Run Audit
// ====================================
auditByAddress();`;

  const responseFormatZip = `{
  "success": true,
  "analysis_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "audit_type": "zip_upload",
  "ai_model": "claude-sonnet-4-5",
  "slither_results": {
    "success": true,
    "detectors": [
      {
        "check": "reentrancy-eth",
        "impact": "High",
        "confidence": "Medium",
        "description": "Reentrancy vulnerability found..."
      }
    ]
  },
  "detailed_audit": "## Security Audit Report\\n\\n### Executive Summary...",
  "timestamp": "2025-12-08T10:30:00.000Z",
  "cost_usd": 0.10
}`;

  const responseFormatAddress = `{
  "success": true,
  "analysis_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "audit_type": "address_based",
  "contract_address": "0xdAC17F958D2ee523a2206206994597C13D831ec7",
  "contract_name": "TetherToken",
  "network": "ethereum",
  "compiler_version": "v0.4.18+commit.9cf6e910",
  "ai_model": "claude-sonnet-4-5",
  "slither_results": {
    "success": true,
    "detectors": [...]
  },
  "detailed_audit": "## Security Audit Report\\n\\n### Contract: TetherToken...",
  "timestamp": "2025-12-08T10:30:00.000Z",
  "cost_usd": 0.05
}`;

  // Custom style for syntax highlighter
  const customStyle = {
    background: 'rgba(0, 0, 0, 0.5)',
    border: '1px solid rgba(214, 237, 23, 0.2)',
    borderRadius: '0.5rem',
    padding: '1.5rem',
    margin: 0,
    fontSize: '0.8rem',
    lineHeight: '1.6',
  };

  return (
    <X402Layout>
      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-5xl font-bold gradient-text mb-4">x402 Payment Integration</h1>
          <p className="text-xl text-gray-400 mb-6">Seamless micropayments for AI-powered smart contract audits</p>
          <div className="flex justify-center space-x-4">
            <span className="inline-flex items-center px-4 py-2 bg-lime-400/10 border border-lime-400/30 rounded-full text-lime-400 text-sm">
              <FileArchive className="w-4 h-4 mr-2" />
              ZIP Upload: $0.10
            </span>
            <span className="inline-flex items-center px-4 py-2 bg-lime-400/10 border border-lime-400/30 rounded-full text-lime-400 text-sm">
              <MapPin className="w-4 h-4 mr-2" />
              Address-Based: $0.05
            </span>
          </div>
        </div>

        {/* Overview */}
        <section id="overview" className="scroll-mt-20 mb-12">
          <div className="glass-effect rounded-xl shadow-lg p-8 border border-lime-400/20">
            <h2 className="text-2xl font-bold gradient-text mb-6">Overview</h2>
            <p className="text-gray-300 mb-6">
              Hexific offers two methods for professional AI-powered smart contract audits via x402 micropayments:
            </p>
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* ZIP Upload Card */}
              <div className="glass-effect border border-lime-400/20 rounded-lg p-6 hover:border-lime-400/40 transition-all">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-lime-400/20 rounded-lg flex items-center justify-center mr-4">
                    <FileArchive className="w-6 h-6 text-lime-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">ZIP Upload</h3>
                    <span className="text-lime-400 font-semibold">$0.10 USDC</span>
                  </div>
                </div>
                <ul className="space-y-2 text-gray-400 text-sm">
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-lime-400 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Upload your own Foundry/Hardhat project</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-lime-400 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Supports unverified & private contracts</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-lime-400 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Full Slither + Claude analysis</span>
                  </li>
                </ul>
              </div>

              {/* Address-Based Card */}
              <div className="glass-effect border border-lime-400/20 rounded-lg p-6 hover:border-lime-400/40 transition-all">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-lime-400/20 rounded-lg flex items-center justify-center mr-4">
                    <MapPin className="w-6 h-6 text-lime-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Address-Based</h3>
                    <span className="text-lime-400 font-semibold">$0.05 USDC</span>
                    <span className="ml-2 text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">50% CHEAPER</span>
                  </div>
                </div>
                <ul className="space-y-2 text-gray-400 text-sm">
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-lime-400 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Just provide contract address</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-lime-400 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Auto-fetches from Etherscan</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-lime-400 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Requires verified contract on Etherscan</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Methods Comparison */}
        <section id="comparison" className="scroll-mt-20 mb-12">
          <div className="glass-effect rounded-xl shadow-lg p-8 border border-lime-400/20">
            <h2 className="text-2xl font-bold gradient-text mb-6">Methods Comparison</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-lime-400/20">
                    <th className="text-left py-4 px-4 text-white font-semibold">Feature</th>
                    <th className="text-center py-4 px-4 text-white font-semibold">
                      <div className="flex items-center justify-center">
                        <FileArchive className="w-4 h-4 mr-2" />
                        ZIP Upload
                      </div>
                    </th>
                    <th className="text-center py-4 px-4 text-white font-semibold">
                      <div className="flex items-center justify-center">
                        <MapPin className="w-4 h-4 mr-2" />
                        Address-Based
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-lime-400/10">
                    <td className="py-4 px-4 font-medium text-gray-300">Price</td>
                    <td className="py-4 px-4 text-center text-lime-400 font-semibold">$0.10 USDC</td>
                    <td className="py-4 px-4 text-center text-lime-400 font-semibold">$0.05 USDC</td>
                  </tr>
                  <tr className="border-b border-lime-400/10">
                    <td className="py-4 px-4 font-medium text-gray-300">API Endpoint</td>
                    <td className="py-4 px-4 text-center text-gray-400 font-mono text-sm">/ai-audit-pro</td>
                    <td className="py-4 px-4 text-center text-gray-400 font-mono text-sm">/ai-audit-address</td>
                  </tr>
                  <tr className="border-b border-lime-400/10">
                    <td className="py-4 px-4 font-medium text-gray-300">Input</td>
                    <td className="py-4 px-4 text-center text-gray-400">.zip file (FormData)</td>
                    <td className="py-4 px-4 text-center text-gray-400">Contract address (JSON)</td>
                  </tr>
                  <tr className="border-b border-lime-400/10">
                    <td className="py-4 px-4 font-medium text-gray-300">Verified Contract Required</td>
                    <td className="py-4 px-4 text-center"><XCircle className="w-5 h-5 text-gray-500 mx-auto" /></td>
                    <td className="py-4 px-4 text-center"><CheckCircle className="w-5 h-5 text-lime-400 mx-auto" /></td>
                  </tr>
                  <tr className="border-b border-lime-400/10">
                    <td className="py-4 px-4 font-medium text-gray-300">Private/Unverified Contracts</td>
                    <td className="py-4 px-4 text-center"><CheckCircle className="w-5 h-5 text-lime-400 mx-auto" /></td>
                    <td className="py-4 px-4 text-center"><XCircle className="w-5 h-5 text-gray-500 mx-auto" /></td>
                  </tr>
                  <tr className="border-b border-lime-400/10">
                    <td className="py-4 px-4 font-medium text-gray-300">Supported Networks</td>
                    <td className="py-4 px-4 text-center text-gray-400">Any EVM</td>
                    <td className="py-4 px-4 text-center text-gray-400">Ethereum (more coming)</td>
                  </tr>
                  <tr className="border-b border-lime-400/10">
                    <td className="py-4 px-4 font-medium text-gray-300">AI Model</td>
                    <td className="py-4 px-4 text-center text-lime-400">Claude Sonnet 4.5</td>
                    <td className="py-4 px-4 text-center text-lime-400">Claude Sonnet 4.5</td>
                  </tr>
                  <tr>
                    <td className="py-4 px-4 font-medium text-gray-300">Best For</td>
                    <td className="py-4 px-4 text-center text-gray-400">Pre-deployment audits</td>
                    <td className="py-4 px-4 text-center text-gray-400">Deployed contract analysis</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Prerequisites */}
        <section id="prerequisites" className="scroll-mt-20 mb-12">
          <div className="glass-effect rounded-xl shadow-lg p-8 border border-lime-400/20">
            <h2 className="text-2xl font-bold gradient-text mb-6">Prerequisites</h2>
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
                  <h3 className="font-semibold text-white">Wallet with USDC on Base Sepolia</h3>
                  <p className="text-gray-400">Get testnet USDC from <a href="https://faucet.circle.com" target="_blank" rel="noopener noreferrer" className="text-lime-400 hover:underline">Circle Faucet</a></p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-lime-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-white">Private Key (for programmatic access)</h3>
                  <p className="text-gray-400">Store securely in environment variables. Never commit!</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Installation */}
        <section id="installation" className="scroll-mt-20 mb-12">
          <div className="glass-effect rounded-xl shadow-lg p-8 border border-lime-400/20">
            <h2 className="text-2xl font-bold gradient-text mb-6">Installation</h2>
            <div className="relative group">
              <button
                onClick={() => copyToClipboard('npm install x402-fetch viem', 'install')}
                className="absolute top-4 right-4 z-10 p-2 bg-lime-400/10 border border-lime-400/30 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-lime-400/20"
              >
                {copiedCode === 'install' ? <Check className="w-4 h-4 text-lime-400" /> : <Copy className="w-4 h-4 text-lime-400" />}
              </button>
              <SyntaxHighlighter language="bash" style={vscDarkPlus} customStyle={customStyle}>
                npm install x402-fetch viem
              </SyntaxHighlighter>
            </div>
          </div>
        </section>

        {/* ZIP Upload Audit */}
        <section id="zip-audit" className="scroll-mt-20 mb-12">
          <div className="glass-effect rounded-xl shadow-lg p-8 border border-lime-400/20">
            <div className="flex items-center mb-6">
              <FileArchive className="w-8 h-8 text-lime-400 mr-3" />
              <div>
                <h2 className="text-2xl font-bold gradient-text">ZIP Upload Audit</h2>
                <p className="text-gray-400 text-sm">Endpoint: POST /ai-audit-pro • Price: $0.10 USDC</p>
              </div>
            </div>

            <div className="mb-6 p-4 bg-lime-400/10 border border-lime-400/30 rounded-lg">
              <h4 className="font-semibold text-lime-400 mb-2">When to use:</h4>
              <ul className="text-gray-300 text-sm space-y-1">
                <li>• Pre-deployment audits for private contracts</li>
                <li>• Projects not yet deployed on mainnet</li>
                <li>• Full Foundry/Hardhat project analysis</li>
                <li>• Contracts not verified on block explorers</li>
              </ul>
            </div>

            <div className="relative group mb-6">
              <button
                onClick={() => copyToClipboard(zipAuditCode, 'zip')}
                className={`absolute top-4 right-4 z-10 flex items-center gap-2 px-3 py-1.5 bg-lime-400 text-black rounded-lg font-semibold text-sm hover:bg-lime-300 ${copiedCode !== 'zip' && 'cursor-pointer'} transition-colors`}
              >
                {copiedCode === 'zip' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copiedCode === 'zip' ? 'Copied!' : 'Copy'}
              </button>
              <SyntaxHighlighter 
                language="typescript" 
                style={vscDarkPlus} 
                customStyle={customStyle}
                showLineNumbers
              >
                {zipAuditCode}
              </SyntaxHighlighter>
            </div>

            <div className="border-l-4 border-yellow-500 bg-yellow-500/10 p-4 rounded-r-lg">
              <h4 className="font-semibold text-yellow-400 mb-2">⚠️ ZIP Requirements:</h4>
              <ul className="text-gray-300 text-sm space-y-1">
                <li>• Maximum file size: 100MB</li>
                <li>• Must contain .sol files</li>
                <li>• Include foundry.toml or hardhat.config.js for best results</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Address-Based Audit */}
        <section id="address-audit" className="scroll-mt-20 mb-12">
          <div className="glass-effect rounded-xl shadow-lg p-8 border border-lime-400/20">
            <div className="flex items-center mb-6">
              <MapPin className="w-8 h-8 text-lime-400 mr-3" />
              <div>
                <h2 className="text-2xl font-bold gradient-text">Address-Based Audit</h2>
                <p className="text-gray-400 text-sm">Endpoint: POST /ai-audit-address • Price: $0.05 USDC</p>
              </div>
            </div>

            <div className="mb-6 p-4 bg-lime-400/10 border border-lime-400/30 rounded-lg">
              <h4 className="font-semibold text-lime-400 mb-2">When to use:</h4>
              <ul className="text-gray-300 text-sm space-y-1">
                <li>• Auditing already-deployed contracts</li>
                <li>• Analyzing third-party contracts</li>
                <li>• Quick security checks on any verified contract</li>
                <li>• 50% cheaper than ZIP upload!</li>
              </ul>
            </div>

            <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <h4 className="font-semibold text-blue-400 mb-2">How it works:</h4>
              <ol className="text-gray-300 text-sm space-y-2">
                <li className="flex items-start">
                  <span className="text-blue-400 font-bold mr-2">1.</span>
                  <span>You provide a contract address + network</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-400 font-bold mr-2">2.</span>
                  <span>We fetch verified source code from Etherscan API</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-400 font-bold mr-2">3.</span>
                  <span>Slither analyzes the code for vulnerabilities</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-400 font-bold mr-2">4.</span>
                  <span>Claude provides detailed audit report</span>
                </li>
              </ol>
            </div>

            <div className="relative group mb-6">
              <button
                onClick={() => copyToClipboard(addressAuditCode, 'address')}
                className={`absolute top-4 right-4 z-10 flex items-center gap-2 px-3 py-1.5 bg-lime-400 text-black rounded-lg font-semibold text-sm hover:bg-lime-300 ${copiedCode !== 'address' && 'cursor-pointer'} transition-colors`}
              >
                {copiedCode === 'address' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copiedCode === 'address' ? 'Copied!' : 'Copy'}
              </button>
              <SyntaxHighlighter 
                language="typescript" 
                style={vscDarkPlus} 
                customStyle={customStyle}
                showLineNumbers
              >
                {addressAuditCode}
              </SyntaxHighlighter>
            </div>

            <div className="border-l-4 border-lime-400 bg-lime-400/10 p-4 rounded-r-lg">
              <h4 className="font-semibold text-lime-400 mb-2">📍 Supported Networks:</h4>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-lime-400/20 text-lime-400 rounded-full text-sm">✅ Ethereum Mainnet</span>
                <span className="px-3 py-1 bg-gray-500/20 text-gray-400 rounded-full text-sm">🔜 Base</span>
                <span className="px-3 py-1 bg-gray-500/20 text-gray-400 rounded-full text-sm">🔜 Arbitrum</span>
                <span className="px-3 py-1 bg-gray-500/20 text-gray-400 rounded-full text-sm">🔜 Polygon</span>
              </div>
            </div>
          </div>
        </section>

        {/* API Reference */}
        <section id="api-reference" className="scroll-mt-20 mb-12">
          <div className="glass-effect rounded-xl shadow-lg p-8 border border-lime-400/20">
            <h2 className="text-2xl font-bold gradient-text mb-6">API Reference</h2>
            
            <AuditMethodTabs activeTab={activeTab} setActiveTab={setActiveTab} />

            {activeTab === 'zip' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">POST /ai-audit-pro</h3>
                  <p className="text-gray-400 mb-4">Upload a ZIP file containing your smart contract project.</p>
                  
                  <h4 className="text-sm font-semibold text-lime-400 mb-2">Request</h4>
                  <SyntaxHighlighter language="javascript" style={vscDarkPlus} customStyle={customStyle}>
{`// Content-Type: multipart/form-data
const formData = new FormData();
formData.append('file', zipBlob, 'contract.zip');

await fetchWithPayment('https://api.hexific.com/ai-audit-pro', {
  method: 'POST',
  body: formData,
});`}
                  </SyntaxHighlighter>
                </div>
              </div>
            )}

            {activeTab === 'address' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">POST /ai-audit-address</h3>
                  <p className="text-gray-400 mb-4">Audit a deployed contract by its address.</p>
                  
                  <h4 className="text-sm font-semibold text-lime-400 mb-2">Request Body</h4>
                  <SyntaxHighlighter language="json" style={vscDarkPlus} customStyle={customStyle}>
{`{
  "contract_address": "0xdAC17F958D2ee523a2206206994597C13D831ec7",
  "network": "ethereum"
}`}
                  </SyntaxHighlighter>
                  
                  <h4 className="text-sm font-semibold text-lime-400 mt-4 mb-2">Parameters</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-lime-400/20">
                          <th className="text-left py-2 px-4 text-white">Parameter</th>
                          <th className="text-left py-2 px-4 text-white">Type</th>
                          <th className="text-left py-2 px-4 text-white">Required</th>
                          <th className="text-left py-2 px-4 text-white">Description</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-lime-400/10">
                          <td className="py-2 px-4 font-mono text-lime-400">contract_address</td>
                          <td className="py-2 px-4 text-gray-400">string</td>
                          <td className="py-2 px-4"><CheckCircle className="w-4 h-4 text-lime-400" /></td>
                          <td className="py-2 px-4 text-gray-400">Ethereum address (0x...)</td>
                        </tr>
                        <tr>
                          <td className="py-2 px-4 font-mono text-lime-400">network</td>
                          <td className="py-2 px-4 text-gray-400">string</td>
                          <td className="py-2 px-4 text-gray-500">Optional</td>
                          <td className="py-2 px-4 text-gray-400">Default: &quot;ethereum&quot;</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Response Format */}
        <section id="response-format" className="scroll-mt-20 mb-12">
          <div className="glass-effect rounded-xl shadow-lg p-8 border border-lime-400/20">
            <h2 className="text-2xl font-bold gradient-text mb-6">Response Format</h2>
            
            <AuditMethodTabs activeTab={activeTab} setActiveTab={setActiveTab} />

            {activeTab === 'zip' && (
              <div className="relative group">
                <SyntaxHighlighter language="json" style={vscDarkPlus} customStyle={customStyle}>
                  {responseFormatZip}
                </SyntaxHighlighter>
              </div>
            )}

            {activeTab === 'address' && (
              <div className="relative group">
                <SyntaxHighlighter language="json" style={vscDarkPlus} customStyle={customStyle}>
                  {responseFormatAddress}
                </SyntaxHighlighter>
              </div>
            )}
          </div>
        </section>

        {/* Troubleshooting */}
        <section id="troubleshooting" className="scroll-mt-20 mb-12">
          <div className="glass-effect rounded-xl shadow-lg p-8 border border-lime-400/20">
            <h2 className="text-2xl font-bold gradient-text mb-6">Troubleshooting</h2>
            <div className="space-y-4">
              <div className="border-l-4 border-red-500 bg-red-500/10 p-4 rounded-r-lg">
                <h3 className="font-semibold text-red-400 mb-2">❌ &quot;Contract is not verified on Etherscan&quot;</h3>
                <p className="text-gray-300 text-sm mb-2">The address-based audit requires the contract to be verified on Etherscan.</p>
                <p className="text-gray-400 text-sm"><strong>Solution:</strong> Use ZIP upload method instead, or verify your contract on Etherscan first.</p>
              </div>
              
              <div className="border-l-4 border-red-500 bg-red-500/10 p-4 rounded-r-lg">
                <h3 className="font-semibold text-red-400 mb-2">❌ Insufficient USDC Balance</h3>
                <p className="text-gray-300 text-sm mb-2">Your wallet needs USDC on Base Sepolia testnet.</p>
                <p className="text-gray-400 text-sm"><strong>Solution:</strong> Get testnet USDC from <a href="https://faucet.circle.com" target="_blank" rel="noopener noreferrer" className="text-lime-400 hover:underline">Circle Faucet</a></p>
              </div>
              
              <div className="border-l-4 border-yellow-500 bg-yellow-500/10 p-4 rounded-r-lg">
                <h3 className="font-semibold text-yellow-400 mb-2">⚠️ &quot;Invalid Ethereum address format&quot;</h3>
                <p className="text-gray-300 text-sm mb-2">Address must start with &quot;0x&quot; and be 42 characters long.</p>
                <p className="text-gray-400 text-sm"><strong>Example:</strong> <code className="text-lime-400">0xdAC17F958D2ee523a2206206994597C13D831ec7</code></p>
              </div>
              
              <div className="border-l-4 border-yellow-500 bg-yellow-500/10 p-4 rounded-r-lg">
                <h3 className="font-semibold text-yellow-400 mb-2">⚠️ &quot;Contract source code too large&quot;</h3>
                <p className="text-gray-300 text-sm mb-2">Address-based audits have a 500KB limit for source code.</p>
                <p className="text-gray-400 text-sm"><strong>Solution:</strong> For very large contracts, use ZIP upload method.</p>
              </div>
              
              <div className="border-l-4 border-lime-400 bg-lime-400/10 p-4 rounded-r-lg">
                <h3 className="font-semibold text-lime-400 mb-2">ℹ️ Payment Transaction Failed</h3>
                <p className="text-gray-300 text-sm">Check your wallet connection and ensure you have enough USDC + ETH for gas.</p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="scroll-mt-20 mb-12">
          <div className="glass-effect rounded-xl shadow-lg p-8 border border-lime-400/20">
            <h2 className="text-2xl font-bold gradient-text mb-6">FAQ</h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-white mb-2">Which method should I choose?</h3>
                <p className="text-gray-400">Use <strong className="text-lime-400">Address-Based</strong> ($0.05) for verified deployed contracts. Use <strong className="text-lime-400">ZIP Upload</strong> ($0.10) for private, unverified, or pre-deployment contracts.</p>
              </div>
              
              <div>
                <h3 className="font-semibold text-white mb-2">Why is address-based audit cheaper?</h3>
                <p className="text-gray-400">Address-based audits fetch source code from Etherscan, reducing server-side processing. ZIP uploads require extraction, validation, and dependency resolution.</p>
              </div>
              
              <div>
                <h3 className="font-semibold text-white mb-2">What networks are supported for address-based audits?</h3>
                <p className="text-gray-400">Currently Ethereum mainnet only. Base, Arbitrum, Polygon, and BSC coming soon!</p>
              </div>
              
              <div>
                <h3 className="font-semibold text-white mb-2">What is x402?</h3>
                <p className="text-gray-400">x402 is a decentralized micropayment protocol enabling pay-per-use API access. Learn more at <a href="https://x402.org" target="_blank" rel="noopener noreferrer" className="text-lime-400 hover:underline inline-flex items-center gap-1">x402.org <ExternalLink className="w-3 h-3" /></a></p>
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
          <h2 className="text-2xl font-bold gradient-text mb-4">Need Help?</h2>
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