// @ts-nocheck
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "./utils/index";
import { useAuth } from "./lib/AuthContext";
import {
  Home,
  Calendar,
  Pill,
  FileText,
  Users,
  Menu,
  X,
  LogOut,
  User,
  Stethoscope,
  GraduationCap,
  Settings,
  ChevronDown,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "./components/ui/avatar";

export default function Layout({ children, currentPageName }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, isLoadingAuth, logout } = useAuth();

  const role = user?.role?.toUpperCase();

  const isAdmin = role === "ADMIN";
  const isDoctor = role === "DOCTOR";
  const isPatient = role === "PATIENT";

  const displayName =
    user?.full_name ||
    user?.name ||
    user?.email?.split("@")[0] ||
    "User";

  const displayRole = role
    ? role.charAt(0) + role.slice(1).toLowerCase()
    : "Guest";

  const getNavItems = () => {
    const baseItems = [{ name: "Dashboard", icon: Home, page: "Home" }];

    if (isAdmin) {
      return [
        ...baseItems,
        { name: "Manage Doctors", icon: Stethoscope, page: "ManageDoctors" },
        { name: "All Appointments", icon: Calendar, page: "AdminAppointments" },
        { name: "Medicines", icon: Pill, page: "AdminMedicines" },
        { name: "Orders", icon: FileText, page: "AdminOrders" },
        { name: "Health Seminars", icon: GraduationCap, page: "AdminSeminars" },
        { name: "Users", icon: Users, page: "AdminUsers" },
      ];
    }

    if (isDoctor) {
      return [
        ...baseItems,
        { name: "My Appointments", icon: Calendar, page: "DoctorAppointments" },
        { name: "Prescriptions", icon: FileText, page: "DoctorPrescriptions" },
        { name: "Health Seminars", icon: GraduationCap, page: "Seminars" },
        { name: "My Profile", icon: User, page: "DoctorProfile" },
      ];
    }

    return [
      ...baseItems,
      { name: "Find Doctors", icon: Stethoscope, page: "FindDoctors" },
      { name: "My Appointments", icon: Calendar, page: "MyAppointments" },
      { name: "Prescriptions", icon: FileText, page: "MyPrescriptions" },
      { name: "Order Medicines", icon: Pill, page: "OrderMedicines" },
      { name: "My Orders", icon: FileText, page: "MyOrders" },
      { name: "Health Seminars", icon: GraduationCap, page: "Seminars" },
    ];
  };

  const navItems = getNavItems();

  const handleLogout = () => {
    logout();
  };

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-cyan-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-cyan-50">
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50/30">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/60">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-xl bg-teal-50 text-teal-600 hover:bg-teal-100 transition-colors"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <span className="text-xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
              DocLink
            </span>
          </div>
          <Avatar className="h-9 w-9 ring-2 ring-teal-100">
            <AvatarImage src={user?.avatar_url} />
            <AvatarFallback className="bg-teal-100 text-teal-700 font-medium">
              {displayName?.[0]?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 bg-white/95 backdrop-blur-xl border-r border-slate-200/60 transform transition-transform duration-300 ease-out lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-teal-500/25">
                <Stethoscope className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                DocLink
              </span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = currentPageName === item.page;
              return (
                <Link
                  key={item.page}
                  to={createPageUrl(item.page)}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                    isActive
                      ? "bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg shadow-teal-500/25"
                      : "text-slate-600 hover:bg-teal-50 hover:text-teal-700"
                  }`}
                >
                  <item.icon
                    className={`w-5 h-5 ${
                      isActive ? "text-white" : "text-slate-400 group-hover:text-teal-600"
                    }`}
                  />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Section */}
          <div className="p-4 border-t border-slate-100">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                  <Avatar className="h-10 w-10 ring-2 ring-teal-100">
                    <AvatarImage src={user?.avatar_url} />
                    <AvatarFallback className="bg-teal-100 text-teal-700 font-medium">
                      {displayName?.[0]?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-semibold text-slate-800 truncate">
                      {displayName}
                    </p>
                    <p className="text-xs text-slate-500">{displayRole}</p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem asChild>
                      <Link
  to={createPageUrl(
    isAdmin
      ? "AdminProfileSettings"
      : isDoctor
      ? "DoctorProfileSettings"
      : "Profile"
  )}
  className="flex items-center gap-2"
>
  <Settings className="w-4 h-4" />
  Profile Settings
</Link>
                    </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="lg:ml-72 min-h-screen">
        <div className="pt-16 lg:pt-0">{children}</div>
      </main>
    </div>
  );
}