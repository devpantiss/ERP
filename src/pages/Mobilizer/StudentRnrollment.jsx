import Pagination from "../../components/common/Pagination";
import SlidePanel from "../../components/common/SlidePanel";
import TableExportActions from "../../components/common/TableExportActions";
import { useMemo, useState } from "react";
import CandidateEnrollmentStepper from "../../components/Mobilizer/CandidateEnrollmentStepper";
import jsPDF from "jspdf";
import { saveSubmittedEnrollment } from "../../components/utils/enrollmentStorage";

/* ===================== CONSTANTS ===================== */

const SCHOOLS = ["Govt High School", "Model School", "ITI Jajpur"];
const CENTERS = ["Jajpur Center", "Sukinda Center", "Dharmasala Center"];
const JOBROLES = ["Welder", "Fitter", "Electrician"];
const BATCHES = ["Batch 101", "Batch 102", "Batch 103", "Batch 104"];

const samplePDF =
  "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf";

const sampleImage = (i) => `https://i.pravatar.cc/400?img=${(i % 70) + 1}`;

function ensureAdmitCard(candidate) {
  return candidate.admitCard || {
    id: `ADM-${new Date().getFullYear()}-${String(candidate.id).padStart(4, "0")}`,
    issuedOn: new Date().toISOString().split("T")[0],
    reportingTime: "09:30 AM",
    venue: candidate.center,
  };
}

