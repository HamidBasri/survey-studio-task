# Architecture Documentation

## System Architecture Overview

Survey Studio follows a **monolithic full-stack architecture** using Next.js App Router, combining server-side rendering, API routes, and client-side interactivity in a single application.

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Browser    │  │   Mobile     │  │   Tablet     │      │
│  │  (Next.js)   │  │  (Next.js)   │  │  (Next.js)   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            ↕ HTTP/HTTPS
┌─────────────────────────────────────────────────────────────┐
│                    Application Layer (Next.js)              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Frontend (React Components)             │   │
│  │  • Pages (App Router)                                │   │
│  │  • Components (shadcn/ui, custom)                    │   │
│  │  • State Management (Zustand, TanStack Query)        │   │
│  │  • Form Handling (React Hook Form + Zod)             │   │
│  └─────────────────────────────────────────────────────┘   │
│                            ↕                                 │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Backend (API Routes)                    │   │
│  │  • Authentication (NextAuth.js)                      │   │
│  │  • Business Logic (Services)                         │   │
│  │  • Data Access (Repositories)                        │   │
│  │  • Validation (Zod schemas)                          │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↕ SQL
┌─────────────────────────────────────────────────────────────┐
│                    Data Layer (PostgreSQL)                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  users   │  │ surveys  │  │responses │  │survey_   │   │
│  │          │  │          │  │          │  │assignment│   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Application Architecture

### Frontend Architecture

```
src/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Authentication routes (public)
│   │   ├── login/
│   │   └── register/
│   ├── (private)/                # Protected routes (authenticated)
│   │   └── dashboard/
│   │       ├── surveys/
│   │       │   ├── new/         # Create survey
│   │       │   ├── [id]/        # View/Edit survey
│   │       │   └── [id]/responses/
│   │       └── responses/
│   ├── (public)/                 # Public routes
│   │   └── surveys/[id]/        # Public survey form
│   ├── api/                      # API Routes
│   └── layout.tsx                # Root layout
│
├── components/                   # React components
│   ├── dashboard/               # Dashboard-specific components
│   ├── survey/                  # Survey-related components
│   │   ├── SurveyBuilder/       # Dynamic survey builder
│   │   ├── SurveyForm/          # Survey rendering engine
│   │   └── QuestionTypes/       # Question type components
│   └── ui/                      # shadcn/ui components
│
└── lib/                         # Core business logic
    ├── auth/                    # Authentication
    ├── config/                  # Configuration & types
    ├── db/                      # Database (schema, client)
    ├── services/                # Business logic layer
    ├── repositories/            # Data access layer
    └── hooks/                   # React hooks
```

### Backend Architecture (Layered)

```
┌─────────────────────────────────────────────────────────┐
│                    API Route Layer                       │
│  • Request validation                                    │
│  • Authentication guards                                 │
│  • Error handling                                        │
│  • Response formatting                                   │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│                   Service Layer                          │
│  • Business logic                                        │
│  • Data transformation                                   │
│  • Complex operations                                    │
│  • Cross-cutting concerns                                │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│                  Repository Layer                        │
│  • Database queries (Drizzle ORM)                        │
│  • Data persistence                                      │
│  • Transaction management                                │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│                   Database (PostgreSQL)                  │
└─────────────────────────────────────────────────────────┘
```

## Key Design Patterns

### 1. Repository Pattern

Abstracts data access logic from business logic:

```typescript
// lib/repositories/user.repository.ts
export class UserRepository {
  async findByEmail(email: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(userTable)
      .where(eq(userTable.email, email))
      .limit(1)
    return user
  }
}
```

### 2. Service Pattern

Encapsulates business logic and coordinates between repositories:

```typescript
// lib/services/user.service.ts
export class UserService {
  async authenticate(email: string, password: string): Promise<AuthUser | null> {
    const user = await this.userRepo.findByEmail(email)
    if (!user) return null

    const isValid = await verifyPassword(password, user.passwordHash)
    if (!isValid) return null

    return { id: user.id, email: user.email, role: user.role }
  }
}
```

