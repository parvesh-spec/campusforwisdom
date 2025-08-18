// Test script to create payment session directly
const fetch = require('node-fetch');

const testPaymentSession = async () => {
  try {
    const response = await fetch('http://localhost:5000/api/payments/create-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': 'connect.sid=s%3AuUWQOVqP-TdmwwY0eqqH_V0uIlVZYFZw.%2BHdxCPo7gJiYJWRJRkNY%2Bfb%2BMr5HfVbUmhvQxcZmOI4'
      },
      body: JSON.stringify({
        amount: 100,
        courseId: 'test-course'
      })
    });
    
    const data = await response.text();
    console.log('Response status:', response.status);
    console.log('Response:', data);
  } catch (error) {
    console.error('Error:', error);
  }
};

testPaymentSession();