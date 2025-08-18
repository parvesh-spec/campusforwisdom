import { 
  Course, 
  User, 
  LiveSession,
  Webinar,
  Testimonial, 
  Enrollment,
  Expert,
  Consultation,
  Ebook,
  UserEbookDownload,
  WebinarAttendee,
  DirectReview,
  CourseReview,
  LegalPage,
  InstructorApplication,
  ContactSubmission,
  InsertCourse, 
  InsertUser, 
  InsertLiveSession,
  InsertWebinar,
  InsertTestimonial, 
  InsertEnrollment,
  InsertExpert,
  InsertConsultation,
  InsertEbook,
  InsertUserEbookDownload,
  InsertWebinarAttendee,
  InsertDirectReview,
  InsertCourseReview,
  InsertLegalPage,
  InsertInstructorApplication,
  InsertContactSubmission,
  courses,
  users,
  webinars,
  testimonials,
  enrollments,
  experts,
  consultations,
  ebooks,
  userEbookDownloads,
  webinarAttendees,
  directReviews,
  courseReviews,
  legalPages,
  instructorApplications,
  contactSubmissions
} from "@shared/schema";

// Type definitions for joined data
export type TestimonialWithStudent = Testimonial & {
  student: User;
};

export type EnrollmentWithDetails = Enrollment & {
  student: User;
  course: Course;
};

