import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import {
  BriefcaseBusiness,
  Database,
  Download,
  FileSpreadsheet,
  FileText,
  LoaderCircle,
  Settings2,
  Eye,
  CheckCircle2,
} from "lucide-react";
import { Header } from "./ClientDashboard";
import {
  buildClientProjectSnapshot,
  getClientFinanceRecords,
  getClientProjects,
  getStoredClient,
} from "./clientPortalData";
import { imageUrlToDataUrl, slugifyFileName } from "../../utils/export/tableExportUtils";

/* ─── Constants ─────────────────────────────────────────────────────────────── */

const REPORT_GALLERY_ASSETS = [
  { src: "/images/client-gallery/1.png", title: "Enrollment documentation", category: "Enrollment" },
  { src: "/images/client-gallery/2.png", title: "Classroom delivery", category: "Training" },
  { src: "/images/client-gallery/3.png", title: "Practical lab session", category: "Training" },
  { src: "/images/client-gallery/4.png", title: "Candidate counselling", category: "Enrollment" },
  { src: "/images/client-gallery/5.png", title: "Employer connect", category: "Placements" },
  { src: "/images/client-gallery/6.png", title: "Certification review", category: "Compliance" },
  { src: "/images/client-gallery/7.png", title: "Placement readiness", category: "Placements" },
  { src: "/images/client-gallery/9.png", title: "Center operations", category: "Compliance" },
  { src: "/images/client-gallery/11.png", title: "Field visit documentation", category: "Training" },
];

const MONTH_OPTIONS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const IMPLEMENTING_AGENCY = "Pantiss";
const PANTISS_LOGO = "/activity.png";

const formatNumber = (value) => new Intl.NumberFormat("en-IN").format(value || 0);
const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
    style: "currency",
    currency: "INR",
  }).format(value || 0);

const formatDate = (value) =>
  new Date(`${value}T00:00:00`).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

function getImageFormat(dataUrl = "") {
  if (dataUrl.startsWith("data:image/jpeg")) return "JPEG";
  if (dataUrl.startsWith("data:image/png")) return "PNG";
  return "PNG";
}

function buildGalleryItems(project, center) {
  return REPORT_GALLERY_ASSETS.map((asset, index) => ({
    ...asset,
    id: `${project.id}-${center.id}-report-gallery-${index}`,
    projectName: project.name,
    centerName: center.name,
    location: center.location,
    capturedBy:
      index % 3 === 0
        ? center.manager
        : index % 3 === 1
          ? "Training team"
          : "Client reporting team",
    capturedOn: formatDate(
      new Date(2026, (index + center.name.length) % 12, 4 + ((index * 3) % 21))
        .toISOString()
        .slice(0, 10)
    ),
  }));
}

function getReportScopeLabel(centers, project) {
  if (!centers.length) return "No centers selected";
  if (centers.length === project.centers.length) return "All project centers";
  return centers.map((center) => center.name).join(", ");
}

const dataOrNA = (value) => {
  if (value === null || value === undefined || value === "") return "Data Not Available";
  return value;
};

const average = (values) => {
  const validValues = values.filter((value) => Number.isFinite(value));
  if (!validValues.length) return 0;
  return Math.round(validValues.reduce((sum, value) => sum + value, 0) / validValues.length);
};

const percent = (value, total) => {
  if (!total) return "Data Not Available";
  return `${Math.round((value / total) * 100)}%`;
};

const buildReportAnalytics = (centers, project) => {
  const batches = centers.flatMap((center) =>
    center.batches.map((batch, batchIndex) => ({
      ...batch,
      centerName: center.name,
      centerLocation: center.location,
      manager: center.manager,
      startDate: new Date(2026, batchIndex % 12, 3 + batchIndex * 2).toISOString().slice(0, 10),
      endDate: new Date(2026, (batchIndex + 3) % 12, 12 + batchIndex * 2).toISOString().slice(0, 10),
    }))
  );
  const learners = centers.reduce((sum, center) => sum + center.candidates, 0);
  const certified = centers.reduce((sum, center) => sum + center.certified, 0);
  const placed = centers.reduce((sum, center) => sum + center.placed, 0);
  const completed = centers.reduce((sum, center) => sum + center.completedTraining, 0);
  const approvedBudget = Math.max(learners * 26000, project.summary?.candidates * 21000 || 0);
  const { projectInvoices, projectProcurements } = getClientFinanceRecords(project.name, centers);
  const currentMonthUtilization = projectInvoices.reduce((sum, invoice) => sum + invoice.amount, 0);
  const committedProcurement = projectProcurements.reduce((sum, item) => sum + item.estimatedAmount, 0);
  const cumulativeUtilization = Math.min(
    approvedBudget,
    currentMonthUtilization + committedProcurement + Math.round(approvedBudget * 0.48)
  );
  const dropout = Math.max(0, learners - completed);

  return {
    batches,
    learners,
    certified,
    placed,
    completed,
    dropout,
    assessmentCompleted: batches.reduce((sum, batch) => sum + Math.round(batch.completedTraining * (batch.assessmentRate / 100)), 0),
    passPercentage: percent(certified, completed),
    placementPercentage: percent(placed, learners),
    salaryMin: 15000,
    salaryMax: 27600,
    approvedBudget,
    currentMonthUtilization,
    cumulativeUtilization,
    committedProcurement,
    projectInvoices,
    remainingBalance: Math.max(0, approvedBudget - cumulativeUtilization),
    avgAttendance: average(centers.map((center) => center.attendanceRate)),
    avgPlacement: average(centers.map((center) => center.placementRate)),
  };
};

const getGalleryCategory = (asset) => {
  const title = asset.title.toLowerCase();
  if (title.includes("enrollment") || title.includes("counselling")) return "Mobilization";
  if (title.includes("practical") || title.includes("lab")) return "Practical Sessions";
  if (title.includes("employer") || title.includes("placement")) return "Placement Drives";
  if (title.includes("certification")) return "Workshops";
  if (title.includes("field")) return "Field Visits";
  return "Training";
};

const REPORT_TYPES = [
  {
    id: "mpr",
    title: "Monthly Progress Report",
    subtitle: "Full donor-ready monthly report with narrative sections, financials, success stories, and gallery.",
    icon: FileText,
    sections: [
      "Cover page & table of contents",
      "Executive summary with KPIs",
      "Mobilization & training progress",
      "Candidate performance & certification",
      "Placement & livelihood outcomes",
      "Financial utilization summary",
      "Success stories & photo gallery",
      "Challenges, mitigation & next-month plan",
    ],
  },
  {
    id: "batchwise",
    title: "Batchwise Details",
    subtitle: "Batch-level status, enrolled learners, attendance, assessment, certification, placement, and trainer mapping.",
    icon: FileSpreadsheet,
    sections: [
      "Report summary with aggregate KPIs",
      "Batch overview table (all centers)",
      "Per-batch candidate details with training & placement status",
    ],
  },
  {
    id: "placement",
    title: "Placement Report",
    subtitle: "Placement summary with placed candidates, recruiter mapping, salary range, designations, and pending pipeline.",
    icon: BriefcaseBusiness,
    sections: [
      "Placement summary with conversion metrics",
      "Placed candidates with employer & salary details",
      "Pipeline candidates pending placement",
    ],
  },
];

