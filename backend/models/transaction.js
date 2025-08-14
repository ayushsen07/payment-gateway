const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  gateway: {
    type: String,
    required: true,
    enum: ['stripe', 'razorpay']
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['card', 'upi']
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    required: true,
    default: 'INR'
  },
  customerName: {
    type: String,
    required: true
  },
  customerEmail: {
    type: String,
    required: true
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  orderId: String,
  gatewayOrderId: String,
  paymentId: String,
  gatewayClientSecret: String,
  gatewayResponse: Object,
  createdAt: {
    type: Date,
    default: Date.now
  },
  completedAt: Date
});

module.exports = mongoose.model('Transaction', transactionSchema);
