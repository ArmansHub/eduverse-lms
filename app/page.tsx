"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { 
  School, 
  MonitorPlay, 
  BookOpen, 
  Users, 
  ShieldCheck, 
  MapPin,
  Phone,
  Mail,
  CheckCircle2,
  PlayCircle
} from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen relative font-sans bg-slate-950 text-slate-200 overflow-x-hidden selection:bg-blue-500/30">
      
      {/* --- BACKGROUND AMBIENCE (Subtle & Professional) --- */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-900/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-900/10 rounded-full blur-[100px]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>
      </div>

      {/* --- 1. NAVBAR --- */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-slate-950/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="bg-blue-600 p-2 rounded-lg">
              <School className="text-white h-5 w-5" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">EduVerse</span>
          </Link>

          {/* Menu */}
          <div className="flex items-center gap-8">
            <div className="hidden md:flex gap-8 text-sm font-medium text-slate-400">
              <a href="#features" className="hover:text-white transition-colors">Features</a>
              <a href="#about" className="hover:text-white transition-colors">About</a>
              <a href="#contact" className="hover:text-white transition-colors">Contact</a>
            </div>
            <Link href="/login" className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg font-medium text-sm transition-all shadow-lg shadow-blue-900/20">
              Portal Login
            </Link>
          </div>
        </div>
      </nav>

      {/* --- 2. HERO SECTION (Revised: Professional & Direct) --- */}
      <section className="relative z-10 pt-32 pb-20 px-6 min-h-[90vh] flex items-center">
        <div className="container mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* LEFT: Direct Platform Messaging */}
          <div className="space-y-6 text-center lg:text-left order-2 lg:order-1">
            
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded border border-blue-500/30 bg-blue-500/10 text-blue-400 text-xs font-bold tracking-wide uppercase w-fit mx-auto lg:mx-0"
            >
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
              New Session Open
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-[1.15]"
            >
              Complete Digital <br/>
              <span className="text-blue-500">Campus Solution</span> for Modern Education.
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg text-slate-400 leading-relaxed max-w-xl mx-auto lg:mx-0"
            >
              Streamline your academic journey with EduVerse. Manage assignments, check results, and access the library—all from one secure dashboard.
            </motion.p>

            {/* Feature List (Instead of generic buttons) */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col gap-3 py-4 max-w-md mx-auto lg:mx-0"
            >
              <div className="flex items-center gap-3 text-slate-300">
                <CheckCircle2 className="text-blue-500 w-5 h-5" />
                <span>Instant Exam Results & Gradebooks</span>
              </div>
              <div className="flex items-center gap-3 text-slate-300">
                <CheckCircle2 className="text-blue-500 w-5 h-5" />
                <span>24/7 Digital Library Access</span>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-2"
            >
              <Link href="/register" className="h-12 px-8 flex items-center justify-center bg-white text-slate-950 hover:bg-slate-200 rounded-lg font-bold transition-all">
                Register as Student
              </Link>
              <a href="#about" className="h-12 px-8 flex items-center justify-center border border-white/20 hover:bg-white/5 text-white rounded-lg font-medium transition-all">
                How it Works
              </a>
            </motion.div>
          </div>

          {/* RIGHT: Clean, Professional Image Blend */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="relative order-1 lg:order-2 h-[400px] lg:h-[600px] w-full"
          >
             {/* The Image Container with Gradient Mask */}
             <div className="absolute inset-0 rounded-2xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-l from-transparent via-slate-950/20 to-slate-950 z-10"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-950 z-10"></div>
                <img 
                  src="https://images.unsplash.com/photo-1531545514256-b1400bc00f31?q=80&w=2574&auto=format&fit=crop" 
                  alt="Student using digital platform" 
                  className="w-full h-full object-cover object-center opacity-80"
                />
             </div>

          </motion.div>

        </div>
      </section>

      {/* --- 3. FEATURES (Grid) --- */}
      <section id="features" className="relative z-10 py-24 bg-slate-900/50 border-t border-white/5">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">Why Choose EduVerse?</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">Built for students, trusted by institutions.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureBox 
              icon={<MonitorPlay />} 
              title="Interactive Live Classes" 
              desc="Join classes from anywhere. Raise your hand, ask questions, and engage in real-time."
            />
             <FeatureBox 
              icon={<BookOpen />} 
              title="Comprehensive Library" 
              desc="Access course materials, recorded lectures, and research papers 24/7."
            />
             <FeatureBox 
              icon={<ShieldCheck />} 
              title="Secure Assessment" 
              desc="Take exams and quizzes in a secure, proctored digital environment."
            />
          </div>
        </div>
      </section>

      {/* --- 4. ABOUT SECTION --- */}
      <section id="about" className="relative z-10 py-24 bg-slate-950">
        <div className="container mx-auto px-6 max-w-7xl">
            <div className="flex flex-col lg:flex-row items-center gap-16">
                <div className="w-full lg:w-1/2">
                    <img 
                        src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=2070&auto=format&fit=crop" 
                        alt="Campus Life" 
                        className="rounded-xl shadow-2xl border border-white/10 opacity-90"
                    />
                </div>
                
                <div className="w-full lg:w-1/2">
                    <h2 className="text-blue-500 font-bold tracking-wider uppercase text-sm mb-2">Our Vision</h2>
                    <h3 className="text-3xl font-bold text-white mb-6">Bridging the Gap Between <br/>Classroom & Cloud</h3>
                    <p className="text-slate-400 text-lg leading-relaxed mb-6">
                       EduVerse isn't just a website; it's a fully integrated digital campus. We help institutions move forward by providing tools that make learning accessible, trackable, and engaging.
                    </p>
                    <div className="flex gap-8 border-t border-white/10 pt-6">
                        <div>
                            <h4 className="text-3xl font-bold text-white">5</h4>
                            <p className="text-sm text-slate-500">Departments</p>
                        </div>
                        <div>
                            <h4 className="text-3xl font-bold text-white">2k+</h4>
                            <p className="text-sm text-slate-500">Active Students</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* --- 5. FOOTER --- */}
      <footer id="contact" className="relative z-10 bg-black pt-20 pb-10 border-t border-white/10">
        <div className="container mx-auto px-6 max-w-7xl">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                
                <div className="col-span-1 md:col-span-2 space-y-4">
                    <div className="flex items-center gap-2 text-white">
                        <School className="text-blue-500" size={24} />
                        <span className="text-xl font-bold">EduVerse</span>
                    </div>
                    <p className="text-slate-500 text-sm leading-relaxed max-w-sm">
                        Empowering education through innovation. Join us in building the future of learning.
                    </p>
                </div>

                <div>
                    <h3 className="text-white font-bold mb-6 uppercase tracking-wider text-sm">Contact</h3>
                    <ul className="space-y-4 text-slate-400 text-sm">
                        <li className="flex items-start gap-3">
                            <MapPin size={18} className="text-blue-500 mt-0.5" />
                            <span>123 Education Lane, Dhaka, BD</span>
                        </li>
                        <li className="flex items-center gap-3">
                            <Phone size={18} className="text-blue-500" />
                            <span>+880 1712 345 678</span>
                        </li>
                        <li className="flex items-center gap-3">
                            <Mail size={18} className="text-blue-500" />
                            <span>info@eduverse.com</span>
                        </li>
                    </ul>
                </div>

                <div>
                    <h3 className="text-white font-bold mb-6 uppercase tracking-wider text-sm">Links</h3>
                    <ul className="space-y-3 text-slate-400 text-sm">
                        <li><a href="#features" className="hover:text-blue-400 transition">Features</a></li>
                        <li><a href="#about" className="hover:text-blue-400 transition">About Us</a></li>
                        <li><Link href="/login" className="hover:text-blue-400 transition">Portal Login</Link></li>
                    </ul>
                </div>
            </div>

            <div className="border-t border-white/10 pt-8 text-center text-slate-600 text-xs">
                &copy; 2024 EduVerse Academy. All rights reserved.
            </div>
        </div>
      </footer>

    </main>
  );
}

// Helper Component
function FeatureBox({ icon, title, desc }: { icon: any, title: string, desc: string }) {
  return (
    <div className="group p-8 rounded-xl bg-slate-900 border border-white/5 hover:border-blue-500/30 transition-all duration-300 hover:bg-slate-800">
      <div className="mb-4 text-slate-400 group-hover:text-blue-400 transition-colors">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-white mb-3">{title}</h3>
      <p className="text-slate-400 leading-relaxed text-sm">
        {desc}
      </p>
    </div>
  )
}