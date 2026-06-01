/* ═══════════════════════════════════════════════════════════════
   AUDIT TRAIL HELPERS
   Build timeline entries from different approval data shapes.
   Each function returns: [{ action, actor, timestamp, note? }]
   ═══════════════════════════════════════════════════════════════ */

// ── Generic Approvals (AdminApprovals hub) ──────────────────────
export function buildGenericApprovalAuditTrail(request) {
  const trail = [];
  const person = request.trainer || request.mobilizer || request.officer || "Employee";

  trail.push({
    action: "Submitted",
    actor: person,
    timestamp: request.submittedOn || "-",
    note: request.requestType ? `Request type: ${request.requestType}` : undefined,
  });

  if (request.status === "Reviewed" || request.status === "Approved") {
    trail.push({
      action: "Reviewed",
      actor: "Admin",
      timestamp: request.reviewedOn || request.submittedOn || "-",
    });
  }

  if (request.status === "Approved") {
    trail.push({
      action: "Approved",
      actor: "Admin",
      timestamp: request.approvedOn || request.submittedOn || "-",
      note: request.remarks || undefined,
    });
  }

  return trail;
}

// ── Leave Approvals ─────────────────────────────────────────────
export function buildLeaveAuditTrail(request) {
  const trail = [];

  trail.push({
    action: "Submitted",
    actor: request.employee || "Employee",
    timestamp: request.appliedOn || "-",
    note: `${request.type || "Leave"} — ${request.days || 0} day(s). Reason: ${request.reason || "Not specified"}`,
  });

  if (
    request.status === "Pending Super Admin Review" ||
    request.status === "Approved" ||
    request.status === "Rejected"
  ) {
    const isAdminReject = request.status === "Rejected" && request.adminRejectionReason;
    const isAdminApprove =
      request.status === "Pending Super Admin Review" ||
      request.status === "Approved" ||
      (request.status === "Rejected" && !request.adminRejectionReason);

    if (isAdminReject) {
      trail.push({
        action: "Admin Rejected",
        actor: request.approver || "Admin Office",
        timestamp: request.adminDecidedOn || "-",
        note: request.adminRejectionReason || request.adminDecision || undefined,
      });
    } else if (isAdminApprove) {
      trail.push({
        action: "Admin Approved",
        actor: request.approver || "Admin Office",
        timestamp: request.adminDecidedOn || "-",
        note: request.adminDecision || "Forwarded for Super Admin review.",
      });
    }
  }

  if (request.status === "Approved") {
    trail.push({
      action: "Super Admin Approved",
      actor: "Super Admin",
      timestamp: request.superAdminDecidedOn || "-",
      note: request.superAdminDecision || "Final approval completed.",
    });
  }

  if (request.status === "Rejected" && request.superAdminRejectionReason) {
    trail.push({
      action: "Super Admin Rejected",
      actor: "Super Admin",
      timestamp: request.superAdminDecidedOn || "-",
      note: request.superAdminRejectionReason || request.superAdminDecision || undefined,
    });
  }

  return trail;
}

// ── Tour Approvals ──────────────────────────────────────────────
export function buildTourAuditTrail(request) {
  const trail = [];

  trail.push({
    action: "Submitted",
    actor: request.employee || "Employee",
    timestamp: request.submittedOn || "-",
    note: `${request.destination || "Destination"} — ${request.dates || "TBD"}. Purpose: ${request.purpose || "Not specified"}`,
  });

  if (request.status === "Approved" || request.status === "Rejected") {
    // Admin-level approval (for admin pages with direct approve)
    if (!request.adminApprovedBy) {
      trail.push({
        action: request.status === "Approved" ? "Approved" : "Rejected",
        actor: "Admin",
        timestamp: request.decidedOn || "-",
      });
    }
  }

  // Super Admin flow — admin clearance is recorded
  if (request.adminApprovedBy) {
    trail.push({
      action: "Admin Approved",
      actor: request.adminApprovedBy,
      timestamp: request.adminApprovedOn || "-",
      note: "Cleared by Admin and forwarded to Super Admin.",
    });

    if (request.status === "Approved") {
      trail.push({
        action: "Super Admin Approved",
        actor: "Super Admin",
        timestamp: request.superAdminDecidedOn || "-",
      });
    } else if (request.status === "Rejected") {
      trail.push({
        action: "Super Admin Rejected",
        actor: "Super Admin",
        timestamp: request.superAdminDecidedOn || "-",
      });
    }
  }

  return trail;
}

