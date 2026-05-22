import { createElement, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  ArrowUpRight,
  Ban,
  CheckCircle2,
  ChevronDown,
  Clock,
  ExternalLink,
  FileText,
  Filter,
  FolderKanban,
  Home,
  Lightbulb,
  ReceiptText,
  Search,
  ShieldCheck,
  Utensils,
  Wallet,
} from "lucide-react";
import { Breadcrumb, PageHeader } from "./SuperAdminSharedComponents";
import { useFinanceStore } from "../../stores/financeStore";
import {
  getInvoiceMonthLabel,
  selectInvoiceApprovalRows,
  selectInvoiceMonthData,
} from "../../stores/selectors/invoiceSelectors";

const ADMIN_INVOICE_LINK = {
  label: "Admin Invoices Raised",
  path: "/admin/financial-management/invoices-raised",
};

const CATEGORY_TABS = [
  { key: "Food", label: "Food", icon: Utensils },
  { key: "Electricity", label: "Electricity", icon: Lightbulb },
  { key: "Rent", label: "Rent", icon: Home },
  { key: "Others", label: "Others", icon: ReceiptText },
];

const FOOD_RATE_PER_STUDENT = 3000;
const MIN_ATTENDANCE_PCT = 70;

function formatCurrency(value) {
  return value ? `₹${value.toLocaleString("en-IN")}` : "Review pending";
}

function buildInvoiceRecords(invoices) {
  return selectInvoiceApprovalRows(invoices).map((bill) => {
    return {
      ...bill,
      adminReady: true,
      superAdminStatus: bill.status === "Paid" || bill.status === "Approved" ? "Approved" : bill.status === "Rejected" ? "Returned" : "Pending Review",
    };
  });
}

function getStatusClass(status) {
  const map = {
    Approved: "border-emerald-400/25 bg-emerald-500/10 text-emerald-300",
    Paid: "border-emerald-400/25 bg-emerald-500/10 text-emerald-300",
    Verified: "border-sky-400/25 bg-sky-500/10 text-sky-300",
    Pending: "border-amber-400/25 bg-amber-500/10 text-amber-300",
    "Pending Review": "border-amber-400/25 bg-amber-500/10 text-amber-300",
    Returned: "border-red-400/25 bg-red-500/10 text-red-300",
  };

  return map[status] || "border-slate-500/25 bg-slate-500/10 text-slate-300";
}

function summarizeProjects(records) {
  return Array.from(
    records
      .reduce((projectMap, record) => {
        const current = projectMap.get(record.project) || {
          name: record.project,
          invoiceCount: 0,
          totalInvoice: 0,
          pendingReview: 0,
          superApproved: 0,
          returned: 0,
          centers: new Set(),
        };

        projectMap.set(record.project, {
          ...current,
          invoiceCount: current.invoiceCount + 1,
          totalInvoice: current.totalInvoice + record.amount,
          pendingReview: current.pendingReview + (record.superAdminStatus === "Pending Review" ? 1 : 0),
          superApproved: current.superApproved + (record.superAdminStatus === "Approved" ? 1 : 0),
          returned: current.returned + (record.superAdminStatus === "Returned" ? 1 : 0),
          centers: new Set([...current.centers, record.center]),
        });

        return projectMap;
      }, new Map())
      .values()
  ).map((project) => ({
    ...project,
    centerCount: project.centers.size,
  }));
}

