import Pagination from "../../components/common/Pagination";
import SlidePanel from "../../components/common/SlidePanel";
import ExportPDFButton from "../../components/common/ExportPDFButton";
import {
  getSubmittedEnrollments,
  updateSubmittedEnrollmentStatus,
} from "../../components/utils/enrollmentStorage";
import { useMemo, useState } from "react";
import {
  CheckCircle,
  Eye,
  FileText,
  Image as ImageIcon,
  MapPin,
  X,
  XCircle,
} from "lucide-react";

const sampleImage = (i) => `https://i.pravatar.cc/400?img=${(i % 70) + 1}`;
const samplePDF = "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf";

const makeSampleDocument = (name, url, type = "") => ({ name, url, type });

const CANDIDATES = Array.from({ length: 12 }, (_, i) => ({
  id: `sample-${i + 1}`,
  name: `Candidate ${i + 1}`,
  mobilizer: ["Priya Mishra", "Vikram Singh", "Rajan Nayak", "Sunita Patra"][i % 4],
  school: [
    "School for Mines, Steel & Aluminium",
    "School for Furniture & Fittings",
    "School for Power & Green Energy",
    "School for Shipping & Logistics",
  ][i % 4],
  center: ["Talcher Mining Training Center", "Bhubaneswar Furniture Skill Hub", "Angul Solar Energy Skill Center", "Paradip Port Skill Center"][i % 4],
  jobrole: ["Dumper Operator", "Furniture Carpenter", "Solar Panel Installer", "Forklift Operator"][i % 4],
  dob: `199${i % 5}-0${(i % 8) + 1}-15`,
  gender: i % 2 === 0 ? "Male" : "Female",
  phone: `98765${43210 + i}`,
  aadhaar: `XXXX-XXXX-${2000 + i}`,
  qualification: ["10th Pass", "12th Pass", "ITI", "Diploma"][i % 4],
  qualificationTrade: ["Electrical", "Fitter", "Welder", "Logistics"][i % 4],
  qualificationInstitute: ["ITI Angul", "Govt Polytechnic", "CBSE Board", "Skill Center"][i % 4],
  qualificationYear: String(2020 + (i % 5)),
  experience: `${i % 4} Years`,
  currentlyEmployed: i % 2 ? "No" : "Yes",
  address: ["House 12", "Main Road", "Angul", "Odisha", "759122"].join(", "),
  enrollmentDate: "2026-05-14",
  status: i % 5 === 0 ? "Approved" : i % 5 === 1 ? "Rejected" : "Pending",
  image: sampleImage(i),
  liveLocation: { lat: 20.2961 + i / 100, lng: 85.8245 + i / 100, accuracy: 25, place: "Odisha training cluster" },
  documents: {
    aadhaar: makeSampleDocument("aadhaar.pdf", i % 2 ? samplePDF : sampleImage(i + 10), i % 2 ? "application/pdf" : "image/jpeg"),
    qualification: makeSampleDocument("qualification.pdf", i % 2 ? sampleImage(i + 20) : samplePDF, i % 2 ? "image/jpeg" : "application/pdf"),
    experience: i % 3 ? makeSampleDocument("experience.pdf", samplePDF, "application/pdf") : null,
    license: i % 4 === 0 ? makeSampleDocument("operator-license.jpg", sampleImage(i + 30), "image/jpeg") : null,
  },
}));

const DOCUMENT_FIELDS = [
  { key: "aadhaar", label: "Aadhaar Card" },
  { key: "qualification", label: "Qualification Certificate" },
  { key: "experience", label: "Experience Certificate" },
  { key: "license", label: "Operator / Driving License" },
];

function toCandidate(raw) {
  const documents = raw.documents || {
    aadhaar: raw.aadhaarFile ? makeSampleDocument("aadhaar", raw.aadhaarFile) : null,
    qualification: raw.qualificationFile ? makeSampleDocument("qualification", raw.qualificationFile) : null,
    license: raw.licenceFile ? makeSampleDocument("license", raw.licenceFile) : null,
  };

  return {
    ...raw,
    mobilizer: raw.mobilizer || "Current Mobilizer",
    school: raw.school || "Not Assigned",
    center: raw.center || "Not Assigned",
    jobrole: raw.jobrole || raw.role || "Not Assigned",
    status: raw.status || "Pending",
    image: raw.image || raw.avatar || sampleImage(1),
    documents,
  };
}

