import { useState, useMemo, useRef, useEffect } from "react";

/* ===================== AUTO-GENERATED 6 MONTH DATA ===================== */

function generateTrainerData() {
  const data = {};
  const baseDate = new Date(2026, 1, 1);

  for (let m = 0; m < 6; m++) {
    const date = new Date(baseDate.getFullYear(), baseDate.getMonth() - m, 1);
    const year = date.getFullYear();
    const month = date.getMonth();

    const monthKey = `${year}-${String(month + 1).padStart(2, "0")}`;
    data[monthKey] = {};

    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let d = 1; d <= daysInMonth; d++) {
      const current = new Date(year, month, d);
      if (current.getDay() === 0) continue; // Skip Sundays

      data[monthKey][String(d).padStart(2, "0")] = {
        hours: Number((4 + Math.random() * 4).toFixed(1)),
        activities: Math.floor(1 + Math.random() * 5),
        projects: Math.random() > 0.7 ? 1 : 0,
        visits: Math.random() > 0.8 ? 1 : 0,
      };
    }
  }

  return data;
}

const monthlyData = generateTrainerData();

/* ===================== TRAINER PROFILE ===================== */

const trainer = {
  name: "Gautam Samanta",
  id: "TRN120",
  designation: "Senior Technical Trainer",
  specialization: "Electrical & Safety",
  location: "Khordha, Odisha",
  image:
    "https://images.unsplash.com/photo-1603415526960-f7e0328c63b1?q=80&w=300",
  totCertificate:
    "https://images.unsplash.com/photo-1586281380349-632531db7ed4?q=80&w=1200",
};

/* ===================== CONSTANTS ===================== */

const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const months = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];

const years = Array.from({ length: 6 }, (_, i) => 2024 + i);

/* ===================== HELPERS ===================== */

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getStartDay(year, month) {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1;
}

/* ===================== COMPONENT ===================== */

