import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { title, content, adminId } = body;

        if (!title || !content || !adminId) {
            return NextResponse.json({ message: "Missing required fields: title, content, or adminId" }, { status: 400 });
        }

        const announcement = await prisma.announcement.create({
            data: { 
                title, 
                content, 
                adminId 
            }
        });

        return NextResponse.json(announcement, { status: 201 });
    } catch (error: any) {
        console.error("Prisma Error:", error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}