// ── Salary Approvals ────────────────────────────────────────────
export function buildSalaryAuditTrail(row) {
  const trail = [];

  trail.push({
    action: "Submitted",
    actor: row.employee || "Employee",
    timestamp: row.month || "-",
    note: `Salary record for ${row.center || "center"}. Attendance: ${row.attendance || 0}%`,
  });

  // Admin approval
  if (row.salaryApproved || row.status === "APPROVED" || row.status === "Paid" || row.status === "PAID" || row.adminApprovedOn) {
    trail.push({
      action: "Admin Approved",
      actor: "Admin",
      timestamp: row.adminApprovedOn || row.decidedOn || "-",
      note: row.bonusApproved ? "Salary + Bonus approved." : "Salary approved.",
    });
  }

  // Super Admin
  if (row.superStatus === "Paid" || row.status === "Paid" || row.status === "PAID") {
    trail.push({
      action: "Paid",
      actor: "Super Admin",
      timestamp: row.superAdminDecidedOn || "-",
      note: `Amount: ₹${Number(row.amount || 0).toLocaleString("en-IN")}`,
    });
  } else if (row.superStatus === "Returned" || row.status === "REJECTED") {
    trail.push({
      action: "Returned",
      actor: "Super Admin",
      timestamp: row.superAdminDecidedOn || "-",
    });
  }

  return trail;
}

// ── Reimbursement Approvals ─────────────────────────────────────
export function buildReimbursementAuditTrail(claim) {
  const trail = [];

  trail.push({
    action: "Submitted",
    actor: claim.employee || "Employee",
    timestamp: claim.submittedOn || claim.createdAt?.slice(0, 10) || "-",
    note: `${claim.claimTitle || claim.category || "Reimbursement"} — ${claim.bills?.length || 0} bill(s)`,
  });

  if (["ADMIN_APPROVED", "APPROVED", "REJECTED"].includes(claim.status)) {
    trail.push({
      action: "Admin Approved",
      actor: claim.adminApprovedBy || "Admin",
      timestamp: claim.adminApprovedOn || "-",
      note: "Forwarded to Super Admin for final approval.",
    });
  }

  if (claim.status === "APPROVED") {
    trail.push({
      action: "Super Admin Approved",
      actor: "Super Admin",
      timestamp: claim.superAdminDecidedOn || "-",
      note: `Approved amount: ₹${Number(claim.amount || claim.totalAmount || 0).toLocaleString("en-IN")}`,
    });
  }

  if (claim.status === "REJECTED" && claim.adminApprovedBy) {
    trail.push({
      action: "Super Admin Rejected",
      actor: "Super Admin",
      timestamp: claim.superAdminDecidedOn || "-",
    });
  } else if (claim.status === "REJECTED" && !claim.adminApprovedBy) {
    trail.push({
      action: "Admin Rejected",
      actor: "Admin",
      timestamp: claim.adminApprovedOn || "-",
    });
  }

  return trail;
}

// ── Operations Approvals (trainer/mobilizer/placement) ──────────
export function buildOperationsAuditTrail(request) {
  const trail = [];

  trail.push({
    action: "Submitted",
    actor: request.person || request.trainer || request.mobilizer || request.officer || "Employee",
    timestamp: request.submittedOn || "-",
    note: `${request.requestType || "Request"} at ${request.center || "center"}`,
  });

  if (request.adminStatus === "Approved" || request.adminApprovedOn) {
    trail.push({
      action: "Admin Approved",
      actor: "Admin",
      timestamp: request.adminApprovedOn || request.submittedOn || "-",
      note: "Forwarded for Super Admin final approval.",
    });
  }

  if (request.superStatus === "Approved") {
    trail.push({
      action: "Super Admin Approved",
      actor: "Super Admin",
      timestamp: request.superAdminDecidedOn || "-",
    });
  } else if (request.superStatus === "Returned") {
    trail.push({
      action: "Returned",
      actor: "Super Admin",
      timestamp: request.superAdminDecidedOn || "-",
    });
  }

  return trail;
}

