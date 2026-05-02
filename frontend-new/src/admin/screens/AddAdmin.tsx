import React, { useEffect, useState } from "react";
import { UserPlus, Shield, Check, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

export const AddAdmin: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [availableClasses, setAvailableClasses] = useState<string[]>([]);
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await fetch("/api/admin/classes/data");
        if (res.ok) {
          const data = await res.json();
          setAvailableClasses(data.classes || []);
        }
      } catch (err) {
        console.error("Failed to load classes");
      }
    };
    fetchClasses();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedClasses.length === 0) {
      toast.error("Please select at least one class for the admin to manage.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/admin/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, classes: selectedClasses })
      });

      if (res.ok) {
        toast.success("New administrator added successfully!");
        setUsername("");
        setPassword("");
        setSelectedClasses([]);
      } else {
        const data = await res.json();
        toast.error(data.message || "Failed to add administrator");
      }
    } catch (err) {
      toast.error("Error connecting to server");
    } finally {
      setLoading(false);
    }
  };

  const toggleClass = (cls: string) => {
    setSelectedClasses(prev => 
      prev.includes(cls) ? prev.filter(c => c !== cls) : [...prev, cls]
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <div className="p-4 bg-indigo-500/10 rounded-2xl text-indigo-500">
          <Shield size={32} />
        </div>
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight">Access Management</h2>
          <p className="text-slate-500 dark:text-slate-400">Delegate administrative privileges for specific classes.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
        <Card className="md:col-span-3 border-slate-200 dark:border-slate-800 rounded-[32px] p-8 shadow-sm">
          <CardHeader className="p-0 mb-8">
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <UserPlus className="text-indigo-500" size={20} />
              Administrator Credentials
            </CardTitle>
          </CardHeader>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username">Login Username</Label>
              <Input 
                id="username" 
                placeholder="e.g. cs_admin_01" 
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
                className="h-12 rounded-xl bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Temporary Password</Label>
              <Input 
                id="password" 
                type="password"
                placeholder="••••••••" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="h-12 rounded-xl bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800"
              />
            </div>

            <div className="pt-4">
              <Button 
                type="submit" 
                disabled={loading}
                className="w-full h-12 rounded-xl bg-indigo-500 hover:bg-indigo-600 font-bold shadow-lg shadow-indigo-500/20 transition-all active:scale-[0.98]"
              >
                {loading ? "Creating account..." : "Authorize Administrator"}
              </Button>
            </div>
          </form>
        </Card>

        <Card className="md:col-span-2 border-slate-200 dark:border-slate-800 rounded-[32px] p-8 bg-slate-50/50 dark:bg-slate-900/50">
          <CardHeader className="p-0 mb-6">
            <CardTitle className="text-lg font-bold">Class Assignment</CardTitle>
            <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest font-bold">Select Managed Classes</p>
          </CardHeader>
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin">
            {availableClasses.length === 0 ? (
              <p className="text-sm text-slate-400 italic py-4">No classes available. Create a class first.</p>
            ) : (
              availableClasses.map(cls => (
                <div 
                  key={cls} 
                  className={`flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all border ${
                    selectedClasses.includes(cls) 
                      ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-600 dark:text-indigo-400 font-bold" 
                      : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-indigo-200"
                  }`}
                  onClick={() => toggleClass(cls)}
                >
                  <span className="text-sm">{cls}</span>
                  {selectedClasses.includes(cls) ? (
                    <div className="w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center text-white">
                      <Check size={12} />
                    </div>
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-slate-200 dark:border-slate-700" />
                  )}
                </div>
              ))
            )}
          </div>
          {selectedClasses.length > 0 && (
            <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-tight">Selected</span>
              <span className="text-sm font-black text-indigo-500 bg-indigo-500/10 px-3 py-1 rounded-full">
                {selectedClasses.length}
              </span>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
