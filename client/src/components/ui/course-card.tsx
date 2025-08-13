import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Clock, Users } from "lucide-react";
import type { Course } from "@shared/schema";

interface CourseCardProps {
  course: Course;
  onEnroll?: (courseId: string) => void;
}

export default function CourseCard({ course, onEnroll }: CourseCardProps) {
  const levelColors = {
    beginner: "bg-primary/10 text-primary",
    intermediate: "bg-secondary/10 text-secondary",
    advanced: "bg-accent/10 text-accent",
  };

  return (
    <Card className="bg-white shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow">
      <div className="w-full h-48 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
        <div className="text-6xl text-primary/50">📚</div>
      </div>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-3">
          <Badge className={levelColors[course.level as keyof typeof levelColors]}>
            {course.level}
          </Badge>
          <div className="flex items-center text-yellow-500">
            <Star className="h-4 w-4 fill-current" />
            <span className="ml-1 text-sm text-gray-600">{course.rating}</span>
          </div>
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">{course.title}</h3>
        <p className="text-gray-600 mb-4 line-clamp-3">{course.shortDescription}</p>
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-gray-500 flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            {course.duration}
          </span>
          <span className="text-sm text-gray-500 flex items-center">
            <Users className="h-4 w-4 mr-1" />
            {course.studentsCount} students
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-gray-900">₹{course.price}</span>
          <Button 
            className="bg-primary text-white hover:bg-primary/90"
            onClick={() => onEnroll?.(course.id)}
          >
            Enroll Now
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
