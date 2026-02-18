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

/* ================= LOCATION TYPES ================= */

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
  "Blue Dart Express",
  "DHL Supply Chain",
  "Aditya Birla Group",
  "Hindalco Industries",
  "Coal India Ltd",
  "ONGC",
  "Indian Oil Corporation",
  "Siemens Energy",
  "ABB India",
  "Schneider Electric",
  "BHEL",
  "Volvo Construction",
  "Caterpillar India",
  "UltraTech Cement",
  "ACC Cement",
  "Bosch India",
  "Honeywell Automation",
  "Godrej & Boyce",
  "Greenko Energy",
  "Suzlon Energy",
  "ReNew Power",
  "Thermax Ltd",
  "Kirloskar Brothers",
  "Wipro Infrastructure",
  "Infosys Limited",
  "Tech Mahindra",
  "Capgemini India",
  "HCL Technologies",
  "Amazon India",
  "Flipkart Logistics",
  "Delhivery",
  "GMR Infrastructure",
  "GVK Power",
  "JSPL Logistics",
  "DP World India",
  "Adani Ports",
  "Container Corporation",
  "Tata Projects",
  "KEC International",
  "Gammon India",
  "Simplex Infra",
  "JMC Projects",
  "Afcons Infrastructure",
  "Punj Lloyd",
  "Havells India",
  "Crompton Greaves",
  "Finolex Cables",
  "Polycab India",
  "KEI Industries",
  "Orient Electric",
];

function generateCompanies() {
  return COMPANY_NAMES.map((name, i) => ({
    id: i + 1,
    companyName: name,
    segment: SEGMENTS[i % SEGMENTS.length],
    locationType: LOCATION_TYPES[i % LOCATION_TYPES.length],
    location:
      LOCATION_TYPES[i % LOCATION_TYPES.length] === "Odisha"
        ? ["Khordha", "Cuttack", "Angul", "Sundargarh"][i % 4]
        : LOCATION_TYPES[i % LOCATION_TYPES.length] === "India"
        ? ["Jharkhand", "Gujarat", "Maharashtra", "Tamil Nadu"][i % 4]
        : ["UAE", "Qatar", "Germany", "Singapore"][i % 4],
    website: "https://example.com",
    spoc: ["Rajesh Mishra", "Priya Sahu", "Amit Das", "Sonal Behera"][i % 4],
    contact: "9" + Math.floor(100000000 + Math.random() * 900000000),
    loi: null,
    mou: null,
  }));
}

/* ================= COMPONENT ================= */

export default function CompanyDatabase() {
  const navigate = useNavigate();

  const [companies, setCompanies] = useState(generateCompanies());

  const [filters, setFilters] = useState({
    segment: "",
    locationType: "",
    search: "",
  });

  const fileRefs = useRef({});

  /* ================= PAGINATION ================= */

  const [page, setPage] = useState(1);
  const PER_PAGE = 20;

  useEffect(() => {
    setPage(1);
  }, [filters]);

  /* ================= FILTERED DATA ================= */

  const filtered = useMemo(() => {
    return companies.filter(
      (c) =>
        (!filters.segment || c.segment === filters.segment) &&
        (!filters.locationType || c.locationType === filters.locationType) &&
        (!filters.search ||
          c.companyName
            .toLowerCase()
            .includes(filters.search.toLowerCase()))
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
    international: companies.filter((c) => c.locationType === "International")
      .length,
  };

  /* ================= FILE UPLOAD ================= */

  const handleFileChange = (e, id, type) => {
    const file = e.target.files[0];
    if (!file) return;

    const url = URL.createObjectURL(file);

    setCompanies((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, [type]: url } : c
      )
    );
  };

  /* ================= UI ================= */

  return (
    <section className="mt-8 rounded-2xl p-8 bg-[#111827] border border-cyan-500">

      {/* ================= HEADER ================= */}

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

      {/* ================= SUMMARY CARDS ================= */}

      <div className="grid grid-cols-4 gap-6 mb-6">
        <SummaryCard label="Total Companies" value={summary.total} />
        <SummaryCard label="Odisha" value={summary.odisha} />
        <SummaryCard label="India" value={summary.india} />
        <SummaryCard
          label="International"
          value={summary.international}
        />
      </div>

      {/* ================= FILTERS ================= */}

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

      {/* ================= TABLE ================= */}

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
                  <input
                    type="file"
                    className="hidden"
                    ref={(el) => (fileRefs.current[`loi-${c.id}`] = el)}
                    onChange={(e) =>
                      handleFileChange(e, c.id, "loi")
                    }
                  />

                  {c.loi ? (
                    <a
                      href={c.loi}
                      target="_blank"
                      className="text-emerald-400 text-xs underline"
                    >
                      View
                    </a>
                  ) : (
                    <button
                      onClick={() =>
                        fileRefs.current[`loi-${c.id}`]?.click()
                      }
                      className="text-xs bg-slate-800 px-2 py-1 rounded"
                    >
                      Upload
                    </button>
                  )}
                </td>

                {/* MOU */}
                <td className="p-3">
                  <input
                    type="file"
                    className="hidden"
                    ref={(el) => (fileRefs.current[`mou-${c.id}`] = el)}
                    onChange={(e) =>
                      handleFileChange(e, c.id, "mou")
                    }
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
                      onClick={() =>
                        fileRefs.current[`mou-${c.id}`]?.click()
                      }
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

      {/* ================= PAGINATION ================= */}

      <div className="flex items-center justify-between mt-4">

        <p className="text-xs text-slate-400">
          Showing {(page - 1) * PER_PAGE + 1} –
          {Math.min(page * PER_PAGE, filtered.length)} of {filtered.length}
        </p>

        <div className="flex items-center gap-2">

          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-3 py-1 text-xs border border-slate-600 rounded"
          >
            Prev
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map(
            (p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`px-3 py-1 text-xs rounded ${
                  page === p
                    ? "bg-cyan-400 text-black"
                    : "bg-slate-800"
                }`}
              >
                {p}
              </button>
            )
          )}

          <button
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1 text-xs border border-slate-600 rounded"
          >
            Next
          </button>

        </div>
      </div>
    </section>
  );
}

/* ================= SMALL COMPONENT ================= */

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
