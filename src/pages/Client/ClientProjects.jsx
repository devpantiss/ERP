import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowUpRight,
  Award,
  BookOpen,
  Briefcase,
  Building2,
  CalendarDays,
  CheckCircle2,
  CircleAlert,
  Download,
  Eye,
  FileSpreadsheet,
  FileText,
  GraduationCap,
  MapPin,
  Search,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  X,
} from "lucide-react";
import { toast } from "react-toastify";
import TableExportActions from "../../components/common/TableExportActions";
import { exportWorkbookToExcel } from "../../utils/export/tableExportUtils";
import { Header, Stat } from "./ClientDashboard";
import {
  buildClientProjectSnapshot,
  getClientProjects,
  getProjectSummary,
  getStoredClient,
} from "./clientPortalData";

export default function ClientProjects() {
  const client = getStoredClient();
  const projects = getClientProjects(client.name);

  return (
    <section className="space-y-7">
      <Header
        eyebrow="Project Portfolio"
        title={`${client.name} projects`}
        description="Track every project mapped to this client account with center-level delivery, attendance, placement, and grievance indicators."
      />

      <div className="grid gap-5">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </section>
  );
}

export function ClientProjectDetail() {
  const { projectId } = useParams();
  const client = getStoredClient();
  const project = getClientProjects(client.name).find((item) => item.id === projectId);
  const [selectedCenterId, setSelectedCenterId] = useState("");
  const [selectedBatchId, setSelectedBatchId] = useState("all");
  const [centralExporting, setCentralExporting] = useState(false);
  const batchRefs = useRef({});
  const snapshot = useMemo(() => (project ? buildClientProjectSnapshot(project) : null), [project]);

  useEffect(() => {
    if (!selectedBatchId || selectedBatchId === "all") return undefined;

    const frame = requestAnimationFrame(() => {
      batchRefs.current[selectedBatchId]?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });

    return () => cancelAnimationFrame(frame);
  }, [selectedBatchId]);

  if (!project) {
    return (
      <section className="space-y-5">
        <Link to="/client/projects" className="inline-flex items-center gap-2 text-sm text-violet-200">
          <ArrowLeft size={16} />
          Back to projects
        </Link>
        <Header
          eyebrow="Project not found"
          title="This project is not available for your client account."
          description="Use the Projects page to open a project assigned to your organization."
        />
      </section>
    );
  }

  const summary = snapshot.summary;
  const selectedCenter =
    snapshot.centers.find((center) => center.id === (selectedCenterId || snapshot.centers[0]?.id)) ||
    snapshot.centers[0];
  const selectedBatch =
    selectedCenter?.batches.find((batch) => batch.id === selectedBatchId) ||
    null;
  const totalDataBatch = selectedCenter
    ? {
        id: "all",
        label: "Total data",
        track: "All batches",
        candidateRecords: selectedCenter.batches.flatMap((batch) =>
          (batch.candidateRecords || []).map((candidate) => ({
            ...candidate,
            sourceBatchId: batch.id,
            sourceBatchLabel: batch.label,
          }))
        ),
      }
    : null;

  const handleCenterChange = (centerId) => {
    setSelectedCenterId(centerId);
    setSelectedBatchId("all");
  };

  const handleCentralListDownload = async () => {
    if (!snapshot) return;

    try {
      setCentralExporting(true);
      await exportWorkbookToExcel({
        sheets: buildClientCentralWorkbookSheets(snapshot, project),
        fileName: `${project.name}_central_list`,
        company: { name: "Pantiss ERP", logo: "/activity.png" },
      });
      toast.success("Central list workbook downloaded.");
    } catch (error) {
      console.error(error);
      toast.error("Unable to download central list workbook.");
    } finally {
      setCentralExporting(false);
    }
  };

  return (
    <section className="space-y-7">
      <Link to="/client/projects" className="inline-flex items-center gap-2 text-sm text-violet-200">
        <ArrowLeft size={16} />
        Back to projects
      </Link>

      <Header
        eyebrow={project.fundingAgency}
        title={project.name}
        description={`Delivery window: ${formatDate(project.startDate)} to ${formatDate(project.endDate)}. Current status: ${project.status}.`}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat icon={Building2} label="Centers" value={summary.centers} />
        <Stat icon={GraduationCap} label="Active Batches" value={snapshot.totalBatches} />
        <Stat icon={Users} label="Learners" value={summary.candidates} />
        <Stat icon={Target} label="Placement Rate" value={`${summary.placementRate}%`} />
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard label="Training completed" value={snapshot.completedTraining} caption="Learners with completed modules" icon={CheckCircle2} />
        <MetricCard label="Certified" value={snapshot.certified} caption="Assessment cleared" icon={Award} />
        <MetricCard label="Placed" value={snapshot.placed} caption="Offer or joining completed" icon={TrendingUp} />
        <MetricCard label="Open issues" value={summary.grievances} caption="Center-level operational risks" icon={CircleAlert} />
      </div>

      <ReturnOnInvestmentSection project={project} snapshot={snapshot} />

      {selectedCenter && (
        <section className="rounded-3xl border border-violet-200/10 bg-[#12071f]/80 p-5 shadow-xl shadow-black/20">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-300">
                Center Summary
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-white">{selectedCenter.name}</h2>
              <p className="mt-1 flex items-center gap-2 text-sm text-white/45">
                <MapPin size={15} className="text-violet-300" />
                {selectedCenter.location} • Managed by {selectedCenter.manager}
              </p>
            </div>
            <div className="w-full max-w-sm">
              <label className="text-xs font-semibold uppercase tracking-[0.14em] text-white/40">
                Choose center
              </label>
              <select
                value={selectedCenterId}
                onChange={(event) => handleCenterChange(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-violet-300/20 bg-black/25 px-4 py-3 text-sm text-white outline-none focus:border-violet-300/50"
              >
                {snapshot.centers.map((center) => (
                  <option key={center.id} value={center.id}>
                    {center.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-4">
            <Mini label="Batches" value={selectedCenter.batches.length} />
            <Mini label="Attendance" value={`${selectedCenter.attendanceRate}%`} />
            <Mini label="Placement" value={`${selectedCenter.placementRate}%`} />
            <Mini label="Issues" value={selectedCenter.grievances} />
          </div>
        </section>
      )}

      {selectedCenter && (
        <div className="space-y-5">
          <section className="rounded-3xl border border-violet-200/10 bg-[#12071f]/80 p-5 shadow-xl shadow-black/20">
            <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-300">
                  Center Batch Details
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-white">{selectedCenter.name}</h2>
                <p className="mt-1 text-sm text-white/45">
                  Batch-wise learners, certification, placement, attendance, and assessment status.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <label className="flex h-10 items-center gap-2 rounded-xl border border-violet-300/20 bg-black/25 px-3 text-sm text-white/55">
                  <span className="whitespace-nowrap">Data view</span>
                  <select
                    value={selectedBatchId}
                    onChange={(event) => setSelectedBatchId(event.target.value)}
                    className="min-w-36 bg-transparent font-semibold text-white outline-none"
                    aria-label="Filter batch details"
                  >
                    <option value="all">Total data</option>
                    {selectedCenter.batches.map((batch) => (
                      <option key={batch.id} value={batch.id}>{batch.label}</option>
                    ))}
                  </select>
                </label>
                <button
                  type="button"
                  onClick={handleCentralListDownload}
                  disabled={centralExporting}
                  className="inline-flex h-10 items-center gap-2 rounded-xl border border-emerald-400/25 bg-emerald-500/10 px-4 text-sm font-semibold text-emerald-200 transition hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <FileSpreadsheet size={16} />
                  {centralExporting ? "Preparing..." : "Central List"}
                </button>
                <Health value={selectedCenter.health} />
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {selectedBatchId === "all" && totalDataBatch ? (
                <ClientBatchStudentDetails batch={totalDataBatch} center={selectedCenter} project={project} />
              ) : null}

              {selectedCenter.batches.map((batch) => (
                <div
                  key={batch.id}
                  ref={(node) => {
                    if (node) {
                      batchRefs.current[batch.id] = node;
                    } else {
                      delete batchRefs.current[batch.id];
                    }
                  }}
                  className={`overflow-hidden rounded-2xl border transition ${
                    selectedBatch?.id === batch.id
                      ? "border-violet-300/45 bg-violet-500/10 shadow-[0_0_28px_rgba(124,58,237,0.12)]"
                      : "border-white/10 bg-black/20"
                  } scroll-mt-5`}
                >
                  <button
                    type="button"
                    onClick={() => setSelectedBatchId((current) => (current === batch.id ? "all" : batch.id))}
                    className="w-full p-4 text-left transition hover:bg-violet-500/10"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-white">{batch.label}</p>
                        <p className="mt-1 text-xs text-white/40">{batch.track} track</p>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <Mini label="Learners" value={batch.size} compact />
                        <Mini label="Certified" value={batch.certified} compact />
                        <Mini label="Placed" value={batch.placed} compact />
                      </div>
                    </div>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <Progress label="Attendance" value={batch.attendanceRate} />
                      <Progress label="Assessment" value={batch.assessmentRate} />
                    </div>
                  </button>

                  {selectedBatch?.id === batch.id && (
                    <div className="border-t border-white/10 p-4">
                      <ClientBatchStudentDetails batch={batch} center={selectedCenter} project={project} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          <ClientOperationsEvidenceSections project={project} center={selectedCenter} />
          <CenterGallery project={project} center={selectedCenter} />
        </div>
      )}
    </section>
  );
}

function ReturnOnInvestmentSection({ project, snapshot }) {
  const metrics = useMemo(() => {
    const candidates = getAllClientProjectCandidates(snapshot, project);
    const placedCandidates = candidates.filter((candidate) => candidate.placementStatus === "Placed");
    const estimatedInvestment = Math.max(snapshot.summary.candidates * 26000, 1);
    const annualIncomeGenerated = placedCandidates.reduce(
      (sum, candidate) => sum + (candidate.salary || 0) * 12,
      0
    );
    const netEconomicReturn = annualIncomeGenerated - estimatedInvestment;
    const roi = Math.round((netEconomicReturn / estimatedInvestment) * 100);
    const returnMultiple = annualIncomeGenerated / estimatedInvestment;

    return {
      annualIncomeGenerated,
      estimatedInvestment,
      netEconomicReturn,
      placed: placedCandidates.length,
      returnMultiple,
      roi,
      costPerPlacement: placedCandidates.length
        ? Math.round(estimatedInvestment / placedCandidates.length)
        : 0,
    };
  }, [project, snapshot]);

  const coverage = Math.min(100, Math.max(0, Math.round(metrics.returnMultiple * 100)));
  const positiveReturn = metrics.netEconomicReturn >= 0;

  return (
    <section className="overflow-hidden rounded-3xl border border-emerald-300/15 bg-[#0b1516]/90 shadow-xl shadow-black/20">
      <div className="flex flex-col gap-4 border-b border-white/10 p-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-300">Return on Investment</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Economic impact generated</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-white/45">
            Estimated annual income generated by placed learners compared with the program investment baseline.
          </p>
        </div>
        <div className={`w-fit rounded-2xl border px-4 py-3 ${positiveReturn ? "border-emerald-300/20 bg-emerald-500/10" : "border-amber-300/20 bg-amber-500/10"}`}>
          <p className="text-xs font-medium text-white/45">Estimated ROI</p>
          <p className={`mt-1 text-3xl font-semibold ${positiveReturn ? "text-emerald-300" : "text-amber-300"}`}>
            {metrics.roi > 0 ? "+" : ""}{metrics.roi}%
          </p>
        </div>
      </div>

      <div className="grid gap-px bg-white/10 sm:grid-cols-2 xl:grid-cols-4">
        <RoiMetric label="Estimated investment" value={`₹${formatNumber(metrics.estimatedInvestment)}`} caption="₹26,000 baseline per learner" />
        <RoiMetric label="Annual income generated" value={`₹${formatNumber(metrics.annualIncomeGenerated)}`} caption={`Annualized salary of ${formatNumber(metrics.placed)} placed learners`} />
        <RoiMetric label="Net economic return" value={`${positiveReturn ? "" : "−"}₹${formatNumber(Math.abs(metrics.netEconomicReturn))}`} caption="Annual income less estimated investment" tone={positiveReturn ? "positive" : "warning"} />
        <RoiMetric label="Cost per placement" value={metrics.placed ? `₹${formatNumber(metrics.costPerPlacement)}` : "—"} caption="Estimated investment per placed learner" />
      </div>

      <div className="p-5">
        <div className="flex items-center justify-between gap-4 text-sm">
          <span className="font-medium text-white/60">Investment recovered through annual income</span>
          <span className="font-semibold text-white">{metrics.returnMultiple.toFixed(2)}×</span>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-teal-400 to-emerald-400 transition-all duration-500"
            style={{ width: `${coverage}%` }}
          />
        </div>
        <p className="mt-3 text-xs leading-5 text-white/35">
          Indicative economic-impact estimate based on a ₹26,000 investment baseline per learner and current recorded monthly salaries annualized for 12 months.
        </p>
      </div>
    </section>
  );
}

function RoiMetric({ caption, label, tone = "default", value }) {
  const valueColor = tone === "positive" ? "text-emerald-300" : tone === "warning" ? "text-amber-300" : "text-white";

  return (
    <div className="bg-[#0b1516] p-5">
      <p className="text-sm font-medium text-white/45">{label}</p>
      <p className={`mt-2 text-2xl font-semibold ${valueColor}`}>{value}</p>
      <p className="mt-2 text-xs leading-5 text-white/35">{caption}</p>
    </div>
  );
}

function ClientBatchStudentDetails({
  batch,
  center,
  project,
}) {
  const [activeView, setActiveView] = useState("training");
  const candidates = useMemo(
    () => (batch.candidateRecords || []).map((candidate, index) => normalizeClientCandidate(candidate, index, batch)),
    [batch]
  );

  const tabs = [
    { key: "enrollment", label: "Enrollment" },
    { key: "training", label: "Training Detail" },
    { key: "certified", label: "Certified List" },
    { key: "kit", label: "Kit Distribution" },
    { key: "placements", label: "Placements" },
  ];

  return (
    <section className="rounded-2xl border border-white/10 bg-[#090315]/70 p-4">
      <div className="flex flex-col gap-4 border-b border-violet-200/10 pb-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-300">Candidate Roster</p>
          <h2 className="mt-2 text-xl font-semibold text-white">{batch.label} student details</h2>
          <p className="mt-1 text-sm text-white/45">
            {formatNumber(candidates.length)} candidates in {center.name}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 lg:justify-end">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveView(tab.key)}
              className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                activeView === tab.key
                  ? "border-violet-400/40 bg-violet-500 text-white"
                  : "border-white/10 bg-white/[0.04] text-white/45 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeView === "enrollment" ? (
        <ClientEnrollmentRoster candidates={candidates} center={center} project={project} batchLabel={batch.label} />
      ) : activeView === "certified" ? (
        <ClientCertifiedRoster candidates={candidates} project={project} batchLabel={batch.label} />
      ) : activeView === "kit" ? (
        <ClientKitDistributionRoster candidates={candidates} center={center} project={project} batchLabel={batch.label} />
      ) : activeView === "placements" ? (
        <ClientPlacementRoster candidates={candidates} project={project} batchLabel={batch.label} />
      ) : (
        <ClientTrainingRoster candidates={candidates} project={project} batchLabel={batch.label} />
      )}
    </section>
  );
}

const TRAINING_STATUS_ORDER = ["In Progress", "Assessment Due", "Certified"];

const KIT_ITEM_CONFIG = [
  { key: "safetyKit", label: "Safety Kit" },
  { key: "shoes", label: "Shoes" },
  { key: "uniform", label: "Uniform" },
  { key: "trainingKit", label: "Training Kit" },
];

function normalizeClientCandidate(candidate, index, batch) {
  const seed = index + batch.label.length;
  const isCertified = candidate.trainingStatus === "Certified";
  const isPlaced = candidate.placementStatus === "Placed";
  const completedTrainingDays = Math.min(72, 30 + (seed % 8) * 6);
  const totalTrainingDays = completedTrainingDays + 12;
  const salary = candidate.salary || (isPlaced ? 15000 + (seed % 8) * 1800 : 0);

  return {
    ...candidate,
    id: candidate.sourceBatchId ? `${candidate.sourceBatchId}-${candidate.id}` : candidate.id,
    batchLabel: candidate.sourceBatchLabel || batch.label,
    aadharNumber: `XXXX-XXXX-${String(3400 + seed).slice(-4)}`,
    address: `${candidate.batch}, ${candidate.jobRole} learner address`,
    candidateCode: candidate.code,
    completedTrainingDays,
    currentlyEmployed: isPlaced ? "Yes" : "No",
    dateOfBirth: `200${seed % 6}-${String((seed % 9) + 1).padStart(2, "0")}-${String((seed % 24) + 1).padStart(2, "0")}`,
    enrollmentDate: `2026-${String((seed % 6) + 1).padStart(2, "0")}-${String((seed % 24) + 1).padStart(2, "0")}`,
    enrollmentStatus: isCertified ? "Approved" : "Pending",
    experienceYears: `${seed % 3} Years`,
    gender: seed % 2 ? "Female" : "Male",
    hasBankStatement: isPlaced && seed % 5 !== 0,
    hasM1: isPlaced,
    hasM2: isPlaced && seed % 4 !== 0,
    hasM3: isPlaced && seed % 3 !== 0,
    hasOfferLetter: isPlaced,
    isVerified: isPlaced && seed % 4 !== 0,
    kitIssued: seed % 5 !== 1,
    kitIssuedOn: `2026-${String((seed % 6) + 2).padStart(2, "0")}-${String((seed % 22) + 1).padStart(2, "0")}`,
    kitItems: ["Uniform", "Shoes", "Bag", "Study Material", "Safety Gear"],
    kitProofFile: seed % 5 !== 1 ? `${candidate.code || candidate.id}-kit-proof.jpg` : "",
    joiningDate: isPlaced ? `2026-${String((seed % 6) + 4).padStart(2, "0")}-${String((seed % 22) + 1).padStart(2, "0")}` : "",
    mobilizer: ["Field Mobilizer", "Community Mobilizer", "Enrollment Desk"][seed % 3],
    phone: `9${String(800000000 + seed * 1379).slice(0, 9)}`,
    qualificationInstitute: ["ITI Angul", "Govt Polytechnic", "Skill Training Institute"][seed % 3],
    qualificationLevel: ["10th Pass", "12th Pass", "ITI"][seed % 3],
    qualificationTrade: candidate.jobRole,
    qualificationYear: String(2021 + (seed % 5)),
    salary,
    totalPracticalHours: completedTrainingDays * 4 + (seed % 5) * 8,
    totalTheoryHours: completedTrainingDays * 3 + (seed % 4) * 6,
    totalTrainingDays,
  };
}

function getAllClientProjectCandidates(snapshot, project) {
  return snapshot.centers.flatMap((center) =>
    center.batches.flatMap((batch) =>
      (batch.candidateRecords || []).map((candidate, index) => ({
        ...normalizeClientCandidate(candidate, index, batch),
        batchLabel: batch.label,
        batchTrack: batch.track,
        centerLocation: center.location,
        centerName: center.name,
        projectName: project.name,
      }))
    )
  );
}

function buildClientCentralWorkbookSheets(snapshot, project) {
  const candidates = getAllClientProjectCandidates(snapshot, project);
  const certifiedRows = candidates
    .filter((candidate) => candidate.trainingStatus === "Certified")
    .map((candidate, index) => ({
      ...candidate,
      certificateId: `CERT-${candidate.candidateCode || index + 1}`,
      certifiedOn: `2026-${String((index % 5) + 4).padStart(2, "0")}-${String((index % 23) + 1).padStart(2, "0")}`,
    }));
  const kitRows = candidates.map((candidate, index) => {
    const issued = {
      safetyKit: candidate.kitIssued,
      shoes: candidate.kitIssued && index % 4 !== 1,
      uniform: candidate.kitIssued && index % 5 !== 2,
      trainingKit: candidate.kitIssued && index % 6 !== 3,
    };
    const issuedCount = KIT_ITEM_CONFIG.filter((item) => issued[item.key]).length;

    return {
      ...candidate,
      safetyKit: issued.safetyKit ? "Issued" : "Pending",
      shoes: issued.shoes ? "Issued" : "Pending",
      uniform: issued.uniform ? "Issued" : "Pending",
      trainingKit: issued.trainingKit ? "Issued" : "Pending",
      proofImageName: candidate.kitProofFile || "Not uploaded",
      status: issuedCount === KIT_ITEM_CONFIG.length ? "Completed" : issuedCount > 0 ? "Partial" : "Pending",
    };
  });
  const placementRows = candidates
    .filter((candidate) => candidate.placementStatus === "Placed")
    .map((candidate) => ({
      ...candidate,
      bankStatement: candidate.hasBankStatement ? "Available" : "Missing",
      m1: candidate.hasM1 ? "Available" : "Missing",
      m2: candidate.hasM2 ? "Available" : "Missing",
      m3: candidate.hasM3 ? "Available" : "Missing",
      offerLetter: candidate.hasOfferLetter ? "Available" : "Missing",
      verificationStatus: candidate.isVerified ? "Verified" : "Pending",
    }));

  return [
    {
      name: "Enrollment",
      rows: candidates,
      columns: [
        { key: "name", header: "Candidate" },
        { key: "candidateCode", header: "Candidate Code" },
        { key: "phone", header: "Phone" },
        { key: "mobilizer", header: "Mobilizer" },
        { key: "projectName", header: "Project" },
        { key: "centerName", header: "Center" },
        { key: "centerLocation", header: "Location" },
        { key: "batchLabel", header: "Batch" },
        { key: "jobRole", header: "Job Role" },
        { key: "aadharNumber", header: "Aadhaar" },
        { key: "dateOfBirth", header: "DOB", type: "date" },
        { key: "gender", header: "Gender" },
        { key: "qualificationLevel", header: "Qualification" },
        { key: "qualificationTrade", header: "Trade" },
        { key: "qualificationInstitute", header: "Institute" },
        { key: "qualificationYear", header: "Passing Year" },
        { key: "experienceYears", header: "Experience" },
        { key: "currentlyEmployed", header: "Currently Employed" },
        { key: "enrollmentDate", header: "Enrolled On", type: "date" },
        { key: "enrollmentStatus", header: "Status" },
      ],
    },
    {
      name: "Training Details",
      rows: candidates,
      columns: [
        { key: "name", header: "Name" },
        { key: "candidateCode", header: "Candidate Code" },
        { key: "projectName", header: "Project" },
        { key: "centerName", header: "Center" },
        { key: "batchLabel", header: "Batch" },
        { key: "jobRole", header: "Job Role" },
        { key: "trainingStatus", header: "Training Status" },
        { key: "completedTrainingDays", header: "Completed Days", type: "number" },
        { key: "totalTrainingDays", header: "Total Days", type: "number" },
        { key: "totalTheoryHours", header: "Theory Hours", type: "number" },
        { key: "totalPracticalHours", header: "Practical Hours", type: "number" },
        { key: "attendance", header: "Attendance %", type: "number" },
      ],
    },
    {
      name: "Certified",
      rows: certifiedRows,
      columns: [
        { key: "name", header: "Student" },
        { key: "candidateCode", header: "Candidate Code" },
        { key: "projectName", header: "Project" },
        { key: "centerName", header: "Center" },
        { key: "batchLabel", header: "Batch" },
        { key: "jobRole", header: "Job Role" },
        { key: "attendance", header: "Attendance %", type: "number" },
        { key: "trainingStatus", header: "Certification Status" },
        { key: "certificateId", header: "Certificate ID" },
        { key: "certifiedOn", header: "Certified On", type: "date" },
      ],
    },
    {
      name: "Kit Distribution",
      rows: kitRows,
      columns: [
        { key: "name", header: "Student" },
        { key: "candidateCode", header: "Candidate Code" },
        { key: "projectName", header: "Project" },
        { key: "centerName", header: "Center" },
        { key: "batchLabel", header: "Batch" },
        { key: "jobRole", header: "Job Role" },
        { key: "safetyKit", header: "Safety Kit" },
        { key: "shoes", header: "Shoes" },
        { key: "uniform", header: "Uniform" },
        { key: "trainingKit", header: "Training Kit" },
        { key: "kitIssuedOn", header: "Issued On", type: "date" },
        { key: "proofImageName", header: "Proof Image" },
        { key: "status", header: "Status" },
      ],
    },
    {
      name: "Placements",
      rows: placementRows,
      columns: [
        { key: "name", header: "Student Name" },
        { key: "candidateCode", header: "Candidate Code" },
        { key: "projectName", header: "Project" },
        { key: "centerName", header: "Center" },
        { key: "batchLabel", header: "Batch" },
        { key: "company", header: "Company" },
        { key: "designation", header: "Designation" },
        { key: "salary", header: "Salary", type: "currency" },
        { key: "joiningDate", header: "Joining Date", type: "date" },
        { key: "offerLetter", header: "Offer Letter" },
        { key: "m1", header: "M1" },
        { key: "m2", header: "M2" },
        { key: "m3", header: "M3" },
        { key: "bankStatement", header: "Bank Statement" },
        { key: "verificationStatus", header: "Status" },
      ],
    },
  ];
}

function ClientTableToolbar({
  children,
  onClear,
  onSearchChange,
  resultCount,
  searchPlaceholder,
  searchTerm,
}) {
  return (
    <div className="border-b border-white/10 bg-[#0b1220]/80 p-3">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          <div className="relative min-w-[220px] flex-1 max-w-sm">
            <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              value={searchTerm}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder={searchPlaceholder}
              className="h-10 w-full rounded-xl border border-white/10 bg-white/[0.04] pl-9 pr-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-violet-400/40 focus:ring-1 focus:ring-violet-500/30"
            />
          </div>
          {children}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            {formatNumber(resultCount)} rows
          </span>
          <button
            type="button"
            onClick={onClear}
            className="rounded-xl border border-white/10 px-3 py-2 text-xs font-semibold text-slate-400 transition hover:border-violet-400/30 hover:text-slate-200"
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );
}

function FilterControl({ label, onChange, options, value }) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="h-10 min-w-[150px] rounded-xl border border-white/10 bg-[#111827] px-3 text-sm font-medium text-slate-200 outline-none transition hover:border-violet-400/30 focus:border-violet-400/40 focus:ring-1 focus:ring-violet-500/30"
    >
      <option value="">{label}</option>
      {options.map((option) => {
        const optionValue = typeof option === "string" ? option : option.value;
        const optionLabel = typeof option === "string" ? option : option.label;
        return (
          <option key={optionValue} value={optionValue}>
            {optionLabel}
          </option>
        );
      })}
    </select>
  );
}

function ClientTrainingRoster({ candidates, project, batchLabel }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const roleOptions = useMemo(() => Array.from(new Set(candidates.map((candidate) => candidate.jobRole))).sort(), [candidates]);
  const filteredCandidates = useMemo(
    () =>
      candidates.filter((candidate) => {
        const query = searchTerm.trim().toLowerCase();
        const matchesSearch =
          !query ||
          candidate.name.toLowerCase().includes(query) ||
          candidate.candidateCode.toLowerCase().includes(query) ||
          candidate.jobRole.toLowerCase().includes(query);
        const matchesStatus = !statusFilter || candidate.trainingStatus === statusFilter;
        const matchesRole = !roleFilter || candidate.jobRole === roleFilter;

        return matchesSearch && matchesStatus && matchesRole;
      }),
    [candidates, roleFilter, searchTerm, statusFilter]
  );
  const exportColumns = useMemo(
    () => [
      { key: "name", header: "Name" },
      { key: "candidateCode", header: "Candidate Code" },
      { key: "projectName", header: "Project", exportValue: () => project.name },
      { key: "batchLabel", header: "Batch", exportValue: (candidate) => candidate.batchLabel || batchLabel },
      { key: "jobRole", header: "Job Role" },
      { key: "trainingStatus", header: "Training Status" },
      { key: "completedTrainingDays", header: "Completed Days", type: "number" },
      { key: "totalTrainingDays", header: "Total Days", type: "number" },
      { key: "totalTheoryHours", header: "Theory Hours", type: "number" },
      { key: "totalPracticalHours", header: "Practical Hours", type: "number" },
      { key: "attendance", header: "Attendance %", type: "number" },
    ],
    [batchLabel, project.name]
  );

  return (
    <div className="mt-4 overflow-hidden rounded-[20px] border border-white/10">
      <ClientTableToolbar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search training candidates..."
        resultCount={filteredCandidates.length}
        onClear={() => {
          setSearchTerm("");
          setStatusFilter("");
          setRoleFilter("");
        }}
      >
        <FilterControl label="Status" value={statusFilter} onChange={setStatusFilter} options={TRAINING_STATUS_ORDER} />
        <FilterControl label="Job Role" value={roleFilter} onChange={setRoleFilter} options={roleOptions} />
        <TableExportActions
          moduleName="Training Detail"
          fileName="training_detail"
          columns={exportColumns}
          rows={filteredCandidates}
          company={{ name: "Pantiss ERP", logo: "/activity.png" }}
        />
      </ClientTableToolbar>
      <div className="overflow-auto" style={{ maxHeight: "clamp(240px, calc(100vh - 420px), 420px)" }}>
        <table className="w-full min-w-[960px] text-left text-sm">
          <thead className="sticky top-0 z-10 bg-[#0f172a] text-xs uppercase tracking-[0.16em] text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Project</th>
              <th className="px-4 py-3 font-medium">Batch</th>
              <th className="px-4 py-3 font-medium">Job Role</th>
              <th className="px-4 py-3 font-medium">Duration Received</th>
              <th className="px-4 py-3 font-medium">Theory Hours</th>
              <th className="px-4 py-3 font-medium">Practical Hours</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {filteredCandidates.map((candidate) => (
              <tr key={candidate.id} className="align-top transition hover:bg-violet-500/[0.06]">
                <td className="px-4 py-4">
                  <p className="font-medium text-white">{candidate.name}</p>
                  <p className="mt-1 text-xs text-slate-500">{candidate.candidateCode}</p>
                </td>
                <td className="px-4 py-4 text-slate-300">{project.name}</td>
                <td className="px-4 py-4">
                  <span className="rounded-full border border-violet-400/20 bg-violet-500/10 px-2.5 py-1 text-xs font-semibold text-violet-200">
                    {candidate.batchLabel || batchLabel}
                  </span>
                </td>
                <td className="px-4 py-4 text-slate-300">{candidate.jobRole}</td>
                <td className="px-4 py-4">
                  <p className="font-medium text-white">{candidate.completedTrainingDays} days</p>
                  <p className="mt-1 text-xs text-slate-500">of {candidate.totalTrainingDays} days total</p>
                  <div className="mt-2 h-1.5 w-20 overflow-hidden rounded-full bg-slate-800">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-400"
                      style={{ width: `${Math.round((candidate.completedTrainingDays / candidate.totalTrainingDays) * 100)}%` }}
                    />
                  </div>
                </td>
                <td className="px-4 py-4">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-2.5 py-1 text-xs font-semibold text-blue-300">
                    <BookOpen size={12} />
                    {candidate.totalTheoryHours} hrs
                  </span>
                </td>
                <td className="px-4 py-4">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-300">
                    <Target size={12} />
                    {candidate.totalPracticalHours} hrs
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ClientEnrollmentRoster({ candidates, center, project, batchLabel }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const roleOptions = useMemo(() => Array.from(new Set(candidates.map((candidate) => candidate.jobRole))).sort(), [candidates]);
  const filteredCandidates = useMemo(
    () =>
      candidates.filter((candidate) => {
        const status = candidate.enrollmentStatus;
        const query = searchTerm.trim().toLowerCase();
        const matchesSearch =
          !query ||
          candidate.name.toLowerCase().includes(query) ||
          candidate.candidateCode.toLowerCase().includes(query) ||
          candidate.phone.toLowerCase().includes(query) ||
          candidate.mobilizer.toLowerCase().includes(query);
        const matchesStatus = !statusFilter || status === statusFilter;
        const matchesRole = !roleFilter || candidate.jobRole === roleFilter;

        return matchesSearch && matchesStatus && matchesRole;
      }),
    [candidates, roleFilter, searchTerm, statusFilter]
  );
  const exportColumns = useMemo(
    () => [
      { key: "name", header: "Candidate" },
      { key: "candidateCode", header: "Candidate Code" },
      { key: "phone", header: "Phone" },
      { key: "mobilizer", header: "Mobilizer" },
      { key: "projectName", header: "Project", exportValue: () => project.name },
      { key: "centerName", header: "Center", exportValue: () => center.name },
      { key: "batchLabel", header: "Batch", exportValue: (candidate) => candidate.batchLabel || batchLabel },
      { key: "jobRole", header: "Job Role" },
      { key: "aadharNumber", header: "Aadhaar" },
      { key: "dateOfBirth", header: "DOB", type: "date" },
      { key: "gender", header: "Gender" },
      { key: "qualificationLevel", header: "Qualification" },
      { key: "qualificationTrade", header: "Trade" },
      { key: "qualificationInstitute", header: "Institute" },
      { key: "qualificationYear", header: "Passing Year" },
      { key: "experienceYears", header: "Experience" },
      { key: "currentlyEmployed", header: "Currently Employed" },
      { key: "enrollmentDate", header: "Enrolled On", type: "date" },
      { key: "enrollmentStatus", header: "Status" },
    ],
    [batchLabel, center.name, project.name]
  );

  return (
    <div className="mt-4 overflow-hidden rounded-[20px] border border-white/10">
      <ClientTableToolbar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search enrollment candidates..."
        resultCount={filteredCandidates.length}
        onClear={() => {
          setSearchTerm("");
          setStatusFilter("");
          setRoleFilter("");
        }}
      >
        <FilterControl label="Status" value={statusFilter} onChange={setStatusFilter} options={["Pending", "Approved", "Rejected"]} />
        <FilterControl label="Job Role" value={roleFilter} onChange={setRoleFilter} options={roleOptions} />
        <TableExportActions
          moduleName="Enrollment"
          fileName="enrollment_report"
          columns={exportColumns}
          rows={filteredCandidates}
          company={{ name: "Pantiss ERP", logo: "/activity.png" }}
        />
      </ClientTableToolbar>
      <div className="overflow-auto" style={{ maxHeight: "clamp(240px, calc(100vh - 420px), 420px)" }}>
        <table className="w-full min-w-[1680px] text-left text-sm">
          <thead className="sticky top-0 z-10 bg-[#0f172a] text-xs uppercase tracking-[0.16em] text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Candidate</th>
              <th className="px-4 py-3 font-medium">School / Center</th>
              <th className="px-4 py-3 font-medium">Job Role</th>
              <th className="px-4 py-3 font-medium">Aadhaar</th>
              <th className="px-4 py-3 font-medium">DOB / Gender</th>
              <th className="px-4 py-3 font-medium">Qualification</th>
              <th className="px-4 py-3 font-medium">Experience</th>
              <th className="px-4 py-3 font-medium">Documents</th>
              <th className="px-4 py-3 font-medium">Submitted</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 text-right font-medium">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {filteredCandidates.map((candidate) => (
              <tr key={candidate.id} className="align-top transition hover:bg-violet-500/[0.06]">
                <td className="px-4 py-4">
                  <p className="font-medium text-white">{candidate.name}</p>
                  <p className="mt-1 text-xs text-slate-500">{candidate.candidateCode} • {candidate.phone}</p>
                  <p className="mt-1 text-xs text-slate-500">{candidate.mobilizer}</p>
                </td>
                <td className="px-4 py-4">
                  <p className="text-slate-300">{project.name}</p>
                  <p className="mt-1 text-xs text-slate-500">{center.name} • {candidate.batchLabel || batchLabel}</p>
                </td>
                <td className="px-4 py-4 text-slate-300">{candidate.jobRole}</td>
                <td className="px-4 py-4 text-slate-300">{candidate.aadharNumber}</td>
                <td className="px-4 py-4">
                  <p className="text-slate-300">{candidate.dateOfBirth}</p>
                  <p className="mt-1 text-xs text-slate-500">{candidate.gender}</p>
                </td>
                <td className="px-4 py-4">
                  <p className="text-slate-300">{candidate.qualificationLevel}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {[candidate.qualificationTrade, candidate.qualificationInstitute, candidate.qualificationYear].filter(Boolean).join(" • ")}
                  </p>
                </td>
                <td className="px-4 py-4">
                  <p className="text-slate-300">{candidate.experienceYears}</p>
                  <p className="mt-1 text-xs text-slate-500">Employed: {candidate.currentlyEmployed}</p>
                </td>
                <td className="px-4 py-4">
                  <div className="flex flex-wrap gap-2">
                    {["Aadhaar", "Qualification", "Experience", "License"].map((label, index) => (
                      <span key={label} className="inline-flex items-center gap-1 rounded-md border border-violet-400/20 bg-violet-500/10 px-2 py-1 text-xs text-violet-200">
                        <FileText size={12} />
                        {index === 1 ? "Qual." : label}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-4 text-slate-300">{candidate.enrollmentDate}</td>
                <td className="px-4 py-4">
                  <StatusPill status={candidate.enrollmentStatus} />
                </td>
                <td className="px-4 py-4 text-right">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-slate-200"
                  >
                    <Eye size={13} />
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ClientCertifiedRoster({ candidates, project, batchLabel }) {
  const [searchTerm, setSearchTerm] = useState("");
  const certifiedCandidates = candidates.filter((candidate) => candidate.trainingStatus === "Certified");
  const filteredCandidates = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return certifiedCandidates.filter(
      (candidate) =>
        !query ||
        candidate.name.toLowerCase().includes(query) ||
        candidate.candidateCode.toLowerCase().includes(query) ||
        candidate.jobRole.toLowerCase().includes(query)
    );
  }, [certifiedCandidates, searchTerm]);

  const exportColumns = useMemo(
    () => [
      { key: "name", header: "Student" },
      { key: "candidateCode", header: "Candidate Code" },
      { key: "projectName", header: "Project", exportValue: () => project.name },
      { key: "batchLabel", header: "Batch", exportValue: (candidate) => candidate.batchLabel || batchLabel },
      { key: "jobRole", header: "Job Role" },
      { key: "attendance", header: "Attendance %", type: "number" },
      { key: "trainingStatus", header: "Certification Status" },
      { key: "certificateId", header: "Certificate ID" },
      { key: "certifiedOn", header: "Certified On", type: "date" },
    ],
    [batchLabel, project.name]
  );

  const rows = filteredCandidates.map((candidate, index) => ({
    ...candidate,
    certificateId: `CERT-${candidate.candidateCode || index + 1}`,
    certifiedOn: `2026-${String((index % 5) + 4).padStart(2, "0")}-${String((index % 23) + 1).padStart(2, "0")}`,
  }));

  return (
    <div className="mt-4 overflow-hidden rounded-[20px] border border-white/10">
      <ClientTableToolbar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search certified candidates..."
        resultCount={rows.length}
        onClear={() => setSearchTerm("")}
      >
        <TableExportActions
          moduleName="Certified List"
          fileName="certified_candidates"
          columns={exportColumns}
          rows={rows}
          company={{ name: "Pantiss ERP", logo: "/activity.png" }}
        />
      </ClientTableToolbar>
      <div className="overflow-auto" style={{ maxHeight: "clamp(240px, calc(100vh - 420px), 420px)" }}>
        <table className="w-full min-w-[1080px] text-left text-sm">
          <thead className="sticky top-0 z-10 bg-[#0f172a] text-xs uppercase tracking-[0.16em] text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Student</th>
              <th className="px-4 py-3 font-medium">Project</th>
              <th className="px-4 py-3 font-medium">Batch</th>
              <th className="px-4 py-3 font-medium">Job Role</th>
              <th className="px-4 py-3 font-medium">Attendance</th>
              <th className="px-4 py-3 font-medium">Certificate ID</th>
              <th className="px-4 py-3 font-medium">Certified On</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {rows.map((candidate) => (
              <tr key={candidate.id} className="align-top transition hover:bg-violet-500/[0.06]">
                <td className="px-4 py-4">
                  <p className="font-medium text-white">{candidate.name}</p>
                  <p className="mt-1 text-xs text-slate-500">{candidate.candidateCode}</p>
                </td>
                <td className="px-4 py-4 text-slate-300">{project.name}</td>
                <td className="px-4 py-4"><BatchPill label={candidate.batchLabel || batchLabel} /></td>
                <td className="px-4 py-4 text-slate-300">{candidate.jobRole}</td>
                <td className="px-4 py-4"><Progress label="Attendance" value={candidate.attendance} /></td>
                <td className="px-4 py-4 font-mono text-xs text-slate-300">{candidate.certificateId}</td>
                <td className="px-4 py-4 text-slate-300">{formatDate(candidate.certifiedOn)}</td>
                <td className="px-4 py-4"><StatusPill status="Certified" /></td>
              </tr>
            ))}
            {!rows.length && (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-sm font-semibold text-slate-500">
                  No certified candidates in this batch yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ClientKitDistributionRoster({ candidates, center, project, batchLabel }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const rows = useMemo(
    () =>
      candidates.map((candidate, index) => {
        const issued = {
          safetyKit: candidate.kitIssued,
          shoes: candidate.kitIssued && index % 4 !== 1,
          uniform: candidate.kitIssued && index % 5 !== 2,
          trainingKit: candidate.kitIssued && index % 6 !== 3,
        };
        const issuedCount = KIT_ITEM_CONFIG.filter((item) => issued[item.key]).length;
        const status =
          issuedCount === KIT_ITEM_CONFIG.length
            ? "Completed"
            : issuedCount > 0
              ? "Partial"
              : "Pending";

        return {
          ...candidate,
          issued,
          proofImage: candidate.kitProofFile ? `/images/client-gallery/${(index % 7) + 1}.png` : "",
          proofImageName: candidate.kitProofFile,
          status,
        };
      }),
    [candidates]
  );
  const filteredCandidates = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return rows.filter((candidate) => {
      const matchesStatus = !statusFilter || candidate.status === statusFilter;
      const matchesSearch =
        !query ||
        candidate.name.toLowerCase().includes(query) ||
        candidate.candidateCode.toLowerCase().includes(query) ||
        candidate.jobRole.toLowerCase().includes(query);
      return matchesStatus && matchesSearch;
    });
  }, [rows, searchTerm, statusFilter]);

  const exportColumns = useMemo(
    () => [
      { key: "name", header: "Student" },
      { key: "candidateCode", header: "Candidate Code" },
      { key: "projectName", header: "Project", exportValue: () => project.name },
      { key: "centerName", header: "Center", exportValue: () => center.name },
      { key: "batchLabel", header: "Batch", exportValue: (candidate) => candidate.batchLabel || batchLabel },
      { key: "jobRole", header: "Job Role" },
      ...KIT_ITEM_CONFIG.map((item) => ({
        key: item.key,
        header: item.label,
        exportValue: (candidate) => (candidate.issued[item.key] ? "Issued" : "Pending"),
      })),
      { key: "kitIssuedOn", header: "Issued On", type: "date" },
      { key: "proofImageName", header: "Proof Image", exportValue: (candidate) => candidate.proofImageName || "Not uploaded" },
      { key: "status", header: "Status" },
    ],
    [batchLabel, center.name, project.name]
  );

  return (
    <div className="mt-4 overflow-hidden rounded-[20px] border border-white/10">
      <ClientTableToolbar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search kit distribution..."
        resultCount={filteredCandidates.length}
        onClear={() => {
          setSearchTerm("");
          setStatusFilter("");
        }}
      >
        <FilterControl label="Status" value={statusFilter} onChange={setStatusFilter} options={["Completed", "Partial", "Pending"]} />
        <TableExportActions
          moduleName="Kit Distribution"
          fileName="kit_distribution"
          columns={exportColumns}
          rows={filteredCandidates}
          company={{ name: "Pantiss ERP", logo: "/activity.png" }}
        />
      </ClientTableToolbar>
      <div className="overflow-auto" style={{ maxHeight: "clamp(240px, calc(100vh - 420px), 420px)" }}>
        <table className="w-full min-w-[1340px] text-left text-sm">
          <thead className="sticky top-0 z-10 bg-[#0f172a] text-xs uppercase tracking-[0.16em] text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Student</th>
              <th className="px-4 py-3 font-medium">Project</th>
              <th className="px-4 py-3 font-medium">Center</th>
              <th className="px-4 py-3 font-medium">Batch</th>
              <th className="px-4 py-3 font-medium">Job Role</th>
              {KIT_ITEM_CONFIG.map((item) => (
                <th key={item.key} className="px-4 py-3 font-medium">{item.label}</th>
              ))}
              <th className="px-4 py-3 font-medium">Issued On</th>
              <th className="px-4 py-3 font-medium">Proof Image</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {filteredCandidates.map((candidate) => (
              <tr key={candidate.id} className="align-top transition hover:bg-violet-500/[0.06]">
                <td className="px-4 py-4">
                  <p className="font-medium text-white">{candidate.name}</p>
                  <p className="mt-1 text-xs text-slate-500">{candidate.candidateCode}</p>
                </td>
                <td className="px-4 py-4 text-slate-300">{project.name}</td>
                <td className="px-4 py-4 text-slate-300">{center.name}</td>
                <td className="px-4 py-4"><BatchPill label={candidate.batchLabel || batchLabel} /></td>
                <td className="px-4 py-4 text-slate-300">{candidate.jobRole}</td>
                {KIT_ITEM_CONFIG.map((item) => (
                  <td key={item.key} className="px-4 py-4">
                    <span className="inline-flex items-center gap-2 text-xs font-semibold text-slate-300">
                      <span className={`h-2.5 w-2.5 rounded-full ${candidate.issued[item.key] ? "bg-emerald-400" : "bg-slate-500"}`} />
                      <span className={candidate.issued[item.key] ? "text-emerald-300" : "text-slate-500"}>
                        {candidate.issued[item.key] ? "Issued" : "Pending"}
                      </span>
                    </span>
                  </td>
                ))}
                <td className="px-4 py-4 text-slate-300">{candidate.kitIssued ? formatDate(candidate.kitIssuedOn) : "—"}</td>
                <td className="px-4 py-4">
                  {candidate.proofImage ? (
                    <div className="flex min-w-48 items-center gap-3">
                      <img
                        src={candidate.proofImage}
                        alt=""
                        className="h-12 w-12 rounded-lg border border-white/10 object-cover"
                      />
                      <p className="max-w-36 truncate text-xs font-semibold text-white/80">{candidate.proofImageName}</p>
                    </div>
                  ) : (
                    <span className="text-xs font-semibold text-slate-500">Not uploaded</span>
                  )}
                </td>
                <td className="px-4 py-4">
                  <StatusPill status={candidate.status === "Completed" ? "Approved" : candidate.status} />
                </td>
              </tr>
            ))}
            {!filteredCandidates.length && (
              <tr>
                <td colSpan={11} className="px-4 py-12 text-center text-sm font-semibold text-slate-500">
                  No kit records match the current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ClientPlacementRoster({ candidates, project, batchLabel }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [companyFilter, setCompanyFilter] = useState("");
  const [verificationFilter, setVerificationFilter] = useState("");
  const [docFilter, setDocFilter] = useState("");
  const placedCandidates = candidates.filter((candidate) => candidate.placementStatus === "Placed");
  const companyOptions = useMemo(() => Array.from(new Set(placedCandidates.map((candidate) => candidate.company))).sort(), [placedCandidates]);
  const filteredCandidates = useMemo(
    () =>
      placedCandidates.filter((candidate) => {
        const query = searchTerm.trim().toLowerCase();
        const hasAllDocs = candidate.hasOfferLetter && candidate.hasM1 && candidate.hasM2 && candidate.hasM3 && candidate.hasBankStatement;
        const matchesSearch =
          !query ||
          candidate.name.toLowerCase().includes(query) ||
          candidate.candidateCode.toLowerCase().includes(query) ||
          candidate.company.toLowerCase().includes(query) ||
          candidate.designation.toLowerCase().includes(query);
        const matchesCompany = !companyFilter || candidate.company === companyFilter;
        const matchesVerification = !verificationFilter || (verificationFilter === "Verified" ? candidate.isVerified : !candidate.isVerified);
        const matchesDocs = !docFilter || (docFilter === "complete" ? hasAllDocs : !hasAllDocs);

        return matchesSearch && matchesCompany && matchesVerification && matchesDocs;
      }),
    [companyFilter, docFilter, placedCandidates, searchTerm, verificationFilter]
  );
  const exportColumns = useMemo(
    () => [
      { key: "name", header: "Student Name" },
      { key: "candidateCode", header: "Candidate Code" },
      { key: "projectName", header: "Project", exportValue: () => project.name },
      { key: "batchLabel", header: "Batch", exportValue: (candidate) => candidate.batchLabel || batchLabel },
      { key: "company", header: "Company" },
      { key: "designation", header: "Designation" },
      { key: "salary", header: "Salary", type: "currency" },
      { key: "joiningDate", header: "Joining Date", type: "date" },
      { key: "offer", header: "Offer Letter", exportValue: (candidate) => (candidate.hasOfferLetter ? "Available" : "Missing") },
      { key: "m1", header: "M1", exportValue: (candidate) => (candidate.hasM1 ? "Available" : "Missing") },
      { key: "m2", header: "M2", exportValue: (candidate) => (candidate.hasM2 ? "Available" : "Missing") },
      { key: "m3", header: "M3", exportValue: (candidate) => (candidate.hasM3 ? "Available" : "Missing") },
      { key: "bank", header: "Bank Statement", exportValue: (candidate) => (candidate.hasBankStatement ? "Available" : "Missing") },
      { key: "verification", header: "Status", exportValue: (candidate) => (candidate.isVerified ? "Verified" : "Pending") },
    ],
    [batchLabel, project.name]
  );

  if (!placedCandidates.length) {
    return (
      <div className="mt-6 flex flex-col items-center justify-center rounded-[20px] border border-white/10 bg-black/20 py-16 text-center">
        <Briefcase size={32} className="text-slate-600" />
        <p className="mt-4 text-base font-medium text-slate-300">No placements recorded yet</p>
        <p className="mt-2 text-sm text-slate-500">Candidates who get placed will appear here with their placement details.</p>
      </div>
    );
  }

  return (
    <div className="mt-4 overflow-hidden rounded-[20px] border border-white/10">
      <ClientTableToolbar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search placements..."
        resultCount={filteredCandidates.length}
        onClear={() => {
          setSearchTerm("");
          setCompanyFilter("");
          setVerificationFilter("");
          setDocFilter("");
        }}
      >
        <FilterControl label="Company" value={companyFilter} onChange={setCompanyFilter} options={companyOptions} />
        <FilterControl label="Verification" value={verificationFilter} onChange={setVerificationFilter} options={["Verified", "Pending"]} />
        <FilterControl
          label="Docs"
          value={docFilter}
          onChange={setDocFilter}
          options={[
            { label: "Complete Docs", value: "complete" },
            { label: "Missing Docs", value: "missing" },
          ]}
        />
        <TableExportActions
          moduleName="Placements"
          fileName="placements_report"
          columns={exportColumns}
          rows={filteredCandidates}
          company={{ name: "Pantiss ERP", logo: "/activity.png" }}
        />
      </ClientTableToolbar>
      <div className="overflow-auto" style={{ maxHeight: "clamp(240px, calc(100vh - 420px), 420px)" }}>
        <table className="w-full min-w-[1280px] text-left text-sm">
          <thead className="sticky top-0 z-10 bg-[#0f172a] text-xs uppercase tracking-[0.16em] text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Student Name</th>
              <th className="px-4 py-3 font-medium">Project</th>
              <th className="px-4 py-3 font-medium">Batch</th>
              <th className="px-4 py-3 font-medium">Company</th>
              <th className="px-4 py-3 font-medium">Designation</th>
              <th className="px-4 py-3 font-medium">Salary</th>
              <th className="px-4 py-3 font-medium">Joining Date</th>
              <th className="px-4 py-3 font-medium">Offer Letter</th>
              <th className="px-4 py-3 font-medium">M1</th>
              <th className="px-4 py-3 font-medium">M2</th>
              <th className="px-4 py-3 font-medium">M3</th>
              <th className="px-4 py-3 font-medium">Bank Stmt</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {filteredCandidates.map((candidate) => (
              <tr key={candidate.id} className="align-top transition hover:bg-violet-500/[0.06]">
                <td className="px-4 py-4">
                  <p className="font-medium text-white">{candidate.name}</p>
                  <p className="mt-1 text-xs text-slate-500">{candidate.candidateCode}</p>
                </td>
                <td className="px-4 py-4 text-slate-300">{project.name}</td>
                <td className="px-4 py-4">
                  <span className="rounded-full border border-violet-400/20 bg-violet-500/10 px-2.5 py-1 text-xs font-semibold text-violet-200">
                    {candidate.batchLabel || batchLabel}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <p className="font-medium text-white">{candidate.company}</p>
                </td>
                <td className="px-4 py-4 text-slate-300">{candidate.designation}</td>
                <td className="px-4 py-4">
                  <span className="font-semibold text-emerald-300">₹{formatNumber(candidate.salary)}</span>
                  <p className="mt-1 text-xs text-slate-500">/month</p>
                </td>
                <td className="px-4 py-4 text-slate-300">{candidate.joiningDate ? formatDate(candidate.joiningDate) : "—"}</td>
                <td className="px-4 py-4"><DocBadge available={candidate.hasOfferLetter} label="Offer" /></td>
                <td className="px-4 py-4"><DocBadge available={candidate.hasM1} label="M1" /></td>
                <td className="px-4 py-4"><DocBadge available={candidate.hasM2} label="M2" /></td>
                <td className="px-4 py-4"><DocBadge available={candidate.hasM3} label="M3" /></td>
                <td className="px-4 py-4"><DocBadge available={candidate.hasBankStatement} label="Bank" /></td>
                <td className="px-4 py-4">
                  <span className={`text-xs font-semibold ${candidate.isVerified ? "text-emerald-300" : "text-slate-500"}`}>
                    {candidate.isVerified ? "Verified" : "Pending"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function DocBadge({ available, label }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${
        available
          ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
          : "border-slate-500/20 bg-slate-500/10 text-slate-500"
      }`}
    >
      {available ? <Eye size={10} /> : <X size={10} />}
      {label}
    </span>
  );
}

function BatchPill({ label }) {
  return (
    <span className="rounded-full border border-violet-400/20 bg-violet-500/10 px-2.5 py-1 text-xs font-semibold text-violet-200">
      {label}
    </span>
  );
}

function ClientOperationsEvidenceSections({ project, center }) {
  const placementDrives = useMemo(() => buildClientPlacementDrives(project, center), [project, center]);
  const exposureVisits = useMemo(() => buildClientExposureVisits(project, center), [project, center]);
  const [selectedEvidence, setSelectedEvidence] = useState(null);

  return (
    <>
      <section className="grid gap-5 xl:grid-cols-2">
        <ClientPlacementDrivesTable drives={placementDrives} project={project} center={center} onView={setSelectedEvidence} />
        <ClientExposureVisitsTable visits={exposureVisits} project={project} center={center} onView={setSelectedEvidence} />
      </section>
      <ClientEvidenceOverlay evidence={selectedEvidence} onClose={() => setSelectedEvidence(null)} />
    </>
  );
}

const CLIENT_EVIDENCE_IMAGE_POOL = [1, 2, 3, 4, 5, 6, 7, 9, 11];

const CLIENT_POPUP_THEME = {
  drawerBorder: "border-violet-500/25",
  icon: "border-violet-400/25 bg-violet-500/10 text-violet-200",
  mediaCard: "border-violet-400/20 bg-violet-500/[0.04]",
  downloadHover: "hover:border-violet-400/35 hover:bg-violet-500/15",
  sectionLabel: "text-violet-300",
  chip: "border-violet-400/20 bg-violet-500/10 text-violet-200",
};

function buildClientEvidenceMedia(prefix, index, month, dayStart) {
  const firstImage = CLIENT_EVIDENCE_IMAGE_POOL[(index * 2) % CLIENT_EVIDENCE_IMAGE_POOL.length];
  const secondImage = CLIENT_EVIDENCE_IMAGE_POOL[(index * 2 + 1) % CLIENT_EVIDENCE_IMAGE_POOL.length];
  const thirdImage = CLIENT_EVIDENCE_IMAGE_POOL[(index * 2 + 2) % CLIENT_EVIDENCE_IMAGE_POOL.length];
  const videoPreview = CLIENT_EVIDENCE_IMAGE_POOL[(index * 2 + 4) % CLIENT_EVIDENCE_IMAGE_POOL.length];

  return [
    {
      id: `${prefix}-photo-1`,
      label: "Geo-tagged Photo 1",
      type: "image",
      src: `/images/client-gallery/${firstImage}.png`,
      uploadedOn: `2026-${String(month).padStart(2, "0")}-${String(dayStart).padStart(2, "0")}`,
    },
    {
      id: `${prefix}-photo-2`,
      label: "Geo-tagged Photo 2",
      type: "image",
      src: `/images/client-gallery/${secondImage}.png`,
      uploadedOn: `2026-${String(month).padStart(2, "0")}-${String(dayStart + 1).padStart(2, "0")}`,
    },
    {
      id: `${prefix}-photo-3`,
      label: "Geo-tagged Photo 3",
      type: "image",
      src: `/images/client-gallery/${thirdImage}.png`,
      uploadedOn: `2026-${String(month).padStart(2, "0")}-${String(dayStart + 1).padStart(2, "0")}`,
    },
    {
      id: `${prefix}-video`,
      label: "Video Walkthrough",
      type: "video",
      src: `/images/client-gallery/${videoPreview}.png`,
      uploadedOn: `2026-${String(month).padStart(2, "0")}-${String(dayStart + 2).padStart(2, "0")}`,
    },
  ];
}

function buildClientPlacementDrives(project, center) {
  const companies = ["Tata Steel", "Jindal Steel", "L&T Construction"];
  const driveTitles = ["Hiring Drive", "Apprenticeship Selection Drive", "Walk-in Interview Drive"];
  return Array.from({ length: 3 }, (_, index) => {
    const batch = center.batches[index % Math.max(center.batches.length, 1)] || {
      label: `Batch ${index + 1}`,
      track: center.jobRoles?.[index % Math.max(center.jobRoles?.length || 1, 1)] || "General Duty Assistant",
      size: 30,
      candidateRecords: [],
      placed: 0,
    };
    const candidates = batch.candidateRecords || [];
    const placed = Math.max(
      candidates.filter((candidate) => candidate.placementStatus === "Placed").length,
      6 + index * 3
    );
    const participated = Math.max(placed + 8, Math.round((batch.size || 30) * (0.62 + index * 0.07)));
    const month = 4 + index;
    const day = 10 + index * 4;
    return {
      id: `${center.id}-DRV-${index + 1}`,
      type: "Placement Drive",
      name: `${companies[index]} ${driveTitles[index]}`,
      company: companies[index % companies.length],
      batch: batch.label,
      jobRole: batch.track,
      date: `2026-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
      participated,
      selected: placed,
      status: "Completed",
      documents: ["Employer invitation", "Attendance sheet", "Selection list"],
      mediaUploads: buildClientEvidenceMedia(`drive-${index + 1}`, index, month, day + 1),
    };
  }).filter((drive) => drive.status === "Completed" && drive.mediaUploads?.length);
}

function buildClientExposureVisits(project, center) {
  const locations = ["Industrial safety lab", "Manufacturing unit", "Employer workshop"];
  const visitNames = ["Safety Practice Exposure Visit", "Production Line Exposure Visit", "Employer Readiness Visit"];
  return Array.from({ length: 3 }, (_, index) => {
    const batch = center.batches[index % Math.max(center.batches.length, 1)] || {
      label: `Batch ${index + 1}`,
      track: center.jobRoles?.[index % Math.max(center.jobRoles?.length || 1, 1)] || "General Duty Assistant",
      size: 30,
      candidateRecords: [],
    };
    const month = 3 + index;
    const day = 8 + index * 5;

    return {
      id: `${center.id}-EXV-${index + 1}`,
      type: "Exposure Visit",
      title: visitNames[index],
      name: visitNames[index],
      location: locations[index],
      batch: batch.label,
      jobRole: batch.track,
      date: `2026-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
      participants: Math.round((batch.size || 30) * (0.78 + (index % 2) * 0.06)),
      trainer: batch.candidateRecords?.[0]?.mobilizer || center.manager,
      status: "Completed",
      documents: ["Visit plan", "Attendance sheet", "Photo evidence"],
      mediaUploads: buildClientEvidenceMedia(`visit-${index + 1}`, index + 3, month, day + 1),
    };
  }).filter((visit) => visit.status === "Completed" && visit.mediaUploads?.length);
}

function ClientPlacementDrivesTable({ drives, project, center, onView }) {
  const exportColumns = useMemo(
    () => [
      { key: "name", header: "Drive" },
      { key: "company", header: "Company" },
      { key: "batch", header: "Batch" },
      { key: "jobRole", header: "Job Role" },
      { key: "date", header: "Date", type: "date" },
      { key: "participated", header: "Participated", type: "number" },
      { key: "selected", header: "Selected", type: "number" },
      { key: "status", header: "Status" },
    ],
    []
  );

  return (
    <section className="overflow-hidden rounded-3xl border border-violet-200/10 bg-[#12071f]/80 shadow-xl shadow-black/20">
      <div className="grid gap-4 border-b border-white/10 p-5 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-start">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-300">Placement Drives</p>
          <h2 className="mt-2 text-xl font-semibold text-white">{center.name}</h2>
        </div>
        <div className="flex justify-start xl:justify-end">
          <TableExportActions moduleName="Placement Drives" fileName={`${project.name}_placement_drives`} columns={exportColumns} rows={drives} company={{ name: "Pantiss ERP", logo: "/activity.png" }} />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[940px] text-left text-sm">
          <thead className="bg-[#0f172a] text-xs uppercase tracking-[0.16em] text-slate-500">
            <tr>
              {["Drive", "Job Role", "Company", "Batch", "Date", "Participated", "Selected", "Uploads", "Status", "Action"].map((header) => (
                <th key={header} className={`px-4 py-3 font-medium ${header === "Drive" ? "w-[280px]" : ""}`}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {drives.map((drive) => (
              <tr key={drive.id} className="align-top transition hover:bg-violet-500/[0.06]">
                <td className="w-[280px] px-4 py-4">
                  <p className="font-medium text-white">{drive.name}</p>
                </td>
                <td className="px-4 py-4 text-slate-300">{drive.jobRole}</td>
                <td className="px-4 py-4 text-slate-300">{drive.company}</td>
                <td className="px-4 py-4"><BatchPill label={drive.batch} /></td>
                <td className="px-4 py-4 text-slate-300">{formatDate(drive.date)}</td>
                <td className="px-4 py-4 text-white">{drive.participated}</td>
                <td className="px-4 py-4 text-emerald-300">{drive.selected}</td>
                <td className="px-4 py-4">
                  <MediaChips media={drive.mediaUploads} />
                </td>
                <td className="px-4 py-4"><StatusPill status={drive.status === "Completed" ? "Approved" : "Pending"} /></td>
                <td className="px-4 py-4">
                  <button
                    type="button"
                    onClick={() => onView({ ...drive, projectName: project.name, centerName: center.name })}
                    className="inline-flex items-center gap-2 rounded-lg border border-violet-400/25 bg-violet-500/10 px-3 py-2 text-xs font-semibold text-violet-100 transition hover:border-violet-300/50 hover:bg-violet-500/20"
                  >
                    <Eye size={14} />
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function ClientExposureVisitsTable({ visits, project, center, onView }) {
  const exportColumns = useMemo(
    () => [
      { key: "title", header: "Visit" },
      { key: "batch", header: "Batch" },
      { key: "jobRole", header: "Job Role" },
      { key: "date", header: "Date", type: "date" },
      { key: "participants", header: "Participants", type: "number" },
      { key: "trainer", header: "Coordinator" },
      { key: "status", header: "Status" },
    ],
    []
  );

  return (
    <section className="overflow-hidden rounded-3xl border border-violet-200/10 bg-[#12071f]/80 shadow-xl shadow-black/20">
      <div className="grid gap-4 border-b border-white/10 p-5 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-start">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-300">Exposure Visits</p>
          <h2 className="mt-2 text-xl font-semibold text-white">{center.name}</h2>
        </div>
        <div className="flex justify-start xl:justify-end">
          <TableExportActions moduleName="Exposure Visits" fileName={`${project.name}_exposure_visits`} columns={exportColumns} rows={visits} company={{ name: "Pantiss ERP", logo: "/activity.png" }} />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[920px] text-left text-sm">
          <thead className="bg-[#0f172a] text-xs uppercase tracking-[0.16em] text-slate-500">
            <tr>
              {["Visit", "Job Role", "Batch", "Date", "Participants", "Coordinator", "Uploads", "Status", "Action"].map((header) => (
                <th key={header} className={`px-4 py-3 font-medium ${header === "Visit" ? "w-[280px]" : ""}`}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {visits.map((visit) => (
              <tr key={visit.id} className="align-top transition hover:bg-violet-500/[0.06]">
                <td className="w-[280px] px-4 py-4">
                  <p className="font-medium text-white">{visit.title}</p>
                </td>
                <td className="px-4 py-4 text-slate-300">{visit.jobRole}</td>
                <td className="px-4 py-4"><BatchPill label={visit.batch} /></td>
                <td className="px-4 py-4 text-slate-300">{formatDate(visit.date)}</td>
                <td className="px-4 py-4 text-white">{visit.participants}</td>
                <td className="px-4 py-4 text-slate-300">{visit.trainer}</td>
                <td className="px-4 py-4"><MediaChips media={visit.mediaUploads} /></td>
                <td className="px-4 py-4"><StatusPill status={visit.status === "Completed" ? "Approved" : "Pending"} /></td>
                <td className="px-4 py-4">
                  <button
                    type="button"
                    onClick={() => onView({ ...visit, projectName: project.name, centerName: center.name })}
                    className="inline-flex items-center gap-2 rounded-lg border border-violet-400/25 bg-violet-500/10 px-3 py-2 text-xs font-semibold text-violet-100 transition hover:border-violet-300/50 hover:bg-violet-500/20"
                  >
                    <Eye size={14} />
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function MediaChips({ media }) {
  return (
    <div className="flex min-w-[132px] items-center pl-1">
      {media.map((item, index) => (
        <span
          key={item.id}
          title={item.label}
          className="relative inline-flex h-8 w-12 items-center justify-center rounded-lg border border-violet-400/25 bg-[#24113d] text-[10px] font-black text-violet-100 shadow-[0_8px_18px_rgba(0,0,0,0.22)] ring-2 ring-[#12071f]"
          style={{ marginLeft: index ? "-10px" : 0, zIndex: media.length - index }}
        >
          <FileText size={12} />
          <span className="ml-1">{item.type === "video" ? "V" : "I"}</span>
        </span>
      ))}
      <span className="ml-2 rounded-full border border-white/10 bg-white/[0.04] px-2 py-1 text-[11px] font-semibold text-slate-400">
        {media.length} files
      </span>
    </div>
  );
}

function ClientEvidenceOverlay({ evidence, onClose }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!evidence) {
      setVisible(false);
      return undefined;
    }

    const frame = requestAnimationFrame(() => setVisible(true));
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      cancelAnimationFrame(frame);
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [evidence, onClose]);

  if (!evidence || typeof document === "undefined") return null;

  const media = evidence.mediaUploads || [];
  const title = evidence.name || evidence.title;
  const latestUpload = media
    .map((item) => item.uploadedOn)
    .filter(Boolean)
    .sort()
    .at(-1);
  const theme = CLIENT_POPUP_THEME;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex justify-end" onClick={onClose}>
      <div
        className={`absolute inset-0 bg-black/50 backdrop-blur-[3px] transition-opacity duration-200 ${
          visible ? "opacity-100" : "opacity-0"
        }`}
      />
      <aside
        className={`relative flex h-full w-full max-w-[620px] flex-col border-l ${theme.drawerBorder} bg-[#080d1a] text-white shadow-[-24px_0_70px_rgba(0,0,0,0.55)] transition-transform duration-300 ease-out ${
          visible ? "translate-x-0" : "translate-x-full"
        }`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 border-b border-white/10 bg-[#0b1220] px-5 py-4">
          <div className="min-w-0">
            <h3 className="truncate text-2xl font-semibold text-white">{title}</h3>
            <p className="mt-1 truncate text-sm text-slate-400">
              {evidence.projectName} • {evidence.centerName}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-white/10 bg-white/[0.05] text-slate-400 transition hover:bg-white/[0.1] hover:text-white"
            aria-label="Close evidence review"
          >
            <X size={18} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto bg-[#070b16]">
          <div className="p-5">
            <div className="grid gap-4">
              {media.map((item) => (
                <figure key={item.id} className={`overflow-hidden rounded-2xl border p-3 ${theme.mediaCard}`}>
                  <div className="relative flex min-h-[260px] items-center justify-center overflow-hidden rounded-xl bg-slate-950">
                    <img
                      src={item.src}
                      alt={`${item.label || title} preview`}
                      className="max-h-[48vh] w-auto max-w-full object-contain"
                    />
                    {item.type === "video" ? (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                        <span className="inline-flex h-14 w-14 items-center justify-center rounded-full border border-white/30 bg-black/45 text-base font-black text-white backdrop-blur">
                          ▶
                        </span>
                      </div>
                    ) : null}
                    <a
                      href={item.src}
                      download
                      className={`absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/15 bg-black/45 text-white backdrop-blur transition ${theme.downloadHover}`}
                      aria-label={`Download ${item.label}`}
                    >
                      <Download size={15} />
                    </a>
                  </div>
                  <figcaption className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm">
                    <span className="font-semibold text-white">{item.label}</span>
                    <span className="text-xs font-medium text-slate-400">{formatDate(item.uploadedOn)}</span>
                  </figcaption>
                </figure>
              ))}
              {!media.length ? (
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 text-sm text-slate-400">
                  No uploaded media available for this event.
                </div>
              ) : null}
            </div>

            <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <div className={`mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] ${theme.sectionLabel}`}>
                <FileText size={14} />
                Event details
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <ClientGalleryMetaRow label="Evidence type" value={evidence.type} />
                <ClientGalleryMetaRow label="Batch" value={evidence.batch} />
                <ClientGalleryMetaRow label="Job role" value={evidence.jobRole} />
                <ClientGalleryMetaRow label="Completed on" value={formatDate(evidence.date)} />
                <ClientGalleryMetaRow label="Uploaded files" value={`${media.length} files`} />
                <ClientGalleryMetaRow label="Latest upload" value={latestUpload ? formatDate(latestUpload) : "-"} />
                <ClientGalleryMetaRow label="Status" value="Completed with media upload" />
                {evidence.company ? <ClientGalleryMetaRow label="Company" value={evidence.company} /> : null}
                {evidence.location ? <ClientGalleryMetaRow label="Location" value={evidence.location} /> : null}
                {evidence.trainer ? <ClientGalleryMetaRow label="Coordinator" value={evidence.trainer} /> : null}
              </div>
            </div>

            <div className="mt-5 rounded-xl border border-white/10 bg-white/[0.04] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Documents</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {(evidence.documents || []).map((document) => (
                  <span key={document} className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-semibold ${theme.chip}`}>
                    <FileText size={13} />
                    {document}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-white/10 bg-[#0b1220] px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-white/10 bg-white/[0.05] px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-white/[0.1] hover:text-white"
          >
            Close
          </button>
        </div>
      </aside>
    </div>,
    document.body
  );
}

function StatusPill({ status }) {
  const tone =
    status === "Placed" || status === "Certified" || status === "Approved"
      ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-300"
      : status === "Pending" || status === "Assessment Due" || status === "Employer Mapped"
        ? "border-amber-400/20 bg-amber-500/10 text-amber-300"
        : "border-violet-400/20 bg-violet-500/10 text-violet-200";

  return <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${tone}`}>{status}</span>;
}

const CLIENT_GALLERY_ASSETS = [
  {
    src: "/images/client-gallery/1.png",
    title: "Enrollment documentation",
    category: "Enrollment",
    stage: "Mobilization",
  },
  {
    src: "/images/client-gallery/2.png",
    title: "Classroom delivery",
    category: "Training",
    stage: "Learning",
  },
  {
    src: "/images/client-gallery/3.png",
    title: "Practical lab session",
    category: "Training",
    stage: "Assessment",
  },
  {
    src: "/images/client-gallery/4.png",
    title: "Candidate counselling",
    category: "Enrollment",
    stage: "Verification",
  },
  {
    src: "/images/client-gallery/5.png",
    title: "Employer connect",
    category: "Placements",
    stage: "Interview",
  },
  {
    src: "/images/client-gallery/6.png",
    title: "Certification review",
    category: "Compliance",
    stage: "Evidence",
  },
  {
    src: "/images/client-gallery/7.png",
    title: "Placement readiness",
    category: "Placements",
    stage: "Readiness",
  },
  {
    src: "/images/client-gallery/9.png",
    title: "Center operations",
    category: "Compliance",
    stage: "Monitoring",
  },
  {
    src: "/images/client-gallery/11.png",
    title: "Field visit documentation",
    category: "Training",
    stage: "Review",
  },
];

function buildClientGalleryItems(project, center) {
  return CLIENT_GALLERY_ASSETS.map((asset, index) => ({
    ...asset,
    id: `${project.id}-${center.id}-client-gallery-${index}`,
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
      new Date(
        2026,
        (index + center.name.length) % 12,
        4 + ((index * 3 + center.location.length) % 21)
      )
        .toISOString()
        .slice(0, 10)
    ),
  }));
}

function CenterGallery({ project, center }) {
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedItem, setSelectedItem] = useState(null);
  const galleryItems = useMemo(
    () => buildClientGalleryItems(project, center),
    [project, center]
  );
  const categories = useMemo(
    () => ["All", ...Array.from(new Set(galleryItems.map((item) => item.category)))],
    [galleryItems]
  );
  const visibleItems = useMemo(
    () =>
      activeCategory === "All"
        ? galleryItems
        : galleryItems.filter((item) => item.category === activeCategory),
    [activeCategory, galleryItems]
  );

  return (
    <section className="rounded-3xl border border-violet-200/10 bg-[#12071f]/80 p-5 shadow-xl shadow-black/20">
      <div className="mb-5 flex flex-col gap-4 border-b border-violet-200/10 pb-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1 text-xs font-semibold text-violet-200">
            <Sparkles size={14} />
            Project gallery
          </div>
          <h2 className="mt-3 text-2xl font-semibold text-white">Report Evidence Gallery</h2>
          <p className="mt-1 text-sm text-white/45">
            {project.name} • {center.name}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setActiveCategory(category)}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                activeCategory === category
                  ? "border-violet-400/40 bg-violet-500 text-white"
                  : "border-white/10 bg-white/[0.04] text-slate-300 hover:bg-white/[0.08]"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {visibleItems.map((item) => (
          <button
            type="button"
            key={item.id}
            onClick={() => setSelectedItem(item)}
            className="group relative h-64 overflow-hidden rounded-[20px] border border-white/10 bg-black/20 text-left shadow-[0_18px_50px_rgba(2,6,23,0.28)] transition hover:-translate-y-0.5 hover:border-violet-400/40 focus:outline-none focus:ring-2 focus:ring-violet-300/50 sm:h-60 xl:h-56"
          >
            <img
              src={item.src}
              alt={`${item.title} for ${item.centerName}`}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              loading="lazy"
            />
            <span className="absolute left-3 top-3 rounded-full border border-black/20 bg-black/45 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur">
              {item.category}
            </span>
            <span className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-black/40 text-white opacity-0 backdrop-blur transition group-hover:opacity-100">
              <Eye size={15} />
            </span>
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent p-4">
              <p className="text-sm font-semibold text-white">{item.title}</p>
              <p className="mt-1 text-xs text-slate-300">
                {item.stage} • {item.capturedOn}
              </p>
            </div>
          </button>
        ))}
      </div>

      <ClientGalleryDrawer item={selectedItem} onClose={() => setSelectedItem(null)} />
    </section>
  );
}

function ClientGalleryDrawer({ item, onClose }) {
  const [visible, setVisible] = useState(false);
  const theme = CLIENT_POPUP_THEME;

  useEffect(() => {
    if (!item) {
      setVisible(false);
      return undefined;
    }

    const frame = requestAnimationFrame(() => setVisible(true));
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      cancelAnimationFrame(frame);
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [item, onClose]);

  if (!item || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex justify-end" onClick={onClose}>
      <div
        className={`absolute inset-0 bg-black/45 backdrop-blur-[2px] transition-opacity duration-200 ${
          visible ? "opacity-100" : "opacity-0"
        }`}
      />
      <div
        className={`relative flex h-full w-full max-w-[560px] flex-col border-l ${theme.drawerBorder} bg-[#080d1a] text-white shadow-[-24px_0_70px_rgba(0,0,0,0.55)] transition-transform duration-300 ease-out ${
          visible ? "translate-x-0" : "translate-x-full"
        }`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 border-b border-white/10 bg-[#0b1220] px-5 py-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border ${theme.icon}`}>
              <Eye size={18} />
            </div>
            <div className="min-w-0">
              <h3 className="truncate text-xl font-semibold text-white">{item.title}</h3>
              <p className="mt-0.5 truncate text-xs text-slate-400">
                {item.projectName} • {item.centerName}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <a
              href={item.src}
              download
              className={`inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.05] px-3 text-xs font-semibold text-slate-200 transition ${theme.downloadHover} hover:text-white`}
            >
              <Download size={14} />
              Download
            </a>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-white/10 bg-white/[0.05] text-slate-400 transition hover:bg-white/[0.1] hover:text-white"
              aria-label="Close gallery preview"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto bg-[#070b16]">
          <div className="p-5">
            <div className="flex min-h-[320px] items-center justify-center rounded-xl border border-white/10 bg-black/25 p-3">
              <img
                src={item.src}
                alt={`${item.title} preview`}
                className="max-h-[52vh] w-auto max-w-full rounded-lg object-contain shadow-[0_18px_45px_rgba(0,0,0,0.35)]"
              />
            </div>
          </div>

          <div className="border-t border-white/10 bg-[#080d1a] p-5">
            <div className={`mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] ${theme.sectionLabel}`}>
              <FileText size={14} />
              Event details
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <ClientGalleryMetaRow label="Captured on" value={item.capturedOn} />
              <ClientGalleryMetaRow label="Category" value={item.category} />
              <ClientGalleryMetaRow label="Location" value={item.location} />
              <ClientGalleryMetaRow label="Captured by" value={item.capturedBy} />
              <ClientGalleryMetaRow label="Project" value={item.projectName} />
              <ClientGalleryMetaRow label="Center" value={item.centerName} />
              <ClientGalleryMetaRow label="Stage" value={item.stage} />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-white/10 bg-[#0b1220] px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-white/10 bg-white/[0.05] px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-white/[0.1] hover:text-white"
          >
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

function ClientGalleryMetaRow({ label, value }) {
  return (
    <div className="rounded-md border border-white/10 bg-white/[0.04] px-3 py-2">
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
        {label}
      </p>
      <p className="mt-1 break-words text-sm font-semibold text-white">{value}</p>
    </div>
  );
}

function ProjectCard({ project }) {
  const summary = getProjectSummary(project);

  return (
    <Link
      to={`/client/projects/${project.id}`}
      className="rounded-3xl border border-violet-200/10 bg-[#12071f]/80 p-5 shadow-xl shadow-black/20 transition hover:border-violet-300/35 hover:bg-violet-500/10"
    >
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-300">
            {project.fundingAgency}
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-white">{project.name}</h2>
          <p className="mt-2 flex items-center gap-2 text-sm text-white/45">
            <CalendarDays size={15} />
            {formatDate(project.startDate)} - {formatDate(project.endDate)}
          </p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-2xl border border-violet-300/20 px-4 py-2 text-sm text-violet-200">
          Open project
          <ArrowUpRight size={16} />
        </span>
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-4">
        <Mini label="Centers" value={summary.centers} />
        <Mini label="Candidates" value={summary.candidates} />
        <Mini label="Attendance" value={`${summary.attendanceRate}%`} />
        <Mini label="Placement" value={`${summary.placementRate}%`} />
      </div>
    </Link>
  );
}

function MetricCard({ icon: Icon, label, value, caption }) {
  return (
    <div className="rounded-3xl border border-violet-200/10 bg-white/[0.04] p-5">
      <Icon size={20} className="mb-4 text-violet-300" />
      <p className="text-2xl font-semibold text-white">{formatNumber(value)}</p>
      <p className="mt-1 text-sm text-white/55">{label}</p>
      <p className="mt-1 text-xs text-white/35">{caption}</p>
    </div>
  );
}

function Mini({ label, value, compact = false }) {
  return (
    <div className={`rounded-2xl border border-white/10 bg-black/20 ${compact ? "px-3 py-2" : "p-4"}`}>
      <p className={`${compact ? "text-sm" : "text-xl"} font-semibold text-white`}>{value}</p>
      <p className="text-xs text-white/40">{label}</p>
    </div>
  );
}

function Progress({ label, value }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-xs">
        <span className="text-white/45">{label}</span>
        <span className="font-semibold text-white">{value}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-400"
          style={{ width: `${Math.min(value, 100)}%` }}
        />
      </div>
    </div>
  );
}

function Health({ value }) {
  return (
    <span className="inline-flex rounded-full border border-violet-300/20 bg-violet-500/10 px-3 py-1 text-xs font-semibold text-violet-200">
      {value}%
    </span>
  );
}

function formatDate(value) {
  return new Date(`${value}T00:00:00`).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatNumber(value) {
  return new Intl.NumberFormat("en-IN").format(value);
}
