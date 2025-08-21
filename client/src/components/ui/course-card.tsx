import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Clock, Users, BookOpen, Award, Play, Calendar, ChevronRight, CheckCircle } from "lucide-react";
import { Link, useLocation } from "wouter";
import type { Course } from "@shared/schema";

interface CourseCardProps {
  course: Course;
  onEnroll?: (courseId: string) => void;
  isEnrolled?: boolean;
  isEnrolling?: boolean;
}

export default function CourseCard({ course, onEnroll, isEnrolled = false, isEnrolling = false }: CourseCardProps) {
  const [, setLocation] = useLocation();
  
  const levelColors = {
    beginner: "bg-emerald-100 text-emerald-800 border-emerald-200",
    intermediate: "bg-amber-100 text-amber-800 border-amber-200", 
    advanced: "bg-rose-100 text-rose-800 border-rose-200",
  };

  const courseTypeIcons = {
    recorded: <Play className="h-4 w-4" />,
    live: <Calendar className="h-4 w-4" />,
  };

  // Extended course data from admin features
  const courseData = course as any;
  const courseType = courseData.courseType || 'recorded';
  const totalLectures = courseData.totalLectures || 0;
  const whatYouWillLearn = courseData.whatYouWillLearn || [];
  const certificateOfCompletion = courseData.certificateOfCompletion;
  const lifetimeAccess = courseData.lifetimeAccess;

  return (
    <Link href={`/courses/${course.id}`}>
      <Card className="group bg-white shadow-md border border-gray-200 overflow-hidden hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 cursor-pointer">
        {/* Course Image/Thumbnail */}
        <div className="relative w-full aspect-video bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 overflow-hidden">
          {courseData.thumbnail ? (
            <img 
              src={courseData.thumbnail} 
              alt={course.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 flex items-center justify-center">
              <div className="text-6xl text-white/80">
                {courseType === 'live' ? '🎥' : '📚'}
              </div>
            </div>
          )}
          
          {/* Course Type Badge */}
          <div className="absolute top-3 left-3">
            <Badge className={`${courseType === 'live' ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'} text-white border-0 flex items-center gap-1`}>
              {courseTypeIcons[courseType as keyof typeof courseTypeIcons]}
              <span className="capitalize">{courseType}</span>
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
            {course.shortDescription || course.description}
          </p>

          {/* Key Features */}
          {whatYouWillLearn.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1">
                <BookOpen className="h-3 w-3" />
                What you'll learn:
              </p>
              <ul className="text-xs text-gray-600 space-y-1">
                {whatYouWillLearn.slice(0, 2).map((item: string, index: number) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span className="line-clamp-1">{item}</span>
                  </li>
                ))}
                {whatYouWillLearn.length > 2 && (
                  <li className="text-gray-400 font-medium">
                    +{whatYouWillLearn.length - 2} more topics...
                  </li>
                )}
              </ul>
            </div>
          )}

          {/* Course Stats */}
          <div className="grid grid-cols-2 gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-700 font-medium">{course.duration}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-700 font-medium">{course.studentsCount || 0} students</span>
            </div>
            {totalLectures > 0 && (
              <>
                <div className="flex items-center gap-2">
                  <Play className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-700 font-medium">{totalLectures} lectures</span>
                </div>
              </>
            )}
          </div>

          {/* Features */}
          <div className="flex flex-wrap gap-2 mb-4">
            {certificateOfCompletion && (
              <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                <Award className="h-3 w-3 mr-1" />
                Certificate
              </Badge>
            )}
            {lifetimeAccess && (
              <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                Lifetime Access
              </Badge>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <Button 
              className={`flex-1 font-semibold group-hover:shadow-lg transition-all ${
                isEnrolled 
                  ? 'bg-green-600 hover:bg-green-700 text-white' 
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white'
              }`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                // Always navigate to course page - payment logic handled there
                setLocation(`/courses/${course.id}`);
              }}
              disabled={isEnrolling}
            >
              {isEnrolling ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Enrolling...</span>
                </div>
              ) : isEnrolled ? (
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  <span>Enrolled</span>
                </div>
              ) : (
                <span>Enroll Now</span>
              )}
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              className="border-gray-300 hover:border-blue-500 hover:text-blue-600 transition-colors"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setLocation(`/courses/${course.id}`);
              }}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
