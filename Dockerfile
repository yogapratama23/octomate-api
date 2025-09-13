# ---- Base Stage ----
FROM node:20-alpine AS base
WORKDIR /app

# Install dependencies only when needed
COPY package*.json ./
RUN npm ci

# ---- Build Stage ----
FROM base AS build
WORKDIR /app
COPY . .
RUN npm run build

# ---- Production Stage ----
FROM node:20-alpine AS production
WORKDIR /app

# Copy only necessary files
COPY package*.json ./
RUN npm ci --omit=dev

# Copy build output from build stage
COPY --from=build /app/dist ./dist

# Expose NestJS default port
EXPOSE 3000

# Run the app
CMD ["node", "dist/main.js"]

