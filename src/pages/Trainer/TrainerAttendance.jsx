import { useEffect, useMemo, useRef, useState } from "react";
import Webcam from "react-webcam";

/* ================= CONFIG ================= */

const STORAGE_KEY = "trainer-attendance-v4";

const SESSIONS = [
  { key: "s1", label: "09:00–11:00", start: "09:00" },
  { key: "s2", label: "11:30–13:30", start: "11:30" },
  { key: "s3", label: "14:30–16:30", start: "14:30" },
];

const LATE_BUFFER = 10;
const todayKey = () => new Date().toISOString().split("T")[0];

/* ================= UTILITIES ================= */

const parseTimeToMinutes = (timeStr) => {
  if (!timeStr) return null;
  const [time, mod] = timeStr.split(" ");
  let [h, m] = time.split(":").map(Number);
  if (mod === "PM" && h !== 12) h += 12;
  if (mod === "AM" && h === 12) h = 0;
  return h * 60 + m;
};

const calculateHours = (inTime, outTime) => {
  const inMin = parseTimeToMinutes(inTime);
  const outMin = parseTimeToMinutes(outTime);
  if (!inMin || !outMin) return 0;
  return ((outMin - inMin) / 60).toFixed(2);
};

const getStatus = (inTime, start) => {
  if (!inTime) return null;
  const [sh, sm] = start.split(":").map(Number);
  const threshold = sh * 60 + sm + LATE_BUFFER;
  return parseTimeToMinutes(inTime) <= threshold ? "On-time" : "Late";
};

const reverseGeocode = async (lat, lng) => {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
    );
    const data = await res.json();
    return (
      data.address?.suburb ||
      data.address?.city ||
      data.address?.town ||
      "Unknown"
    );
  } catch {
    return "Unavailable";
  }
};

/* ================= COMPONENT ================= */

