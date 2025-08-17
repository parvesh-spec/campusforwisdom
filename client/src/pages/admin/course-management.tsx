import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Plus, Edit, Trash2, Eye, Users, Star, Clock, BookOpen, X } from "lucide-react";
import type { Course } from "@shared/schema";

export default function CourseManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    shortDescription: "",
    level: "beginner",
    duration: "",
    price: "",
    category: "",
    thumbnail: "",
    instructorId: "",
    
    // Course Type and Format
    courseType: "recorded",
    format: "video",
    
    // Detailed Course Information
    whatYouWillLearn: "",
    courseRequirements: "",
    targetAudience: "",
    courseCurriculum: [{ sectionTitle: "", lectures: [{ title: "", duration: "" }] }],
    
    // Course Content
    totalLectures: "0",
    totalDuration: "",
    resources: "",
    assignments: "0",
    quizzes: "0",
    projects: "0",
    
    // Access and Completion
    lifetimeAccess: true,
    mobileAccess: true,
    certificateOfCompletion: true,
    downloadableContent: false,
    
    // Live Course Specific
    liveSchedule: [{ date: "", time: "", duration: "60" }],
    maxStudents: "",
    timezone: "Asia/Calcutta",
    
    // Additional Details
    language: "Hindi",
    tags: "",
    faq: [{ question: "", answer: "" }],
    
    // Instructor and Support
    supportLevel: "standard"
  });

  const { data: courses, isLoading } = useQuery<Course[]>({
    queryKey: ["/api/admin/courses"],
  });

  // Fetch experts data for assignment
  const { data: expertsData } = useQuery({
    queryKey: ["/api/experts"],
  });

  const createCourseMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/admin/courses", data),
    onSuccess: () => {
      toast({ title: "Course created successfully!" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/courses"] });
      setIsCreateModalOpen(false);
      resetForm();
    },
    onError: () => {
      toast({ title: "Error creating course", variant: "destructive" });
    },
  });

  const updateCourseMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      apiRequest("PUT", `/api/admin/courses/${id}`, data),
    onSuccess: () => {
      toast({ title: "Course updated successfully!" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/courses"] });
      setEditingCourse(null);
      resetForm();
    },
    onError: () => {
      toast({ title: "Error updating course", variant: "destructive" });
    },
  });

  const deleteCourseMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/admin/courses/${id}`),
    onSuccess: () => {
      toast({ title: "Course deleted successfully!" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/courses"] });
    },
    onError: () => {
      toast({ title: "Error deleting course", variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      shortDescription: "",
      level: "beginner",
      duration: "",
      price: "",
      category: "",
      thumbnail: "",
      instructorId: "",
      
      // Course Type and Format
      courseType: "recorded",
      format: "video",
      
      // Detailed Course Information
      whatYouWillLearn: "",
      courseRequirements: "",
      targetAudience: "",
      courseCurriculum: [{ sectionTitle: "", lectures: [{ title: "", duration: "" }] }],
      
      // Course Content
      totalLectures: "0",
      totalDuration: "",
      resources: "",
      assignments: "0",
      quizzes: "0",
      projects: "0",
      
      // Access and Completion
      lifetimeAccess: true,
      mobileAccess: true,
      certificateOfCompletion: true,
      downloadableContent: false,
      
      // Live Course Specific
      liveSchedule: [{ date: "", time: "", duration: "60" }],
      maxStudents: "",
      timezone: "Asia/Calcutta",
      
      // Additional Details
      language: "Hindi",
      tags: "",
      faq: [{ question: "", answer: "" }],
      
      // Instructor and Support
      supportLevel: "standard"
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Process form data for submission
    const courseData = {
      title: formData.title,
      description: formData.description,
      shortDescription: formData.shortDescription,
      level: formData.level,
      duration: formData.duration,
      price: formData.price,
      category: formData.category,
      thumbnail: formData.thumbnail,
      instructorId: formData.instructorId || undefined,
      
      // Course Type and Format
      courseType: formData.courseType,
      format: formData.format,
      
      // Detailed Course Information
      whatYouWillLearn: formData.whatYouWillLearn.split('\n').filter(item => item.trim().length > 0),
      courseRequirements: formData.courseRequirements,
      targetAudience: formData.targetAudience,
      courseCurriculum: formData.courseCurriculum.filter(section => 
        section.sectionTitle.trim() && 
        section.lectures.some(lecture => lecture.title.trim())
      ),
      
      // Course Content
      totalLectures: parseInt(formData.totalLectures) || 0,
      totalDuration: formData.totalDuration,
      resources: formData.resources.split('\n').filter(resource => resource.trim().length > 0),
      assignments: parseInt(formData.assignments) || 0,
      quizzes: parseInt(formData.quizzes) || 0,
      projects: parseInt(formData.projects) || 0,
      
      // Access and Completion
      lifetimeAccess: formData.lifetimeAccess,
      mobileAccess: formData.mobileAccess,
      certificateOfCompletion: formData.certificateOfCompletion,
      downloadableContent: formData.downloadableContent,
      
      // Live Course Specific
      liveSchedule: formData.courseType === 'live' ? 
        formData.liveSchedule.filter(slot => slot.date && slot.time) : [],
      maxStudents: formData.courseType === 'live' ? parseInt(formData.maxStudents) || undefined : undefined,
      timezone: formData.timezone,
      
      // Additional Details
      language: formData.language,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0),
      faq: formData.faq.filter(item => item.question.trim() && item.answer.trim()),
      
      // Instructor and Support
      supportLevel: formData.supportLevel
    };

    if (editingCourse) {
      updateCourseMutation.mutate({ id: editingCourse.id, data: courseData });
    } else {
      createCourseMutation.mutate(courseData);
    }
  };

  const startEditing = (course: Course) => {
    setEditingCourse(course);
    setFormData({
      title: course.title,
      description: course.description,
      shortDescription: course.shortDescription || "",
      level: course.level,
      duration: course.duration,
      price: course.price.toString(),
      category: course.category,
      thumbnail: course.thumbnail || "",
      instructorId: course.instructorId || "",
      
      // Course Type and Format
      courseType: (course as any).courseType || "recorded",
      format: (course as any).format || "video",
      
      // Detailed Course Information
      whatYouWillLearn: ((course as any).whatYouWillLearn || []).join('\n'),
      courseRequirements: (course as any).courseRequirements || "",
      targetAudience: (course as any).targetAudience || "",
      courseCurriculum: (course as any).courseCurriculum || [{ sectionTitle: "", lectures: [{ title: "", duration: "" }] }],
      
      // Course Content
      totalLectures: ((course as any).totalLectures || 0).toString(),
      totalDuration: (course as any).totalDuration || "",
      resources: ((course as any).resources || []).join('\n'),
      assignments: ((course as any).assignments || 0).toString(),
      quizzes: ((course as any).quizzes || 0).toString(),
      projects: ((course as any).projects || 0).toString(),
      
      // Access and Completion
      lifetimeAccess: (course as any).lifetimeAccess !== false,
      mobileAccess: (course as any).mobileAccess !== false,
      certificateOfCompletion: (course as any).certificateOfCompletion !== false,
      downloadableContent: (course as any).downloadableContent || false,
      
      // Live Course Specific
      liveSchedule: (course as any).liveSchedule || [{ date: "", time: "", duration: "60" }],
      maxStudents: ((course as any).maxStudents || "").toString(),
      timezone: (course as any).timezone || "Asia/Calcutta",
      
      // Additional Details
      language: (course as any).language || "Hindi",
      tags: ((course as any).tags || []).join(', '),
      faq: (course as any).faq || [{ question: "", answer: "" }],
      
      // Instructor and Support
      supportLevel: (course as any).supportLevel || "standard"
    });
  };

  const levelColors = {
    beginner: "bg-green-100 text-green-800",
    intermediate: "bg-yellow-100 text-yellow-800",
    advanced: "bg-red-100 text-red-800",
  };

  return (
    <div>
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Course Management</h1>
            <p className="text-gray-600 mt-1">Create, edit, and manage your AI courses</p>
          </div>
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary text-white hover:bg-primary/90">
                <Plus className="h-4 w-4 mr-2" />
                Create Course
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingCourse ? "Edit Course" : "Create New Course"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6">
                <Tabs defaultValue="basic" className="w-full">
                  <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="basic">Basic Info</TabsTrigger>
                    <TabsTrigger value="content">Course Content</TabsTrigger>
                    <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
                    <TabsTrigger value="features">Features</TabsTrigger>
                    <TabsTrigger value="settings">Settings</TabsTrigger>
                  </TabsList>

                  <TabsContent value="basic" className="space-y-4 mt-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Course Title *
                        </label>
                        <Input
                          required
                          value={formData.title}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                          placeholder="Complete AI Development Masterclass"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Category *
                        </label>
                        <Select
                          value={formData.category}
                          onValueChange={(value) => setFormData({ ...formData, category: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="AI Software Development">AI Software Development</SelectItem>
                            <SelectItem value="AI Video Creation">AI Video Creation</SelectItem>
                            <SelectItem value="AI Presentation Design">AI Presentation Design</SelectItem>
                            <SelectItem value="Machine Learning">Machine Learning</SelectItem>
                            <SelectItem value="Data Science">Data Science</SelectItem>
                            <SelectItem value="Web Development">Web Development</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Short Description *
                      </label>
                      <Input
                        required
                        value={formData.shortDescription}
                        onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                        placeholder="Brief description for course cards and search results"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Description *
                      </label>
                      <Textarea
                        required
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Detailed course description explaining what students will learn, the course structure, and benefits..."
                        rows={5}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Course Type *
                        </label>
                        <Select
                          value={formData.courseType}
                          onValueChange={(value) => setFormData({ ...formData, courseType: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="recorded">Recorded Course</SelectItem>
                            <SelectItem value="live">Live Course</SelectItem>
                            <SelectItem value="hybrid">Hybrid (Live + Recorded)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Format
                        </label>
                        <Select
                          value={formData.format}
                          onValueChange={(value) => setFormData({ ...formData, format: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="video">Video-based</SelectItem>
                            <SelectItem value="text">Text-based</SelectItem>
                            <SelectItem value="mixed">Mixed (Video + Text)</SelectItem>
                            <SelectItem value="interactive">Interactive</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Level *
                        </label>
                        <Select
                          value={formData.level}
                          onValueChange={(value) => setFormData({ ...formData, level: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="beginner">Beginner</SelectItem>
                            <SelectItem value="intermediate">Intermediate</SelectItem>
                            <SelectItem value="advanced">Advanced</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Duration *
                        </label>
                        <Input
                          required
                          value={formData.duration}
                          onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                          placeholder="12 weeks"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Price (₹) *
                        </label>
                        <Input
                          required
                          type="number"
                          value={formData.price}
                          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                          placeholder="15999"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Language
                        </label>
                        <Select
                          value={formData.language}
                          onValueChange={(value) => setFormData({ ...formData, language: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Hindi">Hindi</SelectItem>
                            <SelectItem value="English">English</SelectItem>
                            <SelectItem value="Hindi/English">Hindi/English (Mixed)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Tags (comma separated)
                        </label>
                        <Input
                          value={formData.tags}
                          onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                          placeholder="AI, Development, Python, Machine Learning"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Assign AI Expert (Instructor)
                      </label>
                      <Select
                        value={formData.instructorId}
                        onValueChange={(value) => setFormData({ ...formData, instructorId: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select an AI expert for this course" />
                        </SelectTrigger>
                        <SelectContent>
                          {expertsData?.map((expert) => (
                            <SelectItem key={expert.id} value={expert.id}>
                              {expert.name} - {expert.specialty}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-sm text-gray-500 mt-1">
                        This expert will be the instructor for this course and handle student queries.
                      </p>
                    </div>
                  </TabsContent>

                  <TabsContent value="content" className="space-y-4 mt-6 max-h-[60vh] overflow-y-auto pr-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        What You'll Learn (one point per line)
                      </label>
                      <Textarea
                        value={formData.whatYouWillLearn}
                        onChange={(e) => setFormData({ ...formData, whatYouWillLearn: e.target.value })}
                        placeholder="Build AI applications from scratch&#10;Master machine learning algorithms&#10;Deploy models to production&#10;Work with neural networks and deep learning"
                        rows={6}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Course Requirements
                        </label>
                        <Textarea
                          value={formData.courseRequirements}
                          onChange={(e) => setFormData({ ...formData, courseRequirements: e.target.value })}
                          placeholder="Basic programming knowledge&#10;Computer with internet access&#10;No prior AI experience needed"
                          rows={4}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Target Audience
                        </label>
                        <Textarea
                          value={formData.targetAudience}
                          onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                          placeholder="Developers wanting to learn AI&#10;Students and professionals&#10;Entrepreneurs interested in AI"
                          rows={4}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Total Lectures
                        </label>
                        <Input
                          type="number"
                          value={formData.totalLectures}
                          onChange={(e) => setFormData({ ...formData, totalLectures: e.target.value })}
                          placeholder="50"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Total Duration
                        </label>
                        <Input
                          value={formData.totalDuration}
                          onChange={(e) => setFormData({ ...formData, totalDuration: e.target.value })}
                          placeholder="25 hours on-demand video"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Assignments
                        </label>
                        <Input
                          type="number"
                          value={formData.assignments}
                          onChange={(e) => setFormData({ ...formData, assignments: e.target.value })}
                          placeholder="10"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Projects
                        </label>
                        <Input
                          type="number"
                          value={formData.projects}
                          onChange={(e) => setFormData({ ...formData, projects: e.target.value })}
                          placeholder="5"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Downloadable Resources (one per line)
                      </label>
                      <Textarea
                        value={formData.resources}
                        onChange={(e) => setFormData({ ...formData, resources: e.target.value })}
                        placeholder="Course slides and presentations&#10;Source code and project files&#10;Additional reading materials&#10;Datasets and examples"
                        rows={4}
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="curriculum" className="space-y-4 mt-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-4">
                        Course Curriculum Structure
                      </label>
                      <p className="text-sm text-gray-600 mb-4">
                        Define your course sections and lectures. This will help students understand the course structure.
                      </p>
                      {formData.courseCurriculum.map((section, sectionIndex) => (
                        <div key={sectionIndex} className="border rounded-lg p-4 space-y-3">
                          <div className="flex justify-between items-center">
                            <h4 className="text-sm font-medium">Section {sectionIndex + 1}</h4>
                            {formData.courseCurriculum.length > 1 && (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const newCurriculum = formData.courseCurriculum.filter((_, i) => i !== sectionIndex);
                                  setFormData({ ...formData, courseCurriculum: newCurriculum });
                                }}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                          <Input
                            value={section.sectionTitle}
                            onChange={(e) => {
                              const newCurriculum = [...formData.courseCurriculum];
                              newCurriculum[sectionIndex].sectionTitle = e.target.value;
                              setFormData({ ...formData, courseCurriculum: newCurriculum });
                            }}
                            placeholder="Section title (e.g., Introduction to AI)"
                          />
                          {section.lectures.map((lecture, lectureIndex) => (
                            <div key={lectureIndex} className="grid grid-cols-12 gap-2">
                              <Input
                                className="col-span-8"
                                value={lecture.title}
                                onChange={(e) => {
                                  const newCurriculum = [...formData.courseCurriculum];
                                  newCurriculum[sectionIndex].lectures[lectureIndex].title = e.target.value;
                                  setFormData({ ...formData, courseCurriculum: newCurriculum });
                                }}
                                placeholder="Lecture title"
                              />
                              <Input
                                className="col-span-3"
                                value={lecture.duration}
                                onChange={(e) => {
                                  const newCurriculum = [...formData.courseCurriculum];
                                  newCurriculum[sectionIndex].lectures[lectureIndex].duration = e.target.value;
                                  setFormData({ ...formData, courseCurriculum: newCurriculum });
                                }}
                                placeholder="Duration"
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="col-span-1"
                                onClick={() => {
                                  const newCurriculum = [...formData.courseCurriculum];
                                  newCurriculum[sectionIndex].lectures.splice(lectureIndex, 1);
                                  setFormData({ ...formData, courseCurriculum: newCurriculum });
                                }}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const newCurriculum = [...formData.courseCurriculum];
                              newCurriculum[sectionIndex].lectures.push({ title: "", duration: "" });
                              setFormData({ ...formData, courseCurriculum: newCurriculum });
                            }}
                          >
                            Add Lecture
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setFormData({
                            ...formData,
                            courseCurriculum: [
                              ...formData.courseCurriculum,
                              { sectionTitle: "", lectures: [{ title: "", duration: "" }] }
                            ]
                          });
                        }}
                      >
                        Add Section
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="features" className="space-y-4 mt-6">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Course Features & Access</h3>
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="lifetimeAccess"
                              checked={formData.lifetimeAccess}
                              onChange={(e) => setFormData({ ...formData, lifetimeAccess: e.target.checked })}
                              className="rounded border-gray-300"
                            />
                            <label htmlFor="lifetimeAccess" className="text-sm font-medium text-gray-700">
                              Lifetime Access
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="mobileAccess"
                              checked={formData.mobileAccess}
                              onChange={(e) => setFormData({ ...formData, mobileAccess: e.target.checked })}
                              className="rounded border-gray-300"
                            />
                            <label htmlFor="mobileAccess" className="text-sm font-medium text-gray-700">
                              Mobile Access
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="certificateOfCompletion"
                              checked={formData.certificateOfCompletion}
                              onChange={(e) => setFormData({ ...formData, certificateOfCompletion: e.target.checked })}
                              className="rounded border-gray-300"
                            />
                            <label htmlFor="certificateOfCompletion" className="text-sm font-medium text-gray-700">
                              Certificate of Completion
                            </label>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="downloadableContent"
                              checked={formData.downloadableContent}
                              onChange={(e) => setFormData({ ...formData, downloadableContent: e.target.checked })}
                              className="rounded border-gray-300"
                            />
                            <label htmlFor="downloadableContent" className="text-sm font-medium text-gray-700">
                              Downloadable Content
                            </label>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Support Level
                            </label>
                            <Select
                              value={formData.supportLevel}
                              onValueChange={(value) => setFormData({ ...formData, supportLevel: value })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="basic">Basic Support</SelectItem>
                                <SelectItem value="standard">Standard Support</SelectItem>
                                <SelectItem value="premium">Premium Support</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    </div>

                    {formData.courseType === 'live' && (
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Live Course Settings</h3>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Maximum Students
                            </label>
                            <Input
                              type="number"
                              value={formData.maxStudents}
                              onChange={(e) => setFormData({ ...formData, maxStudents: e.target.value })}
                              placeholder="50"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Timezone
                            </label>
                            <Select
                              value={formData.timezone}
                              onValueChange={(value) => setFormData({ ...formData, timezone: value })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Asia/Calcutta">Asia/Calcutta (IST)</SelectItem>
                                <SelectItem value="UTC">UTC</SelectItem>
                                <SelectItem value="America/New_York">America/New_York (EST)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-4">
                            Live Schedule
                          </label>
                          {formData.liveSchedule.map((slot, index) => (
                            <div key={index} className="grid grid-cols-12 gap-2 mb-2">
                              <Input
                                type="date"
                                className="col-span-4"
                                value={slot.date}
                                onChange={(e) => {
                                  const newSchedule = [...formData.liveSchedule];
                                  newSchedule[index].date = e.target.value;
                                  setFormData({ ...formData, liveSchedule: newSchedule });
                                }}
                              />
                              <Input
                                type="time"
                                className="col-span-3"
                                value={slot.time}
                                onChange={(e) => {
                                  const newSchedule = [...formData.liveSchedule];
                                  newSchedule[index].time = e.target.value;
                                  setFormData({ ...formData, liveSchedule: newSchedule });
                                }}
                              />
                              <Input
                                className="col-span-3"
                                value={slot.duration}
                                onChange={(e) => {
                                  const newSchedule = [...formData.liveSchedule];
                                  newSchedule[index].duration = e.target.value;
                                  setFormData({ ...formData, liveSchedule: newSchedule });
                                }}
                                placeholder="Duration (min)"
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="col-span-2"
                                onClick={() => {
                                  const newSchedule = formData.liveSchedule.filter((_, i) => i !== index);
                                  setFormData({ ...formData, liveSchedule: newSchedule });
                                }}
                              >
                                Remove
                              </Button>
                            </div>
                          ))}
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setFormData({
                                ...formData,
                                liveSchedule: [...formData.liveSchedule, { date: "", time: "", duration: "60" }]
                              });
                            }}
                          >
                            Add Schedule Slot
                          </Button>
                        </div>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="settings" className="space-y-4 mt-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-4">
                        Frequently Asked Questions
                      </label>
                      {formData.faq.map((faqItem, index) => (
                        <div key={index} className="border rounded-lg p-4 space-y-3">
                          <div className="flex justify-between items-center">
                            <h4 className="text-sm font-medium">FAQ {index + 1}</h4>
                            {formData.faq.length > 1 && (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const newFaq = formData.faq.filter((_, i) => i !== index);
                                  setFormData({ ...formData, faq: newFaq });
                                }}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                          <Input
                            value={faqItem.question}
                            onChange={(e) => {
                              const newFaq = [...formData.faq];
                              newFaq[index].question = e.target.value;
                              setFormData({ ...formData, faq: newFaq });
                            }}
                            placeholder="Question"
                          />
                          <Textarea
                            value={faqItem.answer}
                            onChange={(e) => {
                              const newFaq = [...formData.faq];
                              newFaq[index].answer = e.target.value;
                              setFormData({ ...formData, faq: newFaq });
                            }}
                            placeholder="Answer"
                            rows={3}
                          />
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setFormData({
                            ...formData,
                            faq: [...formData.faq, { question: "", answer: "" }]
                          });
                        }}
                      >
                        Add FAQ
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="flex justify-end space-x-2 pt-6 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsCreateModalOpen(false);
                      setEditingCourse(null);
                      resetForm();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createCourseMutation.isPending || updateCourseMutation.isPending}
                  >
                    {editingCourse ? "Update Course" : "Create Course"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <div className="p-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <BookOpen className="h-8 w-8 text-primary" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Courses</p>
                  <p className="text-2xl font-bold text-gray-900">{courses?.length || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Enrollments</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {courses?.reduce((sum, course) => sum + (course.studentsCount || 0), 0) || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Star className="h-8 w-8 text-yellow-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Avg Rating</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {courses?.length 
                      ? (courses.reduce((sum, course) => sum + parseFloat(course.rating || "0"), 0) / courses.length).toFixed(1)
                      : "0.0"
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Courses</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {courses?.filter(course => course.isActive).length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Courses Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Courses</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Loading courses...</p>
              </div>
            ) : courses && courses.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Course</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead>Students</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {courses.map((course) => (
                    <TableRow key={course.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium text-gray-900">{course.title}</div>
                          <div className="text-sm text-gray-500">{course.category}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={levelColors[course.level as keyof typeof levelColors]}>
                          {course.level}
                        </Badge>
                      </TableCell>
                      <TableCell>{course.studentsCount || 0}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-400 mr-1" />
                          {course.rating}
                        </div>
                      </TableCell>
                      <TableCell>₹{course.price}</TableCell>
                      <TableCell>
                        <Badge variant={course.isActive ? "default" : "secondary"}>
                          {course.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => startEditing(course)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteCourseMutation.mutate(course.id)}
                            disabled={deleteCourseMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-16">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No courses yet</h3>
                <p className="text-gray-600 mb-4">Get started by creating your first course.</p>
                <Button onClick={() => setIsCreateModalOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Course
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit Course Modal */}
        {editingCourse && (
          <Dialog open={true} onOpenChange={() => setEditingCourse(null)}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Edit Course</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Course Title *
                    </label>
                    <Input
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="AI Software Development"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category *
                    </label>
                    <Input
                      required
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      placeholder="AI Software Development"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Short Description *
                  </label>
                  <Input
                    required
                    value={formData.shortDescription}
                    onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                    placeholder="Brief description for course cards"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Description *
                  </label>
                  <Textarea
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Detailed course description..."
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Level *
                    </label>
                    <Select
                      value={formData.level}
                      onValueChange={(value) => setFormData({ ...formData, level: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Duration *
                    </label>
                    <Input
                      required
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      placeholder="12 weeks"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price (₹) *
                    </label>
                    <Input
                      required
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="15999"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setEditingCourse(null);
                      resetForm();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={updateCourseMutation.isPending}
                  >
                    Update Course
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}
