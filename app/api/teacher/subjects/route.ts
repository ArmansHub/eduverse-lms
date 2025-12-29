// app/api/teacher/subjects/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    const { searchParams } = new URL(request.url);
    const queryTeacherId = searchParams.get("teacherId");

    const teacherId = (session?.user as any)?.id || queryTeacherId;

    if (!teacherId) {
      return NextResponse.json({ error: "Unauthorized or No Teacher ID found" }, { status: 401 });
    }

    const subjects = await prisma.teacherSubject.findMany({
      where: {
        teacherId: teacherId, 
      },
      include: {
        subject: true, 
      },
    });
    
    return NextResponse.json(subjects);
  } catch (error) {
    console.error("Subject Fetch Error:", error);
    return NextResponse.json({ error: "Failed to fetch subjects" }, { status: 500 });
  }
}