import crypto from 'crypto';

const CASHFREE_APP_ID = process.env.CASHFREE_APP_ID;
const CASHFREE_SECRET_KEY = process.env.CASHFREE_SECRET_KEY;
const CASHFREE_BASE_URL = 'https://sandbox.cashfree.com';

console.log('Testing Cashfree API directly...');
console.log('App ID:', CASHFREE_APP_ID?.substring(0, 10) + '...');
console.log('Base URL:', CASHFREE_BASE_URL);

const testCashfreeAPI = async () => {
  try {
    const createOrderRequest = {
      order_id: `order_${Date.now()}`,
      order_amount: 100,
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
    
  } catch (error) {
    console.error('Error:', error);
  }
};

testCashfreeAPI();
