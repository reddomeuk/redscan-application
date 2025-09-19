# AI Assistant Module

FROM node:18-alpine as build

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY modules/ai-assistant/package*.json ./modules/ai-assistant/

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY modules/ai-assistant/ ./modules/ai-assistant/
COPY shared/ ./shared/

# Build the module
WORKDIR /app/modules/ai-assistant
RUN npm run build

# Production stage with Node.js for AI service
FROM node:18-alpine

WORKDIR /app

# Install production dependencies
COPY modules/ai-assistant/package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy built application
COPY --from=build /app/modules/ai-assistant/dist ./dist
COPY --from=build /app/modules/ai-assistant/server ./server

# Add health check dependencies
RUN apk add --no-cache curl

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S aiservice -u 1001

# Change ownership
RUN chown -R aiservice:nodejs /app
USER aiservice

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Expose port
EXPOSE 3000

# Environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Labels
LABEL module="ai-assistant"
LABEL version="1.0.0"
LABEL maintainer="redscan-ai-team"

# Start the service
CMD ["node", "server/index.js"]