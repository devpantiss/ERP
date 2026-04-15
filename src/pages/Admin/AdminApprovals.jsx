import { useState, useMemo } from "react";
import { 
  CheckCircle2, 
  ClipboardList, 
  Eye, 
  XCircle, 
  BookOpen, 
  Megaphone, 
  BriefcaseBusiness,
  Search,
  Filter
} from "lucide-react";
import SlidePanel from "../../components/common/SlidePanel";
import { TRAINER_APPROVALS, MOBILIZER_APPROVALS, PLACEMENT_APPROVALS } from "./adminPortalData";

const statusStyles = {
  Pending: "bg-amber-500/10 text-amber-300 border-amber-500/20",
  Reviewed: "bg-sky-500/10 text-sky-400 border-sky-500/20",
  Approved: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
};

const tabs = [
  { id: "trainer", label: "Trainer Approvals", icon: BookOpen },
  { id: "mobilizer", label: "Mobilizer Approvals", icon: Megaphone },
  { id: "placement", label: "Placement Approvals", icon: BriefcaseBusiness },
];

export default function AdminApprovals() {
  const [activeTab, setActiveTab] = useState("trainer");
  const [searchQuery, setSearchQuery] = useState("");
  
  // State for each role's approvals to handle independent updates
  const [trainerReqs, setTrainerReqs] = useState(TRAINER_APPROVALS);
  const [mobilizerReqs, setMobilizerReqs] = useState(MOBILIZER_APPROVALS);
  const [placementReqs, setPlacementReqs] = useState(PLACEMENT_APPROVALS);
  
  const [selectedRequest, setSelectedRequest] = useState(null);

  // Derived active data based on tab
  const activeData = useMemo(() => {
    switch (activeTab) {
      case "trainer": return trainerReqs;
      case "mobilizer": return mobilizerReqs;
      case "placement": return placementReqs;
      default: return [];
    }
  }, [activeTab, trainerReqs, mobilizerReqs, placementReqs]);

  // Filtered by search
  const filteredData = useMemo(() => {
    return activeData.filter(req => {
      const searchStr = `${req.id} ${req.requestType} ${req.center} ${req.status}`.toLowerCase();
      return searchStr.includes(searchQuery.toLowerCase());
    });
  }, [activeData, searchQuery]);

  const updateStatus = (id, newStatus) => {
    if (activeTab === "trainer") {
      setTrainerReqs(curr => curr.map(r => r.id === id ? { ...r, status: newStatus } : r));
    } else if (activeTab === "mobilizer") {
      setMobilizerReqs(curr => curr.map(r => r.id === id ? { ...r, status: newStatus } : r));
    } else if (activeTab === "placement") {
      setPlacementReqs(curr => curr.map(r => r.id === id ? { ...r, status: newStatus } : r));
    }
  };

  // Helper to determine the "person" name column based on active tab
  const getPersonNameTitle = () => {
    if (activeTab === "trainer") return "Trainer";
    if (activeTab === "mobilizer") return "Mobilizer";
    return "Placement Officer";
  };

  const getPersonName = (req) => {
    if (activeTab === "trainer") return req.trainer;
    if (activeTab === "mobilizer") return req.mobilizer;
    return req.officer;
  };

  // Helper for tab specific context column (Batch vs Location vs Entity)
  const getContextTitle = () => {
    if (activeTab === "trainer") return "Batch Info";
    if (activeTab === "mobilizer") return "Location";
    return "Corporate Entity";
  };

  const getContextValue = (req) => {
    if (activeTab === "trainer") return req.batch;
    if (activeTab === "mobilizer") return req.location;
    return req.entity;
  };

  return (
    <div className="space-y-6 lg:space-y-8">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Approvals <span className="text-violet-400">Hub</span>
          </h1>
          <p className="mt-2 text-sm text-slate-400 max-w-2xl">
            Centralized command center for reviewing and granting operational approvals across Trainers, Mobilizers, and Placement Officers.
          </p>
        </div>
      </div>

      {/* METRICS & SUMMARY */}
      <div className="grid gap-4 md:grid-cols-3">
        <SummaryCard
          label="Total Active Requests"
          value={activeData.length}
          icon={ClipboardList}
          color="text-violet-400"
          bg="bg-violet-500/10"
        />
        <SummaryCard
          label="Pending Review"
          value={activeData.filter((request) => request.status === "Pending").length}
          icon={Eye}
          color="text-amber-400"
          bg="bg-amber-500/10"
        />
        <SummaryCard
          label="Granted & Approved"
          value={activeData.filter((request) => request.status === "Approved").length}
          icon={CheckCircle2}
          color="text-emerald-400"
          bg="bg-emerald-500/10"
        />
      </div>

      {/* TABS & MAIN TABLE CONTAINER */}
      <div className="rounded-2xl border border-slate-800 bg-[#111827] shadow-xl overflow-hidden flex flex-col">
        
        {/* Advanced Toolbar */}
        <div className="flex flex-col gap-4 border-b border-slate-800 bg-[#0b1220] p-4 lg:flex-row lg:items-center xl:px-6">
          
          {/* Segmented Control Tabs */}
          <div className="flex w-full overflow-x-auto rounded-xl bg-slate-800/50 p-1 custom-scrollbar lg:w-max shrink-0">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setSearchQuery(""); // reset search on tab switch
                }}
                className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? "bg-violet-500/20 text-violet-300 shadow-sm border border-violet-500/30"
                    : "text-slate-400 hover:bg-slate-700/50 hover:text-slate-200 border border-transparent"
                }`}
              >
                <tab.icon size={16} className={activeTab === tab.id ? "text-violet-400" : "opacity-50"} />
                <span className="whitespace-nowrap">{tab.label}</span>
              </button>
            ))}
          </div>

          <div className="h-8 w-px bg-slate-800 hidden lg:block"></div>

          {/* Search & Filters */}
          <div className="flex w-full items-center gap-3 lg:ml-auto lg:w-[350px]">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search requests..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-[#0f172a] py-2.5 pl-9 pr-4 text-sm text-white placeholder-slate-500 transition-all focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
              />
            </div>
            <button className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-xl border border-slate-700 bg-[#0f172a] text-slate-400 transition-colors hover:bg-slate-800 hover:text-white">
              <Filter size={18} />
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] text-sm text-left">
            <thead className="bg-[#0b1220] text-xs uppercase tracking-wider text-slate-500 border-b border-slate-800">
              <tr>
                <th className="px-6 py-4 font-semibold">Request ID</th>
                <th className="px-6 py-4 font-semibold">{getPersonNameTitle()}</th>
                <th className="px-6 py-4 font-semibold">Center</th>
                <th className="px-6 py-4 font-semibold">Approval Type</th>
                <th className="px-6 py-4 font-semibold">{getContextTitle()}</th>
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredData.length > 0 ? (
                filteredData.map((request) => (
                  <tr key={request.id} className="group hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-200">{request.id}</td>
                    <td className="px-6 py-4 text-slate-300">
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-800 text-[10px] font-bold text-white">
                          {getPersonName(request).charAt(0)}
                        </div>
                        {getPersonName(request)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-400">{request.center}</td>
                    <td className="px-6 py-4 font-medium text-violet-200">{request.requestType}</td>
                    <td className="px-6 py-4 text-slate-400">{getContextValue(request)}</td>
                    <td className="px-6 py-4 text-slate-500">{request.submittedOn}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold tracking-wide ${statusStyles[request.status] || "bg-slate-800 border-slate-700 text-slate-300"}`}>
                        {request.status === "Approved" && <CheckCircle2 size={12} className="mr-1.5" />}
                        {request.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setSelectedRequest(request)}
                          className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-slate-700"
                        >
                          Review
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-500">
                    <ClipboardList size={32} className="mx-auto mb-3 opacity-20" />
                    <p className="font-medium text-slate-400">No approval requests found.</p>
                    <p className="text-xs mt-1">Try adjusting your active tab or search filters.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* SlidePanel for Detailed Review */}
      <SlidePanel
        open={Boolean(selectedRequest)}
        onClose={() => setSelectedRequest(null)}
        title={selectedRequest ? "Approval Review" : ""}
        width="lg"
      >
        {selectedRequest && (
          <div className="flex h-full flex-col bg-[#0a0e17]">
            {/* Context Header */}
            <div className="border-b border-slate-800 p-6 bg-[#0b1220] shrink-0 sticky top-0 z-10">
               <div className="flex items-start justify-between">
                 <div>
                    <h2 className="text-xl font-bold text-white">{selectedRequest.requestType}</h2>
                    <p className="mt-1 flex items-center gap-2 text-sm text-slate-400">
                      ID: <span className="font-mono text-slate-300">{selectedRequest.id}</span>
                      <span className="w-1 h-1 rounded-full bg-slate-600"></span>
                      {selectedRequest.submittedOn}
                    </p>
                 </div>
                 <span className={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-semibold tracking-wide ${statusStyles[selectedRequest.status]}`}>
                    {selectedRequest.status}
                  </span>
               </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              <div className="grid gap-4 sm:grid-cols-2">
                <DetailCard label={getPersonNameTitle()} value={getPersonName(selectedRequest)} />
                <DetailCard label="Center & Location" value={selectedRequest.center} />
                <DetailCard label={getContextTitle()} value={getContextValue(selectedRequest)} />
                <DetailCard label="Date Submitted" value={selectedRequest.submittedOn} />
              </div>

              <div className="rounded-2xl border border-slate-800 bg-[#111827] overflow-hidden">
                <div className="border-b border-slate-800 bg-slate-800/30 px-5 py-3">
                  <h3 className="text-sm font-semibold text-slate-300">Justification & Remarks</h3>
                </div>
                <div className="p-5">
                  <p className="text-sm leading-relaxed text-slate-300">
                    {selectedRequest.remarks || "No additional remarks provided."}
                  </p>
                </div>
              </div>

               <div className="rounded-2xl border border-dashed border-violet-500/30 bg-violet-500/5 p-6 flex flex-col items-center justify-center text-center">
                  <BookOpen size={24} className="text-violet-400/50 mb-2" />
                  <p className="text-sm text-violet-200">Supporting documentation is available.</p>
                  <button className="mt-3 text-xs font-semibold text-violet-400 hover:text-violet-300 underline underline-offset-2">View Attachments</button>
               </div>
            </div>

            {/* Sticky Action Footer */}
            <div className="border-t border-slate-800 bg-[#0b1220] p-6 shrink-0 sticky bottom-0">
               <div className="flex items-center justify-between">
                 <button
                    onClick={() => setSelectedRequest(null)}
                    className="rounded-xl px-5 py-2.5 text-sm font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  >
                    Cancel
                 </button>
                 <div className="flex items-center gap-3">
                   {selectedRequest.status === "Pending" && (
                      <button
                        onClick={() => {
                          updateStatus(selectedRequest.id, "Reviewed");
                          setSelectedRequest(null);
                        }}
                        className="rounded-xl border border-amber-500/50 bg-amber-500/10 px-5 py-2.5 text-sm font-semibold text-amber-500 transition-colors hover:bg-amber-500/20"
                      >
                        Mark as Reviewed
                      </button>
                   )}
                   {selectedRequest.status !== "Approved" && (
                     <button
                        onClick={() => {
                          updateStatus(selectedRequest.id, "Approved");
                          setSelectedRequest(null);
                        }}
                        className="flex items-center gap-2 rounded-xl bg-violet-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 transition-all hover:bg-violet-400"
                      >
                        <CheckCircle2 size={16} />
                        Grant Approval
                      </button>
                   )}
                 </div>
               </div>
            </div>
          </div>
        )}
      </SlidePanel>
    </div>
  );
}

function SummaryCard({ label, value, icon: Icon, color, bg }) {
  return (
    <div className="group overflow-hidden rounded-2xl border border-slate-800 bg-[#111827] p-5 transition-all hover:border-slate-700 hover:bg-[#151e2f]">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-slate-400 uppercase tracking-wider">{label}</span>
        <div className={`rounded-xl p-2.5 ${bg}`}>
          <Icon size={18} className={color} />
        </div>
      </div>
      <p className="text-4xl font-bold tracking-tight text-white">{value}</p>
    </div>
  );
}

function DetailCard({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-[#0f172a] p-4">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="mt-1.5 text-sm font-semibold text-slate-200">{value}</p>
    </div>
  );
}
