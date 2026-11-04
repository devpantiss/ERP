import { BookOpen, Users, Briefcase, User } from "lucide-react";
import AdminProfile from "../Admin/AdminProfile";
import { useCenterIncharge } from "./useCenterIncharge";
import { mockDb } from "../../mock-db";

export default function CenterInchargeProfile() {
  const employee = useCenterIncharge();
  const centers = employee.centerIds.map((id) => mockDb.centers.byId[id]).filter(Boolean);
  const manager = mockDb.employees.byId[employee.managerEmployeeId];
  const team = Object.values(mockDb.employees.byId).filter((person) => person.id !== employee.id && person.centerIds?.some((id) => employee.centerIds.includes(id)));
  const profile = {
    name: `${employee.firstName} ${employee.lastName}`, role: "Center Incharge",
    adminId: employee.employeeCode, phone: employee.phone || "Not provided", email: employee.email,
    address: centers.map((center) => `${center.district}, ${center.state}`).join("; ") || "Not provided",
    department: "Center Operations", experience: employee.experience || "Not provided",
    qualification: employee.qualification || "Not provided", organization: "Pantiss Foundation",
    joinDate: employee.joinedOn ? new Date(`${employee.joinedOn}T00:00:00`).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "Not provided",
    centersManaged: centers.length,
  };
  const stats = [
    { icon: <BookOpen />, label: "Assigned Centers", value: centers.length },
    { icon: <Users />, label: "Center Team", value: team.length },
    { icon: <Briefcase />, label: "Assigned Projects", value: employee.projectIds.length },
    { icon: <User />, label: "Reporting Head", value: manager ? `${manager.firstName} ${manager.lastName}` : "Unassigned" },
  ];
  return <AdminProfile key={employee.id} initialProfile={profile} stats={stats} editTitle="Edit Center Incharge Profile" />;
}