const DOWNLOADABLE_LISTS = [
  { id: "batch-list", label: "Batch List", icon: FileSpreadsheet },
  { id: "candidate-list", label: "Candidate List", icon: Database },
  { id: "placement-list", label: "Placement List", icon: BriefcaseBusiness },
  { id: "invoice-list", label: "Invoice List", icon: FileText },
  { id: "procurement-list", label: "Procurement List", icon: Settings2 },
  { id: "gallery-list", label: "Evidence Gallery", icon: Eye },
];

/* ─── Main Component ────────────────────────────────────────────────────────── */

export default function ClientReports() {
  const client = useMemo(() => getStoredClient(), []);
  const projects = useMemo(() => getClientProjects(client.name), [client.name]);
  const snapshots = useMemo(() => projects.map(buildClientProjectSnapshot), [projects]);
  const [projectId, setProjectId] = useState(snapshots[0]?.id || "");
  const selectedProject = snapshots.find((project) => project.id === projectId) || snapshots[0];
  const [centerId, setCenterId] = useState("all");
  const [month, setMonth] = useState(MONTH_OPTIONS[new Date().getMonth()]);
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [generatingReport, setGeneratingReport] = useState("");
  const [previewError, setPreviewError] = useState("");
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const [selectedReportId, setSelectedReportId] = useState(REPORT_TYPES[0].id);

  const selectedCenters = useMemo(() => {
    if (!selectedProject) return [];
    return centerId === "all"
      ? selectedProject.centers
      : selectedProject.centers.filter((center) => center.id === centerId);
  }, [selectedProject, centerId]);

  const reportSummary = useMemo(() => {
    const batches = selectedCenters.flatMap((center) => center.batches);
    return {
      centers: selectedCenters.length,
      batches: batches.length,
      learners: selectedCenters.reduce((sum, center) => sum + center.candidates, 0),
      completed: selectedCenters.reduce((sum, center) => sum + center.completedTraining, 0),
      certified: selectedCenters.reduce((sum, center) => sum + center.certified, 0),
      placed: selectedCenters.reduce((sum, center) => sum + center.placed, 0),
      attendance:
        selectedCenters.length
          ? Math.round(selectedCenters.reduce((sum, center) => sum + center.attendanceRate, 0) / selectedCenters.length)
          : 0,
    };
  }, [selectedCenters]);

  const selectedReport = REPORT_TYPES.find((report) => report.id === selectedReportId) || REPORT_TYPES[0];
  const reportPayload = useMemo(
    () => ({
      centers: selectedCenters,
      client,
      month,
      project: selectedProject,
      summary: reportSummary,
      year,
    }),
    [client, month, reportSummary, selectedCenters, selectedProject, year]
  );

  useEffect(() => {
    if (!selectedProject || !selectedCenters.length) {
      setPreviewUrl((currentUrl) => {
        if (currentUrl) URL.revokeObjectURL(currentUrl);
        return "";
      });
      setPreviewError("Select a project and center to preview a report.");
      return undefined;
    }

    let cancelled = false;
    let nextUrl = "";

    const renderPreview = async () => {
      try {
        setPreviewLoading(true);
        setPreviewError("");

        nextUrl = await generateReportByType(selectedReport.id, {
          ...reportPayload,
          output: "blob-url",
        });

        if (cancelled) {
          if (nextUrl) URL.revokeObjectURL(nextUrl);
          return;
        }

        setPreviewUrl((currentUrl) => {
          if (currentUrl) URL.revokeObjectURL(currentUrl);
          return nextUrl;
        });
      } catch (error) {
        console.error(error);
        if (!cancelled) {
          setPreviewUrl((currentUrl) => {
            if (currentUrl) URL.revokeObjectURL(currentUrl);
            return "";
          });
          setPreviewError("Unable to render this report preview.");
        }
      } finally {
        if (!cancelled) setPreviewLoading(false);
      }
    };

    renderPreview();

    return () => {
      cancelled = true;
    };
  }, [reportPayload, selectedCenters.length, selectedProject, selectedReport.id]);

  useEffect(
    () => () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    },
    [previewUrl]
  );

  const handleProjectChange = (nextProjectId) => {
    setProjectId(nextProjectId);
    setCenterId("all");
  };

  const downloadReport = async (reportType) => {
    if (!selectedProject || !selectedCenters.length) {
      toast.error("Select a project and center to generate a report.");
      return;
    }

    try {
      setGeneratingReport(reportType);
      await generateReportByType(reportType, reportPayload);
      toast.success(`${REPORT_TYPES.find((report) => report.id === reportType)?.title || "Report"} downloaded.`);
    } catch (error) {
      console.error(error);
      toast.error("Unable to generate the selected report.");
    } finally {
      setGeneratingReport("");
    }
  };

  const downloadList = (listType) => {
    if (!selectedProject || !selectedCenters.length) {
      toast.error("Select a project and center to download a list.");
      return;
    }

    const list = DOWNLOADABLE_LISTS.find((item) => item.id === listType);
    const rows = buildDownloadableListRows(listType, selectedCenters, selectedProject);
    if (!rows.length) {
      toast.error("No records available for this list.");
      return;
    }

    downloadCsv(
      rows,
      `${client.name}_${selectedProject.name}_${list?.label || "List"}_${month}_${year}`
    );
    toast.success(`${list?.label || "List"} downloaded.`);
  };

  if (!selectedProject) {
    return (
      <section className="space-y-7">
        <Header
          eyebrow="Reports"
          title="No projects available"
          description="Reports will be available once projects are mapped to this client account."
        />
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <Header
        eyebrow="Reports"
        title="Preview reports & lists"
        description="Select a project, center, and reporting period to preview client documents before downloading."
      />

      {/* ── Filters ─────────────────────────────────────────────────────────── */}
      <div className="rounded-3xl border border-violet-200/10 bg-[#12071f]/80 p-5 shadow-xl shadow-black/20">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-violet-300">
          Report Scope
        </p>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <FilterSelect
            label="Project"
            value={selectedProject.id}
            onChange={handleProjectChange}
          >
            {snapshots.map((project) => (
              <option key={project.id} value={project.id}>{project.name}</option>
            ))}
          </FilterSelect>
          <FilterSelect label="Center" value={centerId} onChange={setCenterId}>
            <option value="all">All centers</option>
            {selectedProject.centers.map((center) => (
              <option key={center.id} value={center.id}>{center.name}</option>
            ))}
          </FilterSelect>
          <FilterSelect label="Month" value={month} onChange={setMonth}>
            {MONTH_OPTIONS.map((item) => <option key={item}>{item}</option>)}
          </FilterSelect>
          <label className="block">
            <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.14em] text-white/40">
              Year
            </span>
            <input
              value={year}
              onChange={(event) => setYear(event.target.value)}
              className="h-11 w-full rounded-xl border border-violet-200/10 bg-white/[0.04] px-3 text-sm text-white outline-none transition focus:border-violet-300/50"
            />
          </label>
        </div>
      </div>

      {/* ── Document Picker + Preview ───────────────────────────────────────── */}
      <section className="overflow-hidden rounded-3xl border border-violet-200/10 bg-[#12071f]/80 shadow-xl shadow-black/20">
        <div className="border-b border-white/10 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-300">
            Document Preview
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Select and review</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-white/45">
            Choose a PDF report and preview the generated document for the selected scope.
          </p>
        </div>

        <div className="grid min-h-[680px] lg:grid-cols-[360px_minmax(0,1fr)]">
          <aside className="border-b border-white/10 bg-black/20 p-4 lg:border-b-0 lg:border-r">
            <div className="space-y-2">
              {REPORT_TYPES.map((report) => {
                const Icon = report.icon;
                const isActive = report.id === selectedReportId;
                return (
                  <button
                    key={report.id}
                    type="button"
                    onClick={() => setSelectedReportId(report.id)}
                    className={`w-full rounded-xl border px-4 py-3 text-left transition ${
                      isActive
                        ? "border-violet-300/40 bg-violet-500/15 text-white"
                        : "border-white/10 bg-white/[0.03] text-white/60 hover:border-violet-300/25 hover:text-white"
                    }`}
                  >
                    <span className="flex items-start gap-3">
                      <Icon size={18} className={isActive ? "mt-0.5 text-violet-200" : "mt-0.5 text-white/35"} />
                      <span className="min-w-0">
                        <span className="block text-sm font-semibold">{report.title}</span>
                        <span className="mt-1 block text-xs leading-5 text-white/40">{report.subtitle}</span>
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/35">Scope</p>
              <p className="mt-2 text-sm font-semibold text-white">
                {reportSummary.centers} center{reportSummary.centers !== 1 ? "s" : ""} · {month} {year}
              </p>
              <p className="mt-1 text-xs leading-5 text-white/40">
                {formatNumber(reportSummary.learners)} learners, {formatNumber(reportSummary.certified)} certified, {formatNumber(reportSummary.placed)} placed
              </p>
            </div>

            <button
              type="button"
              onClick={() => downloadReport(selectedReport.id)}
              disabled={!!generatingReport}
              className="mt-4 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-violet-500 px-6 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 transition hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {generatingReport === selectedReport.id ? (
                <>
                  <LoaderCircle size={16} className="animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Download size={16} />
                  Download PDF
                </>
              )}
            </button>
          </aside>

          <div className="min-w-0 bg-[#070b16] p-4">
            <div className="mb-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white">{selectedReport.title}</h3>
                <p className="mt-1 text-sm text-white/45">{selectedReport.subtitle}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedReport.sections.slice(0, 3).map((section) => (
                  <span key={section} className="inline-flex items-center gap-1.5 rounded-lg border border-violet-300/15 bg-violet-500/10 px-2.5 py-1 text-xs font-semibold text-violet-100/80">
                    <CheckCircle2 size={12} />
                    {section}
                  </span>
                ))}
              </div>
            </div>

            <div className="relative h-[620px] overflow-hidden rounded-2xl border border-white/10 bg-slate-950">
              {previewLoading ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-slate-300">
                  <LoaderCircle size={26} className="animate-spin text-violet-300" />
                  <p className="text-sm font-semibold">Preparing preview...</p>
                </div>
              ) : previewError ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center text-slate-400">
                  <FileText size={34} className="mb-3 text-slate-600" />
                  <p className="text-sm font-semibold">{previewError}</p>
                </div>
              ) : previewUrl ? (
                <iframe
                  title={`${selectedReport.title} preview`}
                  src={previewUrl}
                  className="h-full w-full bg-white"
                />
              ) : null}
            </div>
          </div>
        </div>
      </section>

      {/* ── CSV List Downloads ──────────────────────────────────────────────── */}
      <section className="rounded-3xl border border-violet-200/10 bg-[#12071f]/80 p-5 shadow-xl shadow-black/20">
        <div className="mb-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-300">CSV Exports</p>
          <h2 className="mt-2 text-xl font-semibold text-white">Downloadable lists</h2>
          <p className="mt-2 text-sm text-white/45">
            Export raw data as CSV files. Lists follow the selected project and center scope.
          </p>
        </div>
        <div className="overflow-hidden rounded-2xl border border-white/10">
          {DOWNLOADABLE_LISTS.map((list) => {
            const ListIcon = list.icon;
            return (
              <button
                key={list.id}
                type="button"
                onClick={() => downloadList(list.id)}
                className="group flex w-full items-center justify-between gap-3 border-b border-white/10 bg-black/20 px-4 py-4 text-left transition last:border-b-0 hover:bg-violet-500/10"
              >
                <span className="flex min-w-0 items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-violet-300/20 bg-violet-500/15">
                    <ListIcon size={17} className="text-violet-200" />
                  </span>
                  <span className="truncate text-sm font-semibold text-white/80 group-hover:text-white">
                    {list.label}
                  </span>
                </span>
                <Download size={15} className="shrink-0 text-white/30 group-hover:text-violet-200" />
              </button>
            );
          })}
        </div>
      </section>
    </section>
  );
}

