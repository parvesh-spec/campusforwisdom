import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { pool } from "./db";
import { z } from "zod";
import { insertCourseSchema, insertWebinarSchema, insertEnrollmentSchema, insertTestimonialSchema, insertPaymentSchema, insertExpertSchema, insertConsultationSchema } from "@shared/schema";
import { zohoAPI } from "./zoho-api";
import multer from "multer";
import cloudinary from "./cloudinary";

// PostgreSQL session store configuration
const PgSession = connectPgSimple(session);

export async function registerRoutes(app: Express): Promise<Server> {
  // Configure sessions with PostgreSQL store
  app.use(session({
    secret: 'campus-for-wisdom-secret-key',
    resave: false,
    saveUninitialized: false,
    store: new PgSession({
      pool: pool,
      tableName: 'session',
      createTableIfMissing: true,
    }),
    cookie: {
      secure: false, // Set to true in production with HTTPS
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
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
    const adminUser = (req.session as any)?.adminUser;
    if (!adminUser || adminUser.role !== 'admin') {
      return res.status(401).json({ error: 'Admin access required' });
    }
    next();
  };

  // Zoho OAuth callback route
  app.get("/auth/zoho/callback", async (req, res) => {
    try {
      const { code, error } = req.query;
      
      if (error) {
        return res.status(400).send(`
          <html>
            <head><title>Zoho OAuth Error</title></head>
            <body>
              <h2>OAuth Error: ${error}</h2>
              <p>Please try again.</p>
            </body>
          </html>
        `);
      }
      
      if (code) {
        return res.send(`
          <html>
            <head><title>Zoho OAuth Success</title></head>
            <body>
              <h2>Authorization Code Received!</h2>
              <p><strong>Copy this code:</strong></p>
              <pre style="background: #f5f5f5; padding: 10px; font-family: monospace; border: 1px solid #ddd;">${code}</pre>
              <p>Use this code to generate your refresh token.</p>
            </body>
          </html>
        `);
      }
      
      res.status(400).send(`
        <html>
          <head><title>Zoho OAuth</title></head>
          <body>
            <h2>No authorization code received</h2>
            <p>Please try the OAuth flow again.</p>
          </body>
        </html>
      `);
    } catch (error) {
      console.error('Zoho OAuth callback error:', error);
      res.status(500).send('Internal server error');
    }
  });

  // Check username availability
  app.get("/api/auth/check-username", async (req, res) => {
    try {
      const { username } = req.query;
      
      if (!username) {
        return res.status(400).json({ error: "Username is required" });
      }

      const existingUser = await storage.getUserByUsername(username as string);
      res.json({ available: !existingUser });
    } catch (error) {
      console.error("Username check error:", error);
      res.status(500).json({ error: "Failed to check username availability" });
    }
  });

  // Student Registration route
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { firstName, lastName, email, phone, username, password } = req.body;
      
      // Basic validation
      if (!firstName || !lastName || !email || !phone || !password) {
        return res.status(400).json({ error: "First Name, Last Name, Email, Phone and Password are required" });
      }

      // Check if email already exists
      const existingEmail = await storage.getUserByEmail(email);
      if (existingEmail) {
        return res.status(400).json({ error: "Email already exists" });
      }

      // Check if phone already exists
      const existingPhone = await storage.getUserByPhone(phone);
      if (existingPhone) {
        return res.status(400).json({ error: "Phone number already exists" });
      }

      // Generate username if not provided
      let finalUsername = username;
      if (!username || username.trim() === '') {
        // Generate username from firstName + lastName + random number
        const baseUsername = (firstName + lastName).toLowerCase().replace(/[^a-z0-9]/g, '');
        let generatedUsername = baseUsername;
        let counter = 1;
        
        // Keep checking until we find a unique username
        while (await storage.getUserByUsername(generatedUsername)) {
          generatedUsername = baseUsername + counter;
          counter++;
        }
        finalUsername = generatedUsername;
      } else {
        // Check if provided username already exists
        const existingUser = await storage.getUserByUsername(username);
        if (existingUser) {
          return res.status(400).json({ error: "Username already exists" });
        }
      }

      // Create new student user
      const newUser = await storage.createUser({
        username: finalUsername,
        email,
        password,
        firstName,
        lastName,
        phone,
        role: "student"
      });

      // Auto-login the user after successful registration
      const sessionUser = {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
      };

      (req.session as any).user = sessionUser;
      (req.session as any).studentUser = sessionUser;

      res.json({ user: sessionUser });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ error: "Registration failed" });
    }
  });

  // Authentication routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ error: "Username/Email/Phone and password are required" });
      }

      // Try to find user by username, email, or phone
      let user = await storage.getUserByUsername(username);
      if (!user) {
        user = await storage.getUserByEmail(username);
      }
      if (!user) {
        user = await storage.getUserByPhone(username);
      }
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Simple password check (in production, use proper hashing)
      if (user.password !== password) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Store user in session based on role
      if (user.role === 'admin') {
        (req.session as any).adminUser = {
          id: user.id,
          username: user.username,
          email: user.email,
          phone: user.phone,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
        };
      } else {
        (req.session as any).studentUser = {
          id: user.id,
          username: user.username,
          email: user.email,
          phone: user.phone,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
        };
      }

      // Also maintain the general user field for backward compatibility
      (req.session as any).user = {
        id: user.id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
      };

      res.json({
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          phone: user.phone,
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

  // Logout route (logs out all users)
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

  // Logout student only
  app.post("/api/auth/logout/student", (req, res) => {
    if ((req.session as any)?.studentUser) {
      delete (req.session as any).studentUser;
      // Only update general user field if there's no admin logged in
      if ((req.session as any)?.user?.role === 'student' && !(req.session as any)?.adminUser) {
        delete (req.session as any).user;
      } else if ((req.session as any)?.adminUser) {
        // If admin is still logged in, keep general user as admin
        (req.session as any).user = {
          id: (req.session as any).adminUser.id,
          username: (req.session as any).adminUser.username,
          email: (req.session as any).adminUser.email,
          phone: (req.session as any).adminUser.phone,
          role: (req.session as any).adminUser.role,
          firstName: (req.session as any).adminUser.firstName,
          lastName: (req.session as any).adminUser.lastName,
        };
      }
    }
    res.json({ success: true });
  });

  // Logout admin only
  app.post("/api/auth/logout/admin", (req, res) => {
    if ((req.session as any)?.adminUser) {
      delete (req.session as any).adminUser;
      // Only update general user field if there's no student logged in
      if ((req.session as any)?.user?.role === 'admin' && !(req.session as any)?.studentUser) {
        delete (req.session as any).user;
      } else if ((req.session as any)?.studentUser) {
        // If student is still logged in, keep general user as student
        (req.session as any).user = {
          id: (req.session as any).studentUser.id,
          username: (req.session as any).studentUser.username,
          email: (req.session as any).studentUser.email,
          phone: (req.session as any).studentUser.phone,
          role: (req.session as any).studentUser.role,
          firstName: (req.session as any).studentUser.firstName,
          lastName: (req.session as any).studentUser.lastName,
        };
      }
    }
    res.json({ success: true });
  });

  // Get current user route (returns the last logged in user for backward compatibility)
  app.get("/api/auth/user", (req, res) => {
    const user = (req.session as any)?.user;
    if (!user) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    res.json(user);
  });

  // Get current student user
  app.get("/api/auth/student", (req, res) => {
    const studentUser = (req.session as any)?.studentUser;
    if (!studentUser) {
      return res.status(401).json({ error: "Student not authenticated" });
    }
    res.json(studentUser);
  });

  // Get current admin user  
  app.get("/api/auth/admin", (req, res) => {
    const adminUser = (req.session as any)?.adminUser;
    if (!adminUser) {
      return res.status(401).json({ error: "Admin not authenticated" });
    }
    res.json(adminUser);
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

  // Student routes (protected)
  
  // Update student profile
  app.put("/api/student/profile", requireAuth, async (req, res) => {
    try {
      const studentUser = (req.session as any)?.studentUser;
      if (!studentUser || studentUser.role !== 'student') {
        return res.status(401).json({ error: 'Student access required' });
      }

      const {
        firstName,
        lastName,
        dateOfBirth,
        gender,
        address,
        city,
        state,
        country,
        occupation,
        education,
        experience,
      } = req.body;

      const updatedUser = await storage.updateUserProfile(studentUser.id, {
        firstName,
        lastName,
        dateOfBirth,
        gender,
        address,
        city,
        state,
        country,
        occupation,
        education,
        experience,
      });

      // Update session data
      (req.session as any).studentUser = {
        ...studentUser,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        dateOfBirth: updatedUser.dateOfBirth,
        gender: updatedUser.gender,
        address: updatedUser.address,
        city: updatedUser.city,
        state: updatedUser.state,
        country: updatedUser.country,
        occupation: updatedUser.occupation,
        education: updatedUser.education,
        experience: updatedUser.experience,
      };

      // Also update general user field if it's the student
      if ((req.session as any)?.user?.id === studentUser.id) {
        (req.session as any).user = {
          ...(req.session as any).user,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
        };
      }

      res.json({
        message: "Profile updated successfully",
        user: updatedUser
      });
    } catch (error) {
      console.error("Error updating profile:", error);
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
  app.get("/api/admin/live-sessions", requireAdmin, async (req, res) => {
    try {
      const sessions = await storage.getLiveSessions();
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching live sessions:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Create webinar through Zoho API
  app.post("/api/admin/live-sessions", requireAdmin, async (req, res) => {
    try {
      const sessionData = insertWebinarSchema.parse(req.body);
      console.log('📝 Creating webinar with data:', {
        title: sessionData.title,
        scheduledAt: sessionData.scheduledAt,
        duration: sessionData.duration
      });
      
      // Create webinar through Zoho API if available
      if (zohoAPI) {
        try {
          console.log('🚀 Attempting to create webinar through Zoho API...');
          
          // Skip connection test and directly try webinar creation
          console.log('⏭️ Skipping connection test, attempting direct webinar creation...');
          
          const zohoResponse = await zohoAPI.createWebinar({
            title: sessionData.title,
            description: sessionData.description,
            scheduledAt: new Date(sessionData.scheduledAt),
            duration: sessionData.duration,
            timezone: sessionData.timezone || 'Asia/Calcutta',
            participants: sessionData.participants || [],
          });

          // Store webinar in database with Zoho details
          const webinarWithZohoData = {
            ...sessionData,
            meetingKey: zohoResponse.session.meetingKey,
            registrationLink: zohoResponse.session.registrationLink,
            startLink: zohoResponse.session.startLink,
            webinarId: zohoResponse.session.meetingKey,
            presenterZuid: zohoResponse.session.presenter,
          };

          const session = await storage.createLiveSession(webinarWithZohoData);
          
          console.log('✅ Webinar created successfully with Zoho integration');
          console.log('📊 Zoho Response:', {
            meetingKey: zohoResponse.session.meetingKey,
            registrationLink: zohoResponse.session.registrationLink
          });
          
          res.json({
            ...session,
            success: true,
            zohoIntegrated: true,
            zohoData: {
              meetingKey: zohoResponse.session.meetingKey,
              registrationLink: zohoResponse.session.registrationLink,
              startLink: zohoResponse.session.startLink
            }
          });
        } catch (zohoError) {
          console.error('❌ Zoho API Error Details:', {
            message: zohoError instanceof Error ? zohoError.message : 'Unknown error',
            stack: zohoError instanceof Error ? zohoError.stack : undefined
          });
          
          // Return error to frontend instead of fallback
          return res.status(422).json({
            error: 'Zoho Webinar Creation Failed',
            message: zohoError instanceof Error ? zohoError.message : 'Failed to create webinar in Zoho',
            zohoIntegrated: false,
            suggestion: 'Please check your Zoho API credentials and try again.'
          });
        }
      } else {
        // No Zoho API available - return error instead of creating without integration
        console.log('❌ Zoho API not initialized - missing credentials');
        return res.status(422).json({
          error: 'Zoho Integration Required',
          message: 'Zoho API credentials are not configured. Cannot create webinar.',
          zohoIntegrated: false,
          suggestion: 'Please configure ZOHO_CLIENT_ID, ZOHO_CLIENT_SECRET, ZOHO_REFRESH_TOKEN, and ZOHO_ZSOID environment variables.'
        });
      }
    } catch (error) {
      console.error("Error creating webinar:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          error: "Invalid webinar data", 
          details: error.errors 
        });
      }
      res.status(500).json({ 
        error: "Internal server error",
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    }
  });

  // Debug endpoint to test Zoho API connection
  app.get("/api/admin/zoho-test", requireAdmin, async (req, res) => {
    try {
      if (!zohoAPI) {
        return res.status(422).json({
          success: false,
          message: 'Zoho API not initialized - missing credentials',
          suggestion: 'Please set ZOHO_CLIENT_ID, ZOHO_CLIENT_SECRET, ZOHO_REFRESH_TOKEN, and ZOHO_ZSOID environment variables.'
        });
      }

      console.log('🧪 Testing Zoho API connection...');
      const connectionTest = await zohoAPI.testConnection();
      
      if (connectionTest) {
        res.json({
          success: true,
          message: 'Zoho API connection successful',
          zohoIntegrated: true
        });
      } else {
        res.status(422).json({
          success: false,
          message: 'Zoho API connection failed',
          suggestion: 'Please check your Zoho API credentials and try again.'
        });
      }
    } catch (error) {
      console.error('❌ Zoho API test error:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        suggestion: 'Please check your Zoho API credentials and server logs.'
      });
    }
  });

  // ===== EXPERTS & CONSULTATIONS API =====

  // Get all experts
  app.get("/api/experts", async (req, res) => {
    try {
      const experts = await storage.getExperts();
      res.json(experts);
    } catch (error) {
      console.error("Error fetching experts:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get student consultations
  app.get("/api/student/consultations", async (req, res) => {
    try {
      const studentUser = (req.session as any)?.studentUser;
      if (!studentUser || studentUser.role !== 'student') {
        return res.status(401).json({ error: 'Student access required' });
      }

      const consultations = await storage.getStudentConsultations(studentUser.id);
      res.json(consultations);
    } catch (error) {
      console.error("Error fetching student consultations:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Book consultation
  app.post("/api/student/consultations", async (req, res) => {
    try {
      const studentUser = (req.session as any)?.studentUser;
      if (!studentUser || studentUser.role !== 'student') {
        return res.status(401).json({ error: 'Student access required' });
      }

      const consultationData = insertConsultationSchema.parse({
        ...req.body,
        studentId: studentUser.id
      });

      const consultation = await storage.createConsultation(consultationData);
      res.json(consultation);
    } catch (error) {
      console.error("Error booking consultation:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid consultation data", details: error.errors });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // ===== ADMIN EXPERTS MANAGEMENT =====

  // Get all experts for admin
  app.get("/api/admin/experts", requireAdmin, async (req, res) => {
    try {
      const experts = await storage.getExperts();
      res.json(experts);
    } catch (error) {
      console.error("Error fetching experts:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Search students by name
  app.get("/api/admin/students/search", requireAdmin, async (req, res) => {
    try {
      const { q } = req.query;
      if (!q || typeof q !== 'string') {
        return res.json([]);
      }
      
      const students = await storage.searchStudentsByName(q);
      res.json(students);
    } catch (error) {
      console.error("Error searching students:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Create expert
  app.post("/api/admin/experts", requireAdmin, async (req, res) => {
    try {
      const expertData = insertExpertSchema.parse(req.body);
      const expert = await storage.createExpert(expertData);
      res.json(expert);
    } catch (error) {
      console.error("Error creating expert:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid expert data", details: error.errors });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Update expert
  app.put("/api/admin/experts/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const expertData = insertExpertSchema.parse(req.body);
      const expert = await storage.updateExpert(id, expertData);
      res.json(expert);
    } catch (error) {
      console.error("Error updating expert:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid expert data", details: error.errors });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Delete expert
  app.delete("/api/admin/experts/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteExpert(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting expert:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // ===== ADMIN CONSULTATIONS MANAGEMENT =====

  // Get all consultations for admin
  app.get("/api/admin/consultations", requireAdmin, async (req, res) => {
    try {
      const consultations = await storage.getAllConsultations();
      res.json(consultations);
    } catch (error) {
      console.error("Error fetching consultations:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Create consultation
  app.post("/api/admin/consultations", requireAdmin, async (req, res) => {
    try {
      const consultationData = insertConsultationSchema.parse(req.body);
      
      // Create consultation first
      const consultation = await storage.createConsultation(consultationData);
      
      try {
        // Get expert and student details for Zoho webinar
        const expert = await storage.getExpert(consultationData.expertId);
        const student = await storage.getUser(consultationData.studentId);
        
        if (expert && student) {
          console.log(`🚀 Creating Zoho webinar for consultation: ${consultation.title}`);
          
          // Create Zoho webinar
          const webinarResponse = await zohoAPI.createWebinar({
            title: `AI Expert Consultation: ${consultation.title}`,
            description: `AI Expert consultation between ${expert.name} and ${student.firstName || student.username}. ${consultation.description || ''}`,
            scheduledAt: consultation.scheduledAt,
            duration: consultation.duration || 60,
            timezone: 'Asia/Calcutta',
            participants: [student.email].filter(Boolean)
          });
          
          // Update consultation with meeting URL
          const meetingUrl = webinarResponse.session.registrationLink;
          const startLink = `https://meeting.zoho.in${webinarResponse.session.startLink}`;
          
          await storage.updateConsultation(consultation.id, {
            meetingUrl: meetingUrl,
            // Store start link in notes for expert access
            notes: `Expert Start Link: ${startLink}`
          });
          
          console.log(`✅ Webinar created successfully for consultation ${consultation.id}`);
          console.log(`📧 Student registration link: ${meetingUrl}`);
          console.log(`🎯 Expert start link: ${startLink}`);
          
          // Return consultation with meeting URL
          const updatedConsultation = await storage.getConsultation(consultation.id);
          res.json(updatedConsultation);
        } else {
          console.warn('⚠️ Could not find expert or student for webinar creation');
          res.json(consultation);
        }
      } catch (webinarError) {
        console.error('❌ Error creating Zoho webinar:', webinarError);
        console.log('📝 Consultation created without webinar link');
        res.json(consultation);
      }
    } catch (error) {
      console.error("Error creating consultation:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid consultation data", details: error.errors });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Update consultation
  app.put("/api/admin/consultations/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const consultationData = insertConsultationSchema.parse(req.body);
      const consultation = await storage.updateConsultation(id, consultationData);
      
      if (!consultation) {
        return res.status(404).json({ error: "Consultation not found" });
      }
      
      res.json(consultation);
    } catch (error) {
      console.error("Error updating consultation:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid consultation data", details: error.errors });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Delete consultation
  app.delete("/api/admin/consultations/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteConsultation(id);
      
      if (!deleted) {
        return res.status(404).json({ error: "Consultation not found" });
      }
      
      res.json({ message: "Consultation deleted successfully" });
    } catch (error) {
      console.error("Error deleting consultation:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Configure multer for file uploads
  const upload = multer({ storage: multer.memoryStorage() });

  // Image upload endpoint
  app.post("/api/upload/image", upload.single('image'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No image file provided" });
      }

      // Upload to Cloudinary
      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          {
            folder: 'campus-for-wisdom/avatars',
            transformation: [
              { width: 400, height: 400, crop: 'fill' },
              { quality: 'auto:good' }
            ],
            format: 'jpg'
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        ).end(req.file.buffer);
      });

      res.json({ url: (result as any).secure_url });
    } catch (error) {
      console.error("Error uploading image:", error);
      res.status(500).json({ error: "Failed to upload image" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}