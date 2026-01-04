export interface PaymentResult {
  success: boolean;
  signature?: string;
  error?: string;
}

export const PAYMENT_CONFIG = {
  RECEIVER_ADDRESS: '9UpVXGUJo2Hbgt2uw7UhUyNgusuYVdoHYnstV8J7wGt3',
  AMOUNT_LAMPORTS: 10_000_000,
  CONFIRMATION_TIMEOUT_SECONDS: 30,
  POLL_INTERVAL_MS: 1000,
} as const;