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
import type { LiveSession, Course } from "@shared/schema";

export default function LiveSessionsManagement() {
  // WebSocket connection for real-time Zoom events
  const [zoomEvents, setZoomEvents] = useState<any[]>([]);
  const [connectionStatus, setConnectionStatus] = useState('Connecting...');

  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    const connectWebSocket = () => {
      const ws = new WebSocket(wsUrl);
      
      ws.onopen = () => {
        setConnectionStatus('Authenticating...');
      };
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'zoom-event') {
            setZoomEvents(prev => [data.payload, ...prev.slice(0, 49)]);
          } else if (data.type === 'connection_status') {
            setConnectionStatus(data.status);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
      
      ws.onclose = () => {
        setConnectionStatus('Disconnected');
        setTimeout(connectWebSocket, 2000);
      };
      
      ws.onerror = () => {
        setConnectionStatus('Error');
      };
    };
    
    connectWebSocket();
  }, []);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<LiveSession | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    scheduledAt: "",
    duration: "",
    maxParticipants: "100",
    courseId: undefined as string | undefined,
    meetingUrl: ""
  });

  const { data: sessions, isLoading } = useQuery<LiveSession[]>({
    queryKey: ["/api/admin/live-sessions"],
  });

  const { data: courses } = useQuery<Course[]>({
    queryKey: ["/api/admin/courses"],
  });

  const createSessionMutation = useMutation({
    mutationFn: (data: any) => apiRequest({ url: "/api/admin/live-sessions", method: "POST", body: data }),
    onSuccess: () => {
      toast({ title: "Live session created successfully!" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/live-sessions"] });
      setIsCreateModalOpen(false);
      resetForm();
    },
    onError: () => {
      toast({ title: "Error creating session", variant: "destructive" });
    },
  });

  const updateSessionMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      apiRequest({ url: `/api/admin/live-sessions/${id}`, method: "PUT", body: data }),
    onSuccess: () => {
      toast({ title: "Session updated successfully!" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/live-sessions"] });
      setEditingSession(null);
      resetForm();
    },
    onError: () => {
      toast({ title: "Error updating session", variant: "destructive" });
    },
  });

  const deleteSessionMutation = useMutation({
    mutationFn: (id: string) => apiRequest({ url: `/api/admin/live-sessions/${id}`, method: "DELETE" }),
    onSuccess: () => {
      toast({ title: "Session deleted successfully!" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/live-sessions"] });
    },
    onError: () => {
      toast({ title: "Error deleting session", variant: "destructive" });
    },
  });

  const createZoomMeetingMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      const response = await fetch(`/api/admin/live-sessions/${sessionId}/create-meeting`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        throw new Error('Failed to create Zoom meeting');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/live-sessions'] });
      toast({ title: "Zoom meeting created successfully!" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Failed to create Zoom meeting", 
        description: error.message,
        variant: "destructive" 
      });
    }
  });

  const startSessionMutation = useMutation({
    mutationFn: (id: string) => apiRequest({ url: `/api/admin/live-sessions/${id}/start`, method: "PUT" }),
    onSuccess: () => {
      toast({ title: "Session started successfully!" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/live-sessions"] });
    },
    onError: () => {
      toast({ title: "Error starting session", variant: "destructive" });
    },
  });

  const endSessionMutation = useMutation({
    mutationFn: (id: string) => apiRequest({ url: `/api/admin/live-sessions/${id}/end`, method: "PUT" }),
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
      duration: "",
      maxParticipants: "100",
      courseId: undefined,
      meetingUrl: ""
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const sessionData = {
      ...formData,
      duration: parseInt(formData.duration),
      maxParticipants: parseInt(formData.maxParticipants),
      scheduledAt: new Date(formData.scheduledAt).toISOString(),
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
      maxParticipants: (session.maxParticipants || 0).toString(),
      courseId: session.courseId || undefined,
      meetingUrl: session.meetingUrl || ""
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

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short'
    } as any);
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <div>
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Live Sessions with Zoom Integration</h1>
            <p className="text-gray-600 mt-1">Manage live learning sessions with comprehensive Zoom integration and real-time analytics</p>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant={connectionStatus === 'Connected' ? 'default' : 'destructive'}>
                {connectionStatus === 'Connected' ? '🟢' : connectionStatus === 'Authenticating...' ? '🟡' : '🔴'} Zoom WebSocket: {connectionStatus}
              </Badge>
              {connectionStatus === 'Disconnected' && (
                <p className="text-sm text-gray-600">
                  Zoom WebSocket requires ZOOM_SUBSCRIPTION_ID. Configure webhook-over-WebSocket in your Zoom app settings to get the subscription ID.
                </p>
              )}
            </div>
          </div>
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary text-white hover:bg-primary/90">
                <Plus className="h-4 w-4 mr-2" />
                Schedule Session
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingSession ? "Edit Session" : "Schedule New Session"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Session Title *
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
                      onValueChange={(value) => setFormData({ ...formData, courseId: value || undefined })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select course" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">No course</SelectItem>
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
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
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
                      onChange={(e) => setFormData({ ...formData, maxParticipants: e.target.value })}
                      placeholder="100"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meeting URL
                  </label>
                  <Input
                    value={formData.meetingUrl}
                    onChange={(e) => setFormData({ ...formData, meetingUrl: e.target.value })}
                    placeholder="https://zoom.us/j/123456789"
                  />
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
                    {editingSession ? "Update Session" : "Schedule Session"}
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

        {/* Sessions Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Loading sessions...</p>
              </div>
            ) : sessions && sessions.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Session</TableHead>
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
                          {session.currentParticipants || 0}/{session.maxParticipants || 0}
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
                            <>
                              <Button
                                size="sm"
                                onClick={() => startSessionMutation.mutate(session.id)}
                                disabled={startSessionMutation.isPending}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <Play className="h-4 w-4" />
                              </Button>
                              {!session.zoomMeetingId && (
                                <Button
                                  size="sm"
                                  onClick={() => createZoomMeetingMutation.mutate(session.id)}
                                  disabled={createZoomMeetingMutation.isPending}
                                  className="bg-blue-600 hover:bg-blue-700"
                                  title="Create Zoom Meeting"
                                >
                                  <Video className="h-4 w-4" />
                                </Button>
                              )}
                            </>
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
                          {session.zoomMeetingId && (
                            <Button
                              size="sm"
                              onClick={() => window.open(session.meetingUrl || '', '_blank')}
                              className="bg-indigo-600 hover:bg-indigo-700"
                              title="Join Zoom Meeting"
                            >
                              <ExternalLink className="h-4 w-4" />
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
                <h3 className="text-lg font-medium text-gray-900 mb-2">No sessions scheduled</h3>
                <p className="text-gray-600 mb-4">Get started by scheduling your first live session.</p>
                <Button onClick={() => setIsCreateModalOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Schedule Session
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
                <DialogTitle>Edit Session</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Session Title *
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
                      onValueChange={(value) => setFormData({ ...formData, courseId: value || undefined })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select course" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">No course</SelectItem>
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
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
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
                      onChange={(e) => setFormData({ ...formData, maxParticipants: e.target.value })}
                      placeholder="100"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meeting URL
                  </label>
                  <Input
                    value={formData.meetingUrl}
                    onChange={(e) => setFormData({ ...formData, meetingUrl: e.target.value })}
                    placeholder="https://zoom.us/j/123456789"
                  />
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
                    Update Session
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
