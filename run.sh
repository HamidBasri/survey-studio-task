#!/usr/bin/env bash

# -------------------------------------------------------------
# Minimal and user-friendly project command wrapper
# Usage: ./run.sh <command> [options]
# -------------------------------------------------------------

set -e

COMMAND=$1
ARG=$2 # Optional argument (e.g. --db or --build)

print_help() {
  echo ""
  echo "Usage: ./run.sh <command> [options]"
  echo ""
  echo "Available commands:"
  echo ""
  echo "  dev             Start development environment"
  echo "  dev-down        Stop development environment"
  echo ""
  echo "  prod-build      Build production containers (with Bake)"
  echo "  prod-up         Start production environment"
  echo "                   Options:"
  echo "                     --build | -b   Build before starting (with Bake)"
  echo "  prod-down       Stop production environment"
  echo "                   Options:"
  echo "                     --db | -v      Remove database volume"
  echo ""
  echo "  prod-logs       Show production logs"
  echo "                   Options:"
  echo "                     -f             Follow logs"
  echo ""
  echo "  lint            Run linter"
  echo "  format          Format codebase"
  echo ""
  echo "  db-generate     Generate Drizzle migrations"
  echo "  db-migrate      Apply Drizzle migrations"
  echo "  db-studio       Open Drizzle Studio"
  echo ""
  echo "  seed            Run database seed script"
  echo ""
  echo "  clean           Remove .next build output"
  echo "  reset-db        Drop & recreate dev database"
  echo ""
}

case "$COMMAND" in

  dev)
    COMPOSE_BAKE=true docker compose -f docker-compose.dev.yml up --build
    ;;

  dev-down)
    docker compose -f docker-compose.dev.yml down
    ;;

  prod-build)
    echo "Building production containers using Buildx Bake..."
    COMPOSE_BAKE=true docker compose build
    echo "✔ Production build completed"
    ;;

  prod-up)
    if [[ "$ARG" == "--build" || "$ARG" == "-b" ]]; then
      echo "Building production containers using Bake..."
      COMPOSE_BAKE=true docker compose build
      echo "Starting production environment..."
      docker compose up -d
      echo "✔ Production environment built & started"
    else
      echo "Starting production environment..."
      docker compose up -d
      echo "✔ Production environment started"
    fi
    ;;

  prod-down)
    if [[ "$ARG" == "--db" || "$ARG" == "-v" ]]; then
      echo "Stopping production and removing DB volume..."
      docker compose down -v
    else
      echo "Stopping production..."
      docker compose down
    fi
    echo "✔ Production shutdown complete"
    ;;

  prod-logs)
    if [[ "$ARG" == "-f" ]]; then
      docker compose logs -f
    else
      docker compose logs
    fi
    ;;

  lint)
    bun run lint
    ;;

  format)
    bun run format
    ;;

  db-generate)
    bunx drizzle-kit generate
    ;;

  db-migrate)
    bunx drizzle-kit migrate
    ;;

  db-studio)
    echo "Starting Drizzle Studio..."
    bunx drizzle-kit studio
    bunx drizzle-kit studio &

    # Wait a moment for the server to boot
    sleep 2

    echo "✔ Drizzle Studio is up and running at:"
    echo "  👉 https://local.drizzle.studio"
    echo ""
    ;;

  seed)
    echo "Running seed script..."
    bun run src/lib/db/seed.ts
    echo "✔ Seed completed"
    ;;

  clean)
    rm -rf .next
    echo "✔ Cleaned .next directory"
    ;;

  reset-db)
    echo "Resetting dev database..."
    docker compose -f docker-compose.dev.yml down -v
    docker compose -f docker-compose.dev.yml up --build -d
    echo "✔ Database reset"
    ;;

  ""|help|--help|-h)
    print_help
    ;;

  *)
    echo "❌ Unknown command: $COMMAND"
    print_help
    exit 1
    ;;

esac
