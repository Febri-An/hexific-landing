import { NextRequest, NextResponse } from 'next/server';

const PAYMENT_PRICE = 0.1; // $0.1 in USDC
const PAYMENT_ADDRESS = '0xC95b563aC3Aa6B795EAfEf143778ea582962753E';
const PAYMENT_NETWORK = 'base-sepolia';

// Simple in-memory storage for payment verification
// In production, use Redis or database
const verifiedPayments = new Map<string, { timestamp: number; used: boolean }>();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { payment_signature, signer_address, ...aiRequestData } = body;

    // Verify payment signature
    if (!payment_signature || !signer_address) {
      return NextResponse.json(
        { success: false, error: 'Payment verification required' },
        { status: 402 }
      );
    }

    // Check if payment was already used
    const paymentKey = `${signer_address}-${payment_signature}`;
    const existingPayment = verifiedPayments.get(paymentKey);

    if (existingPayment?.used) {
      return NextResponse.json(
        { success: false, error: 'Payment already used' },
        { status: 402 }
      );
    }

    // Mark payment as used
    verifiedPayments.set(paymentKey, {
      timestamp: Date.now(),
      used: true,
    });

    // Clean up old payments (older than 1 hour)
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    for (const [key, value] of verifiedPayments.entries()) {
      if (value.timestamp < oneHourAgo) {
        verifiedPayments.delete(key);
      }
    }

    // Forward to VPS
    const response = await fetch('https://api.hexific.com/ai-assist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...aiRequestData,
        is_paid: true,
      }),
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Paid AI assist error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process paid request' },
      { status: 500 }
    );
  }
}

// Payment configuration endpoint
export async function GET() {
  return NextResponse.json({
    price: PAYMENT_PRICE,
    address: PAYMENT_ADDRESS,
    network: PAYMENT_NETWORK,
  });
}