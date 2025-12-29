"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LayoutDashboard, Calendar, BookOpen, FileText, 
  User, LogOut, Menu, GraduationCap, Clock, 
  UserCheck, Download, MapPin, Briefcase,
  ClipboardCheck, ChevronDown, ChevronUp, AlertCircle, X, CheckCircle2
} from "lucide-react";

// --- Types Definition ---
interface DashboardData {
  studentProfile: {
    name: string;
    studentId: string;
    studentClass: string;
  };
  routine: {
    id: string;
    dayOfWeek: string;
    subject: { name: string };
    teacher: { name: string };
    startTime: string;
    endTime: string;
    roomNumber?: string;
  }[];
  
  attendance: { 
    percentage: number; 
    present: number; 
    total: number;
    history?: {
        date: string;
        day: string;
        classes: {
            subject: string;
            teacher: string;
            status: string;
        }[];
    }[];
  };
  
  announcements: {
    id: string;
    title: string;
    content: string;
    createdAt: string;
    author: string; 
    role: string;
    subject?: string;   
  }[];
  
  examResults?: {
    subject: string;
    marks: {
        quiz: number;
        mid: number;
        final: number;
        total: number;
    };
    grade: string;
  }[];

  resources: {
    id: string;
    title: string;
    description?: string;
    subject?: { name: string };
    fileUrl: string;
    createdAt: string;
  }[];

  assignments?: {
    id: string;
    title: string;
    description?: string;
    dueDate: string;
    subject?: { name: string };
    teacher?: { name: string };
  }[];
}

