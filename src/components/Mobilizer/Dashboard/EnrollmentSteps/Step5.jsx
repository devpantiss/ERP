import { MapContainer, TileLayer, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import {
  getEnrollmentData,
  clearEnrollmentData,
} from "../../../utils/enrollmentStorage";

/* ================= SAFE FILE PREVIEW ================= */

function getPreview(file) {
  if (!file) return null;

  // If already base64 string (recommended storage)
  if (typeof file === "string") return file;

  // If still a File object (before reload)
  if (file instanceof File) return URL.createObjectURL(file);

  return null;
}

export default function ReviewStep({ onEditStep, onSubmit }) {
  const data = getEnrollmentData();

  if (!data) {
    return (
      <div className="text-center text-slate-400">
        No enrollment data found.
      </div>
    );
  }

  const {
    roleProject = {},
    address = {},
    basic = {},
    capture = {},
  } = data;

  const isOperatorRole =
    roleProject?.role?.toLowerCase()?.includes("operator");

  return (
    <div className="space-y-8 text-slate-200">

      {/* ================= ROLE ================= */}
      <Section title="Job Role & Project" onEdit={() => onEditStep(0)}>
        <Item label="Job Role" value={roleProject.role} />
        <Item label="Project / Center" value={roleProject.project} />
      </Section>

      {/* ================= ADDRESS ================= */}
      <Section title="Address & Location" onEdit={() => onEditStep(1)}>
        <Item label="House / Flat" value={address.address?.house} />
        <Item label="Street" value={address.address?.street} />
        <Item label="Landmark" value={address.address?.landmark} />
        <Item label="City" value={address.address?.city} />
        <Item label="District" value={address.address?.district} />
        <Item label="State" value={address.address?.state} />
        <Item label="Pincode" value={address.address?.pincode} />

        {address.lat && address.lng && (
          <div className="mt-4 h-64 rounded-lg overflow-hidden border border-yellow-400/20">
            <MapContainer
              center={[address.lat, address.lng]}
              zoom={14}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <Marker position={[address.lat, address.lng]} />
            </MapContainer>
          </div>
        )}
      </Section>

      {/* ================= BASIC INFO ================= */}
      <Section title="Basic Information" onEdit={() => onEditStep(2)}>
        <Item label="Full Name" value={basic.fullName} />
        <Item label="Gender" value={basic.gender} />
        <Item label="Date of Birth" value={formatDate(basic.dateOfBirth)} />
        <Item label="Aadhaar Number" value={basic.aadharNumber} />

        {getPreview(basic.aadharFile) && (
          <PreviewImage
            label="Aadhaar Card"
            src={getPreview(basic.aadharFile)}
          />
        )}
      </Section>

      {/* ================= QUALIFICATION ================= */}
      <Section title="Highest Qualification" onEdit={() => onEditStep(2)}>
        <Item label="Qualification Level" value={basic.qualificationLevel} />
        <Item label="Trade / Discipline" value={basic.qualificationTrade} />
        <Item label="Institute / Board" value={basic.qualificationInstitute} />
        <Item label="Year of Passing" value={basic.qualificationYear} />

        {getPreview(basic.qualificationCert) && (
          <PreviewImage
            label="Qualification Certificate"
            src={getPreview(basic.qualificationCert)}
          />
        )}
      </Section>

      {/* ================= PROFESSIONAL ================= */}
      <Section title="Professional Details" onEdit={() => onEditStep(2)}>
        <Item
          label="Experience (Years)"
          value={basic.experienceYears || "—"}
        />
        <Item
          label="Currently Employed"
          value={basic.currentlyEmployed || "—"}
        />

        {isOperatorRole && getPreview(basic.licenseCert) && (
          <PreviewImage
            label="Operator License"
            src={getPreview(basic.licenseCert)}
          />
        )}

        {getPreview(basic.experienceCert) && (
          <PreviewImage
            label="Experience Certificate"
            src={getPreview(basic.experienceCert)}
          />
        )}
      </Section>

      {/* ================= LIVE CAPTURE ================= */}
      <Section title="Live Photo & Location" onEdit={() => onEditStep(3)}>
        {capture.photo && (
          <PreviewImage label="Captured Photo" src={capture.photo} />
        )}

        {capture.location && (
          <>
            <Item label="Latitude" value={capture.location.lat} />
            <Item label="Longitude" value={capture.location.lng} />
            <Item
              label="Accuracy"
              value={`±${Math.round(capture.location.accuracy)} m`}
            />
            <Item label="Place" value={capture.location.place} />
          </>
        )}
      </Section>

      {/* ================= ACTIONS ================= */}
      <div className="flex justify-end gap-4 pt-6 border-t border-yellow-400/20">
        <button
          onClick={() => onEditStep(0)}
          className="px-4 py-2 rounded-md
            border border-yellow-400/30 text-yellow-400
            hover:bg-yellow-400/10"
        >
          Edit
        </button>

        <button
          onClick={() => {
            onSubmit(data);
            clearEnrollmentData();
          }}
          className="px-6 py-2 rounded-md
            bg-yellow-400 text-black font-semibold
            hover:bg-yellow-300"
        >
          Confirm & Submit
        </button>
      </div>
    </div>
  );
}

/* ================= UI HELPERS ================= */

function Section({ title, children, onEdit }) {
  return (
    <div className="bg-[#020617] border border-yellow-400/20 rounded-xl p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-yellow-400">{title}</h3>
        {onEdit && (
          <button
            onClick={onEdit}
            className="text-sm text-yellow-400 hover:underline"
          >
            Edit
          </button>
        )}
      </div>
      {children}
    </div>
  );
}

function Item({ label, value }) {
  return (
    <div className="text-sm text-slate-300">
      <span className="text-slate-400 font-medium">{label}:</span>{" "}
      {value || "—"}
    </div>
  );
}

function PreviewImage({ label, src }) {
  return (
    <div className="mt-3">
      <p className="text-sm text-slate-400 mb-2">{label}</p>
      <img
        src={src}
        alt={label}
        className="w-64 h-40 object-cover rounded-lg border border-yellow-400/20"
      />
    </div>
  );
}

function formatDate(d) {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleDateString();
  } catch {
    return d;
  }
}
