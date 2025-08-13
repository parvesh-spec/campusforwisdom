import { 
  type User, 
  type InsertUser, 
  type Course, 
  type InsertCourse, 
  type LiveSession, 
  type InsertLiveSession,
  type Enrollment,
  type InsertEnrollment,
  type Testimonial,
  type InsertTestimonial,
  type Payment,
  type InsertPayment
} from "@shared/schema";
import { randomUUID } from "crypto";

// Enhanced interfaces for admin functionality
interface StudentWithStats extends User {
  enrollmentCount: number;
  completedCourses: number;
  totalProgress: number;
}

interface EnrollmentWithDetails extends Enrollment {
  student: User;
  course: Course;
}

interface TestimonialWithStudent extends Testimonial {
  student: User;
}

interface PaymentWithDetails extends Payment {
  user: User;
  course?: Course;
}

interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  inquiryType: string;
  createdAt: Date;
}

interface Message {
  id: string;
  subject: string;
  content: string;
  sender: User;
  recipients: User[];
  sentAt: string;
  status: "sent" | "delivered" | "read";
  type: "email" | "announcement" | "notification";
}

interface Conversation {
  id: string;
  participants: User[];
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
  status: "active" | "closed";
}

interface ContentFile {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  courseId?: string;
  tags: string[];
  uploadedAt: string;
  downloads: number;
}

interface ContentFolder {
  id: string;
  name: string;
  description?: string;
  fileCount: number;
  createdAt: string;
}

interface Activity {
  id: string;
  type: string;
  description: string;
  timestamp: string;
}

export interface IStorage {
  // User management
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getUsers(): Promise<User[]>;
  getStudentsWithStats(): Promise<StudentWithStats[]>;

  // Course management
  getCourses(): Promise<Course[]>;
  getCourseById(id: string): Promise<Course | undefined>;
  createCourse(course: InsertCourse): Promise<Course>;
  updateCourse(id: string, course: InsertCourse): Promise<Course | null>;
  deleteCourse(id: string): Promise<boolean>;
  getPopularCourses(): Promise<Array<{
    id: string;
    title: string;
    studentsCount: number;
    rating: number;
    category: string;
  }>>;

  // Live session management
  getLiveSessions(): Promise<LiveSession[]>;
  createLiveSession(session: InsertLiveSession): Promise<LiveSession>;
  updateLiveSession(id: string, session: InsertLiveSession): Promise<LiveSession | null>;
  deleteLiveSession(id: string): Promise<boolean>;
  startLiveSession(id: string): Promise<LiveSession | null>;
  endLiveSession(id: string): Promise<LiveSession | null>;

  // Enrollment management
  createEnrollment(enrollment: InsertEnrollment): Promise<Enrollment>;
  getEnrollmentsWithDetails(): Promise<EnrollmentWithDetails[]>;

  // Testimonial management
  getPublishedTestimonials(): Promise<TestimonialWithStudent[]>;
  createTestimonial(testimonial: InsertTestimonial): Promise<Testimonial>;

  // Payment management
  getPaymentsWithDetails(): Promise<PaymentWithDetails[]>;
  updatePaymentStatus(id: string, status: string): Promise<Payment | null>;
  processRefund(id: string): Promise<Payment | null>;
  getPaymentStats(timeRange: string): Promise<{
    totalRevenue: number;
    totalTransactions: number;
    pendingPayments: number;
    successRate: number;
    monthlyRevenue: number;
    monthlyGrowth: number;
    refundedAmount: number;
    averageOrderValue: number;
  }>;
  getRevenueTrends(timeRange: string): Promise<Array<{
    month: string;
    revenue: number;
    transactions: number;
  }>>;

  // Contact and communication
  createContactSubmission(contact: any): Promise<ContactSubmission>;
  getMessages(): Promise<Message[]>;
  getConversations(): Promise<Conversation[]>;
  sendMessage(messageData: any): Promise<Message>;

  // Content management
  getContentFiles(): Promise<ContentFile[]>;
  getContentFolders(): Promise<ContentFolder[]>;
  getContentStats(): Promise<{
    totalFiles: number;
    totalSize: number;
    totalDownloads: number;
    videoFiles: number;
    documentFiles: number;
    imageFiles: number;
  }>;
  deleteContentFile(id: string): Promise<boolean>;

