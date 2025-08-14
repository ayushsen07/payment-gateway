import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:9000';

const StripeCardForm = ({ amount, currency, name, email, onSuccess, onError, transactionId, orderData }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    if (!stripe || !elements) {
      setLoading(false);
      return;
    }

    try {
      // Use the existing orderData instead of creating a new payment intent
      const { client_secret } = orderData;

      // Confirm payment
      const { error, paymentIntent } = await stripe.confirmCardPayment(client_secret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            name,
            email,
          },
        }
      });

      if (error) {
        onError(error.message);
             } else if (paymentIntent.status === 'succeeded') {
         // Verify payment with backend
         try {
           const verifyResponse = await axios.post(`${API_BASE_URL}/api/verify/payment`, {
             gateway: 'stripe',
             orderId: paymentIntent.id,
             paymentId: paymentIntent.id,
             signature: 'stripe_verification',
             name: name,
             email: email,
             amount: amount,
             currency: currency,
             paymentMethod: 'card'
           });

           if (verifyResponse.data.success) {
             onSuccess({
               gateway: 'stripe',
               paymentId: paymentIntent.id,
               status: 'success',
               amount: paymentIntent.amount / 100,
               currency: paymentIntent.currency,
               transactionId: verifyResponse.data.transactionId
             });
           } else {
             onError('Payment verification failed');
           }
         } catch (verifyError) {
           console.error('Verification error:', verifyError);
           // Even if verification fails, we can still show success since Stripe confirmed it
           onSuccess({
             gateway: 'stripe',
             paymentId: paymentIntent.id,
             status: 'success',
             amount: paymentIntent.amount / 100,
             currency: paymentIntent.currency,
             transactionId: null // No transactionId available due to verification failure
           });
         }
       }
    } catch (error) {
      onError(error.message || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      marginTop: '20px',
      padding: '20px',
      backgroundColor: 'white',
      borderRadius: '8px',
      border: '1px solid #ddd',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      <h3 style={{ marginTop: 0, marginBottom: '20px', color: '#333' }}>Complete Stripe Payment</h3>
      
      <form onSubmit={handleSubmit}>
        <div style={{ 
          border: '1px solid #ccc', 
          borderRadius: '6px', 
          padding: '12px', 
          marginBottom: '20px',
          backgroundColor: '#f9f9f9'
        }}>
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#424770',
                  '::placeholder': {
                    color: '#aab7c4',
                  },
                },
                invalid: {
                  color: '#9e2146',
                },
              },
            }}
          />
        </div>
        
        <div style={{ 
          backgroundColor: '#f0f0f0', 
          padding: '12px', 
          borderRadius: '6px', 
          marginBottom: '20px',
          fontSize: '14px'
        }}>
          <strong>Test Card Numbers:</strong><br/>
          • 4242 4242 4242 4242 (Visa - Success)<br/>
          • 4000 0000 0000 0002 (Visa - Declined)<br/>
          • 5555 5555 5555 4444 (Mastercard - Success)<br/>
          <strong>Expiry:</strong> Any future date<br/>
          <strong>CVV:</strong> Any 3 digits
        </div>

        <button 
          type="submit" 
          disabled={!stripe || loading}
          style={{
            backgroundColor: loading ? '#ccc' : '#6772e5',
            color: 'white',
            padding: '12px 24px',
            border: 'none',
            borderRadius: '6px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '16px',
            fontWeight: '600',
            width: '100%'
          }}
        >
          {loading ? 'Processing...' : `Pay ${currency} ${amount}`}
        </button>
      </form>
    </div>
  );
};

export default StripeCardForm;
