import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

// Public pages
import Home from "@/pages/home";
import Courses from "@/pages/courses";
import LiveSessions from "@/pages/live-sessions";
import About from "@/pages/about";
import Contact from "@/pages/contact";

// Admin pages
import AdminDashboard from "@/pages/admin/dashboard";
import CourseManagement from "@/pages/admin/course-management";
import StudentManagement from "@/pages/admin/student-management";
import LiveSessionsManagement from "@/pages/admin/live-sessions-management";
import ContentLibrary from "@/pages/admin/content-library";
import Analytics from "@/pages/admin/analytics";
import Communications from "@/pages/admin/communications";
import Payments from "@/pages/admin/payments";
import Settings from "@/pages/admin/settings";

// Layouts
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import AdminSidebar from "@/components/layout/admin-sidebar";

function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>{children}</main>
      <Footer />
    </div>
  );
}

function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar />
      <main className="flex-1 ml-64">
        {children}
      </main>
    </div>
  );
}

function Router() {
  return (
    <Switch>
      {/* Public routes */}
      <Route path="/">
        <PublicLayout>
          <Home />
        </PublicLayout>
      </Route>
      <Route path="/courses">
        <PublicLayout>
          <Courses />
        </PublicLayout>
      </Route>
      <Route path="/live-sessions">
        <PublicLayout>
          <LiveSessions />
        </PublicLayout>
      </Route>
      <Route path="/about">
        <PublicLayout>
          <About />
        </PublicLayout>
      </Route>
      <Route path="/contact">
        <PublicLayout>
          <Contact />
        </PublicLayout>
      </Route>

      {/* Admin routes */}
      <Route path="/admin">
        <AdminLayout>
          <AdminDashboard />
        </AdminLayout>
      </Route>
      <Route path="/admin/courses">
        <AdminLayout>
          <CourseManagement />
        </AdminLayout>
      </Route>
      <Route path="/admin/students">
        <AdminLayout>
          <StudentManagement />
        </AdminLayout>
      </Route>
      <Route path="/admin/live-sessions">
        <AdminLayout>
          <LiveSessionsManagement />
        </AdminLayout>
      </Route>
      <Route path="/admin/content">
        <AdminLayout>
          <ContentLibrary />
        </AdminLayout>
      </Route>
      <Route path="/admin/analytics">
        <AdminLayout>
          <Analytics />
        </AdminLayout>
      </Route>
      <Route path="/admin/communications">
        <AdminLayout>
          <Communications />
        </AdminLayout>
      </Route>
      <Route path="/admin/payments">
        <AdminLayout>
          <Payments />
        </AdminLayout>
      </Route>
      <Route path="/admin/settings">
        <AdminLayout>
          <Settings />
        </AdminLayout>
      </Route>

      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
