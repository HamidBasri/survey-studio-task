# Dashboard Layout Components

This document describes the reusable layout components created to ensure consistency across all dashboard pages.

## Components

### 1. DashboardLayout

A wrapper component that provides consistent page structure across all dashboard pages.

**Location:** `src/components/dashboard/dashboard-layout.tsx`

**Props:**

- `children` (ReactNode) - Main content to display
- `header` (ReactNode, optional) - Header component (typically DashboardHeader)
- `maxWidth` ('sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | 'full', default: '7xl') - Maximum width of the main content area
- `noPadding` (boolean, default: false) - Remove default padding from main content

**Features:**

- Consistent `min-h-screen` and `bg-gray-50` background
- Responsive padding and max-width constraints
- Flexible content area

**Example:**

```tsx
<DashboardLayout header={<DashboardHeader title="My Page" />} maxWidth="4xl">
  <div>Page content here</div>
</DashboardLayout>
```

### 2. DashboardHeader

A consistent header component with modern styling and flexible content options.

**Location:** `src/components/dashboard/dashboard-header.tsx`

**Props:**

- `title` (string, required) - Page title
- `subtitle` (string, optional) - Subtitle or description
- `icon` (LucideIcon, optional) - Icon to display next to title
- `iconClassName` (string, default: 'text-blue-600') - Custom icon styling
- `showBackButton` (boolean, default: false) - Show "Back to Dashboard" button
- `backHref` (string, default: '/dashboard') - URL for back button
- `actions` (ReactNode, optional) - Action buttons or elements (right side)
- `children` (ReactNode, optional) - Additional content below title/subtitle

**Features:**

- Fixed height: `h-16 sm:h-20` for consistency
- Modern glassmorphism effect: `bg-white/95 backdrop-blur-sm`
- Responsive icon display (hidden on small screens)
- Flexible action area for buttons, user info, etc.
- Automatic back button with pill-style design

**Example:**

```tsx
<DashboardHeader
  title="Create New Survey"
  subtitle="Enter your survey configuration"
  icon={FileJson}
  showBackButton
  actions={<Button onClick={handleSave}>Save</Button>}
/>
```

## Usage Across Pages

### Main Dashboard (`/dashboard`)

```tsx
<DashboardLayout
  header={
    <DashboardHeader
      title="Dashboard"
      subtitle={isAdmin ? 'Admin Panel' : 'User Portal'}
      icon={LayoutDashboard}
      actions={<UserInfo />}
    />
  }
>
  {content}
</DashboardLayout>
```

### New Survey Page (`/dashboard/surveys/new`)

```tsx
<DashboardLayout
  header={
    <DashboardHeader
      title="Create New Survey"
      subtitle="Enter your survey JSON configuration..."
      icon={FileJson}
      showBackButton
    />
  }
>
  {content}
</DashboardLayout>
```

### Survey Responses (`/dashboard/surveys/[id]`)

```tsx
<DashboardLayout
  header={
    <DashboardHeader
      title={surveyTitle}
      subtitle={`${count} responses`}
      icon={ClipboardList}
      showBackButton
    />
  }
>
  {content}
</DashboardLayout>
```

### Survey Submit (`/dashboard/surveys/[id]/submit`)

```tsx
<DashboardLayout
  header={
    <DashboardHeader
      title={survey.title}
      subtitle="Complete the survey below"
      icon={ClipboardEdit}
      showBackButton
    />
  }
  maxWidth="4xl"
>
  {content}
</DashboardLayout>
```

## Benefits

1. **Consistency** - All pages share the same header height, styling, and layout structure
2. **Maintainability** - Changes to header/layout can be made in one place
3. **Efficiency** - Reduced code duplication across pages
4. **Flexibility** - Props allow customization while maintaining consistency
5. **Modern Design** - Professional, clean UI with glassmorphism effects
6. **Responsive** - Mobile-first design with responsive breakpoints

## Design Patterns

### Header Height

All headers use fixed heights for consistency:

- Mobile: `h-16` (64px)
- Desktop: `sm:h-20` (80px)

### Max Width

Default max-width is `7xl` (80rem / 1280px), but can be customized per page:

- Forms/Surveys: `4xl` (56rem / 896px)
- Dashboard/Lists: `7xl` (80rem / 1280px)

### Icon Treatment

Icons are displayed in a subtle container:

- Background: `bg-blue-50`
- Icon color: `text-blue-600`
- Hidden on mobile: `hidden sm:inline-flex`

### Back Button

Consistent pill-style design:

- Rounded: `rounded-full`
- Border: `border border-gray-200`
- Hover states for better UX

## Future Enhancements

Consider adding:

- Breadcrumb navigation support
- Tabs support in header
- Sidebar component for multi-section pages
- Loading states for headers
- Toast/notification system integration
