import React, { useEffect, useState } from "react";
import { Search, Plus, Trash2, Layers, Clock, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export const Classes: React.FC = () => {
  const [classes, setClasses] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [newClassName, setNewClassName] = useState("");
  const [editingTime, setEditingTime] = useState<{name: string, time: number} | null>(null);

  const fetchClasses = async () => {
    try {
      const res = await fetch("/api/admin/classes/data");
      if (res.ok) {
        const data = await res.json();
        setClasses(data.classes || []);
      }
    } catch (err) {
      toast.error("Failed to load classes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const handleAddClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim()) return;
    try {
      const res = await fetch("/api/admin/classes/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newClassName.trim() })
      });
      if (res.ok) {
        toast.success("Class added");
        setNewClassName("");
        fetchClasses();
      } else {
        toast.error("Failed to add class");
      }
    } catch (err) {
      toast.error("Error adding class");
    }
  };

  const handleDeleteClass = async (name: string) => {
    if (!confirm(`Are you sure? This will also remove management access for this class from all admins.`)) return;
    try {
      const res = await fetch(`/api/admin/classes/data/${encodeURIComponent(name)}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Class deleted");
        fetchClasses();
      }
    } catch (err) {
      toast.error("Error deleting class");
    }
  };

  const fetchQuizTime = async (name: string) => {
    try {
      const res = await fetch(`/api/admin/classes/${encodeURIComponent(name)}/time`);
      if (res.ok) {
        const data = await res.json();
        setEditingTime({ name, time: data.quizTime });
      }
    } catch (err) {
      toast.error("Failed to fetch quiz time");
    }
  };

  const handleUpdateTime = async () => {
    if (!editingTime) return;
    try {
      const res = await fetch(`/api/admin/classes/${encodeURIComponent(editingTime.name)}/time`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quizTime: editingTime.time })
      });
      if (res.ok) {
        toast.success("Quiz time updated");
        setEditingTime(null);
      } else {
        const data = await res.json();
        toast.error(data.message || "Failed to update time");
      }
    } catch (err) {
      toast.error("Error updating time");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
            Organization
            <ShieldCheck className="text-indigo-500" size={24} />
          </h2>
          <p className="text-slate-500 dark:text-slate-400">Manage classes and global configurations.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-1 border-slate-200 dark:border-slate-800 rounded-3xl p-8 h-fit sticky top-28">
          <CardHeader className="p-0 mb-6">
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <Plus className="text-indigo-500" size={20} />
              Add New Class
            </CardTitle>
          </CardHeader>
          <form onSubmit={handleAddClass} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="className">Class Name</Label>
              <Input 
                id="className" 
                placeholder="e.g. 6th SEM CS-A" 
                value={newClassName}
                onChange={e => setNewClassName(e.target.value)}
                required
                className="rounded-xl h-12 bg-slate-50 dark:bg-slate-900"
              />
            </div>
            <Button type="submit" className="w-full h-12 rounded-xl bg-indigo-500 hover:bg-indigo-600 font-bold shadow-lg shadow-indigo-500/10 transition-all">
              Create Class
            </Button>
          </form>
        </Card>

        <Card className="lg:col-span-2 border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
          <CardHeader className="p-8 border-b border-slate-100 dark:border-slate-800">
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <Layers className="text-indigo-500" size={20} />
              Existing Classes
            </CardTitle>
          </CardHeader>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {loading ? (
              <div className="p-12 text-center animate-pulse">Loading classes...</div>
            ) : classes.length === 0 ? (
              <div className="p-12 text-center text-slate-500">No classes defined yet.</div>
            ) : (
              classes.map((cls) => (
                <div key={cls} className="p-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-500 font-bold">
                      {cls.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-bold text-lg">{cls}</h4>
                      <p className="text-xs text-slate-400">Class Identifier</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="rounded-xl gap-2 border-slate-200 dark:border-slate-800"
                      onClick={() => fetchQuizTime(cls)}
                    >
                      <Clock size={16} />
                      Quiz Time
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-10 w-10 rounded-xl text-slate-300 hover:text-red-500 hover:bg-red-50"
                      onClick={() => handleDeleteClass(cls)}
                    >
                      <Trash2 size={18} />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {editingTime && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <Card className="w-full max-w-md border-slate-200 dark:border-slate-800 rounded-[32px] p-8 shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="flex flex-col items-center text-center mb-8">
              <div className="w-16 h-16 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-500 mb-4">
                <Clock size={32} />
              </div>
              <h3 className="text-2xl font-extrabold tracking-tight">Quiz Time Limit</h3>
              <p className="text-slate-500 dark:text-slate-400 mt-2">Set the duration for {editingTime.name}</p>
            </div>
            
            <div className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="time" className="text-xs font-bold uppercase tracking-widest text-slate-400">Duration (Seconds)</Label>
                <div className="relative">
                  <Input 
                    id="time" 
                    type="number" 
                    value={editingTime.time} 
                    onChange={e => setEditingTime({...editingTime, time: parseInt(e.target.value)})}
                    className="h-14 rounded-2xl text-xl font-bold bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 pl-4"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">
                    {Math.floor(editingTime.time / 60)}m {editingTime.time % 60}s
                  </div>
                </div>
              </div>
              
              <div className="flex gap-4">
                <Button variant="ghost" className="flex-1 rounded-2xl h-12 font-bold" onClick={() => setEditingTime(null)}>
                  Cancel
                </Button>
                <Button className="flex-1 rounded-2xl h-12 bg-indigo-500 hover:bg-indigo-600 font-bold shadow-lg shadow-indigo-500/20" onClick={handleUpdateTime}>
                  Save Changes
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
