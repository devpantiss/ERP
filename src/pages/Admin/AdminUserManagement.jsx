import Pagination from "../../components/common/Pagination";
import SlidePanel from "../../components/common/SlidePanel";
import ExportPDFButton from "../../components/common/ExportPDFButton";
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Filter,
  UserPlus,
  MoreVertical,
  Eye,
  Edit,
  Ban,
  CheckCircle2,
  X,
} from "lucide-react";
import {
  selectRoleOptions,
  selectUserDirectory,
} from "../../stores/selectors/employeeSelectors.js";

/* ===================== MAIN COMPONENT ===================== */

export default function AdminUserManagement() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [actionMenu, setActionMenu] = useState(null);
  const [viewModal, setViewModal] = useState(null);
  const users = useMemo(() => selectUserDirectory(), []);
  const roles = useMemo(() => selectRoleOptions(), []);
  const statuses = useMemo(() => ["All", ...new Set(users.map((user) => user.status))], [users]);

  const filtered = useMemo(() => {
    return users.filter((user) => {
      const matchSearch =
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchRole = roleFilter === "All" || user.role === roleFilter;
      const matchStatus = statusFilter === "All" || user.status === statusFilter;
      return matchSearch && matchRole && matchStatus;
    });
  }, [users, searchTerm, roleFilter, statusFilter]);

  const roleCounts = useMemo(() => {
    const counts = {};
    users.forEach((u) => {
      counts[u.role] = (counts[u.role] || 0) + 1;
    });
    return counts;
  }, [users]);

  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filtered?.slice(start, start + itemsPerPage) || [];
  }, [filtered, currentPage]);
  const totalPages = Math.ceil((filtered?.length || 0) / itemsPerPage);

  return (
    <div className="space-y-6">

      {/* ================= HEADER ================= */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-100">
            User Management
          </h1>
          <p className="text-sm text-white/60 mt-1">
            Manage all platform users across roles
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ExportPDFButton
            title="User Management"
            columns={["Name","Role","Center","Status","Email","Joined"]}
            data={filtered.map(u=>[u.name,u.role,u.center,u.status,u.email,u.joinDate])}
            fileName="user_management"
            accent="violet"
          />
          <button onClick={() => navigate("/admin/user-management/new")} className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-violet-500 text-white font-medium hover:bg-violet-400 transition">
            <UserPlus size={16} />
            Add User
          </button>
        </div>
      </div>

      {/* ================= ROLE SUMMARY CARDS ================= */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {roles.filter((r) => r !== "All" && r !== "Client" && r !== "Executive" && r !== "Super Admin").map((role) => (
          <div
            key={role}
            className="bg-[#111827] border border-slate-700 rounded-xl p-4 hover:border-violet-500/30 transition cursor-pointer"
            onClick={() => setRoleFilter(role === roleFilter ? "All" : role)}
          >
            <p className="text-xs text-white/60">{role}s</p>
            <p className="text-xl font-semibold text-violet-400 mt-1">
              {roleCounts[role] || 0}
            </p>
          </div>
        ))}
        <div className="bg-[#111827] border border-slate-700 rounded-xl p-4">
          <p className="text-xs text-white/60">Total Users</p>
          <p className="text-xl font-semibold text-slate-100 mt-1">
            {users.length}
          </p>
        </div>
      </div>

      {/* ================= FILTERS ================= */}
      <div className="flex flex-wrap items-center gap-4 bg-[#111827] border border-slate-700 rounded-xl p-4">

        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-transparent border border-slate-700 text-sm text-white/90 focus:border-violet-400 outline-none transition"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter size={14} className="text-white/60" />

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-transparent border border-slate-700 text-white/90 px-3 py-2 rounded-lg text-sm focus:border-violet-400 outline-none"
          >
            {roles.map((r) => (
              <option key={r} value={r}>
                {r === "All" ? "All Roles" : r}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-transparent border border-slate-700 text-white/90 px-3 py-2 rounded-lg text-sm focus:border-violet-400 outline-none"
          >
            {statuses.map((s) => (
              <option key={s} value={s}>
                {s === "All" ? "All Status" : s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ================= TABLE ================= */}
      <div className="bg-[#111827] border border-slate-700 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">

            <thead className="bg-[#0b1220] text-white/60">
              <tr>
                <th className="p-4 text-left">User</th>
                <th className="p-4 text-left">Role</th>
                <th className="p-4 text-left">Center</th>
                <th className="p-4 text-left">Status</th>
                <th className="p-4 text-left">Joined</th>
                <th className="p-4 text-left">Actions</th>
              </tr>
            </thead>

            <tbody>
            {paginatedData.map((user) => (
                <tr
                  key={user.id}
                  className="border-t border-slate-700/50 hover:bg-transparent/30 transition"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-9 h-9 rounded-lg object-cover border border-slate-700"
                      />
                      <div>
                        <p className="font-medium text-white/90">{user.name}</p>
                        <p className="text-xs text-slate-500">{user.email}</p>
                      </div>
                    </div>
                  </td>

                  <td className="p-4">
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full ${
                        user.role === "Trainer"
                          ? "bg-emerald-500/10 text-emerald-400"
                          : user.role === "Mobilizer"
                          ? "bg-yellow-500/10 text-yellow-400"
                          : "bg-cyan-500/10 text-cyan-400"
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>

                  <td className="p-4 text-white/60">{user.center}</td>

                  <td className="p-4">
                    <span
                      className={`flex items-center gap-1.5 text-xs ${
                        user.status === "Active"
                          ? "text-emerald-400"
                          : "text-slate-500"
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${
                          user.status === "Active"
                            ? "bg-emerald-400"
                            : "bg-slate-600"
                        }`}
                      />
                      {user.status}
                    </span>
                  </td>

                  <td className="p-4 text-white/60 text-xs">{user.joinDate}</td>

                  <td className="p-4">
                    <div className="relative">
                      <button
                        onClick={() =>
                          setActionMenu(actionMenu === user.id ? null : user.id)
                        }
                        className="p-1.5 rounded-lg hover:bg-slate-700 transition"
                      >
                        <MoreVertical size={16} className="text-white/60" />
                      </button>

                      {actionMenu === user.id && (
                        <div className="absolute right-0 top-full mt-1 w-40 bg-[#1e293b] border border-slate-700 rounded-lg shadow-xl z-20">
                          <button
                            onClick={() => {
                              setViewModal(user);
                              setActionMenu(null);
                            }}
                            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-white/80 hover:bg-slate-700 transition"
                          >
                            <Eye size={14} /> View
                          </button>
                          <button className="flex items-center gap-2 w-full px-3 py-2 text-sm text-white/80 hover:bg-slate-700 transition">
                            <Edit size={14} /> Edit
                          </button>
                          <button className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-400 hover:bg-slate-700 transition">
                            <Ban size={14} /> Deactivate
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />

          {filtered.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              No users match the current filters.
            </div>
          )}
        </div>
      </div>

      {/* ================= VIEW MODAL ================= */}
      <SlidePanel open={!!viewModal} onClose={() => setViewModal(null)} title="User Details" width="md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-100">
                User Details
              </h3>
              <button
                onClick={() => setViewModal(null)}
                className="text-white/60 hover:text-white transition"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex items-center gap-4 mb-6">
              <img
                src={viewModal.avatar}
                className="w-16 h-16 rounded-xl object-cover border border-slate-700"
              />
              <div>
                <p className="font-semibold text-lg text-slate-100">
                  {viewModal.name}
                </p>
                <p className="text-sm text-violet-400">{viewModal.role}</p>
              </div>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-white/60">Email</span>
                <span className="text-white/90">{viewModal.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Phone</span>
                <span className="text-white/90">{viewModal.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Center</span>
                <span className="text-white/90">{viewModal.center}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Status</span>
                <span className={viewModal.status === "Active" ? "text-emerald-400" : "text-slate-500"}>
                  {viewModal.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Join Date</span>
                <span className="text-white/90">{viewModal.joinDate}</span>
              </div>
            </div>

            <button
              onClick={() => setViewModal(null)}
              className="w-full mt-6 py-2.5 bg-violet-500 text-white rounded-lg font-medium hover:bg-violet-400 transition"
            >
              Close
            </button>
      </SlidePanel>
    </div>
  );
}
