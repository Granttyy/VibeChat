# syntax=docker/dockerfile:1

ARG NODE_VERSION=20

############################
# 1. Build Stage
############################
FROM node:${NODE_VERSION}-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

############################
# 2. Production Stage
############################
FROM node:${NODE_VERSION}-alpine

ENV NODE_ENV=production

WORKDIR /app

# Only install production deps
COPY package*.json ./
RUN npm ci --omit=dev

# Copy built app only
COPY --from=builder /app ./

# Security
USER node

EXPOSE 3000

CMD ["npm", "run", "start"]