import { useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Calendar, Clock, Video, Users, IndianRupee, Star, Play, UserPlus, ExternalLink, ArrowLeft, CheckCircle, Info, User, Target, BookOpen, Globe, Award, X } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Link } from "wouter";
import type { LiveSession, Expert } from "@shared/schema";
import StudentLoginModal from "@/components/StudentLoginModal";
import { PaymentButton } from "@/components/payment/PaymentButton";

export default function WebinarDetail() {
  const { sessionId } = useParams();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isBooking, setIsBooking] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Fetch session details
  const { data: session, isLoading, error } = useQuery<LiveSession>({
    queryKey: [`/api/live-sessions/${sessionId}`],
    enabled: !!sessionId,
  });

  // Check authentication status
  const { data: studentUser } = useQuery({
    queryKey: ["/api/auth/student"],
    retry: false,
  });

  // Fetch expert details if expertId exists
  const { data: expert } = useQuery<Expert>({
    queryKey: [`/api/experts/${session?.expertId}`],
    enabled: !!session?.expertId,
  });

  // Book session mutation
  const bookSessionMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", `/api/student/live-sessions/${sessionId}/book`, {});
    },
    onSuccess: (data) => {
      toast({
        title: "Success!",
        description: "Session booked successfully! Check your email for meeting details.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/live-sessions/${sessionId}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/live-sessions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/student/live-sessions"] });
      setIsBooking(false);
    },
    onError: (error: any) => {
      console.error("Booking error:", error);
      toast({
        title: "Booking Failed",
        description: error.message || "Failed to book session. Please try again.",
        variant: "destructive",
      });
      setIsBooking(false);
    },
  });

  const handleBookSession = async () => {
    if (!studentUser) {
      setShowLoginModal(true);
      return;
    }

    const spotsLeft = (session?.maxParticipants || 100) - (session?.currentParticipants || 0);
    if (spotsLeft <= 0) {
      toast({
        title: "Session Full",
        description: "This session is fully booked.",
        variant: "destructive",
      });
      return;
    }

    setIsBooking(true);
    bookSessionMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Webinar Not Found</h2>
          <p className="text-gray-600 mb-4">The webinar you're looking for doesn't exist or has been removed.</p>
          <Link href="/live-sessions">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Sessions
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const isLive = session.status === "live";
  const isScheduled = session.status === "scheduled";
  const isCompleted = session.status === "completed";
  const price = session.price ? parseFloat(session.price) : 0;
  const spotsLeft = (session.maxParticipants || 100) - (session.currentParticipants || 0);

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

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Session Header */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
              {/* Session Image */}
              <div className="relative w-full aspect-video bg-gradient-to-br from-purple-500 via-blue-500 to-indigo-600">
                {(session as any).thumbnail ? (
                  <img 
                    src={(session as any).thumbnail} 
                    alt={session.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-8xl text-white/80">🎥</div>
                  </div>
                )}
                
                {/* Live indicator overlay */}
                {isLive && (
                  <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full flex items-center space-x-2">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    <span className="text-sm font-medium">LIVE NOW</span>
                  </div>
                )}
              </div>
              
              {/* Session Info */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <Badge className={`${(statusColors as Record<string, string>)[session.status] || statusColors.scheduled} border`}>
                      {session.status === "live" ? (
                        <><Play className="w-3 h-3 mr-1" /> Live Now</>
                      ) : session.status === "scheduled" ? (
                        "Upcoming"
                      ) : (
                        session.status
                      )}
                    </Badge>
                    
                    {spotsLeft <= 10 && spotsLeft > 0 && (
                      <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full font-medium">
                        Only {spotsLeft} seats left!
                      </span>
                    )}
                  </div>
                </div>
                
                <h1 className="text-3xl font-bold text-gray-900 mb-3">{session.title}</h1>
                <p className="text-lg text-gray-600 leading-relaxed">{session.description}</p>
              </div>
            </div>
            
            {/* Main Content */}
            <div className="space-y-6">
              {/* Session Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Info className="h-5 w-5 mr-2 text-blue-600" />
                  Session Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-blue-500" />
                    <div>
                      <p className="text-sm text-gray-500">Date</p>
                      <p className="font-medium">{formatDate(session.scheduledAt)}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-green-500" />
                    <div>
                      <p className="text-sm text-gray-500">Time</p>
                      <p className="font-medium">{formatTime(session.scheduledAt)}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Video className="h-4 w-4 text-indigo-500" />
                    <div>
                      <p className="text-sm text-gray-500">Duration</p>
                      <p className="font-medium">{session.duration} minutes</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-purple-500" />
                    <div>
                      <p className="text-sm text-gray-500">Spots Left</p>
                      <p className="font-medium">{spotsLeft}</p>
                    </div>
                  </div>
                </div>

                {/* Additional metadata */}
                {(session as any).category && (
                  <div className="flex items-center space-x-2">
                    <BookOpen className="h-4 w-4 text-blue-500" />
                    <div>
                      <p className="text-sm text-gray-500">Category</p>
                      <p className="font-medium">{(session as any).category}</p>
                    </div>
                  </div>
                )}

                {(session as any).difficulty && (
                  <div className="flex items-center space-x-2">
                    <Award className="h-4 w-4 text-orange-500" />
                    <div>
                      <p className="text-sm text-gray-500">Difficulty Level</p>
                      <p className="font-medium">{(session as any).difficulty}</p>
                    </div>
                  </div>
                )}

                {(session as any).language && (
                  <div className="flex items-center space-x-2">
                    <Globe className="h-4 w-4 text-green-500" />
                    <div>
                      <p className="text-sm text-gray-500">Language</p>
                      <p className="font-medium">{(session as any).language}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Detailed Agenda */}
            {(session as any).agenda && (
              <Card>
                <CardHeader>
                  <CardTitle>Detailed Agenda</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 whitespace-pre-wrap">{(session as any).agenda}</p>
                </CardContent>
              </Card>
            )}

            {/* What You'll Learn */}
            {(session as any).whatYouWillLearn && (session as any).whatYouWillLearn.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                    What You'll Learn
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {(session as any).whatYouWillLearn.map((item: string, index: number) => (
                      <li key={index} className="flex items-start space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Key Points */}
            {(session as any).keyPoints && (session as any).keyPoints.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Key Topics</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {(session as any).keyPoints.map((point: string, index: number) => (
                      <li key={index} className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                        <span className="text-gray-700">{point}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* FAQ */}
            {(session as any).faq && (session as any).faq.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Frequently Asked Questions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {(session as any).faq.map((faqItem: any, index: number) => (
                    <div key={index} className="border-l-4 border-blue-500 pl-4">
                      <h4 className="font-semibold text-gray-900 mb-1">{faqItem.question}</h4>
                      <p className="text-gray-700">{faqItem.answer}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Prerequisites & Target Audience */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(session as any).prerequisites && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Prerequisites</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 whitespace-pre-wrap">{(session as any).prerequisites}</p>
                  </CardContent>
                </Card>
              )}

              {(session as any).targetAudience && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center text-lg">
                      <Target className="h-4 w-4 mr-2" />
                      Target Audience
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 whitespace-pre-wrap">{(session as any).targetAudience}</p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Resources */}
            {(session as any).resources && (session as any).resources.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Additional Resources</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {(session as any).resources.map((resource: string, index: number) => (
                      <li key={index}>
                        <a
                          href={resource}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 underline flex items-center space-x-1"
                        >
                          <ExternalLink className="h-3 w-3" />
                          <span>{resource}</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Expert Info */}
            {expert && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    Your Expert
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start gap-4 mb-6">
                    <div className="flex-shrink-0">
                      {expert.avatar ? (
                        <img 
                          src={expert.avatar} 
                          alt={expert.name}
                          className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-lg font-semibold text-blue-600">
                            {expert.name.charAt(0)}
                          </span>
                        </div>
                      )}
                      {expert.isActive && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full" />
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-gray-900 mb-1">{expert.name}</h4>
                      <p className="text-blue-600 font-medium mb-3">{expert.specialization}</p>
                      
                      {/* Rating */}
                      {expert.rating && (
                        <div className="flex items-center gap-2 mb-3">
                          <div className="flex items-center">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-4 w-4 ${
                                  star <= Math.round(Number(expert.rating) || 0)
                                    ? "fill-yellow-400 text-yellow-400" 
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-gray-600">
                            {Number(expert.rating).toFixed(1)} rating
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Bio */}
                  {expert.bio && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-700 leading-relaxed">{expert.bio}</p>
                    </div>
                  )}

                  {/* Experience */}
                  {expert.experience && (
                    <div className="mb-4">
                      <h5 className="font-medium text-gray-900 mb-2">Experience</h5>
                      <p className="text-sm text-gray-700">{expert.experience} years</p>
                    </div>
                  )}

                  {/* Skills */}
                  {expert.skills && expert.skills.length > 0 && (
                    <div className="mb-4">
                      <h5 className="font-medium text-gray-900 mb-2">Skills</h5>
                      <div className="flex flex-wrap gap-2">
                        {expert.skills.slice(0, 4).map((skill, index) => (
                          <span 
                            key={index}
                            className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-md border border-blue-200"
                          >
                            {skill}
                          </span>
                        ))}
                        {expert.skills.length > 4 && (
                          <span className="px-2 py-1 bg-gray-50 text-gray-600 text-xs rounded-md border border-gray-200">
                            +{expert.skills.length - 4} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}


                </CardContent>
              </Card>
            )}

            {/* Action Card */}
            <Card className="sticky top-6">
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  <div>
                    {price > 0 ? (
                      <div className="flex items-center justify-center space-x-2">
                        <IndianRupee className="h-6 w-6 text-green-600" />
                        <span className="text-2xl font-bold text-gray-900">₹{price}</span>
                        <span className="text-gray-500">per person</span>
                      </div>
                    ) : (
                      <span className="text-2xl font-bold text-green-600">FREE</span>
                    )}
                  </div>

                  {isLive ? (
                    // For live sessions, show different buttons based on user registration status
                    (session as any).isBooked ? (
                      // If user is already registered, allow them to join
                      <Button 
                        className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 shadow-lg"
                        size="lg"
                        onClick={() => {
                          if ((session as any).registrationLink) {
                            window.open((session as any).registrationLink, '_blank');
                          }
                        }}
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Join Live Session
                      </Button>
                    ) : (
                      // If user is not registered, registration is closed for live sessions
                      <Button 
                        variant="outline"
                        disabled 
                        className="w-full"
                        size="lg"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Registration Closed
                      </Button>
                    )
                  ) : isScheduled ? (
                    (session as any).isBooked ? (
                      <div className="space-y-2">
                        <Button 
                          variant="outline"
                          className="w-full border-green-600 text-green-700 bg-green-50"
                          disabled
                          size="lg"
                        >
                          ✓ Booked
                        </Button>
                        {(session as any).registrationLink && (
                          <Button
                            variant="ghost"
                            className="w-full text-blue-600 hover:text-blue-800"
                            onClick={() => window.open((session as any).registrationLink, '_blank')}
                          >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Join Meeting
                          </Button>
                        )}
                      </div>
                    ) : (
                      // Check if session requires payment
                      session.price && parseFloat(session.price as string) > 0 && studentUser ? (
                        <PaymentButton
                          type="webinar"
                          itemId={session.id}
                          amount={parseFloat(session.price as string)}
                          title={session.title}
                          disabled={spotsLeft <= 0}
                          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-lg"
                          onSuccess={() => {
                            queryClient.invalidateQueries({ queryKey: [`/api/live-sessions/${sessionId}`] });
                            queryClient.invalidateQueries({ queryKey: ["/api/live-sessions"] });
                            queryClient.invalidateQueries({ queryKey: ["/api/student/live-sessions"] });
                          }}
                        >
                          {spotsLeft <= 0 ? "Fully Booked" : (
                            <>
                              <UserPlus className="h-4 w-4 mr-2" />
                              Pay ₹{session.price} & Book
                            </>
                          )}
                        </PaymentButton>
                      ) : (
                        <Button 
                          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-lg"
                          onClick={handleBookSession}
                          disabled={spotsLeft <= 0 || isBooking}
                          size="lg"
                        >
                          {isBooking ? (
                            <>
                              <div className="animate-spin w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full" />
                              Booking...
                            </>
                          ) : spotsLeft <= 0 ? (
                            "Fully Booked"
                          ) : !studentUser ? (
                            <>
                              <UserPlus className="h-4 w-4 mr-2" />
                              Login to Book
                            </>
                          ) : (
                            <>
                              <UserPlus className="h-4 w-4 mr-2" />
                              Book Your Seat
                            </>
                          )}
                        </Button>
                      )
                    )
                  ) : (
                    <Button variant="outline" disabled className="w-full" size="lg">
                      {session.status === "completed" ? "Session Ended" : "Unavailable"}
                    </Button>
                  )}

                  {isScheduled && spotsLeft > 0 && (
                    <p className="text-sm text-gray-500">
                      {spotsLeft} seats available
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Tags */}
            {(session as any).tags && (session as any).tags.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Tags</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {(session as any).tags.map((tag: string, index: number) => (
                      <Badge key={index} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
            </div>
          </div>
        </div>
      </div>

      {/* Login Modal */}
      {showLoginModal && (
        <StudentLoginModal 
          isOpen={showLoginModal} 
          onClose={() => setShowLoginModal(false)} 
        />
      )}
    </div>
  );
}