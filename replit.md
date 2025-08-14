# Overview

CampusForWisdom is a student-focused AI education platform that provides online courses and live learning sessions. The platform serves students seeking to learn AI skills for software development, video creation, and presentation design through an intuitive public-facing website with secure student authentication.

The application is built as a full-stack web platform with a React frontend, Express.js backend, and PostgreSQL database, designed to facilitate interactive AI education through both self-paced courses and live instructor-led sessions. The platform focuses exclusively on student-facing functionality with simplified authentication.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern development patterns
- **Routing**: Wouter for lightweight client-side routing with separate public and admin layouts
- **Styling**: Tailwind CSS with Shadcn/ui component library for consistent, modern UI design
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Build Tool**: Vite for fast development and optimized production builds

The frontend follows a component-based architecture with a clean public layout for marketing, courses, and sessions. The design system uses CSS variables for theming and supports both light and dark modes with a simplified navigation focused on student login functionality.

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
- Student user management with secure authentication
- Course catalog with pricing, ratings, and enrollment tracking
- Live session scheduling and participant management
- Payment processing and transaction history
- Testimonials and feedback system

## File Storage & Media
- **Cloud Storage**: Google Cloud Storage for handling course materials, videos, and user-generated content
- **File Upload**: Uppy.js integration for drag-and-drop file uploads with progress tracking
- **Asset Management**: Dedicated asset handling through organized cloud storage buckets

## Authentication & Authorization
- **Session Management**: Cookie-based authentication for secure student sessions
- **Student Access**: Streamlined authentication system focused on student experience
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