# Setup & Deployment Guide

## Prerequisites

Before setting up Survey Studio, ensure you have the following installed:

| Tool               | Minimum Version | Purpose                                |
| ------------------ | --------------- | -------------------------------------- |
| **Bun**            | 1.0+            | JavaScript runtime and package manager |
| **Docker**         | 20.10+          | Containerisation platform              |
| **Docker Compose** | 2.0+            | Multi-container orchestration          |
| **Node.js**        | 20+             | Alternative runtime (optional)         |
| **Git**            | 2.0+            | Version control                        |

### Installing Bun

**macOS/Linux:**

```bash
curl -fsSL https://bun.sh/install | bash
```

**Verify installation:**

```bash
bun --version
```

### Installing Docker

Download and install Docker Desktop from: <https://www.docker.com/products/docker-desktop>

**Verify installation:**

```bash
docker --version
docker compose version
```

---

## Project Setup

### 1. Clone Repository

```bash
git clone <repository-url>
cd survey-studio
```

### 2. Environment Configuration

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

**Required environment variables:**

```env
# Database Configuration
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=localhost
DB_PORT=5432
DB_NAME=survey_studio

# Application Configuration
APP_PORT=3000
NODE_ENV=development

# Authentication
AUTH_SECRET=your-super-secret-jwt-key-change-this-in-production

# Logging (optional)
LOG_LEVEL=info
```

**Generate AUTH_SECRET:**

```bash
openssl rand -base64 32
```

### 3. Install Dependencies

```bash
bun install
```

This will install all dependencies listed in `package.json`.

---

## Development Environment

### Option 1: Docker (Recommended)

**Start development environment:**

```bash
./run.sh dev
```

This command:

1. Starts PostgreSQL container
2. Starts Next.js dev server in container
3. Watches for file changes (hot reload)
4. Exposes app on `http://localhost:3000`

**Stop development environment:**

```bash
./run.sh dev-down
```

**View logs:**

```bash
docker compose -f docker-compose.dev.yml logs -f
```

### Option 2: Local Development (without Docker)

**Start PostgreSQL manually:**

```bash
# Using Docker for database only
docker run -d \
  --name survey-db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=survey_studio \
  -p 5432:5432 \
  postgres:18
```

**Run application:**

```bash
bun run dev
```

Application will be available at `http://localhost:3000`.

---

## Database Setup

### First-Time Setup

After starting the development environment, initialise the database:

**1. Generate migration files** (if not already present):

```bash
./run.sh db-generate
```

This creates migration SQL files in `/drizzle/` based on your schema definitions.

**2. Apply migrations:**

```bash
./run.sh db-migrate
```

This executes the migration files against your PostgreSQL database.

**3. Seed the database:**

```bash
./run.sh seed
```

This populates the database with initial data:

- **Admin user**: `admin@example.com` / `admin123456`
- **Regular user**: `user@example.com` / `user123456`
- **Sample surveys**: 3 surveys (1 public, 2 private)

### Database Management Commands

**Open Drizzle Studio** (visual database browser):

```bash
./run.sh db-studio
```

Access at: `https://local.drizzle.studio`

**Reset database** (⚠️ Destroys all data):

```bash
./run.sh reset-db
```

This will:

1. Stop containers
2. Delete volumes
3. Restart containers
4. Recreate empty database

After reset, you need to run migrations and seed again.

**Re-seed database** (safe mode - replaces only seed data):

```bash
./run.sh seed
```

The seed script intelligently:

- Deletes only previously seeded data
- Preserves manually created records
- Re-inserts fresh seed data

---

## Development Workflow

### Step-by-Step First Run

```bash
# 1. Clone and setup
git clone <repository-url>
cd survey-studio
cp .env.example .env

# 2. Edit .env and set AUTH_SECRET
nano .env

# 3. Start Docker environment
./run.sh dev

# 4. In a new terminal, run migrations
./run.sh db-migrate

# 5. Seed database
./run.sh seed

# 6. Open browser
open http://localhost:3000

# 7. Login as admin
# Email: admin@example.com
# Password: admin123456
```

### Making Schema Changes

**1. Modify schema files:**

```bash
src/lib/db/schema/
├── user.ts
├── survey.ts
├── response.ts
└── surveyAssignment.ts
```

**2. Generate migration:**

```bash
./run.sh db-generate
```

Drizzle Kit will create a new migration file in `/drizzle/`.

**3. Review migration:**

```bash
cat drizzle/0001_new_migration.sql
```

**4. Apply migration:**

```bash
./run.sh db-migrate
```

**5. Update seed script** (if needed):

