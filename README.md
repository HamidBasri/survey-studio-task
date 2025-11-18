# Survey Studio

> A modern, full-stack survey management platform with role-based access control and dynamic form generation.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-16.0-black.svg)](https://nextjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-18-blue.svg)](https://www.postgresql.org/)
[![Bun](https://img.shields.io/badge/Bun-1.x-orange.svg)](https://bun.sh/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

---

## 📋 Overview

**Survey Studio** is a production-ready web application for creating, managing, and analysing surveys. Built with modern technologies and best practices, it provides a robust platform for both survey administrators and respondents.

### Key Features

✅ **Survey Management** - Create surveys with 7 question types, configure visibility
✅ **Role-Based Access** - Admin and User roles with distinct permissions
✅ **Dynamic Forms** - Flexible question types with validation
✅ **Response Analytics** - View and analyse survey responses
✅ **Type-Safe** - Full TypeScript coverage with runtime validation
✅ **Production-Ready** - Docker deployment, structured logging, error handling
✅ **Modern UI** - Responsive design with shadcn/ui and TailwindCSS

### Question Types Supported

- Text Input (short answer)
- Textarea (long answer)
- Multiple Choice (single selection)
- Multiple Select (multiple selections)
- Multiple Select with "Other" option
- Rating Scale (1-10)
- Yes/No (boolean)

---

## 🚀 Quick Start

### Prerequisites

- [Bun](https://bun.sh/) 1.0+
- [Docker](https://www.docker.com/) 20.10+
- [Docker Compose](https://docs.docker.com/compose/) 2.0+

### Installation

```bash
# Clone repository
git clone <repository-url>
cd survey-studio

# Create environment file
cp .env.example .env

# Generate AUTH_SECRET
openssl rand -base64 32
# Add to .env file

# Start development environment
./run.sh dev
```

### Initial Setup

```bash
# In a new terminal, apply database migrations
./run.sh db-migrate

# Seed database with sample data
./run.sh seed
```

### Access the Application

🌐 **Application**: <http://localhost:3000>
🔐 **Admin Login**: `admin@example.com` / `admin123456`
👤 **User Login**: `user@example.com` / `user123456`

---

## 📚 Documentation

Comprehensive documentation is available in the [`/docs`](./docs) directory:

| Document | Description |
|----------|-------------|
| [**01-Overview**](./docs/01-overview.md) | Project overview, goals, and technology stack |
| [**02-Architecture**](./docs/02-architecture.md) | System architecture, design patterns, and flow diagrams |
| [**03-Database**](./docs/03-database.md) | Database schema, relationships, and ER diagrams |
| [**04-API Endpoints**](./docs/04-api-endpoints.md) | Complete API reference with examples |
| [**05-Setup Guide**](./docs/05-setup-guide.md) | Development setup, deployment, and CLI commands |
| [**06-User Flows**](./docs/06-user-flows.md) | User journeys and feature walkthroughs |
| [**07-Checklist & Roadmap**](./docs/07-checklist-roadmap.md) | Project status, roadmap, and AI/ML opportunities |

---

## 🛠️ Technology Stack

### Frontend

- **Next.js 16** - React framework with App Router
- **React 19** - UI library
- **TypeScript 5** - Type-safe JavaScript
- **TailwindCSS 4** - Utility-first CSS
- **shadcn/ui** - High-quality React components
- **TanStack Query** - Data synchronisation
- **React Hook Form** - Form management
- **Zod** - Schema validation

### Backend

- **Next.js API Routes** - Serverless endpoints
- **NextAuth.js 5** - Authentication
- **Drizzle ORM** - Type-safe database queries
- **PostgreSQL 18** - Relational database
- **Bcrypt** - Password hashing

### DevOps

- **Docker & Docker Compose** - Containerisation
- **Bun** - JavaScript runtime and package manager
- **ESLint & Prettier** - Code quality
- **Drizzle Kit** - Database migrations

---

## 📁 Project Structure

```
survey-studio/
├── docs/                      # Comprehensive documentation
│   ├── 01-overview.md
│   ├── 02-architecture.md
│   ├── 03-database.md
│   ├── 04-api-endpoints.md
│   ├── 05-setup-guide.md
│   ├── 06-user-flows.md
│   └── 07-checklist-roadmap.md
│
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── (auth)/           # Authentication routes
│   │   ├── (private)/        # Protected routes
│   │   ├── (public)/         # Public routes
│   │   └── api/              # API endpoints
│   │
│   ├── components/            # React components
│   │   ├── dashboard/
│   │   ├── survey/
│   │   └── ui/               # shadcn/ui components
│   │
│   └── lib/                   # Core libraries
│       ├── auth/             # Authentication logic
│       ├── config/           # Configuration
│       ├── db/               # Database (schema, client)
│       ├── services/         # Business logic
│       └── repositories/     # Data access
│
├── drizzle/                   # Database migrations
├── public/                    # Static assets
├── docker-compose.yml         # Production Docker config
├── docker-compose.dev.yml     # Development Docker config
├── Dockerfile                 # Multi-stage build
├── run.sh                     # CLI helper script
└── package.json               # Dependencies
```

---

## 🎯 Core Workflows

### Admin: Create Survey

```
Dashboard → Create Survey → Configure questions → Set visibility → Submit
```

### User: Submit Response

```
Dashboard → My Surveys → Select survey → Fill form → Submit
```

### Admin: View Responses

```
Dashboard → Surveys → View Responses → Analyse data
```

---

## 📸 Screenshots

Below are selected screenshots demonstrating key parts of the application.

### Dashboard & Navigation

![Dashboard and navigation](./docs/assets/Screenshot%202025-1.png)

### New Survey and Builder Flow

![New survey creation flow](./docs/assets/Screenshot%202025-2.png)
![Survey builder configuration](./docs/assets/Screenshot%202025-3.png)

### Authentication pages

![Survey list and actions](./docs/assets/Screenshot%202025-4.png)
![Survey details and controls](./docs/assets/Screenshot%202025-5.png)

### User Dashboard

![Responses overview](./docs/assets/Screenshot%202025-6.png)
![Response details view](./docs/assets/Screenshot%202025-7.png)
![Additional responses and UI](./docs/assets/Screenshot%202025-8.png)

---

## ⚡ CLI Commands

### Development

```bash
./run.sh dev          # Start development environment
./run.sh dev-down     # Stop development environment
./run.sh db-studio    # Start Drizzle Studio (DB GUI at http://localhost:8080)
./run.sh seed         # Seed database with default admin and user accounts
./run.sh lint         # Run linter
./run.sh format       # Format code
```

#### User seeds

To populate the database with default admin and user demo accounts:

```bash
# Make sure the dev environment is running
./run.sh dev

# In a separate terminal, run the seed script
./run.sh seed
```

After seeding, you can log in using the credentials listed in **Access the Application** above.

#### Drizzle Studio

To launch the Drizzle Studio interface:

```bash
# Make sure the dev environment is running
./run.sh dev

# In a separate terminal, start Drizzle Studio
./run.sh db-studio
```

Then open <https://local.drizzle.studio> in your browser to access the Drizzle Studio UI.

### Database Management

```bash
./run.sh db-generate  # Generate migration
./run.sh db-migrate   # Apply migrations
./run.sh reset-db     # Reset database (⚠️ destroys data)
```

### Production

```bash
./run.sh prod-build   # Build production images
./run.sh prod-up      # Start production environment
./run.sh prod-down    # Stop production environment
```

---

## 🔒 Security Features

- **Password Hashing** - Bcrypt with salt rounds
- **JWT Sessions** - Secure, HTTP-only cookies
- **Role-Based Access Control** - Admin/User permissions
- **Input Validation** - Client and server-side with Zod
- **SQL Injection Prevention** - Parameterised queries via ORM
- **XSS Protection** - React automatic escaping
- **Environment Validation** - Zod schema for env vars

---

## 🤖 AI/ML Opportunities

Survey Studio has significant potential for AI/ML integration:

### Implemented with LLM Assistance

- Project architecture and design
- Boilerplate code generation
- Best practices implementation

### Future AI Features

1. **Question Generation** - Auto-generate survey questions from topics
2. **Response Summarisation** - Summarise hundreds of text responses
3. **Sentiment Analysis** - Analyse response sentiment
4. **Smart Categorisation** - Auto-categorise responses into themes
5. **Natural Language Queries** - Query data in plain English
6. **Anomaly Detection** - Detect fraudulent responses
7. **Predictive Analytics** - Predict completion rates
8. **Multilingual Support** - Auto-translate surveys

See [07-Checklist & Roadmap](./docs/07-checklist-roadmap.md) for detailed AI enhancement opportunities.

---

## 🧪 Testing

### Current Status

- ⏳ Test suite pending implementation

### Planned Tests

- Unit tests (Vitest)
- Integration tests
- E2E tests (Playwright)
- API endpoint tests

---

## 📦 Deployment

### Development

```bash
./run.sh dev
```

### Production (Docker)

```bash
# Build and start
./run.sh prod-build
./run.sh prod-up

# Apply migrations
docker exec survey-studio-app bunx drizzle-kit migrate
```

### Platform Deployment

- **Vercel** - Native Next.js support (requires external PostgreSQL)
- **Railway** - Full-stack deployment with PostgreSQL
- **Render** - Web service + managed database
- **AWS/GCP/Azure** - Kubernetes or container services

See [05-Setup Guide](./docs/05-setup-guide.md) for detailed deployment instructions.

---

## 🔧 Configuration

### Environment Variables

Required variables in `.env`:

```env
# Database
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=localhost
DB_PORT=5432
DB_NAME=survey_studio

# Application
APP_PORT=3000
NODE_ENV=development

# Authentication (generate with: openssl rand -base64 32)
AUTH_SECRET=your-secret-key-here

# Logging (optional)
LOG_LEVEL=info
```

---

## 🗺️ Roadmap

### ✅ Phase 0: MVP (Completed)

- Core survey CRUD
- User authentication
- Response management
- Admin dashboard

### 🚧 Phase 1: Core Improvements

- [ ] Comprehensive test suite
- [ ] Survey editing and versioning
- [ ] User profile management
- [ ] Response export (CSV/Excel)
- [ ] Advanced filtering

### 📋 Phase 2: Analytics & AI

- [ ] Analytics dashboard with charts
- [ ] AI-powered question generation
- [ ] Response summarisation (LLM)
- [ ] Sentiment analysis
- [ ] Trend detection

### 🚀 Phase 3: Collaboration

- [ ] Team collaboration features
- [ ] Survey scheduling
- [ ] Email notifications
- [ ] Webhook integrations

### 🏢 Phase 4: Enterprise

- [ ] Multi-tenancy
- [ ] SSO integration
- [ ] Advanced security features
- [ ] Audit logs

See [07-Checklist & Roadmap](./docs/07-checklist-roadmap.md) for complete roadmap.

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow existing code style (ESLint + Prettier)
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed
- Use British English for naming and comments

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👤 Author

**Survey Studio** was developed leveraging modern development practices and AI-assisted coding for rapid prototyping and implementation of best practices.

- **Name**: Hamid Basri
- **Email**: <dev.hamidbasri@gmail.com>
- **GitHub**: <https://github.com/HamidBasri>

---

## 🙏 Acknowledgements

- [Next.js](https://nextjs.org/) - The React Framework
- [shadcn/ui](https://ui.shadcn.com/) - Beautiful component library
- [Drizzle ORM](https://orm.drizzle.team/) - Type-safe database toolkit
- [NextAuth.js](https://next-auth.js.org/) - Authentication for Next.js
- [TailwindCSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Bun](https://bun.sh/) - Fast JavaScript runtime
- [Lucide Icons](https://lucide.dev/) - Beautiful icon library

---

## 📞 Support

For issues and questions:

- 📖 Check the [documentation](./docs)
- 🐛 [Open an issue](https://github.com/your-repo/survey-studio/issues)
- 💬 Start a [discussion](https://github.com/your-repo/survey-studio/discussions)

---

## 📈 Project Status

**Version**: 0.1.0 (MVP)
**Status**: ✅ Production-ready foundation
**Last Updated**: November 2025

The core features are implemented and stable. See [07-Checklist & Roadmap](./docs/07-checklist-roadmap.md) for detailed status and future plans.

---

<p align="center">
  Made with ❤️ using Next.js, TypeScript, and modern web technologies
</p>
