import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { searchParams } = new URL(request.url);
    const queryTeacherId = searchParams.get("teacherId");
    const teacherId = (session.user as any).id || queryTeacherId;

    if (!teacherId) {
       return NextResponse.json({ error: "Teacher ID not found" }, { status: 400 });
    }

    const routine = await prisma.classSchedule.findMany({
      where: {
        teacherId: teacherId,
      },
      include: {
        subject: true, 
      },
      orderBy: {
        startTime: 'asc', 
      },
    });
    
    return NextResponse.json(routine);

  } catch (error) {
    console.error("Routine Fetch Error:", error);
    return NextResponse.json({ error: "Failed to fetch routine" }, { status: 500 });
  }
}