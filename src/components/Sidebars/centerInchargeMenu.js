import { LayoutDashboard, Users, Briefcase, ShieldCheck, ReceiptText, Quote, CalendarCheck, CalendarDays, Wallet, HandCoins, UserRoundPen, Bell } from "lucide-react";

export const CENTER_MENU_ITEMS = [
  { label: "Dashboard", shortLabel: "Home", path: "/center-incharge/dashboard", icon: LayoutDashboard },
  { label: "Alerts", path: "/center-incharge/alerts", icon: Bell },
  { label: "Center Team", shortLabel: "Team", path: "/center-incharge/team", icon: Users },
  { label: "Project Details", path: "/center-incharge/project-details", icon: Briefcase },
  { label: "PPE Upload", path: "/center-incharge/ppe-upload", icon: ShieldCheck },
  { label: "Raise Invoices", path: "/center-incharge/invoices", icon: ReceiptText },
  { label: "HR Entitlement", key: "hr-entitlement", icon: CalendarCheck, children: [
    { label: "Attendance", path: "/center-incharge/hr/attendance", icon: CalendarCheck },
    { label: "Leave Management", path: "/center-incharge/hr/leave", icon: CalendarDays },
    { label: "Salary", path: "/center-incharge/hr/salary", icon: Wallet },
    { label: "Reimbursement", path: "/center-incharge/hr/reimbursement", icon: HandCoins },
  ] },
  { label: "Testimonials", path: "/center-incharge/testimonials", icon: Quote },
  { label: "Profile", path: "/center-incharge/profile", icon: UserRoundPen },
];
