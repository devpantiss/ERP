/* ═══════════════════════════════════════════════════════════════
   Fee Collection — Shared Mock Data
   Derives batch-wise fee targets & month-wise entries from SA_PROJECTS
   ═══════════════════════════════════════════════════════════════ */

import { SA_PROJECTS } from "../SuperAdmin/superAdminData";

/* ── Seeded random (isolated from superAdminData's seed) ── */
let _seed = 1337;
function srand() {
  _seed = (_seed * 16807 + 0) % 2147483647;
  return (_seed & 0x7fffffff) / 0x7fffffff;
}
function randInt(min, max) {
  return min + Math.floor(srand() * (max - min + 1));
}
function pick(arr) {
  return arr[Math.floor(srand() * arr.length)];
}

/* ── Fee amounts per job role (monthly per student in ₹) ── */
const FEE_PER_ROLE = {
  Electrical: 1500,
  Fitter: 1400,
  "Solar Technician": 1600,
  "Retail Sales": 1200,
  "Data Entry": 1000,
  Welder: 1500,
  "Safety Officer": 1300,
  "Industrial Electrician": 1600,
  Hospitality: 1100,
  "General Duty Assistant": 1000,
};

const TRAINING_DURATION_MONTHS = 6;

/* ── Build FEE_TARGETS from SA_PROJECTS ── */
export const FEE_TARGETS = SA_PROJECTS.flatMap((project) =>
  project.centers.flatMap((center) =>
    center.batches.map((batch) => {
      const feePerStudent =
        FEE_PER_ROLE[batch.jobRole] || 1200;
      return {
        batchId: batch.id,
        projectId: project.id,
        projectName: project.name,
        centerId: center.id,
        centerName: center.name,
        batchLabel: batch.label,
        jobRole: batch.jobRole,
        trainer: batch.trainer,
        totalStudents: batch.learners,
        feePerStudent,
        trainingDurationMonths: TRAINING_DURATION_MONTHS,
        monthlyTarget: feePerStudent * batch.learners,
        targetAmount: feePerStudent * batch.learners * TRAINING_DURATION_MONTHS,
      };
    })
  )
);

/* ── Training months list (for dropdown) ── */
export const TRAINING_MONTHS = [
  { value: "2026-01", label: "January 2026" },
  { value: "2026-02", label: "February 2026" },
  { value: "2026-03", label: "March 2026" },
  { value: "2026-04", label: "April 2026" },
  { value: "2026-05", label: "May 2026" },
  { value: "2026-06", label: "June 2026" },
];

/* ── Payment modes ── */
export const PAYMENT_MODES = ["Online", "Offline"];

/* ── Generate fee entries ── */
const ONLINE_REFS = ["UPI", "NEFT", "IMPS", "RTGS"];

function generateEntries() {
  const entries = [];
  let counter = 1;

  SA_PROJECTS.forEach((project) => {
    project.centers.forEach((center) => {
      center.batches.forEach((batch) => {
        const feePerStudent = FEE_PER_ROLE[batch.jobRole] || 1200;

        // Generate entries for past months (Jan–May 2026)
        const monthsToSeed = ["2026-01", "2026-02", "2026-03", "2026-04", "2026-05"];

        monthsToSeed.forEach((month) => {
          // ~70-90% of students have paid for past months
          const paidCount = Math.min(
            batch.candidates.length,
            Math.floor(batch.candidates.length * (0.7 + srand() * 0.25))
          );

          for (let i = 0; i < paidCount; i++) {
            const candidate = batch.candidates[i];
            if (!candidate) continue;

            const isOnline = srand() > 0.4;
            const mode = isOnline ? "Online" : "Offline";
            const statuses = ["Verified", "Verified", "Verified", "Pending", "Rejected"];
            const status = pick(statuses);

            const dayNum = randInt(1, 28);
            const enteredOn = `${month}-${String(dayNum).padStart(2, "0")}`;

            entries.push({
              id: `FEE-${String(counter++).padStart(4, "0")}`,
              batchId: batch.id,
              projectName: project.name,
              centerName: center.name,
              batchLabel: batch.label,
              month,
              studentName: candidate.name,
              studentId: candidate.id,
              amount: feePerStudent,
              paymentMode: mode,
              transactionRef: isOnline
                ? `${pick(ONLINE_REFS)}-${randInt(100000000, 999999999)}`
                : `RCP-${randInt(10000, 99999)}`,
              proofFile: srand() > 0.2
                ? {
                    name: isOnline
                      ? `txn_screenshot_${candidate.id}.png`
                      : `receipt_${candidate.id}.pdf`,
                    type: isOnline ? "image/png" : "application/pdf",
                    url: "#",
                    uploadedOn: enteredOn,
                  }
                : null,
              status,
              enteredBy: "Admin",
              enteredOn,
            });
          }
        });
      });
    });
  });

  return entries;
}

