import { useState, useContext } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import {
  Users,
  BookOpen,
  CheckSquare,
  IdCard,
  LogOut,
  Menu,
  X,
  LayoutDashboard,
  GraduationCap,
  UserCheck,
  FileText,
} from "lucide-react";
import { AuthContext } from "../context/AuthContext";

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const allNavItems = [
    {
      path: "/",
      label: "ផ្ទាំងគ្រប់គ្រង",
      icon: LayoutDashboard,
      roles: ["admin", "teacher"],
    },
    {
      path: "/attendance",
      label: "ស្រង់វត្តមាន",
      icon: CheckSquare,
      roles: ["admin", "teacher"],
    },
    {
      path: "/attendance-report",
      label: "របាយការណ៍វត្តមាន",
      icon: FileText,
      roles: ["admin", "teacher"],
    },
    {
      path: "/classes",
      label: "គ្រប់គ្រងថ្នាក់រៀន",
      icon: BookOpen,
      roles: ["admin"],
    },
    {
      path: "/students",
      label: "គ្រប់គ្រងសិស្ស",
      icon: Users,
      roles: ["admin"],
    },
    {
      path: "/users",
      label: "គ្រប់គ្រងបុគ្គលិក",
      icon: UserCheck,
      roles: ["admin"],
    },
    {
      path: "/id-cards",
      label: "បោះពុម្ពកាតសិស្ស",
      icon: IdCard,
      roles: ["admin"],
    },
  ];

  const navItems = allNavItems.filter((item) =>
    item.roles.includes(user?.role),
  );

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    // 1. បន្ថែម h-screen និង overflow-hidden លើ Root Div
    <div className="h-screen w-screen bg-slate-50 flex overflow-hidden">
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Responsive Fixed Sidebar */}
      <aside
        className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 h-full bg-slate-900 text-slate-300 flex flex-col justify-between shrink-0
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}
      >
        <div className="flex flex-col h-full justify-between">
          <div>
            {/* Header Sidebar */}
            <div className="h-16 flex items-center justify-between px-6 bg-slate-950/50 border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-600 text-white rounded-lg">
                  <GraduationCap size={20} />
                </div>
                <span className="font-bold text-white text-base">
                  គ្រប់គ្រងសាលា
                </span>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            {/* Nav Items (រៀបចំឱ្យ Scroll ដាច់ដោយឡែកប្រសិនបើ Menu ច្រើន) */}
            <nav className="p-4 space-y-1.5 overflow-y-auto max-h-[calc(100vh-8rem)]">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={({ isActive }) => `
                      flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors
                      ${
                        isActive
                          ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                          : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                      }
                    `}
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>

          {/* User Footer Sidebar */}
          <div className="p-4 border-t border-slate-800 bg-slate-950/30 shrink-0">
            <div className="flex items-center justify-between">
              <div className="truncate pr-2">
                <p className="text-sm font-medium text-white truncate">
                  {user?.name}
                </p>
                <p className="text-xs text-slate-500 capitalize">
                  {user?.role}
                </p>
              </div>
              <button
                onClick={handleLogout}
                title="ចាកចេញ"
                className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors cursor-pointer"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl lg:hidden"
          >
            <Menu size={22} />
          </button>
          <div className="text-xs sm:text-sm font-medium text-slate-500 ml-auto">
            កាលបរិច្ឆេទ៖{" "}
            {new Date().toLocaleDateString("km-KH", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
        </header>

        {/* Dynamic Page Content (Scroll តែផ្នែកមួយនេះ) */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