export default function Section2() {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 1, 1));
  const [selectedDay, setSelectedDay] = useState(null);
  const [showPicker, setShowPicker] = useState(false);
  const [hasCertificate, setHasCertificate] = useState(true);
  const [showCertificate, setShowCertificate] = useState(false);

  const pickerRef = useRef(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthKey = `${year}-${String(month + 1).padStart(2, "0")}`;

  const daysInMonth = getDaysInMonth(year, month);
  const startDay = getStartDay(year, month);

  useEffect(() => {
    function handleClickOutside(e) {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        setShowPicker(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* ================= MONTHLY TOTALS ================= */

  const monthStats = useMemo(() => {
    const days = monthlyData[monthKey] || {};
    return Object.values(days).reduce(
      (acc, d) => {
        acc.hours += d.hours;
        acc.activities += d.activities;
        acc.projects += d.projects;
        acc.visits += d.visits;
        return acc;
      },
      { hours: 0, activities: 0, projects: 0, visits: 0 }
    );
  }, [monthKey]);

  const dayStats =
    monthlyData[monthKey]?.[String(selectedDay).padStart(2, "0")] || {
      hours: 0,
      activities: 0,
      projects: 0,
      visits: 0,
    };

  return (
    <>
      <section className="grid grid-cols-1 mt-8 p-8 rounded-2xl
        bg-[#111827] border border-slate-700
        xl:grid-cols-[2fr_3fr_1.5fr] gap-8">

        {/* ================= CALENDAR ================= */}
        <div className="bg-[#0f172a] border border-slate-700 rounded-2xl p-6">

          <div className="relative flex justify-between items-center mb-5">

            <button
              onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
              className="text-slate-400 hover:text-emerald-400"
            >
              ←
            </button>

            <button
              onClick={() => setShowPicker((v) => !v)}
              className="font-semibold text-slate-200 hover:text-emerald-400"
            >
              {months[month]} {year}
            </button>

            <button
              onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
              className="text-slate-400 hover:text-emerald-400"
            >
              →
            </button>

            {showPicker && (
              <div
                ref={pickerRef}
                className="absolute top-12 left-1/2 -translate-x-1/2 z-20
                bg-[#020617] border border-slate-700 rounded-xl shadow-xl p-4 w-56"
              >
                <select
                  value={month}
                  onChange={(e) =>
                    setCurrentDate(new Date(year, Number(e.target.value), 1))
                  }
                  className="w-full mb-3 bg-[#0f172a] border border-slate-700 rounded px-2 py-1 text-slate-200"
                >
                  {months.map((m, i) => (
                    <option key={m} value={i}>{m}</option>
                  ))}
                </select>

                <select
                  value={year}
                  onChange={(e) =>
                    setCurrentDate(new Date(Number(e.target.value), month, 1))
                  }
                  className="w-full bg-[#0f172a] border border-slate-700 rounded px-2 py-1 text-slate-200"
                >
                  {years.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="grid grid-cols-7 text-center text-xs text-slate-500 mb-3">
            {weekDays.map((d) => (
              <div key={d}>{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: startDay }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}

            {Array.from({ length: daysInMonth }, (_, i) => {
              const day = i + 1;
              const key = String(day).padStart(2, "0");
              const hasData = monthlyData[monthKey]?.[key];
              const active = selectedDay === day;

              return (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`rounded-full py-2 text-sm font-medium transition
                    ${
                      active
                        ? "bg-emerald-500 text-black"
                        : hasData
                        ? "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
                        : "bg-slate-800 text-slate-500 hover:bg-slate-700"
                    }`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>

        {/* ================= STATS ================= */}
        <div className="space-y-6">

          <div className="grid grid-cols-2 gap-6 bg-[#0f172a] border border-slate-700 rounded-2xl p-6">
            <Stat label="Monthly Training Hours" value={`${monthStats.hours.toFixed(1)} hrs`} />
            <Stat label="Monthly Activities" value={monthStats.activities} />
            <Stat label="Projects Completed" value={monthStats.projects} />
            <Stat label="Exposure Visits" value={monthStats.visits} />
          </div>

          <div className="grid grid-cols-2 gap-6 bg-[#0f172a] border border-slate-700 rounded-2xl p-6">
            <Stat label={`Hours on ${selectedDay ?? "--"}`} value={`${dayStats.hours} hrs`} />
            <Stat label="Activities" value={dayStats.activities} />
            <Stat label="Projects" value={dayStats.projects} />
            <Stat label="Visits" value={dayStats.visits} />
          </div>
        </div>

        {/* ================= TRAINER ID CARD ================= */}
        <div className="bg-[#0f172a] border border-slate-700 rounded-2xl p-6 text-center">

          <div className="w-24 h-24 mx-auto mb-4 rounded-full border-4 border-emerald-500 overflow-hidden">
            <img
              src={trainer.image}
              alt={trainer.name}
              className="w-full h-full object-cover"
            />
          </div>

          <h4 className="font-semibold text-slate-100">
            {trainer.name}
          </h4>

          <p className="text-sm text-slate-400 mb-4">
            {trainer.id}
          </p>

          <div className="text-sm text-left space-y-2 text-slate-300 mb-6">
            <p><strong className="text-slate-500">Designation:</strong> {trainer.designation}</p>
            <p><strong className="text-slate-500">Specialization:</strong> {trainer.specialization}</p>
            <p><strong className="text-slate-500">Location:</strong> {trainer.location}</p>
          </div>

          {hasCertificate ? (
            <button
              onClick={() => setShowCertificate(true)}
              className="w-full py-2 rounded-md
              bg-emerald-500 text-black font-medium
              hover:bg-emerald-400 transition"
            >
              View TOT Certificate
            </button>
          ) : (
            <button
              className="w-full py-2 rounded-md
              bg-slate-800 border border-slate-600
              text-slate-300 hover:bg-slate-700 transition"
            >
              Upload TOT Certificate
            </button>
          )}

          <button
            onClick={() => setHasCertificate((prev) => !prev)}
            className="mt-4 text-xs text-slate-400 hover:text-emerald-400 underline"
          >
            Toggle Certificate State (Demo)
          </button>
        </div>
      </section>

      {/* ================= CERTIFICATE MODAL ================= */}
      {showCertificate && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
          onClick={() => setShowCertificate(false)}
        >
          <div
            className="bg-[#0f172a] border border-slate-700 rounded-xl p-6
            max-w-3xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-slate-100 mb-4">
              TOT Certification Document
            </h3>

            <img
              src={trainer.totCertificate}
              alt="TOT Certificate"
              className="rounded-lg border border-slate-700"
            />

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowCertificate(false)}
                className="px-4 py-2 bg-emerald-500 text-black rounded-md"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ================= SMALL UI ================= */

function Stat({ label, value }) {
  return (
    <div>
      <p className="text-sm text-slate-400">{label}</p>
      <p className="text-2xl font-bold text-slate-100 mt-1">{value}</p>
    </div>
  );
}
