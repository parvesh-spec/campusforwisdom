import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "date-fns";
import { CreditCard, BookOpen, Video, MessageCircle, FileText } from "lucide-react";

interface Payment {
  id: string;
  orderId: string;
  amount: string;
  currency: string;
  status: string;
  paymentGateway: string;
  createdAt: string;
  paidAt?: string;
  courseId?: string;
  webinarId?: string;
  consultationId?: string;
  ebookId?: string;
  course?: { id: string; title: string; };
  webinar?: { id: string; title: string; };
  consultation?: { id: string; title: string; };
  ebook?: { id: string; title: string; };
}

const getPaymentIcon = (payment: Payment) => {
  if (payment.courseId) return <BookOpen className="w-4 h-4" />;
  if (payment.webinarId) return <Video className="w-4 h-4" />;
  if (payment.consultationId) return <MessageCircle className="w-4 h-4" />;
  if (payment.ebookId) return <FileText className="w-4 h-4" />;
  return <CreditCard className="w-4 h-4" />;
};

const getPaymentTitle = (payment: Payment) => {
  if (payment.course) return payment.course.title;
  if (payment.webinar) return payment.webinar.title;
  if (payment.consultation) return payment.consultation.title;
  if (payment.ebook) return payment.ebook.title;
  return "Payment";
};

const getPaymentType = (payment: Payment) => {
  if (payment.courseId) return "Course Enrollment";
  if (payment.webinarId) return "Webinar Access";
  if (payment.consultationId) return "Expert Consultation";
  if (payment.ebookId) return "Ebook Purchase";
  return "Payment";
};

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'completed':
    case 'success':
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
    case 'pending':
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
    case 'failed':
    case 'cancelled':
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
    case 'refunded':
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
  }
};

export function PaymentHistory() {
  const { data: payments = [], isLoading, error } = useQuery<Payment[]>({
    queryKey: ["/api/payments/history"],
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
          <CardDescription>Loading your payment history...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4 border rounded-lg animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
          <CardDescription>Failed to load payment history</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-red-600 dark:text-red-400">
            There was an error loading your payment history. Please try again later.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (payments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
          <CardDescription>Your payment transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <CreditCard className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 dark:text-gray-400">No payment history yet</p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
              Start learning by enrolling in courses or booking consultations!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment History</CardTitle>
        <CardDescription>Your payment transactions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {payments.map((payment) => (
            <div
              key={payment.id}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full">
                  {getPaymentIcon(payment)}
                </div>
                <div>
                  <h4 className="font-medium">{getPaymentTitle(payment)}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {getPaymentType(payment)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    {formatDate(new Date(payment.createdAt), 'MMM dd, yyyy • HH:mm')}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    Order ID: {payment.orderId}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium">
                  ₹{payment.amount} {payment.currency}
                </p>
                <Badge className={getStatusColor(payment.status)}>
                  {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                </Badge>
                {payment.paidAt && payment.status === 'completed' && (
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                    Paid: {formatDate(new Date(payment.paidAt), 'MMM dd, yyyy')}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}