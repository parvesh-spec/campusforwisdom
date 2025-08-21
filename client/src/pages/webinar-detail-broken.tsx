import { useState, useEffect } from "react";
import { useParams, Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft, Calendar, Clock, Users, Video, CheckCircle, 
  Play, Star, IndianRupee, Globe
} from "lucide-react";
import type { LiveSession, Expert, WebinarEnrollment } from "@shared/schema";
import { PaymentButton } from "@/components/payment/PaymentButton";
import StudentLoginModal from "@/components/StudentLoginModal";

export default function WebinarDetail() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Check if user is logged in
  const { data: user } = useQuery({
    queryKey: ["/api/auth/student"],
    retry: false,
  });
  const isLoggedIn = !!user;

  // Fetch session details
  const { data: session, isLoading } = useQuery<LiveSession>({
    queryKey: [`/api/live-sessions/${sessionId}`],
    enabled: !!sessionId,
  });

  // Fetch expert details if available
  const { data: expert } = useQuery<Expert>({
    queryKey: [`/api/experts/${(session as any)?.expertId}`],
    enabled: !!(session as any)?.expertId,
  });

  // Check if user is enrolled
  const { data: userEnrollments } = useQuery<WebinarEnrollment[]>({
    queryKey: ["/api/student/webinar-enrollments"],
    enabled: isLoggedIn,
  });

  const isUserEnrolled = userEnrollments?.some(enrollment => enrollment.webinarId === sessionId);

  // Enrollment mutation
  const enrollMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      const response = await fetch(`/api/live-sessions/${sessionId}/enroll`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Enrollment failed');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Registration Successful!",
        description: "You have successfully registered for the session.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/student/webinar-enrollments"] });
    },
    onError: (error: any) => {
      const errorMessage = error.message || "Failed to register for session. Please try again.";
      
      if (errorMessage.includes("Payment required")) {
        toast({
          title: "Payment Required",
          description: "This is a paid session. Please complete payment to register.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Registration Failed",
          description: errorMessage,
          variant: "destructive",
        });
      }
    },
  });

  const handleEnroll = () => {
    if (!isLoggedIn) {
      setShowLoginModal(true);
    } else if (sessionId) {
      enrollMutation.mutate(sessionId);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading session details...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Session Not Found</h1>
          <p className="text-gray-600 mb-6">The session you're looking for doesn't exist.</p>
          <Link href="/live-sessions">
            <Button>Back to Sessions</Button>
          </Link>
        </div>
      </div>
    );
  }

  const isLive = session.status === "live";
  const price = session.price ? parseFloat(session.price) : 0;
  const spotsLeft = (session.maxParticipants || 100) - (session.currentParticipants || 0);
  const meetingLink = (session as any).meetingLink;

  const statusColors = {
    live: "bg-red-100 text-red-800 border-red-200",
    scheduled: "bg-blue-100 text-blue-800 border-blue-200", 
    completed: "bg-gray-100 text-gray-800 border-gray-200",
    cancelled: "bg-gray-100 text-gray-800 border-gray-200",
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-IN", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(date));
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(new Date(date));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link href="/live-sessions">
          <Button variant="ghost" className="mb-6 hover:bg-gray-100">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Sessions
          </Button>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Left Side */}
          <div className="lg:col-span-2 space-y-6">
            {/* Cover Image */}
            {(session as any).thumbnail && (
              <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-lg">
                <img 
                  src={(session as any).thumbnail} 
                  alt={session.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                
                {/* Live indicator overlay */}
                {isLive && (
                  <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full flex items-center space-x-2">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    <span className="text-sm font-medium">LIVE NOW</span>
                  </div>
                )}
              </div>
            )}

            {/* Title and Status */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3 flex-wrap">
                <Badge className={`${(statusColors as Record<string, string>)[session.status] || statusColors.scheduled} border`}>
                  {session.status === "live" ? (
                    <><Play className="w-3 h-3 mr-1" /> Live Now</>
                  ) : session.status === "scheduled" ? (
                    "Upcoming"
                  ) : (
                    session.status
                  )}
                </Badge>
                
                {isLive && (
                  <div className="flex items-center space-x-2 text-red-600">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    <span className="text-sm font-medium">LIVE NOW</span>
                  </div>
                )}
                
                {spotsLeft <= 10 && spotsLeft > 0 && (
                  <span className="text-sm text-orange-600 font-medium bg-orange-50 px-2 py-1 rounded-full">
                    Only {spotsLeft} seats left!
                  </span>
                )}
              </div>
              
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">{session.title}</h1>
              <p className="text-lg text-gray-600 leading-relaxed">{session.description}</p>
            </div>

            {/* Session Information */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Session Information</h2>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center text-gray-600">
                    <Calendar className="h-5 w-5 mr-2" />
                    <span className="font-medium">Date:</span>
                  </div>
                  <p className="text-gray-900 font-medium ml-7">
                    {formatDate(new Date(session.scheduledAt))}
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center text-gray-600">
                    <Clock className="h-5 w-5 mr-2" />
                    <span className="font-medium">Time:</span>
                  </div>
                  <p className="text-gray-900 font-medium ml-7">
                    {formatTime(new Date(session.scheduledAt))}
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center text-gray-600">
                    <Clock className="h-5 w-5 mr-2" />
                    <span className="font-medium">Duration:</span>
                  </div>
                  <p className="text-gray-900 font-medium ml-7">
                    {session.duration} minutes
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center text-gray-600">
                    <Users className="h-5 w-5 mr-2" />
                    <span className="font-medium">Participants:</span>
                  </div>
                  <p className="text-gray-900 font-medium ml-7">
                    {session.currentParticipants || 0}/{session.maxParticipants} enrolled
                  </p>
                </div>
              </div>
            </Card>

            {/* What You'll Learn */}
            {(session as any).whatYouWillLearn && (session as any).whatYouWillLearn.length > 0 && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                  What You'll Learn
                </h2>
                <ul className="space-y-3">
                  {(session as any).whatYouWillLearn.map((item: string, index: number) => (
                    <li key={index} className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            {/* Detailed Agenda */}
            {(session as any).agenda && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Detailed Agenda</h2>
                <div className="prose prose-gray max-w-none">
                  <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{(session as any).agenda}</p>
                </div>
              </Card>
            )}

            {/* Key Topics */}
            {(session as any).keyPoints && (session as any).keyPoints.length > 0 && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Key Topics Covered</h2>
                <ul className="space-y-3">
                  {(session as any).keyPoints.map((point: string, index: number) => (
                    <li key={index} className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                      <span className="text-gray-700">{point}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            {/* Prerequisites & Target Audience */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(session as any).prerequisites && (
                <Card className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Prerequisites</h2>
                  <p className="text-gray-700 leading-relaxed">{(session as any).prerequisites}</p>
                </Card>
              )}

              {(session as any).targetAudience && (
                <Card className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Who Should Attend</h2>
                  <p className="text-gray-700 leading-relaxed">{(session as any).targetAudience}</p>
                </Card>
              )}
            </div>

            {/* FAQ */}
            {(session as any).faq && (session as any).faq.length > 0 && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Frequently Asked Questions</h2>
                <div className="space-y-6">
                  {(session as any).faq.map((faqItem: any, index: number) => (
                    <div key={index} className="border-l-4 border-blue-500 pl-6 py-2">
                      <h3 className="font-semibold text-gray-900 mb-2">{faqItem.question}</h3>
                      <p className="text-gray-700 leading-relaxed">{faqItem.answer}</p>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Additional Session Metadata */}
            {((session as any).category || (session as any).difficulty || (session as any).language) && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Session Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {(session as any).category && (
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                      <div>
                        <p className="text-sm text-gray-500">Category</p>
                        <p className="font-medium text-gray-900">{(session as any).category}</p>
                      </div>
                    </div>
                  )}

                  {(session as any).difficulty && (
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full" />
                      <div>
                        <p className="text-sm text-gray-500">Difficulty Level</p>
                        <p className="font-medium text-gray-900">{(session as any).difficulty}</p>
                      </div>
                    </div>
                  )}

                  {(session as any).language && (
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <div>
                        <p className="text-sm text-gray-500">Language</p>
                        <p className="font-medium text-gray-900">{(session as any).language}</p>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            )}
          </div>

          {/* Sidebar - Right Side */}
          <div className="lg:col-span-1 space-y-6">
            {/* Your Expert */}
            {expert && (
              <Card className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Your Expert</h3>
                <div className="flex items-start space-x-4">
                  <img
                    src={expert.avatar || '/api/placeholder/80/80'}
                    alt={expert.name}
                    className="w-16 h-16 rounded-full object-cover border-2 border-blue-100"
                  />
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{expert.name}</h4>
                    <p className="text-blue-600 text-sm font-medium">{expert.specialization}</p>
                    {expert.experience && (
                      <p className="text-gray-600 text-sm mt-1">{expert.experience} years experience</p>
                    )}
                    {expert.rating && (
                      <div className="flex items-center mt-2">
                        <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                        <span className="text-sm font-medium text-gray-900 ml-1">{expert.rating}</span>
                      </div>
                    )}
                  </div>
                </div>
                {expert.bio && (
                  <p className="text-gray-600 text-sm mt-4 line-clamp-3">{expert.bio}</p>
                )}
              </Card>
            )}

            {/* Payment Info */}
            <Card className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Registration</h3>
              
              {/* Price */}
              <div className="mb-4">
                {price > 0 ? (
                  <div className="flex items-center space-x-2">
                    <IndianRupee className="h-6 w-6 text-green-600" />
                    <span className="text-3xl font-bold text-gray-900">₹{price}</span>
                    <span className="text-gray-500">per person</span>
                  </div>
                ) : (
                  <span className="text-3xl font-bold text-green-600">FREE</span>
                )}
              </div>

              {/* Enrollment Button */}
              {!isUserEnrolled ? (
                price > 0 ? (
                  <PaymentButton
                    type="webinar"
                    itemId={sessionId!}
                    amount={price}
                    title={session.title}
                    onSuccess={() => {
                      setTimeout(() => {
                        window.location.reload();
                      }, 3000);
                    }}
                    className="w-full"
                  >
                    {isLive ? "Join Live Session" : "Register Now"}
                  </PaymentButton>
                ) : (
                  <Button
                    onClick={handleEnroll}
                    disabled={enrollMutation.isPending}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    {enrollMutation.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Enrolling...
                      </>
                    ) : isLive ? (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Join Free Session
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Register Free
                      </>
                    )}
                  </Button>
                )
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-center p-3 bg-green-50 rounded-lg border border-green-200">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                    <span className="text-green-800 font-medium">You're Registered!</span>
                  </div>
                  {isLive && meetingLink && (
                    <Button
                      onClick={() => window.open(meetingLink, '_blank')}
                      className="w-full bg-red-600 hover:bg-red-700"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Join Live Session
                    </Button>
                  )}
                </div>
              )}
            </Card>

            {/* Session Stats */}
            <Card className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Session Stats</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Registered:</span>
                  <span className="font-semibold">{session.currentParticipants || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Max Capacity:</span>
                  <span className="font-semibold">{session.maxParticipants}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Seats Left:</span>
                  <span className={`font-semibold ${spotsLeft <= 10 ? 'text-orange-600' : 'text-green-600'}`}>
                    {spotsLeft}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-semibold">{session.duration} minutes</span>
                </div>
              </div>
            </Card>

            {/* Category Tags */}
            {(session as any).category && (
              <Card className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Category</h3>
                <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
                  {(session as any).category}
                </Badge>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Login Modal */}
      {showLoginModal && (
        <StudentLoginModal 
          isOpen={showLoginModal} 
          onOpenChange={(open) => setShowLoginModal(open)}
        />
      )}
    </div>
  );
}