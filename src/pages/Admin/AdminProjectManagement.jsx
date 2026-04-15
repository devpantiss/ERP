import { useMemo, useState } from "react";
import {
  CalendarRange,
  CircleAlert,
  FolderKanban,
  MapPin,
  TrendingUp,
  Users,
  Activity,
  ChevronRight,
  BriefcaseBusiness,
  Award,
  Building2,
  FileText,
  ExternalLink,
  Search
} from "lucide-react";
import { PROJECT_REPORTS } from "./adminPortalData";
import SlidePanel from "../../components/common/SlidePanel";

export default function AdminProjectManagement() {
  const [selectedProjectId, setSelectedProjectId] = useState(PROJECT_REPORTS[0]?.id ?? "");
  const selectedProject = useMemo(
    () => PROJECT_REPORTS.find((project) => project.id === selectedProjectId) || PROJECT_REPORTS[0],
    [selectedProjectId]
  );
  
  // Update center when project changes
  const initialCenterId = selectedProject?.centers[0]?.id ?? "";
  const [selectedCenterId, setSelectedCenterId] = useState(initialCenterId);

  const activeCenter = useMemo(() => {
    return selectedProject?.centers.find((center) => center.id === selectedCenterId) || selectedProject?.centers[0];
  }, [selectedCenterId, selectedProject]);

  // Slide Panel State for detailed lists
  const [listPanelConfig, setListPanelConfig] = useState({
    isOpen: false,
    title: "",
    items: [],
    icon: null,
    searchQuery: ""
  });

  const openDetailedList = (title, items, icon) => {
    setListPanelConfig({
      isOpen: true,
      title,
      items,
      icon,
      searchQuery: ""
    });
  };

  const closeDetailedList = () => {
    setListPanelConfig(prev => ({ ...prev, isOpen: false }));
  };

  const filteredPanelItems = listPanelConfig.items.filter(item => 
    item.toLowerCase().includes(listPanelConfig.searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* HEADER SECTION */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Project <span className="text-violet-400">Reports</span>
          </h1>
          <p className="mt-2 text-sm text-slate-400 max-w-2xl">
            Enterprise command center for tracking project milestones, center performance, and resource allocation across multiple regions.
          </p>
        </div>
      </div>

      {/* SELECTION GRID */}
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        
        {/* Projects List */}
        <div className="flex flex-col rounded-2xl border border-slate-800 bg-[#111827] shadow-lg">
          <div className="flex items-center gap-3 border-b border-slate-800 px-6 py-5">
            <div className="rounded-lg bg-violet-500/10 p-2 text-violet-400">
              <FolderKanban size={18} />
            </div>
            <h2 className="text-base font-semibold text-white">Active Projects</h2>
          </div>
          <div className="grid gap-3 p-5 md:grid-cols-2 max-h-[400px] overflow-y-auto custom-scrollbar">
            {PROJECT_REPORTS.map((project) => (
              <button
                key={project.id}
                onClick={() => {
                  setSelectedProjectId(project.id);
                  setSelectedCenterId(project.centers[0]?.id ?? "");
                }}
                className={`group relative overflow-hidden rounded-xl border p-5 text-left transition-all duration-300 ${
                  selectedProject?.id === project.id
                    ? "border-violet-500/50 bg-violet-500/10 shadow-[0_0_15px_rgba(139,92,246,0.1)]"
                    : "border-slate-800 bg-[#0b1220] hover:border-slate-600 hover:bg-slate-800/50"
                }`}
              >
                {selectedProject?.id === project.id && (
                  <div className="absolute top-0 left-0 w-1 h-full bg-violet-500"></div>
                )}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className={`font-semibold transition-colors ${selectedProject?.id === project.id ? "text-violet-200" : "text-slate-200 group-hover:text-white"}`}>
                      {project.name}
                    </p>
                    <div className="mt-1.5 flex items-center gap-1.5 text-xs text-slate-500">
                      <BriefcaseBusiness size={12} />
                      <span className="truncate">{project.fundingAgency}</span>
                    </div>
                  </div>
                  <span className={`inline-flex shrink-0 rounded-full border px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider ${
                    project.status === "Active" 
                      ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400" 
                      : "border-amber-500/20 bg-amber-500/10 text-amber-400"
                  }`}>
                    {project.status}
                  </span>
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-slate-700/50 pt-3">
                  <p className="text-xs font-medium text-slate-400">
                    <span className="text-white">{project.centers.length}</span> center{project.centers.length > 1 ? "s" : ""}
                  </p>
                  <ChevronRight size={14} className={`transition-transform duration-300 ${selectedProject?.id === project.id ? "text-violet-400 translate-x-1" : "text-slate-600 group-hover:text-slate-400"}`} />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Centers List */}
        <div className="flex flex-col rounded-2xl border border-slate-800 bg-[#111827] shadow-lg">
          <div className="flex items-center gap-3 border-b border-slate-800 px-6 py-5">
            <div className="rounded-lg bg-sky-500/10 p-2 text-sky-400">
              <MapPin size={18} />
            </div>
            <h2 className="text-base font-semibold text-white">Centers for {selectedProject?.name}</h2>
          </div>
          <div className="flex flex-col gap-3 p-5 max-h-[400px] overflow-y-auto custom-scrollbar">
            {selectedProject?.centers.map((center) => (
              <button
                key={center.id}
                onClick={() => setSelectedCenterId(center.id)}
                className={`group relative flex items-center justify-between overflow-hidden rounded-xl border p-4 text-left transition-all duration-300 ${
                  activeCenter?.id === center.id
                    ? "border-sky-500/50 bg-sky-500/10 shadow-[0_0_15px_rgba(14,165,233,0.1)]"
                    : "border-slate-800 bg-[#0b1220] hover:border-slate-600 hover:bg-slate-800/50"
                }`}
              >
                {activeCenter?.id === center.id && (
                  <div className="absolute top-0 left-0 w-1 h-full bg-sky-500"></div>
                )}
                <div>
                  <p className={`font-semibold transition-colors ${activeCenter?.id === center.id ? "text-sky-200" : "text-slate-200 group-hover:text-white"}`}>
                    {center.name}
                  </p>
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                    <Building2 size={12} />
                    {center.location}
                  </p>
                </div>
                <div className={`rounded-full p-1.5 transition-colors ${activeCenter?.id === center.id ? "bg-sky-500/20 text-sky-400" : "bg-slate-800 text-slate-500 group-hover:bg-slate-700 group-hover:text-slate-300"}`}>
                  <Activity size={14} />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* DASHBOARD DETAILS SECTION */}
      {selectedProject && activeCenter && (
        <div className="flex flex-col gap-6 rounded-2xl border border-slate-800 bg-[#111827] p-6 shadow-xl">
          
          {/* Header */}
          <div className="flex flex-col gap-4 border-b border-slate-800 pb-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-white">{activeCenter.name}</h2>
                <span className="rounded-md border border-slate-700 bg-slate-800 px-2 py-0.5 text-[10px] font-medium uppercase tracking-widest text-slate-400">
                  Center Pulse
                </span>
              </div>
              <p className="mt-1.5 flex items-center gap-2 text-sm text-slate-400">
                <span className="text-violet-400">{selectedProject.name}</span>
                <span className="h-1 w-1 rounded-full bg-slate-600"></span>
                <span>Managed by <span className="text-slate-200 font-medium">{activeCenter.manager}</span></span>
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2 rounded-xl border border-slate-700 bg-[#0b1220] px-4 py-2.5 text-sm whitespace-nowrap shadow-sm">
                <CalendarRange size={16} className="text-violet-400" />
                <span className="font-medium text-slate-300">{selectedProject.startDate} </span>
                <span className="text-slate-500">→</span>
                <span className="font-medium text-slate-300">{selectedProject.endDate}</span>
              </div>
              <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-2.5 text-sm shadow-sm">
                <Award size={16} className="text-emerald-400" />
                <span className="font-medium text-emerald-300">{activeCenter.placementRate}% Placement Rate</span>
              </div>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard label="Total Job Roles" value={activeCenter.jobRoles.length} icon={FolderKanban} color="text-fuchsia-400" bg="bg-fuchsia-500/10" />
            <MetricCard label="Staff / Employees" value={activeCenter.employees} icon={Users} color="text-blue-400" bg="bg-blue-500/10" />
            <MetricCard label="Active Candidates" value={activeCenter.candidates} icon={Users} color="text-amber-400" bg="bg-amber-500/10" />
            <MetricCard label="Open Grievances" value={activeCenter.grievances} icon={CircleAlert} color="text-red-400" bg="bg-red-500/10" isAlert={activeCenter.grievances > 0} />
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            {/* Performance Metrics */}
            <div className="rounded-2xl border border-slate-700 bg-[#0b1220] p-6 shadow-sm">
              <div className="mb-5 flex items-center gap-2 border-b border-slate-800 pb-3">
                <TrendingUp size={18} className="text-violet-400" />
                <h3 className="text-base font-semibold text-slate-200">Performance Metrics</h3>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {activeCenter.performanceMetrics.map((metric) => (
                  <div key={metric.label} className="group overflow-hidden rounded-xl border border-slate-800 bg-[#111827] p-4 transition-all hover:border-violet-500/30 hover:bg-slate-800/50">
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{metric.label}</p>
                    <p className="mt-2 text-xl font-bold text-white group-hover:text-violet-200 transition-colors">{metric.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Progress Gauges */}
            <div className="flex flex-col gap-4">
              <div className="flex-1 rounded-2xl border border-slate-700 bg-[#0b1220] p-6 shadow-sm">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-400">Attendance Rate</p>
                    <p className="mt-1 text-3xl font-bold text-white">{activeCenter.attendanceRate}%</p>
                  </div>
                  <div className="rounded-lg bg-sky-500/10 p-2 text-sky-400 mb-1">
                    <Activity size={20} />
                  </div>
                </div>
                <div className="mt-5 h-2.5 w-full overflow-hidden rounded-full bg-slate-800">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-sky-600 to-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.5)] transition-all duration-1000"
                    style={{ width: `${activeCenter.attendanceRate}%` }}
                  />
                </div>
              </div>

              <div className="flex-1 rounded-2xl border border-slate-700 bg-[#0b1220] p-6 shadow-sm">
                 <div className="flex items-end justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-400">Placement Target</p>
                    <p className="mt-1 text-3xl font-bold text-white">{activeCenter.placementRate}%</p>
                  </div>
                  <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-400 mb-1">
                    <Award size={20} />
                  </div>
                </div>
                <div className="mt-5 h-2.5 w-full overflow-hidden rounded-full bg-slate-800">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)] transition-all duration-1000"
                    style={{ width: `${activeCenter.placementRate}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Lists Area */}
          <div className="grid gap-6 xl:grid-cols-3">
            <div className="xl:col-span-3">
              <div className="rounded-2xl border border-slate-700 bg-[#0b1220] p-6 shadow-sm">
                <div className="mb-4 flex items-center gap-2 border-b border-slate-800 pb-3">
                  <BriefcaseBusiness size={18} className="text-violet-400" />
                  <h3 className="text-base font-semibold text-slate-200">Active Job Roles</h3>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {activeCenter.jobRoles.map((role) => (
                    <span key={role} className="rounded-lg border border-violet-500/20 bg-violet-500/10 px-4 py-2 text-sm font-medium text-violet-300 shadow-sm transition-colors hover:bg-violet-500/20">
                      {role}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <ListPanel 
              title="Key Personnel" 
              items={activeCenter.employeeList} 
              icon={Users} 
              onViewAll={() => openDetailedList("Key Personnel", activeCenter.employeeList, Users)}
            />
            <ListPanel 
              title="Recent Candidates" 
              items={activeCenter.candidateList} 
              icon={FileText} 
              onViewAll={() => openDetailedList("Recent Candidates", activeCenter.candidateList, FileText)}
            />
            <ListPanel 
              title="Active Grievances" 
              items={activeCenter.grievancesList} 
              icon={CircleAlert} 
              emptyMsg="No active grievances." 
              onViewAll={() => openDetailedList("Active Grievances", activeCenter.grievancesList, CircleAlert)}
            />
          </div>

        </div>
      )}

      {/* SlidePanel for Detailed Lists */}
      <SlidePanel
        open={listPanelConfig.isOpen}
        onClose={closeDetailedList}
        title={listPanelConfig.title}
        width="lg"
      >
        <div className="flex flex-col h-full bg-[#0a0e17]">
          {/* Header & Search */}
          <div className="border-b border-slate-800 p-6 z-10 sticky top-0 bg-[#0a0e17]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-violet-500/10 p-2.5 text-violet-400">
                  {listPanelConfig.icon && <listPanelConfig.icon size={20} />}
                </div>
                <div>
                   <h2 className="text-lg font-bold text-white">{listPanelConfig.title}</h2>
                   <p className="text-xs text-slate-400 mt-0.5">Showing {filteredPanelItems.length} records for {activeCenter?.name}</p>
                </div>
              </div>
            </div>

            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search list..."
                value={listPanelConfig.searchQuery}
                onChange={(e) => setListPanelConfig(prev => ({ ...prev, searchQuery: e.target.value }))}
                className="w-full rounded-xl border border-slate-700 bg-[#0f172a] py-2.5 pl-9 pr-4 text-sm text-white placeholder-slate-500 outline-none transition-all focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-3 pb-24">
            {filteredPanelItems.length > 0 ? (
              filteredPanelItems.map((item, idx) => (
                <div key={idx} className="group relative flex items-center gap-4 rounded-2xl border border-slate-800 bg-[#111827] p-4 transition-all hover:border-violet-500/30 hover:bg-slate-800/50">
                   <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-slate-700 to-slate-800 text-sm font-bold text-white shadow-inner">
                     {item.charAt(0)}
                   </div>
                   <div className="flex-1">
                      <p className="font-semibold text-slate-200 group-hover:text-white transition-colors">{item}</p>
                      <p className="text-xs text-slate-500 mt-0.5 tracking-wide">ID: {idx.toString().padStart(4, '0')}-{activeCenter?.name.substring(0,3).toUpperCase()}</p>
                   </div>
                </div>
              ))
            ) : (
              <div className="flex h-40 flex-col items-center justify-center py-8 text-center text-slate-500">
                <Search size={32} className="mb-3 opacity-20" />
                <p className="font-medium text-slate-400">No results found.</p>
                <p className="text-xs mt-1">Try adjusting your search query.</p>
              </div>
            )}
          </div>
          
          <div className="border-t border-slate-800 p-4 sticky bottom-0 bg-[#0a0e17]">
             <button 
                onClick={closeDetailedList}
                className="w-full rounded-xl bg-slate-800 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-700"
              >
               Close View
             </button>
          </div>
        </div>
      </SlidePanel>
    </div>
  );
}

function MetricCard({ label, value, icon: Icon, color, bg, isAlert }) {
  return (
    <div className={`group relative overflow-hidden rounded-2xl border p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${
      isAlert ? "border-red-500/30 bg-red-500/5 hover:border-red-500/50" : "border-slate-700 bg-[#0b1220] hover:border-slate-600 hover:bg-slate-800/50"
    }`}>
      {isAlert && <div className="absolute top-0 right-0 w-16 h-16 bg-red-500/10 blur-xl rounded-full translate-x-1/2 -translate-y-1/2"></div>}
      <div className="mb-3 flex items-center gap-3">
        <div className={`rounded-xl p-2 ${bg}`}>
          <Icon size={16} className={`${color} ${isAlert && "animate-pulse"}`} />
        </div>
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</span>
      </div>
      <p className={`text-3xl font-bold tracking-tight ${isAlert ? "text-red-400" : "text-white"}`}>{value}</p>
    </div>
  );
}

function ListPanel({ title, items, icon: Icon, emptyMsg = "No items found.", onViewAll }) {
  // Show only up to 5 items in the preview panel
  const previewItems = items.slice(0, 5);
  const hasMore = items.length > 5;

  return (
    <div className="flex flex-col rounded-2xl border border-slate-700 bg-[#0b1220] shadow-sm overflow-hidden text-sm max-h-[350px]">
      <div className="flex items-center gap-2 border-b border-slate-800 bg-slate-800/30 px-5 py-4">
        <Icon size={16} className="text-slate-400" />
        <h3 className="font-semibold text-slate-200">{title}</h3>
        <span className="ml-auto rounded-full bg-slate-800 px-2 py-0.5 text-xs font-medium text-slate-400">
          {items.length}
        </span>
      </div>
      <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
        {previewItems.length > 0 ? (
          <ul className="space-y-1.5">
            {previewItems.map((item, idx) => (
              <li key={idx} className="flex items-center gap-3 rounded-xl border border-transparent px-3 py-2.5 text-slate-300 transition-colors hover:border-slate-700 hover:bg-slate-800/50">
                <div className="h-1.5 w-1.5 rounded-full bg-slate-600"></div>
                {item}
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex h-full flex-col items-center justify-center py-8 text-center text-slate-500">
            <Icon size={24} className="mb-2 opacity-20" />
            <p className="text-xs">{emptyMsg}</p>
          </div>
        )}
        
        {/* View All Button */}
        {(hasMore || previewItems.length > 0) && (
          <button 
            onClick={onViewAll}
            className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-xs font-semibold text-slate-300 transition-colors hover:bg-slate-700 hover:text-white"
          >
            <span>View All</span>
            <ExternalLink size={14} className="opacity-70" />
          </button>
        )}
      </div>
    </div>
  );
}
