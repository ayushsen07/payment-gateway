import React, { useState } from 'react';

const PaymentForm = ({ onSubmit, loading, serverStatus, error, upiWarning }) => {
  const [formData, setFormData] = useState({
    gateway: 'razorpay',
    amount: '',
    currency: 'INR',
    name: '',
    email: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));

    // Reset currency to INR when gateway changes to Razorpay
    if (name === 'gateway') {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        currency: value === 'razorpay' ? 'INR' : prev.currency
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted with data:', formData);
    onSubmit(formData);
  };

  return (
    <div style={{ 
      flex: 1, 
      padding: '20px',
      backgroundColor: '#f8f9fa',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      <h2 style={{ 
        textAlign: 'center', 
        color: '#333',
        marginBottom: '30px',
        fontSize: '24px',
        fontWeight: '600'
      }}>
        Create Payment
      </h2>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px', 
            fontWeight: '600',
            color: '#555'
          }}>
            Payment Gateway:
          </label>
          <select 
            name="gateway" 
            value={formData.gateway} 
            onChange={handleChange} 
            required
            style={{ 
              width: '100%', 
              padding: '12px', 
              borderRadius: '6px', 
              border: '1px solid #ddd',
              fontSize: '16px',
              backgroundColor: 'white'
            }}
          >
            <option value="razorpay">Razorpay</option>
            <option value="stripe">Stripe</option>
          </select>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px', 
            fontWeight: '600',
            color: '#555'
          }}>
            Amount:
          </label>
          <input 
            type="number" 
            name="amount" 
            value={formData.amount} 
            onChange={handleChange} 
            required 
            min="1"
            step="0.01"
            placeholder="Enter amount"
            style={{ 
              width: '100%', 
              padding: '12px', 
              borderRadius: '6px', 
              border: '1px solid #ddd',
              fontSize: '16px',
              backgroundColor: 'white'
            }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px', 
            fontWeight: '600',
            color: '#555'
          }}>
            Currency:
          </label>
          <select 
            name="currency" 
            value={formData.currency} 
            onChange={handleChange} 
            required
            style={{ 
              width: '100%', 
              padding: '12px', 
              borderRadius: '6px', 
              border: '1px solid #ddd',
              fontSize: '16px',
              backgroundColor: 'white'
            }}
          >
            <option value="INR">INR (₹)</option>
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
          </select>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px', 
            fontWeight: '600',
            color: '#555'
          }}>
            Name:
          </label>
          <input 
            type="text" 
            name="name" 
            value={formData.name} 
            onChange={handleChange} 
            required
            placeholder="Enter your name"
            style={{ 
              width: '100%', 
              padding: '12px', 
              borderRadius: '6px', 
              border: '1px solid #ddd',
              fontSize: '16px',
              backgroundColor: 'white'
            }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px', 
            fontWeight: '600',
            color: '#555'
          }}>
            Email:
          </label>
          <input 
            type="email" 
            name="email" 
            value={formData.email} 
            onChange={handleChange} 
            required
            placeholder="Enter your email"
            style={{ 
              width: '100%', 
              padding: '12px', 
              borderRadius: '6px', 
              border: '1px solid #ddd',
              fontSize: '16px',
              backgroundColor: 'white'
            }}
          />
        </div>

        {upiWarning && (
          <div style={{ 
            color: '#856404', 
            backgroundColor: '#fff3cd',
            padding: '12px',
            borderRadius: '6px',
            marginBottom: '20px',
            border: '1px solid #ffeaa7'
          }}>
            {upiWarning}
          </div>
        )}

        <button 
          type="submit" 
          disabled={loading || serverStatus !== 'connected'}
          style={{
            backgroundColor: (loading || serverStatus !== 'connected') ? '#ccc' : '#007bff',
            color: 'white',
            padding: '14px 24px',
            border: 'none',
            borderRadius: '6px',
            cursor: (loading || serverStatus !== 'connected') ? 'not-allowed' : 'pointer',
            fontSize: '16px',
            width: '100%',
            fontWeight: '600',
            transition: 'background-color 0.3s ease'
          }}
        >
          {loading ? 'Creating Payment...' : 'Create Payment'}
        </button>
      </form>
    </div>
  );
};

export default PaymentForm;
