// routes/paymentRoutes.js
const express = require('express');
const { initiatePayment, verifyPayment } = require('../controllers/paymentController');
const Transaction = require('../models/transaction');
const router = express.Router();

console.log('Payment routes loaded');

router.post('/create/payment', initiatePayment);
router.post('/verify/payment', verifyPayment);

// Route to manually update transaction status
router.put('/transactions/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const transaction = await Transaction.findByIdAndUpdate(
      id,
      { 
        status,
        completedAt: status === 'completed' || status === 'failed' ? new Date() : undefined
      },
      { new: true }
    );
    
    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }
    
    res.json({ success: true, transaction });
  } catch (error) {
    console.error('Error updating transaction status:', error);
    res.status(500).json({ success: false, message: 'Failed to update transaction status' });
  }
});

// Route to get all transactions
router.get('/transactions', async (req, res) => {
  try {
    const transactions = await Transaction.find().sort({ createdAt: -1 });
    // console.log('transactions are', transactions);
    
    res.json({ success: true, transactions });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch transactions' });
  }
});

module.exports = router;
