import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:9000';

const TransactionsList = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchTransactions = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.get(`${API_BASE_URL}/api/transactions`);
      if (response.data.success) {
        setTransactions(response.data.transactions);
      } else {
        setError('Failed to fetch transactions');
      }
    } catch (err) {
      setError('Error fetching transactions: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return '#28a745';
      case 'failed': return '#dc3545';
      case 'pending': return '#ffc107';
      default: return '#6c757d';
    }
  };

  return (
    <div style={{ 
      flex: 1, 
      padding: '20px',
      backgroundColor: '#f8f9fa',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      marginLeft: '20px'
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <h2 style={{ 
          color: '#333',
          fontSize: '24px',
          fontWeight: '600',
          margin: 0
        }}>
          Transactions
        </h2>
        <button 
          onClick={fetchTransactions}
          disabled={loading}
          style={{
            backgroundColor: loading ? '#ccc' : '#007bff',
            color: 'white',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '6px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: '600'
          }}
        >
          {loading ? 'Loading...' : 'Get Transactions'}
        </button>
      </div>

      {error && (
        <div style={{ 
          color: '#721c24', 
          backgroundColor: '#f8d7da',
          padding: '12px',
          borderRadius: '6px',
          marginBottom: '20px',
          border: '1px solid #f5c6cb'
        }}>
          {error}
        </div>
      )}

      {transactions.length === 0 && !loading && (
        <div style={{ 
          textAlign: 'center', 
          color: '#6c757d',
          padding: '40px',
          backgroundColor: 'white',
          borderRadius: '6px',
          border: '1px solid #ddd'
        }}>
          No transactions found. Click "Get Transactions" to load data.
        </div>
      )}

      {transactions.length > 0 && (
        <div style={{ 
          maxHeight: '500px', 
          overflowY: 'auto',
          backgroundColor: 'white',
          borderRadius: '6px',
          border: '1px solid #ddd'
        }}>
          {transactions.map((transaction, index) => (
            <div 
              key={transaction._id || index}
              style={{ 
                padding: '15px',
                borderBottom: index < transactions.length - 1 ? '1px solid #eee' : 'none',
                backgroundColor: index % 2 === 0 ? '#f8f9fa' : 'white'
              }}
            >
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '8px'
              }}>
                <div style={{ fontWeight: '600', color: '#333' }}>
                  {transaction.customerName}
                </div>
                <div style={{ 
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: 'white',
                  backgroundColor: getStatusColor(transaction.status)
                }}>
                  {transaction.status.toUpperCase()}
                </div>
              </div>
              
              <div style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>
                <strong>Gateway:</strong> {transaction.gateway} | 
                <strong> Amount:</strong> {transaction.currency} {transaction.amount} |
                <strong> Method:</strong> {transaction.paymentMethod}
              </div>
              
              <div style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>
                <strong>Email:</strong> {transaction.customerEmail}
              </div>
              
              {transaction.paymentId && (
                <div style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>
                  <strong>Payment ID:</strong> {transaction.paymentId}
                </div>
              )}
              
              <div style={{ fontSize: '12px', color: '#999' }}>
                <strong>Created:</strong> {formatDate(transaction.createdAt)}
                {transaction.completedAt && (
                  <span> | <strong>Completed:</strong> {formatDate(transaction.completedAt)}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TransactionsList;

