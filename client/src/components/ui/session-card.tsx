import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Video, Users } from "lucide-react";
import type { LiveSession } from "@shared/schema";

interface SessionCardProps {
  session: LiveSession;
  onJoin?: (sessionId: string) => void;
  onBook?: (sessionId: string) => void;
}

export default function SessionCard({ session, onJoin, onBook }: SessionCardProps) {
  const isLive = session.status === "live";
  const isScheduled = session.status === "scheduled";
  const isCompleted = session.status === "completed";

  const statusColors = {
    live: "bg-red-100 text-red-800",
    scheduled: "bg-blue-100 text-blue-800",
    completed: "bg-gray-100 text-gray-800",
    cancelled: "bg-gray-100 text-gray-800",
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(date));
  };

  return (
    <Card className="bg-white shadow-lg border border-gray-100">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`w-4 h-4 rounded-full ${isLive ? "bg-red-500 animate-pulse" : "bg-blue-500"}`} />
            <span className="text-lg font-semibold text-gray-900">
              {isLive ? "Live Session" : "Session"}
            </span>
          </div>
          <Badge className={statusColors[session.status]}>
            {session.status === "live" ? "Live Now" : 
             session.status === "scheduled" ? "Upcoming" : 
             session.status}
          </Badge>
        </div>
        
        <h3 className="text-xl font-bold text-gray-900 mb-2">{session.title}</h3>
        <p className="text-gray-600 mb-4 line-clamp-2">{session.description}</p>
        
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm text-gray-500 flex items-center">
            <Calendar className="h-4 w-4 mr-1" />
            {formatDate(session.scheduledAt)}
          </div>
          <div className="text-sm text-gray-500 flex items-center">
            <Users className="h-4 w-4 mr-1" />
            {session.currentParticipants}/{session.maxParticipants}
          </div>
        </div>
        
        <div className="flex justify-end">
          {isLive ? (
            <Button 
              className="bg-red-500 text-white hover:bg-red-600"
              onClick={() => onJoin?.(session.id)}
            >
              <Video className="h-4 w-4 mr-2" />
              Join Live
            </Button>
          ) : isScheduled ? (
            <Button 
              className="bg-primary text-white hover:bg-primary/90"
              onClick={() => onBook?.(session.id)}
            >
              Book Seat
            </Button>
          ) : (
            <Button variant="outline" disabled>
              {session.status === "completed" ? "Completed" : "Unavailable"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
