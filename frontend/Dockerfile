# Multi-stage build for React/Vite frontend
FROM node:18-alpine as build

# Accept build arguments
ARG VITE_API_BASE_URL
ARG VITE_BEDROCK_API_BASE_URL

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Set environment variables for build
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_BEDROCK_API_BASE_URL=$VITE_BEDROCK_API_BASE_URL

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built application from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
