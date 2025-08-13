// This file is kept for backward compatibility - redirects to admin login
import { useEffect } from "react";
import { useLocation } from "wouter";

export default function Login() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Redirect to admin login page
    setLocation("/admin-login");
  }, [setLocation]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Redirecting to admin login...</p>
      </div>
    </div>
  );
}