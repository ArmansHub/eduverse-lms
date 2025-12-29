import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs"; 

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;

    console.log("--- Login Attempt ---");
    console.log("Email Trying:", email);

    const user = await prisma.user.findUnique({
      where: { email: email }
    });

    if (!user) {
      console.log("❌ Error: User Not Found in Database");
      return NextResponse.json({ message: "Invalid email or password" }, { status: 401 });
    }

    console.log("✅ User Found:", user.email);
    console.log("User Role:", user.role);
    console.log("Stored Hashed Password:", user.password);

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      console.log("❌ Error: Password Mismatch");
      return NextResponse.json({ message: "Invalid email or password" }, { status: 401 });
    }

    console.log("✅ Password Matched!");

    return NextResponse.json({
      message: "Login successful",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

  } catch (error: any) {
    console.log("❌ Server Error:", error.message);
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}