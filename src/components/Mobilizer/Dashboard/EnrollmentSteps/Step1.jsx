import { useEffect, useMemo, useRef, useState } from "react";
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
import { useProjectStore } from "../../../../stores/projectStore";
import { selectEnrollmentCatalog } from "../../../../stores/selectors/projectSelectors";

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

/* ===================== COMPONENT ===================== */

export default function StepSelectService({
  value = {},
  onChange,
  onValidChange,
}) {
  const { records: projects, fetchAll } = useProjectStore();
  const onChangeRef = useRef(onChange);
  const onValidChangeRef = useRef(onValidChange);
  const [school, setSchool] = useState(value.school || "");
  const [center, setCenter] = useState(value.center || "");
  const [role, setRole] = useState(value.role || "");

  useEffect(() => {
    onChangeRef.current = onChange;
    onValidChangeRef.current = onValidChange;
  }, [onChange, onValidChange]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const catalog = useMemo(() => selectEnrollmentCatalog(projects), [projects]);
  const selectedSchool = catalog.find((s) => s.school === school);
  const selectedCenter = selectedSchool?.centers.find((c) => c.name === center);
  const selectedBatch = selectedCenter?.batches.find((batch) => batch.role === role);

  useEffect(() => {
    const payload = {
      school,
      center,
      role,
      project: selectedSchool?.name || "",
      projectId: selectedSchool?.id || "",
      centerId: selectedCenter?.id || "",
      batch: selectedBatch?.code || "",
      batchId: selectedBatch?.id || "",
    };
    onChangeRef.current?.(payload);
    onValidChangeRef.current?.(Boolean(role));
  }, [
    school,
    center,
    role,
    selectedSchool?.id,
    selectedSchool?.name,
    selectedCenter?.id,
    selectedBatch?.code,
    selectedBatch?.id,
  ]);

  return (
    <div className="flex flex-col gap-12 text-white/90">

      {/* ================= SCHOOL ================= */}
      <Section title="Select School">
        <Grid>
          {catalog.map((s) => {
            const Icon = SCHOOL_ICONS[s.school] || Building2;
            return (
              <EnterpriseCard
                key={s.id}
                title={s.school}
                icon={Icon}
                active={school === s.school}
                onClick={() => {
                  setSchool(s.school);
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
            {selectedSchool?.centers.map((c) => (
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
            {selectedCenter?.batches.map((batch) => (
              <EnterpriseCard
                key={batch.id}
                title={batch.role}
                icon={getRoleIcon(batch.role)}
                active={role === batch.role}
                onClick={() => setRole(batch.role)}
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
                : "bg-transparent text-yellow-400 border-yellow-400/30"
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
