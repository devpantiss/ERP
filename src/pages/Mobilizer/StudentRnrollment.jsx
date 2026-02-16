import { useMemo, useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/* ===================== CONSTANTS ===================== */

const PROJECTS = ["Skill India", "Green Jobs", "Rural Employment"];
const BLOCKS = ["Jajpur Road", "Dharmasala", "Binjharpur", "Sukinda"];

const NAMES = [
  "Sanjay Behera",
  "Ranjan Sahoo",
  "Anita Mohanty",
  "Debasish Rout",
  "Pritam Das",
  "Sunita Jena",
  "Bikash Pradhan",
  "Mamata Nayak",
  "Ashok Swain",
  "Kajal Panda",
];

const CANDIDATES = Array.from({ length: 50 }, (_, i) => ({
  id: i + 1,
  name: NAMES[i % NAMES.length],
  image: `https://i.pravatar.cc/300?img=${(i % 70) + 1}`,
  dob: `199${i % 5}-0${(i % 8) + 1}-15`,
  phone: `91${760000000 + i}`,
  project: PROJECTS[i % PROJECTS.length],
  district: "Jajpur",
  block: BLOCKS[i % BLOCKS.length],
  aadhaar: `XXXX-XXXX-${2000 + i}`,
  gps: `20.${280 + i}, 85.${840 + i}`,
  enrollmentDate: `2024-01-${String((i % 28) + 1).padStart(2, "0")}`,
}));

/* ===================== HELPERS ===================== */

const getFilterSummary = ({ search, project, block, enrollDate }) =>
  (
    [
      search && `Search: ${search}`,
      project && `Project: ${project}`,
      block && `Block: ${block}`,
      enrollDate && `Enrollment Date: ${enrollDate}`,
    ].filter(Boolean).join(" | ")
  ) || "No filters applied";

/* ===================== EXPORTS ===================== */

function exportToExcel(data, filters) {
  const worksheet = XLSX.utils.json_to_sheet([
    { Report: "Candidate Enrollment Report" },
    { Filters: getFilterSummary(filters) },
    {},
    ...data.map((c) => ({
      Name: c.name,
      Phone: c.phone,
      Project: c.project,
      Block: c.block,
      DOB: c.dob,
      GPS: c.gps,
      Enrollment_Date: c.enrollmentDate,
      Image_URL: c.image,
    })),
  ]);

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Candidates");

  const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  saveAs(new Blob([buffer]), "candidates_filtered.xlsx");
}

function exportToPDF(data, filters) {
  const doc = new jsPDF("landscape");

  doc.setFontSize(14);
  doc.text("Candidate Enrollment Report", 14, 14);

  doc.setFontSize(9);
  doc.text(getFilterSummary(filters), 14, 22);

  autoTable(doc, {
    startY: 28,
    head: [[
      "Name",
      "Phone",
      "Project",
      "Block",
      "DOB",
      "GPS",
      "Enroll Date",
      "Image URL",
    ]],
    body: data.map((c) => [
      c.name,
      c.phone,
      c.project,
      c.block,
      c.dob,
      c.gps,
      c.enrollmentDate,
      c.image,
    ]),
    styles: { fontSize: 8 },
    headStyles: {
      fillColor: [250, 204, 21],
      textColor: [0, 0, 0],
    },
  });

  doc.save("candidates_filtered.pdf");
}

/* ===================== COMPONENT ===================== */

export default function CandidatesTableDark() {
  const [search, setSearch] = useState("");
  const [project, setProject] = useState("");
  const [block, setBlock] = useState("");
  const [enrollDate, setEnrollDate] = useState("");
  const [page, setPage] = useState(1);
  const [previewImage, setPreviewImage] = useState(null);
  const [openDownload, setOpenDownload] = useState(false);

  const dropdownRef = useRef(null);
  const PAGE_SIZE = 25;

  /* Close dropdown on outside click */
  useEffect(() => {
    const handler = (e) =>
      dropdownRef.current &&
      !dropdownRef.current.contains(e.target) &&
      setOpenDownload(false);

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filteredData = useMemo(() => {
    return CANDIDATES.filter((c) =>
      (!search ||
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.phone.includes(search)) &&
      (!project || c.project === project) &&
      (!block || c.block === block) &&
      (!enrollDate || c.enrollmentDate === enrollDate)
    );
  }, [search, project, block, enrollDate]);

  const paginatedData = filteredData.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  const totalPages = Math.ceil(filteredData.length / PAGE_SIZE);
  const filters = { search, project, block, enrollDate };

  return (
    <>
      <section className="rounded-2xl border border-yellow-400/30 bg-[#0b0f14] p-6">

        {/* ================= FILTER BAR ================= */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <input
            placeholder="Search name / phone"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3 py-2 text-sm rounded-md bg-[#020617]
            border border-yellow-400/30 text-slate-200 w-60"
          />

          <Select options={PROJECTS} value={project} setValue={setProject} label="Project" />
          <Select options={BLOCKS} value={block} setValue={setBlock} label="Block" />

          <input
            type="date"
            value={enrollDate}
            onChange={(e) => setEnrollDate(e.target.value)}
            className="px-3 py-2 text-sm rounded-md bg-[#020617]
            border border-yellow-400/30 text-slate-200"
          />

          {/* ================= DOWNLOAD ================= */}
          <div className="ml-auto flex gap-3 items-center">
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
                    ? "opacity-100 scale-100 translate-y-0"
                    : "opacity-0 scale-95 -translate-y-1 pointer-events-none"
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

            <Link
              to="/mobilizer/candidate-enrollment"
              className="px-4 py-2 text-sm rounded-md
              bg-yellow-400 text-black font-semibold hover:bg-yellow-300"
            >
              Enroll Candidate
            </Link>
          </div>
        </div>

        {/* ================= TABLE ================= */}
        <div className="overflow-x-auto rounded-lg border border-yellow-400/20">
          <table className="w-full text-sm text-slate-200">
            <thead className="bg-[#020617] border-b border-yellow-400/30">
              <tr>
                {["#", "Candidate", "DOB", "Phone", "Project", "Block", "GPS", "Enroll Date"].map(h => (
                  <th key={h} className="px-3 py-2 text-left">{h}</th>
                ))}
              </tr>
            </thead>

            <tbody>
              {paginatedData.map((c, i) => (
                <tr
                  key={c.id}
                  className="border-t border-yellow-400/10 hover:bg-yellow-400/5"
                >
                  <td className="px-3 py-2">{(page - 1) * PAGE_SIZE + i + 1}</td>
                  <td className="px-3 py-2 flex items-center gap-3">
                    <img
                      src={c.image}
                      alt={c.name}
                      onClick={() => setPreviewImage(c)}
                      className="w-8 h-8 rounded-full cursor-pointer border border-yellow-400/40"
                    />
                    {c.name}
                  </td>
                  <td className="px-3 py-2">{c.dob}</td>
                  <td className="px-3 py-2">{c.phone}</td>
                  <td className="px-3 py-2">{c.project}</td>
                  <td className="px-3 py-2">{c.block}</td>
                  <td className="px-3 py-2">{c.gps}</td>
                  <td className="px-3 py-2">{c.enrollmentDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

/* ===================== SELECT ===================== */

function Select({ options, value, setValue, label }) {
  return (
    <select
      value={value}
      onChange={(e) => setValue(e.target.value)}
      className="px-3 py-2 text-sm rounded-md bg-[#020617]
      border border-yellow-400/30 text-slate-200"
    >
      <option value="">Select {label}</option>
      {options.map((o) => (
        <option key={o} value={o}>{o}</option>
      ))}
    </select>
  );
}