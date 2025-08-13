import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertCourseSchema, insertLiveSessionSchema, insertEnrollmentSchema, insertTestimonialSchema, insertPaymentSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Public API routes
  
  // Get all active courses
  app.get("/api/courses", async (req, res) => {
    try {
      const courses = await storage.getCourses();
      res.json(courses.filter(course => course.isActive));
    } catch (error) {
      console.error("Error fetching courses:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get course by ID
  app.get("/api/courses/:id", async (req, res) => {
    try {
      const course = await storage.getCourseById(req.params.id);
      if (!course || !course.isActive) {
        return res.status(404).json({ error: "Course not found" });
      }
      res.json(course);
    } catch (error) {
      console.error("Error fetching course:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get live sessions
  app.get("/api/live-sessions", async (req, res) => {
    try {
      const sessions = await storage.getLiveSessions();
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching live sessions:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get published testimonials
  app.get("/api/testimonials", async (req, res) => {
    try {
      const testimonials = await storage.getPublishedTestimonials();
      res.json(testimonials);
    } catch (error) {
      console.error("Error fetching testimonials:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get public stats
  app.get("/api/stats", async (req, res) => {
    try {
      const stats = await storage.getPublicStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Contact form submission
  app.post("/api/contact", async (req, res) => {
    try {
      const contactData = req.body;
      await storage.createContactSubmission(contactData);
      res.json({ message: "Contact form submitted successfully" });
    } catch (error) {
      console.error("Error submitting contact form:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Course enrollment
  app.post("/api/enroll", async (req, res) => {
    try {
      const enrollmentData = insertEnrollmentSchema.parse(req.body);
      const enrollment = await storage.createEnrollment(enrollmentData);
      res.json(enrollment);
    } catch (error) {
      console.error("Error creating enrollment:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Admin API routes
  
  // Admin Dashboard Stats
  app.get("/api/admin/stats", async (req, res) => {
    try {
      const stats = await storage.getAdminStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Admin Activities
  app.get("/api/admin/activities", async (req, res) => {
    try {
      const activities = await storage.getRecentActivities();
      res.json(activities);
    } catch (error) {
      console.error("Error fetching activities:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Admin Popular Courses
  app.get("/api/admin/popular-courses", async (req, res) => {
    try {
      const courses = await storage.getPopularCourses();
      res.json(courses);
    } catch (error) {
      console.error("Error fetching popular courses:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Course Management
  app.get("/api/admin/courses", async (req, res) => {
    try {
      const courses = await storage.getCourses();
      res.json(courses);
    } catch (error) {
      console.error("Error fetching courses:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/admin/courses", async (req, res) => {
    try {
      const courseData = insertCourseSchema.parse(req.body);
      const course = await storage.createCourse(courseData);
      res.json(course);
    } catch (error) {
      console.error("Error creating course:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid course data", details: error.errors });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.put("/api/admin/courses/:id", async (req, res) => {
    try {
      const courseData = insertCourseSchema.parse(req.body);
      const course = await storage.updateCourse(req.params.id, courseData);
      if (!course) {
        return res.status(404).json({ error: "Course not found" });
      }
      res.json(course);
    } catch (error) {
      console.error("Error updating course:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid course data", details: error.errors });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/admin/courses/:id", async (req, res) => {
    try {
      const success = await storage.deleteCourse(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Course not found" });
      }
      res.json({ message: "Course deleted successfully" });
    } catch (error) {
      console.error("Error deleting course:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Student Management
  app.get("/api/admin/students", async (req, res) => {
    try {
      const students = await storage.getStudentsWithStats();
      res.json(students);
    } catch (error) {
      console.error("Error fetching students:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/admin/enrollments", async (req, res) => {
    try {
      const enrollments = await storage.getEnrollmentsWithDetails();
      res.json(enrollments);
    } catch (error) {
      console.error("Error fetching enrollments:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/admin/student-stats", async (req, res) => {
    try {
      const stats = await storage.getStudentStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching student stats:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Live Session Management
  app.get("/api/admin/live-sessions", async (req, res) => {
    try {
      const sessions = await storage.getLiveSessions();
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching live sessions:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/admin/live-sessions", async (req, res) => {
    try {
      const sessionData = insertLiveSessionSchema.parse(req.body);
      const session = await storage.createLiveSession(sessionData);
      res.json(session);
    } catch (error) {
      console.error("Error creating live session:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid session data", details: error.errors });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.put("/api/admin/live-sessions/:id", async (req, res) => {
    try {
      const sessionData = insertLiveSessionSchema.parse(req.body);
      const session = await storage.updateLiveSession(req.params.id, sessionData);
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }
      res.json(session);
    } catch (error) {
      console.error("Error updating live session:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid session data", details: error.errors });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/admin/live-sessions/:id", async (req, res) => {
    try {
      const success = await storage.deleteLiveSession(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Session not found" });
      }
      res.json({ message: "Session deleted successfully" });
    } catch (error) {
      console.error("Error deleting live session:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/admin/live-sessions/:id/start", async (req, res) => {
    try {
      const session = await storage.startLiveSession(req.params.id);
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }
      res.json(session);
    } catch (error) {
      console.error("Error starting live session:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/admin/live-sessions/:id/end", async (req, res) => {
    try {
      const session = await storage.endLiveSession(req.params.id);
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }
      res.json(session);
    } catch (error) {
      console.error("Error ending live session:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Content Library
  app.get("/api/admin/content/files", async (req, res) => {
    try {
      const files = await storage.getContentFiles();
      res.json(files);
    } catch (error) {
      console.error("Error fetching content files:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/admin/content/folders", async (req, res) => {
    try {
      const folders = await storage.getContentFolders();
      res.json(folders);
    } catch (error) {
      console.error("Error fetching content folders:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/admin/content/stats", async (req, res) => {
    try {
      const stats = await storage.getContentStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching content stats:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/admin/content/files/:id", async (req, res) => {
    try {
      const success = await storage.deleteContentFile(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "File not found" });
      }
      res.json({ message: "File deleted successfully" });
    } catch (error) {
      console.error("Error deleting content file:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Analytics
  app.get("/api/admin/analytics/overview", async (req, res) => {
    try {
      const timeRange = req.query.timeRange as string || "30d";
      const overview = await storage.getAnalyticsOverview(timeRange);
      res.json(overview);
    } catch (error) {
      console.error("Error fetching analytics overview:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/admin/analytics/courses", async (req, res) => {
    try {
      const timeRange = req.query.timeRange as string || "30d";
      const courseAnalytics = await storage.getCourseAnalytics(timeRange);
      res.json(courseAnalytics);
    } catch (error) {
      console.error("Error fetching course analytics:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/admin/analytics/students", async (req, res) => {
    try {
      const timeRange = req.query.timeRange as string || "30d";
      const studentAnalytics = await storage.getStudentAnalytics(timeRange);
      res.json(studentAnalytics);
    } catch (error) {
      console.error("Error fetching student analytics:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/admin/analytics/revenue", async (req, res) => {
    try {
      const timeRange = req.query.timeRange as string || "30d";
      const revenueAnalytics = await storage.getRevenueAnalytics(timeRange);
      res.json(revenueAnalytics);
    } catch (error) {
      console.error("Error fetching revenue analytics:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Communications
  app.get("/api/admin/communications/messages", async (req, res) => {
    try {
      const messages = await storage.getMessages();
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/admin/communications/conversations", async (req, res) => {
    try {
      const conversations = await storage.getConversations();
      res.json(conversations);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/admin/users", async (req, res) => {
    try {
      const users = await storage.getUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/admin/communications/send", async (req, res) => {
    try {
      const messageData = req.body;
      const message = await storage.sendMessage(messageData);
      res.json(message);
    } catch (error) {
      console.error("Error sending message:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Payments
  app.get("/api/admin/payments", async (req, res) => {
    try {
      const payments = await storage.getPaymentsWithDetails();
      res.json(payments);
    } catch (error) {
      console.error("Error fetching payments:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/admin/payment-stats", async (req, res) => {
    try {
      const timeRange = req.query.timeRange as string || "30d";
      const stats = await storage.getPaymentStats(timeRange);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching payment stats:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/admin/revenue-trends", async (req, res) => {
    try {
      const timeRange = req.query.timeRange as string || "30d";
      const trends = await storage.getRevenueTrends(timeRange);
      res.json(trends);
    } catch (error) {
      console.error("Error fetching revenue trends:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.put("/api/admin/payments/:id", async (req, res) => {
    try {
      const { status } = req.body;
      const payment = await storage.updatePaymentStatus(req.params.id, status);
      if (!payment) {
        return res.status(404).json({ error: "Payment not found" });
      }
      res.json(payment);
    } catch (error) {
      console.error("Error updating payment:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/admin/payments/:id/refund", async (req, res) => {
    try {
      const payment = await storage.processRefund(req.params.id);
      if (!payment) {
        return res.status(404).json({ error: "Payment not found" });
      }
      res.json(payment);
    } catch (error) {
      console.error("Error processing refund:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Settings
  app.get("/api/admin/settings/:category", async (req, res) => {
    try {
      const settings = await storage.getSettings(req.params.category);
      res.json(settings);
    } catch (error) {
      console.error("Error fetching settings:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.put("/api/admin/settings/:category", async (req, res) => {
    try {
      const settings = await storage.updateSettings(req.params.category, req.body);
      res.json(settings);
    } catch (error) {
      console.error("Error updating settings:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
