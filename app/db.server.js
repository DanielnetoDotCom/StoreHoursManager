import { PrismaClient } from "@prisma/client";

console.log('---- app/db.server.js loaded');
if (process.env.NODE_ENV !== "production") {
  if (!global.prisma) {
    global.prisma = new PrismaClient();
  }
}

const prisma = global.prisma || new PrismaClient();

export default prisma;
