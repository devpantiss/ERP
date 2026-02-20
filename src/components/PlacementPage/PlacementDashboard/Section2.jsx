import { useState, useMemo } from "react";

/* ===================== INDUSTRIES ===================== */

const industries = [
  "Tata Steel",
  "JSW",
  "Vedanta",
  "Adani Power",
  "NTPC",
  "Hindalco",
  "L&T Construction",
  "Reliance Industries",
  "Jindal Steel",
  "Ultratech Cement",
  "GMR Energy",
  "Tata Projects",
  "JSPL",
  "Aditya Birla Group",
];

/* ===================== GENERATE MONTH DATA ===================== */

function generateMonth(daysCount) {
  const data = {};

  for (let i = 1; i <= daysCount; i++) {
    const day = String(i).padStart(2, "0");

    data[day] = {
      placed: Math.floor(Math.random() * 8) + 4,
      visits: [
        industries[Math.floor(Math.random() * industries.length)],
        industries[Math.floor(Math.random() * industries.length)],
      ],
    };
  }

  return data;
}

/* ===================== PROJECT DATA ===================== */

const projectMonthlyData = {
  "Shaksham Sundargarh": {
    "2026-01": generateMonth(22),
    "2026-02": generateMonth(20),
    "2026-03": generateMonth(23),
    "2026-04": generateMonth(21),
    "2026-05": generateMonth(19),
  },

  "DMF Jajpur": {
    "2026-01": generateMonth(20),
    "2026-02": generateMonth(19),
    "2026-03": generateMonth(21),
    "2026-04": generateMonth(20),
    "2026-05": generateMonth(22),
  },

  "DMF Kalahandi": {
    "2026-02": generateMonth(19),
    "2026-03": generateMonth(20),
  },

  "DMF Keonjhar": {
    "2026-03": generateMonth(21),
    "2026-04": generateMonth(20),
  },
};

/* ===================== OFFICER ===================== */

const projectOfficer = {
  "Shaksham Sundargarh": {
    name: "Rahul Mishra",
    id: "POF210",
    designation: "Placement Officer",
    email: "rahul@gmail.com",
    phone: "9876543210",
    location: "Sundargarh",
    companiesLinked: 24,
    totalPlacements: 420,
    image:
      "https://images.unsplash.com/photo-1603415526960-f7e0328c63b1?q=80&w=300",
  },

  "DMF Jajpur": {
    name: "Anita Das",
    id: "POF320",
    designation: "Placement Officer",
    email: "anita@gmail.com",
    phone: "9871111111",
    location: "Jajpur",
    companiesLinked: 18,
    totalPlacements: 280,
    image:
      "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=300",
  },
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

/* ===================== MAIN COMPONENT ===================== */

export default function Section2({ project }) {

  const monthlyData = projectMonthlyData[project] || {};
  const officer =
    projectOfficer[project] || projectOfficer["Shaksham Sundargarh"];

  const [currentDate, setCurrentDate] = useState(new Date(2026, 0, 1));
  const [selectedDay, setSelectedDay] = useState(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthKey = `${year}-${String(month + 1).padStart(2, "0")}`;

  const daysInMonth = getDaysInMonth(year, month);
  const startDay = getStartDay(year, month);

  /* ================= MONTH STATS ================= */

  const monthStats = useMemo(() => {
    const days = monthlyData[monthKey] || {};

    let placed = 0;
    let visits = 0;

    Object.values(days).forEach((d) => {
      placed += d.placed || 0;
      visits += d.visits?.length || 0;
    });

    return { placed, visits };
  }, [monthKey, monthlyData]);

  /* ================= DAY STATS ================= */

  const dayData =
    monthlyData[monthKey]?.[
      String(selectedDay).padStart(2, "0")
    ] || {};

  const dayVisits = dayData.visits || [];

  return (
    <section className="grid grid-cols-1 xl:grid-cols-[2fr_3fr_1.5fr] gap-6 mt-6">

      {/* ================= CALENDAR ================= */}
      <Card title={`${project} — Activity Calendar`}>
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

      {/* ================= INSIGHTS ================= */}
      <Card title="Placement Insights">

        <div className="grid grid-cols-2 gap-4 mb-6">
          <Kpi label="Placed (Month)" value={monthStats.placed} />
          <Kpi label="Industry Visits (Month)" value={monthStats.visits} />
        </div>

        <div className="bg-[#0b0f14] border border-cyan-400/30 rounded-xl p-4">

          <p className="text-xs text-slate-400 mb-2">
            Industries Visited (Day)
          </p>

          {dayVisits.length === 0 ? (
            <p className="text-slate-500 text-sm">
              No visits recorded
            </p>
          ) : (
            <ul className="space-y-1">
              {dayVisits.map((v, i) => (
                <li key={i} className="text-sm text-cyan-300">
                  • {v}
                </li>
              ))}
            </ul>
          )}

        </div>

      </Card>

      {/* ================= OFFICER ================= */}
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
                    ? "bg-cyan-400/20 text-cyan-300"
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

/* ===================== UI ===================== */

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

function ProfileRow({ label, value }) {
  return (
    <div className="flex justify-between">
      <span className="text-slate-400">{label}</span>
      <span className="text-slate-200 font-medium">{value}</span>
    </div>
  );
}
