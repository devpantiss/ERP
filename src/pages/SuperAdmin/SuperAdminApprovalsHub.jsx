import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  CalendarDays,
  ClipboardCheck,
  FileCheck,
  HandCoins,
  MapPinned,
  ReceiptText,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import { Breadcrumb, PageHeader } from "./SuperAdminSharedComponents";

const approvalSections = [
  {
    title: "Tour Approvals",
    description: "Admin-cleared travel and field visit requests across all projects.",
    path: "/super-admin/approvals/tour",
    icon: MapPinned,
    pending: 2,
  },
  {
    title: "Leave Approvals",
    description: "Final review queue for leave requests forwarded by project admins.",
    path: "/super-admin/approvals/leave",
    icon: CalendarDays,
    pending: 1,
  },
  {
    title: "Salary Approvals",
    description: "Project-wise salary records that have passed Admin verification.",
    path: "/super-admin/approvals/salary",
    icon: Wallet,
    pending: 1,
  },
  {
    title: "Invoice Approvals",
    description: "Invoices raised by Admin that come directly for Super Admin review.",
    path: "/super-admin/approvals/invoices",
    icon: ReceiptText,
    pending: 3,
  },
  {
    title: "Reimbursement Approvals",
    description: "Claims approved by admins and waiting for final finance clearance.",
    path: "/super-admin/approvals/reimbursements",
    icon: HandCoins,
    pending: 2,
  },
  {
    title: "Operations Approvals",
    description: "Trainer, mobilizer, and placement requests escalated after Admin approval.",
    path: "/super-admin/approvals/operations",
    icon: FileCheck,
    pending: 3,
  },
];

export default function SuperAdminApprovalsHub() {
  const totalPending = approvalSections.reduce((sum, section) => sum + section.pending, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        icon={ShieldCheck}
        title="Approvals"
        subtitle="Final approval desk for requests that have already been approved by project admins."
      />
      <Breadcrumb items={["Super Admin", "Approvals"]} />

      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCard icon={ClipboardCheck} label="Approval Streams" value={approvalSections.length} />
        <MetricCard icon={ShieldCheck} label="Pending Final Review" value={totalPending} />
        <MetricCard icon={FileCheck} label="Admin Gate" value="Cleared only" />
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {approvalSections.map((section) => (
          <Link
            key={section.title}
            to={section.path}
            className="group relative overflow-hidden rounded-2xl border border-slate-700/50 bg-[#111827]/80 p-5 text-left transition hover:-translate-y-1 hover:border-red-400/35 hover:bg-[#151e2f]"
          >
            <div className="absolute right-0 top-0 h-28 w-28 rounded-full bg-red-500/10 blur-3xl transition group-hover:bg-red-500/20" />
            <div className="relative flex items-start justify-between gap-4">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-red-400/20 bg-red-500/10 text-red-300">
                  <section.icon size={20} />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-base font-black text-white">{section.title}</p>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                    Super Admin final stage
                  </p>
                </div>
              </div>
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 text-red-200 transition group-hover:border-red-400/40 group-hover:text-red-100">
                <ArrowUpRight size={15} />
              </span>
            </div>
            <p className="relative mt-5 min-h-[44px] text-sm leading-6 text-slate-400">{section.description}</p>
            <div className="relative mt-5 rounded-xl border border-slate-700/50 bg-[#0b1220] p-4">
              <div className="flex items-center justify-between gap-4">
                <span className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">
                  Pending Review
                </span>
                <span className="text-xl font-black text-amber-300">{section.pending}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function MetricCard({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl border border-slate-700/50 bg-[#111827]/80 p-5 backdrop-blur-sm">
      <div className="flex items-center justify-between gap-4">
        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">{label}</p>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-red-400/20 bg-red-500/10 text-red-300">
          <Icon size={18} />
        </div>
      </div>
      <p className="mt-4 text-2xl font-black text-white">{value}</p>
    </div>
  );
}
