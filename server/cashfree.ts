import crypto from 'crypto';

if (!process.env.CASHFREE_APP_ID || !process.env.CASHFREE_SECRET_KEY) {
  throw new Error('Missing required Cashfree credentials: CASHFREE_APP_ID and CASHFREE_SECRET_KEY');
}

const CASHFREE_BASE_URL = 'https://api.cashfree.com';

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
      console.log('Creating Cashfree payment session with:', {
        orderId: request.orderId,
        amount: request.amount,
        appId: CASHFREE_APP_ID?.substring(0, 10) + '...',
        baseUrl: CASHFREE_BASE_URL
      });

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
          return_url: request.orderMeta?.returnUrl || `https://${process.env.REPLIT_DOMAINS?.split(',')[0] || 'localhost:5000'}/payment/success`,
          notify_url: request.orderMeta?.notifyUrl || `https://${process.env.REPLIT_DOMAINS?.split(',')[0] || 'localhost:5000'}/api/payments/webhook`,
          payment_methods: request.orderMeta?.paymentMethods || "",
        },
        order_note: "Payment for CampusForWisdom services",
      };

      console.log('Sending request to:', `${CASHFREE_BASE_URL}/pg/orders`);

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
      console.log('Cashfree API response status:', response.status);
      console.log('Cashfree API response:', responseText.substring(0, 500));

      if (!response.ok) {
        let errorMessage = 'Unknown error';
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.message || errorData.error || 'API Error';
        } catch (e) {
          errorMessage = `HTTP ${response.status}: ${responseText}`;
        }
        throw new Error(`Cashfree API error: ${errorMessage}`);
      }

      const data = JSON.parse(responseText);
      
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