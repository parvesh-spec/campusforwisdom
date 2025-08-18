import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import CourseCard from "@/components/ui/course-card";
import StudentLoginModal from "@/components/StudentLoginModal";
import { Search, Filter, LogIn, BookOpen, Users, Clock, Award, Star, TrendingUp, Target, Zap, CheckCircle, Globe } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Course, User } from "@shared/schema";

export default function Courses() {
  const [viewMode, setViewMode] = useState<"all" | "my">("all");
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [levelFilter, setLevelFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: courses, isLoading } = useQuery<Course[]>({
    queryKey: ["/api/courses"],
  });

  // Check if user is logged in as student
  const { data: user } = useQuery<User>({
    queryKey: ["/api/auth/student"],
  });

  // Fetch user's enrolled courses if logged in
  const { data: userEnrolledCourses } = useQuery<Course[]>({
    queryKey: ["/api/student/enrollments"],
    enabled: !!user,
  });

  const isLoggedIn = !!user;

  // Enrollment mutation
  const enrollMutation = useMutation({
    mutationFn: async (courseId: string) => {
      const response = await fetch(`/api/enroll`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ courseId }),
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
        title: "Enrollment Successful!",
        description: "You have successfully enrolled in the course.",
      });
      // Refresh enrolled courses
      queryClient.invalidateQueries({ queryKey: ["/api/student/enrollments"] });
    },
    onError: (error: any) => {
      toast({
        title: "Enrollment Failed",
        description: error.message || "Failed to enroll in course. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Filter courses based on view mode
  const viewFilteredCourses = viewMode === "my" && isLoggedIn && userEnrolledCourses
    ? userEnrolledCourses // Show only enrolled courses
    : courses || []; // Show all courses for "all" mode

  const filteredCourses = viewFilteredCourses.filter((course) => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = levelFilter === "all" || course.level === levelFilter;
    const matchesCategory = categoryFilter === "all" || course.category === categoryFilter;
    
    return matchesSearch && matchesLevel && matchesCategory;
  });

  const handleMyCoursesClick = () => {
    if (!isLoggedIn) {
      setShowLoginModal(true);
    } else {
      setViewMode("my");
    }
  };

  const handleEnroll = (courseId: string) => {
    if (!isLoggedIn) {
      setShowLoginModal(true);
    } else {
      enrollMutation.mutate(courseId);
    }
  };

  // Check if user is enrolled in a course
  const isEnrolledInCourse = (courseId: string) => {
    if (!userEnrolledCourses) return false;
    return userEnrolledCourses.some(course => course.id === courseId);
  };

  const categories = Array.from(new Set(courses?.map(course => course.category) || []));

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-cyan-50 dark:from-slate-900 dark:via-blue-950 dark:to-indigo-950">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-24">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 border border-blue-200 dark:border-blue-800 rounded-full px-6 py-2 mb-6">
              <BookOpen className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Comprehensive AI Learning</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              <span className="text-gray-900 dark:text-white">Master AI with</span>
              <br />
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 bg-clip-text text-transparent">
                Expert-Led Courses
              </span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed mb-8">
              Transform your career with our comprehensive AI courses. From beginners to experts, 
              discover practical skills, real-world projects, and industry insights from top professionals.
            </p>
            
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-2xl lg:text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {courses?.length || 0}+
                </div>
                <div className="text-gray-600 dark:text-gray-400 font-medium">Courses</div>
              </div>
              <div className="text-center">
                <div className="text-2xl lg:text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                  50+
                </div>
                <div className="text-gray-600 dark:text-gray-400 font-medium">Hours</div>
              </div>
              <div className="text-center">
                <div className="text-2xl lg:text-3xl font-bold text-cyan-600 dark:text-cyan-400">
                  5000+
                </div>
                <div className="text-gray-600 dark:text-gray-400 font-medium">Students</div>
              </div>
              <div className="text-center">
                <div className="text-2xl lg:text-3xl font-bold text-blue-500 dark:text-blue-300">
                  4.8★
                </div>
                <div className="text-gray-600 dark:text-gray-400 font-medium">Rating</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Why Choose Our AI Courses?
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Experience world-class AI education with hands-on projects, expert mentorship, and industry-recognized certifications
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-full flex items-center justify-center mb-4 group-hover:scale-105 transition-transform duration-300">
                <Target className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Practical Projects</h3>
              <p className="text-gray-600 dark:text-gray-300">Build real-world AI applications with hands-on coding exercises and portfolio-worthy projects</p>
            </div>
            
            <div className="text-center group">
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-full flex items-center justify-center mb-4 group-hover:scale-105 transition-transform duration-300">
                <Users className="h-8 w-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Expert Instructors</h3>
              <p className="text-gray-600 dark:text-gray-300">Learn from industry professionals with years of experience in AI and machine learning</p>
            </div>
            
            <div className="text-center group">
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-full flex items-center justify-center mb-4 group-hover:scale-105 transition-transform duration-300">
                <Award className="h-8 w-8 text-cyan-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Certificates</h3>
              <p className="text-gray-600 dark:text-gray-300">Earn industry-recognized certificates upon completion to boost your career prospects</p>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">

        {/* View Mode Selection */}
        <div className="flex justify-center mb-8">
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-lg p-1 shadow-lg border border-blue-100 dark:border-blue-800 flex">
            <Button
              onClick={() => setViewMode("all")}
              variant={viewMode === "all" ? "default" : "ghost"}
              className={`px-6 py-2 mr-1 ${
                viewMode === "all" 
                  ? "bg-blue-600 hover:bg-blue-700 text-white" 
                  : "text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
              }`}
            >
              All Courses
            </Button>
            <Button
              onClick={handleMyCoursesClick}
              variant={viewMode === "my" ? "default" : "ghost"}
              className={`px-6 py-2 flex items-center space-x-2 ${
                viewMode === "my" 
                  ? "bg-blue-600 hover:bg-blue-700 text-white" 
                  : "text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
              }`}
            >
              {!isLoggedIn && <LogIn className="h-4 w-4" />}
              <span>My Courses</span>
            </Button>
          </div>
        </div>

        {/* Login prompt for My Courses when not logged in */}
        {viewMode === "my" && !isLoggedIn && (
          <div className="text-center py-16 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-blue-100 dark:border-blue-800 mb-8">
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-full flex items-center justify-center mb-6">
              <LogIn className="h-10 w-10 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Login Required</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Please login to view your enrolled courses and track your learning progress.
            </p>
            <Button 
              onClick={() => setShowLoginModal(true)} 
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white"
            >
              <LogIn className="h-4 w-4" />
              <span>Login Now</span>
            </Button>
          </div>
        )}

        {/* Filters - Only show when showing courses */}
        {(viewMode === "all" || (viewMode === "my" && isLoggedIn)) && (
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-blue-100 dark:border-blue-800 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400 h-4 w-4" />
              <Input
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-blue-200 dark:border-blue-700 focus:border-blue-500 dark:focus:border-blue-400"
              />
            </div>
            <Select value={levelFilter} onValueChange={setLevelFilter}>
              <SelectTrigger className="border-blue-200 dark:border-blue-700 focus:border-blue-500 dark:focus:border-blue-400">
                <SelectValue placeholder="All Levels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="border-blue-200 dark:border-blue-700 focus:border-blue-500 dark:focus:border-blue-400">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" className="flex items-center space-x-2 border-blue-200 dark:border-blue-700 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20">
              <Filter className="h-4 w-4" />
              <span>More Filters</span>
            </Button>
          </div>
        </div>
        )}

        {/* Course Grid - Only show when showing courses */}
        {(viewMode === "all" || (viewMode === "my" && isLoggedIn)) && (
        isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 rounded-xl h-96"></div>
              </div>
            ))}
          </div>
        ) : filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCourses.map((course) => (
              <CourseCard 
                key={course.id} 
                course={course} 
                onEnroll={handleEnroll}
                isEnrolled={isEnrolledInCourse(course.id)}
                isEnrolling={enrollMutation.isPending}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {viewMode === "my" ? "No enrolled courses found" : "No courses found"}
            </h3>
            <p className="text-gray-600 mb-6">
              {viewMode === "my" 
                ? "You haven't enrolled in any courses yet. Browse all courses to get started."
                : "Try adjusting your search criteria or browse all courses."
              }
            </p>
            <Button
              onClick={() => {
                if (viewMode === "my") {
                  setViewMode("all");
                } else {
                  setSearchTerm("");
                  setLevelFilter("all");
                  setCategoryFilter("all");
                }
              }}
            >
              {viewMode === "my" ? "Browse All Courses" : "Clear Filters"}
            </Button>
          </div>
        )
        )}

        {/* Learning Path Section */}
        <section className="mt-20 mb-16 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm rounded-2xl p-8 border border-blue-100 dark:border-blue-800">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Structured Learning Paths</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Follow our expertly designed curriculum to progress from beginner to AI professional
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-700">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">1</div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Beginner</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">Start with AI fundamentals and basic concepts</p>
              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                  <CheckCircle className="h-4 w-4 text-blue-600 mr-2" />
                  <span>AI Introduction</span>
                </div>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                  <CheckCircle className="h-4 w-4 text-blue-600 mr-2" />
                  <span>Python Basics</span>
                </div>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                  <CheckCircle className="h-4 w-4 text-blue-600 mr-2" />
                  <span>Data Analysis</span>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl p-6 border border-indigo-200 dark:border-indigo-700">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">2</div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Intermediate</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">Dive deeper into machine learning algorithms</p>
              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                  <CheckCircle className="h-4 w-4 text-indigo-600 mr-2" />
                  <span>Machine Learning</span>
                </div>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                  <CheckCircle className="h-4 w-4 text-indigo-600 mr-2" />
                  <span>Neural Networks</span>
                </div>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                  <CheckCircle className="h-4 w-4 text-indigo-600 mr-2" />
                  <span>Computer Vision</span>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 rounded-xl p-6 border border-cyan-200 dark:border-cyan-700">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-cyan-600 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">3</div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Advanced</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">Master cutting-edge AI technologies</p>
              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                  <CheckCircle className="h-4 w-4 text-cyan-600 mr-2" />
                  <span>Deep Learning</span>
                </div>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                  <CheckCircle className="h-4 w-4 text-cyan-600 mr-2" />
                  <span>LLMs & NLP</span>
                </div>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                  <CheckCircle className="h-4 w-4 text-cyan-600 mr-2" />
                  <span>AI Deployment</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <div className="mt-20 bg-gradient-to-br from-blue-600 via-indigo-600 to-cyan-600 rounded-2xl p-8 text-white text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-white/[0.1] bg-[size:30px_30px]" />
          <div className="relative">
            <div className="w-16 h-16 mx-auto bg-white/20 rounded-full flex items-center justify-center mb-6">
              <Zap className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold mb-4">Ready to Start Your AI Journey?</h2>
            <p className="text-lg mb-6 text-blue-100">
              Join thousands of students who are already transforming their careers with AI skills.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 font-semibold">
                <BookOpen className="mr-2 h-5 w-5" />
                Browse Courses
              </Button>
              <Button size="lg" className="bg-white/10 border-white text-white hover:bg-white hover:text-indigo-600 backdrop-blur-sm">
                <Users className="mr-2 h-5 w-5" />
                Join Community
              </Button>
            </div>
          </div>
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
