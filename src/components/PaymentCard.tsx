'use client';

import { useState } from 'react';
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

// Component yang HANYA render ketika wallet connected
function ConnectedPaymentCard({ account }: { account: UiWalletAccount }) {
  const { rpc, chain } = useSolana();
  const signer = useWalletAccountTransactionSendingSigner(account, chain);
  const [isPaying, setIsPaying] = useState(false);
  const [result, setResult] = useState<PaymentResult | null>(null);

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
    } catch (error: any) {
      console.error('Payment error:', error);
      setResult({
        success: false,
        error: error.message || 'Payment failed',
      });
    } finally {
      setIsPaying(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="p-4 rounded-xl bg-[rgba(214,237,23,0.05)] backdrop-blur-md border border-[rgba(214,237,23,0.2)]">
        <p className="text-sm text-gray-400 mb-2">
          Payment Amount: <span className="font-semibold text-lime-400">0.01 SOL</span>
        </p>
        <p className="text-xs text-gray-500 break-all">
          To: {PAYMENT_CONFIG.RECEIVER_ADDRESS}
        </p>
      </div>

      <Button
        onClick={sendPayment}
        disabled={isPaying || !signer}
        className="w-full bg-lime-400 hover:bg-lime-500 text-[#000E1B] font-semibold py-3 rounded-xl transition-all duration-300 hover:shadow-[0_0_20px_rgba(214,237,23,0.5)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
      >
        {isPaying ? 'Processing Payment...' : 'Send Payment'}
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
                href={`https://explorer.solana.com/tx/${result.signature}?cluster=devnet`}
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

// Main component - seperti MemoCard
export function PaymentCard() {
  const { selectedAccount, isConnected } = useSolana();

  return (
    <div className="space-y-4 p-6 rounded-2xl bg-[rgba(214,237,23,0.05)] backdrop-blur-xl border border-[rgba(214,237,23,0.2)] shadow-[0_0_30px_rgba(214,237,23,0.1)]">
      <h3 className="text-lg font-semibold text-white">
        Send <span className="text-lime-400">Payment</span>
      </h3>
      {isConnected && selectedAccount ? (
        <ConnectedPaymentCard account={selectedAccount} />
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