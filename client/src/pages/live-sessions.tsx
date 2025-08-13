import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SessionCard from "@/components/ui/session-card";
import { Calendar, Clock, Users, Video } from "lucide-react";
import type { LiveSession } from "@shared/schema";

export default function LiveSessions() {
  const { data: sessions, isLoading } = useQuery<LiveSession[]>({
    queryKey: ["/api/live-sessions"],
  });

  const liveSessions = sessions?.filter(s => s.status === "live") || [];
  const upcomingSessions = sessions?.filter(s => s.status === "scheduled") || [];
  const completedSessions = sessions?.filter(s => s.status === "completed") || [];

  return (
    <div className="min-h-screen bg-gray-50 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Live Learning Sessions</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Join interactive live sessions with industry experts. Get real-time guidance, ask questions, and learn alongside fellow students.
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white rounded-xl p-6 text-center shadow-lg">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Video className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Interactive Learning</h3>
            <p className="text-gray-600">Engage directly with instructors and get your questions answered in real-time.</p>
          </div>
          <div className="bg-white rounded-xl p-6 text-center shadow-lg">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Community Learning</h3>
            <p className="text-gray-600">Learn alongside peers and build connections with fellow AI enthusiasts.</p>
          </div>
          <div className="bg-white rounded-xl p-6 text-center shadow-lg">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Clock className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Flexible Schedule</h3>
            <p className="text-gray-600">Sessions are scheduled at convenient times to fit your busy lifestyle.</p>
          </div>
        </div>

        {/* Sessions Tabs */}
        <Tabs defaultValue="live" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="live" className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span>Live Now ({liveSessions.length})</span>
            </TabsTrigger>
            <TabsTrigger value="upcoming">
              Upcoming ({upcomingSessions.length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed ({completedSessions.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="live" className="mt-8">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="animate-pulse bg-gray-200 rounded-xl h-64"></div>
                ))}
              </div>
            ) : liveSessions.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {liveSessions.map((session) => (
                  <SessionCard key={session.id} session={session} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">📹</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No live sessions right now</h3>
                <p className="text-gray-600 mb-6">
                  Check back later or browse our upcoming sessions to reserve your spot.
                </p>
                <Button>Browse Upcoming Sessions</Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="upcoming" className="mt-8">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="animate-pulse bg-gray-200 rounded-xl h-64"></div>
                ))}
              </div>
            ) : upcomingSessions.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {upcomingSessions.map((session) => (
                  <SessionCard key={session.id} session={session} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">📅</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No upcoming sessions scheduled</h3>
                <p className="text-gray-600 mb-6">
                  New sessions are added regularly. Sign up for notifications to stay updated.
                </p>
                <Button>Get Notified</Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed" className="mt-8">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="animate-pulse bg-gray-200 rounded-xl h-64"></div>
                ))}
              </div>
            ) : completedSessions.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {completedSessions.map((session) => (
                  <SessionCard key={session.id} session={session} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">✅</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No completed sessions yet</h3>
                <p className="text-gray-600 mb-6">
                  Recordings of completed sessions will appear here for review.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* CTA Section */}
        <div className="mt-20 bg-gradient-to-r from-primary to-secondary rounded-2xl p-8 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">Want to Host a Session?</h2>
          <p className="text-lg mb-6 opacity-90">
            Are you an AI expert? Share your knowledge with our community and help others learn.
          </p>
          <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-gray-100">
            Become an Instructor
          </Button>
        </div>
      </div>
    </div>
  );
}
