# API Gateway for Microservices

FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY shared/api-gateway/package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY shared/api-gateway/ ./

# Install health check tools
RUN apk add --no-cache curl

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S gateway -u 1001

# Change ownership
RUN chown -R gateway:nodejs /app
USER gateway

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:8080/health || exit 1

# Expose port
EXPOSE 8080

# Environment variables
ENV NODE_ENV=production
ENV PORT=8080

# Labels
LABEL service="api-gateway"
LABEL version="1.0.0"
LABEL maintainer="redscan-platform-team"

# Start the gateway
CMD ["node", "src/index.js"]