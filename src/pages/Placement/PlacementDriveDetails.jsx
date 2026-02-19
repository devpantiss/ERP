import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
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
  }));
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function PlacementDrivesPage({ role = "placement" }) {
  const navigate = useNavigate();

  const [drives, setDrives] = useState(generateDrives());
  const [activeDrive, setActiveDrive] = useState(null);

  const [images, setImages] = useState([]);
  const [geo, setGeo] = useState(null);

  const [viewerDrive, setViewerDrive] = useState(null);

  /* ================= FILTERS ================= */

  const [companyFilter, setCompanyFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

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

      return true;
    });
  }, [drives, companyFilter, statusFilter]);

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
    const ws = XLSX.utils.json_to_sheet(filtered);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Placement");
    XLSX.writeFile(wb, "placement.xlsx");
  }

  function exportPDF() {
    const doc = new jsPDF();

    autoTable(doc, {
      head: [["Event", "Type", "Companies", "Location", "Date", "Status"]],
      body: filtered.map(d => [
        d.eventName,
        d.type,
        d.companies.join(", "),
        d.driveLocation,
        d.date,
        d.status,
      ]),
    });

    doc.save("placement.pdf");
  }

  /* ================= ACTIONS ================= */

  function openUploadModal(drive) {
    setActiveDrive(drive);
    setImages([]);

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
    });
  }

  async function handleSubmit() {
    const watermarked = await Promise.all(
      images.map(f => addWatermark(f, geo))
    );

    setDrives(prev =>
      prev.map(d =>
        d.id === activeDrive.id
          ? {
              ...d,
              status: "Completed",
              geo,
              eventImages: watermarked,
            }
          : d
      )
    );

    setActiveDrive(null);
  }

  /* ================= UI ================= */

  return (
    <>
      <section className="p-8 bg-[#111827] rounded-2xl border border-cyan-500/30">

        {/* HEADER */}
        <div className="flex justify-between mb-6">

          <h2 className="text-2xl font-semibold text-slate-100">
            Placement Drives
          </h2>

          <div className="flex gap-2">

            <button onClick={exportExcel} className="btn">
              Excel
            </button>

            <button onClick={exportPDF} className="btn">
              PDF
            </button>

            <button
              onClick={() =>
                navigate("/placement-officer/placement-drives/new")
              }
              className="btn-primary"
            >
              + Add Drive
            </button>

          </div>

        </div>

        {/* SUMMARY */}
        <div className="grid grid-cols-3 gap-6 mb-6">

          <SummaryCard label="Total Drives" value={summary.total} />
          <SummaryCard label="Approved" value={summary.approved} />
          <SummaryCard label="Completed" value={summary.completed} />

        </div>

        {/* FILTERS */}
        <div className="grid grid-cols-2 gap-4 mb-6">

          <input
            placeholder="Filter by Company"
            value={companyFilter}
            onChange={e => setCompanyFilter(e.target.value)}
            className="input"
          />

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="input"
          >
            <option value="">All Status</option>
            <option>Approved</option>
            <option>Completed</option>
          </select>

        </div>

        {/* TABLE */}
        <div className="overflow-x-auto">

          <table className="w-full text-sm">

            <thead className="bg-[#020617] text-slate-400">
              <tr>
                <th className="p-4 text-left">Event</th>
                <th className="p-4">Type</th>
                <th className="p-4">Companies</th>
                <th className="p-4">Location</th>
                <th className="p-4">Date</th>
                <th className="p-4">Live Location</th>
                <th className="p-4">Images</th>
                <th className="p-4">Status</th>
                <th className="p-4">Action</th>
              </tr>
            </thead>

            <tbody>
              {paginated.map(d => (
                <tr key={d.id} className="border-t border-slate-700">

                  <td className="p-4 font-medium text-slate-100">
                    {d.eventName}
                  </td>

                  <td className="p-4">
                    <TypeBadge type={d.type} />
                  </td>

                  <td className="p-4">
                    {d.companies.join(", ")}
                  </td>

                  <td className="p-4">
                    {d.driveLocation}
                  </td>

                  <td className="p-4">{d.date}</td>

                  {/* LOCATION */}
                  <td className="p-4">

                    {d.geo && (
                      <div className="space-y-1">

                        <div className="text-xs text-cyan-400">
                          {d.geo.placeName}
                        </div>

                        <a
                          href={`https://www.google.com/maps?q=${d.geo.lat},${d.geo.lng}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <iframe
                            width="140"
                            height="90"
                            src={`https://maps.google.com/maps?q=${d.geo.lat},${d.geo.lng}&z=15&output=embed`}
                            className="rounded border border-slate-600"
                          />
                        </a>

                      </div>
                    )}

                  </td>

                  {/* IMAGES */}
                  <td className="p-4">

                    {d.eventImages.length > 0 ? (
                      <button
                        onClick={() => setViewerDrive(d)}
                        className="btn-view"
                      >
                        View ({d.eventImages.length})
                      </button>
                    ) : (
                      <span className="text-xs text-slate-500">
                        No Images
                      </span>
                    )}

                  </td>

                  <td className="p-4">
                    <StatusBadge status={d.status} />
                  </td>

                  <td className="p-4">

                    {role === "placement" &&
                      d.status === "Approved" && (
                        <button
                          onClick={() => openUploadModal(d)}
                          className="btn"
                        >
                          Upload
                        </button>
                      )}

                  </td>

                </tr>
              ))}
            </tbody>

          </table>

        </div>

        {/* PAGINATION */}
        <div className="flex justify-between mt-4 text-sm text-slate-400">

          <div>
            Page {page} / {totalPages}
          </div>

          <div className="flex gap-2">

            <button
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="btn"
            >
              Prev
            </button>

            <button
              disabled={page === totalPages}
              onClick={() => setPage(p => p + 1)}
              className="btn"
            >
              Next
            </button>

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
          onSubmit={handleSubmit}
          onClose={() => setActiveDrive(null)}
        />
      )}

      <style>{`
        .btn {
          background:#020617;
          border:1px solid #475569;
          padding:6px 10px;
          border-radius:6px;
          color:white;
        }

        .btn-primary {
          background:#22c55e;
          padding:6px 12px;
          border-radius:6px;
          color:black;
        }

        .btn-view {
          background:rgba(59,130,246,0.2);
          color:#60a5fa;
          padding:4px 10px;
          border-radius:6px;
          font-size:12px;
        }

        .input {
          background:#020617;
          border:1px solid #475569;
          padding:8px;
          border-radius:6px;
          color:white;
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
    <div className="bg-[#020617] border border-slate-700 rounded-xl p-5">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="text-2xl text-cyan-400 mt-2">{value}</p>
    </div>
  );
}

function TypeBadge({ type }) {
  return (
    <span className="px-3 py-1 rounded-full text-xs bg-purple-500/20 text-purple-400">
      {type}
    </span>
  );
}

function StatusBadge({ status }) {
  const styles = {
    Approved: "bg-blue-500/20 text-blue-400",
    Completed: "bg-emerald-500/20 text-emerald-400",
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs ${styles[status]}`}>
      {status}
    </span>
  );
}

