# Core Dashboard Module

FROM node:18-alpine as build

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY modules/core-dashboard/package*.json ./modules/core-dashboard/

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY modules/core-dashboard/ ./modules/core-dashboard/
COPY shared/ ./shared/

# Build the module
WORKDIR /app/modules/core-dashboard
RUN npm run build

# Production stage
FROM nginx:alpine

# Install curl for health checks
RUN apk add --no-cache curl

# Copy built files
COPY --from=build /app/modules/core-dashboard/dist /usr/share/nginx/html

# Copy nginx configuration
COPY modules/core-dashboard/nginx.conf /etc/nginx/nginx.conf

# Add health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:80/health || exit 1

# Expose port
EXPOSE 80

# Add labels for container management
LABEL module="core-dashboard"
LABEL version="1.0.0"
LABEL maintainer="redscan-team"

CMD ["nginx", "-g", "daemon off;"]