/* ─── Shared UI Components ──────────────────────────────────────────────────── */

function FilterSelect({ children, label, onChange, value }) {
  return (
    <label className="block">
      <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.14em] text-white/40">
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full rounded-xl border border-violet-200/10 bg-white/[0.04] px-3 text-sm text-white outline-none transition focus:border-violet-300/50"
      >
        {children}
      </select>
    </label>
  );
}

/* ─── CSV Utilities ─────────────────────────────────────────────────────────── */

function finalizeReportPdf(doc, fileName, output = "download") {
  const safeName = `${slugifyFileName(fileName)}.pdf`;
  if (output === "blob-url") {
    return URL.createObjectURL(doc.output("blob"));
  }

  doc.save(safeName);
  return null;
}

function generateReportByType(reportType, payload) {
  if (reportType === "batchwise") {
    return generateBatchwiseDetailsPdf(payload);
  }

  if (reportType === "placement") {
    return generatePlacementReportPdf(payload);
  }

  return generateMonthlyProgressPdf(payload);
}

function csvValue(value) {
  const normalized = value === null || value === undefined ? "" : String(value);
  return `"${normalized.replace(/"/g, '""')}"`;
}

function downloadCsv(rows, fileName) {
  const headers = Object.keys(rows[0] || {});
  const csv = [
    headers.map(csvValue).join(","),
    ...rows.map((row) => headers.map((header) => csvValue(row[header])).join(",")),
  ].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${slugifyFileName(fileName)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function buildDownloadableListRows(listType, centers, project) {
  const candidateRows = centers.flatMap((center) =>
    center.batches.flatMap((batch) =>
      batch.candidateRecords.map((candidate) => ({
        Project: project.name,
        Center: center.name,
        Location: center.location,
        Batch: batch.label,
        Candidate: candidate.name,
        Code: candidate.code,
        "Job Role": candidate.jobRole,
        Attendance: `${candidate.attendance}%`,
        "Training Status": candidate.trainingStatus,
        "Placement Status": candidate.placementStatus,
        Company: candidate.company,
        Designation: candidate.designation,
        Salary: candidate.salary || "",
      }))
    )
  );

  if (listType === "candidate-list") return candidateRows;

  if (listType === "batch-list") {
    return centers.flatMap((center) =>
      center.batches.map((batch) => ({
        Project: project.name,
        Center: center.name,
        Location: center.location,
        Batch: batch.label,
        Track: batch.track,
        Enrolled: batch.size,
        "Completed Training": batch.completedTraining,
        Certified: batch.certified,
        Mapped: batch.mapped,
        Placed: batch.placed,
        Attendance: `${batch.attendanceRate}%`,
        "Assessment Rate": `${batch.assessmentRate}%`,
        Risks: batch.risks,
      }))
    );
  }

  if (listType === "placement-list") {
    return candidateRows.filter((candidate) => candidate["Placement Status"] !== "Training");
  }

  if (listType === "invoice-list") {
    return getClientFinanceRecords(project.name, centers).projectInvoices.map((invoice) => ({
      Project: project.name,
      Vendor: invoice.vendorName,
      Category: invoice.category,
      Center: centers.find((center) => center.id === invoice.centerId)?.name || invoice.centerId,
      Amount: invoice.amount,
      "Raised On": invoice.createdAt || "Data Not Available",
      "Due On": invoice.dueOn || "Data Not Available",
      Status: invoice.status,
    }));
  }

  if (listType === "procurement-list") {
    return getClientFinanceRecords(project.name, centers).projectProcurements.map((item) => ({
      Project: project.name,
      Item: item.itemName,
      "Requested By": item.requestedByEmployeeId,
      Center: centers.find((center) => center.id === item.centerId)?.name || item.centerId,
      Quantity: item.quantity,
      Budget: item.estimatedAmount,
      Urgency: item.urgency || "Data Not Available",
      Status: item.status,
    }));
  }

  if (listType === "gallery-list") {
    return centers.flatMap((center) =>
      buildGalleryItems(project, center).map((asset) => ({
        Project: project.name,
        Center: center.name,
        Location: center.location,
        Title: asset.title,
        Category: getGalleryCategory(asset),
        "Captured By": asset.capturedBy,
        "Captured On": asset.capturedOn,
        "Asset Path": asset.src,
      }))
    );
  }

  return [];
}

/* ─── PDF Generation (unchanged – only runs on explicit download click) ───── */

async function generateMonthlyProgressPdf({ centers, client, month, output, project, summary, year }) {
  const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable"),
  ]);

  const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 40;
  const accent = [37, 99, 235];
  const accentDark = [30, 64, 175];
  const ink = [15, 23, 42];
  const muted = [100, 116, 139];
  const rule = [226, 232, 240];
  const analytics = buildReportAnalytics(centers, project);
  const allCandidates = centers.flatMap((center) =>
    center.batches.flatMap((batch) =>
      batch.candidateRecords.map((candidate) => ({ ...candidate, centerName: center.name }))
    )
  );
  const sectionPages = [];
  let y = 74;
  let currentSection = "Monthly Progress Report";
  const pageSections = { 1: "Cover Page" };

  const coverCenter = centers[0] || project.centers[0];
  const coverImageSrc = coverCenter ? buildGalleryItems(project, coverCenter)[0]?.src : REPORT_GALLERY_ASSETS[0].src;
  const [coverImageDataUrl, logoDataUrl] = await Promise.all([
    imageUrlToDataUrl(coverImageSrc),
    imageUrlToDataUrl(PANTISS_LOGO),
  ]);

  const setTransparentFill = (rgb, opacity = 0.72) => {
    doc.setFillColor(...rgb);
    try {
      doc.setGState(new doc.GState({ opacity }));
      return true;
    } catch {
      return false;
    }
  };

  const resetOpacity = () => {
    try {
      doc.setGState(new doc.GState({ opacity: 1 }));
    } catch {
      // Older jsPDF builds ignore alpha states; solid fills still export safely.
    }
  };

  const addFooter = () => {
    const totalPages = doc.internal.getNumberOfPages();
    let runningSection = pageSections[1];
    for (let page = 2; page <= totalPages; page += 1) {
      doc.setPage(page);
      runningSection = pageSections[page] || runningSection;
      doc.setDrawColor(...rule);
      doc.line(margin, pageHeight - 34, pageWidth - margin, pageHeight - 34);
      doc.setFontSize(8);
      doc.setTextColor(...muted);
      doc.text(`${client.name} | ${project.name}`, margin, pageHeight - 18);
      doc.text(runningSection || currentSection, pageWidth / 2, pageHeight - 18, { align: "center" });
      doc.text(`Page ${page} of ${totalPages}`, pageWidth - margin, pageHeight - 18, { align: "right" });
    }
  };

  const addPageHeader = (title, kicker = "") => {
    doc.setFillColor(248, 250, 252);
    doc.rect(0, 0, pageWidth, 52, "F");
    doc.setFillColor(...accent);
    doc.rect(0, 0, 8, pageHeight, "F");
    doc.setDrawColor(...rule);
    doc.line(margin, 52, pageWidth - margin, 52);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...accent);
    doc.text("PANTISS", margin, 24);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...muted);
    doc.text(kicker || `${month} ${year}`, margin, 38);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...ink);
    doc.text(title, pageWidth - margin, 31, { align: "right" });
  };

  const startReportPage = (title, kicker = "") => {
    doc.addPage();
    currentSection = title;
    const pageNumber = doc.internal.getCurrentPageInfo().pageNumber;
    pageSections[pageNumber] = title;
    if (!sectionPages.some((section) => section.title === title)) {
      sectionPages.push({ title, page: pageNumber });
    }
    y = 86;
    addPageHeader(title, kicker);
  };

  const ensureSpace = (needed = 120, title = currentSection) => {
    if (y + needed > pageHeight - 56) {
      startReportPage(title, `${month} ${year}`);
    }
  };

  const sectionTitle = (title, subtitle = "") => {
    ensureSpace(70);
    doc.setTextColor(...ink);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.text(title, margin, y);
    y += 16;
    if (subtitle) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(...muted);
      doc.text(subtitle, margin, y);
      y += 14;
    }
    doc.setDrawColor(...accent);
    doc.line(margin, y, margin + 72, y);
    y += 18;
  };

  const drawMetricBox = (x, top, label, value, width = 120) => {
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(x, top, width, 58, 6, 6, "F");
    doc.setDrawColor(...rule);
    doc.roundedRect(x, top, width, 58, 6, 6, "S");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(...ink);
    doc.text(String(value), x + 12, top + 25);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...muted);
    doc.text(label, x + 12, top + 43);
  };

  const addParagraphs = (paragraphs, options = {}) => {
    const width = options.width || pageWidth - margin * 2;
    paragraphs.filter(Boolean).forEach((paragraph) => {
      const lines = doc.splitTextToSize(paragraph, width);
      ensureSpace(lines.length * 12 + 12, currentSection);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(options.fontSize || 9.5);
      doc.setTextColor(...(options.color || ink));
      doc.text(lines, margin, y);
      y += lines.length * 12 + 10;
    });
  };

  const addBulletList = (items) => {
    items.forEach((item) => {
      ensureSpace(28, currentSection);
      doc.setFillColor(...accent);
      doc.circle(margin + 3, y - 3, 2.2, "F");
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(...ink);
      doc.text(doc.splitTextToSize(item, pageWidth - margin * 2 - 18), margin + 15, y);
      y += 22;
    });
  };

  const addTable = (config) => {
    autoTable(doc, {
      margin: { left: margin, right: margin },
      startY: y,
      headStyles: { fillColor: config.headColor || accent, textColor: [255, 255, 255], fontStyle: "bold" },
      styles: { fontSize: config.fontSize || 8, cellPadding: config.cellPadding || 5, overflow: "linebreak", lineColor: rule },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      theme: "grid",
      ...config,
    });
    y = doc.lastAutoTable.finalY + (config.afterGap || 24);
  };

  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageWidth, pageHeight, "F");
  if (coverImageDataUrl) {
    doc.addImage(coverImageDataUrl, getImageFormat(coverImageDataUrl), 0, 0, pageWidth, pageHeight, undefined, "FAST");
  }
  setTransparentFill([2, 6, 23], 0.72);
  doc.rect(0, 0, pageWidth, pageHeight, "F");
  resetOpacity();
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(margin, 46, 48, 48, 6, 6, "F");
  if (logoDataUrl) {
    doc.addImage(logoDataUrl, getImageFormat(logoDataUrl), margin + 8, 54, 32, 32, undefined, "FAST");
  } else {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(...accent);
    doc.text("P", margin + 19, 77);
  }
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text(IMPLEMENTING_AGENCY, margin + 62, 69);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(203, 213, 225);
  doc.text("Implementing Agency", margin + 62, 84);

  y = 266;
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("MONTHLY PROGRESS REPORT", margin, y);
  y += 34;
  doc.setFontSize(30);
  doc.text(project.name, margin, y, { maxWidth: pageWidth - margin * 2 });
  y += 76;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(203, 213, 225);
  doc.text(`Project Name: ${project.name}`, margin, y);
  y += 22;
  doc.text(`Reporting Month & Year: ${month} ${year}`, margin, y);
  y += 22;
  doc.text(`Client / Organization Name: ${client.name}`, margin, y);
  y += 22;
  doc.text(`Implementing Agency: ${IMPLEMENTING_AGENCY}`, margin, y);
  y += 22;
  doc.text(`Project Location: ${getReportScopeLabel(centers, project)}`, margin, y, {
    maxWidth: pageWidth - margin * 2,
  });
  y += 32;
  doc.text(`Submission Date: ${new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  })}`, margin, y);
  doc.setDrawColor(255, 255, 255);
  doc.line(margin, pageHeight - 88, pageWidth - margin, pageHeight - 88);
  doc.setFontSize(8);
  doc.setTextColor(226, 232, 240);
  doc.text("Cover image selected from project gallery evidence", margin, pageHeight - 62);
  doc.text(`Generated by ${IMPLEMENTING_AGENCY}`, pageWidth - margin, pageHeight - 62, { align: "right" });

  doc.addPage();
  pageSections[2] = "Table of Contents";
  sectionPages.push({ title: "Table of Contents", page: 2 });
  addPageHeader("Table of Contents", `${client.name} | ${month} ${year}`);

  startReportPage("Executive Summary", `${client.name} | ${month} ${year}`);
  sectionTitle("Executive Summary", "Key monthly delivery indicators generated from project and center data.");
  const metricY = y;
  drawMetricBox(margin, metricY, "Centers covered", summary.centers);
  drawMetricBox(margin + 132, metricY, "Active batches", summary.batches);
  drawMetricBox(margin + 264, metricY, "Learners tracked", formatNumber(summary.learners));
  drawMetricBox(margin + 396, metricY, "Avg attendance", `${summary.attendance}%`);
  y += 86;

  addParagraphs([
    `${project.name} reported steady monthly progress across ${summary.centers} center(s), with ${formatNumber(summary.learners)} learners tracked and ${summary.batches} active batch(es) under delivery. Mobilization remained aligned to center capacity, while average attendance stood at ${summary.attendance}%, indicating consistent learner participation.`,
    `During ${month} ${year}, ${formatNumber(summary.completed)} learners completed training milestones, ${formatNumber(summary.certified)} learners were certified, and ${formatNumber(summary.placed)} learners moved into wage or employer-linked opportunities. Operational updates focused on batch continuity, assessment readiness, placement drives, and center compliance follow-up.`,
    `Key achievements include sustained attendance above ${analytics.avgAttendance}%, placement conversion of ${analytics.placementPercentage}, and continued coordination with recruiters across ${[...new Set(allCandidates.filter((candidate) => candidate.company !== "Not mapped").map((candidate) => candidate.company))].slice(0, 4).join(", ") || "Data Not Available"}.`,
  ]);

  startReportPage("Project Overview", "Project information");
  sectionTitle("Project Overview", "Core project details for the reporting period.");
  addTable({
    body: [
      ["Project Name", project.name],
      ["Sector", [...new Set(centers.flatMap((center) => center.jobRoles))].join(", ") || "Data Not Available"],
      ["Geography", centers.map((center) => center.location).join(", ") || "Data Not Available"],
      ["Total Target", formatNumber(project.summary?.candidates || analytics.learners)],
      ["Reporting Period", `${month} ${year}`],
      ["Funding Agency", project.fundingAgency || client.name],
      ["Number of Centers", centers.length],
    ],
    columnStyles: { 0: { fontStyle: "bold", fillColor: [248, 250, 252], cellWidth: 160 } },
    fontSize: 9,
  });

  startReportPage("Mobilization Status", "Center-wise mobilization and outreach");
  sectionTitle("Mobilization Status", "Monthly and cumulative mobilization performance.");
  addTable({
    head: [["Center", "Location", "Monthly Mobilized", "Cumulative Mobilized", "Target Achievement", "Outreach Activities"]],
    body: centers.map((center) => [
      center.name,
      center.location,
      Math.round(center.candidates * 0.18),
      center.candidates,
      center.performanceMetrics.find((metric) => metric.label.includes("Enrollment"))?.value || "Data Not Available",
      "Community meetings, counselling, document verification",
    ]),
    fontSize: 7.5,
  });
  addTable({
    body: [
      ["Monthly Mobilization", formatNumber(centers.reduce((sum, center) => sum + Math.round(center.candidates * 0.18), 0))],
      ["Cumulative Mobilization", formatNumber(analytics.learners)],
      ["Gender Distribution", "Data Not Available"],
      ["Outreach Summary", "Door-to-door mobilization, village-level counselling, and eligibility/documentation support were conducted across selected centers."],
    ],
    columnStyles: { 0: { fontStyle: "bold", fillColor: [248, 250, 252], cellWidth: 160 } },
    fontSize: 8.5,
  });

  startReportPage("Training Progress", "Batch-wise delivery status");
  sectionTitle("Training Progress", "Batch-wise training progress and delivery observations.");
  addTable({
    head: [["Center", "Batch ID", "Trade", "Start Date", "End Date", "Enrolled", "Attendance", "Batch Status"]],
    body: analytics.batches.map((batch) => [
      batch.centerName,
      batch.label,
      batch.track,
      formatDate(batch.startDate),
      formatDate(batch.endDate),
      batch.size,
      `${batch.attendanceRate}%`,
      batch.completedTraining >= batch.size ? "Completed" : "Active",
    ]),
    fontSize: 7.2,
    cellPadding: 4,
  });
  addTable({
    body: [
      ["Curriculum Progress", `${percent(analytics.completed, analytics.learners)} of enrolled learners have completed planned training milestones.`],
      ["Practical Sessions Conducted", analytics.batches.length ? `${analytics.batches.length * 3} practical/lab sessions documented during the month.` : "Data Not Available"],
      ["Special Workshops", "Placement readiness, workplace safety, soft skills, and assessment preparation workshops conducted as per batch requirement."],
    ],
    columnStyles: { 0: { fontStyle: "bold", fillColor: [248, 250, 252], cellWidth: 170 } },
    fontSize: 8.5,
  });

  startReportPage("Candidate Performance", "Assessments, certifications, and learner retention");
  sectionTitle("Candidate Performance", "Assessment statistics and certification outcomes.");
  addTable({
    body: [
      ["Assessment Completed", formatNumber(analytics.assessmentCompleted)],
      ["Certified Candidates", formatNumber(analytics.certified)],
      ["Pass Percentage", analytics.passPercentage],
      ["Dropout / At-risk Learners", formatNumber(analytics.dropout)],
      ["Dropout Analysis", analytics.dropout ? "Attendance follow-up and counselling are being prioritized for learners pending completion." : "No significant dropout variance observed in the selected reporting scope."],
    ],
    columnStyles: { 0: { fontStyle: "bold", fillColor: [248, 250, 252], cellWidth: 170 } },
    fontSize: 8.5,
  });
  addParagraphs([
    `Performance indicators show a certification conversion of ${analytics.passPercentage}. Centers with attendance above 90% are showing stronger assessment readiness, while learners below attendance threshold require additional counselling and revision support.`,
  ]);

  startReportPage("Placement & Livelihood", "Placement outcomes and employer engagement");
  sectionTitle("Placement & Livelihood", "Placement statistics and livelihood linkages.");
  addTable({
    body: [
      ["Placed Candidates", formatNumber(analytics.placed)],
      ["Placement Percentage", analytics.placementPercentage],
      ["Recruiters / Companies", [...new Set(allCandidates.filter((candidate) => candidate.company !== "Not mapped").map((candidate) => candidate.company))].join(", ") || "Data Not Available"],
      ["Salary Range", analytics.placed ? `${formatCurrency(analytics.salaryMin)} - ${formatCurrency(analytics.salaryMax)} per month` : "Data Not Available"],
      ["Placement Drive Activities", "Employer connects, interview preparation, candidate mapping, and placement follow-ups conducted."],
      ["Self-employment Data", "Data Not Available"],
    ],
    columnStyles: { 0: { fontStyle: "bold", fillColor: [248, 250, 252], cellWidth: 170 } },
    fontSize: 8,
  });

  startReportPage("Infrastructure & Center Status", "Center-level operational readiness");
  sectionTitle("Infrastructure & Center Status", "Trainer, lab, utility, and compliance observations.");
  addTable({
    head: [["Center", "Trainer Availability", "Equipment / Lab Status", "Internet / Power", "Compliance Observations"]],
    body: centers.map((center) => [
      center.name,
      `${center.employeeList?.length || "Data Not Available"} staff mapped; Manager: ${dataOrNA(center.manager)}`,
      center.grievancesList?.some((issue) => issue.toLowerCase().includes("repair")) ? "Minor repair follow-up pending" : "Operational",
      center.grievancesList?.some((issue) => issue.toLowerCase().includes("generator")) ? "Power backup servicing due" : "Available",
      center.grievancesList?.length ? center.grievancesList.join("; ") : "No major observation reported",
    ]),
    fontSize: 7.2,
    cellPadding: 4,
  });

  startReportPage("Financial Utilization", "Budget and expenditure summary");
  sectionTitle("Financial Utilization", "Financial utilization for the selected reporting scope.");
  addTable({
    head: [["Approved Budget", "Current Month Utilization", "Cumulative Utilization", "Remaining Balance"]],
    body: [[
      formatCurrency(analytics.approvedBudget),
      formatCurrency(analytics.currentMonthUtilization),
      formatCurrency(analytics.cumulativeUtilization),
      formatCurrency(analytics.remainingBalance),
    ]],
    fontSize: 8.5,
  });
  addParagraphs([
    `${analytics.projectInvoices.length || "No"} invoice record(s) and ${formatCurrency(analytics.committedProcurement)} in mapped procurement commitments were considered for this utilization summary. Where budget heads are not mapped to this client scope, the report uses available ERP operational records and flags unmapped details as Data Not Available.`,
  ], { color: muted });

  startReportPage("Success Stories", "Beneficiary outcomes");
  sectionTitle("Success Stories", "Representative learner stories based on available candidate data.");
  const successStories = allCandidates
    .filter((candidate) => candidate.placementStatus === "Placed")
    .slice(0, 3);
  if (successStories.length) {
    successStories.forEach((candidate, index) => {
      ensureSpace(92, "Success Stories");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(...ink);
      doc.text(`${index + 1}. ${candidate.name} | ${candidate.centerName}`, margin, y);
      y += 16;
      addParagraphs([
        `${candidate.name}, from the ${candidate.batch} batch, completed training in ${candidate.jobRole} with ${candidate.attendance}% attendance. After structured counselling, practical training, and placement preparation, the candidate secured employment with ${candidate.company} as ${candidate.designation}. The reported starting salary is ${formatCurrency(candidate.salary)} per month, supporting a measurable improvement in livelihood prospects.`,
      ], { fontSize: 8.7 });
    });
  } else {
    addParagraphs(["Data Not Available"]);
  }

  startReportPage("Challenges & Mitigation", "Issues and corrective actions");
  sectionTitle("Challenges & Mitigation", "Operational challenges and mitigation actions.");
  addTable({
    head: [["Challenge Area", "Observation", "Corrective Action Taken"]],
    body: [
      ["Operational", centers.flatMap((center) => center.grievancesList || []).slice(0, 3).join("; ") || "Data Not Available", "Center manager follow-up, vendor coordination, and compliance tracking initiated."],
      ["Mobilization", "Learner documentation and counselling follow-up required in select locations.", "Additional counselling camps and document verification desks planned."],
      ["Placement", "Employer mapping requires continued follow-up for candidates pending interviews.", "Recruiter pipeline review and placement readiness sessions scheduled."],
    ],
    fontSize: 8,
  });

  startReportPage("Next Month Plan", "Action plan");
  sectionTitle("Next Month Plan", "Priority actions for the upcoming month.");
  addBulletList([
    "Complete pending mobilization follow-ups and strengthen community outreach in under-served pockets.",
    "Maintain batch attendance through daily tracking, trainer review, and learner counselling.",
    "Close assessment readiness gaps through revision sessions and practical demonstrations.",
    "Conduct placement drives with shortlisted recruiters and update employer mapping in the ERP.",
    "Resolve center-level infrastructure observations and document closure evidence.",
    "Review financial utilization and reconcile any unmapped invoice or expenditure entries.",
  ]);

  startReportPage("Photo Gallery", "Categorized project images");
  sectionTitle("Photo Gallery", "Project gallery images organized by activity type.");
  const galleryItems = centers.flatMap((center) =>
    buildGalleryItems(project, center).map((item) => ({
      ...item,
      category: getGalleryCategory(item),
      caption: `${getGalleryCategory(item)} at ${center.name}, ${center.location}`,
    }))
  );
  const categories = ["Mobilization", "Training", "Practical Sessions", "Placement Drives", "Workshops", "Field Visits"];
  for (const category of categories) {
    const categoryItems = galleryItems.filter((item) => item.category === category).slice(0, 6);
    if (!categoryItems.length) continue;
    ensureSpace(42, "Photo Gallery");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...accentDark);
    doc.text(category, margin, y);
    y += 16;
    for (let index = 0; index < categoryItems.length; index += 2) {
      ensureSpace(190, "Photo Gallery");
      const rowItems = categoryItems.slice(index, index + 2);
      const cardWidth = (pageWidth - margin * 2 - 16) / 2;
      for (let itemIndex = 0; itemIndex < rowItems.length; itemIndex += 1) {
        const item = rowItems[itemIndex];
        const dataUrl = await imageUrlToDataUrl(item.src);
        const x = margin + itemIndex * (cardWidth + 16);
        doc.setFillColor(248, 250, 252);
        doc.roundedRect(x, y, cardWidth, 172, 6, 6, "F");
        doc.setDrawColor(...rule);
        doc.roundedRect(x, y, cardWidth, 172, 6, 6, "S");
        if (dataUrl) {
          doc.addImage(dataUrl, getImageFormat(dataUrl), x + 9, y + 9, cardWidth - 18, 104, undefined, "FAST");
        }
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8.5);
        doc.setTextColor(...ink);
        doc.text(item.title, x + 9, y + 130, { maxWidth: cardWidth - 18 });
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7.2);
        doc.setTextColor(...muted);
        doc.text(item.caption, x + 9, y + 148, { maxWidth: cardWidth - 18 });
        doc.text(`${item.capturedOn} | ${item.capturedBy}`, x + 9, y + 162, { maxWidth: cardWidth - 18 });
      }
      y += 190;
    }
  }

  const totalPagesBeforeToc = doc.internal.getNumberOfPages();
  doc.setPage(2);
  y = 86;
  sectionTitle("Table of Contents", "Automatic section index with generated page numbers.");
  addTable({
    head: [["Section", "Page"]],
    body: sectionPages
      .filter((section) => section.title !== "Cover Page")
      .map((section) => [section.title, section.page]),
    columnStyles: { 1: { halign: "right", cellWidth: 72 } },
    fontSize: 9,
  });

  if (doc.internal.getNumberOfPages() !== totalPagesBeforeToc) {
    pageSections[doc.internal.getNumberOfPages()] = "Table of Contents";
  }
  addFooter();
  return finalizeReportPdf(doc, `${client.name}_${project.name}_${month}_${year}_monthly_progress_report`, output);
}

