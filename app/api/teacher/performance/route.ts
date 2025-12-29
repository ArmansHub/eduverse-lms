import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "TEACHER") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { studentId, className, marks, status, date } = body;

    const result = await prisma.$transaction(async (tx) => {
      

      const attendance = await tx.attendance.create({
        data: {
          date: new Date(date),
          status: status || "PRESENT",
          studentId: studentId,
          teacherId: session.user.id,
          className: className,
          subjectId: "6581234567890abcdef12345" 
        }
      });


      const grade = await tx.grade.create({
        data: {
          quizMarks: parseFloat(marks.quiz) || 0,
          midMarks: parseFloat(marks.mid) || 0,
          finalMarks: parseFloat(marks.final) || 0,
          totalMarks: (parseFloat(marks.quiz) || 0) + (parseFloat(marks.mid) || 0) + (parseFloat(marks.final) || 0),
          studentId: studentId,
          teacherId: session.user.id,
          className: className,
          subjectId: "6581234567890abcdef12345" 
        }
      });

      return { attendance, grade };
    });

    return NextResponse.json({ message: "Performance updated successfully", result }, { status: 200 });

  } catch (error: any) {
    console.error("Performance Save Error:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}