import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Plus, Edit, Trash2, Star, Users, DollarSign, Search, Filter } from "lucide-react";
import { ImageUpload } from "@/components/ui/image-upload";
import { Checkbox } from "@/components/ui/checkbox";
import type { Expert, InsertExpert } from "@shared/schema";

export default function AIExpertsManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [specializationFilter, setSpecializationFilter] = useState<string>("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingExpert, setEditingExpert] = useState<Expert | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Form state for creating/editing expert
  const [formData, setFormData] = useState<Partial<InsertExpert>>({
    name: "",
    bio: "",
    avatar: "",
    specialization: "",
    experience: "",
    hourlyRate: "",
    skills: [],
    languages: ["Hindi", "English"],
    education: "",
    certifications: [],
    achievements: [],
    workHistory: "",
    expertise: [],
    tools: [],
    portfolioLinks: [],
    socialLinks: "",
    methodology: "",
    consultationEnabled: true,
    availableSlots: [],
  });

  const { data: experts, isLoading } = useQuery<Expert[]>({
    queryKey: ["/api/admin/experts"],
  });

  const filteredExperts = experts?.filter((expert) => {
    const matchesSearch = expert.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         expert.bio.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (expert.skills || []).some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesSpecialization = specializationFilter === "all" || expert.specialization === specializationFilter;
    
    return matchesSearch && matchesSpecialization;
  }) || [];

  const specializations = Array.from(new Set(experts?.map(expert => expert.specialization) || []));

  const createExpertMutation = useMutation({
    mutationFn: (expertData: InsertExpert) => apiRequest('POST', '/api/admin/experts', expertData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/experts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/experts'] });
      toast({
        title: "Success",
        description: "Expert created successfully",
      });
      setShowCreateModal(false);
      setEditingExpert(null);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create expert",
        variant: "destructive",
      });
    },
  });

  const updateExpertMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: InsertExpert }) => 
      apiRequest('PUT', `/api/admin/experts/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/experts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/experts'] });
      toast({
        title: "Success",
        description: "Expert updated successfully",
      });
      setShowCreateModal(false);
      setEditingExpert(null);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update expert",
        variant: "destructive",
      });
    },
  });

  const deleteExpertMutation = useMutation({
    mutationFn: (id: string) => apiRequest('DELETE', `/api/admin/experts/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/experts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/experts'] });
      toast({
        title: "Success",
        description: "Expert deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete expert",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      bio: "",
      avatar: "",
      specialization: "",
      experience: "",
      hourlyRate: "",
      skills: [],
      languages: ["Hindi", "English"],
      education: "",
      certifications: [],
      achievements: [],
      workHistory: "",
      expertise: [],
      tools: [],
      portfolioLinks: [],
      socialLinks: "",
      methodology: "",
      consultationEnabled: true,
      availableSlots: [],
    });
    setEditingExpert(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // If consultation is disabled, don't require hourly rate
    const isConsultationEnabled = formData.consultationEnabled !== false;
    
    const expertData: InsertExpert = {
      name: formData.name!,
      bio: formData.bio!,
      avatar: formData.avatar,
      specialization: formData.specialization!,
      experience: formData.experience!,
      hourlyRate: isConsultationEnabled ? formData.hourlyRate! : "0",
      skills: formData.skills || [],
      languages: formData.languages || ["Hindi", "English"],
      education: formData.education,
      certifications: formData.certifications || [],
      achievements: formData.achievements || [],
      workHistory: formData.workHistory,
      expertise: formData.expertise || [],
      tools: formData.tools || [],
      portfolioLinks: formData.portfolioLinks || [],
      socialLinks: formData.socialLinks,
      methodology: formData.methodology,
      consultationEnabled: isConsultationEnabled,
      availableSlots: formData.availableSlots || [],
    };

    if (editingExpert) {
      updateExpertMutation.mutate({ id: editingExpert.id, data: expertData });
    } else {
      createExpertMutation.mutate(expertData);
    }
  };

  const handleEdit = (expert: Expert) => {
    setEditingExpert(expert);
    setFormData({
      name: expert.name,
      bio: expert.bio,
      avatar: expert.avatar,
      specialization: expert.specialization,
      experience: expert.experience,
      hourlyRate: expert.hourlyRate.toString(),
      skills: expert.skills || [],
      languages: expert.languages || ["Hindi", "English"],
      education: expert.education || "",
      certifications: expert.certifications || [],
      achievements: expert.achievements || [],
      workHistory: expert.workHistory || "",
      expertise: expert.expertise || [],
      tools: expert.tools || [],
      portfolioLinks: expert.portfolioLinks || [],
      socialLinks: expert.socialLinks || "",
      methodology: expert.methodology || "",
      consultationEnabled: expert.consultationEnabled !== false,
      availableSlots: expert.availableSlots || [],
    });
    setShowCreateModal(true);
  };

  const handleSkillsChange = (skillsText: string) => {
    const skills = skillsText.split(',').map(skill => skill.trim()).filter(skill => skill.length > 0);
    setFormData(prev => ({ ...prev, skills }));
  };

  const handleArrayFieldChange = (field: string, text: string) => {
    const items = text.split(',').map(item => item.trim()).filter(item => item.length > 0);
    setFormData(prev => ({ ...prev, [field]: items }));
  };

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">AI Experts Management</h1>
          <p className="text-gray-600 mt-2">Manage AI experts and their consultation services</p>
        </div>
        <Button onClick={() => { 
          resetForm(); 
          setShowCreateModal(true); 
        }}>
          <Plus className="h-4 w-4 mr-2" />
          Add Expert
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Experts</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{experts?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Experts</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{experts?.filter(e => e.isActive).length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Hourly Rate</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{experts?.length ? Math.round(experts.reduce((acc, e) => acc + parseFloat(e.hourlyRate.toString()), 0) / experts.length) : 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
            <Star className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {experts?.length ? (experts.reduce((acc, e) => acc + parseFloat(e.rating?.toString() || "0"), 0) / experts.length).toFixed(1) : "0.0"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search experts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={specializationFilter} onValueChange={setSpecializationFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Specializations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Specializations</SelectItem>
                {specializations.map((specialization) => (
                  <SelectItem key={specialization} value={specialization}>
                    {specialization}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" className="flex items-center space-x-2">
              <Filter className="h-4 w-4" />
              <span>More Filters</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Experts Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                  <div className="h-8 bg-gray-200 rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredExperts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExperts.map((expert) => (
            <Card key={expert.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={expert.avatar || ""} alt={expert.name} />
                      <AvatarFallback>{expert.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <CardTitle className="text-lg">{expert.name}</CardTitle>
                      <CardDescription className="text-sm text-primary font-medium">
                        {expert.specialization}
                      </CardDescription>
                      <div className="flex items-center space-x-2 mt-1">
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium">{expert.rating}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Users className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{expert.totalSessions}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEdit(expert)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteExpertMutation.mutate(expert.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-gray-600 line-clamp-2">{expert.bio}</p>
                
                <div className="space-y-2">
                  <div>
                    <p className="text-xs font-medium text-gray-900 mb-1">Skills</p>
                    <div className="flex flex-wrap gap-1">
                      {(expert.skills || []).slice(0, 3).map((skill, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {(expert.skills || []).length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{(expert.skills || []).length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{expert.experience} exp</span>
                    <span className="font-bold text-primary">₹{expert.hourlyRate}/hr</span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <Badge variant={expert.isActive ? "default" : "secondary"}>
                      {expert.isActive ? "Active" : "Inactive"}
                    </Badge>
                    <span className="text-gray-500">
                      {expert.languages?.join(", ")}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="text-center py-16">
          <CardContent>
            <div className="text-6xl mb-4">👤</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No experts found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || specializationFilter !== "all"
                ? "Try adjusting your search criteria."
                : "Start by adding your first AI expert."}
            </p>
            <Button onClick={() => { 
              resetForm(); 
              setShowCreateModal(true); 
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Add First Expert
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Create/Edit Expert Modal */}
      <Dialog open={showCreateModal} onOpenChange={(open) => {
        setShowCreateModal(open);
        if (!open) {
          resetForm();
        }
      }}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingExpert ? "Edit Expert" : "Add New Expert"}
            </DialogTitle>
            <DialogDescription>
              {editingExpert ? "Update expert information and consultation details." : "Create a new AI expert profile for consultations."}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Basic Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    required
                    value={formData.name || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Dr. John Doe"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="specialization">Specialization</Label>
                  <Input
                    id="specialization"
                    required
                    value={formData.specialization || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, specialization: e.target.value }))}
                    placeholder="AI Software Development"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  required
                  rows={3}
                  value={formData.bio || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder="Expert's background, experience, and expertise..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="experience">Experience</Label>
                  <Input
                    id="experience"
                    required
                    value={formData.experience || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, experience: e.target.value }))}
                    placeholder="5+ years"
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="consultationEnabled"
                      checked={formData.consultationEnabled !== false}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, consultationEnabled: !!checked }))}
                    />
                    <Label htmlFor="consultationEnabled" className="text-sm font-medium">
                      Enable Consultation Services
                    </Label>
                  </div>
                  <p className="text-xs text-gray-500">
                    When enabled, students can book consultations with this expert
                  </p>
                </div>
              </div>

              {(formData.consultationEnabled !== false) && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="hourlyRate">Hourly Rate (₹)</Label>
                    <Input
                      id="hourlyRate"
                      type="number"
                      min="0"
                      step="0.01"
                      required={formData.consultationEnabled !== false}
                      value={formData.hourlyRate || ""}
                      onChange={(e) => setFormData(prev => ({ ...prev, hourlyRate: e.target.value }))}
                      placeholder="2500"
                    />
                  </div>

                  {/* Available Time Slots */}
                  <div className="space-y-3">
                    <Label>Available Time Slots</Label>
                    <p className="text-xs text-gray-500">
                      Select the time slots when this expert is available for consultations
                    </p>
                    <div className="border rounded-lg p-4 bg-gray-50 max-h-48 overflow-y-auto">
                      <div className="space-y-3">
                        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                          <div key={day} className="space-y-2">
                            <h4 className="text-sm font-medium text-gray-900">{day}</h4>
                            <div className="grid grid-cols-4 gap-1">
                              {Array.from({ length: 24 }, (_, i) => {
                                const hour = i.toString().padStart(2, '0');
                                const timeSlot = `${day}-${hour}:00`;
                                const isSelected = (formData.availableSlots || []).includes(timeSlot);
                                return (
                                  <button
                                    key={timeSlot}
                                    type="button"
                                    className={`text-xs py-1 px-2 rounded transition-colors ${
                                      isSelected 
                                        ? 'bg-primary text-white' 
                                        : 'bg-white hover:bg-gray-100 border'
                                    }`}
                                    onClick={() => {
                                      const currentSlots = formData.availableSlots || [];
                                      const newSlots = isSelected 
                                        ? currentSlots.filter(slot => slot !== timeSlot)
                                        : [...currentSlots, timeSlot];
                                      setFormData(prev => ({ ...prev, availableSlots: newSlots }));
                                    }}
                                  >
                                    {hour}:00
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="text-xs text-gray-600">
                      Selected slots: {(formData.availableSlots || []).length} out of 168 total slots
                    </div>
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="avatar">Avatar Image</Label>
                <ImageUpload
                  value={formData.avatar || ""}
                  onChange={(url) => setFormData(prev => ({ ...prev, avatar: url }))}
                  disabled={createExpertMutation.isPending || updateExpertMutation.isPending}
                />
              </div>
            </div>

            {/* Professional Background */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Professional Background</h3>
              
              <div className="space-y-2">
                <Label htmlFor="education">Education</Label>
                <Textarea
                  id="education"
                  rows={2}
                  value={formData.education || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, education: e.target.value }))}
                  placeholder="PhD in Computer Science from IIT Delhi, M.Tech in AI..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="workHistory">Work History</Label>
                <Textarea
                  id="workHistory"
                  rows={3}
                  value={formData.workHistory || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, workHistory: e.target.value }))}
                  placeholder="Senior AI Engineer at Google (2020-2024), ML Research Scientist at Microsoft..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="certifications">Certifications (comma separated)</Label>
                <Input
                  id="certifications"
                  value={(formData.certifications || []).join(", ")}
                  onChange={(e) => handleArrayFieldChange('certifications', e.target.value)}
                  placeholder="Google Cloud ML Engineer, AWS ML Specialty, TensorFlow Developer"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="achievements">Achievements (comma separated)</Label>
                <Input
                  id="achievements"
                  value={(formData.achievements || []).join(", ")}
                  onChange={(e) => handleArrayFieldChange('achievements', e.target.value)}
                  placeholder="Published 20+ research papers, Won AI Innovation Award 2023"
                />
              </div>
            </div>

            {/* Skills & Expertise */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Skills & Expertise</h3>
              
              <div className="space-y-2">
                <Label htmlFor="skills">Core Skills (comma separated)</Label>
                <Input
                  id="skills"
                  value={(formData.skills || []).join(", ")}
                  onChange={(e) => handleSkillsChange(e.target.value)}
                  placeholder="Python, TensorFlow, Machine Learning, NLP"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="expertise">Areas of Expertise (comma separated)</Label>
                <Input
                  id="expertise"
                  value={(formData.expertise || []).join(", ")}
                  onChange={(e) => handleArrayFieldChange('expertise', e.target.value)}
                  placeholder="Computer Vision, Natural Language Processing, Deep Learning"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tools">Tools & Technologies (comma separated)</Label>
                <Input
                  id="tools"
                  value={(formData.tools || []).join(", ")}
                  onChange={(e) => handleArrayFieldChange('tools', e.target.value)}
                  placeholder="PyTorch, Jupyter, Docker, AWS, Google Cloud"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="methodology">Teaching/Consultation Methodology</Label>
                <Textarea
                  id="methodology"
                  rows={2}
                  value={formData.methodology || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, methodology: e.target.value }))}
                  placeholder="Hands-on project-based learning, personalized guidance, real-world case studies..."
                />
              </div>
            </div>

            {/* Additional Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Additional Information</h3>
              
              <div className="space-y-2">
                <Label htmlFor="portfolioLinks">Portfolio Links (comma separated)</Label>
                <Input
                  id="portfolioLinks"
                  value={(formData.portfolioLinks || []).join(", ")}
                  onChange={(e) => handleArrayFieldChange('portfolioLinks', e.target.value)}
                  placeholder="https://github.com/username, https://portfolio.com, https://research.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="socialLinks">Social Media Links (JSON format)</Label>
                <Input
                  id="socialLinks"
                  value={formData.socialLinks || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, socialLinks: e.target.value }))}
                  placeholder='{"linkedin":"https://linkedin.com/in/username","twitter":"@username"}'
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="languages">Languages (comma separated)</Label>
                <Input
                  id="languages"
                  value={(formData.languages || []).join(", ")}
                  onChange={(e) => handleArrayFieldChange('languages', e.target.value)}
                  placeholder="Hindi, English, Spanish"
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowCreateModal(false);
                  setEditingExpert(null);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={createExpertMutation.isPending || updateExpertMutation.isPending}
              >
                {createExpertMutation.isPending || updateExpertMutation.isPending 
                  ? "Saving..." 
                  : editingExpert 
                    ? "Update Expert" 
                    : "Create Expert"
                }
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}