import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
    try {
       
        const subjects = await prisma.subject.findMany({
            select: {
                id: true,
                name: true,
            }
        });
        return NextResponse.json(subjects);
    } catch (error) {
        return NextResponse.json({ message: "Error fetching subjects" }, { status: 500 });
    }
}