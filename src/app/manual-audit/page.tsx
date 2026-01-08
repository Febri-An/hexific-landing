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
      <div className="success-container">
        <div className="success-icon-wrapper">
          <svg className="success-checkmark" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="success-title">Request Submitted Successfully</h3>
        <p className="success-message">
          Thank you for your interest. Our security team will review your request and respond within 24-48 business hours.
        </p>
        <div className="success-next-steps">
          <p className="next-steps-label">What happens next:</p>
          <ul className="next-steps-list">
            <li>Our team reviews your project requirements</li>
            <li>We prepare a detailed quote and timeline</li>
            <li>You&apos;ll receive our proposal via email</li>
          </ul>
        </div>
        <Link href="/" className="back-home-button">
          Return to Homepage
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="audit-form">
      {/* Form Header */}
      <div className="form-header">
        <div className="form-step-indicator">
          <span className="step-number">1</span>
          <span className="step-text">Fill out the form below</span>
        </div>
      </div>

      {/* Contact Information Section */}
      <div className="form-section">
        <h3 className="section-title">
          <svg className="section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          Contact Information
        </h3>

        <div className="form-grid">
          <div className="form-field">
            <label className="field-label">
              Full Name
              <span className="required-asterisk">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="field-input"
              placeholder="Enter your full name"
            />
          </div>

          <div className="form-field">
            <label className="field-label">
              Email Address
              <span className="required-asterisk">*</span>
            </label>
            <input
              type="email"
              required
              pattern="[a-zA-Z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
              title="Please enter a valid email address"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="field-input"
              placeholder="you@company.com"
            />
          </div>
        </div>
      </div>

      {/* Project Information Section */}
      <div className="form-section">
        <h3 className="section-title">
          <svg className="section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          Project Details
        </h3>

        <div className="form-field">
          <label className="field-label">
            Project Name
            <span className="required-asterisk">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.project}
            onChange={(e) => setFormData({ ...formData, project: e.target.value })}
            className="field-input"
            placeholder="Your protocol or project name"
          />
        </div>

        <div className="form-grid">
          <div className="form-field">
            <label className="field-label">
              Expected TVL
              <span className="required-asterisk">*</span>
            </label>
            <div className="select-wrapper">
              <select
                required
                value={formData.tvl}
                onChange={(e) => setFormData({ ...formData, tvl: e.target.value })}
                className="field-select"
              >
                <option value="">Select range</option>
                <option value="<100k">Less than $100K</option>
                <option value="100k-1m">$100K - $1M</option>
                <option value="1m-10m">$1M - $10M</option>
                <option value="10m+">$10M+</option>
              </select>
              <svg className="select-arrow" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          </div>

          <div className="form-field">
            <label className="field-label">
              Timeline
              <span className="required-asterisk">*</span>
            </label>
            <div className="select-wrapper">
              <select
                required
                value={formData.timeline}
                onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
                className="field-select"
              >
                <option value="">Select timeline</option>
                <option value="fast">Fast Track (&lt;1 week)</option>
                <option value="standard">Standard (&lt;2 weeks)</option>
              </select>
              <svg className="select-arrow" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Description Section */}
      <div className="form-section">
        <h3 className="section-title">
          <svg className="section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Project Description
        </h3>

        <div className="form-field">
          <label className="field-label">
            Tell us about your project
            <span className="required-asterisk">*</span>
          </label>
          <textarea
            required
            minLength={100}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={5}
            className="field-textarea"
            placeholder="Please include:
• Protocol type (DeFi, NFT, DAO, etc.)
• Key features and functionality
• Approximate lines of code
• Any specific security concerns"
          />
          <div className="textarea-footer">
            <span className={`char-count ${formData.description.length >= 100 ? 'valid' : ''}`}>
              {formData.description.length}/100 characters minimum
              {formData.description.length >= 100 && (
                <svg className="check-icon" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="error-message">
          <svg className="error-icon" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="submit-btn"
      >
        {loading ? (
          <span className="loading-state">
            <svg className="spinner" viewBox="0 0 24 24">
              <circle className="spinner-track" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="spinner-head" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Processing...
          </span>
        ) : (
          <span className="button-content">
            Request Audit Quote
            <svg className="arrow-icon" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </span>
        )}
      </button>

      {/* Form Footer */}
      <p className="form-footer">
        <svg className="clock-icon" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
        </svg>
        We typically respond within 24-48 business hours
      </p>
    </form>
  );
}

// Manual Audit Page Component
export default function ManualAuditPage() {
  return (
    <div className="page-container">
      {/* Background Elements */}
      <div className="bg-gradient-top" />
      <div className="bg-gradient-bottom" />
      <div className="bg-grid" />

      {/* Navigation */}
      <nav className="page-nav">
        <Link href="/" className="nav-logo">
          <div className="logo-icon">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <span className="logo-text">Hexific</span>
        </Link>
        <Link href="/" className="nav-back">
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Home
        </Link>
      </nav>

      {/* Main Content */}
      <main className="page-main">
        {/* Header */}
        <div className="page-header">
          <div className="header-badge">
            <svg viewBox="0 0 20 20" fill="currentColor" className="badge-icon">
              <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Expert Security Review
          </div>
          <h1 className="page-title">
            Request a <span className="title-highlight">Full Audit</span>
          </h1>
          <p className="page-subtitle">
            Get comprehensive smart contract security analysis from our expert team. We&apos;ll provide a detailed quote within 48 hours.
          </p>
        </div>

        {/* Form Container */}
        <div className="form-wrapper">
          <ContactForm />
        </div>

        {/* Trust Indicators */}
        <div className="trust-section">
          <div className="trust-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="trust-icon">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span>Confidential & Secure</span>
          </div>
          <div className="trust-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="trust-icon">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>48h Response Time</span>
          </div>
          <div className="trust-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="trust-icon">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span>Expert Engineers</span>
          </div>
        </div>
      </main>

      {/* Footer CTA */}
      <footer className="page-footer">
        <p className="footer-text">
          Not ready for a full audit?{' '}
          <Link href="/" className="footer-link">
            Try our free AI-powered scan first →
          </Link>
        </p>
      </footer>
    </div>
  );
}