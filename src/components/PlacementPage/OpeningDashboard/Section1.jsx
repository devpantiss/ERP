import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import AddJobOpeningForm from "./AddJobOpeningForm";
import SlidePanel from "../../common/SlidePanel";
import * as XLSX from "xlsx";
import {
  FaBuilding,
  FaUsers,
  FaMoneyBillWave,
  FaBriefcase,
  FaPlus,
  FaSearch,
  FaEye,
  FaEdit,
  FaChevronLeft,
  FaChevronRight,
  FaFileExport,
} from "react-icons/fa";
import { usePlacementStore } from "../../../stores/placementStore";
import { selectJobOpeningRows } from "../../../stores/selectors/placementSelectors";

/* ================= MAIN ================= */

export default function Section1({ trackingMode }) {
  const location = useLocation();
  const isTrackingMode = trackingMode ?? location.pathname.startsWith("/super-admin");
  const accent = isTrackingMode
    ? {
        border: "border-red-900",
        borderStrong: "border-red-700",
        text: "text-red-300",
        heading: "text-red-400",
        view: "bg-red-900/30 border-red-500 text-red-200",
      }
    : {
        border: "border-cyan-900",
        borderStrong: "border-cyan-700",
        text: "text-cyan-300",
        heading: "text-cyan-400",
        view: "bg-cyan-900/30 border-cyan-500 text-cyan-300",
      };
  const { drives, fetchDrives } = usePlacementStore();
  const [editedRows, setEditedRows] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [salaryFilter, setSalaryFilter] = useState("");
  const [modalContent, setModalContent] = useState(null);
  const [editJob, setEditJob] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [page, setPage] = useState(1);

  const pageSize = 10;

  useEffect(() => {
    fetchDrives();
  }, [fetchDrives]);

  const data = useMemo(() => {
    return selectJobOpeningRows(drives).map((row) => ({ ...row, ...(editedRows[row.id] || {}) }));
  }, [drives, editedRows]);

  const locations = useMemo(() => Array.from(new Set(data.map((job) => job.location))).filter(Boolean), [data]);

  const filteredData = useMemo(() => {
    return data.filter((job) => {
      const matchesSearch =
        !searchTerm ||
        job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.project.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesLocation = !locationFilter || job.location === locationFilter;
      const matchesSalary =
        !salaryFilter ||
        (salaryFilter === "under-18000" && job.salary < 18000) ||
        (salaryFilter === "18000-22000" && job.salary >= 18000 && job.salary <= 22000) ||
        (salaryFilter === "above-22000" && job.salary > 22000);

      return matchesSearch && matchesLocation && matchesSalary;
    });
  }, [data, locationFilter, salaryFilter, searchTerm]);

  /* ================= PAGINATION ================= */

  const totalPages = Math.ceil(filteredData.length / pageSize);

  const paginatedData = filteredData.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  /* ================= SUMMARY ================= */

  const totalOpenings = filteredData.length;
  const totalCompanies = new Set(filteredData.map((d) => d.company)).size;
  const totalVacancies = filteredData.reduce((acc, d) => acc + d.vacancies, 0);
  const avgSalary =
    filteredData.reduce((acc, d) => acc + d.salary, 0) / (filteredData.length || 1);

  /* ================= EXPORT EXCEL ================= */

  const exportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Jobs");
    XLSX.writeFile(workbook, "Job_Openings.xlsx");
  };

  /* ================= UPDATE JOB ================= */

  const saveEdit = (updated) => {
    setEditedRows((prev) => ({ ...prev, [updated.id]: updated }));
    setEditJob(null);
  };

  return (
    <div className="bg-[#0B1120] text-white/90 p-6 space-y-6">

      {/* ================= SUMMARY ================= */}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">

        <StatCard title="Total Openings" value={totalOpenings} icon={<FaBriefcase />} accent={accent} />
        <StatCard title="Companies" value={totalCompanies} icon={<FaBuilding />} accent={accent} />
        <StatCard title="Vacancies" value={totalVacancies} icon={<FaUsers />} accent={accent} />
        <StatCard title="Avg Salary" value={`₹ ${Math.round(avgSalary)}`} icon={<FaMoneyBillWave />} accent={accent} />

      </div>

      {/* ================= FILTER + ACTION ================= */}

      <div className={`grid grid-cols-1 gap-6 ${isTrackingMode ? "" : "lg:grid-cols-4"}`}>

        <div className={`${isTrackingMode ? "" : "lg:col-span-3"} bg-[#111827] border ${accent.border} rounded-xl p-5`}>

          <div className="flex items-center justify-between mb-4">
            <h3 className={`${accent.heading} text-sm font-semibold`}>
              FILTER JOB OPENINGS
            </h3>

            <button
              onClick={() => {
                setSearchTerm("");
                setLocationFilter("");
                setSalaryFilter("");
                setPage(1);
              }}
              className="text-xs text-white/60"
            >
              Clear Filters
            </button>
          </div>

          <div className="grid md:grid-cols-3 gap-4">

            <div className="relative">
              <FaSearch className="absolute top-3 left-3 text-gray-500" />
              <input
                placeholder="Search..."
                value={searchTerm}
                onChange={(event) => {
                  setSearchTerm(event.target.value);
                  setPage(1);
                }}
                className="w-full bg-[#020617] border border-gray-700 rounded-lg pl-9 py-2"
              />
            </div>

            <select
              value={locationFilter}
              onChange={(event) => {
                setLocationFilter(event.target.value);
                setPage(1);
              }}
              className="bg-[#020617] border border-gray-700 rounded-lg p-2"
            >
              <option value="">All Locations</option>
              {locations.map((location) => (
                <option key={location} value={location}>{location}</option>
              ))}
            </select>

            <select
              value={salaryFilter}
              onChange={(event) => {
                setSalaryFilter(event.target.value);
                setPage(1);
              }}
              className="bg-[#020617] border border-gray-700 rounded-lg p-2"
            >
              <option value="">Salary Range</option>
              <option value="under-18000">Below ₹18,000</option>
              <option value="18000-22000">₹18,000 - ₹22,000</option>
              <option value="above-22000">Above ₹22,000</option>
            </select>

          </div>
        </div>

        {/* ACTION BUTTONS */}

        {!isTrackingMode && (
        <div className="flex flex-col gap-3">

          <button
            onClick={() => setShowAddForm(true)}
            className="bg-cyan-500 text-black px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-cyan-400 transition-colors shadow-lg shadow-cyan-500/20"
          >
            <FaPlus /> Add Job Opening
          </button>

          <button
            onClick={exportExcel}
            className="bg-green-500 text-black px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <FaFileExport /> Export Excel
          </button>

        </div>
        )}

      </div>

      {/* ================= TABLE ================= */}

      <div className={`bg-[#111827] border ${accent.border} rounded-xl overflow-hidden`}>

        <div className="overflow-x-auto">

          <table className={`${isTrackingMode ? "min-w-[1000px]" : "min-w-[1100px]"} w-full text-sm`}>

            <thead className={`bg-[#020617] ${accent.text}`}>

              <tr className="text-xs uppercase tracking-wider">
                <th className="px-4 py-3 text-left">Company</th>
                <th className="px-4 py-3 text-left">Role</th>
                <th className="px-4 py-3 text-left">Location</th>
                <th className="px-4 py-3 text-left">Salary</th>
                <th className="px-4 py-3 text-center">Eligibility</th>
                <th className="px-4 py-3 text-center">Description</th>
                <th className="px-4 py-3">Vacancies</th>
                <th className="px-4 py-3">Status</th>
                {!isTrackingMode && <th className="px-4 py-3 text-center">Edit</th>}
              </tr>

            </thead>

            <tbody>

              {paginatedData.map((job) => (

                <tr
                  key={job.id}
                  className="border-t border-white/[0.08] hover:bg-[#0B1120]"
                >

                  <td className="px-4 py-3">{job.company}</td>
                  <td className="px-4 py-3">{job.role}</td>
                  <td className="px-4 py-3">{job.location}</td>
                  <td className="px-4 py-3 text-green-400">₹ {job.salary}</td>

                  <td className="px-4 py-3 text-center">
                    <ViewButton
                      accent={accent}
                      onClick={() =>
                        setModalContent({
                          title: "Eligibility",
                          content: job.eligibility,
                        })
                      }
                    />
                  </td>

                  <td className="px-4 py-3 text-center">
                    <ViewButton
                      accent={accent}
                      onClick={() =>
                        setModalContent({
                          title: "Job Description",
                          content: job.description,
                        })
                      }
                    />
                  </td>

                  <td className="px-4 py-3">{job.vacancies}</td>

                  <td className="px-4 py-3">
                    <StatusBadge status={job.status} />
                  </td>

                  {!isTrackingMode && (
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => setEditJob(job)}
                        className="text-cyan-400"
                      >
                        <FaEdit />
                      </button>
                    </td>
                  )}

                </tr>

              ))}

            </tbody>

          </table>

        </div>

        {/* ================= PAGINATION ================= */}

        <div className="flex justify-between items-center p-4 border-t border-white/[0.08]">

          <div className="text-sm text-white/60">
            Showing {(page - 1) * pageSize + 1} to{" "}
            {Math.min(page * pageSize, filteredData.length)} of {filteredData.length}
          </div>

          <div className="flex gap-2">

            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className={`px-3 py-1 border ${accent.borderStrong} rounded`}
            >
              <FaChevronLeft />
            </button>

            <span className="px-3 text-sm">
              {page} / {totalPages}
            </span>

            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
              className={`px-3 py-1 border ${accent.borderStrong} rounded`}
            >
              <FaChevronRight />
            </button>

          </div>

        </div>

      </div>

      {/* ================= MODALS ================= */}

      {modalContent && (
        <ContentModal
          title={modalContent.title}
          content={modalContent.content}
          onClose={() => setModalContent(null)}
        />
      )}

      {!isTrackingMode && editJob && (
        <EditModal
          job={editJob}
          onClose={() => setEditJob(null)}
          onSave={saveEdit}
        />
      )}

      {/* ADD JOB OPENING FORM */}
      {!isTrackingMode && (
        <AddJobOpeningForm
          open={showAddForm}
          onClose={() => setShowAddForm(false)}
          onSubmit={(data) => {
            console.log("New Job Opening:", data);
            setShowAddForm(false);
          }}
        />
      )}

    </div>
  );
}

