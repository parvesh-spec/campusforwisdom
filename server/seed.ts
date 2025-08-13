import { db } from './db';
import { courses, users, testimonials, enrollments, liveSessions } from '@shared/schema';

async function seed() {
  console.log('🌱 Seeding database...');

  // Create some sample users (including admin)
  const sampleUsers = [
    {
      username: 'admin',
      email: 'admin@campusforwisdom.com',
      password: 'admin123',
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin' as const,
      avatar: null,
    },
    {
      username: 'student',
      email: 'student@example.com',
      password: 'student123',
      firstName: 'Student',
      lastName: 'Demo',
      role: 'student' as const,
      avatar: null,
    },
    {
      username: 'john_doe',
      email: 'john@example.com',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe',
      role: 'student' as const,
      avatar: null,
    },
    {
      username: 'jane_smith',
      email: 'jane@example.com',
      password: 'password123',
      firstName: 'Jane',
      lastName: 'Smith',
      role: 'student' as const,
      avatar: null,
    },
    {
      username: 'instructor_ai',
      email: 'instructor@campusforwisdom.com',
      password: 'instructor123',
      firstName: 'AI',
      lastName: 'Instructor',
      role: 'instructor' as const,
      avatar: null,
    }
  ];

  const createdUsers = await db.insert(users).values(sampleUsers).returning();
  console.log('✅ Created users:', createdUsers.length);

  // Create some sample courses
  const sampleCourses = [
    {
      title: 'AI for Software Development',
      description: 'Master AI tools like GitHub Copilot, ChatGPT, and Claude for efficient coding. Learn prompt engineering, code generation, and debugging techniques.',
      price: '₹4,999',
      originalPrice: '₹7,999',
      duration: '8 weeks',
      level: 'Intermediate',
      category: 'Software Development',
      thumbnail: null,
      rating: '4.8',
      studentsCount: 1250,
      isActive: true,
    },
    {
      title: 'AI Video Creation Mastery',
      description: 'Create stunning videos using AI tools. Learn scriptwriting, voiceover generation, video editing, and automation workflows.',
      price: '₹3,999',
      originalPrice: '₹6,999',
      duration: '6 weeks',
      level: 'Beginner',
      category: 'Video Creation',
      thumbnail: null,
      rating: '4.9',
      studentsCount: 980,
      isActive: true,
    },
    {
      title: 'AI-Powered Presentations',
      description: 'Design compelling presentations with AI assistance. Master tools for content generation, design automation, and interactive elements.',
      price: '₹2,999',
      originalPrice: '₹4,999',
      duration: '4 weeks',
      level: 'Beginner',
      category: 'Presentation Design',
      thumbnail: null,
      rating: '4.7',
      studentsCount: 750,
      isActive: true,
    }
  ];

  const createdCourses = await db.insert(courses).values(sampleCourses).returning();
  console.log('✅ Created courses:', createdCourses.length);

  // Create some testimonials
  const sampleTestimonials = [
    {
      content: 'The AI for Software Development course transformed my coding workflow. I\'m now 50% more productive using AI tools!',
      rating: 5,
      studentId: createdUsers[0].id,
      courseId: createdCourses[0].id,
      isPublished: true,
    },
    {
      content: 'Amazing course on AI video creation. I went from zero to creating professional videos in just 6 weeks.',
      rating: 5,
      studentId: createdUsers[1].id,
      courseId: createdCourses[1].id,
      isPublished: true,
    },
    {
      content: 'The presentation course gave me superpowers! My client presentations are now incredibly engaging.',
      rating: 5,
      studentId: createdUsers[0].id,
      courseId: createdCourses[2].id,
      isPublished: true,
    }
  ];

  const createdTestimonials = await db.insert(testimonials).values(sampleTestimonials).returning();
  console.log('✅ Created testimonials:', createdTestimonials.length);

  // Create some enrollments
  const sampleEnrollments = [
    {
      studentId: createdUsers[0].id,
      courseId: createdCourses[0].id,
      progress: 75,
      completed: false,
      completedAt: null,
    },
    {
      studentId: createdUsers[1].id,
      courseId: createdCourses[1].id,
      progress: 100,
      completed: true,
      completedAt: new Date('2024-12-15'),
    }
  ];

  const createdEnrollments = await db.insert(enrollments).values(sampleEnrollments).returning();
  console.log('✅ Created enrollments:', createdEnrollments.length);

  // Create some live sessions
  const sampleLiveSessions = [
    {
      title: 'AI Coding Workshop: Advanced Prompting Techniques',
      description: 'Interactive workshop on advanced AI prompting for complex coding tasks.',
      scheduledAt: new Date('2025-02-20T15:00:00Z'),
      duration: 90,
      instructorId: createdUsers[2].id,
      courseId: createdCourses[0].id,
      maxParticipants: 50,
      currentParticipants: 0,
      status: 'scheduled' as const,
      meetingUrl: 'https://meet.google.com/abc-def-ghi',
    },
    {
      title: 'Video Creation Q&A Session',
      description: 'Live Q&A session for video creation students. Bring your projects and get feedback!',
      scheduledAt: new Date('2025-02-18T18:00:00Z'),
      duration: 60,
      instructorId: createdUsers[2].id,
      courseId: createdCourses[1].id,
      maxParticipants: 30,
      currentParticipants: 0,
      status: 'scheduled' as const,
      meetingUrl: 'https://meet.google.com/xyz-abc-def',
    }
  ];

  const createdLiveSessions = await db.insert(liveSessions).values(sampleLiveSessions).returning();
  console.log('✅ Created live sessions:', createdLiveSessions.length);

  console.log('🎉 Database seeded successfully!');
}

// Only run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seed().catch(console.error);
}

export { seed };