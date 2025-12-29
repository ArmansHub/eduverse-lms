import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> } 
) {
    try {
        const { id: subjectId } = await params;

        if (!subjectId) {
            return NextResponse.json({ message: "Subject ID missing" }, { status: 400 });
        }
        await prisma.$transaction(async (tx) => {
            
           
            await tx.liveRequest.deleteMany({
                where: { subjectId: subjectId }
            });

            await tx.teacherSubject.deleteMany({
                where: { subjectId: subjectId }
            });


            await tx.classSchedule.deleteMany({
                where: { subjectId: subjectId }
            });

         
            await tx.assignment.deleteMany({
                where: { subjectId: subjectId }
            });

           
            await tx.subject.delete({
                where: { id: subjectId }
            });
        });

        return NextResponse.json({ message: "Subject deleted successfully" }, { status: 200 });

    } catch (error: any) {
        console.error("Critical Subject Delete Error:", error);
        return NextResponse.json({ message: "ডিলিট করতে ব্যর্থ: " + error.message }, { status: 500 });
    }
}