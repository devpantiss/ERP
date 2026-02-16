import { useState } from "react";
import {
  User,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  Edit,
  BookOpen,
  Users,
  Star,
  Upload,
  FileText,
} from "lucide-react";

/* ===================== MOCK DATA ===================== */

const INITIAL_PROFILE = {
  name: "Aditya Sahu",
  role: "Senior Trainer",
  trainerId: "TRN-1024",
  phone: "+91 9876543210",
  email: "aditya@example.com",
  address: "Bhubaneswar, Odisha",
  department: "Power & Green Energy",
  experience: "5 Years",
  qualification: "B.Tech Electrical",
  center: "Pantiss Training Center",
  joinDate: "12 Jan 2022",
  hoursCompleted: 1240,
  avatar: "https://i.pravatar.cc/150?img=12",

  totCertificate: {
    name: "Training of Trainers (TOT)",
    authority: "NSDC",
    issueDate: "15 March 2023",
    file: "/certificate.jpg",
  },
};

/* ===================== MAIN ===================== */

export default function TrainerProfile() {
  const [profile, setProfile] = useState(INITIAL_PROFILE);
  const [editOpen, setEditOpen] = useState(false);

  return (
    <div className="p-8 bg-[#020617] min-h-screen text-slate-200">

      <ProfileHeader
        profile={profile}
        onEdit={() => setEditOpen(true)}
      />

      <StatsGrid profile={profile} />

      <div className="grid md:grid-cols-2 gap-6 mt-6">

        <InfoCard title="Personal Information">
          <InfoRow icon={<User />} label="Full Name" value={profile.name} />
          <InfoRow icon={<Phone />} label="Phone" value={profile.phone} />
          <InfoRow icon={<Mail />} label="Email" value={profile.email} />
          <InfoRow icon={<MapPin />} label="Address" value={profile.address} />
        </InfoCard>

        <InfoCard title="Professional Information">
          <InfoRow icon={<Briefcase />} label="Department" value={profile.department} />
          <InfoRow icon={<Briefcase />} label="Experience" value={profile.experience} />
          <InfoRow icon={<Briefcase />} label="Qualification" value={profile.qualification} />
          <InfoRow icon={<MapPin />} label="Training Center" value={profile.center} />
          <InfoRow icon={<MapPin />} label="Joining Date" value={profile.joinDate} />
        </InfoCard>

      </div>

      <TotCertificateCard certificate={profile.totCertificate} />

      {editOpen && (
        <EditModal
          profile={profile}
          setProfile={setProfile}
          onClose={() => setEditOpen(false)}
        />
      )}

    </div>
  );
}

/* ===================== PROFILE HEADER ===================== */

function ProfileHeader({ profile, onEdit }) {
  return (
    <div className="bg-[#020617]/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl">

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">

        <div className="flex items-center gap-5">

          <img
            src={profile.avatar}
            className="w-20 h-20 rounded-xl object-cover border border-slate-700"
          />

          <div>
            <h2 className="text-2xl font-semibold">{profile.name}</h2>
            <p className="text-slate-400">{profile.role}</p>
            <p className="text-xs text-slate-500">
              ID: {profile.trainerId}
            </p>
          </div>

        </div>

        <button
          onClick={onEdit}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500 text-black font-medium hover:bg-emerald-400"
        >
          <Edit size={16} />
          Edit Profile
        </button>

      </div>

    </div>
  );
}

/* ===================== STATS ===================== */

function StatsGrid({ profile }) {
  return (
    <div className="grid md:grid-cols-4 gap-4 mt-6">

      <StatCard
        icon={<BookOpen />}
        label="Modules Completed"
        value="128"
      />

      <StatCard
        icon={<Users />}
        label="Students Trained"
        value="540"
      />

      <StatCard
        icon={<Briefcase />}
        label="Hours Completed"
        value={`${profile.hoursCompleted.toLocaleString()} hrs`}
      />

      <StatCard
        icon={<Star />}
        label="Rating"
        value="4.8 / 5"
      />

    </div>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <div className="bg-[#020617]/60 border border-slate-800 rounded-xl p-4 backdrop-blur-xl">

      <div className="flex items-center gap-3 mb-2 text-emerald-400">
        {icon}
        <span className="text-sm">{label}</span>
      </div>

      <p className="text-xl font-semibold">{value}</p>

    </div>
  );
}

/* ===================== INFO ===================== */

function InfoCard({ title, children }) {
  return (
    <div className="bg-[#020617]/60 border border-slate-800 rounded-xl p-6 backdrop-blur-xl">

      <h3 className="text-sm font-medium text-emerald-400 mb-4">
        {title}
      </h3>

      <div className="space-y-3">{children}</div>

    </div>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <div className="flex items-center justify-between text-sm">

      <div className="flex items-center gap-2 text-slate-400">
        {icon}
        {label}
      </div>

      <span>{value}</span>

    </div>
  );
}

/* ===================== CERTIFICATE CARD ===================== */

function TotCertificateCard({ certificate }) {
  return (
    <div className="bg-[#020617]/60 border border-slate-800 rounded-xl p-6 backdrop-blur-xl mt-6">

      <h3 className="text-sm font-medium text-emerald-400 mb-4">
        Trainer Certifications
      </h3>

      <div className="grid md:grid-cols-2 gap-6">

        <div className="space-y-2 text-sm">
          <p><span className="text-slate-400">Certificate:</span> {certificate.name}</p>
          <p><span className="text-slate-400">Authority:</span> {certificate.authority}</p>
          <p><span className="text-slate-400">Issue Date:</span> {certificate.issueDate}</p>
        </div>

        <div className="border border-slate-700 rounded-lg overflow-hidden">

          {certificate.file ? (
            <img
              src={certificate.file}
              className="w-full h-64 object-cover"
            />
          ) : (
            <div className="h-64 flex items-center justify-center text-slate-500">
              <FileText size={40} />
            </div>
          )}

        </div>

      </div>

    </div>
  );
}

