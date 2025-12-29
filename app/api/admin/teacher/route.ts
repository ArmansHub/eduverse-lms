import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
    try {
       
        const teachers = await prisma.user.findMany({
            where: { role: "TEACHER" },
            select: { id: true, name: true }
        });
        return NextResponse.json(teachers);
    } catch (error) {
        return NextResponse.json({ message: "Error fetching teachers" }, { status: 500 });
    }
}