function downloadAdmitCardPdf(candidate) {
  const admitCard = ensureAdmitCard(candidate);
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 42;
  const contentWidth = pageWidth - margin * 2;
  const cardTop = 44;

  doc.setFillColor(248, 250, 252);
  doc.rect(0, 0, pageWidth, doc.internal.pageSize.getHeight(), "F");
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(1);
  doc.roundedRect(margin, cardTop, contentWidth, 700, 10, 10, "S");

  doc.setFillColor(15, 23, 42);
  doc.roundedRect(margin, cardTop, contentWidth, 92, 10, 10, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("TRAINING CENTER ADMIT CARD", margin + 24, cardTop + 38);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("Candidate Enrollment & Reporting Pass", margin + 24, cardTop + 60);
  doc.setFont("helvetica", "bold");
  doc.text(admitCard.id, pageWidth - margin - 24, cardTop + 38, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.text(`Issued: ${admitCard.issuedOn}`, pageWidth - margin - 24, cardTop + 60, { align: "right" });

  let y = cardTop + 128;
  doc.setTextColor(15, 23, 42);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(candidate.name || "Candidate", margin + 24, y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(71, 85, 105);
  doc.text(`Phone: ${candidate.phone || "-"}`, margin + 24, y + 20);
  doc.text(`Aadhaar: ${candidate.aadhaar || "-"}`, margin + 24, y + 36);

  doc.setDrawColor(226, 232, 240);
  doc.line(margin + 24, y + 58, pageWidth - margin - 24, y + 58);
  y += 88;

  const rows = [
    ["Training Center", candidate.center],
    ["Reporting Venue", admitCard.venue],
    ["Reporting Time", admitCard.reportingTime],
    ["Job Role", candidate.jobrole],
    ["School", candidate.school],
    ["Date of Birth", candidate.dob],
    ["Gender", candidate.gender],
    ["Qualification", candidate.qualification],
    ["Enrollment Date", candidate.enrollmentDate],
    ["Address", candidate.address],
  ];

  rows.forEach(([label, value], index) => {
    const col = index % 2;
    const row = Math.floor(index / 2);
    const x = margin + 24 + col * (contentWidth / 2);
    const rowY = y + row * 58;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text(label, x, rowY);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text(String(value || "-"), x, rowY + 18, { maxWidth: contentWidth / 2 - 42 });
  });

  y += 330;
  doc.setFillColor(255, 251, 235);
  doc.setDrawColor(251, 191, 36);
  doc.roundedRect(margin + 24, y, contentWidth - 48, 72, 8, 8, "FD");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(120, 53, 15);
  doc.text("Reporting Instructions", margin + 42, y + 24);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("Carry this admit card, Aadhaar, and original qualification documents at the training center.", margin + 42, y + 44, {
    maxWidth: contentWidth - 84,
  });

  y += 122;
  doc.setDrawColor(203, 213, 225);
  doc.line(margin + 24, y, margin + 190, y);
  doc.line(pageWidth - margin - 190, y, pageWidth - margin - 24, y);
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text("Candidate Signature", margin + 24, y + 16);
  doc.text("Mobilizer / Center Seal", pageWidth - margin - 190, y + 16);

  doc.save(`${admitCard.id}-${candidate.name || "candidate"}.pdf`);
}

/* ===================== DUMMY DATA ===================== */

const CANDIDATES = Array.from({ length: 40 }, (_, i) => ({
  id: i + 1,
  name: `Candidate ${i + 1}`,
  phone: `98765${String(10000 + i).slice(-5)}`,
  school: SCHOOLS[i % SCHOOLS.length],
  center: CENTERS[i % CENTERS.length],
  jobrole: JOBROLES[i % JOBROLES.length],
  batch: BATCHES[i % BATCHES.length],
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
  admitCard: null,
}));

/* ===================== COMPONENT ===================== */

export default function CandidatesTableDark() {
  const [data, setData] = useState(CANDIDATES);
  const [search, setSearch] = useState("");
  const [school, setSchool] = useState("");
  const [center, setCenter] = useState("");
  const [jobrole, setJobrole] = useState("");
  const [batch, setBatch] = useState("");
  const [month, setMonth] = useState("");
  const [status, setStatus] = useState("");

  const [previewFile, setPreviewFile] = useState(null);
  const [admitCardCandidate, setAdmitCardCandidate] = useState(null);
  const [showEnrollmentForm, setShowEnrollmentForm] = useState(false);

  const createAdmitCard = (candidate) => ({
    ...ensureAdmitCard(candidate),
  });

  const handleGenerateAdmitCard = (candidateId) => {
    setData((prev) =>
      prev.map((candidate) =>
        candidate.id === candidateId
          ? { ...candidate, admitCard: candidate.admitCard || createAdmitCard(candidate) }
          : candidate
      )
    );
  };

  const handleEnrollmentComplete = (enrollment) => {
    const basic = enrollment.basic || {};
    const roleProject = enrollment.roleProject || {};
    const address = enrollment.address?.address || {};
    const nextId = data.reduce((max, candidate) => Math.max(max, candidate.id), 0) + 1;
    const image = enrollment.capture?.photo || sampleImage(nextId);
    const dob = basic.dateOfBirth
      ? new Date(basic.dateOfBirth).toISOString().split("T")[0]
      : "";

    const documents = {
      aadhaar: basic.aadharFile || null,
      qualification: basic.qualificationCert || null,
      experience: basic.experienceCert || null,
      license: basic.licenseCert || null,
    };

    const newCandidate = {
      id: nextId,
      name: basic.fullName || `Candidate ${nextId}`,
      phone: basic.phoneNumber || "",
      school: roleProject.school || "Not Assigned",
      center: roleProject.center || "Not Assigned",
      jobrole: roleProject.role || "Not Assigned",
      batch: roleProject.batch || "Not Assigned",
      address: [address.house, address.street, address.city, address.district, address.state, address.pincode]
        .filter(Boolean)
        .join(", "),
      dob,
      gender: basic.gender || "",
      aadhaar: basic.aadharNumber ? `XXXX-XXXX-${String(basic.aadharNumber).slice(-4)}` : "",
      qualification: basic.qualificationLevel || "",
      qualificationTrade: basic.qualificationTrade || "",
      qualificationInstitute: basic.qualificationInstitute || "",
      qualificationYear: basic.qualificationYear || "",
      experience: basic.experienceYears ? `${basic.experienceYears} Years` : "0 Years",
      currentlyEmployed: basic.currentlyEmployed || "",
      enrollmentDate: new Date().toISOString().split("T")[0],
      image,
      liveLocation: enrollment.capture?.location || null,
      geoLocation: enrollment.address ? { lat: enrollment.address.lat, lng: enrollment.address.lng } : null,
      documents,
      aadhaarFile: documents.aadhaar?.url || samplePDF,
      qualificationFile: documents.qualification?.url || samplePDF,
      licenceFile: documents.license?.url || samplePDF,
      verified: true,
      enrolled: false,
      status: "Pending",
      admitCard: null,
    };

    newCandidate.admitCard = createAdmitCard(newCandidate);
    saveSubmittedEnrollment(newCandidate);
    setData((prev) => [newCandidate, ...prev]);
    setCurrentPage(1);
  };

  /* ===================== FILTER ===================== */

  const filteredData = useMemo(() => {
    return data.filter(
      (c) =>
        (!search || c.name.toLowerCase().includes(search.toLowerCase())) &&
        (!school || c.school === school) &&
        (!center || c.center === center) &&
        (!jobrole || c.jobrole === jobrole) &&
        (!batch || c.batch === batch) &&
        (!month || new Date(c.enrollmentDate).getMonth() + 1 === Number(month)) &&
        (!status ||
          (status === "enrolled" ? c.enrolled : !c.enrolled))
    );
  }, [data, search, school, center, jobrole, batch, month, status]);

  /* ===================== STATS ===================== */

  const total = filteredData.length;
  const verified = filteredData.filter((c) => c.verified).length;
  const enrolled = filteredData.filter((c) => c.enrolled).length;

  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData?.slice(start, start + itemsPerPage) || [];
  }, [filteredData, currentPage]);
  const totalPages = Math.ceil((filteredData?.length || 0) / itemsPerPage);
  const exportColumns = useMemo(
    () => [
      { key: "name", header: "Candidate" },
      { key: "phone", header: "Phone" },
      { key: "school", header: "School" },
      { key: "center", header: "Center" },
      { key: "jobrole", header: "Job Role" },
      { key: "batch", header: "Batch" },
      { key: "address", header: "Address" },
      { key: "dob", header: "DOB", type: "date" },
      { key: "gender", header: "Gender" },
      { key: "aadhaar", header: "Aadhaar" },
      { key: "qualification", header: "Qualification" },
      { key: "experience", header: "Experience" },
      { key: "enrollmentDate", header: "Enrollment Date", type: "date" },
      {
        key: "verifiedStatus",
        header: "Verification",
        exportValue: (candidate) => (candidate.verified ? "Verified" : "Not Verified"),
      },
      {
        key: "enrollmentStatus",
        header: "Enrollment Status",
        exportValue: (candidate) => (candidate.enrolled ? "Enrolled" : "Not Enrolled"),
      },
      {
        key: "admitCardStatus",
        header: "Admit Card",
        exportValue: (candidate) => candidate.admitCard?.id || "Not Generated",
      },
    ],
    []
  );
  const canExport = true;

  return (
    <>
      <section className="rounded-2xl border border-yellow-400/30 bg-transparent p-6">

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
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60 text-sm">
                🔍
              </span>

              <input
                placeholder="Search candidate..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-3 py-2 text-sm rounded-md
                bg-[#020617] border border-yellow-400/30
                text-white/90 w-64
                focus:border-yellow-400 outline-none"
              />
            </div>

            <Select options={SCHOOLS} value={school} setValue={setSchool} label="School" />
            <Select options={CENTERS} value={center} setValue={setCenter} label="Center" />
            <Select options={JOBROLES} value={jobrole} setValue={setJobrole} label="Job Role" />
            <Select options={BATCHES} value={batch} setValue={setBatch} label="Batch" />

            {/* MONTH */}
            <select
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="px-3 py-2 text-sm rounded-md
              bg-[#020617] border border-yellow-400/30 text-white/90"
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
              bg-[#020617] border border-yellow-400/30 text-white/90"
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
                setBatch("");
                setMonth("");
                setStatus("");
              }}
              className="px-3 py-2 text-sm rounded-md
              border border-yellow-400/30 text-yellow-400
              hover:bg-yellow-400/10 transition"
            >
              Reset
            </button>

            {/* ACTIONS */}
            <div className="ml-auto flex flex-wrap items-center gap-2">
              <TableExportActions
                moduleName="Candidate Enrollment"
                fileName="candidate_enrollment"
                columns={exportColumns}
                rows={filteredData}
                canExport={canExport}
                company={{
                  name: "Pantiss ERP",
                  logo: "/activity.png",
                }}
              />
              <button
                onClick={() => setShowEnrollmentForm(true)}
                className="px-4 py-2 text-sm rounded-md
                bg-yellow-400 text-black font-semibold
                hover:bg-yellow-300 transition shadow-lg shadow-yellow-400/10 cursor-pointer"
              >
                + Enroll Candidate
              </button>
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

            {batch && (
              <Chip label={`Batch: ${batch}`} onRemove={() => setBatch("")} />
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

                <table className="min-w-[1900px] w-full text-sm">

              <thead className="bg-[#020617]/90 backdrop-blur sticky top-0 border-b border-yellow-400/20">
                <tr className="text-white/80 text-xs uppercase tracking-wider">
	                  <th className="px-4 py-3 text-left min-w-[220px]">Candidate</th>
	                  <th className="px-4 py-3 text-left min-w-[140px]">Phone</th>
	                  <th className="px-4 py-3 text-left min-w-[160px]">School</th>
                  <th className="px-4 py-3 text-left min-w-[160px]">Center</th>
                  <th className="px-4 py-3 text-left min-w-[140px]">Job Role</th>
                  <th className="px-4 py-3 text-left min-w-[130px]">Batch</th>
                  <th className="px-4 py-3 text-left min-w-[200px]">Address</th>
                  <th className="px-4 py-3 text-left min-w-[120px]">DOB</th>
                  <th className="px-4 py-3 text-left min-w-[100px]">Gender</th>
                  <th className="px-4 py-3 text-left min-w-[160px]">Aadhaar</th>
                  <th className="px-4 py-3 text-left min-w-[160px]">Qualification</th>
                  <th className="px-4 py-3 text-left min-w-[120px]">Experience</th>
	                  <th className="px-4 py-3 text-left min-w-[140px]">Docs</th>
	                  <th className="px-4 py-3 text-left min-w-[170px]">Admit Card</th>
	                  <th className="px-4 py-3 text-left min-w-[150px]">Status</th>
                </tr>
              </thead>

              <tbody>
            {paginatedData.map((c) => (
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
                          <div className="text-xs text-white/60">{c.center}</div>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">{c.phone || "—"}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{c.school}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{c.center}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{c.jobrole}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{c.batch}</td>
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
                      {c.admitCard ? (
                        <div className="flex flex-col gap-1.5">
                          <button
                            onClick={() => setAdmitCardCandidate(c)}
                            className="px-3 py-1.5 text-xs rounded-md border border-emerald-400/30 bg-emerald-400/10 text-emerald-300 hover:bg-emerald-400/15"
                          >
                            View {c.admitCard.id}
                          </button>
                          <button
                            onClick={() => downloadAdmitCardPdf(c)}
                            className="px-3 py-1.5 text-xs rounded-md border border-sky-400/30 bg-sky-400/10 text-sky-300 hover:bg-sky-400/15"
                          >
                            Download PDF
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleGenerateAdmitCard(c.id)}
                          className="px-3 py-1.5 text-xs rounded-md border border-yellow-400/30 text-yellow-300 hover:bg-yellow-400/10"
                        >
                          Generate
                        </button>
                      )}
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
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />

          </div>
        </div>

      </section>

      {previewFile && (
        <FileModal file={previewFile} onClose={() => setPreviewFile(null)} />
      )}
      {admitCardCandidate && (
        <AdmitCardModal candidate={admitCardCandidate} onClose={() => setAdmitCardCandidate(null)} />
      )}
      {/* ================= ENROLLMENT FORM MODAL ================= */}
      {showEnrollmentForm && (
        <CandidateEnrollmentStepper
          onClose={() => setShowEnrollmentForm(false)}
          onComplete={handleEnrollmentComplete}
        />
      )}

    </>
  );
}

/* ===================== COMPONENTS ===================== */

function StatCard({ title, value }) {
  return (
    <div className="bg-[#020617] border border-yellow-400/20 rounded-xl p-4">
      <p className="text-xs text-white/60">{title}</p>
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
      bg-[#020617] border border-yellow-400/30 text-white/90"
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
    gray: "bg-gray-500/10 text-white/60 border-gray-400/30",
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

function AdmitCardModal({ candidate, onClose }) {
  const admitCard = ensureAdmitCard(candidate);

  return (
    <SlidePanel open={true} onClose={onClose} title="Student Admit Card" width="lg">
      <div className="overflow-hidden rounded-2xl border border-slate-700 bg-slate-50 text-slate-950 shadow-2xl">
        <div className="bg-slate-950 px-6 py-5 text-white">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-yellow-300">Training Center Admit Card</p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight">{candidate.name}</h2>
              <p className="mt-1 text-sm text-slate-300">Candidate Enrollment & Reporting Pass</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-400">Admit Card No.</p>
              <p className="mt-1 font-mono text-sm font-semibold text-yellow-200">{admitCard.id}</p>
              <p className="mt-2 text-xs text-slate-400">Issued: {admitCard.issuedOn}</p>
            </div>
          </div>
        </div>

        <div className="p-6">
        <div className="flex items-start justify-between border-b border-slate-200 pb-5">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Candidate Details</p>
            <p className="mt-2 text-sm text-slate-600">Phone: {candidate.phone || "—"}</p>
            <p className="mt-1 text-sm text-slate-600">Aadhaar: {candidate.aadhaar || "—"}</p>
          </div>
          <img src={candidate.image} className="h-24 w-24 rounded-xl border border-slate-200 object-cover shadow-sm" />
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <AdmitInfo label="Phone" value={candidate.phone} />
          <AdmitInfo label="Date of Birth" value={candidate.dob} />
          <AdmitInfo label="School" value={candidate.school} />
          <AdmitInfo label="Training Center" value={candidate.center} />
          <AdmitInfo label="Job Role" value={candidate.jobrole} />
          <AdmitInfo label="Reporting Time" value={admitCard.reportingTime} />
          <AdmitInfo label="Venue" value={admitCard.venue} />
          <AdmitInfo label="Issued On" value={admitCard.issuedOn} />
        </div>

        <div className="mt-6 rounded-xl border border-yellow-300 bg-yellow-50 p-4 text-sm text-yellow-900">
          Candidate must carry Aadhaar and original qualification documents during reporting.
        </div>

        <div className="mt-8 grid grid-cols-2 gap-10 text-xs text-slate-500">
          <div className="border-t border-slate-300 pt-2">Candidate Signature</div>
          <div className="border-t border-slate-300 pt-2 text-right">Mobilizer / Center Seal</div>
        </div>

        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <button
            onClick={() => downloadAdmitCardPdf(candidate)}
            className="rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Download PDF
          </button>
          <button
            onClick={() => downloadAdmitCardPdf(candidate)}
            className="rounded-md bg-yellow-400 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-yellow-300"
          >
            Print Admit Card
          </button>
        </div>
        </div>
      </div>
    </SlidePanel>
  );
}

function AdmitInfo({ label, value }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-950">{value || "—"}</p>
    </div>
  );
}

function FileModal({ file, onClose }) {
  const isPDF = file?.includes(".pdf");

  return (
    <SlidePanel open={true} onClose={onClose} title="Document Preview" width="lg">
        <div className="flex justify-end mb-3">
          <button
            onClick={() => window.open(file)}
            className="px-3 py-1 text-sm border border-yellow-400 text-yellow-400 rounded"
          >
            Download
          </button>
        </div>

        {isPDF ? (
          <iframe src={file} className="w-full h-[500px]" />
        ) : (
          <img src={file} className="w-full rounded-lg" />
        )}
    </SlidePanel>
  );
}
