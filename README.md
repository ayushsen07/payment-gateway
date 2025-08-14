# Payment Gateway Integration

A complete payment gateway testing application with Stripe and Razorpay integrations, featuring real payment flows and transaction storage.

## 🚀 Features

- **Payment Gateways**: Stripe and Razorpay integration
- **Real Payment Testing**: Test mode with real payment flows
- **Transaction Storage**: All payments stored in MongoDB database
- **Payment Verification**: Secure payment verification for both gateways
- **Transaction History**: View all payment attempts and their status

## 📋 Prerequisites

- Node.js 
- MongoDB 
- Stripe test account
- Razorpay test account

## 🛠️ Installation

### 1. Clone the Repository
```bash
git clone <repository-url>
cd payment-gateway
```

### 2. Backend Setup
```bash
cd backend
npm install
```

### 3. Frontend Setup
```bash
cd frontend
npm install
```

### 4. Environment Variables

#### Backend (.env file in backend directory)
```env
# Server Configuration
PORT=9000

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/payment_gateway

# Stripe Test Credentials
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key

# Razorpay Test Credentials
RAZORPAY_KEY_ID=rzp_test_your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret_key
```

#### Frontend (.env file in frontend directory)
```env
VITE_APP_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
```

## 🚀 Running the Application

### Option 1: Using Scripts (Recommended)
```bash
# Windows
.\start-servers.bat

# PowerShell
.\start-servers.ps1
```

### Option 2: Manual Start
```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend
cd frontend
npm run dev
```

## 📱 How to Use

### 1. Create a Payment
1. **Fill the Form**: Enter amount, name, email, and select currency
2. **Choose Gateway**: Select between Stripe (card only) or Razorpay (card + UPI)
3. **Click "Create Payment"**: This initializes the payment
4. **Complete Payment**: Use test credentials to complete the payment

### 2. View Transactions
1. **Click "Get Transactions"**: On the right side of the screen
2. **View History**: See all payment attempts with their status

## 🧪 Test Credentials

### Stripe Test Cards
- **Success**: `4242 4242 4242 4242` (Visa)
- **Decline**: `4000 0000 0000 0002` (Visa)
- **Success**: `5555 5555 5555 4444` (Mastercard)
- **Expiry**: Any future date
- **CVV**: Any 3 digits

### Razorpay Test Methods
- **Card**: `4386 2894 0766 0153` (Any future expiry, any CVV)
- **UPI Success**: `success@razorpay`
- **UPI Failure**: `failure@razorpay`
- **Net Banking**: Any bank selection

## 🏗️ Project Structure

```
payment-gateway/
├── backend/
│   ├── controllers/
│   │   └── paymentController.js    # Payment logic
│   ├── gateways/
│   │   ├── stripe.js              # Stripe integration
│   │   └── razorpay.js            # Razorpay integration
│   ├── models/
│   │   └── transaction.js         # Database schema
│   ├── routes/
│   │   └── paymentRoutes.js       # API routes
│   └── server.js                  # Express server
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── PaymentForm.jsx    # Payment creation form
│   │   │   ├── TransactionsList.jsx # Transaction history
│   │   │   ├── StripeCardForm.jsx # Stripe payment form
│   │   │   └── RazorpayHandler.jsx # Razorpay payment handler
│   │   ├── App.jsx
│   │   └── PaymentTest.jsx            # Main payment page
│   └── package.json
└── README.md
```

## 🔌 API Endpoints

### Backend (Port 5000)

#### Create Payment
```http
POST /api/create/payment
Content-Type: application/json

{
  "gateway": "stripe|razorpay",
  "amount": 100,
  "currency": "INR",
  "name": "John Doe",
  "email": "john@example.com"
}
```

#### Verify Payment
```http
POST /api/verify/payment
Content-Type: application/json

{
  "gateway": "stripe|razorpay",
  "orderId": "order_id",
  "paymentId": "payment_id",
  "signature": "signature",
  "transactionId": "transaction_id"
}
```

#### Get Transactions
```http
GET /api/transactions
```

#### Health Check
```http
GET /health
```

## 🔧 Configuration

### Database
- **MongoDB**: Used for storing transaction records
- **Collections**: `transactions` - stores all payment attempts

### Payment Gateways
- **Stripe**: Card payments only, test mode
- **Razorpay**: Card and UPI payments, test mode

### Security
- All API keys are for test/sandbox mode
- Payment verification implemented for security
- Environment variables for sensitive data

## 🐛 Troubleshooting

### Common Issues

1. **Backend Connection Error**
   - Ensure backend is running on port 5000
   - Check MongoDB connection
   - Verify environment variables

2. **Payment Gateway Errors**
   - Verify test API keys are correct
   - Check gateway-specific error messages
   - Ensure test credentials are used

3. **Database Issues**
   - Check MongoDB connection string
   - Verify database permissions
   - Check transaction model schema

### Debug Steps
1. Check server logs in backend terminal
2. Verify API endpoints are accessible
3. Test with minimal payment amounts
4. Check browser console for frontend errors

## 📝 Development

### Adding New Payment Gateways
1. Create gateway file in `backend/gateways/`
2. Add gateway logic to `paymentController.js`
3. Update frontend components
4. Add gateway to transaction model

### Styling Changes
- All styles are inline for simplicity
- Components are modular for easy customization
- Responsive design for mobile compatibility
 
