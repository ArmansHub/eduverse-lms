import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;


export async function GET() {
    try {
        const subjects = await prisma.subject.findMany({
            orderBy: { name: 'asc' },
            include: { 
                teachers: {
                    select: { 
                        teacherId: true, 
                        teacher: { select: { id: true, name: true } } 
                    } 
                } 
            }
        });
        return NextResponse.json(subjects);
    } catch (error) {
        console.error("GET Subjects Error:", error);
        return NextResponse.json({ message: "Failed to fetch subjects" }, { status: 500 });
    }
}


export async function POST(request: Request) {
    try {
        const body = await request.json();
        
        const { name, teacherIds } = body;

        if (!name) {
            return NextResponse.json({ message: "Subject name is required" }, { status: 400 });
        }

        const newSubject = await prisma.subject.create({
            data: {
                name,
                
                teachers: {
                  
                    create: teacherIds?.map((tId: string) => ({
                        teacher: { connect: { id: tId } }
                    })) || []
                }
            }
        });

        return NextResponse.json(newSubject, { status: 201 });

    } catch (error: any) {
        console.error("Subject Create Error:", error);
   
        if (error.code === 'P2002') {
             return NextResponse.json({ message: "A subject with this name already exists." }, { status: 409 });
        }
       
        if (error.code === 'P2025') {
            return NextResponse.json({ message: "Failed to link subject: One or more Teacher IDs provided were not found." }, { status: 404 });
        }
        
        return NextResponse.json({ message: "Failed to create subject due to an internal server error." }, { status: 500 });
    }
}