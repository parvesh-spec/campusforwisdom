import { 
  Course, 
  User, 
  LiveSession,
  Webinar,
  Testimonial, 
  Enrollment,
  Expert,
  Consultation,
  InsertCourse, 
  InsertUser, 
  InsertLiveSession,
  InsertWebinar,
  InsertTestimonial, 
  InsertEnrollment,
  InsertExpert,
  InsertConsultation,
  courses,
  users,
  webinars,
  testimonials,
  enrollments,
  experts,
  consultations
} from "@shared/schema";

// Type definitions for joined data
export type TestimonialWithStudent = Testimonial & {
  student: User;
};

export type EnrollmentWithDetails = Enrollment & {
  student: User;
  course: Course;
};

export type PaymentWithDetails = {
  id: string;
  amount: number;
  status: string;
  userId: string;
  courseId?: string;
  user: User;
  course?: Course;
};

export type Activity = {
  id: string;
  type: string;
  description: string;
  timestamp: Date;
};
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByPhone(phone: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserProfile(id: string, profile: Partial<User>): Promise<User>;

  // Course methods
  getCourses(): Promise<Course[]>;
  getCourse(id: string): Promise<Course | undefined>;
  createCourse(course: InsertCourse): Promise<Course>;
  updateCourse(id: string, course: Partial<InsertCourse>): Promise<Course | null>;
  deleteCourse(id: string): Promise<boolean>;
  getPopularCourses(): Promise<Array<{
    id: string;
    title: string;
    studentsCount: number;
    rating: number;
    category: string;
  }>>;

  // Webinar methods (keeping LiveSession methods for backward compatibility)
  getLiveSessions(): Promise<LiveSession[]>;
  createLiveSession(session: InsertLiveSession): Promise<LiveSession>;
  updateLiveSession(id: string, session: InsertLiveSession): Promise<LiveSession | null>;
  deleteLiveSession(id: string): Promise<boolean>;
  startLiveSession(id: string): Promise<LiveSession | null>;
  endLiveSession(id: string): Promise<LiveSession | null>;

  // New webinar methods
  getWebinars(): Promise<Webinar[]>;
  createWebinar(webinar: InsertWebinar): Promise<Webinar>;
  updateWebinar(id: string, webinar: InsertWebinar): Promise<Webinar | null>;
  deleteWebinar(id: string): Promise<boolean>;

  // Testimonial methods
  getPublishedTestimonials(): Promise<TestimonialWithStudent[]>;
  createTestimonial(testimonial: InsertTestimonial): Promise<Testimonial>;

  // Enrollment methods
  getEnrollmentsWithDetails(): Promise<EnrollmentWithDetails[]>;
  createEnrollment(enrollment: InsertEnrollment): Promise<Enrollment>;

  // Payment methods
  getPaymentsWithDetails(): Promise<PaymentWithDetails[]>;

  // Stats methods
  getStats(): Promise<{ totalStudents: number; totalCourses: number; averageRating: number }>;
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

  // Activity methods
  getRecentActivities(): Promise<Activity[]>;

  // Settings methods
  getSettings(): Promise<any>;
  updateSettings(category: string, data: any): Promise<void>;

  // Expert methods
  getExperts(): Promise<Expert[]>;
  createExpert(expert: InsertExpert): Promise<Expert>;
  updateExpert(id: string, expert: Partial<InsertExpert>): Promise<Expert>;
  deleteExpert(id: string): Promise<boolean>;

  // Consultation methods
  getStudentConsultations(studentId: string): Promise<Consultation[]>;
  getAllConsultations(): Promise<Consultation[]>;
  createConsultation(consultation: InsertConsultation): Promise<Consultation>;
}

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

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async getUserByPhone(phone: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.phone, phone));
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

  async updateUserProfile(id: string, profile: Partial<User>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        ...profile,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    
    if (!user) {
      throw new Error('User not found');
    }
    
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
    return (result.rowCount || 0) > 0;
  }

  async getLiveSessions(): Promise<LiveSession[]> {
    return await db.select().from(webinars).orderBy(desc(webinars.scheduledAt));
  }

  async createLiveSession(session: InsertLiveSession): Promise<LiveSession> {
    const [newSession] = await db
      .insert(webinars)
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
      .update(webinars)
      .set(sessionData)
      .where(eq(webinars.id, id))
      .returning();
    return session || null;
  }

  async deleteLiveSession(id: string): Promise<boolean> {
    const result = await db.delete(webinars).where(eq(webinars.id, id));
    return (result.rowCount || 0) > 0;
  }

  async startLiveSession(id: string): Promise<LiveSession | null> {
    const [session] = await db
      .update(webinars)
      .set({ status: "live" })
      .where(eq(webinars.id, id))
      .returning();
    return session || null;
  }

  async endLiveSession(id: string): Promise<LiveSession | null> {
    const [session] = await db
      .update(webinars)
      .set({ status: "completed" })
      .where(eq(webinars.id, id))
      .returning();
    return session || null;
  }

  // New webinar methods
  async getWebinars(): Promise<Webinar[]> {
    return await db.select().from(webinars).orderBy(desc(webinars.scheduledAt));
  }

  async createWebinar(webinar: InsertWebinar): Promise<Webinar> {
    const [newWebinar] = await db
      .insert(webinars)
      .values({
        ...webinar,
        instructorId: webinar.instructorId || null,
        courseId: webinar.courseId || null,
        maxParticipants: webinar.maxParticipants || null,
        meetingUrl: webinar.meetingUrl || null,
        timezone: webinar.timezone || "Asia/Calcutta",
        currentParticipants: 0,
        status: "scheduled",
      })
      .returning();
    return newWebinar;
  }

  async updateWebinar(id: string, webinarData: InsertWebinar): Promise<Webinar | null> {
    const [webinar] = await db
      .update(webinars)
      .set(webinarData)
      .where(eq(webinars.id, id))
      .returning();
    return webinar || null;
  }

  async deleteWebinar(id: string): Promise<boolean> {
    const result = await db.delete(webinars).where(eq(webinars.id, id));
    return (result.rowCount || 0) > 0;
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
    const course = await this.getCourse(enrollment.courseId);
    if (course) {
      await db
        .update(courses)
        .set({ studentsCount: (course.studentsCount || 0) + 1 })
        .where(eq(courses.id, enrollment.courseId));
    }

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
    const liveSessionsCount = await db.select().from(webinars).where(eq(webinars.status, "live"));

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

  // Expert methods
  async getExperts(): Promise<Expert[]> {
    const expertList = await db.select().from(experts).orderBy(desc(experts.createdAt));
    return expertList;
  }

  async createExpert(insertExpert: InsertExpert): Promise<Expert> {
    const [expert] = await db
      .insert(experts)
      .values(insertExpert)
      .returning();
    return expert;
  }

  async updateExpert(id: string, expertData: Partial<InsertExpert>): Promise<Expert> {
    const [expert] = await db
      .update(experts)
      .set(expertData)
      .where(eq(experts.id, id))
      .returning();
    
    if (!expert) {
      throw new Error("Expert not found");
    }
    return expert;
  }

  async deleteExpert(id: string): Promise<boolean> {
    const result = await db.delete(experts).where(eq(experts.id, id));
    return result.rowCount! > 0;
  }

  // Consultation methods
  async getStudentConsultations(studentId: string): Promise<Consultation[]> {
    const consultationList = await db
      .select()
      .from(consultations)
      .where(eq(consultations.studentId, studentId))
      .orderBy(desc(consultations.createdAt));
    return consultationList;
  }

  async getAllConsultations(): Promise<Consultation[]> {
    const consultationList = await db
      .select()
      .from(consultations)
      .orderBy(desc(consultations.createdAt));
    return consultationList;
  }

  async createConsultation(insertConsultation: InsertConsultation): Promise<Consultation> {
    const [consultation] = await db
      .insert(consultations)
      .values(insertConsultation)
      .returning();
    return consultation;
  }
}

export const storage = new DatabaseStorage();