import React, { useState } from "react";
import Section1 from "../../components/PlacementPage/PlacementDashboard/Section1";
import Section2 from "../../components/PlacementPage/PlacementDashboard/Section2";
import Section3 from "../../components/PlacementPage/PlacementDashboard/Section3";
import Section4 from "../../components/PlacementPage/PlacementDashboard/Section4";

const projects = [
  "Shaksham Sundargarh",
  "DMF Jajpur",
  "DMF Kalahandi",
  "DMF Keonjhar",
];

const PlacementDashboard = () => {
  const [selectedProject, setSelectedProject] = useState(projects[0]);

  return (
    <div className="space-y-6">

      {/* Header + Project Selector */}
      <div className="flex items-center justify-between bg-[#111827] border border-cyan-400 rounded-xl p-4">

        <h1 className="text-lg font-semibold text-slate-100">
          Placement Dashboard
        </h1>

        <select
          value={selectedProject}
          onChange={(e) => setSelectedProject(e.target.value)}
          className="bg-[#0b0f14] border border-cyan-400 text-slate-200 px-4 py-2 rounded-md"
        >
          {projects.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </div>

      {/* Sections */}
      <Section1 project={selectedProject} />
      <Section2 project={selectedProject} />
      <Section3 project={selectedProject} />
      <Section4 project={selectedProject} />

    </div>
  );
};

export default PlacementDashboard;
