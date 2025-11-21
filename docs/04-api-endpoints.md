# API Endpoints Reference

## Overview

Survey Studio provides a RESTful API built on Next.js API Routes. All endpoints follow REST conventions and return JSON responses.

Internally, every endpoint follows the same layered flow:

- **API Route** – parses/validates input, checks authentication/authorisation, and maps HTTP to service calls.
- **Service** – contains business rules, orchestration, and error handling (no direct database access).
- **Repository** – encapsulates all Drizzle ORM queries, built from shared functional utilities.
- **Database** – PostgreSQL 18 as the single source of truth.

**Base URL**: `http://localhost:3000/api` (development)

## Authentication

### Session-Based Authentication

All protected endpoints require authentication via NextAuth.js session cookies.

**Headers:**

```md
Cookie: next-auth.session-token=<jwt-token>
```

**Authentication Flow:**

1. User logs in via `/api/auth/signin`
2. Server returns JWT in HTTP-only cookie
3. Subsequent requests automatically include cookie
4. Server validates JWT and extracts user information

---

## Endpoints

### Authentication

#### POST `/api/auth/signin`

Authenticate user and create session.

**Provider**: NextAuth.js built-in endpoint

**Request Body:**

```json
{
  "email": "admin@example.com",
  "password": "admin123456"
}
```

**Response (200 OK):**

```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "admin@example.com",
    "role": "admin"
  }
}
```

**Errors:**

- `401 Unauthorized` - Invalid credentials

---

#### POST `/api/auth/register`

Register a new user account.

**Access**: Public

**Request Body:**

```json
{
  "email": "newuser@example.com",
  "password": "securepassword123",
  "role": "user"
}
```

**Validation Rules:**

- Email: Valid email format
- Password: Minimum 8 characters
- Role: Optional, defaults to "user" (only admins can create admin users)

**Response (201 Created):**

```json
{
  "user": {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "email": "newuser@example.com",
    "role": "user",
    "createdAt": "2025-11-18T10:00:00.000Z"
  }
}
```

**Errors:**

- `400 Bad Request` - Validation error (invalid email, weak password)
- `409 Conflict` - Email already exists

---

#### POST `/api/auth/signout`

End user session.

**Provider**: NextAuth.js built-in endpoint

**Response (200 OK):**

```json
{
  "url": "/login"
}
```

---

### Surveys (Admin Only)

#### GET `/api/surveys`

List all surveys with metadata.

**Access**: Admin only

**Response (200 OK):**

```json
{
  "surveys": [
    {
      "id": "770e8400-e29b-41d4-a716-446655440002",
      "title": "Customer Satisfaction Survey",
      "config": {
        "title": "Customer Satisfaction Survey",
        "questions": [
          {
            "type": "rating",
            "name": "satisfaction",
            "label": "How satisfied are you?",
            "scale": 5
          }
        ]
      },
      "visibility": "public",
      "creatorId": "550e8400-e29b-41d4-a716-446655440000",
      "createdAt": "2025-11-18T10:00:00.000Z",
      "responseCount": 42,
      "assignedUserCount": 100
    }
  ]
}
```

**Metadata Fields:**

- `responseCount`: Total number of responses submitted
- `assignedUserCount`: For public surveys = total users; for private = assigned users

**Errors:**

- `401 Unauthorized` - Not authenticated
- `403 Forbidden` - Not an admin

---

#### POST `/api/surveys`

Create a new survey.

**Access**: Admin only

**Request Body:**

```json
{
  "title": "Employee Engagement Survey",
  "visibility": "private",
  "config": {
    "title": "Employee Engagement Survey",
    "questions": [
      {
        "type": "text",
        "name": "name",
        "label": "Your name",
        "validation": {
          "required": true
        }
      },
      {
        "type": "rating",
        "name": "engagement",
        "label": "Rate your engagement level",
        "scale": 10,
        "validation": {
          "required": true
        }
      },
      {
        "type": "multiple_choice",
        "name": "department",
        "label": "Select your department",
        "options": ["Engineering", "Marketing", "Sales", "HR"],
        "validation": {
          "required": true
        }
      },
      {
        "type": "textarea",
        "name": "feedback",
        "label": "Additional feedback",
        "validation": {
          "maxLength": 1000
        }
      }
    ]
  }
}
```

