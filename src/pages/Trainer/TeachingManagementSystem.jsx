import { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import SlidePanel from "../../components/common/SlidePanel";
import Pagination from "../../components/common/Pagination";
import {
  GraduationCap,
  Clock,
  MapPin,
  Users,
  BookOpen,
  CheckCircle2,
} from "lucide-react";
import { useAuthStore } from "../../stores/authStore";
import { useAttendanceStore } from "../../stores/attendanceStore";
import {
  selectTeachingAttendanceLedger,
  selectTeachingSessions,
  selectTrainerAttendanceScope,
} from "../../stores/selectors/trainingSelectors";

/* ================= CONFIG ================= */

const SHIFT_START = "09:00";
const LATE_AFTER_MINUTES = 15;
const ROWS_PER_PAGE = 10;

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

const TeachingManagementSystem = () => {
  const webcamRef = useRef(null);
  const currentUser = useAuthStore((state) => state.currentUser);
  const trainerEmployeeId = currentUser?.employeeId || "EMP-0001";
  const attendanceRecords = useAttendanceStore((state) => state.records);
  const fetchAttendance = useAttendanceStore((state) => state.fetchAll);
  const createAttendance = useAttendanceStore((state) => state.create);
  const updateAttendance = useAttendanceStore((state) => state.update);

  const [attendance, setAttendance] = useState({});
  const [activePunch, setActivePunch] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [error, setError] = useState("");
  const [sessionsPage, setSessionsPage] = useState(1);
  const [attendancePage, setAttendancePage] = useState(1);

  useEffect(() => {
    fetchAttendance({ filters: { subjectType: "EMPLOYEE" } });
  }, [fetchAttendance]);

  useEffect(() => {
    setAttendance(selectTeachingAttendanceLedger(attendanceRecords, trainerEmployeeId));
  }, [attendanceRecords, trainerEmployeeId]);

  const teachingSessions = selectTeachingSessions(trainerEmployeeId);

  const upsertAttendanceRecord = async (date, dayRecord) => {
    const scope = selectTrainerAttendanceScope(trainerEmployeeId);
    const existing = attendanceRecords.find(
      (record) =>
        record.subjectType === "EMPLOYEE" &&
        record.subjectId === trainerEmployeeId &&
        record.date === date &&
        record.sessionKey === "tms"
    );
    const payload = {
      subjectType: "EMPLOYEE",
      subjectId: trainerEmployeeId,
      employeeId: trainerEmployeeId,
      projectId: scope.projectId,
      centerId: scope.centerId,
      batchId: scope.batchId,
      date,
      status: "PRESENT",
      markedByEmployeeId: trainerEmployeeId,
      sessionKey: "tms",
      sessionTitle: "Teaching Management Attendance",
      punchIn: dayRecord.punchIn,
      punchOut: dayRecord.punchOut,
    };

    if (existing) {
      await updateAttendance(existing.id, payload);
      return;
    }

    await createAttendance(payload);
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

        const updated = {
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
        };

        setAttendance(updated);
        await upsertAttendanceRecord(today, updated[today]);

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

  const totalStudentsTaught = teachingSessions.reduce((s, x) => s + x.students, 0);
  const totalSessions = teachingSessions.length;

  return (
    <section className="min-h-screen bg-transparent p-8 text-white/90">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div>
          <p className="text-xs tracking-widest text-emerald-400 uppercase mb-2 font-medium flex items-center gap-1.5">
            <GraduationCap size={14} /> Teaching Management System
          </p>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white">Teaching & Attendance</h1>
          <p className="text-sm text-white/50 mt-1">
            Track your daily attendance, teaching sessions & batch progress
          </p>
        </div>

        {/* ─── Quick Stats ────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatCard icon={Clock} label="Working Days" value={summary.workingDays} />
          <StatCard icon={CheckCircle2} label="Present" value={summary.present} />
          <StatCard icon={Clock} label="On-time" value={summary.onTime} />
          <StatCard icon={Clock} label="Late" value={summary.late} />
          <StatCard icon={BookOpen} label="Sessions" value={totalSessions} />
          <StatCard icon={Users} label="Students Taught" value={totalStudentsTaught} />
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* ─── Punch Actions ──────────────────────────────── */}
        <div className="bg-white/[0.02] border border-emerald-500/20 rounded-xl p-4 flex gap-4">
          <button
            onClick={() => setActivePunch("in")}
            className="px-5 py-2 bg-emerald-500 text-white rounded-lg text-sm font-semibold hover:bg-emerald-400 transition-colors"
          >
            Punch In
          </button>
          <button
            onClick={() => setActivePunch("out")}
            className="px-5 py-2 border border-emerald-500 text-emerald-400 rounded-lg text-sm hover:bg-emerald-500/10 transition-colors"
          >
            Punch Out
          </button>
        </div>

        {/* ─── Recent Teaching Sessions ───────────────────── */}
        <div className="bg-white/[0.02] border border-emerald-500/20 rounded-2xl overflow-hidden shadow-lg shadow-black/20">
          <div className="px-6 py-4 border-b border-emerald-500/15 bg-white/[0.01]">
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <BookOpen size={18} className="text-emerald-400" /> Recent Teaching Sessions
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-white/[0.02] text-white/60">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Date</th>
                  <th className="px-4 py-3 text-left font-medium">Batch</th>
                  <th className="px-4 py-3 text-left font-medium">Topic</th>
                  <th className="px-4 py-3 text-left font-medium">Students</th>
                  <th className="px-4 py-3 text-left font-medium">Duration</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-500/10">
                {teachingSessions
                  .slice((sessionsPage - 1) * ROWS_PER_PAGE, sessionsPage * ROWS_PER_PAGE)
                  .map((session) => (
                  <tr key={session.id} className="hover:bg-emerald-500/5 transition-colors">
                    <td className="px-4 py-3 font-medium text-white/90">{session.date}</td>
                    <td className="px-4 py-3">
                      <span className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-full font-medium">
                        {session.batch}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-white/80">{session.topic}</td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1 text-white/70">
                        <Users size={13} /> {session.students}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-white/60">{session.duration}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={sessionsPage}
            totalPages={Math.ceil(teachingSessions.length / ROWS_PER_PAGE)}
            onPageChange={setSessionsPage}
          />
        </div>

        {/* ─── Attendance History Table ────────────────────── */}
        <div className="bg-white/[0.02] border border-emerald-500/20 rounded-2xl overflow-hidden shadow-lg shadow-black/20">
          <div className="px-6 py-4 border-b border-emerald-500/15 bg-white/[0.01]">
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <Clock size={18} className="text-emerald-400" /> Attendance Log
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-white/[0.02] border-b border-emerald-500/15">
                <tr>
                  {["Date", "Punch In", "Punch Out", "Location", "Status", "In Image", "Out Image"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-white/60">{h}</th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-emerald-500/10">
                {Object.entries(attendance)
                  .reverse()
                  .slice((attendancePage - 1) * ROWS_PER_PAGE, attendancePage * ROWS_PER_PAGE)
                  .map(([date, r]) => {
                    const status = getStatus(r.punchIn?.time);
                    return (
                      <tr key={date} className="hover:bg-emerald-500/5 transition-colors">
                        <td className="px-4 py-3 font-medium">{date}</td>
                        <td className="px-4 py-3">{r.punchIn?.time || "—"}</td>
                        <td className="px-4 py-3">{r.punchOut?.time || "—"}</td>
                        <td className="px-4 py-3 text-xs text-white/60 flex items-center gap-1">
                          <MapPin size={12} />{r.punchIn?.place || "—"}
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={status} />
                        </td>
                        <td className="px-4 py-3">
                          {r.punchIn?.image && (
                            <img
                              src={r.punchIn.image}
                              className="w-10 h-10 rounded border border-emerald-500/40 cursor-pointer"
                              onClick={() => setPreviewImage(r.punchIn.image)}
                            />
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {r.punchOut?.image && (
                            <img
                              src={r.punchOut.image}
                              className="w-10 h-10 rounded border border-emerald-500/40 cursor-pointer"
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

          <Pagination
            currentPage={attendancePage}
            totalPages={Math.ceil(Object.keys(attendance).length / ROWS_PER_PAGE)}
            onPageChange={setAttendancePage}
          />
        </div>
      </div>

      <SlidePanel open={!!activePunch} onClose={() => setActivePunch(null)} title={activePunch === "in" ? "Punch In" : "Punch Out"} width="sm">
          <Webcam ref={webcamRef} screenshotFormat="image/jpeg" className="rounded-lg w-full" />
          <button
            onClick={handlePunch}
            className="w-full mt-4 py-2 bg-emerald-500 text-white rounded-lg font-semibold hover:bg-emerald-400 transition-colors"
          >
            Capture & Save
          </button>
      </SlidePanel>

      <SlidePanel open={!!previewImage} onClose={() => setPreviewImage(null)} title="Image Preview" width="sm">
          <img src={previewImage} className="rounded-lg w-full" />
      </SlidePanel>
    </section>
  );
};

/* ================= SUB-COMPONENTS ================= */

const StatCard = ({ icon: Icon, label, value }) => (
  <div className="bg-white/[0.02] border border-emerald-500/20 rounded-xl p-4 shadow-lg shadow-black/20 hover:bg-white/[0.04] transition-all">
    <div className="flex items-center gap-2 mb-2">
      <Icon size={14} className="text-emerald-400" />
      <p className="text-[10px] text-white/50 uppercase tracking-wider font-medium">{label}</p>
    </div>
    <p className="text-2xl font-bold text-emerald-400">{value}</p>
  </div>
);

const StatusBadge = ({ status }) => {
  if (status === "On-time")
    return <span className="px-3 py-1 text-xs rounded-full bg-green-500/10 text-green-400">On-time</span>;
  if (status === "Late")
    return <span className="px-3 py-1 text-xs rounded-full bg-red-500/10 text-red-400">Late</span>;
  return <span className="px-3 py-1 text-xs rounded-full bg-slate-700">—</span>;
};



export default TeachingManagementSystem;
