"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  LayoutDashboard, Users, Video, Settings, LogOut, 
  Plus, Search, GraduationCap, Mic, 
  MoreVertical, CheckCircle2, UserCheck, Baby, Fingerprint, RefreshCw, 
  Edit, Trash2, PauseCircle, PlayCircle, Loader2, Clock, Check,
  ShieldAlert, 
  BookOpenCheck, 
  Calendar, ArrowRight, X 
} from "lucide-react";
import { motion } from "framer-motion";
import { toast, Toaster } from "react-hot-toast";

// --- TYPE DEFINITION (Prisma model based ) ---
type User = {
    id: string;
    name: string;
    email: string;
    role: "ADMIN" | "TEACHER" | "STUDENT" | "PARENT";
    studentId?: string | null;
    childId?: string | null;
    parentId?: string | null; 
    childName?: string | null; 
    class?: string; 
    department?: string; 
    phone?: string | null;
    address?: string | null;
};


const handleDeleteSubject = async (id: string) => {

  if (!confirm("Are you sure you want to delete this subject?")) return;

  try {
    const res = await fetch(`/api/admin/subjects/${id}`, {
      method: "DELETE",
    });

    const data = await res.json();

    if (res.ok) {

      alert("Subject deleted successfully!"); 
      
 
      window.location.reload(); 
    } else {

      alert(data.message || "Failed to delete subject");
    }
  } catch (error) {
    console.error("Delete failed:", error);
    alert("An error occurred while deleting.");
  }
};

