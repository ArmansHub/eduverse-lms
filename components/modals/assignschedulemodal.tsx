"use client";
import { useState } from "react";
import { X, Calendar, Clock, MapPin, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";

interface AssignScheduleModalProps {
    onClose: () => void;
    users: any[];
    subjects: any[];
}

export default function AssignScheduleModal({ onClose, users, subjects }: AssignScheduleModalProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        teacherId: "",
        subjectId: "",
        dayOfWeek: "MONDAY",
        startTime: "",
        endTime: "",
        roomNumber: ""
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch("/api/admin/schedule", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            if (res.ok) {
                toast.success("Schedule assigned successfully!");
                onClose();
            } else {
                toast.error("Failed to assign schedule");
            }
        } catch (error) {
            toast.error("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    const teachers = users.filter(u => u.role === "TEACHER");

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Calendar className="text-blue-600" /> Assign Schedule
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase">Select Teacher</label>
                        <select 
                            required
                            className="w-full border rounded-lg px-3 py-2 text-sm mt-1 focus:ring-2 focus:ring-blue-500 outline-none"
                            value={formData.teacherId}
                            onChange={(e) => setFormData({...formData, teacherId: e.target.value})}
                        >
                            <option value="">Choose a teacher</option>
                            {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase">Select Subject</label>
                        <select 
                            required
                            className="w-full border rounded-lg px-3 py-2 text-sm mt-1 focus:ring-2 focus:ring-blue-500 outline-none"
                            value={formData.subjectId}
                            onChange={(e) => setFormData({...formData, subjectId: e.target.value})}
                        >
                            <option value="">Choose a subject</option>
                            {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase text-[10px]">Start Time</label>
                            <input 
                                type="time" required
                                className="w-full border rounded-lg px-3 py-2 text-sm mt-1 focus:ring-2 focus:ring-blue-500 outline-none"
                                onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase text-[10px]">End Time</label>
                            <input 
                                type="time" required
                                className="w-full border rounded-lg px-3 py-2 text-sm mt-1 focus:ring-2 focus:ring-blue-500 outline-none"
                                onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                            />
                        </div>
                    </div>

                    <button 
                        disabled={loading}
                        type="submit" 
                        className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition flex justify-center items-center gap-2 mt-4"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : "Save Schedule"}
                    </button>
                </form>
            </div>
        </div>
    );
}