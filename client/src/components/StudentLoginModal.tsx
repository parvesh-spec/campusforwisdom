import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { User, Lock, X } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface StudentLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  trigger?: React.ReactNode;
}

export default function StudentLoginModal({ isOpen, onClose, trigger }: StudentLoginModalProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const queryClient = useQueryClient();

  const loginMutation = useMutation({
    mutationFn: async (credentials: { username: string; password: string }) => {
      const response = await apiRequest("POST", "/api/auth/login", credentials);
      return await response.json();
    },
    onSuccess: (data) => {
      // Only allow students to login through this modal
      if (data.user.role === "student") {
        // Update the auth cache with the user data
        queryClient.setQueryData(['/api/auth/user'], data.user);
        onClose();
      } else {
        throw new Error("Please use the admin portal for administrator access.");
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username && password) {
      loginMutation.mutate({ username, password });
    }
  };

  const resetForm = () => {
    setUsername("");
    setPassword("");
    loginMutation.reset();
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-md bg-white/95 backdrop-blur-md border-0 shadow-2xl">
        <DialogHeader className="text-center pb-2">
          <div className="mx-auto h-14 w-14 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
            <User className="h-7 w-7 text-white" />
          </div>
          <DialogTitle className="text-2xl font-bold text-gray-800">Student Login</DialogTitle>
          <DialogDescription className="text-gray-600 mt-2">
            Access your courses and learning materials
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          <div>
            <Label htmlFor="modal-username" className="text-gray-700 font-medium">Username</Label>
            <Input
              id="modal-username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              className="mt-2 h-11 border-2 border-gray-200 focus:border-blue-500 rounded-lg"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="modal-password" className="text-gray-700 font-medium">Password</Label>
            <Input
              id="modal-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="mt-2 h-11 border-2 border-gray-200 focus:border-blue-500 rounded-lg"
              required
            />
          </div>

          {loginMutation.error && (
            <Alert variant="destructive">
              <AlertDescription>
                {(loginMutation.error as any)?.message || "Login failed"}
              </AlertDescription>
            </Alert>
          )}

          <Button
            type="submit"
            className="w-full mt-6 h-11 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium shadow-lg"
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending ? "Signing In..." : "Sign In"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}