import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "TEACHER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const teacherId = (session.user as any).id;

    
    const schedules = await prisma.classSchedule.findMany({
      where: { teacherId },
      include: { subject: true }
    });


    const uniqueClassesMap = new Map();

    schedules.forEach(sch => {
      const key = `${sch.className}-${sch.subject.name}`;
      if (!uniqueClassesMap.has(key)) {
        uniqueClassesMap.set(key, {
          className: sch.className,
          subjectName: sch.subject.name,
          subjectId: sch.subject.id
        });
      }
    });

    return NextResponse.json(Array.from(uniqueClassesMap.values()));

  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch classes" }, { status: 500 });
  }
}