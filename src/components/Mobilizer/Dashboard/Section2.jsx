import { useState, useMemo, useRef, useEffect } from "react";

/* ===================== DUMMY DATA ===================== */

const monthlyData = {
  "2026-01": {
    "04": { mobilized: 32, enrolled: 18, workingHours: 6.5 },
    "07": { mobilized: 21, enrolled: 10, workingHours: 5 },
    "15": { mobilized: 45, enrolled: 22, workingHours: 7.5 },
    "21": { mobilized: 40, enrolled: 24, workingHours: 8 },
    "27": { mobilized: 34, enrolled: 17, workingHours: 6 },
  },
  "2026-02": {
    "01": { mobilized: 20, enrolled: 11, workingHours: 5.5 },
    "02": { mobilized: 26, enrolled: 14, workingHours: 6 },
    "04": { mobilized: 35, enrolled: 20, workingHours: 7 },
    "06": { mobilized: 29, enrolled: 16, workingHours: 6.5 },
    "09": { mobilized: 41, enrolled: 25, workingHours: 8 },
    "10": { mobilized: 37, enrolled: 22, workingHours: 7.5 },
  },
};

const mobilizer = {
  name: "Gautam Samanta",
  id: "MWC120",
  age: 26,
  gender: "Male",
  email: "gautamsam23@gmail.com",
  phone: "9865262024",
  designation: "Senior Mobilizer",
  location: "Khordha, Odisha",
  image:
    "https://images.unsplash.com/photo-1603415526960-f7e0328c63b1?q=80&w=300",
};

const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const months = [
  "January", "February", "March", "April",
  "May", "June", "July", "August",
  "September", "October", "November", "December",
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
  const pickerRef = useRef(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthKey = `${year}-${String(month + 1).padStart(2, "0")}`;

  const daysInMonth = getDaysInMonth(year, month);
  const startDay = getStartDay(year, month);

  /* Close picker on outside click */
  useEffect(() => {
    function handleClickOutside(e) {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        setShowPicker(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* ===================== STATS ===================== */

  const monthStats = useMemo(() => {
    const days = monthlyData[monthKey] || {};
    return Object.values(days).reduce(
      (acc, d) => {
        acc.mobilized += d.mobilized;
        acc.enrolled += d.enrolled;
        return acc;
      },
      { mobilized: 0, enrolled: 0 }
    );
  }, [monthKey]);

  const dayStats =
    monthlyData[monthKey]?.[String(selectedDay).padStart(2, "0")] || {
      mobilized: 0,
      enrolled: 0,
      workingHours: 0,
    };

  return (
    <section className="grid grid-cols-1 mt-6 p-6 rounded-2xl
      bg-[#0b0f14] border border-yellow-400
      xl:grid-cols-[2fr_3fr_1.5fr] gap-6">

      {/* ================= CALENDAR ================= */}
      <div className="bg-[#111827] border border-yellow-400 rounded-2xl p-5">
        <div className="relative flex justify-between items-center mb-4">

          <button
            onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
            className="text-slate-400 hover:text-yellow-400"
          >
            ←
          </button>

          <button
            onClick={() => setShowPicker((v) => !v)}
            className="font-semibold text-slate-200 hover:text-yellow-400"
          >
            {months[month]} {year}
          </button>

          <button
            onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
            className="text-slate-400 hover:text-yellow-400"
          >
            →
          </button>

          {showPicker && (
            <div
              ref={pickerRef}
              className="absolute top-10 left-1/2 -translate-x-1/2 z-20
              bg-[#020617] border border-yellow-400 rounded-xl shadow-lg p-4 w-56"
            >
              <div className="mb-3">
                <label className="text-xs text-slate-400">Month</label>
                <select
                  value={month}
                  onChange={(e) => {
                    setCurrentDate(new Date(year, Number(e.target.value), 1));
                    setShowPicker(false);
                  }}
                  className="w-full mt-1 bg-[#111827] border border-yellow-400 rounded-md px-2 py-1 text-slate-200"
                >
                  {months.map((m, i) => (
                    <option key={m} value={i}>{m}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-400">Year</label>
                <select
                  value={year}
                  onChange={(e) => {
                    setCurrentDate(new Date(Number(e.target.value), month, 1));
                    setShowPicker(false);
                  }}
                  className="w-full mt-1 bg-[#111827] border border-yellow-400 rounded-md px-2 py-1 text-slate-200"
                >
                  {years.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-7 text-center text-xs text-slate-400 mb-2">
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
                      ? "bg-yellow-400 text-black"
                      : hasData
                      ? "bg-yellow-400/20 text-yellow-300 hover:bg-yellow-400/30"
                      : "bg-white/5 text-slate-400 hover:bg-yellow-400"
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

        <div className="grid grid-cols-2 gap-6 bg-[#111827] border border-yellow-400 rounded-2xl p-6">
          <div>
            <p className="text-sm text-slate-400">Mobilized (Month)</p>
            <p className="text-3xl font-bold text-slate-100">
              {monthStats.mobilized}
            </p>
          </div>
          <div>
            <p className="text-sm text-slate-400">Enrolled (Month)</p>
            <p className="text-3xl font-bold text-slate-100">
              {monthStats.enrolled}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

          <div className="bg-yellow-400/10 border border-yellow-400/30 rounded-xl p-5">
            <p className="text-sm text-yellow-300">
              Mobilized on {selectedDay ?? "--"}
            </p>
            <p className="text-2xl font-bold text-slate-100">
              {dayStats.mobilized}
            </p>
          </div>

          <div className="bg-indigo-400/10 border border-indigo-400/30 rounded-xl p-5">
            <p className="text-sm text-indigo-300">
              Enrolled on {selectedDay ?? "--"}
            </p>
            <p className="text-2xl font-bold text-slate-100">
              {dayStats.enrolled}
            </p>
          </div>

          <div className="bg-amber-400/10 border border-amber-400/30 rounded-xl p-5">
            <p className="text-sm text-amber-300">
              Working Hours on {selectedDay ?? "--"}
            </p>
            <p className="text-2xl font-bold text-slate-100">
              {dayStats.workingHours} hrs
            </p>
          </div>

        </div>
      </div>

      {/* ================= ID CARD ================= */}
      <div className="bg-[#111827] border border-yellow-400 rounded-2xl p-6 text-center">
        <div className="w-24 h-24 mx-auto mb-4 rounded-full border-4 border-yellow-400 overflow-hidden">
          <img
            src={mobilizer.image}
            alt={mobilizer.name}
            className="w-full h-full object-cover"
          />
        </div>

        <h4 className="font-semibold text-slate-100">
          {mobilizer.name}
        </h4>
        <p className="text-sm text-slate-400 mb-4">
          {mobilizer.id}
        </p>

        <div className="text-sm text-left space-y-2 text-slate-300">
          <p><strong className="text-slate-400">Age:</strong> {mobilizer.age}</p>
          <p><strong className="text-slate-400">Gender:</strong> {mobilizer.gender}</p>
          <p><strong className="text-slate-400">Email:</strong> {mobilizer.email}</p>
          <p><strong className="text-slate-400">Phone:</strong> {mobilizer.phone}</p>
          <p><strong className="text-slate-400">Designation:</strong> {mobilizer.designation}</p>
          <p><strong className="text-slate-400">Location:</strong> {mobilizer.location}</p>
        </div>
      </div>
    </section>
  );
}