### 3. Dependency Injection

Services and repositories are instantiated as singletons:

```typescript
// lib/services/user.service.ts
export const userService = new UserService(userRepository)
```

### 4. Async Handler Pattern

Centralised error handling for API routes:

```typescript
export const asyncHandler = (fn: Function) => async (...args: any[]) => {
  try {
    return await fn(...args)
  } catch (error) {
    return handleError(error)
  }
}
```

### 5. Guard Pattern

Authentication and authorisation guards:

```typescript
export async function requireAdmin(): Promise<AuthUser> {
  const user = await getCurrentUser()
  if (!user) throw new AuthenticationError()
  if (user.role !== 'admin') throw new AuthorisationError()
  return user
}
```

## Authentication Flow

```
┌──────────┐                                    ┌──────────┐
│  Client  │                                    │  Server  │
└────┬─────┘                                    └────┬─────┘
     │                                                │
     │  1. POST /api/auth/signin                     │
     │  { email, password }                          │
     │ ──────────────────────────────────────────>   │
     │                                                │
     │                    2. Validate credentials     │
     │                       (NextAuth.js)            │
     │                                                │
     │                    3. Hash & verify password   │
     │                       (bcrypt)                 │
     │                                                │
     │  4. Return JWT token                           │
     │  { user, token }                               │
     │ <──────────────────────────────────────────   │
     │                                                │
     │  5. Store token in HTTP-only cookie            │
     │                                                │
     │  6. Subsequent requests with JWT               │
     │  Authorization: Bearer <token>                 │
     │ ──────────────────────────────────────────>   │
     │                                                │
     │                    7. Verify JWT & extract user│
     │                                                │
     │  8. Return protected resource                  │
     │ <──────────────────────────────────────────   │
     │                                                │
```

## Request/Response Flow

### Example: Creating a Survey

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Client: POST /api/surveys                                │
│    Body: { title, config, visibility }                      │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. API Route: src/app/api/surveys/route.ts                 │
│    • asyncHandler wraps the handler                         │
│    • Extracts JWT from cookie                               │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. Authentication Guard                                      │
│    • getCurrentUser() → AuthUser or null                    │
│    • Check role === 'admin'                                 │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. Validation Layer                                          │
│    • Zod schema validates request body                      │
│    • Throws ValidationError if invalid                      │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. Database Layer (Drizzle ORM)                             │
│    • Insert survey into PostgreSQL                          │
│    • Return created survey                                  │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ 6. Response                                                  │
│    • Success: 201 Created with survey object                │
│    • Error: 400/401/403/500 with error message              │
└─────────────────────────────────────────────────────────────┘
```

## State Management

### Server State (TanStack Query)

- API data fetching and caching
- Automatic background refetching
- Optimistic updates
- Pagination and infinite scroll support

```typescript
const { data, isLoading, error } = useQuery({
  queryKey: ['surveys'],
  queryFn: () => fetch('/api/surveys').then(r => r.json())
})
```

### Client State (Zustand)

- UI state (modals, drawers)
- Form state (multi-step forms)
- Temporary user preferences

```typescript
const useSurveyStore = create((set) => ({
  currentSurvey: null,
  setCurrentSurvey: (survey) => set({ currentSurvey: survey })
}))
```

### Form State (React Hook Form)

- Form input state
- Validation errors
- Dirty/touched tracking

## Error Handling Strategy

### Error Hierarchy

```
BaseError (abstract)
├── ValidationError (400)
├── AuthenticationError (401)
├── AuthorisationError (403)
├── NotFoundError (404)
└── InternalServerError (500)
```

### Error Response Format

```json
{
  "error": "Validation failed",
  "message": "Email is required",
  "statusCode": 400,
  "timestamp": "2025-11-18T10:00:00.000Z"
}
```

## Logging Strategy

Structured logging with different log levels:

```typescript
const logger = createLogger({ scope: 'api:surveys' })

