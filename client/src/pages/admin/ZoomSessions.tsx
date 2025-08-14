import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Video, Users, Clock, Calendar, BarChart3, Play, ExternalLink, Download } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { LiveSession } from "@shared/schema";

interface SessionAnalytics {
  totalParticipants: number;
  avgAttendanceTime: number;
  peakAttendance: number;
  engagementScore: string;
  recordingDuration: number;
  chatMessages: number;
  questionsAsked: number;
  pollResponses: number;
}

interface SessionAttendee {
  id: string;
  userId: string;
  zoomParticipantId: string;
  joinedAt: string;
  leftAt?: string;
  totalDuration: number;
  attended: boolean;
}

interface ParticipantEngagement {
  id: string;
  userId: string;
  speakingTime: number;
  chatMessages: number;
  reactionsCount: number;
  handRaises: number;
  pollParticipation: number;
  screenShareTime: number;
  attentionScore: string;
}

export default function ZoomSessions() {
  const [selectedSession, setSelectedSession] = useState<LiveSession | null>(null);
  const queryClient = useQueryClient();

  const { data: sessions = [], isLoading } = useQuery<LiveSession[]>({
    queryKey: ['/api/admin/live-sessions']
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
    }
  });

  const { data: analytics } = useQuery<{
    analytics: SessionAnalytics[];
    attendees: SessionAttendee[];
    engagement: ParticipantEngagement[];
  }>({
    queryKey: ['/api/admin/live-sessions', selectedSession?.id, 'analytics'],
    enabled: !!selectedSession?.id
  });

  const { data: recording } = useQuery({
    queryKey: ['/api/admin/live-sessions', selectedSession?.id, 'recording'],
    enabled: !!selectedSession?.id && selectedSession?.status === 'completed'
  });

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short'
    } as any);
  };

  if (isLoading) {
    return <div className="flex items-center justify-center p-8">Loading sessions...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Zoom Live Sessions</h1>
          <p className="text-muted-foreground">Manage live sessions with Zoom integration</p>
        </div>
      </div>

      {/* Session Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
            <Video className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sessions.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Live Now</CardTitle>
            <Play className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {sessions.filter(s => s.status === 'live').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {sessions.filter(s => s.status === 'scheduled').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <BarChart3 className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {sessions.filter(s => s.status === 'completed').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sessions Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Sessions</CardTitle>
          <CardDescription>Manage and monitor your live sessions</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Session</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Participants</TableHead>
                <TableHead>Zoom Meeting</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sessions.map((session) => (
                <TableRow key={session.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{session.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {formatDuration(session.duration)} duration
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      {formatDateTime(session.scheduledAt)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={
                      session.status === 'live' ? 'default' :
                      session.status === 'scheduled' ? 'secondary' :
                      session.status === 'completed' ? 'outline' : 'destructive'
                    }>
                      {session.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      {session.currentParticipants}/{session.maxParticipants}
                    </div>
                  </TableCell>
                  <TableCell>
                    {session.zoomMeetingId ? (
                      <div className="space-y-1">
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          Connected
                        </Badge>
                        {session.zoomJoinUrl && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => session.zoomJoinUrl && window.open(session.zoomJoinUrl, '_blank')}
                            className="h-auto p-1"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => createZoomMeetingMutation.mutate(session.id)}
                        disabled={createZoomMeetingMutation.isPending}
                      >
                        {createZoomMeetingMutation.isPending ? 'Creating...' : 'Create Meeting'}
                      </Button>
                    )}
                  </TableCell>
                  <TableCell>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedSession(session)}
                        >
                          View Details
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>{session.title}</DialogTitle>
                          <DialogDescription>
                            Session analytics and participant data
                          </DialogDescription>
                        </DialogHeader>

                        <Tabs defaultValue="overview" className="w-full">
                          <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="overview">Overview</TabsTrigger>
                            <TabsTrigger value="attendees">Attendees</TabsTrigger>
                            <TabsTrigger value="engagement">Engagement</TabsTrigger>
                            <TabsTrigger value="recording">Recording</TabsTrigger>
                          </TabsList>

                          <TabsContent value="overview" className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                              <Card>
                                <CardHeader>
                                  <CardTitle className="text-lg">Session Info</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                  <div className="flex justify-between">
                                    <span>Status:</span>
                                    <Badge variant={session.status === 'live' ? 'default' : 'secondary'}>
                                      {session.status}
                                    </Badge>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Duration:</span>
                                    <span>{formatDuration(session.duration)}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Max Participants:</span>
                                    <span>{session.maxParticipants}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Current:</span>
                                    <span>{session.currentParticipants}</span>
                                  </div>
                                </CardContent>
                              </Card>

                              {analytics?.analytics?.[0] && (
                                <Card>
                                  <CardHeader>
                                    <CardTitle className="text-lg">Analytics</CardTitle>
                                  </CardHeader>
                                  <CardContent className="space-y-2">
                                    <div className="flex justify-between">
                                      <span>Total Participants:</span>
                                      <span>{analytics.analytics[0].totalParticipants}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>Peak Attendance:</span>
                                      <span>{analytics.analytics[0].peakAttendance}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>Avg. Time:</span>
                                      <span>{formatDuration(analytics.analytics[0].avgAttendanceTime)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>Engagement Score:</span>
                                      <span>{analytics.analytics[0].engagementScore}/5.0</span>
                                    </div>
                                  </CardContent>
                                </Card>
                              )}
                            </div>
                          </TabsContent>

                          <TabsContent value="attendees" className="space-y-4">
                            <Card>
                              <CardHeader>
                                <CardTitle>Session Attendees</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead>User ID</TableHead>
                                      <TableHead>Joined At</TableHead>
                                      <TableHead>Duration</TableHead>
                                      <TableHead>Status</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {analytics?.attendees?.map((attendee) => (
                                      <TableRow key={attendee.id}>
                                        <TableCell>{attendee.userId}</TableCell>
                                        <TableCell>{formatDateTime(attendee.joinedAt.toString())}</TableCell>
                                        <TableCell>{formatDuration(attendee.totalDuration)}</TableCell>
                                        <TableCell>
                                          <Badge variant={attendee.attended ? 'default' : 'secondary'}>
                                            {attendee.attended ? 'Attended' : 'Absent'}
                                          </Badge>
                                        </TableCell>
                                      </TableRow>
                                    )) || (
                                      <TableRow>
                                        <TableCell colSpan={4} className="text-center text-muted-foreground">
                                          No attendee data available
                                        </TableCell>
                                      </TableRow>
                                    )}
                                  </TableBody>
                                </Table>
                              </CardContent>
                            </Card>
                          </TabsContent>

                          <TabsContent value="engagement" className="space-y-4">
                            <Card>
                              <CardHeader>
                                <CardTitle>Participant Engagement</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead>User</TableHead>
                                      <TableHead>Speaking Time</TableHead>
                                      <TableHead>Chat Messages</TableHead>
                                      <TableHead>Reactions</TableHead>
                                      <TableHead>Attention Score</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {analytics?.engagement?.map((engagement) => (
                                      <TableRow key={engagement.id}>
                                        <TableCell>{engagement.userId}</TableCell>
                                        <TableCell>{Math.floor(engagement.speakingTime / 60)}m {engagement.speakingTime % 60}s</TableCell>
                                        <TableCell>{engagement.chatMessages}</TableCell>
                                        <TableCell>{engagement.reactionsCount}</TableCell>
                                        <TableCell>
                                          <Badge variant={
                                            parseFloat(engagement.attentionScore) >= 4 ? 'default' :
                                            parseFloat(engagement.attentionScore) >= 3 ? 'secondary' : 'outline'
                                          }>
                                            {engagement.attentionScore}/5.0
                                          </Badge>
                                        </TableCell>
                                      </TableRow>
                                    )) || (
                                      <TableRow>
                                        <TableCell colSpan={5} className="text-center text-muted-foreground">
                                          No engagement data available
                                        </TableCell>
                                      </TableRow>
                                    )}
                                  </TableBody>
                                </Table>
                              </CardContent>
                            </Card>
                          </TabsContent>

                          <TabsContent value="recording" className="space-y-4">
                            <Card>
                              <CardHeader>
                                <CardTitle>Session Recording</CardTitle>
                              </CardHeader>
                              <CardContent>
                                {recording ? (
                                  <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 border rounded">
                                      <div>
                                        <h3 className="font-medium">Session Recording</h3>
                                        <p className="text-sm text-muted-foreground">
                                          Duration: {formatDuration(analytics?.analytics?.[0]?.recordingDuration || 0)}
                                        </p>
                                      </div>
                                      <Button>
                                        <Download className="h-4 w-4 mr-2" />
                                        Download
                                      </Button>
                                    </div>
                                  </div>
                                ) : session.status === 'completed' ? (
                                  <p className="text-center text-muted-foreground py-8">
                                    No recording available for this session
                                  </p>
                                ) : (
                                  <p className="text-center text-muted-foreground py-8">
                                    Recording will be available after session completion
                                  </p>
                                )}
                              </CardContent>
                            </Card>
                          </TabsContent>
                        </Tabs>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
              {sessions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    No sessions found. Create your first live session to get started.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}