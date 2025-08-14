import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Users, Video, CheckCircle, AlertCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Webinar {
  id: string;
  title: string;
  description: string | null;
  scheduledAt: Date;
  duration: number;
  maxParticipants: number | null;
  currentParticipants: number | null;
  registeredParticipants: number | null;
  status: string;
  zoomJoinUrl?: string | null;
}

export function WebinarRegistrationPage() {
  const [, params] = useRoute("/webinar/:id/register");
  const webinarId = params?.id;
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "attendee"
  });

  const [isRegistered, setIsRegistered] = useState(false);

  // Fetch webinar details
  const { data: webinars, isLoading } = useQuery({
    queryKey: ["/api/admin/live-webinars"],
    enabled: !!webinarId
  });

  const webinar = webinars?.find((w: Webinar) => w.id === webinarId);

  const registerMutation = useMutation({
    mutationFn: (data: typeof formData) => 
      apiRequest("POST", `/api/webinars/${webinarId}/register`, data),
    onSuccess: () => {
      setIsRegistered(true);
      toast({
        title: "Registration Successful!",
        description: "You have been registered for the webinar. Check your email for details.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Registration Failed",
        description: error.message || "Failed to register. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }
    registerMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading webinar details...</p>
        </div>
      </div>
    );
  }

  if (!webinar) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center p-8">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Webinar Not Found</h2>
            <p className="text-gray-600">The webinar you're looking for doesn't exist or has been removed.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isWebinarFull = webinar.maxParticipants && 
    webinar.registeredParticipants && 
    webinar.registeredParticipants >= webinar.maxParticipants;

  const isWebinarPast = new Date(webinar.scheduledAt) < new Date();

  if (isRegistered) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-2xl">
          <CardContent className="text-center p-8">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Registration Confirmed!</h2>
            <p className="text-gray-600 mb-6">
              You have successfully registered for <strong>{webinar.title}</strong>
            </p>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-blue-900 mb-2">What's Next?</h3>
              <ul className="text-blue-800 text-left space-y-1">
                <li>• You'll receive a confirmation email with webinar details</li>
                <li>• We'll send you the Zoom link 1 hour before the session</li>
                <li>• Join 10 minutes early for the best experience</li>
              </ul>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center justify-center bg-gray-100 p-3 rounded-lg">
                <Calendar className="h-4 w-4 mr-2 text-gray-600" />
                {new Date(webinar.scheduledAt).toLocaleDateString()}
              </div>
              <div className="flex items-center justify-center bg-gray-100 p-3 rounded-lg">
                <Clock className="h-4 w-4 mr-2 text-gray-600" />
                {new Date(webinar.scheduledAt).toLocaleTimeString()}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Webinar Information */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl font-bold text-gray-900">
                    {webinar.title}
                  </CardTitle>
                  <CardDescription className="mt-2 text-base">
                    {webinar.description}
                  </CardDescription>
                </div>
                <Badge variant={webinar.status === "scheduled" ? "default" : "secondary"}>
                  {webinar.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-blue-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Date</p>
                    <p className="text-sm text-gray-600">
                      {new Date(webinar.scheduledAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-blue-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Time</p>
                    <p className="text-sm text-gray-600">
                      {new Date(webinar.scheduledAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Video className="h-5 w-5 text-blue-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Duration</p>
                    <p className="text-sm text-gray-600">{webinar.duration} minutes</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Users className="h-5 w-5 text-blue-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Capacity</p>
                    <p className="text-sm text-gray-600">
                      {webinar.registeredParticipants || 0}/{webinar.maxParticipants || "Unlimited"}
                    </p>
                  </div>
                </div>
              </div>

              {isWebinarFull && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800 font-medium">This webinar is fully booked</p>
                  <p className="text-red-600 text-sm">No more registrations are being accepted.</p>
                </div>
              )}

              {isWebinarPast && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-yellow-800 font-medium">This webinar has already occurred</p>
                  <p className="text-yellow-600 text-sm">Registration is no longer available.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Registration Form */}
          <Card>
            <CardHeader>
              <CardTitle>Register for Webinar</CardTitle>
              <CardDescription>
                Fill out the form below to register for this webinar
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isWebinarFull || isWebinarPast ? (
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Registration is not available</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter your full name"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="Enter your email address"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="role">Participation Role</Label>
                    <Select
                      value={formData.role}
                      onValueChange={(value) => setFormData({ ...formData, role: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="attendee">Attendee</SelectItem>
                        <SelectItem value="panelist">Panelist</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-gray-500 mt-1">
                      Select your role for the webinar
                    </p>
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={registerMutation.isPending}
                  >
                    {registerMutation.isPending ? "Registering..." : "Register for Webinar"}
                  </Button>

                  <p className="text-xs text-gray-500 text-center">
                    By registering, you agree to receive webinar-related communications.
                  </p>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}