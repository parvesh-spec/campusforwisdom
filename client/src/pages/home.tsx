import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import CourseCard from "@/components/ui/course-card";
import SessionCard from "@/components/ui/session-card";
import TestimonialCard from "@/components/ui/testimonial-card";
import { ArrowRight, Play, Calendar, Users, Star, BookOpen, TrendingUp } from "lucide-react";
import { Link } from "wouter";
import { useEffect, useState } from "react";
import StudentLoginModal from "@/components/StudentLoginModal";
import type { Course, LiveSession, Testimonial, User } from "@shared/schema";

export default function Home() {
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Check URL params for login trigger
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('showLogin') === 'true') {
      setShowLoginModal(true);
      // Clean URL after opening modal
      window.history.replaceState({}, '', '/');
    }
  }, []);
  const { data: courses, isLoading: coursesLoading } = useQuery<Course[]>({
    queryKey: ["/api/courses"],
  });

  const { data: liveSessions, isLoading: sessionsLoading } = useQuery<LiveSession[]>({
    queryKey: ["/api/live-sessions"],
  });

  const { data: testimonials, isLoading: testimonialsLoading } = useQuery<(Testimonial & { student: User })[]>({
    queryKey: ["/api/testimonials"],
  });

  const { data: stats } = useQuery<{
    totalStudents: number;
    totalCourses: number;
    averageRating: number;
  }>({
    queryKey: ["/api/stats"],
  });

  const featuredCourses = courses?.slice(0, 3) || [];
  const upcomingSessions = liveSessions?.filter(s => s.status === "live" || s.status === "scheduled").slice(0, 2) || [];
  const featuredTestimonials = testimonials?.slice(0, 3) || [];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 via-white to-purple-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight">
                  Master <span className="gradient-text">AI Skills</span> 
                  for the Future
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed">
                  Learn to create software, videos, presentations and more using cutting-edge AI tools. 
                  Join live sessions with expert instructors and transform your career.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/courses">
                  <Button size="lg" className="bg-primary text-white hover:bg-primary/90 text-lg px-8 py-4">
                    <Play className="mr-2 h-5 w-5" />
                    Start Learning Today
                  </Button>
                </Link>
                <Link href="/live-sessions">
                  <Button size="lg" variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white text-lg px-8 py-4">
                    <Calendar className="mr-2 h-5 w-5" />
                    Book Live Session
                  </Button>
                </Link>
              </div>

              {/* Stats */}
              <div className="flex items-center space-x-8 pt-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">{stats?.totalStudents?.toLocaleString() || "0"}+</div>
                  <div className="text-sm text-gray-600">Students Trained</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">{stats?.totalCourses || "0"}+</div>
                  <div className="text-sm text-gray-600">AI Courses</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">{stats?.averageRating || "0"}/5</div>
                  <div className="text-sm text-gray-600">Average Rating</div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600" 
                alt="Students learning AI in modern classroom" 
                className="rounded-2xl shadow-2xl w-full h-auto"
              />
              
              {/* Floating UI elements */}
              <div className="absolute -top-4 -left-4 bg-white rounded-lg shadow-lg p-4 border border-gray-100">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-gray-700">Live Session</span>
                </div>
              </div>
              
              <div className="absolute -bottom-4 -right-4 bg-white rounded-lg shadow-lg p-4 border border-gray-100">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium text-gray-700">AI-Powered</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Courses Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Popular AI Courses</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Master the most in-demand AI skills with our comprehensive courses designed for beginners to advanced learners.
            </p>
          </div>

          {coursesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 rounded-xl h-64"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredCourses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link href="/courses">
              <Button size="lg" className="gradient-primary text-white hover:shadow-lg">
                View All Courses
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Live Sessions Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Live Learning Sessions</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Join interactive live sessions with industry experts and get real-time guidance on your AI learning journey.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              {sessionsLoading ? (
                [...Array(2)].map((_, i) => (
                  <div key={i} className="animate-pulse bg-gray-200 rounded-xl h-48"></div>
                ))
              ) : upcomingSessions.length > 0 ? (
                upcomingSessions.map((session) => (
                  <SessionCard key={session.id} session={session} />
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No upcoming sessions at the moment.</p>
                </div>
              )}

              <div className="gradient-primary rounded-xl p-6 text-white">
                <h3 className="text-xl font-bold mb-2">Want Personal Guidance?</h3>
                <p className="mb-4 opacity-90">Schedule a one-on-one session with our AI experts for personalized learning.</p>
                <Button variant="secondary" className="bg-white text-primary hover:bg-gray-100">
                  Schedule 1:1 Session
                </Button>
              </div>
            </div>

            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1531482615713-2afd69097998?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600" 
                alt="Interactive AI learning session" 
                className="rounded-2xl shadow-2xl w-full h-auto"
              />
              
              <div className="absolute top-4 left-4 glass-effect rounded-lg p-3 shadow-lg">
                <div className="flex items-center space-x-2">
                  <div className="text-red-500 text-lg animate-pulse">●</div>
                  <span className="font-semibold text-gray-900">Live: 45 participants</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Success Stories</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Hear from our students who transformed their careers with AI skills learned at CampusForWisdom.
            </p>
          </div>

          {testimonialsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse bg-gray-200 rounded-xl h-64"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredTestimonials.map((testimonial) => (
                <TestimonialCard key={testimonial.id} testimonial={testimonial} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Student Login Modal */}
      <StudentLoginModal 
        isOpen={showLoginModal} 
        onOpenChange={setShowLoginModal} 
      />
    </div>
  );
}