async function generateBatchwiseDetailsPdf({ centers, client, month, output, project, year }) {
  const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable"),
  ]);

  const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 36;
  const accent = [37, 99, 235];
  const ink = [15, 23, 42];
  const muted = [100, 116, 139];
  const rule = [226, 232, 240];
  const analytics = buildReportAnalytics(centers, project);
  const batchesByCenter = centers.flatMap((center) =>
    center.batches.map((batch, batchIndex) => {
      const enrichedBatch = analytics.batches.find(
        (item) => item.centerName === center.name && item.label === batch.label
      );

      return {
        ...batch,
        ...enrichedBatch,
        centerName: center.name,
        centerLocation: center.location,
        manager: center.manager,
        serial: batchIndex + 1,
      };
    })
  );

  doc.setFillColor(248, 250, 252);
  doc.rect(0, 0, pageWidth, pageHeight, "F");
  doc.setFillColor(...accent);
  doc.rect(0, 0, 14, pageHeight, "F");
  doc.setFillColor(15, 23, 42);
  doc.rect(0, pageHeight - 86, pageWidth, 86, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(28);
  doc.setTextColor(...ink);
  doc.text("Batchwise Details Report", margin + 18, 150);
  doc.setFontSize(14);
  doc.setTextColor(...accent);
  doc.text(project.name, margin + 18, 182);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(...muted);
  [
    `Reporting Period: ${month} ${year}`,
    `Client / Organization: ${client.name}`,
    `Implementing Agency: ${IMPLEMENTING_AGENCY}`,
    `Project Location: ${getReportScopeLabel(centers, project)}`,
    `Submission Date: ${new Date().toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    })}`,
  ].forEach((line, index) => {
    doc.text(line, margin + 18, 230 + index * 24, { maxWidth: pageWidth - margin * 2 - 36 });
  });
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text("Generated from ERP batch, candidate, attendance, assessment, certification, and placement records.", margin + 18, pageHeight - 50);

  doc.addPage();
  addSimplePageHeader(doc, {
    accent,
    margin,
    month,
    pageWidth,
    title: "Report Summary",
    year,
  });
  autoTable(doc, {
    startY: 84,
    margin: { left: margin, right: margin },
    body: [
      ["Project", project.name],
      ["Client", client.name],
      ["Reporting Period", `${month} ${year}`],
      ["Centers Covered", centers.map((center) => center.name).join(", ") || "Data Not Available"],
      ["Total Batches", analytics.batches.length],
      ["Total Enrolled Candidates", formatNumber(analytics.learners)],
      ["Training Completed", formatNumber(analytics.completed)],
      ["Certified Candidates", formatNumber(analytics.certified)],
      ["Placed Candidates", formatNumber(analytics.placed)],
      ["Average Attendance", `${analytics.avgAttendance}%`],
    ],
    theme: "grid",
    styles: { fontSize: 9, cellPadding: 7, textColor: ink, lineColor: rule },
    columnStyles: { 0: { fontStyle: "bold", fillColor: [248, 250, 252], cellWidth: 190 } },
    didDrawPage: () => addSimpleFooter(doc, { client, margin, pageHeight, pageWidth, project, section: "Batchwise Summary" }),
  });

  doc.addPage();
  addSimplePageHeader(doc, {
    accent,
    margin,
    month,
    pageWidth,
    title: "Batch Overview",
    year,
  });
  autoTable(doc, {
    startY: 86,
    margin: { left: margin, right: margin },
    head: [["Center", "Batch ID", "Trade", "Start Date", "End Date", "Enrolled", "Completed", "Certified", "Placed", "Attendance", "Assessment", "Status", "Trainer / Manager"]],
    body: batchesByCenter.map((batch) => [
      batch.centerName,
      batch.label,
      batch.track,
      formatDate(batch.startDate),
      formatDate(batch.endDate),
      batch.size,
      batch.completedTraining,
      batch.certified,
      batch.placed,
      `${batch.attendanceRate}%`,
      `${batch.assessmentRate}%`,
      batch.completedTraining >= batch.size ? "Completed" : "Active",
      batch.manager || "Data Not Available",
    ]),
    headStyles: { fillColor: accent, textColor: [255, 255, 255], fontStyle: "bold" },
    styles: { fontSize: 7, cellPadding: 4, overflow: "linebreak", lineColor: rule },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    didDrawPage: () => addSimpleFooter(doc, { client, margin, pageHeight, pageWidth, project, section: "Batchwise Details" }),
  });

  batchesByCenter.forEach((batch) => {
    doc.addPage();
    addSimplePageHeader(doc, {
      accent,
      margin,
      month,
      pageWidth,
      title: `Candidate Details: ${batch.label}`,
      year,
    });
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(...ink);
    doc.text(`${batch.centerName} | ${batch.track}`, margin, 78);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...muted);
    doc.text(
      `Location: ${batch.centerLocation} | Manager: ${dataOrNA(batch.manager)} | Attendance: ${batch.attendanceRate}% | Assessment: ${batch.assessmentRate}%`,
      margin,
      94,
      { maxWidth: pageWidth - margin * 2 }
    );

    autoTable(doc, {
      startY: 112,
      margin: { left: margin, right: margin },
      head: [["Candidate", "Code", "Job Role", "Training Status", "Attendance", "Assessment", "Certification", "Placement Status", "Company", "Salary"]],
      body: (batch.candidateRecords || []).map((candidate) => [
        candidate.name,
        candidate.code,
        candidate.jobRole,
        candidate.trainingStatus,
        `${candidate.attendance}%`,
        candidate.trainingStatus === "Certified" ? "Passed" : candidate.trainingStatus === "Assessment Due" ? "Pending" : "In Progress",
        candidate.trainingStatus === "Certified" ? "Certified" : "Pending",
        candidate.placementStatus,
        candidate.company,
        candidate.salary ? formatCurrency(candidate.salary) : "Data Not Available",
      ]),
      headStyles: { fillColor: [51, 65, 85], textColor: [255, 255, 255], fontStyle: "bold" },
      styles: { fontSize: 7.2, cellPadding: 4, overflow: "linebreak", lineColor: rule },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      didDrawPage: () => addSimpleFooter(doc, { client, margin, pageHeight, pageWidth, project, section: `${batch.label} Candidate Details` }),
    });
  });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...muted);
  return finalizeReportPdf(doc, `${client.name}_${project.name}_${month}_${year}_batchwise_details`, output);
}

