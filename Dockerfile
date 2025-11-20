# Dependencies
FROM oven/bun:1 AS deps
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install

# Build
FROM oven/bun:1 AS build
WORKDIR /app
COPY . .
COPY --from=deps /app/node_modules ./node_modules
RUN bun run build

# Production runner
FROM oven/bun:1 AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy optimized output
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public

EXPOSE 3000
CMD ["bun", "server.js"]
