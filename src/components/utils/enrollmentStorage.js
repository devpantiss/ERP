const STORAGE_KEY = "candidate_enrollment";
const SUBMITTED_ENROLLMENTS_KEY = "submitted_candidate_enrollments";

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

export function getSubmittedEnrollments() {
  try {
    return JSON.parse(localStorage.getItem(SUBMITTED_ENROLLMENTS_KEY)) || [];
  } catch {
    return [];
  }
}

export function saveSubmittedEnrollment(candidate) {
  const existing = getSubmittedEnrollments();
  const updated = [candidate, ...existing.filter((item) => item.id !== candidate.id)];
  localStorage.setItem(SUBMITTED_ENROLLMENTS_KEY, JSON.stringify(updated));
  return updated;
}

export function updateSubmittedEnrollmentStatus(id, status) {
  const updated = getSubmittedEnrollments().map((candidate) =>
    candidate.id === id ? { ...candidate, status } : candidate
  );
  localStorage.setItem(SUBMITTED_ENROLLMENTS_KEY, JSON.stringify(updated));
  return updated;
}
