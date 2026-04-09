import { useState, useEffect } from "react";
import {
  Users,
  Building2,
  FolderKanban,
  ClipboardCheck,
  MapPin,
  TrendingUp,
} from "lucide-react";
import Marquee from "react-fast-marquee";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

/* ===================== PROJECT DATA ===================== */

const PROJECT_CARDS = [
  {
    project: "PMKVY 4.0",
    center: "Pantiss Skill Resort, Angul",
    status: "Active",
  },
  {
    project: "CSR – Tata Steel",
    center: "Jajpur Training Center",
    status: "Ongoing",
  },
  {
    project: "DDUGKY",
    center: "Kalahandi Center",
    status: "Active",
  },
  {
    project: "State Skill Mission",
    center: "Jharsuguda Campus",
    status: "Ongoing",
  },
  {
    project: "DMF Keonjhar",
    center: "Keonjhar Training Hub",
    status: "Active",
  },
];

/* ===================== COUNT UP HOOK ===================== */

function useCountUp(value, duration = 1200) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let raf;
    const start = performance.now();

    const animate = (time) => {
      const progress = Math.min((time - start) / duration, 1);
      setCount(Math.floor(progress * value));
      if (progress < 1) raf = requestAnimationFrame(animate);
    };

    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);

  return count;
}

/* ===================== MAIN COMPONENT ===================== */

export default function AdminDashboardSection1({
  totalData = {
    totalUsers: 186,
    totalUsersTarget: 250,
    activeCenters: 12,
    activeCentersTarget: 20,
    activeProjects: 8,
    activeProjectsTarget: 15,
    overallAttendance: 87,
    attendanceTarget: 95,
  },

  lastMonthData = {
    totalUsers: 24,
    totalUsersTarget: 40,
    activeCenters: 3,
    activeCentersTarget: 5,
    activeProjects: 2,
    activeProjectsTarget: 4,
    overallAttendance: 91,
    attendanceTarget: 95,
  },
}) {
  const [view, setView] = useState("total");
  const data = view === "total" ? totalData : lastMonthData;

  const animatedUsers = useCountUp(data.totalUsers);
  const animatedCenters = useCountUp(data.activeCenters);
  const animatedProjects = useCountUp(data.activeProjects);
  const animatedAttendance = useCountUp(data.overallAttendance);

  const targetPie = (achieved, target) => [
    { name: "Achieved", value: achieved },
    { name: "Remaining", value: Math.max(target - achieved, 0) },
  ];

  return (
    <section className="relative w-full rounded-2xl p-8
      bg-[#111827] border border-slate-700 overflow-hidden">

      {/* ================= PROJECT MARQUEE ================= */}

      <div className="mb-6">

        <Marquee speed={40} pauseOnHover gradient={false}>
          {PROJECT_CARDS.map((item, i) => (
            <ProjectCard key={i} data={item} />
          ))}
        </Marquee>

      </div>

      {/* SUBTLE GRID */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.05]"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(139,92,246,0.4) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(139,92,246,0.4) 1px, transparent 1px)
          `,
          backgroundSize: "32px 32px",
        }}
      />

      <div className="relative z-10">

        {/* HEADER */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-slate-100 text-xl font-semibold tracking-tight">
            Platform Overview
          </h2>

          <div className="flex rounded-md border border-slate-600 overflow-hidden text-sm">
            {["total", "month"].map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-4 py-1.5 transition ${
                  view === v
                    ? "bg-violet-500 text-white"
                    : "bg-transparent text-white/80 hover:bg-slate-700"
                }`}
              >
                {v === "total" ? "Total" : "Last 30 Days"}
              </button>
            ))}
          </div>
        </div>

        {/* KPI GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

          <KpiCard
            title="Total Users"
            value={animatedUsers}
            target={`Target: ${data.totalUsersTarget}`}
            icon={<Users size={18} />}
            pie={targetPie(data.totalUsers, data.totalUsersTarget)}
          />

          <KpiCard
            title="Active Centers"
            value={animatedCenters}
            target={`Target: ${data.activeCentersTarget}`}
            icon={<Building2 size={18} />}
            pie={targetPie(data.activeCenters, data.activeCentersTarget)}
          />

          <KpiCard
            title="Active Projects"
            value={animatedProjects}
            target={`Target: ${data.activeProjectsTarget}`}
            icon={<FolderKanban size={18} />}
            pie={targetPie(data.activeProjects, data.activeProjectsTarget)}
          />

          <KpiCard
            title="Overall Attendance"
            value={`${animatedAttendance}%`}
            target={`Target: ${data.attendanceTarget}%`}
            icon={<ClipboardCheck size={18} />}
            pie={targetPie(data.overallAttendance, data.attendanceTarget)}
          />
        </div>
      </div>
    </section>
  );
}

/* ===================== PROJECT CARD ===================== */

function ProjectCard({ data }) {
  return (
    <div className="mx-3 min-w-[280px] bg-[#0f172a] border border-slate-700 rounded-xl p-4 flex flex-col gap-2 hover:border-violet-500/40 transition">

      <div className="flex items-center justify-between">

        <div className="flex items-center gap-2 text-violet-400">
          <Building2 size={16} />
          <span className="text-sm font-medium">
            {data.project}
          </span>
        </div>

        <span className="text-xs px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-400">
          {data.status}
        </span>

      </div>

      <div className="flex items-center gap-2 text-xs text-white/60">
        <MapPin size={14} />
        {data.center}
      </div>

    </div>
  );
}

/* ===================== KPI CARD ===================== */

function KpiCard({ title, value, target, icon, pie }) {
  const [activeIndex, setActiveIndex] = useState(null);

  const percent =
    pie && pie[0].value + pie[1].value > 0
      ? Math.round((pie[0].value / (pie[0].value + pie[1].value)) * 100)
      : 0;

  return (
    <div className="bg-[#0f172a] border border-slate-700 rounded-xl p-5
      hover:border-violet-500/40 transition">

      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-white/60">{title}</p>
        <div className="w-9 h-9 rounded-full bg-transparent flex items-center justify-center text-violet-400">
          {icon}
        </div>
      </div>

      <div className="flex items-center gap-4">

        <div className="w-24 h-24">
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={pie}
                innerRadius={32}
                outerRadius={42}
                activeIndex={activeIndex}
                activeOuterRadius={48}
                dataKey="value"
                onMouseEnter={(_, i) => setActiveIndex(i)}
                onMouseLeave={() => setActiveIndex(null)}
              >
                <Cell fill="#8b5cf6" />
                <Cell fill="#1f2937" />
              </Pie>

              <text
                x="50%"
                y="50%"
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-slate-200 text-xs font-semibold"
              >
                {percent}%
              </text>

              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div>
          <p className="text-lg font-semibold text-slate-100">
            {value}
          </p>
          <p className="text-xs text-white/60 mt-1">{target}</p>
        </div>
      </div>
    </div>
  );
}
