import Pagination from "../../components/common/Pagination";
import SlidePanel from "../../components/common/SlidePanel";
import { useState, useMemo } from "react";
import PlacementDriveStepper from "./PlacementDriveStepper";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/* =========================================================
   GEO + WATERMARK
========================================================= */

async function getPlaceName(lat, lng) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
    );
    const data = await res.json();

    return (
      data?.address?.city ||
      data?.address?.town ||
      data?.address?.village ||
      data?.display_name ||
      "Unknown Location"
    );
  } catch {
    return "Unknown Location";
  }
}

async function addWatermark(file, geo) {
  return new Promise(resolve => {
    const img = new Image();
    img.src = URL.createObjectURL(file);

    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      canvas.width = img.width;
      canvas.height = img.height;

      ctx.drawImage(img, 0, 0);

      const date = new Date(geo.uploadedAt);

      ctx.fillStyle = "rgba(0,0,0,0.65)";
      ctx.fillRect(0, canvas.height - 120, canvas.width, 120);

      ctx.fillStyle = "white";
      ctx.font = "18px Arial";

      ctx.fillText(`📍 ${geo.placeName}`, 20, canvas.height - 80);
      ctx.fillText(
        `Lat: ${geo.lat.toFixed(5)}  Lng: ${geo.lng.toFixed(5)}`,
        20,
        canvas.height - 55
      );
      ctx.fillText(`📅 ${date.toLocaleDateString()}`, 20, canvas.height - 30);
      ctx.fillText(`🕒 ${date.toLocaleTimeString()}`, 20, canvas.height - 5);

      canvas.toBlob(blob => {
        const url = URL.createObjectURL(blob);
        resolve({ file: blob, url });
      }, "image/jpeg");
    };
  });
}

/* =========================================================
   DUMMY DATA
========================================================= */

