const { createRazorpayOrder, verifyRazorpayPayment } = require('../gateways/razorpay');
const { createStripePaymentIntent, confirmStripePayment } = require('../gateways/stripe');
const Transaction = require('../models/transaction');

const initiatePayment = async (req, res) => {
  const { gateway, amount, currency, name, email, paymentMethod = 'card' } = req.body;
  
  console.log('Initiating payment with:', { gateway, amount, currency, name, email, paymentMethod });

  // Validation
  if (!amount || !name || !email) {
    return res.status(400).json({ 
      success: false, 
      message: 'Amount, name, and email are required' 
    });
  }

  if (amount <= 0) {
    return res.status(400).json({ 
      success: false, 
      message: 'Amount must be greater than 0' 
    });
  }

  if (!['stripe', 'razorpay'].includes(gateway)) {
    return res.status(400).json({ 
      success: false, 
      message: 'Unsupported gateway. Use "stripe" or "razorpay"' 
    });
  }

  if (gateway === 'razorpay' && !['card', 'upi'].includes(paymentMethod)) {
    return res.status(400).json({ 
      success: false, 
      message: 'For Razorpay, payment method must be "card" or "upi"' 
    });
  }

  try {
    // NO MORE immediate transaction creation - only create gateway order/intent
    
    if (gateway === 'razorpay') {
      const order = await createRazorpayOrder({ 
        amount, 
        currency, 
        name, 
        email, 
        paymentMethod 
      });

      return res.status(200).json({ 
        success: true, 
        gateway, 
        amount, 
        name, 
        email, 
        paymentMethod,
        order 
      });
    }

    if (gateway === 'stripe') {
      const intent = await createStripePaymentIntent({ 
        amount, 
        currency, 
        name, 
        email 
      });

      return res.status(200).json({ 
        success: true, 
        gateway, 
        amount, 
        name, 
        email, 
        paymentMethod: 'card',
        intent 
      });
    }

    return res.status(400).json({ success: false, message: 'Unsupported gateway' });
  } catch (error) {
    console.error('Payment initiation error:', error);
    return res.status(500).json({ 
      success: false, 
      message: error.message || 'Payment initiation failed' 
    });
  }
};

const verifyPayment = async (req, res) => {
  const { gateway, orderId, paymentId, signature, name, email, amount, currency, paymentMethod } = req.body;

  try {
    let verificationResult;
    
    if (gateway === 'razorpay') {
      verificationResult = await verifyRazorpayPayment(orderId, paymentId, signature);
    } else if (gateway === 'stripe') {
      verificationResult = await confirmStripePayment(paymentId);
    } else {
      return res.status(400).json({ success: false, message: 'Unsupported gateway' });
    }

    // NOW create transaction record after payment verification
    const transaction = new Transaction({
      gateway,
      paymentMethod: paymentMethod || 'card',
      amount,
      currency,
      customerName: name,
      customerEmail: email,
      status: verificationResult.success ? 'completed' : 'failed',
      orderId: orderId,
      gatewayOrderId: orderId,
      paymentId: paymentId,
      completedAt: new Date(),
      gatewayResponse: verificationResult
    });

    await transaction.save();
    console.log('Transaction created after payment verification:', transaction);

    return res.status(200).json({ 
      success: true, 
      verification: verificationResult,
      transactionId: transaction._id 
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    
    // Create failed transaction record if verification fails
    try {
      const transaction = new Transaction({
        gateway,
        paymentMethod: paymentMethod || 'card',
        amount,
        currency,
        customerName: name,
        customerEmail: email,
        status: 'failed',
        orderId: orderId,
        gatewayOrderId: orderId,
        paymentId: paymentId,
        completedAt: new Date(),
        gatewayResponse: { error: error.message }
      });
      
      await transaction.save();
      console.log('Failed transaction created:', transaction);
      
      return res.status(500).json({ 
        success: false, 
        message: error.message || 'Payment verification failed',
        transactionId: transaction._id
      });
    } catch (dbError) {
      console.error('Failed to create failed transaction:', dbError);
      return res.status(500).json({ 
        success: false, 
        message: error.message || 'Payment verification failed' 
      });
    }
  }
};

module.exports = {
  initiatePayment,
  verifyPayment,
};