logger.info({ userId: user.id }, 'Creating new survey')
logger.warn({ surveyId }, 'Survey not found')
logger.error({ err: error }, 'Database error')
```

Log levels: `fatal`, `error`, `warn`, `info`, `debug`, `trace`

## Security Architecture

### Input Validation

- **Client-side**: React Hook Form + Zod
- **Server-side**: Zod schema validation on all API routes
- **Database**: Drizzle ORM prevents SQL injection

### Authentication

- **Strategy**: JWT stored in HTTP-only cookies
- **Password Hashing**: bcrypt with salt rounds
- **Session**: Stateless JWT (no server-side session storage)

### Authorisation

- **Role-Based Access Control (RBAC)**: Admin vs User
- **Route Protection**: Middleware guards for Next.js routes
- **API Protection**: Function guards in API routes

### Data Protection

- **Environment Variables**: Validated with Zod, never exposed to client
- **SQL Injection**: Prevented by Drizzle ORM parameterised queries
- **XSS**: React automatically escapes content
- **CSRF**: NextAuth.js CSRF protection

## Database Design Principles

1. **Normalisation**: 3NF (Third Normal Form) to reduce redundancy
2. **Referential Integrity**: Foreign keys with cascade rules
3. **Indexing**: Strategic indexes on frequently queried columns
4. **JSONB Storage**: Flexible survey config and response storage
5. **Soft Deletes**: Potential future enhancement (not currently implemented)

## Deployment Architecture

### Development Environment

```
┌──────────────────┐     ┌──────────────────┐
│   Docker: db     │────>│  PostgreSQL:18   │
│   Port: 5432     │     │                  │
└──────────────────┘     └──────────────────┘
         ↑
         │
┌──────────────────┐     ┌──────────────────┐
│   Docker: app    │────>│   Bun + Next.js  │
│   Port: 3000     │     │   (dev mode)     │
└──────────────────┘     └──────────────────┘
```

### Production Environment

```
┌──────────────────┐     ┌──────────────────┐
│   Docker: db     │────>│  PostgreSQL:18   │
│   Port: 5432     │     │                  │
└──────────────────┘     └──────────────────┘
         ↑
         │
┌──────────────────┐     ┌──────────────────┐
│   Docker: app    │────>│   Next.js Build  │
│   Port: 3000     │     │   (optimized)    │
└──────────────────┘     └──────────────────┘
```

## Performance Considerations

1. **Server Components**: Reduce JavaScript bundle size
2. **Dynamic Imports**: Code splitting for route-based loading
3. **Database Indexes**: Optimise query performance
4. **Caching**: TanStack Query caches API responses
5. **Static Generation**: Pre-render public pages where possible

## Scalability Considerations

- **Horizontal Scaling**: Stateless architecture supports multiple instances
- **Database Connection Pooling**: Drizzle manages connections efficiently
- **CDN**: Static assets can be served from CDN
- **Load Balancer**: Multiple Next.js instances behind load balancer
- **Database Replication**: PostgreSQL read replicas for read-heavy workloads

## Technology Choices Rationale

| Technology | Why Chosen |
|------------|------------|
| **Next.js** | Full-stack framework, excellent DX, built-in optimisations |
| **Bun** | Fastest JS runtime, built-in bundler, excellent DX |
| **Drizzle ORM** | Type-safe, lightweight, SQL-like API, excellent TypeScript support |
| **NextAuth.js** | Industry standard, flexible, secure, well-maintained |
| **TailwindCSS** | Rapid development, consistent design, small bundle size |
| **Zod** | Runtime type validation, excellent TypeScript integration |
| **PostgreSQL** | Robust, feature-rich, JSONB support, excellent for relational data |
