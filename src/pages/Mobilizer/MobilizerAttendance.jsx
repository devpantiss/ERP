import { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";

/* ================= CONFIG ================= */

const STORAGE_KEY = "mobilizer-attendance";
const SHIFT_START = "10:00";
const LATE_AFTER_MINUTES = 15;

const todayKey = () => new Date().toISOString().split("T")[0];
const monthKey = (date) => date.slice(0, 7);

/* ================= HELPERS ================= */

const getPlaceName = async (lat, lng) => {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
    );
    const data = await res.json();
    return (
      data.address?.suburb ||
      data.address?.city ||
      data.address?.town ||
      data.address?.village ||
      "Unknown location"
    );
  } catch {
    return "Location unavailable";
  }
};

const getStatus = (timeStr) => {
  if (!timeStr) return "—";
  const [sh, sm] = SHIFT_START.split(":").map(Number);
  const shiftMinutes = sh * 60 + sm + LATE_AFTER_MINUTES;

  const [time, modifier] = timeStr.split(" ");
  let [h, m] = time.split(":").map(Number);

  if (modifier === "PM" && h !== 12) h += 12;
  if (modifier === "AM" && h === 12) h = 0;

  return h * 60 + m <= shiftMinutes ? "On-time" : "Late";
};

/* ================= MAIN COMPONENT ================= */

const MobilizerAttendance = () => {
  const webcamRef = useRef(null);

  const [attendance, setAttendance] = useState({});
  const [activePunch, setActivePunch] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [mapLocation, setMapLocation] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    setAttendance(stored);
  }, []);

  const saveAttendance = (data) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    setAttendance(data);
  };

  const handlePunch = async () => {
    setError("");
    const today = todayKey();
    const todayRecord = attendance[today] || {};

    if (activePunch === "out" && !todayRecord.punchIn) {
      setError("Punch-In is required before Punch-Out");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const image = webcamRef.current?.getScreenshot();
        if (!image) {
          setError("Camera not ready");
          return;
        }

        const place = await getPlaceName(
          pos.coords.latitude,
          pos.coords.longitude
        );

        saveAttendance({
          ...attendance,
          [today]: {
            ...todayRecord,
            [activePunch === "in" ? "punchIn" : "punchOut"]: {
              time: new Date().toLocaleTimeString(),
              place,
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
              image,
            },
          },
        });

        setActivePunch(null);
      },
      () => setError("Location permission denied")
    );
  };

  const currentMonth = monthKey(todayKey());
  const monthRecords = Object.entries(attendance).filter(
    ([date]) => monthKey(date) === currentMonth
  );

  const summary = {
    workingDays: monthRecords.length,
    present: monthRecords.filter(([, r]) => r.punchIn).length,
    onTime: monthRecords.filter(
      ([, r]) => getStatus(r.punchIn?.time) === "On-time"
    ).length,
    late: monthRecords.filter(
      ([, r]) => getStatus(r.punchIn?.time) === "Late"
    ).length,
  };

  return (
    <section className="min-h-screen bg-[#0b0f14] p-8 text-slate-200">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold">Attendance Management</h1>
          <p className="text-sm text-slate-400">
            Photo & location verified daily attendance
          </p>
        </div>

        {/* Analytics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Stat label="Working Days" value={summary.workingDays} />
          <Stat label="Present" value={summary.present} />
          <Stat label="On-time" value={summary.onTime} />
          <Stat label="Late" value={summary.late} />
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="bg-[#020617] border border-yellow-400/20 rounded-xl p-4 flex gap-4">
          <button
            onClick={() => setActivePunch("in")}
            className="px-5 py-2 bg-yellow-400 text-black rounded-lg text-sm font-semibold hover:bg-yellow-300"
          >
            Punch In
          </button>
          <button
            onClick={() => setActivePunch("out")}
            className="px-5 py-2 border border-yellow-400 text-yellow-400 rounded-lg text-sm hover:bg-yellow-400/10"
          >
            Punch Out
          </button>
        </div>

        {/* Table */}
        <div className="bg-[#020617] border border-yellow-400/20 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[#020617] border-b border-yellow-400/20">
              <tr>
                {[
                  "Date",
                  "Punch In",
                  "Punch Out",
                  "Location",
                  "Status",
                  "In Image",
                  "Out Image",
                ].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-slate-400">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-yellow-400/10">
              {Object.entries(attendance)
                .reverse()
                .map(([date, r]) => {
                  const status = getStatus(r.punchIn?.time);
                  return (
                    <tr key={date} className="hover:bg-yellow-400/5">
                      <td className="px-4 py-3 font-medium">{date}</td>
                      <td className="px-4 py-3">{r.punchIn?.time || "—"}</td>
                      <td className="px-4 py-3">{r.punchOut?.time || "—"}</td>
                      <td className="px-4 py-3 text-xs text-slate-400">
                        {r.punchIn?.place || "—"}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={status} />
                      </td>
                      <td className="px-4 py-3">
                        {r.punchIn?.image && (
                          <img
                            src={r.punchIn.image}
                            className="w-10 h-10 rounded border border-yellow-400/40 cursor-pointer"
                            onClick={() => setPreviewImage(r.punchIn.image)}
                          />
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {r.punchOut?.image && (
                          <img
                            src={r.punchOut.image}
                            className="w-10 h-10 rounded border border-yellow-400/40 cursor-pointer"
                            onClick={() => setPreviewImage(r.punchOut.image)}
                          />
                        )}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Camera Modal */}
      {activePunch && (
        <Modal onClose={() => setActivePunch(null)}>
          <h3 className="font-semibold mb-3 text-slate-200">
            {activePunch === "in" ? "Punch In" : "Punch Out"}
          </h3>
          <Webcam ref={webcamRef} screenshotFormat="image/jpeg" />
          <button
            onClick={handlePunch}
            className="w-full mt-4 py-2 bg-yellow-400 text-black rounded-lg font-semibold"
          >
            Capture & Save
          </button>
        </Modal>
      )}

      {previewImage && (
        <Modal onClose={() => setPreviewImage(null)}>
          <img src={previewImage} className="rounded-lg max-w-sm" />
        </Modal>
      )}

      {mapLocation && (
        <Modal onClose={() => setMapLocation(null)}>
          <iframe
            width="100%"
            height="300"
            className="rounded-lg border border-yellow-400/30"
            src={`https://maps.google.com/maps?q=${mapLocation.lat},${mapLocation.lng}&z=15&output=embed`}
          />
        </Modal>
      )}
    </section>
  );
};

/* ================= UI ================= */

const Stat = ({ label, value }) => (
  <div className="bg-[#020617] border border-yellow-400/20 rounded-xl p-4">
    <p className="text-xs text-slate-400">{label}</p>
    <p className="text-2xl font-semibold text-yellow-400">{value}</p>
  </div>
);

const StatusBadge = ({ status }) => {
  if (status === "On-time")
    return <span className="px-3 py-1 text-xs rounded-full bg-green-500/10 text-green-400">On-time</span>;
  if (status === "Late")
    return <span className="px-3 py-1 text-xs rounded-full bg-red-500/10 text-red-400">Late</span>;
  return <span className="px-3 py-1 text-xs rounded-full bg-slate-700">—</span>;
};

const Modal = ({ children, onClose }) => (
  <div
    className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
    onClick={onClose}
  >
    <div
      className="bg-[#020617] p-6 rounded-xl max-w-md w-full border border-yellow-400/30"
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </div>
  </div>
);

export default MobilizerAttendance;
