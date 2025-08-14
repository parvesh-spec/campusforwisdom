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
  avatar: text("avatar"),
  createdAt: timestamp("created_at").defaultNow(),
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

export const liveWebinars = pgTable("live_webinars", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  scheduledAt: timestamp("scheduled_at").notNull(),
  duration: integer("duration_minutes").notNull(), // duration in minutes
  maxParticipants: integer("max_participants").default(1000),
  currentParticipants: integer("current_participants").default(0),
  registeredParticipants: integer("registered_participants").default(0),
  status: text("status").notNull().default("scheduled"), // scheduled, live, completed, cancelled
  zoomWebinarId: text("zoom_webinar_id"),
  zoomJoinUrl: text("zoom_join_url"),
  zoomStartUrl: text("zoom_start_url"),
  zoomRegistrationUrl: text("zoom_registration_url"),
  zoomPassword: text("zoom_password"),
  recordingUrl: text("recording_url"),
  instructorId: varchar("instructor_id").references(() => users.id),
  courseId: varchar("course_id").references(() => courses.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Webinar panelists (instructors/co-hosts)
export const webinarPanelists = pgTable("webinar_panelists", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  webinarId: varchar("webinar_id").references(() => liveWebinars.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  role: text("role").default("panelist"), // panelist, co-host
  joinUrl: text("join_url"),
  addedAt: timestamp("added_at").defaultNow(),
});

// Webinar registrations
export const webinarRegistrations = pgTable("webinar_registrations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  webinarId: varchar("webinar_id").references(() => liveWebinars.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  registrationStatus: text("registration_status").default("approved"), // approved, pending, denied
  zoomRegistrantId: text("zoom_registrant_id"),
  joinUrl: text("join_url"),
  registeredAt: timestamp("registered_at").defaultNow(),
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
  webinarId: varchar("webinar_id").references(() => liveWebinars.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  zoomParticipantId: text("zoom_participant_id"),
  participantType: text("participant_type").default("attendee"), // attendee, panelist, host
  joinedAt: timestamp("joined_at").defaultNow(),
  leftAt: timestamp("left_at"),
  totalDuration: integer("total_duration_minutes").default(0),
  attended: boolean("attended").default(true),
});

// New table for detailed webinar analytics
export const webinarAnalytics = pgTable("webinar_analytics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  webinarId: varchar("webinar_id").references(() => liveWebinars.id).notNull(),
  totalRegistrants: integer("total_registrants").default(0),
  totalAttendees: integer("total_attendees").default(0),
  avgAttendanceTime: integer("avg_attendance_minutes").default(0),
  peakAttendance: integer("peak_attendance").default(0),
  engagementScore: decimal("engagement_score", { precision: 3, scale: 2 }).default("0"),
  recordingDuration: integer("recording_duration_minutes").default(0),
  chatMessages: integer("chat_messages").default(0),
  questionsAsked: integer("questions_asked").default(0),
  pollResponses: integer("poll_responses").default(0),
  handRaises: integer("hand_raises").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// New table for participant engagement tracking  
export const participantEngagement = pgTable("participant_engagement", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  webinarId: varchar("webinar_id").references(() => liveWebinars.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  participantType: text("participant_type").default("attendee"), // attendee, panelist, host
  speakingTime: integer("speaking_time_seconds").default(0),
  chatMessages: integer("chat_messages").default(0),
  reactionsCount: integer("reactions_count").default(0),
  handRaises: integer("hand_raises").default(0),
  pollParticipation: integer("poll_participation").default(0),
  screenShareTime: integer("screen_share_time_seconds").default(0),
  attentionScore: decimal("attention_score", { precision: 3, scale: 2 }).default("0"),
  createdAt: timestamp("created_at").defaultNow(),
});

// New table for Zoom webhook events
export const zoomEvents = pgTable("zoom_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  eventType: text("event_type").notNull(),
  webinarId: varchar("webinar_id").references(() => liveWebinars.id),
  zoomWebinarId: text("zoom_webinar_id"),
  eventData: jsonb("event_data"),
  processed: boolean("processed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
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

export const insertLiveWebinarSchema = createInsertSchema(liveWebinars).omit({
  id: true,
  createdAt: true,
  currentParticipants: true,
  registeredParticipants: true,
}).extend({
  scheduledAt: z.coerce.date(), // Allow string to Date conversion
});

export const insertWebinarPanelistSchema = createInsertSchema(webinarPanelists).omit({
  id: true,
  addedAt: true,
});

export const insertWebinarRegistrationSchema = createInsertSchema(webinarRegistrations).omit({
  id: true,
  registeredAt: true,
});

export const insertWebinarAttendeeSchema = createInsertSchema(webinarAttendees).omit({
  id: true,
  joinedAt: true,
});

export const insertWebinarAnalyticsSchema = createInsertSchema(webinarAnalytics).omit({
  id: true,
  createdAt: true,
});

export const insertParticipantEngagementSchema = createInsertSchema(participantEngagement).omit({
  id: true,
  createdAt: true,
});

export const insertZoomEventSchema = createInsertSchema(zoomEvents).omit({
  id: true,
  createdAt: true,
});

export const insertEnrollmentSchema = createInsertSchema(enrollments).omit({
  id: true,
  enrolledAt: true,
  progress: true,
  completed: true,
  completedAt: true,
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

export type LiveWebinar = typeof liveWebinars.$inferSelect;
export type InsertLiveWebinar = z.infer<typeof insertLiveWebinarSchema>;

export type WebinarPanelist = typeof webinarPanelists.$inferSelect;
export type InsertWebinarPanelist = z.infer<typeof insertWebinarPanelistSchema>;

export type WebinarRegistration = typeof webinarRegistrations.$inferSelect;
export type InsertWebinarRegistration = z.infer<typeof insertWebinarRegistrationSchema>;

// Legacy compatibility aliases for gradual migration
export type LiveSession = LiveWebinar;
export type InsertLiveSession = InsertLiveWebinar;

export type WebinarAttendee = typeof webinarAttendees.$inferSelect;

// Missing type exports that are needed
export type WebinarAnalytic = typeof webinarAnalytics.$inferSelect;
export type InsertWebinarAnalytic = z.infer<typeof insertWebinarAnalyticsSchema>;

export type SessionAttendee = WebinarAttendee; // Legacy alias for compatibility
export type SessionAnalytic = WebinarAnalytic; // Legacy alias for compatibility
export type InsertSessionAttendee = z.infer<typeof insertWebinarAttendeeSchema>;
export type InsertSessionAnalytic = InsertWebinarAnalytic; // Legacy alias for compatibility

export type ZoomEvent = typeof zoomEvents.$inferSelect;
export type InsertZoomEvent = z.infer<typeof insertZoomEventSchema>;

export type ParticipantEngagement = typeof participantEngagement.$inferSelect;
export type InsertParticipantEngagement = z.infer<typeof insertParticipantEngagementSchema>;

export type Enrollment = typeof enrollments.$inferSelect;
export type InsertEnrollment = z.infer<typeof insertEnrollmentSchema>;

export type Testimonial = typeof testimonials.$inferSelect;
export type InsertTestimonial = z.infer<typeof insertTestimonialSchema>;

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;

export type SessionAttendee = typeof sessionAttendees.$inferSelect;
export type InsertSessionAttendee = typeof sessionAttendees.$inferInsert;

export type SessionAnalytic = typeof sessionAnalytics.$inferSelect;
export type InsertSessionAnalytic = typeof sessionAnalytics.$inferInsert;

export type ParticipantEngagement = typeof participantEngagement.$inferSelect;
export type InsertParticipantEngagement = typeof participantEngagement.$inferInsert;

export type ZoomEvent = typeof zoomEvents.$inferSelect;
export type InsertZoomEvent = typeof zoomEvents.$inferInsert;
