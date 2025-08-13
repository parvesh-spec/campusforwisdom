import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, Lock, Users, BarChart3, ArrowLeft } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

export default function AdminLogin() {
  const [, setLocation] = useLocation();
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
      // Only allow admin users on this page
      if (data.user.role === "admin") {
        setLocation("/admin/dashboard");
      } else {
        throw new Error("Access denied. Admin privileges required.");
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username && password) {
      loginMutation.mutate({ username, password });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-blue-800 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-20 w-20 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center mb-6">
            <Shield className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Campus for Wisdom
          </h1>
          <p className="text-blue-100 text-lg">Administrator Portal</p>
          <p className="text-sm text-blue-200 mt-1">Secure access to admin dashboard</p>
        </div>
        
        <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl text-gray-800 flex items-center justify-center gap-2">
              <Lock className="h-5 w-5" />
              Admin Login
            </CardTitle>
            <CardDescription className="text-gray-600">
              Enter your administrator credentials
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="username" className="text-gray-700 font-medium">Administrator Username</Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter admin username"
                  className="mt-2 h-11 border-2 border-gray-200 focus:border-blue-500"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="password" className="text-gray-700 font-medium">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  className="mt-2 h-11 border-2 border-gray-200 focus:border-blue-500"
                  required
                />
              </div>

              {loginMutation.error && (
                <Alert variant="destructive">
                  <AlertDescription>
                    {(loginMutation.error as any)?.message || "Invalid admin credentials"}
                  </AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium text-base shadow-lg"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? "Authenticating..." : "Access Admin Panel"}
              </Button>
            </form>

            {/* Admin Features Preview */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-sm font-semibold text-gray-800 mb-4 text-center">Admin Dashboard Features</h3>
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-3 p-2 bg-blue-50 rounded-lg">
                  <Users className="h-5 w-5 text-blue-500" />
                  <span>Student Management</span>
                </div>
                <div className="flex items-center gap-3 p-2 bg-green-50 rounded-lg">
                  <BarChart3 className="h-5 w-5 text-green-500" />
                  <span>Analytics Dashboard</span>
                </div>
                <div className="flex items-center gap-3 p-2 bg-purple-50 rounded-lg">
                  <Lock className="h-5 w-5 text-purple-500" />
                  <span>Course Management</span>
                </div>
                <div className="flex items-center gap-3 p-2 bg-red-50 rounded-lg">
                  <Shield className="h-5 w-5 text-red-500" />
                  <span>System Settings</span>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
              <h3 className="text-sm font-semibold text-blue-900 mb-2">Demo Admin Access:</h3>
              <div className="text-sm text-blue-700 font-mono bg-white px-3 py-2 rounded border">
                <strong>Username:</strong> admin<br />
                <strong>Password:</strong> admin123
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <button
            onClick={() => setLocation("/")}
            className="text-blue-200 hover:text-white text-sm flex items-center justify-center gap-2 mx-auto transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Campus for Wisdom
          </button>
        </div>
      </div>
    </div>
  );
}