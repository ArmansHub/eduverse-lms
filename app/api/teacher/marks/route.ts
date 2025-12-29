import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const className = searchParams.get("class");
  const subjectId = searchParams.get("subjectId");
  
  if (!className || !subjectId) return NextResponse.json([], { status: 400 });

  try {
    const students = await prisma.user.findMany({
      where: { role: "STUDENT", studentClass: className },
      select: { id: true, name: true, studentId: true },
      orderBy: { studentId: 'asc' }
    });

    const existingGrades = await prisma.grade.findMany({
      where: {
        subjectId: subjectId,
        studentId: { in: students.map(s => s.id) }
      }
    });

    const data = students.map(student => {
      const grade = existingGrades.find(g => g.studentId === student.id);
      return {
        studentId: student.id,
        studentCode: student.studentId,
        name: student.name,
        quiz: grade?.quizMarks || 0,
        mid: grade?.midMarks || 0,
        final: grade?.finalMarks || 0,
        total: grade?.totalMarks || 0
      };
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error("Fetch Error:", error);
    return NextResponse.json({ error: "Failed to fetch students" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { subjectId, grades } = body;
    const session = await getServerSession(authOptions);
    
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    for (const g of grades) {
      const existing = await prisma.grade.findFirst({
        where: {
          studentId: g.studentId,
          subjectId: subjectId
        }
      });

      
      const gradeData = {
        quizMarks: parseFloat(g.quiz) || 0,
        midMarks: parseFloat(g.mid) || 0,
        finalMarks: parseFloat(g.final) || 0,
        totalMarks: (parseFloat(g.quiz) || 0) + (parseFloat(g.mid) || 0) + (parseFloat(g.final) || 0),
      };

      if (existing) {
        await prisma.grade.update({
          where: { id: existing.id },
          data: gradeData
        });
      } else {
        await prisma.grade.create({
          data: {
            ...gradeData,
            studentId: g.studentId,
            subjectId: subjectId
          }
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Save Error:", error);
    return NextResponse.json({ error: "Failed to save grades" }, { status: 500 });
  }
}