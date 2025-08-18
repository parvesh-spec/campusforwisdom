import crypto from 'crypto';

if (!process.env.CASHFREE_APP_ID || !process.env.CASHFREE_SECRET_KEY) {
  throw new Error('Missing required Cashfree credentials: CASHFREE_APP_ID and CASHFREE_SECRET_KEY');
}

const CASHFREE_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://api.cashfree.com' 
  : 'https://sandbox.cashfree.com';

const CASHFREE_APP_ID = process.env.CASHFREE_APP_ID;
const CASHFREE_SECRET_KEY = process.env.CASHFREE_SECRET_KEY;

export interface PaymentSessionRequest {
  orderId: string;
  amount: number;
  currency: string;
  customerDetails: {
    customerId: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
  };
  orderMeta?: {
    returnUrl?: string;
    notifyUrl?: string;
    paymentMethods?: string;
  };
}

export interface PaymentSessionResponse {
  cfOrderId: number;
  orderId: string;
  paymentSessionId: string;
  orderStatus: string;
}

export class CashfreeService {
  static async createPaymentSession(request: PaymentSessionRequest): Promise<PaymentSessionResponse> {
    try {
      const createOrderRequest = {
        order_id: request.orderId,
        order_amount: request.amount,
        order_currency: request.currency,
        customer_details: {
          customer_id: request.customerDetails.customerId,
          customer_name: request.customerDetails.customerName,
          customer_email: request.customerDetails.customerEmail,
          customer_phone: request.customerDetails.customerPhone,
        },
        order_meta: {
          return_url: request.orderMeta?.returnUrl || `${process.env.FRONTEND_URL || 'http://localhost:5000'}/payment/success`,
          notify_url: request.orderMeta?.notifyUrl || `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/payments/webhook`,
          payment_methods: request.orderMeta?.paymentMethods || "",
        },
        order_note: "Payment for CampusForWisdom services",
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

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Cashfree API error: ${error.message || 'Unknown error'}`);
      }

      const data = await response.json();
      
      return {
        cfOrderId: data.cf_order_id,
        orderId: data.order_id,
        paymentSessionId: data.payment_session_id,
        orderStatus: data.order_status,
      };
    } catch (error) {
      console.error("Error creating Cashfree payment session:", error);
      throw new Error("Failed to create payment session");
    }
  }

  static async verifyPayment(orderId: string): Promise<any> {
    try {
      const response = await fetch(`${CASHFREE_BASE_URL}/pg/orders/${orderId}/payments`, {
        method: 'GET',
        headers: {
          'x-api-version': '2023-08-01',
          'x-client-id': CASHFREE_APP_ID,
          'x-client-secret': CASHFREE_SECRET_KEY,
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch payment details');
      }

      return await response.json();
    } catch (error) {
      console.error("Error verifying payment:", error);
      throw new Error("Failed to verify payment");
    }
  }

  static async getOrderStatus(orderId: string): Promise<any> {
    try {
      const response = await fetch(`${CASHFREE_BASE_URL}/pg/orders/${orderId}`, {
        method: 'GET',
        headers: {
          'x-api-version': '2023-08-01',
          'x-client-id': CASHFREE_APP_ID,
          'x-client-secret': CASHFREE_SECRET_KEY,
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch order status');
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching order status:", error);
      throw new Error("Failed to fetch order status");
    }
  }

  static verifyWebhookSignature(rawBody: string, signature: string): boolean {
    try {
      const expectedSignature = crypto
        .createHmac('sha256', CASHFREE_SECRET_KEY)
        .update(rawBody)
        .digest('base64');
      
      return expectedSignature === signature;
    } catch (error) {
      console.error("Error verifying webhook signature:", error);
      return false;
    }
  }
}