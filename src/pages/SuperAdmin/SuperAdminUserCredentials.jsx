import { useState } from "react";
import { Key, UserPlus, ShieldPlus, RefreshCcw, Eye, EyeOff, Copy, CheckCircle2, Search, Filter, Mail, MessageSquare } from "lucide-react";

/* ===================== MOCK DATA ===================== */

const ROLES = ["Admin", "Mobilizer", "Trainer", "Placement Officer"];
const CENTERS = ["Angul", "Sundargarh", "Keonjhar", "Jharsuguda", "Kalahandi"];

const RECENT_CREDENTIALS = [
  { id: "PSU-ADM-021", name: "Rahul Sharma", role: "Admin", center: "Angul", created: "2026-03-05", status: "Active" },
  { id: "PSU-MOB-112", name: "Priya Sahu", role: "Mobilizer", center: "Sundargarh", created: "2026-03-04", status: "Active" },
  { id: "PSU-TRN-058", name: "Amit Panda", role: "Trainer", center: "Keonjhar", created: "2026-03-04", status: "Inactive" },
  { id: "PSU-PLC-009", name: "Sonal Behera", role: "Placement Officer", center: "Jharsuguda", created: "2026-03-02", status: "Active" },
];

/* ===================== COMPONENT ===================== */

export default function SuperAdminUserCredentials() {
  const [formData, setFormData] = useState({
    name: "",
    role: "Admin",
    center: "Angul",
    email: "",
    username: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateCredentials = () => {
    const randomPass = Math.random().toString(36).slice(-8).toUpperCase();
    const prefix = formData.role.substring(0, 3).toUpperCase();
    const randomID = `PSU-${prefix}-${Math.floor(100 + Math.random() * 900)}`;
    
    setFormData({
      ...formData,
      username: randomID,
      password: randomPass
    });
    setGenerated(true);
  };

  const copyToClipboard = () => {
    const text = `ID: ${formData.username}\nPassword: ${formData.password}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
          <Key size={26} className="text-red-500" /> User Credentials Manager
        </h1>
        <p className="text-sm text-white/60 mt-1">Generate secure access IDs and passwords for all platform roles</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left: Generation Form */}
        <div className="bg-[#111827] border border-slate-700/50 rounded-2xl p-6 shadow-xl">
          <h3 className="text-sm font-bold text-white/90 uppercase tracking-widest mb-6 flex items-center gap-2">
            <UserPlus size={18} className="text-red-500" /> Provision New User
          </h3>

          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-500 uppercase px-1">Full Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Rajesh Mishra"
                  className="w-full bg-transparent border border-slate-700 text-white/90 text-sm rounded-xl px-4 py-3 outline-none focus:border-red-500 transition"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-500 uppercase px-1">Email Address</label>
                <input 
                  type="email" 
                  placeholder="name@psu.edu"
                  className="w-full bg-transparent border border-slate-700 text-white/90 text-sm rounded-xl px-4 py-3 outline-none focus:border-red-500 transition"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-500 uppercase px-1">Assigned Role</label>
                <select 
                  className="w-full bg-transparent border border-slate-700 text-white/90 text-sm rounded-xl px-4 py-3 outline-none focus:border-red-500 transition cursor-pointer"
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                >
                  {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-500 uppercase px-1">Base Center</label>
                <select 
                  className="w-full bg-transparent border border-slate-700 text-white/90 text-sm rounded-xl px-4 py-3 outline-none focus:border-red-500 transition cursor-pointer"
                  value={formData.center}
                  onChange={(e) => setFormData({...formData, center: e.target.value})}
                >
                  {CENTERS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <button 
              onClick={generateCredentials}
              className="w-full py-4 bg-gradient-to-r from-red-600 to-red-500 text-black font-bold rounded-xl hover:opacity-90 transition flex items-center justify-center gap-2 shadow-lg shadow-red-500/10"
            >
              <RefreshCcw size={18} /> Generate Secure Access
            </button>

            {generated && (
              <div className="mt-6 p-6 rounded-2xl bg-transparent/20 border border-red-500/20 animate-in fade-in slide-in-from-top-4">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest">Access Protocol Ready</span>
                  <div className="flex gap-2">
                    <button onClick={copyToClipboard} className="p-2 bg-transparent rounded-lg text-white/60 hover:text-white transition">
                      {copied ? <CheckCircle2 size={16} className="text-emerald-400" /> : <Copy size={16} />}
                    </button>
                    <button className="p-2 bg-transparent rounded-lg text-white/60 hover:text-white transition">
                      <Mail size={16} />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex flex-col bg-transparent/40 p-4 rounded-xl border border-slate-700/50">
                    <span className="text-[10px] text-slate-500 uppercase font-bold mb-1">User ID</span>
                    <span className="text-lg font-mono text-slate-100 font-bold">{formData.username}</span>
                  </div>
                  <div className="flex flex-col bg-transparent/40 p-4 rounded-xl border border-slate-700/50 relative group">
                    <span className="text-[10px] text-slate-500 uppercase font-bold mb-1">Pass-Key</span>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-mono text-slate-100 font-bold">
                        {showPassword ? formData.password : "••••••••"}
                      </span>
                      <button onClick={() => setShowPassword(!showPassword)} className="text-slate-500 hover:text-white transition">
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: History & Logs */}
        <div className="space-y-6">
          <div className="bg-[#111827] border border-slate-700/50 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-bold text-white/90 uppercase tracking-widest">Recently Provisioned</h3>
              <button className="text-[10px] font-bold text-red-500 hover:underline">Download Registry</button>
            </div>
            
            <div className="space-y-4">
              {RECENT_CREDENTIALS.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-4 rounded-xl border border-white/[0.08] hover:border-slate-700 transition group">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg bg-transparent text-red-500`}>
                      <ShieldPlus size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white/90 group-hover:text-red-500 transition">{user.name}</p>
                      <p className="text-[10px] text-slate-500 uppercase font-medium">{user.role} • {user.center}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-mono text-white/60">{user.id}</p>
                    <div className="flex items-center justify-end gap-1.5 mt-1">
                      <div className={`w-1.5 h-1.5 rounded-full ${user.status === 'Active' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                      <span className="text-[10px] text-slate-500">{user.status}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <button className="w-full py-3 mt-6 rounded-xl border border-white/[0.08] text-xs font-bold text-white/60 hover:bg-transparent transition">
              View Extended User Directory
            </button>
          </div>

          <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-6">
            <h4 className="text-sm font-bold text-red-500 flex items-center gap-2 mb-3">
              <ShieldPlus size={18} /> Security Directive
            </h4>
            <p className="text-xs text-white/60 leading-relaxed">
              Super Admin credentials generation triggers a baseline audit log. Ensure the recipient's primary identity is verified before dispatching access keys. Standard encryption (AES-256) is applied to all provisioned protocols.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
