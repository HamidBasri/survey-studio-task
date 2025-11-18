#!/usr/bin/env bash

# -------------------------------------------------------------
# Minimal and user-friendly project command wrapper
# Usage: ./project.sh <command>
# -------------------------------------------------------------

set -e

COMMAND=$1

print_help() {
  echo ""
  echo "Usage: ./project.sh <command>"
  echo ""
  echo "Available commands:"
  echo "  dev           Start development environment (Docker)"
  echo "  dev-down      Stop development environment"
  echo ""
  echo "  prod-build    Build production containers"
  echo "  prod-up       Start production environment"
  echo "  prod-down     Stop production environment"
  echo ""
  echo "  lint          Run linter"
  echo "  format        Format codebase"
  echo ""
  echo "  db-generate   Generate Drizzle migrations"
  echo "  db-migrate    Apply Drizzle migrations"
  echo "  db-studio     Open Drizzle Studio"
  echo ""
  echo "  seed          Run database seed script"
  echo ""
  echo "  clean         Remove .next build output"
  echo "  reset-db      Drop & recreate dev database"
  echo ""
}

case $COMMAND in

  dev)
    docker compose -f docker-compose.dev.yml up --build
    ;;

  dev-down)
    docker compose -f docker-compose.dev.yml down
    ;;

  prod-build)
    docker compose build
    ;;

  prod-up)
    docker compose up -d
    ;;

  prod-down)
    docker compose down
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
    bunx drizzle-kit studio
    ;;

  seed)
    echo "Running seed script..."
    bun run src/lib/db/seed.ts
    echo "✔ Seed completed"
    ;;

  clean)
    rm -rf .next
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
