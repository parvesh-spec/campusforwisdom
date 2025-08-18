import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import StudentLoginModal from "@/components/StudentLoginModal";
import { Search, Star, Clock, Users, Calendar, LogIn, MessageCircle, BookOpen, Video } from "lucide-react";
import { Link, useLocation } from "wouter";
import type { Expert, User } from "@shared/schema";

export default function AIExperts() {
  const [viewMode, setViewMode] = useState<"all" | "my">("all");
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [specializationFilter, setSpecializationFilter] = useState<string>("all");

  const { data: experts, isLoading } = useQuery<Expert[]>({
    queryKey: ["/api/experts"],
  });

  // Check if user is logged in as student
  const { data: user } = useQuery<User>({
    queryKey: ["/api/auth/student"],
  });

  // Fetch user's consultations if logged in
  const { data: userConsultations = [] } = useQuery<any[]>({
    queryKey: ["/api/student/consultations"],
    enabled: !!user,
  });

  const isLoggedIn = !!user;

  // Filter experts based on view mode
  const viewFilteredExperts = experts?.filter(expert => {
    if (viewMode === "my" && isLoggedIn && userConsultations) {
      // Show only experts user has consultations with
      const consultedExpertIds = userConsultations.map((consultation: any) => consultation.expertId);
      return consultedExpertIds.includes(expert.id);
    }
    return true; // Show all experts for "all" mode
  }) || [];

  const filteredExperts = viewFilteredExperts.filter((expert) => {
    const matchesSearch = expert.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         expert.bio.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (expert.skills || []).some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesSpecialization = specializationFilter === "all" || expert.specialization === specializationFilter;
    
    return matchesSearch && matchesSpecialization && expert.isActive;
  });

  const specializations = Array.from(new Set(experts?.map(expert => expert.specialization) || []));

  const handleMyExpertsClick = () => {
    if (!isLoggedIn) {
      setShowLoginModal(true);
    } else {
      setViewMode("my");
    }
  };

  const handleBookConsultation = (expertId: string) => {
    if (!isLoggedIn) {
      setShowLoginModal(true);
    } else {
      // TODO: Open booking modal
      console.log("Book consultation with expert:", expertId);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">AI Experts</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Connect with world-class AI experts for personalized 1-to-1 consultations. Get expert guidance tailored to your specific needs and goals.
          </p>
        </div>

        {/* View Mode Selection */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg p-1 shadow-md flex">
            <Button
              onClick={() => setViewMode("all")}
              variant={viewMode === "all" ? "default" : "ghost"}
              className="px-6 py-2 mr-1"
            >
              All Experts
            </Button>
            <Button
              onClick={handleMyExpertsClick}
              variant={viewMode === "my" ? "default" : "ghost"}
              className="px-6 py-2 flex items-center space-x-2"
            >
              {!isLoggedIn && <LogIn className="h-4 w-4" />}
              <span>My Experts</span>
            </Button>
          </div>
        </div>

        {/* Login prompt for My Experts when not logged in */}
        {viewMode === "my" && !isLoggedIn && (
          <div className="text-center py-16 bg-white rounded-xl shadow-lg mb-8">
            <div className="text-6xl mb-4">🔐</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Login Required</h3>
            <p className="text-gray-600 mb-6">
              Please login to view your expert consultations and manage your bookings.
            </p>
            <Button onClick={() => setShowLoginModal(true)} className="flex items-center space-x-2">
              <LogIn className="h-4 w-4" />
              <span>Login Now</span>
            </Button>
          </div>
        )}

        {/* Filters - Only show when showing experts */}
        {(viewMode === "all" || (viewMode === "my" && isLoggedIn)) && (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search experts, skills..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={specializationFilter} onValueChange={setSpecializationFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Specializations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Specializations</SelectItem>
                {specializations.map((specialization) => (
                  <SelectItem key={specialization} value={specialization}>
                    {specialization}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        )}

        {/* Experts Grid - Only show when showing experts */}
        {(viewMode === "all" || (viewMode === "my" && isLoggedIn)) && (
        isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <Card className="h-96">
                  <CardHeader>
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                      <div className="space-y-2 flex-1">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="h-3 bg-gray-200 rounded"></div>
                      <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                      <div className="h-8 bg-gray-200 rounded"></div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        ) : filteredExperts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredExperts.map((expert) => (
              <Link key={expert.id} href={`/experts/${expert.id}`}>
                <Card className="hover:shadow-xl transition-shadow duration-300 cursor-pointer h-full">
                  <CardHeader>
                    <div className="flex items-start space-x-4">
                    <Avatar className="w-16 h-16">
                      <AvatarImage src={expert.avatar || ""} alt={expert.name} />
                      <AvatarFallback>{expert.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <CardTitle className="text-lg">{expert.name}</CardTitle>
                      <CardDescription className="text-sm text-primary font-medium">
                        {expert.specialization}
                      </CardDescription>
                      <div className="flex items-center space-x-2 mt-2">
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium">{expert.rating}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Users className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{expert.totalSessions} sessions</span>
                        </div>
                      </div>
                    </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600 line-clamp-3">{expert.bio}</p>
                  
                  <div className="space-y-3">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Skills</h4>
                      <div className="flex flex-wrap gap-1">
                        {(expert.skills || []).slice(0, 3).map((skill, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {(expert.skills || []).length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{(expert.skills || []).length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{expert.experience} experience</span>
                      </div>
                      
                      {/* Available Services */}
                      <div className="flex flex-wrap gap-1">
                        {expert.consultationEnabled && expert.hourlyRate && expert.hourlyRate !== "0" && (
                          <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                            <MessageCircle className="h-3 w-3 mr-1" />
                            Consultations
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                          <BookOpen className="h-3 w-3 mr-1" />
                          eBooks
                        </Badge>
                        <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                          <Video className="h-3 w-3 mr-1" />
                          Sessions
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {viewMode === "my" ? "No expert consultations found" : "No experts found"}
            </h3>
            <p className="text-gray-600 mb-6">
              {viewMode === "my" 
                ? "You haven't booked any consultations yet. Browse all experts to get started."
                : "Try adjusting your search criteria or browse all experts."
              }
            </p>
            <Button
              onClick={() => {
                if (viewMode === "my") {
                  setViewMode("all");
                } else {
                  setSearchTerm("");
                  setSpecializationFilter("all");
                }
              }}
            >
              {viewMode === "my" ? "Browse All Experts" : "Clear Filters"}
            </Button>
          </div>
        )
        )}

        {/* CTA Section */}
        <div className="mt-20 bg-gradient-to-r from-primary to-secondary rounded-2xl p-8 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">Join Live Learning Sessions</h2>
          <p className="text-lg mb-6 opacity-90">
            Participate in interactive live sessions with our expert instructors and learn alongside other students.
          </p>
          <Button 
            size="lg" 
            variant="secondary" 
            className="bg-white text-primary hover:bg-gray-100"
            onClick={() => window.location.href = '/live-sessions'}
          >
            View Live Sessions
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