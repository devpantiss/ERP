import { useEffect, useState } from "react";
import {
  Factory,
  Leaf,
  Ship,
  Building2,
  Construction,
  CheckCircle,
  Wrench,
  Truck,
  Zap,
  Hammer,
} from "lucide-react";
import { saveEnrollmentStep } from "../../../utils/enrollmentStorage";

/* ===================== ICON MAP ===================== */

const SCHOOL_ICONS = {
  "School for Mines, Steel & Aluminium": Factory,
  "School for Furniture & Fittings": Hammer,
  "School for Power & Green Energy": Zap,
  "School for Shipping & Logistics": Ship,
  "School for Construction Tech & Infra Equipments": Construction,
  "School for Green Jobs": Leaf,
};

const ROLE_ICON = {
  default: Wrench,
  operator: Truck,
  electrician: Zap,
};

/* ===================== DATA ===================== */
/* (UNCHANGED – using your last dataset) */

const SCHOOLS = [
  {
    name: "School for Mines, Steel & Aluminium",
    centers: [
      {
        name: "Talcher Mining Training Center",
        roles: [
          "Dumper Operator",
          "Excavator Operator",
          "Shovel Operator",
          "HEMM Mechanic",
          "Mine Electrician",
        ],
      },
      {
        name: "Angul Steel Skill Center",
        roles: [
          "Industrial Welder",
          "Steel Plant Fitter",
          "Crane Operator",
          "Rolling Mill Operator",
          "Maintenance Technician",
        ],
      },
      {
        name: "Jharsuguda Aluminium Skill Center",
        roles: [
          "Potline Operator",
          "Anode Technician",
          "Aluminium Welder",
          "Electrical Maintenance Assistant",
          "Mechanical Fitter",
        ],
      },
      {
        name: "Rourkela Metallurgy Training Hub",
        roles: [
          "Blast Furnace Helper",
          "Material Handling Operator",
          "Gas Cutter",
          "Quality Control Assistant",
          "Safety Assistant",
        ],
      },
      {
        name: "Keonjhar Mining Skill Center",
        roles: [
          "Drilling Machine Operator",
          "Mining Mate Assistant",
          "Survey Helper",
          "Explosives Helper",
          "Mine Safety Guard",
        ],
      },
    ],
  },

  {
    name: "School for Furniture & Fittings",
    centers: [
      {
        name: "Bhubaneswar Furniture Skill Hub",
        roles: [
          "Furniture Carpenter",
          "Modular Furniture Installer",
          "Wood Polishing Technician",
          "CNC Cutting Operator",
          "Furniture Assembler",
        ],
      },
      {
        name: "Cuttack Interior Works Center",
        roles: [
          "Interior Carpenter",
          "False Ceiling Installer",
          "Wall Panel Fitter",
          "Site Supervisor Assistant",
          "Measurement Assistant",
        ],
      },
      {
        name: "Berhampur Woodcraft Center",
        roles: [
          "Traditional Carpenter",
          "Hand Tool Technician",
          "Wood Finishing Helper",
          "Packing & Dispatch Assistant",
          "Workshop Helper",
        ],
      },
      {
        name: "Rourkela Modular Fittings Hub",
        roles: [
          "Modular Kitchen Installer",
          "Drawer & Hardware Fitter",
          "Edge Banding Operator",
          "Machine Operator",
          "Installation Helper",
        ],
      },
      {
        name: "Sambalpur Furniture Assembly Unit",
        roles: [
          "Furniture Assembly Worker",
          "Quality Check Assistant",
          "Storekeeper Assistant",
          "Loading Supervisor",
          "Maintenance Helper",
        ],
      },
    ],
  },

  {
    name: "School for Power & Green Energy",
    centers: [
      {
        name: "IB Valley Thermal Power Center",
        roles: [
          "Boiler Attendant",
          "Turbine Operator Assistant",
          "Electrical Maintenance Technician",
          "Control Room Helper",
          "Safety Technician",
        ],
      },
      {
        name: "Talcher Power Distribution Center",
        roles: [
          "Line Man Assistant",
          "Substation Helper",
          "Meter Installation Technician",
          "Cable Jointing Assistant",
          "Electrical Inspector Helper",
        ],
      },
      {
        name: "Angul Solar Energy Skill Center",
        roles: [
          "Solar Panel Installer",
          "Solar O&M Technician",
          "Inverter Technician",
          "Rooftop Survey Assistant",
          "Solar Site Helper",
        ],
      },
      {
        name: "Bargarh Wind Energy Hub",
        roles: [
          "Wind Turbine Helper",
          "Mechanical Maintenance Assistant",
          "Electrical Safety Assistant",
          "Blade Inspection Helper",
          "Tower Climbing Assistant",
        ],
      },
      {
        name: "Odisha Green Grid Center",
        roles: [
          "Energy Auditor Assistant",
          "Smart Meter Technician",
          "Battery Storage Technician",
          "EV Charging Technician",
          "Grid Maintenance Helper",
        ],
      },
    ],
  },

  {
    name: "School for Shipping & Logistics",
    centers: [
      {
        name: "Paradip Port Skill Center",
        roles: [
          "Forklift Operator",
          "Port Equipment Operator",
          "Cargo Handling Supervisor",
          "Dock Safety Assistant",
          "Warehouse Executive",
        ],
      },
      {
        name: "Dhamra Logistics Training Hub",
        roles: [
          "Crane Signalman",
          "Container Loader",
          "Inventory Assistant",
          "Transport Coordinator",
          "Logistics MIS Assistant",
        ],
      },
      {
        name: "Cuttack Warehouse Operations Center",
        roles: [
          "Warehouse Picker",
          "Packaging Executive",
          "Stock Verification Assistant",
          "Barcode Operator",
          "Dispatch Supervisor Assistant",
        ],
      },
      {
        name: "Balasore Transport Skill Center",
        roles: [
          "Commercial Driver Assistant",
          "Route Planner Assistant",
          "Fleet Maintenance Helper",
          "Fuel Monitoring Assistant",
          "Trip Log Operator",
        ],
      },
      {
        name: "Rourkela Supply Chain Hub",
        roles: [
          "Supply Chain Executive",
          "Vendor Coordination Assistant",
          "Purchase Support Executive",
          "Inbound Supervisor",
          "Outbound Supervisor",
        ],
      },
    ],
  },

  {
    name: "School for Construction Tech & Infra Equipments",
    centers: [
      {
        name: "Cuttack Infra Skill Center",
        roles: [
          "Crane Operator",
          "Concrete Pump Operator",
          "Batching Plant Operator",
          "Site Safety Supervisor",
          "Equipment Maintenance Helper",
        ],
      },
      {
        name: "Bhubaneswar Smart City Center",
        roles: [
          "Survey Assistant",
          "AutoCAD Site Assistant",
          "Road Construction Supervisor",
          "Paver Machine Operator",
          "Material Testing Assistant",
        ],
      },
      {
        name: "Rourkela Heavy Equipment Center",
        roles: [
          "Backhoe Loader Operator",
          "Grader Operator",
          "Dozer Operator",
          "Hydraulic Technician",
          "Tyre Maintenance Assistant",
        ],
      },
      {
        name: "Sambalpur Bridge Construction Hub",
        roles: [
          "Scaffolding Supervisor",
          "Formwork Carpenter",
          "Rebar Technician",
          "Concrete Finisher",
          "Bridge Inspection Assistant",
        ],
      },
      {
        name: "Berhampur Infrastructure Center",
        roles: [
          "Pipe Laying Technician",
          "Water Supply Technician",
          "Road Marking Assistant",
          "Drainage Maintenance Worker",
          "Urban Infra Helper",
        ],
      },
    ],
  },

  {
    name: "School for Green Jobs",
    centers: [
      {
        name: "Odisha Green Jobs Center",
        roles: [
          "Waste Management Technician",
          "Recycling Plant Operator",
          "Material Segregation Supervisor",
          "Landfill Operations Assistant",
          "Safety & Compliance Assistant",
        ],
      },
      {
        name: "EV Service Skill Center – Bhubaneswar",
        roles: [
          "EV Service Technician",
          "Battery Repair Assistant",
          "Charging Station Operator",
          "EV Diagnostic Assistant",
          "Spare Parts Coordinator",
        ],
      },
      {
        name: "Water Conservation Skill Hub",
        roles: [
          "Rainwater Harvesting Technician",
          "Water Audit Assistant",
          "Pump Maintenance Technician",
          "Pipeline Inspection Helper",
          "Water Quality Tester",
        ],
      },
      {
        name: "Climate Resilience Training Center",
        roles: [
          "Disaster Response Assistant",
          "Flood Monitoring Assistant",
          "Early Warning System Operator",
          "Community Mobilizer",
          "Field Data Enumerator",
        ],
      },
      {
        name: "Sustainable Agriculture Support Center",
        roles: [
          "Organic Farming Assistant",
          "Soil Testing Technician",
          "Compost Unit Operator",
          "Irrigation System Technician",
          "Agri Field Supervisor",
        ],
      },
    ],
  },
];

