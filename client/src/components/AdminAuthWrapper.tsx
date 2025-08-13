import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

interface AdminAuthWrapperProps {
  children: React.ReactNode;
}

export default function AdminAuthWrapper({ children }: AdminAuthWrapperProps) {
  const [, setLocation] = useLocation();
  const [isChecking, setIsChecking] = useState(true);

  const { data: user, isLoading, error } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  useEffect(() => {
    if (isLoading) return;

    if (error || !user) {
      // User not authenticated, redirect to admin login
      setLocation("/admin-login");
      return;
    }

    if (user.role !== "admin") {
      // User is authenticated but not an admin, redirect to admin login
      setLocation("/admin-login");
      return;
    }

    // User is authenticated and is an admin
    setIsChecking(false);
  }, [user, isLoading, error, setLocation]);

  // Show loading while checking authentication
  if (isChecking || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Checking admin access...</p>
        </div>
      </div>
    );
  }

  // If we get here, user is authenticated as admin
  return <>{children}</>;
}