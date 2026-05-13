import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Building2, LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import { CLIENT_ACCOUNTS } from "./clientPortalData";

export default function ClientLogin() {
  const navigate = useNavigate();
  const [clientId, setClientId] = useState(CLIENT_ACCOUNTS[0].id);
  const [email, setEmail] = useState(CLIENT_ACCOUNTS[0].email);
  const [password, setPassword] = useState("client123");
  const [error, setError] = useState("");

  const selectedClient = useMemo(
    () => CLIENT_ACCOUNTS.find((client) => client.id === clientId) || CLIENT_ACCOUNTS[0],
    [clientId]
  );

  const selectClient = (id) => {
    const nextClient = CLIENT_ACCOUNTS.find((client) => client.id === id) || CLIENT_ACCOUNTS[0];
    setClientId(nextClient.id);
    setEmail(nextClient.email);
    setPassword("client123");
    setError("");
  };

  const submit = (event) => {
    event.preventDefault();
    const match = CLIENT_ACCOUNTS.find(
      (client) =>
        client.id === clientId &&
        client.email.toLowerCase() === email.trim().toLowerCase() &&
        client.password === password
    );

    if (!match) {
      setError("Use the selected client's demo email and password client123.");
      return;
    }

    localStorage.setItem(
      "clientSession",
      JSON.stringify({
        id: match.id,
        name: match.name,
        email: match.email,
        signedInAt: new Date().toISOString(),
      })
    );
    navigate("/client/dashboard");
  };

  return (
    <main className="client-portal min-h-screen overflow-hidden bg-[#05020a] text-white">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 left-1/4 h-[420px] w-[420px] rounded-full bg-violet-600/25 blur-[140px]" />
        <div className="absolute bottom-0 right-0 h-[520px] w-[520px] rounded-full bg-fuchsia-500/10 blur-[160px]" />
      </div>

      <section className="relative mx-auto grid min-h-screen w-full max-w-6xl items-center gap-10 px-5 py-10 lg:grid-cols-[1fr_440px]">
        <div className="space-y-7">
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-300/20 bg-violet-500/10 px-4 py-2 text-sm text-violet-200">
            <ShieldCheck size={17} />
            Client Access Portal
          </div>
          <div>
            <h1 className="max-w-3xl text-4xl font-semibold leading-tight text-white md:text-6xl">
              Track your funded projects from enrollment to placement.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-white/60">
              Review live delivery, center performance, attendance, candidate volumes,
              placement conversion, and open operational risks for your portfolio.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              ["Project health", "Live"],
              ["Center metrics", "Daily"],
              ["Placement view", "Tracked"],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                <p className="text-2xl font-semibold text-violet-200">{value}</p>
                <p className="mt-1 text-sm text-white/45">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <form
          onSubmit={submit}
          className="rounded-[28px] border border-violet-200/15 bg-[#12071f]/90 p-6 shadow-2xl shadow-violet-950/40 backdrop-blur"
        >
          <div className="mb-6">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-violet-300">
              Sign in
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-white">Client Dashboard</h2>
          </div>

          <label className="block text-sm text-white/55">Client</label>
          <div className="mt-2 grid gap-2">
            {CLIENT_ACCOUNTS.map((client) => (
              <button
                key={client.id}
                type="button"
                onClick={() => selectClient(client.id)}
                className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-left transition ${
                  client.id === clientId
                    ? "border-violet-300/50 bg-violet-500/15 text-white"
                    : "border-white/10 bg-white/[0.03] text-white/65 hover:border-violet-300/30"
                }`}
              >
                <Building2 size={18} className="text-violet-300" />
                <span>
                  <span className="block text-sm font-semibold">{client.name}</span>
                  <span className="text-xs text-white/40">{client.contact}</span>
                </span>
              </button>
            ))}
          </div>

          <div className="mt-5 space-y-4">
            <Field icon={Mail} label="Email" value={email} onChange={setEmail} />
            <Field
              icon={LockKeyhole}
              label="Password"
              type="password"
              value={password}
              onChange={setPassword}
            />
          </div>

          {error && (
            <p className="mt-4 rounded-xl border border-red-400/20 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-violet-500 px-5 py-3 font-semibold text-white transition hover:bg-violet-400"
          >
            Open {selectedClient.name} Dashboard
            <ArrowRight size={18} />
          </button>

          <p className="mt-4 rounded-2xl border border-violet-300/15 bg-violet-500/10 px-4 py-3 text-xs leading-5 text-violet-100/80">
            Demo credentials: use the selected client email with password{" "}
            <span className="font-semibold text-white">client123</span>.
          </p>
        </form>
      </section>
    </main>
  );
}

function Field({ icon: Icon, label, value, onChange, type = "text" }) {
  return (
    <label className="block">
      <span className="text-sm text-white/55">{label}</span>
      <span className="mt-2 flex items-center gap-3 rounded-2xl border border-white/10 bg-black/25 px-4 py-3">
        <Icon size={18} className="text-violet-300" />
        <input
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/30"
        />
      </span>
    </label>
  );
}
