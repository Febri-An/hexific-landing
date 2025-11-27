"use client";

import React, { useState } from 'react';
import Link from 'next/link';

// Reuse DocsLayout
function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-2xl font-bold text-blue-600">
              Hexific
            </Link>
            <nav className="hidden md:flex space-x-8">
              <Link href="/docs" className="text-gray-700 hover:text-blue-600">
                Documentation
              </Link>
              <Link href="/faq" className="text-gray-700 hover:text-blue-600">
                FAQ
              </Link>
              <Link href="/manual-audit" className="text-gray-700 hover:text-blue-600">
                Manual Audits
              </Link>
              <Link href="/" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                Start Free Audit
              </Link>
            </nav>
          </div>
        </div>
      </header>
      <main>{children}</main>
      <footer className="bg-white border-t mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center text-gray-600">
            <p>© 2025 Hexific. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Contact Form Component
function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    project: '',
    tvl: '',
    timeline: '',
    description: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In production, send to your backend/email service
    console.log('Form submitted:', formData);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
        <div className="text-5xl mb-4">✅</div>
        <h3 className="text-2xl font-bold text-green-900 mb-2">Request Submitted!</h3>
        <p className="text-green-800 mb-4">
          We&apos;ll get back to you within 24-48 hours with a quote and timeline.
        </p>
        <p className="text-sm text-green-700">
          Check your email (including spam folder) for our response.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Name *
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="John Doe"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address *
          </label>
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="john@example.com"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Project Name *
        </label>
        <input
          type="text"
          required
          value={formData.project}
          onChange={(e) => setFormData({ ...formData, project: e.target.value })}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="My DeFi Protocol"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Expected TVL *
          </label>
          <select
            required
            value={formData.tvl}
            onChange={(e) => setFormData({ ...formData, tvl: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select TVL range</option>
            <option value="<100k">Less than $100K</option>
            <option value="100k-1m">$100K - $1M</option>
            <option value="1m-10m">$1M - $10M</option>
            <option value="10m+">$10M+</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Desired Timeline *
          </label>
          <select
            required
            value={formData.timeline}
            onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select timeline</option>
            <option value="urgent">ASAP (1 week)</option>
            <option value="fast">Fast Track (2 weeks)</option>
            <option value="standard">Standard (3-4 weeks)</option>
            <option value="flexible">Flexible</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Project Description *
        </label>
        <textarea
          required
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={6}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Tell us about your project:&#10;- Type of protocol (DeFi, NFT, DAO, etc.)&#10;- Key features&#10;- Lines of code (approximate)&#10;- Any specific concerns"
        />
      </div>

      <div
        onClick={handleSubmit}
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg cursor-pointer text-center"
      >
        Request Manual Audit Quote →
      </div>

      <p className="text-sm text-gray-500 text-center">
        * We&apos;ll respond within 24-48 hours with pricing and availability
      </p>
    </div>
  );
}

// Manual Audit Page Component
export default function ManualAuditPage() {
  return (
    <DocsLayout>
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold mb-6">Professional Manual Audits</h1>
          <p className="text-xl text-blue-100 mb-8">
            In-depth security reviews by expert auditors for production-ready protocols
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#request-quote"
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-block"
            >
              Request a Quote
            </a>
            <a
              href="#how-it-works"
              className="bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-800 transition-colors inline-block"
            >
              How It Works
            </a>
          </div>
        </div>
      </div>

      {/* When You Need Manual Audits */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">When to Get a Manual Audit</h2>
          <p className="text-xl text-gray-600">
            Automated tools are great for development, but these situations require human expertise
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition-shadow">
            <div className="text-4xl mb-4">💰</div>
            <h3 className="text-xl font-bold mb-3">High-Value Protocols</h3>
            <p className="text-gray-600">
              Your protocol will handle significant value (&gt;$1M TVL) and needs maximum security assurance.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition-shadow">
            <div className="text-4xl mb-4">🏗️</div>
            <h3 className="text-xl font-bold mb-3">Complex Logic</h3>
            <p className="text-gray-600">
              DeFi protocols with intricate mechanisms like AMMs, lending, derivatives, or cross-chain bridges.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition-shadow">
            <div className="text-4xl mb-4">🚀</div>
            <h3 className="text-xl font-bold mb-3">Mainnet Launch</h3>
            <p className="text-gray-600">
              Pre-mainnet deployment security review to catch edge cases automated tools miss.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition-shadow">
            <div className="text-4xl mb-4">📋</div>
            <h3 className="text-xl font-bold mb-3">Compliance Needs</h3>
            <p className="text-gray-600">
              Require detailed audit reports for investors, insurance, or regulatory compliance.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition-shadow">
            <div className="text-4xl mb-4">🛡️</div>
            <h3 className="text-xl font-bold mb-3">Multiple Perspectives</h3>
            <p className="text-gray-600">
              Critical systems benefit from multiple auditor reviews to catch blind spots.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition-shadow">
            <div className="text-4xl mb-4">🔄</div>
            <h3 className="text-xl font-bold mb-3">Major Updates</h3>
            <p className="text-gray-600">
              Significant protocol upgrades or new feature launches that change core logic.
            </p>
          </div>
        </div>
      </div>

      {/* What's Included */}
      <div className="bg-gray-100 py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">What&apos;s Included</h2>
            <p className="text-xl text-gray-600">Comprehensive security analysis by expert auditors</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-sm">
              <div className="flex items-start mb-4">
                <div className="text-3xl mr-4">🔍</div>
                <div>
                  <h3 className="text-xl font-bold mb-2">In-Depth Code Review</h3>
                  <p className="text-gray-600">
                    Line-by-line manual analysis by security experts. We review architecture, logic flows, edge cases, and potential attack vectors.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm">
              <div className="flex items-start mb-4">
                <div className="text-3xl mr-4">🎯</div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Custom Exploit Testing</h3>
                  <p className="text-gray-600">
                    We develop specific attack scenarios for your protocol, including reentrancy, flash loan attacks, and business logic exploits.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm">
              <div className="flex items-start mb-4">
                <div className="text-3xl mr-4">⚡</div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Gas Optimization</h3>
                  <p className="text-gray-600">
                    Professional recommendations to reduce deployment and transaction costs without compromising security.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm">
              <div className="flex items-start mb-4">
                <div className="text-3xl mr-4">📄</div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Detailed Report</h3>
                  <p className="text-gray-600">
                    Comprehensive written findings with severity ratings, proof-of-concept exploits, and specific recommendations.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm">
              <div className="flex items-start mb-4">
                <div className="text-3xl mr-4">🤝</div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Remediation Support</h3>
                  <p className="text-gray-600">
                    Direct communication with auditors to help implement fixes and answer questions during remediation.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm">
              <div className="flex items-start mb-4">
                <div className="text-3xl mr-4">✅</div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Follow-Up Review</h3>
                  <p className="text-gray-600">
                    Re-audit of fixed issues to verify proper implementation. Final report confirming all issues resolved.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div id="how-it-works" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">How It Works</h2>
          <p className="text-xl text-gray-600">Simple, transparent audit process</p>
        </div>

        <div className="space-y-8">
          <div className="flex items-start">
            <div className="flex-shrink-0 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xl mr-6">
              1
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-2">Request a Quote</h3>
              <p className="text-gray-600">
                Fill out the form below with your project details. We&apos;ll respond within 24-48 hours with a quote and timeline.
              </p>
            </div>
          </div>

          <div className="flex items-start">
            <div className="flex-shrink-0 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xl mr-6">
              2
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-2">Kickoff Call</h3>
              <p className="text-gray-600">
                Schedule a call with our auditors to discuss your protocol, review architecture, and define scope and priorities.
              </p>
            </div>
          </div>

          <div className="flex items-start">
            <div className="flex-shrink-0 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xl mr-6">
              3
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-2">Audit Phase (1-3 weeks)</h3>
              <p className="text-gray-600">
                Our team performs comprehensive analysis. We&apos;ll provide daily updates and preliminary findings as we work.
              </p>
            </div>
          </div>

          <div className="flex items-start">
            <div className="flex-shrink-0 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xl mr-6">
              4
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-2">Report Delivery</h3>
              <p className="text-gray-600">
                Receive detailed audit report with all findings, severity ratings, and recommendations. Includes executive summary for stakeholders.
              </p>
            </div>
          </div>

          <div className="flex items-start">
            <div className="flex-shrink-0 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xl mr-6">
              5
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-2">Remediation Support</h3>
              <p className="text-gray-600">
                Work with auditors to implement fixes. Ask questions, review code changes, and get guidance on best approaches.
              </p>
            </div>
          </div>

          <div className="flex items-start">
            <div className="flex-shrink-0 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xl mr-6">
              6
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-2">Follow-Up Review</h3>
              <p className="text-gray-600">
                Re-audit of fixed code to verify proper implementation. Final report confirms all critical issues resolved.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="bg-gray-100 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Transparent Pricing</h2>
            <p className="text-xl text-gray-600">Based on complexity, not hours</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8">
            <h3 className="text-2xl font-bold mb-6">Pricing Factors</h3>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="text-xl mr-3">📏</div>
                <div>
                  <h4 className="font-semibold mb-1">Code Complexity</h4>
                  <p className="text-gray-600 text-sm">Lines of code, number of contracts, and architectural complexity</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="text-xl mr-3">🎯</div>
                <div>
                  <h4 className="font-semibold mb-1">Risk Level</h4>
                  <p className="text-gray-600 text-sm">Expected TVL and potential impact of vulnerabilities</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="text-xl mr-3">⏱️</div>
                <div>
                  <h4 className="font-semibold mb-1">Timeline</h4>
                  <p className="text-gray-600 text-sm">Rush audits (&lt;1 week) incur premium pricing</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="text-xl mr-3">🔄</div>
                <div>
                  <h4 className="font-semibold mb-1">Scope</h4>
                  <p className="text-gray-600 text-sm">Full audit vs. specific components, follow-up reviews</p>
                </div>
              </div>
            </div>

            <div className="mt-8 p-6 bg-blue-50 rounded-lg">
              <h4 className="font-bold text-lg mb-2">Typical Ranges</h4>
              <ul className="space-y-2 text-gray-700">
                <li>• <strong>Small projects</strong> (500-1000 LOC): $5K - $10K</li>
                <li>• <strong>Medium protocols</strong> (1000-3000 LOC): $10K - $25K</li>
                <li>• <strong>Large protocols</strong> (3000+ LOC): $25K - $50K+</li>
                <li>• <strong>Rush audits</strong>: +50% premium</li>
                <li>• <strong>Follow-up reviews</strong>: 30% of original audit cost</li>
              </ul>
            </div>

            <p className="mt-6 text-sm text-gray-600 text-center">
              * Final pricing based on specific project requirements. Get a custom quote below.
            </p>
          </div>
        </div>
      </div>

      {/* Request Quote Form */}
      <div id="request-quote" className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Request a Quote</h2>
          <p className="text-xl text-gray-600">Tell us about your project and we&apos;ll get back to you within 24-48 hours</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <ContactForm />
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-gray-100 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Common Questions</h2>

          <div className="bg-white rounded-xl shadow-sm p-8 space-y-6">
            <div>
              <h3 className="font-bold text-lg mb-2">How long does an audit take?</h3>
              <p className="text-gray-600">
                Standard audits take 1-3 weeks depending on complexity. Rush audits (1 week or less) are available at a premium. We&apos;ll give you a specific timeline in our quote.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-2">Do you offer discounts?</h3>
              <p className="text-gray-600">
                Yes! We offer discounts for: projects that have completed our free automated audit first, returning customers, multiple audit packages, and open-source projects.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-2">What if you find critical issues?</h3>
              <p className="text-gray-600">
                We&apos;ll immediately notify you of any critical findings during the audit. You can pause the audit to fix issues, or wait for the full report. Either way, we&apos;re here to help you remediate.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-2">Can I hire you for ongoing security consulting?</h3>
              <p className="text-gray-600">
                Absolutely! We offer retainer agreements for ongoing security reviews, architecture consulting, and pre-deployment checks. Contact us to discuss your needs.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-2">Do you provide an audit badge?</h3>
              <p className="text-gray-600">
                Yes! Upon successful completion, you&apos;ll receive an official Hexific audit badge for your website and documentation, plus permission to reference the audit report.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h2 className="text-3xl font-bold mb-4">Not Sure If You Need a Manual Audit?</h2>
        <p className="text-xl text-gray-600 mb-8">
          Start with our free automated audit, then chat with us about your specific needs
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors inline-block"
          >
            Try Free Audit First
          </Link>
          <a
            href="mailto:security@hexific.com"
            className="bg-gray-200 text-gray-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors inline-block"
          >
            Email Us
          </a>
        </div>
      </div>
    </DocsLayout>
  );
}