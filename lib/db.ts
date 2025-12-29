import mongoose from "mongoose";
import { PrismaClient } from "@prisma/client";

// Global cache setup for both Mongoose and Prisma
let globalWithDb = global as typeof global & {
  mongoose: any;
  prisma: PrismaClient;
};

// --- Mongoose Connection ---
let cached = globalWithDb.mongoose;

if (!cached) {
  cached = globalWithDb.mongoose = { conn: null, promise: null };
}

export const connectDB = async () => {
  const MONGODB_URI = process.env.MONGODB_URI;

  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is missing in .env file");
  }

  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    }).then((mongoose) => {
      console.log("✅ Mongoose Connection Established");
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }
  return cached.conn;
};

// --- Prisma Connection  ---
export const prisma = globalWithDb.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") globalWithDb.prisma = prisma;