import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe('pk_test_51R6cMI2VUtLz9L5KVUM4Bsx3yfcpP9MCBd6m37FaVjR9KTK8pPPFfSU8pyQxkSrvm24kJrF7rtdOJ82fn2HPXkVo00PmJS8f4e');

const PayNowButton = ({ appointmentId }) => {
  const [paid, setPaid] = useState(false);

  useEffect(() => {
    // Fetch the payment status from the backend
    const fetchPaymentStatus = async () => {
      try {
        const response = await fetch(`/api/appointments/${appointmentId}`);
        const data = await response.json();
        setPaid(data.paid);
      } catch (error) {
        console.error('Error fetching payment status:', error);
      }
    };

    fetchPaymentStatus();
  }, [appointmentId]);

  const handlePayNow = async () => {
    const stripe = await stripePromise;

    const response = await fetch('/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ appointmentId }),
    });
    const { sessionId } = await response.json();

    const { error } = await stripe.redirectToCheckout({ sessionId });
    if (error) {
      console.error('Payment failed:', error.message);
    }
  };

  const handleJoinCall = () => {
    window.location.href = `/dashboard/appointments/video-session?appointmentId=${appointmentId}`;
  };

  return (
    <button
      className={`btn ${paid ? 'btn-success' : 'btn-primary'}`}
      onClick={paid ? handleJoinCall : handlePayNow}
    >
      {paid ? 'Join Call' : 'Pay Now'}
    </button>
  );
};

export default PayNowButton;
