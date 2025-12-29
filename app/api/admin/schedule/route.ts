import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { teacherId, subjectId, dayOfWeek, startTime, endTime, roomNumber } = body;

    const newSchedule = await prisma.classSchedule.create({
      data: {
        teacherId,
        subjectId,
        dayOfWeek,
        startTime,
        endTime,
        roomNumber: roomNumber || "N/A",
      },
    });

    return NextResponse.json({ message: "Schedule created!", newSchedule }, { status: 201 });
  } catch (error) {
    console.error("Schedule Error:", error);
    return NextResponse.json({ error: "Failed to create schedule" }, { status: 500 });
  }
}