function generateDrives() {
  return Array.from({ length: 15 }, (_, i) => ({
    id: i + 1,
    eventName: "Campus Placement Drive",
    type: i % 2 === 0 ? "Single" : "Multiple",
    companies:
      i % 2 === 0
        ? ["Tata Steel"]
        : ["Tata Steel", "JSW", "Vedanta"],
    driveLocation: "Khurda Center",
    date: `2026-02-${(i % 28) + 1}`,
    status: i % 3 === 0 ? "Completed" : "Approved",
    geo: null,
    eventImages: [],
    placedStudents: i % 3 === 0
      ? [
          { name: "Amit Kumar", company: "Tata Steel", role: "Trainee Operator", salary: "18000", joiningDate: "2026-03-01" },
          { name: "Priya Sahoo", company: "JSW", role: "Production Associate", salary: "16500", joiningDate: "2026-03-05" },
        ]
      : [],
  }));
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function PlacementDrivesPage({ role = "placement" }) {
  const [drives, setDrives] = useState(generateDrives());
  const [activeDrive, setActiveDrive] = useState(null);

  const [images, setImages] = useState([]);
  const [geo, setGeo] = useState(null);
  const [placedStudents, setPlacedStudents] = useState([]);
  const [studentCount, setStudentCount] = useState("");

  const [viewerDrive, setViewerDrive] = useState(null);
  const [showForm, setShowForm] = useState(false);

  /* ================= FILTERS ================= */

  const [companyFilter, setCompanyFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");

  /* ================= PAGINATION ================= */

  const [page, setPage] = useState(1);
  const pageSize = 8;

  const filtered = useMemo(() => {
    return drives.filter(d => {
      if (
        companyFilter &&
        !d.companies.join(",").toLowerCase().includes(companyFilter.toLowerCase())
      )
        return false;

      if (statusFilter && d.status !== statusFilter) return false;
      if (dateFilter && d.date !== dateFilter) return false;
      if (
        locationFilter &&
        !d.driveLocation.toLowerCase().includes(locationFilter.toLowerCase())
      )
        return false;

      return true;
    });
  }, [drives, companyFilter, statusFilter, dateFilter, locationFilter]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  /* ================= SUMMARY ================= */

  const summary = useMemo(
    () => ({
      total: drives.length,
      approved: drives.filter(d => d.status === "Approved").length,
      completed: drives.filter(d => d.status === "Completed").length,
    }),
    [drives]
  );

  /* ================= EXPORT ================= */

  function exportExcel() {
    const ws = XLSX.utils.json_to_sheet(filtered.map(d => ({
      Event: d.eventName,
      Type: d.type,
      Companies: d.companies.join(", "),
      Location: d.driveLocation,
      Date: d.date,
      Status: d.status,
      Images: d.eventImages.length,
      "Placed Students": (d.placedStudents || []).length,
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Placement");
    XLSX.writeFile(wb, "placement.xlsx");
  }

  function exportPDF() {
    const doc = new jsPDF();

    autoTable(doc, {
      head: [["Event", "Type", "Companies", "Location", "Date", "Status", "Images", "Placed"]],
      body: filtered.map(d => [
        d.eventName,
        d.type,
        d.companies.join(", "),
        d.driveLocation,
        d.date,
        d.status,
        d.eventImages.length,
        (d.placedStudents || []).length,
      ]),
    });

    doc.save("placement.pdf");
  }

  /* ================= ACTIONS ================= */

  function openUploadModal(drive) {
    setActiveDrive(drive);
    setImages([]);
    setGeo(null);
    setPlacedStudents([]);
    setStudentCount("");

    navigator.geolocation.getCurrentPosition(async pos => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;

      const placeName = await getPlaceName(lat, lng);

      setGeo({
        lat,
        lng,
        placeName,
        uploadedAt: new Date(),
      });
    }, () => {
      setGeo({
        lat: 0,
        lng: 0,
        placeName: "Location permission unavailable",
        uploadedAt: new Date(),
      });
    });
  }

  async function handleSubmit() {
    const completionGeo = geo || {
      lat: 0,
      lng: 0,
      placeName: "Location permission unavailable",
      uploadedAt: new Date(),
    };

    const watermarked = await Promise.all(
      images.map(f => addWatermark(f, completionGeo))
    );

    setDrives(prev =>
      prev.map(d =>
        d.id === activeDrive.id
          ? {
              ...d,
              status: "Completed",
              geo: completionGeo,
              eventImages: watermarked,
              placedStudents,
            }
          : d
      )
    );

    setActiveDrive(null);
  }

  /* ================= UI ================= */

  
  return (
    <>
      <section className="space-y-6 rounded-xl border border-white/10 bg-[#0b1220]/95 p-5 shadow-2xl shadow-black/20 md:p-6">
        <div className="flex flex-col gap-4 border-b border-white/10 pb-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">Placement Operations</p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-50">Placement Drives</h2>
            <p className="mt-1 text-sm text-slate-400">Manage approved drives, completion evidence, and placed-student outcomes.</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button onClick={exportExcel} className="btn">Export Excel</button>
            <button onClick={exportPDF} className="btn">Export PDF</button>
            <button onClick={() => setShowForm(true)} className="btn-primary">Add Drive</button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <SummaryCard label="Total Drives" value={summary.total} />
          <SummaryCard label="Approved" value={summary.approved} />
          <SummaryCard label="Completed" value={summary.completed} />
        </div>

        <div className="rounded-xl border border-white/10 bg-white/[0.025] p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Filters</p>
            <button
              type="button"
              onClick={() => {
                setCompanyFilter("");
                setLocationFilter("");
                setDateFilter("");
                setStatusFilter("");
                setPage(1);
              }}
              className="text-xs font-medium text-cyan-300 hover:text-cyan-200"
            >
              Clear
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
            <input placeholder="Company" value={companyFilter} onChange={e => setCompanyFilter(e.target.value)} className="input" />
            <input placeholder="Location" value={locationFilter} onChange={e => setLocationFilter(e.target.value)} className="input" />
            <input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)} className="input" />
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="input">
              <option value="">All Status</option>
              <option>Approved</option>
              <option>Completed</option>
            </select>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-white/10 bg-[#08111f]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1180px] text-sm">
              <thead className="bg-white/[0.04] text-xs uppercase tracking-wide text-slate-400">
                <tr>
                  <th className="p-4 text-left font-medium">Event</th>
                  <th className="p-4 text-left font-medium">Type</th>
                  <th className="p-4 text-left font-medium">Companies</th>
                  <th className="p-4 text-left font-medium">Location</th>
                  <th className="p-4 text-left font-medium">Date</th>
                  <th className="p-4 text-left font-medium">Live Location</th>
                  <th className="p-4 text-left font-medium">Images</th>
                  <th className="p-4 text-left font-medium">Placed Students</th>
                  <th className="p-4 text-left font-medium">Status</th>
                  <th className="p-4 text-left font-medium">Action</th>
                </tr>
              </thead>

              <tbody>
                {paginated.map(d => (
                  <tr key={d.id} className="border-t border-white/10 text-slate-300 transition-colors hover:bg-white/[0.025]">
                    <td className="p-4 font-medium text-slate-100">{d.eventName}</td>
                    <td className="p-4"><TypeBadge type={d.type} /></td>
                    <td className="p-4">{d.companies.join(", ")}</td>
                    <td className="p-4">{d.driveLocation}</td>
                    <td className="p-4">{d.date}</td>
                    <td className="p-4">
                      {d.geo ? (
                        <div className="space-y-2">
                          <div className="max-w-[160px] text-xs font-medium text-cyan-300">{d.geo.placeName}</div>
                          <a href={`https://www.google.com/maps?q=${d.geo.lat},${d.geo.lng}`} target="_blank" rel="noreferrer">
                            <iframe
                              width="140"
                              height="86"
                              src={`https://maps.google.com/maps?q=${d.geo.lat},${d.geo.lng}&z=15&output=embed`}
                              className="rounded-md border border-white/10"
                            />
                          </a>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-500">Pending</span>
                      )}
                    </td>
                    <td className="p-4">
                      {d.eventImages.length > 0 ? (
                        <button onClick={() => setViewerDrive(d)} className="btn-view">View ({d.eventImages.length})</button>
                      ) : (
                        <span className="text-xs text-slate-500">No Images</span>
                      )}
                    </td>
                    <td className="p-4">
                      {(d.placedStudents || []).length > 0 ? (
                        <button onClick={() => setViewerDrive(d)} className="btn-view">View ({(d.placedStudents || []).length})</button>
                      ) : (
                        <span className="text-xs text-slate-500">No List</span>
                      )}
                    </td>
                    <td className="p-4"><StatusBadge status={d.status} /></td>
                    <td className="p-4">
                      {role === "placement" && d.status === "Approved" ? (
                        <button onClick={() => openUploadModal(d)} className="btn">Complete Drive</button>
                      ) : (
                        <span className="text-xs text-slate-500">No action</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="border-t border-white/10 px-4 py-3">
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        </div>
      </section>

      {/* GALLERY MODAL */}
      {viewerDrive && (
        <GalleryModal
          drive={viewerDrive}
          onClose={() => setViewerDrive(null)}
        />
      )}

      {/* UPLOAD MODAL */}
      {activeDrive && (
	        <UploadModal
	          drive={activeDrive}
            images={images}
            setImages={setImages}
            placedStudents={placedStudents}
            setPlacedStudents={setPlacedStudents}
            studentCount={studentCount}
            setStudentCount={setStudentCount}
            onSubmit={handleSubmit}
            onClose={() => setActiveDrive(null)}
          />
      )}

      {/* SlidePanel Form */}
      {showForm && (
        <PlacementDriveStepper onClose={() => setShowForm(false)} />
      )}

      <style>{`
	        .btn {
	          background:rgba(15,23,42,0.92);
	          border:1px solid rgba(148,163,184,0.22);
	          padding:9px 12px;
	          border-radius:8px;
	          color:#e2e8f0;
            font-size:12px;
            font-weight:600;
            transition:all 160ms ease;
	        }
          .btn:hover {
            border-color:rgba(103,232,249,0.45);
            color:white;
            background:rgba(30,41,59,0.95);
          }

	        .btn-primary {
	          background:#06b6d4;
	          padding:9px 14px;
	          border-radius:8px;
	          color:#04111f;
            font-size:12px;
            font-weight:700;
            transition:all 160ms ease;
	        }
          .btn-primary:hover {
            background:#22d3ee;
          }

	        .btn-view {
	          background:rgba(14,165,233,0.12);
	          border:1px solid rgba(56,189,248,0.24);
	          color:#67e8f9;
	          padding:6px 10px;
	          border-radius:999px;
	          font-size:12px;
            font-weight:600;
	        }

	        .input {
	          background:rgba(2,6,23,0.72);
	          border:1px solid rgba(148,163,184,0.22);
	          padding:10px 12px;
	          border-radius:8px;
	          color:#f8fafc;
            font-size:14px;
            outline:none;
	        }
          .input:focus {
            border-color:rgba(34,211,238,0.58);
            box-shadow:0 0 0 1px rgba(34,211,238,0.22);
          }
	      `}</style>
    </>
  );
}

/* =========================================================
   COMPONENTS
========================================================= */

function SummaryCard({ label, value }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.035] p-4 shadow-lg shadow-black/10">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-slate-50">{value}</p>
    </div>
  );
}

function TypeBadge({ type }) {
  return (
    <span className="inline-flex rounded-full border border-violet-400/20 bg-violet-400/10 px-3 py-1 text-xs font-medium text-violet-200">
      {type}
    </span>
  );
}

function StatusBadge({ status }) {
  const styles = {
    Approved: "border-sky-400/25 bg-sky-400/10 text-sky-200",
    Completed: "border-emerald-400/25 bg-emerald-400/10 text-emerald-200",
  };

  return (
    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${styles[status]}`}>
      {status}
    </span>
  );
}

/* ================= GALLERY MODAL ================= */

function GalleryModal({ drive, onClose }) {
  return (
    <SlidePanel open={true} onClose={onClose} title={drive.eventName} width="xl">
        {drive.geo && (
          <div className="mb-4 rounded-lg border border-cyan-400/15 bg-cyan-400/5 px-3 py-2 text-xs font-medium text-cyan-200">
            {drive.geo.placeName} • {new Date(drive.geo.uploadedAt).toLocaleString()}
          </div>
        )}

        <div className="space-y-6">
          {drive.geo && (
            <iframe
              width="100%"
              height="220"
              src={`https://maps.google.com/maps?q=${drive.geo.lat},${drive.geo.lng}&z=15&output=embed`}
              className="rounded-lg border border-slate-700"
            />
          )}

          <div>
            <p className="text-xs uppercase tracking-wide text-white/50 mb-3">Event Images</p>
            {drive.eventImages.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {drive.eventImages.map((img, i) => (
                  <img key={i} src={img.url} className="rounded-lg object-cover w-full" alt="" />
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">No images uploaded.</p>
            )}
          </div>

          <div>
            <p className="text-xs uppercase tracking-wide text-white/50 mb-3">Placed Students</p>
            {(drive.placedStudents || []).length > 0 ? (
              <div className="overflow-x-auto border border-slate-700 rounded-lg">
                <table className="w-full text-sm">
	                  <thead className="bg-[#020617] text-white/60">
	                    <tr>
	                      <th className="p-3 text-left">Student</th>
	                      <th className="p-3 text-left">Placed Company</th>
	                      <th className="p-3 text-left">Job Role</th>
	                      <th className="p-3 text-left">Salary</th>
	                      <th className="p-3 text-left">Joining Date</th>
	                    </tr>
	                  </thead>
	                  <tbody>
	                    {(drive.placedStudents || []).map((student, i) => (
	                      <tr key={`${student.name}-${i}`} className="border-t border-slate-700">
	                        <td className="p-3 text-slate-100">{student.name}</td>
	                        <td className="p-3 text-slate-300">{student.company || "—"}</td>
	                        <td className="p-3 text-slate-300">{student.role || "—"}</td>
	                        <td className="p-3 text-slate-300">{student.salary ? `₹${Number(student.salary).toLocaleString("en-IN")}` : "—"}</td>
	                        <td className="p-3 text-slate-300">{student.joiningDate || "—"}</td>
	                      </tr>
	                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-slate-500">No placed-student list uploaded.</p>
            )}
          </div>
        </div>
    </SlidePanel>
  );
}

/* ================= UPLOAD MODAL ================= */

function UploadModal({
  drive,
  images,
  setImages,
  placedStudents,
  setPlacedStudents,
  studentCount,
  setStudentCount,
  onSubmit,
  onClose,
}) {
  function handleFiles(e) {
    setImages(Array.from(e.target.files).slice(0, 5));
  }

	  function handleStudentCount(value) {
	    const count = Math.max(0, Math.min(Number(value) || 0, 100));
	    setStudentCount(value);
	    setPlacedStudents(Array.from({ length: count }, (_, i) => (
	      placedStudents[i] || { name: "", company: "", role: "", salary: "", joiningDate: "" }
	    )));
	  }

  function updateStudent(index, field, value) {
    setPlacedStudents(prev => prev.map((student, i) => (
      i === index ? { ...student, [field]: value } : student
    )));
  }

	  const studentRowsComplete = placedStudents.length > 0 && placedStudents.every(student =>
	    student.name.trim() &&
	    student.company.trim() &&
	    student.role.trim() &&
	    String(student.salary).trim() &&
	    student.joiningDate.trim()
	  );
  const canSubmit = images.length > 0 && studentRowsComplete;

  return (
    <SlidePanel open={true} onClose={onClose} title={`Complete Drive — ${drive.eventName}`} width="lg">
        <p className="text-sm text-white/60 mb-4">
          Upload event images and add the placed-student outcomes before marking this drive completed.
        </p>

        <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-slate-600 bg-white/[0.02] p-8 transition hover:border-cyan-400/70 hover:bg-cyan-400/[0.03]">
          <div className="mb-2 text-sm font-semibold uppercase tracking-wide text-cyan-300">Upload Evidence</div>
          <div className="text-white/80 text-sm">Click to upload multiple drive images</div>
          <div className="text-white/40 text-xs mt-1">Up to 5 images</div>
          <input type="file" multiple hidden accept="image/*" onChange={handleFiles} />
        </label>

        <div className="grid grid-cols-4 gap-3 mt-5">
          {images.map((img, i) => (
            <img key={i} src={URL.createObjectURL(img)} className="h-24 w-full object-cover rounded" alt="" />
          ))}
        </div>

        <div className="mt-6 space-y-3">
          <label className="block text-xs uppercase tracking-wide text-white/50">
            Placed Students
          </label>
          <div>
            <label className="text-xs text-white/60 mb-1.5 block">
              How many students were placed? *
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={studentCount}
              onChange={e => handleStudentCount(e.target.value)}
              placeholder="Enter number of placed students"
              className="input w-full"
            />
          </div>

          {placedStudents.length > 0 && (
            <div className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.02]">
              <div className="bg-[#020617] px-3 py-2 text-xs text-emerald-400">
                Add details for {placedStudents.length} placed student{placedStudents.length === 1 ? "" : "s"}
              </div>
              <div className="max-h-48 overflow-y-auto">
                {placedStudents.map((student, i) => (
                  <div key={i} className="border-t border-white/10 p-3 space-y-3">
                    <div className="text-xs font-medium text-white/50">Student #{i + 1}</div>
	                    <div className="grid sm:grid-cols-2 gap-3">
	                      <input
	                        value={student.name}
                        onChange={e => updateStudent(i, "name", e.target.value)}
	                        placeholder="Student Name *"
	                        className="input"
	                      />
	                      <input
	                        value={student.company}
	                        onChange={e => updateStudent(i, "company", e.target.value)}
                        placeholder="Placed Company *"
                        className="input"
                      />
                      <input
                        value={student.role}
                        onChange={e => updateStudent(i, "role", e.target.value)}
	                        placeholder="Job Role *"
	                        className="input"
	                      />
	                      <input
	                        type="number"
	                        min="0"
	                        value={student.salary}
	                        onChange={e => updateStudent(i, "salary", e.target.value)}
	                        placeholder="Salary *"
	                        className="input"
	                      />
	                      <input
	                        type="date"
	                        value={student.joiningDate}
	                        onChange={e => updateStudent(i, "joiningDate", e.target.value)}
	                        className="input"
	                      />
	                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onClose} className="btn">Cancel</button>
          <button onClick={onSubmit} disabled={!canSubmit} className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed">
            Mark Completed
          </button>
        </div>
    </SlidePanel>
  );
}
