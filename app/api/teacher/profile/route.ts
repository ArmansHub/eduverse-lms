import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const prisma = new PrismaClient();

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const teacherInfo = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { teachingSubjects: { include: { subject: true } } }
  });

  return NextResponse.json(teacherInfo);
}