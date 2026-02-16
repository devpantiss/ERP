import { useMemo, useState, useRef, useEffect } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Link } from "react-router-dom";
/* ===================== CONSTANT DATA ===================== */

const PROJECTS = ["Skill India", "Green Jobs", "Rural Employment"];
const GPS_LIST = [
  "Binjharpur GP",
  "Jajpur Road GP",
  "Dharmasala GP",
  "Sukinda GP",
];

/* ===================== DUMMY EVENTS ===================== */

const EVENTS = Array.from({ length: 50 }, (_, i) => ({
  id: i + 1,
  eventName: `Community Awareness Programme ${i + 1}`,
  location: `20.${280 + i}, 85.${840 + i}`,
  gpName: GPS_LIST[i % GPS_LIST.length],
  project: PROJECTS[i % PROJECTS.length],
  photo: `https://picsum.photos/seed/jajpur-event-${i}/600/400`,
  videoLink: "https://drive.google.com/file/d/xyz/view",
  eventDate: `2024-02-${String((i % 28) + 1).padStart(2, "0")}`,
}));

/* ===================== HELPERS ===================== */

const getFilterSummary = ({ project, gp, date }) =>
  (
    [
      project && `Project: ${project}`,
      gp && `GP: ${gp}`,
      date && `Date: ${date}`,
    ].filter(Boolean).join(" | ")
  ) || "No filters applied";

/* ===================== EXPORTS ===================== */

function exportToExcel(data, filters) {
  const worksheet = XLSX.utils.json_to_sheet([
    { Report: "Community Event History" },
    { Filters: getFilterSummary(filters) },
    {},
    ...data.map((e) => ({
      Event_Name: e.eventName,
      Project: e.project,
      GP_Name: e.gpName,
      Location_GPS: e.location,
      Event_Date: e.eventDate,
      Photo_URL: e.photo,
      Video_URL: e.videoLink,
    })),
  ]);

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Events");

  const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  saveAs(new Blob([buffer]), "community_events.xlsx");
}

function exportToPDF(data, filters) {
  const doc = new jsPDF("landscape");

  doc.setFontSize(14);
  doc.text("Community Event History", 14, 14);

  doc.setFontSize(9);
  doc.text(getFilterSummary(filters), 14, 22);

  autoTable(doc, {
    startY: 28,
    head: [[
      "Event Name",
      "Project",
      "GP",
      "GPS Location",
      "Date",
      "Photo URL",
      "Video URL",
    ]],
    body: data.map((e) => [
      e.eventName,
      e.project,
      e.gpName,
      e.location,
      e.eventDate,
      e.photo,
      e.videoLink,
    ]),
    styles: { fontSize: 8 },
    headStyles: {
      fillColor: [250, 204, 21], // yellow-400
      textColor: [0, 0, 0],
    },
  });

  doc.save("community_events.pdf");
}

/* ===================== COMPONENT ===================== */

