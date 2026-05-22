export const reimbursements = [
  {
    id: "RIM-0001",
    employeeId: "EMP-0003",
    projectId: "PRJ-0001",
    claimTitle: "Field mobilization travel",
    category: "Travel",
    amount: 1850,
    totalAmount: 1850,
    status: "SUBMITTED",
    submittedOn: "2026-05-19",
    dateRange: "2026-05-17 → 2026-05-18",
    claimNote: "Village visits for beneficiary verification and community meeting follow-ups.",
    bills: [
      { date: "2026-05-17", desc: "Bus fare to Bantala cluster", amount: 650, mode: "Cash", billFile: "bus-ticket-bantala.pdf" },
      { date: "2026-05-18", desc: "Local conveyance and refreshments", amount: 1200, mode: "Online", billFile: "local-conveyance.jpg", billFilePreview: "/Frames/scene1/frame_0024.webp", paymentScreenshot: "upi-payment-1850.png", paymentScreenshotPreview: "/Frames/scene1/frame_0045.webp" },
    ],
  },
  {
    id: "RIM-0002",
    employeeId: "EMP-0001",
    projectId: "PRJ-0001",
    claimTitle: "Training material purchase",
    category: "Training Material",
    amount: 4200,
    totalAmount: 4200,
    status: "ADMIN_APPROVED",
    submittedOn: "2026-05-17",
    dateRange: "2026-05-16",
    claimNote: "Consumables and practice wiring supplies for the electrical technician batch.",
    adminApprovedBy: "EMP-0007",
    adminApprovedOn: "2026-05-18",
    bills: [
      { date: "2026-05-16", desc: "Electrical wire rolls and connectors", amount: 2600, mode: "Online", billFile: "wire-rolls-invoice.pdf", paymentScreenshot: "wire-upi-proof.png", paymentScreenshotPreview: "/Frames/scene2/frame_0024.webp" },
      { date: "2026-05-16", desc: "Practice switch boards", amount: 1600, mode: "Cash", billFile: "switch-board-receipt.jpg", billFilePreview: "/Frames/scene2/frame_0000.webp" },
    ],
  },
  {
    id: "RIM-0003",
    employeeId: "EMP-0004",
    projectId: "PRJ-0002",
    claimTitle: "Safety gear travel",
    category: "Safety Gear Travel",
    amount: 2650,
    totalAmount: 2650,
    status: "ADMIN_APPROVED",
    submittedOn: "2026-05-18",
    dateRange: "2026-05-17",
    claimNote: "Travel and loading support for collecting welding safety kits from the vendor.",
    adminApprovedBy: "EMP-0009",
    adminApprovedOn: "2026-05-19",
    bills: [
      { date: "2026-05-17", desc: "Vendor pickup cab", amount: 1800, mode: "Online", billFile: "cab-invoice.pdf", paymentScreenshot: "cab-payment.png", paymentScreenshotPreview: "/Frames/scene3/frame_0002.webp" },
      { date: "2026-05-17", desc: "Loading support", amount: 850, mode: "Cash", billFile: "loading-receipt.jpg", billFilePreview: "/Frames/scene4/frame_0004.webp" },
    ],
  },
  {
    id: "RIM-0004",
    employeeId: "EMP-0006",
    projectId: "PRJ-0003",
    claimTitle: "Community mobilization expenses",
    category: "Community Mobilization",
    amount: 3100,
    totalAmount: 3100,
    status: "SUBMITTED",
    submittedOn: "2026-05-20",
    dateRange: "2026-05-18 → 2026-05-20",
    claimNote: "Awareness drive support for Bhawanipatna and nearby villages.",
    bills: [
      { date: "2026-05-18", desc: "Poster printing", amount: 1400, mode: "Online", billFile: "poster-printer.pdf", paymentScreenshot: "poster-payment.png", paymentScreenshotPreview: "/Frames/scene4/frame_0049.webp" },
      { date: "2026-05-20", desc: "Community meeting logistics", amount: 1700, mode: "Cash", billFile: "meeting-logistics.jpg", billFilePreview: "/Frames/scene1/frame_0000.webp" },
    ],
  },
]

export const invoices = [
  { id: "INV-0001", projectId: "PRJ-0001", centerId: "CTR-0001", vendorName: "Sai Catering Services", category: "Food and Boarding", amount: 320000, raisedOn: "2026-05-05", dueOn: "2026-05-30", status: "SUBMITTED" },
  { id: "INV-0002", projectId: "PRJ-0002", centerId: "CTR-0002", vendorName: "Eastern Safety Works", category: "Safety Gear", amount: 96500, raisedOn: "2026-05-08", dueOn: "2026-06-02", status: "APPROVED" },
]

export const revenue = [
  { id: "REV-0001", projectId: "PRJ-0001", centerId: "CTR-0001", sourceType: "TRAINING_GRANT", amount: 850000, recognizedOn: "2026-05-01" },
  { id: "REV-0002", projectId: "PRJ-0003", centerId: "CTR-0003", sourceType: "PLACEMENT_INCENTIVE", amount: 180000, recognizedOn: "2026-05-18" },
]

export const financeDomain = { reimbursements, invoices, revenue }