**Validation Rules:**

- Title must match config.title
- Title: 1-255 characters
- Config must conform to `SurveyConfigSchema`
- Visibility: "public" or "private"

**Response (201 Created):**

```json
{
  "survey": {
    "id": "880e8400-e29b-41d4-a716-446655440003",
    "title": "Employee Engagement Survey",
    "config": {
      /* full config */
    },
    "visibility": "private",
    "creatorId": "550e8400-e29b-41d4-a716-446655440000",
    "createdAt": "2025-11-18T11:00:00.000Z"
  }
}
```

**Errors:**

- `400 Bad Request` - Validation error
- `401 Unauthorized` - Not authenticated
- `403 Forbidden` - Not an admin

---

#### DELETE `/api/surveys/[id]`

Delete a survey and all associated responses.

**Access**: Admin only

**Parameters:**

- `id` (path): Survey UUID

**Response (200 OK):**

```json
{
  "message": "Survey and all responses deleted successfully",
  "deletedResponses": 42
}
```

**Errors:**

- `401 Unauthorized` - Not authenticated
- `403 Forbidden` - Not an admin
- `404 Not Found` - Survey doesn't exist

---

### User Surveys

#### GET `/api/user/surveys`

Get surveys available to current user (public + assigned).

**Access**: Authenticated users

**Response (200 OK):**

```json
{
  "surveys": [
    {
      "id": "770e8400-e29b-41d4-a716-446655440002",
      "title": "Customer Satisfaction Survey",
      "config": {
        /* survey config */
      },
      "visibility": "public",
      "creatorId": "550e8400-e29b-41d4-a716-446655440000",
      "createdAt": "2025-11-18T10:00:00.000Z",
      "isSubmitted": true,
      "submittedAt": "2025-11-18T12:30:00.000Z"
    },
    {
      "id": "880e8400-e29b-41d4-a716-446655440003",
      "title": "Employee Engagement Survey",
      "config": {
        /* survey config */
      },
      "visibility": "private",
      "creatorId": "550e8400-e29b-41d4-a716-446655440000",
      "createdAt": "2025-11-18T11:00:00.000Z",
      "isSubmitted": false,
      "submittedAt": null
    }
  ]
}
```

**Features:**

- Combines public surveys and surveys assigned to user
- Removes duplicates (if survey is both public and assigned)
- Includes submission status

**Errors:**

- `401 Unauthorized` - Not authenticated

---

### Responses

#### POST `/api/responses`

Submit a survey response.

**Access**: Authenticated users

**Request Body:**

```json
{
  "surveyId": "770e8400-e29b-41d4-a716-446655440002",
  "answers": {
    "name": "John Doe",
    "engagement": 8,
    "department": "Engineering",
    "feedback": "Great work environment!"
  }
}
```

**Validation:**

- Survey must exist
- User must have access (public or assigned)
- User cannot submit twice to the same survey
- Answers are validated against survey config on client-side

**Response (201 Created):**

```json
{
  "response": {
    "id": "990e8400-e29b-41d4-a716-446655440004",
    "surveyId": "770e8400-e29b-41d4-a716-446655440002",
    "userId": "660e8400-e29b-41d4-a716-446655440001",
    "answers": {
      "name": "John Doe",
      "engagement": 8,
      "department": "Engineering",
      "feedback": "Great work environment!"
    },
    "createdAt": "2025-11-18T13:00:00.000Z"
  }
}
```

**Errors:**

- `400 Bad Request` - Validation error or duplicate submission
- `401 Unauthorized` - Not authenticated
- `404 Not Found` - Survey doesn't exist

---

#### GET `/api/surveys/[id]/responses`

Get all responses for a specific survey, including basic survey metadata and user info.

**Access**: Admin only

**Parameters:**

- `id` (path): Survey UUID

**Response (200 OK):**

