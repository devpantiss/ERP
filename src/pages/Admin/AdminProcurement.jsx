import { useState } from "react";
import {
  Building2,
  CircleAlert,
  PackageCheck,
  ShoppingCart,
  Search,
  Filter,
  ArrowDownToLine,
  Plus,
  CheckCircle2,
  XCircle,
  Eye,
  Activity,
  Box,
  MapPin,
  IndianRupee,
  Calendar,
} from "lucide-react";
import { PROCUREMENT_ITEMS } from "./adminPortalData";
import SlidePanel from "../../components/common/SlidePanel"; // Adjust path if necessary

export default function AdminProcurement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [isNewRequestOpen, setIsNewRequestOpen] = useState(false);

  const totalBudget = PROCUREMENT_ITEMS.reduce((sum, item) => sum + item.budget, 0);

  const cards = [
    {
      label: "Total Requests",
      value: PROCUREMENT_ITEMS.length,
      icon: ShoppingCart,
      trend: "+12% this month",
    },
    {
      label: "Pending Approval",
      value: PROCUREMENT_ITEMS.filter((item) => item.status === "Pending Approval").length,
      icon: CircleAlert,
      trend: "Requires attention",
    },
    {
      label: "Approved Items",
      value: PROCUREMENT_ITEMS.filter((item) => item.status === "Approved").length,
      icon: PackageCheck,
      trend: "Processed on time",
    },
    {
      label: "Total Budget Requested",
      value: `₹${(totalBudget / 100000).toFixed(2)}L`,
      icon: Building2,
      trend: "Within Q3 limits",
    },
  ];

  const urgencyStyles = {
    High: "bg-red-500/10 text-red-400 border border-red-500/20",
    Medium: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
    Low: "bg-sky-500/10 text-sky-400 border border-sky-500/20",
  };

  const statusStyles = {
    "Pending Approval": "bg-amber-500/10 text-amber-400 border border-amber-500/20",
    "Approved": "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
    "Vendor Review": "bg-blue-500/10 text-blue-400 border border-blue-500/20",
    "Rejected": "bg-red-500/10 text-red-400 border border-red-500/20",
  };

  const filteredItems = PROCUREMENT_ITEMS.filter((item) => {
    const matchesSearch = item.item.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.requestedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "All" || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* HEADER SECTION */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-100">
            Procurement
          </h1>
          <p className="mt-1 text-sm text-white/60">
            Enterprise resource pipeline for equipment, software, and consumable assets.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 rounded-lg border border-slate-700 bg-[#111827] px-4 py-2 text-white/80 hover:bg-slate-800 transition-colors">
            <ArrowDownToLine size={16} className="text-slate-400" />
            <span className="text-sm font-medium">Export CSV</span>
          </button>
          <button 
            onClick={() => setIsNewRequestOpen(true)}
            className="flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-500 transition-colors shadow-sm"
          >
            <Plus size={16} />
            New Request
          </button>
        </div>
      </div>

      {/* METRICS CARDS */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card, idx) => (
          <div
            key={idx}
            className="rounded-2xl border border-slate-700 bg-[#111827] p-5 shadow-sm transition hover:border-slate-600 hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-white/60">{card.label}</p>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl font-semibold text-white">{card.value}</span>
                </div>
              </div>
              <div className="rounded-lg bg-violet-500/10 p-2.5 text-violet-400">
                <card.icon size={20} />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1.5 text-xs text-white/50">
              <Activity size={14} />
              <span className="truncate">{card.trend}</span>
            </div>
          </div>
        ))}
      </div>

      {/* DATA TABLE SECTION */}
      <div className="flex flex-col overflow-hidden rounded-2xl border border-slate-700 bg-[#111827] shadow-sm">
        {/* Table Toolbar */}
        <div className="flex flex-col gap-4 border-b border-slate-700 p-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-semibold text-white">All Requisitions</h2>
            <span className="rounded-full bg-slate-800 px-2.5 py-0.5 text-xs font-medium text-slate-300">
              {filteredItems.length} items
            </span>
          </div>
          
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            {/* Search */}
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search requests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-slate-600 bg-[#0b1220] py-2 pl-9 pr-4 text-sm text-white placeholder-slate-500 outline-none transition-all focus:border-violet-500 focus:ring-1 focus:ring-violet-500 sm:w-64"
              />
            </div>
            {/* Filter Dropdown */}
            <div className="relative">
               <div className="flex items-center justify-between rounded-lg border border-slate-600 bg-[#0b1220] px-3 py-2 text-sm text-slate-300 focus-within:border-violet-500 focus-within:ring-1 focus-within:ring-violet-500">
                  <Filter size={16} className="text-slate-400 mr-2" />
                  <select 
                    className="bg-transparent outline-none appearance-none pr-4 w-full cursor-pointer"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="All">All Statuses</option>
                    <option value="Pending Approval">Pending Approval</option>
                    <option value="Approved">Approved</option>
                    <option value="Vendor Review">Vendor Review</option>
                  </select>
               </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px] text-left text-sm whitespace-nowrap">
            <thead className="bg-[#0b1220] text-slate-400 text-xs font-semibold uppercase tracking-wider border-b border-slate-700">
              <tr>
                <th className="px-6 py-4">Request ID</th>
                <th className="px-6 py-4">Item Details</th>
                <th className="px-6 py-4">Requested By</th>
                <th className="px-6 py-4">Center</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Urgency</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/60">
              {filteredItems.map((item) => (
                <tr key={item.id} className="transition-colors hover:bg-slate-800/50 group">
                  <td className="px-6 py-4 font-medium text-slate-300">
                    {item.id}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-white/90">{item.item}</div>
                    <div className="text-xs text-white/50 mt-0.5">Qty: {item.quantity} units</div>
                  </td>
                  <td className="px-6 py-4 text-white/70">
                    {item.requestedBy}
                  </td>
                  <td className="px-6 py-4 text-white/70">{item.center}</td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-white/90">₹{item.budget.toLocaleString("en-IN")}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-all ${
                        urgencyStyles[item.urgency] || "bg-slate-700/50 text-white/70"
                      }`}
                    >
                      {item.urgency === "High" && <div className="h-1.5 w-1.5 rounded-full bg-red-400"></div>}
                      {item.urgency === "Medium" && <div className="h-1.5 w-1.5 rounded-full bg-amber-400"></div>}
                      {item.urgency === "Low" && <div className="h-1.5 w-1.5 rounded-full bg-sky-400"></div>}
                      {item.urgency}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                        statusStyles[item.status] || "bg-slate-700/50 text-white/70"
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                      <button className="rounded p-1.5 text-slate-400 hover:bg-emerald-500/10 hover:text-emerald-400 transition-colors" title="Approve">
                        <CheckCircle2 size={16} />
                      </button>
                      <button className="rounded p-1.5 text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors" title="Reject">
                        <XCircle size={16} />
                      </button>
                      <button className="rounded p-1.5 text-slate-400 hover:bg-violet-500/10 hover:text-violet-400 transition-colors" title="View Details">
                        <Eye size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              
              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center">
                      <ShoppingCart size={28} className="mb-3 text-slate-600" />
                      <p>No procurement requests found.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* NEW REQUEST SLIDE PANEL */}
      <SlidePanel 
        open={isNewRequestOpen} 
        onClose={() => setIsNewRequestOpen(false)} 
        title="Create Procurement Request" 
        width="2xl"
      >
        <div className="flex h-full flex-col">
          <div className="flex-1 space-y-8 overflow-y-auto pr-2 pb-24">
            
            <section>
              <div className="mb-4 flex items-center gap-2 border-b border-white/10 pb-2">
                <Box size={16} className="text-violet-400" />
                <h3 className="text-sm font-medium uppercase tracking-wider text-slate-300">Item Information</h3>
              </div>
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-medium text-slate-400">Item Name <span className="text-red-400">*</span></label>
                  <input
                    type="text"
                    placeholder="e.g. Dell Optiplex Desktop Systems"
                    className="w-full rounded-lg border border-slate-700 bg-[#0b1220] p-2.5 text-sm text-white outline-none transition-all focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-400">Category <span className="text-red-400">*</span></label>
                  <select className="w-full rounded-lg border border-slate-700 bg-[#0b1220] p-2.5 text-sm text-white outline-none transition-all focus:border-violet-500 focus:ring-1 focus:ring-violet-500 appearance-none">
                    <option value="">Select Category</option>
                    <option value="IT Equipment">IT Equipment (Laptops, Desktops, Network)</option>
                    <option value="Lab Assets">Lab Assets (Welding, Sewing, etc.)</option>
                    <option value="Consumables">Training Consumables</option>
                    <option value="Furniture">Center Furniture</option>
                    <option value="Safety Gear">Safety Gear / PPE</option>
                  </select>
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-400">Quantity <span className="text-red-400">*</span></label>
                  <input
                    type="number"
                    min="1"
                    placeholder="e.g. 10"
                    className="w-full rounded-lg border border-slate-700 bg-[#0b1220] p-2.5 text-sm text-white outline-none transition-all focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                  />
                </div>
              </div>
            </section>

            <section>
              <div className="mb-4 flex items-center gap-2 border-b border-white/10 pb-2">
                <IndianRupee size={16} className="text-violet-400" />
                <h3 className="text-sm font-medium uppercase tracking-wider text-slate-300">Budget & Need</h3>
              </div>
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-400">Estimated Total Budget (₹) <span className="text-red-400">*</span></label>
                  <input
                    type="number"
                    placeholder="Total amount in INR"
                    className="w-full rounded-lg border border-slate-700 bg-[#0b1220] p-2.5 text-sm text-white outline-none transition-all focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-400">Urgency Level <span className="text-red-400">*</span></label>
                  <div className="grid grid-cols-3 gap-2">
                    <label className="flex cursor-pointer items-center justify-center rounded-lg border border-slate-700 bg-[#0b1220] p-2 hover:bg-slate-800 shrink-0 has-[:checked]:border-red-500/80 has-[:checked]:bg-red-500/10">
                      <input type="radio" name="urgency" className="sr-only" value="High" />
                      <span className="text-xs font-medium text-white/80">High</span>
                    </label>
                    <label className="flex cursor-pointer items-center justify-center rounded-lg border border-slate-700 bg-[#0b1220] p-2 hover:bg-slate-800 shrink-0 has-[:checked]:border-amber-500/80 has-[:checked]:bg-amber-500/10">
                      <input type="radio" name="urgency" className="sr-only" value="Medium" defaultChecked />
                      <span className="text-xs font-medium text-white/80">Medium</span>
                    </label>
                    <label className="flex cursor-pointer items-center justify-center rounded-lg border border-slate-700 bg-[#0b1220] p-2 hover:bg-slate-800 shrink-0 has-[:checked]:border-sky-500/80 has-[:checked]:bg-sky-500/10">
                      <input type="radio" name="urgency" className="sr-only" value="Low" />
                      <span className="text-xs font-medium text-white/80">Low</span>
                    </label>
                  </div>
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-medium text-slate-400">Required By Date</label>
                  <div className="relative">
                    <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="date"
                      className="w-full rounded-lg border border-slate-700 bg-[#0b1220] p-2.5 pl-10 text-sm text-white outline-none transition-all focus:border-violet-500 focus:ring-1 focus:ring-violet-500 [&::-webkit-calendar-picker-indicator]:filter-[invert(1)] [&::-webkit-calendar-picker-indicator]:opacity-50"
                    />
                  </div>
                </div>
              </div>
            </section>

            <section>
              <div className="mb-4 flex items-center gap-2 border-b border-white/10 pb-2">
                <MapPin size={16} className="text-violet-400" />
                <h3 className="text-sm font-medium uppercase tracking-wider text-slate-300">Assignment & Justification</h3>
              </div>
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-400">Requested For Center <span className="text-red-400">*</span></label>
                  <select className="w-full rounded-lg border border-slate-700 bg-[#0b1220] p-2.5 text-sm text-white outline-none transition-all focus:border-violet-500 focus:ring-1 focus:ring-violet-500 appearance-none">
                    <option value="">Select Center</option>
                    <option value="Angul">Angul (PMKVY 4.0)</option>
                    <option value="Jharsuguda">Jharsuguda (CSR - Tata Steel)</option>
                    <option value="Kalahandi">Kalahandi (DDUGKY)</option>
                    <option value="Keonjhar">Keonjhar (DMF Keonjhar)</option>
                    <option value="Sundargarh">Sundargarh (Shaksham)</option>
                  </select>
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-400">Upload Quotation (Optional)</label>
                  <div className="flex items-center justify-center w-full">
                    <label className="flex w-full cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-slate-700 bg-[#0b1220] p-2.5 transition-all hover:bg-slate-800">
                      <div className="flex flex-row items-center gap-2 text-slate-400">
                        <ArrowDownToLine size={16} />
                        <span className="text-sm">Click to upload quote pdf</span>
                      </div>
                      <input type="file" className="hidden" accept=".pdf,.png,.jpg,.jpeg" />
                    </label>
                  </div>
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-medium text-slate-400">Justification / Remarks <span className="text-red-400">*</span></label>
                  <textarea
                    rows="3"
                    placeholder="Briefly describe why this item is needed..."
                    className="w-full resize-none rounded-lg border border-slate-700 bg-[#0b1220] p-2.5 text-sm text-white outline-none transition-all focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                  ></textarea>
                </div>
              </div>
            </section>

          </div>

          <div className="absolute bottom-0 left-0 right-0 border-t border-slate-700 bg-[#111827] p-4">
            <div className="flex items-center justify-end gap-3">
              <button 
                onClick={() => setIsNewRequestOpen(false)}
                className="rounded-lg border border-slate-700 bg-[#0b1220] px-4 py-2 text-sm font-medium text-white/80 hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button 
                className="rounded-lg bg-violet-600 px-6 py-2 text-sm font-medium text-white hover:bg-violet-500 transition-colors shadow-sm"
              >
                Submit Request
              </button>
            </div>
          </div>
        </div>
      </SlidePanel>
    </div>
  );
}
