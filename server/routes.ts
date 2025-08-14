import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import session from "express-session";
import MemoryStore from "memorystore";
import { z } from "zod";
import { insertCourseSchema, insertLiveWebinarSchema, insertEnrollmentSchema, insertTestimonialSchema, insertPaymentSchema } from "@shared/schema";
import { zoomService, startZoomService } from "./zoom";

// Simple session configuration
const MemoryStoreSession = MemoryStore(session);

export async function registerRoutes(app: Express): Promise<Server> {
  // Configure sessions
  app.use(session({
    secret: 'campus-for-wisdom-secret-key',
    resave: false,
    saveUninitialized: false,
    store: new MemoryStoreSession({
      checkPeriod: 86400000 // prune expired entries every 24h
    }),
    cookie: {
      secure: false, // Set to true in production with HTTPS
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  }));

  // Authentication middleware
  const requireAuth = (req: any, res: any, next: any) => {
    if (!(req.session as any)?.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    next();
  };

  const requireAdmin = (req: any, res: any, next: any) => {
    if (!(req.session as any)?.user || (req.session as any).user.role !== 'admin') {
      return res.status(401).json({ error: 'Admin access required' });
    }
    next();
  };

  // Authentication routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required" });
      }

      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Simple password check (in production, use proper hashing)
      if (user.password !== password) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Store user in session
      (req.session as any).user = {
        id: user.id,
        username: user.username,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
      };

      res.json({
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
        }
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Logout route
  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error("Logout error:", err);
        return res.status(500).json({ error: "Logout failed" });
      }
      res.clearCookie('connect.sid'); // Clear the session cookie
      res.json({ success: true });
    });
  });

  // Get current user route
  app.get("/api/auth/user", (req, res) => {
    const user = (req.session as any)?.user;
    if (!user) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    res.json(user);
  });



  app.get("/api/auth/user", requireAuth, (req: any, res) => {
    res.json({ user: (req.session as any).user });
  });

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
      const course = await storage.getCourse(req.params.id);
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
      const stats = await storage.getStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Contact form (simplified - just return success for now)
  app.post("/api/contact", async (req, res) => {
    try {
      const { name, email, message } = req.body;
      if (!name || !email || !message) {
        return res.status(400).json({ error: "All fields are required" });
      }
      // In a real app, you would save this to database or send email
      console.log("Contact form submission:", { name, email, message });
      res.json({ message: "Contact form submitted successfully" });
    } catch (error) {
      console.error("Error submitting contact form:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Admin routes (protected)
  
  // Dashboard stats
  app.get("/api/admin/dashboard-stats", requireAdmin, async (req, res) => {
    try {
      const stats = await storage.getAdminStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Course Management
  app.get("/api/admin/courses", requireAdmin, async (req, res) => {
    try {
      const courses = await storage.getCourses();
      res.json(courses);
    } catch (error) {
      console.error("Error fetching courses:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/admin/courses", requireAdmin, async (req, res) => {
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

  // Student Management (simplified)
  app.get("/api/admin/students", requireAdmin, async (req, res) => {
    try {
      // Return empty array for now - would implement proper user listing
      res.json([]);
    } catch (error) {
      console.error("Error fetching students:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/admin/enrollments", requireAdmin, async (req, res) => {
    try {
      const enrollments = await storage.getEnrollmentsWithDetails();
      res.json(enrollments);
    } catch (error) {
      console.error("Error fetching enrollments:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Live Session Management
  // Zoom WebSocket status endpoint
  app.get("/api/admin/zoom/status", requireAdmin, (req, res) => {
    const isConnected = zoomService.isWebSocketConnected();
    res.json({ 
      connected: isConnected,
      status: isConnected ? 'Connected' : 'Disconnected'
    });
  });

  app.get("/api/admin/live-webinars", requireAdmin, async (req, res) => {
    try {
      const webinars = await storage.getLiveWebinars();
      res.json(webinars);
    } catch (error) {
      console.error("Error fetching live webinars:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/admin/live-webinars", requireAdmin, async (req, res) => {
    try {
      const webinarData = insertLiveWebinarSchema.parse(req.body);
      const webinar = await storage.createLiveWebinar(webinarData);
      res.json(webinar);
    } catch (error) {
      console.error("Error creating live webinar:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid webinar data", details: error.errors });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Create Zoom webinar for session
  app.post("/api/admin/live-webinars/:id/create-webinar", requireAdmin, async (req, res) => {
    try {
      const webinarId = req.params.id;
      const webinars = await storage.getLiveWebinars();
      const webinar = webinars.find(w => w.id === webinarId);
      
      if (!webinar) {
        return res.status(404).json({ error: "Webinar not found" });
      }

      const zoomWebinar = await zoomService.createZoomWebinar({
        title: webinar.title,
        description: webinar.description || "",
        startTime: webinar.scheduledAt,
        duration: webinar.duration,
        maxParticipants: webinar.maxParticipants || 100,
        timezone: 'Asia/Kolkata'
      });

      // Update webinar with Zoom webinar details
      await storage.updateLiveWebinar(webinarId, {
        title: webinar.title,
        duration: webinar.duration,
        description: webinar.description,
        scheduledAt: webinar.scheduledAt,
        zoomWebinarId: zoomWebinar.zoomWebinarId,
        zoomJoinUrl: zoomWebinar.joinUrl,
        zoomStartUrl: zoomWebinar.startUrl,
        zoomPassword: zoomWebinar.password,
        zoomWebinarUrl: zoomWebinar.joinUrl
      });

      res.json({ success: true, webinar: zoomWebinar });
    } catch (error) {
      console.error("Error creating Zoom webinar:", error);
      res.status(500).json({ error: "Failed to create Zoom webinar" });
    }
  });

  // Start live webinar
  app.put("/api/admin/live-webinars/:id/start", requireAdmin, async (req, res) => {
    try {
      const webinarId = req.params.id;
      const webinars = await storage.getLiveWebinars();
      const webinar = webinars.find(w => w.id === webinarId);
      if (!webinar) {
        return res.status(404).json({ error: "Webinar not found" });
      }
      const updatedWebinar = await storage.updateLiveWebinar(webinarId, { 
        ...webinar,
        status: "live" 
      });
      res.json(updatedWebinar);
    } catch (error) {
      console.error("Error starting webinar:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // End live webinar
  app.put("/api/admin/live-webinars/:id/end", requireAdmin, async (req, res) => {
    try {
      const webinarId = req.params.id;
      const webinars = await storage.getLiveWebinars();
      const webinar = webinars.find(w => w.id === webinarId);
      if (!webinar) {
        return res.status(404).json({ error: "Webinar not found" });
      }
      const updatedWebinar = await storage.updateLiveWebinar(webinarId, { 
        ...webinar,
        status: "completed" 
      });
      res.json(updatedWebinar);
    } catch (error) {
      console.error("Error ending webinar:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Update live webinar
  app.put("/api/admin/live-webinars/:id", requireAdmin, async (req, res) => {
    try {
      const webinarId = req.params.id;
      const webinarData = insertLiveWebinarSchema.partial().parse(req.body);
      const webinars = await storage.getLiveWebinars();
      const existingWebinar = webinars.find(w => w.id === webinarId);
      if (!existingWebinar) {
        return res.status(404).json({ error: "Webinar not found" });
      }
      const updatedWebinar = await storage.updateLiveWebinar(webinarId, {
        ...existingWebinar,
        ...webinarData
      });
      res.json(updatedWebinar);
    } catch (error) {
      console.error("Error updating webinar:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid webinar data", details: error.errors });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Delete live webinar  
  app.delete("/api/admin/live-webinars/:id", requireAdmin, async (req, res) => {
    try {
      const webinarId = req.params.id;
      await storage.deleteLiveWebinar(webinarId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting webinar:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Webinar Participant Management
  
  // Register participant for webinar
  app.post("/api/webinars/:id/register", async (req, res) => {
    try {
      const webinarId = req.params.id;
      const { name, email, role = "attendee" } = req.body;
      
      if (!name || !email) {
        return res.status(400).json({ error: "Name and email are required" });
      }

      const registration = await storage.createWebinarRegistration({
        webinarId,
        participantName: name,
        participantEmail: email,
        role: role as "host" | "panelist" | "attendee",
        registeredAt: new Date(),
        attended: false
      });

      res.json({ 
        success: true, 
        registration,
        message: "Successfully registered for webinar" 
      });
    } catch (error) {
      console.error("Error registering for webinar:", error);
      res.status(500).json({ error: "Failed to register for webinar" });
    }
  });

  // Get webinar participants
  app.get("/api/admin/live-webinars/:id/participants", requireAdmin, async (req, res) => {
    try {
      const webinarId = req.params.id;
      const participants = await storage.getWebinarParticipants(webinarId);
      res.json(participants);
    } catch (error) {
      console.error("Error fetching webinar participants:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Update participant attendance
  app.put("/api/admin/live-webinars/:webinarId/participants/:participantId", requireAdmin, async (req, res) => {
    try {
      const { webinarId, participantId } = req.params;
      const { attended, joinedAt, leftAt } = req.body;
      
      const updatedParticipant = await storage.updateWebinarAttendance(participantId, {
        attended: attended || false,
        joinedAt: joinedAt ? new Date(joinedAt) : null,
        leftAt: leftAt ? new Date(leftAt) : null
      });

      res.json(updatedParticipant);
    } catch (error) {
      console.error("Error updating participant attendance:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get webinar analytics
  app.get("/api/admin/live-webinars/:id/analytics", requireAdmin, async (req, res) => {
    try {
      const webinarId = req.params.id;
      const webinars = await storage.getLiveWebinars();
      const webinar = webinars.find(w => w.id === webinarId);
      
      if (!webinar) {
        return res.status(404).json({ error: "Webinar not found" });
      }

      const participants = await storage.getWebinarParticipants(webinarId);
      const totalRegistered = participants.length;
      const totalAttended = participants.filter(p => p.attended).length;
      const attendanceRate = totalRegistered > 0 ? (totalAttended / totalRegistered) * 100 : 0;

      const analytics = {
        webinar: {
          id: webinar.id,
          title: webinar.title,
          scheduledAt: webinar.scheduledAt,
          duration: webinar.duration,
          status: webinar.status
        },
        participation: {
          totalRegistered,
          totalAttended,
          attendanceRate: Math.round(attendanceRate * 100) / 100,
          noShows: totalRegistered - totalAttended
        },
        participants: participants.map(p => ({
          id: p.id,
          name: p.participantName,
          email: p.participantEmail,
          role: p.role,
          registeredAt: p.registeredAt,
          attended: p.attended,
          joinedAt: p.joinedAt,
          leftAt: p.leftAt
        }))
      };

      res.json(analytics);
    } catch (error) {
      console.error("Error fetching webinar analytics:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get session analytics
  app.get("/api/admin/live-sessions/:id/analytics", requireAdmin, async (req, res) => {
    try {
      const sessionId = req.params.id;
      const analytics = await storage.getSessionAnalytics(sessionId);
      const attendees = await storage.getSessionAttendees(sessionId);
      const engagement = await storage.getParticipantEngagement(sessionId);

      res.json({
        analytics,
        attendees,
        engagement
      });
    } catch (error) {
      console.error("Error fetching session analytics:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get session recording
  app.get("/api/admin/live-sessions/:id/recording", requireAdmin, async (req, res) => {
    try {
      const sessionId = req.params.id;
      const session = await storage.getLiveSession(sessionId);
      
      if (!session || !session.zoomMeetingId) {
        return res.status(404).json({ error: "Session or meeting not found" });
      }

      const recording = await zoomService.getMeetingRecording(session.zoomMeetingId);
      res.json(recording);
    } catch (error) {
      console.error("Error fetching recording:", error);
      res.status(500).json({ error: "Failed to fetch recording" });
    }
  });

  // WebSocket for real-time session updates
  const httpServer = createServer(app);
  
  // Initialize Zoom service when server starts
  startZoomService().catch(console.error);

  return httpServer;
}