import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Star, Edit, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { CourseReview, User } from "@shared/schema";

interface CourseReviewsSectionProps {
  courseId: string;
  isEnrolled?: boolean;
}

export default function CourseReviewsSection({ courseId, isEnrolled }: CourseReviewsSectionProps) {
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Check if user is logged in as student
  const { data: user } = useQuery<User>({
    queryKey: ["/api/auth/student"],
  });

  // Fetch course reviews
  const { data: reviews = [], isLoading: reviewsLoading } = useQuery<CourseReview[]>({
    queryKey: [`/api/courses/${courseId}/reviews`],
    enabled: !!courseId,
  });

  // Fetch user's review for this course
  const { data: userReview } = useQuery<CourseReview>({
    queryKey: [`/api/courses/${courseId}/my-review`],
    enabled: !!user && !!courseId,
  });

  // Create/Update review mutation
  const reviewMutation = useMutation({
    mutationFn: async (reviewData: { rating: number; feedback: string }) => {
      if (isEditing && userReview) {
        const response = await fetch(`/api/courses/${courseId}/reviews/${userReview.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(reviewData),
        });
        if (!response.ok) throw new Error("Failed to update review");
        return response.json();
      } else {
        const response = await fetch(`/api/courses/${courseId}/reviews`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(reviewData),
        });
        if (!response.ok) throw new Error("Failed to submit review");
        return response.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/courses/${courseId}/reviews`] });
      queryClient.invalidateQueries({ queryKey: [`/api/courses/${courseId}/my-review`] });
      setShowReviewForm(false);
      setRating(0);
      setFeedback("");
      setIsEditing(false);
      toast({
        title: isEditing ? "Review updated!" : "Review submitted!",
        description: isEditing ? "Your review has been updated successfully." : "Thank you for your review!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit review",
        variant: "destructive",
      });
    },
  });

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0 || !feedback.trim()) {
      toast({
        title: "Error",
        description: "Please provide both rating and feedback",
        variant: "destructive",
      });
      return;
    }
    reviewMutation.mutate({ rating, feedback });
  };

  const openEditForm = () => {
    if (userReview) {
      setRating(userReview.rating);
      setFeedback(userReview.feedback);
      setIsEditing(true);
      setShowReviewForm(true);
    }
  };

  const openNewReviewForm = () => {
    setRating(0);
    setFeedback("");
    setIsEditing(false);
    setShowReviewForm(true);
  };

  const StarRating = ({ value, onChange, readonly = false }: { value: number; onChange?: (rating: number) => void; readonly?: boolean }) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-6 w-6 cursor-pointer transition-colors ${
              star <= value 
                ? "fill-yellow-400 text-yellow-400" 
                : "text-gray-300 hover:text-yellow-400"
            } ${readonly ? "cursor-default" : ""}`}
            onClick={readonly ? undefined : () => onChange?.(star)}
          />
        ))}
      </div>
    );
  };

  const calculateAverageRating = () => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((total, review) => total + review.rating, 0);
    return sum / reviews.length;
  };

  const averageRating = calculateAverageRating();

  return (
    <div className="space-y-6">
      {/* Reviews Summary */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="text-4xl font-bold text-gray-900 dark:text-white">
            {averageRating > 0 ? averageRating.toFixed(1) : "0.0"}
          </div>
          <div className="flex-1">
            <StarRating value={Math.round(averageRating)} readonly />
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
            </p>
          </div>
        </div>
      </div>

      {/* User's Review Section */}
      {user && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Your Review</h3>
          </CardHeader>
          <CardContent>
            {userReview ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <StarRating value={userReview.rating} readonly />
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={openEditForm}
                    className="flex items-center gap-2"
                  >
                    <Edit className="h-4 w-4" />
                    Edit Review
                  </Button>
                </div>
                <p className="text-gray-700 dark:text-gray-300">{userReview.feedback}</p>
                <p className="text-sm text-gray-500">
                  Reviewed on {userReview.createdAt ? new Date(userReview.createdAt).toLocaleDateString() : "Unknown date"}
                </p>
              </div>
            ) : isEnrolled ? (
              <div className="text-center py-6">
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  You haven't reviewed this course yet.
                </p>
                <Button onClick={openNewReviewForm} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Write a Review
                </Button>
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-gray-600 dark:text-gray-400">
                  Enroll in this course to write a review.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Review Form Dialog */}
      <Dialog open={showReviewForm} onOpenChange={setShowReviewForm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Edit Your Review" : "Write a Review"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmitReview} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Rating
              </label>
              <StarRating value={rating} onChange={setRating} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Your Feedback
              </label>
              <Textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Share your experience with this course..."
                rows={4}
                required
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowReviewForm(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={reviewMutation.isPending}
              >
                {reviewMutation.isPending 
                  ? (isEditing ? "Updating..." : "Submitting...") 
                  : (isEditing ? "Update Review" : "Submit Review")
                }
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* All Reviews */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
          Student Reviews ({reviews.length})
        </h3>
        
        {reviewsLoading ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Loading reviews...</p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">
              No reviews yet. Be the first to review this course!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <Card key={review.id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                        {review.student?.avatar ? (
                          <img 
                            src={review.student.avatar} 
                            alt={`${review.student.firstName} ${review.student.lastName}`}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                            {review.student?.firstName?.[0] || "U"}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {review.student?.firstName && review.student?.lastName 
                            ? `${review.student.firstName} ${review.student.lastName}`
                            : "Anonymous User"
                          }
                        </h4>
                        <StarRating value={review.rating} readonly />
                        <span className="text-sm text-gray-500">
                          {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : "Unknown date"}
                        </span>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300">{review.feedback}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}