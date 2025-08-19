import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { pool } from "./db";
import { z } from "zod";
import { insertCourseSchema, insertWebinarSchema, insertEnrollmentSchema, insertTestimonialSchema, insertPaymentSchema, insertExpertSchema, insertConsultationSchema, insertEbookSchema, insertWebinarAttendeeSchema, insertInstructorApplicationSchema } from "@shared/schema";
import { zohoAPI } from "./zoho-api";
import multer from "multer";
import cloudinary from "./cloudinary";
import { CashfreeService } from "./cashfree";

// PostgreSQL session store configuration
const PgSession = connectPgSimple(session);

// Multer configuration for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
});

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
  
  // Get all active courses with calculated ratings
  app.get("/api/courses", async (req, res) => {
    try {
      const courses = await storage.getCourses();
      const activeCourses = courses.filter(course => course.isActive);
      
      // Calculate dynamic ratings for each course
      const coursesWithRatings = await Promise.all(
        activeCourses.map(async (course) => {
          const averageRating = await storage.calculateCourseAverageRating(course.id);
          return {
            ...course,
            rating: averageRating.toFixed(2)
          };
        })
      );
      
      res.json(coursesWithRatings);
    } catch (error) {
      console.error("Error fetching courses:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get course by ID with calculated rating
  app.get("/api/courses/:id", async (req, res) => {
    try {
      const course = await storage.getCourse(req.params.id);
      if (!course || !course.isActive) {
        return res.status(404).json({ error: "Course not found" });
      }
      
      // Calculate dynamic rating for this course
      const averageRating = await storage.calculateCourseAverageRating(course.id);
      const courseWithRating = {
        ...course,
        rating: averageRating.toFixed(2)
      };
      
      res.json(courseWithRating);
    } catch (error) {
      console.error("Error fetching course:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Course enrollment endpoint (requires payment for paid courses)
  app.post("/api/enroll", async (req, res) => {
    try {
      const studentUser = (req.session as any)?.studentUser;
      if (!studentUser || studentUser.role !== 'student') {
        return res.status(401).json({ error: 'Student login required' });
      }

      const { courseId, paymentId } = req.body;
      if (!courseId) {
        return res.status(400).json({ error: "Course ID is required" });
      }

      // Check if course exists and is active
      const course = await storage.getCourse(courseId);
      if (!course || !course.isActive) {
        return res.status(404).json({ error: "Course not found" });
      }

      // Check if student is already enrolled
      const existingEnrollment = await storage.getEnrollmentByStudentAndCourse(studentUser.id, courseId);
      if (existingEnrollment) {
        return res.status(400).json({ error: "You are already enrolled in this course" });
      }

      // Check if course requires payment
      if (course.price && course.price > 0) {
        // Verify payment for paid courses
        if (!paymentId) {
          return res.status(400).json({ 
            error: "Payment required for this course",
            message: `This course costs ₹${course.price}. Please complete payment first.`,
            requiresPayment: true,
            amount: course.price
          });
        }

        // Verify payment exists and is completed
        const payment = await storage.getPayment(paymentId);
        if (!payment || payment.status !== 'completed' || payment.courseId) {
          return res.status(400).json({ 
            error: "Invalid or already used payment",
            message: "Please complete a valid payment for this course."
          });
        }

        // Verify payment amount matches course price
        if (parseFloat(payment.amount) !== course.price) {
          return res.status(400).json({ 
            error: "Payment amount mismatch",
            message: `Payment amount (₹${payment.amount}) does not match course price (₹${course.price})`
          });
        }

        // Update payment record to link with course
        await storage.updatePayment(paymentId, { courseId: courseId });
      }

      // Create enrollment
      const enrollment = await storage.createEnrollment({
        studentId: studentUser.id,
        courseId: courseId,
        enrolledAt: new Date(),
      });

      res.json({ 
        success: true, 
        enrollment,
        message: "Successfully enrolled in course" 
      });
    } catch (error) {
      console.error("Error enrolling in course:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get student's course enrollments
  app.get("/api/student/enrollments", async (req, res) => {
    try {
      const studentUser = (req.session as any)?.studentUser;
      if (!studentUser || studentUser.role !== 'student') {
        return res.status(401).json({ error: 'Student login required' });
      }

      const enrollments = await storage.getStudentEnrollments(studentUser.id);
      res.json(enrollments);
    } catch (error) {
      console.error("Error fetching student enrollments:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // ===== COURSE REVIEWS API =====

  // Get course reviews
  app.get("/api/courses/:id/reviews", async (req, res) => {
    try {
      const courseId = req.params.id;
      const course = await storage.getCourse(courseId);
      if (!course || !course.isActive) {
        return res.status(404).json({ error: "Course not found" });
      }
      
      const reviews = await storage.getCourseReviews(courseId);
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching course reviews:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get user's review for a course
  app.get("/api/courses/:id/my-review", requireAuth, async (req, res) => {
    try {
      const courseId = req.params.id;
      const studentUser = (req.session as any)?.studentUser;
      
      if (!studentUser) {
        return res.status(401).json({ error: "Student not authenticated" });
      }

      const review = await storage.getUserCourseReview(studentUser.id, courseId);
      if (!review) {
        return res.status(404).json({ error: "Review not found" });
      }
      
      res.json(review);
    } catch (error) {
      console.error("Error fetching user course review:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Create course review
  app.post("/api/courses/:id/reviews", requireAuth, async (req, res) => {
    try {
      const courseId = req.params.id;
      const studentUser = (req.session as any)?.studentUser;
      const { rating, feedback } = req.body;

      if (!studentUser) {
        return res.status(401).json({ error: "Student not authenticated" });
      }

      // Validate input
      if (!rating || !feedback || rating < 1 || rating > 5) {
        return res.status(400).json({ error: "Valid rating (1-5) and feedback are required" });
      }

      // Check if course exists
      const course = await storage.getCourse(courseId);
      if (!course || !course.isActive) {
        return res.status(404).json({ error: "Course not found" });
      }

      // Check if user already has a review for this course
      const existingReview = await storage.getUserCourseReview(studentUser.id, courseId);
      if (existingReview) {
        return res.status(400).json({ error: "You have already reviewed this course" });
      }

      const review = await storage.createCourseReview(courseId, studentUser.id, rating, feedback);
      res.status(201).json(review);
    } catch (error) {
      console.error("Error creating course review:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Update course review
  app.put("/api/courses/:courseId/reviews/:reviewId", requireAuth, async (req, res) => {
    try {
      const { courseId, reviewId } = req.params;
      const studentUser = (req.session as any)?.studentUser;
      const { rating, feedback } = req.body;

      if (!studentUser) {
        return res.status(401).json({ error: "Student not authenticated" });
      }

      // Validate input
      if (!rating || !feedback || rating < 1 || rating > 5) {
        return res.status(400).json({ error: "Valid rating (1-5) and feedback are required" });
      }

      const success = await storage.updateCourseReview(reviewId, studentUser.id, { rating, feedback });
      if (!success) {
        return res.status(404).json({ error: "Review not found or unauthorized" });
      }

      res.json({ success: true, message: "Review updated successfully" });
    } catch (error) {
      console.error("Error updating course review:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get live sessions with booking status
  app.get("/api/live-sessions", async (req, res) => {
    try {
      const sessions = await storage.getLiveSessions();
      const studentUser = (req.session as any)?.studentUser;
      
      // If user is logged in, add booking status to each session
      if (studentUser?.role === 'student') {
        const sessionsWithBookingStatus = await Promise.all(
          sessions.map(async (session) => {
            const attendee = await storage.getWebinarAttendee(session.id, studentUser.id);
            return {
              ...session,
              isBooked: !!attendee,
              registrationLink: attendee ? session.registrationLink : undefined
            };
          })
        );
        res.json(sessionsWithBookingStatus);
      } else {
        res.json(sessions);
      }
    } catch (error) {
      console.error("Error fetching live sessions:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get individual session details
  app.get("/api/live-sessions/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const session = await storage.getLiveSessionById(id);
      
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }

      // Check if session is booked by current student (if authenticated)
      const studentUser = (req.session as any)?.studentUser;
      let isBooked = false;
      let registrationLink = null;

      if (studentUser?.role === 'student') {
        const attendee = await storage.getWebinarAttendee(session.id, studentUser.id);
        isBooked = !!attendee;
        registrationLink = attendee ? session.registrationLink : undefined;
      }

      const sessionWithBookingInfo = {
        ...session,
        isBooked,
        registrationLink
      };

      res.json(sessionWithBookingInfo);
    } catch (error) {
      console.error("Error fetching session:", error);
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

  // Contact form submission
  app.post("/api/contact", async (req, res) => {
    try {
      const { name, email, phone, subject, message, inquiryType } = req.body;
      
      if (!name || !email || !subject || !message || !inquiryType) {
        return res.status(400).json({ error: "Name, email, subject, message, and inquiry type are required" });
      }

      // Save to database
      const contactSubmission = await storage.createContactSubmission({
        name,
        email,
        phone,
        subject,
        message,
        inquiryType
      });

      console.log("Contact form submission saved:", contactSubmission);
      res.json({ message: "Contact form submitted successfully", id: contactSubmission.id });
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

  app.put("/api/admin/courses/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const courseData = insertCourseSchema.partial().parse(req.body);
      const course = await storage.updateCourse(id, courseData);
      
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

  app.delete("/api/admin/courses/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteCourse(id);
      
      if (!deleted) {
        return res.status(404).json({ error: "Course not found" });
      }
      
      res.json({ message: "Course deleted successfully" });
    } catch (error) {
      console.error("Error deleting course:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Student Management (simplified)
  app.get("/api/admin/students", requireAdmin, async (req, res) => {
    try {
      const students = await storage.getAllStudentsWithStats();
      res.json(students);
    } catch (error) {
      console.error("Error fetching students:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get individual student detail with comprehensive data
  app.get("/api/admin/students/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const studentDetail = await storage.getStudentDetailById(id);
      
      if (!studentDetail) {
        return res.status(404).json({ error: "Student not found" });
      }
      
      res.json(studentDetail);
    } catch (error) {
      console.error("Error fetching student detail:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Manual student registration by admin
  app.post("/api/admin/students/register", requireAdmin, async (req, res) => {
    try {
      const userData = req.body;
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ error: "User with this email already exists" });
      }

      const existingUsername = await storage.getUserByUsername(userData.username);
      if (existingUsername) {
        return res.status(400).json({ error: "Username already taken" });
      }

      // Set role as student by default
      const newUserData = {
        ...userData,
        role: "student" as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const newUser = await storage.createUser(newUserData);
      
      res.json({ 
        message: "Student registered successfully",
        user: {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          role: newUser.role,
        }
      });
    } catch (error) {
      console.error("Manual registration error:", error);
      res.status(500).json({ error: "Registration failed" });
    }
  });

  // Student stats for admin dashboard
  app.get("/api/admin/student-stats", requireAdmin, async (req, res) => {
    try {
      const students = await storage.getAllStudentsWithStats();
      const activeStudents = students.filter(s => s.enrollmentCount > 0).length;
      const totalProgress = students.reduce((sum, s) => sum + s.totalProgress, 0);
      const avgProgress = students.length > 0 ? Math.round(totalProgress / students.length) : 0;
      const completedCount = students.reduce((sum, s) => sum + s.completedCourses, 0);
      const totalEnrollments = students.reduce((sum, s) => sum + s.enrollmentCount, 0);
      const completionRate = totalEnrollments > 0 ? Math.round((completedCount / totalEnrollments) * 100) : 0;

      res.json({
        totalStudents: students.length,
        activeStudents,
        completionRate,
        avgProgress,
      });
    } catch (error) {
      console.error("Error fetching student stats:", error);
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

  // Get webinar attendees for admin
  app.get("/api/admin/webinars/:id/attendees", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const attendees = await storage.getWebinarAttendees(id);
      res.json(attendees);
    } catch (error) {
      console.error("Error fetching webinar attendees:", error);
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
            maxParticipants: sessionData.maxParticipants || 100, // Set default max participants
            currentParticipants: 0, // Initialize current participants
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

  // Update webinar
  app.put("/api/admin/live-sessions/:id", requireAdmin, async (req, res) => {
    try {
      const sessionData = insertWebinarSchema.parse(req.body);
      const sessionId = req.params.id;
      
      console.log('📝 Updating webinar with data:', {
        id: sessionId,
        title: sessionData.title,
        scheduledAt: sessionData.scheduledAt,
        duration: sessionData.duration
      });
      
      // Update session in database
      const updatedSession = await storage.updateLiveSession(sessionId, sessionData);
      
      if (!updatedSession) {
        return res.status(404).json({ error: "Session not found" });
      }
      
      console.log('✅ Webinar updated successfully');
      res.json(updatedSession);
    } catch (error) {
      console.error("Error updating webinar:", error);
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

  // Start webinar session
  app.post("/api/admin/live-sessions/:id/start", requireAdmin, async (req, res) => {
    try {
      const sessionId = req.params.id;
      
      console.log('▶️ Starting webinar session:', sessionId);
      
      const updatedSession = await storage.startLiveSession(sessionId);
      
      if (!updatedSession) {
        return res.status(404).json({ error: "Session not found" });
      }
      
      console.log('✅ Webinar session started successfully');
      res.json({ 
        success: true, 
        message: "Session started successfully",
        session: updatedSession 
      });
    } catch (error) {
      console.error("Error starting webinar session:", error);
      res.status(500).json({ 
        error: "Internal server error",
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    }
  });

  // End webinar session
  app.post("/api/admin/live-sessions/:id/end", requireAdmin, async (req, res) => {
    try {
      const sessionId = req.params.id;
      
      console.log('⏹️ Ending webinar session:', sessionId);
      
      const updatedSession = await storage.endLiveSession(sessionId);
      
      if (!updatedSession) {
        return res.status(404).json({ error: "Session not found" });
      }
      
      console.log('✅ Webinar session ended successfully');
      res.json({ 
        success: true, 
        message: "Session ended successfully",
        session: updatedSession 
      });
    } catch (error) {
      console.error("Error ending webinar session:", error);
      res.status(500).json({ 
        error: "Internal server error",
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    }
  });

  // Delete webinar
  app.delete("/api/admin/live-sessions/:id", requireAdmin, async (req, res) => {
    try {
      const sessionId = req.params.id;
      
      console.log('🗑️ Deleting webinar:', sessionId);
      
      // Delete session from database
      const isDeleted = await storage.deleteLiveSession(sessionId);
      
      if (!isDeleted) {
        return res.status(404).json({ error: "Session not found" });
      }
      
      console.log('✅ Webinar deleted successfully');
      res.json({ success: true, message: "Webinar deleted successfully" });
    } catch (error) {
      console.error("Error deleting webinar:", error);
      res.status(500).json({ 
        error: "Internal server error",
        message: error instanceof Error ? error.message : 'Unknown error occurred'
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

  // Get featured experts
  app.get("/api/featured/experts", async (req, res) => {
    try {
      const featuredExperts = await storage.getFeaturedExperts();
      res.json(featuredExperts);
    } catch (error) {
      console.error("Error fetching featured experts:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get expert by ID
  app.get("/api/experts/:id", async (req, res) => {
    try {
      const expert = await storage.getExpert(req.params.id);
      if (!expert || !expert.isActive) {
        return res.status(404).json({ error: "Expert not found" });
      }
      res.json(expert);
    } catch (error) {
      console.error("Error fetching expert:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get expert's live sessions
  app.get("/api/experts/:id/sessions", async (req, res) => {
    try {
      const expertId = req.params.id;
      const expert = await storage.getExpert(expertId);
      if (!expert || !expert.isActive) {
        return res.status(404).json({ error: "Expert not found" });
      }
      
      // Get all live sessions and filter by expert
      const allSessions = await storage.getLiveSessions();
      const expertSessions = allSessions.filter(session => 
        session.instructorId === expertId && session.isActive
      );
      
      res.json(expertSessions);
    } catch (error) {
      console.error("Error fetching expert sessions:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get expert reviews (both consultation-based and direct reviews)
  app.get("/api/experts/:id/reviews", async (req, res) => {
    try {
      const expertId = req.params.id;
      const expert = await storage.getExpert(expertId);
      if (!expert || !expert.isActive) {
        return res.status(404).json({ error: "Expert not found" });
      }
      
      // Get consultation-based reviews
      const consultationReviews = await storage.getExpertReviews(expertId);
      
      // Get direct reviews
      const directReviews = await storage.getDirectReviewsForExpert(expertId);
      
      // Combine both types of reviews and sort by creation date
      const allReviews = [
        ...consultationReviews,
        ...directReviews
      ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      res.json(allReviews);
    } catch (error) {
      console.error("Error fetching expert reviews:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Submit rating and feedback for consultation
  app.put("/api/consultations/:id/rating", async (req, res) => {
    try {
      const consultationId = req.params.id;
      const { rating, feedback } = req.body;
      const userId = (req.session as any)?.user?.id;

      if (!userId) {
        return res.status(401).json({ error: "Student authentication required" });
      }

      if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({ error: "Rating must be between 1 and 5" });
      }

      // Get consultation to verify ownership and status
      const consultation = await storage.getConsultation(consultationId);
      if (!consultation) {
        return res.status(404).json({ error: "Consultation not found" });
      }

      if (consultation.studentId !== userId) {
        return res.status(403).json({ error: "Access denied" });
      }

      if (consultation.status !== "completed") {
        return res.status(400).json({ error: "Can only rate completed consultations" });
      }

      if (consultation.rating) {
        return res.status(400).json({ error: "Consultation already rated" });
      }

      // Update consultation with rating and feedback
      await storage.updateConsultation(consultationId, {
        rating: parseInt(rating),
        feedback: feedback || null
      });

      res.json({ success: true, message: "Rating submitted successfully" });
    } catch (error) {
      console.error("Error submitting rating:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Submit direct review for expert
  app.post("/api/experts/:id/reviews", async (req, res) => {
    try {
      const expertId = req.params.id;
      const { rating, feedback } = req.body;
      const userId = (req.session as any)?.user?.id;

      if (!userId) {
        return res.status(401).json({ error: "Student authentication required" });
      }

      if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({ error: "Rating must be between 1 and 5" });
      }

      if (!feedback || !feedback.trim()) {
        return res.status(400).json({ error: "Review feedback is required" });
      }

      // Check if expert exists
      const expert = await storage.getExpert(expertId);
      if (!expert || !expert.isActive) {
        return res.status(404).json({ error: "Expert not found" });
      }

      // Check if user already has a direct review for this expert
      const existingReview = await storage.getUserReviewForExpert(userId, expertId);
      if (existingReview) {
        return res.status(400).json({ error: "You have already reviewed this expert" });
      }

      // Create new direct review
      await storage.createDirectReview({
        expertId,
        studentId: userId,
        rating: parseInt(rating),
        feedback: feedback.trim()
      });

      res.json({ success: true, message: "Review submitted successfully" });
    } catch (error) {
      console.error("Error submitting review:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Update direct review for expert
  app.put("/api/experts/:expertId/reviews/:reviewId", async (req, res) => {
    try {
      const { expertId, reviewId } = req.params;
      const { rating, feedback } = req.body;
      const userId = (req.session as any)?.user?.id;

      if (!userId) {
        return res.status(401).json({ error: "Student authentication required" });
      }

      if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({ error: "Rating must be between 1 and 5" });
      }

      if (!feedback || !feedback.trim()) {
        return res.status(400).json({ error: "Review feedback is required" });
      }

      // Update review
      const success = await storage.updateDirectReview(reviewId, userId, {
        rating: parseInt(rating),
        feedback: feedback.trim()
      });

      if (!success) {
        return res.status(404).json({ error: "Review not found or access denied" });
      }

      res.json({ success: true, message: "Review updated successfully" });
    } catch (error) {
      console.error("Error updating review:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // ===== EBOOKS API =====

  // Get all ebooks
  app.get("/api/ebooks", async (req, res) => {
    try {
      const ebooks = await storage.getEbooks();
      res.json(ebooks);
    } catch (error) {
      console.error("Error fetching ebooks:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get ebook by ID
  app.get("/api/ebooks/:id", async (req, res) => {
    try {
      const ebook = await storage.getEbook(req.params.id);
      if (!ebook || !ebook.isActive) {
        return res.status(404).json({ error: "Ebook not found" });
      }
      res.json(ebook);
    } catch (error) {
      console.error("Error fetching ebook:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get ebooks by author (expert)
  app.get("/api/experts/:id/ebooks", async (req, res) => {
    try {
      const expertId = req.params.id;
      const expert = await storage.getExpert(expertId);
      if (!expert || !expert.isActive) {
        return res.status(404).json({ error: "Expert not found" });
      }
      
      const ebooks = await storage.getEbooksByAuthor(expertId);
      res.json(ebooks);
    } catch (error) {
      console.error("Error fetching expert ebooks:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Admin: Get all ebooks for management
  app.get("/api/admin/ebooks", async (req, res) => {
    try {
      const adminUser = (req.session as any)?.adminUser;
      if (!adminUser || adminUser.role !== 'admin') {
        return res.status(401).json({ error: 'Admin access required' });
      }

      const ebooks = await storage.getEbooks();
      res.json(ebooks);
    } catch (error) {
      console.error("Error fetching admin ebooks:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Admin: Create new ebook
  app.post("/api/admin/ebooks", async (req, res) => {
    try {
      const adminUser = (req.session as any)?.adminUser;
      if (!adminUser || adminUser.role !== 'admin') {
        return res.status(401).json({ error: 'Admin access required' });
      }

      console.log("Creating ebook with data:", req.body);
      const ebookData = insertEbookSchema.parse(req.body);
      console.log("Parsed ebook data:", ebookData);
      const ebook = await storage.createEbook(ebookData);
      res.json(ebook);
    } catch (error) {
      console.error("Error creating ebook:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation error", details: error.errors });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Admin: Update ebook
  app.put("/api/admin/ebooks/:id", async (req, res) => {
    try {
      const adminUser = (req.session as any)?.adminUser;
      if (!adminUser || adminUser.role !== 'admin') {
        return res.status(401).json({ error: 'Admin access required' });
      }

      console.log("Updating ebook with data:", req.body);
      const ebookData = insertEbookSchema.partial().parse(req.body);
      console.log("Parsed ebook data:", ebookData);
      const ebook = await storage.updateEbook(req.params.id, ebookData);
      
      if (!ebook) {
        return res.status(404).json({ error: "Ebook not found" });
      }
      
      res.json(ebook);
    } catch (error) {
      console.error("Error updating ebook:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation error", details: error.errors });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Admin: Delete ebook
  app.delete("/api/admin/ebooks/:id", async (req, res) => {
    try {
      const adminUser = (req.session as any)?.adminUser;
      if (!adminUser || adminUser.role !== 'admin') {
        return res.status(401).json({ error: 'Admin access required' });
      }

      const success = await storage.deleteEbook(req.params.id);
      
      if (!success) {
        return res.status(404).json({ error: "Ebook not found" });
      }
      
      res.json({ message: "Ebook deleted successfully" });
    } catch (error) {
      console.error("Error deleting ebook:", error);
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

  // Book consultation (requires payment)
  app.post("/api/student/consultations", async (req, res) => {
    try {
      const studentUser = (req.session as any)?.studentUser;
      if (!studentUser || studentUser.role !== 'student') {
        return res.status(401).json({ error: 'Student access required' });
      }

      const { expertId, scheduledAt, duration = 60, paymentId } = req.body;

      // Get expert details to check pricing
      const expert = await storage.getExpert(expertId);
      if (!expert) {
        return res.status(404).json({ error: "Expert not found" });
      }

      // Check if expert offers paid consultations
      if (expert.consultationPrice && expert.consultationPrice > 0) {
        // Verify payment for paid consultations
        if (!paymentId) {
          return res.status(400).json({ 
            error: "Payment required for consultation",
            message: `This consultation costs ₹${expert.consultationPrice}. Please complete payment first.`,
            requiresPayment: true,
            amount: expert.consultationPrice
          });
        }

        // Verify payment exists and is completed
        const payment = await storage.getPayment(paymentId);
        if (!payment || payment.status !== 'completed' || payment.consultationId) {
          return res.status(400).json({ 
            error: "Invalid or already used payment",
            message: "Please complete a valid payment for this consultation."
          });
        }

        // Verify payment amount matches consultation price
        if (parseFloat(payment.amount) !== expert.consultationPrice) {
          return res.status(400).json({ 
            error: "Payment amount mismatch",
            message: `Payment amount (₹${payment.amount}) does not match consultation price (₹${expert.consultationPrice})`
          });
        }
      }

      const consultationData = insertConsultationSchema.parse({
        ...req.body,
        studentId: studentUser.id
      });

      const consultation = await storage.createConsultation(consultationData);

      // Update payment record to link with consultation
      if (paymentId) {
        await storage.updatePayment(paymentId, { consultationId: consultation.id });
      }

      res.json(consultation);
    } catch (error) {
      console.error("Error booking consultation:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid consultation data", details: error.errors });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get student downloaded ebooks
  app.get("/api/student/ebooks", async (req, res) => {
    try {
      const studentUser = (req.session as any)?.studentUser;
      if (!studentUser || studentUser.role !== 'student') {
        return res.status(401).json({ error: 'Student access required' });
      }

      const downloads = await storage.getUserEbookDownloads(studentUser.id);
      const ebookIds = downloads.map(d => d.ebookId);
      
      // Get ebook details for downloaded ebooks
      const allEbooks = await storage.getEbooks();
      const downloadedEbooks = allEbooks.filter(ebook => ebookIds.includes(ebook.id));
      
      res.json(downloadedEbooks);
    } catch (error) {
      console.error("Error fetching student ebooks:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Book live session seat (requires payment for paid sessions)
  app.post("/api/student/live-sessions/:sessionId/book", async (req, res) => {
    try {
      const studentUser = (req.session as any)?.studentUser;
      if (!studentUser || studentUser.role !== 'student') {
        return res.status(401).json({ error: 'Student access required' });
      }

      const { sessionId } = req.params;
      const { paymentId } = req.body;
      
      // Get session details
      const session = await storage.getLiveSession(sessionId);
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }

      // Check if session is bookable
      if (session.status !== 'scheduled') {
        return res.status(400).json({ error: "Session is not available for booking" });
      }

      // Check if session requires payment
      if (session.price && session.price > 0) {
        // Verify payment for paid sessions
        if (!paymentId) {
          return res.status(400).json({ 
            error: "Payment required for this session",
            message: `This session costs ₹${session.price}. Please complete payment first.`,
            requiresPayment: true,
            amount: session.price
          });
        }

        // Verify payment exists and is completed
        const payment = await storage.getPayment(paymentId);
        if (!payment || payment.status !== 'completed' || payment.webinarId !== sessionId) {
          return res.status(400).json({ 
            error: "Invalid or already used payment",
            message: "Please complete a valid payment for this session."
          });
        }

        // Verify payment amount matches session price
        if (parseFloat(payment.amount) !== session.price) {
          return res.status(400).json({ 
            error: "Payment amount mismatch",
            message: `Payment amount (₹${payment.amount}) does not match session price (₹${session.price})`
          });
        }
      }

      // Check if seats are available - add debug logging
      console.log(`📊 Session capacity check:`, {
        sessionId,
        currentParticipants: session.currentParticipants,
        maxParticipants: session.maxParticipants,
        available: (session.maxParticipants || 100) - (session.currentParticipants || 0)
      });
      
      // Handle null maxParticipants by setting default value
      const maxParticipants = session.maxParticipants || 100;
      const currentParticipants = session.currentParticipants || 0;
      
      if (currentParticipants >= maxParticipants) {
        return res.status(400).json({ 
          error: "Session is full",
          details: {
            current: currentParticipants,
            max: maxParticipants
          }
        });
      }

      // Check if student already booked this session
      const existingAttendee = await storage.getWebinarAttendee(sessionId, studentUser.id);
      if (existingAttendee) {
        return res.status(400).json({ error: "You have already booked this session" });
      }

      // Create webinar attendee record
      const attendeeData = insertWebinarAttendeeSchema.parse({
        webinarId: sessionId,
        participantId: studentUser.id,
        participantEmail: studentUser.email,
        participantName: studentUser.name || `${studentUser.firstName || ''} ${studentUser.lastName || ''}`.trim()
      });

      const attendee = await storage.createWebinarAttendee(attendeeData);

      // Update participant count
      await storage.updateWebinarParticipantCount(sessionId, currentParticipants + 1);

      // Update payment record to link with session
      if (paymentId) {
        await storage.updatePayment(paymentId, { webinarId: sessionId });
      }

      // Get expert details for Zoho webinar integration
      const expert = session.expertId ? await storage.getExpert(session.expertId) : null;
      const student = await storage.getUser(studentUser.id);

      let joinUrl = session.meetingUrl;

      // Create/Update Zoho webinar if not exists and zohoAPI is available
      if (zohoAPI && !session.webinarId && expert && student) {
        try {
          console.log(`🚀 Creating Zoho webinar for session: ${session.title}`);
          
          const webinarResponse = await zohoAPI.createWebinar({
            title: session.title,
            description: session.description,
            scheduledAt: session.scheduledAt,
            duration: session.duration,
            timezone: expert.timezone || 'Asia/Kolkata',
            participants: [student.email]
          });
          
          if (webinarResponse) {
            joinUrl = webinarResponse.join_url || webinarResponse.registration_url;
            
            // Update session with Zoho details
            await storage.updateLiveSession(sessionId, {
              webinarId: webinarResponse.webinar_key || webinarResponse.id,
              meetingUrl: joinUrl,
              registrationLink: webinarResponse.registration_url,
              startLink: webinarResponse.start_url
            });
            
            console.log(`✅ Zoho webinar created for session ${sessionId}`);
            console.log(`🔗 Join URL: ${joinUrl}`);
          }
        } catch (webinarError) {
          console.error('❌ Error creating Zoho webinar:', webinarError);
          // Continue with booking even if webinar creation fails
        }
      } else if (zohoAPI && session.webinarId && session.registrationLink && student) {
        // Zoho API doesn't support adding participants to existing webinars
        // Participants are only added during webinar creation
        // Student will use the registration link to join
        console.log(`ℹ️ Student will use registration link for webinar ${session.webinarId}`);
        console.log(`🔗 Registration URL: ${session.registrationLink}`);
      }

      res.json({ 
        message: "Seat booked successfully",
        attendee,
        joinUrl,
        session: {
          ...session,
          currentParticipants: currentParticipants + 1
        }
      });
    } catch (error) {
      console.error("Error booking session:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid booking data", details: error.errors });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get student's booked live sessions with booking details
  app.get("/api/student/live-sessions", async (req, res) => {
    try {
      const studentUser = (req.session as any)?.studentUser;
      if (!studentUser || studentUser.role !== 'student') {
        return res.status(401).json({ error: 'Student access required' });
      }

      const bookedSessions = await storage.getStudentWebinars(studentUser.id);
      res.json(bookedSessions);
    } catch (error) {
      console.error("Error fetching student sessions:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Record ebook download (requires payment for paid ebooks)
  app.post("/api/student/ebooks/:ebookId/download", async (req, res) => {
    try {
      const studentUser = (req.session as any)?.studentUser;
      if (!studentUser || studentUser.role !== 'student') {
        return res.status(401).json({ error: 'Student access required' });
      }

      const { ebookId } = req.params;
      const { paymentId } = req.body;
      
      // Verify ebook exists
      const ebook = await storage.getEbook(ebookId);
      if (!ebook || !ebook.isActive) {
        return res.status(404).json({ error: "Ebook not found" });
      }

      // Check if ebook requires payment
      if (ebook.price && ebook.price > 0) {
        // Verify payment for paid ebooks
        if (!paymentId) {
          return res.status(400).json({ 
            error: "Payment required for this ebook",
            message: `This ebook costs ₹${ebook.price}. Please complete payment first.`,
            requiresPayment: true,
            amount: ebook.price
          });
        }

        // Verify payment exists and is completed
        const payment = await storage.getPayment(paymentId);
        if (!payment || payment.status !== 'completed' || payment.ebookId) {
          return res.status(400).json({ 
            error: "Invalid or already used payment",
            message: "Please complete a valid payment for this ebook."
          });
        }

        // Verify payment amount matches ebook price
        if (parseFloat(payment.amount) !== ebook.price) {
          return res.status(400).json({ 
            error: "Payment amount mismatch",
            message: `Payment amount (₹${payment.amount}) does not match ebook price (₹${ebook.price})`
          });
        }

        // Update payment record to link with ebook
        await storage.updatePayment(paymentId, { ebookId: ebookId });
      }

      // Record the download
      const download = await storage.recordEbookDownload(studentUser.id, ebookId);
      
      res.json({ 
        success: true, 
        download, 
        message: "Download recorded successfully" 
      });
    } catch (error) {
      console.error("Error recording ebook download:", error);
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
      console.log('🔄 Updating expert with data:', {
        id,
        availableSlots: req.body.availableSlots,
        consultationEnabled: req.body.consultationEnabled
      });
      const expertData = insertExpertSchema.parse(req.body);
      console.log('✅ Parsed expert data:', {
        availableSlots: expertData.availableSlots,
        consultationEnabled: expertData.consultationEnabled
      });
      const expert = await storage.updateExpert(id, expertData);
      console.log('💾 Updated expert in database:', {
        id: expert?.id,
        availableSlots: expert?.availableSlots,
        consultationEnabled: expert?.consultationEnabled
      });
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

  // Get expert's booked slots for a specific date
  app.get('/api/experts/:expertId/booked-slots/:date', async (req, res) => {
    try {
      const { expertId, date } = req.params;
      const consultations = await storage.getAllConsultations();
      
      // Filter consultations for this expert on this date that are scheduled or confirmed
      const filteredConsultations = consultations
        .filter(consultation => {
          try {
            const consultationDate = new Date(consultation.scheduledAt).toISOString().split('T')[0];
            return consultation.expertId === expertId &&
              consultationDate === date &&
              (consultation.status === 'scheduled' || consultation.status === 'confirmed');
          } catch (error) {
            console.error('Error processing consultation:', consultation, error);
            return false;
          }
        });

      // Convert to time slots and remove duplicates
      const bookedSlotsSet = new Set();
      filteredConsultations.forEach(consultation => {
        // Parse the database timestamp (which is stored in UTC)
        const scheduledDate = new Date(consultation.scheduledAt);
        
        // Extract time (database stores in UTC, convert to IST)
        const hours = scheduledDate.getHours();
        const minutes = scheduledDate.getMinutes();
        
        // Convert to 12-hour format
        const hour12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const formattedTime = `${hour12}:${minutes.toString().padStart(2, '0')} ${ampm}`;
        bookedSlotsSet.add(formattedTime);
      });

      const bookedSlots = Array.from(bookedSlotsSet);
      res.json(bookedSlots);
    } catch (error) {
      console.error('Error fetching booked slots:', error);
      res.status(500).json({ error: 'Failed to fetch booked slots' });
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
        
        if (expert && student && zohoAPI) {
          console.log(`🚀 Creating Zoho meeting for consultation: ${consultation.title}`);
          
          // Create Zoho meeting (for 1-to-1 consultation)
          const meetingResponse = await zohoAPI.createMeeting({
            title: `AI Expert Consultation: ${consultation.title}`,
            description: `AI Expert consultation between ${expert.name} and ${student.firstName || student.username}. ${consultation.description || ''}`,
            scheduledAt: consultation.scheduledAt,
            duration: consultation.duration || 60,
            timezone: 'Asia/Calcutta',
            participants: [student.email].filter(Boolean)
          });
          
          // Update consultation with meeting URL
          const joinLink = meetingResponse.session.joinLink;
          const startLink = meetingResponse.session.startLink;
          
          await storage.updateConsultation(consultation.id, {
            meetingUrl: joinLink,
            startUrl: startLink
          });
          
          console.log(`✅ Meeting created successfully for consultation ${consultation.id}`);
          console.log(`🔗 Meeting join link (both parties): ${joinLink}`);
          console.log(`🎯 Expert start link: ${startLink}`);
          
          // Return consultation with meeting URL
          const updatedConsultation = await storage.getConsultation(consultation.id);
          res.json(updatedConsultation);
        } else {
          console.warn('⚠️ Could not find expert or student for webinar creation');
          res.json(consultation);
        }
      } catch (meetingError) {
        console.error('❌ Error creating Zoho meeting:', meetingError);
        console.log('📝 Consultation created without meeting link');
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
      const updates = req.body;
      
      // Get the current consultation to check if status is changing to 'confirmed'
      const currentConsultation = await storage.getConsultation(id);
      if (!currentConsultation) {
        return res.status(404).json({ error: "Consultation not found" });
      }

      // If approving the consultation (status changing to 'confirmed')
      if (updates.status === 'confirmed' && currentConsultation.status !== 'confirmed') {
        try {
          // Get expert and student details
          const expert = await storage.getExpert(currentConsultation.expertId);
          const student = await storage.getUser(currentConsultation.studentId);
          
          if (!expert || !student) {
            return res.status(400).json({ error: "Expert or student not found" });
          }

          // Schedule Zoho meeting using webinar API format
          const meetingData = {
            title: currentConsultation.title,
            description: currentConsultation.description || `Consultation with ${expert.name}`,
            scheduledAt: new Date(currentConsultation.scheduledAt),
            duration: currentConsultation.duration,
            timezone: expert.timezone || 'Asia/Kolkata',
            participants: [student.email]
          };

          console.log('Scheduling Zoho meeting with data:', meetingData);
          const meetingResponse = zohoAPI ? await zohoAPI.createMeeting(meetingData) : null;
          
          if (meetingResponse && (meetingResponse.join_url || meetingResponse.session?.joinLink)) {
            // Update consultation with meeting URL
            const joinUrl = meetingResponse.join_url || meetingResponse.session?.joinLink;
            updates.meetingUrl = joinUrl;
            console.log('✅ Zoho meeting created successfully:', joinUrl);
          } else {
            console.error('❌ Failed to create Zoho meeting:', meetingResponse);
            return res.status(500).json({ error: "Failed to schedule meeting" });
          }
        } catch (meetingError) {
          console.error('❌ Error creating Zoho meeting:', meetingError);
          return res.status(500).json({ error: "Failed to schedule meeting" });
        }
      }

      // Update the consultation
      const consultation = await storage.updateConsultation(id, updates);
      
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

  // Cloudinary upload endpoint for files
  app.post("/api/cloudinary/upload", upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file provided" });
      }

      const folder = req.body.folder || 'campus-for-wisdom/general';
      const fileType = req.file.mimetype;

      let uploadOptions: any = {
        folder: `campus-for-wisdom/${folder}`,
        resource_type: 'auto',
      };

      // Add specific options for different file types
      if (fileType.startsWith('image/')) {
        uploadOptions.transformation = [
          { quality: 'auto:good' }
        ];
      } else if (fileType === 'application/pdf') {
        uploadOptions.format = 'pdf';
        uploadOptions.resource_type = 'raw';
      }

      // Upload to Cloudinary
      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          uploadOptions,
          (error, result) => {
            if (error) {
              console.error("Cloudinary upload error:", error);
              reject(error);
            } else {
              resolve(result);
            }
          }
        ).end(req.file.buffer);
      });

      res.json({ 
        secure_url: (result as any).secure_url,
        public_id: (result as any).public_id,
        format: (result as any).format,
        resource_type: (result as any).resource_type,
        bytes: (result as any).bytes
      });
    } catch (error) {
      console.error("Error uploading file:", error);
      res.status(500).json({ error: "Failed to upload file" });
    }
  });

  // Legacy image upload endpoint (keeping for backward compatibility)
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

  // ===== PAYMENT ROUTES =====

  // Create payment session for courses
  app.post("/api/payments/create-session", requireAuth, async (req, res) => {
    try {
      const { amount, courseId, webinarId, consultationId, ebookId } = req.body;
      const user = (req.session as any)?.user;

      if (!user?.id) {
        return res.status(401).json({ error: "Authentication required" });
      }

      if (!amount || amount <= 0) {
        return res.status(400).json({ error: "Invalid amount" });
      }

      // Generate unique order ID
      const orderId = `CFW_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Prepare payment session request
      const sessionRequest = {
        orderId,
        amount: parseFloat(amount),
        currency: "INR",
        customerDetails: {
          customerId: user.id,
          customerName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username,
          customerEmail: user.email,
          customerPhone: user.phone || "9999999999"
        }
      };

      try {
        // Create payment session with Cashfree
        const session = await CashfreeService.createPaymentSession(sessionRequest);

        // Create payment record in database
        const paymentData = {
          id: `payment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          userId: user.id,
          amount: amount.toString(),
          currency: "INR",
          status: "pending",
          orderId,
          paymentSessionId: session.paymentSessionId,
          paymentGateway: "cashfree",
          // Only include valid foreign keys that exist in database
          courseId: null,
          webinarId: null,
          consultationId: null,
          ebookId: null
        };

        await storage.createPayment(paymentData);

        res.json({
          orderId,
          paymentSessionId: session.paymentSessionId,
          amount,
          currency: "INR"
        });
      } catch (cashfreeError: any) {
        console.error("Cashfree API error:", cashfreeError);
        throw cashfreeError;
      }

    } catch (error) {
      console.error("Error creating payment session:", error);
      res.status(500).json({ error: "Failed to create payment session" });
    }
  });

  // Verify payment status
  app.get("/api/payments/verify/:orderId", requireAuth, async (req, res) => {
    try {
      const { orderId } = req.params;
      const user = (req.session as any)?.user;

      if (!user?.id) {
        return res.status(401).json({ error: "Authentication required" });
      }

      // Get payment from database
      const payment = await storage.getPaymentByOrderId(orderId);
      if (!payment) {
        return res.status(404).json({ error: "Payment not found" });
      }

      if (payment.userId !== user.id) {
        return res.status(403).json({ error: "Access denied" });
      }

      // Verify with Cashfree
      const paymentDetails = await CashfreeService.verifyPayment(orderId);

      if (paymentDetails && paymentDetails.length > 0) {
        const latestPayment = paymentDetails[0];
        
        // Update payment status in database
        await storage.updatePaymentStatus(
          orderId,
          latestPayment.payment_status.toLowerCase(),
          latestPayment.cf_payment_id,
          latestPayment
        );

        // If payment successful, handle enrollment/access
        if (latestPayment.payment_status === 'SUCCESS') {
          try {
            if (payment.courseId) {
              // Enroll user in course
              await storage.enrollStudentInCourse(user.id, payment.courseId);
            } else if (payment.webinarId) {
              // Add user to webinar
              await storage.addWebinarAttendee({
                webinarId: payment.webinarId,
                participantId: user.id,
                name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username,
                email: user.email
              });
            } else if (payment.consultationId) {
              // Update consultation status to confirmed
              await storage.updateConsultation(payment.consultationId, { status: 'confirmed' });
            }
          } catch (enrollmentError) {
            console.error("Error handling post-payment enrollment:", enrollmentError);
          }
        }
      }

      res.json({ 
        status: payment.status,
        orderId,
        paymentDetails
      });

    } catch (error) {
      console.error("Error verifying payment:", error);
      res.status(500).json({ error: "Failed to verify payment" });
    }
  });

  // Cashfree webhook for payment notifications
  app.post("/api/payments/webhook", express.raw({ type: 'application/json' }), async (req, res) => {
    try {
      const signature = req.headers['x-webhook-signature'] as string;
      const rawBody = req.body.toString();

      console.log('Webhook received:', {
        hasSignature: !!signature,
        bodyLength: rawBody.length,
        sourceType: req.headers['source-type']
      });

      // Handle test webhooks from Cashfree dashboard
      if (req.headers['source-type'] === 'MERCHANT_DASHBOARD') {
        console.log('Test webhook from Cashfree dashboard - accepting');
        return res.status(200).json({ message: "Test webhook received successfully" });
      }

      // Verify webhook signature for real webhooks
      if (!signature) {
        console.log('No signature provided');
        return res.status(400).json({ error: "Missing webhook signature" });
      }

      if (!CashfreeService.verifyWebhookSignature(rawBody, signature)) {
        console.log('Signature verification failed');
        return res.status(400).json({ error: "Invalid webhook signature" });
      }

      const webhookData = JSON.parse(rawBody);
      console.log('Webhook type:', webhookData.type);
      
      if (webhookData.type === 'PAYMENT_SUCCESS_WEBHOOK') {
        const { orderId, paymentStatus, cfPaymentId } = webhookData.data;
        console.log('Payment success webhook:', { orderId, paymentStatus });

        // Update payment status
        await storage.updatePaymentStatus(orderId, paymentStatus.toLowerCase(), cfPaymentId, webhookData.data);

        // Handle post-payment actions
        const payment = await storage.getPaymentByOrderId(orderId);
        if (payment && paymentStatus === 'SUCCESS') {
          try {
            if (payment.courseId) {
              await storage.enrollStudentInCourse(payment.userId, payment.courseId);
            } else if (payment.webinarId) {
              const user = await storage.getUser(payment.userId);
              if (user) {
                await storage.addWebinarAttendee({
                  webinarId: payment.webinarId,
                  participantId: payment.userId,
                  name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username,
                  email: user.email
                });
              }
            } else if (payment.consultationId) {
              await storage.updateConsultation(payment.consultationId, { status: 'confirmed' });
            }
          } catch (enrollmentError) {
            console.error("Error handling webhook post-payment actions:", enrollmentError);
          }
        }
      } else if (webhookData.type === 'PAYMENT_FAILED_WEBHOOK') {
        const { orderId, paymentStatus, cfPaymentId } = webhookData.data;
        console.log('Payment failed webhook:', { orderId, paymentStatus });
        
        // Update payment status to failed
        await storage.updatePaymentStatus(orderId, 'failed', cfPaymentId, webhookData.data);
      } else if (webhookData.type === 'PAYMENT_USER_DROPPED_WEBHOOK') {
        const { orderId } = webhookData.data;
        console.log('Payment user dropped webhook:', { orderId });
        
        // Update payment status to cancelled
        await storage.updatePaymentStatus(orderId, 'cancelled', undefined, webhookData.data);
      } else {
        console.log('Unhandled webhook type:', webhookData.type);
      }

      res.status(200).json({ message: "Webhook processed" });

    } catch (error) {
      console.error("Error processing webhook:", error);
      res.status(500).json({ error: "Webhook processing failed" });
    }
  });

  // Get payment history for user
  app.get("/api/payments/history", requireAuth, async (req, res) => {
    try {
      const user = (req.session as any)?.user;

      if (!user?.id) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const payments = await storage.getPaymentsWithDetails();
      const userPayments = payments.filter(p => p.userId === user.id);

      res.json(userPayments);

    } catch (error) {
      console.error("Error fetching payment history:", error);
      res.status(500).json({ error: "Failed to fetch payment history" });
    }
  });

  // Admin payment routes
  app.get("/api/admin/payments", requireAdmin, async (req, res) => {
    try {
      const payments = await storage.getPaymentsWithDetails();
      res.json(payments);
    } catch (error) {
      console.error("Error fetching payments:", error);
      res.status(500).json({ error: "Failed to fetch payments" });
    }
  });

  app.get("/api/admin/payment-stats", requireAdmin, async (req, res) => {
    try {
      const { timeRange = '30d' } = req.query;
      const stats = await storage.getPaymentStats(timeRange as string);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching payment stats:", error);
      res.status(500).json({ error: "Failed to fetch payment stats" });
    }
  });

  app.post("/api/admin/payments/:id/refund", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const payment = await storage.processRefund(id);
      
      if (!payment) {
        return res.status(404).json({ error: "Payment not found" });
      }
      
      res.json({ message: "Refund processed successfully", payment });
    } catch (error) {
      console.error("Error processing refund:", error);
      res.status(500).json({ error: "Failed to process refund" });
    }
  });

  // Submit or update direct review for expert
  app.post("/api/experts/:id/direct-reviews", requireAuth, async (req, res) => {
    try {
      const expertId = req.params.id;
      const { rating, feedback } = req.body;
      const userId = (req.session as any)?.user?.id;

      if (!userId) {
        return res.status(401).json({ error: "Student authentication required" });
      }

      if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({ error: "Rating must be between 1 and 5" });
      }

      if (!feedback || !feedback.trim()) {
        return res.status(400).json({ error: "Feedback is required" });
      }

      // Check if expert exists
      const expert = await storage.getExpert(expertId);
      if (!expert || !expert.isActive) {
        return res.status(404).json({ error: "Expert not found" });
      }

      // Check if user already has a review for this expert
      const existingReview = await storage.getUserReviewForExpert(userId, expertId);
      
      if (existingReview) {
        // Update existing review
        const success = await storage.updateDirectReview(existingReview.id, userId, {
          rating: parseInt(rating),
          feedback: feedback.trim()
        });
        
        if (success) {
          res.json({ success: true, message: "Review updated successfully" });
        } else {
          res.status(500).json({ error: "Failed to update review" });
        }
      } else {
        // Create new review
        const newReview = await storage.createDirectReview({
          expertId,
          studentId: userId,
          rating: parseInt(rating),
          feedback: feedback.trim()
        });
        
        res.json({ success: true, review: newReview });
      }
    } catch (error) {
      console.error("Error handling direct review:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  
  // Get user's review for a specific expert
  app.get("/api/experts/:id/my-review", requireAuth, async (req, res) => {
    try {
      const expertId = req.params.id;
      const userId = (req.session as any)?.user?.id;

      if (!userId) {
        return res.status(401).json({ error: "Student authentication required" });
      }

      const review = await storage.getUserReviewForExpert(userId, expertId);
      res.json(review);
    } catch (error) {
      console.error("Error fetching user review:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get user's transaction history
  app.get("/api/student/transactions", requireAuth, async (req, res) => {
    try {
      const userId = (req.session as any)?.user?.id;

      if (!userId) {
        return res.status(401).json({ error: "Student authentication required" });
      }

      const transactions = await storage.getUserTransactions(userId);
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching user transactions:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Legal Pages Routes
  // Get all legal pages (for admin)
  app.get("/api/admin/legal-pages", requireAdmin, async (req, res) => {
    try {
      const pages = await storage.getLegalPages();
      res.json(pages);
    } catch (error) {
      console.error("Error fetching legal pages:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get specific legal page by slug (public)
  app.get("/api/legal/:slug", async (req, res) => {
    try {
      const page = await storage.getLegalPageBySlug(req.params.slug);
      if (!page) {
        return res.status(404).json({ error: "Legal page not found" });
      }
      res.json(page);
    } catch (error) {
      console.error("Error fetching legal page:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Update legal page content (admin only)
  app.put("/api/admin/legal-pages/:id", requireAdmin, async (req, res) => {
    try {
      const { title, content } = req.body;
      const page = await storage.updateLegalPage(req.params.id, { title, content });
      if (!page) {
        return res.status(404).json({ error: "Legal page not found" });
      }
      res.json(page);
    } catch (error) {
      console.error("Error updating legal page:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // ===== INSTRUCTOR APPLICATION ROUTES =====

  // Submit instructor application (public)
  app.post("/api/instructor-applications", async (req, res) => {
    try {
      const applicationData = insertInstructorApplicationSchema.parse(req.body);
      const application = await storage.createInstructorApplication(applicationData);
      res.json(application);
    } catch (error) {
      console.error("Error creating instructor application:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid application data", details: error.errors });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get all instructor applications (admin only)
  app.get("/api/admin/instructor-applications", requireAdmin, async (req, res) => {
    try {
      const applications = await storage.getInstructorApplications();
      res.json(applications);
    } catch (error) {
      console.error("Error fetching instructor applications:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get specific instructor application (admin only)
  app.get("/api/admin/instructor-applications/:id", requireAdmin, async (req, res) => {
    try {
      const application = await storage.getInstructorApplication(req.params.id);
      if (!application) {
        return res.status(404).json({ error: "Application not found" });
      }
      res.json(application);
    } catch (error) {
      console.error("Error fetching instructor application:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Update instructor application status (admin only)
  app.put("/api/admin/instructor-applications/:id/status", requireAdmin, async (req, res) => {
    try {
      const { status, notes } = req.body;
      const adminUser = (req.session as any)?.adminUser;
      
      if (!["pending", "approved", "rejected"].includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
      }
      
      const application = await storage.updateInstructorApplicationStatus(
        req.params.id, 
        status, 
        adminUser?.id,
        notes
      );
      
      if (!application) {
        return res.status(404).json({ error: "Application not found" });
      }
      
      res.json(application);
    } catch (error) {
      console.error("Error updating instructor application status:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  return httpServer;
}