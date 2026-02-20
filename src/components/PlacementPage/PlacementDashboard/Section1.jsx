import { useState, useEffect } from "react";
import { Users, Megaphone, ArrowRightLeft, TrendingUp } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

/* ===================== PROJECT DATA ===================== */

const projectData = {
  "Shaksham Sundargarh": {
    placed: 420,
    placedTarget: 500,
    drives: 38,
    drivesTarget: 50,
    joined: 360,
    retained: 290,
  },
  "DMF Jajpur": {
    placed: 280,
    placedTarget: 350,
    drives: 22,
    drivesTarget: 30,
    joined: 240,
    retained: 180,
  },
  "DMF Kalahandi": {
    placed: 310,
    placedTarget: 400,
    drives: 26,
    drivesTarget: 35,
    joined: 260,
    retained: 210,
  },
  "DMF Keonjhar": {
    placed: 350,
    placedTarget: 450,
    drives: 30,
    drivesTarget: 40,
    joined: 300,
    retained: 250,
  },
};

/* ===================== COUNT UP ===================== */

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

/* ===================== MAIN ===================== */

export default function Section1({ project }) {

  const data =
    projectData[project] || projectData["Shaksham Sundargarh"];

  const animatedPlaced = useCountUp(data.placed);
  const animatedDrives = useCountUp(data.drives);

  const joinedPie = [
    { name: "Joined", value: data.joined },
    { name: "Not Joined", value: data.placed - data.joined },
  ];

  const retentionPie = [
    { name: "Retained", value: data.retained },
    { name: "Attrition", value: data.joined - data.retained },
  ];

  const joinRate =
    data.placed > 0
      ? Math.round((data.joined / data.placed) * 100)
      : 0;

  const retentionRate =
    data.joined > 0
      ? Math.round((data.retained / data.joined) * 100)
      : 0;

  const targetPie = (achieved, target) => [
    { name: "Achieved", value: achieved },
    { name: "Remaining", value: Math.max(target - achieved, 0) },
  ];

  return (
    <section className="relative w-full rounded-2xl p-6 bg-[#0b0f14] border border-cyan-400">

      <h2 className="text-slate-100 text-lg font-semibold mb-6">
        {project} — Placement Performance
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

        <KpiCard
          title="Placed Candidates"
          value={animatedPlaced}
          target={`Target: ${data.placedTarget}`}
          icon={<Users size={18} />}
          pie={targetPie(data.placed, data.placedTarget)}
        />

        <KpiCard
          title="Placement Drives"
          value={animatedDrives}
          target={`Target: ${data.drivesTarget}`}
          icon={<Megaphone size={18} />}
          pie={targetPie(data.drives, data.drivesTarget)}
        />

        <KpiCard
          title="Placed → Joined"
          value={`${data.joined}/${data.placed}`}
          target={`Join Rate: ${joinRate}%`}
          icon={<ArrowRightLeft size={18} />}
          pie={joinedPie}
        />

        <KpiCard
          title="Retention"
          value={`${retentionRate}%`}
          target={`Retained: ${data.retained}`}
          icon={<TrendingUp size={18} />}
          pie={retentionPie}
        />

      </div>
    </section>
  );
}

/* ===================== KPI CARD ===================== */

function KpiCard({ title, value, target, icon, pie }) {

  return (
    <div className="bg-[#111827] border border-cyan-400 rounded-xl p-5">

      <div className="flex justify-between mb-3">
        <p className="text-sm text-slate-400">{title}</p>
        {icon}
      </div>

      <div className="flex items-center gap-4">

        <div className="w-24 h-24">
          <ResponsiveContainer>
            <PieChart>
              <Pie data={pie} innerRadius={30} outerRadius={40} dataKey="value">
                <Cell fill="#22d3ee" />
                <Cell fill="#1f2937" />
              </Pie>
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
