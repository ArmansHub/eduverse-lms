// app/api/admin/link-parent/route.ts

import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";


const globalForPrisma = global as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export async function POST(req: Request) {
    try {
        const { name, email, password, studentId: studentAppId } = await req.json();

        if (!name || !email || !password || !studentAppId) {
            return NextResponse.json({ message: "Missing required fields." }, { status: 400 });
        }

        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json({ message: "A user with this email already exists." }, { status: 400 });
        }
        
        const student = await prisma.user.findFirst({
            where: { 
                OR: [
                    { studentId: studentAppId }, 
                    { id: studentAppId.length > 20 ? studentAppId : undefined } 
                ],
                role: "STUDENT" 
            },
        });
        
        if (!student) {
             return NextResponse.json({ message: "Target student not found using the provided ID." }, { status: 404 });
        }
        
        const studentMongoId = student.id; 
        
        const hashedPassword = await bcrypt.hash(password, 10);

        const parentUser = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: "PARENT",
                childId: studentMongoId, 
            },
        });
        
        return NextResponse.json({ 
            message: "Parent account created and linked successfully.", 
            parent: { 
                id: parentUser.id, 
                name: parentUser.name, 
                childId: parentUser.childId 
            } 
        }, { status: 201 });

    } catch (error) {
        console.error("Parent Linking Error:", error);
        return NextResponse.json({ message: "Internal server error." }, { status: 500 });
    }
}