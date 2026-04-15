import { useEffect, useState } from "react";
import SlidePanel from "../../components/common/SlidePanel";
import {
  User,
  Pencil,
  FileText,
  Upload,
  Eye,
  X,
  Briefcase
} from "lucide-react";

const STORAGE_KEY = "placement_profile_docs";

const PlacementProfile = () => {
  const [profileImage, setProfileImage] = useState("");
  const [previewDoc, setPreviewDoc] = useState(null);
  const [showEdit, setShowEdit] = useState(false);

  const [details, setDetails] = useState({
    account: {
      email: "placement@erp.com",
      category: "Placement Manager",
      service: "Corporate Relations",
    },
    personal: {
      dob: "15/08/1998 (26 years)",
      gender: "Male",
      social: "OBC",
      economic: "APL",
      aadhaar: "1234 5678 9101",
      pan: "ABCDE1234F",
      family: "4",
    },
    address: {
      house: "45B",
      street: "Link Road",
      landmark: "Near Badambadi Bus Stand",
      city: "Cuttack",
      district: "Cuttack",
      state: "Odisha",
      pincode: "753001",
    }
  });

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
      if (parsed.details) setDetails(parsed.details);
      setDocuments(parsed.documents || documents);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ profileImage, documents, details })
    );
  }, [profileImage, documents, details]);

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

  const Field = ({ label, value }) => (
    <div>
      <p className="text-xs text-white/60 capitalize">{label}</p>
      <p className="mt-1 text-sm font-medium text-white/90">{value}</p>
    </div>
  );

  const Input = ({ label, value, onChange }) => (
    <div>
      <label className="text-xs text-white/60 capitalize mb-1 block">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-[#111827] border border-yellow-400/20 rounded-lg px-3 py-2 text-sm text-white/90 focus:border-yellow-400 outline-none transition"
      />
    </div>
  );

  return (
    <section className="min-h-screen bg-transparent px-6 py-10 text-white/90">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* ================= HEADER ================= */}
        <div className="bg-[#020617] rounded-2xl p-6 border border-yellow-400/20 flex items-center gap-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-transparent overflow-hidden flex items-center justify-center border border-yellow-400/30">
              {profileImage ? (
                <img src={profileImage} className="w-full h-full object-cover" />
              ) : (
                <User size={40} className="text-white/60" />
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
            <h1 className="text-xl font-semibold flex items-center gap-2">
              <Briefcase className="text-cyan-400" size={20} />
              Gautam Samanta
            </h1>
            <p className="text-sm text-white/60">Placement Manager</p>
          </div>

          <button
            onClick={() => setShowEdit(true)}
            className="ml-auto flex items-center gap-2 px-4 py-2 bg-cyan-400 text-black text-sm font-medium rounded-lg hover:bg-cyan-300 transition cursor-pointer"
          >
            <Pencil size={16} /> Edit Profile
          </button>
        </div>

        {/* ================= GRID ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-[#020617] rounded-2xl border border-cyan-400/20 p-6">
            <h3 className="font-semibold mb-4 text-cyan-400">Account Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Email" value={details.account.email} />
              <Field label="Category" value={details.account.category} />
              <Field label="Service" value={details.account.service} />
            </div>
          </div>

          <div className="bg-[#020617] rounded-2xl border border-cyan-400/20 p-6">
            <h3 className="font-semibold mb-4 text-cyan-400">Personal Details</h3>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(details.personal).map(([k, v]) => (
                <Field key={k} label={k} value={v} />
              ))}
            </div>
          </div>
        </div>

        {/* ================= ADDRESS ================= */}
        <div className="bg-[#020617] rounded-2xl border border-cyan-400/20 p-6">
          <h3 className="font-semibold mb-4 text-cyan-400">Address Details</h3>
          <div className="grid grid-cols-3 gap-4">
            {Object.entries(details.address).map(([k, v]) => (
              <Field key={k} label={k} value={v} />
            ))}
          </div>
        </div>

        {/* ================= DOCUMENTS ================= */}
        <div className="bg-[#020617] rounded-2xl border border-cyan-400/20 p-6">
          <h3 className="flex items-center gap-2 font-semibold mb-6 text-cyan-400">
            <FileText size={18} /> Documents
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {documents.map((doc, idx) => (
              <div
                key={doc.title}
                className="border border-cyan-400/20 rounded-xl p-4 space-y-3 bg-transparent"
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
                        className="border border-cyan-400/30 px-3 py-1.5 rounded-lg text-sm flex items-center gap-1 hover:bg-cyan-400/10"
                      >
                        <Eye size={14} /> View
                      </button>
                    )}

                    <label className="border border-cyan-400/30 px-3 py-1.5 rounded-lg text-sm flex items-center gap-1 cursor-pointer hover:bg-cyan-400/10">
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
                    className="w-full h-40 object-contain border border-yellow-400/20 rounded-lg bg-transparent"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ================= PREVIEW MODAL ================= */}
      <SlidePanel open={!!previewDoc} onClose={() => setPreviewDoc(null)} title="Details" width="xl">
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
      </SlidePanel>

      {/* ================= EDIT MODAL ================= */}
      {showEdit && (
        <SlidePanel open={true} onClose={() => setShowEdit(false)} title="Edit Profile Details" width="3xl">
          <div className="space-y-6">
            
            <div className="bg-transparent border border-yellow-400/20 rounded-xl p-5 space-y-4">
              <h3 className="font-semibold text-yellow-400 border-b border-yellow-400/20 pb-2 mb-4">Account Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Object.keys(details.account).map(k => (
                  <Input key={k} label={k} value={details.account[k]} onChange={(v) => setDetails(d => ({...d, account: {...d.account, [k]: v}}))} />
                ))}
              </div>
            </div>

            <div className="bg-transparent border border-yellow-400/20 rounded-xl p-5 space-y-4">
              <h3 className="font-semibold text-yellow-400 border-b border-yellow-400/20 pb-2 mb-4">Personal Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Object.keys(details.personal).map(k => (
                  <Input key={k} label={k} value={details.personal[k]} onChange={(v) => setDetails(d => ({...d, personal: {...d.personal, [k]: v}}))} />
                ))}
              </div>
            </div>

            <div className="bg-transparent border border-yellow-400/20 rounded-xl p-5 space-y-4">
              <h3 className="font-semibold text-yellow-400 border-b border-yellow-400/20 pb-2 mb-4">Address Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Object.keys(details.address).map(k => (
                  <Input key={k} label={k} value={details.address[k]} onChange={(v) => setDetails(d => ({...d, address: {...d.address, [k]: v}}))} />
                ))}
              </div>
            </div>

          </div>

          <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-yellow-400/20">
            <button
              onClick={() => setShowEdit(false)}
              className="px-4 py-2 border border-yellow-400/30 text-yellow-400 rounded-md hover:bg-yellow-400/10 cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={() => setShowEdit(false)}
              className="px-6 py-2 bg-yellow-400 text-black font-semibold rounded-md hover:bg-yellow-300 cursor-pointer"
            >
              Save Changes
            </button>
          </div>
        </SlidePanel>
      )}

    </section>
  );
};

export default PlacementProfile;