function getDocumentUrl(file) {
  return typeof file === "string" ? file : file?.url;
}

function isPdf(file) {
  const url = getDocumentUrl(file) || "";
  const type = typeof file === "string" ? "" : file?.type || "";
  return type.includes("pdf") || url.includes("application/pdf") || url.toLowerCase().includes(".pdf");
}

function formatValue(value) {
  if (!value) return "-";
  if (value instanceof Date) return value.toISOString().split("T")[0];
  return String(value);
}

export default function AdminCandidateApprovals() {
  const submittedCandidates = useMemo(() => getSubmittedEnrollments().map(toCandidate), []);
  const [candidates, setCandidates] = useState([...submittedCandidates, ...CANDIDATES.map(toCandidate)]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [centerFilter, setCenterFilter] = useState("All");
  const [jobRoleFilter, setJobRoleFilter] = useState("All");
  const [viewCandidate, setViewCandidate] = useState(null);
  const [previewFile, setPreviewFile] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const centers = ["All", ...new Set(candidates.map((c) => c.center))];
  const jobRoles = ["All", ...new Set(candidates.map((c) => c.jobrole))];

  const filtered = useMemo(() => {
    const needle = search.toLowerCase();
    return candidates.filter((c) => {
      const searchable = [c.name, c.phone, c.aadhaar, c.school, c.center, c.jobrole].join(" ").toLowerCase();
      const matchSearch = !needle || searchable.includes(needle);
      const matchStatus = statusFilter === "All" || c.status === statusFilter;
      const matchCenter = centerFilter === "All" || c.center === centerFilter;
      const matchJobRole = jobRoleFilter === "All" || c.jobrole === jobRoleFilter;
      return matchSearch && matchStatus && matchCenter && matchJobRole;
    });
  }, [candidates, search, statusFilter, centerFilter, jobRoleFilter]);

  const updateStatus = (id, status) => {
    setCandidates((prev) => prev.map((c) => (c.id === id ? { ...c, status } : c)));
    updateSubmittedEnrollmentStatus(id, status);
    setViewCandidate(null);
  };

  const stats = useMemo(() => ({
    total: candidates.length,
    pending: candidates.filter((c) => c.status === "Pending").length,
    approved: candidates.filter((c) => c.status === "Approved").length,
    rejected: candidates.filter((c) => c.status === "Rejected").length,
  }), [candidates]);

  const itemsPerPage = 8;
  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const paginatedData = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-100">Candidate Enrollment Approvals</h1>
          <p className="mt-1 text-sm text-white/60">Review Mobilizer enrollment fields and uploaded documents before approval.</p>
        </div>
        <ExportPDFButton
          title="Candidate Enrollment Approvals"
          columns={["Name", "Phone", "School", "Center", "Job Role", "Qualification", "Status"]}
          data={filtered.map((c) => [c.name, c.phone, c.school, c.center, c.jobrole, c.qualification, c.status])}
          fileName="candidate_enrollment_approvals"
          accent="violet"
        />
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          { label: "Total", value: stats.total, cls: "text-slate-100" },
          { label: "Pending", value: stats.pending, cls: "text-yellow-400" },
          { label: "Approved", value: stats.approved, cls: "text-emerald-400" },
          { label: "Rejected", value: stats.rejected, cls: "text-red-400" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-slate-700 bg-[#111827] p-4">
            <p className="text-xs text-white/60">{s.label}</p>
            <p className={`mt-1 text-xl font-semibold ${s.cls}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <input
          placeholder="Search candidate, phone, Aadhaar, school..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
          className="min-w-[240px] flex-1 rounded-lg border border-slate-700 bg-[#111827] px-4 py-2 text-sm text-white/90 outline-none focus:border-violet-400"
        />
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }} className="rounded-lg border border-slate-700 bg-[#111827] px-3 py-2 text-sm text-white/90">
          <option value="All">All Status</option><option>Pending</option><option>Approved</option><option>Rejected</option>
        </select>
        <select value={centerFilter} onChange={(e) => { setCenterFilter(e.target.value); setCurrentPage(1); }} className="rounded-lg border border-slate-700 bg-[#111827] px-3 py-2 text-sm text-white/90">
          {centers.map((center) => <option key={center} value={center}>{center === "All" ? "All Centers" : center}</option>)}
        </select>
        <select value={jobRoleFilter} onChange={(e) => { setJobRoleFilter(e.target.value); setCurrentPage(1); }} className="rounded-lg border border-slate-700 bg-[#111827] px-3 py-2 text-sm text-white/90">
          {jobRoles.map((role) => <option key={role} value={role}>{role === "All" ? "All Job Roles" : role}</option>)}
        </select>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-700 bg-[#111827]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1180px] text-sm">
            <thead className="bg-[#0b1220] text-white/60">
              <tr>
                <th className="p-4 text-left">Candidate</th>
                <th className="p-4 text-left">School / Center</th>
                <th className="p-4 text-left">Job Role</th>
                <th className="p-4 text-left">Aadhaar</th>
                <th className="p-4 text-left">Qualification</th>
                <th className="p-4 text-left">Documents</th>
                <th className="p-4 text-left">Status</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((candidate) => (
                <tr key={candidate.id} className="border-t border-slate-700/50 transition hover:bg-white/[0.02]">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img src={candidate.image} alt="" className="h-9 w-9 rounded-lg border border-slate-700 object-cover" />
                      <div>
                        <p className="font-medium text-white/90">{candidate.name}</p>
                        <p className="text-xs text-slate-500">{candidate.phone}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <p className="text-white/80">{candidate.school}</p>
                    <p className="text-xs text-white/45">{candidate.center}</p>
                  </td>
                  <td className="p-4 text-white/80">{candidate.jobrole}</td>
                  <td className="p-4 text-white/60">{candidate.aadhaar}</td>
                  <td className="p-4">
                    <p className="text-white/80">{candidate.qualification}</p>
                    <p className="text-xs text-white/45">{candidate.qualificationTrade || "-"}</p>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-2">
                      {DOCUMENT_FIELDS.filter((field) => getDocumentUrl(candidate.documents?.[field.key])).map((field) => (
                        <button
                          key={field.key}
                          onClick={() => setPreviewFile({ label: field.label, file: candidate.documents[field.key] })}
                          className="inline-flex items-center gap-1 rounded-md border border-slate-600 px-2 py-1 text-xs text-white/70 hover:bg-slate-700"
                        >
                          <FileText size={12} /> {field.label.split(" ")[0]}
                        </button>
                      ))}
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`rounded-full px-2.5 py-1 text-xs ${candidate.status === "Approved" ? "bg-emerald-500/10 text-emerald-400" : candidate.status === "Rejected" ? "bg-red-500/10 text-red-400" : "bg-yellow-500/10 text-yellow-400"}`}>
                      {candidate.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => setViewCandidate(candidate)} className="rounded-lg p-1.5 hover:bg-slate-700" title="View"><Eye size={15} className="text-white/60" /></button>
                      {candidate.status === "Pending" && (
                        <>
                          <button onClick={() => updateStatus(candidate.id, "Approved")} className="rounded-lg p-1.5 hover:bg-emerald-500/10" title="Approve"><CheckCircle size={15} className="text-emerald-400" /></button>
                          <button onClick={() => updateStatus(candidate.id, "Rejected")} className="rounded-lg p-1.5 hover:bg-red-500/10" title="Reject"><XCircle size={15} className="text-red-400" /></button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </div>
      </div>

      <SlidePanel open={!!viewCandidate} onClose={() => setViewCandidate(null)} title="Candidate Enrollment Details" width="xl">
        {viewCandidate && (
          <div className="space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <img src={viewCandidate.image} alt="" className="h-20 w-20 rounded-xl border border-slate-700 object-cover" />
                <div>
                  <p className="text-xl font-semibold text-white">{viewCandidate.name}</p>
                  <p className="text-sm text-violet-400">{viewCandidate.jobrole}</p>
                  <p className="mt-1 text-xs text-white/45">Submitted on {formatValue(viewCandidate.enrollmentDate)}</p>
                </div>
              </div>
              <button onClick={() => setViewCandidate(null)} className="text-white/60 hover:text-white"><X size={18} /></button>
            </div>

            <DetailGrid
              rows={[
                ["Phone", viewCandidate.phone],
                ["Date of Birth", viewCandidate.dob],
                ["Gender", viewCandidate.gender],
                ["Aadhaar", viewCandidate.aadhaar],
                ["School", viewCandidate.school],
                ["Training Center", viewCandidate.center],
                ["Qualification Level", viewCandidate.qualification],
                ["Trade / Discipline", viewCandidate.qualificationTrade],
                ["Institute / Board", viewCandidate.qualificationInstitute],
                ["Year of Passing", viewCandidate.qualificationYear],
                ["Experience", viewCandidate.experience],
                ["Currently Employed", viewCandidate.currentlyEmployed],
                ["Address", viewCandidate.address],
              ]}
            />

            <div>
              <p className="mb-2 text-xs text-white/60">Uploaded Documents</p>
              <div className="grid gap-3 md:grid-cols-2">
                {DOCUMENT_FIELDS.map((field) => (
                  <DocumentButton
                    key={field.key}
                    label={field.label}
                    file={viewCandidate.documents?.[field.key]}
                    onPreview={() => setPreviewFile({ label: field.label, file: viewCandidate.documents[field.key] })}
                  />
                ))}
                {viewCandidate.image && (
                  <button
                    onClick={() => setPreviewFile({ label: "Live Candidate Photo", file: { url: viewCandidate.image, type: "image/jpeg" } })}
                    className="flex items-center justify-between rounded-lg border border-slate-700 px-3 py-2 text-left text-sm text-white/80 hover:bg-slate-800"
                  >
                    <span className="inline-flex items-center gap-2"><ImageIcon size={15} /> Live Candidate Photo</span>
                    <Eye size={14} className="text-white/45" />
                  </button>
                )}
              </div>
            </div>

            {viewCandidate.liveLocation && (
              <div className="rounded-xl border border-slate-700 bg-[#0b1220] p-4 text-sm text-white/70">
                <p className="mb-2 flex items-center gap-2 font-medium text-white"><MapPin size={15} /> Captured Location</p>
                <p>{viewCandidate.liveLocation.place || "Location captured by Mobilizer"}</p>
                <p className="mt-1 text-xs text-white/45">
                  {viewCandidate.liveLocation.lat}, {viewCandidate.liveLocation.lng}
                  {viewCandidate.liveLocation.accuracy ? ` | Accuracy: +/-${Math.round(viewCandidate.liveLocation.accuracy)} m` : ""}
                </p>
              </div>
            )}

            {viewCandidate.status === "Pending" && (
              <div className="flex gap-3">
                <button onClick={() => updateStatus(viewCandidate.id, "Approved")} className="flex-1 rounded-lg bg-emerald-500 py-2 font-medium text-white hover:bg-emerald-400">Approve Enrollment</button>
                <button onClick={() => updateStatus(viewCandidate.id, "Rejected")} className="flex-1 rounded-lg bg-red-500 py-2 font-medium text-white hover:bg-red-400">Reject</button>
              </div>
            )}
          </div>
        )}
      </SlidePanel>

      <SlidePanel open={!!previewFile} onClose={() => setPreviewFile(null)} title={previewFile?.label || "Document Preview"} width="xl">
        {previewFile && (
          <div className="space-y-3">
            <div className="flex justify-end">
              <button onClick={() => setPreviewFile(null)} className="text-white/60 hover:text-white">x</button>
            </div>
            {isPdf(previewFile.file) ? (
              <iframe src={getDocumentUrl(previewFile.file)} title={previewFile.label} className="h-[70vh] w-full rounded-lg border border-slate-700" />
            ) : (
              <img src={getDocumentUrl(previewFile.file)} alt={previewFile.label} className="max-h-[70vh] w-full rounded-lg object-contain" />
            )}
          </div>
        )}
      </SlidePanel>
    </div>
  );
}

function DetailGrid({ rows }) {
  return (
    <div className="grid gap-2 text-sm md:grid-cols-2">
      {rows.map(([label, value]) => (
        <div key={label} className="rounded-lg border border-white/[0.08] p-3">
          <p className="text-xs text-white/45">{label}</p>
          <p className="mt-1 text-white/90">{formatValue(value)}</p>
        </div>
      ))}
    </div>
  );
}

function DocumentButton({ label, file, onPreview }) {
  const available = Boolean(getDocumentUrl(file));

  return (
    <button
      type="button"
      disabled={!available}
      onClick={onPreview}
      className={`flex items-center justify-between rounded-lg border px-3 py-2 text-left text-sm ${
        available
          ? "border-slate-700 text-white/80 hover:bg-slate-800"
          : "cursor-not-allowed border-slate-800 text-white/30"
      }`}
    >
      <span className="inline-flex items-center gap-2"><FileText size={15} /> {label}</span>
      <span className="text-xs">{available ? "Preview" : "Missing"}</span>
    </button>
  );
}