export default function TrainerAttendance() {
  const webcamRef = useRef(null);

  const [attendance, setAttendance] = useState({});
  const [activePunch, setActivePunch] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [mapData, setMapData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    setAttendance(stored);
  }, []);

  const persist = (data) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    setAttendance(data);
  };

  /* ================= SESSION VALIDATION ================= */

  const validateSession = (index, type) => {
    const today = todayKey();
    const todayRecord = attendance[today] || { sessions: {} };

    if (index > 0) {
      const prev = todayRecord.sessions[SESSIONS[index - 1].key];
      if (!prev?.punchIn || !prev?.punchOut) {
        setError("Complete previous session first.");
        return false;
      }
    }

    const current = todayRecord.sessions[SESSIONS[index].key];

    if (type === "in" && current?.punchIn) {
      setError("Already punched in.");
      return false;
    }

    if (type === "out" && !current?.punchIn) {
      setError("Punch-In required first.");
      return false;
    }

    setError("");
    return true;
  };

  /* ================= PUNCH HANDLER ================= */

  const handlePunch = () => {
    setLoading(true);
    const today = todayKey();
    const todayRecord = attendance[today] || { sessions: {} };
    const sessionData = todayRecord.sessions[activePunch.key] || {};

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const image = webcamRef.current?.getScreenshot();
        if (!image) {
          setError("Camera unavailable.");
          setLoading(false);
          return;
        }

        const place = await reverseGeocode(
          pos.coords.latitude,
          pos.coords.longitude
        );

        const updated = {
          ...attendance,
          [today]: {
            sessions: {
              ...todayRecord.sessions,
              [activePunch.key]: {
                ...sessionData,
                [activePunch.type === "in" ? "punchIn" : "punchOut"]: {
                  time: new Date().toLocaleTimeString(),
                  image,
                  lat: pos.coords.latitude,
                  lng: pos.coords.longitude,
                  place,
                },
              },
            },
          },
        };

        persist(updated);
        setActivePunch(null);
        setLoading(false);
      },
      () => {
        setError("Location permission denied.");
        setLoading(false);
      }
    );
  };

  /* ================= SUMMARY ================= */

  const metrics = useMemo(() => {
    let totalHours = 0;
    let sessionsDone = 0;

    Object.values(attendance).forEach((day) => {
      SESSIONS.forEach((s) => {
        const d = day.sessions?.[s.key];
        if (d?.punchIn && d?.punchOut) {
          sessionsDone++;
          totalHours += parseFloat(
            calculateHours(d.punchIn.time, d.punchOut.time)
          );
        }
      });
    });

    return {
      workingDays: Object.keys(attendance).length,
      sessionsDone,
      totalHours: totalHours.toFixed(2),
    };
  }, [attendance]);

  /* ================= UI ================= */

  return (
    <section className="min-h-screen bg-[#0f172a] text-slate-200 p-10">
      <div className="max-w-7xl mx-auto space-y-10">

        <h1 className="text-3xl font-semibold tracking-tight">
          Trainer Attendance
        </h1>

        {/* SUMMARY CARDS */}
        <div className="grid md:grid-cols-3 gap-6">
          <Stat label="Working Days" value={metrics.workingDays} />
          <Stat label="Sessions Completed" value={metrics.sessionsDone} />
          <Stat label="Total Hours Logged" value={`${metrics.totalHours}h`} highlight />
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 px-4 py-2 rounded text-sm">
            {error}
          </div>
        )}

        {/* SESSION CONTROLS */}
        <div className="grid md:grid-cols-3 gap-6">
          {SESSIONS.map((s, i) => (
            <div key={s.key} className="bg-[#111827] rounded-xl p-5 border border-slate-700">
              <p className="text-sm text-slate-400 mb-4">{s.label}</p>
              <div className="flex gap-3">
                <button
                  onClick={() =>
                    validateSession(i, "in") &&
                    setActivePunch({ key: s.key, type: "in" })
                  }
                  className="px-4 py-2 text-sm bg-emerald-500 text-black rounded-md font-medium hover:bg-emerald-400"
                >
                  Punch In
                </button>

                <button
                  onClick={() =>
                    validateSession(i, "out") &&
                    setActivePunch({ key: s.key, type: "out" })
                  }
                  className="px-4 py-2 text-sm border border-slate-600 rounded-md hover:bg-slate-700"
                >
                  Punch Out
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* TABLE */}
        <div className="bg-[#111827] rounded-xl border border-slate-700 overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-[#0b1220] text-slate-400">
              <tr>
                <th className="p-4 text-left">Date</th>
                {SESSIONS.map((s) => (
                  <th key={s.key} className="p-4 text-left">
                    {s.label}
                  </th>
                ))}
                <th className="p-4 text-left">Total</th>
              </tr>
            </thead>

            <tbody>
              {Object.entries(attendance).reverse().map(([date, day]) => {
                let dayTotal = 0;

                return (
                  <tr key={date} className="border-t border-slate-700 align-top">
                    <td className="p-4 font-medium text-sm">{date}</td>

                    {SESSIONS.map((s) => {
                      const d = day.sessions?.[s.key];
                      const hrs =
                        d?.punchIn && d?.punchOut
                          ? calculateHours(d.punchIn.time, d.punchOut.time)
                          : 0;

                      dayTotal += parseFloat(hrs || 0);
                      const status =
                        d?.punchIn ? getStatus(d.punchIn.time, s.start) : null;

                      return (
                        <td className="p-4">
                          <div className="bg-[#0b1220] p-3 rounded-lg border border-slate-700 space-y-3">

                            <div className="flex justify-between">
                              <span>In</span>
                              <span>{d?.punchIn?.time || "—"}</span>
                            </div>

                            <div className="flex justify-between">
                              <span>Out</span>
                              <span>{d?.punchOut?.time || "—"}</span>
                            </div>

                            <div className="flex justify-between items-center">
                              <span className="font-semibold">
                                {hrs ? `${hrs}h` : "—"}
                              </span>

                              {status && (
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px]
                                  ${
                                    status === "On-time"
                                      ? "bg-emerald-500/10 text-emerald-400"
                                      : "bg-red-500/10 text-red-400"
                                  }`}
                                >
                                  {status}
                                </span>
                              )}
                            </div>

                            <div className="flex gap-2 items-center">
                              {d?.punchIn?.image && (
                                <img
                                  src={d.punchIn.image}
                                  className="w-8 h-8 rounded cursor-pointer border border-slate-600"
                                  onClick={() => setPreviewImage(d.punchIn.image)}
                                />
                              )}

                              {d?.punchOut?.image && (
                                <img
                                  src={d.punchOut.image}
                                  className="w-8 h-8 rounded cursor-pointer border border-slate-600"
                                  onClick={() => setPreviewImage(d.punchOut.image)}
                                />
                              )}

                              {d?.punchIn?.lat && (
                                <button
                                  className="text-emerald-400 text-[10px] underline"
                                  onClick={() =>
                                    setMapData({
                                      lat: d.punchIn.lat,
                                      lng: d.punchIn.lng,
                                    })
                                  }
                                >
                                  Map
                                </button>
                              )}
                            </div>
                          </div>
                        </td>
                      );
                    })}

                    <td className="p-4 font-semibold text-emerald-400 text-sm">
                      {dayTotal.toFixed(2)}h
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* CAMERA MODAL */}
      {activePunch && (
        <Modal onClose={() => setActivePunch(null)}>
          <Webcam ref={webcamRef} screenshotFormat="image/jpeg" />
          <button
            onClick={handlePunch}
            disabled={loading}
            className="w-full mt-4 py-2 bg-emerald-500 text-black rounded font-medium"
          >
            {loading ? "Processing..." : "Capture & Save"}
          </button>
        </Modal>
      )}

      {/* IMAGE MODAL */}
      {previewImage && (
        <Modal onClose={() => setPreviewImage(null)}>
          <img src={previewImage} className="rounded max-w-sm" />
        </Modal>
      )}

      {/* MAP MODAL */}
      {mapData && (
        <Modal onClose={() => setMapData(null)}>
          <iframe
            width="100%"
            height="300"
            className="rounded"
            src={`https://maps.google.com/maps?q=${mapData.lat},${mapData.lng}&z=15&output=embed`}
          />
        </Modal>
      )}
    </section>
  );
}

/* ================= SMALL UI ================= */

const Stat = ({ label, value, highlight }) => (
  <div
    className={`p-6 rounded-xl border ${
      highlight
        ? "border-emerald-500 shadow-lg shadow-emerald-500/10"
        : "border-slate-700"
    } bg-[#111827]`}
  >
    <p className="text-xs text-slate-400">{label}</p>
    <p className="text-2xl font-semibold text-emerald-400 mt-1">
      {value}
    </p>
  </div>
);

const Modal = ({ children, onClose }) => (
  <div
    className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
    onClick={onClose}
  >
    <div
      className="bg-[#111827] p-6 rounded-xl max-w-md w-full border border-slate-700"
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </div>
  </div>
);
