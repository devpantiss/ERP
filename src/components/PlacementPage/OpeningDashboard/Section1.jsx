import React, { useState } from "react";
import * as XLSX from "xlsx";
import {
  FaBuilding,
  FaUsers,
  FaMoneyBillWave,
  FaBriefcase,
  FaPlus,
  FaSearch,
  FaEye,
  FaTimes,
  FaEdit,
  FaChevronLeft,
  FaChevronRight,
  FaFileExport,
} from "react-icons/fa";

/* ================= DUMMY DATA ================= */

const companies = [
  "Tata Steel",
  "Adani",
  "L&T",
  "Reliance",
  "Vedanta",
  "JSW",
  "UltraTech",
];

const locations = ["Mumbai", "Jamshedpur", "Gujarat", "Pune", "Delhi"];

const roles = [
  "Technician",
  "Plant Operator",
  "Site Supervisor",
  "Electrician",
  "Maintenance Engineer",
];

const generateJobs = () =>
  Array.from({ length: 50 }, (_, i) => ({
    id: i + 1,
    company: companies[i % companies.length],
    role: roles[i % roles.length],
    location: locations[i % locations.length],
    salary: 18000 + (i % 6) * 4000,
    eligibility:
      "ITI / Diploma with minimum 60% marks. Basic technical knowledge required.",
    description:
      "Responsible for operational activities, maintenance support, and safety compliance.",
    vacancies: 10 + (i % 10),
    status: i % 3 === 0 ? "Closed" : "Open",
  }));

/* ================= MAIN ================= */

