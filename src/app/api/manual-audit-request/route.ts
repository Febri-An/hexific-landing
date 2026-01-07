import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.NEXT_PUBLIC_RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, project, tvl, timeline, description } = body;

    // Validate required fields
    if (!name || !email || !project || !tvl || !timeline || !description) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    // Validate description length
    if (description.length < 100) {
      return NextResponse.json(
        { error: 'Description must be at least 100 characters' },
        { status: 400 }
      );
    }

    // Send email to admin
    const adminEmailResult = await resend.emails.send({
      from: 'Hexific Manual Audit <noreply@hexific.com>',
      to: ['admin@hexific.com'],
      subject: `New Manual Audit Request - ${project}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body {
                font-family: 'Inter', Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
              }
              .header {
                background: linear-gradient(135deg, #D6ED17, #A8C012);
                color: #000;
                padding: 30px;
                text-align: center;
                border-radius: 10px 10px 0 0;
              }
              .header h1 {
                margin: 0;
                font-size: 24px;
              }
              .content {
                background: #f9f9f9;
                padding: 30px;
                border-radius: 0 0 10px 10px;
              }
              .field {
                margin-bottom: 20px;
                padding: 15px;
                background: white;
                border-left: 4px solid #D6ED17;
                border-radius: 4px;
              }
              .field-label {
                font-weight: 600;
                color: #000E1B;
                margin-bottom: 5px;
                text-transform: uppercase;
                font-size: 12px;
                letter-spacing: 0.5px;
              }
              .field-value {
                color: #333;
                font-size: 15px;
              }
              .description {
                white-space: pre-wrap;
                word-wrap: break-word;
              }
              .footer {
                margin-top: 30px;
                padding-top: 20px;
                border-top: 2px solid #D6ED17;
                text-align: center;
                color: #666;
                font-size: 12px;
              }
              .priority-badge {
                display: inline-block;
                padding: 5px 15px;
                background: #D6ED17;
                color: #000;
                border-radius: 20px;
                font-weight: 600;
                font-size: 12px;
                margin-top: 10px;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>🔒 New Manual Audit Request</h1>
            </div>
            <div class="content">
              <div class="field">
                <div class="field-label">Client Name</div>
                <div class="field-value">${name}</div>
              </div>
              
              <div class="field">
                <div class="field-label">Email Address</div>
                <div class="field-value">
                  <a href="mailto:${email}" style="color: #D6ED17; text-decoration: none;">
                    ${email}
                  </a>
                </div>
              </div>
              
              <div class="field">
                <div class="field-label">Project Name</div>
                <div class="field-value"><strong>${project}</strong></div>
              </div>
              
              <div class="field">
                <div class="field-label">Expected TVL</div>
                <div class="field-value">${tvl}</div>
              </div>
              
              <div class="field">
                <div class="field-label">Timeline</div>
                <div class="field-value">
                  ${timeline}
                  ${timeline === 'fast' ? '<span class="priority-badge">URGENT</span>' : ''}
                </div>
              </div>
              
              <div class="field">
                <div class="field-label">Project Description</div>
                <div class="field-value description">${description}</div>
              </div>
              
              <div class="footer">
                <p><strong>Action Required:</strong> Please respond within 24-48 hours</p>
                <p>Submitted: ${new Date().toLocaleString('en-US', { 
                  dateStyle: 'full', 
                  timeStyle: 'short',
                  timeZone: 'UTC'
                })} UTC</p>
              </div>
            </div>
          </body>
        </html>
      `,
      text: `
NEW MANUAL AUDIT REQUEST
========================

Client Information:
-------------------
Name: ${name}
Email: ${email}

Project Details:
----------------
Project Name: ${project}
Expected TVL: ${tvl}
Timeline: ${timeline}

Project Description:
--------------------
${description}

---
Action Required: Please respond within 24-48 hours
Submitted: ${new Date().toLocaleString('en-US', { 
  dateStyle: 'full', 
  timeStyle: 'short',
  timeZone: 'UTC'
})} UTC
      `,
    });

    // Send confirmation email to client
    const clientEmailResult = await resend.emails.send({
      from: 'Hexific Team <noreply@hexific.com>',
      to: [email],
      subject: 'Manual Audit Request Received - Hexific',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body {
                font-family: 'Inter', Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
              }
              .header {
                background: linear-gradient(135deg, #000E1B, #001a33);
                color: #D6ED17;
                padding: 40px;
                text-align: center;
                border-radius: 10px 10px 0 0;
              }
              .header h1 {
                margin: 0;
                font-size: 28px;
                color: #D6ED17;
              }
              .content {
                background: #f9f9f9;
                padding: 30px;
                border-radius: 0 0 10px 10px;
              }
              .success-icon {
                font-size: 48px;
                text-align: center;
                margin: 20px 0;
              }
              .message {
                background: white;
                padding: 20px;
                border-radius: 8px;
                margin: 20px 0;
              }
              .summary {
                background: #fff;
                padding: 20px;
                border-left: 4px solid #D6ED17;
                border-radius: 4px;
                margin: 20px 0;
              }
              .summary-title {
                font-weight: 600;
                color: #000E1B;
                margin-bottom: 15px;
                font-size: 16px;
              }
              .summary-item {
                padding: 8px 0;
                border-bottom: 1px solid #eee;
              }
              .summary-item:last-child {
                border-bottom: none;
              }
              .summary-label {
                font-weight: 600;
                color: #666;
                font-size: 13px;
              }
              .summary-value {
                color: #333;
                margin-top: 3px;
              }
              .next-steps {
                background: #fff;
                padding: 20px;
                border-radius: 8px;
                margin: 20px 0;
              }
              .next-steps h3 {
                color: #000E1B;
                margin-top: 0;
              }
              .next-steps ul {
                padding-left: 20px;
              }
              .next-steps li {
                margin: 10px 0;
              }
              .footer {
                margin-top: 30px;
                padding-top: 20px;
                border-top: 2px solid #D6ED17;
                text-align: center;
                color: #666;
                font-size: 13px;
              }
              .cta-button {
                display: inline-block;
                background: #D6ED17;
                color: #000E1B;
                padding: 12px 30px;
                text-decoration: none;
                border-radius: 6px;
                font-weight: 600;
                margin: 20px 0;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>✅ Request Received!</h1>
            </div>
            <div class="content">
              <div class="success-icon">🔒</div>
              
              <div class="message">
                <p><strong>Hi ${name},</strong></p>
                <p>Thank you for your manual audit request! We've received your submission and our team will review it shortly.</p>
              </div>
              
              <div class="summary">
                <div class="summary-title">📋 Your Request Summary</div>
                <div class="summary-item">
                  <div class="summary-label">Project Name</div>
                  <div class="summary-value">${project}</div>
                </div>
                <div class="summary-item">
                  <div class="summary-label">Expected TVL</div>
                  <div class="summary-value">${tvl}</div>
                </div>
                <div class="summary-item">
                  <div class="summary-label">Timeline</div>
                  <div class="summary-value">${timeline === 'fast' ? 'Fast Track (less than 1 week)' : 'Standard (less than 2 weeks)'}</div>
                </div>
              </div>
              
              <div class="next-steps">
                <h3>What Happens Next?</h3>
                <ul>
                  <li><strong>Review:</strong> Our team will review your project details</li>
                  <li><strong>Quote:</strong> You'll receive a detailed quote within 24-48 hours</li>
                  <li><strong>Schedule:</strong> Once approved, we'll schedule your audit</li>
                  <li><strong>Audit:</strong> Our experts will conduct a comprehensive security analysis</li>
                </ul>
              </div>
              
              <div style="text-align: center;">
                <a href="https://hexific.com" class="cta-button">Visit Hexific</a>
              </div>
              
              <div class="footer">
                <p><strong>Questions?</strong> Reply to this email or contact us at admin@hexific.com</p>
                <p>Hexific - Smart Contract Security Experts</p>
              </div>
            </div>
          </body>
        </html>
      `,
      text: `
✅ REQUEST RECEIVED!

Hi ${name},

Thank you for your manual audit request! We've received your submission and our team will review it shortly.

YOUR REQUEST SUMMARY
====================
Project Name: ${project}
Expected TVL: ${tvl}
Timeline: ${timeline === 'fast' ? 'Fast Track (less than 1 week)' : 'Standard (less than 2 weeks)'}

WHAT HAPPENS NEXT?
==================
1. Review: Our team will review your project details
2. Quote: You'll receive a detailed quote within 24-48 hours
3. Schedule: Once approved, we'll schedule your audit
4. Audit: Our experts will conduct a comprehensive security analysis

Questions? Reply to this email or contact us at admin@hexific.com

Hexific - Smart Contract Security Experts
https://hexific.com
      `,
    });

    console.log('Admin email sent:', adminEmailResult);
    console.log('Client email sent:', clientEmailResult);

    return NextResponse.json(
      { 
        success: true, 
        message: 'Audit request submitted successfully',
        id: adminEmailResult.data?.id 
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { 
        error: 'Failed to submit request. Please try again or email us directly at admin@hexific.com',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
