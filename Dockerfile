# Use official Node.js LTS image
FROM node:20-slim

# Set working directory inside container
WORKDIR /app

# Set NODE_ENV to production
ENV NODE_ENV=production

# Only copy package manifests first
COPY package*.json ./

# Install only production deps, no cache
RUN npm ci --omit=dev && npm cache clean --force

# Copy the rest of the project files
COPY . .

# Expose port your app runs on
EXPOSE 80

# Command to run the app
CMD ["npm", "start"]

