import { INVOICES_RAISED } from "./adminPortalData";

export const FOOD_RATE_PER_STUDENT = 3000;
export const MIN_ATTENDANCE_PCT = 70;
export const MAX_BILLS_PER_MONTH = 3;
export const MONTHS = ["January", "February", "March", "April", "May", "June"];

export const FOOD_MONTHLY_DATA = {
  "2026-03": { activeStudents: 118, attendancePct: 76, boardingCapacity: 140 },
  "2026-02": { activeStudents: 115, attendancePct: 65, boardingCapacity: 120 },
  "2026-01": { activeStudents: 110, attendancePct: 78, boardingCapacity: 120 },
};

export const getMonthLabel = (monthKey) => {
  const [year, month] = monthKey.split("-");
  return `${MONTHS[parseInt(month, 10) - 1]} ${year}`;
};

export const buildInitialProjectBills = () =>
  INVOICES_RAISED.map((invoice) => ({
    id: invoice.id,
    project: invoice.project,
    monthKey: "2026-03",
    month: "March 2026",
    category: invoice.category === "Food & Boarding" ? "Food" : "Others",
    sourceCategory: invoice.category,
    center: invoice.center,
    billName: invoice.vendor,
    amount: invoice.amount,
    status: invoice.status,
    raisedOn: invoice.raisedOn,
    dueOn: invoice.dueOn,
    fileName: "",
    description: invoice.category === "Food & Boarding" ? invoice.center : `${invoice.category} - ${invoice.center}`,
  }));
