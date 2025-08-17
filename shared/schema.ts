import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, decimal, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("student"), // student, instructor, admin
  firstName: text("first_name"),
  lastName: text("last_name"),
  phone: text("phone"), // WhatsApp number
  dateOfBirth: text("date_of_birth"),
  gender: text("gender"), // male, female, other
  address: text("address"),
  city: text("city"),
  state: text("state"),
  country: text("country").default("India"),
  occupation: text("occupation"),
  education: text("education"),
  experience: text("experience"), // beginner, intermediate, advanced
  avatar: text("avatar"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const courses = pgTable("courses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  shortDescription: text("short_description"),
  level: text("level").notNull(), // beginner, intermediate, advanced
  duration: text("duration").notNull(), // e.g., "12 weeks"
  price: varchar("price").notNull(), // Store as string for display (e.g., "₹4,999")
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0"),
  studentsCount: integer("students_count").default(0),
  thumbnail: text("thumbnail"),
  category: text("category").notNull(), // AI Software Development, AI Video Creation, etc.
  
  // Course Type and Format
  courseType: text("course_type").notNull().default("recorded"), // recorded, live, hybrid
  format: text("format").default("video"), // video, text, mixed, interactive
  
  // Detailed Course Information
  whatYouWillLearn: text("what_you_will_learn").array().default([]), // Learning outcomes
  courseRequirements: text("course_requirements"), // Prerequisites
  targetAudience: text("target_audience"), // Who this course is for
  courseCurriculum: jsonb("course_curriculum").default(sql`'[]'::jsonb`), // Detailed curriculum structure
  
  // Course Content
  totalLectures: integer("total_lectures").default(0),
  totalDuration: text("total_duration"), // e.g., "25 hours on-demand video"
  resources: text("resources").array().default([]), // Downloadable resources
  assignments: integer("assignments").default(0),
  quizzes: integer("quizzes").default(0),
  projects: integer("projects").default(0),
  
  // Access and Completion
  lifetime_access: boolean("lifetime_access").default(true),
  mobileAccess: boolean("mobile_access").default(true),
  certificateOfCompletion: boolean("certificate_of_completion").default(true),
  downloadableContent: boolean("downloadable_content").default(false),
  
  // Live Course Specific
  liveSchedule: jsonb("live_schedule").default(sql`'[]'::jsonb`), // For live courses
  maxStudents: integer("max_students"), // Maximum enrollment for live courses
  timezone: text("timezone").default("Asia/Calcutta"),
  
  // Additional Details
  language: text("language").default("Hindi"),
  tags: text("tags").array().default([]),
  faq: jsonb("faq").default(sql`'[]'::jsonb`), // FAQ as JSON array
  
  // Instructor and Support
  supportLevel: text("support_level").default("standard"), // basic, standard, premium
  
  // Status and Publishing
  isActive: boolean("is_active").default(true),
  isDraft: boolean("is_draft").default(true),
  publishedAt: timestamp("published_at"),
  lastUpdated: timestamp("last_updated").defaultNow(),
  
  instructorId: varchar("instructor_id").references(() => users.id),
  expertId: varchar("expert_id").references(() => experts.id), // AI Expert assigned to this course
  createdAt: timestamp("created_at").defaultNow(),
});

