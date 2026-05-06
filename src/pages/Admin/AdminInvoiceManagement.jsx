import { createElement, useMemo, useState } from "react";
import {
  AlertCircle,
  Ban,
  CheckCircle2,
  ChevronDown,
  FileText,
  FileUp,
  Home,
  Lightbulb,
  ReceiptText,
  Send,
  Utensils,
} from "lucide-react";
import { ProjectCards, WorkspaceHeader } from "../../components/Admin/ProjectWorkspace";
import { buildProjectSummaries } from "../../components/Admin/projectWorkspaceUtils";
import { EMPLOYEES } from "./adminPortalData";
import {
  FOOD_MONTHLY_DATA,
  FOOD_RATE_PER_STUDENT,
  MAX_BILLS_PER_MONTH,
  MIN_ATTENDANCE_PCT,
  buildInitialProjectBills,
  getMonthLabel,
} from "./adminInvoiceData";

const CATEGORY_TABS = [
  { key: "Food", label: "Food", icon: Utensils },
  { key: "Electricity", label: "Electricity", icon: Lightbulb },
  { key: "Rent", label: "Rent", icon: Home },
  { key: "Others", label: "Others", icon: ReceiptText },
];

export default function AdminInvoiceManagement() {
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState("2026-03");
  const [activeTab, setActiveTab] = useState("Food");
  const [bills, setBills] = useState(buildInitialProjectBills);
  const [rentFile, setRentFile] = useState("");
  const [electricityFile, setElectricityFile] = useState("");
  const [otherBill, setOtherBill] = useState({ billName: "", amount: "", description: "" });

  const projects = useMemo(() => buildProjectSummaries(EMPLOYEES), []);
  const monthLabel = getMonthLabel(selectedMonth);
  const monthData = FOOD_MONTHLY_DATA[selectedMonth] || {
    activeStudents: 0,
    attendancePct: 0,
    boardingCapacity: 0,
  };

  const projectMonthBills = useMemo(
    () =>
      selectedProject
        ? bills.filter((bill) => bill.project === selectedProject.name && bill.monthKey === selectedMonth)
        : [],
    [bills, selectedProject, selectedMonth]
  );
  const visibleBills = projectMonthBills.filter((bill) => bill.category === activeTab);
  const invoiceTarget = monthData.activeStudents * FOOD_RATE_PER_STUDENT;
  const isFoodEligible = monthData.attendancePct >= MIN_ATTENDANCE_PCT;
  const utilization = monthData.boardingCapacity
    ? Math.round((monthData.activeStudents / monthData.boardingCapacity) * 100)
    : 0;
  const hasFoodBill = projectMonthBills.some((bill) => bill.category === "Food");
  const billLimitReached = projectMonthBills.length >= MAX_BILLS_PER_MONTH;

  const clearedValue = useMemo(
    () =>
      projectMonthBills
      .filter((bill) => bill.status === "Paid" || bill.status === "Approved")
        .reduce((sum, bill) => sum + bill.amount, 0),
    [projectMonthBills]
  );

  const addBill = (bill) => {
    if (!selectedProject || billLimitReached) return;
    setBills((current) => [
      {
        id: `BILL-${Date.now()}`,
        project: selectedProject.name,
        monthKey: selectedMonth,
        month: monthLabel,
        status: "Pending",
        raisedOn: new Date().toISOString().split("T")[0],
        ...bill,
      },
      ...current,
    ]);
  };

  const raiseFoodBill = () => {
    if (!isFoodEligible || hasFoodBill || billLimitReached) return;
    addBill({
      category: "Food",
      billName: "Food Operations",
      amount: invoiceTarget,
      fileName: "",
      description: `${monthData.activeStudents} students at ₹${FOOD_RATE_PER_STUDENT}`,
    });
  };

  const addUploadedBill = (category, fileName, resetFile) => {
    if (!fileName || billLimitReached) return;
    addBill({
      category,
      billName: `${category} Bill`,
      amount: 0,
      fileName,
      description: "Uploaded for finance review",
    });
    resetFile("");
  };

  const addOtherBill = () => {
    if (!otherBill.billName.trim() || !otherBill.amount || billLimitReached) return;
    addBill({
      category: "Others",
      billName: otherBill.billName.trim(),
      amount: Number(otherBill.amount),
      fileName: "",
      description: otherBill.description.trim() || "Manual bill entry",
    });
    setOtherBill({ billName: "", amount: "", description: "" });
  };

  if (!selectedProject) {
    return (
      <section className="space-y-6 text-white">
        <WorkspaceHeader
          title="Invoices Raised"
          subtitle="Select a project to open monthly billing."
        />
        <ProjectCards projects={projects} onSelect={setSelectedProject} />
      </section>
    );
  }

  return (
    <section className="relative min-h-screen overflow-hidden bg-[#0a1220] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.12),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(251,146,60,0.10),transparent_20%)]" />

      <div className="relative z-10 mx-auto max-w-[1440px] space-y-6 px-6 py-6 md:px-8 md:py-8">
        <WorkspaceHeader
          title={`${selectedProject.name} Invoices`}
          subtitle="Project-wise monthly billing workspace."
          selectedProject={selectedProject}
          onBack={() => setSelectedProject(null)}
        />

        <div className="rounded-[28px] border border-white/10 bg-[rgba(12,20,32,0.86)] p-6 backdrop-blur-xl md:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-3 inline-flex rounded-full border border-sky-400/20 bg-sky-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-sky-200">
                Finance Workspace
              </div>
              <h1 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">Invoices Raised</h1>
              <p className="mt-3 text-sm leading-6 text-white/58 md:text-base">
                A streamlined monthly workspace for project billing, release eligibility, file-backed bills, and ledger review.
              </p>
            </div>

            <div className="relative w-full max-w-[240px]">
              <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-white/42">
                Reporting Month
              </label>
              <select
                value={selectedMonth}
                onChange={(event) => setSelectedMonth(event.target.value)}
                className="w-full appearance-none rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 pr-10 text-sm text-white outline-none focus:border-sky-400/35"
              >
                {Object.keys(FOOD_MONTHLY_DATA).map((monthKey) => (
                  <option key={monthKey} value={monthKey} className="bg-slate-900">
                    {getMonthLabel(monthKey)}
                  </option>
                ))}
              </select>
              <ChevronDown size={16} className="pointer-events-none absolute right-4 top-[43px] text-white/45" />
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-[28px] border border-white/10 bg-[rgba(12,20,32,0.86)] backdrop-blur-xl">
          <div className="flex gap-2 overflow-x-auto border-b border-white/10 p-3">
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

          <div className="p-6">
            {activeTab === "Food" && (
              <FoodTab
                monthData={monthData}
                monthLabel={monthLabel}
                invoiceTarget={invoiceTarget}
                isEligible={isFoodEligible}
                alreadyRaised={hasFoodBill}
                billLimitReached={billLimitReached}
                clearedValue={clearedValue}
                utilization={utilization}
                onRaise={raiseFoodBill}
              />
            )}

            {activeTab === "Electricity" && (
              <UploadTab
                title="Electricity Billing"
                icon={Lightbulb}
                fileName={electricityFile}
                onFileChange={setElectricityFile}
                onAdd={() => addUploadedBill("Electricity", electricityFile, setElectricityFile)}
                billLimitReached={billLimitReached}
              />
            )}

            {activeTab === "Rent" && (
              <UploadTab
                title="Rent Billing"
                icon={Home}
                fileName={rentFile}
                onFileChange={setRentFile}
                onAdd={() => addUploadedBill("Rent", rentFile, setRentFile)}
                billLimitReached={billLimitReached}
              />
            )}

            {activeTab === "Others" && (
              <OthersTab
                value={otherBill}
                onChange={setOtherBill}
                onAdd={addOtherBill}
                billLimitReached={billLimitReached}
              />
            )}
          </div>
        </div>

        <BillingHistory bills={visibleBills} activeTab={activeTab} />
      </div>
    </section>
  );
}