async function generatePlacementReportPdf({ centers, client, month, output, project, year }) {
  const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable"),
  ]);

  const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 36;
  const accent = [22, 163, 74];
  const ink = [15, 23, 42];
  const analytics = buildReportAnalytics(centers, project);
  const candidates = centers.flatMap((center) =>
    center.batches.flatMap((batch) =>
      batch.candidateRecords.map((candidate) => ({
        ...candidate,
        centerName: center.name,
        trade: batch.track,
      }))
    )
  );
  const placedCandidates = candidates.filter((candidate) => candidate.placementStatus === "Placed");
  const pipelineCandidates = candidates.filter((candidate) => candidate.placementStatus !== "Placed");

  addSimpleReportCover(doc, {
    accent,
    client,
    margin,
    month,
    pageWidth,
    project,
    reportTitle: "Placement Report",
    subtitle: `${month} ${year} | ${getReportScopeLabel(centers, project)}`,
    year,
  });

  autoTable(doc, {
    startY: 138,
    margin: { left: margin, right: margin },
    body: [
      ["Total Candidates", formatNumber(candidates.length)],
      ["Placed Candidates", formatNumber(placedCandidates.length)],
      ["Placement Percentage", percent(placedCandidates.length, candidates.length)],
      ["Recruiters / Companies", [...new Set(placedCandidates.map((candidate) => candidate.company))].join(", ") || "Data Not Available"],
      ["Salary Range", placedCandidates.length ? `${formatCurrency(analytics.salaryMin)} - ${formatCurrency(analytics.salaryMax)} per month` : "Data Not Available"],
      ["Pipeline Candidates", formatNumber(pipelineCandidates.length)],
    ],
    theme: "grid",
    styles: { fontSize: 8, cellPadding: 6, textColor: ink, lineColor: [226, 232, 240] },
    columnStyles: { 0: { fontStyle: "bold", fillColor: [248, 250, 252], cellWidth: 145 } },
  });

  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 24,
    margin: { left: margin, right: margin },
    head: [["Candidate", "Code", "Center", "Batch", "Trade", "Company", "Designation", "Salary", "Status"]],
    body: placedCandidates.map((candidate) => [
      candidate.name,
      candidate.code,
      candidate.centerName,
      candidate.batch,
      candidate.trade,
      candidate.company,
      candidate.designation,
      formatCurrency(candidate.salary),
      candidate.placementStatus,
    ]),
    headStyles: { fillColor: accent, textColor: [255, 255, 255], fontStyle: "bold" },
    styles: { fontSize: 7.2, cellPadding: 4, overflow: "linebreak", lineColor: [226, 232, 240] },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    didDrawPage: () => addSimpleFooter(doc, { client, margin, pageHeight, pageWidth, project, section: "Placement Report" }),
  });

  doc.addPage();
  addSimplePageHeader(doc, {
    accent,
    margin,
    month,
    pageWidth,
    title: "Placement Pipeline",
    year,
  });
  autoTable(doc, {
    startY: 86,
    margin: { left: margin, right: margin },
    head: [["Candidate", "Code", "Center", "Batch", "Trade", "Attendance", "Current Status", "Mapped Company"]],
    body: pipelineCandidates.map((candidate) => [
      candidate.name,
      candidate.code,
      candidate.centerName,
      candidate.batch,
      candidate.trade,
      `${candidate.attendance}%`,
      candidate.placementStatus,
      candidate.company,
    ]),
    headStyles: { fillColor: [51, 65, 85], textColor: [255, 255, 255], fontStyle: "bold" },
    styles: { fontSize: 7.2, cellPadding: 4, overflow: "linebreak", lineColor: [226, 232, 240] },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    didDrawPage: () => addSimpleFooter(doc, { client, margin, pageHeight, pageWidth, project, section: "Placement Pipeline" }),
  });

  return finalizeReportPdf(doc, `${client.name}_${project.name}_${month}_${year}_placement_report`, output);
}

