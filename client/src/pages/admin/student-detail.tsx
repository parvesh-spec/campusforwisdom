import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, BookOpen, Calendar, Download, GraduationCap, Mail, Phone, User, Video } from "lucide-react";

export default function StudentDetail() {
  const params = useParams();
  const studentId = params.id;

  const { data: studentDetail, isLoading, error } = useQuery({
    queryKey: ["/api/admin/students", studentId],
    enabled: !!studentId,
  });

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/admin/students">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4" />
              Back to Students
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error || !studentDetail) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/admin/students">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4" />
              Back to Students
            </Button>
          </Link>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-red-600 mb-2">Student Not Found</h3>
              <p className="text-gray-600">The requested student could not be found.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { student, enrollments, webinarAttendees, consultations, ebookDownloads, stats } = studentDetail;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return "text-green-600";
    if (progress >= 50) return "text-yellow-600";
    return "text-red-600";
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      confirmed: "bg-green-100 text-green-800",
      pending: "bg-yellow-100 text-yellow-800",
      cancelled: "bg-red-100 text-red-800",
      completed: "bg-blue-100 text-blue-800",
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/students">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4" />
            Back to Students
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">
            {student.firstName} {student.lastName}
          </h1>
          <p className="text-gray-600">Student ID: {student.id}</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <BookOpen className="w-8 h-8 mx-auto text-blue-600 mb-2" />
            <div className="text-2xl font-bold">{stats.totalEnrollments}</div>
            <div className="text-sm text-gray-600">Courses Enrolled</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <GraduationCap className="w-8 h-8 mx-auto text-green-600 mb-2" />
            <div className="text-2xl font-bold">{stats.completedCourses}</div>
            <div className="text-sm text-gray-600">Completed</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Video className="w-8 h-8 mx-auto text-purple-600 mb-2" />
            <div className="text-2xl font-bold">{stats.totalWebinars}</div>
            <div className="text-sm text-gray-600">Webinars Attended</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Download className="w-8 h-8 mx-auto text-orange-600 mb-2" />
            <div className="text-2xl font-bold">{stats.totalDownloads}</div>
            <div className="text-sm text-gray-600">eBooks Downloaded</div>
          </CardContent>
        </Card>
      </div>

      {/* Student Info & Activity Tabs */}
      <Tabs defaultValue="info" className="space-y-4">
        <TabsList>
          <TabsTrigger value="info">Personal Info</TabsTrigger>
          <TabsTrigger value="courses">Courses ({enrollments.length})</TabsTrigger>
          <TabsTrigger value="webinars">Webinars ({webinarAttendees.length})</TabsTrigger>
          <TabsTrigger value="consultations">Consultations ({consultations.length})</TabsTrigger>
          <TabsTrigger value="ebooks">eBooks ({ebookDownloads.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="info">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="font-medium text-gray-700">Email</label>
                <div className="flex items-center gap-2 text-gray-900">
                  <Mail className="w-4 h-4" />
                  {student.email}
                </div>
              </div>
              <div>
                <label className="font-medium text-gray-700">Phone</label>
                <div className="flex items-center gap-2 text-gray-900">
                  <Phone className="w-4 h-4" />
                  {student.phone || "Not provided"}
                </div>
              </div>
              <div>
                <label className="font-medium text-gray-700">Date of Birth</label>
                <div className="text-gray-900">
                  {student.dateOfBirth ? formatDate(student.dateOfBirth) : "Not provided"}
                </div>
              </div>
              <div>
                <label className="font-medium text-gray-700">Gender</label>
                <div className="text-gray-900">{student.gender || "Not provided"}</div>
              </div>
              <div>
                <label className="font-medium text-gray-700">Address</label>
                <div className="text-gray-900">
                  {student.address ? `${student.address}, ${student.city}, ${student.state}, ${student.country}` : "Not provided"}
                </div>
              </div>
              <div>
                <label className="font-medium text-gray-700">Education</label>
                <div className="text-gray-900">{student.education || "Not provided"}</div>
              </div>
              <div>
                <label className="font-medium text-gray-700">Occupation</label>
                <div className="text-gray-900">{student.occupation || "Not provided"}</div>
              </div>
              <div>
                <label className="font-medium text-gray-700">Experience</label>
                <div className="text-gray-900">{student.experience || "Not provided"}</div>
              </div>
              <div>
                <label className="font-medium text-gray-700">Joined Date</label>
                <div className="text-gray-900">
                  {student.createdAt ? formatDate(student.createdAt) : "Not available"}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="courses">
          <div className="space-y-4">
            {enrollments.length === 0 ? (
              <Card>
                <CardContent className="flex items-center justify-center h-32">
                  <p className="text-gray-600">No courses enrolled yet.</p>
                </CardContent>
              </Card>
            ) : (
              enrollments.map((enrollment) => (
                <Card key={enrollment.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold">{enrollment.course.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{enrollment.course.description}</p>
                      </div>
                      <Badge variant={enrollment.completed ? "default" : "secondary"}>
                        {enrollment.completed ? "Completed" : "In Progress"}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center text-sm text-gray-600">
                      <span>Enrolled: {formatDate(enrollment.enrolledAt)}</span>
                      <span className={`font-medium ${getProgressColor(enrollment.progress || 0)}`}>
                        Progress: {enrollment.progress || 0}%
                      </span>
                    </div>
                    {enrollment.completed && enrollment.completedAt && (
                      <div className="text-sm text-green-600 mt-1">
                        Completed: {formatDate(enrollment.completedAt)}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="webinars">
          <div className="space-y-4">
            {webinarAttendees.length === 0 ? (
              <Card>
                <CardContent className="flex items-center justify-center h-32">
                  <p className="text-gray-600">No webinars attended yet.</p>
                </CardContent>
              </Card>
            ) : (
              webinarAttendees.map((attendee) => (
                <Card key={attendee.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold">{attendee.webinar.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{attendee.webinar.description}</p>
                      </div>
                      <Badge className={getStatusBadge(attendee.status)}>
                        {attendee.status}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(attendee.webinar.scheduledAt)}
                      </span>
                      <span>Duration: {attendee.webinar.duration} mins</span>
                    </div>
                    {attendee.joinedAt && (
                      <div className="text-sm text-blue-600 mt-1">
                        Joined: {formatDate(attendee.joinedAt)}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="consultations">
          <div className="space-y-4">
            {consultations.length === 0 ? (
              <Card>
                <CardContent className="flex items-center justify-center h-32">
                  <p className="text-gray-600">No consultations booked yet.</p>
                </CardContent>
              </Card>
            ) : (
              consultations.map((consultation) => (
                <Card key={consultation.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold">Consultation with {consultation.expert.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">{consultation.expert.expertise}</p>
                      </div>
                      <Badge className={getStatusBadge(consultation.status)}>
                        {consultation.status}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(consultation.scheduledAt)}
                      </span>
                      <span>Duration: {consultation.duration} mins</span>
                    </div>
                    {consultation.completedAt && (
                      <div className="text-sm text-green-600 mt-1">
                        Completed: {formatDate(consultation.completedAt)}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="ebooks">
          <div className="space-y-4">
            {ebookDownloads.length === 0 ? (
              <Card>
                <CardContent className="flex items-center justify-center h-32">
                  <p className="text-gray-600">No eBooks downloaded yet.</p>
                </CardContent>
              </Card>
            ) : (
              ebookDownloads.map((download) => (
                <Card key={download.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{download.ebook.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{download.ebook.description}</p>
                        <div className="text-sm text-gray-500 mt-2">
                          Author: {download.ebook.author}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-600">
                          Downloaded: {formatDate(download.downloadedAt)}
                        </div>
                        <Badge variant="outline" className="mt-1">
                          {download.ebook.category}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}