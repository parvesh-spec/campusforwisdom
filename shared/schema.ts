import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, decimal } from "drizzle-orm/pg-core";
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
  isActive: boolean("is_active").default(true),
  instructorId: varchar("instructor_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const webinars = pgTable("webinars", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  scheduledAt: timestamp("scheduled_at").notNull(),
  duration: integer("duration_minutes").notNull(), // duration in minutes
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
  userId: varchar("user_id").references(() => users.id).notNull(),
  email: text("email"), // For external participants
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
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
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
  meetingUrl: text("meeting_url"),
  notes: text("notes"), // Expert's notes after session
  rating: integer("rating"), // Student's rating (1-5)
  feedback: text("feedback"), // Student's feedback
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
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

export type Consultation = typeof consultations.$inferSelect;
export type InsertConsultation = z.infer<typeof insertConsultationSchema>;

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
