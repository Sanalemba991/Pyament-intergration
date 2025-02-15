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


app.post('/verify-payment', (req, res) => {
  const secret = 'TSJfbSWRalC1SqzL1AJJn5X6';  

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  const generated_signature = crypto.createHmac('sha256', secret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  if (generated_signature === razorpay_signature) {
    res.json({ status: 'Payment Verified' });
  } else {
    res.status(400).json({ status: 'Payment verification failed' });
  }
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
