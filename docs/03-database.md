# Database Schema Documentation

## Overview

Survey Studio uses **PostgreSQL 18** as its database with **Drizzle ORM** for type-safe database operations. The schema is designed following normalisation principles whilst maintaining flexibility for survey configurations and responses.

## Entity-Relationship Diagram

```
┌─────────────────────┐
│       user          │
├─────────────────────┤
│ id (PK)             │
│ email (UNIQUE)      │
│ passwordHash        │
│ role                │
│ createdAt           │
└──────────┬──────────┘
           │
           │ 1:N (creator)
           │
           ├──────────────────────────┐
           │                          │
           │                          │
┌──────────▼──────────┐    ┌─────────▼────────────┐
│      survey         │    │  survey_assignment   │
├─────────────────────┤    ├──────────────────────┤
│ id (PK)             │◄───┤ id (PK)              │
│ title               │ 1:N│ surveyId (FK)        │
│ config (JSONB)      │    │ userId (FK)          │
│ visibility          │    │ assignedAt           │
│ creatorId (FK)      │    └──────────────────────┘
│ createdAt           │              ▲
└──────────┬──────────┘              │
           │                         │ N:1
           │ 1:N                     │
           │                         │
┌──────────▼──────────┐              │
│     response        │              │
├─────────────────────┤              │
│ id (PK)             │              │
│ surveyId (FK)       │              │
│ userId (FK) ────────┴──────────────┘
│ answers (JSONB)     │
│ createdAt           │
└─────────────────────┘

Legend:
PK = Primary Key
FK = Foreign Key
UNIQUE = Unique constraint
1:N = One-to-many relationship
N:1 = Many-to-one relationship
```

## Table Definitions

### `user`

Stores user account information with role-based access.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT random | Unique user identifier |
| `email` | VARCHAR(255) | NOT NULL, UNIQUE | User email address |
| `passwordHash` | VARCHAR(255) | NOT NULL | Bcrypt hashed password |
| `role` | VARCHAR(50) | NOT NULL, DEFAULT 'user' | User role (admin/user) |
| `createdAt` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Account creation timestamp |

**Indexes:**
- `user_role_idx` on `role` (for role-based queries)

**TypeScript Type:**
```typescript
type User = {
  id: string
  email: string
  passwordHash: string
  role: 'admin' | 'user'
  createdAt: Date
}
```

---

### `survey`

Stores survey metadata and configuration.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT random | Unique survey identifier |
| `title` | VARCHAR(255) | NOT NULL | Survey title |
| `config` | JSONB | NOT NULL | Survey configuration (questions, validation) |
| `visibility` | VARCHAR(20) | NOT NULL, DEFAULT 'private' | Survey visibility (public/private) |
| `creatorId` | UUID | NOT NULL, REFERENCES user(id) | Survey creator (admin) |
| `createdAt` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Survey creation timestamp |

**Indexes:**
- `survey_title_idx` on `title` (for search)
- `survey_visibility_idx` on `visibility` (for filtering)
- `survey_creator_idx` on `creatorId` (for creator lookups)

**TypeScript Type:**
```typescript
type Survey = {
  id: string
  title: string
  config: SurveyConfig // See Survey Config Schema below
  visibility: 'public' | 'private'
  creatorId: string
  createdAt: Date
}
```

**Survey Config Schema (JSONB):**
```typescript
type SurveyConfig = {
  title: string
  questions: Question[]
}

type Question =
  | { type: 'text', name: string, label: string, validation?: Validation }
  | { type: 'textarea', name: string, label: string, validation?: Validation }
  | { type: 'multiple_choice', name: string, label: string, options: string[], validation?: Validation }
  | { type: 'multiple_select', name: string, label: string, options: string[], validation?: Validation }
  | { type: 'multiple_select_with_other', name: string, label: string, options: string[], validation?: Validation }
  | { type: 'rating', name: string, label: string, scale: number, validation?: Validation }
  | { type: 'yes_no', name: string, label: string, validation?: Validation }

type Validation = {
  required?: boolean
  minLength?: number
  maxLength?: number
  minChoices?: number
  maxChoices?: number
}
```

---

### `response`

Stores survey responses from users.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT random | Unique response identifier |
| `surveyId` | UUID | NOT NULL, REFERENCES survey(id) | Associated survey |
| `userId` | UUID | REFERENCES user(id) ON DELETE SET NULL | Respondent (nullable for anonymous) |
| `answers` | JSONB | NOT NULL | Response answers as key-value pairs |
| `createdAt` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Response submission timestamp |

**Indexes:**
- `response_survey_idx` on `surveyId` (for survey lookups)
- `response_user_idx` on `userId` (for user response history)
- `response_created_idx` on `createdAt` (for time-based queries)

**TypeScript Type:**
```typescript
type Response = {
  id: string
  surveyId: string
  userId: string | null
  answers: Record<string, unknown> // { questionName: answer }
  createdAt: Date
}
```

**Answers Structure (JSONB):**
```json
{
  "name": "John Doe",
  "rating": 5,
  "feedback": "Excellent service!",
  "preferredContact": ["email", "phone"],
  "wouldRecommend": true
}
```

---

### `survey_assignment`

Junction table for assigning private surveys to specific users.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT random | Unique assignment identifier |
| `surveyId` | UUID | NOT NULL, REFERENCES survey(id) ON DELETE CASCADE | Assigned survey |
| `userId` | UUID | NOT NULL, REFERENCES user(id) ON DELETE CASCADE | Assigned user |
| `assignedAt` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Assignment timestamp |

**Indexes:**
- `assign_survey_idx` on `surveyId` (for survey assignments)
- `assign_user_idx` on `userId` (for user assignments)
- `assign_unique_survey_user_idx` UNIQUE on (`surveyId`, `userId`) (prevent duplicates)