// --- MAIN COMPONENT ---
export default function AdminDashboard() {
  const router = useRouter();
  


  // --- STATE MANAGEMENT ---
  const [activeTab, setActiveTab] = useState("overview"); 
  const [userTypeTab, setUserTypeTab] = useState<User['role']>("STUDENT");
  
  // 1. User & Parent Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isParentModalOpen, setIsParentModalOpen] = useState(false);


const deleteUser = async (id: string) => {

    if (!id || typeof id !== "string") {
        console.error("ID error:", id);
        alert("ভুল আইডি! ডাটাবেজ আইডি খুঁজে পাওয়া যায়নি।");
        return;
    }

    if (!confirm("Are you sure you want to delete this user?")) return;
    
    try {

        const res = await fetch(`/api/admin/delete-user?id=${id}`, {
            method: 'DELETE'
        });
        
        const data = await res.json();

        if (res.ok) {
            alert("User deleted successfully!");
            window.location.reload(); 
        } else {
        
            alert(data.message || "Failed to delete");
        }
    } catch (error) {
        console.error("Delete error:", error);
        alert("An error occurred while deleting.");
    }
};
const handleCreateSubject = async () => {

    const payload = {
        name: subjectName, 
        description: description,
        teacherIds: selectedTeacherIds, 
    };

    try {
        const res = await fetch("/api/admin/subjects", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        if (res.ok) {
            alert("Subject created successfully!");

        } else {
            const errorData = await res.json();
            alert(errorData.message);
        }
    } catch (error) {
        console.error("Error creating subject:", error);
    }
};
  

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  const [selectedStudentForParent, setSelectedStudentForParent] = useState<any>(null);
  
  // 3. Subject Management States 
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [allSubjects, setAllSubjects] = useState<any[]>([]); // To hold all subjects
 
  // --- REAL DATA STATE ---
  const [isLoading, setIsLoading] = useState(true);
  const [allUsers, setAllUsers] = useState<User[]>([]); 
  const [statsData, setStatsData] = useState({ totalUsers: 0, students: 0, teachers: 0, admins: 0, parents: 0 });
  // Mock Live Class State 
  const [liveClassStatus, setLiveClassStatus] = useState<'IDLE' | 'LIVE' | 'HOLD'>('IDLE');
  const [liveClassData, setLiveClassData] = useState<any>(null); // To store details if live

const [announcements, setAnnouncements] = useState([]);
const [schedules, setSchedules] = useState([]);


const [teachers, setTeachers] = useState([]);
const [subjects, setSubjects] = useState([]);


useEffect(() => {
    const loadRealData = async () => {
        try {
     
            const [teacherRes, subjectRes] = await Promise.all([
                fetch("/api/teacher"), // Teacher list er API
                fetch("/api/subjects")  // Subject list er API
            ]);

            const tData = await teacherRes.json();
            const sData = await subjectRes.json();

            setTeachers(tData);
            setSubjects(sData);
        } catch (error) {
            console.error("Data loading error:", error);
        }
    };

    loadRealData();
}, []);


const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = useState(false);
const [isClassAssignModalOpen, setIsClassAssignModalOpen] = useState(false);

  // 1. FETCH ALL DATA 
  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      // Fetch Dashboard Stats and Users
      const dashboardRes = await fetch("/api/admin/dashboard-data");
      //Fetch Subjects
      const subjectsRes = await fetch("/api/admin/subjects");
      // Fetch Live Requests
      const requestsRes = await fetch("/api/admin/live-request"); 

      // Handle Dashboard Data
      const dashboardData = await dashboardRes.json();
      
      if (dashboardRes.ok) {
        setAllUsers(dashboardData.users); 
        setStatsData(dashboardData.stats);
        setAnnouncements(dashboardData.announcements || []);
        setSchedules(dashboardData.schedules || []);
        setTeachers(dashboardData.teachers || []);
        setLiveClassStatus(dashboardData.liveStatus || 'IDLE');
        setLiveClassData(dashboardData.currentLive || null);
      } else {
        toast.error("Failed to fetch dashboard data");
      }

      // Handle Subject Data
      if (subjectsRes.ok) {
          const subjectsData = await subjectsRes.json();
        
          setAllSubjects(subjectsData); 
      } else {
          toast.error("Failed to fetch subject data");
      }
      

    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Server connection error");
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchDashboardData();
  }, []);

  // --- HANDLERS ---
  
  const handleEditUser = (user: User) => {
    setUserToEdit(user);
    setIsEditModalOpen(true);
  };
  
  const handleDeleteUser = async (user: User) => {
    if (!confirm(`Are you sure you want to delete ${user.name} (${user.role})? This action is irreversible.`)) {
      return;
    }

    const toastId = toast.loading(`Deleting ${user.name}...`);
    try {
      // DELETE API Call
      const res = await fetch(`/api/admin/user/${user.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success(`${user.role} deleted successfully!`, { id: toastId });
        fetchDashboardData(); 
      } else {
        const errorData = await res.json();
        toast.error(errorData.message || "Failed to delete user", { id: toastId });
      }
    } catch (error) {
      toast.error("Network error during deletion", { id: toastId });
    }
  };
  

  
  const handleLogout = () => {
    localStorage.removeItem("eduverse_session");
    router.push("/login");
  };
  
  const handleOpenParentModal = (student: any) => {
    setSelectedStudentForParent(student);
    setIsParentModalOpen(true);
  };
  
  const filteredUsers = allUsers.filter(user => user.role === userTypeTab);

  return (
    <div className="flex h-screen bg-[#F1F5F9] font-sans text-slate-800 overflow-hidden">
      <Toaster position="top-right" />

      {/* SIDEBAR*/}
      <aside className="w-72 bg-[#0F172A] text-white flex flex-col shadow-2xl z-20 hidden md:flex">
        <div className="p-8 flex items-center gap-3">
          <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
            <GraduationCap size={24} className="text-white" />
          </div>
          <div>
             <h1 className="text-xl font-bold tracking-wide">EduVerse</h1>
             <p className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">Admin Panel</p>
          </div>
        </div>
        <nav className="flex-1 px-4 space-y-2 mt-2">
          <NavItem icon={<LayoutDashboard size={20} />} label="Overview" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
          <NavItem icon={<Users size={20} />} label="User Management" active={activeTab === 'users'} onClick={() => setActiveTab('users')} />
          <NavItem icon={<BookOpenCheck size={20} />} label="Subject Management" active={activeTab === 'subjects'} onClick={() => setActiveTab('subjects')} /> 
          <NavItem icon={<Settings size={20} />} label="Settings" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
        </nav>
        <div className="p-4 border-t border-slate-800">
          <button 
            onClick={handleLogout} className="flex items-center gap-3 text-red-400 hover:text-red-300 w-full px-4 py-3 rounded-lg hover:bg-slate-800 transition">
            <LogOut size={20} /> Logout
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        
        {/* HEADER */}
        <header className="h-20 
          bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-8 z-10 sticky top-0">
          <div>
              <h2 className="text-xl font-bold text-slate-800">
                {activeTab === 'overview' ? 'Dashboard Overview' : 
                 activeTab === 'users' ? 'User Management' : 
                 activeTab === 'subjects' ? 'Subject Management' : 
                 activeTab === 'live' ? 'Live Classroom Control' : 'System Settings'}
              </h2>
              <p className="text-xs text-slate-500">
                {activeTab === 'overview' ? 'Real-time system insights.' : 
                 activeTab === 'users' ? 'Manage all registered users.' : 
                 activeTab === 'subjects' ? 'Manage academic subjects and teacher assignments.' : 
                 activeTab === 'live' ? 'Manage ongoing video classes.' : 'Configure global system parameters.'}
              </p>
          </div>
          <div className="flex items-center gap-4">
             <button onClick={fetchDashboardData} className="p-2 hover:bg-slate-100 rounded-full text-slate-500" title="Refresh Data">
                <RefreshCw size={18} className={isLoading ? "animate-spin" : ""} />
             </button>
             
             {activeTab === 'users' && (
                <button 
                  onClick={() => setIsCreateModalOpen(true)}
                  className="bg-[#0F172A] hover:bg-slate-800 text-white px-5 py-2.5 rounded-lg text-sm font-semibold shadow-lg flex items-center gap-2 transition-transform active:scale-95"
                >
                  <Plus size={18} /> Create User
                </button>
             )}
             
             {activeTab === 'subjects' && (
                <button 
                    onClick={() => setIsSubjectModalOpen(true)}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold shadow-lg flex items-center gap-2 transition-transform active:scale-95"
                >
                    <Plus size={18} /> Add New Subject
                </button>
             )}
          </div>
        </header>

        {/* SCROLLABLE AREA */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
           
           {isLoading && allUsers.length === 0 ? (
             <div className="flex h-full items-center justify-center">
               <Loader2 className="animate-spin text-blue-600" size={40} />
             </div>
           ) : (
             <>
               {/* ================= VIEW 1: OVERVIEW ================= */}
               {activeTab === 'overview' && (
                 <>
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                      <StatCard title="Total Users" value={statsData.totalUsers} icon={<Users size={20} />} color="bg-blue-500" />
                      <StatCard title="Students" value={statsData.students} icon={<GraduationCap size={20} />} color="bg-emerald-500" />
                      <StatCard title="Teachers" value={statsData.teachers} icon={<Mic size={20} />} color="bg-purple-500" />
                      <StatCard title="Parents" value={statsData.parents} icon={<Baby size={20} />} color="bg-amber-500" />
                      <StatCard title="Admins" value={statsData.admins} icon={<ShieldAlert size={20} />} color="bg-rose-500" />
                   </div>

                      {/* Announcement & Schedule Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                    <Mic size={20} className="text-blue-500" /> Announcements
                                </h3>
                                <button 
  onClick={() => setIsAnnouncementModalOpen(true)} 
  className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg font-bold hover:bg-blue-700 transition"
>
  + New Notice
</button>
                            </div>
                            <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                                {announcements.length > 0 ? announcements.map((a: any) => (
                                    <div key={a.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 hover:border-blue-200 transition">
                                        <p className="font-bold text-sm text-slate-800">{a.title}</p>
                                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">{a.content}</p>
                                    </div>
                                )) : <p className="text-xs text-slate-400 italic">No announcements yet.</p>}
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                    <Calendar size={20} className="text-green-500" /> Class Schedule
                                </h3>
                                <button 
    onClick={() => {
        console.log("Class Assign Clicked"); 
        setIsClassAssignModalOpen(true);
    }} 
    className="text-xs bg-green-600 text-white px-3 py-1.5 rounded-lg font-bold hover:bg-green-700 transition"
>
    Assign Class
</button>
                            </div>
                            <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                                {schedules.length > 0 ? schedules.map((s: any) => (
                                    <div key={s.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border-l-4 border-green-500 shadow-sm">
                                        <div>
                                            <p className="font-bold text-sm text-slate-800">{s.subject?.name}</p>
                                            <p className="text-[10px] text-slate-500 font-medium">Teacher: {s.teacher?.name}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs font-bold text-slate-700">{s.startTime}</p>
                                            <p className="text-[10px] text-slate-400">Room: {s.roomNumber}</p>
                                        </div>
                                    </div>
                                )) : <p className="text-xs text-slate-400 italic">No classes assigned yet.</p>}
                            </div>
                        </div>
                    </div>
                                      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                                          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                                          <h3 className="font-bold text-lg text-slate-800">Recent Registrations</h3>
                                              <span className="text-xs font-bold bg-blue-100 text-blue-600 px-2 py-1 rounded">Live Data</span>
                                          </div>
                                          <div className="divide-y divide-slate-100">
                                              {allUsers.slice(0, 5).map((user: User) => (
                                                  <div key={user.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                                      <div className="flex items-center gap-4">
                                                          <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-white ${
                                                            user.role === 'ADMIN' ? 'bg-rose-500' : 
                                                            user.role === 'TEACHER' ? 'bg-purple-500' : 
                                                            user.role === 'PARENT' ? 'bg-amber-500' : 'bg-blue-500'
                                                          }`}>
                                                            {user.name?.charAt(0)}
                                                          </div>
                                                          
                                                          <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-slate-800">{user.name}</p>
                        
                       
                        {user.parentId && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-700 border border-green-200 flex items-center gap-1">
                            <CheckCircle2 size={10} /> Linked
                          </span>
                        )}
                        
                      
                        {!user.parentId && (user.role === "STUDENT" || user.role === "PARENT") && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500 border border-slate-200 flex items-center gap-1">
                            <X size={10} /> Not Linked
                          </span>
                        )}
                      </div>

                      
                      {user.role === "PARENT" && user.childName && (
                        <p className="text-[11px] font-medium text-green-600 flex items-center gap-1 bg-green-50 w-fit px-1.5 py-0.5 rounded">
                          <Baby size={12} /> Child: {user.childName}
                        </p>
                      )}

                      <p className="text-xs text-slate-500">{user.email}</p>
                    </div>
                                                      </div>
                                                      <span className="text-[10px] font-bold px-2 py-1 rounded-full uppercase bg-slate-100 text-slate-600">
                                                        {user.role}
                                                      </span>
                                                  </div>
                                                ))}
                                          </div>
                                      </div>
                                  </>
                                  )}

               {/* ================= VIEW 2: USER MANAGEMENT  ================= */}
  {activeTab === 'users' && (
  <div className="space-y-6">
    {/* Tabs */}
    <div className="flex flex-wrap items-center gap-2 bg-white p-1 rounded-xl w-fit border border-slate-200 shadow-sm">
      <TabButton isActive={userTypeTab === "STUDENT"} onClick={() => setUserTypeTab("STUDENT")} icon={<GraduationCap size={16} />} label="Students" />
      <TabButton isActive={userTypeTab === "TEACHER"} onClick={() => setUserTypeTab("TEACHER")} icon={<Mic size={16} />} label="Teachers" />
      <TabButton isActive={userTypeTab === "PARENT"} onClick={() => setUserTypeTab("PARENT")} icon={<Baby size={16} />} label="Parents" />
      <TabButton isActive={userTypeTab === "ADMIN"} onClick={() => setUserTypeTab("ADMIN")} icon={<ShieldAlert size={16} />} label="Admins" />
    </div>

    {/* Table */}
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-5 border-b border-slate-100 flex justify-between items-center">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder={`Search ${userTypeTab.toLowerCase()}...`} 
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
          />
        </div>
      </div>

      <table className="w-full text-left border-collapse">
        <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold">
          <tr>
            {userTypeTab === 'STUDENT' && <th className="p-4">Student ID</th>}
            <th className="p-4">Name & Email</th>
            <th className="p-4">Role</th>
            
           
            {userTypeTab === 'STUDENT' && (
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">Class</th>
            )}
            
            {(userTypeTab === 'STUDENT' || userTypeTab === 'TEACHER') && (
              <th className="p-4">
                {userTypeTab === 'STUDENT' ? 'Parent Status' : 'Linked Subjects'}
              </th>
            )}
            
            <th className="p-4 text-center">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
          {filteredUsers.length === 0 ? (
            <tr><td colSpan={6} className="p-8 text-center text-slate-400">No {userTypeTab.toLowerCase()} found.</td></tr>
          ) : (
            filteredUsers.map((user: User) => (
              <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                
                {userTypeTab === 'STUDENT' && (
                  <td className="p-4 font-mono font-bold text-blue-600">
                    {user.studentId || "N/A"}
                  </td>
                )}

                <td className="p-4">
                  <div className="font-bold">{user.name}</div>
                  <div className="text-xs text-slate-500">{user.email}</div>
                </td>
                  
                <td className="p-4">
                   <span className="uppercase text-[10px] font-bold px-2 py-1 bg-slate-100 rounded text-slate-600">
                     {user.role}
                   </span>
                </td>

                
                {userTypeTab === 'STUDENT' && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 font-medium">
                    {user.studentClass || 'N/A'}
                  </td>
                )}

                {userTypeTab === 'STUDENT' && (
                  <td className="p-4">
                    {user.parentId ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold">
                        <CheckCircle2 size={12} /> Linked
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-slate-100 text-slate-500 text-xs font-bold">
                        Pending
                      </span>
                    )}
                  </td>
                )}
                
                {userTypeTab === 'TEACHER' && (
                  <td className="p-4">
                    <span className="inline-block px-3 py-1 text-xs font-bold rounded-full bg-purple-100 text-purple-700">
                   
                      Linked
                    </span>
                  </td>
                )}

                <td className="p-4 text-center space-x-2">
                  <button onClick={() => handleEditUser(user)} className="p-2 text-blue-500 hover:text-blue-700 rounded-full hover:bg-blue-50 transition">
                    <Edit size={16} />
                  </button>
                  <button onClick={() => handleDeleteUser(user)} className="p-2 text-red-500 hover:text-red-700 rounded-full hover:bg-red-50 transition">
                    <Trash2 size={16} />
                  </button>
                  {userTypeTab === 'STUDENT' && !user.parentId && (
                    <button onClick={() => handleOpenParentModal(user)} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 text-white rounded-md text-xs font-bold hover:bg-amber-600 transition-colors ml-2">
                      <Fingerprint size={14} /> Link Parent
                    </button>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  </div>
)}
               {/* ================= VIEW 3: SUBJECT MANAGEMENT  ================= */}
               {activeTab === 'subjects' && (
                  <div className="space-y-6">
                    

                      {/* Subjects Table */}
                      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                          <table className="w-full text-left border-collapse">
                              <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold">
                                  <tr>
                                      <th className="p-4">Subject Name</th>
                                      <th className="p-4">Description</th>
                                      <th className="p-4">Linked Teachers</th>
                                      <th className="p-4 text-center">Actions</th>
                                  </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                                  {allSubjects.length === 0 ? (
                                      <tr><td colSpan={4} className="p-8 text-center text-slate-400">No subjects found. Please add a new subject.</td></tr>
                                  ) : (
                                      allSubjects.map((subject: any) => (
                                          <tr key={subject.id} className="hover:bg-slate-50 transition-colors">
                                              <td className="p-4 font-bold text-slate-800">{subject.name}</td>
                                              <td className="p-4 text-slate-600 max-w-xs">{subject.description || 'No description provided.'}</td>
                                              <td className="p-4">
                                                  <span className="inline-block px-3 py-1 text-xs font-bold rounded-full bg-blue-100 text-blue-700">
                                                      
                                                      {subject.teachers?.length || 0} Teachers
                                                  </span>
                                              </td>
                                              <td className="p-4 text-center space-x-2">
                                                 
                                                  <button 
                                                  onClick={() => handleDeleteSubject(subject.id)}
                                                  className="p-2 text-red-500 hover:text-red-700 rounded-full hover:bg-red-50 transition" title="Delete Subject"><Trash2 size={16} /></button>
                                              </td>
                                          </tr>
                                      ))
                                  )}
                              </tbody>
                          </table>
                      </div>
                  </div>
              )}

               {/* ================= VIEW 5: SETTINGS ================= */}
               {activeTab === 'settings' && (
                   <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xl space-y-6">
                       <h3 className="text-2xl font-bold text-slate-800 border-b pb-4 flex items-center gap-3">
                           <Settings size={24} className="text-purple-600"/> Global System Settings
                       </h3>
                       <p className="text-slate-600">
                           Here you can manage important system configurations such as registration access, class defaults, and email templates.
                       </p>
                       
                       <div className="space-y-4">
                           <SettingToggle title="Enable New Student Registration" description="Allow users to sign up as students from the public registration page." defaultChecked={true} />
                           <SettingToggle title="Enable Live Class Features" description="Toggle on/off the live video conferencing module across the platform." defaultChecked={true} />
                           <SettingToggle title="Force Password Reset on First Login" description="All newly created users must reset their password immediately." defaultChecked={false} />
                       </div>
                   </div>
               )}
             </>
           )}
        </div>

     
<AnnouncementModal 
  isOpen={isAnnouncementModalOpen} 
  onClose={() => setIsAnnouncementModalOpen(false)} 
  onSuccess={() => window.location.reload()} 
/>

<SubjectModal 
  isOpen={isClassAssignModalOpen} 
  onClose={() => setIsClassAssignModalOpen(false)} 
/>
      </main>

      {/* ======================= MODALS START ======================= */}
      
      {/* --- MODAL 1: CREATE USER --- */}
      <CreateUserModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
        onSuccess={fetchDashboardData} 
      />

      {/* --- MODAL 2: LINK PARENT  --- */}
      <LinkParentModal
        isOpen={isParentModalOpen}
        onClose={() => {
          setIsParentModalOpen(false);
          setSelectedStudentForParent(null);
        }}
        studentData={selectedStudentForParent}
        onSuccess={fetchDashboardData}
      />
      
      {/* --- MODAL 3: EDIT USER --- */}
      <EditUserModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        user={userToEdit}
        onSuccess={fetchDashboardData}
      />

      {/* --- NEW MODAL 4: CREATE SUBJECT --- */}
      <CreateSubjectModal
        isOpen={isSubjectModalOpen}
        onClose={() => setIsSubjectModalOpen(false)}
        onSuccess={fetchDashboardData}
        allUsers={allUsers}
      />
      
    </div>
  );
}

