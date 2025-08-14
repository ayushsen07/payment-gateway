import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import axios from 'axios';

// Import components
import PaymentForm from './components/PaymentForm';
import TransactionsList from './components/TransactionsList';
import StripeCardForm from './components/StripeCardForm';
import RazorpayHandler from './components/RazorpayHandler';

// Load Stripe with test publishable key
const stripePublishableKey = import.meta.env.VITE_APP_STRIPE_PUBLISHABLE_KEY || 'pk_test_51Rsgf5HvHb0TMxgaRdUwsUSK5ORfgocoRzXPnSRQQrVKGgBSjWeYXTcDNkT5ld0YxWscWxMICAsM9LmW5LQP8Fi200M48FYi7h';
const stripePromise = loadStripe(stripePublishableKey);

// API base URL
const API_BASE_URL = 'http://localhost:9000';

function Payment() {
  const [paymentResult, setPaymentResult] = useState(null);
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [serverStatus, setServerStatus] = useState('checking');
  const [upiWarning, setUpiWarning] = useState('');

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  // Check server status on component mount
  useEffect(() => {
    checkServerStatus();
  }, []);

  const checkServerStatus = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/health`, { timeout: 5000 });
      if (response.data.status === 'OK') {
        setServerStatus('connected');
        setError('');
      }
    } catch (error) {
      setServerStatus('disconnected');
      setError('Backend server is not running. Please start the backend server first.');
    }
  };

  const handlePaymentSubmit = async (formData) => {
    console.log('handlePaymentSubmit called with:', formData);
    setLoading(true);
    setError('');
    setPaymentResult(null);
    setOrderData(null);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/create/payment`, formData, {
        timeout: 10000
      });

      if (!response.data.success) {
        throw new Error(response.data.message);
      }

      console.log('Backend response:', response.data);

      if (formData.gateway === 'razorpay') {
        const orderDataObj = {
          ...response.data.order,
          gateway: 'razorpay',
          name: formData.name,
          email: formData.email,
          amount: formData.amount,
          currency: formData.currency,
          paymentMethod: formData.paymentMethod || 'card'
        };
        console.log('Setting Razorpay orderData:', orderDataObj);
        setOrderData(orderDataObj);
      } else if (formData.gateway === 'stripe') {
        const orderDataObj = {
          ...response.data.intent,
          gateway: 'stripe',
          name: formData.name,
          email: formData.email,
          amount: formData.amount,
          currency: formData.currency,
          paymentMethod: 'card'
        };
        console.log('Setting Stripe orderData:', orderDataObj);
        setOrderData(orderDataObj);
      }
    } catch (err) {
      console.error('Payment initiation error:', err);

      if (err.code === 'ERR_NETWORK' || err.code === 'ECONNREFUSED') {
        setError('Cannot connect to backend server. Please ensure the backend is running on port 9000.');
        setServerStatus('disconnected');
      } else if (err.response?.status === 500) {
        setError('Server error. Please check the backend logs.');
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError(err.message || 'Payment initiation failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = async (result) => {
    // No need to manually update transaction status anymore - it's handled in verifyPayment
    setPaymentResult({
      success: true,
      gateway: result.gateway,
      paymentId: result.paymentId,
      amount: result.amount,
      currency: result.currency,
      status: result.status,
      transactionId: result.transactionId
    });
    setOrderData(null);
  };

  const handlePaymentError = (errorMessage) => {
    setError(errorMessage);
    setOrderData(null);
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f5f5f5',
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      {/* Header */}
      <div style={{
        textAlign: 'center',
        marginBottom: '30px'
      }}>
        <h1 style={{
          color: '#333',
          fontSize: '32px',
          fontWeight: '700',
          margin: '0 0 10px 0'
        }}>
          Payment Gateway Testing
        </h1>
        <p style={{
          color: '#666',
          fontSize: '16px',
          margin: 0
        }}>
          Test Stripe and Razorpay integrations with real payment flows
        </p>
      </div>

      {/* Server Status Indicator */}
      <div style={{
        marginBottom: '30px',
        padding: '12px',
        borderRadius: '6px',
        backgroundColor: serverStatus === 'connected' ? '#d4edda' : '#f8d7da',
        color: serverStatus === 'connected' ? '#155724' : '#721c24',
        textAlign: 'center',
        fontWeight: '600',
        fontSize: '14px'
      }}>
        {serverStatus === 'checking' && 'Checking server connection...'}
        {serverStatus === 'connected' && 'Backend server connected'}
        {serverStatus === 'disconnected' && 'Backend server disconnected'}
      </div>

      {/* Main Layout */}
      <div style={{
        display: 'flex',
        gap: '20px',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {/* Left Side - Payment Form */}
        <div style={{ flex: 1 }}>
          <PaymentForm
            onSubmit={handlePaymentSubmit}
            loading={loading}
            serverStatus={serverStatus}
            error={error}
            upiWarning={upiWarning}
          />

          {/* Payment Forms */}
          {orderData && (
            <div style={{ marginTop: '20px' }}>
              {console.log('Rendering payment forms with orderData:', orderData)}
              {orderData.gateway === 'stripe' && (
                <Elements stripe={stripePromise}>
                  <StripeCardForm
                    amount={orderData.amount}
                    currency={orderData.currency}
                    name={orderData.name}
                    email={orderData.email}
                    transactionId={orderData.transactionId}
                    orderData={orderData}
                    onSuccess={handlePaymentSuccess}
                    onError={handlePaymentError}
                  />
                </Elements>
              )}

              {orderData.gateway === 'razorpay' && (
                <RazorpayHandler
                  orderData={orderData}
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                />
              )}
            </div>
          )}

          {/* Payment Result */}
          {paymentResult && (
            <div style={{
              marginTop: '20px',
              padding: '20px',
              border: '1px solid #28a745',
              borderRadius: '8px',
              backgroundColor: '#d4edda',
              color: '#155724'
            }}>
              <h3 style={{ marginTop: 0, marginBottom: '15px' }}>✅ Payment Successful!</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div><strong>Gateway:</strong> {paymentResult.gateway}</div>
                <div><strong>Payment ID:</strong> {paymentResult.paymentId}</div>
                <div><strong>Amount:</strong> {paymentResult.currency} {paymentResult.amount}</div>
                <div><strong>Status:</strong> {paymentResult.status}</div>
                {paymentResult.transactionId && (
                  <div><strong>Transaction ID:</strong> {paymentResult.transactionId}</div>
                )}
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div style={{
              marginTop: '20px',
              padding: '15px',
              border: '1px solid #dc3545',
              borderRadius: '6px',
              backgroundColor: '#f8d7da',
              color: '#721c24'
            }}>
              <strong>Error:</strong> {error}
              {serverStatus === 'disconnected' && (
                <div style={{ marginTop: '10px' }}>
                  <button
                    onClick={checkServerStatus}
                    style={{
                      backgroundColor: '#007bff',
                      color: 'white',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    🔄 Retry Connection
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Side - Transactions List */}
        <div style={{ flex: 1 }}>
          <TransactionsList />
        </div>
      </div>
    </div>
  );
}

export default Payment;