// import { SCHOOLS } from "./schoolData"; // optional split, or keep inline

/* ===================== COMPONENT ===================== */

export default function StepSelectService({
  value = {},
  onChange,
  onValidChange,
}) {
  const [school, setSchool] = useState(value.school || "");
  const [center, setCenter] = useState(value.center || "");
  const [role, setRole] = useState(value.role || "");

  useEffect(() => {
    const payload = { school, center, role };
    onChange(payload);
    onValidChange?.(Boolean(role));
    saveEnrollmentStep("roleProject", payload);
  }, [school, center, role]);

  const selectedSchool = SCHOOLS.find((s) => s.name === school);
  const selectedCenter = selectedSchool?.centers.find(
    (c) => c.name === center
  );

  return (
    <div className="flex flex-col gap-12 text-slate-200">

      {/* ================= SCHOOL ================= */}
      <Section title="Select School">
        <Grid>
          {SCHOOLS.map((s) => {
            const Icon = SCHOOL_ICONS[s.name] || Building2;
            return (
              <EnterpriseCard
                key={s.name}
                title={s.name}
                icon={Icon}
                active={school === s.name}
                onClick={() => {
                  setSchool(s.name);
                  setCenter("");
                  setRole("");
                }}
              />
            );
          })}
        </Grid>
      </Section>

      {/* ================= CENTER ================= */}
      {school && (
        <Section title="Select Training Center">
          <Grid>
            {selectedSchool.centers.map((c) => (
              <EnterpriseCard
                key={c.name}
                title={c.name}
                icon={Building2}
                active={center === c.name}
                onClick={() => {
                  setCenter(c.name);
                  setRole("");
                }}
              />
            ))}
          </Grid>
        </Section>
      )}

      {/* ================= ROLE ================= */}
      {center && (
        <Section title="Select Job Role">
          <Grid>
            {selectedCenter.roles.map((r) => (
              <EnterpriseCard
                key={r}
                title={r}
                icon={getRoleIcon(r)}
                active={role === r}
                onClick={() => setRole(r)}
              />
            ))}
          </Grid>
        </Section>
      )}
    </div>
  );
}

