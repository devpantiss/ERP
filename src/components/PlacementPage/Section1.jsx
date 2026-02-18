import { useState, useEffect } from "react";
import {
  Users,
  Megaphone,
  ArrowRightLeft,
  TrendingUp,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

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

export default function Section1({
  totalData = {
    placed: 420,
    placedTarget: 500,
    drives: 38,
    drivesTarget: 50,
    joined: 360,
    retained: 290,
  },

  lastMonthData = {
    placed: 55,
    placedTarget: 70,
    drives: 6,
    drivesTarget: 10,
    joined: 48,
    retained: 40,
  },
}) {
  const [view, setView] = useState("total");

  const data = view === "total" ? totalData : lastMonthData;

  const animatedPlaced = useCountUp(data.placed);
  const animatedDrives = useCountUp(data.drives);

  /* ===== Placed → Joined ===== */

  const joinedPie = [
    { name: "Joined", value: data.joined },
    { name: "Not Joined", value: data.placed - data.joined },
  ];

  const joinRate =
    data.placed > 0
      ? Math.round((data.joined / data.placed) * 100)
      : 0;

  /* ===== Retention ===== */

  const retentionPie = [
    { name: "Retained", value: data.retained },
    { name: "Attrition", value: data.joined - data.retained },
  ];

  const retentionRate =
    data.joined > 0
      ? Math.round((data.retained / data.joined) * 100)
      : 0;

  /* ===== Target Pie ===== */

  const targetPie = (achieved, target) => [
    { name: "Achieved", value: achieved },
    { name: "Remaining", value: Math.max(target - achieved, 0) },
  ];

  return (
    <section
      className="relative w-full rounded-2xl p-6
      bg-[#0b0f14] border border-cyan-400 overflow-hidden"
    >
      {/* GRID */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.15]"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(34,211,238,0.4) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(34,211,238,0.4) 1px, transparent 1px)
          `,
          backgroundSize: "28px 28px",
        }}
      />

      <div className="relative z-10">

        {/* HEADER */}
        <div className="flex items-center justify-between mb-6">

          <h2 className="text-slate-100 text-lg font-semibold">
            Placement Performance Overview
          </h2>

          <div className="flex rounded-lg border border-cyan-400 overflow-hidden text-sm">
            {["total", "month"].map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-4 py-1.5 transition ${
                  view === v
                    ? "bg-cyan-400 text-black"
                    : "bg-white/5 text-slate-300 hover:bg-white/10"
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
            title="Placed Candidates"
            value={animatedPlaced}
            target={`Target: ${data.placedTarget}`}
            icon={<Users size={18} />}
            pie={targetPie(data.placed, data.placedTarget)}
          />

          <KpiCard
            title="Placement Drives Conducted"
            value={animatedDrives}
            target={`Target: ${data.drivesTarget}`}
            icon={<Megaphone size={18} />}
            pie={targetPie(data.drives, data.drivesTarget)}
          />

          <KpiCard
            title="Placed → Joined"
            value={`${data.joined} / ${data.placed}`}
            target={`Join Rate: ${joinRate}%`}
            icon={<ArrowRightLeft size={18} />}
            pie={joinedPie}
          />

          <KpiCard
            title="Long-term Retention"
            value={`${retentionRate}%`}
            target={`Retained: ${data.retained}`}
            icon={<TrendingUp size={18} />}
            pie={retentionPie}
          />

        </div>

      </div>
    </section>
  );
}

/* ===================== KPI CARD ===================== */

function KpiCard({ title, value, target, icon, pie }) {
  const [activeIndex, setActiveIndex] = useState(null);

  const percent =
    pie[0].value + pie[1].value > 0
      ? Math.round((pie[0].value / (pie[0].value + pie[1].value)) * 100)
      : 0;

  return (
    <div
      className="bg-[#111827] border border-cyan-400 rounded-xl p-5
      hover:shadow-[0_0_30px_rgba(34,211,238,0.15)] transition"
    >
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-slate-400">{title}</p>
        <div className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center">
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
                <Cell fill="#22d3ee" />
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
          <p className="text-lg font-bold text-slate-100">{value}</p>
          <p className="text-xs text-cyan-400">{target}</p>
        </div>

      </div>
    </div>
  );
}