export const FEE_ENTRIES = generateEntries();

/* ── Helper: get entries for a batch + month ── */
export function getEntriesForBatchMonth(batchId, month) {
  return FEE_ENTRIES.filter(
    (e) => e.batchId === batchId && e.month === month
  );
}

/* ── Helper: compute batch collection summary for a month ── */
export function getBatchMonthSummary(batchId, month) {
  const target = FEE_TARGETS.find((t) => t.batchId === batchId);
  if (!target) return null;

  const entries = getEntriesForBatchMonth(batchId, month);
  const verified = entries.filter((e) => e.status === "Verified");
  const pending = entries.filter((e) => e.status === "Pending");

  return {
    batchId,
    month,
    monthlyTarget: target.monthlyTarget,
    totalCollected: verified.reduce((sum, e) => sum + e.amount, 0),
    pendingAmount: pending.reduce((sum, e) => sum + e.amount, 0),
    studentsPaid: entries.length,
    studentsVerified: verified.length,
    totalStudents: target.totalStudents,
    collectionRate:
      target.monthlyTarget > 0
        ? Math.round(
            (verified.reduce((sum, e) => sum + e.amount, 0) /
              target.monthlyTarget) *
              100
          )
        : 0,
  };
}

/* ── Helper: compute overall stats across all batches for a month ── */
export function getOverallMonthStats(month) {
  let totalTarget = 0;
  let totalCollected = 0;
  let totalPending = 0;
  let overdueBatches = 0;

  FEE_TARGETS.forEach((target) => {
    const summary = getBatchMonthSummary(target.batchId, month);
    if (!summary) return;
    totalTarget += summary.monthlyTarget;
    totalCollected += summary.totalCollected;
    totalPending += summary.pendingAmount;
    if (summary.collectionRate < 50) overdueBatches++;
  });

  return {
    totalTarget,
    totalCollected,
    totalPending,
    overdueBatches,
    collectionRate:
      totalTarget > 0 ? Math.round((totalCollected / totalTarget) * 100) : 0,
  };
}

/* ── Helper: compute project-level summary for a month ── */
export function getProjectSummary(projectId, month) {
  const projectTargets = FEE_TARGETS.filter((t) => t.projectId === projectId);
  let totalTarget = 0;
  let totalCollected = 0;
  let batchCount = 0;
  let centerNames = new Set();

  projectTargets.forEach((target) => {
    const summary = getBatchMonthSummary(target.batchId, month);
    if (!summary) return;
    totalTarget += summary.monthlyTarget;
    totalCollected += summary.totalCollected;
    batchCount++;
    centerNames.add(target.centerName);
  });

  return {
    projectId,
    month,
    totalTarget,
    totalCollected,
    batchCount,
    centerCount: centerNames.size,
    centers: [...centerNames].join(", "),
    collectionRate:
      totalTarget > 0 ? Math.round((totalCollected / totalTarget) * 100) : 0,
  };
}
