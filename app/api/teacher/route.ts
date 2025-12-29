import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== "TEACHER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const teacherId = (session.user as any).id;

    // 1. Fetching Teacher Profile
    const teacher = await prisma.user.findUnique({
      where: { id: teacherId },
      select: { id: true, name: true, email: true }
    });

    // 2. Data Fetching 
    const [announcementsRaw, routineRaw, teacherSubjects] = await Promise.all([
      // Announcements Fetching 
      prisma.announcement.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5
      }),
      // Routine/Schedule
      prisma.classSchedule.findMany({
        where: { teacherId: teacherId },
        include: { subject: true },
        orderBy: { startTime: 'asc' }
      }),
      // Teacher's assigned subjects and classes
      prisma.teacherSubject.findMany({
        where: { teacherId: teacherId },
        include: { subject: true }
      })
    ]);

    // 3. Robust Formatting
    const routine = routineRaw.map(r => ({
      id: r.id,
      day: r.dayOfWeek,
      subject: r.subject?.name || "N/A",
      startTime: r.startTime,
      endTime: r.endTime,
      class: r.className
    }));

    const myClasses = teacherSubjects.map(ts => ({
      id: ts.id,
      className: ts.className,
      subject: ts.subject?.name || "N/A",
      subjectId: ts.subjectId
    }));

    return NextResponse.json({
      profile: teacher,
      announcements: announcementsRaw,
      routine,
      myClasses,
      stats: {
        totalClasses: routineRaw.length,
        totalSubjects: teacherSubjects.length
      }
    });

  } catch (error) {
    console.error("Teacher Dashboard API Error:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}