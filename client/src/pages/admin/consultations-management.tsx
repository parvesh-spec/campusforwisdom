import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Plus, Edit, Trash2, Calendar, Clock, User, DollarSign, Search, Filter, MessageSquare, Copy, Video, ExternalLink } from "lucide-react";
import type { Consultation, Expert, InsertConsultation } from "@shared/schema";
import StudentSearch from "@/components/ui/student-search";

export default function ConsultationsManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingConsultation, setEditingConsultation] = useState<Consultation | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Form state for creating/editing consultation
  const [formData, setFormData] = useState({
    expertId: "",
    studentId: "",
    title: "",
    description: "",
    scheduledAt: "",
    duration: 60,
    status: "scheduled",
    amount: "",
  });

  const [selectedStudentName, setSelectedStudentName] = useState("");

  const { data: consultations, isLoading } = useQuery<Consultation[]>({
    queryKey: ["/api/admin/consultations"],
  });

  const { data: experts } = useQuery<Expert[]>({
    queryKey: ["/api/admin/experts"],
  });

  const filteredConsultations = consultations?.filter((consultation) => {
    const matchesSearch = consultation.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         consultation.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || consultation.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const createConsultationMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest('POST', '/api/admin/consultations', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/consultations"] });
      setShowCreateModal(false);
      resetForm();
      toast({
        title: "Consultation created successfully",
        description: "The consultation has been scheduled.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error creating consultation",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    },
  });

  const updateConsultationMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return await apiRequest('PUT', `/api/admin/consultations/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/consultations"] });
      setShowCreateModal(false);
      setEditingConsultation(null);
      resetForm();
      toast({
        title: "Consultation updated successfully",
        description: "The consultation has been updated.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error updating consultation",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    },
  });

  const deleteConsultationMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest('DELETE', `/api/admin/consultations/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/consultations"] });
      toast({
        title: "Consultation deleted successfully",
        description: "The consultation has been removed.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error deleting consultation",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      expertId: "",
      studentId: "",
      title: "",
      description: "",
      scheduledAt: "",
      duration: 60,
      status: "scheduled",
      amount: "",
    });
    setSelectedStudentName("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingConsultation) {
      updateConsultationMutation.mutate({
        id: editingConsultation.id,
        data: formData
      });
    } else {
      createConsultationMutation.mutate(formData);
    }
  };

  const handleEdit = (consultation: Consultation) => {
    setEditingConsultation(consultation);
    setFormData({
      expertId: consultation.expertId,
      studentId: consultation.studentId,
      title: consultation.title,
      description: consultation.description || "",
      scheduledAt: new Date(consultation.scheduledAt).toISOString().slice(0, 16),
      duration: consultation.duration,
      status: consultation.status,
      amount: consultation.amount,
    });
    setSelectedStudentName(""); // Will be populated by the StudentSearch component
    setShowCreateModal(true);
  };

  // Calculate stats
  const totalConsultations = consultations?.length || 0;
  const completedConsultations = consultations?.filter(c => c.status === "completed").length || 0;
  const upcomingConsultations = consultations?.filter(c => c.status === "scheduled").length || 0;
  const totalRevenue = consultations
    ?.filter(c => c.status === "completed")
    .reduce((sum, c) => sum + (parseFloat(c.amount) || 0), 0) || 0;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled": return "bg-blue-100 text-blue-800";
      case "completed": return "bg-green-100 text-green-800";
      case "cancelled": return "bg-red-100 text-red-800";
      case "in-progress": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Consultations Management</h1>
          <p className="text-gray-600 mt-2">Manage AI expert consultations and bookings</p>
        </div>
        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditingConsultation(null); resetForm(); }}>
              <Plus className="h-4 w-4 mr-2" />
              Schedule Consultation
            </Button>
          </DialogTrigger>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Consultations</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalConsultations}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingConsultations}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedConsultations}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalRevenue.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search consultations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full sm:w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Consultations List */}
      <div className="space-y-4">
        {filteredConsultations?.map((consultation) => (
          <Card key={consultation.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={consultation.expert?.avatar || undefined} />
                      <AvatarFallback>
                        {consultation.expert?.name?.charAt(0) || "E"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-lg">{consultation.title}</h3>
                      <p className="text-sm text-gray-600">
                        Expert: {consultation.expert?.name || "Unknown"} | Student ID: {consultation.studentId}
                      </p>
                    </div>
                  </div>
                  
                  <p className="text-gray-700 mb-3">{consultation.description}</p>
                  
                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      {new Date(consultation.scheduledAt).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4 text-gray-400" />
                      {consultation.duration} minutes
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4 text-gray-400" />
                      ₹{consultation.amount}
                    </div>
                    {consultation.meetingUrl && (
                      <div className="flex items-center gap-1">
                        <MessageSquare className="h-4 w-4 text-green-600" />
                        <span className="text-green-600 text-xs">Meeting Ready</span>
                      </div>
                    )}
                    <Badge className={getStatusColor(consultation.status)}>
                      {consultation.status}
                    </Badge>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(consultation)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteConsultationMutation.mutate(consultation.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* Meeting Section - Full Width Below */}
              {consultation.meetingUrl && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
                  <div className="space-y-3">
                    <div className="flex flex-col gap-2">
                      <span className="text-sm font-medium text-gray-700">Join Meeting Link:</span>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 text-xs bg-white px-3 py-2 rounded border break-all select-all">
                          {consultation.meetingUrl}
                        </code>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            navigator.clipboard.writeText(consultation.meetingUrl!);
                            toast({ title: "Join link copied!", description: "Meeting join link copied to clipboard" });
                          }}
                          className="text-green-600 hover:text-green-700 shrink-0"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {consultation.startUrl && (
                      <div className="flex items-center gap-2">
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => window.open(consultation.startUrl!, '_blank')}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Video className="h-4 w-4 mr-2" />
                          Start Meeting
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            navigator.clipboard.writeText(consultation.startUrl!);
                            toast({ title: "Start link copied!", description: "Meeting start link copied to clipboard" });
                          }}
                          className="text-blue-600 hover:text-blue-700"
                          title="Copy Start Link"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
        
        {!filteredConsultations?.length && (
          <Card className="text-center py-16">
            <CardContent>
              <div className="text-6xl mb-4">📅</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No consultations found</h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || statusFilter !== "all"
                  ? "Try adjusting your search criteria."
                  : "Start by scheduling your first consultation."}
              </p>
              <Button onClick={() => { setShowCreateModal(true); resetForm(); }}>
                <Plus className="h-4 w-4 mr-2" />
                Schedule First Consultation
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Create/Edit Consultation Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {editingConsultation ? "Edit Consultation" : "Schedule New Consultation"}
            </DialogTitle>
            <DialogDescription>
              {editingConsultation ? "Update consultation details and scheduling." : "Schedule a new AI expert consultation."}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expertId">AI Expert *</Label>
                <Select
                  value={formData.expertId || ""}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, expertId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select expert" />
                  </SelectTrigger>
                  <SelectContent>
                    {experts?.map((expert) => (
                      <SelectItem key={expert.id} value={expert.id}>
                        {expert.name} - {expert.specialization}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <StudentSearch
                  value={formData.studentId || ""}
                  onChange={(studentId, studentName) => {
                    setFormData(prev => ({ ...prev, studentId }));
                    setSelectedStudentName(studentName);
                  }}
                  placeholder="Search student by name..."
                  label="Student"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Consultation Topic *</Label>
              <Input
                id="title"
                required
                value={formData.title || ""}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="AI Strategy Discussion"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                rows={3}
                value={formData.description || ""}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Detailed consultation requirements and objectives..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="scheduledAt">Scheduled Date & Time *</Label>
                <Input
                  id="scheduledAt"
                  type="datetime-local"
                  required
                  value={formData.scheduledAt}
                  onChange={(e) => setFormData(prev => ({ ...prev, scheduledAt: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (minutes) *</Label>
                <Input
                  id="duration"
                  type="number"
                  min="30"
                  max="180"
                  step="15"
                  required
                  value={formData.duration || 60}
                  onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="amount">Price (₹) *</Label>
                <Input
                  id="amount"
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  value={formData.amount || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                  placeholder="2500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status || "scheduled"}
                onValueChange={(value: any) => setFormData(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowCreateModal(false);
                  setEditingConsultation(null);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={createConsultationMutation.isPending || updateConsultationMutation.isPending}
              >
                {createConsultationMutation.isPending || updateConsultationMutation.isPending 
                  ? "Saving..." 
                  : editingConsultation ? "Update Consultation" : "Schedule Consultation"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}