```json
{
  "survey": {
    "id": "770e8400-e29b-41d4-a716-446655440002",
    "title": "Customer Satisfaction Survey",
    "config": {
      "title": "Customer Satisfaction Survey",
      "questions": [
        {
          "type": "rating",
          "name": "satisfaction",
          "label": "How satisfied are you?",
          "scale": 5
        }
      ]
    }
  },
  "responses": [
    {
      "id": "990e8400-e29b-41d4-a716-446655440004",
      "answers": {
        "name": "John Doe",
        "engagement": 8,
        "department": "Engineering",
        "feedback": "Great work environment!"
      },
      "createdAt": "2025-11-18T13:00:00.000Z",
      "user": {
        "id": "660e8400-e29b-41d4-a716-446655440001",
        "email": "john.doe@example.com"
      }
    }
  ]
}
```

**Errors:**

- `401 Unauthorized` - Not authenticated
- `403 Forbidden` - Not an admin
- `404 Not Found` - Survey doesn't exist

---

#### DELETE `/api/surveys/[id]/responses/[responseId]`

Delete a specific response.

**Access**: Admin only

**Parameters:**

- `id` (path): Survey UUID
- `responseId` (path): Response UUID

**Response (200 OK):**

```json
{
  "message": "Response deleted successfully"
}
```

**Errors:**

- `401 Unauthorized` - Not authenticated
- `403 Forbidden` - Not an admin
- `404 Not Found` - Response doesn't exist

---

## Error Response Format

All errors follow a consistent format:

```json
{
  "error": "ValidationError",
  "message": "Email is required",
  "statusCode": 400,
  "timestamp": "2025-11-18T14:00:00.000Z"
}
```

### HTTP Status Codes

| Code  | Meaning               | Usage                                       |
| ----- | --------------------- | ------------------------------------------- |
| `200` | OK                    | Successful GET/DELETE                       |
| `201` | Created               | Successful POST (resource created)          |
| `400` | Bad Request           | Validation error, malformed request         |
| `401` | Unauthorized          | Not authenticated (missing/invalid session) |
| `403` | Forbidden             | Not authorised (insufficient permissions)   |
| `404` | Not Found             | Resource doesn't exist                      |
| `409` | Conflict              | Duplicate resource (e.g., email exists)     |
| `500` | Internal Server Error | Unexpected server error                     |

---

## Rate Limiting

**Current Status**: Not implemented

**Future Enhancement**: Consider implementing rate limiting for:

- Registration endpoint (prevent spam accounts)
- Response submission (prevent spam responses)
- Authentication endpoints (prevent brute force)

---

## CORS Configuration

**Current Status**: Same-origin only (Next.js default)

**Future Enhancement**: Configure CORS for external clients if needed

---

## Testing API Endpoints

### Using cURL

**Login:**

```bash
curl -X POST http://localhost:3000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123456"}' \
  -c cookies.txt
```

**Create Survey:**

```bash
curl -X POST http://localhost:3000/api/surveys \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "title": "Test Survey",
    "visibility": "public",
    "config": {
      "title": "Test Survey",
      "questions": [
        {
          "type": "text",
          "name": "feedback",
          "label": "Your feedback"
        }
      ]
    }
  }'
```

**Get User Surveys:**

```bash
curl http://localhost:3000/api/user/surveys \
  -b cookies.txt
```

### Using Postman/Insomnia

1. Set base URL: `http://localhost:3000/api`
2. Enable cookie jar for automatic session management
3. First request: POST to `/auth/signin` with credentials
4. Subsequent requests will include session cookie automatically

---

## API Versioning

**Current Version**: v1 (implicit, no version prefix)

**Future Enhancement**: Consider API versioning when making breaking changes:

- URL versioning: `/api/v2/surveys`
- Header versioning: `Accept: application/vnd.api+json; version=2`

---

## GraphQL Alternative

**Current Status**: REST API only

**Future Enhancement**: Consider GraphQL for:

- Flexible data fetching
- Reduced over-fetching
- Real-time subscriptions (survey response updates)
- Type-safe client queries

---

## WebSocket Support

**Current Status**: Not implemented

**Future Enhancement**: WebSocket endpoints for:

- Real-time response submissions (admin dashboard live updates)
- Survey assignment notifications
- Collaborative survey editing
