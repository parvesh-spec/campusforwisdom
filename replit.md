# Overview

CampusForWisdom is a comprehensive AI education platform that provides online courses, live learning sessions, and content management capabilities. The platform serves students seeking to learn AI skills for software development, video creation, and presentation design, while providing instructors and administrators with tools to manage courses, students, and educational content.

The application is built as a full-stack web platform with a React frontend, Express.js backend, and PostgreSQL database, designed to facilitate interactive AI education through both self-paced courses and live instructor-led sessions.

## Recent Changes (August 21, 2025)
- ✅ **CRITICAL FIXES COMPLETED**: Cashfree payment webhook system fully operational
- ✅ **Payment Status Fix**: Resolved paid_at NULL issue by converting 'SUCCESS' status to 'completed' 
- ✅ **Duplicate Prevention**: Added database check to prevent multiple webinar enrollments for same user
- ✅ Fixed getUserById method name issue - changed to getUser in webhook enrollment logic  
- ✅ Fixed database field mapping in addWebinarAttendee method (participantName, participantEmail)
- ✅ Resolved schema constraint issue - participantName now properly set as NOT NULL to match database
- ✅ Fixed user data retrieval and name formatting in webhook post-payment actions
- ✅ **Production Testing**: Both development and production webhooks tested and working perfectly
- ✅ Complete webinar payment flow: Payment success → webhook → updatePaymentStatus → addWebinarAttendee
- ✅ Enhanced error logging and debugging for webhook enrollment process
- ✅ Payment records now properly show status='completed' and paid_at timestamp
- ✅ Duplicate enrollment prevention working with proper database constraints

## Previous Changes (August 19, 2025)
- ✅ Complete Cashfree payment gateway integration with production credentials
- ✅ Payment verification added to all booking endpoints (courses, live sessions, consultations, ebooks)
- ✅ PaymentButton component integrated across all content types
- ✅ Fixed type conversion errors in price comparisons throughout frontend
- ✅ Added payment protection to prevent bypassing paid content
- ✅ Live session booking now properly requires payment for paid sessions
- ✅ Ebook download integrated with payment gateway for paid content
- ✅ Consultation booking prepared with payment flow
- ✅ All paid content now shows "Payment required" messages when accessed without payment
- ✅ Payment verification endpoint updated to link payments with specific content items
- ✅ System security enhanced to block unauthorized access to paid content
- ✅ Webhook endpoint fully configured and processing Cashfree payment events
- ✅ Automatic enrollment system implemented for successful payments
- ✅ Payment status tracking and updates working across all content types
- ✅ Error handling improved for payment failures and user cancellations
- ✅ Fixed JSON parsing issues in webhook data processing
- ✅ Enhanced payment verification with multiple success status checks
- ✅ Improved frontend payment flow with proper page refresh and status updates
- ✅ Added comprehensive logging for webhook enrollment debugging
- ✅ Fixed booking status display after successful payment completion

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern development patterns
- **Routing**: Wouter for lightweight client-side routing with separate public and admin layouts
- **Styling**: Tailwind CSS with Shadcn/ui component library for consistent, modern UI design
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Build Tool**: Vite for fast development and optimized production builds

The frontend follows a component-based architecture with dedicated layouts for public pages (marketing, courses, sessions) and admin functionality (dashboard, management interfaces). The design system uses CSS variables for theming and supports both light and dark modes.

## Backend Architecture
- **Runtime**: Node.js with Express.js framework for RESTful API development
- **Language**: TypeScript for type safety across the entire application stack
- **Development**: TSX for development server with hot reloading capabilities
- **Build Process**: ESBuild for fast production compilation and bundling

The backend implements a clean separation between routes, storage layer, and business logic. API endpoints are organized by functionality (courses, sessions, users, payments) with consistent error handling and logging middleware.

## Database Design
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Schema Management**: Drizzle Kit for database migrations and schema evolution
- **Connection**: Neon Database serverless PostgreSQL for scalable cloud hosting
- **Storage Layer**: DatabaseStorage implementation for all data operations with proper null handling and type safety

The database schema supports:
- User management with role-based access (student, instructor, admin)
- Course catalog with pricing, ratings, and enrollment tracking
- Live session scheduling and participant management
- Payment processing and transaction history
- Testimonials and feedback system
- Administrative content management

## File Storage & Media
- **Cloud Storage**: Google Cloud Storage for handling course materials, videos, and user-generated content
- **File Upload**: Uppy.js integration for drag-and-drop file uploads with progress tracking
- **Asset Management**: Dedicated asset handling through organized cloud storage buckets

## Authentication & Authorization
- **Session Management**: Cookie-based authentication for secure user sessions
- **Role-Based Access**: Three-tier user system (student, instructor, admin) with appropriate permissions
- **Security**: CORS configuration and secure cookie handling for production deployment

## Development Workflow
- **Type Safety**: Shared TypeScript schemas between frontend and backend for consistent data structures
- **Code Quality**: ESLint and TypeScript strict mode for code consistency
- **Development Server**: Integrated Vite dev server with Express backend for unified development experience
- **Path Aliases**: Organized import structure using @ aliases for cleaner code organization

The architecture prioritizes developer experience with hot reloading, type safety, and modern tooling while maintaining production readiness through proper build processes and deployment configurations.

# External Dependencies

## Database Services
- **Neon Database**: Serverless PostgreSQL hosting for scalable database operations
- **Drizzle ORM**: Type-safe database toolkit for PostgreSQL operations and migrations

## Cloud Services
- **Google Cloud Storage**: File and media storage service for course materials and user uploads
- **Replit**: Development and deployment platform with integrated hosting capabilities

## Frontend Libraries
- **Radix UI**: Comprehensive component primitives for building accessible UI components
- **Shadcn/ui**: Pre-built component library built on Radix UI for consistent design system
- **Uppy**: Modern file uploader with support for various upload methods and cloud services
- **TanStack Query**: Powerful data synchronization for React applications
- **Wouter**: Minimalist routing library for React applications

## Development Tools
- **Vite**: Next-generation frontend build tool with fast HMR and optimized builds
- **ESBuild**: Fast JavaScript bundler for production builds
- **TSX**: TypeScript execution environment for development
- **PostCSS**: CSS transformation tool with Tailwind CSS and Autoprefixer plugins

## UI and Styling
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development
- **Lucide React**: Beautiful icon library with React components
- **Class Variance Authority**: Tool for creating variant-based component APIs
- **React Hook Form**: Performant forms library with minimal re-renders

## Utilities
- **Zod**: TypeScript-first schema validation library
- **date-fns**: Modern JavaScript date utility library
- **clsx**: Utility for constructing className strings conditionally
- **nanoid**: URL-safe unique ID generator