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
          description: `Successfully paid for ${title}`,
        });
        
        if (onSuccess) {
          onSuccess();
        }
        
        // Redirect or refresh page based on type
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        toast({
          title: "Payment Failed",
          description: result.error || "Payment could not be processed",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast({
        title: "Payment Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
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