import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const className = searchParams.get("class");

    if (!className) return NextResponse.json({ error: "Class required" }, { status: 400 });

    const students = await prisma.user.findMany({
      where: { role: "STUDENT", studentClass: className },
      select: { id: true, name: true, studentId: true },
      orderBy: { studentId: 'asc' }
    });

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const existingAttendance = await prisma.attendance.findMany({
      where: {
        date: { gte: todayStart },
        studentId: { in: students.map(s => s.id) }
      },
    });

    const formattedData = students.map((std) => {
      const record = existingAttendance.find((att) => att.studentId === std.id);
      return {
        studentId: std.id,
        name: std.name,
        studentCode: std.studentId,
        status: record ? record.status : "PRESENT", 
      };
    });

    return NextResponse.json(formattedData);
  } catch (error) {
    return NextResponse.json({ error: "Fetch failed" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { teacherId, attendanceData } = body;

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    for (const item of attendanceData) {
      const existing = await prisma.attendance.findFirst({
        where: {
          studentId: item.studentId,
          date: { gte: todayStart }
        }
      });

      if (existing) {
        await prisma.attendance.update({
          where: { id: existing.id },
          data: { status: item.status, teacherId }
        });
      } else {
        await prisma.attendance.create({
          data: {
            date: new Date(),
            status: item.status,
            studentId: item.studentId,
            teacherId
          }
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Attendance Save Error:", error);
    return NextResponse.json({ error: "Save failed" }, { status: 500 });
  }
}