import Link from "next/link";
import { Button } from "@/components/ui/button";
import { GraduationCap, LogIn } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="fixed top-0 w-full z-50 border-b border-white/10 bg-slate-900/80 backdrop-blur-md">
      <div className="container mx-auto flex h-20 items-center justify-between px-6">
        {/* Logo Section */}
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-2 rounded-lg text-white">
            <GraduationCap size={24} />
          </div>
          <Link href="/" className="text-2xl font-bold text-white tracking-wide font-sans">
            Edu<span className="text-blue-400">verse</span>
          </Link>
        </div>

        {/* Main Navigation */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-300">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <Link href="/courses" className="hover:text-white transition-colors">Academic Programs</Link>
          <Link href="/about" className="hover:text-white transition-colors">About Us</Link>
          <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
        </div>

        {/* Login Action (Direct Access) */}
        <div className="flex items-center gap-4">
          <Link href="/login">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white border-0 rounded-full px-6 flex items-center gap-2 transition-all shadow-lg shadow-blue-900/20">
              <LogIn className="w-4 h-4" /> Portal Login
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}