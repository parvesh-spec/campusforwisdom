import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, Search } from "lucide-react";
import type { User as UserType } from "@shared/schema";

interface StudentSearchProps {
  value: string;
  onChange: (studentId: string, studentName: string) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
}

export default function StudentSearch({ 
  value, 
  onChange, 
  placeholder = "Search student by name...",
  label = "Student",
  required = false 
}: StudentSearchProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<UserType | null>(null);

  const { data: students = [], isLoading } = useQuery<UserType[]>({
    queryKey: ["/api/admin/students/search", searchTerm],
    queryFn: async () => {
      const response = await fetch(`/api/admin/students/search?q=${encodeURIComponent(searchTerm)}`);
      if (!response.ok) {
        throw new Error('Failed to search students');
      }
      return response.json();
    },
    enabled: searchTerm.length >= 2,
  });

  // Find selected student info when value changes
  useEffect(() => {
    if (value && !selectedStudent) {
      // If we have a studentId but no selected student info, show just the ID
      const foundStudent = students.find(s => s.id === value);
      if (foundStudent) {
        setSelectedStudent(foundStudent);
        setSearchTerm(getStudentDisplayName(foundStudent));
      } else if (value) {
        // Show the ID if we can't find the student info
        setSearchTerm(value);
      }
    }
  }, [value, students, selectedStudent]);

  const getStudentDisplayName = (student: UserType) => {
    if (student.firstName && student.lastName) {
      return `${student.firstName} ${student.lastName}`;
    }
    return student.username || student.email || student.id;
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSearchTerm = e.target.value;
    setSearchTerm(newSearchTerm);
    setShowResults(newSearchTerm.length >= 2);
    
    // Clear selection if search term changes significantly
    if (selectedStudent && !newSearchTerm.includes(getStudentDisplayName(selectedStudent))) {
      setSelectedStudent(null);
      onChange("", "");
    }
  };

  const handleStudentSelect = (student: UserType) => {
    setSelectedStudent(student);
    setSearchTerm(getStudentDisplayName(student));
    setShowResults(false);
    onChange(student.id, getStudentDisplayName(student));
  };

  const handleInputFocus = () => {
    if (searchTerm.length >= 2) {
      setShowResults(true);
    }
  };

  const handleInputBlur = () => {
    // Delay hiding results to allow for selection clicks
    setTimeout(() => setShowResults(false), 200);
  };

  return (
    <div className="space-y-2 relative">
      <Label htmlFor="student-search">
        {label} {required && "*"}
      </Label>
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            id="student-search"
            value={searchTerm}
            onChange={handleSearchChange}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            placeholder={placeholder}
            className="pl-10"
            required={required}
          />
        </div>
        
        {showResults && (
          <Card className="absolute top-full left-0 right-0 mt-1 z-50 max-h-60 overflow-y-auto shadow-lg">
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-3 text-center text-sm text-gray-500">
                  Searching...
                </div>
              ) : students.length > 0 ? (
                <div className="space-y-0">
                  {students.map((student) => (
                    <div
                      key={student.id}
                      onClick={() => handleStudentSelect(student)}
                      className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary/10">
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm">
                          {getStudentDisplayName(student)}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          ID: {student.id}
                        </div>
                        {student.email && (
                          <div className="text-xs text-gray-500 truncate">
                            {student.email}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3 text-center text-sm text-gray-500">
                  No students found matching "{searchTerm}"
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
      
      {selectedStudent && (
        <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
          Selected: {getStudentDisplayName(selectedStudent)} (ID: {selectedStudent.id})
        </div>
      )}
    </div>
  );
}