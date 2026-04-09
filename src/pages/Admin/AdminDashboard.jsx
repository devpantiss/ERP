import React from "react";
import Section1 from "../../components/Admin/Dashboard/Section1";
import Section2 from "../../components/Admin/Dashboard/Section2";
import Section3 from "../../components/Admin/Dashboard/Section3";
import Section4 from "../../components/Admin/Dashboard/Section4";

const AdminDashboard = () => {
  return (
    <div className="w-full min-w-0 max-w-full bg-transparent space-y-0">
      <Section1 />
      <Section2 />
      <Section3 />
      <Section4 />
    </div>
  );
};

export default AdminDashboard;
