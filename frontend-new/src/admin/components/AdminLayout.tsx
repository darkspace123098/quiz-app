import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  Users, 
  HelpCircle, 
  Award, 
  Video, 
  Layers, 
  LogOut, 
  Menu, 
  X,
  Moon,
  Sun,
  Plus
} from "lucide-react";
import { useAdmin } from "../context/AdminContext";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick?: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, label, active, onClick }) => (
  <Link
    to={to}
    onClick={onClick}
    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium ${
      active 
        ? "bg-indigo-500/10 text-indigo-500 dark:text-indigo-400" 
        : "text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
    }`}
  >
    {icon}
    <span>{label}</span>
    {active && <div className="absolute left-0 w-1 h-6 bg-indigo-500 rounded-r-full" />}
  </Link>
);

export const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { admin, logout } = useAdmin();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const navItems = [
    { to: "/admin/overview", icon: <LayoutDashboard size={20} />, label: "Overview" },
    { to: "/admin/contestants", icon: <Users size={20} />, label: "Contestants" },
    { to: "/admin/questions", icon: <HelpCircle size={20} />, label: "Questions" },
    { to: "/admin/results", icon: <Award size={20} />, label: "Results" },
    { to: "/admin/recordings", icon: <Video size={20} />, label: "Recordings" },
  ];

  if (admin?.role === "superadmin") {
    navItems.push({ to: "/admin/classes", icon: <Layers size={20} />, label: "Classes" });
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] text-slate-900 dark:text-slate-100 flex">
      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-[#1e293b] border-r border-slate-200 dark:border-slate-800 
        transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <div className="h-full flex flex-col">
          {/* Sidebar Header */}
          <div className="p-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="IntelliQuiz Logo" className="h-10 w-auto object-contain drop-shadow-md" />
              <span className="font-bold text-xl tracking-tight">Admin Panel</span>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="lg:hidden -mr-4 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100" 
              onClick={() => setIsSidebarOpen(false)}
            >
              <X size={20} />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 space-y-1">
            {navItems.map((item) => (
              <NavItem
                key={item.to}
                to={item.to}
                icon={item.icon}
                label={item.label}
                active={location.pathname === item.to}
                onClick={() => setIsSidebarOpen(false)}
              />
            ))}
          </nav>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-800">
            <Button 
              variant="destructive" 
              className="w-full justify-start gap-3 rounded-xl py-6"
              onClick={logout}
            >
              <LogOut size={20} />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-20 bg-white/80 dark:bg-[#1e293b]/80 backdrop-blur-xl border-bottom border-slate-200 dark:border-slate-800 sticky top-0 z-30 flex items-center justify-between px-4 lg:px-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={toggleSidebar}>
              <Menu size={24} />
            </Button>
            <h1 className="text-lg font-bold lg:text-xl capitalize">
              {location.pathname.split("/").pop()}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            <div className="hidden sm:flex flex-col items-end mr-2">
              <span className="text-sm font-semibold">{admin?.username}</span>
              <span className="text-xs text-slate-500 capitalize">{admin?.role}</span>
            </div>
            {admin?.role === "superadmin" && (
              <Button 
                onClick={() => navigate("/admin/add")}
                className="gap-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 shadow-lg shadow-indigo-500/20"
              >
                <Plus size={18} />
                <span className="hidden sm:inline">Add Admin</span>
              </Button>
            )}
          </div>
        </header>

        {/* Content Area */}
        <main className="p-4 lg:p-8 flex-1">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
