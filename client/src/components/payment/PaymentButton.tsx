import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CreditCard } from "lucide-react";
import { payForCourse, payForWebinar, payForConsultation, payForEbook } from "@/lib/payment";

interface PaymentButtonProps {
  type: 'course' | 'webinar' | 'consultation' | 'ebook';
  itemId: string;
  amount: number;
  title: string;
  disabled?: boolean;
  onSuccess?: () => void;
  className?: string;
  children?: React.ReactNode;
}

export function PaymentButton({ 
  type, 
  itemId, 
  amount, 
  title, 
  disabled, 
  onSuccess, 
  className,
  children 
}: PaymentButtonProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handlePayment = async () => {
    setLoading(true);
    
    try {
      let result;
      
      switch (type) {
        case 'course':
          result = await payForCourse(itemId, amount);
          break;
        case 'webinar':
          result = await payForWebinar(itemId, amount);
          break;
        case 'consultation':
          result = await payForConsultation(itemId, amount);
          break;
        case 'ebook':
          result = await payForEbook(itemId, amount);
          break;
        default:
          throw new Error('Invalid payment type');
      }

      if (result.success) {
        toast({
          title: "Payment Successful",
          description: `Successfully paid for ${title}. Booking confirmed!`,
        });
        
        if (onSuccess) {
          onSuccess();
        }
        
        // Invalidate related queries first to refresh data
        const queryClient = (window as any).queryClient;
        if (queryClient) {
          // Invalidate specific queries to refresh booking status
          queryClient.invalidateQueries({ queryKey: [`/api/live-sessions/${itemId}`] });
          queryClient.invalidateQueries({ queryKey: ["/api/live-sessions"] });
          queryClient.invalidateQueries({ queryKey: ["/api/student/live-sessions"] });
          queryClient.invalidateQueries({ queryKey: [`/api/courses/${itemId}`] });
          queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
          queryClient.invalidateQueries({ queryKey: ["/api/student/enrollments"] });
        }
        
        // For course payments, wait longer for webhook processing
        const reloadDelay = type === 'course' ? 3000 : 2000;
        
        // Refresh page to show updated status after delay
        setTimeout(() => {
          window.location.reload();
        }, reloadDelay);
      } else {
        // Only show error if it's not a user cancellation
        if (!result.error?.includes("User closed") && !result.error?.includes("popup was closed")) {
          toast({
            title: "Payment Failed",
            description: result.error || "Payment could not be processed. Please try again.",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error("Payment error:", error);
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred.";
      
      // Show specific error messages for payment requirements
      if (errorMessage.includes("Payment required") || errorMessage.includes("Payment gateway not integrated")) {
        toast({
          title: "Payment Required",
          description: "Please complete payment to access this content.",
          variant: "destructive",
        });
      } else if (errorMessage.includes("User closed") || errorMessage.includes("popup was closed")) {
        // Don't show error for user closing payment popup
        console.log("User cancelled payment");
      } else {
        toast({
          title: "Payment Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handlePayment}
      disabled={disabled || loading}
      className={className}
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Processing...
        </>
      ) : (
        <>
          <CreditCard className="w-4 h-4 mr-2" />
          {children || `Pay ₹${amount}`}
        </>
      )}
    </Button>
  );
}

// Specific payment button components for different types
export function CoursePaymentButton({ 
  courseId, 
  amount, 
  title, 
  disabled, 
  onSuccess,
  className 
}: {
  courseId: string;
  amount: number;
  title: string;
  disabled?: boolean;
  onSuccess?: () => void;
  className?: string;
}) {
  return (
    <PaymentButton
      type="course"
      itemId={courseId}
      amount={amount}
      title={title}
      disabled={disabled}
      onSuccess={onSuccess}
      className={className}
    >
      Enroll Now - ₹{amount}
    </PaymentButton>
  );
}

export function WebinarPaymentButton({ 
  webinarId, 
  amount, 
  title, 
  disabled, 
  onSuccess,
  className 
}: {
  webinarId: string;
  amount: number;
  title: string;
  disabled?: boolean;
  onSuccess?: () => void;
  className?: string;
}) {
  return (
    <PaymentButton
      type="webinar"
      itemId={webinarId}
      amount={amount}
      title={title}
      disabled={disabled}
      onSuccess={onSuccess}
      className={className}
    >
      Join Webinar - ₹{amount}
    </PaymentButton>
  );
}

export function ConsultationPaymentButton({ 
  consultationId, 
  amount, 
  title, 
  disabled, 
  onSuccess,
  className 
}: {
  consultationId: string;
  amount: number;
  title: string;
  disabled?: boolean;
  onSuccess?: () => void;
  className?: string;
}) {
  return (
    <PaymentButton
      type="consultation"
      itemId={consultationId}
      amount={amount}
      title={title}
      disabled={disabled}
      onSuccess={onSuccess}
      className={className}
    >
      Book Consultation - ₹{amount}
    </PaymentButton>
  );
}

export function EbookPaymentButton({ 
  ebookId, 
  amount, 
  title, 
  disabled, 
  onSuccess,
  className 
}: {
  ebookId: string;
  amount: number;
  title: string;
  disabled?: boolean;
  onSuccess?: () => void;
  className?: string;
}) {
  return (
    <PaymentButton
      type="ebook"
      itemId={ebookId}
      amount={amount}
      title={title}
      disabled={disabled}
      onSuccess={onSuccess}
      className={className}
    >
      Buy Ebook - ₹{amount}
    </PaymentButton>
  );
}