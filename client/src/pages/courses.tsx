import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import CourseCard from "@/components/ui/course-card";
import StudentLoginModal from "@/components/StudentLoginModal";
import { Search, Filter, LogIn } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Link } from "wouter";
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
    <div className="min-h-screen bg-gray-50 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">AI Courses</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Explore our comprehensive collection of AI courses designed to help you master the latest technologies and advance your career.
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
              All Courses
            </Button>
            <Button
              onClick={handleMyCoursesClick}
              variant={viewMode === "my" ? "default" : "ghost"}
              className="px-6 py-2 flex items-center space-x-2"
            >
              {!isLoggedIn && <LogIn className="h-4 w-4" />}
              <span>My Courses</span>
            </Button>
          </div>
        </div>

        {/* Login prompt for My Courses when not logged in */}
        {viewMode === "my" && !isLoggedIn && (
          <div className="text-center py-16 bg-white rounded-xl shadow-lg mb-8">
            <div className="text-6xl mb-4">🔐</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Login Required</h3>
            <p className="text-gray-600 mb-6">
              Please login to view your enrolled courses and track your learning progress.
            </p>
            <Button onClick={() => setShowLoginModal(true)} className="flex items-center space-x-2">
              <LogIn className="h-4 w-4" />
              <span>Login Now</span>
            </Button>
          </div>
        )}

        {/* Filters - Only show when showing courses */}
        {(viewMode === "all" || (viewMode === "my" && isLoggedIn)) && (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={levelFilter} onValueChange={setLevelFilter}>
              <SelectTrigger>
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
              <SelectTrigger>
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
            <Button variant="outline" className="flex items-center space-x-2">
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

        {/* CTA Section */}
        <div className="mt-20 bg-gradient-to-r from-primary to-secondary rounded-2xl p-8 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">Want to Learn More About AI?</h2>
          <p className="text-lg mb-6 opacity-90">
            Download our free eBooks and get expert insights on AI tools, techniques, and industry trends.
          </p>
          <Link href="/ebooks">
            <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-gray-100">
              Explore Free eBooks
            </Button>
          </Link>
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
