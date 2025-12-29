// app/api/admin/dashboard-data/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db"; 
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  console.log("🔥 API Hit: /api/admin/dashboard-data"); 

  try {
    const session = await getServerSession(authOptions);
    
  
    console.log("Session User:", session?.user);

    if (!session || !session.user) {
      return NextResponse.json({ error: "No session found" }, { status: 401 });
    }

    const count = await prisma.user.count();
    console.log("Total Users in DB:", count);

    return NextResponse.json({
      message: "Success",
      totalStudents: count,
      totalTeachers: 0,
      totalParents: 0,
      totalSubjects: 0,
      attendanceData: [] 
    });

  } catch (error: any) {
   
    console.error("🔴 REAL ERROR IN TERMINAL:", error);
    return NextResponse.json({ error: "Server Error: " + error.message }, { status: 500 });
  }
}