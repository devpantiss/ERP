import { useEffect, useState, useMemo } from "react";
import { useLocation } from "react-router-dom";
import {
  IndianRupee,
  Target,
  TrendingUp,
  Download,
  ChevronDown,
  ChevronUp,
  Award,
  CalendarDays,
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { useSalaryStore } from "../../stores/salaryStore.js";
import { selectSalaryHistoryForEmployee } from "../../stores/selectors/salarySelectors.js";

/* ═══════════════════════════════════════════════════════════════
   ROLE-AWARE CONFIG
═══════════════════════════════════════════════════════════════ */

const ROLE_CONFIG = {
  mobilizer: {
    accent: "yellow",
    kpiLabel: "Enrollments",
    kpiUnit: "candidates",
  },
  trainer: {
    accent: "emerald",
    kpiLabel: "Training Hours",
    kpiUnit: "hours",
  },
  "placement-officer": {
    accent: "cyan",
    kpiLabel: "Placements",
    kpiUnit: "students placed",
  },
};

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

const ROLE_EMPLOYEE = { mobilizer: "EMP-0003", trainer: "EMP-0001", "placement-officer": "EMP-0002" };

/* ═══════════════════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════════════════ */

const currentMonthKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

const getMonthLabel = (key) => {
  const [y, m] = key.split("-");
  return `${MONTHS[parseInt(m) - 1]} ${y}`;
};

const calcSalary = (data) => {
  const achievementPct = Math.min((data.achievedKPI / data.targetKPI) * 100, 100);
  const performanceMultiplier = achievementPct >= 100 ? 1 : achievementPct >= 80 ? 0.9 : achievementPct >= 60 ? 0.75 : 0.6;
  const performancePay = Math.round(data.baseSalary * performanceMultiplier);
  const netPay = performancePay - data.deductions + data.bonus;
  return { achievementPct, performanceMultiplier, performancePay, netPay };
};

/* ═══════════════════════════════════════════════════════════════
   ACCENT PALETTE
═══════════════════════════════════════════════════════════════ */

const ACCENT = {
  yellow: {
    text: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/20",
    ring: "ring-yellow-400/30", gradient: "from-yellow-500/80 to-amber-500/60",
    btn: "bg-yellow-400 hover:bg-yellow-300 text-black", progressBg: "bg-yellow-400",
    shadow: "shadow-yellow-500/10",
  },
  emerald: {
    text: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20",
    ring: "ring-emerald-400/30", gradient: "from-emerald-500/80 to-teal-500/60",
    btn: "bg-emerald-500 hover:bg-emerald-400 text-white", progressBg: "bg-emerald-400",
    shadow: "shadow-emerald-500/10",
  },
  cyan: {
    text: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/20",
    ring: "ring-cyan-400/30", gradient: "from-cyan-500/80 to-sky-500/60",
    btn: "bg-cyan-500 hover:bg-cyan-400 text-white", progressBg: "bg-cyan-400",
    shadow: "shadow-cyan-500/10",
  },
};

/* ═══════════════════════════════════════════════════════════════
   PDF GENERATION
═══════════════════════════════════════════════════════════════ */

const generateSalarySlip = (monthKey, data, calc, roleConfig) => {
  const doc = new jsPDF();
  const monthLabel = getMonthLabel(monthKey);

  // Header
  doc.setFillColor(6, 8, 16);
  doc.rect(0, 0, 210, 40, "F");
  doc.setTextColor(250, 204, 21);
  doc.setFontSize(20);
  doc.text("KOVON PLATFORM", 15, 20);
  doc.setFontSize(10);
  doc.setTextColor(180, 180, 180);
  doc.text(`Salary Slip — ${monthLabel}`, 15, 30);

  // Employee info
  doc.setTextColor(60, 60, 60);
  doc.setFontSize(11);
  doc.text("Employee Name: Field Officer", 15, 55);
  doc.text(`Role: ${roleConfig.kpiLabel} Officer`, 15, 63);
  doc.text(`Pay Period: ${monthLabel}`, 15, 71);

  // Table
  doc.autoTable({
    startY: 85,
    head: [["Component", "Details", "Amount (₹)"]],
    body: [
      ["Base Salary", "Monthly Fixed", data.baseSalary.toLocaleString("en-IN")],
      ["Target Achievement", `${data.achievedKPI}/${data.targetKPI} ${roleConfig.kpiUnit} (${calc.achievementPct.toFixed(0)}%)`, ""],
      ["Performance Multiplier", `${(calc.performanceMultiplier * 100).toFixed(0)}%`, ""],
      ["Performance Pay", `Base × ${(calc.performanceMultiplier * 100).toFixed(0)}%`, calc.performancePay.toLocaleString("en-IN")],
      ["Bonus", "Achievement Bonus", data.bonus.toLocaleString("en-IN")],
      ["Deductions", "PF + ESI + Tax", `- ${data.deductions.toLocaleString("en-IN")}`],
      ["", "", ""],
      ["NET PAYABLE", "", `₹ ${calc.netPay.toLocaleString("en-IN")}`],
    ],
    theme: "grid",
    headStyles: { fillColor: [6, 8, 16], textColor: [250, 204, 21] },
    styles: { fontSize: 10 },
    columnStyles: { 2: { halign: "right", fontStyle: "bold" } },
  });

  // Footer
  const finalY = doc.lastAutoTable.finalY + 20;
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text("This is a system-generated salary slip. No signature required.", 15, finalY);
  doc.text(`Generated on: ${new Date().toLocaleDateString("en-IN")}`, 15, finalY + 6);

  doc.save(`Salary_Slip_${monthKey}.pdf`);
};

/* ═══════════════════════════════════════════════════════════════
   COMPONENT
═══════════════════════════════════════════════════════════════ */

export default function SalaryDashboard() {
  const location = useLocation();
  const roleKey = location.pathname.split("/")[1]; // mobilizer | trainer | placement-officer
  const roleConfig = ROLE_CONFIG[roleKey] || ROLE_CONFIG.mobilizer;
  const a = ACCENT[roleConfig.accent];
  const { salaries, fetchSalaries } = useSalaryStore();

  const [selectedMonth, setSelectedMonth] = useState(currentMonthKey());
  const [activeTab, setActiveTab] = useState("salary"); // salary | incentives
  const [expandedRow, setExpandedRow] = useState(null);

  useEffect(() => {
    fetchSalaries({ filters: { employeeId: ROLE_EMPLOYEE[roleKey] } });
  }, [fetchSalaries, roleKey]);

  const salaryData = useMemo(
    () => selectSalaryHistoryForEmployee(salaries, ROLE_EMPLOYEE[roleKey]),
    [salaries, roleKey]
  );
  const monthOptions = useMemo(() => Object.keys(salaryData), [salaryData]);
  const data = useMemo(
    () => salaryData[selectedMonth] || salaryData[monthOptions[0]] || { baseSalary: 0, targetKPI: 1, achievedKPI: 0, deductions: 0, bonus: 0, status: "N/A" },
    [monthOptions, salaryData, selectedMonth]
  );
  const calc = useMemo(() => calcSalary(data), [data]);
  const incentives = useMemo(
    () => Object.entries(salaryData).map(([month, row], index) => ({
      id: `${month}-${index}`,
      type: row.achievedKPI >= row.targetKPI ? "Monthly Target Overachieve" : "Performance Review",
      target: row.targetKPI,
      achieved: row.achievedKPI,
      amount: row.bonus || 0,
      month: getMonthLabel(month),
      status: row.bonus ? row.status : "Not Eligible",
    })),
    [salaryData]
  );

  /* ═══════════════════════════════════════════════════════════
     RENDER
  ═══════════════════════════════════════════════════════════ */

  return (
    <section className="min-h-screen bg-transparent text-white/90 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* ─── Header ──────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <p className={`text-xs tracking-widest ${a.text} uppercase mb-2 font-medium`}>HR Entitlement</p>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white">Salary & Compensation</h1>
            <p className="text-sm text-white/50 mt-1">Track performance-based salary, generate slips & monitor incentives</p>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 bg-white/[0.03] rounded-xl p-1 border border-white/[0.06]">
            <button
              onClick={() => setActiveTab("salary")}
              className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === "salary" ? `${a.bg} ${a.text} ${a.border} border` : "text-white/60 hover:text-white/80"}`}
            >
              <IndianRupee size={14} className="inline mr-1.5 -mt-0.5" />Salary
            </button>
            <button
              onClick={() => setActiveTab("incentives")}
              className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === "incentives" ? `${a.bg} ${a.text} ${a.border} border` : "text-white/60 hover:text-white/80"}`}
            >
              <Sparkles size={14} className="inline mr-1.5 -mt-0.5" />Incentives
            </button>
          </div>
        </div>

        {/* ═══════════ SALARY TAB ═══════════ */}
        {activeTab === "salary" && (
          <>
            {/* Month selector + Download */}
            <div className="flex flex-wrap items-center gap-4">
              <div className="relative w-56">
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="appearance-none w-full bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-xl
                             px-4 py-3 text-sm text-white/90 focus:border-yellow-400/50 focus:ring-1 focus:ring-yellow-400/50 focus:outline-none
                             cursor-pointer pr-10 hover:bg-white/[0.06] transition-colors shadow-lg shadow-black/20"
                >
                  {monthOptions.map((k) => (
                    <option key={k} value={k} className="bg-[#0b1220]">{getMonthLabel(k)}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 pointer-events-none" />
              </div>

              <button
                onClick={() => generateSalarySlip(selectedMonth, data, calc, roleConfig)}
                className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold rounded-xl transition-all active:scale-95 ${a.btn} shadow-lg ${a.shadow}`}
              >
                <Download size={16} /> Download Salary Slip
              </button>
            </div>

            {/* ─── Summary Cards ──────────────────────────────── */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <StatCard icon={IndianRupee} label="Base Salary" value={`₹${data.baseSalary.toLocaleString("en-IN")}`} accent={a} />
              <StatCard icon={Target} label="Target Achievement" value={`${calc.achievementPct.toFixed(0)}%`} sub={`${data.achievedKPI}/${data.targetKPI} ${roleConfig.kpiUnit}`} accent={a} />
              <StatCard icon={TrendingUp} label="Performance Pay" value={`₹${calc.performancePay.toLocaleString("en-IN")}`} sub={`Multiplier: ${(calc.performanceMultiplier * 100).toFixed(0)}%`} accent={a} />
              <StatCard icon={IndianRupee} label="Net Payable" value={`₹${calc.netPay.toLocaleString("en-IN")}`} highlight accent={a} />
            </div>

            {/* ─── Target Achievement Visual ─────────────────── */}
            <div className="bg-white/[0.02] backdrop-blur-md rounded-2xl border border-white/[0.05] p-6 space-y-4 shadow-lg shadow-black/20">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-white flex items-center gap-2">
                  <Target size={18} className={a.text} /> Target Achievement — {getMonthLabel(selectedMonth)}
                </h2>
                <span className={`text-xs font-semibold ${a.text} ${a.bg} px-3 py-1 rounded-full border ${a.border}`}>
                  {calc.achievementPct.toFixed(0)}%
                </span>
              </div>
              {/* Progress bar */}
              <div className="w-full bg-white/[0.05] rounded-full h-4 overflow-hidden">
                <div
                  className={`h-full rounded-full ${a.progressBg} transition-all duration-700 ease-out`}
                  style={{ width: `${Math.min(calc.achievementPct, 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-white/50">
                <span>0</span>
                <span>{roleConfig.kpiLabel}: {data.achievedKPI} / {data.targetKPI} {roleConfig.kpiUnit}</span>
                <span>Target</span>
              </div>
            </div>

            {/* ─── Salary Breakdown ───────────────────────────── */}
            <div className="bg-white/[0.02] backdrop-blur-md rounded-2xl border border-white/[0.05] p-6 space-y-4 shadow-lg shadow-black/20">
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                <FileText size={18} className={a.text} /> Salary Breakdown
              </h2>
              <div className="space-y-2">
                <BreakdownRow label="Base Salary" value={`₹${data.baseSalary.toLocaleString("en-IN")}`} />
                <BreakdownRow label={`Performance Multiplier (${(calc.performanceMultiplier * 100).toFixed(0)}%)`} value={`₹${calc.performancePay.toLocaleString("en-IN")}`} />
                <BreakdownRow label="Achievement Bonus" value={`+ ₹${data.bonus.toLocaleString("en-IN")}`} positive />
                <BreakdownRow label="Deductions (PF + ESI + Tax)" value={`- ₹${data.deductions.toLocaleString("en-IN")}`} negative />
                <div className="border-t border-white/10 pt-3 flex justify-between items-center">
                  <span className="text-sm font-semibold text-white">Net Payable</span>
                  <span className={`text-xl font-bold ${a.text}`}>₹{calc.netPay.toLocaleString("en-IN")}</span>
                </div>
              </div>
            </div>

            {/* ─── Monthly History ────────────────────────────── */}
            <div className="bg-white/[0.02] backdrop-blur-md rounded-2xl border border-white/[0.05] overflow-hidden shadow-xl shadow-black/20">
              <div className="px-6 py-5 border-b border-white/[0.05] bg-white/[0.01]">
                <h2 className="text-base font-semibold text-white flex items-center gap-2">
                  <CalendarDays size={18} className={a.text} /> Month-wise Salary History
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-transparent/20 text-white/60">
                    <tr>
                      <th className="px-6 py-4 text-left font-medium">Month</th>
                      <th className="px-6 py-4 text-left font-medium">Base</th>
                      <th className="px-6 py-4 text-left font-medium">Target</th>
                      <th className="px-6 py-4 text-left font-medium">Achieved</th>
                      <th className="px-6 py-4 text-left font-medium">Net Pay</th>
                      <th className="px-6 py-4 text-left font-medium"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.05]">
                    {Object.entries(salaryData).map(([key, row]) => {
                      const c = calcSalary(row);
                      const isExpanded = expandedRow === key;
                      return (
                        <tr key={key} className="hover:bg-white/[0.02] transition-colors cursor-pointer" onClick={() => setExpandedRow(isExpanded ? null : key)}>
                          <td className="px-6 py-4 font-medium text-white/90">{getMonthLabel(key)}</td>
                          <td className="px-6 py-4 text-white/70">₹{row.baseSalary.toLocaleString("en-IN")}</td>
                          <td className="px-6 py-4 text-white/70">{row.targetKPI}</td>
                          <td className="px-6 py-4">
                            <span className={row.achievedKPI >= row.targetKPI ? "text-emerald-400" : "text-amber-400"}>
                              {row.achievedKPI}
                            </span>
                          </td>
                          <td className={`px-6 py-4 font-bold ${a.text}`}>₹{c.netPay.toLocaleString("en-IN")}</td>
                          <td className="px-6 py-4">
                            {isExpanded ? <ChevronUp size={16} className="text-white/40" /> : <ChevronDown size={16} className="text-white/40" />}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* ═══════════ INCENTIVES TAB ═══════════ */}
        {activeTab === "incentives" && (
          <div className="space-y-6">
            {/* Summary cards */}
            <div className="grid sm:grid-cols-3 gap-5">
              <StatCard
                icon={Award}
                label="Total Earned"
                value={`₹${incentives.filter(i => i.status === "Paid").reduce((s, i) => s + i.amount, 0).toLocaleString("en-IN")}`}
                accent={a}
              />
              <StatCard
                icon={Clock}
                label="Pending"
                value={`₹${incentives.filter(i => i.status === "Pending").reduce((s, i) => s + i.amount, 0).toLocaleString("en-IN")}`}
                accent={a}
              />
              <StatCard
                icon={Sparkles}
                label="Incentive Schemes"
                value={new Set(incentives.map(i => i.type)).size}
                sub="Active schemes"
                accent={a}
              />
            </div>

            {/* Incentive table */}
            <div className="bg-white/[0.02] backdrop-blur-md rounded-2xl border border-white/[0.05] overflow-hidden shadow-xl shadow-black/20">
              <div className="px-6 py-5 border-b border-white/[0.05] bg-white/[0.01]">
                <h2 className="text-base font-semibold text-white flex items-center gap-2">
                  <Award size={18} className={a.text} /> Incentive Tracker
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-transparent/20 text-white/60">
                    <tr>
                      <th className="px-6 py-4 text-left font-medium">Incentive Type</th>
                      <th className="px-6 py-4 text-left font-medium">Period</th>
                      <th className="px-6 py-4 text-left font-medium">Target</th>
                      <th className="px-6 py-4 text-left font-medium">Achieved</th>
                      <th className="px-6 py-4 text-left font-medium">Amount</th>
                      <th className="px-6 py-4 text-left font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.05]">
                    {incentives.map((inc) => (
                      <tr key={inc.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-lg ${a.bg} flex items-center justify-center border ${a.border}`}>
                              <Award size={14} className={a.text} />
                            </div>
                            <span className="font-medium text-white/90">{inc.type}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-white/60">{inc.month}</td>
                        <td className="px-6 py-4 text-white/70">{inc.target}</td>
                        <td className="px-6 py-4">
                          <span className={inc.achieved >= inc.target ? "text-emerald-400 font-semibold" : "text-amber-400"}>
                            {inc.achieved}
                          </span>
                        </td>
                        <td className={`px-6 py-4 font-bold ${inc.amount > 0 ? a.text : "text-white/40"}`}>
                          {inc.amount > 0 ? `₹${inc.amount.toLocaleString("en-IN")}` : "—"}
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={inc.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SUB-COMPONENTS
═══════════════════════════════════════════════════════════════ */

function StatCard({ icon: Icon, label, value, sub, highlight, accent: a }) {
  return (
    <div className={`bg-white/[0.02] backdrop-blur-md rounded-2xl border border-white/[0.05] p-6 transition-all duration-300 shadow-lg shadow-black/20 hover:bg-white/[0.04] ${highlight ? `ring-1 ${a.ring} ${a.shadow} scale-[1.02]` : ""}`}>
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-10 h-10 rounded-xl ${a.bg} flex items-center justify-center border ${a.border}`}>
          <Icon size={18} className={a.text} />
        </div>
        <span className="text-xs text-white/60 uppercase tracking-widest font-medium">{label}</span>
      </div>
      <p className={`text-2xl sm:text-3xl font-bold ${highlight ? a.text : "text-white"} drop-shadow-sm`}>{value}</p>
      {sub && <p className="text-xs text-slate-500 mt-2 font-medium">{sub}</p>}
    </div>
  );
}

function BreakdownRow({ label, value, positive, negative }) {
  return (
    <div className="flex justify-between items-center bg-white/[0.02] rounded-xl px-4 py-3 border border-white/[0.03]">
      <span className="text-sm text-white/70">{label}</span>
      <span className={`text-sm font-semibold ${positive ? "text-emerald-400" : negative ? "text-red-400" : "text-white/90"}`}>{value}</span>
    </div>
  );
}

function StatusBadge({ status }) {
  const config = {
    Paid: { icon: CheckCircle2, bg: "bg-emerald-500/10 border-emerald-500/20", text: "text-emerald-400" },
    Pending: { icon: Clock, bg: "bg-amber-500/10 border-amber-500/20", text: "text-amber-400" },
    "Not Eligible": { icon: AlertCircle, bg: "bg-red-500/10 border-red-500/20", text: "text-red-400" },
    "N/A": { icon: AlertCircle, bg: "bg-slate-500/10 border-slate-500/20", text: "text-slate-400" },
  };
  const c = config[status] || config["N/A"];
  const Icon = c.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${c.bg} ${c.text}`}>
      <Icon size={12} /> {status}
    </span>
  );
}
