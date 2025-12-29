"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import { User, Eye, EyeOff, ArrowRight, CheckCircle2, Fingerprint, Star, ShieldCheck, School, Loader2, BookOpen } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"student" | "parent">("student");
  const [selectedPlan, setSelectedPlan] = useState<"free" | "premium">("free");
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    childId: "",
    studentClass: "",
  });
  
  const [error, setError] = useState("");

  const classOptions = ["Class 6", "Class 7", "Class 8", "Class 9", "Class 10", "Class 11", "Class 12"];

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const loadingToast = toast.loading("Creating your account...");

    try {
        if (activeTab === "parent" && form.childId.length < 3) {
            throw new Error("Valid Student ID is required.");
        }
        
        if (activeTab === "student" && !form.studentClass) {
            throw new Error("Please select your class.");
        }

        await new Promise(resolve => setTimeout(resolve, 1500));

        const res = await fetch("/api/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                ...form,
                role: activeTab,
                plan: selectedPlan
            }),
        });

        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            throw new Error("Server Error. Please try again.");
        }

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.message || "Registration failed.");
        }

        toast.dismiss(loadingToast);
        
        setLoading(false);
        setSuccess(true);

        if (activeTab === "student") {
           const studentID = data.user?.studentId || "Saved";
           
           toast.custom((t) => (
             <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}>
               <div className="flex-1 w-0 p-4">
                 <div className="flex items-start">
                   <div className="flex-shrink-0 pt-0.5">
                     <CheckCircle2 className="h-10 w-10 text-green-500" />
                   </div>
                   <div className="ml-3 flex-1">
                     <p className="text-sm font-medium text-gray-900">
                       Registration Successful!
                     </p>
                     <p className="mt-1 text-sm text-gray-500">
                       Your Student ID is: <span className="font-bold text-blue-600 text-lg select-all">{studentID}</span>
                     </p>
                     <p className="text-xs text-gray-400 mt-1">Please save this ID.</p>
                   </div>
                 </div>
               </div>
               <div className="flex border-l border-gray-200">
                 <button
                   onClick={() => toast.dismiss(t.id)}
                   className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none"
                 >
                   Close
                 </button>
               </div>
             </div>
           ), { duration: 6000 });

           setTimeout(() => {
               router.push("/login");
           }, 6500);

        } else {
            toast.success("Parent account created successfully!");
            setTimeout(() => {
                router.push("/login");
            }, 2000);
        }

    } catch (err: any) {
      toast.dismiss(loadingToast);
      setLoading(false);
      setError(err.message || "Something went wrong.");
      toast.error(err.message || "Registration Failed ❌");
    }
  };

  if (!mounted) return null;

  return (
    <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        className="flex min-h-screen w-full bg-[#F8FAFC] font-sans text-slate-800"
    >
      <div className="w-full max-w-7xl mx-auto px-4 min-h-screen flex items-center justify-center py-8">
         <div className="w-full bg-white rounded-3xl shadow-xl shadow-slate-200/50 overflow-hidden flex flex-col lg:flex-row border border-slate-100 min-h-[650px] transition-all duration-300">
            
            {/* LEFT SIDE: Image Branding */}
            <div className="hidden lg:flex w-[40%] relative flex-col justify-between p-12 overflow-hidden bg-slate-900 min-h-full">
                <div 
                    className="absolute inset-0 bg-cover bg-center opacity-90 transition-all duration-700 hover:scale-105"
                    style={{ backgroundImage: "url('https://images.unsplash.com/photo-1523580494863-6f3031224c94?q=80&w=2070&auto=format&fit=crop')" }}
                ></div>
                <div className={`absolute inset-0 bg-gradient-to-t ${activeTab === 'student' ? 'from-blue-900/95 via-blue-900/50' : 'from-emerald-900/95 via-emerald-900/50'} to-transparent transition-colors duration-500`}></div>
                
                <div className="relative z-10">
                    <Link href="/" className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center border border-white/30 backdrop-blur-md">
                            <School className="text-white" size={22} />
                        </div>
                        <span className="text-xl font-bold tracking-wide text-white drop-shadow-md">EduVerse</span>
                    </Link>
                </div>

                <div className="relative z-10 space-y-6 h-32">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
                            className="absolute inset-0"
                        >
                            <h1 className="text-3xl font-bold leading-tight text-white mb-4 drop-shadow-md">
                                {activeTab === 'student' 
                                ? "Start Your Journey" 
                                : "Partner in Growth"}
                            </h1>
                            <p className="text-white/90 text-sm leading-relaxed border-l-2 border-white/50 pl-4 font-medium drop-shadow-sm">
                                {activeTab === 'student' 
                                ? "Join the top 1% of students mastering their craft through our advanced portal." 
                                : "Monitor your child's academic performance with real-time analytics and reports."}
                            </p>
                        </motion.div>
                    </AnimatePresence>
                </div>

                <div className="relative z-10 flex items-center gap-2 text-xs font-bold text-white/80 uppercase tracking-widest mt-auto">
                    <ShieldCheck size={14} />
                    <span>Secure Registration</span>
                </div>
            </div>

            {/* RIGHT SIDE: Registration Form */}
            <div className="w-full lg:w-[60%] p-8 lg:p-12 relative flex flex-col justify-center">
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-slate-900">Create Account</h2>
                    <p className="text-slate-500 text-sm mt-1">Please fill in the official details below.</p>
                </div>

                <div className="flex p-1 rounded-lg bg-slate-100 border border-slate-200 mb-8 w-fit">
                    <button
                        type="button"
                        disabled={loading || success}
                        onClick={() => setActiveTab("student")}
                        className={`px-6 py-2.5 rounded-md text-sm font-bold transition-all flex items-center gap-2 disabled:opacity-50 ${
                            activeTab === "student" 
                            ? "bg-white text-[#1e3a8a] shadow-sm ring-1 ring-black/5" 
                            : "text-slate-500 hover:text-slate-700"
                        }`}
                    >
                        <User size={16} /> Student
                    </button>
                    <button
                        type="button"
                        disabled={loading || success}
                        onClick={() => setActiveTab("parent")}
                        className={`px-6 py-2.5 rounded-md text-sm font-bold transition-all flex items-center gap-2 disabled:opacity-50 ${
                            activeTab === "parent" 
                            ? "bg-white text-[#059669] shadow-sm ring-1 ring-black/5" 
                            : "text-slate-500 hover:text-slate-700"
                        }`}
                    >
                        <Fingerprint size={16} /> Parent
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <AnimatePresence mode="wait">
                        {activeTab === "student" ? (
                            <motion.div
                                key="student-plan"
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.3 }}
                                className="overflow-hidden space-y-4"
                            >
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-2">
                                    <div 
                                        onClick={() => !loading && !success && setSelectedPlan('free')}
                                        className={`relative p-4 rounded-xl border-2 transition-all ${loading || success ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${
                                            selectedPlan === 'free' 
                                            ? 'border-[#1e3a8a] bg-blue-50/50' 
                                            : 'border-slate-200 hover:border-slate-300'
                                        }`}
                                    >
                                        <div className="flex justify-between items-center mb-2">
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded text-white bg-[#1e3a8a]`}>STANDARD</span>
                                            {selectedPlan === 'free' && <CheckCircle2 size={18} className="text-[#1e3a8a]" />}
                                        </div>
                                        <div className="text-xl font-bold text-slate-800">Free Access</div>
                                        <p className="text-xs text-slate-500 mt-1">Basic portal access.</p>
                                    </div>

                                    <div className="relative p-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 opacity-70 cursor-not-allowed">
                                        <div className="absolute -top-2 -right-2">
                                            <span className="text-[9px] font-bold bg-amber-500 text-white px-2 py-1 rounded shadow-sm">COMING SOON</span>
                                        </div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <Star size={14} className="text-amber-500 fill-amber-500" />
                                            <span className="text-[10px] font-bold text-slate-500 uppercase">Premium</span>
                                        </div>
                                        <div className="text-xl font-bold text-slate-400">Paid Plan</div>
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div 
                                key="parent-link"
                                initial={{ opacity: 0, height: 0 }} 
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.3 }}
                                className="bg-emerald-50 border border-emerald-100 p-4 rounded-lg overflow-hidden"
                            >
                                <label className="text-xs font-bold text-emerald-800 uppercase mb-2 block">Link Student ID</label>
                                <input 
                                    name="childId"
                                    type="text"
                                    disabled={loading || success}
                                    className="w-full bg-white border border-emerald-200 rounded-md px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm font-mono disabled:opacity-50"
                                    placeholder="Enter ID (e.g. STU-1234)"
                                    onChange={handleChange}
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="space-y-4 pt-2">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-600 uppercase">Full Name</label>
                            <input 
                                name="name"
                                type="text"
                                disabled={loading || success}
                                className="w-full bg-white border border-slate-300 rounded-lg px-4 py-3 text-slate-900 focus:outline-none focus:border-[#1e3a8a] focus:ring-2 focus:ring-blue-100 transition-all disabled:opacity-50"
                                placeholder="Enter full name"
                                onChange={handleChange}
                                required
                            />
                        </div>

                    
                        <AnimatePresence>
                            {activeTab === 'student' && (
                                <motion.div 
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="space-y-1.5"
                                >
                                    <label className="text-xs font-bold text-slate-600 uppercase">Class / Grade</label>
                                    <div className="relative group">
                                        <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#1e3a8a] transition-colors" size={18} />
                                        <select 
                                            name="studentClass"
                                            disabled={loading || success}
                                            value={form.studentClass}
                                            onChange={handleChange}
                                            className="w-full bg-white border border-slate-300 rounded-lg pl-11 pr-4 py-3 text-slate-900 focus:outline-none focus:border-[#1e3a8a] focus:ring-2 focus:ring-blue-100 transition-all disabled:opacity-50 appearance-none cursor-pointer"
                                            required={activeTab === 'student'}
                                        >
                                            <option value="" disabled>Select your class</option>
                                            {classOptions.map((cls) => (
                                                <option key={cls} value={cls}>{cls}</option>
                                            ))}
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                            <ArrowRight size={14} className="text-slate-400 rotate-90" />
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-600 uppercase">Email Address</label>
                            <input 
                                name="email"
                                type="email"
                                disabled={loading || success}
                                className="w-full bg-white border border-slate-300 rounded-lg px-4 py-3 text-slate-900 focus:outline-none focus:border-[#1e3a8a] focus:ring-2 focus:ring-blue-100 transition-all disabled:opacity-50"
                                placeholder="name@example.com"
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-600 uppercase">Password</label>
                            <div className="relative">
                                <input 
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    disabled={loading || success}
                                    className="w-full bg-white border border-slate-300 rounded-lg pl-4 pr-12 py-3 text-slate-900 focus:outline-none focus:border-[#1e3a8a] focus:ring-2 focus:ring-blue-100 transition-all disabled:opacity-50"
                                    placeholder="Create password"
                                    onChange={handleChange}
                                    required
                                />
                                <button 
                                    type="button"
                                    disabled={loading || success}
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#1e3a8a] disabled:opacity-50"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-200 flex items-center gap-2 animate-pulse">
                           ⚠️ {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading || success}
                        className={`w-full font-bold py-3.5 rounded-lg shadow-md flex items-center justify-center gap-2 transition-all duration-300 ${
                            success 
                            ? "bg-emerald-500 text-white scale-[1.02]" 
                            : loading 
                                ? "opacity-80 cursor-wait text-white" 
                                : "text-white hover:shadow-lg hover:-translate-y-0.5"
                        } ${
                            !success && activeTab === 'student' ? 'bg-[#1e3a8a] hover:bg-[#172554]' : ''
                        } ${
                            !success && activeTab === 'parent' ? 'bg-[#059669] hover:bg-[#047857]' : ''
                        }`}
                    >
                        {loading ? (
                            <div className="flex items-center gap-2">
                                <Loader2 className="animate-spin" size={20} />
                                <span>Processing...</span>
                            </div>
                        ) : success ? (
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="animate-bounce" size={20} />
                                <span>Success!</span>
                            </div>
                        ) : (
                            <>
                                {activeTab === "student" ? "Register Student" : "Register Parent"}
                                <ArrowRight size={18} />
                            </>
                        )}
                    </button>

                    <div className="text-center pt-2">
                        <p className="text-slate-500 text-sm">
                            Already enrolled?{" "}
                            <Link href="/login" className="text-[#1e3a8a] font-bold hover:underline">
                                Login Here
                            </Link>
                        </p>
                    </div>

                </form>
            </div>
         </div>
      </div>
    </motion.div>
  );
}