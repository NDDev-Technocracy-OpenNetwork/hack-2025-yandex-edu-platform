# Multi-stage Docker build for Educational AI Platform Frontend
# Optimized for development and production environments

# Development stage
FROM node:20-alpine as development

# Set working directory
WORKDIR /app

# Copy package files for dependency caching
COPY package*.json ./

# Install dependencies including dev dependencies
RUN npm ci

# Copy source code
COPY . .

# Expose development port
EXPOSE 3000

# Set environment variable for development
ENV NODE_ENV=development

# Command for development with hot reload
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

# Build stage
FROM node:20-alpine as build

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine as production

# Copy built application from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom nginx configuration if needed
# COPY nginx.conf /etc/nginx/nginx.conf

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]