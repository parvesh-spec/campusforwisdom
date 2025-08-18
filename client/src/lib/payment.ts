import { load } from "@cashfreepayments/cashfree-js";

// Initialize Cashfree
let cashfree: any = null;

export const initializeCashfree = async () => {
  if (!cashfree) {
    if (!import.meta.env.VITE_CASHFREE_APP_ID) {
      throw new Error('Cashfree App ID not configured');
    }
    
    cashfree = await load({
      mode: import.meta.env.MODE === 'production' ? 'production' : 'sandbox'
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
    body: JSON.stringify(paymentRequest)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create payment session');
  }

  return response.json();
};

export const processPayment = async (paymentSession: PaymentSession): Promise<PaymentResult> => {
  try {
    const cashfreeInstance = await initializeCashfree();
    
    const checkoutOptions = {
      paymentSessionId: paymentSession.paymentSessionId,
      redirectTarget: "_modal"
    };

    const result = await cashfreeInstance.checkout(checkoutOptions);

    if (result.error) {
      console.error("Payment failed:", result.error);
      return {
        success: false,
        error: result.error.message || 'Payment failed'
      };
    }

    // Verify payment with backend
    const verifyResponse = await fetch(`/api/payments/verify/${paymentSession.orderId}`);
    const verifyData = await verifyResponse.json();

    return {
      success: verifyData.status === 'completed',
      orderId: paymentSession.orderId,
      error: verifyData.status !== 'completed' ? 'Payment verification failed' : undefined
    };

  } catch (error) {
    console.error("Payment processing error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Payment processing failed'
    };
  }
};

export const verifyPaymentStatus = async (orderId: string): Promise<{ status: string; paymentDetails?: any }> => {
  const response = await fetch(`/api/payments/verify/${orderId}`);
  
  if (!response.ok) {
    throw new Error('Failed to verify payment');
  }

  return response.json();
};

// Payment utility for different services
export const payForCourse = async (courseId: string, amount: number): Promise<PaymentResult> => {
  try {
    const session = await createPaymentSession({ 
      amount, 
      courseId 
    });
    
    return await processPayment(session);
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Course payment failed'
    };
  }
};

export const payForWebinar = async (webinarId: string, amount: number): Promise<PaymentResult> => {
  try {
    const session = await createPaymentSession({ 
      amount, 
      webinarId 
    });
    
    return await processPayment(session);
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Webinar payment failed'
    };
  }
};

export const payForConsultation = async (consultationId: string, amount: number): Promise<PaymentResult> => {
  try {
    const session = await createPaymentSession({ 
      amount, 
      consultationId 
    });
    
    return await processPayment(session);
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Consultation payment failed'
    };
  }
};

export const payForEbook = async (ebookId: string, amount: number): Promise<PaymentResult> => {
  try {
    const session = await createPaymentSession({ 
      amount, 
      ebookId 
    });
    
    return await processPayment(session);
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Ebook payment failed'
    };
  }
};