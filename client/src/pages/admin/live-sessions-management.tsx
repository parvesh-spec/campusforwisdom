import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Plus, Edit, Trash2, Video, Users, Calendar, Clock, Play, Square } from "lucide-react";
import type { LiveSession, Course } from "@shared/schema";

export default function WebinarManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<LiveSession | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    scheduledAt: "",
    duration: "60",
    timezone: "Asia/Calcutta",
    participantEmails: "",
    courseId: undefined as string | undefined
  });

  const { data: sessions, isLoading } = useQuery<LiveSession[]>({
    queryKey: ["/api/admin/live-sessions"],
  });

  const { data: courses } = useQuery<Course[]>({
    queryKey: ["/api/admin/courses"],
  });

  const createSessionMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/admin/live-sessions", data),
    onSuccess: (response: any) => {
      if (response.zohoIntegrated && response.zohoData) {
        toast({ 
          title: "✅ Webinar created successfully in Zoho!", 
          description: `Meeting Key: ${response.zohoData.meetingKey}` 
        });
      } else if (response.success) {
        toast({ title: "Webinar created successfully!" });
      }
      queryClient.invalidateQueries({ queryKey: ["/api/admin/live-sessions"] });
      setIsCreateModalOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      console.error('Webinar creation error:', error);
      
      // Handle specific Zoho API errors
      if (error?.response?.status === 422) {
        const errorData = error.response.data;
        toast({ 
          title: "❌ " + (errorData.error || "Zoho Integration Failed"),
          description: errorData.message + (errorData.suggestion ? `\n\n${errorData.suggestion}` : ''),
          variant: "destructive" 
        });
      } else if (error?.response?.status === 400) {
        toast({ 
          title: "❌ Invalid Data", 
          description: "Please check all required fields and try again.",
          variant: "destructive" 
        });
      } else {
        toast({ 
          title: "❌ Error creating webinar", 
          description: "Please check your connection and try again.",
          variant: "destructive" 
        });
      }
    },
  });

  const updateSessionMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      apiRequest("PUT", `/api/admin/live-sessions/${id}`, data),
    onSuccess: () => {
      toast({ title: "Webinar updated successfully!" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/live-sessions"] });
      setEditingSession(null);
      resetForm();
    },
    onError: () => {
      toast({ title: "Error updating webinar", variant: "destructive" });
    },
  });

  const deleteSessionMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/admin/live-sessions/${id}`),
    onSuccess: () => {
      toast({ title: "Session deleted successfully!" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/live-sessions"] });
    },
    onError: () => {
      toast({ title: "Error deleting session", variant: "destructive" });
    },
  });

  const startSessionMutation = useMutation({
    mutationFn: (id: string) => apiRequest("POST", `/api/admin/live-sessions/${id}/start`),
    onSuccess: () => {
      toast({ title: "Session started successfully!" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/live-sessions"] });
    },
    onError: () => {
      toast({ title: "Error starting session", variant: "destructive" });
    },
  });

  const endSessionMutation = useMutation({
    mutationFn: (id: string) => apiRequest("POST", `/api/admin/live-sessions/${id}/end`),
    onSuccess: () => {
      toast({ title: "Session ended successfully!" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/live-sessions"] });
    },
    onError: () => {
      toast({ title: "Error ending session", variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      scheduledAt: "",
      duration: "60",
      timezone: "Asia/Calcutta",
      participantEmails: "",
      courseId: undefined
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Parse participant emails
    const participants = formData.participantEmails
      .split(',')
      .map(email => email.trim())
      .filter(email => email.length > 0);
    
    const sessionData = {
      title: formData.title,
      description: formData.description,
      duration: parseInt(formData.duration),
      scheduledAt: new Date(formData.scheduledAt).toISOString(),
      timezone: formData.timezone,
      participants,
      courseId: formData.courseId === "none" ? undefined : formData.courseId
    };

    if (editingSession) {
      updateSessionMutation.mutate({ id: editingSession.id, data: sessionData });
    } else {
      createSessionMutation.mutate(sessionData);
    }
  };

  const startEditing = (session: LiveSession) => {
    setEditingSession(session);
    setFormData({
      title: session.title,
      description: session.description,
      scheduledAt: new Date(session.scheduledAt).toISOString().slice(0, 16),
      duration: session.duration.toString(),
      timezone: session.timezone || "Asia/Calcutta",
      participantEmails: "",
      courseId: session.courseId || undefined
    });
  };

  const statusColors = {
    scheduled: "bg-blue-100 text-blue-800",
    live: "bg-red-100 text-red-800",
    completed: "bg-green-100 text-green-800",
    cancelled: "bg-gray-100 text-gray-800",
  };

  const liveSessions = sessions?.filter(s => s.status === "live") || [];
  const upcomingSessions = sessions?.filter(s => s.status === "scheduled") || [];
  const completedSessions = sessions?.filter(s => s.status === "completed") || [];

  return (
    <div>
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Webinar Management</h1>
            <p className="text-gray-600 mt-1">Create, manage, and monitor webinars through Zoho integration</p>
          </div>
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary text-white hover:bg-primary/90">
                <Plus className="h-4 w-4 mr-2" />
                Create Webinar
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingSession ? "Edit Webinar" : "Create New Webinar"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Webinar Topic *
                    </label>
                    <Input
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="AI Marketing Strategies"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      The main topic or title of your webinar
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Related Course
                    </label>
                    <Select
                      value={formData.courseId || "none"}
                      onValueChange={(value) => setFormData({ ...formData, courseId: value === "none" ? undefined : value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select course" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No course</SelectItem>
                        {courses?.map((course) => (
                          <SelectItem key={course.id} value={course.id}>
                            {course.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Webinar Agenda *
                  </label>
                  <Textarea
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Detailed agenda covering key topics, objectives, and learning outcomes..."
                    rows={3}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Provide a comprehensive agenda that participants will see
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Scheduled Date & Time *
                    </label>
                    <Input
                      required
                      type="datetime-local"
                      value={formData.scheduledAt}
                      onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Duration (minutes) *
                    </label>
                    <Input
                      required
                      type="number"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      placeholder="60"
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
                        <SelectValue placeholder="Select timezone" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Asia/Calcutta">Asia/Calcutta (IST)</SelectItem>
                        <SelectItem value="America/New_York">America/New_York (EST)</SelectItem>
                        <SelectItem value="Europe/London">Europe/London (GMT)</SelectItem>
                        <SelectItem value="Asia/Tokyo">Asia/Tokyo (JST)</SelectItem>
                        <SelectItem value="Australia/Sydney">Australia/Sydney (AEST)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pre-registered Participants (optional)
                  </label>
                  <Textarea
                    value={formData.participantEmails}
                    onChange={(e) => setFormData({ ...formData, participantEmails: e.target.value })}
                    placeholder="Enter participant emails separated by commas (e.g., john@company.com, sarah@company.com)"
                    rows={3}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Pre-register specific participants. Leave empty for open registration via Zoho's registration link.
                  </p>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsCreateModalOpen(false);
                      setEditingSession(null);
                      resetForm();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createSessionMutation.isPending || updateSessionMutation.isPending}
                  >
                    {editingSession ? "Update Session" : "Create Webinar"}
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
                <Video className="h-8 w-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Live Now</p>
                  <p className="text-2xl font-bold text-gray-900">{liveSessions.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Upcoming</p>
                  <p className="text-2xl font-bold text-gray-900">{upcomingSessions.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-gray-900">{completedSessions.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Participants</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {sessions?.reduce((sum, session) => sum + (session.currentParticipants || 0), 0) || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Webinars Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Webinars</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Loading webinars...</p>
              </div>
            ) : sessions && sessions.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Webinar</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Participants</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sessions.map((session) => (
                    <TableRow key={session.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium text-gray-900">{session.title}</div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {session.description}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {new Date(session.scheduledAt).toLocaleString()}
                        </div>
                      </TableCell>
                      <TableCell>{session.duration} min</TableCell>
                      <TableCell>
                        <div className="text-sm">
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={(statusColors as Record<string, string>)[session.status] || statusColors.scheduled}>
                          {session.status === "live" && (
                            <div className="w-2 h-2 bg-red-500 rounded-full mr-1 animate-pulse"></div>
                          )}
                          {session.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {session.status === "scheduled" && (
                            <Button
                              size="sm"
                              onClick={() => startSessionMutation.mutate(session.id)}
                              disabled={startSessionMutation.isPending}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <Play className="h-4 w-4" />
                            </Button>
                          )}
                          {session.status === "live" && (
                            <Button
                              size="sm"
                              onClick={() => endSessionMutation.mutate(session.id)}
                              disabled={endSessionMutation.isPending}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              <Square className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => startEditing(session)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteSessionMutation.mutate(session.id)}
                            disabled={deleteSessionMutation.isPending}
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
                <Video className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No webinars scheduled</h3>
                <p className="text-gray-600 mb-4">Get started by creating your first webinar.</p>
                <Button onClick={() => setIsCreateModalOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Webinar
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit Session Modal */}
        {editingSession && (
          <Dialog open={true} onOpenChange={() => setEditingSession(null)}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Edit Webinar</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Webinar Topic *
                    </label>
                    <Input
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="AI Marketing Strategies"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      The main topic or title of your webinar
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Related Course
                    </label>
                    <Select
                      value={formData.courseId || "none"}
                      onValueChange={(value) => setFormData({ ...formData, courseId: value === "none" ? undefined : value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select course" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No course</SelectItem>
                        {courses?.map((course) => (
                          <SelectItem key={course.id} value={course.id}>
                            {course.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Webinar Agenda *
                  </label>
                  <Textarea
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Detailed agenda covering key topics, objectives, and learning outcomes..."
                    rows={3}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Provide a comprehensive agenda that participants will see
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Scheduled Date & Time *
                    </label>
                    <Input
                      required
                      type="datetime-local"
                      value={formData.scheduledAt}
                      onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Duration (minutes) *
                    </label>
                    <Input
                      required
                      type="number"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      placeholder="60"
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
                        <SelectValue placeholder="Select timezone" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Asia/Calcutta">Asia/Calcutta (IST)</SelectItem>
                        <SelectItem value="America/New_York">America/New_York (EST)</SelectItem>
                        <SelectItem value="Europe/London">Europe/London (GMT)</SelectItem>
                        <SelectItem value="Asia/Tokyo">Asia/Tokyo (JST)</SelectItem>
                        <SelectItem value="Australia/Sydney">Australia/Sydney (AEST)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pre-registered Participants (optional)
                  </label>
                  <Textarea
                    value={formData.participantEmails}
                    onChange={(e) => setFormData({ ...formData, participantEmails: e.target.value })}
                    placeholder="Enter participant emails separated by commas (e.g., john@company.com, sarah@company.com)"
                    rows={3}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Pre-register specific participants. Leave empty for open registration via Zoho's registration link.
                  </p>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setEditingSession(null);
                      resetForm();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={updateSessionMutation.isPending}
                  >
                    Update Webinar
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
