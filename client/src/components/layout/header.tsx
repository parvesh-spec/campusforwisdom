import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Menu, X, User, LogOut } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import StudentLoginModal from "@/components/StudentLoginModal";
import StudentProfile from "@/components/StudentProfile";
import { useAuth } from "@/hooks/useAuth";

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [location] = useLocation();
  const { user, isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('POST', '/api/auth/logout');
    },
    onSuccess: () => {
      // Clear the user query cache
      queryClient.setQueryData(['/api/auth/user'], null);
      // Reload the page to reset state
      window.location.reload();
    },
  });

  const handleMobileLogout = () => {
    logoutMutation.mutate();
    setIsMobileMenuOpen(false);
  };

  const isActive = (path: string) => location === path;

  const navigation = [
    { name: "Home", href: "/" },
    { name: "Courses", href: "/courses" },
    { name: "Live Sessions", href: "/live-sessions" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-40">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link href="/">
                <h1 className="text-2xl font-bold gradient-text cursor-pointer hover:opacity-80 transition-opacity">
                  Campus for Wisdom
                </h1>
              </Link>
            </div>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              {navigation.map((item) => (
                <Link key={item.name} href={item.href}>
                  <a
                    className={`transition-colors px-3 py-2 rounded-md text-sm font-medium ${
                      isActive(item.href)
                        ? "text-primary"
                        : "text-gray-600 hover:text-primary"
                    }`}
                  >
                    {item.name}
                  </a>
                </Link>
              ))}
            </div>
          </div>

          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6">
              {isLoading ? (
                <div className="h-8 w-24 bg-gray-200 animate-pulse rounded"></div>
              ) : isAuthenticated && user ? (
                <StudentProfile user={user} />
              ) : (
                <Button 
                  variant="ghost" 
                  onClick={() => setIsLoginModalOpen(true)}
                  className="text-gray-600 hover:text-primary flex items-center gap-2"
                >
                  <User className="h-4 w-4" />
                  Student Login
                </Button>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t">
              {navigation.map((item) => (
                <Link key={item.name} href={item.href}>
                  <a
                    className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                      isActive(item.href)
                        ? "text-primary bg-primary/10"
                        : "text-gray-600 hover:text-primary hover:bg-gray-50"
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.name}
                  </a>
                </Link>
              ))}
              <div className="flex flex-col space-y-2 pt-4">
                {isAuthenticated && user ? (
                  <div className="px-3 py-2 border rounded-lg bg-gray-50">
                    <p className="text-sm font-medium text-gray-900">
                      {user.firstName && user.lastName 
                        ? `${user.firstName} ${user.lastName}`
                        : user.username}
                    </p>
                    <p className="text-xs text-gray-500">Student</p>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={handleMobileLogout}
                      disabled={logoutMutation.isPending}
                      className="w-full mt-2 text-red-600 hover:text-red-700 justify-start"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      {logoutMutation.isPending ? 'Signing out...' : 'Sign Out'}
                    </Button>
                  </div>
                ) : (
                  <Button 
                    variant="ghost" 
                    onClick={() => {
                      setIsLoginModalOpen(true);
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full justify-start flex items-center gap-2"
                  >
                    <User className="h-4 w-4" />
                    Student Login
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
      
      <StudentLoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
      />
    </header>
  );
}
