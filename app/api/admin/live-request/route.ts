import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export async function GET() {
    try {
        const activeRequests = await prisma.liveRequest.findMany({
            where: { 
              
                status: { in: ['PENDING', 'STARTED'] } 
            },
            include: { 
                subject: { select: { name: true } }, 
                teacher: { select: { name: true } }, 
                admin: { select: { name: true } } 
            },
            orderBy: { createdAt: 'desc' },
        });
        return NextResponse.json(activeRequests);
    } catch (error) {
        console.error("GET Live Request Error:", error);
        return NextResponse.json({ message: "Failed to fetch data" }, { status: 500 });
    }
}


export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { subjectId, teacherId, startTime, adminId, roomNumber } = body;
        
        if (!subjectId || !teacherId || !startTime || !adminId) {
            return NextResponse.json({ message: "Missing fields" }, { status: 400 });
        }

        const newRequest = await prisma.liveRequest.create({
            data: {
                subjectId,
                teacherId,
                adminId,
                startTime: new Date(startTime),
                roomNumber: roomNumber || "Online",
                status: 'PENDING'
            }
        });

        
        return NextResponse.json(newRequest, { status: 201 });

    } catch (error: any) {
        console.error("POST Error:", error);
        return NextResponse.json({ message: "Failed to create request" }, { status: 500 });
    }
}


export async function PATCH(request: Request) {
    try {
        const body = await request.json();
        const { id, status } = body;

        const updatedRequest = await prisma.liveRequest.update({
            where: { id },
            data: { status },
            include: {
                subject: { select: { name: true } },
                teacher: { select: { name: true } }
            }
        });

        return NextResponse.json(updatedRequest);
    } catch (error) {
        return NextResponse.json({ message: "Update failed" }, { status: 500 });
    }
}