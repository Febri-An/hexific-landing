"use client";

import React, { useState } from 'react';
import Link from 'next/link';

// Sidebar Navigation Component
function FAQSidebar() {
  const [activeSection, setActiveSection] = useState('');

  const menuItems = [
    { id: 'general', label: 'General', icon: '💬' },
    { id: 'technical', label: 'Technical', icon: '⚙️' },
    { id: 'ai', label: 'AI Assistant', icon: '🤖' },
    { id: 'payment', label: 'Payment', icon: '💳' },
  ];

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-[#000E1B] border-r border-lime-400/20 overflow-y-auto pt-20 hidden lg:block z-40">
      <div className="px-4 py-6">
        <h3 className="text-xs font-semibold text-lime-400 uppercase tracking-wider mb-4">
          Categories
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
          Quick Actions
        </h3>
        <div className="space-y-3">
          <Link
            href="/"
            className="block p-3 glass-effect border border-lime-400/20 rounded-lg hover:border-lime-400/40 transition-all"
          >
            <div className="text-lime-400 text-xs font-semibold mb-1">
              🔬 Start Audit
            </div>
            <div className="text-gray-400 text-xs">Free audit tool</div>
          </Link>

          <Link
            href="/docs"
            className="block p-3 glass-effect border border-lime-400/20 rounded-lg hover:border-lime-400/40 transition-all"
          >
            <div className="text-lime-400 text-xs font-semibold mb-1">
              📖 Documentation
            </div>
            <div className="text-gray-400 text-xs">Learn how to use</div>
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
              Popular Questions
            </h4>
            <div className="space-y-2">
              <a
                href="#is-hexific-free"
                className="block text-xs text-gray-400 hover:text-lime-400 transition-colors"
              >
                → Is Hexific free?
              </a>
              <a
                href="#code-privacy"
                className="block text-xs text-gray-400 hover:text-lime-400 transition-colors"
              >
                → Is my code safe?
              </a>
              <a
                href="#ai-help"
                className="block text-xs text-gray-400 hover:text-lime-400 transition-colors"
              >
                → How does AI help?
              </a>
              <a
                href="#wallet-needed"
                className="block text-xs text-gray-400 hover:text-lime-400 transition-colors"
              >
                → Why connect wallet?
              </a>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

// Docs Layout
function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#000E1B]">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-[#000E1B]/95 backdrop-blur-lg border-b border-lime-400/20 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-2xl text-lime-400 font-bold gradient-text">HEXIFIC</span>
              <span className="text-xs text-gray-500">FAQ</span>
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
                className="text-gray-400 hover:text-lime-400 transition-colors text-sm"
              >
                x402
              </Link>
              <Link
                href="/faq"
                className="text-lime-400 font-semibold text-sm"
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
      <FAQSidebar />
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

// FAQ Item Component
function FAQItem({ 
  question, 
  answer, 
  defaultOpen = false,
  id 
}: { 
  question: string; 
  answer: React.ReactNode; 
  defaultOpen?: boolean;
  id?: string;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div id={id} className="border-b border-lime-400/10 last:border-0 scroll-mt-20">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-6 flex justify-between items-start text-left hover:text-lime-400 transition-colors group"
      >
        <span className="font-semibold text-lg pr-8 text-white group-hover:text-lime-400 transition-colors">
          {question}
        </span>
        <svg
          className={`w-6 h-6 flex-shrink-0 hover:cursor-pointer transition-transform text-lime-400 ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <div className="pb-6 text-gray-300 leading-relaxed slide-up">
          {answer}
        </div>
      )}
    </div>
  );
}

// FAQ Page Component
export default function FAQPage() {
  return (
    <DocsLayout>
      <div className="max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white gradient-text mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-xl text-gray-400">
            Find answers to common questions about Hexific
          </p>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 not-prose">
          <a 
            href="#general" 
            className="glass-effect p-4 rounded-lg border border-lime-400/20 hover:border-lime-400/40 hover:scale-105 transition-all text-center"
          >
            <div className="text-2xl mb-2">💬</div>
            <div className="text-sm font-semibold text-white">General</div>
          </a>
          <a 
            href="#technical" 
            className="glass-effect p-4 rounded-lg border border-lime-400/20 hover:border-lime-400/40 hover:scale-105 transition-all text-center"
          >
            <div className="text-2xl mb-2">⚙️</div>
            <div className="text-sm font-semibold text-white">Technical</div>
          </a>
          <a 
            href="#ai" 
            className="glass-effect p-4 rounded-lg border border-lime-400/20 hover:border-lime-400/40 hover:scale-105 transition-all text-center"
          >
            <div className="text-2xl mb-2">🤖</div>
            <div className="text-sm font-semibold text-white">AI Assistant</div>
          </a>
          <a 
            href="#payment" 
            className="glass-effect p-4 rounded-lg border border-lime-400/20 hover:border-lime-400/40 hover:scale-105 transition-all text-center"
          >
            <div className="text-2xl mb-2">💳</div>
            <div className="text-sm font-semibold text-white">Payment</div>
          </a>
        </div>

        {/* General Questions */}
        <section id="general" className="glass-effect rounded-xl p-8 border border-lime-400/20 mb-8 scroll-mt-20">
          <h2 className="text-3xl font-bold text-lime-400 gradient-text mb-6 flex items-center">
            <span className="text-3xl mr-3">💬</span>
            General Questions
          </h2>

          <div className="space-y-0">
            <FAQItem
              id="is-hexific-free"
              question="Is Hexific really free?"
              defaultOpen={true}
              answer={
                <>
                  <p>Yes! Automated Slither audits are <strong className="text-white">completely free and unlimited</strong>.</p>
                  <p className="mt-2">AI assistance includes <strong className="text-lime-400">3 free questions per audit</strong>, then $0.10 per additional question (currently on testnet during beta).</p>
                </>
              }
            />

            <FAQItem
              question="How accurate is the automated audit?"
              answer={
                <>
                  <p>Slither catches approximately <strong className="text-lime-400">80% of common vulnerabilities</strong>. It&apos;s an excellent tool for development and catching standard security issues.</p>
                  <p className="mt-2">For production deployments of high-value protocols (&gt;$1M TVL), we strongly recommend professional manual audits in addition to automated scanning.</p>
                </>
              }
            />

            <FAQItem
              id="code-privacy"
              question="What happens to my code after I upload it?"
              answer={
                <>
                  <p><strong className="text-white">Your code is completely private:</strong></p>
                  <ul className="mt-2 space-y-1 ml-4">
                    <li className="flex items-start">
                      <span className="text-lime-400 mr-2">•</span>
                      <span>Analyzed in isolated Docker containers</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-lime-400 mr-2">•</span>
                      <span>Automatically deleted within minutes</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-lime-400 mr-2">•</span>
                      <span>Never stored on our servers</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-lime-400 mr-2">•</span>
                      <span>Never shared with third parties</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-lime-400 mr-2">•</span>
                      <span>Never used to train AI models</span>
                    </li>
                  </ul>
                  <p className="mt-2">Perfect for confidential or closed-source projects!</p>
                </>
              }
            />

            <FAQItem
              question="Can I use this for private/closed-source projects?"
              answer={
                <p>Absolutely! Your code never leaves our secure environment and is deleted after analysis. We have no access to your source code after the audit completes. Many teams use Hexific for confidential pre-launch projects.</p>
              }
            />

            <FAQItem
              question="What Solidity versions do you support?"
              answer={
                <>
                  <p>We support Solidity versions <strong className="text-lime-400">0.4.x through 0.8.x</strong>.</p>
                  <p className="mt-2">The system automatically detects your compiler version from your code and uses the appropriate Solidity compiler. No configuration needed!</p>
                </>
              }
            />
          </div>
        </section>

        {/* Technical Questions */}
        <section id="technical" className="glass-effect rounded-xl p-8 border border-lime-400/20 mb-8 scroll-mt-20">
          <h2 className="text-3xl font-bold text-lime-400 gradient-text mb-6 flex items-center">
            <span className="text-3xl mr-3">⚙️</span>
            Technical Questions
          </h2>

          <div className="space-y-0">
            <FAQItem
              question="Does this work with Hardhat projects?"
              answer={
                <>
                  <p>Slither works best with <strong className="text-lime-400">Foundry projects</strong>.</p>
                  <p className="mt-2">For Hardhat projects, we recommend:</p>
                  <ul className="mt-2 space-y-1 ml-4">
                    <li className="flex items-start">
                      <span className="text-lime-400 mr-2">•</span>
                      <span>Converting to Foundry structure (recommended)</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-lime-400 mr-2">•</span>
                      <span>Or ensuring you have proper compilation artifacts in your ZIP</span>
                    </li>
                  </ul>
                </>
              }
            />

            <FAQItem
              question="My audit is taking a long time..."
              answer={
                <>
                  <p><strong className="text-white">Normal processing times:</strong></p>
                  <ul className="mt-2 space-y-1 ml-4">
                    <li className="flex items-start">
                      <span className="text-lime-400 mr-2">•</span>
                      <span>Small contracts (&lt;100 lines): 30 seconds - 1 minute</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-lime-400 mr-2">•</span>
                      <span>Medium projects (100-500 lines): 1-3 minutes</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-lime-400 mr-2">•</span>
                      <span>Large projects (1000+ lines): 3-5 minutes</span>
                    </li>
                  </ul>
                  <p className="mt-3">If your audit is stuck for <strong className="text-red-400">more than 10 minutes</strong>, please contact <a href="mailto:admin@hexific.com" className="text-lime-400 hover:underline">admin@hexific.com</a> with your analysis ID.</p>
                </>
              }
            />

            <FAQItem
              question="Can I use this in my CI/CD pipeline?"
              answer={
                <>
                  <p>API access for CI/CD integration is <strong className="text-lime-400">coming soon</strong>!</p>
                  <p className="mt-2">Join our waitlist to be notified when API access launches: <a href="mailto:admin@hexific.com" className="text-lime-400 hover:underline">admin@hexific.com</a></p>
                  <p className="mt-2">Planned features:</p>
                  <ul className="mt-2 space-y-1 ml-4">
                    <li className="flex items-start">
                      <span className="text-lime-400 mr-2">•</span>
                      <span>GitHub Actions integration</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-lime-400 mr-2">•</span>
                      <span>Webhook notifications</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-lime-400 mr-2">•</span>
                      <span>Programmable API endpoints</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-lime-400 mr-2">•</span>
                      <span>Custom Slither configurations</span>
                    </li>
                  </ul>
                </>
              }
            />

            <FAQItem
              question="Do you support languages other than Solidity?"
              answer={
                <>
                  <p>Currently only <strong className="text-lime-400">Solidity</strong> is supported.</p>
                  <p className="mt-2"><strong className="text-white">Coming in 2026:</strong></p>
                  <ul className="mt-2 space-y-1 ml-4">
                    <li className="flex items-start">
                      <span className="text-lime-400 mr-2">•</span>
                      <span>Vyper support (Q1 2026)</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-lime-400 mr-2">•</span>
                      <span>Rust (for Solana contracts)</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-lime-400 mr-2">•</span>
                      <span>Cairo (for StarkNet)</span>
                    </li>
                  </ul>
                </>
              }
            />

            <FAQItem
              question="What file size limits do you have?"
              answer={
                <>
                  <p><strong className="text-lime-400">Maximum file size: 100MB</strong></p>
                  <p className="mt-2">Tips to reduce file size:</p>
                  <ul className="mt-2 space-y-1 ml-4">
                    <li className="flex items-start">
                      <span className="text-lime-400 mr-2">•</span>
                      <span>Remove node_modules from your ZIP</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-lime-400 mr-2">•</span>
                      <span>Exclude test files (if not needed for analysis)</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-lime-400 mr-2">•</span>
                      <span>Don&apos;t include build artifacts</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-lime-400 mr-2">•</span>
                      <span>Compress with maximum compression</span>
                    </li>
                  </ul>
                  <p className="mt-3">Need to audit a larger project? <a href="mailto:admin@hexific.com" className="text-lime-400 hover:underline">Contact us for manual audits</a>.</p>
                </>
              }
            />
          </div>
        </section>

        {/* AI Assistant Questions */}
        <section id="ai" className="glass-effect rounded-xl p-8 border border-lime-400/20 mb-8 scroll-mt-20">
          <h2 className="text-3xl font-bold text-lime-400 gradient-text mb-6 flex items-center">
            <span className="text-3xl mr-3">🤖</span>
            AI Assistant Questions
          </h2>

          <div className="space-y-0">
            <FAQItem
              id="ai-help"
              question="What can the AI help me with?"
              answer={
                <>
                  <p>The AI assistant can:</p>
                  <ul className="mt-2 space-y-1 ml-4">
                    <li className="flex items-start">
                      <span className="text-lime-400 mr-2">•</span>
                      <span><strong className="text-white">Explain findings</strong> in plain language</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-lime-400 mr-2">•</span>
                      <span><strong className="text-white">Suggest fixes</strong> with code examples</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-lime-400 mr-2">•</span>
                      <span><strong className="text-white">Assess risk levels</strong> for your specific use case</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-lime-400 mr-2">•</span>
                      <span><strong className="text-white">Prioritize issues</strong> based on severity</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-lime-400 mr-2">•</span>
                      <span><strong className="text-white">Compare alternatives</strong> for implementing fixes</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-lime-400 mr-2">•</span>
                      <span><strong className="text-white">Answer follow-up questions</strong> about your audit</span>
                    </li>
                  </ul>
                </>
              }
            />

            <FAQItem
              question="What questions should I avoid?"
              answer={
                <>
                  <p>The AI is trained on <strong className="text-lime-400">your audit results</strong>. It works best for specific questions about your findings.</p>
                  <p className="mt-2"><strong className="text-red-400">Avoid:</strong></p>
                  <ul className="mt-2 space-y-1 ml-4">
                    <li className="flex items-start">
                      <span className="text-red-400 mr-2">✗</span>
                      <span>Overly broad questions (&quot;What is Solidity?&quot;)</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-red-400 mr-2">✗</span>
                      <span>Asking it to write entire contracts from scratch</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-red-400 mr-2">✗</span>
                      <span>Generic programming questions unrelated to security</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-red-400 mr-2">✗</span>
                      <span>Questions about topics not in your audit</span>
                    </li>
                  </ul>
                  <p className="mt-2"><strong className="text-lime-400">Instead, ask:</strong></p>
                  <ul className="mt-2 space-y-1 ml-4">
                    <li className="flex items-start">
                      <span className="text-lime-400 mr-2">✓</span>
                      <span>&quot;Explain this specific finding in my audit&quot;</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-lime-400 mr-2">✓</span>
                      <span>&quot;How do I fix the reentrancy issue found?&quot;</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-lime-400 mr-2">✓</span>
                      <span>&quot;What&apos;s the priority order for these fixes?&quot;</span>
                    </li>
                  </ul>
                </>
              }
            />

            <FAQItem
              question="How does the AI work?"
              answer={
                <p>We use <strong className="text-lime-400">Llama 3.1 70B</strong> (via Groq) - an advanced language model fine-tuned for smart contract security. The AI analyzes your audit results and provides contextual explanations based on security best practices and common vulnerability patterns.</p>
              }
            />

            <FAQItem
              question="Can I have a conversation with the AI?"
              answer={
                <p>Yes! Each question builds on the previous context. You can ask follow-up questions within the same audit session. The AI remembers your previous questions to provide more relevant answers.</p>
              }
            />

            <FAQItem
              question="Is the AI always accurate?"
              answer={
                <>
                  <p>The AI provides helpful guidance but is <strong className="text-yellow-400">not infallible</strong>.</p>
                  <p className="mt-2"><strong className="text-white">Best practices:</strong></p>
                  <ul className="mt-2 space-y-1 ml-4">
                    <li className="flex items-start">
                      <span className="text-lime-400 mr-2">•</span>
                      <span>Verify AI suggestions in documentation</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-lime-400 mr-2">•</span>
                      <span>Test all fixes thoroughly</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-lime-400 mr-2">•</span>
                      <span>Use AI as a learning tool, not gospel</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-lime-400 mr-2">•</span>
                      <span>For critical systems, get manual audits</span>
                    </li>
                  </ul>
                </>
              }
            />
          </div>
        </section>

        {/* Payment Questions */}
        <section id="payment" className="glass-effect rounded-xl p-8 border border-lime-400/20 mb-8 scroll-mt-20">
          <h2 className="text-3xl font-bold text-lime-400 gradient-text mb-6 flex items-center">
            <span className="text-3xl mr-3">💳</span>
            Payment & Billing
          </h2>

          <div className="space-y-0">
            <FAQItem
              id="wallet-needed"
              question="Why do I need to connect a wallet?"
              answer={
                <>
                  <p>Wallet connection is <strong className="text-lime-400">only required for paid AI queries</strong> (after your 3 free questions).</p>
                  <p className="mt-2">Benefits of wallet-based payment:</p>
                  <ul className="mt-2 space-y-1 ml-4">
                    <li className="flex items-start">
                      <span className="text-lime-400 mr-2">•</span>
                      <span>No account creation needed</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-lime-400 mr-2">•</span>
                      <span>Fully anonymous (no personal info)</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-lime-400 mr-2">•</span>
                      <span>Instant verification</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-lime-400 mr-2">•</span>
                      <span>Web3-native experience</span>
                    </li>
                  </ul>
                </>
              }
            />

            <FAQItem
              question="Is this on mainnet or testnet?"
              answer={
                <>
                  <p><strong className="text-yellow-400"></strong>Live on Base Mainnet!</p>
                  <p className="mt-2"><strong className="text-lime-400"></strong>Payments are processed with real USDC on Base network.</p>
                    <p className="mt-2">You&apos;ll need USDC on Base to make paid queries after your 3 free questions.</p>
                </>
              }
            />

            <FAQItem
              question="Can I get a refund?"
              answer={
                <>
                  <p>Payments are <strong className="text-red-400">non-refundable</strong> as AI processing happens instantly and cannot be reversed.</p>
                  <p className="mt-2"><strong className="text-white">Tips:</strong></p>
                  <ul className="mt-2 space-y-1 ml-4">
                    <li className="flex items-start">
                      <span className="text-lime-400 mr-2">•</span>
                      <span>Use your 3 free questions first to test the service</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-lime-400 mr-2">•</span>
                      <span>Make sure your question is clear before submitting</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-lime-400 mr-2">•</span>
                      <span>Read our tips for asking better questions</span>
                    </li>
                  </ul>
                </>
              }
            />

            <FAQItem
              question="Will there be subscription plans?"
              answer={
                <>
                  <p>We&apos;re exploring subscription options for power users!</p>
                  <p className="mt-2"><strong className="text-white">Potential plans:</strong></p>
                  <ul className="mt-2 space-y-1 ml-4">
                    <li className="flex items-start">
                      <span className="text-lime-400 mr-2">•</span>
                      <span>Unlimited AI queries for $20/month</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-lime-400 mr-2">•</span>
                      <span>Team plans with shared credits</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-lime-400 mr-2">•</span>
                      <span>Enterprise plans with priority support</span>
                    </li>
                  </ul>
                  <p className="mt-3">Help us design pricing: <a href="mailto:admin@hexific.com" className="text-lime-400 hover:underline">admin@hexific.com</a></p>
                </>
              }
            />

            <FAQItem
              question="What payment methods do you accept?"
              answer={
                <>
                  <p><strong className="text-white">Current:</strong> Crypto payments via wallet connection (signature-based during beta)</p>
                  <p className="mt-2"><strong className="text-lime-400">Coming 2026:</strong></p>
                  <ul className="mt-2 space-y-1 ml-4">
                    <li className="flex items-start">
                      <span className="text-lime-400 mr-2">•</span>
                      <span>Credit card payments</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-lime-400 mr-2">•</span>
                      <span>Apple Pay / Google Pay</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-lime-400 mr-2">•</span>
                      <span>Bank transfers (for enterprise)</span>
                    </li>
                  </ul>
                </>
              }
            />
          </div>
        </section>

        {/* Still Have Questions CTA */}
        <div className="bg-gradient-to-r from-lime-400/20 to-lime-500/20 border border-lime-400/30 rounded-xl p-8 text-center">
          <h2 className="text-3xl font-bold text-white gradient-text mb-4">Still Have Questions?</h2>
          <p className="text-gray-300 mb-6">We&apos;re here to help!</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:admin@hexific.com"
              className="bg-lime-400 text-black px-6 py-3 rounded-lg font-semibold hover:bg-lime-300 transition-all inline-block pulse-glow"
            >
              📧 Email Support
            </a>
            <Link
              href="/docs"
              className="glass-effect border border-lime-400 text-lime-400 px-6 py-3 rounded-lg font-semibold hover:bg-lime-400 hover:text-black transition-all inline-block"
            >
              📚 Read Documentation
            </Link>
          </div>
        </div>
      </div>
    </DocsLayout>
  );
}