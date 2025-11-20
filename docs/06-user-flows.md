# User Flows & Features

## User Roles

Survey Studio has two primary user roles:

| Role      | Permissions                                                                    |
| --------- | ------------------------------------------------------------------------------ |
| **Admin** | Create, edit, delete surveys; view all responses; assign surveys; manage users |
| **User**  | View assigned/public surveys; submit responses; view own submissions           |

---

## Authentication Flow

### User Registration

```
┌─────────────────────────────────────────────────────────────┐
│                      START                                   │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
                 ┌──────────────────┐
                 │  /register page  │
                 └────────┬─────────┘
                          │
                          ▼
            ┌────────────────────────────┐
            │  User enters:              │
            │  - Email                   │
            │  - Password (min 8 chars)  │
            └────────┬───────────────────┘
                     │
                     ▼
        ┌────────────────────────┐
        │  Client validation     │
        │  (React Hook Form)     │
        └────────┬───────────────┘
                 │
                 ▼
           ┌──────────┐
           │  Valid?  │
           └──┬────┬──┘
              │    │
         No ──┘    └── Yes
         │              │
         ▼              ▼
    ┌─────────┐   ┌─────────────────┐
    │  Show   │   │ POST /api/auth/ │
    │ errors  │   │    register     │
    └─────────┘   └────────┬────────┘
                           │
                           ▼
                  ┌─────────────────┐
                  │  Email exists?  │
                  └──┬──────────┬───┘
                     │          │
                Yes ─┘          └─ No
                │                  │
                ▼                  ▼
         ┌──────────────┐   ┌──────────────┐
         │ 409 Conflict │   │ Create user  │
         │ Show error   │   │ Hash password│
         └──────────────┘   └──────┬───────┘
                                   │
                                   ▼
                            ┌──────────────┐
                            │ 201 Created  │
                            │ Auto-login   │
                            └──────┬───────┘
                                   │
                                   ▼
                            ┌──────────────┐
                            │  Redirect to │
                            │  /dashboard  │
                            └──────────────┘
```

### User Login

```
┌─────────────────────────────────────────────────────────────┐
│                      /login page                             │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
            ┌────────────────────────────┐
            │  User enters credentials   │
            │  - Email                   │
            │  - Password                │
            └────────┬───────────────────┘
                     │
                     ▼
        ┌────────────────────────────────┐
        │  POST /api/auth/signin         │
        │  (NextAuth.js)                 │
        └────────┬───────────────────────┘
                 │
                 ▼
     ┌───────────────────────────┐
     │  Validate credentials     │
     │  - Find user by email     │
     │  - Verify password hash   │
     └────────┬──────────────────┘
              │
              ▼
        ┌──────────┐
        │  Valid?  │
        └──┬────┬──┘
           │    │
      No ──┘    └── Yes
      │              │
      ▼              ▼
 ┌─────────┐   ┌──────────────┐
 │  401    │   │ Create JWT   │
 │ Invalid │   │ Set cookie   │
 └─────────┘   └──────┬───────┘
                      │
                      ▼
               ┌──────────────┐
               │  Redirect    │
               │  /dashboard  │
               └──────────────┘
```

---

## Admin User Flows

### 1. Create Survey

```
Dashboard → "Create Survey" button → /dashboard/surveys/new

┌───────────────────────────────────────────────┐
│         Survey Builder Form                   │
├───────────────────────────────────────────────┤
│  1. Basic Information                         │
│     - Title                                   │
│     - Visibility (public/private)             │
│                                               │
│  2. Add Questions (Dynamic)                   │
│     For each question:                        │
│     - Select question type                    │
│     - Enter label                             │
│     - Configure options (if applicable)       │
│     - Set validation rules                    │
│     - Add conditional logic (future)          │
│                                               │
│  3. Preview Survey                            │
│     - See form as users will see it           │
│                                               │
│  4. Submit                                    │
│     - Validate all fields                     │
│     - POST /api/surveys                       │
│     - Redirect to survey list                 │
└───────────────────────────────────────────────┘

Question Types Available:
├── Text Input (short answer)
├── Textarea (long answer)
├── Multiple Choice (radio buttons)
├── Multiple Select (checkboxes)
├── Multiple Select with "Other" option
├── Rating Scale (1-10)
└── Yes/No (boolean)
```

