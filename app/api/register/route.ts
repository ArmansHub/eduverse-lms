import { NextResponse } from "next/server";
import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function generateStudentId() {
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `STU-${randomNum}`;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { name, email, password, role, childId, studentClass } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { message: "Name, email, and password are required." }, 
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "User with this email already exists." }, 
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let userRole: UserRole = UserRole.STUDENT;
    if (role && UserRole[role.toUpperCase() as keyof typeof UserRole]) {
      userRole = UserRole[role.toUpperCase() as keyof typeof UserRole];
    }

    let newStudentId = undefined;
    let parentChildLink = undefined;

    if (userRole === UserRole.STUDENT) {
      newStudentId = generateStudentId();
    } 
    else if (userRole === UserRole.PARENT && childId) {
      const student = await prisma.user.findFirst({
        where: { studentId: childId }
      });

      if (!student) {
        return NextResponse.json(
          { message: "The provided Student ID is incorrect or does not exist." },
          { status: 400 }
        );
      }
      parentChildLink = student.id; 
    }

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: userRole,
        studentId: newStudentId, 
        childId: parentChildLink,
        studentClass: userRole === UserRole.STUDENT ? studentClass : null,
      }
    });


    const { password: _, ...userSafe } = newUser;

    return NextResponse.json(
      { message: "User created successfully!", user: userSafe },
      { status: 201 }
    );

  } catch (error: any) {
    console.error("Registration Error:", error);
    return NextResponse.json(
      { message: `Error: ${error.message}` },
      { status: 500 }
    );
  }
}