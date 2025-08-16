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
import { Plus, Edit, Trash2, Calendar, Clock, User as UserIcon, DollarSign, Search, Filter, MessageSquare, Copy, Video, ExternalLink } from "lucide-react";
import type { Consultation, Expert, User, InsertConsultation } from "@shared/schema";

// Extended consultation type with joined data
type ConsultationWithDetails = Consultation & {
  expert?: Expert | null;
  student?: User | null;
};
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

  // Additional state for date/time selection
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>("");
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);

  const [selectedStudentName, setSelectedStudentName] = useState("");

  const { data: consultations, isLoading } = useQuery<ConsultationWithDetails[]>({
    queryKey: ["/api/admin/consultations"],
    refetchInterval: 5000, // Auto-refresh every 5 seconds
    refetchIntervalInBackground: true, // Keep refreshing even when tab is not active
  });

  const { data: experts } = useQuery<Expert[]>({
    queryKey: ["/api/admin/experts"],
  });

  // Get selected expert's details
  const selectedExpert = experts?.find(expert => expert.id === formData.expertId);

  // Function to fetch booked slots for expert and date
  const fetchBookedSlots = async (expertId: string, date: string) => {
    try {
      const response = await fetch(`/api/experts/${expertId}/booked-slots/${date}`);
      const slots = await response.json();
      setBookedSlots(slots);
    } catch (error) {
      console.error('Error fetching booked slots:', error);
      setBookedSlots([]);
    }
  };

  // Function to get available time slots for selected date (excluding booked ones)
  const getAvailableSlotsForDate = (date: string): string[] => {
    if (!selectedExpert?.availableSlots || !date) return [];
    
    const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
    
    // Filter slots for the selected day (format from DB: "Monday-01:00")
    const daySlots = selectedExpert.availableSlots.filter(slot => 
      slot.startsWith(dayOfWeek + '-')
    );
    
    // Extract time from slots and convert to display format
    const allSlots = daySlots.map(slot => {
      // Extract time from "Monday-01:00" format
      const timeMatch = slot.match(/-(\d{2}:\d{2})$/);
      if (timeMatch) {
        const time = timeMatch[1];
        // Convert to 12-hour format for display
        const [hours, minutes] = time.split(':');
        const hour24 = parseInt(hours);
        const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
        const ampm = hour24 >= 12 ? 'PM' : 'AM';
        return `${hour12}:${minutes} ${ampm}`;
      }
      return slot;
    }).sort((a, b) => {
      // Sort by time
      const timeA = a.includes('AM') || a.includes('PM') ? a : '12:00 AM';
      const timeB = b.includes('AM') || b.includes('PM') ? b : '12:00 AM';
      return timeA.localeCompare(timeB);
    });

    // Filter out booked slots
    return allSlots.filter(slot => !bookedSlots.includes(slot));
  };



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
    setSelectedDate("");
    setSelectedTimeSlot("");
    setBookedSlots([]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate that date and time slot are selected
    if (!selectedDate || !selectedTimeSlot || !formData.scheduledAt) {
      toast({
        title: "Missing Information",
        description: "Please select both date and time slot.",
        variant: "destructive",
      });
      return;
    }
    
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
    
    // Parse existing scheduledAt to set date and time slot
    const scheduledDate = new Date(consultation.scheduledAt);
    const dateString = scheduledDate.toISOString().split('T')[0];
    const timeString = scheduledDate.toTimeString().slice(0, 5); // HH:mm format
    
    // Convert to 12-hour format for display
    const [hours, minutes] = timeString.split(':');
    const hour24 = parseInt(hours);
    const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
    const ampm = hour24 >= 12 ? 'PM' : 'AM';
    const timeSlot12 = `${hour12}:${minutes} ${ampm}`;
    
    setFormData({
      expertId: consultation.expertId,
      studentId: consultation.studentId,
      title: consultation.title,
      description: consultation.description || "",
      scheduledAt: consultation.scheduledAt,
      duration: consultation.duration,
      status: consultation.status,
      amount: consultation.amount,
    });
    
    setSelectedDate(dateString);
    setSelectedTimeSlot(timeSlot12);
    setSelectedStudentName(""); // Will be populated by the StudentSearch component
    setShowCreateModal(true);
  };

  const handleQuickApprove = async (consultationId: string) => {
    try {
      updateConsultationMutation.mutate({
        id: consultationId,
        data: { status: 'confirmed' }
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve consultation.",
        variant: "destructive",
      });
    }
  };

  // Calculate stats
  const totalConsultations = consultations?.length || 0;
  const completedConsultations = consultations?.filter(c => c.status === "completed").length || 0;
  const upcomingConsultations = consultations?.filter(c => c.status === "scheduled").length || 0;
  const pendingConsultations = consultations?.filter(c => c.status === "pending").length || 0;
  const totalRevenue = consultations
    ?.filter(c => c.status === "completed")
    .reduce((sum, c) => sum + (parseFloat(c.amount) || 0), 0) || 0;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-orange-100 text-orange-800";
      case "confirmed": return "bg-green-100 text-green-800";
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
      <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-8">
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
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{pendingConsultations}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
            <Calendar className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{upcomingConsultations}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <MessageSquare className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{completedConsultations}</div>
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
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
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
                        Expert: {consultation.expert?.name || "Unknown"} | Student: {
                          consultation.student?.firstName && consultation.student?.lastName 
                            ? `${consultation.student.firstName} ${consultation.student.lastName}`
                            : consultation.student?.username || "Unknown"
                        }
                      </p>
                    </div>
                  </div>
                  
                  <p className="text-gray-700 mb-3">{consultation.description}</p>
                  
                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-gray-400" />
{(() => {
                        // Parse as IST directly since database stores IST times
                        const date = new Date(consultation.scheduledAt);
                        const dateStr = date.toLocaleDateString('en-IN');
                        
                        // Extract hours and minutes directly without timezone conversion
                        const hours = date.getHours();
                        const minutes = date.getMinutes();
                        const hour12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
                        const ampm = hours >= 12 ? 'PM' : 'AM';
                        const timeStr = `${hour12}:${minutes.toString().padStart(2, '0')} ${ampm}`;
                        
                        return `${dateStr} at ${timeStr} IST`;
                      })()}
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
                    {/* Direct Approve Button for Pending Consultations */}
                    {consultation.status === 'pending' && (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleQuickApprove(consultation.id)}
                        className="bg-green-600 hover:bg-green-700 text-white"
                        disabled={updateConsultationMutation.isPending}
                      >
                        <MessageSquare className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                    )}
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
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => window.open(consultation.startUrl || consultation.meetingUrl!, '_blank')}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Video className="h-4 w-4 mr-2" />
                        Start Meeting
                      </Button>
                      {consultation.startUrl && (
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
                      )}
                    </div>
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
                  onValueChange={(value) => {
                    const expert = experts?.find(e => e.id === value);
                    setFormData(prev => ({ 
                      ...prev, 
                      expertId: value,
                      scheduledAt: "", // Reset scheduled time when expert changes
                      amount: expert ? (expert.hourlyRate * (prev.duration / 60)).toFixed(2) : "" // Auto-calculate amount
                    }));
                    // Reset date and time selection when expert changes
                    setSelectedDate("");
                    setSelectedTimeSlot("");
                    setBookedSlots([]);
                  }}
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

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="selectedDate">Select Date *</Label>
                  <Input
                    id="selectedDate"
                    type="date"
                    required
                    value={selectedDate}
                    min={new Date().toISOString().split('T')[0]} // Prevent past dates
                    onChange={async (e) => {
                      const newDate = e.target.value;
                      setSelectedDate(newDate);
                      setSelectedTimeSlot(""); // Reset time slot when date changes
                      setFormData(prev => ({ ...prev, scheduledAt: "" })); // Reset scheduledAt
                      
                      // Fetch booked slots for this expert and date
                      if (selectedExpert && newDate) {
                        await fetchBookedSlots(selectedExpert.id, newDate);
                      }
                    }}
                  />
                </div>
                
                {selectedDate && selectedExpert && (
                  <div className="space-y-2">
                    <Label>Available Time Slots *</Label>
                    <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                      {getAvailableSlotsForDate(selectedDate).map((slot) => (
                        <Button
                          key={slot}
                          type="button"
                          variant={selectedTimeSlot === slot ? "default" : "outline"}
                          size="sm"
                          onClick={() => {
                            setSelectedTimeSlot(slot);
                            // Convert back to 24-hour format and create datetime string
                            const convertTo24Hour = (time12: string): string => {
                              const [time, period] = time12.split(' ');
                              const [hours, minutes] = time.split(':');
                              let hour24 = parseInt(hours);
                              
                              if (period === 'AM' && hour24 === 12) hour24 = 0;
                              else if (period === 'PM' && hour24 !== 12) hour24 += 12;
                              
                              return `${hour24.toString().padStart(2, '0')}:${minutes}`;
                            };
                            
                            const startTime24 = convertTo24Hour(slot);
                            const scheduledAt = `${selectedDate}T${startTime24}:00`;
                            setFormData(prev => ({ ...prev, scheduledAt }));
                          }}
                          className="text-xs"
                        >
                          {slot}
                        </Button>
                      ))}
                      
                      {/* Show booked slots as disabled */}
                      {bookedSlots.map((bookedSlot) => (
                        <Button
                          key={`booked-${bookedSlot}`}
                          type="button"
                          variant="secondary"
                          size="sm"
                          disabled
                          className="text-xs opacity-50 cursor-not-allowed"
                          title="This slot is already booked"
                        >
                          {bookedSlot} (Booked)
                        </Button>
                      ))}
                    </div>
                    {getAvailableSlotsForDate(selectedDate).length === 0 && (
                      <p className="text-sm text-gray-500">No available slots for selected date</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
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
                  onChange={(e) => {
                    const newDuration = parseInt(e.target.value);
                    setFormData(prev => ({ 
                      ...prev, 
                      duration: newDuration,
                      // Auto-update amount when duration changes
                      amount: selectedExpert ? (selectedExpert.hourlyRate * (newDuration / 60)).toFixed(2) : prev.amount
                    }));
                  }}
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