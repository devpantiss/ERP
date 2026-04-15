import { useState } from "react";
import SlidePanel from "../../components/common/SlidePanel";
import {
  Building2,
  MapPin,
  Users,
  BookOpen,
  Plus,
  Eye,
  X,
} from "lucide-react";

/* ===================== MOCK DATA ===================== */

const CENTERS = [
  {
    id: 1,
    name: "Pantiss Skill Resort",
    location: "Angul, Odisha",
    trainers: 8,
    activeBatches: 4,
    totalCapacity: 200,
    currentStrength: 160,
    status: "Active",
    projects: ["PMKVY 4.0", "State Skill Mission"],
    contact: "+91 9876543200",
    head: "Mr. Sanjay Panda",
  },
  {
    id: 2,
    name: "Jajpur Training Center",
    location: "Jajpur, Odisha",
    trainers: 5,
    activeBatches: 3,
    totalCapacity: 150,
    currentStrength: 120,
    status: "Active",
    projects: ["CSR – Tata Steel"],
    contact: "+91 9876543201",
    head: "Ms. Ritu Sharma",
  },
  {
    id: 3,
    name: "Kalahandi Center",
    location: "Kalahandi, Odisha",
    trainers: 10,
    activeBatches: 5,
    totalCapacity: 300,
    currentStrength: 220,
    status: "Active",
    projects: ["DDUGKY", "DMF Kalahandi"],
    contact: "+91 9876543202",
    head: "Mr. Bijay Nayak",
  },
  {
    id: 4,
    name: "Jharsuguda Campus",
    location: "Jharsuguda, Odisha",
    trainers: 4,
    activeBatches: 2,
    totalCapacity: 120,
    currentStrength: 85,
    status: "Active",
    projects: ["State Skill Mission"],
    contact: "+91 9876543203",
    head: "Mr. Ashok Mohanty",
  },
  {
    id: 5,
    name: "Keonjhar Training Hub",
    location: "Keonjhar, Odisha",
    trainers: 6,
    activeBatches: 3,
    totalCapacity: 180,
    currentStrength: 140,
    status: "Active",
    projects: ["DMF Keonjhar"],
    contact: "+91 9876543204",
    head: "Ms. Sunita Majhi",
  },
  {
    id: 6,
    name: "Sundargarh Skill Center",
    location: "Sundargarh, Odisha",
    trainers: 7,
    activeBatches: 4,
    totalCapacity: 250,
    currentStrength: 195,
    status: "Active",
    projects: ["Shaksham Sundargarh"],
    contact: "+91 9876543205",
    head: "Mr. Praveen Das",
  },
];

/* ===================== MAIN COMPONENT ===================== */

export default function AdminCenterManagement() {
  const [viewCenter, setViewCenter] = useState(null);

  const totalTrainers = CENTERS.reduce((a, c) => a + c.trainers, 0);
  const totalCapacity = CENTERS.reduce((a, c) => a + c.totalCapacity, 0);
  const totalStrength = CENTERS.reduce((a, c) => a + c.currentStrength, 0);

  return (
    <div className="space-y-6">

      {/* ================= HEADER ================= */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-100">
            Center Management
          </h1>
          <p className="text-sm text-white/60 mt-1">
            All training centers and their current status
          </p>
        </div>
      </div>

      {/* ================= SUMMARY ================= */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Centers", value: CENTERS.length, icon: Building2 },
          { label: "Total Trainers", value: totalTrainers, icon: Users },
          { label: "Total Capacity", value: totalCapacity, icon: BookOpen },
          { label: "Current Strength", value: totalStrength, icon: Users },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-[#111827] border border-slate-700 rounded-xl p-4"
          >
            <div className="flex items-center gap-2 text-violet-400 mb-2">
              <stat.icon size={16} />
              <span className="text-xs text-white/60">{stat.label}</span>
            </div>
            <p className="text-xl font-semibold text-slate-100">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* ================= CENTER CARDS ================= */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {CENTERS.map((center) => {
          const occupancy = Math.round(
            (center.currentStrength / center.totalCapacity) * 100
          );

          return (
            <div
              key={center.id}
              className="bg-[#111827] border border-slate-700 rounded-xl p-5 hover:border-violet-500/30 transition"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-medium text-white/90">{center.name}</h3>
                  <div className="flex items-center gap-1.5 text-xs text-white/60 mt-1">
                    <MapPin size={12} />
                    {center.location}
                  </div>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-400">
                  {center.status}
                </span>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div>
                  <p className="text-xs text-slate-500">Trainers</p>
                  <p className="text-sm font-medium text-white/90">
                    {center.trainers}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Batches</p>
                  <p className="text-sm font-medium text-white/90">
                    {center.activeBatches}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Capacity</p>
                  <p className="text-sm font-medium text-white/90">
                    {center.currentStrength}/{center.totalCapacity}
                  </p>
                </div>
              </div>

              {/* Occupancy bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-xs text-white/60 mb-1">
                  <span>Occupancy</span>
                  <span>{occupancy}%</span>
                </div>
                <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      occupancy >= 90
                        ? "bg-red-500"
                        : occupancy >= 70
                        ? "bg-amber-500"
                        : "bg-violet-500"
                    }`}
                    style={{ width: `${occupancy}%` }}
                  />
                </div>
              </div>

              {/* Projects */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                {center.projects.map((p) => (
                  <span
                    key={p}
                    className="text-[10px] px-2 py-0.5 rounded-full bg-transparent text-white/60 border border-slate-700"
                  >
                    {p}
                  </span>
                ))}
              </div>

              {/* View button */}
              <button
                onClick={() => setViewCenter(center)}
                className="flex items-center gap-2 text-sm text-violet-400 hover:text-violet-300 transition"
              >
                <Eye size={14} />
                View Details
              </button>
            </div>
          );
        })}
      </div>

      {/* ================= VIEW MODAL ================= */}
      <SlidePanel open={!!viewCenter} onClose={() => setViewCenter(null)} title="viewCenter.name}" width="md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-100">
                {viewCenter.name}
              </h3>
              <button
                onClick={() => setViewCenter(null)}
                className="text-white/60 hover:text-white transition"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-sm">
              {[
                ["Location", viewCenter.location],
                ["Center Head", viewCenter.head],
                ["Contact", viewCenter.contact],
                ["Trainers", viewCenter.trainers],
                ["Active Batches", viewCenter.activeBatches],
                ["Capacity", `${viewCenter.currentStrength} / ${viewCenter.totalCapacity}`],
                ["Projects", viewCenter.projects.join(", ")],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between">
                  <span className="text-white/60">{label}</span>
                  <span className="text-white/90 text-right">{value}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => setViewCenter(null)}
              className="w-full mt-6 py-2.5 bg-violet-500 text-white rounded-lg font-medium hover:bg-violet-400 transition"
            >
              Close
            </button>
      </SlidePanel>
    </div>
  );
}
