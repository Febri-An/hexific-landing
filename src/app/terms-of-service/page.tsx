"use client";

import React from "react";
import Head from "next/head";
import Link from 'next/link';
import "./styles.css";

const TermsOfService: React.FC = () => {
  return (
    <>
      <Head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>HEXIFIC - Terms of Service</title>
      </Head>

      {/* Background Animation */}
      <div className="bg-animation">
        <div className="floating-orb" />
        <div className="floating-orb" />
        <div className="floating-orb" />
        <div className="floating-orb" />
        <div className="floating-orb" />
        <div className="floating-orb" />
      </div>

      {/* Header */}
      <header>
        <div className="header-content">
          <div className="logo"><Link href="/">HEXIFIC</Link></div>
          <div className="status-badge">Legal Framework</div>
        </div>
      </header>

      {/* Main Container */}
      <div className="container">
        {/* Hero Section */}
        <div className="hero">
          <h1>Terms of Service</h1>
          <div className="effective-date">Effective Date: August 9, 2025</div>
        </div>

        {/* Introduction */}
        <div className="content-card">
          <p className="intro-text">
            By accessing or using the services provided at hexific.com, you
            agree to be bound by these Terms of Service. These terms establish a
            clear framework for our professional relationship and ensure the
            highest quality of smart contract auditing services.
          </p>
        </div>

        {/* Section 1 */}
        <div className="content-card important-card">
          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing or using the services provided at hexific.com (&quot;Site&quot;)
            you agree to be bound by these Terms of Service (&quot;Terms&quot;). If you do
            not agree, you may not use our services.
          </p>
        </div>

        {/* Section 2 */}
        <div className="content-card">
          <h2>2. Services Provided</h2>
          <p>
            Hexific (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) provides smart contract auditing
            services, including automated analysis (AI-assisted) and manual
            reviews, as described on our Site or in an individual engagement
            agreement.
          </p>
        </div>

        {/* Section 3 */}
        <div className="content-card warning-card">
          <h2>3. No Guarantee of Complete Security</h2>
          <p>
            Audits are intended to identify potential vulnerabilities and
            improve security posture.{" "}
            <span className="strong-text">
              We do not guarantee that your smart contract or system will be
              free from vulnerabilities or that it will not be exploited in the
              future.
            </span>
          </p>
          <p>
            Smart contract security is an evolving field, and new attack vectors
            may emerge after an audit is completed.
          </p>
        </div>

        {/* Section 4 */}
        <div className="content-card">
          <h2>4. Client Responsibilities</h2>
          <p>You agree to:</p>
          <ul>
            <li>Provide accurate, complete source code and documentation</li>
            <li>Ensure you have legal rights to share the code for auditing</li>
            <li>Respond promptly to our inquiries during the audit process</li>
            <li>Implement recommended security measures in a timely manner</li>
          </ul>
        </div>

        {/* Section 5 */}
        <div className="content-card important-card">
          <h2>5. Intellectual Property</h2>
          <ul>
            <li>
              <span className="strong-text">You retain ownership</span> of all
              code you submit
            </li>
            <li>
              <span className="strong-text">We retain ownership</span> of our
              reports, tools, and methodologies
            </li>
            <li>
              <span className="strong-text">You are granted</span> a
              non-exclusive, non-transferable license to use the final audit
              report for your internal and promotional purposes
            </li>
          </ul>
        </div>

        {/* Section 6 */}
        <div className="content-card">
          <h2>6. Confidentiality</h2>
          <p>
            We will treat your code and related information as{" "}
            <span className="strong-text">strictly confidential</span> and will
            not disclose it to third parties without your consent, except as
            required by law or as needed to deliver the services.
          </p>
          <p>
            All our team members are bound by comprehensive non-disclosure
            agreements.
          </p>
        </div>

        {/* Section 7 */}
        <div className="content-card">
          <h2>7. Payment &amp; Fees</h2>
          <p>
            Fees, payment terms, and delivery timelines will be specified in a
            separate engagement agreement or invoice. Work may be suspended for
            late or failed payments.
          </p>
          <p>
            Refunds are handled on a case-by-case basis for work not yet
            commenced.
          </p>
        </div>

        {/* Section 8 */}
        <div className="content-card warning-card">
          <h2>8. Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by law, our total liability for any
            claim arising out of or related to our services is{" "}
            <span className="strong-text">
              limited to the total amount you paid for those services
            </span>
            .
          </p>
          <p>
            We are not liable for indirect, incidental, consequential damages,
            or loss of profits.
          </p>
        </div>

        {/* Section 9 */}
        <div className="content-card">
          <h2>9. Indemnification</h2>
          <p>
            You agree to indemnify and hold harmless Hexific, its employees, and
            contractors from any claims, damages, or expenses arising from your
            use of our services, your code, or your deployment of the audited
            code.
          </p>
        </div>

        {/* Section 10 */}
        <div className="content-card">
          <h2>10. Termination</h2>
          <p>
            We may suspend or terminate services if you breach these Terms. You
            may terminate by providing written notice; fees for work already
            performed remain payable.
          </p>
        </div>

        {/* Section 11 */}
        <div className="content-card">
          <h2>11. Governing Law &amp; Dispute Resolution</h2>
          <p>
            These Terms are governed by the laws of{" "}
            <span className="strong-text">[Your Jurisdiction]</span>. Any
            disputes will be resolved through good-faith negotiations, and if
            unresolved, through binding arbitration or courts in{" "}
            <span className="strong-text">[Your Location]</span>.
          </p>
        </div>

        {/* Section 12 */}
        <div className="content-card">
          <h2>12. Changes to Terms</h2>
          <p>
            We may update these Terms from time to time. Updated Terms will be
            posted on our Site with a new effective date. Continued use of our
            services constitutes acceptance of the updated terms.
          </p>
        </div>

        {/* Contact Section */}
        <div className="contact-section">
          <h2>Questions? Get in Touch</h2>
          <p>
            For any questions about these Terms of Service or our auditing
            process:
          </p>
          <a href="mailto:admin@hexific.com" className="contact-email">
            admin@hexific.com
          </a>
        </div>
      </div>
    </>
  );
};

export default TermsOfService;