  // Analytics
  getAnalyticsOverview(timeRange: string): Promise<{
    totalRevenue: number;
    totalStudents: number;
    totalEnrollments: number;
    completionRate: number;
    revenueGrowth: number;
    studentGrowth: number;
    enrollmentGrowth: number;
    completionGrowth: number;
  }>;
  getCourseAnalytics(timeRange: string): Promise<Array<{
    courseId: string;
    title: string;
    enrollments: number;
    completions: number;
    revenue: number;
    avgRating: number;
    completionRate: number;
  }>>;
  getStudentAnalytics(timeRange: string): Promise<{
    activeStudents: number;
    newStudents: number;
    churnRate: number;
    avgSessionDuration: number;
    topPerformers: Array<{
      id: string;
      name: string;
      completedCourses: number;
      totalProgress: number;
    }>;
  }>;
  getRevenueAnalytics(timeRange: string): Promise<{
    totalRevenue: number;
    monthlyRevenue: Array<{
      month: string;
      revenue: number;
      enrollments: number;
    }>;
    revenueByCategory: Array<{
      category: string;
      revenue: number;
      percentage: number;
    }>;
  }>;

  // Settings
  getSettings(category: string): Promise<any>;
  updateSettings(category: string, settings: any): Promise<any>;

  // Stats and activities
  getPublicStats(): Promise<{
    totalStudents: number;
    totalCourses: number;
    averageRating: number;
  }>;
  getAdminStats(): Promise<{
    totalStudents: number;
    activeCourses: number;
    totalRevenue: number;
    liveSessions: number;
    newStudentsThisMonth: number;
    revenueGrowth: number;
  }>;
  getStudentStats(): Promise<{
    totalStudents: number;
    activeStudents: number;
    completionRate: number;
    avgProgress: number;
  }>;
  getRecentActivities(): Promise<Activity[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private courses: Map<string, Course>;
  private liveSessions: Map<string, LiveSession>;
  private enrollments: Map<string, Enrollment>;
  private testimonials: Map<string, Testimonial>;
  private payments: Map<string, Payment>;
  private contactSubmissions: Map<string, ContactSubmission>;
  private messages: Map<string, Message>;
  private conversations: Map<string, Conversation>;
  private contentFiles: Map<string, ContentFile>;
  private contentFolders: Map<string, ContentFolder>;
  private settings: Map<string, any>;
  private activities: Activity[];

  constructor() {
    this.users = new Map();
    this.courses = new Map();
    this.liveSessions = new Map();
    this.enrollments = new Map();
    this.testimonials = new Map();
    this.payments = new Map();
    this.contactSubmissions = new Map();
    this.messages = new Map();
    this.conversations = new Map();
    this.contentFiles = new Map();
    this.contentFolders = new Map();
    this.settings = new Map();
    this.activities = [];

    // Initialize with some sample data
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Create admin user
    const adminUser: User = {
      id: randomUUID(),
      username: "admin",
      email: "admin@campusforwisdom.com",
      password: "admin123",
      role: "admin",
      firstName: "Admin",
      lastName: "User",
      avatar: null,
      createdAt: new Date(),
    };
    this.users.set(adminUser.id, adminUser);

    // Add some sample courses
    const sampleCourses: Course[] = [
      {
        id: randomUUID(),
        title: "AI Software Development",
        description: "Learn to build intelligent applications using AI APIs, machine learning models, and modern development frameworks. Master the art of creating software that can think, learn, and adapt.",
        shortDescription: "Build intelligent applications with AI APIs and ML models",
        level: "beginner",
        duration: "12 weeks",
        price: "15999",
        rating: "4.8",
        studentsCount: 340,
        thumbnail: null,
        category: "AI Software Development",
        isActive: true,
        instructorId: adminUser.id,
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        title: "AI Video Creation",
        description: "Master AI-powered video editing, generation, and optimization tools to create professional content effortlessly. Learn cutting-edge techniques for automated video production.",
        shortDescription: "Create professional videos using AI-powered tools",
        level: "intermediate",
        duration: "8 weeks",
        price: "12999",
        rating: "4.9",
        studentsCount: 285,
        thumbnail: null,
        category: "AI Video Creation",
        isActive: true,
        instructorId: adminUser.id,
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        title: "AI Presentation Design",
        description: "Create stunning presentations using AI design tools, automated layouts, and intelligent content generation. Transform your ideas into compelling visual stories.",
        shortDescription: "Design stunning presentations with AI automation",
        level: "beginner",
        duration: "6 weeks",
        price: "9999",
        rating: "4.7",
        studentsCount: 420,
        thumbnail: null,
        category: "AI Presentation Design",
        isActive: true,
        instructorId: adminUser.id,
        createdAt: new Date(),
      }
    ];

    sampleCourses.forEach(course => this.courses.set(course.id, course));

    // Add sample students
    const sampleStudents: User[] = [
      {
        id: randomUUID(),
        username: "rahul.k",
        email: "rahul.khurana@example.com",
        password: "password123",
        role: "student",
        firstName: "Rahul",
        lastName: "Khurana",
        avatar: null,
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        username: "priya.s",
        email: "priya.sharma@example.com",
        password: "password123",
        role: "student",
        firstName: "Priya",
        lastName: "Sharma",
        avatar: null,
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        username: "arjun.g",
        email: "arjun.gupta@example.com",
        password: "password123",
        role: "student",
        firstName: "Arjun",
        lastName: "Gupta",
        avatar: null,
        createdAt: new Date(),
      }
    ];

    sampleStudents.forEach(student => this.users.set(student.id, student));

    // Add sample testimonials
    const testimonials: Testimonial[] = [
      {
        id: randomUUID(),
        studentId: sampleStudents[0].id,
        courseId: sampleCourses[0].id,
        content: "The AI Software Development course completely changed my career. I went from a junior developer to leading AI projects at my company within 6 months!",
        rating: 5,
        isPublished: true,
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        studentId: sampleStudents[1].id,
        courseId: sampleCourses[1].id,
        content: "The live sessions were incredible! Real-time feedback and hands-on practice made learning AI video creation so much easier than I expected.",
        rating: 5,
        isPublished: true,
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        studentId: sampleStudents[2].id,
        courseId: sampleCourses[2].id,
        content: "Started with zero AI knowledge and now I'm creating automated presentations for my entire marketing team. The ROI has been incredible!",
        rating: 5,
        isPublished: true,
        createdAt: new Date(),
      }
    ];

    testimonials.forEach(testimonial => this.testimonials.set(testimonial.id, testimonial));

    this.addActivity("system", "Platform initialized with sample data");
  }

  private addActivity(type: string, description: string) {
    const activity: Activity = {
      id: randomUUID(),
      type,
      description,
      timestamp: new Date().toISOString(),
    };
    this.activities.unshift(activity);
    
    // Keep only the last 50 activities
    if (this.activities.length > 50) {
      this.activities = this.activities.slice(0, 50);
    }
  }

  // User management
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id, 
      role: insertUser.role || "student",
      firstName: insertUser.firstName || null,
      lastName: insertUser.lastName || null,
      avatar: insertUser.avatar || null,
      createdAt: new Date() 
    };
    this.users.set(id, user);
    this.addActivity("user", `New user registered: ${user.firstName} ${user.lastName}`);
    return user;
  }

  async getUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async getStudentsWithStats(): Promise<StudentWithStats[]> {
    const students = Array.from(this.users.values()).filter(user => user.role === "student");
    return students.map(student => {
      const studentEnrollments = Array.from(this.enrollments.values()).filter(e => e.studentId === student.id);
      const completedCourses = studentEnrollments.filter(e => e.completed).length;
      const totalProgress = studentEnrollments.reduce((sum, e) => sum + (e.progress || 0), 0) / Math.max(studentEnrollments.length, 1);
      
      return {
        ...student,
        enrollmentCount: studentEnrollments.length,
        completedCourses,
        totalProgress: Math.round(totalProgress),
      };
    });
  }

  // Course management
  async getCourses(): Promise<Course[]> {
    return Array.from(this.courses.values());
  }

  async getCourseById(id: string): Promise<Course | undefined> {
    return this.courses.get(id);
  }

  async createCourse(course: InsertCourse): Promise<Course> {
    const id = randomUUID();
    const newCourse: Course = {
      ...course,
      id,
      rating: "0",
      studentsCount: 0,
      shortDescription: course.shortDescription || null,
      thumbnail: course.thumbnail || null,
      instructorId: course.instructorId || null,
      isActive: true,
      createdAt: new Date(),
    };
    this.courses.set(id, newCourse);
    this.addActivity("course", `New course created: ${newCourse.title}`);
    return newCourse;
  }

  async updateCourse(id: string, courseData: InsertCourse): Promise<Course | null> {
    const existingCourse = this.courses.get(id);
    if (!existingCourse) return null;

    const updatedCourse: Course = {
      ...existingCourse,
      ...courseData,
    };
    this.courses.set(id, updatedCourse);
    this.addActivity("course", `Course updated: ${updatedCourse.title}`);
    return updatedCourse;
  }

  async deleteCourse(id: string): Promise<boolean> {
    const course = this.courses.get(id);
    if (!course) return false;

    this.courses.delete(id);
    this.addActivity("course", `Course deleted: ${course.title}`);
    return true;
  }

  async getPopularCourses(): Promise<Array<{
    id: string;
    title: string;
    studentsCount: number;
    rating: number;
    category: string;
  }>> {
    const courses = Array.from(this.courses.values())
      .sort((a, b) => (b.studentsCount || 0) - (a.studentsCount || 0))
      .slice(0, 10);

    return courses.map(course => ({
      id: course.id,
      title: course.title,
      studentsCount: course.studentsCount || 0,
      rating: parseFloat(course.rating || "0"),
      category: course.category,
    }));
  }

  // Live session management
  async getLiveSessions(): Promise<LiveSession[]> {
    return Array.from(this.liveSessions.values());
  }

  async createLiveSession(session: InsertLiveSession): Promise<LiveSession> {
    const id = randomUUID();
    const newSession: LiveSession = {
      ...session,
      id,
      instructorId: session.instructorId || null,
      courseId: session.courseId || null,
      maxParticipants: session.maxParticipants || null,
      meetingUrl: session.meetingUrl || null,
      currentParticipants: 0,
      status: "scheduled",
      createdAt: new Date(),
    };
    this.liveSessions.set(id, newSession);
    this.addActivity("session", `Live session scheduled: ${newSession.title}`);
    return newSession;
  }

  async updateLiveSession(id: string, sessionData: InsertLiveSession): Promise<LiveSession | null> {
    const existingSession = this.liveSessions.get(id);
    if (!existingSession) return null;

    const updatedSession: LiveSession = {
      ...existingSession,
      ...sessionData,
    };
    this.liveSessions.set(id, updatedSession);
    this.addActivity("session", `Live session updated: ${updatedSession.title}`);
    return updatedSession;
  }

  async deleteLiveSession(id: string): Promise<boolean> {
    const session = this.liveSessions.get(id);
    if (!session) return false;

    this.liveSessions.delete(id);
    this.addActivity("session", `Live session deleted: ${session.title}`);
    return true;
  }

  async startLiveSession(id: string): Promise<LiveSession | null> {
    const session = this.liveSessions.get(id);
    if (!session) return null;

    const updatedSession: LiveSession = {
      ...session,
      status: "live",
    };
    this.liveSessions.set(id, updatedSession);
    this.addActivity("session", `Live session started: ${session.title}`);
    return updatedSession;
  }

  async endLiveSession(id: string): Promise<LiveSession | null> {
    const session = this.liveSessions.get(id);
    if (!session) return null;

    const updatedSession: LiveSession = {
      ...session,
      status: "completed",
    };
    this.liveSessions.set(id, updatedSession);
    this.addActivity("session", `Live session ended: ${session.title}`);
    return updatedSession;
  }

  // Enrollment management
  async createEnrollment(enrollment: InsertEnrollment): Promise<Enrollment> {
    const id = randomUUID();
    const newEnrollment: Enrollment = {
      ...enrollment,
      id,
      enrolledAt: new Date(),
      progress: 0,
      completed: false,
      completedAt: null,
    };
    this.enrollments.set(id, newEnrollment);

    // Update course student count
    const course = this.courses.get(enrollment.courseId);
    if (course) {
      course.studentsCount = (course.studentsCount || 0) + 1;
      this.courses.set(course.id, course);
    }

    this.addActivity("enrollment", `New enrollment created for course: ${course?.title || 'Unknown'}`);
    return newEnrollment;
  }

  async getEnrollmentsWithDetails(): Promise<EnrollmentWithDetails[]> {
    const enrollments = Array.from(this.enrollments.values());
    return enrollments.map(enrollment => {
      const student = this.users.get(enrollment.studentId)!;
      const course = this.courses.get(enrollment.courseId)!;
      return {
        ...enrollment,
        student,
        course,
      };
    });
  }

  // Testimonial management
  async getPublishedTestimonials(): Promise<TestimonialWithStudent[]> {
    const publishedTestimonials = Array.from(this.testimonials.values())
      .filter(testimonial => testimonial.isPublished);
    
    return publishedTestimonials.map(testimonial => {
      const student = this.users.get(testimonial.studentId)!;
      return {
        ...testimonial,
        student,
      };
    });
  }

  async createTestimonial(testimonial: InsertTestimonial): Promise<Testimonial> {
    const id = randomUUID();
    const newTestimonial: Testimonial = {
      ...testimonial,
      id,
      courseId: testimonial.courseId || null,
      isPublished: false,
      createdAt: new Date(),
    };
    this.testimonials.set(id, newTestimonial);
    this.addActivity("testimonial", "New testimonial submitted");
    return newTestimonial;
  }

  // Payment management
  async getPaymentsWithDetails(): Promise<PaymentWithDetails[]> {
    const payments = Array.from(this.payments.values());
    return payments.map(payment => {
      const user = this.users.get(payment.userId)!;
      const course = payment.courseId ? this.courses.get(payment.courseId) : undefined;
      return {
        ...payment,
        user,
        course,
      };
    });
  }

  async updatePaymentStatus(id: string, status: string): Promise<Payment | null> {
    const payment = this.payments.get(id);
    if (!payment) return null;

    const updatedPayment: Payment = {
      ...payment,
      status: status as any,
    };
    this.payments.set(id, updatedPayment);
    this.addActivity("payment", `Payment status updated: ${status}`);
    return updatedPayment;
  }

  async processRefund(id: string): Promise<Payment | null> {
    const payment = this.payments.get(id);
    if (!payment) return null;

    const updatedPayment: Payment = {
      ...payment,
      status: "refunded",
    };
    this.payments.set(id, updatedPayment);
    this.addActivity("payment", `Refund processed for payment: ${id}`);
    return updatedPayment;
  }

  async getPaymentStats(timeRange: string): Promise<{
    totalRevenue: number;
    totalTransactions: number;
    pendingPayments: number;
    successRate: number;
    monthlyRevenue: number;
    monthlyGrowth: number;
    refundedAmount: number;
    averageOrderValue: number;
  }> {
    const payments = Array.from(this.payments.values());
    const completedPayments = payments.filter(p => p.status === "completed");
    const totalRevenue = completedPayments.reduce((sum, p) => sum + parseFloat(p.amount.toString()), 0);
    const refundedAmount = payments.filter(p => p.status === "refunded")
      .reduce((sum, p) => sum + parseFloat(p.amount.toString()), 0);

    return {
      totalRevenue,
      totalTransactions: payments.length,
      pendingPayments: payments.filter(p => p.status === "pending").length,
      successRate: payments.length > 0 ? (completedPayments.length / payments.length) * 100 : 0,
      monthlyRevenue: totalRevenue,
      monthlyGrowth: 15,
      refundedAmount,
      averageOrderValue: completedPayments.length > 0 ? totalRevenue / completedPayments.length : 0,
    };
  }

  async getRevenueTrends(timeRange: string): Promise<Array<{
    month: string;
    revenue: number;
    transactions: number;
  }>> {
    // Mock data for revenue trends
    return [
      { month: "Jan 2024", revenue: 150000, transactions: 15 },
      { month: "Feb 2024", revenue: 180000, transactions: 18 },
      { month: "Mar 2024", revenue: 220000, transactions: 22 },
      { month: "Apr 2024", revenue: 250000, transactions: 25 },
      { month: "May 2024", revenue: 280000, transactions: 28 },
      { month: "Jun 2024", revenue: 320000, transactions: 32 },
    ];
  }

  // Contact and communication
  async createContactSubmission(contactData: any): Promise<ContactSubmission> {
    const id = randomUUID();
    const contact: ContactSubmission = {
      ...contactData,
      id,
      createdAt: new Date(),
    };
    this.contactSubmissions.set(id, contact);
    this.addActivity("contact", `New contact submission from: ${contactData.name}`);
    return contact;
  }

  async getMessages(): Promise<Message[]> {
    return Array.from(this.messages.values());
  }

  async getConversations(): Promise<Conversation[]> {
    return Array.from(this.conversations.values());
  }

  async sendMessage(messageData: any): Promise<Message> {
    const id = randomUUID();
    const adminUser = Array.from(this.users.values()).find(u => u.role === "admin")!;
    const recipients = messageData.recipients.map((recipientId: string) => this.users.get(recipientId)!);
    
    const message: Message = {
      id,
      subject: messageData.subject,
      content: messageData.content,
      sender: adminUser,
      recipients,
      sentAt: new Date().toISOString(),
      status: "sent",
      type: messageData.type,
    };
    
    this.messages.set(id, message);
    this.addActivity("communication", `Message sent: ${messageData.subject}`);
    return message;
  }

  // Content management
  async getContentFiles(): Promise<ContentFile[]> {
    return Array.from(this.contentFiles.values());
  }

  async getContentFolders(): Promise<ContentFolder[]> {
    return Array.from(this.contentFolders.values());
  }

  async getContentStats(): Promise<{
    totalFiles: number;
    totalSize: number;
    totalDownloads: number;
    videoFiles: number;
    documentFiles: number;
    imageFiles: number;
  }> {
    const files = Array.from(this.contentFiles.values());
    return {
      totalFiles: files.length,
      totalSize: files.reduce((sum, f) => sum + f.size, 0),
      totalDownloads: files.reduce((sum, f) => sum + f.downloads, 0),
      videoFiles: files.filter(f => f.type.startsWith("video")).length,
      documentFiles: files.filter(f => f.type.startsWith("application")).length,
      imageFiles: files.filter(f => f.type.startsWith("image")).length,
    };
  }

  async deleteContentFile(id: string): Promise<boolean> {
    const file = this.contentFiles.get(id);
    if (!file) return false;

    this.contentFiles.delete(id);
    this.addActivity("content", `File deleted: ${file.name}`);
    return true;
  }

  // Analytics
  async getAnalyticsOverview(timeRange: string): Promise<{
    totalRevenue: number;
    totalStudents: number;
    totalEnrollments: number;
    completionRate: number;
    revenueGrowth: number;
    studentGrowth: number;
    enrollmentGrowth: number;
    completionGrowth: number;
  }> {
    const students = Array.from(this.users.values()).filter(u => u.role === "student");
    const enrollments = Array.from(this.enrollments.values());
    const completedEnrollments = enrollments.filter(e => e.completed);
    const payments = Array.from(this.payments.values()).filter(p => p.status === "completed");
    const totalRevenue = payments.reduce((sum, p) => sum + parseFloat(p.amount.toString()), 0);

    return {
      totalRevenue,
      totalStudents: students.length,
      totalEnrollments: enrollments.length,
      completionRate: enrollments.length > 0 ? (completedEnrollments.length / enrollments.length) * 100 : 0,
      revenueGrowth: 18,
      studentGrowth: 12,
      enrollmentGrowth: 15,
      completionGrowth: 8,
    };
  }

  async getCourseAnalytics(timeRange: string): Promise<Array<{
    courseId: string;
    title: string;
    enrollments: number;
    completions: number;
    revenue: number;
    avgRating: number;
    completionRate: number;
  }>> {
    const courses = Array.from(this.courses.values());
    return courses.map(course => {
      const courseEnrollments = Array.from(this.enrollments.values()).filter(e => e.courseId === course.id);
      const completions = courseEnrollments.filter(e => e.completed).length;
      
      return {
        courseId: course.id,
        title: course.title,
        enrollments: courseEnrollments.length,
        completions,
        revenue: parseFloat(course.price.toString()) * courseEnrollments.length,
        avgRating: parseFloat(course.rating || "0"),
        completionRate: courseEnrollments.length > 0 ? (completions / courseEnrollments.length) * 100 : 0,
      };
    });
  }

  async getStudentAnalytics(timeRange: string): Promise<{
    activeStudents: number;
    newStudents: number;
    churnRate: number;
    avgSessionDuration: number;
    topPerformers: Array<{
      id: string;
      name: string;
      completedCourses: number;
      totalProgress: number;
    }>;
  }> {
    const students = Array.from(this.users.values()).filter(u => u.role === "student");
    const studentsWithStats = await this.getStudentsWithStats();
    const topPerformers = studentsWithStats
      .sort((a, b) => b.completedCourses - a.completedCourses)
      .slice(0, 5)
      .map(student => ({
        id: student.id,
        name: `${student.firstName} ${student.lastName}`,
        completedCourses: student.completedCourses,
        totalProgress: student.totalProgress,
      }));

    return {
      activeStudents: students.length,
      newStudents: Math.floor(students.length * 0.2),
      churnRate: 5,
      avgSessionDuration: 45,
      topPerformers,
    };
  }

  async getRevenueAnalytics(timeRange: string): Promise<{
    totalRevenue: number;
    monthlyRevenue: Array<{
      month: string;
      revenue: number;
      enrollments: number;
    }>;
    revenueByCategory: Array<{
      category: string;
      revenue: number;
      percentage: number;
    }>;
  }> {
    const payments = Array.from(this.payments.values()).filter(p => p.status === "completed");
    const totalRevenue = payments.reduce((sum, p) => sum + parseFloat(p.amount.toString()), 0);

    // Mock monthly revenue data
    const monthlyRevenue = [
      { month: "Jan 2024", revenue: 150000, enrollments: 15 },
      { month: "Feb 2024", revenue: 180000, enrollments: 18 },
      { month: "Mar 2024", revenue: 220000, enrollments: 22 },
      { month: "Apr 2024", revenue: 250000, enrollments: 25 },
      { month: "May 2024", revenue: 280000, enrollments: 28 },
      { month: "Jun 2024", revenue: 320000, enrollments: 32 },
    ];

    // Calculate revenue by category
    const courses = Array.from(this.courses.values());
    const categoryRevenue = new Map<string, number>();
    
    courses.forEach(course => {
      const coursePayments = payments.filter(p => p.courseId === course.id);
      const revenue = coursePayments.reduce((sum, p) => sum + parseFloat(p.amount.toString()), 0);
      categoryRevenue.set(course.category, (categoryRevenue.get(course.category) || 0) + revenue);
    });

    const revenueByCategory = Array.from(categoryRevenue.entries()).map(([category, revenue]) => ({
      category,
      revenue,
      percentage: totalRevenue > 0 ? (revenue / totalRevenue) * 100 : 0,
    }));

    return {
      totalRevenue,
      monthlyRevenue,
      revenueByCategory,
    };
  }

  // Settings
  async getSettings(category: string): Promise<any> {
    return this.settings.get(category) || {};
  }

  async updateSettings(category: string, settings: any): Promise<any> {
    this.settings.set(category, settings);
    this.addActivity("settings", `Settings updated: ${category}`);
    return settings;
  }

  // Stats and activities
  async getPublicStats(): Promise<{
    totalStudents: number;
    totalCourses: number;
    averageRating: number;
  }> {
    const students = Array.from(this.users.values()).filter(u => u.role === "student");
    const courses = Array.from(this.courses.values()).filter(c => c.isActive);
    const avgRating = courses.length > 0 
      ? courses.reduce((sum, c) => sum + parseFloat(c.rating || "0"), 0) / courses.length
      : 0;

    return {
      totalStudents: students.length,
      totalCourses: courses.length,
      averageRating: Math.round(avgRating * 10) / 10,
    };
  }

  async getAdminStats(): Promise<{
    totalStudents: number;
    activeCourses: number;
    totalRevenue: number;
    liveSessions: number;
    newStudentsThisMonth: number;
    revenueGrowth: number;
  }> {
    const students = Array.from(this.users.values()).filter(u => u.role === "student");
    const activeCourses = Array.from(this.courses.values()).filter(c => c.isActive);
    const payments = Array.from(this.payments.values()).filter(p => p.status === "completed");
    const totalRevenue = payments.reduce((sum, p) => sum + parseFloat(p.amount.toString()), 0);
    const liveSessions = Array.from(this.liveSessions.values()).filter(s => s.status === "live");

    return {
      totalStudents: students.length,
      activeCourses: activeCourses.length,
      totalRevenue,
      liveSessions: liveSessions.length,
      newStudentsThisMonth: Math.floor(students.length * 0.12),
      revenueGrowth: 18,
    };
  }

  async getStudentStats(): Promise<{
    totalStudents: number;
    activeStudents: number;
    completionRate: number;
    avgProgress: number;
  }> {
    const students = Array.from(this.users.values()).filter(u => u.role === "student");
    const enrollments = Array.from(this.enrollments.values());
    const completedEnrollments = enrollments.filter(e => e.completed);
    const avgProgress = enrollments.length > 0 
      ? enrollments.reduce((sum, e) => sum + (e.progress || 0), 0) / enrollments.length
      : 0;

    return {
      totalStudents: students.length,
      activeStudents: Math.floor(students.length * 0.8),
      completionRate: enrollments.length > 0 ? (completedEnrollments.length / enrollments.length) * 100 : 0,
      avgProgress: Math.round(avgProgress),
    };
  }

  async getRecentActivities(): Promise<Activity[]> {
    return this.activities.slice(0, 10);
  }
}