export default function SuperAdminInvoiceApprovals() {
  const { invoices, fetchInvoices } = useFinanceStore();
  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const normalizedInvoiceRows = useMemo(() => buildInvoiceRecords(invoices), [invoices]);
  const invoiceMonthData = useMemo(() => selectInvoiceMonthData(invoices), [invoices]);
  const monthKeys = useMemo(() => Object.keys(invoiceMonthData).sort().reverse(), [invoiceMonthData]);
  const [invoiceRows, setInvoiceRows] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState("2026-05");
  const [activeTab, setActiveTab] = useState("Food");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    setInvoiceRows((current) => (current.length ? current : normalizedInvoiceRows));
  }, [normalizedInvoiceRows]);

  useEffect(() => {
    if (monthKeys.length && !monthKeys.includes(selectedMonth)) {
      setSelectedMonth(monthKeys[0]);
    }
  }, [monthKeys, selectedMonth]);

  const projectSummaries = useMemo(() => summarizeProjects(invoiceRows), [invoiceRows]);
  const selectedProjectSummary = useMemo(
    () => projectSummaries.find((project) => project.name === selectedProject),
    [projectSummaries, selectedProject]
  );

  const monthLabel = getInvoiceMonthLabel(selectedMonth);
  const monthData = invoiceMonthData[selectedMonth] || {
    activeStudents: 0,
    attendancePct: 0,
    boardingCapacity: 0,
  };
  const invoiceTarget = monthData.activeStudents * FOOD_RATE_PER_STUDENT;
  const isFoodEligible = monthData.attendancePct >= MIN_ATTENDANCE_PCT;
  const utilization = monthData.boardingCapacity
    ? Math.round((monthData.activeStudents / monthData.boardingCapacity) * 100)
    : 0;

  const projectMonthBills = useMemo(
    () =>
      selectedProject
        ? invoiceRows.filter((bill) => bill.project === selectedProject && bill.monthKey === selectedMonth)
        : [],
    [invoiceRows, selectedMonth, selectedProject]
  );

  const visibleBills = useMemo(() => {
    const query = search.trim().toLowerCase();

    return projectMonthBills.filter((bill) => {
      if (bill.category !== activeTab) return false;
      if (statusFilter !== "All" && bill.superAdminStatus !== statusFilter) return false;
      if (!query) return true;

      return (
        bill.id.toLowerCase().includes(query) ||
        bill.billName.toLowerCase().includes(query) ||
        bill.description.toLowerCase().includes(query) ||
        bill.category.toLowerCase().includes(query)
      );
    });
  }, [activeTab, projectMonthBills, search, statusFilter]);

  const totals = useMemo(
    () =>
      invoiceRows.reduce(
        (summary, row) => ({
          totalInvoice: summary.totalInvoice + row.amount,
          pendingReview: summary.pendingReview + (row.superAdminStatus === "Pending Review" ? 1 : 0),
          superApproved: summary.superApproved + (row.superAdminStatus === "Approved" ? 1 : 0),
        }),
        { totalInvoice: 0, pendingReview: 0, superApproved: 0 }
      ),
    [invoiceRows]
  );

  const categorySummary = useMemo(
    () =>
      visibleBills.reduce(
        (summary, bill) => ({
          totalValue: summary.totalValue + bill.amount,
          reviewable: summary.reviewable + (bill.superAdminStatus === "Pending Review" ? 1 : 0),
          approved: summary.approved + (bill.superAdminStatus === "Approved" ? 1 : 0),
        }),
        { totalValue: 0, reviewable: 0, approved: 0 }
      ),
    [visibleBills]
  );

  const updateSuperAdminStatus = (id, status) => {
    const decidedOn = new Date().toISOString().split("T")[0];
    setInvoiceRows((current) =>
      current.map((row) =>
        row.id === id
          ? {
              ...row,
              superAdminStatus: status,
              decidedOn,
            }
          : row
      )
    );
  };

  const approveVisibleInvoices = () => {
    const decidedOn = new Date().toISOString().split("T")[0];
    const visibleIds = new Set(
      visibleBills
        .filter((bill) => bill.superAdminStatus === "Pending Review")
        .map((bill) => bill.id)
    );

    setInvoiceRows((current) =>
      current.map((row) =>
        visibleIds.has(row.id)
          ? { ...row, superAdminStatus: "Approved", decidedOn }
          : row
      )
    );
  };

  const clearProjectSelection = () => {
    setSelectedProject(null);
    setSearch("");
    setStatusFilter("All");
    setActiveTab("Food");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        icon={ReceiptText}
        title={selectedProject ? `${selectedProject} Invoices` : "Invoices"}
        subtitle={
          selectedProject
            ? "Monthly invoice queue aligned with Admin billing categories."
            : "Select a project to view invoices raised from the Admin billing workspace."
        }
      />
      <Breadcrumb items={selectedProject ? ["Super Admin", "Invoices", selectedProject] : ["Super Admin", "Invoices"]} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon={Wallet} label="Total Invoice Value" value={formatCurrency(totals.totalInvoice)} tone="red" />
        <MetricCard icon={FileText} label="Invoices Raised" value={invoiceRows.length} tone="sky" />
        <MetricCard icon={Clock} label="Pending Review" value={totals.pendingReview} tone="amber" />
        <MetricCard icon={ShieldCheck} label="Super Admin Approved" value={totals.superApproved} tone="emerald" />
      </div>

      {!selectedProject ? (
        <section className="space-y-5">
          <div className="flex flex-col gap-4 rounded-2xl border border-slate-700/50 bg-[#111827]/80 p-5 backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-sm font-black uppercase tracking-[0.16em] text-white/85">
                Select Project
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Invoices raised by Admin come directly here for Super Admin review.
              </p>
            </div>
            <Link
              to={ADMIN_INVOICE_LINK.path}
              className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-700 bg-[#0b1220] px-3 py-2 text-xs font-bold text-white/70 transition hover:border-red-400/40 hover:text-white"
            >
              {ADMIN_INVOICE_LINK.label}
              <ExternalLink size={13} />
            </Link>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {projectSummaries.map((project) => (
              <ProjectInvoiceCard
                key={project.name}
                project={project}
                onSelect={() => setSelectedProject(project.name)}
              />
            ))}
          </div>
        </section>
      ) : (
        <section className="space-y-5">
          <div className="rounded-2xl border border-slate-700/50 bg-[#111827]/80 p-5 backdrop-blur-sm">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <button
                  type="button"
                  onClick={clearProjectSelection}
                  className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-700 bg-[#0b1220] px-3 py-2 text-xs font-black text-white/70 transition hover:border-red-400/40 hover:text-white"
                >
                  <ArrowLeft size={14} />
                  Projects
                </button>

                <div>
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-red-300">Selected Project</p>
                  <h2 className="mt-1 text-xl font-black text-white">{selectedProject}</h2>
                  <p className="mt-1 text-xs text-slate-500">Direct Super Admin review queue</p>
                </div>
              </div>

              <div className="flex flex-wrap items-end gap-3">
                {selectedProjectSummary && (
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <MiniStat label="Invoices" value={selectedProjectSummary.invoiceCount} />
                    <MiniStat label="Raised" value={selectedProjectSummary.invoiceCount} tone="text-sky-300" />
                    <MiniStat label="Pending" value={selectedProjectSummary.pendingReview} tone="text-amber-300" />
                  </div>
                )}

                <div className="relative w-full max-w-[220px]">
                  <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">
                    Reporting Month
                  </label>
                  <select
                    value={selectedMonth}
                    onChange={(event) => setSelectedMonth(event.target.value)}
                    className="w-full appearance-none rounded-xl border border-slate-700 bg-[#0b1220] px-3 py-2.5 pr-8 text-xs font-semibold text-white/75 outline-none transition focus:border-red-400/45"
                  >
                    {monthKeys.map((monthKey) => (
                      <option key={monthKey} value={monthKey} className="bg-slate-950">
                        {getInvoiceMonthLabel(monthKey)}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="pointer-events-none absolute right-3 top-[34px] text-slate-500" />
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-700/50 bg-[#111827]/80 backdrop-blur-sm">
            <div className="flex gap-2 overflow-x-auto border-b border-white/[0.08] p-3">
              {CATEGORY_TABS.map((tab) => (
                <CategoryTab
                  key={tab.key}
                  tab={tab}
                  active={activeTab === tab.key}
                  count={projectMonthBills.filter((bill) => bill.category === tab.key).length}
                  onClick={() => setActiveTab(tab.key)}
                />
              ))}
            </div>

            <div className="grid gap-4 p-5 xl:grid-cols-[1fr_0.9fr]">
              {activeTab === "Food" ? (
                <FoodApprovalPanel
                  monthData={monthData}
                  monthLabel={monthLabel}
                  invoiceTarget={invoiceTarget}
                  isEligible={isFoodEligible}
                  utilization={utilization}
                  summary={categorySummary}
                />
              ) : (
                <CategoryApprovalPanel activeTab={activeTab} summary={categorySummary} />
              )}

              <div className="rounded-2xl border border-slate-700/50 bg-[#0b1220] p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">Approval Action</p>
                    <h3 className="mt-2 text-xl font-black text-white">{activeTab} Queue</h3>
                    <p className="mt-2 text-sm text-slate-500">{visibleBills.length} records in this view</p>
                  </div>
                  <button
                    type="button"
                    onClick={approveVisibleInvoices}
                    disabled={categorySummary.reviewable === 0}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-red-500 px-4 py-2.5 text-xs font-black text-white shadow-lg shadow-red-500/20 transition hover:opacity-90 disabled:cursor-not-allowed disabled:border disabled:border-slate-700 disabled:bg-none disabled:text-slate-500 disabled:shadow-none"
                  >
                    <CheckCircle2 size={15} />
                    Approve Visible
                  </button>
                </div>

                <div className="mt-5 grid grid-cols-3 gap-2 text-center">
                  <MiniStat label="Ready" value={categorySummary.reviewable} tone="text-amber-300" />
                  <MiniStat label="Approved" value={categorySummary.approved} tone="text-emerald-300" />
                  <MiniStat label="Returned" value={visibleBills.filter((bill) => bill.superAdminStatus === "Returned").length} tone="text-red-300" />
                </div>
              </div>
            </div>
          </div>

          <InvoiceApprovalTable
            bills={visibleBills}
            activeTab={activeTab}
            search={search}
            onSearch={setSearch}
            statusFilter={statusFilter}
            onStatusFilter={setStatusFilter}
            onApprove={(id) => updateSuperAdminStatus(id, "Approved")}
            onReturn={(id) => updateSuperAdminStatus(id, "Returned")}
            onReopen={(bill) => updateSuperAdminStatus(bill.id, "Pending Review")}
          />
        </section>
      )}
    </div>
  );
}

function ProjectInvoiceCard({ project, onSelect }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="group relative overflow-hidden rounded-2xl border border-slate-700/50 bg-[#111827]/80 p-5 text-left backdrop-blur-sm transition hover:-translate-y-1 hover:border-red-500/35 hover:bg-[#151e2f] focus:outline-none focus:ring-2 focus:ring-red-400/35"
    >
      <div className="absolute right-0 top-0 h-28 w-28 rounded-full bg-red-500/10 blur-3xl transition group-hover:bg-red-500/20" />
      <div className="relative flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-red-400/20 bg-red-500/10 text-red-300">
            <FolderKanban size={20} />
          </div>
          <div className="min-w-0">
            <p className="truncate text-base font-black text-white">{project.name}</p>
            <p className="mt-1 text-xs text-slate-500">{project.invoiceCount} invoices across {project.centerCount} center{project.centerCount !== 1 ? "s" : ""}</p>
          </div>
        </div>
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 text-red-200 transition group-hover:border-red-400/40 group-hover:text-red-100">
          <ArrowUpRight size={15} />
        </span>
      </div>

      <div className="relative mt-6 grid grid-cols-3 gap-2 text-center">
        <MiniStat label="Raised" value={project.invoiceCount} tone="text-sky-300" />
        <MiniStat label="Pending" value={project.pendingReview} tone="text-amber-300" />
        <MiniStat label="Approved" value={project.superApproved} tone="text-emerald-300" />
      </div>

      <div className="relative mt-5 rounded-xl border border-slate-700/50 bg-[#0b1220] p-4">
        <div className="flex items-center justify-between gap-4">
          <span className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">Invoice Value</span>
          <span className="text-sm font-black text-emerald-300">{formatCurrency(project.totalInvoice)}</span>
        </div>
      </div>
    </button>
  );
}

function CategoryTab({ tab, active, count, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex min-w-[168px] items-center justify-between gap-3 rounded-xl border px-4 py-3 text-sm font-semibold transition ${
        active
          ? "border-red-400/35 bg-red-500/15 text-white shadow-[0_10px_24px_rgba(239,68,68,0.12)]"
          : "border-slate-700 bg-[#0b1220] text-white/58 hover:border-white/20 hover:text-white/82"
      }`}
    >
      <span className="inline-flex items-center gap-2">
        {createElement(tab.icon, { size: 16, className: active ? "text-red-300" : "text-sky-300" })}
        {tab.label}
      </span>
      <span className="rounded-full border border-white/10 bg-black/10 px-2 py-0.5 text-xs text-white/55">
        {count}
      </span>
    </button>
  );
}

function FoodApprovalPanel({ monthData, monthLabel, invoiceTarget, isEligible, utilization, summary }) {
  return (
    <div className="rounded-2xl border border-slate-700/50 bg-[#0b1220] p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">Monthly Release Status</p>
          <h3 className="mt-2 text-xl font-black text-white">Food Billing Readiness</h3>
        </div>
        <span
          className={`w-fit rounded-full border px-3 py-1.5 text-xs font-black ${
            isEligible ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-200" : "border-red-400/20 bg-red-500/10 text-red-200"
          }`}
        >
          {isEligible ? "Ready" : "Locked"}
        </span>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <MiniStat label="Attendance" value={`${monthData.attendancePct}%`} tone={isEligible ? "text-emerald-300" : "text-red-300"} />
        <MiniStat label="Target" value={formatCurrency(invoiceTarget)} />
        <MiniStat label="Queue Value" value={formatCurrency(summary.totalValue)} tone="text-emerald-300" />
      </div>

      <div className="mt-5 rounded-xl border border-slate-700/50 bg-[#111827]/70 p-4">
        <div className="flex items-start gap-3">
          {isEligible ? (
            <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-emerald-300" />
          ) : (
            <AlertCircle size={18} className="mt-0.5 shrink-0 text-red-300" />
          )}
          <div>
            <p className="text-sm font-semibold text-white">
              {isEligible
                ? `${monthLabel} crossed the ${MIN_ATTENDANCE_PCT}% attendance threshold.`
                : `${monthLabel} is below the ${MIN_ATTENDANCE_PCT}% attendance threshold.`}
            </p>
            <p className="mt-2 text-xs text-slate-500">
              Students {monthData.activeStudents} - utilization {utilization}% - rate {formatCurrency(FOOD_RATE_PER_STUDENT)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function CategoryApprovalPanel({ activeTab, summary }) {
  return (
    <div className="rounded-2xl border border-slate-700/50 bg-[#0b1220] p-5">
      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">Document-backed Billing</p>
      <h3 className="mt-2 text-xl font-black text-white">{activeTab} Approval Summary</h3>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <MiniStat label="Queue Value" value={formatCurrency(summary.totalValue)} tone="text-emerald-300" />
        <MiniStat label="Review" value={summary.reviewable} tone="text-amber-300" />
        <MiniStat label="Approved" value={summary.approved} tone="text-emerald-300" />
      </div>
    </div>
  );
}

function InvoiceApprovalTable({
  bills,
  activeTab,
  search,
  onSearch,
  statusFilter,
  onStatusFilter,
  onApprove,
  onReturn,
  onReopen,
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-700/50 bg-[#111827]/80 backdrop-blur-sm">
      <div className="border-b border-white/[0.08] p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h2 className="text-sm font-black uppercase tracking-[0.16em] text-white/85">
              {activeTab} Billing History
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Super Admin approval queue for the selected project, month, and category.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 rounded-xl border border-slate-700 bg-[#0b1220] px-3 py-2 text-xs font-bold text-white/60">
              <Filter size={14} className="text-red-400" />
              Filters
            </div>

            <div className="relative min-w-[230px]">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                value={search}
                onChange={(event) => onSearch(event.target.value)}
                placeholder="Search invoice, bill, center"
                className="w-full rounded-xl border border-slate-700 bg-[#0b1220] py-2.5 pl-9 pr-3 text-xs text-white/85 outline-none transition placeholder:text-slate-600 focus:border-red-400/45"
              />
            </div>

            <FilterSelect
              value={statusFilter}
              onChange={onStatusFilter}
              options={["All", "Pending Review", "Approved", "Returned"]}
            />

            <Link
              to={ADMIN_INVOICE_LINK.path}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-[#0b1220] px-3 py-2.5 text-xs font-bold text-white/70 transition hover:border-red-400/40 hover:text-white"
            >
              Admin Invoice Page
              <ExternalLink size={13} />
            </Link>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm" style={{ minWidth: 1240 }}>
          <thead className="bg-[#0b1220] text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">
            <tr>
              <th className="px-5 py-4">Invoice</th>
              <th className="px-5 py-4">Bill Packet</th>
              <th className="px-5 py-4">File</th>
              <th className="px-5 py-4">Raised On</th>
              <th className="px-5 py-4">Amount</th>
              <th className="px-5 py-4">Super Admin</th>
              <th className="px-5 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {bills.length ? (
              bills.map((bill) => (
                <InvoiceRow
                  key={bill.id}
                  bill={bill}
                  onApprove={() => onApprove(bill.id)}
                  onReturn={() => onReturn(bill.id)}
                  onReopen={() => onReopen(bill)}
                />
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-5 py-12 text-center text-sm text-slate-500">
                  No {activeTab.toLowerCase()} bills match the selected filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function InvoiceRow({ bill, onApprove, onReturn, onReopen }) {
  return (
    <tr className="transition hover:bg-white/[0.025]">
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-red-400/20 bg-red-500/10 text-red-200">
            <FileText size={17} />
          </div>
          <div>
            <p className="font-mono text-xs font-black text-white">{bill.id}</p>
            <p className="mt-1 text-xs text-slate-500">{bill.month}</p>
          </div>
        </div>
      </td>
      <td className="px-5 py-4">
        <p className="font-bold text-white">{bill.billName}</p>
        <p className="mt-1 text-xs text-slate-500">{bill.description}</p>
      </td>
      <td className="px-5 py-4 text-white/60">{bill.fileName || "Not required"}</td>
      <td className="px-5 py-4 text-white/70">{bill.raisedOn}</td>
      <td className="px-5 py-4">
        <p className="text-base font-black text-emerald-300">{formatCurrency(bill.amount)}</p>
      </td>
      <td className="px-5 py-4">
        <StatusPill status={bill.superAdminStatus} />
        <p className="mt-2 text-xs font-semibold text-slate-500">
          {bill.decidedOn ? `Updated ${bill.decidedOn}` : "Awaiting Super Admin decision"}
        </p>
      </td>
      <td className="px-5 py-4 text-right">
        {bill.superAdminStatus === "Pending Review" ? (
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onApprove}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-500/15 px-3 py-2 text-xs font-black text-emerald-200 transition hover:bg-emerald-500/25"
            >
              <CheckCircle2 size={14} />
              Approve
            </button>
            <button
              type="button"
              onClick={onReturn}
              className="inline-flex items-center gap-2 rounded-xl bg-red-500/10 px-3 py-2 text-xs font-black text-red-200 transition hover:bg-red-500/20"
            >
              <Ban size={14} />
              Return
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={onReopen}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-[#0b1220] px-3 py-2 text-xs font-black text-white/65 transition hover:border-red-400/35 hover:text-white"
          >
            <Clock size={14} />
            Reopen
          </button>
        )}
      </td>
    </tr>
  );
}

function MetricCard({ icon: Icon, label, value, tone }) {
  const toneClass = {
    red: "border-red-400/20 bg-red-500/10 text-red-300",
    sky: "border-sky-400/20 bg-sky-500/10 text-sky-300",
    amber: "border-amber-400/20 bg-amber-500/10 text-amber-300",
    emerald: "border-emerald-400/20 bg-emerald-500/10 text-emerald-300",
  }[tone];

  return (
    <div className="rounded-2xl border border-slate-700/50 bg-[#111827]/80 p-5 backdrop-blur-sm">
      <div className="flex items-center justify-between gap-4">
        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">{label}</p>
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl border ${toneClass}`}>
          {createElement(Icon, { size: 18 })}
        </div>
      </div>
      <p className="mt-4 text-2xl font-black tracking-tight text-white">{value}</p>
    </div>
  );
}

function MiniStat({ label, value, tone = "text-white" }) {
  return (
    <div className="rounded-xl border border-slate-700/50 bg-[#0b1220] px-2.5 py-2">
      <p className="text-[9px] font-black uppercase tracking-[0.14em] text-slate-500">{label}</p>
      <p className={`mt-1 text-sm font-black ${tone}`}>{value}</p>
    </div>
  );
}

function FilterSelect({ value, onChange, options }) {
  return (
    <div className="relative min-w-[160px]">
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full appearance-none rounded-xl border border-slate-700 bg-[#0b1220] px-3 py-2.5 pr-8 text-xs font-semibold text-white/75 outline-none transition focus:border-red-400/45"
      >
        {options.map((option) => (
          <option key={option} value={option} className="bg-slate-950">
            {option}
          </option>
        ))}
      </select>
      <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" />
    </div>
  );
}

function StatusPill({ status }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-black ${getStatusClass(status)}`}>
      {status}
    </span>
  );
}