export default function CommunityHistory() {
  const [projectFilter, setProjectFilter] = useState("");
  const [gpFilter, setGpFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [page, setPage] = useState(1);
  const [preview, setPreview] = useState(null);
  const [openDownload, setOpenDownload] = useState(false);

  const dropdownRef = useRef(null);
  const PAGE_SIZE = 25;

  useEffect(() => {
    const handler = (e) =>
      dropdownRef.current &&
      !dropdownRef.current.contains(e.target) &&
      setOpenDownload(false);

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filteredData = useMemo(() => {
    return EVENTS.filter(
      (e) =>
        (!projectFilter || e.project === projectFilter) &&
        (!gpFilter || e.gpName === gpFilter) &&
        (!dateFilter || e.eventDate === dateFilter)
    );
  }, [projectFilter, gpFilter, dateFilter]);

  const paginatedData = filteredData.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  const totalPages = Math.ceil(filteredData.length / PAGE_SIZE);

  const filters = {
    project: projectFilter,
    gp: gpFilter,
    date: dateFilter,
  };

  return (
    <>
      <section className="rounded-2xl border border-yellow-400/30 bg-[#0b0f14] p-6">

        {/* ================= FILTER BAR ================= */}
        <div className="flex flex-wrap items-center gap-3 mb-4">

          <select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            className="px-3 py-2 text-sm rounded-md bg-[#020617]
            border border-yellow-400/30 text-slate-200"
          >
            <option value="">Select Project</option>
            {PROJECTS.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>

          <select
            value={gpFilter}
            onChange={(e) => setGpFilter(e.target.value)}
            className="px-3 py-2 text-sm rounded-md bg-[#020617]
            border border-yellow-400/30 text-slate-200"
          >
            <option value="">Select GP</option>
            {GPS_LIST.map((gp) => (
              <option key={gp} value={gp}>{gp}</option>
            ))}
          </select>

          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-3 py-2 text-sm rounded-md bg-[#020617]
            border border-yellow-400/30 text-slate-200"
          />

          {/* ================= ACTIONS ================= */}
          <div className="ml-auto flex gap-3 items-center">

            {/* DOWNLOAD */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setOpenDownload((v) => !v)}
                className="px-4 py-2 text-sm rounded-md
                border border-yellow-400 text-yellow-400
                hover:bg-yellow-400/10 transition"
              >
                Download
              </button>

              <div
                className={`absolute right-0 mt-2 w-44 bg-[#020617]
                border border-yellow-400/30 rounded-md shadow-lg
                transition-all duration-200 origin-top
                ${
                  openDownload
                    ? "opacity-100 scale-100"
                    : "opacity-0 scale-95 pointer-events-none"
                }`}
              >
                <button
                  onClick={() => {
                    exportToExcel(filteredData, filters);
                    setOpenDownload(false);
                  }}
                  className="w-full px-4 py-2 text-sm text-left hover:bg-yellow-400/10"
                >
                  📊 Download Excel
                </button>

                <button
                  onClick={() => {
                    exportToPDF(filteredData, filters);
                    setOpenDownload(false);
                  }}
                  className="w-full px-4 py-2 text-sm text-left hover:bg-yellow-400/10"
                >
                  📄 Download PDF
                </button>
              </div>
            </div>

            {/* CREATE */}
            <Link
              to="/mobilizer/create-community-drive"
              className="px-4 py-2 text-sm rounded-md
              bg-yellow-400 text-black font-semibold hover:bg-yellow-300"
            >
              Create Event
            </Link>
          </div>
        </div>

        {/* ================= TABLE ================= */}
        <div className="overflow-x-auto rounded-lg border border-yellow-400/20">
          <table className="w-full text-sm text-slate-200 min-w-[1100px]">
            <thead className="bg-[#020617] border-b border-yellow-400/30">
              <tr>
                {[
                  "Sl#",
                  "Event Name",
                  "Location (GPS)",
                  "GP Name",
                  "Photo",
                  "Video Link",
                  "Project",
                  "Event Date",
                ].map((h) => (
                  <th key={h} className="px-3 py-2 text-left">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {paginatedData.map((e, i) => (
                <tr
                  key={e.id}
                  className="border-t border-yellow-400/10 hover:bg-yellow-400/5"
                >
                  <td className="px-3 py-2">
                    {(page - 1) * PAGE_SIZE + i + 1}
                  </td>
                  <td className="px-3 py-2 font-medium">{e.eventName}</td>
                  <td className="px-3 py-2">{e.location}</td>
                  <td className="px-3 py-2">{e.gpName}</td>
                  <td className="px-3 py-2">
                    <img
                      src={e.photo}
                      alt={e.eventName}
                      onClick={() => setPreview(e)}
                      className="w-12 h-8 object-cover rounded border border-yellow-400/40 cursor-pointer"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <a
                      href={e.videoLink}
                      target="_blank"
                      rel="noreferrer"
                      className="text-yellow-400 hover:underline"
                    >
                      View Video
                    </a>
                  </td>
                  <td className="px-3 py-2">{e.project}</td>
                  <td className="px-3 py-2">{e.eventDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ================= IMAGE MODAL ================= */}
      {preview && (
        <div
          className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center"
          onClick={() => setPreview(null)}
        >
          <div
            className="bg-[#020617] rounded-xl p-4 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <img src={preview.photo} className="w-full rounded-lg mb-3" />
            <p className="text-sm font-medium text-slate-200">
              {preview.eventName}
            </p>

            <button
              onClick={() => setPreview(null)}
              className="mt-4 text-sm text-yellow-400 hover:underline"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
