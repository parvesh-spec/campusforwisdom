import { useState } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { 
  Star, 
  Clock, 
  Users, 
  BookOpen, 
  Award, 
  Play, 
  Calendar, 
  CheckCircle,
  Download,
  Smartphone,
  Globe,
  MessageCircle,
  ArrowLeft,
  PlayCircle
} from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Course, User, CourseReview, Expert } from "@shared/schema";
import StudentLoginModal from "@/components/StudentLoginModal";
import CourseReviewsSection from "@/components/CourseReviewsSection";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { PaymentButton } from "@/components/payment/PaymentButton";

export default function CourseDetail() {
  const { courseId } = useParams<{ courseId: string }>();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch course details
  const { data: course, isLoading } = useQuery<Course>({
    queryKey: [`/api/courses/${courseId}`],
    enabled: !!courseId,
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

  // Fetch expert details if course has expertId
  const { data: expert } = useQuery<Expert>({
    queryKey: [`/api/experts/${course?.expertId}`],
    enabled: !!course?.expertId,
  });

  // Fetch expert reviews to calculate actual rating
  const { data: expertReviews } = useQuery<any[]>({
    queryKey: [`/api/experts/${course?.expertId}/reviews`],
    enabled: !!course?.expertId,
  });

  const isLoggedIn = !!user;
  const isEnrolled = userEnrolledCourses?.some((enrolledCourse: Course) => enrolledCourse.id === courseId);

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
      const errorMessage = error.message || "Failed to enroll in course. Please try again.";
      
      // Check if payment is required
      if (errorMessage.includes("Payment required")) {
        toast({
          title: "Payment Required",
          description: "This is a paid course. Please complete payment to enroll.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Enrollment Failed",
          description: errorMessage,
          variant: "destructive",
        });
      }
    },
  });

  const handleEnroll = () => {
    if (!isLoggedIn) {
      setShowLoginModal(true);
    } else if (courseId) {
      enrollMutation.mutate(courseId);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading course details...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Course Not Found</h1>
          <p className="text-gray-600 mb-6">The course you're looking for doesn't exist.</p>
          <Link href="/courses">
            <Button>Back to Courses</Button>
          </Link>
        </div>
      </div>
    );
  }

  const courseData = course as any;
  const levelColors = {
    beginner: "bg-emerald-100 text-emerald-800 border-emerald-200",
    intermediate: "bg-amber-100 text-amber-800 border-amber-200", 
    advanced: "bg-rose-100 text-rose-800 border-rose-200",
  };

  return (
    <div className="min-h-screen bg-gray-50 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link href="/courses">
          <Button variant="ghost" className="mb-6 hover:bg-gray-100">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Courses
          </Button>
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Course Header */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
              {/* Course Image */}
              <div className="relative h-64 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600">
                {courseData.thumbnail ? (
                  <img 
                    src={courseData.thumbnail} 
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-8xl text-white/80">
                      {courseData.courseType === 'live' ? '🎥' : '📚'}
                    </div>
                  </div>
                )}
                
                {/* Course Type Badge */}
                <div className="absolute top-4 left-4">
                  <Badge className={`${courseData.courseType === 'live' ? 'bg-red-500' : 'bg-blue-500'} text-white border-0 flex items-center gap-1`}>
                    {courseData.courseType === 'live' ? <Calendar className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    <span className="capitalize">{courseData.courseType || 'recorded'}</span>
                  </Badge>
                </div>
              </div>

              {/* Course Info */}
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Badge className={`${levelColors[course.level as keyof typeof levelColors]} border font-medium`}>
                    {course.level}
                  </Badge>
                  <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                    {course.category}
                  </span>
                  <div className="flex items-center text-yellow-500 ml-auto">
                    <Star className="h-4 w-4 fill-current" />
                    <span className="ml-1 text-sm font-semibold text-gray-900">{course.rating || '0.0'}</span>
                  </div>
                </div>

                <h1 className="text-3xl font-bold text-gray-900 mb-4">{course.title}</h1>
                <p className="text-lg text-gray-600 mb-6">{course.shortDescription || course.description}</p>

                {/* Course Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <Clock className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-xs text-gray-500">Duration</p>
                      <p className="font-semibold text-gray-900">{course.duration}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <Users className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-xs text-gray-500">Students</p>
                      <p className="font-semibold text-gray-900">{course.studentsCount || 0}</p>
                    </div>
                  </div>
                  {courseData.totalLectures > 0 && (
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                      <PlayCircle className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="text-xs text-gray-500">Lectures</p>
                        <p className="font-semibold text-gray-900">{courseData.totalLectures}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <BookOpen className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-xs text-gray-500">Level</p>
                      <p className="font-semibold text-gray-900 capitalize">{course.level}</p>
                    </div>
                  </div>
                </div>

                {/* Features */}
                <div className="flex flex-wrap gap-2">
                  {courseData.certificateOfCompletion && (
                    <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                      <Award className="h-3 w-3 mr-1" />
                      Certificate of Completion
                    </Badge>
                  )}
                  {courseData.lifetimeAccess && (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      Lifetime Access
                    </Badge>
                  )}
                  {courseData.mobileAccess && (
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      <Smartphone className="h-3 w-3 mr-1" />
                      Mobile Access
                    </Badge>
                  )}
                  {courseData.downloadableContent && (
                    <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                      <Download className="h-3 w-3 mr-1" />
                      Downloadable
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Course Content Tabs */}
            <Card>
              <CardContent className="p-6">
                <Tabs defaultValue="overview" className="w-full">
                  <div className="w-full overflow-x-auto scrollbar-hide">
                    <TabsList className="inline-flex w-max min-w-full gap-1 sm:gap-2 p-1">
                      <TabsTrigger value="overview" className="whitespace-nowrap px-3 py-2 text-sm">Overview</TabsTrigger>
                      <TabsTrigger value="curriculum" className="whitespace-nowrap px-3 py-2 text-sm">Curriculum</TabsTrigger>
                      <TabsTrigger value="instructor" className="whitespace-nowrap px-3 py-2 text-sm">Instructor</TabsTrigger>
                      <TabsTrigger value="faq" className="whitespace-nowrap px-3 py-2 text-sm">FAQ</TabsTrigger>
                      <TabsTrigger value="reviews" className="whitespace-nowrap px-3 py-2 text-sm">Reviews</TabsTrigger>
                    </TabsList>
                  </div>

                  <TabsContent value="overview" className="mt-6 space-y-6">
                    {/* What You'll Learn */}
                    {courseData.whatYouWillLearn?.length > 0 && (
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-4">What you'll learn</h3>
                        <div className="grid md:grid-cols-2 gap-3">
                          {courseData.whatYouWillLearn.map((item: string, index: number) => (
                            <div key={index} className="flex items-start gap-3">
                              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                              <span className="text-gray-700">{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <Separator />

                    {/* Course Description */}
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Course Description</h3>
                      <p className="text-gray-700 leading-relaxed">{course.description}</p>
                    </div>

                    {/* Requirements */}
                    {courseData.courseRequirements && (
                      <>
                        <Separator />
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900 mb-4">Requirements</h3>
                          <p className="text-gray-700">{courseData.courseRequirements}</p>
                        </div>
                      </>
                    )}

                    {/* Target Audience */}
                    {courseData.targetAudience && (
                      <>
                        <Separator />
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900 mb-4">Who this course is for</h3>
                          <p className="text-gray-700">{courseData.targetAudience}</p>
                        </div>
                      </>
                    )}
                  </TabsContent>

                  <TabsContent value="curriculum" className="mt-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Course Curriculum</h3>
                    {courseData.courseCurriculum?.length > 0 ? (
                      <div className="space-y-4">
                        {courseData.courseCurriculum.map((section: any, index: number) => (
                          <div key={index} className="border border-gray-200 rounded-lg">
                            <div className="p-4 bg-gray-50 border-b border-gray-200">
                              <h4 className="font-semibold text-gray-900">
                                Section {index + 1}: {section.sectionTitle}
                              </h4>
                            </div>
                            <div className="p-4">
                              {section.lectures?.map((lecture: any, lectureIndex: number) => (
                                <div key={lectureIndex} className="flex items-center justify-between py-2">
                                  <div className="flex items-center gap-3">
                                    <PlayCircle className="h-4 w-4 text-gray-400" />
                                    <span className="text-gray-700">{lecture.title}</span>
                                  </div>
                                  {lecture.duration && (
                                    <span className="text-sm text-gray-500">{lecture.duration} min</span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">Curriculum details will be available soon.</p>
                    )}
                  </TabsContent>

                  <TabsContent value="instructor" className="mt-6">
                    <InstructorSection course={course} expert={expert} expertReviews={expertReviews} />
                  </TabsContent>

                  <TabsContent value="faq" className="mt-6">
                    <FAQSection course={course} />
                  </TabsContent>

                  <TabsContent value="reviews" className="space-y-6">
                    <CourseReviewsSection courseId={courseId!} isEnrolled={isEnrolled} />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardContent className="p-6">
                {/* Price */}
                <div className="text-center mb-6">
                  <div className="text-3xl font-bold text-gray-900 mb-2">₹{course.price}</div>
                  <p className="text-sm text-gray-500">One-time payment</p>
                </div>

                {/* Enroll Button */}
                {course.price && parseFloat(course.price.toString()) > 0 && !isEnrolled && isLoggedIn ? (
                  <PaymentButton
                    type="course"
                    itemId={courseId!}
                    amount={parseFloat(course.price.toString())}
                    title={course.title}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold mb-4"
                    onSuccess={() => {
                      queryClient.invalidateQueries({ queryKey: ["/api/student/enrollments"] });
                    }}
                  />
                ) : (
                  <Button 
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold mb-4"
                    size="lg"
                    onClick={handleEnroll}
                    disabled={isEnrolled}
                  >
                    {isEnrolled ? "Already Enrolled" : course.price && parseFloat(course.price.toString()) > 0 ? "Login to Purchase" : "Enroll Now"}
                  </Button>
                )}

                {!isLoggedIn && (
                  <p className="text-xs text-gray-500 text-center mb-4">
                    Please login to enroll in this course
                  </p>
                )}

                <Separator className="my-4" />

                {/* Course Includes */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">This course includes:</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="h-4 w-4" />
                      <span>{course.duration} of content</span>
                    </div>
                    {courseData.totalLectures > 0 && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <PlayCircle className="h-4 w-4" />
                        <span>{courseData.totalLectures} lectures</span>
                      </div>
                    )}
                    {courseData.lifetimeAccess && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Globe className="h-4 w-4" />
                        <span>Lifetime access</span>
                      </div>
                    )}
                    {courseData.mobileAccess && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Smartphone className="h-4 w-4" />
                        <span>Access on mobile and TV</span>
                      </div>
                    )}
                    {courseData.certificateOfCompletion && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Award className="h-4 w-4" />
                        <span>Certificate of completion</span>
                      </div>
                    )}
                    {courseData.downloadableContent && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Download className="h-4 w-4" />
                        <span>Downloadable resources</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Login Modal */}
      <StudentLoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)} 
      />
    </div>
  );
}

// Instructor Section Component
function InstructorSection({ course, expert, expertReviews }: { course: Course; expert?: Expert; expertReviews?: any[] }) {
  const courseData = course as any;
  
  // Calculate actual rating from reviews
  const calculateRating = () => {
    if (!expertReviews || expertReviews.length === 0) return 0;
    const totalRating = expertReviews.reduce((sum, review) => sum + review.rating, 0);
    return totalRating / expertReviews.length;
  };
  
  const actualRating = calculateRating();
  
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-4">About the Instructor</h3>
      
      {expert ? (
        <div className="space-y-6">
          {/* Expert Profile */}
          <div className="flex items-start gap-6">
            <div className="flex-shrink-0">
              {expert.avatar ? (
                <img 
                  src={expert.avatar} 
                  alt={expert.name}
                  className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-xl font-semibold text-blue-600">
                    {expert.name.charAt(0)}
                  </span>
                </div>
              )}
            </div>
            
            <div className="flex-1">
              <h4 className="text-xl font-semibold text-gray-900 mb-2">{expert.name}</h4>
              <p className="text-blue-600 font-medium mb-3">{expert.specialization}</p>
              
              {/* Rating */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-4 w-4 ${
                        star <= Math.round(actualRating)
                          ? "fill-yellow-400 text-yellow-400" 
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600">
                  {actualRating.toFixed(2)} rating ({expertReviews?.length || 0} reviews)
                </span>
              </div>
              
              {/* Stats */}
              <div className="flex gap-6 text-sm text-gray-600 mb-4">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>Expert Instructor</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{expert.experience} experience</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Bio */}
          {expert.bio && (
            <div>
              <h5 className="font-semibold text-gray-900 mb-2">Biography</h5>
              <p className="text-gray-700 leading-relaxed">{expert.bio}</p>
            </div>
          )}
          
          {/* Skills */}
          {expert.skills && expert.skills.length > 0 && (
            <div>
              <h5 className="font-semibold text-gray-900 mb-3">Expertise</h5>
              <div className="flex flex-wrap gap-2">
                {expert.skills.map((skill, index) => (
                  <Badge key={index} variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {/* Education */}
          {expert.education && (
            <div>
              <h5 className="font-semibold text-gray-900 mb-3">Education</h5>
              <div className="text-gray-700">
                {expert.education}
              </div>
            </div>
          )}
          
          {/* Certifications */}
          {expert.certifications && expert.certifications.length > 0 && (
            <div>
              <h5 className="font-semibold text-gray-900 mb-3">Certifications</h5>
              <div className="space-y-2">
                {expert.certifications.map((cert, index) => (
                  <div key={index} className="flex items-center gap-2 text-gray-700">
                    <Award className="h-4 w-4 text-blue-600" />
                    <span>{cert}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
            <Users className="h-8 w-8 text-gray-400" />
          </div>
          <p className="text-gray-500">Instructor information will be available soon.</p>
        </div>
      )}
    </div>
  );
}

// FAQ Section Component
function FAQSection({ course }: { course: Course }) {
  const courseData = course as any;
  const faqs = courseData.faq || [];
  
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-4">Frequently Asked Questions</h3>
      
      {faqs && faqs.length > 0 ? (
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq: any, index: number) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-left font-medium text-gray-900">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-gray-700 leading-relaxed">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      ) : (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
            <MessageCircle className="h-8 w-8 text-gray-400" />
          </div>
          <p className="text-gray-500">No FAQs available yet. Check back later for common questions and answers.</p>
        </div>
      )}
    </div>
  );
}