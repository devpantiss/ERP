import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

/* ===================== CONSTANTS ===================== */

const SCHOOLS = ["Govt High School", "Model School", "ITI Jajpur"];
const CENTERS = ["Jajpur Center", "Sukinda Center", "Dharmasala Center"];
const JOBROLES = ["Welder", "Fitter", "Electrician"];

const samplePDF =
  "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf";

const sampleImage = (i) => `https://i.pravatar.cc/400?img=${(i % 70) + 1}`;

/* ===================== DUMMY DATA ===================== */

const CANDIDATES = Array.from({ length: 40 }, (_, i) => ({
  id: i + 1,
  name: `Candidate ${i + 1}`,
  school: SCHOOLS[i % SCHOOLS.length],
  center: CENTERS[i % CENTERS.length],
  jobrole: JOBROLES[i % JOBROLES.length],
  address: "Binjharpur, Jajpur",
  dob: `199${i % 5}-0${(i % 8) + 1}-15`,
  gender: i % 2 === 0 ? "Male" : "Female",
  aadhaar: `XXXX-XXXX-${2000 + i}`,
  qualification: "10th Pass",
  experience: `${i % 3} Years`,
  enrollmentDate: `2024-0${(i % 8) + 1}-15`,
  image: sampleImage(i),
  aadhaarFile: i % 2 ? samplePDF : sampleImage(i + 10),
  qualificationFile: i % 2 ? sampleImage(i + 20) : samplePDF,
  licenceFile: samplePDF,
  verified: i % 3 === 0,
  enrolled: i % 2 === 0,
}));

/* ===================== COMPONENT ===================== */

