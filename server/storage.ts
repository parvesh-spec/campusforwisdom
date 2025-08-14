import { 
  Course, 
  User, 
  LiveWebinar,
  Testimonial, 
  Enrollment,
  WebinarAttendee,
  ParticipantEngagement,
  ZoomEvent,
  WebinarAnalytic,
  InsertCourse, 
  InsertUser, 
  InsertLiveWebinar,
  InsertTestimonial, 
  InsertEnrollment,
  InsertWebinarAttendee,
  InsertParticipantEngagement,
  InsertZoomEvent,
  InsertWebinarAnalytic,
  courses,
  users,
  liveWebinars,
  testimonials,
  enrollments,
  webinarAttendees,
  participantEngagement,
  zoomEvents,
  webinarAnalytics
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
  createUser(user: InsertUser): Promise<User>;

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

  // Live webinar methods
  getLiveWebinars(): Promise<LiveWebinar[]>;
  createLiveWebinar(webinar: InsertLiveWebinar): Promise<LiveWebinar>;
  updateLiveWebinar(id: string, webinar: InsertLiveWebinar): Promise<LiveWebinar | null>;
  deleteLiveWebinar(id: string): Promise<boolean>;
  startLiveWebinar(id: string): Promise<LiveWebinar | null>;
  endLiveWebinar(id: string): Promise<LiveWebinar | null>;

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
    return (result.rowCount || 0) > 0;
  }

  async getLiveWebinars(): Promise<LiveWebinar[]> {
    return await db.select().from(liveWebinars).orderBy(desc(liveWebinars.scheduledAt));
  }

  async createLiveWebinar(webinar: InsertLiveWebinar): Promise<LiveWebinar> {
    const [newWebinar] = await db
      .insert(liveWebinars)
      .values({
        ...webinar,
        instructorId: webinar.instructorId || null,
        courseId: webinar.courseId || null,
        maxParticipants: webinar.maxParticipants || null,
        currentParticipants: 0,
        registeredParticipants: 0,
        status: "scheduled",
      })
      .returning();
    return newWebinar;
  }

  async updateLiveWebinar(id: string, webinarData: InsertLiveWebinar): Promise<LiveWebinar | null> {
    const [webinar] = await db
      .update(liveWebinars)
      .set(webinarData)
      .where(eq(liveWebinars.id, id))
      .returning();
    return webinar || null;
  }

  async deleteLiveWebinar(id: string): Promise<boolean> {
    const result = await db.delete(liveWebinars).where(eq(liveWebinars.id, id));
    return (result.rowCount || 0) > 0;
  }

  async startLiveWebinar(id: string): Promise<LiveWebinar | null> {
    const [webinar] = await db
      .update(liveWebinars)
      .set({ status: "live" })
      .where(eq(liveWebinars.id, id))
      .returning();
    return webinar || null;
  }

  async endLiveWebinar(id: string): Promise<LiveWebinar | null> {
    const [webinar] = await db
      .update(liveWebinars)
      .set({ status: "completed" })
      .where(eq(liveWebinars.id, id))
      .returning();
    return webinar || null;
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

  // Zoom integration methods
  async getLiveSession(id: string): Promise<LiveSession | null> {
    const [session] = await db.select().from(liveSessions).where(eq(liveSessions.id, id));
    return session || null;
  }

  async getSessionAnalytics(sessionId: string): Promise<SessionAnalytic[]> {
    return await db.select().from(sessionAnalytics).where(eq(sessionAnalytics.sessionId, sessionId));
  }

  async getSessionAttendees(sessionId: string): Promise<SessionAttendee[]> {
    return await db.select().from(sessionAttendees).where(eq(sessionAttendees.sessionId, sessionId));
  }

  async getParticipantEngagement(sessionId: string): Promise<ParticipantEngagement[]> {
    return await db.select().from(participantEngagement).where(eq(participantEngagement.sessionId, sessionId));
  }

  async createSessionAttendee(attendee: InsertSessionAttendee): Promise<SessionAttendee> {
    const [newAttendee] = await db.insert(sessionAttendees).values(attendee).returning();
    return newAttendee;
  }

  async updateSessionAttendee(id: string, data: Partial<InsertSessionAttendee>): Promise<SessionAttendee | null> {
    const [attendee] = await db
      .update(sessionAttendees)
      .set(data)
      .where(eq(sessionAttendees.id, id))
      .returning();
    return attendee || null;
  }

  async createParticipantEngagement(engagement: InsertParticipantEngagement): Promise<ParticipantEngagement> {
    const [newEngagement] = await db.insert(participantEngagement).values(engagement).returning();
    return newEngagement;
  }

  async createZoomEvent(event: InsertZoomEvent): Promise<ZoomEvent> {
    const [newEvent] = await db.insert(zoomEvents).values(event).returning();
    return newEvent;
  }

  async createSessionAnalytics(analytics: InsertSessionAnalytic): Promise<SessionAnalytic> {
    const [newAnalytics] = await db.insert(sessionAnalytics).values(analytics).returning();
    return newAnalytics;
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