/* ================= GALLERY MODAL ================= */

function GalleryModal({ drive, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">

      <div className="bg-[#020617] border border-cyan-500/30 rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col">

        {/* HEADER */}
        <div className="p-5 border-b border-slate-700 flex justify-between items-center">

          <div>
            <h3 className="text-white font-semibold text-lg">
              {drive.eventName}
            </h3>

            {drive.geo && (
              <div className="text-xs text-cyan-400 mt-1">
                📍 {drive.geo.placeName} •{" "}
                {new Date(drive.geo.uploadedAt).toLocaleString()}
              </div>
            )}
          </div>

          <button onClick={onClose} className="btn">
            Close
          </button>

        </div>

        {/* BODY */}
        <div className="overflow-y-auto p-5 space-y-4">

          {drive.geo && (
            <iframe
              width="100%"
              height="220"
              src={`https://maps.google.com/maps?q=${drive.geo.lat},${drive.geo.lng}&z=15&output=embed`}
              className="rounded-lg border border-slate-700"
            />
          )}

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">

            {drive.eventImages.map((img, i) => (
              <img
                key={i}
                src={img.url}
                className="rounded-lg object-cover w-full"
                alt=""
              />
            ))}

          </div>

        </div>

      </div>

    </div>
  );
}

/* ================= UPLOAD MODAL ================= */

function UploadModal({ drive, images, setImages, onSubmit, onClose }) {
  function handleFiles(e) {
    setImages(Array.from(e.target.files).slice(0, 5));
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">

      <div className="bg-[#020617] border border-cyan-500/30 p-6 rounded-2xl w-full max-w-2xl">

        <h3 className="text-white text-lg font-semibold mb-4">
          Upload Event Images — {drive.eventName}
        </h3>

        <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-600 rounded-xl p-8 cursor-pointer hover:border-cyan-400 transition">

          <div className="text-cyan-400 text-3xl mb-2">📤</div>

          <div className="text-slate-300 text-sm">
            Click or Drag & Drop Images
          </div>

          <input
            type="file"
            multiple
            hidden
            accept="image/*"
            onChange={handleFiles}
          />
        </label>

        <div className="grid grid-cols-4 gap-3 mt-5">

          {images.map((img, i) => (
            <img
              key={i}
              src={URL.createObjectURL(img)}
              className="h-24 w-full object-cover rounded"
              alt=""
            />
          ))}

        </div>

        <div className="flex justify-end gap-3 mt-6">

          <button onClick={onClose} className="btn">
            Cancel
          </button>

          <button onClick={onSubmit} className="btn-primary">
            Submit
          </button>

        </div>

      </div>

    </div>
  );
}