```bash
src/lib/db/seed.ts
```

---

## Code Quality Tools

### Linting

**Run ESLint:**

```bash
./run.sh lint
```

**Auto-fix issues:**

```bash
bun run lint:fix
```

### Formatting

**Format all files:**

```bash
./run.sh format
```

**Check formatting:**

```bash
bun run format:check
```

### Pre-commit Workflow

Before committing:

```bash
./run.sh format
./run.sh lint
```

---

## Production Deployment

### Building for Production

**1. Build Docker image:**

```bash
./run.sh prod-build
```

This creates an optimised production image using multi-stage builds:

- Dependencies layer (cached)
- Build layer (Next.js optimised build)
- Runtime layer (minimal, production-ready)

**2. Configure production environment:**

Create `.env.production`:

```env
# Database (use external managed database)
DATABASE_URL=postgresql://user:password@db-host:5432/survey_studio

# Application
NODE_ENV=production
APP_PORT=3000

# Authentication (MUST be different from development)
AUTH_SECRET=<production-secret-from-secure-vault>

# Logging
LOG_LEVEL=warn
```

**3. Start production environment:**

```bash
./run.sh prod-up
```

**4. Run migrations:**

```bash
docker exec survey-studio-app bunx drizzle-kit migrate
```

**5. Seed database** (optional, only for initial setup):

```bash
docker exec survey-studio-app bun run src/lib/db/seed.ts
```

### Production Checklist

- [ ] Set strong `AUTH_SECRET` (use secrets manager)
- [ ] Use managed PostgreSQL (AWS RDS, DigitalOcean, etc.)
- [ ] Enable SSL/TLS for database connections
- [ ] Configure reverse proxy (nginx, Caddy)
- [ ] Set up HTTPS with valid certificate
- [ ] Configure CORS if needed
- [ ] Set up monitoring and logging
- [ ] Configure automated backups
- [ ] Set resource limits in Docker Compose
- [ ] Use environment-specific `.env` files
- [ ] Never commit `.env` to version control

### Deployment Options

#### 1. Docker Compose (VPS/Cloud Server)

```bash
# On your server
git clone <repository-url>
cd survey-studio
nano .env  # Configure production settings
./run.sh prod-build
./run.sh prod-up
```

#### 2. Kubernetes

Create Kubernetes manifests for:

- PostgreSQL StatefulSet (or use managed database)
- Next.js Deployment
- Service (LoadBalancer or Ingress)
- ConfigMap for non-sensitive config
- Secret for sensitive data

#### 3. Platform-as-a-Service

**Vercel** (Next.js native):

- Connect GitHub repository
- Set environment variables in dashboard
- Auto-deploys on push to main branch
- **Note**: Requires external PostgreSQL (Vercel Postgres, Supabase, etc.)

**Railway**:

- Connect repository
- Add PostgreSQL service
- Configure environment variables
- Auto-deploys with hot reload

**Render**:

- Create Web Service from repository
- Add PostgreSQL database
- Set environment variables
- Configure build and start commands

---

## CLI Commands Reference

### Project Script (`./run.sh`)

| Command       | Description                            |
| ------------- | -------------------------------------- |
| `dev`         | Start development environment (Docker) |
| `dev-down`    | Stop development environment           |
| `prod-build`  | Build production Docker images         |
| `prod-up`     | Start production environment           |
| `prod-down`   | Stop production environment            |
| `lint`        | Run ESLint                             |
| `format`      | Format code with Prettier              |
| `db-generate` | Generate Drizzle migrations            |
| `db-migrate`  | Apply Drizzle migrations               |
| `db-studio`   | Open Drizzle Studio                    |
| `seed`        | Run database seed script               |
| `clean`       | Remove `.next` build artefacts         |
| `reset-db`    | Drop and recreate database (dev only)  |
| `help`        | Show all available commands            |

### NPM/Bun Scripts

| Command                | Description                     |
| ---------------------- | ------------------------------- |
| `bun run dev`          | Start Next.js dev server        |
| `bun run build`        | Build Next.js for production    |
| `bun run start`        | Start production server         |
| `bun run lint`         | Run ESLint                      |
| `bun run lint:fix`     | Fix ESLint issues automatically |
| `bun run format`       | Format code                     |
| `bun run format:check` | Check code formatting           |

### Docker Commands

| Command                                                 | Description              |
| ------------------------------------------------------- | ------------------------ |
| `docker compose -f docker-compose.dev.yml up`           | Start dev containers     |
| `docker compose -f docker-compose.dev.yml down`         | Stop dev containers      |
| `docker compose -f docker-compose.dev.yml logs -f`      | View logs                |
| `docker exec -it app_dev sh`                            | Shell into app container |
| `docker exec -it db_dev psql -U postgres survey_studio` | PostgreSQL CLI           |
| `docker volume ls`                                      | List Docker volumes      |
| `docker volume rm <volume-name>`                        | Remove volume            |

