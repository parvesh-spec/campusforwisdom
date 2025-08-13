import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";
import type { Testimonial, User } from "@shared/schema";

interface TestimonialCardProps {
  testimonial: Testimonial & {
    student: User;
  };
}

export default function TestimonialCard({ testimonial }: TestimonialCardProps) {
  const getInitials = (firstName?: string, lastName?: string) => {
    if (!firstName && !lastName) return "??";
    return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase();
  };

  return (
    <Card className="bg-gray-50 border border-gray-100">
      <CardContent className="p-6">
        <div className="flex items-center space-x-1 mb-4">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`h-4 w-4 ${
                i < testimonial.rating
                  ? "text-yellow-400 fill-current"
                  : "text-gray-300"
              }`}
            />
          ))}
        </div>
        <p className="text-gray-700 mb-6 italic">"{testimonial.content}"</p>
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 gradient-primary rounded-full flex items-center justify-center text-white font-bold">
            {getInitials(testimonial.student.firstName, testimonial.student.lastName)}
          </div>
          <div>
            <div className="font-semibold text-gray-900">
              {testimonial.student.firstName} {testimonial.student.lastName}
            </div>
            <div className="text-sm text-gray-600">Student</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
