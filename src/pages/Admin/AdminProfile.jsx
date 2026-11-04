import { useState } from "react";
import SlidePanel from "../../components/common/SlidePanel";
import { User, Phone, Mail, MapPin, Briefcase, Edit, BookOpen, Users, Star } from "lucide-react";

const INITIAL_PROFILE = {
  name: "Rajendra Mohanty",
  role: "Platform Administrator",
  adminId: "ADM-001",
  phone: "+91 9876500001",
  email: "admin@kovon.in",
  address: "Bhubaneswar, Odisha",
  department: "Operations & Administration",
  experience: "12 Years",
  qualification: "MBA – Operations Management",
  organization: "Pantiss Foundation",
  joinDate: "01 Jan 2020",
  centersManaged: 6,
  avatar: "https://i.pravatar.cc/150?img=3",
};

export default function AdminProfile({ initialProfile = INITIAL_PROFILE, stats, editTitle = "Edit Admin Profile" }) {
  const [profile, setProfile] = useState(initialProfile);
  const [draft, setDraft] = useState(initialProfile);
  const [editOpen, setEditOpen] = useState(false);

  return (
    <div className="p-0 sm:p-4 lg:p-8 bg-transparent min-h-screen text-white/90">
      {/* Header */}
      <div className="bg-[#111827] border border-slate-700 rounded-2xl p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-center gap-5">
            {profile.avatar ? <img src={profile.avatar} alt={`${profile.name} profile`} className="w-20 h-20 rounded-xl object-cover border border-slate-700" /> : <div aria-hidden="true" className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl border border-slate-700 bg-violet-500/10 text-2xl font-semibold text-violet-300">{profile.name.split(" ").map((part) => part[0]).join("")}</div>}
            <div>
              <h2 className="text-2xl font-semibold">{profile.name}</h2>
              <p className="text-white/60">{profile.role}</p>
              <p className="text-xs text-slate-500">ID: {profile.adminId}</p>
            </div>
          </div>
          <button onClick={() => { setDraft(profile); setEditOpen(true); }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-500 text-white font-medium hover:bg-violet-400">
            <Edit size={16} /> Edit Profile
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-4 mt-6">
        {(stats || [
          { icon: <BookOpen />, label: "Centers Managed", value: profile.centersManaged },
          { icon: <Users />, label: "Team Members", value: "186" },
          { icon: <Briefcase />, label: "Active Projects", value: "8" },
          { icon: <Star />, label: "Platform Uptime", value: "99.9%" },
        ]).map((s) => (
          <div key={s.label} className="bg-[#111827] border border-slate-700 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-2 text-violet-400">{s.icon}<span className="text-sm">{s.label}</span></div>
            <p className="text-xl font-semibold">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Info Cards */}
      <div className="grid md:grid-cols-2 gap-6 mt-6">
        <div className="bg-[#111827] border border-slate-700 rounded-xl p-6">
          <h3 className="text-sm font-medium text-violet-400 mb-4">Personal Information</h3>
          <div className="space-y-3">
            {[
              [<User key="u" />, "Full Name", profile.name],
              [<Phone key="p" />, "Phone", profile.phone],
              [<Mail key="m" />, "Email", profile.email],
              [<MapPin key="mp" />, "Address", profile.address],
            ].map(([icon, label, value]) => (
              <div key={label} className="flex flex-col gap-1 text-sm sm:flex-row sm:justify-between sm:gap-4">
                <div className="flex items-center gap-2 text-white/60">{icon}{label}</div>
                <span>{value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#111827] border border-slate-700 rounded-xl p-6">
          <h3 className="text-sm font-medium text-violet-400 mb-4">Professional Information</h3>
          <div className="space-y-3">
            {[
              [<Briefcase key="b" />, "Department", profile.department],
              [<Briefcase key="b2" />, "Experience", profile.experience],
              [<Briefcase key="b3" />, "Qualification", profile.qualification],
              [<MapPin key="mp" />, "Organization", profile.organization],
              [<MapPin key="mp2" />, "Joining Date", profile.joinDate],
            ].map(([icon, label, value]) => (
              <div key={label} className="flex flex-col gap-1 text-sm sm:flex-row sm:justify-between sm:gap-4">
                <div className="flex items-center gap-2 text-white/60">{icon}{label}</div>
                <span>{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <SlidePanel open={!!editOpen} onClose={() => setEditOpen(false)} title={editTitle} width="xl">
            <div className="sticky top-0 bg-[#111827] border-b border-slate-700 px-6 py-4 rounded-t-2xl">
              <h3 className="text-xl font-semibold">{editTitle}</h3>
            </div>
            <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh]">
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  ["name", "Full Name"], ["phone", "Phone"], ["email", "Email"], ["address", "Address"],
                  ["department", "Department"], ["experience", "Experience"], ["qualification", "Qualification"], ["organization", "Organization"],
                ].map(([key, label]) => (
                  <div key={key}>
                    <label htmlFor={`profile-${key}`} className="text-xs text-white/60">{label}</label>
                    <input id={`profile-${key}`} value={draft[key]} onChange={(e) => setDraft({ ...draft, [key]: e.target.value })}
                      className="w-full mt-1 px-3 py-2 rounded-md bg-transparent border border-slate-700 focus:border-violet-400 outline-none" />
                  </div>
                ))}
              </div>
            </div>
            <div className="sticky bottom-0 bg-[#111827] border-t border-slate-700 px-6 py-4 rounded-b-2xl flex justify-end gap-3">
              <button onClick={() => setEditOpen(false)} className="px-4 py-2 bg-slate-700 rounded-md">Cancel</button>
              <button onClick={() => { setProfile(draft); setEditOpen(false); }} className="px-6 py-2 bg-violet-500 text-white rounded-md font-medium hover:bg-violet-400">Save Changes</button>
            </div>
      </SlidePanel>
    </div>
  );
}
