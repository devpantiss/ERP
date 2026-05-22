import { useState, useRef, useEffect } from "react";
import SlidePanel from "../../common/SlidePanel";
import {
  FaBriefcase,
  FaBuilding,
  FaMapMarkerAlt,
  FaMoneyBillWave,
  FaUsers,
  FaClipboardList,
  FaFileAlt,
  FaCalendarAlt,
  FaTags,
  FaPlus,
  FaTimes,
  FaCheckCircle,
  FaInfoCircle,
} from "react-icons/fa";

/* ═══════════════════════════════════════════════════════════════
   ADD JOB OPENING FORM  —  Zoho Projects-style slide panel form
   ═══════════════════════════════════════════════════════════════ */

const INITIAL_FORM = {
  jobTitle: "",
  company: "",
  role: "",
  department: "",
  jobType: "",
  experience: "",
  vacancies: "",
  salary: "",
  salaryType: "Monthly",
  location: "",
  state: "",
  district: "",
  country: "India",
  description: "",
  eligibility: "",
  qualifications: "",
  skills: [],
  benefits: "",
  applicationDeadline: "",
  startDate: "",
  contactPerson: "",
  contactEmail: "",
  contactPhone: "",
  priority: "Medium",
  status: "Open",
  notes: "",
};

const COMPANY_OPTIONS = [
  "Tata Steel",
  "JSW Steel",
  "Aditya Aluminium",
  "Vedanta",
  "Jindal Steel",
  "Reliance Industries",
  "L&T Construction",
  "Adani Group",
  "NALCO",
  "SAIL",
  "Hindalco",
  "Essar Steel",
];

const ROLE_OPTIONS = [
  "Electrical Technician",
  "Fitter",
  "Welder",
  "Machine Operator",
  "CNC Operator",
  "Mechanical Technician",
  "Quality Inspector",
  "Warehouse Associate",
  "Safety Officer",
  "Maintenance Technician",
  "Plant Operator",
  "Instrument Technician",
];

const JOB_TYPE_OPTIONS = [
  "Full-Time",
  "Part-Time",
  "Contract",
  "Apprenticeship",
  "Internship",
];

const EXPERIENCE_OPTIONS = [
  "Fresher",
  "0-1 Year",
  "1-2 Years",
  "2-3 Years",
  "3-5 Years",
  "5+ Years",
];

const PRIORITY_OPTIONS = ["Low", "Medium", "High", "Urgent"];

const STATE_OPTIONS = [
  "Odisha",
  "Jharkhand",
  "Chhattisgarh",
  "West Bengal",
  "Andhra Pradesh",
  "Karnataka",
  "Tamil Nadu",
  "Maharashtra",
  "Gujarat",
];

const SKILL_SUGGESTIONS = [
  "Welding",
  "Electrical Wiring",
  "PLC Programming",
  "CNC Operations",
  "Quality Control",
  "Safety Compliance",
  "AutoCAD",
  "Blueprint Reading",
  "Maintenance",
  "Troubleshooting",
  "Forklift Operation",
  "Instrument Calibration",
];

