import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Menu, X, User, LogOut } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import StudentLoginModal from "@/components/StudentLoginModal";
import StudentProfile from "@/components/StudentProfile";
import AdminLogout from "@/components/AdminLogout";
import { useStudentAuth, useAdminAuth } from "@/hooks/useAuth";
import logoImage from "@assets/New Logo Campous_1755838818776.png";

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [location] = useLocation();
  const { user: studentUser, isLoading: studentLoading, isAuthenticated: isStudentAuthenticated } = useStudentAuth();
  const { user: adminUser, isLoading: adminLoading, isAuthenticated: isAdminAuthenticated } = useAdminAuth();
  
  const isLoading = studentLoading || adminLoading;
  const queryClient = useQueryClient();

  const logoutMutation = useMutation({
    mutationFn: async (type: 'student' | 'admin' | 'all') => {
      if (type === 'student') {
        await apiRequest('POST', '/api/auth/logout/student');
      } else if (type === 'admin') {
        await apiRequest('POST', '/api/auth/logout/admin');
      } else {
        await apiRequest('POST', '/api/auth/logout');
      }
    },
    onSuccess: (_, type) => {
      // Clear the appropriate query cache
      if (type === 'student') {
        queryClient.setQueryData(['/api/auth/student'], null);
      } else if (type === 'admin') {
        queryClient.setQueryData(['/api/auth/admin'], null);
      } else {
        queryClient.setQueryData(['/api/auth/user'], null);
        queryClient.setQueryData(['/api/auth/student'], null);
        queryClient.setQueryData(['/api/auth/admin'], null);
      }
      // Refresh queries to update state
      queryClient.refetchQueries();
    },
  });

  const handleStudentLogout = () => {
    logoutMutation.mutate('student');
    setIsMobileMenuOpen(false);
  };

  const handleAdminLogout = () => {
    logoutMutation.mutate('admin');
    setIsMobileMenuOpen(false);
  };

  const isActive = (path: string) => location === path;
  const isAdminPage = location.startsWith('/admin');

  const navigation = [
    { name: "Home", href: "/" },
    { name: "Courses", href: "/courses" },
    { name: "Live Sessions", href: "/live-sessions" },
    { name: "AI Experts", href: "/ai-experts" },
    { name: "eBooks", href: "/ebooks" },
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
                <img 
                  src={logoImage} 
                  alt="Campus for Wisdom" 
                  className="h-10 w-auto cursor-pointer hover:opacity-80 transition-opacity"
                />
              </Link>
            </div>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              {navigation.map((item) => (
                <Link key={item.name} href={item.href}>
                  <span
                    className={`transition-colors px-3 py-2 rounded-md text-sm font-medium cursor-pointer ${
                      isActive(item.href)
                        ? "text-primary"
                        : "text-gray-600 hover:text-primary"
                    }`}
                  >
                    {item.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6 space-x-3">
              {isLoading ? (
                <div className="h-8 w-24 bg-gray-200 animate-pulse rounded"></div>
              ) : (
                <>
                  {/* Student Login/Profile */}
                  {isStudentAuthenticated && studentUser ? (
                    <StudentProfile user={studentUser} />
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
                  
                  {/* Admin Controls - only show on admin pages */}
                  {isAdminAuthenticated && adminUser && isAdminPage && (
                    <AdminLogout user={adminUser} />
                  )}
                </>
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
                  <span
                    className={`block px-3 py-2 rounded-md text-base font-medium transition-colors cursor-pointer ${
                      isActive(item.href)
                        ? "text-primary bg-primary/10"
                        : "text-gray-600 hover:text-primary hover:bg-gray-50"
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.name}
                  </span>
                </Link>
              ))}
              <div className="flex flex-col space-y-2 pt-4">
                {/* Student Login/Profile */}
                {isStudentAuthenticated && studentUser ? (
                  <div className="px-3 py-2 border rounded-lg bg-gray-50">
                    <p className="text-sm font-medium text-gray-900">
                      {studentUser.firstName && studentUser.lastName 
                        ? `${studentUser.firstName} ${studentUser.lastName}`
                        : studentUser.username}
                    </p>
                    <p className="text-xs text-gray-500">Student</p>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleStudentLogout()}
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

                {/* Admin Controls - only show on admin pages */}
                {isAdminAuthenticated && adminUser && isAdminPage && (
                  <div className="px-3 py-2 border rounded-lg bg-blue-50">
                    <p className="text-sm font-medium text-gray-900">
                      {adminUser.firstName && adminUser.lastName 
                        ? `${adminUser.firstName} ${adminUser.lastName}`
                        : adminUser.username}
                    </p>
                    <p className="text-xs text-blue-600">Admin User</p>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleAdminLogout()}
                      disabled={logoutMutation.isPending}
                      className="w-full mt-2 text-red-600 hover:text-red-700 justify-start"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      {logoutMutation.isPending ? 'Signing out...' : 'Sign Out'}
                    </Button>
                  </div>
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
