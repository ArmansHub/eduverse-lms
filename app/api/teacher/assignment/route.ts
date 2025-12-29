import { NextResponse } from "next/server";
import { prisma } from "@/lib/db"; 

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, description, dueDate, className, subjectName, teacherId } = body;

    if (!title || !dueDate || !className || !subjectName || !teacherId) {
      return NextResponse.json(
        { error: "Missing required fields (title, dueDate, class, subject)" },
        { status: 400 }
      );
    }

    const subject = await prisma.subject.findUnique({
      where: { name: subjectName }
    });

    if (!subject) {
      return NextResponse.json(
        { error: "Subject not found. Please contact admin." },
        { status: 404 }
      );
    }

 
    const newAssignment = await prisma.assignment.create({
      data: {
        title,
        description: description || "", 
        dueDate: new Date(dueDate),     
        className,
        subjectId: subject.id,         
        teacherId
      }
    });

    return NextResponse.json(newAssignment, { status: 201 });

  } catch (error) {
    console.error("Error creating assignment:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}