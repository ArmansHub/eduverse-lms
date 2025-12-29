"use client";

import { signIn } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, ArrowRight, GraduationCap, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { toast } from "react-hot-toast";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false); 
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState("");
  
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {

        const result = await signIn("credentials", {
            redirect: false, 
            email: form.email,
            password: form.password,
        });

        if (result?.error) {
            setError("Invalid email or password");
            setLoading(false);
        } else {
            setSuccess(true);
            toast.success("Login Successful!");


            const sessionRes = await fetch("/api/auth/session");
            const sessionData = await sessionRes.json();
            const role = sessionData?.user?.role;

            setTimeout(() => {
                if (role === "STUDENT") {
                     window.location.href = "/student/dashboard"; 
                } else if (role === "TEACHER") {
                     window.location.href = "/teacher"; 
                } else if (role === "ADMIN") {
                     window.location.href = "/admin/dashboard"; 
                } else if (role === "PARENT") {
                     window.location.href = "/parent/dashboard";
                } else {
                     window.location.href = "/";
                }
            }, 1000);
        }
    } catch (err) {
        setLoading(false);
        setError("Something went wrong. Please try again.");
        console.error("Login Error:", err);
    }
  };

  if (!mounted) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      transition={{ duration: 0.5 }}
      className="flex min-h-screen w-full bg-[#F8FAFC] font-sans text-slate-800"
    >
      
      <div className="w-full max-w-6xl mx-auto px-4 min-h-screen flex items-center justify-center py-8">
         <div className="w-full bg-white rounded-3xl shadow-xl shadow-slate-200/50 overflow-hidden flex flex-col lg:flex-row border border-slate-100 min-h-[600px]">
            
            <div className="hidden lg:flex w-1/2 relative flex-col justify-between p-12 bg-slate-900 min-h-full">
                
         
                <div 
                    className="absolute inset-0 bg-cover bg-center opacity-60"
                    style={{ backgroundImage: "url('https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=1970&auto=format&fit=crop')" }}
                ></div>
                <div className="absolute inset-0 bg-gradient-to-t from-blue-900 via-slate-900/60 to-slate-900/40"></div>

                <div className="relative z-10 flex items-center gap-3">
                    <div className="bg-white/10 p-2.5 rounded-xl backdrop-blur-md border border-white/20 shadow-lg">
                        <GraduationCap size={24} className="text-white" />
                    </div>
                    <span className="text-xl font-bold tracking-wide text-white drop-shadow-lg">EduVerse Portal</span>
                </div>

                <div className="relative z-10 mt-auto">
                    <h3 className="text-3xl font-bold text-white mb-4 leading-tight drop-shadow-md">
                        Empowering the <br/> Future of Education
                    </h3>
                    <p className="text-blue-100 text-sm leading-relaxed max-w-md drop-shadow-sm">
                        Manage courses and track progress with ease. EduVerse simplifies learning and resource management.
                    </p>
                </div>
            </div>

            {/* RIGHT SIDE: Login Form */}
            <div className="w-full lg:w-1/2 p-8 lg:p-16 relative flex flex-col justify-center bg-white">
                
                <div className="mb-10">
                    <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Welcome Back</h2>
                    <p className="text-slate-500 mt-2 text-sm">Please enter your credentials to access the dashboard.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    
                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Email Address</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                                <input 
                                    name="email" 
                                    type="email"
                                    disabled={loading || success}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3.5 text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all placeholder:text-slate-400 disabled:opacity-50"
                                    placeholder="admin@eduverse.com"
                                    onChange={handleChange}
                                    required 
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                                <input 
                                    name="password" 
                                    type={showPassword ? "text" : "password"} 
                                    disabled={loading || success}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-12 py-3.5 text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all placeholder:text-slate-400 disabled:opacity-50"
                                    placeholder="••••••••"
                                    onChange={handleChange}
                                    required 
                                />
                                <button 
                                    type="button"
                                    disabled={loading || success}
                                    onClick={() => setShowPassword(!showPassword)} 
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition disabled:opacity-50"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                        <label className="flex items-center gap-2 cursor-pointer select-none group">
                            <input type="checkbox" disabled={loading || success} className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-600" />
                            <span className="text-slate-600 group-hover:text-slate-800 transition">Remember me</span>
                        </label>
                        <a href="#" className="text-blue-600 font-bold hover:underline hover:text-blue-700 transition">Forgot password?</a>
                    </div>

                    <AnimatePresence>
                        {error && (
                            <motion.div 
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm font-medium border border-red-200 flex items-center gap-2"
                            >
                                <AlertCircle size={18} /> {error}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* === ACTION BUTTON === */}
                    <button
                        type="submit"
                        disabled={loading || success}
                        className={`w-full font-bold py-3.5 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all duration-300 ${
                            success 
                            ? "bg-emerald-500 hover:bg-emerald-500 scale-[1.02] shadow-emerald-500/30 text-white" 
                            : loading 
                                ? "bg-blue-900 opacity-80 cursor-wait text-white"
                                : "bg-blue-600 hover:bg-blue-700 hover:-translate-y-0.5 hover:shadow-blue-600/20 active:scale-95 text-white"
                        }`}
                    >
                        {loading ? (
                            <div className="flex items-center gap-2">
                                <Loader2 className="animate-spin" size={20} />
                                <span>Verifying Credentials...</span>
                            </div>
                        ) : success ? (
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="animate-bounce" size={20} />
                                <span>Access Granted!</span>
                            </div>
                        ) : (
                            <>
                                Login to Portal <ArrowRight size={18} />
                            </>
                        )}
                    </button>

                    <p className="text-center text-sm text-slate-500 mt-6">
                        Don't have an account? <Link href="/register" className={`text-blue-600 font-bold hover:underline ${loading || success ? 'pointer-events-none opacity-50' : ''}`}>Register Here</Link>
                    </p>

                </form>
            </div>
         </div>
      </div>
    </motion.div>
  );
}