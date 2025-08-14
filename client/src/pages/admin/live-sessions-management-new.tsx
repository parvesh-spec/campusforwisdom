import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Plus, Edit, Trash2, Video, Users, Calendar, Clock, Play, Square, ExternalLink, BarChart3, TrendingUp, Activity } from "lucide-react";
import type { LiveWebinar, Course } from "@shared/schema";

interface FormData {
  title: string;
  description: string;
  scheduledAt: string;
  duration: number;
  maxParticipants: number;
  courseId: string;
}

export default function LiveWebinarsManagement() {
  // Poll Zoom WebSocket status from backend
  const { data: zoomStatusData, error: zoomStatusError } = useQuery({
    queryKey: ["/api/admin/zoom/status"],
    refetchInterval: 5000, // Poll every 5 seconds
    refetchOnWindowFocus: true,
    retry: false, // Don't retry on auth errors
  });
  
  const connectionStatus = zoomStatusError ? 'Disconnected' : ((zoomStatusData as any)?.status || 'Connecting...');
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingWebinar, setEditingWebinar] = useState<LiveWebinar | null>(null);
  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    scheduledAt: "",
    duration: 60,
    maxParticipants: 100,
    courseId: ""
  });

  const { data: webinars, isLoading } = useQuery<LiveWebinar[]>({
    queryKey: ["/api/admin/live-webinars"],
  });

  const { data: courses } = useQuery<Course[]>({
    queryKey: ["/api/admin/courses"],
  });

  const createWebinarMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/admin/live-webinars", data),
    onSuccess: () => {
      toast({ title: "Live webinar created successfully!" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/live-webinars"] });
      setIsCreateModalOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({ title: "Error creating webinar", description: error.message, variant: "destructive" });
    },
  });

  const updateWebinarMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      apiRequest("PUT", `/api/admin/live-webinars/${id}`, data),
    onSuccess: () => {
      toast({ title: "Webinar updated successfully!" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/live-webinars"] });
      setIsCreateModalOpen(false);
      setEditingWebinar(null);
      resetForm();
    },
    onError: (error: any) => {
      toast({ title: "Error updating session", description: error.message, variant: "destructive" });
    },
  });

  const deleteWebinarMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/admin/live-webinars/${id}`),
    onSuccess: () => {
      toast({ title: "Webinar deleted successfully!" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/live-webinars"] });
    },
    onError: (error: any) => {
      toast({ title: "Error deleting webinar", description: error.message, variant: "destructive" });
    },
  });

  const createZoomWebinarMutation = useMutation({
    mutationFn: (webinarId: string) => apiRequest("POST", `/api/admin/live-webinars/${webinarId}/create-webinar`),
    onSuccess: () => {
      toast({ title: "Zoom webinar created successfully!" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/live-webinars"] });
    },
    onError: (error: any) => {
      console.error('Create Zoom meeting error:', error);
      if (error.message?.includes('Meeting')) {
        toast({ 
          title: "Zoom webinar creation failed", 
          description: "Please check your Zoom configuration and try again.",
          variant: "destructive" 
        });
      } else {
        toast({ 
          title: "Error creating Zoom webinar", 
          description: error.message,
          variant: "destructive" 
        });
      }
    }
  });

  const startWebinarMutation = useMutation({
    mutationFn: (id: string) => apiRequest("PUT", `/api/admin/live-webinars/${id}/start`),
    onSuccess: () => {
      toast({ title: "Webinar started successfully!" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/live-webinars"] });
    },
    onError: (error: any) => {
      toast({ title: "Error starting webinar", description: error.message, variant: "destructive" });
    },
  });

  const endWebinarMutation = useMutation({
    mutationFn: (id: string) => apiRequest("PUT", `/api/admin/live-webinars/${id}/end`),
    onSuccess: () => {
      toast({ title: "Webinar ended successfully!" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/live-webinars"] });
    },
    onError: (error: any) => {
      toast({ title: "Error ending webinar", description: error.message, variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      scheduledAt: "",
      duration: 60,
      maxParticipants: 100,
      courseId: ""
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const sessionData = {
      ...formData,
      courseId: formData.courseId === "none" || formData.courseId === "" ? null : formData.courseId,
      scheduledAt: formData.scheduledAt, // Let Zod coerce this to Date
    };

    if (editingWebinar) {
      updateWebinarMutation.mutate({ id: editingWebinar.id, data: sessionData });
    } else {
      createWebinarMutation.mutate(sessionData);
    }
  };

  const handleEdit = (webinar: LiveWebinar) => {
    setEditingWebinar(webinar);
    setFormData({
      title: webinar.title,
      description: webinar.description || "",
      scheduledAt: new Date(webinar.scheduledAt).toISOString().slice(0, 16),
      duration: webinar.duration,
      maxParticipants: webinar.maxParticipants || 100,
      courseId: webinar.courseId || "none"
    });
    setIsCreateModalOpen(true);
  };

  // Webinar categorization
  const liveWebinars = webinars?.filter(w => w.status === 'live') || [];
  const upcomingWebinars = webinars?.filter(w => w.status === 'scheduled') || [];
  const completedWebinars = webinars?.filter(w => w.status === 'completed') || [];

  const statusColors = {
    scheduled: "bg-blue-100 text-blue-800",
    live: "bg-green-100 text-green-800",
    completed: "bg-gray-100 text-gray-800",
    cancelled: "bg-red-100 text-red-800"
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Live Webinars Management</h1>
            <p className="text-sm text-gray-600 mt-1">Schedule, manage, and track live learning webinars</p>
            
            <div className="flex items-center gap-2 mt-2">
              <Badge variant={connectionStatus === 'Connected' ? 'default' : 'destructive'}>
                {connectionStatus === 'Connected' ? '🟢' : connectionStatus === 'Authenticating...' ? '🟡' : '🔴'} Zoom WebSocket: {connectionStatus}
              </Badge>
              {connectionStatus === 'Disconnected' && (
                <p className="text-sm text-gray-600">
                  {zoomStatusError ? 'Please log in to view Zoom connection status.' : 'Configure your ZOOM_WEBSOCKET_ENDPOINT_URL with the endpoint from your Zoom app settings.'}
                </p>
              )}
            </div>
          </div>

          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => {
                setEditingWebinar(null);
                resetForm();
              }}>
                <Plus className="h-4 w-4 mr-2" />
                Schedule Webinar
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingWebinar ? "Edit Webinar" : "Schedule New Webinar"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Webinar Title *
                    </label>
                    <Input
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="ChatGPT Integration Workshop"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Related Course
                    </label>
                    <Select
                      value={formData.courseId || ""}
                      onValueChange={(value) => setFormData({ ...formData, courseId: value || "" })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select course" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No course</SelectItem>
                        {courses && courses.map((course) => (
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
                    Description *
                  </label>
                  <Textarea
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Session description and learning objectives..."
                    rows={3}
                  />
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
                      onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
                      placeholder="60"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max Participants
                    </label>
                    <Input
                      type="number"
                      value={formData.maxParticipants}
                      onChange={(e) => setFormData({ ...formData, maxParticipants: Number(e.target.value) })}
                      placeholder="100"
                    />
                  </div>
                </div>

                {/* Note: Meeting URL is automatically generated when creating Zoom meeting */}
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-800">
                    <strong>📝 Note:</strong> Meeting URL will be automatically generated when you create the Zoom meeting using the "Create Meeting" button after scheduling the session.
                  </p>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsCreateModalOpen(false);
                      setEditingWebinar(null);
                      resetForm();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createWebinarMutation.isPending || updateWebinarMutation.isPending}
                  >
                    {editingWebinar ? "Update Webinar" : "Schedule Webinar"}
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
                  <p className="text-2xl font-bold text-gray-900">{liveWebinars.length}</p>
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
                  <p className="text-2xl font-bold text-gray-900">{upcomingWebinars.length}</p>
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
                  <p className="text-2xl font-bold text-gray-900">{completedWebinars.length}</p>
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
                    {webinars?.reduce((sum, webinar) => sum + (webinar.currentParticipants || 0), 0) || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sessions Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Webinars</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Loading webinars...</p>
              </div>
            ) : webinars && webinars.length > 0 ? (
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
                  {webinars.map((webinar) => (
                    <TableRow key={webinar.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium text-gray-900">{webinar.title}</div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {webinar.description}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {new Date(webinar.scheduledAt).toLocaleString()}
                        </div>
                      </TableCell>
                      <TableCell>{webinar.duration} min</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {webinar.currentParticipants || 0}/{webinar.maxParticipants || 0}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={(statusColors as Record<string, string>)[webinar.status] || statusColors.scheduled}>
                          {webinar.status === "live" && (
                            <div className="w-2 h-2 bg-red-500 rounded-full mr-1 animate-pulse"></div>
                          )}
                          {webinar.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {webinar.status === "scheduled" && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => startWebinarMutation.mutate(webinar.id)}
                                disabled={startWebinarMutation.isPending}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <Play className="h-4 w-4" />
                              </Button>
                              {!webinar.zoomWebinarId && (
                                <Button
                                  size="sm"
                                  onClick={() => createZoomWebinarMutation.mutate(webinar.id)}
                                  disabled={createZoomWebinarMutation.isPending}
                                  className="bg-blue-600 hover:bg-blue-700"
                                  title="Create Zoom Webinar"
                                >
                                  <Video className="h-4 w-4" />
                                </Button>
                              )}
                            </>
                          )}
                          {webinar.status === "live" && (
                            <Button
                              size="sm"
                              onClick={() => endWebinarMutation.mutate(webinar.id)}
                              disabled={endWebinarMutation.isPending}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              <Square className="h-4 w-4" />
                            </Button>
                          )}
                          {webinar.zoomJoinUrl && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => window.open(webinar.zoomJoinUrl!, '_blank')}
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEdit(webinar)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteWebinarMutation.mutate(webinar.id)}
                            disabled={deleteWebinarMutation.isPending}
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
              <div className="text-center py-8">
                <p className="text-gray-500">No webinars scheduled yet.</p>
                <Button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="mt-4"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Schedule Your First Webinar
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}