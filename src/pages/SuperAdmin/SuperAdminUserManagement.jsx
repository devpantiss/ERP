import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users, Search, Plus, Shield, GraduationCap, Briefcase, UserCog,
  MoreVertical, Mail, Phone, Building2, Calendar, CheckCircle2, XCircle
} from "lucide-react";

/* ===================== SHARED USER DATA ===================== */

export const ALL_USERS = [
  { id: "PSU-ADM-001", name: "Rajesh Kumar", role: "Admin", center: "Angul", email: "rajesh@psu.edu", phone: "+91 98765 43210", status: "Active", joinDate: "2024-06-15", projects: ["DDU-GKY Phase IV", "PMKVY 4.0"], department: "Operations" },
  { id: "PSU-ADM-002", name: "Suman Mishra", role: "Admin", center: "Keonjhar", email: "suman@psu.edu", phone: "+91 98765 43211", status: "Active", joinDate: "2024-08-20", projects: ["CSR Skill Program"], department: "Training" },
  { id: "PSU-ADM-003", name: "Anita Patel", role: "Admin", center: "Jharsuguda", email: "anita@psu.edu", phone: "+91 98765 43212", status: "Active", joinDate: "2025-01-10", projects: ["State Skill Mission"], department: "Placement" },
  { id: "PSU-TRN-001", name: "Amit Panda", role: "Trainer", center: "Keonjhar", email: "amit@psu.edu", phone: "+91 98765 43220", status: "Active", joinDate: "2024-07-01", batches: ["B-01", "B-02", "B-05", "B-08"], department: "IT/ITES" },
  { id: "PSU-TRN-002", name: "Suman Das", role: "Trainer", center: "Angul", email: "suman.d@psu.edu", phone: "+91 98765 43221", status: "Active", joinDate: "2024-09-15", batches: ["B-03", "B-04", "B-06"], department: "Healthcare" },
  { id: "PSU-TRN-003", name: "Ritu Mohapatra", role: "Trainer", center: "Sundargarh", email: "ritu@psu.edu", phone: "+91 98765 43222", status: "Active", joinDate: "2025-02-01", batches: ["B-07", "B-09"], department: "Manufacturing" },
  { id: "PSU-TRN-004", name: "Deepak Sahu", role: "Trainer", center: "Jharsuguda", email: "deepak@psu.edu", phone: "+91 98765 43223", status: "On Leave", joinDate: "2024-11-20", batches: ["B-02", "B-10"], department: "Construction" },
  { id: "PSU-MOB-001", name: "Priya Sahu", role: "Mobilizer", center: "Sundargarh", email: "priya@psu.edu", phone: "+91 98765 43230", status: "Active", joinDate: "2024-08-10", candidates: 280, department: "Community" },
  { id: "PSU-MOB-002", name: "Deepak Das", role: "Mobilizer", center: "Kalahandi", email: "deepak.d@psu.edu", phone: "+91 98765 43231", status: "Active", joinDate: "2025-01-05", candidates: 195, department: "Community" },
  { id: "PSU-MOB-003", name: "Suresh Nayak", role: "Mobilizer", center: "Angul", email: "suresh@psu.edu", phone: "+91 98765 43232", status: "Inactive", joinDate: "2024-06-01", candidates: 320, department: "Community" },
  { id: "PSU-PLC-001", name: "Sonal Behera", role: "Placement Officer", center: "Jharsuguda", email: "sonal@psu.edu", phone: "+91 98765 43240", status: "Active", joinDate: "2024-10-15", drives: 12, department: "Placement" },
  { id: "PSU-PLC-002", name: "Rakesh Mohanty", role: "Placement Officer", center: "Angul", email: "rakesh@psu.edu", phone: "+91 98765 43241", status: "Active", joinDate: "2025-03-01", drives: 8, department: "Placement" },
];

const ROLE_TABS = ["All", "Admin", "Trainer", "Mobilizer", "Placement Officer"];

const ROLE_BADGE = {
  Admin: "bg-violet-500/15 text-violet-400 border-violet-500/30",
  Trainer: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  Mobilizer: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  "Placement Officer": "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
};

