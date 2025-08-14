const Razorpay = require('razorpay');

// Use test credentials for sandbox mode
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_XXXXXXXXXXXXXXXX',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
});

exports.createRazorpayOrder = async ({ amount, currency = 'INR', name, email, paymentMethod = 'card' }) => {
  try {
    // Convert amount to smallest currency unit (paise for INR)
    const amountInSmallestUnit = Math.round(amount * 100);
    
    const options = {
      amount: amountInSmallestUnit,
      currency: currency.toUpperCase(),
      receipt: `receipt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      notes: {
        name,
        email,
        payment_method: paymentMethod,
      },
      // Do not set method here
    };

    const order = await razorpay.orders.create(options);

    return {
      success: true,
      status: 'created',
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      paymentMethod,
      key_id: razorpay.key_id, // Required for frontend integration
    };
  } catch (error) {
    console.error('Razorpay order creation error:', error);
    throw new Error(`Razorpay payment failed: ${error.message}`);
  }
};

exports.verifyRazorpayPayment = async (orderId, paymentId, signature) => {
  try {
    const crypto = require('crypto');
    const expectedSignature = crypto
      .createHmac('sha256', razorpay.key_secret)
      .update(orderId + '|' + paymentId)
      .digest('hex');

    if (expectedSignature === signature) {
      return {
        success: true,
        verified: true,
        orderId,
        paymentId,
      };
    } else {
      throw new Error('Payment signature verification failed');
    }
  } catch (error) {
    console.error('Razorpay payment verification error:', error);
    throw new Error(`Payment verification failed: ${error.message}`);
  }
};