export type ConsultationWithDetails = Consultation & {
  expert?: Expert | null;
  student?: User | null;
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

export type Transaction = {
  id: string;
  type: 'course_enrollment' | 'consultation' | 'ebook_download' | 'live_session';
  title: string;
  description: string;
  amount?: string;
  status: string;
  date: Date;
  itemId?: string;
  expertName?: string;
  duration?: number;
};
import { db, pool } from "./db";
import { eq, desc, or, ilike, and, isNotNull } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByPhone(phone: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserProfile(id: string, profile: Partial<User>): Promise<User>;
  searchStudentsByName(searchTerm: string): Promise<User[]>;

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
  getLiveSession(id: string): Promise<Webinar | undefined>;
  createWebinar(webinar: InsertWebinar): Promise<Webinar>;
  updateWebinar(id: string, webinar: InsertWebinar): Promise<Webinar | null>;
  deleteWebinar(id: string): Promise<boolean>;
  updateWebinarParticipantCount(id: string, count: number): Promise<boolean>;

  // Webinar attendee methods
  createWebinarAttendee(attendee: InsertWebinarAttendee): Promise<WebinarAttendee>;
  getWebinarAttendee(webinarId: string, userId: string): Promise<WebinarAttendee | undefined>;
  getStudentWebinars(userId: string): Promise<Webinar[]>;

  // Testimonial methods
  getPublishedTestimonials(): Promise<TestimonialWithStudent[]>;
  createTestimonial(testimonial: InsertTestimonial): Promise<Testimonial>;

  // Enrollment methods
  getEnrollmentsWithDetails(): Promise<EnrollmentWithDetails[]>;
  createEnrollment(enrollment: InsertEnrollment): Promise<Enrollment>;
  getEnrollmentByStudentAndCourse(studentId: string, courseId: string): Promise<Enrollment | undefined>;
  getStudentEnrollments(studentId: string): Promise<Course[]>;

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
  getAllConsultations(): Promise<ConsultationWithDetails[]>;
  createConsultation(consultation: InsertConsultation): Promise<Consultation>;
  updateConsultation(id: string, consultation: Partial<InsertConsultation>): Promise<Consultation | null>;
  deleteConsultation(id: string): Promise<boolean>;
  getConsultation(id: string): Promise<Consultation | null>;
  getExpert(id: string): Promise<Expert | null>;

  // Ebook methods
  getEbooks(): Promise<Ebook[]>;
  getEbook(id: string): Promise<Ebook | undefined>;
  getEbooksByAuthor(authorId: string): Promise<Ebook[]>;
  getEbooksByCategory(category: string): Promise<Ebook[]>;
  createEbook(ebook: InsertEbook): Promise<Ebook>;
  updateEbook(id: string, ebook: Partial<InsertEbook>): Promise<Ebook | null>;
  deleteEbook(id: string): Promise<boolean>;
  
  // User eBook download methods
  getUserEbookDownloads(userId: string): Promise<UserEbookDownload[]>;
  recordEbookDownload(userId: string, ebookId: string): Promise<UserEbookDownload>;
  hasUserDownloadedEbook(userId: string, ebookId: string): Promise<boolean>;

  // Transaction methods
  getUserTransactions(userId: string): Promise<Transaction[]>;

  // Legal Pages methods
  getLegalPages(): Promise<LegalPage[]>;
  getLegalPageBySlug(slug: string): Promise<LegalPage | undefined>;
  updateLegalPage(id: string, updates: Partial<LegalPage>): Promise<LegalPage | undefined>;

  // Instructor Application methods
  getInstructorApplications(): Promise<InstructorApplication[]>;
  getInstructorApplication(id: string): Promise<InstructorApplication | undefined>;
  createInstructorApplication(application: InsertInstructorApplication): Promise<InstructorApplication>;
  updateInstructorApplicationStatus(id: string, status: string, reviewerId?: string, notes?: string): Promise<InstructorApplication | undefined>;
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

  async searchStudentsByName(searchTerm: string): Promise<User[]> {
    const students = await db
      .select()
      .from(users)
      .where(
        or(
          ilike(users.firstName, `%${searchTerm}%`),
          ilike(users.lastName, `%${searchTerm}%`),
          ilike(users.username, `%${searchTerm}%`),
          ilike(users.email, `%${searchTerm}%`)
        )
      )
      .limit(10);
    
    return students.filter(user => user.role === 'student');
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
        isDraft: true,
        lastUpdated: new Date(),
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
    // First get basic sessions
    const sessions = await db.select().from(webinars).orderBy(desc(webinars.scheduledAt));
    
    // Then fetch expert data for each session if expertId exists
    const sessionsWithExperts = await Promise.all(
      sessions.map(async (session) => {
        let expert = undefined;
        if (session.expertId) {
          const [expertData] = await db.select().from(experts).where(eq(experts.id, session.expertId));
          if (expertData) {
            expert = {
              id: expertData.id,
              name: expertData.name,
              avatar: expertData.avatar,
              specialization: expertData.specialization,
              rating: expertData.rating,
              isActive: expertData.isActive,
            };
          }
        }
        return {
          ...session,
          expert
        };
      })
    );
    
    return sessionsWithExperts;
  }

  async getLiveSessionById(id: string): Promise<LiveSession | undefined> {
    const [session] = await db.select().from(webinars).where(eq(webinars.id, id));
    return session || undefined;
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

  async getLiveSession(id: string): Promise<Webinar | undefined> {
    const [session] = await db.select().from(webinars).where(eq(webinars.id, id));
    return session || undefined;
  }

  async updateWebinarParticipantCount(id: string, count: number): Promise<boolean> {
    const result = await db
      .update(webinars)
      .set({ currentParticipants: count })
      .where(eq(webinars.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Webinar attendee methods
  async createWebinarAttendee(attendee: InsertWebinarAttendee): Promise<WebinarAttendee> {
    const [newAttendee] = await db
      .insert(webinarAttendees)
      .values(attendee)
      .returning();
    return newAttendee;
  }

  async getWebinarAttendee(webinarId: string, userId: string): Promise<WebinarAttendee | undefined> {
    const [attendee] = await db
      .select()
      .from(webinarAttendees)
      .where(
        and(
          eq(webinarAttendees.webinarId, webinarId),
          eq(webinarAttendees.participantId, userId)
        )
      );
    return attendee || undefined;
  }

  async getWebinarAttendees(webinarId: string): Promise<WebinarAttendee[]> {
    const attendees = await db
      .select()
      .from(webinarAttendees)
      .where(eq(webinarAttendees.webinarId, webinarId));
    return attendees;
  }

  async getStudentWebinars(userId: string): Promise<Webinar[]> {
    const result = await db
      .select({ webinar: webinars })
      .from(webinarAttendees)
      .innerJoin(webinars, eq(webinarAttendees.webinarId, webinars.id))
      .where(eq(webinarAttendees.participantId, userId))
      .orderBy(desc(webinars.scheduledAt));
    
    return result.map(row => row.webinar);
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

  async getEnrollmentByStudentAndCourse(studentId: string, courseId: string): Promise<Enrollment | undefined> {
    const [enrollment] = await db
      .select()
      .from(enrollments)
      .where(and(
        eq(enrollments.studentId, studentId),
        eq(enrollments.courseId, courseId)
      ));
    return enrollment;
  }

  async getStudentEnrollments(studentId: string): Promise<Course[]> {
    const result = await db
      .select({
        course: courses,
      })
      .from(enrollments)
      .innerJoin(courses, eq(enrollments.courseId, courses.id))
      .where(eq(enrollments.studentId, studentId))
      .orderBy(desc(enrollments.enrolledAt));

    return result.map(row => row.course);
  }

  // Student management methods
  async getAllStudentsWithStats(): Promise<any[]> {
    const allUsers = await db.select().from(users).where(eq(users.role, "student"));
    
    const studentsWithStats = await Promise.all(
      allUsers.map(async (user) => {
        // Get enrollment count and progress
        const userEnrollments = await db
          .select()
          .from(enrollments)
          .where(eq(enrollments.studentId, user.id));

        const completedCourses = userEnrollments.filter(e => e.completed).length;
        const totalProgress = userEnrollments.length > 0 
          ? Math.round(userEnrollments.reduce((sum, e) => sum + (e.progress || 0), 0) / userEnrollments.length)
          : 0;

        // Get webinar attendee count
        const webinarAttendeeCount = await db
          .select()
          .from(webinarAttendees)
          .where(eq(webinarAttendees.participantId, user.id));

        // Get consultation count
        const consultationCount = await db
          .select()
          .from(consultations)
          .where(eq(consultations.studentId, user.id));

        // Get ebook download count
        const ebookDownloadCount = await db
          .select()
          .from(userEbookDownloads)
          .where(eq(userEbookDownloads.userId, user.id));

        return {
          ...user,
          enrollmentCount: userEnrollments.length,
          completedCourses,
          totalProgress,
          webinarAttendeeCount: webinarAttendeeCount.length,
          consultationCount: consultationCount.length,
          ebookDownloadCount: ebookDownloadCount.length,
        };
      })
    );

    return studentsWithStats;
  }

  async getStudentDetailById(studentId: string): Promise<any | null> {
    const student = await db.select().from(users).where(eq(users.id, studentId)).limit(1);
    if (student.length === 0) return null;

    const user = student[0];

    // Get enrollments with course details
    const enrollmentResults = await db
      .select({
        enrollment: enrollments,
        course: courses,
      })
      .from(enrollments)
      .innerJoin(courses, eq(enrollments.courseId, courses.id))
      .where(eq(enrollments.studentId, studentId))
      .orderBy(desc(enrollments.enrolledAt));

    const enrollments_data = enrollmentResults.map(row => ({
      ...row.enrollment,
      course: row.course,
    }));

    // Get webinar attendees with webinar details
    const webinarResults = await db
      .select({
        attendee: webinarAttendees,
        webinar: webinars,
      })
      .from(webinarAttendees)
      .innerJoin(webinars, eq(webinarAttendees.webinarId, webinars.id))
      .where(eq(webinarAttendees.participantId, studentId))
      .orderBy(desc(webinars.scheduledAt));

    const webinarAttendees_data = webinarResults.map(row => ({
      ...row.attendee,
      webinar: row.webinar,
    }));

    // Get consultations with expert details
    const consultationResults = await db
      .select({
        consultation: consultations,
        expert: experts,
      })
      .from(consultations)
      .innerJoin(experts, eq(consultations.expertId, experts.id))
      .where(eq(consultations.studentId, studentId))
      .orderBy(desc(consultations.scheduledAt));

    const consultations_data = consultationResults.map(row => ({
      ...row.consultation,
      expert: row.expert,
    }));

    // Get ebook downloads with ebook details
    const ebookResults = await db
      .select({
        download: userEbookDownloads,
        ebook: ebooks,
      })
      .from(userEbookDownloads)
      .innerJoin(ebooks, eq(userEbookDownloads.ebookId, ebooks.id))
      .where(eq(userEbookDownloads.userId, studentId))
      .orderBy(desc(userEbookDownloads.downloadedAt));

    const ebookDownloads_data = ebookResults.map(row => ({
      ...row.download,
      ebook: row.ebook,
    }));

    // Calculate stats
    const completedCourses = enrollments_data.filter(e => e.completed).length;
    const avgProgress = enrollments_data.length > 0 
      ? Math.round(enrollments_data.reduce((sum, e) => sum + (e.progress || 0), 0) / enrollments_data.length)
      : 0;

    return {
      student: user,
      enrollments: enrollments_data,
      webinarAttendees: webinarAttendees_data,
      consultations: consultations_data,
      ebookDownloads: ebookDownloads_data,
      stats: {
        totalEnrollments: enrollments_data.length,
        completedCourses,
        avgProgress,
        totalWebinars: webinarAttendees_data.length,
        totalConsultations: consultations_data.length,
        totalDownloads: ebookDownloads_data.length,
      },
    };
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
    
    // Calculate sessions count and average rating for each expert
    const expertsWithSessionCount = await Promise.all(
      expertList.map(async (expert) => {
        const sessions = await db.select().from(webinars).where(eq(webinars.expertId, expert.id));
        
        // Calculate average rating from both consultation-based and direct reviews
        const averageRating = await this.calculateExpertAverageRating(expert.id);
        
        return {
          ...expert,
          totalSessions: sessions.length,
          rating: averageRating > 0 ? averageRating.toFixed(1) : "0.0"
        };
      })
    );
    
    return expertsWithSessionCount;
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

  async getFeaturedExperts(): Promise<Expert[]> {
    const featuredExperts = await db
      .select()
      .from(experts)
      .where(and(eq(experts.isFeatured, true), eq(experts.isActive, true)))
      .limit(2)
      .orderBy(desc(experts.createdAt));
    
    // Calculate additional stats for each expert
    const expertsWithStats = await Promise.all(
      featuredExperts.map(async (expert) => {
        const sessions = await db.select().from(webinars).where(eq(webinars.expertId, expert.id));
        const expertCourses = await db.select().from(courses).where(eq(courses.expertId, expert.id));
        const expertEbooks = await db.select().from(ebooks).where(eq(ebooks.authorId, expert.id));
        
        // Calculate average rating from both consultation-based and direct reviews
        const averageRating = await this.calculateExpertAverageRating(expert.id);
        
        return {
          ...expert,
          totalSessions: sessions.length,
          totalCourses: expertCourses.length,
          totalEbooks: expertEbooks.length,
          rating: averageRating > 0 ? averageRating.toFixed(1) : "0.0"
        };
      })
    );
    
    return expertsWithStats;
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

  async getExpertReviews(expertId: string): Promise<any[]> {
    const reviews = await db
      .select({
        consultation: consultations,
        student: users
      })
      .from(consultations)
      .innerJoin(users, eq(consultations.studentId, users.id))
      .where(
        and(
          eq(consultations.expertId, expertId),
          eq(consultations.status, "completed"),
          isNotNull(consultations.rating),
          isNotNull(consultations.feedback)
        )
      )
      .orderBy(desc(consultations.createdAt));

    return reviews.map(row => ({
      id: row.consultation.id,
      rating: row.consultation.rating,
      feedback: row.consultation.feedback,
      createdAt: row.consultation.createdAt,
      student: {
        id: row.student.id,
        firstName: row.student.firstName,
        lastName: row.student.lastName,
        avatar: row.student.avatar
      }
    }));
  }

  async getAllConsultations(): Promise<ConsultationWithDetails[]> {
    const consultationList = await db
      .select()
      .from(consultations)
      .orderBy(desc(consultations.createdAt));
    
    // Fetch expert and student details for each consultation
    const consultationsWithDetails: ConsultationWithDetails[] = await Promise.all(
      consultationList.map(async (consultation) => {
        const [expert, student] = await Promise.all([
          consultation.expertId ? this.getExpert(consultation.expertId) : null,
          consultation.studentId ? this.getUser(consultation.studentId) : null
        ]);
        
        return {
          ...consultation,
          expert,
          student
        };
      })
    );
    
    return consultationsWithDetails;
  }

  async createConsultation(insertConsultation: InsertConsultation): Promise<Consultation> {
    const [consultation] = await db
      .insert(consultations)
      .values(insertConsultation)
      .returning();
    return consultation;
  }

  async updateConsultation(id: string, consultationData: Partial<InsertConsultation>): Promise<Consultation | null> {
    // Fix timestamp format if scheduledAt is provided
    const updateData = { ...consultationData };
    if (updateData.scheduledAt && typeof updateData.scheduledAt === 'string') {
      updateData.scheduledAt = new Date(updateData.scheduledAt);
    }
    
    const [consultation] = await db
      .update(consultations)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(consultations.id, id))
      .returning();
    return consultation || null;
  }

  async deleteConsultation(id: string): Promise<boolean> {
    const result = await db.delete(consultations).where(eq(consultations.id, id));
    return result.rowCount! > 0;
  }

  async getConsultation(id: string): Promise<Consultation | null> {
    const [consultation] = await db
      .select()
      .from(consultations)
      .where(eq(consultations.id, id));
    return consultation || null;
  }

  async getConsultation(id: string): Promise<Consultation | null> {
    const [consultation] = await db
      .select()
      .from(consultations)
      .where(eq(consultations.id, id));
    return consultation || null;
  }

  async getExpert(id: string): Promise<Expert | null> {
    const [expert] = await db
      .select()
      .from(experts)
      .where(eq(experts.id, id));
    
    if (!expert) return null;
    
    // Calculate sessions count for this expert
    const sessions = await db.select().from(webinars).where(eq(webinars.expertId, expert.id));
    
    // Calculate average rating from both consultation-based and direct reviews
    const averageRating = await this.calculateExpertAverageRating(expert.id);
    
    return {
      ...expert,
      totalSessions: sessions.length,
      rating: averageRating > 0 ? averageRating.toFixed(2) : "0.00"
    };
  }

  // Ebook methods implementation
  async getEbooks(): Promise<Ebook[]> {
    try {
      // Use raw SQL query to avoid Drizzle schema issues
      const query = `
        SELECT 
          e.*,
          ex.name as author_name,
          ex.avatar as author_avatar,
          ex.specialization as author_specialization,
          ex.rating as author_rating
        FROM ebooks e
        LEFT JOIN experts ex ON e.author_id = ex.id
        WHERE e.is_active = true
        ORDER BY e.created_at DESC
      `;
      
      const result = await pool.query(query);
      
      return result.rows.map((row: any) => ({
        id: row.id,
        title: row.title,
        description: row.description,
        shortDescription: row.short_description,
        indexContent: row.index_content,
        summary: row.summary,
        authorId: row.author_id,
        category: row.category,
        tags: row.tags || [],
        coverImage: row.cover_image,
        fileUrl: row.file_url,
        fileSize: row.file_size,
        pageCount: row.page_count,
        language: row.language,
        price: row.price,
        rating: row.rating,
        downloadCount: row.download_count,
        isActive: row.is_active,
        isFeatured: row.is_featured,
        publishedAt: row.published_at,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        author: row.author_name ? {
          id: row.author_id,
          name: row.author_name,
          avatar: row.author_avatar,
          specialization: row.author_specialization,
          rating: row.author_rating,
        } : undefined
      }));
    } catch (error) {
      console.error("Error in getEbooks:", error);
      return [];
    }
  }

  async getEbook(id: string): Promise<Ebook | undefined> {
    try {
      const query = `
        SELECT 
          e.*,
          ex.name as author_name,
          ex.avatar as author_avatar,
          ex.specialization as author_specialization,
          ex.rating as author_rating
        FROM ebooks e
        LEFT JOIN experts ex ON e.author_id = ex.id
        WHERE e.id = $1
      `;
      
      const result = await pool.query(query, [id]);
      
      if (result.rows.length === 0) {
        return undefined;
      }
      
      const row = result.rows[0];
      return {
        id: row.id,
        title: row.title,
        description: row.description,
        shortDescription: row.short_description,
        indexContent: row.index_content,
        summary: row.summary,
        authorId: row.author_id,
        category: row.category,
        tags: row.tags || [],
        coverImage: row.cover_image,
        fileUrl: row.file_url,
        fileSize: row.file_size,
        pageCount: row.page_count,
        language: row.language,
        price: row.price,
        rating: row.rating,
        downloadCount: row.download_count,
        isActive: row.is_active,
        isFeatured: row.is_featured,
        publishedAt: row.published_at,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        author: row.author_name ? {
          id: row.author_id,
          name: row.author_name,
          avatar: row.author_avatar,
          specialization: row.author_specialization,
          rating: row.author_rating,
        } : undefined
      };
    } catch (error) {
      console.error("Error in getEbook:", error);
      return undefined;
    }
  }

  async getEbooksByAuthor(authorId: string): Promise<Ebook[]> {
    try {
      const query = `
        SELECT 
          e.*,
          ex.name as author_name,
          ex.avatar as author_avatar,
          ex.specialization as author_specialization,
          ex.rating as author_rating
        FROM ebooks e
        LEFT JOIN experts ex ON e.author_id = ex.id
        WHERE e.author_id = $1 AND e.is_active = true
        ORDER BY e.created_at DESC
      `;
      
      const result = await pool.query(query, [authorId]);
      
      return result.rows.map((row: any) => ({
        id: row.id,
        title: row.title,
        description: row.description,
        shortDescription: row.short_description,
        indexContent: row.index_content,
        summary: row.summary,
        authorId: row.author_id,
        category: row.category,
        tags: row.tags || [],
        coverImage: row.cover_image,
        fileUrl: row.file_url,
        fileSize: row.file_size,
        pageCount: row.page_count,
        language: row.language,
        price: row.price,
        rating: row.rating,
        downloadCount: row.download_count,
        isActive: row.is_active,
        isFeatured: row.is_featured,
        publishedAt: row.published_at,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        author: row.author_name ? {
          id: row.author_id,
          name: row.author_name,
          avatar: row.author_avatar,
          specialization: row.author_specialization,
          rating: row.author_rating,
        } : undefined
      }));
    } catch (error) {
      console.error("Error in getEbooksByAuthor:", error);
      return [];
    }
  }

  async getEbooksByCategory(category: string): Promise<Ebook[]> {
    try {
      const query = `
        SELECT 
          e.*,
          ex.name as author_name,
          ex.avatar as author_avatar,
          ex.specialization as author_specialization,
          ex.rating as author_rating
        FROM ebooks e
        LEFT JOIN experts ex ON e.author_id = ex.id
        WHERE e.category = $1 AND e.is_active = true
        ORDER BY e.created_at DESC
      `;
      
      const result = await pool.query(query, [category]);
      
      return result.rows.map((row: any) => ({
        id: row.id,
        title: row.title,
        description: row.description,
        shortDescription: row.short_description,
        indexContent: row.index_content,
        summary: row.summary,
        authorId: row.author_id,
        category: row.category,
        tags: row.tags || [],
        coverImage: row.cover_image,
        fileUrl: row.file_url,
        fileSize: row.file_size,
        pageCount: row.page_count,
        language: row.language,
        price: row.price,
        rating: row.rating,
        downloadCount: row.download_count,
        isActive: row.is_active,
        isFeatured: row.is_featured,
        publishedAt: row.published_at,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        author: row.author_name ? {
          id: row.author_id,
          name: row.author_name,
          avatar: row.author_avatar,
          specialization: row.author_specialization,
          rating: row.author_rating,
        } : undefined
      }));
    } catch (error) {
      console.error("Error in getEbooksByCategory:", error);
      return [];
    }
  }

  async createEbook(ebook: InsertEbook): Promise<Ebook> {
    try {
      console.log("Creating ebook with data:", ebook);
      // Generate UUID for the ebook
      const ebookId = `ebook-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const query = `
        INSERT INTO ebooks (
          id, title, short_description, index_content, summary, author_id, category, 
          tags, cover_image, file_url, file_size, page_count, 
          language, price, is_active, is_featured, published_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17
        ) RETURNING *
      `;
      
      const result = await pool.query(query, [
        ebookId,
        ebook.title,
        ebook.shortDescription,
        ebook.indexContent,
        ebook.summary,
        ebook.authorId,
        ebook.category,
        ebook.tags,
        ebook.coverImage,
        ebook.fileUrl,
        ebook.fileSize,
        ebook.pageCount,
        ebook.language,
        ebook.price,
        ebook.isActive,
        ebook.isFeatured,
        ebook.publishedAt
      ]);
      
      const row = result.rows[0];
      console.log("Database row returned:", row);
      return {
        id: row.id,
        title: row.title,
        shortDescription: row.short_description,
        indexContent: row.index_content,
        summary: row.summary,
        authorId: row.author_id,
        category: row.category,
        tags: row.tags || [],
        coverImage: row.cover_image,
        fileUrl: row.file_url,
        fileSize: row.file_size,
        pageCount: row.page_count,
        language: row.language,
        price: row.price,
        rating: row.rating || 0,
        downloadCount: row.download_count || 0,
        isActive: row.is_active,
        isFeatured: row.is_featured,
        publishedAt: row.published_at,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      };
    } catch (error) {
      console.error("Error in createEbook:", error);
      throw error;
    }
  }

  async updateEbook(id: string, ebook: Partial<InsertEbook>): Promise<Ebook | null> {
    try {
      const fields = [];
      const values = [];
      let index = 1;

      if (ebook.title !== undefined) {
        fields.push(`title = $${index++}`);
        values.push(ebook.title);
      }
      if (ebook.indexContent !== undefined) {
        fields.push(`index_content = $${index++}`);
        values.push(ebook.indexContent);
      }
      if (ebook.summary !== undefined) {
        fields.push(`summary = $${index++}`);
        values.push(ebook.summary);
      }
      if (ebook.shortDescription !== undefined) {
        fields.push(`short_description = $${index++}`);
        values.push(ebook.shortDescription);
      }
      if (ebook.category !== undefined) {
        fields.push(`category = $${index++}`);
        values.push(ebook.category);
      }
      if (ebook.tags !== undefined) {
        fields.push(`tags = $${index++}`);
        values.push(ebook.tags);
      }
      if (ebook.coverImage !== undefined) {
        fields.push(`cover_image = $${index++}`);
        values.push(ebook.coverImage);
      }
      if (ebook.fileUrl !== undefined) {
        fields.push(`file_url = $${index++}`);
        values.push(ebook.fileUrl);
      }
      if (ebook.fileSize !== undefined) {
        fields.push(`file_size = $${index++}`);
        values.push(ebook.fileSize);
      }
      if (ebook.pageCount !== undefined) {
        fields.push(`page_count = $${index++}`);
        values.push(ebook.pageCount);
      }
      if (ebook.language !== undefined) {
        fields.push(`language = $${index++}`);
        values.push(ebook.language);
      }
      if (ebook.price !== undefined) {
        fields.push(`price = $${index++}`);
        values.push(ebook.price);
      }
      if (ebook.isActive !== undefined) {
        fields.push(`is_active = $${index++}`);
        values.push(ebook.isActive);
      }
      if (ebook.isFeatured !== undefined) {
        fields.push(`is_featured = $${index++}`);
        values.push(ebook.isFeatured);
      }
      if (ebook.publishedAt !== undefined) {
        fields.push(`published_at = $${index++}`);
        values.push(ebook.publishedAt);
      }

      if (fields.length === 0) {
        return null;
      }

      fields.push(`updated_at = NOW()`);
      values.push(id);

      const query = `
        UPDATE ebooks 
        SET ${fields.join(', ')}
        WHERE id = $${index}
        RETURNING *
      `;

      const result = await pool.query(query, values);
      
      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];
      return {
        id: row.id,
        title: row.title,
        shortDescription: row.short_description,
        indexContent: row.index_content,
        summary: row.summary,
        authorId: row.author_id,
        category: row.category,
        tags: row.tags || [],
        coverImage: row.cover_image,
        fileUrl: row.file_url,
        fileSize: row.file_size,
        pageCount: row.page_count,
        language: row.language,
        price: row.price,
        rating: row.rating || 0,
        downloadCount: row.download_count || 0,
        isActive: row.is_active,
        isFeatured: row.is_featured,
        publishedAt: row.published_at,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      };
    } catch (error) {
      console.error(`Error updating ebook ${id}:`, error);
      return null;
    }
  }

  async deleteEbook(id: string): Promise<boolean> {
    try {
      const query = `DELETE FROM ebooks WHERE id = $1`;
      const result = await pool.query(query, [id]);
      return result.rowCount > 0;
    } catch (error) {
      console.error(`Error deleting ebook ${id}:`, error);
      return false;
    }
  }

  // User eBook download methods
  async getUserEbookDownloads(userId: string): Promise<UserEbookDownload[]> {
    try {
      const query = `SELECT * FROM user_ebook_downloads WHERE user_id = $1 ORDER BY downloaded_at DESC`;
      const result = await pool.query(query, [userId]);
      return result.rows.map((row: any) => ({
        id: row.id,
        userId: row.user_id,
        ebookId: row.ebook_id,
        downloadedAt: row.downloaded_at
      }));
    } catch (error) {
      console.error(`Error getting user ebook downloads for user ${userId}:`, error);
      return [];
    }
  }

  async recordEbookDownload(userId: string, ebookId: string): Promise<UserEbookDownload> {
    try {
      // Check if already downloaded
      const existing = await this.hasUserDownloadedEbook(userId, ebookId);
      if (existing) {
        // Return existing record
        const query = `SELECT * FROM user_ebook_downloads WHERE user_id = $1 AND ebook_id = $2`;
        const result = await pool.query(query, [userId, ebookId]);
        const row = result.rows[0];
        return {
          id: row.id,
          userId: row.user_id,
          ebookId: row.ebook_id,
          downloadedAt: row.downloaded_at
        };
      }

      // Create new download record
      const downloadId = `download-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const query = `
        INSERT INTO user_ebook_downloads (id, user_id, ebook_id) 
        VALUES ($1, $2, $3) 
        RETURNING *
      `;
      const result = await pool.query(query, [downloadId, userId, ebookId]);
      
      // Update download count in ebooks table
      await pool.query(`UPDATE ebooks SET download_count = download_count + 1 WHERE id = $1`, [ebookId]);
      
      const row = result.rows[0];
      return {
        id: row.id,
        userId: row.user_id,
        ebookId: row.ebook_id,
        downloadedAt: row.downloaded_at
      };
    } catch (error) {
      console.error(`Error recording ebook download:`, error);
      throw error;
    }
  }

  async hasUserDownloadedEbook(userId: string, ebookId: string): Promise<boolean> {
    try {
      const query = `SELECT 1 FROM user_ebook_downloads WHERE user_id = $1 AND ebook_id = $2 LIMIT 1`;
      const result = await pool.query(query, [userId, ebookId]);
      return result.rows.length > 0;
    } catch (error) {
      console.error(`Error checking if user downloaded ebook:`, error);
      return false;
    }
  }

  // Direct Reviews methods
  async createDirectReview(review: InsertDirectReview): Promise<DirectReview> {
    try {
      const reviewId = `review-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const query = `
        INSERT INTO direct_reviews (id, expert_id, student_id, rating, feedback, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
        RETURNING *
      `;
      const result = await pool.query(query, [
        reviewId,
        review.expertId,
        review.studentId,
        review.rating,
        review.feedback
      ]);
      const row = result.rows[0];
      return {
        id: row.id,
        expertId: row.expert_id,
        studentId: row.student_id,
        rating: row.rating,
        feedback: row.feedback,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      };
    } catch (error) {
      console.error("Error creating direct review:", error);
      throw error;
    }
  }

  async getUserReviewForExpert(userId: string, expertId: string): Promise<DirectReview | null> {
    try {
      const query = `
        SELECT * FROM direct_reviews 
        WHERE student_id = $1 AND expert_id = $2
      `;
      const result = await pool.query(query, [userId, expertId]);
      if (result.rows.length === 0) return null;
      
      const row = result.rows[0];
      return {
        id: row.id,
        expertId: row.expert_id,
        studentId: row.student_id,
        rating: row.rating,
        feedback: row.feedback,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      };
    } catch (error) {
      console.error("Error getting user review for expert:", error);
      return null;
    }
  }

  async updateDirectReview(reviewId: string, userId: string, updates: { rating: number; feedback: string }): Promise<boolean> {
    try {
      const query = `
        UPDATE direct_reviews 
        SET rating = $1, feedback = $2, updated_at = NOW()
        WHERE id = $3 AND student_id = $4
      `;
      const result = await pool.query(query, [
        updates.rating,
        updates.feedback,
        reviewId,
        userId
      ]);
      return result.rowCount > 0;
    } catch (error) {
      console.error("Error updating direct review:", error);
      return false;
    }
  }

  async getDirectReviewsForExpert(expertId: string): Promise<DirectReview[]> {
    try {
      const query = `
        SELECT dr.*, u.first_name, u.last_name, u.avatar
        FROM direct_reviews dr
        LEFT JOIN users u ON dr.student_id = u.id
        WHERE dr.expert_id = $1
        ORDER BY dr.created_at DESC
      `;
      const result = await pool.query(query, [expertId]);
      
      return result.rows.map(row => ({
        id: row.id,
        expertId: row.expert_id,
        studentId: row.student_id,
        rating: row.rating,
        feedback: row.feedback,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        student: {
          id: row.student_id,
          firstName: row.first_name,
          lastName: row.last_name,
          avatar: row.avatar
        }
      }));
    } catch (error) {
      console.error("Error getting direct reviews for expert:", error);
      return [];
    }
  }

  async calculateExpertAverageRating(expertId: string): Promise<number> {
    try {
      // Get consultation-based ratings
      const consultationRatings = await db
        .select({ rating: consultations.rating })
        .from(consultations)
        .where(
          and(
            eq(consultations.expertId, expertId),
            eq(consultations.status, "completed"),
            isNotNull(consultations.rating)
          )
        );

      // Get direct review ratings
      const directReviews = await this.getDirectReviewsForExpert(expertId);
      const directRatings = directReviews.map(review => ({ rating: review.rating }));

      // Combine all ratings
      const allRatings = [
        ...consultationRatings,
        ...directRatings
      ].filter(r => r.rating !== null && r.rating !== undefined);

      if (allRatings.length === 0) {
        return 0;
      }

      const sum = allRatings.reduce((total, r) => total + (r.rating || 0), 0);
      return sum / allRatings.length;
    } catch (error) {
      console.error("Error calculating expert average rating:", error);
      return 0;
    }
  }

  // Course Review Methods
  async createCourseReview(courseId: string, studentId: string, rating: number, feedback: string): Promise<CourseReview> {
    try {
      const query = `
        INSERT INTO course_reviews (course_id, student_id, rating, feedback, created_at, updated_at)
        VALUES ($1, $2, $3, $4, NOW(), NOW())
        RETURNING *
      `;
      const result = await pool.query(query, [courseId, studentId, rating, feedback]);
      const row = result.rows[0];
      
      return {
        id: row.id,
        courseId: row.course_id,
        studentId: row.student_id,
        rating: row.rating,
        feedback: row.feedback,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      };
    } catch (error) {
      console.error("Error creating course review:", error);
      throw error;
    }
  }

  async getCourseReviews(courseId: string): Promise<CourseReview[]> {
    try {
      const query = `
        SELECT cr.*, u.first_name, u.last_name, u.avatar
        FROM course_reviews cr
        LEFT JOIN users u ON cr.student_id = u.id
        WHERE cr.course_id = $1
        ORDER BY cr.created_at DESC
      `;
      const result = await pool.query(query, [courseId]);
      
      return result.rows.map(row => ({
        id: row.id,
        courseId: row.course_id,
        studentId: row.student_id,
        rating: row.rating,
        feedback: row.feedback,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        student: {
          id: row.student_id,
          firstName: row.first_name,
          lastName: row.last_name,
          avatar: row.avatar
        }
      }));
    } catch (error) {
      console.error("Error getting course reviews:", error);
      return [];
    }
  }

  async getUserCourseReview(userId: string, courseId: string): Promise<CourseReview | null> {
    try {
      const query = `
        SELECT * FROM course_reviews 
        WHERE student_id = $1 AND course_id = $2
      `;
      const result = await pool.query(query, [userId, courseId]);
      if (result.rows.length === 0) return null;
      
      const row = result.rows[0];
      return {
        id: row.id,
        courseId: row.course_id,
        studentId: row.student_id,
        rating: row.rating,
        feedback: row.feedback,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      };
    } catch (error) {
      console.error("Error getting user course review:", error);
      return null;
    }
  }

  async updateCourseReview(reviewId: string, userId: string, updates: { rating: number; feedback: string }): Promise<boolean> {
    try {
      const query = `
        UPDATE course_reviews 
        SET rating = $1, feedback = $2, updated_at = NOW()
        WHERE id = $3 AND student_id = $4
      `;
      const result = await pool.query(query, [
        updates.rating,
        updates.feedback,
        reviewId,
        userId
      ]);
      return result.rowCount > 0;
    } catch (error) {
      console.error("Error updating course review:", error);
      return false;
    }
  }

  async calculateCourseAverageRating(courseId: string): Promise<number> {
    try {
      const reviews = await this.getCourseReviews(courseId);
      
      if (reviews.length === 0) {
        return 0;
      }

      const sum = reviews.reduce((total, review) => total + review.rating, 0);
      return sum / reviews.length;
    } catch (error) {
      console.error("Error calculating course average rating:", error);
      return 0;
    }
  }

  async getUserTransactions(userId: string): Promise<Transaction[]> {
    try {
      const transactions: Transaction[] = [];

      // Get course enrollments
      const courseEnrollments = await db
        .select({
          id: enrollments.id,
          enrolledAt: enrollments.enrolledAt,
          courseId: enrollments.courseId,
          courseTitle: courses.title,
          coursePrice: courses.price,
          progress: enrollments.progress,
          completed: enrollments.completed,
        })
        .from(enrollments)
        .leftJoin(courses, eq(enrollments.courseId, courses.id))
        .where(eq(enrollments.studentId, userId))
        .orderBy(desc(enrollments.enrolledAt));

      courseEnrollments.forEach((enrollment) => {
        transactions.push({
          id: enrollment.id,
          type: 'course_enrollment',
          title: enrollment.courseTitle || 'Course',
          description: `Enrolled in course • ${enrollment.progress}% completed`,
          amount: enrollment.coursePrice || '₹0',
          status: enrollment.completed ? 'completed' : 'active',
          date: enrollment.enrolledAt || new Date(),
          itemId: enrollment.courseId || undefined,
        });
      });

      // Get consultations
      const userConsultations = await db
        .select({
          id: consultations.id,
          title: consultations.title,
          scheduledAt: consultations.scheduledAt,
          duration: consultations.duration,
          amount: consultations.amount,
          status: consultations.status,
          expertId: consultations.expertId,
          expertName: experts.name,
        })
        .from(consultations)
        .leftJoin(experts, eq(consultations.expertId, experts.id))
        .where(eq(consultations.studentId, userId))
        .orderBy(desc(consultations.scheduledAt));

      userConsultations.forEach((consultation) => {
        transactions.push({
          id: consultation.id,
          type: 'consultation',
          title: consultation.title,
          description: `Consultation with ${consultation.expertName} • ${consultation.duration} minutes`,
          amount: `₹${consultation.amount}`,
          status: consultation.status,
          date: consultation.scheduledAt,
          itemId: consultation.expertId || undefined,
          expertName: consultation.expertName || undefined,
          duration: consultation.duration,
        });
      });

      // Get ebook downloads
      const ebookDownloads = await db
        .select({
          id: userEbookDownloads.id,
          downloadedAt: userEbookDownloads.downloadedAt,
          ebookId: userEbookDownloads.ebookId,
          ebookTitle: ebooks.title,
          ebookPrice: ebooks.price,
          authorName: experts.name,
        })
        .from(userEbookDownloads)
        .leftJoin(ebooks, eq(userEbookDownloads.ebookId, ebooks.id))
        .leftJoin(experts, eq(ebooks.authorId, experts.id))
        .where(eq(userEbookDownloads.userId, userId))
        .orderBy(desc(userEbookDownloads.downloadedAt));

      ebookDownloads.forEach((download) => {
        transactions.push({
          id: download.id,
          type: 'ebook_download',
          title: download.ebookTitle || 'Ebook',
          description: `Downloaded ebook by ${download.authorName}`,
          amount: download.ebookPrice || '₹0',
          status: 'completed',
          date: download.downloadedAt || new Date(),
          itemId: download.ebookId || undefined,
          expertName: download.authorName || undefined,
        });
      });

      // Get webinar attendances
      const webinarAttendances = await db
        .select({
          id: webinarAttendees.id,
          joinedAt: webinarAttendees.joinedAt,
          webinarId: webinarAttendees.webinarId,
          webinarTitle: webinars.title,
          webinarPrice: webinars.price,
          status: webinarAttendees.status,
          duration: webinarAttendees.totalDuration,
        })
        .from(webinarAttendees)
        .leftJoin(webinars, eq(webinarAttendees.webinarId, webinars.id))
        .where(eq(webinarAttendees.participantId, userId))
        .orderBy(desc(webinarAttendees.joinedAt));

      webinarAttendances.forEach((attendance) => {
        transactions.push({
          id: attendance.id,
          type: 'live_session',
          title: attendance.webinarTitle || 'Live Session',
          description: `Attended live session • ${attendance.duration || 0} minutes`,
          amount: attendance.webinarPrice || '₹0',
          status: attendance.status || 'completed',
          date: attendance.joinedAt || new Date(),
          itemId: attendance.webinarId || undefined,
          duration: attendance.duration || undefined,
        });
      });

      // Sort all transactions by date (newest first)
      transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      return transactions;
    } catch (error) {
      console.error("Error fetching user transactions:", error);
      return [];
    }
  }

  // Legal Pages methods
  async getLegalPages(): Promise<LegalPage[]> {
    try {
      const pages = await db.select().from(legalPages).orderBy(legalPages.slug);
      return pages;
    } catch (error) {
      console.error("Error fetching legal pages:", error);
      return [];
    }
  }

  async getLegalPageBySlug(slug: string): Promise<LegalPage | undefined> {
    try {
      const [page] = await db.select().from(legalPages).where(eq(legalPages.slug, slug));
      return page;
    } catch (error) {
      console.error("Error fetching legal page by slug:", error);
      return undefined;
    }
  }

  async updateLegalPage(id: string, updates: Partial<LegalPage>): Promise<LegalPage | undefined> {
    try {
      const [updatedPage] = await db
        .update(legalPages)
        .set({
          ...updates,
          lastUpdated: new Date()
        })
        .where(eq(legalPages.id, id))
        .returning();
      
      return updatedPage;
    } catch (error) {
      console.error("Error updating legal page:", error);
      return undefined;
    }
  }

  // Instructor Application methods
  async getInstructorApplications(): Promise<InstructorApplication[]> {
    try {
      const applications = await db.select().from(instructorApplications).orderBy(desc(instructorApplications.submittedAt));
      return applications;
    } catch (error) {
      console.error("Error fetching instructor applications:", error);
      return [];
    }
  }

  async getInstructorApplication(id: string): Promise<InstructorApplication | undefined> {
    try {
      const [application] = await db.select().from(instructorApplications).where(eq(instructorApplications.id, id));
      return application;
    } catch (error) {
      console.error("Error fetching instructor application:", error);
      return undefined;
    }
  }

  async createInstructorApplication(application: InsertInstructorApplication): Promise<InstructorApplication> {
    try {
      const [newApplication] = await db
        .insert(instructorApplications)
        .values(application)
        .returning();
      
      return newApplication;
    } catch (error) {
      console.error("Error creating instructor application:", error);
      throw error;
    }
  }

  async updateInstructorApplicationStatus(id: string, status: string, reviewerId?: string, notes?: string): Promise<InstructorApplication | undefined> {
    try {
      const [updatedApplication] = await db
        .update(instructorApplications)
        .set({
          status,
          reviewedBy: reviewerId,
          notes,
          reviewedAt: new Date()
        })
        .where(eq(instructorApplications.id, id))
        .returning();
      
      return updatedApplication;
    } catch (error) {
      console.error("Error updating instructor application status:", error);
      return undefined;
    }
  }

  // Contact Submission methods
  async getContactSubmissions(): Promise<ContactSubmission[]> {
    try {
      const submissions = await db.select().from(contactSubmissions).orderBy(desc(contactSubmissions.submittedAt));
      return submissions;
    } catch (error) {
      console.error("Error fetching contact submissions:", error);
      return [];
    }
  }

  async getContactSubmission(id: string): Promise<ContactSubmission | undefined> {
    try {
      const [submission] = await db.select().from(contactSubmissions).where(eq(contactSubmissions.id, id));
      return submission;
    } catch (error) {
      console.error("Error fetching contact submission:", error);
      return undefined;
    }
  }

  async createContactSubmission(submission: InsertContactSubmission): Promise<ContactSubmission> {
    try {
      const [newSubmission] = await db
        .insert(contactSubmissions)
        .values(submission)
        .returning();
      
      return newSubmission;
    } catch (error) {
      console.error("Error creating contact submission:", error);
      throw error;
    }
  }

  async updateContactSubmissionStatus(id: string, status: string, repliedBy?: string, notes?: string): Promise<ContactSubmission | undefined> {
    try {
      const [updatedSubmission] = await db
        .update(contactSubmissions)
        .set({
          status,
          repliedBy,
          notes,
          repliedAt: status === 'replied' ? new Date() : undefined
        })
        .where(eq(contactSubmissions.id, id))
        .returning();
      
      return updatedSubmission;
    } catch (error) {
      console.error("Error updating contact submission status:", error);
      return undefined;
    }
  }
}

export const storage = new DatabaseStorage();