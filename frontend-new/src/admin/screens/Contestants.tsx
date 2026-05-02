import React, { useEffect, useState, useRef } from "react";
import { Search, Plus, Trash2, Filter, UserPlus, Download, Upload, FileJson, Pencil, X, Check } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

interface Contestant {
  _id: string;
  name: string;
  usn: string;
  className: string;
  quizCode: string;
  quizPassword?: string;
  createdAt: string;
}

export const Contestants: React.FC = () => {
  const [contestants, setContestants] = useState<Contestant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [classFilter, setClassFilter] = useState("All Classes");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    usn: "",
    className: "",
    quizCode: "",
    quizPassword: ""
  });
  const [classes, setClasses] = useState<string[]>([]);

  const fetchContestants = async () => {
    try {
      const res = await fetch("/api/admin/contestants/data");
      if (res.ok) {
        const data = await res.json();
        setContestants(data.contestants);
      }
    } catch (err) {
      toast.error("Failed to load contestants");
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      const res = await fetch("/api/admin/classes/data");
      if (res.ok) {
        const data = await res.json();
        setClasses(data.classes);
      }
    } catch (err) {
      console.error("Failed to fetch classes");
    }
  };

  useEffect(() => {
    fetchContestants();
    fetchClasses();
  }, []);

  const handleAddContestant = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingId ? `/api/admin/contestants/${editingId}` : "/api/admin/contestants";
      const method = editingId ? "PUT" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        toast.success(editingId ? "Updated successfully" : "Added successfully");
        setShowAddForm(false);
        setEditingId(null);
        setFormData({ name: "", usn: "", className: "", quizCode: "", quizPassword: "" });
        fetchContestants();
      } else {
        const data = await res.json();
        toast.error(data.message || "Operation failed");
      }
    } catch (err) {
      toast.error("Network error");
    }
  };

  const handleEdit = (c: Contestant) => {
    setEditingId(c._id);
    setFormData({
      name: c.name,
      usn: c.usn,
      className: c.className,
      quizCode: c.quizCode,
      quizPassword: c.quizPassword || ""
    });
    setShowAddForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this contestant?")) return;
    try {
      const res = await fetch(`/api/admin/contestants/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Contestant deleted");
        fetchContestants();
      } else {
        toast.error("Failed to delete");
      }
    } catch (err) {
      toast.error("Error deleting contestant");
    }
  };

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(contestants, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `contestants_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        const res = await fetch("/api/admin/contestants", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contestants: Array.isArray(json) ? json : [json] })
        });
        if (res.ok) {
          toast.success("Import successful");
          fetchContestants();
        } else {
          toast.error("Import failed");
        }
      } catch (err) {
        toast.error("Invalid JSON file");
      }
    };
    reader.readAsText(file);
  };

  const filteredContestants = contestants.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         c.usn.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = classFilter === "All Classes" || c.className === classFilter;
    return matchesSearch && matchesClass;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-3xl font-extrabold tracking-tight">Contestants</h2>
          <p className="text-slate-500 dark:text-slate-400">Manage students registered for quizzes.</p>
        </div>
        <div className="flex items-center gap-3">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImportJSON} 
            className="hidden" 
            accept=".json" 
          />
          <Button 
            variant="outline" 
            onClick={() => fileInputRef.current?.click()}
            className="rounded-2xl gap-2 border-slate-200 dark:border-slate-800"
          >
            <Download size={18} />
            Import JSON
          </Button>
          <Button 
            variant="outline" 
            onClick={handleExportJSON}
            className="rounded-2xl gap-2 border-slate-200 dark:border-slate-800"
          >
            <Upload size={18} />
            Export JSON
          </Button>
          <Button 
            onClick={() => {
              if (showAddForm) {
                setEditingId(null);
                setFormData({ name: "", usn: "", className: "", quizCode: "", quizPassword: "" });
              }
              setShowAddForm(!showAddForm);
            }}
            className={`rounded-2xl gap-2 shadow-lg transition-all duration-300 ${
              showAddForm 
                ? "bg-slate-200 text-slate-900 hover:bg-slate-300 dark:bg-slate-800 dark:text-white" 
                : "bg-indigo-500 text-white hover:bg-indigo-600 shadow-indigo-500/20"
            }`}
          >
            {showAddForm ? <Plus className="rotate-45" size={18} /> : <UserPlus size={18} />}
            {showAddForm ? "Cancel" : "Add Student"}
          </Button>
        </div>
      </div>

      {showAddForm && (
        <Card className="border-indigo-500/20 dark:border-indigo-500/30 bg-indigo-500/[0.02] rounded-3xl p-8 animate-in slide-in-from-top duration-300">
          <form onSubmit={handleAddContestant} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input 
                id="name" 
                placeholder="John Doe" 
                value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})} 
                required 
                className="rounded-xl border-slate-200 dark:border-slate-800"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="usn">USN</Label>
              <Input 
                id="usn" 
                placeholder="1MS21CS001" 
                value={formData.usn} 
                onChange={e => setFormData({...formData, usn: e.target.value})} 
                required 
                className="rounded-xl border-slate-200 dark:border-slate-800"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="className">Class</Label>
              <select 
                id="className"
                value={formData.className}
                onChange={e => setFormData({...formData, className: e.target.value})}
                required
                className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none"
              >
                <option value="">Select Class</option>
                {classes.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="quizCode">Quiz Code</Label>
              <Input 
                id="quizCode" 
                placeholder="QUIZ101" 
                value={formData.quizCode} 
                onChange={e => setFormData({...formData, quizCode: e.target.value})} 
                required 
                className="rounded-xl border-slate-200 dark:border-slate-800"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quizPassword">Quiz Password</Label>
              <Input 
                id="quizPassword" 
                type="text"
                placeholder="••••••••" 
                value={formData.quizPassword} 
                onChange={e => setFormData({...formData, quizPassword: e.target.value})} 
                required 
                className="rounded-xl border-slate-200 dark:border-slate-800"
              />
            </div>
            <div className="flex items-end">
              <Button type="submit" className="w-full rounded-xl bg-indigo-500 hover:bg-indigo-600 h-10 shadow-lg shadow-indigo-500/10">
                {editingId ? "Update Student" : "Register Student"}
              </Button>
            </div>
          </form>
        </Card>
      )}

      <Card className="border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <Input 
              placeholder="Search by name or USN..." 
              className="pl-10 rounded-2xl border-slate-200 dark:border-slate-800 h-11 bg-slate-50 dark:bg-slate-900"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-slate-400" />
            <select 
              value={classFilter}
              onChange={e => setClassFilter(e.target.value)}
              className="h-11 px-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-sm outline-none"
            >
              <option value="All Classes">All Classes</option>
              {classes.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/50">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">USN</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Class</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Quiz Code</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Joined</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                [1, 2, 3].map(i => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={6} className="px-6 py-8 h-20 bg-slate-50/20 dark:bg-slate-800/10" />
                  </tr>
                ))
              ) : filteredContestants.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    No contestants found matching your selection.
                  </td>
                </tr>
              ) : (
                filteredContestants.map((c) => (
                  <tr key={c._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4 font-semibold">{c.name}</td>
                    <td className="px-6 py-4">
                      <span className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-xs font-mono">
                        {c.usn}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500">{c.className}</td>
                    <td className="px-6 py-4">
                      <span className="text-indigo-500 font-bold">{c.quizCode}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 rounded-lg text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/10"
                          onClick={() => handleEdit(c)}
                        >
                          <Pencil size={16} />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
                          onClick={() => handleDelete(c._id)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