export default function AddJobOpeningForm({ open, onClose, onSubmit }) {
  const [form, setForm] = useState({ ...INITIAL_FORM });
  const [activeSection, setActiveSection] = useState("basic");
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const scrollContainerRef = useRef(null);
  const sectionRefs = {
    basic: useRef(null),
    location: useRef(null),
    details: useRef(null),
    contact: useRef(null),
  };

  const update = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  /* ── Scroll spy (uses the right-side scroll container as root) ── */
  useEffect(() => {
    if (!open) return;

    // Small delay to let the panel mount and refs attach
    const timer = setTimeout(() => {
      const container = scrollContainerRef.current;
      if (!container) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActiveSection(entry.target.dataset.section);
            }
          });
        },
        { root: container, threshold: 0.3 }
      );

      Object.values(sectionRefs).forEach((ref) => {
        if (ref.current) observer.observe(ref.current);
      });

      return () => observer.disconnect();
    }, 100);

    return () => clearTimeout(timer);
  }, [open]);

  /* ── Validation ── */
  function validate() {
    const newErrors = {};
    if (!form.company) newErrors.company = "Company is required";
    if (!form.role) newErrors.role = "Role is required";
    if (!form.vacancies) newErrors.vacancies = "Vacancies count is required";
    if (!form.salary) newErrors.salary = "Salary is required";
    if (!form.location) newErrors.location = "Location is required";
    if (!form.description)
      newErrors.description = "Job description is required";
    if (!form.eligibility) newErrors.eligibility = "Eligibility is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  /* ── Submit ── */
  function handleSubmit() {
    if (!validate()) return;
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setShowSuccess(true);
      console.log("Job Opening Created:", form);

      if (onSubmit) onSubmit(form);

      setTimeout(() => {
        setShowSuccess(false);
        setForm({ ...INITIAL_FORM });
        onClose();
      }, 1800);
    }, 800);
  }

  function handleSaveDraft() {
    console.log("Draft Saved:", form);
    alert("Job opening saved as draft");
  }

  function scrollToSection(section) {
    const el = sectionRefs[section]?.current;
    const container = scrollContainerRef.current;
    if (el && container) {
      container.scrollTo({
        top: el.offsetTop - container.offsetTop,
        behavior: "smooth",
      });
    }
  }

  const sections = [
    { id: "basic", label: "Basic Info", icon: <FaBriefcase /> },
    { id: "location", label: "Location", icon: <FaMapMarkerAlt /> },
    { id: "details", label: "Details", icon: <FaClipboardList /> },
    { id: "contact", label: "Contact", icon: <FaUsers /> },
  ];

  const filled = [
    form.company && form.role && form.vacancies && form.salary,
    form.location,
    form.description && form.eligibility,
    form.contactPerson,
  ];

  if (!open) return null;

  return (
    <SlidePanel
      open={open}
      onClose={onClose}
      title="Add Job Opening"
      width="4xl"
    >
      {/* ── Success Toast ─────────────────────── */}
      {showSuccess && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-emerald-500/90 backdrop-blur-md text-black px-5 py-3 rounded-xl shadow-2xl shadow-emerald-500/30 animate-[slideDown_0.3s_ease]">
          <FaCheckCircle className="text-lg" />
          <span className="font-semibold text-sm">
            Job Opening Created Successfully!
          </span>
        </div>
      )}

      {/* ── Main layout: fixed left + scrollable right ── */}
      <div className="flex gap-0 h-[calc(100vh-140px)] -m-6 -mb-6">

        {/* ── Left sidebar nav (fixed, no scroll) ─── */}
        <div className="hidden md:flex flex-col gap-1 w-52 shrink-0 p-6 pr-4 border-r border-white/[0.06] bg-[#070d1a]">
          <div className="text-[10px] uppercase tracking-widest text-white/25 mb-3 px-3">
            Sections
          </div>

          {sections.map((sec, idx) => (
            <button
              key={sec.id}
              onClick={() => scrollToSection(sec.id)}
              className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm transition-all duration-200 ${
                activeSection === sec.id
                  ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/30"
                  : "text-white/50 hover:text-white/80 hover:bg-white/5 border border-transparent"
              }`}
            >
              <span
                className={`text-xs ${
                  activeSection === sec.id
                    ? "text-cyan-400"
                    : "text-white/30 group-hover:text-white/50"
                }`}
              >
                {sec.icon}
              </span>
              <span className="flex-1">{sec.label}</span>
              {filled[idx] && (
                <FaCheckCircle className="text-emerald-400 text-[10px]" />
              )}
            </button>
          ))}

          {/* Progress */}
          <div className="mt-6 px-3">
            <div className="text-[10px] uppercase tracking-wider text-white/30 mb-2">
              Completion
            </div>
            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 rounded-full transition-all duration-500"
                style={{
                  width: `${
                    (filled.filter(Boolean).length / filled.length) * 100
                  }%`,
                }}
              />
            </div>
            <div className="text-[10px] text-white/40 mt-1">
              {filled.filter(Boolean).length}/{filled.length} sections
            </div>
          </div>

          {/* Required fields hint */}
          <div className="mt-auto px-3 pt-4 border-t border-white/[0.06]">
            <div className="flex items-center gap-2 text-white/30 text-[10px]">
              <FaInfoCircle className="text-[9px]" />
              <span>
                <span className="text-red-400">*</span> Required fields
              </span>
            </div>
          </div>
        </div>

        {/* ── Right form body (scrollable) ─── */}
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto overflow-x-hidden p-6 pb-24"
        >
          <div className="space-y-8">
            {/* ━━━ BASIC INFO ━━━ */}
            <div ref={sectionRefs.basic} data-section="basic">
              <SectionHeader
                icon={<FaBriefcase />}
                title="Basic Information"
                subtitle="Core details about the job opening"
              />

              <div className="grid md:grid-cols-2 gap-4 mt-5">
                <FormInput
                  label="Job Title"
                  placeholder="e.g. Senior Electrical Technician"
                  value={form.jobTitle}
                  onChange={(v) => update("jobTitle", v)}
                  icon={<FaBriefcase />}
                />

                <FormSelect
                  label="Company"
                  value={form.company}
                  onChange={(v) => update("company", v)}
                  options={COMPANY_OPTIONS}
                  placeholder="Select company"
                  icon={<FaBuilding />}
                  error={errors.company}
                  required
                />

                <FormSelect
                  label="Role / Trade"
                  value={form.role}
                  onChange={(v) => update("role", v)}
                  options={ROLE_OPTIONS}
                  placeholder="Select role"
                  icon={<FaBriefcase />}
                  error={errors.role}
                  required
                />

                <FormInput
                  label="Department"
                  placeholder="e.g. Production, Maintenance"
                  value={form.department}
                  onChange={(v) => update("department", v)}
                />

                <FormSelect
                  label="Job Type"
                  value={form.jobType}
                  onChange={(v) => update("jobType", v)}
                  options={JOB_TYPE_OPTIONS}
                  placeholder="Select type"
                />

                <FormSelect
                  label="Experience"
                  value={form.experience}
                  onChange={(v) => update("experience", v)}
                  options={EXPERIENCE_OPTIONS}
                  placeholder="Select experience"
                />

                <FormInput
                  label="Number of Vacancies"
                  placeholder="e.g. 10"
                  value={form.vacancies}
                  onChange={(v) => update("vacancies", v)}
                  icon={<FaUsers />}
                  type="number"
                  error={errors.vacancies}
                  required
                />

                <div className="flex gap-3">
                  <div className="flex-1">
                    <FormInput
                      label="Salary (₹)"
                      placeholder="e.g. 18000"
                      value={form.salary}
                      onChange={(v) => update("salary", v)}
                      icon={<FaMoneyBillWave />}
                      type="number"
                      error={errors.salary}
                      required
                    />
                  </div>
                  <div className="w-28">
                    <FormSelect
                      label="Type"
                      value={form.salaryType}
                      onChange={(v) => update("salaryType", v)}
                      options={["Monthly", "Annual", "Daily"]}
                    />
                  </div>
                </div>

                <FormSelect
                  label="Priority"
                  value={form.priority}
                  onChange={(v) => update("priority", v)}
                  options={PRIORITY_OPTIONS}
                  placeholder="Select priority"
                />

                <FormSelect
                  label="Status"
                  value={form.status}
                  onChange={(v) => update("status", v)}
                  options={["Open", "Draft", "On Hold", "Closed"]}
                />
              </div>
            </div>

            {/* ━━━ LOCATION ━━━ */}
            <div ref={sectionRefs.location} data-section="location">
              <SectionHeader
                icon={<FaMapMarkerAlt />}
                title="Location Details"
                subtitle="Where is this job opening based?"
              />

              <div className="grid md:grid-cols-2 gap-4 mt-5">
                <FormInput
                  label="Location / City"
                  placeholder="e.g. Angul, Bhubaneswar"
                  value={form.location}
                  onChange={(v) => update("location", v)}
                  icon={<FaMapMarkerAlt />}
                  error={errors.location}
                  required
                />

                <FormInput
                  label="District"
                  placeholder="e.g. Angul"
                  value={form.district}
                  onChange={(v) => update("district", v)}
                />

                <FormSelect
                  label="State"
                  value={form.state}
                  onChange={(v) => update("state", v)}
                  options={STATE_OPTIONS}
                  placeholder="Select state"
                />

                <FormInput
                  label="Country"
                  value={form.country}
                  onChange={(v) => update("country", v)}
                />
              </div>
            </div>

            {/* ━━━ DETAILS ━━━ */}
            <div ref={sectionRefs.details} data-section="details">
              <SectionHeader
                icon={<FaClipboardList />}
                title="Job Details"
                subtitle="Description, eligibility, and skills"
              />

              <div className="space-y-4 mt-5">
                <FormTextarea
                  label="Job Description"
                  placeholder="Describe the role, responsibilities, and day-to-day activities..."
                  value={form.description}
                  onChange={(v) => update("description", v)}
                  icon={<FaFileAlt />}
                  error={errors.description}
                  required
                  rows={4}
                />

                <FormTextarea
                  label="Eligibility Criteria"
                  placeholder="e.g. Must have completed ITI in relevant trade, Age 18-35..."
                  value={form.eligibility}
                  onChange={(v) => update("eligibility", v)}
                  error={errors.eligibility}
                  required
                  rows={3}
                />

                <FormInput
                  label="Qualifications"
                  placeholder="e.g. ITI, Diploma, 10th Pass"
                  value={form.qualifications}
                  onChange={(v) => update("qualifications", v)}
                />

                <TagInput
                  label="Required Skills"
                  tags={form.skills}
                  onChange={(v) => update("skills", v)}
                  suggestions={SKILL_SUGGESTIONS}
                />

                <FormTextarea
                  label="Benefits & Perks"
                  placeholder="e.g. PF, ESI, Medical Insurance, Transport..."
                  value={form.benefits}
                  onChange={(v) => update("benefits", v)}
                  rows={2}
                />

                <div className="grid md:grid-cols-2 gap-4">
                  <FormInput
                    label="Application Deadline"
                    value={form.applicationDeadline}
                    onChange={(v) => update("applicationDeadline", v)}
                    type="date"
                    icon={<FaCalendarAlt />}
                  />

                  <FormInput
                    label="Expected Start Date"
                    value={form.startDate}
                    onChange={(v) => update("startDate", v)}
                    type="date"
                    icon={<FaCalendarAlt />}
                  />
                </div>
              </div>
            </div>

            {/* ━━━ CONTACT ━━━ */}
            <div ref={sectionRefs.contact} data-section="contact">
              <SectionHeader
                icon={<FaUsers />}
                title="Contact Information"
                subtitle="Point of contact for this opening"
              />

              <div className="grid md:grid-cols-2 gap-4 mt-5">
                <FormInput
                  label="Contact Person"
                  placeholder="e.g. Placement Officer Name"
                  value={form.contactPerson}
                  onChange={(v) => update("contactPerson", v)}
                />

                <FormInput
                  label="Email"
                  placeholder="e.g. placement@company.com"
                  value={form.contactEmail}
                  onChange={(v) => update("contactEmail", v)}
                  type="email"
                />

                <FormInput
                  label="Phone"
                  placeholder="e.g. +91 98765 43210"
                  value={form.contactPhone}
                  onChange={(v) => update("contactPhone", v)}
                  type="tel"
                />
              </div>

              <div className="mt-5">
                <FormTextarea
                  label="Internal Notes"
                  placeholder="Any additional notes for the placement team..."
                  value={form.notes}
                  onChange={(v) => update("notes", v)}
                  rows={2}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Sticky footer ──────────────────────── */}
      <div className="absolute bottom-0 left-0 right-0 bg-[#0b1220]/95 backdrop-blur-md border-t border-white/[0.08] px-6 py-4 flex items-center justify-end z-20">
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-medium text-white/70 border border-white/10 rounded-lg hover:bg-white/5 hover:text-white transition-all duration-200"
          >
            Cancel
          </button>

          <button
            onClick={handleSaveDraft}
            className="px-5 py-2.5 text-sm font-medium text-cyan-300 border border-cyan-500/30 rounded-lg hover:bg-cyan-500/10 transition-all duration-200"
          >
            Save as Draft
          </button>

          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="relative px-6 py-2.5 text-sm font-semibold text-black bg-gradient-to-r from-cyan-400 to-cyan-500 rounded-lg hover:from-cyan-300 hover:to-cyan-400 transition-all duration-200 shadow-lg shadow-cyan-500/20 disabled:opacity-60"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                Creating...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <FaPlus className="text-xs" />
                Create Opening
              </span>
            )}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translate(-50%, -20px); }
          to   { opacity: 1; transform: translate(-50%, 0); }
        }
      `}</style>
    </SlidePanel>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SECTION HEADER
   ═══════════════════════════════════════════════════════════════ */

function SectionHeader({ icon, title, subtitle }) {
  return (
    <div className="flex items-start gap-3 pb-4 border-b border-white/[0.06]">
      <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 text-sm shrink-0 mt-0.5">
        {icon}
      </div>
      <div>
        <h4 className="text-base font-semibold text-white">{title}</h4>
        <p className="text-xs text-white/40 mt-0.5">{subtitle}</p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   FORM INPUT
   ═══════════════════════════════════════════════════════════════ */

function FormInput({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  icon,
  error,
  required,
}) {
  return (
    <div>
      <label className="text-xs font-medium text-white/50 mb-1.5 flex items-center gap-1">
        {label}
        {required && <span className="text-red-400">*</span>}
      </label>
      <div className="relative group">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20 text-xs group-focus-within:text-cyan-400 transition-colors">
            {icon}
          </span>
        )}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full bg-[#020617] border rounded-lg py-2.5 text-sm text-white/90 placeholder:text-white/20 outline-none transition-all duration-200
            ${icon ? "pl-9 pr-3" : "px-3"}
            ${
              error
                ? "border-red-500/50 focus:border-red-400 focus:ring-1 focus:ring-red-400/20"
                : "border-white/[0.08] focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 hover:border-white/15"
            }`}
        />
      </div>
      {error && (
        <p className="text-[11px] text-red-400 mt-1 flex items-center gap-1">
          <FaInfoCircle className="text-[9px]" />
          {error}
        </p>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   FORM SELECT
   ═══════════════════════════════════════════════════════════════ */

function FormSelect({
  label,
  value,
  onChange,
  options,
  placeholder = "Select",
  icon,
  error,
  required,
}) {
  return (
    <div>
      <label className="text-xs font-medium text-white/50 mb-1.5 flex items-center gap-1">
        {label}
        {required && <span className="text-red-400">*</span>}
      </label>
      <div className="relative group">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20 text-xs group-focus-within:text-cyan-400 transition-colors">
            {icon}
          </span>
        )}
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full bg-[#020617] border rounded-lg py-2.5 text-sm text-white/90 outline-none transition-all duration-200 appearance-none cursor-pointer
            ${icon ? "pl-9 pr-8" : "px-3 pr-8"}
            ${
              error
                ? "border-red-500/50 focus:border-red-400"
                : "border-white/[0.08] focus:border-cyan-500/50 hover:border-white/15"
            }`}
        >
          <option value="" className="text-white/30">
            {placeholder}
          </option>
          {options.map((opt) => (
            <option key={opt} value={opt} className="bg-[#020617]">
              {opt}
            </option>
          ))}
        </select>
        {/* Chevron */}
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 text-[10px] pointer-events-none">
          ▾
        </span>
      </div>
      {error && (
        <p className="text-[11px] text-red-400 mt-1 flex items-center gap-1">
          <FaInfoCircle className="text-[9px]" />
          {error}
        </p>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   FORM TEXTAREA
   ═══════════════════════════════════════════════════════════════ */

function FormTextarea({
  label,
  value,
  onChange,
  placeholder,
  icon,
  error,
  required,
  rows = 3,
}) {
  return (
    <div>
      <label className="text-xs font-medium text-white/50 mb-1.5 flex items-center gap-1">
        {label}
        {required && <span className="text-red-400">*</span>}
      </label>
      <div className="relative group">
        {icon && (
          <span className="absolute left-3 top-3 text-white/20 text-xs group-focus-within:text-cyan-400 transition-colors">
            {icon}
          </span>
        )}
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          className={`w-full bg-[#020617] border rounded-lg py-2.5 text-sm text-white/90 placeholder:text-white/20 outline-none transition-all duration-200 resize-none
            ${icon ? "pl-9 pr-3" : "px-3"}
            ${
              error
                ? "border-red-500/50 focus:border-red-400 focus:ring-1 focus:ring-red-400/20"
                : "border-white/[0.08] focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 hover:border-white/15"
            }`}
        />
      </div>
      {error && (
        <p className="text-[11px] text-red-400 mt-1 flex items-center gap-1">
          <FaInfoCircle className="text-[9px]" />
          {error}
        </p>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TAG INPUT  —  for skills, etc.
   ═══════════════════════════════════════════════════════════════ */

function TagInput({ label, tags = [], onChange, suggestions = [] }) {
  const [query, setQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const ref = useRef();

  const filteredSuggestions = suggestions.filter(
    (s) =>
      s.toLowerCase().includes(query.toLowerCase()) && !tags.includes(s)
  );

  function addTag(tag) {
    if (!tag.trim() || tags.includes(tag)) return;
    onChange([...tags, tag]);
    setQuery("");
    setShowDropdown(false);
  }

  function removeTag(tag) {
    onChange(tags.filter((t) => t !== tag));
  }

  useEffect(() => {
    function handleClick(e) {
      if (!ref.current?.contains(e.target)) setShowDropdown(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <label className="text-xs font-medium text-white/50 mb-1.5 flex items-center gap-1">
        <FaTags className="text-[10px]" />
        {label}
      </label>

      <div
        className="w-full bg-[#020617] border border-white/[0.08] rounded-lg px-3 py-2 flex flex-wrap gap-2 cursor-text hover:border-white/15 focus-within:border-cyan-500/50 transition-all duration-200"
        onClick={() => setShowDropdown(true)}
      >
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1.5 bg-cyan-500/15 text-cyan-300 border border-cyan-500/20 px-2.5 py-1 rounded-md text-xs font-medium"
          >
            {tag}
            <button
              onClick={(e) => {
                e.stopPropagation();
                removeTag(tag);
              }}
              className="text-cyan-400/60 hover:text-cyan-300 transition-colors"
            >
              <FaTimes className="text-[8px]" />
            </button>
          </span>
        ))}

        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowDropdown(true);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addTag(query);
            }
            if (e.key === "Backspace" && !query && tags.length) {
              removeTag(tags[tags.length - 1]);
            }
          }}
          placeholder={tags.length ? "" : "Type to add skills..."}
          className="bg-transparent outline-none flex-1 min-w-[100px] text-sm text-white/80 placeholder:text-white/20"
        />
      </div>

      {showDropdown && (query || filteredSuggestions.length > 0) && (
        <div className="absolute z-50 mt-1 w-full bg-[#020617] border border-white/10 rounded-lg shadow-2xl shadow-black/50 max-h-40 overflow-y-auto">
          {filteredSuggestions.map((s) => (
            <div
              key={s}
              onClick={() => addTag(s)}
              className="px-3 py-2 text-sm text-white/70 hover:bg-cyan-500/10 hover:text-cyan-300 cursor-pointer transition-colors"
            >
              {s}
            </div>
          ))}
          {query && !suggestions.includes(query) && (
            <div
              onClick={() => addTag(query)}
              className="px-3 py-2 text-sm text-emerald-400 hover:bg-emerald-500/10 cursor-pointer flex items-center gap-2"
            >
              <FaPlus className="text-[10px]" />
              Add "{query}"
            </div>
          )}
        </div>
      )}
    </div>
  );
}
