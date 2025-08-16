import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import StudentLoginModal from "@/components/StudentLoginModal";
import { Star, Clock, Users, Calendar, MapPin, ArrowLeft, Video, BookOpen, Award, Download, FileText, Eye } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Expert, User, Consultation, LiveSession, Ebook } from "@shared/schema";

export default function ExpertProfile() {
  const [, params] = useRoute("/experts/:id");
  const expertId = params?.id;
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    title: "",
    description: "",
    scheduledAt: "",
    duration: 60
  });
  const { toast } = useToast();

  // Fetch expert data
  const { data: expert, isLoading: expertLoading } = useQuery<Expert>({
    queryKey: [`/api/experts/${expertId}`],
    enabled: !!expertId,
  });

  // Check if user is logged in as student
  const { data: user } = useQuery<User>({
    queryKey: ["/api/auth/student"],
  });

  // Fetch user's consultations with this expert if logged in
  const { data: consultations = [] } = useQuery<Consultation[]>({
    queryKey: ["/api/student/consultations"],
    enabled: !!user && !!expertId,
  });

  // Fetch expert's live sessions
  const { data: expertSessions = [] } = useQuery<LiveSession[]>({
    queryKey: [`/api/experts/${expertId}/sessions`],
    enabled: !!expertId,
  });

  // Fetch expert's eBooks
  const { data: allEbooks = [] } = useQuery<Ebook[]>({
    queryKey: ["/api/ebooks"],
  });

  const expertEbooks = allEbooks.filter((ebook) => ebook.authorId === expertId);

  const isLoggedIn = !!user;
  const expertConsultations = consultations.filter((c: any) => c.expertId === expertId);

  const handleBookConsultation = () => {
    if (!isLoggedIn) {
      setShowLoginModal(true);
    } else {
      setShowBookingModal(true);
    }
  };

  const handleBookingSubmit = async () => {
    try {
      if (!expertId || !bookingForm.title || !bookingForm.scheduledAt) {
        toast({
          title: "Error",
          description: "Please fill in all required fields",
          variant: "destructive",
        });
        return;
      }

      await apiRequest(`/api/student/consultations`, "POST", {
        expertId,
        title: bookingForm.title,
        description: bookingForm.description,
        scheduledAt: new Date(bookingForm.scheduledAt),
        duration: bookingForm.duration,
        status: "scheduled",
        amount: expert?.hourlyRate || "0"
      });

      toast({
        title: "Success",
        description: "Consultation booked successfully!",
      });

      setShowBookingModal(false);
      setBookingForm({
        title: "",
        description: "",
        scheduledAt: "",
        duration: 60
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to book consultation",
        variant: "destructive",
      });
    }
  };

  if (expertLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-32 mb-8"></div>
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="flex items-start space-x-6">
                <div className="w-32 h-32 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-4">
                  <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-16 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!expert) {
    return (
      <div className="min-h-screen bg-gray-50 py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Expert Not Found</h1>
          <p className="text-gray-600 mb-8">The expert you're looking for doesn't exist or may have been removed.</p>
          <Link href="/ai-experts">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Experts
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link href="/ai-experts">
          <Button variant="ghost" className="mb-8">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Experts
          </Button>
        </Link>

        {/* Expert Header */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="flex flex-col lg:flex-row items-start lg:items-center space-y-6 lg:space-y-0 lg:space-x-8">
              <Avatar className="w-32 h-32">
                <AvatarImage src={expert.avatar || ""} alt={expert.name} />
                <AvatarFallback className="text-2xl">{expert.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{expert.name}</h1>
                <p className="text-xl text-primary font-semibold mb-4">{expert.specialization}</p>
                
                <div className="flex flex-wrap items-center gap-6 mb-4">
                  <div className="flex items-center space-x-2">
                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{expert.rating}</span>
                    <span className="text-gray-600">rating</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-gray-400" />
                    <span className="font-medium">{expert.totalSessions}</span>
                    <span className="text-gray-600">sessions</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-5 w-5 text-gray-400" />
                    <span className="font-medium">{expert.experience}</span>
                    <span className="text-gray-600">experience</span>
                  </div>
                  {expert.timezone && (
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-5 w-5 text-gray-400" />
                      <span className="text-gray-600">{expert.timezone}</span>
                    </div>
                  )}
                </div>

                <p className="text-gray-700 mb-6">{expert.bio}</p>

                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="text-center sm:text-left">
                    <p className="text-3xl font-bold text-primary">₹{expert.hourlyRate}/hr</p>
                    <p className="text-sm text-gray-600">Consultation fee</p>
                  </div>
                  <div className="flex gap-3">
                    <Button size="lg" onClick={handleBookConsultation}>
                      <Calendar className="w-4 h-4 mr-2" />
                      Book Consultation
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs for different sections */}
        <Tabs defaultValue="overview" className="space-y-8">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="sessions">Sessions</TabsTrigger>
            <TabsTrigger value="ebooks">eBooks</TabsTrigger>
            <TabsTrigger value="consultations">Consultations</TabsTrigger>
            <TabsTrigger value="courses">Courses</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Skills */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Award className="w-5 h-5 mr-2" />
                    Skills & Expertise
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {(expert.skills || []).map((skill, idx) => (
                      <Badge key={idx} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Languages */}
              {expert.languages && expert.languages.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Languages</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {expert.languages.map((language, idx) => (
                        <Badge key={idx} variant="outline">
                          {language}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Availability */}
              {expert.availability && (
                <Card>
                  <CardHeader>
                    <CardTitle>Availability</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700">{expert.availability}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="sessions" className="space-y-6">
            {expertSessions.length > 0 ? (
              <div className="grid gap-4">
                {expertSessions.map((session) => (
                  <Card key={session.id}>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{session.title}</h3>
                          <p className="text-gray-600 mt-1">{session.description}</p>
                          <div className="flex items-center space-x-4 mt-3">
                            <Badge variant={session.status === 'completed' ? 'default' : 'secondary'}>
                              {session.status}
                            </Badge>
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-500">
                                {new Date(session.scheduledAt).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-500">
                                {session.duration} mins
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-primary">₹{session.price}</p>
                          {session.status === 'scheduled' && session.meetingUrl && (
                            <Button size="sm" className="mt-2" asChild>
                              <a href={session.meetingUrl} target="_blank" rel="noopener noreferrer">
                                <Video className="w-4 h-4 mr-1" />
                                Join Session
                              </a>
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Video className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Live Sessions</h3>
                  <p className="text-gray-600">This expert hasn't scheduled any live sessions yet.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="consultations" className="space-y-6">
            {isLoggedIn ? (
              expertConsultations.length > 0 ? (
                <div className="grid gap-4">
                  {expertConsultations.map((consultation: any) => (
                    <Card key={consultation.id}>
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-lg">{consultation.title}</h3>
                            <p className="text-gray-600 mt-1">{consultation.description}</p>
                            <div className="flex items-center space-x-4 mt-3">
                              <Badge variant={consultation.status === 'completed' ? 'default' : 'secondary'}>
                                {consultation.status}
                              </Badge>
                              <span className="text-sm text-gray-500">
                                {new Date(consultation.scheduledAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">₹{consultation.amount}</p>
                            {consultation.status === 'scheduled' && (
                              <Button size="sm" className="mt-2">
                                <Video className="w-4 h-4 mr-1" />
                                Join
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Consultations Yet</h3>
                    <p className="text-gray-600 mb-6">You haven't booked any consultations with this expert yet.</p>
                    <Button onClick={handleBookConsultation}>
                      Book Your First Consultation
                    </Button>
                  </CardContent>
                </Card>
              )
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Login Required</h3>
                  <p className="text-gray-600 mb-6">Please login to view your consultations with this expert.</p>
                  <Button onClick={() => setShowLoginModal(true)}>
                    Login as Student
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="courses" className="space-y-6">
            <Card>
              <CardContent className="p-12 text-center">
                <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Courses Coming Soon</h3>
                <p className="text-gray-600">This expert's courses will be available here soon.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ebooks" className="space-y-6">
            {expertEbooks.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {expertEbooks.map((ebook) => (
                  <Card key={ebook.id} className="group hover:shadow-lg transition-shadow duration-300">
                    <CardHeader className="p-0">
                      {ebook.coverImage ? (
                        <div className="aspect-[4/3] bg-gradient-to-br from-blue-50 to-indigo-100 rounded-t-lg overflow-hidden">
                          <img 
                            src={ebook.coverImage} 
                            alt={ebook.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      ) : (
                        <div className="aspect-[4/3] bg-gradient-to-br from-blue-50 to-indigo-100 rounded-t-lg flex items-center justify-center">
                          <BookOpen className="h-16 w-16 text-blue-400" />
                        </div>
                      )}
                    </CardHeader>
                    
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        {/* Title and Category */}
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
                            {ebook.title}
                          </h3>
                          <Badge variant="secondary" className="mb-2">
                            {ebook.category}
                          </Badge>
                        </div>

                        {/* Description */}
                        <CardDescription className="line-clamp-3">
                          {ebook.shortDescription || ebook.description}
                        </CardDescription>

                        {/* Stats */}
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <div className="flex items-center space-x-4">
                            {ebook.rating && Number(ebook.rating) > 0 && (
                              <div className="flex items-center">
                                <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                                <span>{Number(ebook.rating).toFixed(1)}</span>
                              </div>
                            )}
                            <div className="flex items-center">
                              <Download className="h-4 w-4 mr-1" />
                              <span>{ebook.downloadCount || 0}</span>
                            </div>
                            {ebook.pageCount && (
                              <div className="flex items-center">
                                <FileText className="h-4 w-4 mr-1" />
                                <span>{ebook.pageCount} pages</span>
                              </div>
                            )}
                          </div>
                          <div className="text-xs">
                            {ebook.language}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-between pt-2">
                          <div className="text-lg font-bold text-primary">
                            {ebook.price === "0" ? "FREE" : `₹${ebook.price}`}
                          </div>
                          <div className="flex space-x-2">
                            {ebook.pdfFile && (
                              <Button size="sm" variant="outline" asChild>
                                <a href={ebook.pdfFile} target="_blank" rel="noopener noreferrer">
                                  <Eye className="h-4 w-4 mr-1" />
                                  Preview
                                </a>
                              </Button>
                            )}
                            <Button size="sm">
                              <Download className="h-4 w-4 mr-1" />
                              Download
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No eBooks Available</h3>
                  <p className="text-gray-600">This expert hasn't published any eBooks yet.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="reviews" className="space-y-6">
            <Card>
              <CardContent className="p-12 text-center">
                <Star className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Reviews Coming Soon</h3>
                <p className="text-gray-600">Student reviews and feedback will be displayed here.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Booking Modal */}
        <Dialog open={showBookingModal} onOpenChange={setShowBookingModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Book Consultation with {expert.name}</DialogTitle>
              <DialogDescription>
                Schedule a 1-on-1 consultation session. Rate: ₹{expert.hourlyRate}/hour
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Session Title</Label>
                <Input
                  id="title"
                  value={bookingForm.title}
                  onChange={(e) => setBookingForm({...bookingForm, title: e.target.value})}
                  placeholder="e.g., AI Project Review"
                />
              </div>
              <div>
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={bookingForm.description}
                  onChange={(e) => setBookingForm({...bookingForm, description: e.target.value})}
                  placeholder="Describe what you'd like to discuss..."
                />
              </div>
              <div>
                <Label htmlFor="scheduledAt">Date & Time</Label>
                <Input
                  id="scheduledAt"
                  type="datetime-local"
                  value={bookingForm.scheduledAt}
                  onChange={(e) => setBookingForm({...bookingForm, scheduledAt: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="duration">Duration</Label>
                <Select 
                  value={bookingForm.duration.toString()} 
                  onValueChange={(value) => setBookingForm({...bookingForm, duration: parseInt(value)})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                    <SelectItem value="90">1.5 hours</SelectItem>
                    <SelectItem value="120">2 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowBookingModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleBookingSubmit}>
                Book Session
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Login Modal */}
        <StudentLoginModal 
          isOpen={showLoginModal} 
          onOpenChange={setShowLoginModal}
          onClose={() => setShowLoginModal(false)}
        />
      </div>
    </div>
  );
}