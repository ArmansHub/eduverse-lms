"use client";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useState, useRef } from "react";
import { 
  LogOut, Bell, Clock, MessageCircle, 
  Award, X, Send, ChevronLeft, BookOpen, User 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ParentDashboard() {
  const { data: session, status } = useSession();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // States
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeChat, setActiveChat] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]); 
  const [msgInput, setMsgInput] = useState("");
  const [selectedNotice, setSelectedNotice] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. Data Fetching & Auth Check
  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") {
      window.location.href = "/login";
      return;
    }

    const fetchData = async () => {
      try {
        const res = await fetch("/api/parent/dashboard");
        if (res.status === 401) {
             await signOut({ callbackUrl: "/login" });
             return;
        }
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error("Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [status]);

  // 2. Chat Logic
  const openChat = async (teacher: any) => {
    setActiveChat(teacher);
    setIsSidebarOpen(true);
    try {
      const res = await fetch(`/api/chat?contactId=${teacher.id}`);
      if (res.ok) {
        const msgs = await res.json();
        setMessages(msgs);
        setTimeout(scrollToBottom, 100);
      }
    } catch (err) { console.error(err); }
  };

  const handleSendMessage = async (e: any) => {
    e.preventDefault();
    if (!msgInput.trim() || !activeChat) return;

    const tempMsg = { 
        id: Date.now().toString(), 
        text: msgInput, 
        senderId: (session?.user as any).id, 
        createdAt: new Date().toISOString() 
    };
    setMessages((prev) => [...prev, tempMsg]);
    setMsgInput("");
    scrollToBottom();

    await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: tempMsg.text, receiverId: activeChat.id }),
    });
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-indigo-600"></div>
        <p className="text-indigo-600 font-semibold text-lg animate-pulse">Loading Dashboard...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f1f5f9] font-sans text-slate-800 pb-12">
      
      {/* --- HEADER --- */}
      <nav className="bg-white px-8 py-5 sticky top-0 z-40 shadow-sm border-b border-slate-200 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="bg-indigo-600 h-12 w-12 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-200">
            P
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 leading-tight">Parent Portal</h1>
            <p className="text-sm font-medium text-slate-500">Welcome back, {data?.parentInfo?.name}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsSidebarOpen(true)} 
            className="relative flex items-center gap-2 bg-white border border-slate-200 text-slate-600 px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition shadow-sm"
          >
            <MessageCircle size={20}/>
            <span className="hidden sm:inline">Messages</span>
            {data?.stats?.unreadMessages > 0 && (
              <span className="absolute -top-2 -right-2 h-6 w-6 bg-red-500 text-white flex items-center justify-center rounded-full text-xs font-bold shadow-md border-2 border-white">
                {data.stats.unreadMessages}
              </span>
            )}
          </button>

          <button 
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="p-3 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition border border-transparent hover:border-red-100"
            title="Log Out"
          >
            <LogOut size={20} />
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 mt-8">
        
        {/* --- STUDENT PROFILE CARD --- */}
        <div className="bg-gradient-to-br from-indigo-700 to-violet-800 rounded-[2rem] p-8 text-white shadow-xl shadow-indigo-200 mb-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
            
            <div className="flex flex-col md:flex-row justify-between items-center gap-6 relative z-10">
                <div className="flex items-center gap-6">
                    <div className="h-20 w-20 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-4xl border-4 border-white/20 shadow-inner">
                        🎓
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">{data?.studentProfile?.name}</h2>
                        <div className="flex items-center gap-3 mt-2 text-indigo-100 font-medium text-base">
                            <span className="bg-white/20 px-3 py-1 rounded-full text-sm">ID: {data?.studentProfile?.studentId}</span>
                            <span>•</span>
                            <span className="text-lg">Class: {data?.studentProfile?.studentClass}</span>
                        </div>
                    </div>
                </div>
                
                <div className="flex items-center gap-8 bg-white/10 px-8 py-4 rounded-2xl border border-white/10 backdrop-blur-sm">
                    <div className="text-center">
                        <p className="text-xs uppercase font-bold text-indigo-200 tracking-wider mb-1">Attendance</p>
                        <p className="text-4xl font-black text-white">{data?.stats?.attendancePercentage}%</p>
                    </div>
                    <div className="h-10 w-[1px] bg-white/20"></div>
                    <div className="text-center">
                        <p className="text-xs uppercase font-bold text-indigo-200 tracking-wider mb-1">Status</p>
                        <p className="text-lg font-bold text-emerald-300">Active</p>
                    </div>
                </div>
            </div>
        </div>

        {/* --- MAIN GRID --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* LEFT: Routine & Results */}
            <div className="lg:col-span-8 space-y-8">
                
                {/* Routine Section (Date Fixed) */}
                <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-200">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-bold flex items-center gap-2 text-slate-800">
                                <Clock size={22} className="text-orange-500"/> Today's Classes
                            </h3>
                            <p className="text-sm text-slate-500 mt-1">
                                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {data?.routine?.length > 0 ? (
                            data.routine.map((r: any) => (
                                <div key={r.id} className="group bg-orange-50/30 p-5 rounded-2xl border border-orange-100 hover:border-orange-300 hover:shadow-md transition duration-200 flex items-start gap-4">
                                    <div className="bg-orange-100 p-3 rounded-xl text-orange-600 group-hover:scale-110 transition">
                                        <BookOpen size={20}/>
                                    </div>
                                    <div>
                                        <p className="text-base font-bold text-slate-800">{r.subject?.name}</p>
                                        <p className="text-sm text-slate-600 font-medium mt-1">
                                            {/* Fix: Directly displaying string from DB */}
                                            {r.startTime} - {r.endTime}
                                        </p>
                                        <p className="text-xs text-slate-400 mt-2 font-medium bg-white inline-block px-2 py-1 rounded-md border border-orange-50">
                                            {r.teacher?.name || "Teacher N/A"}
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full py-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                                <p className="text-sm text-slate-500 italic">No classes scheduled for today.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Academic Result Section */}
                <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-200">
                    <h3 className="text-lg font-bold flex items-center gap-2 text-slate-800 mb-6">
                        <Award size={22} className="text-emerald-500"/> Academic Performance
                    </h3>
                    
                    <div className="overflow-hidden rounded-xl border border-slate-100">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-slate-500 uppercase bg-slate-50/80 border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-4 font-bold tracking-wider">Subject</th>
                                    <th className="px-6 py-4 text-center font-bold">Quiz</th>
                                    <th className="px-6 py-4 text-center font-bold">Mid</th>
                                    <th className="px-6 py-4 text-center font-bold">Final</th>
                                    <th className="px-6 py-4 text-center text-emerald-600 font-black tracking-wider bg-emerald-50/30">Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {data?.grades?.map((g: any) => (
                                    <tr key={g.id} className="hover:bg-slate-50 transition">
                                        <td className="px-6 py-5 font-semibold text-slate-700">{g.subject}</td>
                                        <td className="px-6 py-5 text-center text-slate-600 font-medium">{g.quiz}</td>
                                        <td className="px-6 py-5 text-center text-slate-600 font-medium">{g.mid}</td>
                                        <td className="px-6 py-5 text-center text-slate-600 font-medium">{g.final}</td>
                                        <td className="px-6 py-5 text-center font-bold text-emerald-600 bg-emerald-50/10 text-lg">{g.obtained}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {(!data?.grades || data?.grades.length === 0) && (
                            <div className="py-12 text-center">
                                <p className="text-sm text-slate-400">No grades published yet.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* RIGHT: Notices */}
            <div className="lg:col-span-4">
                <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-200 h-full flex flex-col">
                    <div className="flex justify-between items-center mb-6 pl-2">
                        <h3 className="text-lg font-bold flex items-center gap-2 text-slate-800">
                            <Bell size={22} className="text-indigo-500"/> Notice Board
                        </h3>
                        {data?.stats?.unreadNotices > 0 && (
                            <span className="bg-red-100 text-red-600 text-xs font-bold px-3 py-1 rounded-full border border-red-200">
                                {data.stats.unreadNotices} New
                            </span>
                        )}
                    </div>
                    
                    <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar max-h-[600px]">
                        {data?.announcements?.length > 0 ? (
                            data.announcements.map((notice: any) => (
                                <div 
                                    key={notice.id} 
                                    onClick={() => setSelectedNotice(notice)}
                                    className="p-5 rounded-2xl bg-indigo-50/30 hover:bg-white border border-indigo-50 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-100/50 transition duration-300 cursor-pointer group"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="bg-indigo-100 text-indigo-700 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">
                                            Notice
                                        </span>
                                        <span className="text-xs text-slate-400 font-medium">
                                            {/* CreatedAt is DateTime, so this works */}
                                            {new Date(notice.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <h4 className="text-sm font-bold text-slate-800 mb-2 group-hover:text-indigo-700 transition line-clamp-2">
                                        {notice.title}
                                    </h4>
                                    <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
                                        {notice.content}
                                    </p>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-12">
                                <Bell size={40} className="text-slate-200 mx-auto mb-3"/>
                                <p className="text-sm text-slate-400">No recent notices found.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
      </main>

      {/* --- NOTICE MODAL --- */}
      <AnimatePresence>
        {selectedNotice && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
             <motion.div 
               initial={{ scale: 0.95, opacity: 0, y: 20 }} 
               animate={{ scale: 1, opacity: 1, y: 0 }} 
               exit={{ scale: 0.95, opacity: 0, y: 20 }} 
               className="bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl"
             >
                <div className="bg-indigo-600 p-6 flex justify-between items-start">
                    <div>
                        <h2 className="text-white font-bold text-xl pr-4">{selectedNotice.title}</h2>
                        <div className="flex items-center gap-2 mt-2 text-indigo-200 text-xs font-medium">
                            <User size={14}/>
                            <span>From: {selectedNotice.sender || 'Admin'}</span>
                        </div>
                    </div>
                    <button onClick={() => setSelectedNotice(null)} className="text-white/70 hover:text-white bg-white/10 p-2 rounded-full hover:bg-white/20 transition"><X size={20}/></button>
                </div>
                <div className="p-8 max-h-[60vh] overflow-y-auto text-sm text-slate-600 leading-7 whitespace-pre-wrap">
                  {selectedNotice.content}
                </div>
                <div className="p-4 bg-slate-50 border-t flex justify-end">
                    <button onClick={() => setSelectedNotice(null)} className="px-6 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:text-indigo-600 hover:border-indigo-200 transition shadow-sm">
                        Close
                    </button>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- CHAT SIDEBAR --- */}
      <AnimatePresence>
        {isSidebarOpen && (
          <div className="fixed inset-0 z-[70] flex justify-end bg-slate-900/20 backdrop-blur-sm">
            <motion.div 
              initial={{ x: "100%" }} 
              animate={{ x: 0 }} 
              exit={{ x: "100%" }} 
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col border-l border-slate-100"
            >
              <div className="bg-white p-5 border-b border-slate-100 flex justify-between items-center shadow-sm z-10">
                {activeChat ? (
                  <div className="flex items-center gap-3">
                    <button onClick={() => setActiveChat(null)} className="hover:bg-slate-100 p-2 rounded-full text-slate-500 transition"><ChevronLeft size={22}/></button>
                    <div>
                        <h3 className="font-bold text-base text-slate-800">{activeChat.name}</h3>
                        <p className="text-xs text-indigo-600 font-bold bg-indigo-50 inline-block px-2 py-0.5 rounded-md mt-0.5">Teacher</p>
                    </div>
                  </div>
                ) : (
                  <div>
                    <h3 className="font-bold text-lg text-slate-800">Messages</h3>
                    <p className="text-xs text-slate-400">Select a teacher to start chatting</p>
                  </div>
                )}
                <button onClick={() => setIsSidebarOpen(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-red-500 transition"><X size={22}/></button>
              </div>

              <div className="flex-1 overflow-y-auto bg-slate-50 p-5 custom-scrollbar">
                {activeChat ? (
                  <div className="flex flex-col min-h-full justify-end">
                    <div className="space-y-4 mb-4">
                       {messages.map((m: any) => {
                           const isMe = m.senderId === (session?.user as any).id;
                           return (
                               <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                   <div className={`px-4 py-3 max-w-[80%] text-sm rounded-2xl shadow-sm ${
                                       isMe ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white text-slate-700 rounded-bl-none border border-slate-200'
                                   }`}>
                                     {m.text}
                                   </div>
                               </div>
                           )
                       })}
                       <div ref={messagesEndRef} />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 mt-2">
                    {data?.teachers?.length > 0 ? (
                      data.teachers.map((t: any) => (
                        <div key={t.id} onClick={() => openChat(t)} className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-100 hover:border-indigo-500 hover:shadow-md cursor-pointer transition group">
                          <div className="h-10 w-10 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 font-bold text-sm group-hover:bg-indigo-600 group-hover:text-white transition">
                            {t.name.charAt(0)}
                          </div>
                          <div className="flex-1">
                            <p className="font-bold text-sm text-slate-800">{t.name}</p>
                            <p className="text-xs text-slate-400">Class Teacher</p>
                          </div>
                          <div className="h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:text-indigo-600 transition">
                            <MessageCircle size={18}/>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center mt-20">
                          <p className="text-sm text-slate-400">No teachers available for chat.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

               {activeChat && (
                <div className="p-4 bg-white border-t border-slate-100">
                    <form onSubmit={handleSendMessage} className="flex gap-3">
                      <input 
                        value={msgInput} 
                        onChange={(e) => setMsgInput(e.target.value)} 
                        placeholder="Type your message..." 
                        className="flex-1 bg-slate-100 px-5 py-3 rounded-full text-sm outline-none focus:ring-2 ring-indigo-500 focus:bg-white transition" 
                        autoFocus 
                      />
                      <button type="submit" className="bg-indigo-600 text-white h-11 w-11 flex items-center justify-center rounded-full hover:bg-indigo-700 shadow-lg hover:shadow-indigo-500/30 transition transform hover:scale-105">
                        <Send size={18}/>
                      </button>
                    </form>
                </div>
               )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}