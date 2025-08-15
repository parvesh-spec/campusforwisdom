import { Link, useLocation } from "wouter";
import { 
  BarChart3, 
  BookOpen, 
  Calendar, 
  CreditCard, 
  FolderOpen, 
  MessageSquare, 
  Settings, 
  Users, 
  Video,
  LayoutDashboard,
  GraduationCap,
  LogOut,
  BrainCircuit
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAdminAuth } from "@/hooks/useAuth";

export default function AdminSidebar() {
  const [location] = useLocation();
  const queryClient = useQueryClient();
  const { user: adminUser } = useAdminAuth();

  const isActive = (path: string) => location === path;

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('POST', '/api/auth/logout/admin');
    },
    onSuccess: () => {
      queryClient.setQueryData(['/api/auth/admin'], null);
      queryClient.refetchQueries();
    },
  });

  const navigation = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Course Management", href: "/admin/courses", icon: GraduationCap },
    { name: "Students", href: "/admin/students", icon: Users },
    { name: "Webinars", href: "/admin/live-sessions", icon: Video },
    { name: "AI Experts", href: "/admin/ai-experts", icon: BrainCircuit },
    { name: "Content Library", href: "/admin/content", icon: FolderOpen },
    { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
    { name: "Communications", href: "/admin/communications", icon: MessageSquare },
    { name: "Payments", href: "/admin/payments", icon: CreditCard },
    { name: "Settings", href: "/admin/settings", icon: Settings },
  ];

  return (
    <aside className="w-64 bg-white shadow-lg min-h-screen fixed left-0 top-0 z-30">
      <div className="p-6 border-b border-gray-200">
        <Link href="/admin">
          <h2 className="text-xl font-bold gradient-text cursor-pointer">
            CampusForWisdom Admin
          </h2>
        </Link>
      </div>
      
      <nav className="mt-6">
        <div className="px-4 space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.name} href={item.href}>
                <a
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive(item.href)
                      ? "text-primary bg-primary/10"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.name}</span>
                </a>
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="absolute bottom-4 left-4 right-4">
        <div className="pt-4 border-t border-gray-200">
          {adminUser && (
            <div className="space-y-3">
              <div className="text-sm text-gray-600">
                <div className="font-medium">
                  {adminUser.firstName && adminUser.lastName 
                    ? `${adminUser.firstName} ${adminUser.lastName}`
                    : adminUser.username}
                </div>
                <div className="text-xs text-gray-500">Administrator</div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => logoutMutation.mutate()}
                disabled={logoutMutation.isPending}
                className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4 mr-2" />
                {logoutMutation.isPending ? 'Logging out...' : 'Logout'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
