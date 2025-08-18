import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight, Home, BookOpen } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

export default function PaymentSuccess() {
  const [, setLocation] = useLocation();
  const [paymentDetails, setPaymentDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get order ID from URL params
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('order_id');
    const orderToken = urlParams.get('order_token');

    if (orderId) {
      // Verify payment with backend
      verifyPayment(orderId);
    } else {
      setLoading(false);
    }
  }, []);

  const verifyPayment = async (orderId: string) => {
    try {
      const response = await apiRequest("GET", `/api/payments/verify/${orderId}`);
      const result = await response.json();
      
      setPaymentDetails(result);
      setLoading(false);
    } catch (error) {
      console.error("Error verifying payment:", error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Verifying your payment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="container mx-auto max-w-2xl">
        <Card className="text-center">
          <CardHeader>
            <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-2xl font-bold text-green-600 dark:text-green-400">
              Payment Successful!
            </CardTitle>
            <CardDescription className="text-lg">
              Thank you for your purchase. Your payment has been processed successfully.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {paymentDetails && (
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 space-y-4">
                <h3 className="font-semibold text-lg">Payment Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Order ID</span>
                    <p className="font-medium">{paymentDetails.orderId}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Amount</span>
                    <p className="font-medium">₹{paymentDetails.amount}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Status</span>
                    <p className="font-medium text-green-600 dark:text-green-400">
                      {paymentDetails.status}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Payment Method</span>
                    <p className="font-medium">Cashfree</p>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <p className="text-gray-600 dark:text-gray-400">
                {paymentDetails?.courseId && "You now have access to your enrolled course."}
                {paymentDetails?.webinarId && "You are registered for the webinar."}
                {paymentDetails?.ebookId && "Your ebook is now available in your library."}
                {paymentDetails?.consultationId && "Your consultation has been booked."}
                {!paymentDetails && "Your purchase is complete."}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  onClick={() => setLocation('/courses')}
                  className="flex items-center gap-2"
                >
                  <BookOpen className="w-4 h-4" />
                  View My Courses
                  <ArrowRight className="w-4 h-4" />
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={() => setLocation('/')}
                  className="flex items-center gap-2"
                >
                  <Home className="w-4 h-4" />
                  Back to Home
                </Button>
              </div>
            </div>

            <div className="text-sm text-gray-500 dark:text-gray-400 border-t pt-4">
              <p>
                A confirmation email has been sent to your registered email address.
                If you have any questions, please contact our support team.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}