// ======================= SUB COMPONENTS START =======================

// --- EDIT USER MODAL ---
function EditUserModal({ isOpen, onClose, user, onSuccess }: { isOpen: boolean, onClose: () => void, user: User | null, onSuccess: () => void }) {
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({ 
        name: user?.name || "", 
        email: user?.email || "", 
        role: user?.role || "STUDENT",
        studentId: user?.studentId || ""
    });
    useEffect(() => {
        if (user) {
            setForm({
                name: user.name,
                email: user.email,
                role: user.role,
                studentId: user.studentId || ""
            });
        }
    }, [user]);
    const handleSubmit = async (e: any) => {
        e.preventDefault();
        if (!user) return;
        setLoading(true);
        const toastId = toast.loading(`Updating ${user.name}...`);
        
        try {
            // PUT API Call
            const res = await fetch(`/api/admin/user/${user.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form)
            });

            if (res.ok) {
                toast.success(`${user.role} updated successfully!`, { id: toastId });
                onSuccess(); 
                onClose();
            } else {
                const data = await res.json();
                toast.error(data.message || "Failed to update user", { id: toastId });
            }
        } catch (error) {
            toast.error("Network error during update", { id: toastId });
        } finally {
            setLoading(false);
        }
    }

    if (!isOpen || !user) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-blue-500 text-white">
                    <h3 className="text-lg font-bold flex items-center gap-2"><Edit size={20}/> Edit User: {user.name}</h3>
                    <button onClick={onClose} className="text-white hover:text-blue-100">✕</button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    
                    {/* Role Selection (Read-only for existing user to prevent complex linking issues) */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase">User Role (Cannot be changed)</label>
                      <input readOnly value={form.role} className="w-full border rounded-lg px-3 py-2.5 text-sm bg-slate-100 cursor-not-allowed" />
                    </div>

                  
{formData.role === "STUDENT" && (
  <div className="grid grid-cols-2 gap-4 animate-in fade-in duration-300">
    <div className="space-y-1">
      <label className="text-xs font-bold text-slate-500 uppercase">Student ID</label>
      <input
        type="text"
        placeholder="STU-1001"
        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={formData.studentId}
        onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
        required
      />
    </div>
    <div className="space-y-1">
      <label className="text-xs font-bold text-slate-500 uppercase">Assign Class</label>
      <select
        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={formData.studentClass}
        onChange={(e) => setFormData({ ...formData, studentClass: e.target.value })}
        required
      >
        <option value="">Select Class</option>
        <option value="Class 6">Class 6</option>
        <option value="Class 7">Class 7</option>
        <option value="Class 8">Class 8</option>
        <option value="Class 9">Class 9</option>
        <option value="Class 10">Class 10</option>
      </select>
    </div>
  </div>
)}

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase">Full Name</label>
                      <input required className="w-full border rounded-lg px-3 py-2 text-sm" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                    </div>
                    
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase">Email</label>
                      <input required type="email" className="w-full border rounded-lg px-3 py-2 text-sm" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
                    </div>
                    
                    <button disabled={loading} type="submit" className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold text-sm flex justify-center gap-2 hover:bg-blue-700 transition mt-2">
                        {loading ? <Loader2 className="animate-spin" /> : <Check size={18} />} Save Changes
                    </button>
                </form>
            </motion.div>
        </div>
    )
}

// --- SETTING TOGGLE ---
function SettingToggle({ title, description, defaultChecked }: any) {
    const [isChecked, setIsChecked] = useState(defaultChecked);
    return (
        <div className="flex items-start justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
            <div className="max-w-md">
                <p className="font-bold text-slate-800">{title}</p>
                <p className="text-xs text-slate-500 mt-1">{description}</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer ml-4">
                <input 
                    type="checkbox" 
                    checked={isChecked} 
                    onChange={() => setIsChecked(!isChecked)} 
                    className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
        </div>
    );
}

// --- NAV ITEM COMPONENT ---
const NavItem = ({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition duration-200 w-full ${
      active
        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 font-bold'
        : 'text-slate-400 hover:bg-slate-800 hover:text-white font-semibold'
    }`}
  >
    {icon} 
    <span className="text-sm">{label}</span>
  </button>
);

// --- STAT CARD COMPONENT ---
const StatCard = ({ title, value, icon, color }: { title: string, value: number, icon: React.ReactNode, color: string }) => (
  <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-200 flex items-center justify-between transition-transform hover:scale-[1.02]">
    <div>
      <p className="text-xs font-bold uppercase text-slate-500">{title}</p>
      <h3 className="text-3xl font-extrabold text-slate-900 mt-1">{value}</h3>
    </div>
    <div className={`h-12 w-12 ${color} text-white rounded-full flex items-center justify-center shadow-lg`}>
      {icon}
    </div>
  </div>
);

// --- TAB BUTTON COMPONENT ---
const TabButton = ({ isActive, onClick, icon, label }: { isActive: boolean, onClick: () => void, icon: React.ReactNode, label: string }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
      isActive 
        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30' 
        : 'bg-white text-slate-600 hover:bg-slate-50'
    }`}
  >
    {icon} {label}
  </button>
);

// --- CREATE USER MODAL ---
function CreateUserModal({ isOpen, onClose, onSuccess }: { isOpen: boolean, onClose: () => void, onSuccess: () => void }) {
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
        studentId: '',   
        studentClass: '', 
        role: 'STUDENT'
    });

    const roleOptions = [
        { value: 'STUDENT', label: 'Student' },
        { value: 'TEACHER', label: 'Teacher' },
        { value: 'PARENT', label: 'Parent' },
        { value: 'ADMIN', label: 'Admin' }
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const toastId = toast.loading(`Creating ${form.name} as ${form.role}...`);

        try {
            // Register API Call
            const res = await fetch("/api/register", { 
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form)
            });

            if (res.ok) {
                toast.success(`${form.role} created successfully!`, { id: toastId });
                onSuccess();
                onClose();
                setForm({ name: '', email: '', password: '', role: 'STUDENT', studentId: '', studentClass: '' });
            } else {
                const data = await res.json();
                toast.error(data.message || "Failed to create user", { id: toastId });
            }
        } catch (error) {
            toast.error("Network error during registration", { id: toastId });
        } finally {
            setLoading(false);
        }
    }

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-blue-600 text-white">
                    <h3 className="text-xl font-bold flex items-center gap-2"><Plus size={24} /> Create New User</h3>
                    <button onClick={onClose} className="text-white hover:text-blue-100">✕</button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
                    
                    {/* Role Selection */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase block">User Role</label>
                      <select 
                          required 
                          className="w-full border rounded-lg px-3 py-2.5 text-sm bg-slate-50 focus:outline-none focus:border-blue-400" 
                          value={form.role}
                          onChange={e => setForm({...form, role: e.target.value})}
                      >
                          {roleOptions.map(option => (
                              <option key={option.value} value={option.value}>{option.label}</option>
                          ))}
                    </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase block">Full Name</label>
                      <input required className="w-full border rounded-lg px-3 py-2.5 text-sm" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                    </div>
                    
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase block">Email</label>
                      <input required type="email" className="w-full border rounded-lg px-3 py-2.5 text-sm" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase block">Password</label>
                      <input required type="password" placeholder="••••••••" className="w-full border rounded-lg px-3 py-2.5 text-sm" value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
                    </div>

                    {/* If student then show id and class*/}
                    {form.role === 'STUDENT' && (
                        <div className="grid grid-cols-2 gap-4 pt-2 animate-in fade-in slide-in-from-top-2 duration-300">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500 uppercase block">Student ID</label>
                                <input 
                                    required 
                                    placeholder="STU-101"
                                    className="w-full border rounded-lg px-3 py-2.5 text-sm bg-blue-50/50" 
                                    value={form.studentId} 
                                    onChange={e => setForm({...form, studentId: e.target.value})} 
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500 uppercase block">Class</label>
                                <select 
                                    required 
                                    className="w-full border rounded-lg px-3 py-2.5 text-sm bg-blue-50/50" 
                                    value={form.studentClass} 
                                    onChange={e => setForm({...form, studentClass: e.target.value})}
                                >
                                    <option value="">Select</option>
                                    <option value="Class 6">Class 6</option>
                                    <option value="Class 7">Class 7</option>
                                    <option value="Class 8">Class 8</option>
                                    <option value="Class 9">Class 9</option>
                                    <option value="Class 10">Class 10</option>
                                </select>
                            </div>
                        </div>
                    )}
                   
                    
                    <button disabled={loading} type="submit" className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold text-sm flex justify-center gap-2 hover:bg-blue-700 transition mt-6">
                        {loading ? <Loader2 className="animate-spin" /> : <UserCheck size={18} />} Create User
                    </button>
                </form>
            </motion.div>
        </div>
    )
}
// --- LINK PARENT MODAL ---
function LinkParentModal({ isOpen, onClose, studentData, onSuccess }: { isOpen: boolean, onClose: () => void, studentData: any, onSuccess: () => void }) {
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
        studentId: '' 
    });


    useEffect(() => {
        if (studentData) {
            setForm(prev => ({
                ...prev,
                name: '', 
                email: '',
                password: '',
                studentId: studentData.studentId || '' 
            }));
        }
    }, [studentData, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const toastId = toast.loading(`Linking parent for ${studentData?.name}...`);

        try {
            const res = await fetch("/api/admin/link-parent", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form) 
            });

            if (res.ok) {
                toast.success(`Parent account created and linked!`, { id: toastId });
                onSuccess(); 
                onClose();
            } else {
                const data = await res.json();
                toast.error(data.message || "Failed to link parent", { id: toastId });
            }
        } catch (error) {
            toast.error("Network error during linking", { id: toastId });
        } finally {
            setLoading(false);
        }
    }

    if (!isOpen || !studentData) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-amber-500 text-white">
                    <div className="flex items-center gap-3">
                        <div className="bg-white/20 p-2 rounded-lg">
                            <Baby size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold">Link Parent</h3>
                            <p className="text-xs text-amber-100">For student: {studentData.name}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-white hover:rotate-90 transition-transform">✕</button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    
                    {/* Student Info (Read Only) */}
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Target Student ID</label>
                        <div className="relative">
                            <Fingerprint className="absolute left-3 top-2.5 text-amber-500" size={18} />
                            <input 
                                readOnly 
                                className="w-full border border-amber-100 bg-amber-50 rounded-lg pl-10 pr-3 py-2.5 text-sm font-mono font-bold text-amber-700 outline-none" 
                                value={form.studentId} 
                            />
                        </div>
                    </div>

                    <hr className="border-slate-100 my-2" />

                    {/* Parent Name */}
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase block">Parent's Full Name</label>
                        <input 
                            required 
                            className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-amber-200 outline-none transition" 
                            placeholder="Father/Mother Name"
                            value={form.name} 
                            onChange={e => setForm({...form, name: e.target.value})} 
                        />
                    </div>

                    {/* Parent Email */}
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase block">Parent's Email</label>
                        <input 
                            required 
                            type="email" 
                            className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-amber-200 outline-none transition" 
                            placeholder="parent@example.com"
                            value={form.email} 
                            onChange={e => setForm({...form, email: e.target.value})} 
                        />
                    </div>

                    {/* Parent Password */}
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase block">Temporary Password</label>
                        <input 
                            required 
                            type="password" 
                            className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-amber-200 outline-none transition" 
                            placeholder="Minimum 6 characters"
                            value={form.password} 
                            onChange={e => setForm({...form, password: e.target.value})} 
                        />
                    </div>
                    
                    {/* Submit Button */}
                    <button 
                        disabled={loading} 
                        type="submit" 
                        className="w-full bg-amber-600 text-white py-3 rounded-xl font-bold text-sm flex justify-center gap-2 hover:bg-amber-700 active:scale-95 transition-all mt-6 shadow-lg shadow-amber-200"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : <UserCheck size={18} />} Create & Link Account
                    </button>
                </form>
            </motion.div>
        </div>
    )
}
// --- NEW MODAL 4: CREATE SUBJECT MODAL ---
function CreateSubjectModal({ isOpen, onClose, onSuccess, allUsers }: { isOpen: boolean, onClose: () => void, onSuccess: () => void, allUsers: User[] }) {
  const [loading, setLoading] = useState(false);
  const [subjectName, setSubjectName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedTeacherIds, setSelectedTeacherIds] = useState<string[]>([]);
  
  // Filter only TEACHERS
  const teachers = allUsers.filter(user => user.role === 'TEACHER');

  const handleTeacherToggle = (teacherId: string) => {
      setSelectedTeacherIds(prev =>
          prev.includes(teacherId)
              ? prev.filter(id => id !== teacherId)
              : [...prev, teacherId]
      );
  };

  const handleReset = () => {
      setSubjectName('');
      setDescription('');
      setSelectedTeacherIds([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      const toastId = toast.loading(`Creating subject: ${subjectName}...`);

      try {
          const res = await fetch("/api/admin/subjects", { 
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                  name: subjectName,
                  description: description,
                  teacherIds: selectedTeacherIds,
              })
          });

          if (res.ok) {
              toast.success(`Subject '${subjectName}' created and linked successfully!`, { id: toastId });
              onSuccess();
              handleReset();
              onClose();
          } else {
              const data = await res.json();
              toast.error(data.message || "Failed to create subject", { id: toastId });
          }
      } catch (error) {
          toast.error("Network error during subject creation", { id: toastId });
      } finally {
          setLoading(false);
      }
  };

  if (!isOpen) return null;

  return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-purple-600 text-white">
                  <h3 className="text-xl font-bold flex items-center gap-2"><BookOpenCheck size={24} /> Create New Subject</h3>
                  <button onClick={onClose} className="text-white hover:text-purple-100">✕</button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                  
                  {/* Subject Details */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase block">Subject Name</label>
                        <input required className="w-full border rounded-lg px-3 py-2.5 text-sm" value={subjectName} onChange={e => setSubjectName(e.target.value)} />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase block">Short Description</label>
                        <input className="w-full border rounded-lg px-3 py-2.5 text-sm" value={description} onChange={e => setDescription(e.target.value)} />
                    </div>
                  </div>

                  {/* Teacher Linking */}
                  <div className="space-y-2">
                      <label className="text-sm font-bold text-purple-600 uppercase block">Link Teachers to this Subject</label>
                      <div className="space-y-3 p-4 border border-purple-200 bg-purple-50 rounded-lg">
                          {teachers.length === 0 ? (
                              <p className="text-sm text-slate-500">No teachers found in the system to link. Please create a TEACHER user first.</p>
                          ) : (
                              <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto custom-scrollbar">
                                  {teachers.map(teacher => (
                                      <button
                                          type="button"
                                          key={teacher.id}
                                          onClick={() => handleTeacherToggle(teacher.id)}
                                          className={`px-3 py-1 text-sm rounded-full font-semibold transition-all flex items-center gap-1.5 ${
                                              selectedTeacherIds.includes(teacher.id)
                                                  ? 'bg-purple-600 text-white shadow-md'
                                                  : 'bg-white text-slate-600 border border-purple-300 hover:bg-purple-100'
                                          }`}
                                      >
                                          {selectedTeacherIds.includes(teacher.id) && <Check size={14} />}
                                          {teacher.name}
                                      </button>
                                  ))}
                              </div>
                          )}
                      </div>
                      <p className="text-xs text-slate-500">Selected: {selectedTeacherIds.length} teachers</p>
                  </div>
                  
                  <button disabled={loading || teachers.length === 0} type="submit" className="w-full bg-purple-600 text-white py-3 rounded-xl font-bold text-sm flex justify-center gap-2 hover:bg-purple-700 transition mt-6 disabled:opacity-50">
                      {loading ? <Loader2 className="animate-spin" /> : <BookOpenCheck size={18} />} Create & Link Subject
                  </button>
              </form>
          </motion.div>
      </div>
  );
}
// --- NEW MODAL 5: START LIVE CLASS REQUEST MODAL ---
function StartLiveModal({ isOpen, onClose, onSuccess, allSubjects, allUsers, currentAdminId }: { isOpen: boolean, onClose: () => void, onSuccess: () => void, allSubjects: any[], allUsers: User[], currentAdminId: string }) {
  const [loading, setLoading] = useState(false);
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  const [startTime, setStartTime] = useState(''); 

  const teachers = allUsers.filter(user => user.role === 'TEACHER');

  const handleReset = () => {
      setSelectedSubjectId('');
      setSelectedTeacherId('');
      setStartTime('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      const toastId = toast.loading("Creating live request...");
      try {
          const res = await fetch("/api/admin/live-request", { 
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                  subjectId: selectedSubjectId,
                  teacherId: selectedTeacherId,
                  startTime: new Date(startTime).toISOString(),
                  adminId: currentAdminId,
              })
          });
          if (res.ok) {
              toast.success(`Live request created successfully!`, { id: toastId });
              onSuccess();
              handleReset();
              onClose();
          }
      } catch (error) {
          toast.error("Error creating request", { id: toastId });
      } finally {
          setLoading(false);
      }
  };

  if (!isOpen) return null;

  return (
      <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-green-600 text-white">
                  <h3 className="text-xl font-bold flex items-center gap-2"><Video size={24} /> Start New Live Class Request</h3>
                  <button onClick={onClose} className="text-white hover:text-green-100">✕</button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                  <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase block">Select Subject</label>
                      <select required className="w-full border rounded-lg px-3 py-2.5 text-sm bg-slate-50 focus:outline-none focus:border-green-400" value={selectedSubjectId} onChange={e => setSelectedSubjectId(e.target.value)}>
                          <option value="" disabled>Choose a subject</option>
                          {allSubjects.map((subject: any) => (<option key={subject.id} value={subject.id}>{subject.name}</option>))}
                      </select>
                  </div>
                  <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase block">Select Teacher</label>
                      <select required className="w-full border rounded-lg px-3 py-2.5 text-sm bg-slate-50 focus:outline-none focus:border-green-400" value={selectedTeacherId} onChange={e => setSelectedTeacherId(e.target.value)}>
                          <option value="" disabled>Choose a teacher</option>
                          {teachers.map((teacher: User) => (<option key={teacher.id} value={teacher.id}>{teacher.name}</option>))}
                      </select>
                  </div>
                  <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase block flex items-center gap-1"><Calendar size={14} /> Scheduled Start Time</label>
                      <input required type="datetime-local" className="w-full border rounded-lg px-3 py-2.5 text-sm bg-slate-50 focus:outline-none focus:border-green-400" value={startTime} onChange={e => setStartTime(e.target.value)} />
                  </div>
                  <button disabled={loading} type="submit" className="w-full bg-green-600 text-white py-3 rounded-xl font-bold text-sm flex justify-center gap-2 hover:bg-green-700 transition mt-6">
                      {loading ? <Loader2 className="animate-spin" /> : <ArrowRight size={18} />} Submit Live Request
                  </button>
              </form>
          </motion.div>
      </div>
  );
}

// --- NEW MODAL 6: ASSIGN CLASS MODAL ---
function AssignClassModal({ isOpen, onClose, onSuccess, teachers, subjects }: any) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        teacherId: "", subjectId: "", dayOfWeek: "Monday", startTime: "", endTime: "", roomNumber: ""
    });

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        if(!formData.teacherId || !formData.subjectId) return toast.error("Select teacher and subject");
        setLoading(true);
        try {
            const res = await fetch("/api/admin/assign-class", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });
            if(res.ok) {
                toast.success("Class Assigned!");
                onSuccess();
                onClose();
            }
        } catch (error) {
            toast.error("Error assigning class");
        } finally { setLoading(false); }
    };

    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-xl text-slate-800 flex items-center gap-2"><Calendar size={20} className="text-blue-600"/> Assign New Class</h3>
                    <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-full transition"><X size={20} /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500">Teacher</label>
                        <select className="w-full border rounded-lg px-3 py-2 text-sm bg-slate-50" value={formData.teacherId} onChange={(e) => setFormData({...formData, teacherId: e.target.value})}>
                            <option value="">Select Teacher</option>
                            {teachers?.map((t: any) => <option key={t.id} value={t.id}>{t.name}</option>)}
                        </select>
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500">Subject</label>
                        <select className="w-full border rounded-lg px-3 py-2 text-sm bg-slate-50" value={formData.subjectId} onChange={(e) => setFormData({...formData, subjectId: e.target.value})}>
                            <option value="">Select Subject</option>
                            {subjects?.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500">Start Time</label>
                            <input type="time" className="w-full border rounded-lg px-3 py-2 text-sm bg-slate-50" onChange={(e) => setFormData({...formData, startTime: e.target.value})} />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500">Room No</label>
                            <input type="text" placeholder="Ex: 401" className="w-full border rounded-lg px-3 py-2 text-sm bg-slate-50" onChange={(e) => setFormData({...formData, roomNumber: e.target.value})} />
                        </div>
                    </div>
                    <button disabled={loading} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition mt-2">
                        {loading ? "Assigning..." : "Assign Class"}
                    </button>
                </form>
            </motion.div>
        </div>
    );
}

function AnnouncementModal({ isOpen, onClose, onSuccess }: any) {
    const [loading, setLoading] = useState(false);
    const [content, setContent] = useState("");

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        if(!content.trim()) return toast.error("Please write something");
        
        setLoading(true);
        
        try {
            const res = await fetch("/api/admin/announcement", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    content: content, 
                    title: "Official Announcement",
                    adminId: "6941b0720c9abaa2738e99c4" 
                }) 
            });

            
            if (res.ok) {
                toast.success("Announcement Posted Successfully!");
                setContent(""); 
                onSuccess();    
                onClose();      
                return; 
            } else {

                const errorData = await res.json().catch(() => ({}));
                toast.error(errorData.message || "Something went wrong on server");
            }

        } catch (error) { 
       
            console.error("Fetch Error:", error);
        } finally { 
            setLoading(false); 
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-xl text-slate-800">New Announcement</h3>
                    <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-full transition text-slate-500">✕</button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <textarea 
                        placeholder="Write announcement..." 
                        className="w-full border border-slate-200 rounded-lg px-3 py-3 text-sm min-h-[120px] focus:ring-2 focus:ring-blue-500 outline-none" 
                        value={content} 
                        onChange={(e) => setContent(e.target.value)} 
                    />
                    <button 
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition disabled:opacity-50"
                    >
                        {loading ? "Posting..." : "Post Announcement"}
                    </button>
                </form>
            </div>
        </div>
    );
}
// --- NEW MODAL 8: SUBJECT/CLASS ASSIGN MODAL ---

function SubjectModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const [loading, setLoading] = useState(false);
    const [localTeachers, setLocalTeachers] = useState([]);
    const [localSubjects, setLocalSubjects] = useState([]);
    
    const [formData, setFormData] = useState({
        teacherId: "",
        subjectId: "",
        className: "", 
        roomNumber: "",
        day: "",
        startTime: "",
        endTime: ""
    });


    useEffect(() => {
        if (isOpen) {
            const loadData = async () => {
                try {
                    const [tRes, sRes] = await Promise.all([
                        fetch("/api/admin/teacher"),
                        fetch("/api/admin/subjects")
                    ]);
                    if (tRes.ok) setLocalTeachers(await tRes.json());
                    if (sRes.ok) setLocalSubjects(await sRes.json());
                } catch (err) { console.error("Error loading data", err); }
            };
            loadData();
        }
    }, [isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
        const res = await fetch("/api/admin/assign-class", {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify(formData)
        });

        if (res.ok) {
            onClose();
            setTimeout(() => {
                window.location.reload();
            }, 500);
            return; 
        }

      
        const data = await res.json();
        alert("Error: " + data.error);

    } catch (error) {
       
        console.log("Saving data was successful, ignore parsing errors.");
        onClose();
        window.location.reload();
    } finally {
        setLoading(false);
    }
};
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl w-full max-w-lg p-8 shadow-2xl my-auto">
                <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <h3 className="font-extrabold text-2xl text-slate-800">Assign Routine</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-red-500 text-2xl transition">✕</button>
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-5">
                    <div className="col-span-2">
                        <label className="text-sm font-semibold text-slate-600 mb-1 block">Select Teacher</label>
                        <select required className="w-full border-2 border-slate-100 p-3 rounded-xl focus:border-blue-500 outline-none"
                            onChange={(e) => setFormData({...formData, teacherId: e.target.value})}>
                            <option value="">Choose Teacher</option>
                            {localTeachers.map((t: any) => <option key={t.id} value={t.id}>{t.name}</option>)}
                        </select>
                    </div>

                    <div className="col-span-2">
                        <label className="text-sm font-semibold text-slate-600 mb-1 block">Select Subject</label>
                        <select required className="w-full border-2 border-slate-100 p-3 rounded-xl focus:border-blue-500 outline-none"
                            onChange={(e) => setFormData({...formData, subjectId: e.target.value})}>
                            <option value="">Choose Subject</option>
                            {localSubjects.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    </div>

                    <div className="col-span-2">
                        <label className="text-sm font-semibold text-slate-600 mb-1 block">Class Name</label>
                        <select required className="w-full border-2 border-slate-100 p-3 rounded-xl focus:border-blue-500 outline-none"
                            onChange={(e) => setFormData({...formData, className: e.target.value})}>
                            <option value="">Select Class</option>
                            {["Class 6", "Class 7", "Class 8", "Class 9", "Class 10", "Class 11", "Class 12"].map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="text-sm font-semibold text-slate-600 mb-1 block">Day</label>
                        <select required className="w-full border-2 border-slate-100 p-3 rounded-xl outline-none"
                            onChange={(e) => setFormData({...formData, day: e.target.value})}>
                            <option value="">Select Day</option>
                            {["SATURDAY", "SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"].map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="text-sm font-semibold text-slate-600 mb-1 block">Room No</label>
                        <input required type="text" placeholder="101" className="w-full border-2 border-slate-100 p-3 rounded-xl focus:border-blue-500 outline-none"
                            onChange={(e) => setFormData({...formData, roomNumber: e.target.value})} />
                    </div>

                    <div>
                        <label className="text-sm font-semibold text-slate-600 mb-1 block">Start Time</label>
                        <input required type="time" className="w-full border-2 border-slate-100 p-3 rounded-xl outline-none"
                            onChange={(e) => setFormData({...formData, startTime: e.target.value})} />
                    </div>

                    <div>
                        <label className="text-sm font-semibold text-slate-600 mb-1 block">End Time</label>
                        <input required type="time" className="w-full border-2 border-slate-100 p-3 rounded-xl outline-none"
                            onChange={(e) => setFormData({...formData, endTime: e.target.value})} />
                    </div>

                    <button type="submit" disabled={loading} className="col-span-2 mt-4 bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 transition active:scale-95 disabled:bg-slate-300 shadow-lg shadow-blue-100">
                        {loading ? "Processing..." : "Confirm Assignment"}
                    </button>
                </form>
            </div>
        </div>
    );
}