**Flow Diagram:**

```
Start
  │
  ▼
Enter Survey Title
  │
  ▼
Select Visibility
  │
  ▼
Add Question ──────┐
  │                │
  ├─ Select Type   │
  ├─ Enter Label   │
  ├─ Add Options   │ (if choice-based)
  ├─ Validation    │
  │                │
  ▼                │
More Questions? ───┘
  │ No
  ▼
Preview Survey
  │
  ▼
Valid? ───No──→ Show Errors
  │ Yes
  ▼
Submit (POST /api/surveys)
  │
  ▼
Success: Redirect to /dashboard/surveys
```

### 2. Assign Survey to Users

```
Survey List → Select Survey → "Assign Users" button

┌───────────────────────────────────────────────┐
│         Assignment Modal                      │
├───────────────────────────────────────────────┤
│  1. Search/Filter Users                       │
│     - Search by email                         │
│     - Filter by role                          │
│                                               │
│  2. Select Users (multi-select)               │
│     [✓] user1@example.com                     │
│     [✓] user2@example.com                     │
│     [ ] user3@example.com                     │
│                                               │
│  3. Assign Button                             │
│     - POST /api/surveys/{id}/assignments      │
│     - Show success message                    │
└───────────────────────────────────────────────┘
```

### 3. View Survey Responses

```
Survey List → Select Survey → "View Responses"

┌───────────────────────────────────────────────┐
│         Response Dashboard                    │
├───────────────────────────────────────────────┤
│  Summary Statistics:                          │
│  - Total Responses: 42                        │
│  - Completion Rate: 85%                       │
│  - Average Time: 3m 25s                       │
│                                               │
│  Response List:                               │
│  ┌─────────────────────────────────────────┐ │
│  │ Response #1                             │ │
│  │ Submitted by: user@example.com          │ │
│  │ Date: 2025-11-18 10:30                  │ │
│  │ [View Details] [Delete]                 │ │
│  └─────────────────────────────────────────┘ │
│  ┌─────────────────────────────────────────┐ │
│  │ Response #2                             │ │
│  │ ...                                     │ │
│  └─────────────────────────────────────────┘ │
│                                               │
│  Actions:                                     │
│  - Export as CSV                              │
│  - Export as JSON                             │
│  - View Analytics (future)                    │
└───────────────────────────────────────────────┘
```

**View Individual Response:**

```
┌───────────────────────────────────────────────┐
│         Response Details                      │
├───────────────────────────────────────────────┤
│  Metadata:                                    │
│  - Respondent: user@example.com               │
│  - Submitted: 2025-11-18 10:30:45             │
│  - Survey: Customer Satisfaction              │
│                                               │
│  Answers:                                     │
│  ┌─────────────────────────────────────────┐ │
│  │ Q: How satisfied are you?               │ │
│  │ A: 5/5 ⭐⭐⭐⭐⭐                          │ │
│  └─────────────────────────────────────────┘ │
│  ┌─────────────────────────────────────────┐ │
│  │ Q: What can we improve?                 │ │
│  │ A: Faster loading times                 │ │
│  └─────────────────────────────────────────┘ │
│                                               │
│  [Delete Response] [Back to List]             │
└───────────────────────────────────────────────┘
```

### 4. Delete Survey

```
Survey List → Select Survey → Delete icon/button
  │
  ▼
┌────────────────────────────┐
│  Confirmation Dialog       │
│  "Delete this survey and   │
│   all 42 responses?"       │
│  [Cancel] [Delete]         │
└────────┬───────────────────┘
         │ Confirm
         ▼
DELETE /api/surveys/{id}
         │
         ▼
    ┌─────────┐
    │ Success │
    │ message │
    └────┬────┘
         │
         ▼
   Refresh list
```

---

## Regular User Flows

### 1. View Available Surveys