export default function StudentDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState("overview");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DashboardData | null>(null);
  
  const [expandedSubject, setExpandedSubject] = useState<string | null>(null);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<any>(null);

  const [readItems, setReadItems] = useState<Set<string>>(new Set());

  const todayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      fetchData();
      const savedReads = localStorage.getItem("student_read_items");
      if (savedReads) {
        setReadItems(new Set(JSON.parse(savedReads)));
      }
    }
  }, [status, router]);

  const fetchData = () => {
    fetch("/api/student/dashboard", { cache: 'no-store' })
      .then((res) => res.json())
      .then((apiData) => {
        setData(apiData);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch data", err);
        setLoading(false);
      });
  };

  const markAsRead = (id: string) => {
    if (!readItems.has(id)) {
      const newReads = new Set(readItems);
      newReads.add(id);
      setReadItems(newReads);
      localStorage.setItem("student_read_items", JSON.stringify(Array.from(newReads)));
    }
  };

  if (loading || status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-indigo-900 font-bold animate-pulse">Loading Student Portal...</p>
        </div>
      </div>
    );
  }

  const profileName = data?.studentProfile?.name || session?.user?.name || "Student";
  const profileClass = data?.studentProfile?.studentClass || "Class Not Assigned";
  const profileId = data?.studentProfile?.studentId || "N/A";

  const weekDays = ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

  // Counts
  const unreadResources = data?.resources?.filter(r => !readItems.has(r.id)).length || 0;
  const unreadNotices = data?.announcements?.filter(n => !readItems.has(n.id)).length || 0;
  const pendingAssignmentsCount = data?.assignments?.length || 0;

  // --- SIDEBAR ---
  const Sidebar = () => (
    <div className="h-full flex flex-col bg-[#0F172A] text-white w-64 shadow-2xl border-r border-slate-800">
        <div className="p-6 flex items-center gap-3 border-b border-slate-800">
            <div className="bg-indigo-600 p-2.5 rounded-xl shadow-[0_0_15px_rgba(79,70,229,0.4)]">
                <GraduationCap size={24} className="text-white" />
            </div>
            <div>
                <h1 className="text-xl font-black tracking-tight text-white">EduVerse</h1>
                <p className="text-[10px] text-indigo-400 uppercase tracking-widest font-bold">Student Portal</p>
            </div>
        </div>

        <div className="flex-1 py-6 px-4 space-y-2 overflow-y-auto custom-scrollbar-dark">
            {[
                { id: 'overview', icon: LayoutDashboard, label: 'Overview' },
                { id: 'attendance', icon: ClipboardCheck, label: 'Attendance' },
                { id: 'assignments', icon: Briefcase, label: 'Assignments', badge: pendingAssignmentsCount },
                { id: 'routine', icon: Calendar, label: 'Routine' },
                { id: 'resources', icon: BookOpen, label: 'Resources', badge: unreadResources },
                { id: 'results', icon: FileText, label: 'Results' }, 
            ].map((item) => (
                <button
                    key={item.id}
                    onClick={() => { setActiveTab(item.id); setIsSidebarOpen(false); }}
                    className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl transition-all duration-300 group ${
                        activeTab === item.id 
                        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/50 font-bold" 
                        : "text-slate-400 hover:bg-slate-800 hover:text-white font-medium"
                    }`}
                >
                    <div className="flex items-center gap-3">
                        <item.icon size={20} className={activeTab === item.id ? "text-white" : "text-slate-500 group-hover:text-indigo-400"} />
                        <span>{item.label}</span>
                    </div>
                    {item.badge && item.badge > 0 ? (
                        <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">{item.badge}</span>
                    ) : null}
                </button>
            ))}
        </div>

        <div className="p-4 border-t border-slate-800 bg-[#0F172A]">
            <div className="bg-slate-800/50 rounded-xl p-3 mb-3 border border-slate-700">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-indigo-500/20 rounded-full flex items-center justify-center text-indigo-400 shrink-0 border border-indigo-500/30">
                        <User size={20} />
                    </div>
                    <div className="overflow-hidden">
                        <p className="text-sm font-bold text-white truncate">{profileName.split(' ')[0]}</p>
                        <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wide">{profileClass}</p>
                        <p className="text-[9px] text-slate-500 font-mono">ID: {profileId}</p>
                    </div>
                </div>
            </div>
            
            <button 
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="w-full flex items-center justify-center gap-2 text-rose-400 hover:text-white hover:bg-rose-600 py-2.5 rounded-xl transition-all duration-300 text-sm font-bold border border-rose-500/20 hover:border-rose-600"
            >
                <LogOut size={16} /> Logout
            </button>
        </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      
      <aside className="hidden lg:block fixed left-0 top-0 bottom-0 z-20 w-64">
         <Sidebar />
      </aside>

      <AnimatePresence>
        {isSidebarOpen && (
            <>
                <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    onClick={() => setIsSidebarOpen(false)}
                    className="fixed inset-0 bg-slate-900/60 z-40 lg:hidden backdrop-blur-sm"
                />
                <motion.div 
                    initial={{ x: -300 }} animate={{ x: 0 }} exit={{ x: -300 }}
                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                    className="fixed left-0 top-0 bottom-0 z-50 w-64 lg:hidden"
                >
                    <Sidebar />
                </motion.div>
            </>
        )}
      </AnimatePresence>

      <main className="flex-1 lg:ml-64 min-h-screen flex flex-col">
        
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30 px-6 py-3 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
                <button 
                    onClick={() => setIsSidebarOpen(true)}
                    className="lg:hidden p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition"
                >
                    <Menu size={24} />
                </button>
                <h2 className="text-xl font-black text-slate-800 capitalize hidden sm:block tracking-tight">
                    {activeTab === 'overview' ? 'Student Dashboard' : activeTab.replace('-', ' ')}
                </h2>
            </div>
            
            <div className="flex items-center gap-4">
                <div className="h-10 w-10 bg-gradient-to-br from-indigo-600 to-violet-700 rounded-full ring-2 ring-white shadow-lg overflow-hidden cursor-pointer hover:scale-105 transition duration-300">
                    <div className="w-full h-full flex items-center justify-center text-white font-bold text-lg">
                        {profileName?.charAt(0)}
                    </div>
                </div>
            </div>
        </header>

        <div className="p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-8">

            {/* ================= OVERVIEW TAB ================= */}
            {activeTab === 'overview' && (
                <>
                    <motion.div 
                        initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                        className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-[2rem] p-8 text-white shadow-xl relative overflow-hidden flex flex-col xl:flex-row justify-between items-center gap-6"
                    >
                        <div className="relative z-10 w-full xl:w-auto">
                            <h1 className="text-3xl font-black mb-2 tracking-tight">Hello, {profileName.split(" ")[0]}! 👋</h1>
                            <p className="text-indigo-100 font-medium">
                                You have <span className="text-white font-bold border-b-2 border-indigo-300">{data?.routine?.filter(r => r.dayOfWeek?.toUpperCase() === todayName.toUpperCase()).length || 0} classes</span> scheduled for today.
                            </p>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-3 relative z-10 w-full xl:w-auto">
                             <div 
                                onClick={() => setActiveTab('assignments')}
                                className="px-4 py-3 rounded-2xl bg-white/10 border border-white/20 text-center backdrop-blur-sm shadow-lg shadow-black/10 cursor-pointer hover:bg-white/20 transition-all active:scale-95 group"
                             >
                                <span className="block text-xl font-black text-white group-hover:text-indigo-200 transition-colors">
                                    {pendingAssignmentsCount}
                                </span>
                                <span className="text-[9px] uppercase font-bold tracking-widest text-indigo-100 opacity-90">Pending</span>
                             </div>

                             <div 
                                onClick={() => setActiveTab('resources')}
                                className={`px-4 py-3 rounded-2xl border text-center backdrop-blur-sm shadow-lg shadow-black/10 cursor-pointer transition-all active:scale-95 ${unreadResources > 0 ? "bg-white/20 border-white/40" : "bg-white/10 border-white/20"}`}
                             >
                                <span className="block text-xl font-black text-white">{unreadResources}</span>
                                <span className="text-[9px] uppercase font-bold tracking-widest text-indigo-100 opacity-90">Resources</span>
                             </div>

                             <div className={`px-4 py-3 rounded-2xl border text-center backdrop-blur-sm shadow-lg shadow-black/10 ${unreadNotices > 0 ? "bg-white/20 border-white/40" : "bg-white/10 border-white/20"}`}>
                                <span className="block text-xl font-black text-white">{unreadNotices}</span>
                                <span className="text-[9px] uppercase font-bold tracking-widest text-indigo-100 opacity-90">Notices</span>
                             </div>
                        </div>
                        
                        <div className="absolute -right-10 -top-10 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                        <div className="absolute -left-10 -bottom-10 w-64 h-64 bg-black/10 rounded-full blur-3xl"></div>
                    </motion.div>

                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                        <div className="xl:col-span-2 space-y-8">
                            <div className="bg-white rounded-[2rem] border border-slate-200/60 shadow-sm p-6">
                                <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2 mb-6">
                                    <Clock className="text-indigo-600" size={20} /> Today's Schedule <span className="text-slate-900 font-black text-lg">({todayName})</span>
                                </h3>
                                <div className="space-y-4">
                                    {data?.routine && data.routine.filter(r => r.dayOfWeek?.toUpperCase() === todayName.toUpperCase()).length > 0 ? (
                                        data.routine
                                        .filter(r => r.dayOfWeek && r.dayOfWeek.toUpperCase() === todayName.toUpperCase())
                                        .map((cls, idx) => (
                                            <div key={idx} className="flex flex-col sm:flex-row items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-indigo-300 hover:shadow-md transition-all duration-300 group">
                                                <div className="flex items-center gap-4 w-full">
                                                    <div className="h-14 w-16 rounded-xl bg-white text-indigo-600 flex flex-col items-center justify-center font-black text-xs border border-slate-200 shadow-sm group-hover:bg-indigo-600 group-hover:text-white transition">
                                                        <span>{cls.startTime.split(':')[0]}</span>
                                                        <span>{cls.startTime.split(':')[1]}</span>
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="font-bold text-slate-900 text-lg">{cls.subject?.name}</h4>
                                                        <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-500 mt-1">
                                                            <span className="flex items-center gap-1.5"><UserCheck size={14} className="text-indigo-500"/> {cls.teacher?.name}</span>
                                                            <span className="flex items-center gap-1.5"><MapPin size={14} className="text-rose-500"/> Room {cls.roomNumber || "N/A"}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-10 text-slate-400 bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-200">
                                            <p className="font-bold">No classes scheduled for today.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* NOTICE BOARD SECTION */}
                        <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-6 h-fit sticky top-24">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                                    <FileText className="text-amber-500" size={20} /> Notice Board
                                </h3>
                                {unreadNotices > 0 && <span className="bg-rose-100 text-rose-600 text-xs font-black px-2 py-1 rounded-md">{unreadNotices} New</span>}
                            </div>

                            <div className="space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar">
                                {data?.announcements && data.announcements.length > 0 ? (
                                    data.announcements.map((note, idx) => {
                                        const isRead = readItems.has(note.id);
                                        const isAdmin = note.role === "ADMIN";
                                        return (
                                            <div 
                                                key={idx} 
                                                onClick={() => {
                                                    setSelectedAnnouncement(note);
                                                    markAsRead(note.id);
                                                }}
                                                className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group mb-3 ${
                                                        isAdmin 
                                                        ? "bg-white border-rose-100 hover:border-rose-300 shadow-sm" 
                                                        : "bg-white border-indigo-100 hover:border-indigo-300 shadow-sm"
                                                    } ${isRead ? "opacity-70" : "opacity-100"}`}>
                                                {!isRead && <div className="absolute top-3 right-3 h-2 w-2 bg-rose-500 rounded-full animate-pulse"></div>}
                                                
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className={`text-[9px] font-black px-2 py-1 rounded-lg uppercase tracking-wider ${
                                                            isAdmin 
                                                            ? "bg-rose-100 text-rose-700" 
                                                            : "bg-indigo-100 text-indigo-700"
                                                        }`}>
                                                            {isAdmin ? "Admin Notice" : "Teacher Notice"}
                                                        </span>
                                                </div>
                                                <h4 className={`text-sm font-bold leading-tight mb-1 ${isRead ? "text-slate-600" : "text-slate-900"}`}>{note.title}</h4>
                                                
<p className="text-xs text-slate-600 leading-relaxed line-clamp-3 font-medium">
    {note.content.replace(/\[Class:.*?, Subject:.*?\]/g, '').trim()}
</p>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="text-center py-12 text-slate-400">
                                        <p className="text-sm font-bold">No notices available.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* ================= ATTENDANCE TAB ================= */}
           {activeTab === 'attendance' && (
    <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
             <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                <ClipboardCheck className="text-indigo-600" size={28} /> Attendance History
             </h2>
             <div className="bg-white px-6 py-3 rounded-2xl border border-slate-200 shadow-sm text-center">
                <span className="text-xs text-slate-400 font-bold uppercase block tracking-widest">Overall</span>
                <span className={`text-2xl font-black ${data?.attendance?.percentage && data.attendance.percentage >= 80 ? "text-emerald-500" : "text-amber-500"}`}>{data?.attendance?.percentage || 0}%</span>
             </div>
        </div>

        <div className="p-8 bg-slate-50/30 min-h-[400px]">
            {data?.attendance?.history && data.attendance.history.length > 0 ? (
                <div className="space-y-6">
                    {data.attendance.history.map((group, idx) => (
                        <div key={idx} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition">
                           
                            <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className="bg-indigo-100 text-indigo-600 p-2 rounded-lg"><BookOpen size={18}/></div>
                                    <h3 className="font-bold text-slate-800">
                                      
                                        {group.classes[0]?.subject || "Subject"} 
                                        <span className="text-slate-400 font-medium ml-3 text-sm">
                                            ({group.date.split('T')[0]})
                                        </span>
                                    </h3>
                                </div>
                                
                            </div>
                            
                            <div className="divide-y divide-slate-50">
                                {group.classes.map((cls, cIdx) => (
                                    <div key={cIdx} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition">
                                        <div>
                                           
                                            <p className="text-sm text-slate-700 flex items-center gap-2 font-bold">
                                                <UserCheck size={16} className="text-indigo-500"/> 
                                                Instructor: {cls.teacher}
                                            </p>
                                        </div>
                                        <div>
                                            <span className={`px-5 py-2 rounded-xl text-xs font-black border block text-center min-w-[100px] ${
                                                cls.status === 'PRESENT' ? 'bg-emerald-100 text-emerald-600 border-emerald-200' :
                                                cls.status === 'ABSENT' ? 'bg-rose-100 text-rose-600 border-rose-200' :
                                                'bg-amber-100 text-amber-600 border-amber-200'
                                            }`}>
                                                {cls.status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 text-slate-400">
                    <ClipboardCheck size={64} className="mx-auto mb-4 opacity-10" />
                    <p className="font-bold text-lg">No attendance records found yet.</p>
                </div>
            )}
        </div>
    </div>
)}
            {/* ================= ASSIGNMENTS TAB ================= */}
            {activeTab === 'assignments' && (
                <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 p-8">
                     <div className="flex justify-between items-center mb-8">
                        <h2 className="text-2xl font-black flex items-center gap-3 text-slate-800">
                            <Briefcase className="text-indigo-600" size={28} /> Assignments
                        </h2>
                     </div>
                     
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {data?.assignments && data.assignments.length > 0 ? (
                            data.assignments.map((assign, idx) => (
                                <div key={idx} className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-xl hover:border-indigo-200 transition-all group">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider">
                                            {assign.subject?.name || "General"}
                                        </div>
                                        {assign.dueDate && (
                                            <div className="text-xs font-bold text-rose-500 bg-rose-50 px-2 py-1 rounded flex items-center gap-1">
                                                <Clock size={12}/> Due: {new Date(assign.dueDate).toLocaleDateString()}
                                            </div>
                                        )}
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900 mb-2">{assign.title}</h3>
                                    <p className="text-sm text-slate-500 mb-4 line-clamp-2">{assign.description || "No description provided."}</p>
                                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400 mt-auto">
                                        <UserCheck size={14}/> Assigned by {assign.teacher?.name}
                                    </div>
                                </div>
                            ))
                        ) : (
                             <div className="col-span-full text-center py-20 text-slate-400 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
                                 <Briefcase size={64} className="mx-auto mb-4 opacity-10" />
                                 <p className="font-bold">No pending assignments.</p>
                             </div>
                        )}
                     </div>
                </div>
            )}

            {/* ================= ROUTINE TAB ================= */}
            {activeTab === 'routine' && (
                <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 p-8">
                     <div className="flex justify-between items-center mb-8">
                        <h2 className="text-2xl font-black flex items-center gap-3 text-slate-800">
                            <Calendar className="text-indigo-600" size={28} /> Class Routine
                        </h2>
                     </div>
                     
                     <div className="space-y-10">
                        {weekDays.map((day) => {
                            const dayClasses = data?.routine?.filter((r: any) => 
                                r.dayOfWeek && r.dayOfWeek.toUpperCase() === day.toUpperCase()
                            ) || [];
                            
                            if (dayClasses.length === 0) return null;

                            return (
                                <div key={day} className="relative pl-8 border-l-2 border-slate-200">
                                    <div className="absolute -left-[11px] top-0 w-5 h-5 rounded-full bg-indigo-600 border-4 border-slate-50 shadow-sm"></div>
                                    <h3 className="text-xl font-black text-slate-800 mb-6">{day}</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {dayClasses.map((cls: any, idx: number) => (
                                            <div key={idx} className="p-6 bg-slate-50 rounded-2xl border border-slate-200 hover:shadow-lg hover:border-indigo-300 hover:-translate-y-1 transition-all duration-300 group">
                                                <div className="flex justify-between items-start mb-3">
                                                    <h4 className="font-bold text-slate-900 text-lg">{cls.subject.name}</h4>
                                                    <span className="text-xs bg-white border border-slate-200 text-slate-600 px-3 py-1.5 rounded-lg font-mono font-bold shadow-sm group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                                        {cls.startTime} - {cls.endTime}
                                                    </span>
                                                </div>
                                                <div className="text-sm text-slate-500 space-y-2 font-medium">
                                                    <p className="flex items-center gap-2"><UserCheck size={16} className="text-slate-400"/> {cls.teacher.name}</p>
                                                    {cls.roomNumber && <p className="flex items-center gap-2"><MapPin size={16} className="text-slate-400"/> Room {cls.roomNumber}</p>}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                     </div>
                </div>
            )}

            {/* ================= EXAM RESULTS TAB ================= */}
            {activeTab === 'results' && (
                <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-8 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
                        <GraduationCap className="text-emerald-600" size={28} />
                        <h2 className="text-2xl font-black text-slate-800">Academic Performance</h2>
                    </div>

                    <div className="p-8 bg-slate-50/30 min-h-[400px]">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {data?.examResults && data.examResults.length > 0 ? (
                                data.examResults.map((res, index) => (
                                    <div key={index} className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 group">
                                        <div 
                                            onClick={() => setExpandedSubject(expandedSubject === res.subject ? null : res.subject)}
                                            className="p-6 cursor-pointer flex justify-between items-center bg-white hover:bg-slate-50/50 transition"
                                        >
                                            <div className="flex items-center gap-5">
                                                <div className="h-14 w-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black text-2xl border border-emerald-100 shadow-sm group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                                                    {res.grade}
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-xl text-slate-800">{res.subject}</h3>
                                                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">Total Marks: {res.marks.total}</p>
                                                </div>
                                            </div>
                                            {expandedSubject === res.subject ? 
                                                <ChevronUp size={24} className="text-emerald-500"/> : 
                                                <ChevronDown size={24} className="text-slate-300 group-hover:text-emerald-500 transition"/>
                                            }
                                        </div>

                                        <AnimatePresence>
                                            {expandedSubject === res.subject && (
                                                <motion.div 
                                                    initial={{ height: 0, opacity: 0 }} 
                                                    animate={{ height: "auto", opacity: 1 }} 
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="border-t border-slate-100 bg-slate-50/50 px-6 py-6"
                                                >
                                                    <div className="grid grid-cols-3 gap-4 text-center">
                                                        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                                                            <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest block mb-2">Quiz</span>
                                                            <p className="text-2xl font-black text-slate-700">{res.marks.quiz}</p>
                                                        </div>
                                                        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                                                            <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest block mb-2">Midterm</span>
                                                            <p className="text-2xl font-black text-slate-700">{res.marks.mid}</p>
                                                        </div>
                                                        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                                                            <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest block mb-2">Final</span>
                                                            <p className="text-2xl font-black text-slate-700">{res.marks.final}</p>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-full text-center py-20 text-slate-400">
                                    <GraduationCap size={64} className="mx-auto mb-4 opacity-10" />
                                    <p className="font-bold">No exam results published yet.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
            
            {/* ================= RESOURCES TAB ================= */}
            {activeTab === 'resources' && (
                <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 p-8">
                     <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-black flex items-center gap-3 text-slate-800">
                            <BookOpen className="text-indigo-600" size={28} /> Learning Resources
                        </h2>
                        {unreadResources > 0 && (
                            <span className="bg-indigo-100 text-indigo-700 text-xs font-black px-3 py-1.5 rounded-lg">{unreadResources} New Uploads</span>
                        )}
                     </div>
                     
                     {data?.resources && data.resources.length > 0 ? (
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             {data.resources.map((res, i) => {
                                 const isRead = readItems.has(res.id);
                                 return (
                                     <div key={i} className={`flex flex-col justify-between p-6 border rounded-3xl transition-all duration-300 group ${
                                         isRead 
                                         ? "bg-slate-50 border-slate-200" 
                                         : "bg-white border-indigo-100 shadow-xl shadow-indigo-100/50 relative overflow-hidden"
                                     }`}>
                                         {!isRead && (
                                            <div className="absolute top-0 right-0 bg-indigo-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl">NEW</div>
                                         )}

                                         <div>
                                             <div className="flex justify-between items-start mb-4">
                                                <span className="text-[10px] font-black bg-slate-200 text-slate-600 px-3 py-1 rounded-full uppercase tracking-wider">
                                                    {res.subject?.name || "General"}
                                                </span>
                                                <span className="text-xs font-bold text-slate-400">{new Date(res.createdAt).toLocaleDateString()}</span>
                                             </div>
                                             <h4 className={`font-black text-xl mb-2 line-clamp-2 ${isRead ? "text-slate-700" : "text-slate-900"}`} title={res.title}>
                                                 {res.title}
                                             </h4>
                                             <p className="text-sm text-slate-500 mb-6 line-clamp-2 font-medium">
                                                 {res.description || "No description provided."}
                                             </p>
                                         </div>
                                         <a 
                                            href={res.fileUrl} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            download
                                            onClick={() => markAsRead(res.id)} 
                                            className={`mt-auto w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm transition-all shadow-sm active:scale-95 ${
                                                isRead 
                                                ? "bg-white border border-slate-300 text-slate-600 hover:bg-slate-100" 
                                                : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200"
                                            }`}
                                         >
                                            {isRead ? <CheckCircle2 size={18}/> : <Download size={18} />} 
                                            {isRead ? "Downloaded" : "Download Material"}
                                         </a>
                                     </div>
                                 );
                             })}
                         </div>
                     ) : (
                         <div className="text-center py-20 text-slate-400 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
                             <BookOpen size={64} className="mx-auto mb-4 opacity-10" />
                             <p className="font-bold">No study materials uploaded yet.</p>
                         </div>
                     )}
                </div>
            )}

        </div>
      </main>

      {/* ANNOUNCEMENT POPUP */}
      <AnimatePresence>
        {selectedAnnouncement && (
            <>
                <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    onClick={() => setSelectedAnnouncement(null)}
                    className="fixed inset-0 bg-slate-900/60 z-50 backdrop-blur-sm"
                />
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                    className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-3xl shadow-2xl z-50 w-11/12 max-w-lg overflow-hidden border border-slate-100"
                >
                    <div className="p-8">
                        <div className="flex justify-between items-start mb-6">
                            <span className={`text-[10px] font-black px-3 py-1.5 rounded-lg uppercase tracking-wider ${
                                selectedAnnouncement.role === "ADMIN" ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700"
                            }`}>
                                {selectedAnnouncement.role || "Notice"}
                            </span>
                            <button onClick={() => setSelectedAnnouncement(null)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition">
                                <X size={24} />
                            </button>
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 mb-3 leading-tight">{selectedAnnouncement.title}</h2>
                        <div className="text-xs font-bold text-slate-400 mb-6 flex items-center gap-2">
                            <span>{new Date(selectedAnnouncement.createdAt).toLocaleDateString()}</span>
                            <span className="h-1 w-1 bg-slate-300 rounded-full"></span>
                            <span>{selectedAnnouncement.author || "Admin"}</span>
                        </div>
                        <div className="max-h-64 overflow-y-auto custom-scrollbar pr-2">
                            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap font-medium">{selectedAnnouncement.content}</p>
                        </div>
                    </div>
                    <div className="bg-slate-50 p-6 border-t border-slate-100 text-center">
                        <button 
                            onClick={() => setSelectedAnnouncement(null)}
                            className="text-sm font-bold text-slate-500 hover:text-slate-800 transition uppercase tracking-wide"
                        >
                            Close Notice
                        </button>
                    </div>
                </motion.div>
            </>
        )}
      </AnimatePresence>

    </div>
  );
}