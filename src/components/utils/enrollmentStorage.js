const STORAGE_KEY = "candidate_enrollment";

export function getEnrollmentData() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}

export function saveEnrollmentStep(stepKey, data) {
  const existing = getEnrollmentData();

  const updated = {
    ...existing,
    [stepKey]: {
      ...data,
      _updatedAt: new Date().toISOString(),
    },
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

export function clearEnrollmentData() {
  localStorage.removeItem(STORAGE_KEY);
}