```
Login → Dashboard → "My Surveys" tab

┌───────────────────────────────────────────────┐
│         Survey List (User View)               │
├───────────────────────────────────────────────┤
│  Filter: [All] [Submitted] [Pending]          │
│                                               │
│  Public Surveys:                              │
│  ┌─────────────────────────────────────────┐ │
│  │ Customer Feedback                       │ │
│  │ Status: Not Submitted                   │ │
│  │ [Take Survey]                           │ │
│  └─────────────────────────────────────────┘ │
│                                               │
│  Assigned Surveys:                            │
│  ┌─────────────────────────────────────────┐ │
│  │ Employee Engagement                     │ │
│  │ Status: ✓ Submitted (2025-11-15)        │ │
│  │ [View My Response]                      │ │
│  └─────────────────────────────────────────┘ │
│  ┌─────────────────────────────────────────┐ │
│  │ Team Feedback                           │ │
│  │ Status: Not Submitted                   │ │
│  │ [Take Survey]                           │ │
│  └─────────────────────────────────────────┘ │
└───────────────────────────────────────────────┘
```

### 2. Submit Survey Response

```
Survey List → "Take Survey" → Dynamic Survey Form

┌───────────────────────────────────────────────┐
│         Survey Form                           │
├───────────────────────────────────────────────┤
│  Title: Customer Satisfaction Survey          │
│                                               │
│  Question 1 of 5:                             │
│  How satisfied are you with our service?      │
│  ○ Very Dissatisfied                          │
│  ○ Dissatisfied                               │
│  ● Neutral                                    │
│  ○ Satisfied                                  │
│  ○ Very Satisfied                             │
│                                               │
│  [Previous] [Next]                            │
│                                               │
│  Progress: ████████░░ 80%                     │
└───────────────────────────────────────────────┘

Final Step:
  │
  ▼
Review Answers
  │
  ▼
[Submit Response]
  │
  ▼
POST /api/responses
  │
  ▼
Success → Redirect to survey list
          Show confirmation message
```

**Detailed Flow:**

```
Start
  │
  ▼
Render Question 1
  │
  ▼
User Answers ──→ Validate
  │
  ▼
Next Question?
  │ Yes
  ├───→ Render Next
  │     Question
  │
  │ No (Last Question)
  ▼
Review All Answers
  │
  ▼
[Submit]
  │
  ▼
Client Validation
  │
  ├─ Missing required? → Show Error
  ├─ Invalid format? → Show Error
  │
  ▼ All Valid
POST /api/responses
  │
  ├─ Already submitted? → 400 Error
  ├─ Survey not found? → 404 Error
  │
  ▼ Success
Show Success Message
  │
  ▼
Redirect to Dashboard
```

### 3. View Submitted Response

```
Survey List → Submitted Survey → "View My Response"

┌───────────────────────────────────────────────┐
│         My Response                           │
├───────────────────────────────────────────────┤
│  Survey: Customer Satisfaction                │
│  Submitted: 2025-11-18 10:30                  │
│                                               │
│  Your Answers:                                │
│  ┌─────────────────────────────────────────┐ │
│  │ Q: How satisfied are you?               │ │
│  │ A: Very Satisfied                       │ │
│  └─────────────────────────────────────────┘ │
│  ┌─────────────────────────────────────────┐ │
│  │ Q: Additional comments?                 │ │
│  │ A: Great service, keep it up!           │ │
│  └─────────────────────────────────────────┘ │
│                                               │
│  [Back to Surveys]                            │
└───────────────────────────────────────────────┘

Note: Users cannot edit after submission
```

---

## Feature Details

### Dynamic Form Rendering

The survey form is rendered dynamically based on the survey configuration:

**Example Survey Config:**

```json
{
  "title": "Customer Feedback",
  "questions": [
    {
      "type": "rating",
      "name": "satisfaction",
      "label": "How satisfied are you?",
      "scale": 5,
      "validation": { "required": true }
    },
    {
      "type": "multiple_choice",
      "name": "reason",
      "label": "Primary reason for rating?",
      "options": ["Quality", "Price", "Service", "Other"],
      "condition": {
        "name": "satisfaction",
        "value": [1, 2]
      }
    }
  ]
}
```

**Rendering Logic:**

