import { NextResponse } from "next/server";
import { prisma } from "@/lib/db"; 
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    const hashedPassword = await bcrypt.hash("admin123", 10);
    
    const admin = await prisma.user.upsert({
      where: { email: "admin@eduverse.com" },
      update: {},
      create: {
        email: "admin@eduverse.com",
        name: "Super Admin",
        password: hashedPassword,
        role: "ADMIN",
      },
    });

    return NextResponse.json({ message: "Admin Created Successfully", admin });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error creating admin" }, { status: 500 });
  }
}