export default function CandidatesTableDark() {
  const [search, setSearch] = useState("");
  const [school, setSchool] = useState("");
  const [center, setCenter] = useState("");
  const [jobrole, setJobrole] = useState("");
  const [month, setMonth] = useState("");
  const [status, setStatus] = useState("");

  const [previewFile, setPreviewFile] = useState(null);

  /* ===================== FILTER ===================== */

  const filteredData = useMemo(() => {
    return CANDIDATES.filter(
      (c) =>
        (!search || c.name.toLowerCase().includes(search.toLowerCase())) &&
        (!school || c.school === school) &&
        (!center || c.center === center) &&
        (!jobrole || c.jobrole === jobrole) &&
        (!month || new Date(c.enrollmentDate).getMonth() + 1 === Number(month)) &&
        (!status ||
          (status === "enrolled" ? c.enrolled : !c.enrolled))
    );
  }, [search, school, center, jobrole, month, status]);

  /* ===================== STATS ===================== */

  const total = filteredData.length;
  const verified = filteredData.filter((c) => c.verified).length;
  const enrolled = filteredData.filter((c) => c.enrolled).length;

  return (
    <>
      <section className="rounded-2xl border border-yellow-400/30 bg-[#0b0f14] p-6">

        {/* ================= STATS ================= */}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <StatCard title="Total Candidates" value={total} />
          <StatCard title="Verified" value={verified} />
          <StatCard title="Enrolled" value={enrolled} />
        </div>

        {/* ================= FILTER BAR ================= */}

        <div className="rounded-xl border border-yellow-400/20 bg-[#020617]/70 backdrop-blur p-3 mb-6">

          <div className="flex items-center gap-3 flex-wrap">

            {/* SEARCH */}
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                🔍
              </span>

              <input
                placeholder="Search candidate..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-3 py-2 text-sm rounded-md
                bg-[#020617] border border-yellow-400/30
                text-slate-200 w-64
                focus:border-yellow-400 outline-none"
              />
            </div>

            <Select options={SCHOOLS} value={school} setValue={setSchool} label="School" />
            <Select options={CENTERS} value={center} setValue={setCenter} label="Center" />
            <Select options={JOBROLES} value={jobrole} setValue={setJobrole} label="Job Role" />

            {/* MONTH */}
            <select
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="px-3 py-2 text-sm rounded-md
              bg-[#020617] border border-yellow-400/30 text-slate-200"
            >
              <option value="">Month</option>
              {Array.from({ length: 12 }).map((_, i) => (
                <option key={i} value={i + 1}>
                  {new Date(0, i).toLocaleString("default", {
                    month: "long",
                  })}
                </option>
              ))}
            </select>

            {/* STATUS */}
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="px-3 py-2 text-sm rounded-md
              bg-[#020617] border border-yellow-400/30 text-slate-200"
            >
              <option value="">Status</option>
              <option value="enrolled">Enrolled</option>
              <option value="not_enrolled">Not Enrolled</option>
            </select>

            {/* RESET */}
            <button
              onClick={() => {
                setSearch("");
                setSchool("");
                setCenter("");
                setJobrole("");
                setMonth("");
                setStatus("");
              }}
              className="px-3 py-2 text-sm rounded-md
              border border-yellow-400/30 text-yellow-400
              hover:bg-yellow-400/10 transition"
            >
              Reset
            </button>

            {/* ACTION */}
            <div className="ml-auto">
              <Link
                to="/mobilizer/candidate-enrollment"
                className="px-4 py-2 text-sm rounded-md
                bg-yellow-400 text-black font-semibold
                hover:bg-yellow-300 transition shadow-lg shadow-yellow-400/10"
              >
                + Enroll Candidate
              </Link>
            </div>

          </div>

          {/* FILTER CHIPS */}

          <div className="flex flex-wrap gap-2 mt-3">

            {search && (
              <Chip label={`Search: ${search}`} onRemove={() => setSearch("")} />
            )}

            {school && (
              <Chip label={`School: ${school}`} onRemove={() => setSchool("")} />
            )}

            {center && (
              <Chip label={`Center: ${center}`} onRemove={() => setCenter("")} />
            )}

            {jobrole && (
              <Chip label={`Role: ${jobrole}`} onRemove={() => setJobrole("")} />
            )}

            {month && (
              <Chip
                label={`Month: ${
                  new Date(0, month - 1).toLocaleString("default", {
                    month: "long",
                  })
                }`}
                onRemove={() => setMonth("")}
              />
            )}

            {status && (
              <Chip
                label={`Status: ${
                  status === "enrolled" ? "Enrolled" : "Not Enrolled"
                }`}
                onRemove={() => setStatus("")}
              />
            )}

          </div>
        </div>

        {/* ================= TABLE ================= */}

        <div className="overflow-hidden rounded-xl border border-yellow-400/20">

          <div className="overflow-x-auto">

            <table className="min-w-[1700px] w-full text-sm">

              <thead className="bg-[#020617]/90 backdrop-blur sticky top-0 border-b border-yellow-400/20">
                <tr className="text-slate-300 text-xs uppercase tracking-wider">
                  <th className="px-4 py-3 text-left min-w-[220px]">Candidate</th>
                  <th className="px-4 py-3 text-left min-w-[160px]">School</th>
                  <th className="px-4 py-3 text-left min-w-[160px]">Center</th>
                  <th className="px-4 py-3 text-left min-w-[140px]">Job Role</th>
                  <th className="px-4 py-3 text-left min-w-[200px]">Address</th>
                  <th className="px-4 py-3 text-left min-w-[120px]">DOB</th>
                  <th className="px-4 py-3 text-left min-w-[100px]">Gender</th>
                  <th className="px-4 py-3 text-left min-w-[160px]">Aadhaar</th>
                  <th className="px-4 py-3 text-left min-w-[160px]">Qualification</th>
                  <th className="px-4 py-3 text-left min-w-[120px]">Experience</th>
                  <th className="px-4 py-3 text-left min-w-[140px]">Docs</th>
                  <th className="px-4 py-3 text-left min-w-[150px]">Status</th>
                </tr>
              </thead>

              <tbody>
                {filteredData.map((c) => (
                  <tr
                    key={c.id}
                    className="border-t border-yellow-400/10 hover:bg-yellow-400/5 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3 whitespace-nowrap">
                        <img
                          src={c.image}
                          className="w-10 h-10 rounded-full border border-yellow-400/40 cursor-pointer"
                          onClick={() => setPreviewFile(c.image)}
                        />
                        <div>
                          <div className="font-medium text-white">{c.name}</div>
                          <div className="text-xs text-slate-400">{c.center}</div>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">{c.school}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{c.center}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{c.jobrole}</td>
                    <td className="px-4 py-3">{c.address}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{c.dob}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{c.gender}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{c.aadhaar}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{c.qualification}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{c.experience}</td>

                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <DocThumb file={c.aadhaarFile} setPreview={setPreviewFile} label="A" />
                        <DocThumb file={c.qualificationFile} setPreview={setPreviewFile} label="Q" />
                        <DocThumb file={c.licenceFile} setPreview={setPreviewFile} label="L" />
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        <StatusBadge
                          label={c.verified ? "Verified" : "Not Verified"}
                          color={c.verified ? "green" : "red"}
                        />
                        <StatusBadge
                          label={c.enrolled ? "Enrolled" : "Not Enrolled"}
                          color={c.enrolled ? "blue" : "gray"}
                        />
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>

            </table>

          </div>
        </div>

      </section>

      {previewFile && (
        <FileModal file={previewFile} onClose={() => setPreviewFile(null)} />
      )}
    </>
  );
}

/* ===================== COMPONENTS ===================== */

function StatCard({ title, value }) {
  return (
    <div className="bg-[#020617] border border-yellow-400/20 rounded-xl p-4">
      <p className="text-xs text-slate-400">{title}</p>
      <p className="text-2xl font-semibold text-yellow-400 mt-1">{value}</p>
    </div>
  );
}

function Select({ options, value, setValue, label }) {
  return (
    <select
      value={value}
      onChange={(e) => setValue(e.target.value)}
      className="px-3 py-2 text-sm rounded-md
      bg-[#020617] border border-yellow-400/30 text-slate-200"
    >
      <option value="">{label}</option>
      {options.map((o) => (
        <option key={o}>{o}</option>
      ))}
    </select>
  );
}

function DocThumb({ file, setPreview, label }) {
  const isPDF = file?.includes(".pdf");

  return (
    <div
      onClick={() => setPreview(file)}
      className="w-10 h-10 rounded border border-yellow-400/30
      flex items-center justify-center cursor-pointer
      hover:bg-yellow-400/10 text-xs"
    >
      {isPDF ? label : <img src={file} className="w-full h-full object-cover" />}
    </div>
  );
}

function StatusBadge({ label, color }) {
  const map = {
    green: "bg-green-500/10 text-green-400 border-green-400/30",
    red: "bg-red-500/10 text-red-400 border-red-400/30",
    blue: "bg-blue-500/10 text-blue-400 border-blue-400/30",
    gray: "bg-gray-500/10 text-gray-400 border-gray-400/30",
  };

  return (
    <div className={`px-2 py-1 text-xs rounded border ${map[color]}`}>
      {label}
    </div>
  );
}

function Chip({ label, onRemove }) {
  return (
    <div className="flex items-center gap-2 px-3 py-1 text-xs rounded-full
    bg-yellow-400/10 text-yellow-400 border border-yellow-400/30">
      {label}
      <button onClick={onRemove} className="text-yellow-400 hover:text-white">
        ✕
      </button>
    </div>
  );
}

function FileModal({ file, onClose }) {
  const isPDF = file?.includes(".pdf");

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-[#020617] rounded-xl p-4 max-w-3xl w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between mb-3">
          <button
            onClick={() => window.open(file)}
            className="px-3 py-1 text-sm border border-yellow-400 text-yellow-400 rounded"
          >
            Download
          </button>

          <button onClick={onClose} className="text-slate-400 hover:text-white">
            ✕
          </button>
        </div>

        {isPDF ? (
          <iframe src={file} className="w-full h-[500px]" />
        ) : (
          <img src={file} className="w-full rounded-lg" />
        )}
      </div>
    </div>
  );
}