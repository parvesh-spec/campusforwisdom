import crypto from 'crypto';

const CASHFREE_APP_ID = process.env.CASHFREE_APP_ID;
const CASHFREE_SECRET_KEY = process.env.CASHFREE_SECRET_KEY;
const CASHFREE_BASE_URL = 'https://api.cashfree.com'; // Production URL

console.log('Testing Cashfree Production API...');
console.log('App ID:', CASHFREE_APP_ID?.substring(0, 10) + '...');
console.log('Base URL:', CASHFREE_BASE_URL);

const testCashfreeAPI = async () => {
  try {
    const createOrderRequest = {
      order_id: `CFW_${Date.now()}_TEST`,
      order_amount: 1,
      order_currency: 'INR',
      customer_details: {
        customer_id: 'test_customer_123',
        customer_name: 'Test User',
        customer_email: 'test@example.com',
        customer_phone: '9999999999',
      },
      order_meta: {
        return_url: 'http://localhost:5000/payment/success',
        notify_url: 'http://localhost:5000/api/payments/webhook',
      },
      order_note: "Test payment for CampusForWisdom",
    };

    console.log('Request payload:', JSON.stringify(createOrderRequest, null, 2));

    const response = await fetch(`${CASHFREE_BASE_URL}/pg/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-version': '2023-08-01',
        'x-client-id': CASHFREE_APP_ID,
        'x-client-secret': CASHFREE_SECRET_KEY,
      },
      body: JSON.stringify(createOrderRequest)
    });

    const responseText = await response.text();
    console.log('\nResponse status:', response.status);
    console.log('Response body:', responseText);

    if (response.ok) {
      console.log('✅ Production Cashfree API working!');
      const data = JSON.parse(responseText);
      console.log('Order ID:', data.order_id);
      console.log('Payment Session ID:', data.payment_session_id);
    } else {
      console.log('❌ API Error - checking response...');
    }
    
  } catch (error) {
    console.error('Network Error:', error);
  }
};

testCashfreeAPI();
