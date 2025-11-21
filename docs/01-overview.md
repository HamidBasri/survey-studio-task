# Survey Studio - Project Overview

## Purpose and Goals

**Survey Studio** is a modern, full-stack web application designed for creating, managing, and analysing surveys with role-based access control. Built with cutting-edge technologies, it provides a robust platform for:

- **Survey Creation**: Admins can design dynamic, multi-question surveys with various question types
- **Survey Distribution**: Support for both public and private (assigned) surveys
- **Response Collection**: Secure and validated response submission
- **Data Analysis**: Centralised response management and viewing
- **User Management**: Role-based authentication (Admin/User) with secure credentials

### Key Objectives

1. **Simplicity**: Clean, intuitive interface for both survey creators and respondents
2. **Flexibility**: Support multiple question types with conditional logic
3. **Security**: Production-grade authentication and authorisation
4. **Scalability**: Docker-based deployment ready for production
5. **Developer Experience**: Type-safe, well-structured codebase with modern tooling

## Project Context

Parts of this project were developed leveraging **Large Language Models (LLMs)** to accelerate development, generate boilerplate code, and implement best practices. This AI-assisted approach enabled rapid prototyping whilst maintaining code quality and consistency.

## Technology Stack

### Frontend

| Technology          | Version | Purpose                                                               |
| ------------------- | ------- | --------------------------------------------------------------------- |
| **Next.js**         | 16.0.3  | React framework with App Router for server-side rendering and routing |
| **React**           | 19.2.0  | UI library for building interactive components                        |
| **TypeScript**      | 5.x     | Type-safe JavaScript for enhanced developer experience                |
| **TailwindCSS**     | 4.x     | Utility-first CSS framework for rapid UI development                  |
| **shadcn/ui**       | Latest  | High-quality, accessible React components built on Radix UI           |
| **Lucide React**    | 0.554.0 | Beautiful, consistent icon library                                    |
| **React Hook Form** | 7.66.1  | Performant form management with validation                            |
| **Zod**             | 4.1.12  | TypeScript-first schema validation                                    |
| **TanStack Query**  | 5.90.10 | Powerful data synchronisation and caching                             |
| **Zustand**         | 5.0.8   | Lightweight state management                                          |

### Backend

| Technology             | Version       | Purpose                                             |
| ---------------------- | ------------- | --------------------------------------------------- |
| **Next.js API Routes** | 16.0.3        | Serverless API endpoints                            |
| **NextAuth.js**        | 5.0.0-beta.30 | Authentication library with JWT strategy            |
| **Drizzle ORM**        | 0.44.7        | Type-safe SQL ORM with excellent TypeScript support |
| **PostgreSQL**         | 18            | Relational database for data persistence            |
| **Drizzle Kit**        | 0.31.7        | Database migrations and schema management           |

### Development Tools

| Tool                        | Purpose                                         |
| --------------------------- | ----------------------------------------------- |
| **Bun**                     | Fast JavaScript runtime and package manager     |
| **ESLint**                  | Code linting with TypeScript support            |
| **Prettier**                | Code formatting with Tailwind plugin            |
| **Docker & Docker Compose** | Containerisation for development and production |
| **Drizzle Studio**          | Visual database browser and manager             |

## Core Features

### 1. Survey Management (Admin)

- Create surveys with multiple question types:
  - Text input
  - Textarea
  - Multiple choice (single selection)
  - Multiple select (multiple selections)
  - Multiple select with "Other" option
  - Rating scale (1-10)
  - Yes/No questions
- Configure survey visibility (public/private)
- View all surveys with metadata (response counts, assigned users)
- Delete surveys and associated responses
- View individual survey responses with detailed analytics

### 2. Survey Assignment

- Assign private surveys to specific users
- Prevent duplicate assignments
- Cascade deletion of assignments when surveys or users are removed

### 3. Response Collection

- Dynamic form rendering based on survey configuration
- Client-side and server-side validation
- Prevent duplicate submissions per user
- Support for conditional questions (future enhancement)
- Store structured JSON responses

### 4. User Authentication & Authorisation

- Secure credential-based authentication
- Password hashing with bcrypt
- JWT-based session management
- Role-based access control (Admin/User)
- Protected routes and API endpoints

### 5. User Dashboard

- View assigned and public surveys
- Track submission status
- Access survey forms
- View submitted responses (Admin only)

## Architecture Highlights

### Monolithic Next.js Application

Survey Studio uses Next.js App Router, combining frontend and backend in a single application:

- **Server Components**: For improved performance and SEO
- **API Routes**: RESTful endpoints for CRUD operations
- **Client Components**: Interactive UI elements
- **Server Actions**: Type-safe server-side mutations (future enhancement)

### Database-First Design

- PostgreSQL as the single source of truth
- Drizzle ORM for type-safe database queries
- Migration-based schema management
- Indexes for optimal query performance

### Security-First Approach

- Environment variable validation with Zod
- Input validation on client and server
- SQL injection prevention via ORM
- Authentication guards on all protected routes
- RBAC implementation

### Production-Ready Infrastructure

- Multi-stage Dockerfile for optimised builds
- Docker Compose for development and production environments
- Health checks for database readiness
- Separated development and production configurations

## Project Metrics

- **Languages**: TypeScript (100%)
- **Total Files**: ~150+ files
- **Lines of Code**: ~3,000+ LoC (excluding dependencies)
- **Database Tables**: 4 (users, surveys, responses, survey_assignments)
- **API Endpoints**: 8+ RESTful routes
- **Question Types**: 7 supported types

## Development Principles

1. **Type Safety**: Extensive use of TypeScript and Zod for runtime validation
2. **Code Quality**: ESLint and Prettier enforce consistent code style
3. **Separation of Concerns**: Clear separation between UI, business logic, and data access
4. **SOLID Principles**: Single responsibility, dependency injection, interface segregation
5. **DRY (Don't Repeat Yourself)**: Shared utilities and reusable components
6. **Clean Code**: Descriptive naming, minimal complexity

## Next Steps

This documentation continues with:

- **Architecture Deep Dive** (02-architecture.md)
- **Database Schema** (03-database.md)
- **API Reference** (04-api-endpoints.md)
- **Setup & Deployment** (05-setup-guide.md)
- **User Flows** (06-user-flows.md)
- **Project Status & Roadmap** (07-checklist-roadmap.md)
