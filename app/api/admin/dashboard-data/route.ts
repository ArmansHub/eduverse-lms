import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
    try {

        const [users, subjects, schedules] = await prisma.$transaction([
            prisma.user.findMany({ orderBy: { createdAt: 'desc' } }),
            prisma.subject.findMany({ orderBy: { name: 'asc' } }),
            prisma.classSchedule.findMany({
                include: {
                    teacher: { select: { name: true } },
                    subject: { select: { name: true } }
                },
                orderBy: { startTime: 'asc' }
            })
        ]);


        let announcements = [];
        try {

            announcements = await prisma.announcement.findMany({
                orderBy: { createdAt: 'desc' },
                take: 5
            });
        } catch (e) { console.log("Announcement table empty or not migrated yet"); }

        const stats = {
            totalUsers: users.length,
            students: users.filter(u => u.role === "STUDENT").length,
            teachers: users.filter(u => u.role === "TEACHER").length,
            parents: users.filter(u => u.role === "PARENT").length,
            admins: users.filter(u => u.role === "ADMIN").length
        };

        const studentMap = new Map();
        users.forEach(u => { if (u.role === 'STUDENT') studentMap.set(u.id, u.name); });
        
        const studentToParentIdMap = new Map();
        users.forEach(u => {
            if (u.role === 'PARENT' && u.childId) studentToParentIdMap.set(u.childId, u.id);
        });

        const finalUsers = users.map(user => ({
            ...user,
            parentId: user.role === 'STUDENT' ? studentToParentIdMap.get(user.id) : (user.childId || null),
            childName: (user.role === 'PARENT' && user.childId) ? studentMap.get(user.childId) : null
        }));

        return NextResponse.json({
            users: finalUsers,
            stats: stats,        
            subjects: subjects, 
            teachers: users.filter(u => u.role === "TEACHER"), 
            announcements: announcements,
            schedules: schedules
        }, { status: 200 });

    } catch (error: any) {
        console.error("Dashboard API Error:", error);
        return NextResponse.json({ message: "Failed to fetch data", error: error.message }, { status: 500 });
    }
}