# Dependencies
FROM oven/bun:1-alpine AS deps
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install

# Build
FROM oven/bun:1 AS build
WORKDIR /app

ARG DATABASE_URL
ARG NODE_ENV=production

ENV DATABASE_URL=${DATABASE_URL}
ENV NODE_ENV=${NODE_ENV}

COPY . .
COPY --from=deps /app/node_modules ./node_modules
RUN bun run build

# Production runner
FROM oven/bun:1-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy app source and build artifacts
COPY --from=build /app ./

EXPOSE 3000
CMD ["bun", "run", "start"]