### Database Commands

**Direct PostgreSQL access:**

```bash
docker exec -it db_dev psql -U postgres survey_studio
```

**Common PostgreSQL commands:**

```sql
\dt              -- List tables
\d users         -- Describe table
\l               -- List databases
\q               -- Quit
```

---

## Troubleshooting

### Port Already in Use

**Error:**

```bash
Error: bind: address already in use
```

**Solution:**

```bash
# Find process using port 3000
lsof -ti:3000

# Kill process
kill -9 <PID>

# Or change APP_PORT in .env
APP_PORT=3001
```

### Database Connection Failed

**Error:**

```bash
Error: connect ECONNREFUSED
```

**Check database is running:**

```bash
docker ps
```

**Verify environment variables:**

```bash
cat .env
```

**Test database connection:**

```bash
docker exec -it db_dev pg_isready -U postgres
```

### Migration Fails

**Error:**

```bash
Error: relation "users" already exists
```

**Solution 1: Drop and recreate (dev only):**

```bash
./run.sh reset-db
./run.sh db-migrate
./run.sh seed
```

**Solution 2: Manual cleanup:**

```bash
docker exec -it db_dev psql -U postgres survey_studio -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
./run.sh db-migrate
```

### Permission Denied on `run.sh`

```bash
chmod +x run.sh
```

### Docker Out of Disk Space

```bash
docker system prune -a --volumes
```

**⚠️ Warning**: This removes all unused containers, images, and volumes.

---

## Performance Optimisation

### Development

- Use Docker volumes for faster file sync
- Reduce log verbosity: `LOG_LEVEL=warn`
- Disable source maps for faster builds (in `next.config.ts`)

### Production

- Enable Next.js output standalone mode
- Use CDN for static assets
- Enable response compression
- Configure database connection pooling
- Use read replicas for read-heavy operations
- Enable database query caching

---

## Security Hardening

### Environment Variables

- Never commit `.env` to version control
- Use secrets management (AWS Secrets Manager, HashiCorp Vault)
- Rotate `AUTH_SECRET` periodically
- Use different secrets for dev/staging/production

### Database

- Use strong passwords (auto-generated)
- Enable SSL connections in production
- Restrict database user permissions
- Regular backups and test recovery
- Enable audit logging

### Application

- Keep dependencies updated: `bun update`
- Enable rate limiting (future enhancement)
- Configure CORS properly
- Use HTTPS in production
- Set secure cookie flags
- Implement CSP headers

---

## Monitoring & Logging

### Application Logs

Logs are output to stdout/stderr with structured format:

```json
{
  "level": "info",
  "scope": "api:surveys",
  "userId": "...",
  "message": "Creating new survey"
}
```

**View logs:**

```bash
docker compose -f docker-compose.dev.yml logs -f app
```

### Database Logs

```bash
docker compose -f docker-compose.dev.yml logs -f db
```

### Production Logging

Consider integrating:

- **Datadog**: APM and log aggregation
- **New Relic**: Performance monitoring
- **Sentry**: Error tracking
- **Grafana + Loki**: Self-hosted logging

---

## Backup & Restore

### Database Backup

**Backup:**

```bash
docker exec db_dev pg_dump -U postgres survey_studio > backup.sql
```

**Restore:**

```bash
cat backup.sql | docker exec -i db_dev psql -U postgres survey_studio
```

**Automated backups** (cron job):

```bash
0 2 * * * /path/to/backup-script.sh
```

### File Backups

Currently, the application doesn't store files. If file uploads are added:

- Use cloud storage (S3, CloudFlare R2)
- Backup uploaded files regularly
- Consider versioning/soft deletes

---

## Upgrading Dependencies

### Check for updates

```bash
bun outdated
```

### Update all dependencies

```bash
bun update
```

### Update specific package

```bash
bun update next@latest
```

### After updates

```bash
./run.sh lint
./run.sh format
bun run build  # Test build
```

---

## Next Steps

After setup:

1. **Login** to the application: `http://localhost:3000`
2. **Create your first survey** as admin
3. **Test survey submission** as regular user
4. **Review responses** in admin dashboard
5. **Explore the codebase** and make modifications

For more information:

- [User Flows](./06-user-flows.md)
- [API Reference](./04-api-endpoints.md)
- [Database Schema](./03-database.md)
