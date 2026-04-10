import dotenv from 'dotenv';
dotenv.config();

const allowedOrigins = process.env.CORS_ORIGIN?.split(',')

export const config = {
  PORT: process.env.PORT || 3000,
  REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
  NODE_ENV: process.env.NODE_ENV || 'development',
  CORS_ORIGIN: allowedOrigins,
};