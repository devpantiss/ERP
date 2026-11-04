import { CalendarCheck, FileUp, ShieldCheck, Users, Bell, ReceiptText } from "lucide-react";

export const PROJECT_LEAD_MENU = [
  { label: "Alerts", path: "/project-head/alerts", icon: Bell },
  { label: "Tranche Invoices", path: "/project-head/tranche-invoices", icon: ReceiptText },
  { label: "Client Visit Tracking", path: "/project-head/client-visits", icon: CalendarCheck },
  { label: "Report Submission", path: "/project-head/report-submissions", icon: FileUp },
  { label: "QC Audits", path: "/project-head/qc-audits", icon: ShieldCheck },
  { label: "Center-wise Team Setup", path: "/project-head/team-setup", icon: Users },
];

export const WORKFLOWS = {
  visits: {
    title: "Client Visit Tracking", description: "Plan client visits and record outcomes across your training centers.",
    action: "Schedule visit", empty: "No client visits scheduled", hint: "Schedule the next visit to keep center teams prepared.",
    statuses: ["Scheduled", "Completed", "Cancelled"],
    fields: [{ key: "title", label: "Client / organization", required: true }, { key: "contact", label: "Contact person", required: true }, { key: "date", label: "Visit date", type: "date", required: true }, { key: "purpose", label: "Visit purpose", required: true }, { key: "notes", label: "Outcomes and follow-up", type: "textarea" }],
  },
  reports: {
    title: "Report Submission", description: "Submit center reports and keep a record of reporting periods and supporting documents.",
    action: "Submit report", empty: "No reports submitted", hint: "Upload your first center report to start the submission register.",
    statuses: ["Submitted"],
    fields: [{ key: "title", label: "Report title", required: true }, { key: "periodStart", label: "Period from", type: "date", required: true }, { key: "periodEnd", label: "Period to", type: "date", required: true }, { key: "recipient", label: "Submitted to", required: true }, { key: "notes", label: "Submission notes", type: "textarea" }],
  },
  audits: {
    title: "QC Audits", description: "Review training center quality, document findings, and track corrective actions.",
    action: "Record audit", empty: "No QC audits recorded", hint: "Record a center inspection to track training quality and follow-up actions.",
    statuses: ["Open", "Action Required", "Closed"],
    fields: [{ key: "title", label: "Audit title", required: true }, { key: "date", label: "Audit date", type: "date", required: true }, { key: "auditor", label: "Auditor", required: true }, { key: "dueDate", label: "Corrective action due", type: "date" }, { key: "notes", label: "Findings and corrective actions", type: "textarea", required: true }],
  },
};

export const AUDIT_CHECKS = ["Training delivery", "Attendance records", "Lab and equipment", "Safety and PPE", "Documentation"];
