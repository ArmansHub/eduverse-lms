"use client";

import { useState, useEffect, useRef } from "react";
import { useSession, signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { toast, Toaster } from "react-hot-toast";
import { 
  LayoutDashboard, Users, Bell, LogOut, GraduationCap, 
  Calendar, CheckCircle, Clock, Upload, ArrowLeft,
  MessageCircle, Send, Save, BookOpen, Loader2,
  ChevronRight, X, Menu, FileText, ChevronDown, Paperclip, Briefcase
} from "lucide-react";

export default function TeacherDashboard() {
  const { data: session, status: authStatus } = useSession();
  
  // --- UI States ---
  const [activeTab, setActiveTab] = useState("overview");
  const [showNotifications, setShowNotifications] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // --- Data States ---
  const [announcements, setAnnouncements] = useState<any[]>([]); 
  const [availableSubjects, setAvailableSubjects] = useState<any[]>([]);
  const [routine, setRoutine] = useState<any[]>([]);
  const [myClasses, setMyClasses] = useState<any[]>([]);

  // --- Grading & Attendance States ---
  const [selectedClassForGrading, setSelectedClassForGrading] = useState<any>(null);
  const [gradingStudents, setGradingStudents] = useState<any[]>([]);
  const [isSavingGrades, setIsSavingGrades] = useState(false);

  const [selectedClassForAttendance, setSelectedClassForAttendance] = useState<any>(null);
  const [attendanceStudents, setAttendanceStudents] = useState<any[]>([]);
  const [isSavingAttendance, setIsSavingAttendance] = useState(false);

  // --- Chat States ---
  const [conversations, setConversations] = useState<any[]>([]);
  const [currentChatUser, setCurrentChatUser] = useState<any>(null);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // --- Form States (Shared) ---
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSubject, setSelectedSubject] = useState(""); 
  
  // Resource Upload Forms
  const [resourceTitle, setResourceTitle] = useState("");
  const [resourceFile, setResourceFile] = useState<File | null>(null);

  // ✅ Assignment Form States
  const [assignTitle, setAssignTitle] = useState("");
  const [assignDesc, setAssignDesc] = useState("");
  const [assignDueDate, setAssignDueDate] = useState("");

  // Notice Forms
  const [noticeTitle, setNoticeTitle] = useState("");
  const [noticeContent, setNoticeContent] = useState("");

  // 1. Initial Data Fetching
  useEffect(() => {
    const fetchInitialData = async () => {
      if (authStatus === "authenticated" && session?.user) {
        try {
          const tId = (session.user as any).id;
          
          const [resRoutine, resSub, resAnnounce, resClasses, resChat] = await Promise.all([
            fetch(`/api/teacher/routine?teacherId=${tId}`, { cache: 'no-store' }),
            fetch(`/api/teacher/subjects?teacherId=${tId}`, { cache: 'no-store' }),
            fetch('/api/common/announcements', { cache: 'no-store' }),
            fetch('/api/teacher/my-classes', { cache: 'no-store' }),
            fetch('/api/teacher/chat', { cache: 'no-store' }) 
          ]);

          if (resRoutine.ok) setRoutine(await resRoutine.json());
          if (resSub.ok) setAvailableSubjects(await resSub.json());
          if (resClasses.ok) setMyClasses(await resClasses.json());
          if (resChat.ok) setConversations(await resChat.json());
          
          if (resAnnounce.ok) {
             const data = await resAnnounce.json();
             const items = Array.isArray(data) ? data : (data.announcements || data.data || []);
             const filteredItems = items.filter((n: any) => n.teacherId !== tId);
             setAnnouncements(filteredItems);
          }
        } catch (error) {
          console.error("Dashboard Load Error:", error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchInitialData();
  }, [authStatus, session]);

  // 2. Chat Data Fetching (When tab opens)
  useEffect(() => {
    if (activeTab === 'messages' && authStatus === "authenticated") {
       fetch('/api/teacher/chat')
         .then(res => res.json())
         .then(data => setConversations(Array.isArray(data) ? data : []))
         .catch(err => console.error(err));
    }
  }, [activeTab, authStatus]);

  // --- HANDLERS ---

  // ✅ Create Assignment Handler
  const handleCreateAssignment = async () => {
    if(!assignTitle || !assignDueDate || !selectedClass || !selectedSubject) {
        toast.error("Please fill Title, Date, Class and Subject!");
        return;
    }
    const tId = (session?.user as any).id;

    toast.promise(
        fetch("/api/teacher/assignment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                title: assignTitle,
                description: assignDesc,
                dueDate: assignDueDate,
                className: selectedClass,
                subjectName: selectedSubject,
                teacherId: tId
            })
        }).then(async (res) => {
            if (!res.ok) throw new Error("Failed");
            setAssignTitle(""); setAssignDesc(""); setAssignDueDate("");
            return res.json();
        }),
        { loading: 'Creating Assignment...', success: 'Assignment Posted!', error: 'Failed to post assignment' }
    );
  };

  const handleResourceUpload = async () => {
    if(!resourceTitle || !selectedClass || !selectedSubject) {
        toast.error("Please fill all fields!");
        return;
    }
    const tId = (session?.user as any).id;
    toast.promise(
        fetch("/api/teacher/resource", {
            method: "POST", 
            body: JSON.stringify({ 
                title: resourceTitle, 
                fileName: resourceFile ? resourceFile.name : "document.pdf", 
                fileUrl: "https://example.com/demo.pdf", 
                className: selectedClass, 
                subjectName: selectedSubject, 
                teacherId: tId 
            })
        }),
        { loading: 'Uploading...', success: 'Resource Uploaded!', error: 'Upload Failed' }
    );
    setResourceTitle(""); setResourceFile(null);
  };

  const handlePostNotice = async () => {
    if(!noticeTitle || !noticeContent || !selectedClass || !selectedSubject) {
        toast.error("Select Class & Subject for the notice");
        return;
    }
    const tId = (session?.user as any).id;
    const enrichedContent = `[Class: ${selectedClass}, Subject: ${selectedSubject}] \n\n${noticeContent}`;
    
    toast.promise(
        fetch("/api/teacher/announcement", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title: noticeTitle, content: enrichedContent, teacherId: tId })
        }),
        { loading: 'Publishing...', success: 'Notice Sent!', error: 'Failed' }
    );
    setNoticeTitle(""); setNoticeContent("");
  };

  const openAttendanceSheet = async (cls: any) => {
    setSelectedClassForAttendance(cls); setLoading(true);
    try {
      const res = await fetch(`/api/teacher/attendance?class=${cls.className}`);
      if (res.ok) {
        const data = await res.json();
        setAttendanceStudents(data.map((s: any) => ({ ...s, status: s.status || "PRESENT" })));
      }
    } finally { setLoading(false); }
  };

  const saveAttendance = async () => {
    setIsSavingAttendance(true);
    try {
      const res = await fetch("/api/teacher/attendance", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teacherId: (session?.user as any).id, attendanceData: attendanceStudents })
      });
      if (res.ok) toast.success("Attendance Saved!"); else throw new Error();
    } catch { toast.error("Failed"); } finally { setIsSavingAttendance(false); }
  };

  const openGradingSheet = async (cls: any) => {
    setSelectedClassForGrading(cls); setLoading(true);
    try {
      const res = await fetch(`/api/teacher/marks?class=${cls.className}&subjectId=${cls.subjectId}`);
      if (res.ok) {
        const data = await res.json();
        setGradingStudents(data.map((s: any) => ({ ...s, quiz: s.quiz||0, mid: s.mid||0, final: s.final||0, total: s.total||0 })));
      }
    } finally { setLoading(false); }
  };

  const handleGradeChange = (index: number, field: string, value: string) => {
    const updated = [...gradingStudents]; updated[index][field] = value;
    updated[index].total = (parseFloat(updated[index].quiz)||0) + (parseFloat(updated[index].mid)||0) + (parseFloat(updated[index].final)||0);
    setGradingStudents(updated);
  };

  const saveGrades = async () => {
    setIsSavingGrades(true);
    try {
      const res = await fetch("/api/teacher/marks", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subjectId: selectedClassForGrading.subjectId, grades: gradingStudents })
      });
      if(res.ok) toast.success("Grades Updated!"); else throw new Error();
    } catch { toast.error("Error"); } finally { setIsSavingGrades(false); }
  };

  const handleAttendanceStatusChange = (index: number, status: string) => {
    const updated = [...attendanceStudents]; updated[index].status = status; setAttendanceStudents(updated);
  };

  const loadChat = async (user: any) => {
      setCurrentChatUser(user);
      const res = await fetch(`/api/teacher/chat?chatWith=${user.id}`);
      if(res.ok) { setChatMessages(await res.json()); setTimeout(()=>chatScrollRef.current?.scrollIntoView({behavior:"smooth"}), 100); }
  };
  
  const sendMessage = async () => {
      if(!newMessage.trim()) return;
      const temp = { id: Date.now(), text: newMessage, senderId: (session?.user as any).id, createdAt: new Date() };
      setChatMessages(prev => [...prev, temp]); setNewMessage("");
      await fetch("/api/teacher/chat", { method: "POST", body: JSON.stringify({ receiverId: currentChatUser.id, text: temp.text }) });
  };

  const todayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const todaysClasses = routine.filter((item: any) => item.dayOfWeek?.toLowerCase() === todayName.toLowerCase());

  const unreadMessageCount = conversations.reduce((acc, curr) => acc + (curr.unread ? 1 : 0), 0);
  const hasUnreadMessages = unreadMessageCount > 0;

  if (authStatus === "loading" || (loading && activeTab === 'overview')) return (
     <div className="h-screen flex items-center justify-center bg-[#F1F5F9]"><Loader2 className="animate-spin text-indigo-900" size={40}/></div>
  );

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans text-slate-900 overflow-hidden">
      <Toaster position="top-right"/>
      
      {/* --- SIDEBAR --- */}
      <aside className={`fixed inset-y-0 left-0 z-30 w-72 bg-[#1e1b4b] border-r border-indigo-900/50 transform transition-transform duration-300 lg:static lg:translate-x-0 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col shadow-2xl`}>
        <div className="p-8 border-b border-indigo-900/50 flex items-center gap-3">
            <div className="bg-white p-2.5 rounded-xl text-indigo-900 shadow-lg"><GraduationCap size={26}/></div>
            <div><h1 className="text-xl font-black text-white tracking-tight">EduVerse</h1><p className="text-[10px] text-indigo-300 font-bold uppercase tracking-widest">Teacher Panel</p></div>
        </div>
        
        <nav className="flex-1 p-5 space-y-2 overflow-y-auto custom-scrollbar-dark">
          {[
            { id: 'overview', icon: LayoutDashboard, label: 'Overview' },
            { id: 'assignments', icon: FileText, label: 'Assignments' }, 
            { id: 'students', icon: Users, label: 'Marks Entry' },
            { id: 'attendance', icon: CheckCircle, label: 'Attendance' },
            { id: 'messages', icon: MessageCircle, label: 'Messages', badge: hasUnreadMessages },
            { id: 'routine', icon: Calendar, label: 'My Schedule' },
          ].map((item) => (
             <button key={item.id} onClick={() => { setActiveTab(item.id); setMobileMenuOpen(false); }} 
                className={`w-full flex items-center justify-between px-5 py-4 text-sm font-bold rounded-2xl transition-all duration-300 group relative overflow-hidden ${activeTab === item.id ? "bg-white text-indigo-900 shadow-lg" : "text-indigo-300 hover:bg-indigo-900/50 hover:text-white"}`}>
                <div className="flex items-center gap-4">
                    <item.icon size={20} className={activeTab === item.id ? "text-indigo-900" : "text-indigo-400 group-hover:text-white transition-colors"} /> 
                    <span className="relative z-10">{item.label}</span>
                </div>
                
                {item.badge && (
                    <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">NEW</span>
                )}
             </button>
          ))}
        </nav>

        <div className="p-6 border-t border-indigo-900/50 bg-[#17153B]">
           <div className="flex items-center gap-4 p-4 bg-indigo-900/30 rounded-2xl mb-4 border border-indigo-800/30">
                <div className="h-11 w-11 bg-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-lg border-2 border-[#1e1b4b] shadow-md">
                    {(session?.user as any)?.name?.charAt(0)}
                </div>
                <div className="overflow-hidden">
                    <p className="text-sm font-bold text-white truncate">{(session?.user as any)?.name}</p>
                    <p className="text-xs text-indigo-300 font-semibold uppercase tracking-wide">Instructor</p>
                </div>
           </div>
          <button onClick={() => signOut({ callbackUrl: '/login' })} className="flex items-center gap-3 w-full px-4 py-3.5 text-sm font-bold text-rose-400 hover:bg-rose-500/10 rounded-xl transition border border-transparent hover:border-rose-500/20">
            <LogOut size={18}/> Sign Out
          </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <header className="h-20 bg-white/90 backdrop-blur-md border-b border-slate-200 px-8 flex items-center justify-between shrink-0 z-20 shadow-sm">
           <div className="flex items-center gap-4">
              <button onClick={() => setMobileMenuOpen(true)} className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"><Menu size={24}/></button>
              <h2 className="text-xl font-black text-slate-800 capitalize tracking-tight hidden md:block">{activeTab.replace('-', ' ')}</h2>
           </div>
           <div className="flex items-center gap-4">
              <button onClick={() => setShowNotifications(true)} className="relative p-3 bg-white border border-slate-200 text-slate-600 hover:text-indigo-600 hover:border-indigo-500 rounded-full transition shadow-sm hover:shadow-md group">
                 <Bell size={22} className="group-hover:rotate-12 transition duration-300"/>
                 {announcements.length > 0 && <span className="absolute top-2.5 right-3 h-2.5 w-2.5 bg-rose-500 rounded-full border-2 border-white animate-pulse"></span>}
              </button>
           </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
          <AnimatePresence mode="wait">
            
            {/* 1. OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 max-w-[1600px] mx-auto">
                
                
                <div className="relative bg-[#1e1b4b] rounded-[2rem] p-6 text-white overflow-hidden shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="relative z-10">
                        <h3 className="text-2xl font-black mb-1 tracking-tight">Welcome, {(session?.user as any)?.name}!</h3>
                        <p className="text-slate-300 text-sm font-medium">You have <span className="text-white font-bold border-b border-indigo-500">{todaysClasses.length} classes</span> today.</p>
                    </div>
                    
                    <div className="bg-white/10 backdrop-blur-md border border-white/10 px-5 py-2.5 rounded-xl text-center min-w-[120px] relative z-10">
                        <p className="text-[10px] text-slate-300 font-bold uppercase tracking-wider">Today</p>
                        <p className="text-xl font-black text-white">{todayName}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                   
                   <div className="xl:col-span-2 space-y-6">
                      <div className="flex items-center justify-between">
                          <h4 className="font-bold text-slate-900 flex items-center gap-3 text-xl"><Clock size={24} className="text-indigo-600"/> Today's Schedule</h4>
                          <span className="text-xs font-bold bg-slate-200 text-slate-800 px-3 py-1 rounded-full uppercase tracking-wide">Updated</span>
                      </div>
                      
                      <div className="space-y-4">
                        {todaysClasses.length > 0 ? todaysClasses.map((item: any) => (
                            <div key={item.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-indigo-200 transition-all duration-300 flex items-center justify-between group">
                                <div className="flex items-center gap-6">
                                    <div className="h-16 w-20 bg-[#F1F5F9] rounded-2xl flex flex-col items-center justify-center border border-slate-200 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 transition duration-300">
                                        <span className="text-sm font-black">{item.startTime?.split(':')[0]}</span>
                                        <span className="text-[10px] uppercase font-bold text-slate-500 group-hover:text-indigo-200">Time</span>
                                    </div>
                                    <div>
                                        <p className="font-black text-slate-900 text-xl tracking-tight">{item.subject?.name}</p>
                                        <p className="text-sm text-slate-600 font-bold mt-1">{item.className} • Room {item.roomNumber}</p>
                                    </div>
                                </div>
                                <span className="hidden sm:inline-flex px-4 py-1.5 bg-indigo-50 text-indigo-700 rounded-xl text-xs font-extrabold uppercase tracking-wide">Active</span>
                            </div>
                        )) : (
                            <div className="text-center py-16 bg-white rounded-[2rem] border-2 border-dashed border-slate-300">
                                <Calendar className="mx-auto h-12 w-12 text-slate-300 mb-4"/>
                                <p className="text-slate-500 font-bold text-lg">No classes scheduled today.</p>
                            </div>
                        )}
                      </div>
                   </div>

                   {/* Right: Quick Actions */}
                   <div className="space-y-6">
                      
                      {/* Global Selectors */}
                      <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
                          <h4 className="font-bold text-slate-900 mb-4 flex gap-2 text-sm uppercase tracking-wide"><CheckCircle size={18} className="text-emerald-500"/> Select Context</h4>
                          <div className="flex gap-4">
                             <div className="relative w-1/2">
                                <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 appearance-none" onChange={(e) => setSelectedClass(e.target.value)} value={selectedClass}>
                                    <option value="">Class</option>
                                    {myClasses.map((c: any) => <option key={c.id} value={c.className}>{c.className}</option>)}
                                </select>
                                <ChevronDown size={16} className="absolute right-3 top-3.5 text-slate-400 pointer-events-none"/>
                             </div>
                             <div className="relative w-1/2">
                                <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 appearance-none" onChange={(e) => setSelectedSubject(e.target.value)} value={selectedSubject}>
                                    <option value="">Subject</option>
                            
                                    {availableSubjects.map((s:any) => <option key={s.id} value={s.subject.name}>{s.subject.name}</option>)}
                                </select>
                                <ChevronDown size={16} className="absolute right-3 top-3.5 text-slate-400 pointer-events-none"/>
                             </div>
                          </div>
                      </div>

                      {/* 1. RESOURCE UPLOAD */}
                       <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-xl transition duration-300">
                          <h4 className="font-black text-slate-900 mb-6 flex gap-2 text-lg"><Upload size={24} className="text-indigo-600"/> Upload Material</h4>
                          <div className="space-y-5">
                             <input className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 transition placeholder:text-slate-400" placeholder="File Title..." onChange={e => setResourceTitle(e.target.value)} value={resourceTitle}/>
                             
                             <div className="relative group cursor-pointer">
                                <input 
                                    type="file" 
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                                    onChange={(e) => setResourceFile(e.target.files?.[0] || null)} 
                                />
                                <div className={`border-2 border-dashed rounded-xl p-6 text-center transition-all ${resourceFile ? 'border-emerald-400 bg-emerald-50' : 'border-slate-300 bg-slate-50 group-hover:bg-slate-100'}`}>
                                    <div className="flex flex-col items-center gap-2">
                                        <Paperclip size={24} className={resourceFile ? "text-emerald-500" : "text-slate-400"}/>
                                        <p className="text-sm font-bold text-slate-600 truncate max-w-[200px]">
                                            {resourceFile ? resourceFile.name : "Click to attach file"}
                                        </p>
                                    </div>
                                </div>
                             </div>

                             <button onClick={handleResourceUpload} className="w-full bg-indigo-600 text-white py-4 rounded-xl text-sm font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-300 flex justify-center gap-2 transform active:scale-95 duration-150">
                                <Upload size={18}/> Upload Resource
                             </button>
                          </div>
                      </div>

                      {/* 2. POST NOTICE */}
                      <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-xl transition duration-300">
                          <h4 className="font-black text-slate-900 mb-6 flex gap-2 text-lg"><Bell size={24} className="text-rose-500"/> Post New Notice</h4>
                          <div className="space-y-5">
                            <input className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-rose-500 transition placeholder:text-slate-400" placeholder="Notice Title..." onChange={e => setNoticeTitle(e.target.value)} value={noticeTitle}/>
                            <textarea className="w-full bg-slate-50 border border-slate-200 rounded-xl p-5 h-36 text-sm font-bold text-slate-900 outline-none resize-none focus:ring-2 focus:ring-rose-500 transition placeholder:text-slate-400" placeholder="Write announcement details..." onChange={e => setNoticeContent(e.target.value)} value={noticeContent}/>
                            <button onClick={handlePostNotice} className="w-full bg-slate-900 text-white py-4 rounded-xl text-sm font-bold hover:bg-slate-800 transition shadow-lg shadow-slate-300 flex justify-center gap-2 transform active:scale-95 duration-150">
                                <Send size={18}/> Publish Notice
                            </button>
                          </div>
                      </div>

                   </div>
                </div>
              </motion.div>
            )}

            {/* ✅ 2. ASSIGNMENTS TAB */}
            {activeTab === 'assignments' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto">
                 <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 p-8">
                    <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-100">
                       <div className="bg-indigo-100 p-3 rounded-2xl text-indigo-600"><FileText size={24}/></div>
                       <div>
                          <h3 className="text-xl font-black text-slate-800">Create New Assignment</h3>
                          <p className="text-sm text-slate-500 font-semibold">Assign tasks to your classes</p>
                       </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Class</label>
                            <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} 
                              className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 transition">
                                <option value="">Select Class</option>
                                {myClasses.map((c:any) => <option key={c.id} value={c.className}>{c.className}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Subject</label>
                            <select value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)} 
                              className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 transition">
                                <option value="">Select Subject</option>
                                
                                {availableSubjects.map((s:any) => <option key={s.id} value={s.subject.name}>{s.subject.name}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Assignment Title</label>
                            <input type="text" value={assignTitle} onChange={(e) => setAssignTitle(e.target.value)} 
                               placeholder="e.g. Chapter 3 Exercises" 
                               className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 transition" />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Due Date</label>
                            <input type="date" value={assignDueDate} onChange={(e) => setAssignDueDate(e.target.value)} 
                               className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 transition" />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Instructions / Description</label>
                            <textarea value={assignDesc} onChange={(e) => setAssignDesc(e.target.value)} 
                               placeholder="Write detailed instructions here..." 
                               className="w-full p-3 h-32 rounded-xl bg-slate-50 border border-slate-200 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 transition resize-none"></textarea>
                        </div>

                        <div className="flex justify-end pt-4">
                            <button onClick={handleCreateAssignment} 
                               className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg hover:shadow-indigo-600/30 flex items-center gap-2">
                               <Send size={18}/> Publish Assignment
                            </button>
                        </div>
                    </div>
                 </div>
              </motion.div>
            )}

            {/* 3. GRADING TAB */}
            {activeTab === 'students' && (
               <motion.div key="grading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-6xl mx-auto">
                 {!selectedClassForGrading ? (
                    <div className="space-y-8">
                        <div className="border-b border-slate-200 pb-6">
                            <h3 className="text-3xl font-black text-slate-900 tracking-tight">Grade Book</h3>
                            <p className="text-slate-500 mt-1 font-bold">Select a class to update marks.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {myClasses.map((cls, idx) => (
                                <div key={idx} onClick={() => openGradingSheet(cls)} className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-2xl hover:border-indigo-400 cursor-pointer transition-all group relative overflow-hidden">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl"><BookOpen size={24}/></div>
                                    </div>
                                    <h4 className="text-xl font-bold text-slate-900">{cls.className}</h4>
                                    <p className="text-sm text-slate-500 font-bold">{cls.subjectName}</p>
                                    <div className="mt-8 pt-6 border-t border-slate-50 flex justify-between items-center">
                                        <span className="text-xs font-black text-indigo-600 uppercase tracking-widest">Edit Marks</span>
                                        <ChevronRight size={18} className="text-indigo-400 group-hover:translate-x-1 transition"/>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                 ) : (
                    <div className="bg-white rounded-[2rem] shadow-xl border border-slate-200 flex flex-col h-[calc(100vh-140px)] overflow-hidden">
                       <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white/80 backdrop-blur-md">
                           <div className="flex items-center gap-4">
                                <button onClick={() => setSelectedClassForGrading(null)} className="p-3 hover:bg-slate-100 rounded-xl transition"><ArrowLeft size={22} className="text-slate-700"/></button>
                                <div><h3 className="font-bold text-xl text-slate-900">{selectedClassForGrading.className}</h3><p className="text-xs text-slate-500 font-bold uppercase tracking-widest">{selectedClassForGrading.subjectName} • Grading</p></div>
                           </div>
                           <button onClick={saveGrades} disabled={isSavingGrades} className="flex items-center gap-2 bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold text-sm hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 disabled:opacity-50">
                              {isSavingGrades ? <Loader2 size={18} className="animate-spin"/> : <Save size={18}/>} Save
                           </button>
                       </div>
                       <div className="flex-1 overflow-auto p-0">
                           <table className="w-full text-left border-collapse">
                               <thead className="bg-white sticky top-0 z-10 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                                   <tr><th className="p-5 pl-8">Student</th><th className="p-5 w-32 text-center">Quiz (20)</th><th className="p-5 w-32 text-center">Mid (30)</th><th className="p-5 w-32 text-center">Final (50)</th><th className="p-5 w-32 text-center">Total</th></tr>
                               </thead>
                               <tbody className="text-sm divide-y divide-slate-50">
                                   {gradingStudents.map((std, idx) => (
                                       <tr key={std.studentId} className="hover:bg-indigo-50/20 transition group">
                                           <td className="p-5 pl-8">
                                               <p className="font-bold text-slate-900 text-base">{std.name}</p>
                                               <p className="text-xs text-slate-400 font-bold font-mono mt-1">{std.studentCode}</p>
                                           </td>
                                           {['quiz', 'mid', 'final'].map(f => (
                                               <td key={f} className="p-4">
                                                   <input type="number" value={std[f]} onChange={e => handleGradeChange(idx, f, e.target.value)} 
                                                    className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl py-3 text-center font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition" placeholder="0"/>
                                               </td>
                                           ))}
                                           <td className="p-5 text-center"><span className={`font-black text-sm px-4 py-1.5 rounded-lg border ${std.total >= 40 ? "bg-emerald-100 text-emerald-700 border-emerald-200" : "bg-rose-100 text-rose-700 border-rose-200"}`}>{std.total}</span></td>
                                       </tr>
                                   ))}
                               </tbody>
                           </table>
                       </div>
                    </div>
                 )}
               </motion.div>
            )}

            {/* 4. MESSAGES */}
            {activeTab === 'messages' && (
               <div className="flex gap-8 h-[calc(100vh-140px)] max-w-7xl mx-auto">
                   <div className="w-96 bg-white rounded-[2rem] border border-slate-200 hidden md:flex flex-col shadow-lg overflow-hidden">
                       <div className="p-6 border-b border-slate-100 bg-white"><h3 className="font-bold text-xl text-slate-900">Inbox</h3></div>
                       <div className="flex-1 overflow-y-auto p-4 space-y-2">
                           {conversations.map(u => (
                               <div key={u.id} onClick={() => loadChat(u)} className={`p-4 rounded-2xl flex items-center gap-4 cursor-pointer transition-all duration-200 ${currentChatUser?.id === u.id ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200" : "hover:bg-slate-50 text-slate-800"}`}>
                                   <div className={`h-12 w-12 rounded-full flex items-center justify-center font-bold text-lg ${currentChatUser?.id === u.id ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"}`}>{u.name.charAt(0)}</div>
                                   <div><p className="text-sm font-bold">{u.name}</p><p className={`text-xs ${currentChatUser?.id === u.id ? "text-indigo-200" : "text-slate-400"}`}>Tap to chat</p></div>
                               </div>
                           ))}
                       </div>
                   </div>
                   <div className="flex-1 bg-white rounded-[2rem] border border-slate-200 shadow-lg flex flex-col relative overflow-hidden">
                       {currentChatUser ? (
                           <>
                               <div className="p-6 border-b border-slate-100 bg-white flex items-center gap-4 z-10 shadow-sm">
                                   <div className="h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center font-bold text-indigo-700 text-lg">{currentChatUser.name.charAt(0)}</div>
                                   <span className="font-bold text-slate-900 text-lg">{currentChatUser.name}</span>
                               </div>
                               <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#F8FAFC]">
                                   {chatMessages.map(m => (
                                       <div key={m.id} className={`flex ${m.senderId === (session?.user as any).id ? 'justify-end' : 'justify-start'}`}>
                                           <div className={`px-5 py-3 rounded-2xl max-w-[70%] text-sm font-medium shadow-sm leading-relaxed ${m.senderId === (session?.user as any).id ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white border border-slate-200 text-slate-700 rounded-bl-none'}`}>{m.text}</div>
                                       </div>
                                   ))}
                                   <div ref={chatScrollRef}/>
                               </div>
                               <div className="p-4 bg-white border-t border-slate-100 flex gap-3">
                                   <input className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 text-sm font-medium text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none transition" placeholder="Type message..." value={newMessage} onChange={e=>setNewMessage(e.target.value)} onKeyDown={e=>e.key==='Enter' && sendMessage()}/>
                                   <button onClick={sendMessage} className="bg-indigo-600 text-white p-4 rounded-xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-200"><Send size={20}/></button>
                               </div>
                           </>
                       ) : <div className="flex-1 flex flex-col items-center justify-center text-slate-400"><MessageCircle size={64} className="opacity-10 mb-4"/><p className="font-bold">Select a conversation</p></div>}
                   </div>
               </div>
            )}

            {/* 6. ROUTINE */}
            {activeTab === 'routine' && (
               <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {routine.map((r: any) => (
                      <div key={r.id} className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm hover:border-indigo-300 hover:shadow-xl transition-all group relative overflow-hidden">
                          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-bl-[4rem] -mr-10 -mt-10 transition-all group-hover:bg-indigo-100"></div>
                          <span className="text-xs font-black bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg uppercase tracking-wide relative z-10">{r.dayOfWeek}</span>
                          <h4 className="font-bold text-xl text-slate-900 mt-4 relative z-10">{r.subject?.name}</h4>
                          <div className="mt-2 flex items-center gap-2 text-sm text-slate-500 font-bold relative z-10">
                              <Clock size={16} className="text-indigo-500"/> {r.startTime} - {r.endTime}
                          </div>
                          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs font-bold text-slate-400 uppercase">
                              <GraduationCap size={14}/> {r.className}
                          </div>
                      </div>
                  ))}
               </div>
            )}

            {/* 7. ATTENDANCE */}
             {activeTab === 'attendance' && (
              <motion.div key="attendance" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-6xl mx-auto">
                {!selectedClassForAttendance ? (
                  <div className="space-y-8">
                     <h3 className="text-3xl font-black text-slate-900 tracking-tight">Attendance Manager</h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {myClasses.map((cls, idx) => (
                           <div key={idx} onClick={() => openAttendanceSheet(cls)} className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-2xl hover:border-emerald-400 hover:-translate-y-1 cursor-pointer transition-all duration-300 group relative overflow-hidden">
                              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-[4rem] -mr-10 -mt-10 transition-all group-hover:bg-emerald-100"></div>
                              <h4 className="text-2xl font-bold text-slate-900 relative z-10">{cls.className}</h4>
                              <p className="text-sm text-slate-500 font-bold relative z-10 mt-1">{cls.subjectName}</p>
                              <div className="mt-8 flex items-center gap-2 text-emerald-600 text-xs font-black uppercase tracking-widest relative z-10 group-hover:gap-3 transition-all">Mark Present <ChevronRight size={14} strokeWidth={3}/></div>
                           </div>
                        ))}
                     </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-[2rem] shadow-xl border border-slate-200 flex flex-col h-[calc(100vh-140px)] overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white/80 backdrop-blur-md">
                       <div className="flex items-center gap-4">
                          <button onClick={() => setSelectedClassForAttendance(null)} className="p-3 hover:bg-slate-100 rounded-xl transition"><ArrowLeft size={22} className="text-slate-700"/></button>
                          <div><h3 className="font-bold text-xl text-slate-900">{selectedClassForAttendance.className}</h3><p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Attendance Sheet</p></div>
                       </div>
                       <button onClick={saveAttendance} disabled={isSavingAttendance} className="flex items-center gap-2 bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold text-sm hover:bg-emerald-700 transition shadow-lg shadow-emerald-200 disabled:opacity-50">
                          {isSavingAttendance ? <Loader2 size={18} className="animate-spin"/> : <Save size={18}/>} Save Record
                       </button>
                    </div>
                    <div className="flex-1 overflow-auto bg-white p-4">
                       <table className="w-full text-left border-collapse">
                         <thead className="bg-slate-50 sticky top-0 z-10 text-xs font-bold text-slate-500 uppercase tracking-widest">
                           <tr><th className="p-5 rounded-l-xl">ID</th><th className="p-5">Student Name</th><th className="p-5 rounded-r-xl text-center">Status</th></tr>
                         </thead>
                         <tbody className="text-sm">
                           {attendanceStudents.map((std, idx) => (
                             <tr key={std.studentId} className="hover:bg-slate-50/80 transition border-b border-slate-50 last:border-0">
                               <td className="p-5 font-mono text-slate-500 font-bold">{std.studentCode}</td>
                               <td className="p-5 font-bold text-slate-900">{std.name}</td>
                               <td className="p-5 flex justify-center gap-3">
                                  {['PRESENT', 'ABSENT', 'LATE'].map(status => (
                                    <button 
                                      key={status}
                                      onClick={() => handleAttendanceStatusChange(idx, status)}
                                      className={`px-6 py-2.5 rounded-xl text-xs font-extrabold border-2 transition-all active:scale-95 duration-150 ${
                                        std.status === status 
                                        ? status === 'PRESENT' ? 'bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-200 ring-4 ring-emerald-50' 
                                          : status === 'ABSENT' ? 'bg-rose-500 text-white border-rose-500 shadow-md shadow-rose-200 ring-4 ring-rose-50' 
                                          : 'bg-amber-400 text-white border-amber-400 shadow-md shadow-amber-200 ring-4 ring-amber-50'
                                        : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300 hover:bg-slate-50'
                                      }`}
                                    >
                                      {status}
                                    </button>
                                  ))}
                               </td>
                             </tr>
                           ))}
                         </tbody>
                       </table>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* --- ADMIN NOTIFICATIONS SLIDE-OVER --- */}
      <AnimatePresence>
        {showNotifications && (
            <>
                <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={()=>setShowNotifications(false)} className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40" />
                <motion.div initial={{x:"100%"}} animate={{x:0}} exit={{x:"100%"}} transition={{type:"spring", damping:30, stiffness:300}} className="fixed right-0 top-0 bottom-0 w-full md:w-[450px] bg-white shadow-2xl z-50 flex flex-col border-l border-slate-100">
                    <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-white">
                        <h3 className="font-black text-2xl text-slate-900 flex items-center gap-3"><Bell size={24} className="text-rose-500 fill-rose-500"/> Admin Notices</h3>
                        <button onClick={()=>setShowNotifications(false)} className="p-2 hover:bg-slate-100 rounded-full transition"><X size={24} className="text-slate-400"/></button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-[#F8FAFC]">
                        {announcements.length > 0 ? announcements.map((n:any) => (
                            <div key={n.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="bg-rose-100 text-rose-600 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">Urgent</span>
                                    <span className="text-[10px] text-slate-400 font-bold uppercase">{new Date(n.createdAt).toLocaleDateString()}</span>
                                </div>
                                <h4 className="font-bold text-lg text-slate-900 mb-2 leading-tight">{n.title}</h4>
                                <p className="text-sm text-slate-500 leading-relaxed font-bold">{n.content || n.message}</p>
                            </div>
                        )) : (
                            <div className="flex flex-col items-center justify-center h-80 text-slate-400 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50">
                                <Bell size={48} className="mb-4 opacity-20"/>
                                <p className="text-sm font-bold">No announcements from Admin</p>
                            </div>
                        )}
                    </div>
                </motion.div>
            </>
        )}
      </AnimatePresence>
    </div>
  );
}