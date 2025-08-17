import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowRight, 
  Play, 
  Calendar, 
  Users, 
  Star, 
  BookOpen, 
  TrendingUp,
  BrainCircuit,
  Video,
  Download,
  MessageSquare,
  Sparkles,
  Award,
  Clock,
  Globe,
  Target,
  Zap,
  Heart,
  ChevronRight
} from "lucide-react";
import { Link } from "wouter";
import { useEffect, useState } from "react";
import StudentLoginModal from "@/components/StudentLoginModal";
import type { Course, LiveSession, Testimonial, User, Expert, Ebook } from "@shared/schema";

export default function Home() {
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Check URL params for login trigger
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('showLogin') === 'true') {
      setShowLoginModal(true);
      window.history.replaceState({}, '', '/');
    }
  }, []);

  // Fetch all data
  const { data: courses, isLoading: coursesLoading } = useQuery<Course[]>({
    queryKey: ["/api/courses"],
  });

  const { data: liveSessions, isLoading: sessionsLoading } = useQuery<LiveSession[]>({
    queryKey: ["/api/live-sessions"],
  });

  const { data: experts, isLoading: expertsLoading } = useQuery<Expert[]>({
    queryKey: ["/api/experts"],
  });

  const { data: ebooks, isLoading: ebooksLoading } = useQuery<Ebook[]>({
    queryKey: ["/api/ebooks"],
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

  // Get featured items (2 each)
  const featuredCourses = courses?.slice(0, 2) || [];
  const featuredSessions = liveSessions?.filter(s => s.status === "scheduled" || s.status === "live").slice(0, 2) || [];
  const featuredExperts = experts?.slice(0, 2) || [];
  const featuredEbooks = ebooks?.slice(0, 2) || [];

  const features = [
    {
      icon: <BrainCircuit className="h-8 w-8 text-blue-600" />,
      title: "AI-Powered Learning",
      description: "Learn cutting-edge AI tools for software development, video creation, and presentation design"
    },
    {
      icon: <Video className="h-8 w-8 text-purple-600" />,
      title: "Live Expert Sessions",
      description: "Interactive sessions with industry experts and hands-on learning experiences"
    },
    {
      icon: <Target className="h-8 w-8 text-green-600" />,
      title: "Practical Projects",
      description: "Build real-world projects and portfolios that showcase your AI skills"
    },
    {
      icon: <Award className="h-8 w-8 text-orange-600" />,
      title: "Expert Mentorship",
      description: "Get personalized guidance from AI professionals through 1:1 consultations"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-blue-950 dark:to-indigo-950">
      {/* Hero Section with Animation */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-8">
            {/* Animated Badge */}
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 border border-blue-200 dark:border-blue-800 rounded-full px-6 py-2 animate-pulse">
              <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">AI Education Platform</span>
            </div>

            {/* Main Heading with Gradient */}
            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight">
                <span className="text-gray-900 dark:text-white">Master the Future with</span>
                <br />
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  AI Learning
                </span>
              </h1>
              <p className="text-xl lg:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
                Transform your career with comprehensive AI courses, live expert sessions, 
                and hands-on projects. Join thousands of learners mastering tomorrow's skills today.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/courses">
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                  <Play className="mr-2 h-5 w-5" />
                  Start Learning Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/live-sessions">
                <Button size="lg" variant="outline" className="border-2 border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-300">
                  <Calendar className="mr-2 h-5 w-5" />
                  Join Live Sessions
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-16">
              <div className="text-center">
                <div className="text-3xl lg:text-4xl font-bold text-blue-600 dark:text-blue-400">
                  {stats?.totalStudents || 0}+
                </div>
                <div className="text-gray-600 dark:text-gray-400 font-medium">Students</div>
              </div>
              <div className="text-center">
                <div className="text-3xl lg:text-4xl font-bold text-purple-600 dark:text-purple-400">
                  {stats?.totalCourses || 0}+
                </div>
                <div className="text-gray-600 dark:text-gray-400 font-medium">AI Courses</div>
              </div>
              <div className="text-center">
                <div className="text-3xl lg:text-4xl font-bold text-green-600 dark:text-green-400">
                  {experts?.length || 0}+
                </div>
                <div className="text-gray-600 dark:text-gray-400 font-medium">AI Experts</div>
              </div>
              <div className="text-center">
                <div className="text-3xl lg:text-4xl font-bold text-orange-600 dark:text-orange-400">
                  {stats?.averageRating || 4.8}★
                </div>
                <div className="text-gray-600 dark:text-gray-400 font-medium">Rating</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Why Choose CampusForWisdom?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Experience the most comprehensive AI education platform with cutting-edge tools and expert guidance
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                <CardHeader className="text-center pb-4">
                  <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 rounded-full flex items-center justify-center mb-4">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Courses Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Featured AI Courses
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300">
                Master AI skills with our comprehensive course library
              </p>
            </div>
            <Link href="/courses">
              <Button variant="outline" className="hidden md:flex items-center">
                View All Courses
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {featuredCourses.map((course) => (
              <Card key={course.id} className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] bg-white dark:bg-slate-800">
                <div className="relative h-48 bg-gradient-to-br from-blue-500 to-purple-600">
                  {course.thumbnail && (
                    <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                  )}
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-white/90 text-blue-600 hover:bg-white">
                      {course.level}
                    </Badge>
                  </div>
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-green-500 text-white">
                      {course.price}
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="secondary" className="text-xs">
                      {course.category}
                    </Badge>
                    <div className="flex items-center text-yellow-500">
                      <Star className="h-4 w-4 fill-current" />
                      <span className="text-sm ml-1">{course.rating}</span>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                    {course.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                    {course.shortDescription || course.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <Users className="h-4 w-4 mr-1" />
                      {course.studentsCount} students
                    </div>
                    <Link href={`/courses/${course.id}`}>
                      <Button size="sm">
                        Learn More
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-8 md:hidden">
            <Link href="/courses">
              <Button variant="outline">
                View All Courses
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Live Sessions Section */}
      <section className="py-20 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Live Learning Sessions
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300">
                Join interactive sessions with AI experts and learn in real-time
              </p>
            </div>
            <Link href="/live-sessions">
              <Button variant="outline" className="hidden md:flex items-center">
                View All Sessions
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {featuredSessions.map((session) => (
              <Card key={session.id} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] bg-white dark:bg-slate-800">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Badge className="bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
                      <Calendar className="h-3 w-3 mr-1" />
                      {session.status === 'live' ? 'Live Now' : 'Upcoming'}
                    </Badge>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(session.scheduledStart).toLocaleDateString()}
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                    {session.title}
                  </h3>
                  
                  <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                    {session.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {session.duration}min
                      </div>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        {session.currentParticipants}/{session.maxParticipants}
                      </div>
                    </div>
                    <Link href={`/webinar/${session.id}`}>
                      <Button size="sm" variant={session.status === 'live' ? 'default' : 'outline'}>
                        {session.status === 'live' ? 'Join Now' : 'Register'}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-8 md:hidden">
            <Link href="/live-sessions">
              <Button variant="outline">
                View All Sessions
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* AI Experts Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Meet Our AI Experts
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300">
                Learn from industry professionals with real-world AI experience
              </p>
            </div>
            <Link href="/ai-experts">
              <Button variant="outline" className="hidden md:flex items-center">
                View All Experts
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {featuredExperts.map((expert) => (
              <Card key={expert.id} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] bg-white dark:bg-slate-800">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                      {expert.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        {expert.name}
                      </h3>
                      <div className="flex items-center space-x-2 mb-3">
                        <Badge variant="secondary" className="text-xs">
                          {expert.specialization}
                        </Badge>
                        <div className="flex items-center text-yellow-500">
                          <Star className="h-4 w-4 fill-current" />
                          <span className="text-sm ml-1">{expert.rating}</span>
                        </div>
                      </div>
                      <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                        {expert.bio}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {expert.experience} experience
                        </div>
                        <Link href={`/experts/${expert.id}`}>
                          <Button size="sm">
                            View Profile
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-8 md:hidden">
            <Link href="/ai-experts">
              <Button variant="outline">
                View All Experts
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Ebooks Section */}
      <section className="py-20 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Featured AI Ebooks
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300">
                Download comprehensive guides and resources to accelerate your learning
              </p>
            </div>
            <Link href="/ebooks">
              <Button variant="outline" className="hidden md:flex items-center">
                View All Ebooks
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {featuredEbooks.map((ebook) => (
              <Card key={ebook.id} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] bg-white dark:bg-slate-800">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-20 h-28 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white flex-shrink-0">
                      <BookOpen className="h-8 w-8" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <Badge className="bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                          {ebook.category}
                        </Badge>
                        <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                          {ebook.price}
                        </div>
                      </div>
                      
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                        {ebook.title}
                      </h3>
                      
                      <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                        {ebook.description}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                          <div className="flex items-center">
                            <Download className="h-4 w-4 mr-1" />
                            {ebook.downloadCount || 0} downloads
                          </div>
                          <div className="flex items-center text-yellow-500">
                            <Star className="h-4 w-4 fill-current" />
                            <span className="ml-1">{ebook.rating}</span>
                          </div>
                        </div>
                        <Link href={`/ebooks/${ebook.id}`}>
                          <Button size="sm">
                            Download
                            <Download className="ml-2 h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-8 md:hidden">
            <Link href="/ebooks">
              <Button variant="outline">
                View All Ebooks
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600 text-white overflow-hidden">
            <CardContent className="p-12 relative">
              <div className="absolute inset-0 bg-grid-white/[0.1] bg-[size:30px_30px]" />
              <div className="relative">
                <div className="w-16 h-16 mx-auto bg-white/20 rounded-full flex items-center justify-center mb-6">
                  <Zap className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-3xl lg:text-4xl font-bold mb-6">
                  Ready to Transform Your Career with AI?
                </h2>
                <p className="text-xl mb-8 text-blue-100">
                  Join thousands of learners who are already mastering AI skills. 
                  Start your journey today with our comprehensive courses and expert guidance.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 font-semibold">
                    <Play className="mr-2 h-5 w-5" />
                    Start Learning Today
                  </Button>
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                    <MessageSquare className="mr-2 h-5 w-5" />
                    Talk to Expert
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

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