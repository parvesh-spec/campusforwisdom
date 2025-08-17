import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SessionCard from "@/components/ui/session-card";
import StudentLoginModal from "@/components/StudentLoginModal";
import { Calendar, Clock, Users, Video, LogIn } from "lucide-react";
import type { LiveSession, User } from "@shared/schema";

export default function LiveSessions() {
  const [viewMode, setViewMode] = useState<"all" | "my">("all");
  const [showLoginModal, setShowLoginModal] = useState(false);

  const { data: sessions, isLoading } = useQuery<LiveSession[]>({
    queryKey: ["/api/live-sessions"],
  });

  // Check if user is logged in as student
  const { data: user } = useQuery<User>({
    queryKey: ["/api/auth/student"],
  });

  const isLoggedIn = !!user;

  // Filter sessions based on view mode
  const filteredSessions = sessions?.filter(session => {
    if (viewMode === "my" && isLoggedIn) {
      // Show only sessions user has booked
      return (session as any).isBooked;
    }
    return true; // Show all sessions for "all" mode
  }) || [];

  const liveSessions = filteredSessions.filter(s => s.status === "live");
  const upcomingSessions = filteredSessions.filter(s => s.status === "scheduled");
  // Combine live and scheduled sessions for "upcoming" tab
  const allUpcomingSessions = [...liveSessions, ...upcomingSessions];
  const completedSessions = filteredSessions.filter(s => s.status === "completed");

  const handleMySessionsClick = () => {
    if (!isLoggedIn) {
      setShowLoginModal(true);
    } else {
      setViewMode("my");
    }
  };

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

        {/* View Mode Selection - Side by Side Buttons */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg p-1 shadow-md flex">
            <Button
              onClick={() => setViewMode("all")}
              variant={viewMode === "all" ? "default" : "ghost"}
              className="px-6 py-2 mr-1"
            >
              All Sessions
            </Button>
            <Button
              onClick={handleMySessionsClick}
              variant={viewMode === "my" ? "default" : "ghost"}
              className="px-6 py-2 flex items-center space-x-2"
            >
              {!isLoggedIn && <LogIn className="h-4 w-4" />}
              <span>My Sessions</span>
            </Button>
          </div>
        </div>

        {/* Login prompt for My Sessions when not logged in */}
        {viewMode === "my" && !isLoggedIn && (
          <div className="text-center py-16 bg-white rounded-xl shadow-lg mb-8">
            <div className="text-6xl mb-4">🔐</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Login Required</h3>
            <p className="text-gray-600 mb-6">
              Please login to view your registered sessions and participation history.
            </p>
            <Button onClick={() => setShowLoginModal(true)} className="flex items-center space-x-2">
              <LogIn className="h-4 w-4" />
              <span>Login Now</span>
            </Button>
          </div>
        )}

        {/* Sessions Tabs - Only show when user is logged in for My Sessions or always for All Sessions */}
        {(viewMode === "all" || (viewMode === "my" && isLoggedIn)) && (
          <Tabs defaultValue="upcoming" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upcoming">
                Upcoming ({allUpcomingSessions.length})
              </TabsTrigger>
              <TabsTrigger value="completed">
                Completed ({completedSessions.length})
              </TabsTrigger>
            </TabsList>



          <TabsContent value="upcoming" className="mt-8">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="animate-pulse bg-gray-200 rounded-xl h-64"></div>
                ))}
              </div>
            ) : allUpcomingSessions.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {allUpcomingSessions.map((session) => (
                  <SessionCard 
                    key={session.id} 
                    session={session} 
                    onLoginRequired={() => setShowLoginModal(true)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">📅</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {viewMode === "my" ? "No upcoming sessions in your schedule" : "No upcoming sessions scheduled"}
                </h3>
                <p className="text-gray-600 mb-6">
                  {viewMode === "my" 
                    ? "Register for sessions to see them here when they're scheduled." 
                    : "New sessions are added regularly. Sign up for notifications to stay updated."
                  }
                </p>
                {viewMode === "all" && <Button>Get Notified</Button>}
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
                  <SessionCard 
                    key={session.id} 
                    session={session}
                    onLoginRequired={() => setShowLoginModal(true)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">✅</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {viewMode === "my" ? "No completed sessions in your history" : "No completed sessions yet"}
                </h3>
                <p className="text-gray-600 mb-6">
                  {viewMode === "my" 
                    ? "Sessions you attend will appear here after completion with recordings and resources." 
                    : "Recordings of completed sessions will appear here for review."
                  }
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
        )}

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

        {/* Login Modal */}
        <StudentLoginModal 
          isOpen={showLoginModal} 
          onOpenChange={setShowLoginModal}
          onClose={() => setShowLoginModal(false)}
        />
      </div>
    </div>
  );
}