export default function Section1() {
  const [data, setData] = useState(generateJobs());
  const [modalContent, setModalContent] = useState(null);
  const [editJob, setEditJob] = useState(null);
  const [page, setPage] = useState(1);

  const pageSize = 10;

  /* ================= PAGINATION ================= */

  const totalPages = Math.ceil(data.length / pageSize);

  const paginatedData = data.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  /* ================= SUMMARY ================= */

  const totalOpenings = data.length;
  const totalCompanies = new Set(data.map((d) => d.company)).size;
  const totalVacancies = data.reduce((acc, d) => acc + d.vacancies, 0);
  const avgSalary =
    data.reduce((acc, d) => acc + d.salary, 0) / (data.length || 1);

  /* ================= EXPORT EXCEL ================= */

  const exportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Jobs");
    XLSX.writeFile(workbook, "Job_Openings.xlsx");
  };

  /* ================= UPDATE JOB ================= */

  const saveEdit = (updated) => {
    setData((prev) =>
      prev.map((job) => (job.id === updated.id ? updated : job))
    );
    setEditJob(null);
  };

  return (
    <div className="min-h-screen bg-[#0B1120] text-gray-200 p-6 space-y-6">

      {/* ================= SUMMARY ================= */}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">

        <StatCard title="Total Openings" value={totalOpenings} icon={<FaBriefcase />} />
        <StatCard title="Companies" value={totalCompanies} icon={<FaBuilding />} />
        <StatCard title="Vacancies" value={totalVacancies} icon={<FaUsers />} />
        <StatCard title="Avg Salary" value={`₹ ${Math.round(avgSalary)}`} icon={<FaMoneyBillWave />} />

      </div>

      {/* ================= FILTER + ACTION ================= */}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

        <div className="lg:col-span-3 bg-[#111827] border border-cyan-900 rounded-xl p-5">

          <div className="flex items-center justify-between mb-4">
            <h3 className="text-cyan-400 text-sm font-semibold">
              FILTER JOB OPENINGS
            </h3>

            <button className="text-xs text-gray-400">
              Clear Filters
            </button>
          </div>

          <div className="grid md:grid-cols-3 gap-4">

            <div className="relative">
              <FaSearch className="absolute top-3 left-3 text-gray-500" />
              <input
                placeholder="Search..."
                className="w-full bg-[#020617] border border-gray-700 rounded-lg pl-9 py-2"
              />
            </div>

            <select className="bg-[#020617] border border-gray-700 rounded-lg p-2">
              <option>All Locations</option>
            </select>

            <select className="bg-[#020617] border border-gray-700 rounded-lg p-2">
              <option>Salary Range</option>
            </select>

          </div>
        </div>

        {/* ACTION BUTTONS */}

        <div className="flex flex-col gap-3">

          <button className="bg-cyan-500 text-black px-4 py-2 rounded-lg flex items-center gap-2">
            <FaPlus /> Add Job Opening
          </button>

          <button
            onClick={exportExcel}
            className="bg-green-500 text-black px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <FaFileExport /> Export Excel
          </button>

        </div>

      </div>

      {/* ================= TABLE ================= */}

      <div className="bg-[#111827] border border-cyan-900 rounded-xl overflow-hidden">

        <div className="overflow-x-auto">

          <table className="min-w-[1100px] w-full text-sm">

            <thead className="bg-[#020617] text-cyan-300">

              <tr className="text-xs uppercase tracking-wider">
                <th className="px-4 py-3 text-left">Company</th>
                <th className="px-4 py-3 text-left">Role</th>
                <th className="px-4 py-3 text-left">Location</th>
                <th className="px-4 py-3 text-left">Salary</th>
                <th className="px-4 py-3 text-center">Eligibility</th>
                <th className="px-4 py-3 text-center">Description</th>
                <th className="px-4 py-3">Vacancies</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-center">Edit</th>
              </tr>

            </thead>

            <tbody>

              {paginatedData.map((job) => (

                <tr
                  key={job.id}
                  className="border-t border-gray-800 hover:bg-[#0B1120]"
                >

                  <td className="px-4 py-3">{job.company}</td>
                  <td className="px-4 py-3">{job.role}</td>
                  <td className="px-4 py-3">{job.location}</td>
                  <td className="px-4 py-3 text-green-400">₹ {job.salary}</td>

                  <td className="px-4 py-3 text-center">
                    <ViewButton
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

                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => setEditJob(job)}
                      className="text-cyan-400"
                    >
                      <FaEdit />
                    </button>
                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

        {/* ================= PAGINATION ================= */}

        <div className="flex justify-between items-center p-4 border-t border-gray-800">

          <div className="text-sm text-gray-400">
            Showing {(page - 1) * pageSize + 1} to{" "}
            {Math.min(page * pageSize, data.length)} of {data.length}
          </div>

          <div className="flex gap-2">

            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-3 py-1 border border-cyan-700 rounded"
            >
              <FaChevronLeft />
            </button>

            <span className="px-3 text-sm">
              {page} / {totalPages}
            </span>

            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1 border border-cyan-700 rounded"
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

      {editJob && (
        <EditModal
          job={editJob}
          onClose={() => setEditJob(null)}
          onSave={saveEdit}
        />
      )}

    </div>
  );
}

/* ================= COMPONENTS ================= */

function StatCard({ title, value, icon }) {
  return (
    <div className="bg-linear-to-br from-[#0B1120] to-[#020617] border border-cyan-900 rounded-xl p-5 flex items-center gap-4">
      <div className="text-cyan-400 text-xl">{icon}</div>
      <div>
        <p className="text-gray-400 text-sm">{title}</p>
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

function ViewButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1 bg-cyan-900/30 border border-cyan-500 text-cyan-300 px-3 py-1 rounded-lg text-xs"
    >
      <FaEye /> View
    </button>
  );
}

function ContentModal({ title, content, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/70 flex justify-center items-center">

      <div className="bg-[#111827] border border-cyan-900 rounded-xl p-6 w-[90%] max-w-2xl relative">

        <button
          onClick={onClose}
          className="absolute top-3 right-3"
        >
          <FaTimes />
        </button>

        <h3 className="text-cyan-400 mb-4">{title}</h3>

        <div className="text-sm text-gray-300">{content}</div>

      </div>

    </div>
  );
}

/* ================= EDIT MODAL ================= */

function EditModal({ job, onClose, onSave }) {
  const [form, setForm] = useState(job);

  const update = (field, value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  return (
    <div className="fixed inset-0 bg-black/70 flex justify-center items-center">

      <div className="bg-[#111827] border border-cyan-900 rounded-xl p-6 w-[90%] max-w-lg space-y-4">

        <h3 className="text-cyan-400">Edit Job Opening</h3>

        <input
          value={form.company}
          onChange={(e) => update("company", e.target.value)}
          className="w-full bg-[#020617] border border-gray-700 p-2 rounded"
        />

        <input
          value={form.role}
          onChange={(e) => update("role", e.target.value)}
          className="w-full bg-[#020617] border border-gray-700 p-2 rounded"
        />

        <input
          value={form.location}
          onChange={(e) => update("location", e.target.value)}
          className="w-full bg-[#020617] border border-gray-700 p-2 rounded"
        />

        <input
          value={form.salary}
          onChange={(e) => update("salary", e.target.value)}
          className="w-full bg-[#020617] border border-gray-700 p-2 rounded"
        />

        <input
          value={form.vacancies}
          onChange={(e) => update("vacancies", e.target.value)}
          className="w-full bg-[#020617] border border-gray-700 p-2 rounded"
        />

        <select
          value={form.status}
          onChange={(e) => update("status", e.target.value)}
          className="w-full bg-[#020617] border border-gray-700 p-2 rounded"
        >
          <option>Open</option>
          <option>Closed</option>
        </select>

        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="border px-4 py-2 rounded">
            Cancel
          </button>

          <button
            onClick={() => onSave(form)}
            className="bg-cyan-500 text-black px-4 py-2 rounded"
          >
            Save
          </button>
        </div>

      </div>

    </div>
  );
}