export const webinars = pgTable("webinars", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  // New informational fields for professional landing page
  agenda: text("agenda"), // Detailed agenda
  keyPoints: text("key_points").array().default([]), // Array of key learning points
  prerequisites: text("prerequisites"), // Prerequisites for the session
  targetAudience: text("target_audience"), // Target audience description
  whatYouWillLearn: text("what_you_will_learn").array().default([]), // Learning outcomes
  faq: jsonb("faq").default(sql`'[]'::jsonb`), // FAQ as JSON array
  resources: text("resources").array().default([]), // Additional resources/links
  speakerBio: text("speaker_bio"), // Speaker biography
  tags: text("tags").array().default([]), // Tags for categorization
  difficulty: text("difficulty").default("Beginner"), // Beginner, Intermediate, Advanced
  language: text("language").default("Hindi"), // Session language
  category: text("category"), // AI Development, Video Creation, etc.
  thumbnail: text("thumbnail"), // Webinar thumbnail image
  // Existing fields
  scheduledAt: timestamp("scheduled_at").notNull(),
  duration: integer("duration_minutes").notNull(), // duration in minutes
  price: varchar("price").default("0"), // Session price
  maxParticipants: integer("max_participants").default(100),
  currentParticipants: integer("current_participants").default(0),
  status: text("status").notNull().default("scheduled"), // scheduled, live, completed, cancelled
  // Zoho-specific fields
  meetingKey: text("meeting_key"), // Zoho's webinar meeting key
  registrationLink: text("registration_link"), // Zoho registration URL
  startLink: text("start_link"), // Zoho start webinar URL
  presenterZuid: text("presenter_zuid"), // Zoho User ID of presenter
  webinarId: text("webinar_id"), // Zoho's internal webinar ID
  timezone: text("timezone").default("Asia/Calcutta"),
  participants: text("participants").array().default([]), // Array of participant emails
  // Legacy field for backward compatibility
  meetingUrl: text("meeting_url"),
  instructorId: varchar("instructor_id").references(() => users.id),
  courseId: varchar("course_id").references(() => courses.id),
  expertId: varchar("expert_id").references(() => experts.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const enrollments = pgTable("enrollments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  studentId: varchar("student_id").references(() => users.id).notNull(),
  courseId: varchar("course_id").references(() => courses.id).notNull(),
  enrolledAt: timestamp("enrolled_at").defaultNow(),
  progress: integer("progress").default(0), // percentage
  completed: boolean("completed").default(false),
  completedAt: timestamp("completed_at"),
});

export const webinarAttendees = pgTable("webinar_attendees", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  webinarId: varchar("webinar_id").references(() => webinars.id).notNull(),
  participantId: varchar("participant_id").references(() => users.id),
  participantName: varchar("participant_name"),
  participantEmail: varchar("participant_email").notNull(),
  role: varchar("role").default("attendee"), // attendee, panelist, presenter
  status: varchar("status").default("registered"), // registered, joined, left
  canUnmute: boolean("can_unmute").default(false),
  canShareScreen: boolean("can_share_screen").default(false),
  isPanelist: boolean("is_panelist").default(false),
  totalDuration: integer("total_duration").default(0), // in minutes
  joinedAt: timestamp("joined_at").defaultNow(),
  leftAt: timestamp("left_at"),
});

