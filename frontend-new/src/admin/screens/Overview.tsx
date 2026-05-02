import React, { useEffect, useState } from "react";
import { Users, HelpCircle, Award, Layers, TrendingUp, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiFetch } from "@/lib/api";

interface StatsData {
  totalClasses: number;
  totalContestants: number;
  totalQuestions: number;
  totalResults: number;
}

const StatCard: React.FC<{ 
  title: string; 
  value: number; 
  icon: React.ElementType; 
  color: string;
  gradient: string;
  trend?: string;
}> = ({ title, value, icon: Icon, color, gradient, trend }) => (
  <Card className="group relative border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-500 rounded-[2.5rem] overflow-hidden bg-white dark:bg-[#1e293b]">
    {/* Background Decorative Icon */}
    <div className="absolute -right-4 -bottom-4 opacity-[0.03] dark:opacity-[0.05] transition-transform duration-700 group-hover:scale-110 group-hover:-rotate-12">
      <Icon size={160} strokeWidth={1} />
    </div>
    
    <CardContent className="p-8 relative z-10">
      <div className="flex items-center justify-between mb-8">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br ${gradient} shadow-lg shadow-indigo-500/20 transition-transform duration-500 group-hover:rotate-6`}>
          <Icon className="text-white" size={28} />
        </div>
        {trend && (
          <div className="flex items-center gap-1.5 text-emerald-500 font-bold text-xs bg-emerald-500/10 px-4 py-1.5 rounded-full backdrop-blur-sm border border-emerald-500/10">
            <TrendingUp size={14} />
            {trend}
          </div>
        )}
      </div>
      <div>
        <p className="text-xs font-bold text-slate-400 dark:text-slate-500 mb-2 uppercase tracking-[0.2em]">
          {title}
        </p>
        <div className="flex items-baseline gap-2">
          <h3 className="text-5xl font-black tracking-tighter text-slate-900 dark:text-white">
            {value}
          </h3>
          <span className="text-slate-400 font-medium text-sm">Units</span>
        </div>
      </div>
    </CardContent>
  </Card>
);

export const Overview: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await apiFetch("/api/admin/data");
        if (res.ok) {
          const result = await res.json();
          setStats(result.data);
        } else {
          toast.error("Failed to fetch stats");
        }
      } catch (err) {
        toast.error("Error connecting to server");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-48 bg-slate-100 dark:bg-slate-800 rounded-3xl" />
        ))}
      </div>
    );
  }

    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="flex flex-col gap-2">
          <h2 className="text-3xl font-extrabold tracking-tight">Dashboard Overview</h2>
          <p className="text-slate-500 dark:text-slate-400">Welcome back! Here's what's happening with your quizzes.</p>
        </div>
  
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Classes"
            value={stats?.totalClasses || 0}
            icon={Layers}
            color="indigo"
            gradient="from-indigo-500 to-indigo-600"
            trend="+2 this week"
          />
          <StatCard
            title="Contestants"
            value={stats?.totalContestants || 0}
            icon={Users}
            color="blue"
            gradient="from-blue-500 to-blue-600"
            trend="+12% total"
          />
          <StatCard
            title="Questions"
            value={stats?.totalQuestions || 0}
            icon={HelpCircle}
            color="purple"
            gradient="from-purple-500 to-purple-600"
          />
          <StatCard
            title="Results"
            value={stats?.totalResults || 0}
            icon={Award}
            color="emerald"
            gradient="from-emerald-500 to-emerald-600"
            trend="+5 new"
          />
        </div>
  
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Placeholder for future charts or recent activity */}
          <Card className="border-slate-200 dark:border-slate-800 rounded-3xl p-8 bg-gradient-to-br from-indigo-500/5 to-purple-500/5">
            <CardHeader className="p-0 mb-6">
              <CardTitle className="text-xl font-bold">System Health</CardTitle>
            </CardHeader>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-100 dark:border-slate-800">
                <span className="font-medium">Database Connection</span>
                <span className="text-emerald-500 font-bold flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  Active
                </span>
              </div>
              <div className="flex items-center justify-between p-4 bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-100 dark:border-slate-800">
                <span className="font-medium">API Server</span>
                <span className="text-emerald-500 font-bold flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  Operational
                </span>
              </div>
              <div className="flex items-center justify-between p-4 bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-100 dark:border-slate-800">
                <span className="font-medium">Storage Service</span>
                <span className="text-emerald-500 font-bold flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  Connected
                </span>
              </div>
            </div>
          </Card>
  
          <Card className="border-slate-200 dark:border-slate-800 rounded-3xl p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Award size={120} className="text-indigo-500" />
            </div>
            <CardHeader className="p-0 mb-6">
              <CardTitle className="text-xl font-bold">Quick Actions</CardTitle>
            </CardHeader>
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => navigate("/admin/questions")}
                className="p-6 text-left rounded-3xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 hover:scale-[1.02] transition-all group"
              >
                <Plus className="text-indigo-500 mb-4 transition-transform group-hover:rotate-90" size={24} />
                <div className="font-bold">New Quiz</div>
                <div className="text-xs text-slate-500 mt-1">Add questions & code</div>
              </button>
              <button 
                onClick={() => navigate("/admin/contestants")}
                className="p-6 text-left rounded-3xl bg-purple-50 dark:bg-purple-500/10 border border-purple-100 dark:border-purple-500/20 hover:scale-[1.02] transition-all group"
              >
                <Users className="text-purple-500 mb-4 transition-transform group-hover:translate-x-1" size={24} />
                <div className="font-bold">Add Student</div>
                <div className="text-xs text-slate-500 mt-1">Register new usn</div>
              </button>
            </div>
          </Card>
        </div>
      </div>
    );
};
