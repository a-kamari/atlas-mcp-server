# Multi-stage Dockerfile for Atlas React WebUI
# Stage 1: Build the React application
# Stage 2: Serve with nginx

# -----------------------------------------------------------------------------
# Stage 1: Build
# -----------------------------------------------------------------------------
FROM node:20-alpine AS builder

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy package files for layer caching
COPY package.json pnpm-lock.yaml* ./

# Install dependencies (fallback if no lockfile)
RUN pnpm install --frozen-lockfile || pnpm install

# Copy source code
COPY . .

# Build the application
# vite.config.ts outputs to ../../dist/webui which resolves to /dist/webui from /app
RUN pnpm run build

# -----------------------------------------------------------------------------
# Stage 2: Production with nginx
# -----------------------------------------------------------------------------
FROM nginx:alpine AS production

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built files from builder stage
# Build output is at /dist/webui (from vite outDir: ../../dist/webui relative to /app)
COPY --from=builder /dist/webui /usr/share/nginx/html/dashboard

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost/dashboard/ || exit 1

# Run nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
