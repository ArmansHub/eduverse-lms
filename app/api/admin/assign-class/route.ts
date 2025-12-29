import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { teacherId, subjectId, className, day, startTime, endTime, roomNumber } = body;

        const newSchedule = await prisma.classSchedule.create({
            data: {
                dayOfWeek: day, 
                startTime: startTime,
                endTime: endTime,
                className: className,
                roomNumber: roomNumber,

                teacher: { connect: { id: teacherId } },
                subject: { connect: { id: subjectId } }
            }
        });


        return NextResponse.json({ 
            success: true, 
            data: newSchedule 
        }, { status: 201 });

    } catch (error: any) {
        console.error("Prisma Error:", error.message);
        return NextResponse.json({ 
            success: false, 
            error: error.message 
        }, { status: 500 });
    }
}