import React, { useEffect, useState } from "react";
import { Search, Video, Trash2, ExternalLink, Shield, AlertTriangle, Clock, Calendar, Download } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

interface Recording {
  filename: string;
  contestantName: string;
  contestantId: string;
  className: string;
  malpracticeCount: number;
  recordedAt: string;
  sizeMB: number;
  malpracticeDetected: boolean;
}

export const Recordings: React.FC = () => {
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchRecordings = async () => {
    try {
      const res = await fetch("/api/proctor/list");
      if (res.ok) {
        const data = await res.json();
        setRecordings(data.recordings || []);
      }
    } catch (err) {
      toast.error("Failed to load recordings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecordings();
  }, []);

  const handleDelete = async (filename: string) => {
    if (!confirm("Delete this recording?")) return;
    try {
      const res = await fetch(`/api/proctor/recording/${filename}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Recording deleted");
        fetchRecordings();
      }
    } catch (err) {
      toast.error("Error deleting recording");
    }
  };

  const filteredRecordings = recordings.filter(r => 
    r.contestantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.contestantId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.className.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
            Proctoring Logs
            <Shield className="text-indigo-500" size={24} />
          </h2>
          <p className="text-slate-500 dark:text-slate-400">Review video evidence and malpractice reports.</p>
        </div>
      </div>

      <Card className="border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <Input 
              placeholder="Search by student name or USN..." 
              className="pl-10 rounded-2xl h-11 bg-slate-50 dark:bg-slate-900"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
          {loading ? (
            [1, 2, 3].map(i => (
              <div key={i} className="h-64 bg-slate-100 dark:bg-slate-800 rounded-3xl animate-pulse" />
            ))
          ) : filteredRecordings.length === 0 ? (
            <div className="col-span-full py-20 text-center text-slate-500">
              <Video className="mx-auto mb-4 opacity-20" size={48} />
              No recordings found.
            </div>
          ) : (
            filteredRecordings.map((r) => (
              <Card key={r.filename} className="border-slate-100 dark:border-slate-800 rounded-3xl overflow-hidden hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 group">
                <div className="aspect-video bg-slate-900 flex items-center justify-center relative">
                  <Video className="text-white/20" size={48} />
                  {r.malpracticeDetected && (
                    <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg shadow-red-500/20 animate-pulse">
                      <AlertTriangle size={12} />
                      {r.malpracticeCount} Events
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 backdrop-blur-[2px]">
                    <Button 
                      className="rounded-full bg-white text-slate-900 hover:bg-slate-100"
                      onClick={() => window.open(`/api/proctor/stream/${r.filename}`, '_blank')}
                    >
                      <ExternalLink size={18} className="mr-2" />
                      Play
                    </Button>
                    <Button 
                      className="rounded-full bg-indigo-500 text-white hover:bg-indigo-600"
                      onClick={() => window.open(`/api/proctor/download/${r.filename}`, '_blank')}
                    >
                      <Download size={18} className="mr-2" />
                      Save
                    </Button>
                    <Button 
                      variant="destructive" 
                      className="rounded-full h-10 w-10 p-0"
                      onClick={() => handleDelete(r.filename)}
                    >
                      <Trash2 size={18} />
                    </Button>
                  </div>
                </div>
                <div className="p-5 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-lg leading-tight">{r.contestantName}</h3>
                      <p className="text-xs text-slate-400 font-mono mt-1 uppercase tracking-wider">{r.contestantId}</p>
                    </div>
                    <span className="bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500 text-[10px] font-extrabold px-2 py-1 rounded-md uppercase tracking-widest border border-indigo-100 dark:border-indigo-500/20">
                      {r.className}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={14} className="text-slate-400" />
                      {new Date(r.recordedAt).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock size={14} className="text-slate-400" />
                      {new Date(r.recordedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </Card>
    </div>
  );
};
