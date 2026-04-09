import { useState } from "react";
import { Settings, Bell, Shield, Globe, Save, Check } from "lucide-react";
import { toast } from "react-toastify";

const INITIAL_SETTINGS = {
  platformName: "Kovon Platform",
  supportEmail: "support@kovon.in",
  timezone: "Asia/Kolkata",
  language: "English",
  maintenanceMode: false,
  emailNotifications: true,
  smsNotifications: false,
  attendanceAlerts: true,
  placementAlerts: true,
  systemAlerts: true,
  twoFactorAuth: false,
  sessionTimeout: "30",
  passwordExpiry: "90",
};

function ToggleSwitch({ checked, onChange }) {
  return (
    <button onClick={() => onChange(!checked)}
      className={`relative w-11 h-6 rounded-full transition-colors ${checked ? "bg-violet-500" : "bg-slate-700"}`}>
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${checked ? "translate-x-5" : ""}`} />
    </button>
  );
}

function InputField({ label, value, onChange, type = "text" }) {
  return (
    <div>
      <label className="text-xs text-white/60">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full mt-1 px-3 py-2 rounded-lg bg-transparent border border-slate-700 text-sm text-white/90 focus:border-violet-400 outline-none" />
    </div>
  );
}

export default function AdminSettings() {
  const [settings, setSettings] = useState(INITIAL_SETTINGS);
  const [saved, setSaved] = useState(false);

  const update = (key, value) => setSettings({ ...settings, [key]: value });

  const handleSave = () => {
    setSaved(true);
    toast.success("Settings saved successfully");
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-100">Settings</h1>
          <p className="text-sm text-white/60 mt-1">Platform configuration and preferences</p>
        </div>
        <button onClick={handleSave}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-violet-500 text-white font-medium hover:bg-violet-400 transition">
          {saved ? <Check size={16} /> : <Save size={16} />}
          {saved ? "Saved!" : "Save Changes"}
        </button>
      </div>

      {/* General Settings */}
      <div className="bg-[#111827] border border-slate-700 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-6">
          <Globe size={18} className="text-violet-400" />
          <h3 className="text-sm font-medium text-violet-400">General Settings</h3>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <InputField label="Platform Name" value={settings.platformName} onChange={(v) => update("platformName", v)} />
          <InputField label="Support Email" value={settings.supportEmail} onChange={(v) => update("supportEmail", v)} />
          <div>
            <label className="text-xs text-white/60">Timezone</label>
            <select value={settings.timezone} onChange={(e) => update("timezone", e.target.value)}
              className="w-full mt-1 px-3 py-2 rounded-lg bg-transparent border border-slate-700 text-sm text-white/90 focus:border-violet-400 outline-none">
              <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
              <option value="UTC">UTC</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-white/60">Language</label>
            <select value={settings.language} onChange={(e) => update("language", e.target.value)}
              className="w-full mt-1 px-3 py-2 rounded-lg bg-transparent border border-slate-700 text-sm text-white/90 focus:border-violet-400 outline-none">
              <option>English</option><option>Hindi</option><option>Odia</option>
            </select>
          </div>
        </div>
        <div className="flex items-center justify-between mt-6 p-3 rounded-lg bg-red-500/5 border border-red-500/20">
          <div>
            <p className="text-sm text-white/90">Maintenance Mode</p>
            <p className="text-xs text-slate-500">Temporarily disable access for all non-admin users</p>
          </div>
          <ToggleSwitch checked={settings.maintenanceMode} onChange={(v) => update("maintenanceMode", v)} />
        </div>
      </div>

      {/* Notification Settings */}
      <div className="bg-[#111827] border border-slate-700 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-6">
          <Bell size={18} className="text-violet-400" />
          <h3 className="text-sm font-medium text-violet-400">Notification Preferences</h3>
        </div>
        <div className="space-y-4">
          {[
            { key: "emailNotifications", label: "Email Notifications", desc: "Receive updates via email" },
            { key: "smsNotifications", label: "SMS Notifications", desc: "Receive updates via SMS" },
            { key: "attendanceAlerts", label: "Attendance Alerts", desc: "Get notified when attendance drops below threshold" },
            { key: "placementAlerts", label: "Placement Alerts", desc: "Updates on placement drives and outcomes" },
            { key: "systemAlerts", label: "System Alerts", desc: "Maintenance and system health notifications" },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm text-white/90">{item.label}</p>
                <p className="text-xs text-slate-500">{item.desc}</p>
              </div>
              <ToggleSwitch checked={settings[item.key]} onChange={(v) => update(item.key, v)} />
            </div>
          ))}
        </div>
      </div>

      {/* Security */}
      <div className="bg-[#111827] border border-slate-700 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-6">
          <Shield size={18} className="text-violet-400" />
          <h3 className="text-sm font-medium text-violet-400">Security Settings</h3>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm text-white/90">Two-Factor Authentication</p>
              <p className="text-xs text-slate-500">Require 2FA for all admin logins</p>
            </div>
            <ToggleSwitch checked={settings.twoFactorAuth} onChange={(v) => update("twoFactorAuth", v)} />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <InputField label="Session Timeout (minutes)" value={settings.sessionTimeout} onChange={(v) => update("sessionTimeout", v)} />
            <InputField label="Password Expiry (days)" value={settings.passwordExpiry} onChange={(v) => update("passwordExpiry", v)} />
          </div>
        </div>
      </div>

      {/* System Info */}
      <div className="bg-[#111827] border border-slate-700 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Settings size={18} className="text-violet-400" />
          <h3 className="text-sm font-medium text-violet-400">System Information</h3>
        </div>
        <div className="grid md:grid-cols-2 gap-3 text-sm">
          {[
            ["Platform Version", "v1.0.0"],
            ["Environment", "Production"],
            ["Last Deploy", "05 Mar 2026"],
            ["Uptime", "99.9%"],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between py-1.5">
              <span className="text-white/60">{k}</span>
              <span className="text-white/90">{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
