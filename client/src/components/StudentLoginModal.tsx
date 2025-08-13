import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
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

  const loginMutation = useMutation({
    mutationFn: async (credentials: { username: string; password: string }) => {
      const response = await apiRequest("/api/auth/login", {
        method: "POST",
        body: credentials,
      });
      return response;
    },
    onSuccess: (data) => {
      // Only allow students to login through this modal
      if (data.user.role === "student") {
        onClose();
        window.location.reload(); // Refresh to update auth state
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <DialogTitle className="text-xl">Student Login</DialogTitle>
                <DialogDescription>
                  Access your courses and learning materials
                </DialogDescription>
              </div>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <Label htmlFor="modal-username">Username</Label>
            <Input
              id="modal-username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              className="mt-1"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="modal-password">Password</Label>
            <Input
              id="modal-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="mt-1"
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

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              className="flex-1"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? "Signing In..." : "Sign In"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
            >
              Cancel
            </Button>
          </div>
        </form>

        <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
          <h3 className="text-sm font-medium text-green-900 mb-1">Demo Student Access:</h3>
          <div className="text-sm text-green-700">
            <strong>Username:</strong> student | <strong>Password:</strong> student123
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}