function CategoryTab({ tab, active, count, onClick }) {
  const Icon = tab.icon;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex min-w-[168px] items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
        active
          ? "border-orange-400/35 bg-orange-500/12 text-white shadow-[0_10px_24px_rgba(249,115,22,0.12)]"
          : "border-white/10 bg-white/[0.03] text-white/58 hover:border-white/20 hover:text-white/82"
      }`}
    >
      <span className="inline-flex items-center gap-2">
        <Icon size={16} className={active ? "text-orange-300" : "text-sky-300"} />
        {tab.label}
      </span>
      <span className="rounded-full border border-white/10 bg-black/10 px-2 py-0.5 text-xs text-white/55">
        {count}
      </span>
    </button>
  );
}

function FoodTab({
  monthData,
  monthLabel,
  invoiceTarget,
  isEligible,
  alreadyRaised,
  billLimitReached,
  clearedValue,
  utilization,
  onRaise,
}) {
  return (
    <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
      <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/42">Monthly Release Status</p>
            <h2 className="mt-3 text-2xl font-semibold text-white">Billing Readiness</h2>
          </div>
          <span
            className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
              isEligible ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-200" : "border-red-400/20 bg-red-500/10 text-red-200"
            }`}
          >
            {isEligible ? "Ready" : "Locked"}
          </span>
        </div>

        <div className="mt-8 space-y-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/38">Attendance</p>
            <div className="mt-3 flex items-end gap-3">
              <span className={`text-6xl font-black ${isEligible ? "text-emerald-300" : "text-red-300"}`}>
                {monthData.attendancePct}%
              </span>
              <span className="pb-2 text-white/35">/100%</span>
            </div>
            <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-white/10">
              <div
                className={`h-full rounded-full ${isEligible ? "bg-emerald-400" : "bg-red-400"}`}
                style={{ width: `${Math.min(monthData.attendancePct, 100)}%` }}
              />
            </div>
          </div>

          <div className={`rounded-[24px] border p-5 ${isEligible ? "border-emerald-400/12 bg-emerald-500/8" : "border-red-400/12 bg-red-500/8"}`}>
            <div className="flex items-start gap-3">
              {isEligible ? (
                <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-emerald-300" />
              ) : (
                <AlertCircle size={18} className="mt-0.5 shrink-0 text-red-300" />
              )}
              <div>
                <p className="text-sm font-medium text-white">
                  {isEligible
                    ? `Attendance has crossed the ${MIN_ATTENDANCE_PCT}% threshold for ${monthLabel}.`
                    : `Attendance is below the ${MIN_ATTENDANCE_PCT}% threshold for ${monthLabel}.`}
                </p>
                <p className="mt-2 text-sm text-white/55">
                  {isEligible
                    ? "You can proceed with invoice generation and send it for approval."
                    : "Invoice generation should remain locked until attendance improves or an exception is cleared."}
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <MiniCard label="Students" value={monthData.activeStudents} />
            <MiniCard label="Rate / Student" value={`₹${FOOD_RATE_PER_STUDENT}`} />
            <MiniCard label="Cleared Value" value={`₹${clearedValue.toLocaleString("en-IN")}`} />
          </div>
        </div>
      </div>

      <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/42">Invoice Action</p>
        <h2 className="mt-3 text-2xl font-semibold text-white">Release Panel</h2>

        <div className="mt-8 rounded-[24px] border border-white/10 bg-white/[0.03] p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/38">Target Amount</p>
          <p className="mt-3 text-5xl font-black tracking-tight text-white">₹{invoiceTarget.toLocaleString("en-IN")}</p>

          <div className="mt-6 space-y-4 text-sm text-white/58">
            <DetailRow label="Billing month" value={monthLabel} />
            <DetailRow label="Student count" value={monthData.activeStudents} />
            <DetailRow label="Capacity utilization" value={`${utilization}%`} />
            <DetailRow label="Already submitted" value={alreadyRaised ? "Yes" : "No"} />
          </div>

          {alreadyRaised ? (
            <button
              disabled
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 py-3 text-sm font-semibold text-emerald-200"
            >
              <CheckCircle2 size={16} />
              Already Submitted
            </button>
          ) : (
            <button
              type="button"
              onClick={onRaise}
              disabled={!isEligible || billLimitReached}
              className={`mt-6 flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-sm font-semibold transition ${
                isEligible && !billLimitReached
                  ? "bg-gradient-to-r from-orange-500 to-amber-400 text-white shadow-[0_12px_24px_rgba(249,115,22,0.24)] hover:-translate-y-0.5"
                  : "cursor-not-allowed border border-white/10 bg-white/[0.04] text-white/35"
              }`}
            >
              {!isEligible || billLimitReached ? <Ban size={16} /> : <FileText size={16} />}
              {billLimitReached ? "Bill Limit Reached" : isEligible ? "Raise Invoice" : "Locked"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function UploadTab({ title, icon: Icon, fileName, onFileChange, onAdd, billLimitReached }) {
  return (
    <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
      <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-sky-400/20 bg-sky-400/10 text-sky-300">
            {createElement(Icon, { size: 20 })}
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/42">Document Upload</p>
            <h2 className="mt-1 text-2xl font-semibold text-white">{title}</h2>
          </div>
        </div>

        <label className="mt-8 flex min-h-[190px] cursor-pointer flex-col items-center justify-center rounded-[24px] border border-dashed border-white/14 bg-white/[0.03] p-6 text-center transition hover:border-sky-400/30">
          <input
            type="file"
            accept="application/pdf,image/*"
            className="hidden"
            disabled={billLimitReached}
            onChange={(event) => onFileChange(event.target.files?.[0]?.name || "")}
          />
          <FileUp size={34} className="text-sky-300" />
          <p className="mt-4 text-sm font-semibold text-white">{fileName || "Upload PDF/Image"}</p>
          <p className="mt-2 text-xs text-white/45">
            {fileName ? "File ready to add to this billing month." : "PDF, JPG, or PNG accepted for frontend review."}
          </p>
        </label>
      </div>

      <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/42">Upload Status</p>
        <h2 className="mt-3 text-2xl font-semibold text-white">Bill Packet</h2>
        <div className="mt-8 rounded-[24px] border border-white/10 bg-white/[0.03] p-6">
          <div className="space-y-4 text-sm text-white/58">
            <DetailRow label="Selected file" value={fileName || "No file selected"} />
            <DetailRow label="Upload status" value={fileName ? "Ready" : "Waiting"} />
            <DetailRow label="Persistence" value="Frontend only" />
          </div>
          <button
            type="button"
            onClick={onAdd}
            disabled={!fileName || billLimitReached}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-500 to-cyan-400 py-3 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(14,165,233,0.18)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:border disabled:border-white/10 disabled:bg-none disabled:text-white/35 disabled:shadow-none"
          >
            <Send size={16} />
            {billLimitReached ? "Bill Limit Reached" : "Add Bill"}
          </button>
        </div>
      </div>
    </div>
  );
}

function OthersTab({ value, onChange, onAdd, billLimitReached }) {
  return (
    <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
      <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/42">Manual Billing</p>
        <h2 className="mt-3 text-2xl font-semibold text-white">Other Bill Entry</h2>
        <div className="mt-8 space-y-4">
          <input
            value={value.billName}
            disabled={billLimitReached}
            onChange={(event) => onChange({ ...value, billName: event.target.value })}
            placeholder="Bill name"
            className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none placeholder:text-white/25 focus:border-orange-400/35 disabled:text-white/30"
          />
          <input
            type="number"
            min="0"
            value={value.amount}
            disabled={billLimitReached}
            onChange={(event) => onChange({ ...value, amount: event.target.value })}
            placeholder="Amount"
            className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none placeholder:text-white/25 focus:border-orange-400/35 disabled:text-white/30"
          />
          <textarea
            rows={4}
            value={value.description}
            disabled={billLimitReached}
            onChange={(event) => onChange({ ...value, description: event.target.value })}
            placeholder="Optional description"
            className="w-full resize-none rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none placeholder:text-white/25 focus:border-orange-400/35 disabled:text-white/30"
          />
        </div>
      </div>

      <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/42">Invoice Action</p>
        <h2 className="mt-3 text-2xl font-semibold text-white">Manual Release Panel</h2>
        <div className="mt-8 rounded-[24px] border border-white/10 bg-white/[0.03] p-6">
          <div className="space-y-4 text-sm text-white/58">
            <DetailRow label="Bill name" value={value.billName || "Not entered"} />
            <DetailRow label="Amount" value={value.amount ? `₹${Number(value.amount).toLocaleString("en-IN")}` : "Not entered"} />
            <DetailRow label="Persistence" value="Frontend only" />
          </div>
          <button
            type="button"
            onClick={onAdd}
            disabled={!value.billName || !value.amount || billLimitReached}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-400 py-3 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(249,115,22,0.24)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:border disabled:border-white/10 disabled:bg-none disabled:text-white/35 disabled:shadow-none"
          >
            <Send size={16} />
            {billLimitReached ? "Bill Limit Reached" : "Add Bill"}
          </button>
        </div>
      </div>
    </div>
  );
}

function BillingHistory({ bills, activeTab }) {
  return (
    <div className="overflow-hidden rounded-[28px] border border-white/10 bg-[rgba(12,20,32,0.88)] backdrop-blur-xl">
      <div className="border-b border-white/10 px-6 py-5">
        <h2 className="text-lg font-semibold text-white">{activeTab} Billing History</h2>
        <p className="mt-1 text-sm text-white/48">
          Current project and reporting month records for the selected category.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[1080px] text-sm">
          <thead className="bg-white/[0.02] text-white/45">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.16em]">Invoice ID</th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.16em]">Billing Window</th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.16em]">Bill Name</th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.16em]">File</th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.16em]">Raised On</th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.16em]">Amount</th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.16em]">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/8">
            {bills.length ? (
              bills.map((bill) => (
                <tr key={`${bill.id}-${bill.raisedOn}`} className="transition hover:bg-white/[0.03]">
                  <td className="px-6 py-5 font-mono text-white/78">{bill.id}</td>
                  <td className="px-6 py-5 font-medium text-white/90">{bill.month}</td>
                  <td className="px-6 py-5 text-white/62">
                    <p>{bill.billName}</p>
                    <p className="mt-1 text-xs text-white/35">{bill.description}</p>
                  </td>
                  <td className="px-6 py-5 text-white/55">{bill.fileName || "Not required"}</td>
                  <td className="px-6 py-5 text-white/55">{bill.raisedOn}</td>
                  <td className="px-6 py-5 font-semibold text-orange-300">
                    {bill.amount ? `₹${bill.amount.toLocaleString("en-IN")}` : "Review pending"}
                  </td>
                  <td className="px-6 py-5">
                    <StatusPill status={bill.status} />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-6 py-10 text-center text-white/45">
                  No {activeTab.toLowerCase()} bills added for this month.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function MiniCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/38">{label}</p>
      <p className="mt-2 text-sm font-medium text-white">{value}</p>
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-white/8 pb-3 last:border-b-0 last:pb-0">
      <span>{label}</span>
      <span className="text-right font-medium text-white">{value}</span>
    </div>
  );
}

function StatusPill({ status }) {
  const map = {
    Paid: "bg-emerald-500/10 text-emerald-300 border-emerald-400/20",
    Approved: "bg-sky-500/10 text-sky-300 border-sky-400/20",
    Pending: "bg-amber-500/10 text-amber-300 border-amber-400/20",
    Verified: "bg-violet-500/10 text-violet-300 border-violet-400/20",
  };

  return (
    <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${map[status] || "border-white/10 bg-white/[0.04] text-white/70"}`}>
      {status}
    </span>
  );
}
