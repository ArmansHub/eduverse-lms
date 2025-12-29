import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get("id");

        if (!userId) return NextResponse.json({ message: "ID missing" }, { status: 400 });


        await prisma.teacherSubject.deleteMany({ where: { teacherId: userId } });
        await prisma.liveRequest.deleteMany({ where: { OR: [{ teacherId: userId }, { adminId: userId }] } });


        const user = await prisma.user.findUnique({ where: { id: userId } });
        await prisma.user.updateMany({
            where: { OR: [{ childId: userId }, { childId: user?.studentId || "NONE" }] },
            data: { childId: null }
        });

        await prisma.user.delete({ where: { id: userId } });

        return NextResponse.json({ message: "Deleted" });
    } catch (error) {
        console.error("Critical Error:", error);
        return NextResponse.json({ message: "Database constraint error. Use Prisma Studio to clear childId." }, { status: 500 });
    }
}