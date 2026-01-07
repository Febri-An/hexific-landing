"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import './styles.css';

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/manual-audit-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit request');
      }

      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
      console.error('Error submitting form:', err);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="success-card">
        <div className="success-icon mb-4">✅</div>
        <h3 className="text-3xl font-bold text-white mb-3">Request Submitted!</h3>
        <p className="text-gray-300 text-lg mb-4">
          We&apos;ll get back to you within 24-48 hours with a quote and timeline.
        </p>
        <p className="text-sm text-gray-400">
          Check your email (including spam folder) for our response.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="form-label block text-sm font-medium mb-2">
            Your Name *
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="form-input w-full px-4 py-3 rounded-lg"
            placeholder="John Doe"
          />
        </div>

        <div>
          <label className="form-label block text-sm font-medium mb-2">
            Email Address *
          </label>
          <input
            type="email"
            required
            pattern="[a-zA-Z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
            title="Please enter a valid email address"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="form-input w-full px-4 py-3 rounded-lg"
            placeholder="john@example.com"
          />
        </div>
      </div>

      <div>
        <label className="form-label block text-sm font-medium mb-2">
          Project Name *
        </label>
        <input
          type="text"
          required
          value={formData.project}
          onChange={(e) => setFormData({ ...formData, project: e.target.value })}
          className="form-input w-full px-4 py-3 rounded-lg"
          placeholder="My DeFi Protocol"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="form-label block text-sm font-medium mb-2">
            Expected TVL *
          </label>
          <select
            required
            value={formData.tvl}
            onChange={(e) => setFormData({ ...formData, tvl: e.target.value })}
            className="form-input w-full px-4 py-3 rounded-lg"
          >
            <option value="">Select TVL range</option>
            <option value="<100k">Less than $100K</option>
            <option value="100k-1m">$100K - $1M</option>
            <option value="1m-10m">$1M - $10M</option>
            <option value="10m+">$10M+</option>
          </select>
        </div>

        <div>
          <label className="form-label block text-sm font-medium mb-2">
            Desired Timeline *
          </label>
          <select
            required
            value={formData.timeline}
            onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
            className="form-input w-full px-4 py-3 rounded-lg"
          >
            <option value="">Select timeline</option>
            {/* <option value="urgent">ASAP (1 week)</option> */}
            <option value="fast">Fast Track (less than 1 week)</option>
            <option value="standard">Standard (less than 2 week)</option>
            {/* <option value="flexible">Flexible</option> */}
          </select>
        </div>
      </div>

      <div>
        <label className="form-label block text-sm font-medium mb-2">
          Project Description * (minimum 100 characters)
        </label>
        <textarea
          required
          minLength={100}
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={6}
          className="form-input w-full px-4 py-3 rounded-lg resize-none"
          placeholder="Tell us about your project:&#10; like type of protocol (DeFi, NFT, DAO, etc.)&#10;, key features&#10;, lines of code (approximate)&#10;, or any specific concerns"
        />
        <p className={`char-counter mt-2 ${formData.description.length >= 100 ? 'complete' : 'text-gray-400'}`}>
          {formData.description.length}/100 characters {formData.description.length >= 100 && '✓'}
        </p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400 text-sm">
          <strong>Error:</strong> {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="submit-button w-full py-4 px-6 rounded-lg relative z-10 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Submitting...
          </span>
        ) : (
          'Request Manual Audit Quote →'
        )}
      </button>

      <p className="text-sm text-gray-400 text-center">
        * We&apos;ll respond within 24-48 hours with pricing and availability
      </p>
    </form>
  );
}

// Manual Audit Page Component
export default function ManualAuditPage() {
  return (
    <div className="manual-audit-container">
      {/* Floating Orbs */}
      <div className="floating-orb floating-orb-1"></div>
      <div className="floating-orb floating-orb-2"></div>

      {/* Request Quote Form */}
      <div id="request-quote" className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        <div className="text-center mb-12">
          <h2 className="gradient-title text-4xl font-bold mb-4">Request a Quote</h2>
          <p className="text-xl text-gray-300">Tell us about your project and we&apos;ll get back to you within 24-48 hours</p>
        </div>

        <div className="form-container">
          <ContactForm />
        </div>
      </div>

      {/* Final CTA */}
      <div className="cta-section max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h2 className="gradient-title text-4xl font-bold mb-4">Not Sure If You Need a Manual Audit?</h2>
        <p className="text-xl text-gray-300 mb-8">
          Start with our free automated audit, then chat with us about your specific needs
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="cta-button-primary px-8 py-4 rounded-lg inline-block"
          >
            Try Free Audit First
          </Link>
          <a
            href="mailto:admin@hexific.com"
            className="cta-button-secondary px-8 py-4 rounded-lg inline-block"
          >
            Email Us
          </a>
        </div>
      </div>
    </div>
  );
}