**TypeScript Type:**
```typescript
type SurveyAssignment = {
  id: string
  surveyId: string
  userId: string
  assignedAt: Date
}
```

---

## Relationships

### User → Survey (1:N)

A user (admin) can create multiple surveys.

- **Foreign Key**: `survey.creatorId` → `user.id`
- **Cascade**: No cascade (preserve surveys if user deleted manually)

### Survey → Response (1:N)

A survey can have multiple responses.

- **Foreign Key**: `response.surveyId` → `survey.id`
- **Cascade**: Manual deletion in application logic

### User → Response (1:N)

A user can submit multiple responses (to different surveys).

- **Foreign Key**: `response.userId` → `user.id`
- **Cascade**: `ON DELETE SET NULL` (preserve responses if user deleted)

### Survey ↔ User (N:N via survey_assignment)

Private surveys can be assigned to multiple users, and users can have multiple assigned surveys.

- **Foreign Keys**:
  - `survey_assignment.surveyId` → `survey.id` (`ON DELETE CASCADE`)
  - `survey_assignment.userId` → `user.id` (`ON DELETE CASCADE`)
- **Unique Constraint**: Prevent duplicate assignments

---

## Data Access Patterns

### Query Optimisations

1. **Indexed Lookups**
   - User by email: `user_email_unique` (unique index)
   - Surveys by visibility: `survey_visibility_idx`
   - Responses by survey: `response_survey_idx`

2. **Join Optimisations**
   - Survey assignments use indexed columns for efficient joins
   - Response counts aggregated with GROUP BY on indexed `surveyId`

3. **JSONB Queries**
   - Survey config: Full document retrieval (no partial queries)
   - Response answers: Full document retrieval with client-side parsing

### Common Queries

**Get user's assigned surveys:**
```sql
SELECT s.*
FROM survey s
LEFT JOIN survey_assignment sa ON sa.surveyId = s.id
WHERE s.visibility = 'public' OR sa.userId = $1
ORDER BY s.createdAt DESC;
```

**Get survey with response count:**
```sql
SELECT s.*, COUNT(r.id) as responseCount
FROM survey s
LEFT JOIN response r ON r.surveyId = s.id
WHERE s.id = $1
GROUP BY s.id;
```

**Check if user submitted response:**
```sql
SELECT EXISTS(
  SELECT 1 FROM response
  WHERE surveyId = $1 AND userId = $2
);
```

---

## Migration Strategy

### Drizzle Kit Commands

```bash
# Generate migration from schema changes
bunx drizzle-kit generate

# Apply migrations to database
bunx drizzle-kit migrate

# Open Drizzle Studio (visual DB browser)
bunx drizzle-kit studio
```

### Migration Files

Located in `/drizzle/` directory:
- `0000_chemical_mad_thinker.sql` - Initial schema
- `meta/` - Migration metadata

---

## Database Constraints

### Primary Keys

All tables use UUID primary keys with `defaultRandom()` for distributed systems compatibility.

### Foreign Keys

| Constraint | From | To | On Delete |
|------------|------|-----|-----------|
| `survey_creatorId_fkey` | `survey.creatorId` | `user.id` | NO ACTION |
| `response_surveyId_fkey` | `response.surveyId` | `survey.id` | NO ACTION |
| `response_userId_fkey` | `response.userId` | `user.id` | SET NULL |
| `survey_assignment_surveyId_fkey` | `survey_assignment.surveyId` | `survey.id` | CASCADE |
| `survey_assignment_userId_fkey` | `survey_assignment.userId` | `user.id` | CASCADE |

### Unique Constraints

- `user.email` - Enforce unique email addresses
- `survey_assignment.(surveyId, userId)` - Prevent duplicate assignments

### Check Constraints

None currently. Validation handled at application layer with Zod.

---

## Data Integrity

### Application-Level Validation

1. **Email Format**: Regex validation in Zod schema
2. **Password Strength**: Minimum 8 characters
3. **Survey Config**: Validated against `SurveyConfigSchema`
4. **Response Answers**: Validated against survey question types

### Database-Level Integrity

1. **NOT NULL Constraints**: Prevent missing critical data
2. **Foreign Keys**: Maintain referential integrity
3. **Unique Constraints**: Prevent duplicates
4. **Default Values**: Ensure consistent data (e.g., default role)

---

## Backup & Recovery

### Development

- Docker volumes persist data: `db_data_dev`
- Reset command: `./run.sh reset-db` (drops and recreates)

### Production

- Regular PostgreSQL backups recommended
- Point-in-time recovery (PITR) configuration
- Replication for high availability

---

## Performance Considerations

### Indexing Strategy

- **B-tree indexes** on frequently queried columns (email, surveyId, userId)
- **Partial indexes** could be added for filtered queries (e.g., active surveys)
- **JSONB GIN indexes** (future) for complex JSONB queries

### Query Performance

- **Connection pooling** managed by Drizzle
- **Prepared statements** prevent SQL injection and improve performance
- **Aggregate queries** use indexes for GROUP BY operations

### Scalability

- **UUIDs** allow distributed ID generation
- **JSONB** reduces need for schema migrations for survey questions
- **Read replicas** can be added for read-heavy workloads

---

## Future Enhancements

1. **Soft Deletes**: Add `deletedAt` column for soft deletion
2. **Audit Trail**: Add `updatedAt` and `updatedBy` for change tracking
3. **Survey Versions**: Add versioning for survey config changes
4. **Response Versioning**: Track response edits/updates
5. **Full-Text Search**: Add GIN indexes on survey titles and questions
6. **Materialized Views**: For complex analytics queries
7. **Partitioning**: Time-based partitioning for responses table
