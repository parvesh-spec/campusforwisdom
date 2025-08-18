import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertInstructorApplicationSchema, type InsertInstructorApplication } from "@shared/schema";
import { X, Send } from "lucide-react";

interface InstructorApplicationModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onClose: () => void;
}

export default function InstructorApplicationModal({ 
  isOpen, 
  onOpenChange, 
  onClose 
}: InstructorApplicationModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<InsertInstructorApplication>({
    resolver: zodResolver(insertInstructorApplicationSchema.extend({
      experience: insertInstructorApplicationSchema.shape.experience.refine(
        (val) => val.length > 0,
        "Please describe your experience"
      ),
      expertise: insertInstructorApplicationSchema.shape.expertise.refine(
        (val) => val.length > 0,
        "Please describe your areas of expertise"
      ),
      background: insertInstructorApplicationSchema.shape.background.refine(
        (val) => val.length > 0,
        "Please describe your background"
      ),
      motivation: insertInstructorApplicationSchema.shape.motivation.refine(
        (val) => val.length > 0,
        "Please tell us why you want to teach"
      ),
    })),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      experience: "",
      expertise: "",
      background: "",
      motivation: "",
      linkedin: "",
      portfolio: "",
    },
  });

  const submitMutation = useMutation({
    mutationFn: async (data: InsertInstructorApplication) => {
      return apiRequest("POST", "/api/instructor-applications", data);
    },
    onSuccess: () => {
      toast({
        title: "Application Submitted!",
        description: "Thank you for your interest. We'll review your application and get back to you soon.",
      });
      form.reset();
      onClose();
      queryClient.invalidateQueries({ queryKey: ["/api/instructor-applications"] });
    },
    onError: (error: any) => {
      toast({
        title: "Submission Failed",
        description: error.message || "There was an error submitting your application. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: InsertInstructorApplication) => {
    setIsSubmitting(true);
    try {
      await submitMutation.mutateAsync(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900">
            Become an Instructor
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="text-sm text-gray-600">
            <p>We're looking for passionate AI experts to join our instructor community. Share your knowledge and help others learn cutting-edge AI skills.</p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
                
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your full name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address *</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="your.email@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number *</FormLabel>
                        <FormControl>
                          <Input placeholder="+91 9876543210" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Professional Background */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Professional Background</h3>
                
                <FormField
                  control={form.control}
                  name="experience"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Years of Experience *</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe your professional experience in AI, teaching, or related fields..."
                          rows={3}
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="expertise"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Areas of Expertise *</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="List your expertise areas (e.g., Machine Learning, Computer Vision, NLP, AI Tools, etc.)"
                          rows={3}
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="background"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Professional Background *</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Tell us about your current role, education, certifications, and relevant achievements..."
                          rows={4}
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="motivation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Why do you want to teach? *</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Share your motivation for becoming an instructor and how you plan to help students..."
                          rows={4}
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Optional Links */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Additional Information (Optional)</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="linkedin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>LinkedIn Profile</FormLabel>
                        <FormControl>
                          <Input placeholder="https://linkedin.com/in/yourprofile" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="portfolio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Portfolio/Website</FormLabel>
                        <FormControl>
                          <Input placeholder="https://yourportfolio.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4 pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  {isSubmitting ? (
                    "Submitting..."
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Submit Application
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}