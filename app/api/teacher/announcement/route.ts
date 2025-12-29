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
    const { title, content, teacherId, className } = body;

    if (!title || !content || !teacherId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Scalar fields use kore data create
    const newAnnouncement = await prisma.announcement.create({
      data: {
        title: title,
        content: content,
        teacherId: teacherId,
        className: className || null,
      }
    });

    return NextResponse.json({ success: true, announcement: newAnnouncement });

  } catch (error: any) {
    console.error("Database Error:", error.message);
    return NextResponse.json({ 
      error: "Database error", 
      message: error.message 
    }, { status: 500 });
  }
}