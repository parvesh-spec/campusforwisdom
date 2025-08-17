import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Login from "@/pages/login";
import AdminLogin from "@/pages/admin-login";
import NotFound from "@/pages/not-found";

// Public pages
import Home from "@/pages/home";
import Courses from "@/pages/courses";
import CourseDetail from "@/pages/course-detail";
import LiveSessions from "@/pages/live-sessions";
import WebinarDetail from "@/pages/webinar-detail";
import AIExperts from "@/pages/ai-experts";
import ExpertProfile from "@/pages/expert-profile";
import EbooksPage from "@/pages/ebooks";
import EbookDetail from "@/pages/ebook-detail";
import About from "@/pages/about";
import Contact from "@/pages/contact";
import ProfileSettings from "@/pages/profile-settings";
import LegalPage from "@/pages/legal-page";

// Admin pages
import AdminDashboard from "./pages/admin/dashboard";
import CourseManagement from "./pages/admin/course-management";
import StudentManagement from "./pages/admin/student-management";
import StudentDetail from "./pages/admin/student-detail";
import LiveSessionsManagement from "./pages/admin/live-sessions-management";
import AIExpertsManagement from "./pages/admin/ai-experts-management";
import ConsultationsManagement from "./pages/admin/consultations-management";
import EbooksManagement from "./pages/admin/ebooks-management";
import ContentLibrary from "./pages/admin/content-library";
import Analytics from "./pages/admin/analytics";
import Communications from "./pages/admin/communications";
import Payments from "./pages/admin/payments";
import Settings from "./pages/admin/settings";
import AdminLegalPages from "./pages/admin/legal-pages";

// Layouts
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import AdminSidebar from "@/components/layout/admin-sidebar";
import AdminAuthWrapper from "@/components/AdminAuthWrapper";

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
    <AdminAuthWrapper>
      <div className="min-h-screen bg-gray-50 flex">
        <AdminSidebar />
        <main className="flex-1 ml-64">
          {children}
        </main>
      </div>
    </AdminAuthWrapper>
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
      <Route path="/course/:courseId">
        <PublicLayout>
          <CourseDetail />
        </PublicLayout>
      </Route>
      <Route path="/courses/:courseId">
        <PublicLayout>
          <CourseDetail />
        </PublicLayout>
      </Route>
      <Route path="/live-sessions">
        <PublicLayout>
          <LiveSessions />
        </PublicLayout>
      </Route>
      <Route path="/webinar/:sessionId">
        <PublicLayout>
          <WebinarDetail />
        </PublicLayout>
      </Route>
      <Route path="/ai-experts">
        <PublicLayout>
          <AIExperts />
        </PublicLayout>
      </Route>
      <Route path="/experts/:id">
        <PublicLayout>
          <ExpertProfile />
        </PublicLayout>
      </Route>
      <Route path="/ebooks">
        <PublicLayout>
          <EbooksPage />
        </PublicLayout>
      </Route>
      <Route path="/ebooks/:id">
        <PublicLayout>
          <EbookDetail />
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
      <Route path="/login" component={Login} />
      <Route path="/admin-login" component={() => <AdminLogin />} />
      <Route path="/profile-settings">
        <PublicLayout>
          <ProfileSettings />
        </PublicLayout>
      </Route>
      <Route path="/legal/:slug">
        <PublicLayout>
          <LegalPage />
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
      <Route path="/admin/students/:id">
        <AdminLayout>
          <StudentDetail />
        </AdminLayout>
      </Route>
      <Route path="/admin/live-sessions">
        <AdminLayout>
          <LiveSessionsManagement />
        </AdminLayout>
      </Route>
      <Route path="/admin/ai-experts">
        <AdminLayout>
          <AIExpertsManagement />
        </AdminLayout>
      </Route>
      <Route path="/admin/consultations">
        <AdminLayout>
          <ConsultationsManagement />
        </AdminLayout>
      </Route>
      <Route path="/admin/ebooks">
        <AdminLayout>
          <EbooksManagement />
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
      <Route path="/admin/legal-pages">
        <AdminLayout>
          <AdminLegalPages />
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
