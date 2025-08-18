import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PaymentButton, CoursePaymentButton } from "@/components/payment/PaymentButton";
import { PaymentHistory } from "@/components/payment/PaymentHistory";

export default function TestPayment() {
  const [testResults, setTestResults] = useState<string[]>([]);

  const addTestResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  const testPaymentSession = async () => {
    try {
      const response = await fetch('/api/payments/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: 100 })
      });
      
      if (response.ok) {
        const data = await response.json();
        addTestResult(`✅ Payment session created successfully`);
        addTestResult(`Order ID: ${data.orderId}`);
        addTestResult(`Amount: ₹${data.amount}`);
      } else {
        const error = await response.json();
        addTestResult(`❌ Payment session failed: ${error.error}`);
      }
    } catch (error) {
      addTestResult(`❌ Network error: ${error}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4 max-w-4xl space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Payment Integration Test</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Testing Cashfree payment gateway integration
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Test Payment Session</CardTitle>
              <CardDescription>Test creating a payment session</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <button
                onClick={testPaymentSession}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
              >
                Create Test Payment Session
              </button>
              
              <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800 max-h-40 overflow-y-auto">
                <h4 className="font-medium mb-2">Test Results:</h4>
                {testResults.length === 0 ? (
                  <p className="text-gray-500">No tests run yet</p>
                ) : (
                  <div className="space-y-1 text-sm">
                    {testResults.map((result, index) => (
                      <div key={index} className="font-mono">{result}</div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Test Payment Components</CardTitle>
              <CardDescription>Test payment buttons</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Note: Payment buttons require valid course/item IDs. Use test session above to test basic payment flow.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <PaymentHistory />

        <Card>
          <CardHeader>
            <CardTitle>Integration Status</CardTitle>
            <CardDescription>Current payment gateway setup</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="p-4 border rounded-lg">
                <div className="text-green-600 text-2xl mb-2">✅</div>
                <div className="font-medium">Backend API</div>
                <div className="text-sm text-gray-600">Payment routes configured</div>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="text-green-600 text-2xl mb-2">✅</div>
                <div className="font-medium">Database</div>
                <div className="text-sm text-gray-600">Payment schema ready</div>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="text-green-600 text-2xl mb-2">✅</div>
                <div className="font-medium">Cashfree SDK</div>
                <div className="text-sm text-gray-600">Integration complete</div>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="text-yellow-600 text-2xl mb-2">⚠️</div>
                <div className="font-medium">Authentication</div>
                <div className="text-sm text-gray-600">Login required for testing</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}