const STATUS_BADGE = {
  Active: "bg-emerald-500/10 text-emerald-400",
  "On Leave": "bg-amber-500/10 text-amber-500",
  Inactive: "bg-red-500/10 text-red-400",
};

/* ===================== COMPONENT ===================== */

export default function SuperAdminUserManagement() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("All");
  const [search, setSearch] = useState("");

  const filtered = ALL_USERS.filter((u) => {
    const matchTab = activeTab === "All" || u.role === activeTab;
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.id.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-black text-slate-100 flex items-center gap-3 tracking-tighter">
            <Users size={28} className="text-red-500" /> User Management
          </h1>
          <p className="text-sm text-white/60 mt-1 uppercase tracking-widest font-bold">
            {ALL_USERS.length} registered users across all roles
          </p>
        </div>
        <button
          onClick={() => navigate("/super-admin/user-management/new")}
          className="px-5 py-2.5 bg-gradient-to-r from-red-600 to-red-500 text-white text-sm font-bold rounded-xl hover:opacity-90 transition shadow-xl shadow-red-500/20 flex items-center gap-2"
        >
          <Plus size={16} /> Create New User
        </button>
      </div>

      {/* Role Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Admins", count: ALL_USERS.filter(u => u.role === "Admin").length, icon: Shield, color: "text-violet-500", bg: "bg-violet-500/10" },
          { label: "Trainers", count: ALL_USERS.filter(u => u.role === "Trainer").length, icon: GraduationCap, color: "text-emerald-500", bg: "bg-emerald-500/10" },
          { label: "Mobilizers", count: ALL_USERS.filter(u => u.role === "Mobilizer").length, icon: UserCog, color: "text-amber-500", bg: "bg-amber-500/10" },
          { label: "Placement Officers", count: ALL_USERS.filter(u => u.role === "Placement Officer").length, icon: Briefcase, color: "text-cyan-500", bg: "bg-cyan-500/10" },
        ].map((s) => (
          <div key={s.label} className="bg-[#111827]/80 border border-slate-700/50 rounded-2xl p-5 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-xl ${s.bg}`}>
                <s.icon size={18} className={s.color} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{s.label}</p>
                <p className="text-xl font-black text-slate-100">{s.count}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-[#111827]/80 border border-slate-700/50 rounded-2xl overflow-hidden backdrop-blur-sm">
        <div className="p-5 border-b border-white/[0.08] flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Role Tabs */}
          <div className="flex gap-1 bg-transparent/30 p-1 rounded-xl">
            {ROLE_TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-[11px] font-black uppercase tracking-wider transition ${
                  activeTab === tab
                    ? "bg-red-500/20 text-red-400"
                    : "text-slate-500 hover:text-white/80"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search by name, ID, or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2.5 bg-transparent/40 border border-slate-700 rounded-xl text-xs text-white/80 outline-none focus:border-red-500 transition w-72"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-transparent/20 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                <th className="px-6 py-4">User ID</th>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Center</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Phone</th>
                <th className="px-6 py-4">Joined</th>
                <th className="px-6 py-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filtered.map((user) => (
                <tr key={user.id} className="hover:bg-transparent/30 transition group">
                  <td className="px-6 py-4 text-[11px] font-black text-red-500/80 font-mono">{user.id}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-[11px] font-black text-white/80">
                        {user.name.split(" ").map(n => n[0]).join("")}
                      </div>
                      <span className="text-[13px] font-bold text-white/90 group-hover:text-white transition">{user.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase border ${ROLE_BADGE[user.role]}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-white/60 font-medium">{user.center}</td>
                  <td className="px-6 py-4 text-xs text-white/60">{user.email}</td>
                  <td className="px-6 py-4 text-xs text-white/60">{user.phone}</td>
                  <td className="px-6 py-4 text-[11px] text-slate-500 font-bold">{user.joinDate}</td>
                  <td className="px-6 py-4 text-right">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${STATUS_BADGE[user.status]}`}>
                      {user.status}
                    </span>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-sm text-slate-500">
                    No users found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-white/[0.08] text-center">
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
            Showing {filtered.length} of {ALL_USERS.length} users
          </p>
        </div>
      </div>
    </div>
  );
}
