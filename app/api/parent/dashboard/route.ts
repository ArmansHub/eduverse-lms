import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "PARENT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentParentId = (session.user as any).id;

    // 1. Get Parent & Student
    const parentUser = await prisma.user.findUnique({
      where: { id: currentParentId },
      select: { name: true, childId: true }
    });

    const student = await prisma.user.findFirst({
      where: { 
        OR: [ { id: parentUser?.childId || "" }, { childId: currentParentId } ],
        role: "STUDENT" 
      },
      select: { id: true, name: true, studentClass: true, studentId: true }
    });

    if (!student) return NextResponse.json({ error: "No student linked" }, { status: 404 });

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // 2. Fetch All Data
    const [attendance, grades, announcements, routine, unreadMessages, teachers, unreadNoticesCount] = await Promise.all([
      prisma.attendance.findMany({ where: { studentId: student.id } }),
      prisma.grade.findMany({
        where: { studentId: student.id },
        include: { subject: { select: { name: true } } }
      }),
      prisma.announcement.findMany({
        where: { OR: [{ className: student.studentClass }, { className: null }] },
        include: { 
            teacher: { select: { name: true } }, 
            admin: { select: { name: true } } 
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.classSchedule.findMany({
        where: { className: student.studentClass },
        include: { subject: true, teacher: { select: { name: true } } },
        orderBy: { startTime: 'asc' }
      }),
      prisma.message.count({ where: { receiverId: currentParentId, isRead: false } }),
      prisma.user.findMany({ where: { role: "TEACHER" }, select: { id: true, name: true } }),
      
      prisma.announcement.count({
        where: {
          OR: [{ className: student.studentClass }, { className: null }],
          createdAt: { gte: sevenDaysAgo }
        }
      })
    ]);

    // 3. Format Grades
    const formattedGrades = grades.map(g => ({
      id: g.id,
      subject: g.subject?.name || "Unknown",
      quiz: g.quizMarks || 0,
      mid: g.midMarks || 0,
      final: g.finalMarks || 0,
      obtained: (g.quizMarks || 0) + (g.midMarks || 0) + (g.finalMarks || 0),
      total: 100
    }));

    return NextResponse.json({
      parentInfo: { name: parentUser?.name, childName: student.name },
      studentProfile: student,
      stats: {
        attendancePercentage: attendance.length > 0 
          ? Math.round((attendance.filter(a => a.status === "PRESENT").length / attendance.length) * 100) 
          : 0,
        unreadMessages,
        unreadNotices: unreadNoticesCount
      },
      grades: formattedGrades,
      announcements: announcements.map(a => ({
        id: a.id,
        title: a.title,
        content: a.content,
        sender: a.teacher?.name || a.admin?.name || "Admin",
        createdAt: a.createdAt
      })),
      routine,
      teachers
    });
  } catch (error) {
    console.error("Dashboard API Error:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}