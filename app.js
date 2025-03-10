const express = require('express');
const Razorpay = require('razorpay');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const cors = require('cors');

const razorpay = new Razorpay({
  key_id: 'rzp_test_xT9H2pVxmor7bA',
  key_secret: 'TSJfbSWRalC1SqzL1AJJn5X6',
});

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Route to create an order
app.post('/create-order', async (req, res) => {
  const payment_capture = 1;
  const amount = 50000; 

  const options = {
    amount: amount, 
    currency: 'INR',
    receipt: 'receipt#1',
    payment_capture: payment_capture,
  };

  try {
    const order = await razorpay.orders.create(options);
    res.json(order);  
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// Route to verify payment
app.post('/verify-payment', (req, res) => {
  const secret = 'TSJfbSWRalC1SqzL1AJJn5X6';

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  const generated_signature = crypto
    .createHmac('sha256', secret)
    .update(razorpay_order_id + "|" + razorpay_payment_id)  // Fixed syntax error
    .digest('hex');

  if (generated_signature === razorpay_signature) {
    res.json({ status: 'Payment Verified' });
  } else {
    res.status(400).json({ status: 'Payment verification failed' });
  }
});

// Route to fetch transaction history
app.get('/transaction-history', async (req, res) => {
  try {
    const payments = await razorpay.payments.all({ count: 10 });
    res.json(payments);
  } catch (error) {
    console.error("Error fetching transaction history:", error);
    res.status(500).json({ error: "Failed to fetch transaction history" });
  }
});

// Route to fetch a specific transaction by ID
app.get('/transaction/:paymentId', async (req, res) => {
  const { paymentId } = req.params;

  try {
    const payment = await razorpay.payments.fetch(paymentId);
    res.json(payment);
  } catch (error) {
    console.error("Error fetching transaction:", error);
    res.status(500).json({ error: "Failed to fetch transaction details" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
