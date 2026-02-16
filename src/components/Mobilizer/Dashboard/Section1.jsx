import { useState, useEffect } from "react";
import {
  Users,
  Megaphone,
  IndianRupee,
  ArrowRightLeft,
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

/* ===================== BANK DATA ===================== */

const initialBankDetails = {
  bankName: "State Bank of India",
  accountHolder: "Gautam Samanta",
  accountNumber: "3500624153309",
  ifsc: "SBIN0001234",
  branch: "Cuttack Main Branch",
  passbookImage: "/passbook.jpeg",
};

/* ===================== MAIN COMPONENT ===================== */

export default function Section1({
  totalData = {
    mobilized: 820,
    mobilizedTarget: 1000,
    drives: 42,
    drivesTarget: 60,
    enrolled: 610,
    revenuePerCandidate: 3500,
  },
  lastMonthData = {
    mobilized: 120,
    mobilizedTarget: 150,
    drives: 6,
    drivesTarget: 10,
    enrolled: 95,
    revenuePerCandidate: 3500,
  },
}) {
  const [view, setView] = useState("total");
  const [showBankModal, setShowBankModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [bankDetails, setBankDetails] = useState(initialBankDetails);

  const data = view === "total" ? totalData : lastMonthData;

  const animatedMobilized = useCountUp(data.mobilized);
  const animatedDrives = useCountUp(data.drives);

  /* ===== Conversion ===== */
  const conversionPie = [
    { name: "Enrolled", value: data.enrolled },
    { name: "Not Enrolled", value: data.mobilized - data.enrolled },
  ];

  const conversionRate =
    data.mobilized > 0
      ? Math.round((data.enrolled / data.mobilized) * 100)
      : 0;

  /* ===== Revenue ===== */
  const totalRevenue = data.enrolled * data.revenuePerCandidate;
  const withdrawnRevenue = Math.floor(totalRevenue * 0.65);
  const remainingRevenue = totalRevenue - withdrawnRevenue;

  const animatedRevenue = useCountUp(totalRevenue);

  const revenuePie = [
    { name: "Remaining", value: remainingRevenue },
    { name: "Withdrawn", value: withdrawnRevenue },
  ];

  /* ===== Target Pie ===== */
  const targetPie = (achieved, target) => [
    { name: "Achieved", value: achieved },
    { name: "Remaining", value: Math.max(target - achieved, 0) },
  ];

  function handleBankChange(e) {
    const { name, value } = e.target;
    setBankDetails((prev) => ({ ...prev, [name]: value }));
  }

  return (
    <section className="relative w-full rounded-2xl p-6
      bg-[#0b0f14] border border-yellow-400 overflow-hidden">

      {/* ===== GRID BACKGROUND (SAME AS Section4) ===== */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.15]"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(250,204,21,0.4) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(250,204,21,0.4) 1px, transparent 1px)
          `,
          backgroundSize: "28px 28px",
        }}
      />

      {/* ===== CONTENT ===== */}
      <div className="relative z-10">

        {/* HEADER */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-slate-100 text-lg font-semibold">
            Performance Overview
          </h2>

          <div className="flex rounded-lg border border-yellow-400 overflow-hidden text-sm">
            {["total", "month"].map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-4 py-1.5 transition ${
                  view === v
                    ? "bg-yellow-400 text-black"
                    : "bg-white/5 text-slate-300 hover:bg-white/10"
                }`}
              >
                {v === "total" ? "Total" : "Last 30 Days"}
              </button>
            ))}
          </div>
        </div>

        {/* GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

          <KpiCard
            title="Mobilized Candidates"
            value={animatedMobilized}
            target={`Target: ${data.mobilizedTarget}`}
            icon={<Users size={18} />}
            pie={targetPie(data.mobilized, data.mobilizedTarget)}
          />

          <KpiCard
            title="Community Drives"
            value={animatedDrives}
            target={`Target: ${data.drivesTarget}`}
            icon={<Megaphone size={18} />}
            pie={targetPie(data.drives, data.drivesTarget)}
          />

          <KpiCard
            title="Mobilized → Enrolled"
            value={`${data.enrolled} / ${data.mobilized}`}
            target={`Conversion: ${conversionRate}%`}
            icon={<ArrowRightLeft size={18} />}
            pie={conversionPie}
          />

          <KpiCard
            title="Revenue Overview"
            value={`₹ ${animatedRevenue.toLocaleString("en-IN")}`}
            target="View Bank Details"
            icon={<IndianRupee size={18} />}
            pie={revenuePie}
            currency
            onAction={() => setShowBankModal(true)}
          />
        </div>
      </div>

      {/* ================= BANK MODAL ================= */}
      {showBankModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center">
          <div className="bg-[#020617] border border-yellow-400/30
            rounded-2xl w-full max-w-lg p-6 text-slate-200">

            <h3 className="text-lg font-semibold mb-4">
              {editMode ? "Edit Bank Details" : "Bank Details"}
            </h3>

            {!editMode ? (
              <>
                <Detail label="Bank Name" value={bankDetails.bankName} />
                <Detail label="Account Holder" value={bankDetails.accountHolder} />
                <Detail label="Account Number" value={bankDetails.accountNumber} />
                <Detail label="IFSC Code" value={bankDetails.ifsc} />
                <Detail label="Branch" value={bankDetails.branch} />

                <img
                  src={bankDetails.passbookImage}
                  className="mt-4 w-[260px] rounded-lg border border-yellow-400/30 bg-white p-2"
                  alt="Passbook"
                />

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={() => setShowBankModal(false)}
                    className="px-4 py-2 rounded-md bg-white/10"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => setEditMode(true)}
                    className="px-4 py-2 rounded-md bg-yellow-400 text-black"
                  >
                    Edit
                  </button>
                </div>
              </>
            ) : (
              <>
                {["bankName", "accountHolder", "accountNumber", "ifsc", "branch"].map(
                  (f) => (
                    <Input
                      key={f}
                      label={f.replace(/([A-Z])/g, " $1")}
                      name={f}
                      value={bankDetails[f]}
                      onChange={handleBankChange}
                    />
                  )
                )}

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={() => setEditMode(false)}
                    className="px-4 py-2 rounded-md bg-white/10"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => setEditMode(false)}
                    className="px-4 py-2 rounded-md bg-yellow-400 text-black"
                  >
                    Save
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

/* ===================== KPI CARD ===================== */

function KpiCard({ title, value, target, icon, pie, currency, onAction }) {
  const [activeIndex, setActiveIndex] = useState(null);

  const percent =
    pie[0].value + pie[1].value > 0
      ? Math.round((pie[0].value / (pie[0].value + pie[1].value)) * 100)
      : 0;

  return (
    <div className="bg-[#111827] border border-yellow-400 rounded-xl p-5
      hover:shadow-[0_0_30px_rgba(250,204,21,0.15)] transition">

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
                <Cell fill="#22c55e" />
                <Cell fill="#dc2626" />
              </Pie>

              <text
                x="50%"
                y="50%"
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-slate-200 text-xs font-semibold"
              >
                {currency ? "₹" : `${percent}%`}
              </text>

              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div>
          <p className="text-lg font-bold text-slate-100">{value}</p>
          <button
            onClick={onAction}
            className="text-xs text-yellow-400 hover:underline"
          >
            {target}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ===================== SMALL COMPONENTS ===================== */

function Detail({ label, value }) {
  return (
    <p className="text-sm mb-2">
      <span className="text-slate-400">{label}:</span>{" "}
      <span className="text-slate-200">{value}</span>
    </p>
  );
}

function Input({ label, ...props }) {
  return (
    <div className="mb-3">
      <label className="text-sm text-slate-400">{label}</label>
      <input
        {...props}
        className="w-full mt-1 rounded-md bg-[#111827]
        border border-yellow-400 px-3 py-2
        text-sm text-slate-200 focus:outline-none"
      />
    </div>
  );
}
