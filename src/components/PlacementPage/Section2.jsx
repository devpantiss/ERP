import { useState, useMemo } from "react";

/* ===================== DATA ===================== */

const monthlyData = {
  "2026-02": {
    "01": { placed: 9, joined: 7, salary: 12800, retention: "Active" },
    "02": { placed: 11, joined: 9, salary: 14200, retention: "Active" },
    "04": { placed: 14, joined: 12, salary: 15500, retention: "Active" },
    "06": { placed: 10, joined: 8, salary: 13800, retention: "Dropout" },
    "09": { placed: 16, joined: 13, salary: 16500, retention: "Active" },
  },
};

const officer = {
  name: "Rahul Mishra",
  id: "POF210",
  designation: "Placement Officer",
  email: "rahul.mishra@gmail.com",
  phone: "9876543210",
  location: "Bhubaneswar, Odisha",
  companiesLinked: 24,
  totalPlacements: 420,
  image:
    "https://images.unsplash.com/photo-1603415526960-f7e0328c63b1?q=80&w=300",
};

/* ===================== HELPERS ===================== */

const months = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

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

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthKey = `${year}-${String(month + 1).padStart(2, "0")}`;

  const daysInMonth = getDaysInMonth(year, month);
  const startDay = getStartDay(year, month);

  const monthStats = useMemo(() => {
    const days = monthlyData[monthKey] || {};
    return Object.values(days).reduce(
      (acc, d) => {
        acc.placed += d.placed;
        acc.joined += d.joined;
        return acc;
      },
      { placed: 0, joined: 0 }
    );
  }, [monthKey]);

  const dayStats =
    monthlyData[monthKey]?.[String(selectedDay).padStart(2, "0")] || {
      placed: 0,
      joined: 0,
      salary: 0,
      retention: "-",
    };

  return (
    <section className="grid grid-cols-1 xl:grid-cols-[2fr_3fr_1.5fr] gap-6 mt-6">

      {/* ================= CALENDAR ================= */}
      <Card title="Placement Activity Calendar">

        <Calendar
          year={year}
          month={month}
          setCurrentDate={setCurrentDate}
          selectedDay={selectedDay}
          setSelectedDay={setSelectedDay}
          startDay={startDay}
          daysInMonth={daysInMonth}
          data={monthlyData[monthKey]}
        />

      </Card>

      {/* ================= STATS ================= */}
      <Card title="Placement Insights">

        {/* Monthly Summary */}
        <div className="grid grid-cols-2 gap-4 mb-6">

          <Kpi label="Placed (Month)" value={monthStats.placed} />
          <Kpi label="Joined (Month)" value={monthStats.joined} />

        </div>

        {/* Daily Stats */}
        <div className="grid grid-cols-2 gap-4">

          <Stat label="Placed Today" value={dayStats.placed} />
          <Stat label="Joined Today" value={dayStats.joined} />
          <Stat label="Avg Salary" value={`₹ ${dayStats.salary}`} />
          <Stat label="Retention" value={dayStats.retention} />

        </div>

      </Card>

      {/* ================= PROFILE ================= */}
      <Card title="Placement Officer">

        <div className="flex flex-col items-center text-center">

          <img
            src={officer.image}
            className="w-24 h-24 rounded-full border-4 border-cyan-400 object-cover mb-4"
          />

          <h3 className="font-semibold text-slate-100">
            {officer.name}
          </h3>

          <p className="text-xs text-slate-400 mb-4">
            {officer.id} • {officer.designation}
          </p>

        </div>

        <div className="space-y-2 text-sm mt-4">

          <ProfileRow label="Email" value={officer.email} />
          <ProfileRow label="Phone" value={officer.phone} />
          <ProfileRow label="Location" value={officer.location} />
          <ProfileRow label="Companies Linked" value={officer.companiesLinked} />
          <ProfileRow label="Total Placements" value={officer.totalPlacements} />

        </div>

      </Card>

    </section>
  );
}

/* ===================== CALENDAR ===================== */

function Calendar({
  year,
  month,
  setCurrentDate,
  selectedDay,
  setSelectedDay,
  startDay,
  daysInMonth,
  data,
}) {
  return (
    <>
      <div className="flex justify-between items-center mb-4">

        <button
          onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
          className="text-slate-400 hover:text-cyan-400"
        >
          ←
        </button>

        <p className="font-semibold text-slate-200">
          {months[month]} {year}
        </p>

        <button
          onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
          className="text-slate-400 hover:text-cyan-400"
        >
          →
        </button>

      </div>

      <div className="grid grid-cols-7 gap-2">

        {Array.from({ length: startDay }).map((_, i) => (
          <div key={i} />
        ))}

        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1;
          const key = String(day).padStart(2, "0");
          const hasData = data?.[key];
          const active = selectedDay === day;

          return (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`rounded-full py-2 text-sm font-medium transition
                ${
                  active
                    ? "bg-cyan-400 text-black"
                    : hasData
                    ? "bg-cyan-400/20 text-cyan-300 hover:bg-cyan-400/30"
                    : "bg-white/5 text-slate-400"
                }`}
            >
              {day}
            </button>
          );
        })}

      </div>
    </>
  );
}

/* ===================== UI COMPONENTS ===================== */

function Card({ title, children }) {
  return (
    <div className="bg-[#111827] border border-cyan-400 rounded-2xl p-6">

      <h2 className="text-sm font-semibold text-slate-200 mb-4">
        {title}
      </h2>

      {children}

    </div>
  );
}

function Kpi({ label, value }) {
  return (
    <div className="bg-[#0b0f14] border border-cyan-400/40 rounded-xl p-4">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="text-2xl font-bold text-slate-100 mt-1">
        {value}
      </p>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="bg-[#0b0f14] border border-cyan-400/30 rounded-xl p-4">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="text-lg font-semibold text-slate-100 mt-1">
        {value}
      </p>
    </div>
  );
}

function ProfileRow({ label, value }) {
  return (
    <div className="flex justify-between">
      <span className="text-slate-400">{label}</span>
      <span className="text-slate-200 font-medium">{value}</span>
    </div>
  );
}