1. Parse survey config from API response
2. For each question:
   - Check condition (if exists)
   - Render appropriate component based on type
   - Apply validation rules
   - Collect answer in form state
3. On submit, send all answers to API

### Conditional Questions (Future)

Questions can be conditionally shown based on previous answers:

```
Q1: Are you satisfied?
    → Yes / No

Q2: (Only shown if Q1 = No)
    What went wrong?
    → Text input

Q3: (Only shown if Q1 = Yes)
    What did we do well?
    → Text input
```

### Validation Rules

Each question can have validation:

```typescript
validation: {
  required: boolean // Must answer
  minLength: number // Minimum text length
  maxLength: number // Maximum text length
  minChoices: number // Minimum selections (multi-select)
  maxChoices: number // Maximum selections (multi-select)
}
```

**Client-side validation** (React Hook Form):

- Real-time feedback
- Prevents submission
- Shows error messages

**Server-side validation** (Zod):

- Verifies data structure
- Prevents malicious input
- Returns detailed errors

---

## Navigation Structure

```
Public Routes:
├── / (landing page)
├── /login
└── /register

Protected Routes (Authenticated):
├── /dashboard
│   ├── Overview (summary)
│   ├── My Surveys (user view)
│   └── Profile (future)
│
└── Admin Routes (Admin only):
    ├── /dashboard/surveys
    │   ├── All Surveys list
    │   ├── /new (create survey)
    │   └── /[id] (edit survey, future)
    │
    ├── /dashboard/surveys/[id]/responses
    │   ├── Response list
    │   └── /[responseId] (view details)
    │
    └── /dashboard/users (future)
        └── User management
```

---

## Error Handling Flow

```
User Action
  │
  ▼
API Request
  │
  ├─ Network Error → Show "Connection failed"
  │
  ├─ 400 Bad Request → Show validation errors
  │
  ├─ 401 Unauthorized → Redirect to /login
  │
  ├─ 403 Forbidden → Show "Access denied"
  │
  ├─ 404 Not Found → Show "Resource not found"
  │
  ├─ 500 Server Error → Show "Something went wrong"
  │
  └─ Success → Continue flow
```

---

## Accessibility Features

1. **Keyboard Navigation**
   - Tab through all form elements
   - Enter to submit
   - Escape to close modals

2. **Screen Reader Support**
   - ARIA labels on all inputs
   - Semantic HTML
   - Error announcements

3. **Visual Indicators**
   - Focus states
   - Error highlights
   - Success confirmations

4. **Responsive Design**
   - Mobile-friendly
   - Touch-friendly buttons
   - Readable font sizes

---

## Performance Considerations

1. **Lazy Loading**
   - Survey list paginated
   - Response list paginated
   - Images lazy-loaded

2. **Caching**
   - TanStack Query caches API responses
   - Stale-while-revalidate strategy

3. **Optimistic Updates**
   - Form submissions show immediate feedback
   - Background sync

4. **Code Splitting**
   - Route-based splitting
   - Component-level splitting for heavy components

---

## Future Enhancements

### User Flows to Add

1. **Survey Templates**
   - Pre-built survey templates
   - Industry-specific templates
   - Customise and deploy

2. **Analytics Dashboard**
   - Visual charts (pie, bar, line)
   - Response trends over time
   - Demographic breakdowns

3. **Survey Cloning**
   - Duplicate existing surveys
   - Modify and redeploy

4. **Response Editing**
   - Allow users to edit before deadline
   - Track revision history

5. **Email Notifications**
   - Notify users of new assignments
   - Remind about pending surveys
   - Notify admins of new responses

6. **Advanced Filtering**
   - Filter responses by date range
   - Filter by user demographics
   - Export filtered data

7. **Collaborative Editing**
   - Multiple admins edit survey
   - Real-time collaboration
   - Version control

8. **Survey Scheduling**
   - Schedule future publication
   - Auto-close after deadline
   - Recurring surveys

9. **Anonymous Responses**
   - Option for anonymous submissions
   - Track completion without identity

10. **Multi-language Support**
    - Translate surveys
    - Localised UI
    - RTL support
