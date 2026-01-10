'use client';

import { useState, useEffect } from 'react';
import { useSolana } from '@/components/solana-provider';
import { useWalletAccountTransactionSendingSigner } from '@solana/react';
import { type UiWalletAccount } from '@wallet-standard/react';
import { Button } from '@/components/ui/button';
import {
  pipe,
  createTransactionMessage,
  appendTransactionMessageInstruction,
  setTransactionMessageFeePayerSigner,
  setTransactionMessageLifetimeUsingBlockhash,
  signAndSendTransactionMessageWithSigners,
  getBase58Decoder,
  address,
  lamports,
} from '@solana/kit';
import { getTransferSolInstruction } from '@solana-program/system';
import { PAYMENT_CONFIG, type PaymentResult } from '../hooks/payment-config';

interface ConnectedPaymentCardProps {
  account: UiWalletAccount;
  onPaymentSuccess: () => Promise<void>;
  isAuditing?: boolean;
  disabled?: boolean;
}

async function calculateTokenAmount() {
    const tokenMint = "3ghjaogpDVt7QZ6eNauoggmj4WYw23TkpyVN2yZjpump";
    const solMint = "So11111111111111111111111111111111111111112";
    
    // 1. Fetch SOL and HEXI prices from Jupiter API
    const response = await fetch(
      `https://api.jup.ag/price/v3?ids=${solMint},${tokenMint}`,
      {
      headers: {
        'x-api-key': process.env.NEXT_PUBLIC_JUPITER_API_KEY || '',
      },
      }
    );
    const result = await response.json();
    console.log('Jupiter Price Result:', result);

    const priceTokenUsd = result[tokenMint].usdPrice; // HEXI Token price
    const priceSolUsd = result[solMint].usdPrice;     // SOL price

    // 2. Determine target SOL to be paid
    const targetSol = PAYMENT_CONFIG.AMOUNT_LAMPORTS / 1_000_000_000; // Convert lamports to SOL

    // 3. Calculate the amount of tokens needed
    const totalUsdNeeded = targetSol * priceSolUsd;
    const amountTokenRequired = totalUsdNeeded / priceTokenUsd;

    // console.log(`Target: ${targetSol} SOL (~$${totalUsdNeeded.toFixed(4)})`);
    // console.log(`Token Price: $${priceTokenUsd}`);
    // console.log(`SOL Price: $${priceSolUsd}`);
    // console.log(`User should pay: ${amountTokenRequired.toFixed()} Token`);
    
    return amountTokenRequired;
}