import { db } from "./db";
import { eq, desc } from "drizzle-orm";

// Database storage implementation
export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        ...insertUser,
        firstName: insertUser.firstName || null,
        lastName: insertUser.lastName || null,
        avatar: insertUser.avatar || null,
        role: insertUser.role || "student",
      })
      .returning();
    return user;
  }

  async getCourses(): Promise<Course[]> {
    return await db.select().from(courses).orderBy(desc(courses.createdAt));
  }

  async getCourse(id: string): Promise<Course | undefined> {
    const [course] = await db.select().from(courses).where(eq(courses.id, id));
    return course || undefined;
  }

  async createCourse(insertCourse: InsertCourse): Promise<Course> {
    const [course] = await db
      .insert(courses)
      .values({
        ...insertCourse,
        thumbnail: insertCourse.thumbnail || null,
        studentsCount: 0,
        isActive: true,
      })
      .returning();
    return course;
  }

  async updateCourse(id: string, courseData: Partial<InsertCourse>): Promise<Course | null> {
    const [course] = await db
      .update(courses)
      .set(courseData)
      .where(eq(courses.id, id))
      .returning();
    return course || null;
  }

  async deleteCourse(id: string): Promise<boolean> {
    const result = await db.delete(courses).where(eq(courses.id, id));
    return result.rowCount > 0;
  }

  async getLiveSessions(): Promise<LiveSession[]> {
    return await db.select().from(liveSessions).orderBy(desc(liveSessions.scheduledAt));
  }

  async createLiveSession(session: InsertLiveSession): Promise<LiveSession> {
    const [newSession] = await db
      .insert(liveSessions)
      .values({
        ...session,
        instructorId: session.instructorId || null,
        courseId: session.courseId || null,
        maxParticipants: session.maxParticipants || null,
        meetingUrl: session.meetingUrl || null,
        currentParticipants: 0,
        status: "scheduled",
      })
      .returning();
    return newSession;
  }

  async updateLiveSession(id: string, sessionData: InsertLiveSession): Promise<LiveSession | null> {
    const [session] = await db
      .update(liveSessions)
      .set(sessionData)
      .where(eq(liveSessions.id, id))
      .returning();
    return session || null;
  }

  async deleteLiveSession(id: string): Promise<boolean> {
    const result = await db.delete(liveSessions).where(eq(liveSessions.id, id));
    return result.rowCount > 0;
  }

  async startLiveSession(id: string): Promise<LiveSession | null> {
    const [session] = await db
      .update(liveSessions)
      .set({ status: "live" })
      .where(eq(liveSessions.id, id))
      .returning();
    return session || null;
  }

  async endLiveSession(id: string): Promise<LiveSession | null> {
    const [session] = await db
      .update(liveSessions)
      .set({ status: "completed" })
      .where(eq(liveSessions.id, id))
      .returning();
    return session || null;
  }

  async getPublishedTestimonials(): Promise<TestimonialWithStudent[]> {
    const result = await db
      .select({
        testimonial: testimonials,
        student: users,
      })
      .from(testimonials)
      .innerJoin(users, eq(testimonials.studentId, users.id))
      .where(eq(testimonials.isPublished, true))
      .orderBy(desc(testimonials.createdAt));

    return result.map(row => ({
      ...row.testimonial,
      student: row.student,
    }));
  }

  async createTestimonial(testimonial: InsertTestimonial): Promise<Testimonial> {
    const [newTestimonial] = await db
      .insert(testimonials)
      .values({
        ...testimonial,
        courseId: testimonial.courseId || null,
        isPublished: false,
      })
      .returning();
    return newTestimonial;
  }

  async getEnrollmentsWithDetails(): Promise<EnrollmentWithDetails[]> {
    const result = await db
      .select({
        enrollment: enrollments,
        student: users,
        course: courses,
      })
      .from(enrollments)
      .innerJoin(users, eq(enrollments.studentId, users.id))
      .innerJoin(courses, eq(enrollments.courseId, courses.id))
      .orderBy(desc(enrollments.enrolledAt));

    return result.map(row => ({
      ...row.enrollment,
      student: row.student,
      course: row.course,
    }));
  }

  async createEnrollment(enrollment: InsertEnrollment): Promise<Enrollment> {
    const [newEnrollment] = await db
      .insert(enrollments)
      .values({
        ...enrollment,
        progress: 0,
        completed: false,
        completedAt: null,
      })
      .returning();

    // Update course student count
    await db
      .update(courses)
      .set({ studentsCount: db.select({ count: courses.studentsCount }).from(courses).where(eq(courses.id, enrollment.courseId)) })
      .where(eq(courses.id, enrollment.courseId));

    return newEnrollment;
  }

  // Basic stats methods
  async getStats(): Promise<{ totalStudents: number; totalCourses: number; averageRating: number }> {
    const studentCount = await db.select().from(users).where(eq(users.role, "student"));
    const courseList = await db.select().from(courses);
    const avgRating = courseList.length > 0 
      ? courseList.reduce((sum, course) => sum + parseFloat(course.rating || "0"), 0) / courseList.length 
      : 0;

    return {
      totalStudents: studentCount.length,
      totalCourses: courseList.length,
      averageRating: Math.round(avgRating * 10) / 10,
    };
  }

  async getAdminStats(): Promise<{
    totalStudents: number;
    activeCourses: number;
    totalRevenue: number;
    liveSessions: number;
    newStudentsThisMonth: number;
    revenueGrowth: number;
  }> {
    const studentCount = await db.select().from(users).where(eq(users.role, "student"));
    const activeCourses = await db.select().from(courses).where(eq(courses.isActive, true));
    const liveSessionsCount = await db.select().from(liveSessions).where(eq(liveSessions.status, "live"));

    return {
      totalStudents: studentCount.length,
      activeCourses: activeCourses.length,
      totalRevenue: 25000, // Placeholder - would come from payments table
      liveSessions: liveSessionsCount.length,
      newStudentsThisMonth: Math.floor(studentCount.length * 0.12),
      revenueGrowth: 18,
    };
  }

  async getStudentStats(): Promise<{
    totalStudents: number;
    activeStudents: number;
    completionRate: number;
    avgProgress: number;
  }> {
    const studentCount = await db.select().from(users).where(eq(users.role, "student"));
    const enrollmentList = await db.select().from(enrollments);
    const completedEnrollments = enrollmentList.filter(e => e.completed);
    const avgProgress = enrollmentList.length > 0 
      ? enrollmentList.reduce((sum, e) => sum + (e.progress || 0), 0) / enrollmentList.length
      : 0;

    return {
      totalStudents: studentCount.length,
      activeStudents: Math.floor(studentCount.length * 0.8),
      completionRate: enrollmentList.length > 0 ? (completedEnrollments.length / enrollmentList.length) * 100 : 0,
      avgProgress: Math.round(avgProgress),
    };
  }

  async getPopularCourses(): Promise<Array<{
    id: string;
    title: string;
    studentsCount: number;
    rating: number;
    category: string;
  }>> {
    const courseList = await db.select().from(courses).orderBy(desc(courses.studentsCount));
    
    return courseList.slice(0, 10).map(course => ({
      id: course.id,
      title: course.title,
      studentsCount: course.studentsCount || 0,
      rating: parseFloat(course.rating || "0"),
      category: course.category,
    }));
  }

  async getRecentActivities(): Promise<Activity[]> {
    // For now, return empty array since activities aren't in the schema yet
    return [];
  }

  // Add remaining interface methods as needed
  async getPaymentsWithDetails(): Promise<PaymentWithDetails[]> {
    return []; // Placeholder - implement when payments schema is ready
  }

  async getSettings(): Promise<any> {
    return {}; // Placeholder - implement when settings schema is ready
  }

  async updateSettings(category: string, data: any): Promise<void> {
    // Placeholder - implement when settings schema is ready
  }
}

export const storage = new DatabaseStorage();