/* ===================== EDIT MODAL ===================== */

function EditModal({ profile, setProfile, onClose }) {
  const [form, setForm] = useState(profile);

  const handleChange = (key, value) => {
    setForm({ ...form, [key]: value });
  };

  const handleAvatarUpload = (file) => {
    const url = URL.createObjectURL(file);
    setForm({ ...form, avatar: url });
  };

  const handleCertUpload = (file) => {
    const url = URL.createObjectURL(file);
    setForm({
      ...form,
      totCertificate: {
        ...form.totCertificate,
        file: url,
      },
    });
  };

  const handleCertField = (field, value) => {
    setForm({
      ...form,
      totCertificate: {
        ...form.totCertificate,
        [field]: value,
      },
    });
  };

  const handleSave = () => {
    setProfile(form);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex justify-center overflow-y-auto">

      <div className="w-full max-w-3xl my-10 bg-[#020617] border border-slate-800 rounded-2xl shadow-xl flex flex-col">

        {/* HEADER */}
        <div className="sticky top-0 bg-[#020617] border-b border-slate-800 px-6 py-4 rounded-t-2xl">
          <h3 className="text-xl font-semibold">
            Edit Trainer Profile
          </h3>
        </div>

        {/* BODY */}
        <div className="p-6 space-y-8 overflow-y-auto max-h-[70vh]">

          <Section title="Profile Photo">

            <div className="flex items-center gap-6">

              <img
                src={form.avatar}
                className="w-24 h-24 rounded-xl object-cover border border-slate-700"
              />

              <label className="px-4 py-2 bg-slate-700 rounded-md cursor-pointer hover:bg-slate-600">
                Upload / Replace
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) =>
                    handleAvatarUpload(e.target.files[0])
                  }
                />
              </label>

            </div>

          </Section>

          <Section title="Personal Information">

            <div className="grid md:grid-cols-2 gap-4">

              <Input label="Full Name" value={form.name} onChange={(v) => handleChange("name", v)} />
              <Input label="Phone" value={form.phone} onChange={(v) => handleChange("phone", v)} />
              <Input label="Email" value={form.email} onChange={(v) => handleChange("email", v)} />
              <Input label="Address" value={form.address} onChange={(v) => handleChange("address", v)} />

            </div>

          </Section>

          <Section title="Professional Information">

            <div className="grid md:grid-cols-2 gap-4">

              <Input label="Department" value={form.department} onChange={(v) => handleChange("department", v)} />
              <Input label="Experience" value={form.experience} onChange={(v) => handleChange("experience", v)} />
              <Input label="Qualification" value={form.qualification} onChange={(v) => handleChange("qualification", v)} />
              <Input label="Training Center" value={form.center} onChange={(v) => handleChange("center", v)} />

            </div>

          </Section>

          <Section title="TOT Certificate">

            <div className="grid md:grid-cols-2 gap-6 items-center">

              <div className="space-y-3">

                <Input
                  label="Certificate Name"
                  value={form.totCertificate.name}
                  onChange={(v) => handleCertField("name", v)}
                />

                <Input
                  label="Authority"
                  value={form.totCertificate.authority}
                  onChange={(v) => handleCertField("authority", v)}
                />

                <Input
                  label="Issue Date"
                  value={form.totCertificate.issueDate}
                  onChange={(v) => handleCertField("issueDate", v)}
                />

                <label className="inline-flex items-center gap-2 px-4 py-2 bg-slate-700 rounded-md cursor-pointer hover:bg-slate-600">
                  Upload / Replace Certificate
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) =>
                      handleCertUpload(e.target.files[0])
                    }
                  />
                </label>

              </div>

              <div className="border border-slate-700 rounded-lg overflow-hidden">

                {form.totCertificate.file ? (
                  <img
                    src={form.totCertificate.file}
                    className="w-full h-56 object-cover"
                  />
                ) : (
                  <div className="h-56 flex items-center justify-center text-slate-500">
                    No Certificate
                  </div>
                )}

              </div>

            </div>

          </Section>

        </div>

        {/* FOOTER */}
        <div className="sticky bottom-0 bg-[#020617] border-t border-slate-800 px-6 py-4 rounded-b-2xl flex justify-end gap-3">

          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-700 rounded-md"
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            className="px-6 py-2 bg-emerald-500 text-black rounded-md font-medium hover:bg-emerald-400"
          >
            Save Changes
          </button>

        </div>

      </div>

    </div>
  );
}

/* ===================== SECTION ===================== */

function Section({ title, children }) {
  return (
    <div>
      <h4 className="text-sm font-medium text-emerald-400 mb-3">
        {title}
      </h4>
      {children}
    </div>
  );
}

/* ===================== INPUT ===================== */

function Input({ label, value, onChange }) {
  return (
    <div>
      <label className="text-xs text-slate-400">
        {label}
      </label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full mt-1 px-3 py-2 rounded-md bg-[#020617] border border-slate-700 focus:border-emerald-400 outline-none"
      />
    </div>
  );
}
