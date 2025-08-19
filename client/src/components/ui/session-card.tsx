import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Video, Users, Clock, IndianRupee, Star, Play, UserPlus, ExternalLink } from "lucide-react";
import type { LiveSession, Expert } from "@shared/schema";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Link } from "wouter";
import { PaymentButton } from "@/components/payment/PaymentButton";

interface SessionCardProps {
  session: LiveSession & { 
    expert?: Expert;
    isBooked?: boolean;
    registrationLink?: string | null;
  };
  onJoin?: (sessionId: string) => void;
  onBook?: (sessionId: string) => void;
  onLoginRequired?: () => void;
  showBooking?: boolean;
}

export default function SessionCard({ session, onJoin, onBook, onLoginRequired, showBooking = true }: SessionCardProps) {
  const [isBooking, setIsBooking] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const isLive = session.status === "live";
  const isScheduled = session.status === "scheduled";
  const isCompleted = session.status === "completed";

  // Check authentication status
  const { data: studentUser } = useQuery({
    queryKey: ["/api/auth/student"],
    retry: false,
  });

  // Fetch expert details if expertId exists
  const { data: expert } = useQuery<Expert>({
    queryKey: [`/api/experts/${session.expertId}`],
    enabled: !!session.expertId,
  });

  // Book session mutation
  const bookSessionMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", `/api/student/live-sessions/${session.id}/book`, {});
    },
    onSuccess: (data) => {
      toast({
        title: "Success!",
        description: "Session booked successfully! Check your email for meeting details.",
      });
      // Invalidate and refetch sessions
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
      if (onLoginRequired) {
        onLoginRequired();
      } else {
        toast({
          title: "Login Required",
          description: "Please login to book a session.",
          variant: "destructive",
        });
        // Redirect to login page as fallback
        window.location.href = '/auth/login';
      }
      return;
    }

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

  const statusColors = {
    live: "bg-red-100 text-red-800 border-red-200",
    scheduled: "bg-blue-100 text-blue-800 border-blue-200", 
    completed: "bg-gray-100 text-gray-800 border-gray-200",
    cancelled: "bg-gray-100 text-gray-800 border-gray-200",
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-IN", {
      day: "numeric",
      month: "short",
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

  const price = session.price ? parseFloat(session.price) : 0;
  const spotsLeft = (session.maxParticipants || 100) - (session.currentParticipants || 0);

  return (
    <div className="group relative">
      <Link href={`/webinar/${session.id}`} className="block">
        <Card className="bg-white shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden cursor-pointer">
          {/* Live indicator */}
          {isLive && (
            <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-red-500 to-red-600 text-white text-center py-2 z-10">
              <div className="flex items-center justify-center space-x-2">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                <span className="text-sm font-medium">LIVE NOW</span>
              </div>
            </div>
          )}

          <CardContent className={`p-0 ${isLive ? 'pt-12' : ''}`}>
            {/* Cover Image */}
            {(session as any).thumbnail && (
              <div className="relative w-full h-96 overflow-hidden">
                <img 
                  src={(session as any).thumbnail} 
                  alt={session.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </div>
            )}

            {/* Header Section */}
            <div className="p-6 pb-4">
              <div className="flex items-center justify-between mb-3">
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
              
              <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                {session.title}
              </h3>
              
              <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
                {session.description}
              </p>
            </div>

            {/* Expert Section */}
            {expert && (
              <div className="px-6 pb-4">
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="relative">
                <img
                  src={expert.avatar || '/api/placeholder/40/40'}
                  alt={expert.name}
                  className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
                />
                {expert.isActive && (
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{expert.name}</p>
                <p className="text-xs text-gray-500 truncate">{expert.specialization}</p>
                {expert.rating && (
                  <div className="flex items-center mt-1">
                    <Star className="w-3 h-3 text-yellow-400 fill-current" />
                    <span className="text-xs text-gray-600 ml-1">{expert.rating}</span>
                  </div>
                )}
                </div>
                </div>
              </div>
            )}

            {/* Session Details */}
            <div className="px-6 pb-4">
              <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="flex items-center text-gray-600">
              <Calendar className="h-4 w-4 mr-2 text-blue-500" />
              <span>{formatDate(session.scheduledAt)}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <Clock className="h-4 w-4 mr-2 text-green-500" />
              <span>{formatTime(session.scheduledAt)}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <Video className="h-4 w-4 mr-2 text-indigo-500" />
              <span>{session.duration} minutes</span>
              </div>
              </div>
            </div>

            {/* Price and Action */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {price > 0 ? (
                    <>
                      <IndianRupee className="h-5 w-5 text-green-600" />
                      <span className="text-2xl font-bold text-gray-900">₹{price}</span>
                      <span className="text-sm text-gray-500">per person</span>
                    </>
                  ) : (
                    <span className="text-2xl font-bold text-green-600">FREE</span>
                  )}
                </div>
                
                <div className="flex flex-col items-end space-y-2">
              {isLive ? (
                <Button 
                  disabled
                  className="bg-gray-300 text-gray-600 cursor-not-allowed"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Registration Closed
                </Button>
              ) : isCompleted ? (
                <Button 
                  disabled
                  className="bg-gray-300 text-gray-600 cursor-not-allowed"
                >
                  Session Ended
                </Button>
              ) : isScheduled && showBooking ? (
                session.isBooked ? (
                  <div className="flex flex-col items-end space-y-1">
                    <Button 
                      variant="outline"
                      className="border-green-600 text-green-700 bg-green-50 hover:bg-green-100"
                      disabled
                    >
                      ✓ Booked
                    </Button>
                    {session.registrationLink && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-blue-600 hover:text-blue-800 h-6 px-2 text-xs"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (session.registrationLink) {
                            window.open(session.registrationLink, '_blank');
                          }
                        }}
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Join Meeting
                      </Button>
                    )}
                  </div>
                ) : (
                  price > 0 && studentUser ? (
                    <PaymentButton
                      type="webinar"
                      itemId={session.id}
                      amount={price}
                      title={session.title}
                      disabled={spotsLeft <= 0}
                      className="bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-lg transform transition-all duration-200 hover:scale-105"
                      onSuccess={() => {
                        queryClient.invalidateQueries({ queryKey: ["/api/live-sessions"] });
                        queryClient.invalidateQueries({ queryKey: ["/api/student/live-sessions"] });
                      }}
                    >
                      {spotsLeft <= 0 ? "Fully Booked" : `Pay ₹${price} & Book`}
                    </PaymentButton>
                  ) : (
                    <Button 
                      className="bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-lg transform transition-all duration-200 hover:scale-105"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleBookSession();
                      }}
                      disabled={spotsLeft <= 0 || isBooking}
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
                          Book Seat
                        </>
                      )}
                    </Button>
                  )
                )
              ) : (
                <Button variant="outline" disabled className="cursor-not-allowed">
                  {session.status === "completed" ? "Session Ended" : "Unavailable"}
                </Button>
                )}
                
                {isScheduled && spotsLeft > 0 && spotsLeft <= 20 && (
                  <span className="text-xs text-gray-500">
                    {spotsLeft} seats available
                  </span>
                )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    </div>
  );
}
