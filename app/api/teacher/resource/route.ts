import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== "TEACHER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { title, fileUrl, className, subjectName, teacherId } = body;

    if (!title || !fileUrl || !className || !subjectName || !teacherId) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    const subject = await prisma.subject.findFirst({
      where: { name: subjectName }
    });

    if (!subject) {
      return NextResponse.json({ error: "Invalid Subject: " + subjectName }, { status: 400 });
    }


    const newResource = await prisma.resource.create({
      data: {
        title,
        fileUrl,      
        className,
        subjectId: subject.id, 
        teacherId: teacherId  
      }
    });

    return NextResponse.json(newResource);
  } catch (error) {
    console.error("Resource Save Error:", error);
    return NextResponse.json({ 
      error: "Failed to save to database",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}