// This component only be rendered when wallet is connected
function ConnectedPaymentCard({ account, onPaymentSuccess, isAuditing = false, disabled = false }: ConnectedPaymentCardProps) {
  const { rpc, chain } = useSolana();
  const signer = useWalletAccountTransactionSendingSigner(account, chain);
  const [isPaying, setIsPaying] = useState(false);
  const [result, setResult] = useState<PaymentResult | null>(null);

  // Clear result when form inputs change (file/address changes)
  useEffect(() => {
    setResult(null);
  }, [disabled]);

  const sendPayment = async () => {
    if (!signer) return;

    setIsPaying(true);
    setResult(null);

    try {
      const receiverAddress = address(PAYMENT_CONFIG.RECEIVER_ADDRESS);
      const transferAmount = lamports(BigInt(PAYMENT_CONFIG.AMOUNT_LAMPORTS));

      // Get latest blockhash
      const { value: latestBlockhash } = await rpc
        .getLatestBlockhash({ commitment: 'confirmed' })
        .send();

      // Create transfer instruction
      const transferInstruction = getTransferSolInstruction({
        source: signer,
        destination: receiverAddress,
        amount: transferAmount,
      });

      // Build transaction message
      const message = pipe(
        createTransactionMessage({ version: 0 }),
        (m) => setTransactionMessageFeePayerSigner(signer, m),
        (m) => setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, m),
        (m) => appendTransactionMessageInstruction(transferInstruction, m)
      );

      // Sign and send transaction
      const signatureBytes = await signAndSendTransactionMessageWithSigners(message);
      const signature = getBase58Decoder().decode(signatureBytes) as string;

      // Confirm by polling for signature status
      let confirmed = false;
      for (let i = 0; i < PAYMENT_CONFIG.CONFIRMATION_TIMEOUT_SECONDS; i++) {
        await new Promise((resolve) => setTimeout(resolve, PAYMENT_CONFIG.POLL_INTERVAL_MS));
        
        const statusResult = await rpc
          .getSignatureStatuses([signature as Parameters<typeof rpc.getSignatureStatuses>[0][0]])
          .send();

        const status = statusResult.value[0];
        if (status?.confirmationStatus === 'confirmed' || status?.confirmationStatus === 'finalized') {
          if (status.err) {
            throw new Error('Transaction failed on-chain');
          }
          confirmed = true;
          break;
        }
      }

      if (!confirmed) {
        throw new Error('Transaction confirmation timeout');
      }

      setResult({
        success: true,
        signature,
      });
      
      // Trigger audit after successful payment
      setIsPaying(false);
      await onPaymentSuccess();
      
    } catch (error: any) {
      console.error('Payment error:', error);
      setResult({
        success: false,
        error: error.message || 'Payment failed',
      });
      setIsPaying(false);
    }
  };

  return (
    <div className="space-y-4">
      <Button
        onClick={sendPayment}
        disabled={isPaying || isAuditing || !signer || disabled}
        className="w-full bg-lime-400 hover:bg-lime-500 text-[#000E1B] font-semibold py-3 rounded-xl transition-all duration-300 hover:shadow-[0_0_20px_rgba(214,237,23,0.5)] hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
      >
        {isPaying ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing Payment...
          </span>
        ) : isAuditing ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Analyzing...
          </span>
        ) : (
          'Pay 0.005 SOL mainnet & Start Audit'
        )}
      </Button>

      {result && (
        <div
          className={`p-4 rounded-xl backdrop-blur-md ${
            result.success
              ? 'bg-[rgba(214,237,23,0.1)] border border-[#D6ED17] shadow-[0_0_15px_rgba(214,237,23,0.3)]'
              : 'bg-[rgba(239,68,68,0.1)] border border-red-500/50'
          }`}
        >
          {result.success ? (
            <>
              <p className="text-sm font-semibold text-lime-400 mb-2">
                ✓ Payment Successful!
              </p>
              <a
                href={`https://explorer.solana.com/tx/${result.signature}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-lime-400/80 hover:text-lime-400 hover:underline break-all transition-colors"
              >
                View on Explorer →
              </a>
            </>
          ) : (
            <p className="text-sm text-red-400">
              ✗ Error: {result.error}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// Main component
export function PaymentCard({ onPaymentSuccess, isAuditing = false, disabled = false }: { onPaymentSuccess: () => Promise<void>; isAuditing?: boolean; disabled?: boolean }) {
  const { selectedAccount, isConnected } = useSolana();

  return (
    <div className="space-y-4 p-6 rounded-2xl bg-[rgba(214,237,23,0.05)] backdrop-blur-xl border border-[rgba(214,237,23,0.2)] shadow-[0_0_30px_rgba(214,237,23,0.1)]">
      <h3 className="text-lg font-semibold text-white">
        Send <span className="text-lime-400">Payment</span>
      </h3>
      {isConnected && selectedAccount ? (
        <ConnectedPaymentCard account={selectedAccount} onPaymentSuccess={onPaymentSuccess} isAuditing={isAuditing} disabled={disabled} />
      ) : (
        <div className="py-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[rgba(214,237,23,0.1)] flex items-center justify-center">
            <svg className="w-8 h-8 text-lime-400/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <p className="text-gray-400">
            Connect your wallet to send payment
          </p>
        </div>
      )}
    </div>
  );
}