const Stripe = require('stripe');

// Use test secret key for sandbox mode
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

exports.createStripePaymentIntent = async ({ amount, currency = 'INR', name, email }) => {
  try {
    // Convert amount to smallest currency unit (paise for INR, cents for USD)
    const amountInSmallestUnit = Math.round(amount * 100);
    
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInSmallestUnit,
      currency: currency.toLowerCase(),
      metadata: {
        customer_name: name,
        customer_email: email
      },
      payment_method_types: ['card'],
      description: `Payment for ${name} - ${email}`,
    });

    return {
      success: true,
      id: paymentIntent.id,
      client_secret: paymentIntent.client_secret,
      amount: amountInSmallestUnit,
      currency: currency.toLowerCase(),
    };
  } catch (error) {
    console.error('Stripe payment intent creation error:', error);
    throw new Error(`Stripe payment failed: ${error.message}`);
  }
};

exports.confirmStripePayment = async (paymentIntentId) => {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    return {
      success: true,
      status: paymentIntent.status,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
    };
  } catch (error) {
    console.error('Stripe payment confirmation error:', error);
    throw new Error(`Payment confirmation failed: ${error.message}`);
  }
};

  
