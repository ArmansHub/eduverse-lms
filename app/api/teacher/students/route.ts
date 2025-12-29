import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"; 

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {

    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "TEACHER") {
      return NextResponse.json(
        { message: "Unauthorized: Access restricted to teachers." }, 
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const className = searchParams.get("className");

    if (!className) {
      return NextResponse.json(
        { message: "Query parameter 'className' is required" }, 
        { status: 400 }
      );
    }

    const students = await prisma.user.findMany({
      where: {
        role: "STUDENT",
        studentClass: className,
      },
      select: {
        id: true,
        name: true,
        email: true,
        studentId: true,
        studentClass: true,
        phone: true,
      },
      orderBy: {
        name: 'asc'
      }
    });

    return NextResponse.json(students, { status: 200 });

  } catch (error: any) {
    console.error("Fetch Students Error:", error);
    return NextResponse.json(
      { message: "Internal Server Error", error: error.message }, 
      { status: 500 }
    );
  }
}