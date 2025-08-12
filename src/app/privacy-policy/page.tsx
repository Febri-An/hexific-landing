"use client";

import React from "react";
import Head from "next/head";
import Link from 'next/link';
import "./styles.css";

const PrivacyPolicy: React.FC = () => {
  return (
    <>
      <Head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>HEXIFIC - Privacy Policy</title>
      </Head>

      {/* Background Animation */}
      <div className="bg-animation">
        <div className="floating-orb" />
        <div className="floating-orb" />
        <div className="floating-orb" />
        <div className="floating-orb" />
      </div>

      {/* Header */}
      <header>
        <div className="header-content">
          <div className="logo"><Link href="/">HEXIFIC</Link></div>
          <div className="status-badge">Privacy Protected</div>
        </div>
      </header>

      {/* Main Container */}
      <div className="container">
        {/* Hero Section */}
        <div className="hero">
          <h1>Privacy Policy</h1>
          <div className="effective-date">Effective Date: August 9, 2025</div>
        </div>

        {/* Introduction */}
        <div className="content-card">
          <p className="intro-text">
            Hexific (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your
            privacy. This Privacy Policy explains how we collect, use, disclose,
            and safeguard your information when you visit our website,
            hexific.com, and use our services, including AI-assisted smart
            contract auditing.
          </p>
          <p className="intro-text">
            By using our site and services, you agree to the terms described in
            this policy.
          </p>
        </div>

        {/* Section 1 */}
        <div className="content-card">
          <h2>1. Information We Collect</h2>
          <h3>1.1 Personal Information You Provide</h3>
          <p>We may collect personal information you voluntarily provide when you:</p>
          <ul>
            <li>Submit a smart contract for auditing</li>
            <li>Create an account or request a service</li>
            <li>Request notifications or updates related to your audit status</li>
            <li>Contact us via any form on the website</li>
          </ul>
          <p>This may include:</p>
          <ul>
            <li>Your name</li>
            <li>Email address</li>
            <li>Wallet address (if applicable)</li>
            <li>Any smart contract code or related documentation you upload</li>
          </ul>
          <h3>1.2 Information Collected Automatically</h3>
          <p>When you visit our site, we may collect:</p>
          <ul>
            <li>IP address</li>
            <li>Browser type and version</li>
            <li>Operating system</li>
            <li>Access times and pages visited</li>
            <li>Referring website or URL</li>
            <li>Usage data for AI model improvement (with anonymization)</li>
          </ul>
          <h3>1.3 Cookies and Tracking</h3>
          <p>We use cookies and similar tracking technologies to:</p>
          <ul>
            <li>Improve site performance</li>
            <li>Analyze traffic via tools like Google Analytics</li>
            <li>Remember your preferences</li>
          </ul>
          <p>
            You can disable cookies via your browser settings, but some features
            may not work properly.
          </p>
        </div>

        {/* Section 2 */}
        <div className="content-card">
          <h2>2. How We Use Your Information</h2>
          <ul>
            <li>Provide and maintain our services</li>
            <li>Notify you about the status of your audit requests</li>
            <li>Improve our website and AI audit tools</li>
            <li>Respond to inquiries and support requests</li>
            <li>Detect and prevent fraud or abuse</li>
          </ul>
        </div>

        {/* Section 3 */}
        <div className="content-card">
          <h2>3. Disclosure of Your Information</h2>
          <p>We do not sell, trade, or rent your personal information to third parties.</p>
          <p>We may share your information only:</p>
          <ul>
            <li>To comply with legal obligations</li>
            <li>With trusted service providers (hosting, analytics, email services)</li>
            <li>In connection with a business transfer (merger, acquisition)</li>
          </ul>
        </div>

        {/* Section 4 */}
        <div className="content-card">
          <h2>4. Data Retention</h2>
          <p>We retain personal information only as long as necessary to:</p>
          <ul>
            <li>Deliver our services</li>
            <li>Meet legal and compliance obligations</li>
          </ul>
          <p>Smart contract data submitted for auditing may be deleted upon request.</p>
        </div>

        {/* Section 5 */}
        <div className="content-card">
          <h2>5. Your Rights</h2>
          <p>Depending on your location, you may have the right to:</p>
          <ul>
            <li>Access personal data we hold about you</li>
            <li>Request correction or deletion</li>
            <li>Object to certain processing</li>
            <li>Withdraw consent at any time</li>
          </ul>
        </div>

        {/* Contact Section */}
        <div className="contact-section">
          <h2>Contact Us</h2>
          <p>To exercise these rights or for any privacy-related questions:</p>
          <a href="mailto:admin@hexific.com" className="contact-email">
            admin@hexific.com
          </a>
        </div>
      </div>
    </>
  );
};

export default PrivacyPolicy;