/* ===================== UI COMPONENTS ===================== */

function Section({ title, children }) {
  return (
    <div>
      <h3 className="text-lg font-semibold text-yellow-400 mb-5">
        {title}
      </h3>
      {children}
    </div>
  );
}

function Grid({ children }) {
  return <div className="grid sm:grid-cols-3 gap-6">{children}</div>;
}

function EnterpriseCard({ title, icon: Icon, active, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`relative cursor-pointer rounded-2xl border p-6 transition-all
        ${
          active
            ? "border-yellow-400 bg-yellow-400/10 shadow-lg"
            : "border-yellow-400/20 bg-[#020617] hover:border-yellow-400/40 hover:bg-yellow-400/5"
        }`}
    >
      {active && (
        <CheckCircle
          size={18}
          className="absolute top-4 right-4 text-yellow-400"
        />
      )}

      <div className="flex items-center gap-4">
        <div
          className={`p-3 rounded-xl border
            ${
              active
                ? "bg-yellow-400 text-black border-yellow-400"
                : "bg-[#0b0f14] text-yellow-400 border-yellow-400/30"
            }`}
        >
          <Icon size={22} />
        </div>

        <p className="font-semibold text-slate-100 leading-snug">
          {title}
        </p>
      </div>
    </div>
  );
}

/* ===================== ROLE ICON LOGIC ===================== */

function getRoleIcon(role) {
  const r = role.toLowerCase();
  if (r.includes("operator")) return Truck;
  if (r.includes("electric")) return Zap;
  return Wrench;
}
