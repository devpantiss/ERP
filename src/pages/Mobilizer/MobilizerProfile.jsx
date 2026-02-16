import { useEffect, useState } from "react";
import {
  User,
  Pencil,
  FileText,
  Upload,
  Eye,
  X,
} from "lucide-react";

const STORAGE_KEY = "mobilizer_profile_docs";

const MobilizerProfile = () => {
  const [profileImage, setProfileImage] = useState("");
  const [previewDoc, setPreviewDoc] = useState(null);

  const [documents, setDocuments] = useState([
    { title: "Aadhaar Card", file: "" },
    { title: "PAN Card", file: "" },
    { title: "Passbook Image", file: "" },
    { title: "Cheque Leaf Image", file: "" },
  ]);

  /* ===================== LOAD / SAVE ===================== */
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      setProfileImage(parsed.profileImage || "");
      setDocuments(parsed.documents || documents);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ profileImage, documents })
    );
  }, [profileImage, documents]);

  /* ===================== UPLOAD HELPERS ===================== */
  const readFile = (file, cb) => {
    const reader = new FileReader();
    reader.onloadend = () => cb(reader.result);
    reader.readAsDataURL(file);
  };

  const uploadProfile = (file) => {
    if (!file) return;
    readFile(file, setProfileImage);
  };

  const uploadDocument = (index, file) => {
    if (!file) return;
    readFile(file, (base64) => {
      const updated = [...documents];
      updated[index].file = base64;
      setDocuments(updated);
    });
  };

  /* ===================== STATIC DATA ===================== */
  const account = {
    email: "gautamsam23@gmail.com",
    category: "Plumber",
    service: "Water Maintenance",
  };

  const personal = {
    dob: "15/08/1998 (26 years)",
    gender: "Male",
    social: "OBC",
    economic: "APL",
    aadhaar: "1234 5678 9101",
    pan: "ABCDE1234F",
    family: "4",
  };

  const address = {
    house: "45B",
    street: "Link Road",
    landmark: "Near Badambadi Bus Stand",
    city: "Cuttack",
    district: "Cuttack",
    state: "Odisha",
    pincode: "753001",
  };

  const Field = ({ label, value }) => (
    <div>
      <p className="text-xs text-slate-400 capitalize">{label}</p>
      <p className="mt-1 text-sm font-medium text-slate-200">{value}</p>
    </div>
  );

  return (
    <section className="min-h-screen bg-[#0b0f14] px-6 py-10 text-slate-200">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* ================= HEADER ================= */}
        <div className="bg-[#020617] rounded-2xl p-6 border border-yellow-400/20 flex items-center gap-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-slate-800 overflow-hidden flex items-center justify-center border border-yellow-400/30">
              {profileImage ? (
                <img src={profileImage} className="w-full h-full object-cover" />
              ) : (
                <User size={40} className="text-slate-400" />
              )}
            </div>

            <label className="absolute bottom-1 right-1 bg-yellow-400 text-black rounded-full p-1.5 shadow cursor-pointer">
              <Pencil size={14} />
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => uploadProfile(e.target.files[0])}
              />
            </label>
          </div>

          <div>
            <h1 className="text-xl font-semibold">Gautam Samanta</h1>
            <p className="text-sm text-slate-400">MWC120</p>
          </div>
        </div>

        {/* ================= GRID ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-[#020617] rounded-2xl border border-yellow-400/20 p-6">
            <h3 className="font-semibold mb-4 text-yellow-400">Account Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Email" value={account.email} />
              <Field label="Category" value={account.category} />
              <Field label="Service" value={account.service} />
            </div>
          </div>

          <div className="bg-[#020617] rounded-2xl border border-yellow-400/20 p-6">
            <h3 className="font-semibold mb-4 text-yellow-400">Personal Details</h3>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(personal).map(([k, v]) => (
                <Field key={k} label={k} value={v} />
              ))}
            </div>
          </div>
        </div>

        {/* ================= ADDRESS ================= */}
        <div className="bg-[#020617] rounded-2xl border border-yellow-400/20 p-6">
          <h3 className="font-semibold mb-4 text-yellow-400">Address Details</h3>
          <div className="grid grid-cols-3 gap-4">
            {Object.entries(address).map(([k, v]) => (
              <Field key={k} label={k} value={v} />
            ))}
          </div>
        </div>

        {/* ================= DOCUMENTS ================= */}
        <div className="bg-[#020617] rounded-2xl border border-yellow-400/20 p-6">
          <h3 className="flex items-center gap-2 font-semibold mb-6 text-yellow-400">
            <FileText size={18} /> Documents
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {documents.map((doc, idx) => (
              <div
                key={doc.title}
                className="border border-yellow-400/20 rounded-xl p-4 space-y-3 bg-[#0b0f14]"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{doc.title}</p>
                    <p
                      className={`text-sm ${
                        doc.file ? "text-green-400" : "text-red-400"
                      }`}
                    >
                      {doc.file ? "Uploaded" : "Not uploaded"}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    {doc.file && (
                      <button
                        onClick={() => setPreviewDoc(doc.file)}
                        className="border border-yellow-400/30 px-3 py-1.5 rounded-lg text-sm flex items-center gap-1 hover:bg-yellow-400/10"
                      >
                        <Eye size={14} /> View
                      </button>
                    )}

                    <label className="border border-yellow-400/30 px-3 py-1.5 rounded-lg text-sm flex items-center gap-1 cursor-pointer hover:bg-yellow-400/10">
                      <Upload size={14} /> Upload
                      <input
                        type="file"
                        hidden
                        onChange={(e) =>
                          uploadDocument(idx, e.target.files[0])
                        }
                      />
                    </label>
                  </div>
                </div>

                {doc.file && (
                  <img
                    src={doc.file}
                    className="w-full h-40 object-contain border border-yellow-400/20 rounded-lg bg-black"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ================= PREVIEW MODAL ================= */}
      {previewDoc && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center">
          <div className="bg-[#020617] rounded-xl p-4 max-w-3xl w-full relative border border-yellow-400/30">
            <button
              onClick={() => setPreviewDoc(null)}
              className="absolute top-3 right-3 text-yellow-400"
            >
              <X />
            </button>
            <img
              src={previewDoc}
              className="w-full max-h-[80vh] object-contain rounded"
            />
          </div>
        </div>
      )}
    </section>
  );
};

export default MobilizerProfile;