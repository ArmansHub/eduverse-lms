import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const hashedPassword = await bcrypt.hash("admin123", 10);

   
    await prisma.user.deleteMany({
      where: { email: "admin@eduverse.com" }
    });

    const newAdmin = await prisma.user.create({
      data: {
        name: "Super Admin",
        email: "admin@eduverse.com",
        password: hashedPassword,
        role: "ADMIN", 
      }
    });

    return NextResponse.json({ 
      message: "Admin Reset Successful!", 
      email: "admin@eduverse.com",
      password: "admin123",
      role: newAdmin.role 
    });

  } catch (error: any) {
    console.error("Setup Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}