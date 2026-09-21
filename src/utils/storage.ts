import { CivicReport, ReportStatus } from "../types";

const STORAGE_KEY = "cleanwatch_civic_reports_v1";
const SEEDED_FLAG = "cleanwatch_civic_reports_seeded_v1";

// Initial realistic seed examples for Coimbatore municipal jurisdiction
const INITIAL_SEED_REPORTS: CivicReport[] = [
  {
    id: "rep-cbe-101",
    image: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='600' height='400' viewBox='0 0 600 400'><rect width='600' height='400' fill='%230f241a'/><path d='M0,280 Q150,240 300,280 T600,280 L600,400 L0,400 Z' fill='%23193828'/><circle cx='480' cy='90' r='45' fill='%2310b981' opacity='0.15'/><rect x='140' y='250' width='80' height='55' rx='6' fill='%23475569'/><rect x='210' y='240' width='70' height='65' rx='4' fill='%23334155'/><path d='M160,240 L260,230 L270,270 L150,280 Z' fill='%23065f46'/><circle cx='230' cy='275' r='25' fill='%231e293b'/><text x='300' y='180' fill='%2394a3b8' font-family='sans-serif' font-size='16' text-anchor='middle'>Open Waste Pile: Cross Cut Road Verge</text><text x='300' y='210' fill='%2334d399' font-family='sans-serif' font-size='13' text-anchor='middle'>[Verified Evidence Sample]</text></svg>",
    location: "Cross Cut Road, near 7th Street Corner, Gandhipuram, Coimbatore, Tamil Nadu 641012",
    latitude: 11.0195,
    longitude: 76.9692,
    remarks: "Accumulation of unsegregated plastic bags, carton boxes and organic market refuse overflowing onto the pedestrian pathway for 3 days.",
    timestamp: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
    aiResult: {
      wasteDetected: true,
      resultLabel: "WASTE DETECTED",
      explanation: "Significant visual evidence of open-area plastic debris, discarded packaging boxes, and uncollected roadside waste accumulation blocking the public verge.",
    },
    status: "Reported via WhatsApp",
  },
  {
    id: "rep-cbe-102",
    image: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='600' height='400' viewBox='0 0 600 400'><rect width='600' height='400' fill='%230b1b13'/><rect x='0' y='290' width='600' height='110' fill='%23162b20'/><rect x='280' y='230' width='140' height='90' rx='8' fill='%2322543d'/><path d='M300,220 L370,200 L410,240 L320,250 Z' fill='%231e3a8a'/><text x='300' y='170' fill='%23a7f3d0' font-family='sans-serif' font-size='16' text-anchor='middle'>Dumped Garden Trimmings & Debris</text><text x='300' y='198' fill='%236ee7b7' font-family='sans-serif' font-size='13' text-anchor='middle'>Peelamedu Main Road</text></svg>",
    location: "Avinashi Road, near PSG Tech Junction, Peelamedu, Coimbatore, Tamil Nadu 641004",
    latitude: 11.0258,
    longitude: 77.0041,
    remarks: "Discarded garden clippings mixed with construction debris dumped adjacent to the storm-water drain.",
    timestamp: new Date(Date.now() - 14 * 3600 * 1000).toISOString(),
    aiResult: {
      wasteDetected: true,
      resultLabel: "WASTE DETECTED",
      explanation: "Open-area waste pile visible consisting of mixed horticulture trimmings, loose plastic wrappers, and broken concrete fragments on civic land.",
    },
    status: "Analyzed",
  },
];

export function getStoredReports(): CivicReport[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const hasSeeded = localStorage.getItem(SEEDED_FLAG);

    // Only seed on first initial visit if nothing was ever stored
    if (raw === null && !hasSeeded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SEED_REPORTS));
      localStorage.setItem(SEEDED_FLAG, "true");
      return INITIAL_SEED_REPORTS;
    }

    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }

    return [];
  } catch (err) {
    console.error("Failed to read reports from localStorage:", err);
    return [];
  }
}

export function saveReport(report: CivicReport): boolean {
  try {
    const existing = getStoredReports();
    // Prepend new report
    const updated = [report, ...existing.filter((r) => r.id !== report.id)];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return true;
  } catch (err) {
    console.error("Failed to save report to localStorage:", err);
    return false;
  }
}

export function getReportById(id: string): CivicReport | null {
  try {
    const reports = getStoredReports();
    return reports.find((r) => r.id === id) || null;
  } catch (err) {
    console.error("Failed to find report:", err);
    return null;
  }
}

export function deleteReport(id: string): boolean {
  try {
    const reports = getStoredReports();
    const updated = reports.filter((r) => r.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return true;
  } catch (err) {
    console.error("Failed to delete report:", err);
    return false;
  }
}

export function clearAllReports(): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    return true;
  } catch (err) {
    console.error("Failed to clear reports:", err);
    return false;
  }
}

export function updateReportStatus(id: string, status: ReportStatus): boolean {
  try {
    const reports = getStoredReports();
    const updated = reports.map((r) => (r.id === id ? { ...r, status } : r));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return true;
  } catch (err) {
    console.error("Failed to update status:", err);
    return false;
  }
}
