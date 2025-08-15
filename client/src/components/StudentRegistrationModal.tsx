import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { UserPlus, Mail, Phone, User, Lock, CheckCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface StudentRegistrationModalProps {
  isOpen: boolean;
  onClose?: () => void;
  onOpenChange?: (open: boolean) => void;
}

export default function StudentRegistrationModal({ isOpen, onClose, onOpenChange }: StudentRegistrationModalProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const queryClient = useQueryClient();

  const registrationMutation = useMutation({
    mutationFn: async (registrationData: {
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      username: string;
      password: string;
    }) => {
      const response = await apiRequest("POST", "/api/auth/register", registrationData);
      return await response.json();
    },
    onSuccess: (data) => {
      // Update the student auth cache with the user data (auto-login after registration)
      queryClient.setQueryData(['/api/auth/student'], data.user);
      queryClient.setQueryData(['/api/auth/user'], data.user);
      // Refresh all queries to update UI immediately
      queryClient.refetchQueries();
      handleClose(false);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!firstName || !lastName || !email || !phone || !username || !password) {
      registrationMutation.reset();
      registrationMutation.mutate({ firstName, lastName, email, phone, username, password });
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    if (password.length < 6) {
      alert("Password should be at least 6 characters long!");
      return;
    }

    registrationMutation.mutate({ firstName, lastName, email, phone, username, password });
  };

  const resetForm = () => {
    setFirstName("");
    setLastName("");
    setEmail("");
    setPhone("");
    setUsername("");
    setPassword("");
    setConfirmPassword("");
    registrationMutation.reset();
  };

  const handleClose = (open: boolean) => {
    if (!open) {
      resetForm();
      if (onClose) onClose();
      if (onOpenChange) onOpenChange(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg bg-white/95 backdrop-blur-md border-0 shadow-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center pb-2">
          <div className="mx-auto h-14 w-14 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
            <UserPlus className="h-7 w-7 text-white" />
          </div>
          <DialogTitle className="text-2xl font-bold text-gray-800">Student Registration</DialogTitle>
          <DialogDescription className="text-gray-600 mt-2">
            Create your account to start learning AI skills
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          {/* Name Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName" className="text-sm font-medium text-gray-700 mb-2 block">
                First Name *
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="firstName"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="pl-10 h-12 border-gray-200 focus:border-green-500 focus:ring-green-500"
                  placeholder="Enter first name"
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="lastName" className="text-sm font-medium text-gray-700 mb-2 block">
                Last Name *
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="lastName"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="pl-10 h-12 border-gray-200 focus:border-green-500 focus:ring-green-500"
                  placeholder="Enter last name"
                  required
                />
              </div>
            </div>
          </div>

          {/* Email Field */}
          <div>
            <Label htmlFor="email" className="text-sm font-medium text-gray-700 mb-2 block">
              Email Address *
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 h-12 border-gray-200 focus:border-green-500 focus:ring-green-500"
                placeholder="Enter your email"
                required
              />
            </div>
          </div>

          {/* WhatsApp Number Field */}
          <div>
            <Label htmlFor="phone" className="text-sm font-medium text-gray-700 mb-2 block">
              WhatsApp Number *
            </Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="pl-10 h-12 border-gray-200 focus:border-green-500 focus:ring-green-500"
                placeholder="Enter WhatsApp number"
                required
              />
            </div>
          </div>

          {/* Username Field */}
          <div>
            <Label htmlFor="username" className="text-sm font-medium text-gray-700 mb-2 block">
              Username *
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="pl-10 h-12 border-gray-200 focus:border-green-500 focus:ring-green-500"
                placeholder="Choose a username"
                required
              />
            </div>
          </div>

          {/* Password Fields */}
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label htmlFor="password" className="text-sm font-medium text-gray-700 mb-2 block">
                Password *
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 h-12 border-gray-200 focus:border-green-500 focus:ring-green-500"
                  placeholder="Create a password"
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700 mb-2 block">
                Confirm Password *
              </Label>
              <div className="relative">
                <CheckCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10 h-12 border-gray-200 focus:border-green-500 focus:ring-green-500"
                  placeholder="Confirm your password"
                  required
                />
              </div>
            </div>
          </div>

          {/* Error Display */}
          {registrationMutation.isError && (
            <Alert className="border-red-200 bg-red-50">
              <AlertDescription className="text-red-600">
                {registrationMutation.error?.message || "Registration failed. Please try again."}
              </AlertDescription>
            </Alert>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={registrationMutation.isPending}
            className="w-full h-12 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            {registrationMutation.isPending ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Creating Account...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2">
                <UserPlus className="h-4 w-4" />
                <span>Create Account</span>
              </div>
            )}
          </Button>

          <p className="text-xs text-gray-500 text-center mt-4">
            By registering, you agree to our Terms of Service and Privacy Policy
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}