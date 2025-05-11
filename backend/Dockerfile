FROM node:18-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --production

# Copy application code
COPY tsconfig.json ./
COPY src ./src

# Build TypeScript
RUN npm run build

# Cleanup dev dependencies
RUN npm prune --production

# Set environment variables
ENV NODE_ENV=production
ENV PORT=8080

# Expose port
EXPOSE 8080

# Run the application
CMD ["node", "dist/index.js"]