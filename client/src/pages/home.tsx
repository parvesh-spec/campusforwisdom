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
  ChevronRight,
  CheckCircle
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
    queryKey: ["/api/featured/experts"],
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
  const featuredCourses = courses?.filter(c => (c as any).isFeatured).slice(0, 2) || [];
  const featuredWebinars = liveSessions?.filter(s => (s as any).isFeatured && (s.status === "scheduled" || s.status === "live")).slice(0, 2) || [];
  const featuredExperts = experts || []; // experts query already filtered for featured
  const featuredEbooks = ebooks?.filter(e => e.isFeatured).slice(0, 2) || [];

  const features = [
    {
      icon: <BrainCircuit className="h-8 w-8 text-blue-600" />,
      title: "AI-Powered Learning",
      description: "Learn cutting-edge AI tools for software development, video creation, and presentation design"
    },
    {
      icon: <Video className="h-8 w-8 text-blue-500" />,
      title: "Live Expert Sessions",
      description: "Interactive sessions with industry experts and hands-on learning experiences"
    },
    {
      icon: <Target className="h-8 w-8 text-indigo-600" />,
      title: "Practical Projects",
      description: "Build real-world projects and portfolios that showcase your AI skills"
    },
    {
      icon: <Award className="h-8 w-8 text-cyan-600" />,
      title: "Expert Mentorship",
      description: "Get personalized guidance from AI professionals through 1:1 consultations"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-cyan-50 dark:from-slate-900 dark:via-blue-950 dark:to-indigo-950">
      {/* Hero Section with Animation */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-8">
            {/* Animated Badge */}
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 border border-blue-200 dark:border-blue-800 rounded-full px-6 py-2 animate-pulse">
              <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">AI Education Platform</span>
            </div>

            {/* Main Heading with Gradient */}
            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight">
                <span className="text-gray-900 dark:text-white">Master the Future with</span>
                <br />
                <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 bg-clip-text text-transparent">
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
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                  <Play className="mr-2 h-5 w-5" />
                  Start Learning Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/live-sessions">
                <Button size="lg" variant="outline" className="border-2 border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-300 text-blue-600 dark:text-blue-400">
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
                <div className="text-3xl lg:text-4xl font-bold text-indigo-600 dark:text-indigo-400">
                  {stats?.totalCourses || 0}+
                </div>
                <div className="text-gray-600 dark:text-gray-400 font-medium">AI Courses</div>
              </div>
              <div className="text-center">
                <div className="text-3xl lg:text-4xl font-bold text-cyan-600 dark:text-cyan-400">
                  {experts?.length || 0}+
                </div>
                <div className="text-gray-600 dark:text-gray-400 font-medium">AI Experts</div>
              </div>
              <div className="text-center">
                <div className="text-3xl lg:text-4xl font-bold text-blue-500 dark:text-blue-300">
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
                  <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-full flex items-center justify-center mb-4">
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
                AI Courses
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
            {featuredCourses.map((course) => {
              const courseData = course as any;
              const levelColors = {
                beginner: "bg-emerald-100 text-emerald-800 border-emerald-200",
                intermediate: "bg-amber-100 text-amber-800 border-amber-200", 
                advanced: "bg-rose-100 text-rose-800 border-rose-200",
              };
              
              return (
                <Link key={course.id} href={`/courses/${course.id}`}>
                  <Card className="group bg-white shadow-md border border-gray-200 overflow-hidden hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 cursor-pointer">
                    {/* Course Image/Thumbnail */}
                    <div className="relative w-full h-72 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 overflow-hidden">
                      {courseData.thumbnail ? (
                        <img 
                          src={courseData.thumbnail} 
                          alt={course.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 flex items-center justify-center">
                          <div className="text-6xl text-white/80">
                            {(courseData.courseType || 'recorded') === 'live' ? '🎥' : '📚'}
                          </div>
                        </div>
                      )}
                      
                      {/* Course Type Badge */}
                      <div className="absolute top-3 left-3">
                        <Badge className={`${(courseData.courseType || 'recorded') === 'live' ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'} text-white border-0 flex items-center gap-1`}>
                          {(courseData.courseType || 'recorded') === 'live' ? (
                            <Calendar className="h-4 w-4" />
                          ) : (
                            <Play className="h-4 w-4" />
                          )}
                          <span className="capitalize">{courseData.courseType || 'recorded'}</span>
                        </Badge>
                      </div>

                      {/* Price Badge */}
                      <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm rounded-lg px-3 py-1">
                        <span className="text-lg font-bold text-gray-900">₹{course.price}</span>
                      </div>

                      {/* Rating */}
                      <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm rounded-lg px-2 py-1 flex items-center gap-1">
                        {parseFloat(course.rating || '0') > 0 ? (
                          <>
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm font-semibold text-gray-900">{course.rating}</span>
                          </>
                        ) : (
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className="h-3 w-3 text-gray-300" />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <CardContent className="p-6">
                      {/* Level and Category */}
                      <div className="flex items-center justify-between mb-3">
                        <Badge className={`${levelColors[course.level as keyof typeof levelColors]} border font-medium`}>
                          {course.level}
                        </Badge>
                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                          {course.category}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                        {course.title}
                      </h3>

                      {/* Short Description */}
                      <p className="text-gray-600 mb-4 line-clamp-2 text-sm leading-relaxed">
                        {courseData.shortDescription || course.description}
                      </p>

                      {/* Key Features */}
                      {courseData.whatYouWillLearn && courseData.whatYouWillLearn.length > 0 && (
                        <div className="mb-4">
                          <p className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1">
                            <BookOpen className="h-3 w-3" />
                            What you'll learn:
                          </p>
                          <ul className="text-xs text-gray-600 space-y-1">
                            {courseData.whatYouWillLearn.slice(0, 2).map((item: string, index: number) => (
                              <li key={index} className="flex items-start gap-2">
                                <span className="text-green-500 mt-1">✓</span>
                                <span className="line-clamp-1">{item}</span>
                              </li>
                            ))}
                            {courseData.whatYouWillLearn.length > 2 && (
                              <li className="text-gray-400 font-medium">
                                +{courseData.whatYouWillLearn.length - 2} more topics...
                              </li>
                            )}
                          </ul>
                        </div>
                      )}

                      {/* Course Stats */}
                      <div className="grid grid-cols-2 gap-3 mb-4 text-xs">
                        <div className="flex items-center gap-1 text-gray-600">
                          <Clock className="h-3 w-3" />
                          <span>{course.duration}</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-600">
                          <Users className="h-3 w-3" />
                          <span>{course.studentsCount || 0} students</span>
                        </div>
                        {courseData.totalLectures > 0 && (
                          <div className="flex items-center gap-1 text-gray-600">
                            <Play className="h-3 w-3" />
                            <span>{courseData.totalLectures} lectures</span>
                          </div>
                        )}
                        {courseData.certificateOfCompletion && (
                          <div className="flex items-center gap-1 text-gray-600">
                            <Award className="h-3 w-3" />
                            <span>Certificate</span>
                          </div>
                        )}
                      </div>

                      {/* Features */}
                      {(courseData.lifetimeAccess || courseData.certificateOfCompletion) && (
                        <div className="flex flex-wrap gap-1 mb-4">
                          {courseData.lifetimeAccess && (
                            <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                              Lifetime Access
                            </Badge>
                          )}
                          {courseData.certificateOfCompletion && (
                            <Badge variant="outline" className="text-xs bg-indigo-50 text-indigo-700 border-indigo-200">
                              Certificate
                            </Badge>
                          )}
                        </div>
                      )}

                      {/* Action Button */}
                      <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center justify-center gap-2 group-hover:shadow-lg transition-all">
                        <CheckCircle className="h-4 w-4" />
                        Enroll Now
                      </Button>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
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
            {featuredWebinars.map((session) => {
              const isLive = session.status === "live";
              const isScheduled = session.status === "scheduled";
              const sessionData = session as any;
              
              const formatDate = (date: Date | string) => {
                return new Intl.DateTimeFormat("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                }).format(new Date(date));
              };

              const formatTime = (date: Date | string) => {
                return new Intl.DateTimeFormat("en-IN", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                }).format(new Date(date));
              };

              const price = session.price ? parseFloat(session.price) : 0;
              const spotsLeft = (session.maxParticipants || 100) - (session.currentParticipants || 0);

              return (
                <Link key={session.id} href={`/webinar/${session.id}`}>
                  <Card className="group bg-white shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden cursor-pointer">
                    {/* Live indicator */}
                    {isLive && (
                      <div className="bg-gradient-to-r from-red-500 to-red-600 text-white text-center py-2">
                        <div className="flex items-center justify-center space-x-2">
                          <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                          <span className="text-sm font-medium">LIVE NOW</span>
                        </div>
                      </div>
                    )}

                    <CardContent className={`p-0 ${isLive ? '' : ''}`}>
                      {/* Cover Image */}
                      {sessionData.thumbnail ? (
                        <div className="relative w-full h-72 overflow-hidden">
                          <img 
                            src={sessionData.thumbnail} 
                            alt={session.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                        </div>
                      ) : (
                        <div className="relative w-full h-72 bg-gradient-to-br from-purple-500 via-blue-500 to-indigo-600 flex items-center justify-center overflow-hidden">
                          <div className="text-6xl text-white/80">🎥</div>
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                        </div>
                      )}

                      {/* Header Section */}
                      <div className="p-6 pb-4">
                        <div className="flex items-center justify-between mb-3">
                          <Badge className={`${
                            isLive ? 'bg-red-100 text-red-800 border-red-200' : 
                            'bg-blue-100 text-blue-800 border-blue-200'
                          } border`}>
                            {isLive ? (
                              <>
                                <Play className="w-3 h-3 mr-1" /> Live Now
                              </>
                            ) : (
                              "Upcoming"
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

                      {/* Expert/Instructor Section */}
                      {sessionData.expert && (
                        <div className="px-6 pb-4">
                          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                            <div className="relative">
                              <img
                                src={sessionData.expert.avatar || '/api/placeholder/40/40'}
                                alt={sessionData.expert.name}
                                className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
                              />
                              {sessionData.expert.isActive && (
                                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-900 truncate">{sessionData.expert.name}</p>
                              <p className="text-xs text-gray-500 truncate">{sessionData.expert.specialization}</p>
                              {sessionData.expert.rating && (
                                <div className="flex items-center mt-1">
                                  <Star className="w-3 h-3 text-yellow-400 fill-current" />
                                  <span className="text-xs text-gray-600 ml-1">{sessionData.expert.rating}</span>
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
                            <span>{session.duration} min</span>
                          </div>
                        </div>
                      </div>

                      {/* Price and Action */}
                      <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            {price > 0 ? (
                              <>
                                <span className="text-2xl font-bold text-gray-900">₹{price}</span>
                                <span className="text-sm text-gray-500">per person</span>
                              </>
                            ) : (
                              <span className="text-2xl font-bold text-blue-600">FREE</span>
                            )}
                          </div>
                          
                          <Button 
                            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-lg transform transition-all duration-200 hover:scale-105"
                          >
                            {isLive ? (
                              <>
                                <Play className="h-4 w-4 mr-2" />
                                Join Live
                              </>
                            ) : (
                              <>
                                <Users className="h-4 w-4 mr-2" />
                                Book Seat
                              </>
                            )}
                          </Button>
                        </div>
                        
                        {isScheduled && spotsLeft > 0 && spotsLeft <= 20 && (
                          <div className="mt-2 text-center">
                            <span className="text-xs text-gray-500">
                              {spotsLeft} seats available
                            </span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
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
            {featuredExperts.map((expert) => {
              const expertData = expert as any;
              
              return (
                <Link key={expert.id} href={`/experts/${expert.id}`}>
                  <Card className="group border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] bg-white overflow-hidden cursor-pointer">
                    <CardContent className="p-0">
                      {/* Expert Header with Background */}
                      <div className="relative bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 p-6 text-white">
                        <div className="flex items-start space-x-4">
                          <div className="relative">
                            {expertData.avatar ? (
                              <img
                                src={expertData.avatar}
                                alt={expert.name}
                                className="w-20 h-20 rounded-full object-cover border-4 border-white/20 shadow-lg"
                              />
                            ) : (
                              <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white font-bold text-2xl border-4 border-white/20">
                                {expert.name.charAt(0)}
                              </div>
                            )}
                            {expertData.isActive && (
                              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-4 border-white rounded-full"></div>
                            )}
                          </div>
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-100 transition-colors">
                              {expert.name}
                            </h3>
                            <div className="flex items-center space-x-2 mb-3">
                              <Badge className="bg-white/20 text-white border-white/30 text-xs">
                                {expert.specialization}
                              </Badge>
                              <div className="flex items-center text-yellow-300">
                                <Star className="h-4 w-4 fill-current" />
                                <span className="text-sm ml-1 font-medium">{expertData.rating || "0.0"}</span>
                              </div>
                            </div>
                            <p className="text-white/90 text-sm">
                              {expert.experience} experience
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Expert Details */}
                      <div className="p-6">
                        <p className="text-gray-600 mb-4 line-clamp-3 leading-relaxed">
                          {expert.bio}
                        </p>

                        {/* Skills/Expertise */}
                        {expertData.skills && expertData.skills.length > 0 && (
                          <div className="mb-4">
                            <div className="flex flex-wrap gap-2">
                              {expertData.skills.slice(0, 3).map((skill: string, index: number) => (
                                <Badge key={index} variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                                  {skill}
                                </Badge>
                              ))}
                              {expertData.skills.length > 3 && (
                                <Badge variant="outline" className="text-xs text-gray-500">
                                  +{expertData.skills.length - 3} more
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Stats */}
                        <div className="grid grid-cols-4 gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
                          <div className="text-center">
                            <div className="text-sm font-bold text-gray-900">
                              {expertData.hourlyRate ? `₹${expertData.hourlyRate}/hr` : 'Free'}
                            </div>
                            <div className="text-xs text-gray-500">Consultation</div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm font-bold text-gray-900">
                              {expertData.totalSessions || 0}
                            </div>
                            <div className="text-xs text-gray-500">Sessions</div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm font-bold text-gray-900">
                              {expertData.totalCourses || 0}
                            </div>
                            <div className="text-xs text-gray-500">Courses</div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm font-bold text-gray-900">
                              {expertData.totalEbooks || 0}
                            </div>
                            <div className="text-xs text-gray-500">Ebooks</div>
                          </div>
                        </div>

                        {/* Action Button */}
                        <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold group-hover:shadow-lg transition-all">
                          <MessageSquare className="mr-2 h-4 w-4" />
                          Book Consultation
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
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
            {featuredEbooks.map((ebook) => {
              const ebookData = ebook as any;
              
              return (
                <Link key={ebook.id} href={`/ebooks/${ebook.id}`}>
                  <Card className="group border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] bg-white overflow-hidden cursor-pointer">
                    <CardContent className="p-0">
                      {/* Ebook Cover */}
                      <div className="relative w-full h-72 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 overflow-hidden">
                        {ebookData.coverImage ? (
                          <img 
                            src={ebookData.coverImage} 
                            alt={ebook.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-emerald-500 via-blue-500 to-purple-600 flex items-center justify-center relative">
                            {/* Book mockup design */}
                            <div className="relative w-32 h-44 bg-white rounded-lg shadow-2xl transform rotate-3 group-hover:rotate-6 transition-transform duration-300">
                              <div className="absolute inset-2 bg-gradient-to-br from-blue-400 to-purple-600 rounded-md flex items-center justify-center">
                                <BookOpen className="h-12 w-12 text-white" />
                              </div>
                              <div className="absolute bottom-2 left-2 right-2">
                                <div className="h-1 bg-white/60 rounded mb-1"></div>
                                <div className="h-1 bg-white/40 rounded w-3/4"></div>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {/* Category Badge */}
                        <div className="absolute top-3 left-3">
                          <Badge className="bg-blue-100 text-blue-700 border-blue-200 font-medium">
                            {ebook.category}
                          </Badge>
                        </div>

                        {/* Price Badge */}
                        <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm rounded-lg px-3 py-1">
                          <span className="text-lg font-bold text-gray-900">
                            {ebook.price === "0" ? "FREE" : `₹${ebook.price}`}
                          </span>
                        </div>

                        {/* Rating */}
                        <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm rounded-lg px-2 py-1 flex items-center gap-1">
                          {parseFloat(ebook.rating || '0') > 0 ? (
                            <>
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              <span className="text-sm font-semibold text-gray-900">{ebook.rating}</span>
                            </>
                          ) : (
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className="h-3 w-3 text-gray-300" />
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Ebook Details */}
                      <div className="p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                          {ebook.title}
                        </h3>

                        <p className="text-gray-600 mb-4 line-clamp-3 text-sm leading-relaxed">
                          {ebookData.shortDescription || ebookData.summary || 'No description available'}
                        </p>

                        {/* Ebook Info */}
                        <div className="grid grid-cols-2 gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <Download className="h-4 w-4 text-gray-500" />
                            <span className="text-sm text-gray-700 font-medium">
                              {ebookData.downloadCount || 0} downloads
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <BookOpen className="h-4 w-4 text-gray-500" />
                            <span className="text-sm text-gray-700 font-medium">
                              {ebookData.pageCount || 'PDF'} pages
                            </span>
                          </div>
                        </div>

                        {/* Topics/Tags */}
                        {ebookData.tags && ebookData.tags.length > 0 && (
                          <div className="mb-4">
                            <div className="flex flex-wrap gap-2">
                              {ebookData.tags.slice(0, 3).map((tag: string, index: number) => (
                                <Badge key={index} variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                                  {tag}
                                </Badge>
                              ))}
                              {ebookData.tags.length > 3 && (
                                <Badge variant="outline" className="text-xs text-gray-500">
                                  +{ebookData.tags.length - 3} more
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Action Button */}
                        <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold group-hover:shadow-lg transition-all">
                          <Download className="mr-2 h-4 w-4" />
                          Download Now
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
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
          <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-cyan-600 text-white overflow-hidden">
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
                  <Link href="/ebooks">
                    <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 font-semibold">
                      <BookOpen className="mr-2 h-5 w-5" />
                      Download eBooks
                    </Button>
                  </Link>
                  <Link href="/live-sessions">
                    <Button size="lg" className="bg-white/10 border-white text-white hover:bg-white hover:text-indigo-600 backdrop-blur-sm">
                      <Video className="mr-2 h-5 w-5" />
                      Join Live Sessions
                    </Button>
                  </Link>
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