'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

// Sidebar Navigation Component
function DocsSidebar() {
  const [activeSection, setActiveSection] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll('section[id]');
      let current = '';

      sections.forEach((section) => {
        const sectionTop = (section as HTMLElement).offsetTop;
        const sectionHeight = (section as HTMLElement).clientHeight;
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
    { id: 'getting-started', label: 'Getting Started', icon: '🚀' },
    { id: 'how-to-use', label: 'How to Use', icon: '📖' },
    { id: 'ai-assistant', label: 'AI Assistant', icon: '🤖' },
    { id: 'security-findings', label: 'Security Findings', icon: '🔒' },
    { id: 'wallet-guide', label: 'Wallet Guide', icon: '💼' },
    { id: 'tips', label: 'Tips & Best Practices', icon: '💡' },
    { id: 'help', label: 'Need Help?', icon: '❓' },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-[#000E1B] border-r border-lime-400/20 overflow-y-auto pt-20 hidden lg:block z-40">
      <div className="px-4 py-6">
        <h3 className="text-xs font-semibold text-lime-400 uppercase tracking-wider mb-4">
          Contents
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
            href="/x402"
            className="block p-3 glass-effect border border-lime-400/20 rounded-lg hover:border-lime-400/40 transition-all"
          >
            <div className="text-lime-400 text-xs font-semibold mb-1">
              🔌 x402
            </div>
            <div className="text-gray-400 text-xs">x402 Integration</div>
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

          <a
            href="mailto:admin@hexific.com"
            className="block p-3 glass-effect border border-lime-400/20 rounded-lg hover:border-lime-400/40 transition-all"
          >
            <div className="text-lime-400 text-xs font-semibold mb-1">
              📧 Contact
            </div>
            <div className="text-gray-400 text-xs">Get support</div>
          </a>

          <div className="pt-4 border-t border-lime-400/20 mt-4">
            <h4 className="text-xs font-semibold text-gray-500 uppercase mb-3">
              Resources
            </h4>
            <div className="space-y-2">
              <a
                href="https://github.com/crytic/slither"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-xs text-gray-400 hover:text-lime-400 transition-colors"
              >
                → Slither Docs
              </a>
              <a
                href="https://docs.soliditylang.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-xs text-gray-400 hover:text-lime-400 transition-colors"
              >
                → Solidity Docs
              </a>
              <a
                href="https://www.x402.org"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-xs text-gray-400 hover:text-lime-400 transition-colors"
              >
                → x402 Protocol
              </a>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

// Main Documentation Layout
function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#000E1B]">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-[#000E1B]/95 backdrop-blur-lg border-b border-lime-400/20 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-lime-400 gradient-text">HEXIFIC</span>
              <span className="text-xs text-gray-500">DOCS</span>
            </Link>
            <nav className="hidden md:flex items-center space-x-6">
              <Link
                href="/docs"
                className="text-lime-400 font-semibold text-sm"
              >
                Documentation
              </Link>
              <Link
                href="/x402"
                className="text-gray-400 hover:text-lime-400 transition-colors text-sm"
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
      <DocsSidebar />
      <QuickLinksSidebar />

      {/* Main Content */}
      <main className="lg:ml-64 xl:mr-64 pt-20 px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-4xl mx-auto">{children}</div>
      </main>

      {/* Footer */}
      <footer className="lg:ml-64 xl:mr-64 border-t border-lime-400/20 mt-20 bg-[#000E1B]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center text-gray-400 text-sm">
            <p>© 2025 Hexific. All rights reserved.</p>
            <div className="flex justify-center space-x-4 mt-4">
              <Link
                href="/privacy"
                className="hover:text-lime-400 transition-colors"
              >
                Privacy
              </Link>
              <span className="text-gray-600">•</span>
              <Link
                href="/terms-of-service"
                className="hover:text-lime-400 transition-colors"
              >
                Terms
              </Link>
              <span className="text-gray-600">•</span>
              <a
                href="mailto:admin@hexific.com"
                className="hover:text-lime-400 transition-colors"
              >
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Documentation Page Component
export default function DocsPage() {
  return (
    <DocsLayout>
      <div className="prose prose-invert max-w-none">
        {/* Hero Section */}
        <div className="mb-12 text-center">
          <h1 className="text-5xl text-white font-bold gradient-text mb-4">
            Documentation
          </h1>
          <p className="text-xl text-gray-400">
            Learn how to use Hexific for smart contract security audits
          </p>
        </div>

        {/* Quick Start Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 not-prose mb-12">
          <a
            href="#getting-started"
            className="glass-effect p-6 rounded-xl border border-lime-400/20 hover:border-lime-400/40 transition-all hover:scale-105"
          >
            <div className="text-3xl mb-3">🚀</div>
            <h3 className="font-bold text-lg text-white mb-2">
              Getting Started
            </h3>
            <p className="text-gray-400 text-sm">
              Learn how to use Hexific
            </p>
          </a>
          <a
            href="#ai-assistant"
            className="glass-effect p-6 rounded-xl border border-lime-400/20 hover:border-lime-400/40 transition-all hover:scale-105"
          >
            <div className="text-3xl mb-3">🤖</div>
            <h3 className="font-bold text-lg text-white mb-2">AI Assistant</h3>
            <p className="text-gray-400 text-sm">Get help from AI</p>
          </a>
          <a
            href="#security-findings"
            className="glass-effect p-6 rounded-xl border border-lime-400/20 hover:border-lime-400/40 transition-all hover:scale-105"
          >
            <div className="text-3xl mb-3">🔒</div>
            <h3 className="font-bold text-lg text-white mb-2">
              Security Guide
            </h3>
            <p className="text-gray-400 text-sm">Understand findings</p>
          </a>
        </div>

        {/* Getting Started */}
        <section id="getting-started" className="scroll-mt-20">
          <h2 className="text-3xl text-lime-400 font-bold gradient-text mb-6">
            Getting Started
          </h2>

          <h3 className="text-2xl font-semibold text-white mb-4">
            What is Hexific?
          </h3>
          <p className="text-gray-300 mb-6">
            Hexific is a free automated security audit platform for smart
            contracts. Upload your Solidity code and get instant analysis
            powered by Slither, plus AI-powered explanations to help you
            understand and fix vulnerabilities.
          </p>

          <h3 className="text-2xl font-semibold text-white mb-4">
            Why Use Hexific?
          </h3>
          <ul className="text-gray-300 space-y-2 mb-6">
            <li className="flex items-start">
              <span className="text-lime-400 mr-2">✓</span>
              <span>
                <strong>Free Audits</strong> - Unlimited free Slither analysis
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-lime-400 mr-2">✓</span>
              <span>
                <strong>AI Assistant</strong> - Get plain-English explanations
                of security issues
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-lime-400 mr-2">✓</span>
              <span>
                <strong>Fast Results</strong> - Get your audit in under 5
                minutes
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-lime-400 mr-2">✓</span>
              <span>
                <strong>Private & Secure</strong> - Your code is deleted
                immediately after analysis
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-lime-400 mr-2">✓</span>
              <span>
                <strong>Learn as You Build</strong> - Understand
                vulnerabilities and how to fix them
              </span>
            </li>
          </ul>
        </section>

        {/* How to Use */}
        <section id="how-to-use" className="scroll-mt-20">
          <h2 className="text-3xl text-lime-400 font-bold gradient-text mb-6">
            How to Use Hexific
          </h2>

          <h3 className="text-2xl font-semibold text-white mb-4">
            Step 1: Prepare Your Contract
          </h3>
          <p className="text-gray-300 mb-4">
            Package your Solidity project as a ZIP file.
          </p>

          <div className="not-prose bg-black/50 border border-lime-400/20 rounded-lg p-4 mb-4">
            <p className="text-sm text-gray-400 mb-2">For Foundry Projects:</p>
            <code className="text-lime-400 text-sm">
              cd your-project
              <br />
              zip -r my-contract.zip src/ foundry.toml lib/
            </code>
          </div>

          <div className="not-prose glass-effect border border-lime-400/20 rounded-lg p-4 mb-6">
            <p className="font-semibold text-lime-400 mb-2">Requirements:</p>
            <ul className="text-sm text-gray-300 space-y-1 ml-4">
              <li>• Must be a ZIP file</li>
              <li>• Maximum 100MB</li>
              <li>• Must contain .sol files</li>
              <li>• For Foundry projects, include foundry.toml or src/ folder</li>
            </ul>
          </div>

          <h3 className="text-2xl font-semibold text-white mb-4">
            Step 2: Upload Your Contract
          </h3>
          <ol className="text-gray-300 space-y-2 mb-6 list-decimal list-inside">
            <li>
              Visit{' '}
              <Link href="/" className="text-lime-400 hover:underline">
                hexific.com
              </Link>
            </li>
            <li>
              Click <strong className="text-white">&quot;Start Free Audit&quot;</strong>
            </li>
            <li>Drag and drop your ZIP file (or click to browse)</li>
            <li>
              Click{' '}
              <strong className="text-white">&quot;Start Free Audit&quot;</strong> button
            </li>
            <li>Wait 30 seconds to 5 minutes for results</li>
          </ol>

          <div className="not-prose glass-effect border border-lime-400/30 rounded-lg p-4 mb-6">
            <p className="font-semibold text-lime-400 mb-2">
              🔒 What happens to your code?
            </p>
            <p className="text-sm text-gray-300">
              Your files are analyzed on our secure servers and automatically
              deleted within minutes. We never store, share, or train AI models
              on your code.
            </p>
          </div>

          <h3 className="text-2xl font-semibold text-white mb-4">
            Step 3: Review Your Results
          </h3>
          <p className="text-gray-300 mb-4">
            After analysis completes, you&apos;ll see:
          </p>

          <h4 className="text-xl font-semibold text-white mb-3">
            Summary Cards
          </h4>
          <p className="text-gray-300 mb-3">
            Quick overview of findings by severity:
          </p>
          <ul className="text-gray-300 space-y-2 mb-6">
            <li className="flex items-start">
              <span className="text-red-400 mr-2">●</span>
              <span>
                <strong className="text-red-400">High</strong> - Critical
                security issues (fix immediately)
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-orange-400 mr-2">●</span>
              <span>
                <strong className="text-orange-400">Medium</strong> - Important
                vulnerabilities (fix before deployment)
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-yellow-400 mr-2">●</span>
              <span>
                <strong className="text-yellow-400">Low</strong> - Minor issues
                (good to address)
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-400 mr-2">●</span>
              <span>
                <strong className="text-blue-400">Informational</strong> - Code
                quality suggestions
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-lime-400 mr-2">●</span>
              <span>
                <strong className="text-lime-400">Optimization</strong> -
                Gas-saving opportunities
              </span>
            </li>
          </ul>
        </section>

        {/* AI Assistant */}
        <section id="ai-assistant" className="scroll-mt-20">
          <h2 className="text-3xl text-lime-400 font-bold gradient-text mb-6">
            AI Assistant
          </h2>

          <h3 className="text-2xl font-semibold text-white mb-4">
            Free Questions
          </h3>
          <p className="text-gray-300 mb-6">
            You get <strong className="text-lime-400">3 free AI questions</strong> per
            audit. Click{' '}
            <strong className="text-white">&quot;Ask AI About Your Audit&quot;</strong>{' '}
            to start.
          </p>

          <h3 className="text-2xl font-semibold text-white mb-4">
            Example Questions
          </h3>
          <ul className="text-gray-300 space-y-2 mb-6">
            <li className="flex items-start">
              <span className="text-lime-400 mr-2">→</span>
              <span>&quot;Explain the high severity findings in simple terms&quot;</span>
            </li>
            <li className="flex items-start">
              <span className="text-lime-400 mr-2">→</span>
              <span>&quot;How do I fix the reentrancy vulnerability?&quot;</span>
            </li>
            <li className="flex items-start">
              <span className="text-lime-400 mr-2">→</span>
              <span>&quot;What&apos;s the risk level of these medium issues?&quot;</span>
            </li>
            <li className="flex items-start">
              <span className="text-lime-400 mr-2">→</span>
              <span>
                &quot;Show me code examples to fix the access control problem&quot;
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-lime-400 mr-2">→</span>
              <span>
                &quot;Should I be worried about these gas optimizations?&quot;
              </span>
            </li>
          </ul>

          <h3 className="text-2xl font-semibold text-white mb-4">
            Paid Questions
          </h3>
          <p className="text-gray-300 mb-3">After your 3 free questions:</p>
          <ul className="text-gray-300 space-y-2 mb-6">
            <li className="flex items-start">
              <span className="text-lime-400 mr-2">•</span>
              <span>
                <strong className="text-white">$0.10 per question</strong> (currently on
                testnet - free during beta)
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-lime-400 mr-2">•</span>
              <span>Connect your wallet</span>
            </li>
            <li className="flex items-start">
              <span className="text-lime-400 mr-2">•</span>
              <span>Sign to verify payment</span>
            </li>
            <li className="flex items-start">
              <span className="text-lime-400 mr-2">•</span>
              <span>Get instant AI response</span>
            </li>
          </ul>

          <div className="not-prose glass-effect border border-lime-400/30 rounded-lg p-4 mb-6">
            <p className="font-semibold text-lime-400 mb-2">
              💡 Tips for Better AI Responses:
            </p>
            <ul className="text-sm text-gray-300 space-y-1 ml-4">
              <li>• Be specific - Ask about particular findings</li>
              <li>• One topic at a time - Don&apos;t mix multiple questions</li>
              <li>• Provide context - Mention your use case if relevant</li>
              <li>• Follow up - Use your queries to drill down</li>
            </ul>
          </div>
        </section>

        {/* Security Findings */}
        <section id="security-findings" className="scroll-mt-20">
          <h2 className="text-3xl text-lime-400 font-bold gradient-text mb-6">
            Understanding Security Findings
          </h2>

          <div className="not-prose space-y-4 mb-8">
            {/* High Severity */}
            <div className="bg-red-950/30 border-l-4 border-red-500 p-4 rounded-r-lg">
              <h3 className="text-red-400 font-bold text-lg mb-2">
                🔴 High Severity
              </h3>
              <p className="text-gray-300 mb-2">
                <strong>What it means:</strong> Critical security
                vulnerabilities that could lead to loss of funds or contract
                compromise.
              </p>
              <p className="text-gray-300 mb-2">
                <strong>Examples:</strong> Reentrancy attacks, Access control
                issues, Integer overflow/underflow
              </p>
              <p className="text-red-400 font-semibold">
                ⚠️ Action: Fix immediately before any deployment.
              </p>
            </div>

            {/* Medium Severity */}
            <div className="bg-orange-950/30 border-l-4 border-orange-500 p-4 rounded-r-lg">
              <h3 className="text-orange-400 font-bold text-lg mb-2">
                🟠 Medium Severity
              </h3>
              <p className="text-gray-300 mb-2">
                <strong>What it means:</strong> Important security issues that
                could be exploited under certain conditions.
              </p>
              <p className="text-gray-300 mb-2">
                <strong>Examples:</strong> Unprotected functions, Missing input
                validation, Weak randomness
              </p>
              <p className="text-orange-400 font-semibold">
                ⚠️ Action: Fix before mainnet deployment.
              </p>
            </div>

            {/* Low Severity */}
            <div className="bg-yellow-950/30 border-l-4 border-yellow-500 p-4 rounded-r-lg">
              <h3 className="text-yellow-400 font-bold text-lg mb-2">
                🟡 Low Severity
              </h3>
              <p className="text-gray-300 mb-2">
                <strong>What it means:</strong> Minor issues that could cause
                unexpected behavior but are harder to exploit.
              </p>
              <p className="text-gray-300 mb-2">
                <strong>Examples:</strong> Missing event emissions, Unused
                variables, Outdated compiler version
              </p>
              <p className="text-yellow-400 font-semibold">
                Action: Good practice to fix, but not critical.
              </p>
            </div>

            {/* Informational */}
            <div className="bg-blue-950/30 border-l-4 border-blue-500 p-4 rounded-r-lg">
              <h3 className="text-blue-400 font-bold text-lg mb-2">
                🔵 Informational
              </h3>
              <p className="text-gray-300 mb-2">
                <strong>What it means:</strong> Code quality and best practice
                suggestions.
              </p>
              <p className="text-gray-300 mb-2">
                <strong>Examples:</strong> Naming conventions, Code
                organization, Documentation suggestions
              </p>
              <p className="text-blue-400 font-semibold">
                Action: Optional improvements for better code quality.
              </p>
            </div>

            {/* Optimization */}
            <div className="bg-lime-950/30 border-l-4 border-lime-500 p-4 rounded-r-lg">
              <h3 className="text-lime-400 font-bold text-lg mb-2">
                🟢 Optimization
              </h3>
              <p className="text-gray-300 mb-2">
                <strong>What it means:</strong> Opportunities to reduce gas
                costs.
              </p>
              <p className="text-gray-300 mb-2">
                <strong>Examples:</strong> Storage optimizations, Loop
                improvements, Function visibility
              </p>
              <p className="text-lime-400 font-semibold">
                Action: Implement if gas costs are a concern.
              </p>
            </div>
          </div>
        </section>

        {/* Wallet Guide */}
        <section id="wallet-guide" className="scroll-mt-20">
          <h2 className="text-3xl text-lime-400 font-bold gradient-text mb-6">
            Wallet Connection Guide
          </h2>

          <h3 className="text-2xl font-semibold text-white mb-4">
            Why Connect a Wallet?
          </h3>
          <p className="text-gray-300 mb-6">
            You only need to connect a wallet for paid AI queries (after using
            your 3 free questions).
          </p>

          <h3 className="text-2xl font-semibold text-white mb-4">
            Supported Wallets
          </h3>
          <ul className="text-gray-300 space-y-2 mb-6">
            <li className="flex items-start">
              <span className="text-lime-400 mr-2">✓</span>
              <span>MetaMask</span>
            </li>
            <li className="flex items-start">
              <span className="text-lime-400 mr-2">✓</span>
              <span>Rainbow Wallet</span>
            </li>
            <li className="flex items-start">
              <span className="text-lime-400 mr-2">✓</span>
              <span>Coinbase Wallet</span>
            </li>
            <li className="flex items-start">
              <span className="text-lime-400 mr-2">✓</span>
              <span>WalletConnect (any compatible wallet)</span>
            </li>
          </ul>

          <h3 className="text-2xl font-semibold text-white mb-4">
            How to Connect
          </h3>
          <ol className="text-gray-300 space-y-2 mb-6 list-decimal list-inside">
            <li>
              Click <strong className="text-white">&quot;Connect Wallet&quot;</strong> when
              prompted
            </li>
            <li>Choose your wallet from the list</li>
            <li>Approve the connection in your wallet</li>
            <li>You&apos;re ready to make paid queries!</li>
          </ol>

          <div className="not-prose glass-effect border border-yellow-400/30 rounded-lg p-4 mb-6">
            <p className="font-semibold text-yellow-400">ℹ️ Note:</p>
            <p className="text-sm text-gray-300">
              Base mainnet with real USDC payments
            </p>
          </div>
        </section>

        {/* Tips */}
        <section id="tips" className="scroll-mt-20">
          <h2 className="text-3xl text-lime-400 font-bold gradient-text mb-6">
            Tips for Better Audits
          </h2>

          <h3 className="text-2xl font-semibold text-white mb-4">
            Before Uploading
          </h3>
          <ol className="text-gray-300 space-y-2 mb-6 list-decimal list-inside">
            <li>
              <strong className="text-white">Clean your code</strong> - Remove test
              files and node_modules from your ZIP
            </li>
            <li>
              <strong className="text-white">Check file size</strong> - Keep under
              100MB for faster processing
            </li>
            <li>
              <strong className="text-white">Include dependencies</strong> - For
              Foundry projects, include necessary imports
            </li>
            <li>
              <strong className="text-white">Update compiler</strong> - Use recent
              Solidity versions when possible
            </li>
          </ol>

          <h3 className="text-2xl font-semibold text-white mb-4">
            After Getting Results
          </h3>
          <ol className="text-gray-300 space-y-2 mb-6 list-decimal list-inside">
            <li>
              <strong className="text-white">Start with high severity</strong> -
              Fix critical issues first
            </li>
            <li>
              <strong className="text-white">Don&apos;t ignore informational</strong> -
              These can prevent future bugs
            </li>
            <li>
              <strong className="text-white">Ask AI for clarification</strong> -
              Use your free questions wisely
            </li>
            <li>
              <strong className="text-white">Test your fixes</strong> - Re-run the
              audit after making changes
            </li>
            <li>
              <strong className="text-white">Document changes</strong> - Keep track
              of what you fixed and why
            </li>
          </ol>
        </section>

        {/* CTA */}
        <div className="not-prose bg-gradient-to-r from-lime-400/20 to-lime-500/20 border border-lime-400/30 rounded-xl p-8 text-center my-12">
          <h2 className="text-3xl font-bold text-white gradient-text mb-4">
            Ready to Audit Your Contract?
          </h2>
          <p className="text-gray-300 mb-6">
            Get started with a free automated security audit in minutes
          </p>
          <Link
            href="/"
            className="bg-lime-400 text-black px-8 py-3 rounded-lg font-semibold hover:bg-lime-300 transition-all inline-block pulse-glow"
          >
            Start Free Audit →
          </Link>
        </div>

        {/* Need Help */}
        <section id="help" className="scroll-mt-20">
          <h2 className="text-3xl text-lime-400 font-bold gradient-text mb-6">Need Help?</h2>
          <div className="not-prose grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <a
              href="mailto:admin@hexific.com"
              className="glass-effect p-6 rounded-xl border border-lime-400/20 hover:border-lime-400/40 transition-all hover:scale-105"
            >
              <h3 className="font-bold text-lg text-white mb-2">
                📧 Email Support
              </h3>
              <p className="text-gray-400 text-sm mb-2">admin@hexific.com</p>
              <p className="text-gray-500 text-xs">Response in 24-48 hours</p>
            </a>
            <Link
              href="/faq"
              className="glass-effect p-6 rounded-xl border border-lime-400/20 hover:border-lime-400/40 transition-all hover:scale-105"
            >
              <h3 className="font-bold text-lg text-white mb-2">❓ FAQ</h3>
              <p className="text-gray-400 text-sm mb-2">Common questions</p>
              <p className="text-gray-500 text-xs">Instant answers</p>
            </Link>
          </div>
        </section>
      </div>
    </DocsLayout>
  );
}