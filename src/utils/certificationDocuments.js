const STORAGE_KEY = "pantiss_super_admin_certificates";

const safeRead = () => {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
};

const safeWrite = (records) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
};

const normalize = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

export function getCertificationKeys(candidate = {}) {
  return [
    candidate.id,
    candidate.candidateCode,
    candidate.studentCode,
    candidate.name,
  ]
    .map(normalize)
    .filter(Boolean);
}

export function readCertificateRecords() {
  return safeRead();
}

export function findCertificateRecord(candidate) {
  const records = safeRead();
  const keys = getCertificationKeys(candidate);
  return keys.map((key) => records[key]).find(Boolean) || null;
}

export function saveCertificateRecord(candidate, certificate) {
  const records = safeRead();
  const keys = getCertificationKeys(candidate);
  const record = {
    ...certificate,
    uploadedBy: certificate.uploadedBy || "Super Admin",
    uploadedOn: certificate.uploadedOn || new Date().toISOString().split("T")[0],
  };
  keys.forEach((key) => {
    records[key] = record;
  });
  safeWrite(records);
  return record;
}
