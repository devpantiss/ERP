import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FolderKanban,
  Plus,
  MapPin,
  Calendar,
  Users,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

/* ===================== MOCK DATA ===================== */

const PROJECTS = [
  {
    id: 1,
    name: "PMKVY 4.0",
    center: "Pantiss Skill Resort, Angul",
    status: "Active",
    startDate: "01 Jan 2024",
    endDate: "31 Dec 2024",
    enrolled: 240,
    placed: 185,
    trainers: 8,
    mobilizers: 6,
    progress: 78,
    description: "Pradhan Mantri Kaushal Vikas Yojana — Skill development initiative for youth across Odisha.",
  },
  {
    id: 2,
    name: "CSR – Tata Steel",
    center: "Jajpur Training Center",
    status: "Ongoing",
    startDate: "15 Mar 2024",
    endDate: "15 Mar 2025",
    enrolled: 180,
    placed: 112,
    trainers: 5,
    mobilizers: 4,
    progress: 62,
    description: "Corporate Social Responsibility project with Tata Steel for local community skill development.",
  },
  {
    id: 3,
    name: "DDUGKY",
    center: "Kalahandi Center",
    status: "Active",
    startDate: "01 Apr 2024",
    endDate: "31 Mar 2025",
    enrolled: 320,
    placed: 144,
    trainers: 10,
    mobilizers: 8,
    progress: 45,
    description: "Deen Dayal Upadhyaya Grameen Kaushalya Yojana — Rural youth skill development program.",
  },
  {
    id: 4,
    name: "State Skill Mission",
    center: "Jharsuguda Campus",
    status: "Completed",
    startDate: "01 Jun 2023",
    endDate: "31 May 2024",
    enrolled: 150,
    placed: 132,
    trainers: 4,
    mobilizers: 3,
    progress: 100,
    description: "State-funded skill development mission targeting employment in mining and industrial sectors.",
  },
  {
    id: 5,
    name: "DMF Keonjhar",
    center: "Keonjhar Training Hub",
    status: "Active",
    startDate: "01 Jul 2024",
    endDate: "30 Jun 2025",
    enrolled: 200,
    placed: 68,
    trainers: 6,
    mobilizers: 5,
    progress: 34,
    description: "District Mineral Foundation funded skill training to support mining-affected communities.",
  },
  {
    id: 6,
    name: "Shaksham Sundargarh",
    center: "Sundargarh Skill Center",
    status: "Active",
    startDate: "15 Aug 2024",
    endDate: "14 Aug 2025",
    enrolled: 280,
    placed: 154,
    trainers: 7,
    mobilizers: 6,
    progress: 55,
    description: "Comprehensive skill development program for the youth of Sundargarh district.",
  },
];

/* ===================== MAIN COMPONENT ===================== */

export default function AdminProjectManagement() {
  const navigate = useNavigate();
  const [expandedId, setExpandedId] = useState(null);
  const [filterStatus, setFilterStatus] = useState("All");

  const filteredProjects = filterStatus === "All"
    ? PROJECTS
    : PROJECTS.filter((p) => p.status === filterStatus);

  return (
    <div className="space-y-6">

      {/* ================= HEADER ================= */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-100">
            Project Management
          </h1>
          <p className="text-sm text-white/60 mt-1">
            Overview of all projects and their progress
          </p>
        </div>
        <button
          onClick={() => navigate("/admin/project-management/new")}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-violet-500 text-white font-medium hover:bg-violet-400 transition"
        >
          <Plus size={16} />
          New Project
        </button>
      </div>

      {/* ================= SUMMARY CARDS ================= */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Projects", value: PROJECTS.length },
          { label: "Active", value: PROJECTS.filter((p) => p.status === "Active").length },
          { label: "Ongoing", value: PROJECTS.filter((p) => p.status === "Ongoing").length },
          { label: "Completed", value: PROJECTS.filter((p) => p.status === "Completed").length },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-[#111827] border border-slate-700 rounded-xl p-4"
          >
            <p className="text-xs text-white/60">{stat.label}</p>
            <p className="text-xl font-semibold text-violet-400 mt-1">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* ================= FILTER ================= */}
      <div className="flex items-center gap-2">
        {["All", "Active", "Ongoing", "Completed"].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-1.5 text-sm rounded-lg transition ${
              filterStatus === status
                ? "bg-violet-500 text-white"
                : "bg-[#111827] text-white/60 border border-slate-700 hover:border-violet-500/30"
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* ================= PROJECT CARDS ================= */}
      <div className="space-y-4">
        {filteredProjects.map((project) => (
          <div
            key={project.id}
            className="bg-[#111827] border border-slate-700 rounded-xl overflow-hidden hover:border-violet-500/30 transition"
          >
            {/* Card Header */}
            <div
              className="p-5 cursor-pointer"
              onClick={() =>
                setExpandedId(expandedId === project.id ? null : project.id)
              }
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center text-violet-400">
                    <FolderKanban size={20} />
                  </div>
                  <div>
                    <h3 className="font-medium text-white/90">
                      {project.name}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-white/60 mt-1">
                      <MapPin size={12} />
                      {project.center}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full ${
                      project.status === "Active"
                        ? "bg-violet-500/10 text-violet-400"
                        : project.status === "Ongoing"
                        ? "bg-amber-500/10 text-amber-400"
                        : "bg-emerald-500/10 text-emerald-400"
                    }`}
                  >
                    {project.status}
                  </span>

                  {/* Progress */}
                  <div className="hidden md:flex items-center gap-2">
                    <div className="w-20 h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-violet-500 rounded-full"
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                    <span className="text-xs text-white/60">
                      {project.progress}%
                    </span>
                  </div>

                  {expandedId === project.id ? (
                    <ChevronUp size={18} className="text-white/60" />
                  ) : (
                    <ChevronDown size={18} className="text-white/60" />
                  )}
                </div>
              </div>
            </div>

            {/* Expanded Details */}
            {expandedId === project.id && (
              <div className="border-t border-slate-700 p-5 bg-[#0b1220]">
                <p className="text-sm text-white/60 mb-4">
                  {project.description}
                </p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs text-slate-500">Timeline</p>
                    <p className="text-sm text-white/80 flex items-center gap-1.5">
                      <Calendar size={13} />
                      {project.startDate} – {project.endDate}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-slate-500">Enrolled / Placed</p>
                    <p className="text-sm text-white/80 flex items-center gap-1.5">
                      <Users size={13} />
                      {project.enrolled} / {project.placed}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-slate-500">Trainers</p>
                    <p className="text-sm text-violet-400 font-medium">
                      {project.trainers}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-slate-500">Mobilizers</p>
                    <p className="text-sm text-violet-400 font-medium">
                      {project.mobilizers}
                    </p>
                  </div>
                </div>

                {/* Progress bar in expanded */}
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs text-white/60 mb-1">
                    <span>Overall Progress</span>
                    <span>{project.progress}%</span>
                  </div>
                  <div className="w-full h-3 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-violet-500 to-violet-400 rounded-full transition-all duration-500"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>


    </div>
  );
}
