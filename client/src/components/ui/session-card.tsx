import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Video, Users, Clock, IndianRupee, Star, Play } from "lucide-react";
import type { LiveSession, Expert } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";

interface SessionCardProps {
  session: LiveSession;
  onJoin?: (sessionId: string) => void;
  onBook?: (sessionId: string) => void;
}

export default function SessionCard({ session, onJoin, onBook }: SessionCardProps) {
  const isLive = session.status === "live";
  const isScheduled = session.status === "scheduled";
  const isCompleted = session.status === "completed";

  // Fetch expert details if expertId exists
  const { data: expert } = useQuery<Expert>({
    queryKey: [`/api/experts/${session.expertId}`],
    enabled: !!session.expertId,
  });

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
    <Card className="group relative bg-white shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
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
            
            {spotsLeft <= 5 && spotsLeft > 0 && (
              <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full font-medium">
                Only {spotsLeft} spots left!
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
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center text-gray-600">
              <Calendar className="h-4 w-4 mr-2 text-blue-500" />
              <span>{formatDate(session.scheduledAt)}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <Clock className="h-4 w-4 mr-2 text-green-500" />
              <span>{formatTime(session.scheduledAt)}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <Users className="h-4 w-4 mr-2 text-purple-500" />
              <span>{session.currentParticipants || 0}/{session.maxParticipants || 100} joined</span>
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
                  className="bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 shadow-lg transform transition-all duration-200 hover:scale-105"
                  onClick={() => onJoin?.(session.id)}
                >
                  <Play className="h-4 w-4 mr-2" />
                  Join Live
                </Button>
              ) : isScheduled ? (
                <Button 
                  className="bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-lg transform transition-all duration-200 hover:scale-105"
                  onClick={() => onBook?.(session.id)}
                  disabled={spotsLeft <= 0}
                >
                  {spotsLeft <= 0 ? "Fully Booked" : "Book Seat"}
                </Button>
              ) : (
                <Button variant="outline" disabled className="cursor-not-allowed">
                  {session.status === "completed" ? "Session Ended" : "Unavailable"}
                </Button>
              )}
              
              {isScheduled && spotsLeft > 0 && (
                <span className="text-xs text-gray-500">
                  {spotsLeft} spots available
                </span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
