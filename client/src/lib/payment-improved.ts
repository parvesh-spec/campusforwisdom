import { load } from "@cashfreepayments/cashfree-js";

// Initialize Cashfree
let cashfree: any = null;

export const initializeCashfree = async () => {
  if (!cashfree) {
    if (!import.meta.env.VITE_CASHFREE_APP_ID) {
      throw new Error('Cashfree App ID not configured');
    }
    
    cashfree = await load({
      mode: 'production' // Always use production since we have production credentials
    });
  }
  return cashfree;
};

export interface PaymentRequest {
  amount: number;
  courseId?: string;
  webinarId?: string;
  consultationId?: string;
  ebookId?: string;
}

export interface PaymentSession {
  orderId: string;
  paymentSessionId: string;
  amount: number;
  currency: string;
}

export interface PaymentResult {
  success: boolean;
  orderId?: string;
  error?: string;
}

export const createPaymentSession = async (paymentRequest: PaymentRequest): Promise<PaymentSession> => {
  const response = await fetch('/api/payments/create-session', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(paymentRequest),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create payment session');
  }

  return await response.json();
};

export const processPayment = async (paymentSession: PaymentSession): Promise<PaymentResult> => {
  try {
    await initializeCashfree();
    
    const paymentObject = {
      paymentSessionId: paymentSession.paymentSessionId,
      redirectTarget: "_modal" // Open payment in modal
    };

    const result = await cashfree.pay(paymentObject);
    
    if (result.error) {
      throw new Error(result.error.message || 'Payment failed');
    }
    
    // Payment successful, verify on backend
    const verifyResponse = await fetch(`/api/payments/verify/${paymentSession.orderId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (verifyResponse.ok) {
      return {
        success: true,
        orderId: paymentSession.orderId
      };
    } else {
      throw new Error('Payment verification failed');
    }
  } catch (error) {
    console.error('Payment error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Payment failed'
    };
  }
};

// Helper functions for different payment types
export const payForCourse = async (courseId: string, amount: number): Promise<PaymentResult> => {
  try {
    const session = await createPaymentSession({ amount, courseId });
    return await processPayment(session);
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Payment failed'
    };
  }
};

export const payForWebinar = async (webinarId: string, amount: number): Promise<PaymentResult> => {
  try {
    const session = await createPaymentSession({ amount, webinarId });
    return await processPayment(session);
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Payment failed'
    };
  }
};

export const payForConsultation = async (consultationId: string, amount: number): Promise<PaymentResult> => {
  try {
    const session = await createPaymentSession({ amount, consultationId });
    return await processPayment(session);
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Payment failed'
    };
  }
};

export const payForEbook = async (ebookId: string, amount: number): Promise<PaymentResult> => {
  try {
    const session = await createPaymentSession({ amount, ebookId });
    return await processPayment(session);
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Payment failed'
    };
  }
};