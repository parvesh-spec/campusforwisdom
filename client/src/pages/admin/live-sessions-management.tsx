import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Plus, Edit, Trash2, Video, Users, Calendar, Clock, Play, Square, Copy, X } from "lucide-react";
import type { LiveSession, Expert, WebinarAttendee } from "@shared/schema";

export default function WebinarManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<LiveSession | null>(null);
  const [managingParticipants, setManagingParticipants] = useState<LiveSession | null>(null);
  const [deletingSession, setDeletingSession] = useState<LiveSession | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    agenda: "",
    keyPoints: "",
    prerequisites: "",
    targetAudience: "",
    whatYouWillLearn: "",
    faq: [{ question: "", answer: "" }],
    resources: "",
    speakerBio: "",
    tags: "",
    difficulty: "Beginner",
    language: "Hindi",
    category: "",
    scheduledAt: "",
    duration: "60",
    price: "499",
    timezone: "Asia/Calcutta",
    participantEmails: "",
    expertId: undefined as string | undefined
  });

  const { data: sessions, isLoading } = useQuery<LiveSession[]>({
    queryKey: ["/api/admin/live-sessions"],
  });

  const { data: experts } = useQuery<Expert[]>({
    queryKey: ["/api/admin/experts"],
  });

  // Fetch attendees for the managing participants session
  const { data: managingParticipantsAttendees } = useQuery<WebinarAttendee[]>({
    queryKey: ["/api/admin/webinars", managingParticipants?.id, "attendees"],
    enabled: !!managingParticipants?.id,
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
      agenda: "",
      keyPoints: "",
      prerequisites: "",
      targetAudience: "",
      whatYouWillLearn: "",
      faq: [{ question: "", answer: "" }],
      resources: "",
      speakerBio: "",
      tags: "",
      difficulty: "Beginner",
      language: "Hindi",
      category: "",
      scheduledAt: "",
      duration: "60",
      price: "499",
      timezone: "Asia/Calcutta",
      participantEmails: "",
      expertId: undefined
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
      agenda: formData.agenda,
      keyPoints: formData.keyPoints.split('\n').filter(point => point.trim().length > 0),
      prerequisites: formData.prerequisites,
      targetAudience: formData.targetAudience,
      whatYouWillLearn: formData.whatYouWillLearn.split('\n').filter(item => item.trim().length > 0),
      faq: formData.faq.filter(item => item.question.trim() && item.answer.trim()),
      resources: formData.resources.split('\n').filter(resource => resource.trim().length > 0),
      speakerBio: formData.speakerBio,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0),
      difficulty: formData.difficulty,
      language: formData.language,
      category: formData.category,
      duration: parseInt(formData.duration),
      price: formData.price, // Keep as string since schema expects varchar
      scheduledAt: new Date(formData.scheduledAt).toISOString(),
      timezone: formData.timezone,
      participants,
      expertId: formData.expertId === "none" ? undefined : formData.expertId
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
      agenda: (session as any).agenda || "",
      keyPoints: ((session as any).keyPoints || []).join('\n'),
      prerequisites: (session as any).prerequisites || "",
      targetAudience: (session as any).targetAudience || "",
      whatYouWillLearn: ((session as any).whatYouWillLearn || []).join('\n'),
      faq: (session as any).faq || [{ question: "", answer: "" }],
      resources: ((session as any).resources || []).join('\n'),
      speakerBio: (session as any).speakerBio || "",
      tags: ((session as any).tags || []).join(', '),
      difficulty: (session as any).difficulty || "Beginner",
      language: (session as any).language || "Hindi",
      category: (session as any).category || "",
      scheduledAt: new Date(session.scheduledAt).toISOString().slice(0, 16),
      duration: session.duration.toString(),
      price: session.price?.toString() || "499",
      timezone: session.timezone || "Asia/Calcutta",
      participantEmails: (session.participants || []).join(', '),
      expertId: session.expertId || undefined
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
            <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingSession ? "Edit Webinar" : "Create New Webinar"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6">
                <Tabs defaultValue="basic" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="basic">Basic Info</TabsTrigger>
                    <TabsTrigger value="content">Content Details</TabsTrigger>
                    <TabsTrigger value="faq">FAQ</TabsTrigger>
                    <TabsTrigger value="settings">Settings</TabsTrigger>
                  </TabsList>

                  <TabsContent value="basic" className="space-y-4 mt-6">
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
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          AI Expert
                        </label>
                        <Select
                          value={formData.expertId || "none"}
                          onValueChange={(value) => setFormData({ ...formData, expertId: value === "none" ? undefined : value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select AI Expert" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">No expert</SelectItem>
                            {experts?.map((expert) => (
                              <SelectItem key={expert.id} value={expert.id}>
                                {expert.name} - {expert.specialization}
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
                        placeholder="Brief description of the webinar..."
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Category
                        </label>
                        <Select
                          value={formData.category}
                          onValueChange={(value) => setFormData({ ...formData, category: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="AI Development">AI Development</SelectItem>
                            <SelectItem value="AI Video Creation">AI Video Creation</SelectItem>
                            <SelectItem value="AI Presentation Design">AI Presentation Design</SelectItem>
                            <SelectItem value="Machine Learning">Machine Learning</SelectItem>
                            <SelectItem value="Data Science">Data Science</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Difficulty Level
                        </label>
                        <Select
                          value={formData.difficulty}
                          onValueChange={(value) => setFormData({ ...formData, difficulty: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select difficulty" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Beginner">Beginner</SelectItem>
                            <SelectItem value="Intermediate">Intermediate</SelectItem>
                            <SelectItem value="Advanced">Advanced</SelectItem>
                          </SelectContent>
                        </Select>
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
                            <SelectValue placeholder="Select language" />
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
                          Tags
                        </label>
                        <Input
                          value={formData.tags}
                          onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                          placeholder="AI, Marketing, Strategy (comma separated)"
                        />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="content" className="space-y-4 mt-6 max-h-[60vh] overflow-y-auto pr-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Detailed Agenda
                      </label>
                      <Textarea
                        value={formData.agenda}
                        onChange={(e) => setFormData({ ...formData, agenda: e.target.value })}
                        placeholder="Detailed session agenda covering key topics, objectives, and timeline..."
                        rows={4}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Key Points (one per line)
                      </label>
                      <Textarea
                        value={formData.keyPoints}
                        onChange={(e) => setFormData({ ...formData, keyPoints: e.target.value })}
                        placeholder="Main topics to be covered&#10;Practical applications&#10;Industry examples"
                        rows={4}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        What You'll Learn (one per line)
                      </label>
                      <Textarea
                        value={formData.whatYouWillLearn}
                        onChange={(e) => setFormData({ ...formData, whatYouWillLearn: e.target.value })}
                        placeholder="How to implement AI marketing strategies&#10;Tools and techniques for automation&#10;Best practices and case studies"
                        rows={4}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Prerequisites
                        </label>
                        <Textarea
                          value={formData.prerequisites}
                          onChange={(e) => setFormData({ ...formData, prerequisites: e.target.value })}
                          placeholder="Basic knowledge of marketing, Computer with internet access..."
                          rows={3}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Target Audience
                        </label>
                        <Textarea
                          value={formData.targetAudience}
                          onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                          placeholder="Marketing professionals, Business owners, Students..."
                          rows={3}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Resources (one per line)
                      </label>
                      <Textarea
                        value={formData.resources}
                        onChange={(e) => setFormData({ ...formData, resources: e.target.value })}
                        placeholder="https://example.com/tool1&#10;https://example.com/guide&#10;https://example.com/templates"
                        rows={3}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Speaker Bio
                      </label>
                      <Textarea
                        value={formData.speakerBio}
                        onChange={(e) => setFormData({ ...formData, speakerBio: e.target.value })}
                        placeholder="Additional information about the speaker/expert for this session..."
                        rows={3}
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="faq" className="space-y-4 mt-6 max-h-[60vh] overflow-y-auto pr-2">
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
                                variant="ghost"
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
                            placeholder="Question"
                            value={faqItem.question}
                            onChange={(e) => {
                              const newFaq = [...formData.faq];
                              newFaq[index].question = e.target.value;
                              setFormData({ ...formData, faq: newFaq });
                            }}
                          />
                          <Textarea
                            placeholder="Answer"
                            value={faqItem.answer}
                            onChange={(e) => {
                              const newFaq = [...formData.faq];
                              newFaq[index].answer = e.target.value;
                              setFormData({ ...formData, faq: newFaq });
                            }}
                            rows={2}
                          />
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setFormData({
                            ...formData,
                            faq: [...formData.faq, { question: "", answer: "" }]
                          });
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add FAQ
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="settings" className="space-y-4 mt-6">
                    <div className="grid grid-cols-3 gap-4">
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
                          Session Fee (₹) *
                        </label>
                        <Input
                          required
                          type="number"
                          value={formData.price}
                          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                          placeholder="499"
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
                        Scheduled Date & Time *
                      </label>
                      <Input
                        required
                        type="datetime-local"
                        value={formData.scheduledAt}
                        onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
                        className="w-full"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Participant Emails (comma separated)
                      </label>
                      <Textarea
                        value={formData.participantEmails}
                        onChange={(e) => setFormData({ ...formData, participantEmails: e.target.value })}
                        placeholder="participant1@example.com, participant2@example.com"
                        rows={3}
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Pre-register specific participants (optional)
                      </p>
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="flex justify-end space-x-2 pt-4 border-t">
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
                    <TableHead>Expert</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Registration Link</TableHead>
                    <TableHead>Participants</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sessions.map((session) => {
                    const sessionExpert = experts?.find(expert => expert.id === session.expertId);
                    return (
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
                          {sessionExpert ? (
                            <div className="flex items-center space-x-2">
                              {sessionExpert.avatar && (
                                <img 
                                  src={sessionExpert.avatar} 
                                  alt={sessionExpert.name}
                                  className="w-6 h-6 rounded-full object-cover"
                                />
                              )}
                              <span className="font-medium text-gray-900">{sessionExpert.name}</span>
                            </div>
                          ) : (
                            <span className="text-gray-400">No expert assigned</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {new Date(session.scheduledAt).toLocaleString()}
                        </div>
                      </TableCell>
                      <TableCell>{session.duration} min</TableCell>
                      <TableCell>
                        {session.registrationLink ? (
                          <div className="flex items-center space-x-2">
                            <a
                              href={session.registrationLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 text-sm truncate max-w-[150px] block"
                              title={session.registrationLink}
                            >
                              {session.registrationLink.replace('https://', '')}
                            </a>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => navigator.clipboard.writeText(session.registrationLink || '')}
                              className="p-1 h-6 w-6"
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">No link available</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="flex items-center justify-between">
                            <span>{session.currentParticipants || 0}/{session.maxParticipants || 100}</span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setManagingParticipants(session)}
                              className="p-1 h-6 w-6 ml-2"
                              title="Manage Participants"
                            >
                              <Users className="h-3 w-3" />
                            </Button>
                          </div>
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
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => startEditing(session)}
                            title="Edit Webinar"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setDeletingSession(session)}
                            disabled={deleteSessionMutation.isPending}
                            className="text-red-600 hover:text-red-700"
                            title="Delete Webinar"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                    );
                  })}
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
            <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Edit Webinar</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6">
                <Tabs defaultValue="basic" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="basic">Basic Info</TabsTrigger>
                    <TabsTrigger value="content">Content Details</TabsTrigger>
                    <TabsTrigger value="faq">FAQ</TabsTrigger>
                    <TabsTrigger value="settings">Settings</TabsTrigger>
                  </TabsList>

                  <TabsContent value="basic" className="space-y-4 mt-6">
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
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          AI Expert
                        </label>
                        <Select
                          value={formData.expertId || "none"}
                          onValueChange={(value) => setFormData({ ...formData, expertId: value === "none" ? undefined : value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select AI Expert" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">No expert</SelectItem>
                            {experts?.map((expert) => (
                              <SelectItem key={expert.id} value={expert.id}>
                                {expert.name} - {expert.specialization}
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
                        placeholder="Brief description of the webinar"
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Category
                        </label>
                        <Select
                          value={formData.category}
                          onValueChange={(value) => setFormData({ ...formData, category: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="AI Development">AI Development</SelectItem>
                            <SelectItem value="Video Creation">Video Creation</SelectItem>
                            <SelectItem value="Presentation Design">Presentation Design</SelectItem>
                            <SelectItem value="Marketing">Marketing</SelectItem>
                            <SelectItem value="Strategy">Strategy</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Difficulty Level
                        </label>
                        <Select
                          value={formData.difficulty}
                          onValueChange={(value) => setFormData({ ...formData, difficulty: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select difficulty" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Beginner">Beginner</SelectItem>
                            <SelectItem value="Intermediate">Intermediate</SelectItem>
                            <SelectItem value="Advanced">Advanced</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Language
                      </label>
                      <Select
                        value={formData.language}
                        onValueChange={(value) => setFormData({ ...formData, language: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Hindi">Hindi</SelectItem>
                          <SelectItem value="English">English</SelectItem>
                          <SelectItem value="Mixed">Mixed (Hindi + English)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tags
                      </label>
                      <Input
                        value={formData.tags}
                        onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                        placeholder="AI, Marketing, Strategy (comma separated)"
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="content" className="space-y-4 mt-6 max-h-[60vh] overflow-y-auto px-1">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Detailed Agenda
                      </label>
                      <Textarea
                        value={formData.agenda}
                        onChange={(e) => setFormData({ ...formData, agenda: e.target.value })}
                        placeholder="Detailed agenda covering key topics, objectives, and learning outcomes..."
                        rows={4}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Key Points & Highlights
                      </label>
                      <Textarea
                        value={formData.keyPoints}
                        onChange={(e) => setFormData({ ...formData, keyPoints: e.target.value })}
                        placeholder="• Main discussion points&#10;• Key takeaways&#10;• Important highlights"
                        rows={4}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Prerequisites
                      </label>
                      <Textarea
                        value={formData.prerequisites}
                        onChange={(e) => setFormData({ ...formData, prerequisites: e.target.value })}
                        placeholder="What participants should know before joining..."
                        rows={3}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Target Audience
                      </label>
                      <Textarea
                        value={formData.targetAudience}
                        onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                        placeholder="Who should attend this webinar..."
                        rows={3}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        What You Will Learn
                      </label>
                      <Textarea
                        value={formData.whatYouWillLearn}
                        onChange={(e) => setFormData({ ...formData, whatYouWillLearn: e.target.value })}
                        placeholder="Learning objectives and outcomes..."
                        rows={4}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Resources & Materials
                      </label>
                      <Textarea
                        value={formData.resources}
                        onChange={(e) => setFormData({ ...formData, resources: e.target.value })}
                        placeholder="Additional resources, links, or materials..."
                        rows={3}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Speaker Bio & Background
                      </label>
                      <Textarea
                        value={formData.speakerBio}
                        onChange={(e) => setFormData({ ...formData, speakerBio: e.target.value })}
                        placeholder="About the speaker/presenter..."
                        rows={4}
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="faq" className="space-y-4 mt-6 max-h-[60vh] overflow-y-auto px-1">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <label className="block text-sm font-medium text-gray-700">
                          Frequently Asked Questions
                        </label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setFormData({
                            ...formData,
                            faq: [...formData.faq, { question: "", answer: "" }]
                          })}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add FAQ
                        </Button>
                      </div>
                      
                      {formData.faq.map((faq, index) => (
                        <div key={index} className="border rounded-lg p-4 space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-600">FAQ #{index + 1}</span>
                            {formData.faq.length > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
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
                          
                          <div>
                            <label className="block text-sm text-gray-600 mb-1">Question</label>
                            <Input
                              value={faq.question}
                              onChange={(e) => {
                                const newFaq = [...formData.faq];
                                newFaq[index].question = e.target.value;
                                setFormData({ ...formData, faq: newFaq });
                              }}
                              placeholder="What is the main focus of this webinar?"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm text-gray-600 mb-1">Answer</label>
                            <Textarea
                              value={faq.answer}
                              onChange={(e) => {
                                const newFaq = [...formData.faq];
                                newFaq[index].answer = e.target.value;
                                setFormData({ ...formData, faq: newFaq });
                              }}
                              placeholder="This webinar focuses on..."
                              rows={3}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="settings" className="space-y-4 mt-6">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Duration (minutes) *
                        </label>
                        <Input
                          type="number"
                          required
                          min="15"
                          max="480"
                          value={formData.duration}
                          onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Session Fee (₹) *
                        </label>
                        <Input
                          type="number"
                          required
                          min="0"
                          value={formData.price}
                          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
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
                            <SelectItem value="America/Los_Angeles">America/Los_Angeles (PST)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Scheduled Date & Time *
                      </label>
                      <Input
                        type="datetime-local"
                        required
                        value={formData.scheduledAt}
                        onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
                      />
                    </div>



                    {/* Pre-registered Participants (Only for Create) */}
                    {!editingSession && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Pre-registered Participants (Email Addresses)
                        </label>
                        <Textarea
                          value={formData.participantEmails}
                          onChange={(e) => setFormData({ ...formData, participantEmails: e.target.value })}
                          placeholder="participant1@example.com, participant2@example.com"
                          rows={3}
                        />
                        <p className="text-sm text-gray-500 mt-1">
                          Comma-separated email addresses of pre-registered participants
                        </p>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>

                <div className="flex justify-end space-x-2 pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setEditingSession(null)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createSessionMutation.isPending}>
                    {createSessionMutation.isPending ? "Updating..." : "Update Webinar"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}

        {/* Participant Management Modal */}
        {managingParticipants && (
          <Dialog open={true} onOpenChange={() => setManagingParticipants(null)}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Manage Participants - {managingParticipants.title}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {/* Registration Link Section */}
                <div className="border rounded-lg p-4 bg-blue-50">
                  <h3 className="font-medium text-gray-900 mb-2">Registration Link</h3>
                  {managingParticipants.registrationLink ? (
                    <div className="flex items-center space-x-2">
                      <Input 
                        value={managingParticipants.registrationLink} 
                        readOnly 
                        className="flex-1"
                      />
                      <Button
                        size="sm"
                        onClick={() => {
                          if (managingParticipants.registrationLink) {
                            navigator.clipboard.writeText(managingParticipants.registrationLink);
                            toast({ title: "Registration link copied!" });
                          }
                        }}
                      >
                        <Copy className="h-4 w-4 mr-1" />
                        Copy
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => managingParticipants.registrationLink && window.open(managingParticipants.registrationLink, '_blank')}
                      >
                        Open
                      </Button>
                    </div>
                  ) : (
                    <p className="text-gray-500">Registration link not available</p>
                  )}
                </div>

                {/* Current Participants */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Current Participants</h3>
                  <div className="border rounded-lg p-3 bg-gray-50 min-h-[100px] max-h-[300px] overflow-y-auto">
                    {managingParticipantsAttendees && managingParticipantsAttendees.length > 0 ? (
                      <div className="space-y-2">
                        {managingParticipantsAttendees.map((attendee) => (
                          <div key={attendee.id} className="flex items-center justify-between bg-white p-3 rounded border">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm font-medium">{attendee.participantName || 'Anonymous'}</span>
                                <Badge variant="outline" className="text-xs">
                                  {attendee.status === 'registered' ? 'Registered' : attendee.status}
                                </Badge>
                                {attendee.role && attendee.role !== 'attendee' && (
                                  <Badge variant="secondary" className="text-xs capitalize">
                                    {attendee.role}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-gray-500">{attendee.participantEmail}</p>
                              {attendee.joinedAt && (
                                <p className="text-xs text-gray-400">
                                  Joined: {new Date(attendee.joinedAt).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                // TODO: Add remove participant functionality
                                toast({ title: "Remove participant feature coming soon!" });
                              }}
                              className="text-red-600 hover:text-red-800 ml-2"
                            >
                              Remove
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-8">No participants registered yet</p>
                    )}
                  </div>
                </div>



                {/* Webinar Stats */}
                <div className="border-t pt-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-blue-600">
                        {managingParticipantsAttendees?.length || 0}
                      </p>
                      <p className="text-sm text-gray-600">Registered</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-green-600">
                        {managingParticipants.maxParticipants || 100}
                      </p>
                      <p className="text-sm text-gray-600">Max Capacity</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-purple-600">
                        {managingParticipants.duration}min
                      </p>
                      <p className="text-sm text-gray-600">Duration</p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button onClick={() => setManagingParticipants(null)}>
                    Close
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Delete Confirmation Dialog */}
        {deletingSession && (
          <Dialog open={true} onOpenChange={() => setDeletingSession(null)}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Delete Webinar</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-gray-600">
                  Are you sure you want to delete "<strong>{deletingSession.title}</strong>"? 
                  This action cannot be undone.
                </p>
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setDeletingSession(null)}
                    disabled={deleteSessionMutation.isPending}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      deleteSessionMutation.mutate(deletingSession.id);
                      setDeletingSession(null);
                    }}
                    disabled={deleteSessionMutation.isPending}
                  >
                    {deleteSessionMutation.isPending ? "Deleting..." : "Delete"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}