export const testimonials = pgTable("testimonials", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  studentId: varchar("student_id").references(() => users.id).notNull(),
  courseId: varchar("course_id").references(() => courses.id),
  content: text("content").notNull(),
  rating: integer("rating").notNull(),
  isPublished: boolean("is_published").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const payments = pgTable("payments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  courseId: varchar("course_id").references(() => courses.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull(), // pending, completed, failed, refunded
  paymentMethod: text("payment_method"),
  transactionId: text("transaction_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const experts = pgTable("experts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  bio: text("bio").notNull(),
  avatar: text("avatar"),
  specialization: text("specialization").notNull(), // AI Software Development, AI Video Creation, Presentation Design, etc.
  experience: text("experience").notNull(), // years of experience
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0"),
  totalSessions: integer("total_sessions").default(0),
  hourlyRate: decimal("hourly_rate", { precision: 8, scale: 2 }).notNull(),
  availability: text("availability"), // JSON string for availability schedule
  skills: text("skills").array().default([]), // Array of skills
  languages: text("languages").array().default(["Hindi", "English"]),
  timezone: text("timezone").default("Asia/Calcutta"),
  // New fields for detailed overview
  education: text("education"), // Educational background
  certifications: text("certifications").array().default([]), // Professional certifications
  achievements: text("achievements").array().default([]), // Key achievements
  workHistory: text("work_history"), // Professional work experience
  expertise: text("expertise").array().default([]), // Areas of expertise
  tools: text("tools").array().default([]), // Tools and technologies
  portfolioLinks: text("portfolio_links").array().default([]), // Portfolio/work samples
  socialLinks: text("social_links"), // JSON string for social media links
  methodology: text("methodology"), // Teaching/consultation methodology
  consultationEnabled: boolean("consultation_enabled").default(true), // Enable/disable consultation booking
  availableSlots: text("available_slots").array().default(sql`'{}'::text[]`), // Available time slots for consultation
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Direct reviews table (separate from consultation-based reviews)
export const directReviews = pgTable("direct_reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  expertId: varchar("expert_id").references(() => experts.id).notNull(),
  studentId: varchar("student_id").references(() => users.id).notNull(),
  rating: integer("rating").notNull(), // 1-5 stars
  feedback: text("feedback").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const consultations = pgTable("consultations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  studentId: varchar("student_id").references(() => users.id).notNull(),
  expertId: varchar("expert_id").references(() => experts.id).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  scheduledAt: timestamp("scheduled_at").notNull(),
  duration: integer("duration_minutes").notNull().default(60), // duration in minutes
  status: text("status").notNull().default("scheduled"), // scheduled, in-progress, completed, cancelled
  amount: decimal("amount", { precision: 8, scale: 2 }).notNull(),
  meetingUrl: text("meeting_url"), // Join link for students
  startUrl: text("start_url"), // Start link for experts
  notes: text("notes"), // Expert's notes after session
  rating: integer("rating"), // Student's rating (1-5)
  feedback: text("feedback"), // Student's feedback
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const ebooks = pgTable("ebooks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  shortDescription: text("short_description"),
  indexContent: text("index_content"), // Table of contents/index
  summary: text("summary"), // Brief summary of the ebook
  authorId: varchar("author_id").references(() => experts.id).notNull(), // Expert who wrote the ebook
  category: text("category").notNull(), // AI Development, Video Creation, etc.
  tags: text("tags").array().default([]), // Array of tags for filtering
  coverImage: text("cover_image"), // Cover image URL
  fileUrl: text("file_url").notNull(), // PDF/ebook file URL
  fileSize: text("file_size"), // File size in MB
  pageCount: integer("page_count"),
  language: text("language").default("English"),
  price: varchar("price").default("0"), // Free or paid
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0"),
  downloadCount: integer("download_count").default(0),
  isActive: boolean("is_active").default(true),
  isFeatured: boolean("is_featured").default(false),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const userEbookDownloads = pgTable("user_ebook_downloads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  ebookId: varchar("ebook_id").references(() => ebooks.id).notNull(),
  downloadedAt: timestamp("downloaded_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertCourseSchema = createInsertSchema(courses).omit({
  id: true,
  createdAt: true,
  rating: true,
  studentsCount: true,
  publishedAt: true,
  lastUpdated: true,
});

export const insertWebinarSchema = createInsertSchema(webinars).omit({
  id: true,
  createdAt: true,
  currentParticipants: true,
  meetingKey: true,
  registrationLink: true,
  startLink: true,
  webinarId: true,
}).extend({
  scheduledAt: z.string().transform((str) => new Date(str)),
});

export const insertEnrollmentSchema = createInsertSchema(enrollments).omit({
  id: true,
  enrolledAt: true,
  progress: true,
  completed: true,
  completedAt: true,
});

export const insertExpertSchema = createInsertSchema(experts).omit({
  id: true,
  createdAt: true,
  rating: true,
  totalSessions: true,
});

export const insertConsultationSchema = createInsertSchema(consultations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  rating: true,
  feedback: true,
  notes: true,
}).extend({
  scheduledAt: z.string().transform((str) => new Date(str)),
});

export const insertTestimonialSchema = createInsertSchema(testimonials).omit({
  id: true,
  createdAt: true,
  isPublished: true,
});

export const insertPaymentSchema = createInsertSchema(payments).omit({
  id: true,
  createdAt: true,
});

export const insertEbookSchema = createInsertSchema(ebooks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  rating: true,
  downloadCount: true,
});

export const insertUserEbookDownloadSchema = createInsertSchema(userEbookDownloads).omit({
  id: true,
  downloadedAt: true,
});

export const insertDirectReviewSchema = createInsertSchema(directReviews).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertWebinarAttendeeSchema = createInsertSchema(webinarAttendees).omit({
  id: true,
  joinedAt: true,
  leftAt: true,
  totalDuration: true,
  canUnmute: true,
  canShareScreen: true,
  isPanelist: true,
  role: true,
  status: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Course = typeof courses.$inferSelect;
export type InsertCourse = z.infer<typeof insertCourseSchema>;

export type Webinar = typeof webinars.$inferSelect;
export type InsertWebinar = z.infer<typeof insertWebinarSchema>;

// Keep LiveSession for backward compatibility during migration
export type LiveSession = Webinar;
export type InsertLiveSession = InsertWebinar;

export type Enrollment = typeof enrollments.$inferSelect;
export type InsertEnrollment = z.infer<typeof insertEnrollmentSchema>;

export type Testimonial = typeof testimonials.$inferSelect;
export type InsertTestimonial = z.infer<typeof insertTestimonialSchema>;

export type Expert = typeof experts.$inferSelect;
export type InsertExpert = z.infer<typeof insertExpertSchema>;

export type Consultation = typeof consultations.$inferSelect & {
  expert?: Expert;
};
export type InsertConsultation = z.infer<typeof insertConsultationSchema>;

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;

export type Ebook = typeof ebooks.$inferSelect & {
  author?: Expert;
};
export type InsertEbook = z.infer<typeof insertEbookSchema>;

export type UserEbookDownload = typeof userEbookDownloads.$inferSelect;
export type InsertUserEbookDownload = z.infer<typeof insertUserEbookDownloadSchema>;

export type DirectReview = typeof directReviews.$inferSelect & {
  student?: User;
};
export type InsertDirectReview = z.infer<typeof insertDirectReviewSchema>;

export type WebinarAttendee = typeof webinarAttendees.$inferSelect;
export type InsertWebinarAttendee = z.infer<typeof insertWebinarAttendeeSchema>;
