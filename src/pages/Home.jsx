import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, UserCog, Lock } from "lucide-react";

/* ===================== CONFIG ===================== */

const ROLES = [
  "Super Admin",
  "Admin",
  "Mobilizer",
  "Trainer",
  "Placement Officer",
];

const ROLE_ROUTES = {
  "Super Admin": "/super-admin",
  Admin: "/admin",
  Mobilizer: "/mobilizer/dashboard",
  Trainer: "/trainer",
  "Placement Officer": "/placement-officer",
};

const DUMMY_ID = "kovon";
const DUMMY_PASSWORD = "1234";

/* ===================== ROLE COLORS ===================== */

const ROLE_COLORS = {
  Mobilizer: {
    primary: "#facc15",
    orb: "bg-yellow-400/20",
  },
  Trainer: {
    primary: "#34d399",
    orb: "bg-emerald-400/20",
  },
  default: {
    primary: "#ef4444",
    orb: "bg-red-500/20",
  },
};

/* ===================== MAIN ===================== */

export default function Home() {
  const navigate = useNavigate();

  const [role, setRole] = useState("Admin");
  const [credentials, setCredentials] = useState({ id: "", password: "" });
  const [error, setError] = useState("");

  const theme =
    ROLE_COLORS[role] || ROLE_COLORS.default;

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      credentials.id === DUMMY_ID &&
      credentials.password === DUMMY_PASSWORD
    ) {
      setError("");
      navigate(ROLE_ROUTES[role]);
    } else {
      setError("Invalid ID or password");
    }
  };

  return (
    <section className="relative min-h-screen w-full bg-[#020617] text-white overflow-hidden">

      {/* ========= BACKGROUND ========= */}

      <div className="absolute inset-0 overflow-hidden">

        <div
          className={`absolute w-[600px] h-[600px] ${theme.orb} blur-[120px] rounded-full animate-floatSlow top-[-150px] left-[-150px]`}
        />

        <div
          className={`absolute w-[500px] h-[500px] ${theme.orb} blur-[120px] rounded-full animate-floatSlow2 bottom-[-120px] right-[-120px]`}
        />

        <div className="absolute inset-0 opacity-20 animate-gridMove bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-size-[60px_60px]" />

      </div>

      {/* ========= CONTENT ========= */}

      <div className="relative min-h-screen grid lg:grid-cols-2">

        {/* LEFT BRAND */}

        <div className="hidden lg:flex flex-col justify-center px-20">

          <div className="max-w-lg">

            <div className="flex items-center gap-3 mb-6">
              <ShieldCheck
                size={28}
                style={{ color: theme.primary }}
              />
              <h1 className="text-2xl font-semibold">
                PSU ERP
              </h1>
            </div>

            <h2 className="text-4xl font-semibold leading-tight mb-5">
              Intelligent Skill Development
              <span
                className="ml-2"
                style={{ color: theme.primary }}
              >
                Management System
              </span>
            </h2>

            <p className="text-slate-400 text-sm leading-relaxed">
              Unified enterprise platform for training operations,
              workforce development, compliance monitoring, and
              institutional performance analytics.
            </p>

            <div className="mt-10 flex gap-8 text-xs text-slate-500">
              <span>Secure Access</span>
              <span>Role Based Control</span>
              <span>Enterprise Grade</span>
            </div>

          </div>

        </div>

        {/* RIGHT LOGIN */}

        <div className="flex items-center justify-center px-6 py-12">

          <div
            className="w-full max-w-md rounded-2xl p-8
            bg-[#020617]/80 backdrop-blur-xl
            border border-white/10
            shadow-xl"
          >

            {/* HEADER */}

            <div className="mb-8">

              <h3 className="text-xl font-semibold mb-1">
                Sign in to continue
              </h3>

              <p className="text-sm text-slate-400">
                Access your role dashboard securely
              </p>

            </div>

            {/* ROLE SELECTOR */}

            <div className="mb-6">

              <p className="text-xs text-slate-400 mb-2">
                Role
              </p>

              <div className="flex flex-wrap gap-2">

                {ROLES.map((r) => (
                  <button
                    key={r}
                    onClick={() => setRole(r)}
                    style={
                      role === r
                        ? { background: theme.primary, color: "#000" }
                        : {}
                    }
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition
                    ${
                      role === r
                        ? ""
                        : "bg-white/5 text-slate-300 hover:bg-white/10"
                    }`}
                  >
                    {r}
                  </button>
                ))}

              </div>

            </div>

            {/* FORM */}

            <form onSubmit={handleSubmit} className="space-y-5">

              <Input
                label={`${role} ID`}
                icon={<UserCog size={16} />}
                value={credentials.id}
                color={theme.primary}
                onChange={(v) =>
                  setCredentials({ ...credentials, id: v })
                }
              />

              <Input
                label="Password"
                icon={<Lock size={16} />}
                type="password"
                value={credentials.password}
                color={theme.primary}
                onChange={(v) =>
                  setCredentials({
                    ...credentials,
                    password: v,
                  })
                }
              />

              {error && (
                <p className="text-xs text-red-400">
                  {error}
                </p>
              )}

              <button
                type="submit"
                style={{ background: theme.primary }}
                className="w-full py-3 rounded-lg font-semibold text-sm text-black transition hover:opacity-90"
              >
                Authenticate & Continue
              </button>

            </form>

            <p className="mt-6 text-[11px] text-slate-500 text-center">
              Demo credentials:
              <span style={{ color: theme.primary }}>
                {" "}kovon / 1234
              </span>
            </p>

          </div>

        </div>

      </div>

      {/* ========= ANIMATIONS ========= */}

      <style>{`

        @keyframes floatSlow {
          0%,100% { transform: translateY(0px) }
          50% { transform: translateY(40px) }
        }

        @keyframes floatSlow2 {
          0%,100% { transform: translateY(0px) }
          50% { transform: translateY(-40px) }
        }

        @keyframes gridMove {
          0% { transform: translate(0,0) }
          100% { transform: translate(60px,60px) }
        }

        .animate-floatSlow {
          animation: floatSlow 12s ease-in-out infinite;
        }

        .animate-floatSlow2 {
          animation: floatSlow2 14s ease-in-out infinite;
        }

        .animate-gridMove {
          animation: gridMove 20s linear infinite;
        }

      `}</style>

    </section>
  );
}

/* ===================== INPUT ===================== */

function Input({
  label,
  icon,
  value,
  onChange,
  type = "text",
  color,
}) {
  return (
    <div>

      <label className="text-xs text-slate-400 mb-1 block">
        {label}
      </label>

      <div className="relative">

        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
          {icon}
        </span>

        <input
          type={type}
          value={value}
          required
          onChange={(e) => onChange(e.target.value)}
          style={{ borderColor: "rgba(255,255,255,0.1)" }}
          className="w-full pl-9 pr-3 py-3 rounded-lg
          bg-white/5 border
          text-sm text-white
          focus:outline-none focus:ring-2
          transition"
        />

      </div>

    </div>
  );
}
