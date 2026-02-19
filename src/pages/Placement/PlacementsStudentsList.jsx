import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaPlus,
  FaUsers,
  FaMoneyBillWave,
  FaCheckCircle,
  FaFileAlt,
  FaSearch,
  FaUpload,
  FaEye,
  FaTimes,
  FaClock,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";

/* ================= DUMMY DATA ================= */

const projects = ["Mining", "Shipping", "Construction", "Power"];
const companies = ["Tata Steel", "Adani", "L&T", "JSW", "Reliance", "Vedanta"];

const generateData = () =>
  Array.from({ length: 30 }, (_, i) => ({
    id: i + 1,
    name: `Candidate ${i + 1}`,
    project: projects[i % projects.length],
    batch: `B00${(i % 5) + 1}`,
    company: companies[i % companies.length],
    designation: "Technician",
    salary: 18000 + (i % 5) * 3000,
    joiningDate: "2026-01-15",
    docs: {},
  }));

/* ================= MAIN COMPONENT ================= */

export default function CandidatePlacementSheetEnterpriseDark() {
  const navigate = useNavigate();

  const [data, setData] = useState(generateData());
  const [previewFile, setPreviewFile] = useState(null);
  const [progress, setProgress] = useState({});
  const [page, setPage] = useState(1);

  const pageSize = 20;

  /* ================= PAGINATION ================= */

  const totalPages = Math.ceil(data.length / pageSize);

  const paginatedData = data.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  /* ================= STATS ================= */

  const total = data.length;
  const placed = data.filter((d) => d.company).length;
  const avgSalary =
    data.reduce((acc, curr) => acc + (curr.salary || 0), 0) /
    (data.length || 1);

  /* ================= FILE UPLOAD ================= */

  const simulateUpload = (id, field, file) => {
    let percent = 0;

    const interval = setInterval(() => {
      percent += 10;

      setProgress((prev) => ({
        ...prev,
        [`${id}_${field}`]: percent,
      }));

      if (percent >= 100) {
        clearInterval(interval);

        setData((prev) =>
          prev.map((row) =>
            row.id === id
              ? {
                  ...row,
                  docs: {
                    ...row.docs,
                    [field]: file,
                  },
                }
              : row
          )
        );
      }
    }, 150);
  };

  /* ================= STATUS ================= */

  const getStatus = (row) => {
    if (row.docs.offer && row.docs.bank) return "Verified";
    return "Pending";
  };

  /* ================= RENDER ================= */

  return (
    <div className="min-h-screen bg-[#0B1120] text-gray-200 p-6 space-y-6">

      {/* ================= SUMMARY CARDS ================= */}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <StatCard title="Total Candidates" value={total} icon={<FaUsers />} />
        <StatCard title="Placed" value={placed} icon={<FaCheckCircle />} />
        <StatCard
          title="Average Salary"
          value={`₹ ${Math.round(avgSalary)}`}
          icon={<FaMoneyBillWave />}
        />
        <StatCard
          title="Documents Pending"
          value={total - placed}
          icon={<FaFileAlt />}
        />
      </div>

      {/* ================= FILTER + ACTION ================= */}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

        {/* FILTER PANEL */}

        <div className="lg:col-span-3 bg-[#111827] border border-cyan-900 rounded-xl p-5 shadow-lg">

          <div className="flex items-center justify-between mb-4">
            <h3 className="text-cyan-400 font-semibold text-sm tracking-wide">
              FILTER CANDIDATES
            </h3>

            <button className="text-xs text-gray-400 hover:text-cyan-400">
              Clear Filters
            </button>
          </div>

          <div className="border-t border-gray-800 mb-5" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            {/* Search */}

            <div className="space-y-1">
              <label className="text-xs text-gray-400">Search</label>

              <div className="relative">
                <FaSearch className="absolute top-1/2 -translate-y-1/2 left-3 text-gray-500 text-sm" />

                <input
                  placeholder="Candidate name..."
                  className="w-full bg-[#020617] border border-gray-700 rounded-lg pl-9 pr-3 py-2 text-sm
                  focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none"
                />
              </div>
            </div>

            {/* Project */}

            <div className="space-y-1">
              <label className="text-xs text-gray-400">Project</label>

              <select className="w-full bg-[#020617] border border-gray-700 rounded-lg p-2 text-sm">
                <option>All Projects</option>
                <option>Mining</option>
                <option>Shipping</option>
                <option>Construction</option>
                <option>Power</option>
              </select>
            </div>

            {/* Batch */}

            <div className="space-y-1">
              <label className="text-xs text-gray-400">Batch</label>

              <select className="w-full bg-[#020617] border border-gray-700 rounded-lg p-2 text-sm">
                <option>All Batches</option>
                <option>B001</option>
                <option>B002</option>
                <option>B003</option>
              </select>
            </div>

          </div>
        </div>

        {/* ACTION BUTTON */}

        <div className="lg:col-span-1 flex lg:justify-end lg:items-start">

          <div className="w-full lg:w-auto">

            <button
              onClick={() =>
                navigate("/placement-officer/placements-list/new")
              }
              className="
              w-full lg:w-auto
              bg-cyan-500 hover:bg-cyan-400
              text-black
              px-5 py-2.5
              rounded-lg
              flex items-center justify-center gap-2
              font-semibold
              shadow-lg
              transition
              "
            >
              <FaPlus />
              Enter Candidate Details
            </button>

            <p className="text-xs text-gray-500 mt-2 lg:text-right">
              Add new placement record
            </p>

          </div>

        </div>

      </div>

      {/* ================= TABLE ================= */}

      <div className="bg-[#111827] border border-cyan-900 rounded-xl overflow-hidden shadow-lg">

        <div className="overflow-x-auto">

          <table className="min-w-[1400px] w-full text-sm">

            <thead className="bg-[#020617] text-cyan-300 sticky top-0 z-10">

              <tr className="text-xs uppercase tracking-wider">

                <th className="px-4 py-3 text-left min-w-[180px]">Candidate</th>
                <th className="px-4 py-3 text-left min-w-[140px]">Project</th>
                <th className="px-4 py-3 text-left min-w-[120px]">Batch</th>
                <th className="px-4 py-3 text-left min-w-[180px]">Company</th>
                <th className="px-4 py-3 text-left min-w-[160px]">Designation</th>
                <th className="px-4 py-3 text-left min-w-[120px]">Salary</th>
                <th className="px-4 py-3 text-left min-w-[140px]">Joining Date</th>
                <th className="px-4 py-3 text-left min-w-[120px]">Status</th>

                <th className="px-4 py-3 text-center min-w-[140px]">Offer</th>
                <th className="px-4 py-3 text-center min-w-[140px]">M1</th>
                <th className="px-4 py-3 text-center min-w-[140px]">M2</th>
                <th className="px-4 py-3 text-center min-w-[140px]">M3</th>
                <th className="px-4 py-3 text-center min-w-[160px]">Bank</th>

              </tr>

            </thead>

            <tbody>

              {paginatedData.map((row) => (

                <tr
                  key={row.id}
                  className="border-t border-gray-800 hover:bg-[#0B1120]"
                >

                  <td className="px-4 py-3 font-medium">{row.name}</td>
                  <td className="px-4 py-3">{row.project}</td>
                  <td className="px-4 py-3">{row.batch}</td>
                  <td className="px-4 py-3">{row.company}</td>
                  <td className="px-4 py-3">{row.designation}</td>
                  <td className="px-4 py-3 text-green-400">₹ {row.salary}</td>
                  <td className="px-4 py-3">{row.joiningDate}</td>

                  <td className="px-4 py-3">
                    <StatusBadge status={getStatus(row)} />
                  </td>

                  {["offer", "m1", "m2", "m3", "bank"].map((field) => (
                    <td key={field} className="px-4 py-3 text-center">
                      <UploadCell
                        file={row.docs[field]}
                        progress={progress[`${row.id}_${field}`]}
                        onUpload={(file) =>
                          simulateUpload(row.id, field, file)
                        }
                        onPreview={() =>
                          setPreviewFile(row.docs[field])
                        }
                      />
                    </td>
                  ))}

                </tr>

              ))}

            </tbody>

          </table>

        </div>

        {/* PAGINATION */}

        <div className="flex justify-between items-center p-4 border-t border-gray-800 bg-[#020617]">

          <div className="text-sm text-gray-400">
            Page {page} / {totalPages}
          </div>

          <div className="flex gap-2">

            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-3 py-1.5 bg-[#020617] border border-cyan-700 rounded-lg disabled:opacity-40"
            >
              <FaChevronLeft />
            </button>

            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1.5 bg-[#020617] border border-cyan-700 rounded-lg disabled:opacity-40"
            >
              <FaChevronRight />
            </button>

          </div>

        </div>

      </div>

      {previewFile && (
        <PreviewModal
          file={previewFile}
          onClose={() => setPreviewFile(null)}
        />
      )}

    </div>
  );
}

/* ================= CHILD COMPONENTS ================= */

function StatCard({ title, value, icon }) {
  return (
    <div className="bg-linear-to-br from-[#0B1120] to-[#020617] border border-cyan-900 rounded-xl p-5 flex items-center gap-4">
      <div className="text-cyan-400 text-xl">{icon}</div>
      <div>
        <p className="text-gray-400 text-sm">{title}</p>
        <h2 className="text-xl font-bold text-white">{value}</h2>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const verified = status === "Verified";

  return (
    <div
      className={`flex items-center gap-2 px-3 py-1 rounded-lg text-xs
      ${
        verified
          ? "bg-green-900/30 text-green-400 border border-green-600"
          : "bg-yellow-900/30 text-yellow-400 border border-yellow-600"
      }`}
    >
      {verified ? <FaCheckCircle /> : <FaClock />}
      {status}
    </div>
  );
}

function UploadCell({ file, progress, onUpload, onPreview }) {
  return (
    <div className="flex flex-col gap-2">

      {!file && (
        <label className="cursor-pointer bg-[#020617] border border-cyan-700 text-cyan-300 px-3 py-1 rounded-lg text-xs flex items-center gap-2">
          <FaUpload />
          Upload
          <input
            type="file"
            className="hidden"
            onChange={(e) => onUpload(e.target.files[0])}
          />
        </label>
      )}

      {progress && progress < 100 && (
        <div className="w-28 bg-gray-700 rounded h-2">
          <div
            className="bg-cyan-400 h-2 rounded"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {file && (
        <button
          onClick={onPreview}
          className="flex items-center gap-2 bg-cyan-900/30 border border-cyan-500 text-cyan-300 px-3 py-1 rounded-lg text-xs"
        >
          <FaEye /> View
        </button>
      )}

    </div>
  );
}

function PreviewModal({ file, onClose }) {
  const url = URL.createObjectURL(file);
  const isImage = file.type.startsWith("image");

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur flex justify-center items-center z-50">

      <div className="bg-[#111827] border border-cyan-900 rounded-xl p-4 w-[90%] max-w-3xl relative">

        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400"
        >
          <FaTimes />
        </button>

        {isImage ? (
          <img src={url} alt="" className="max-h-[70vh] mx-auto rounded" />
        ) : (
          <iframe src={url} className="w-full h-[70vh]" title="preview" />
        )}

      </div>

    </div>
  );
}
