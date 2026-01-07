import React, { useState } from 'react';

interface PayNowButtonProps {
  appointmentId: string;
  amount: number;
  currency?: string;
}

export const PayNowButton: React.FC<PayNowButtonProps> = ({ appointmentId, amount, currency = 'USD' }) => {
  const [loading, setLoading] = useState(false);

  const handlePay = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/paypal/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appointmentId, amount, currency }),
      });
      const data = await res.json();
      setLoading(false);
      if (data?.approvalUrl) {
        window.location.href = data.approvalUrl;
      } else {
        alert('Error creating PayPal order');
      }
    } catch {
      setLoading(false);
      alert('Error connecting to payment service');
    }
  };

  return (
    <button
      className="bg-yellow-400 hover:bg-yellow-500 text-blue-900 font-bold px-4 py-2 rounded-full transition"
      onClick={handlePay}
      disabled={loading}
    >
      {loading ? 'Redirecting...' : 'Pay'}
    </button>
  );
};