/* ================= COMPONENTS ================= */

function StatCard({ title, value, icon, accent }) {
  return (
    <div className={`bg-linear-to-br from-[#0B1120] to-[#020617] border ${accent.border} rounded-xl p-5 flex items-center gap-4`}>
      <div className={`${accent.heading} text-xl`}>{icon}</div>
      <div>
        <p className="text-white/60 text-sm">{title}</p>
        <h2 className="text-xl font-bold">{value}</h2>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const open = status === "Open";

  return (
    <span
      className={`px-2 py-1 text-xs rounded-lg border
      ${
        open
          ? "bg-green-900/30 text-green-400 border-green-600"
          : "bg-red-900/30 text-red-400 border-red-600"
      }`}
    >
      {status}
    </span>
  );
}

function ViewButton({ onClick, accent }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1 border px-3 py-1 rounded-lg text-xs ${accent.view}`}
    >
      <FaEye /> View
    </button>
  );
}

function ContentModal({ title, content, onClose }) {
  return (
    <SlidePanel open={true} onClose={onClose} title={title} width="md">
        <div className="text-sm text-white/80">{content}</div>
    </SlidePanel>
  );
}

/* ================= EDIT MODAL ================= */

function EditModal({ job, onClose, onSave }) {
  const [form, setForm] = useState(job);

  const update = (field, value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  return (
    <SlidePanel open={true} onClose={onClose} title="Edit Job Opening" width="3xl">
        <div className="grid md:grid-cols-2 gap-5 mb-8">
          <div>
            <label className="text-xs text-white/60 mb-1 block">Company</label>
            <input
              value={form.company}
              onChange={(e) => update("company", e.target.value)}
              className="w-full bg-[#020617] border border-gray-700 p-2.5 rounded-lg text-sm focus:border-cyan-500 outline-none"
            />
          </div>

          <div>
            <label className="text-xs text-white/60 mb-1 block">Role</label>
            <input
              value={form.role}
              onChange={(e) => update("role", e.target.value)}
              className="w-full bg-[#020617] border border-gray-700 p-2.5 rounded-lg text-sm focus:border-cyan-500 outline-none"
            />
          </div>

          <div>
            <label className="text-xs text-white/60 mb-1 block">Location</label>
            <input
              value={form.location}
              onChange={(e) => update("location", e.target.value)}
              className="w-full bg-[#020617] border border-gray-700 p-2.5 rounded-lg text-sm focus:border-cyan-500 outline-none"
            />
          </div>

          <div>
            <label className="text-xs text-white/60 mb-1 block">Salary</label>
            <input
              value={form.salary}
              onChange={(e) => update("salary", e.target.value)}
              className="w-full bg-[#020617] border border-gray-700 p-2.5 rounded-lg text-sm focus:border-cyan-500 outline-none"
            />
          </div>

          <div>
            <label className="text-xs text-white/60 mb-1 block">Vacancies</label>
            <input
              value={form.vacancies}
              onChange={(e) => update("vacancies", e.target.value)}
              className="w-full bg-[#020617] border border-gray-700 p-2.5 rounded-lg text-sm focus:border-cyan-500 outline-none"
            />
          </div>

          <div>
            <label className="text-xs text-white/60 mb-1 block">Status</label>
            <select
              value={form.status}
              onChange={(e) => update("status", e.target.value)}
              className="w-full bg-[#020617] border border-gray-700 p-2.5 rounded-lg text-sm focus:border-cyan-500 outline-none"
            >
              <option>Open</option>
              <option>Closed</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t border-gray-800">
          <button onClick={onClose} className="border border-gray-600 text-white/80 px-5 py-2 rounded-lg font-medium hover:bg-gray-800 transition">
            Cancel
          </button>

          <button
            onClick={() => onSave(form)}
            className="bg-cyan-500 hover:bg-cyan-400 text-black px-5 py-2 rounded-lg font-medium transition shadow-lg shadow-cyan-500/20"
          >
            Save Changes
          </button>
        </div>
    </SlidePanel>
  );
}
