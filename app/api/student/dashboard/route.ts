import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== "STUDENT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbId = (session.user as any).id;

    // 1. Student Profile
    const student = await prisma.user.findUnique({
      where: { id: dbId },
      select: { 
        id: true, name: true, studentId: true, studentClass: true, email: true
      }
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const currentClass = student.studentClass ? student.studentClass.trim() : "";
    
    // 2. Data Fetching 
    const [announcementsRaw, routineRaw, gradesRaw, attendanceRaw, resourcesRaw, assignmentsRaw, teachersRaw] = await Promise.all([
      
      prisma.announcement.findMany({
        where: {
            OR: [
                { className: currentClass }, 
                { className: null },          
                { className: "" },           
                { adminId: { not: null } }    
            ]
        },
        orderBy: { createdAt: 'desc' },
        include: { 
            admin: { select: { name: true } }, 
            teacher: { select: { name: true } } 
        }
      }),

      prisma.classSchedule.findMany({
        where: { className: currentClass },
        include: { 
            subject: true, 
            teacher: { select: { name: true } } 
        },
        orderBy: { startTime: 'asc' }
      }),

      prisma.grade.findMany({
        where: { studentId: dbId },
        include: { subject: { select: { name: true } } }
      }),

      prisma.attendance.findMany({
        where: { studentId: dbId },
        orderBy: { date: 'desc' }
      }),

      prisma.resource.findMany({
        where: { className: currentClass },
        include: { subject: { select: { name: true } } },
        orderBy: { createdAt: 'desc' }
      }),

      prisma.assignment.findMany({
        where: { className: currentClass },
        orderBy: { dueDate: 'asc' },
        include: { 
            subject: { select: { name: true } }, 
            teacher: { select: { name: true } } 
        }
      }),

      prisma.user.findMany({
        where: { role: "TEACHER" },
        select: { id: true, name: true }
      })
    ]);

    // Teacher ID to Name Map
    const teacherLookup: Record<string, string> = {};
    teachersRaw.forEach(t => { teacherLookup[t.id] = t.name; });

    // 3. Formatting Logic

    // --- Routine ---
    const routine = routineRaw.map(r => ({
        id: r.id,
        dayOfWeek: r.dayOfWeek,
        subject: { name: r.subject ? r.subject.name : "N/A" },
        teacher: { name: r.teacher ? r.teacher.name : "N/A" },
        startTime: r.startTime,
        endTime: r.endTime,
        roomNumber: r.roomNumber
    }));

    // --- Attendance ---
    const attendanceMap = new Map();
    attendanceRaw.forEach(record => {
        const dateStr = new Date(record.date).toLocaleDateString('en-US', { 
            weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' 
        });
        if(!attendanceMap.has(dateStr)) {
            attendanceMap.set(dateStr, {
                date: record.date,
                day: new Date(record.date).toLocaleDateString('en-US', { weekday: 'long' }),
                formattedDate: dateStr,
                classes: []
            });
        }

        const tName = record.teacherId ? teacherLookup[record.teacherId] : "Instructor";
        const sName = routineRaw.find(r => r.teacherId === record.teacherId)?.subject?.name || "Class Session";

        attendanceMap.get(dateStr).classes.push({
            subject: sName, 
            teacher: tName,
            status: record.status
        });
    });

    const totalDays = attendanceRaw.length;
    const presentDays = attendanceRaw.filter(a => a.status === "PRESENT").length;
    const percentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

    // --- Exam Results ---
    const examResults = gradesRaw.map(g => ({
        id: g.id,
        subject: g.subject?.name || "Unknown",
        marks: {
            quiz: g.quizMarks || 0,
            mid: g.midMarks || 0,
            final: g.finalMarks || 0,
            total: (g.quizMarks||0) + (g.midMarks||0) + (g.finalMarks||0)
        }
    }));

    // --- Resources  ---
    const formattedResources = resourcesRaw.map(r => ({
        id: r.id,
        title: r.title,
        fileUrl: (r as any).url || (r as any).fileUrl || (r as any).attachment || "#", 
        fileName: (r as any).fileName || r.title || "Download",
        teacher: { name: (r as any).subject?.name || "Teacher" }, 
        createdAt: r.createdAt
    }));

    // --- Assignments ---
    const formattedAssignments = assignmentsRaw.map(a => ({
        id: a.id,
        title: a.title,
        dueDate: a.dueDate,
        subject: { name: a.subject ? a.subject.name : "General" },
        teacher: { name: a.teacher ? a.teacher.name : "Teacher" }
    }));

    // --- Announcements ---
    const formattedAnnouncements = announcementsRaw.map(a => {
        let authorName = a.admin?.name || a.teacher?.name || "Management";
        let subjectName = "";
        const subjectMatch = a.content.match(/Subject:\s*([^\]\n,]+)/i);
        if (subjectMatch) subjectName = subjectMatch[1].trim();

        return {
            id: a.id,
            title: a.title,
            content: a.content,
            author: authorName,
            subject: subjectName,
            createdAt: a.createdAt,
            role: a.adminId ? "ADMIN" : "TEACHER"
        };
    });

    return NextResponse.json({
      studentProfile: student,
      routine, 
      attendance: { 
        percentage, 
        present: presentDays, 
        total: totalDays,
        history: Array.from(attendanceMap.values()) 
      },
      examResults,
      announcements: formattedAnnouncements,
      resources: formattedResources, 
      assignments: formattedAssignments 
    });

  } catch (error) {
    console.error("Dashboard API Error:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}