import { useState, useMemo, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

/* ================= SEGMENTS ================= */

const SEGMENTS = [
  "Mining, Steel & Aluminium",
  "Shipping & Logistics",
  "Power & Green Energy",
  "Green Jobs",
  "Construction Tech & Infra Equipment",
  "Furniture & Fittings",
];

const LOCATION_TYPES = ["Odisha", "India", "International"];

/* ================= DUMMY DATA ================= */

const COMPANY_NAMES = [
  "Tata Steel Ltd",
  "JSW Steel",
  "Vedanta Aluminium",
  "Adani Power",
  "Larsen & Toubro",
  "Reliance Industries",
  "Jindal Steel & Power",
  "NTPC Limited",
  "Ashok Leyland",
  "Mahindra Logistics",
];

function generateCompanies() {
  return COMPANY_NAMES.map((name, i) => ({
    id: i + 1,
    companyName: name,
    segment: SEGMENTS[i % SEGMENTS.length],
    locationType: LOCATION_TYPES[i % LOCATION_TYPES.length],
    location: "Khordha",
    website: "https://example.com",
    spoc: "Rajesh Mishra",
    contact: "9876543210",
    loi: null,
    loiExpiry: null,
    mou: null,
  }));
}

/* ================= COMPONENT ================= */

export default function CompanyDatabase() {

  const navigate = useNavigate();
  const fileRefs = useRef({});

  const [companies, setCompanies] = useState(generateCompanies());

  /* ================= FILTERS ================= */

  const [filters, setFilters] = useState({
    segment: "",
    locationType: "",
    search: "",
  });

  /* ================= PAGINATION ================= */

  const [page, setPage] = useState(1);
  const PER_PAGE = 20;

  useEffect(() => setPage(1), [filters]);

  /* ================= LOI STATES ================= */

  const [loiModal, setLoiModal] = useState({
    open: false,
    companyId: null,
  });

  const [viewLoi, setViewLoi] = useState(null);

  const [loiForm, setLoiForm] = useState({
    companyName: "",
    address: "",
    pan: "",
    tan: "",
    spoc: "",
    designation: "",
    email: "",
    phone: "",
    validFrom: "",
    validTill: "",
    signatory: "",
  });

  /* ================= FILTERED DATA ================= */

  const filtered = useMemo(() => {
    return companies.filter(
      (c) =>
        (!filters.segment || c.segment === filters.segment) &&
        (!filters.locationType || c.locationType === filters.locationType) &&
        (!filters.search ||
          c.companyName.toLowerCase().includes(filters.search.toLowerCase()))
    );
  }, [companies, filters]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);

  const paginatedData = filtered.slice(
    (page - 1) * PER_PAGE,
    page * PER_PAGE
  );

  /* ================= SUMMARY ================= */

  const summary = {
    total: companies.length,
    odisha: companies.filter((c) => c.locationType === "Odisha").length,
    india: companies.filter((c) => c.locationType === "India").length,
    international: companies.filter((c) => c.locationType === "International").length,
  };

  /* ================= MOU UPLOAD ================= */

  const handleFileChange = (e, id) => {
    const file = e.target.files[0];
    if (!file) return;

    const url = URL.createObjectURL(file);

    setCompanies((prev) =>
      prev.map((c) => (c.id === id ? { ...c, mou: url } : c))
    );
  };

  /* ================= LOI FUNCTIONS ================= */

  function openGenerateModal(company) {
    setLoiForm({
      companyName: company.companyName,
      address: "",
      pan: "",
      tan: "",
      spoc: "",
      designation: "",
      email: "",
      phone: "",
      validFrom: "",
      validTill: "",
      signatory: "",
    });

    setLoiModal({
      open: true,
      companyId: company.id,
    });
  }

  function generateLOI() {

    const refNo = "LOI/" + Math.floor(1000 + Math.random() * 9000);

    const loiData = {
      ...loiForm,
      refNo,
      issueDate: new Date().toLocaleDateString(),
    };

    setCompanies((prev) =>
      prev.map((c) =>
        c.id === loiModal.companyId
          ? {
              ...c,
              loi: loiData,
              loiExpiry: loiForm.validTill,
            }
          : c
      )
    );

    setLoiModal({ open: false, companyId: null });
  }

  function getStatus(expiry) {
    if (!expiry) return "-";
    return new Date(expiry) >= new Date() ? "Active" : "Expired";
  }

  /* ================= UI ================= */

  return (
    <section className="mt-8 rounded-2xl p-8 bg-[#111827] border border-cyan-500">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-slate-100">
          Company Database
        </h2>

        <button
          onClick={() =>
            navigate("/placement-officer/company-database/new")
          }
          className="px-4 py-2 rounded-md bg-cyan-500 text-black font-medium hover:bg-cyan-400 transition"
        >
          + Enter Company Details
        </button>
      </div>

      {/* SUMMARY */}
      <div className="grid grid-cols-4 gap-6 mb-6">
        <SummaryCard label="Total Companies" value={summary.total} />
        <SummaryCard label="Odisha" value={summary.odisha} />
        <SummaryCard label="India" value={summary.india} />
        <SummaryCard label="International" value={summary.international} />
      </div>

      {/* FILTERS */}
      <div className="grid grid-cols-3 gap-4 mb-6">

        <select
          value={filters.segment}
          onChange={(e) =>
            setFilters({ ...filters, segment: e.target.value })
          }
          className="bg-[#0f172a] border border-slate-600 rounded-md px-3 py-2 text-slate-200"
        >
          <option value="">All Segments</option>
          {SEGMENTS.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>

        <select
          value={filters.locationType}
          onChange={(e) =>
            setFilters({ ...filters, locationType: e.target.value })
          }
          className="bg-[#0f172a] border border-slate-600 rounded-md px-3 py-2 text-slate-200"
        >
          <option value="">All Locations</option>
          {LOCATION_TYPES.map((l) => (
            <option key={l}>{l}</option>
          ))}
        </select>

        <input
          placeholder="Search Company..."
          value={filters.search}
          onChange={(e) =>
            setFilters({ ...filters, search: e.target.value })
          }
          className="bg-[#0f172a] border border-slate-600 rounded-md px-3 py-2 text-slate-200"
        />
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">

          <thead className="bg-[#0f172a] text-slate-400">
            <tr>
              <th className="p-3 text-left">Company</th>
              <th className="p-3 text-left">Segment</th>
              <th className="p-3 text-left">Location</th>
              <th className="p-3 text-left">Website</th>
              <th className="p-3 text-left">SPOC</th>
              <th className="p-3 text-left">Contact</th>
              <th className="p-3 text-left">LOI</th>
              <th className="p-3 text-left">LOI Status</th>
              <th className="p-3 text-left">MOU</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-700">

            {paginatedData.map((c) => (
              <tr key={c.id} className="hover:bg-slate-800/60">

                <td className="p-3 text-slate-200 font-medium">
                  {c.companyName}
                </td>

                <td className="p-3 text-slate-400">{c.segment}</td>

                <td className="p-3 text-slate-400">
                  {c.location} ({c.locationType})
                </td>

                <td className="p-3 text-cyan-400">
                  <a href={c.website} target="_blank">
                    Visit
                  </a>
                </td>

                <td className="p-3 text-slate-300">{c.spoc}</td>

                <td className="p-3 text-slate-400">{c.contact}</td>

                {/* LOI */}
                <td className="p-3">

                  {c.loi ? (
                    <button
                      onClick={() => setViewLoi(c.loi)}
                      className="text-emerald-400 text-xs underline"
                    >
                      View LOI
                    </button>
                  ) : (
                    <button
                      onClick={() => openGenerateModal(c)}
                      className="text-xs bg-slate-800 px-2 py-1 rounded"
                    >
                      Generate
                    </button>
                  )}

                </td>

                {/* LOI STATUS */}
                <td className="p-3">
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      getStatus(c.loiExpiry) === "Active"
                        ? "bg-emerald-500/20 text-emerald-400"
                        : "bg-red-500/20 text-red-400"
                    }`}
                  >
                    {getStatus(c.loiExpiry)}
                  </span>
                </td>

                {/* MOU */}
                <td className="p-3">

                  <input
                    type="file"
                    className="hidden"
                    ref={(el) => (fileRefs.current[c.id] = el)}
                    onChange={(e) => handleFileChange(e, c.id)}
                  />

                  {c.mou ? (
                    <a
                      href={c.mou}
                      target="_blank"
                      className="text-emerald-400 text-xs underline"
                    >
                      View
                    </a>
                  ) : (
                    <button
                      onClick={() => fileRefs.current[c.id]?.click()}
                      className="text-xs bg-slate-800 px-2 py-1 rounded"
                    >
                      Upload
                    </button>
                  )}

                </td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ================= GENERATE LOI MODAL ================= */}

      {loiModal.open && (
        <Modal title="Generate Letter of Intent">

          <div className="grid grid-cols-2 gap-3">

            <Input label="Company Name" value={loiForm.companyName}
              onChange={(v) => setLoiForm({ ...loiForm, companyName: v })} />

            <Input label="PAN Number" value={loiForm.pan}
              onChange={(v) => setLoiForm({ ...loiForm, pan: v })} />

            <Input label="TAN Number" value={loiForm.tan}
              onChange={(v) => setLoiForm({ ...loiForm, tan: v })} />

            <Input label="SPOC Name" value={loiForm.spoc}
              onChange={(v) => setLoiForm({ ...loiForm, spoc: v })} />

            <Input label="Designation" value={loiForm.designation}
              onChange={(v) => setLoiForm({ ...loiForm, designation: v })} />

            <Input label="Email" value={loiForm.email}
              onChange={(v) => setLoiForm({ ...loiForm, email: v })} />

            <Input label="Phone" value={loiForm.phone}
              onChange={(v) => setLoiForm({ ...loiForm, phone: v })} />

            <Input label="Authorized Signatory" value={loiForm.signatory}
              onChange={(v) => setLoiForm({ ...loiForm, signatory: v })} />

            <Input type="date" label="Valid From"
              value={loiForm.validFrom}
              onChange={(v) => setLoiForm({ ...loiForm, validFrom: v })} />

            <Input type="date" label="Valid Till"
              value={loiForm.validTill}
              onChange={(v) => setLoiForm({ ...loiForm, validTill: v })} />

          </div>

          <Textarea
            label="Registered Address"
            value={loiForm.address}
            onChange={(v) => setLoiForm({ ...loiForm, address: v })}
          />

          <div className="flex justify-end gap-3 mt-4">
            <button
              onClick={() => setLoiModal({ open: false })}
              className="btn-secondary"
            >
              Cancel
            </button>

            <button
              onClick={generateLOI}
              className="btn-primary"
            >
              Generate LOI
            </button>
          </div>

        </Modal>
      )}

      {/* ================= VIEW LOI ================= */}

      {viewLoi && (
        <Modal title="Letter of Intent">

          <div className="bg-white text-black p-6 rounded space-y-4">

            <h2 className="text-center font-bold text-lg">
              LETTER OF INTENT
            </h2>

            <p>Ref No: {viewLoi.refNo}</p>
            <p>Date: {viewLoi.issueDate}</p>

            <p>
              To,<br />
              {viewLoi.companyName}<br />
              {viewLoi.address}
            </p>

            <p className="font-semibold">
              Subject: Collaboration for Skill Development & Placement
            </p>

            <p>
              This letter confirms our intent to collaborate with
              {viewLoi.companyName} for providing employment
              opportunities to trained candidates under our
              skill development programs.
            </p>

            <p>
              Valid From: {viewLoi.validFrom} <br />
              Valid Till: {viewLoi.validTill}
            </p>

            <p>
              SPOC: {viewLoi.spoc} ({viewLoi.designation})
            </p>

            <div className="mt-6">
              Authorized Signatory<br />
              {viewLoi.signatory}
            </div>

          </div>

          <div className="flex justify-end mt-4">
            <button
              onClick={() => setViewLoi(null)}
              className="btn-secondary"
            >
              Close
            </button>
          </div>

        </Modal>
      )}

    </section>
  );
}

/* ================= UI COMPONENTS ================= */

function Modal({ title, children }) {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-[#0f172a] border border-slate-700 rounded-xl p-6 w-full max-w-2xl">
        <h3 className="text-lg font-semibold text-slate-100 mb-4">
          {title}
        </h3>
        <div className="space-y-3">{children}</div>
      </div>
    </div>
  );
}

function Input({ label, value, onChange, type = "text" }) {
  return (
    <div className="flex flex-col">
      <label className="text-xs text-slate-400 mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-[#111827] border border-slate-600 px-3 py-2 rounded text-slate-200"
      />
    </div>
  );
}

function Textarea({ label, value, onChange }) {
  return (
    <div className="flex flex-col mt-3">
      <label className="text-xs text-slate-400 mb-1">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-[#111827] border border-slate-600 px-3 py-2 rounded text-slate-200"
      />
    </div>
  );
}

function SummaryCard({ label, value }) {
  return (
    <div className="bg-[#0f172a] border border-slate-700 rounded-xl p-5">
      <p className="text-sm text-slate-400">{label}</p>
      <p className="text-2xl font-bold text-slate-100 mt-1">
        {value}
      </p>
    </div>
  );
}