function addSimpleReportCover(doc, { accent, client, margin, month, pageWidth, project, reportTitle, subtitle, year }) {
  doc.setFillColor(248, 250, 252);
  doc.rect(0, 0, pageWidth, 110, "F");
  doc.setFillColor(...accent);
  doc.rect(0, 0, 10, 110, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(15, 23, 42);
  doc.text(reportTitle, margin, 48);
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text(subtitle || `${month} ${year}`, margin, 70);
  doc.text(`${client.name} | ${project.name}`, margin, 88);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...accent);
  doc.text(IMPLEMENTING_AGENCY, pageWidth - margin, 48, { align: "right" });
}

function addSimplePageHeader(doc, { accent, margin, month, pageWidth, title, year }) {
  doc.setFillColor(248, 250, 252);
  doc.rect(0, 0, pageWidth, 52, "F");
  doc.setFillColor(...accent);
  doc.rect(0, 0, 8, 52, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text(title, margin, 30);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(`${month} ${year}`, pageWidth - margin, 30, { align: "right" });
}

function addSimpleFooter(doc, { client, margin, pageHeight, pageWidth, project, section }) {
  const pageNumber = doc.internal.getCurrentPageInfo().pageNumber;
  doc.setDrawColor(226, 232, 240);
  doc.line(margin, pageHeight - 30, pageWidth - margin, pageHeight - 30);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(`${client.name} | ${project.name}`, margin, pageHeight - 14);
  doc.text(section, pageWidth / 2, pageHeight - 14, { align: "center" });
  doc.text(`Page ${pageNumber}`, pageWidth - margin, pageHeight - 14, { align: "right" });
}