// ── Placement Drive Approvals ───────────────────────────────────
export function buildPlacementDriveAuditTrail(drive) {
  const trail = [];

  trail.push({
    action: "Planned",
    actor: drive.officer || "Placement Officer",
    timestamp: drive.date || "-",
    note: `${drive.company || "Company"} — ${drive.trade || "Trade"} at ${drive.location || "Location"}. Candidates: ${drive.candidates || 0}`,
  });

  if (drive.status === "Approved") {
    trail.push({
      action: "Approved",
      actor: "Admin",
      timestamp: drive.approvedOn || "-",
    });
  } else if (drive.status === "Rejected") {
    trail.push({
      action: "Rejected",
      actor: "Admin",
      timestamp: drive.rejectedOn || "-",
    });
  } else if (drive.status === "Completed") {
    trail.push({
      action: "Approved",
      actor: "Admin",
      timestamp: drive.approvedOn || "-",
    });
    trail.push({
      action: "Completed",
      actor: drive.officer || "Placement Officer",
      timestamp: drive.completedOn || "-",
      note: `Selected: ${drive.selected || 0} out of ${drive.candidates || 0} candidates.`,
    });
  }

  return trail;
}

// ── Candidate Enrollment Approvals ──────────────────────────────
export function buildCandidateAuditTrail(candidate) {
  const trail = [];

  trail.push({
    action: "Enrolled",
    actor: "Mobilizer",
    timestamp: candidate.enrollmentDate
      ? (candidate.enrollmentDate instanceof Date
          ? candidate.enrollmentDate.toISOString().split("T")[0]
          : String(candidate.enrollmentDate))
      : "-",
    note: `${candidate.name || "Candidate"} — ${candidate.jobrole || "Job Role"} at ${candidate.center || "Center"}`,
  });

  if (candidate.status === "Approved" || candidate.status === "IN_TRAINING") {
    trail.push({
      action: "Approved",
      actor: "Admin",
      timestamp: candidate.approvedOn || "-",
      note: "Enrollment approved. Candidate moved to training.",
    });
  } else if (candidate.status === "Rejected" || candidate.status === "DROPPED") {
    trail.push({
      action: "Rejected",
      actor: "Admin",
      timestamp: candidate.rejectedOn || "-",
      note: "Enrollment rejected.",
    });
  }

  return trail;
}

// ── Exposure Visit Approvals ────────────────────────────────────
export function buildExposureVisitAuditTrail(visit) {
  const trail = [];

  trail.push({
    action: "Planned",
    actor: visit.trainer || "Trainer",
    timestamp: visit.date || "-",
    note: `${visit.industry || "Industry"} — Batch ${visit.batch || "?"}, Trade: ${visit.trade || "?"}. Candidates: ${visit.candidates || 0}`,
  });

  if (visit.status === "Approved" || visit.status === "Completed" || visit.status === "Submitted") {
    trail.push({
      action: "Approved",
      actor: "Admin",
      timestamp: visit.approvedOn || "-",
    });
  }

  if (visit.status === "Completed" || visit.status === "Submitted") {
    trail.push({
      action: "Completed",
      actor: visit.trainer || "Trainer",
      timestamp: visit.completedOn || visit.date || "-",
      note: `Attended: ${visit.attended || 0} / ${visit.candidates || 0}`,
    });
  }

  if (visit.status === "Rejected") {
    trail.push({
      action: "Rejected",
      actor: "Admin",
      timestamp: visit.rejectedOn || "-",
    });
  }

  return trail;
}

// ── Invoice Approvals ───────────────────────────────────────────
export function buildInvoiceAuditTrail(bill) {
  const trail = [];

  trail.push({
    action: "Invoice Raised",
    actor: "Admin",
    timestamp: bill.raisedOn || "-",
    note: `${bill.billName || "Bill"} — ${bill.category || "Category"}. ${bill.description || ""}`,
  });

  if (bill.status === "Verified" || bill.status === "Approved" || bill.status === "Paid") {
    trail.push({
      action: "Verified",
      actor: "Admin",
      timestamp: bill.verifiedOn || bill.raisedOn || "-",
    });
  }

  if (bill.superAdminStatus === "Approved" || bill.status === "Approved" || bill.status === "Paid") {
    trail.push({
      action: "Super Admin Approved",
      actor: "Super Admin",
      timestamp: bill.decidedOn || "-",
      note: bill.amount ? `Amount: ₹${bill.amount.toLocaleString("en-IN")}` : undefined,
    });
  } else if (bill.superAdminStatus === "Returned") {
    trail.push({
      action: "Returned",
      actor: "Super Admin",
      timestamp: bill.decidedOn || "-",
    });
  }

  if (bill.status === "Paid") {
    trail.push({
      action: "Paid",
      actor: "Finance",
      timestamp: bill.paidOn || bill.decidedOn || "-",
    });
  }

  return trail;
}
