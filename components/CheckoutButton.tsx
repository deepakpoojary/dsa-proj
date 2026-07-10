'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
import confetti from 'canvas-confetti';

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open: () => void };
  }
}

export default function CheckoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleCheckout() {
    setLoading(true);
    setError('');

    try {
      const orderRes = await fetch('/api/checkout', { method: 'POST' });
      if (!orderRes.ok) throw new Error('Could not start checkout');
      const order = await orderRes.json();

      const razorpay = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        order_id: order.orderId,
        name: 'DSA Answers',
        description: 'Unlock all problem topics',
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          const verifyRes = await fetch('/api/checkout/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(response),
          });
          if (verifyRes.ok) {
            confetti({
              particleCount: 150,
              spread: 80,
              startVelocity: 45,
              origin: { y: 0.6 },
              colors: ['#238636', '#3fb950', '#58a6ff', '#e6edf3'],
            });
            router.push('/');
            router.refresh();
          } else {
            setError('Payment verification failed. Contact support if you were charged.');
          }
        },
        modal: { ondismiss: () => setLoading(false) },
        theme: { color: '#238636' },
      });

      razorpay.open();
    } catch {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  }

  return (
    <div id="checkout">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <button
        onClick={handleCheckout}
        disabled={loading}
        style={{
          width: '100%',
          background: '#238636',
          color: '#fff',
          border: 'none',
          borderRadius: '8px',
          padding: '0.5rem',
          fontSize: '0.78rem',
          fontWeight: 600,
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.6 : 1,
        }}
      >
        {loading ? 'Opening checkout...' : '🔓 Unlock full access'}
      </button>
      {error && <p style={{ color: '#f85149', fontSize: '0.7rem', marginTop: '4px' }}>{error}</p>}
    </div>
  );
}
