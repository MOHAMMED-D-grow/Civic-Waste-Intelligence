export type WasteResultLabel = "WASTE DETECTED" | "NO SIGNIFICANT WASTE DETECTED";

export interface AIAnalysisResult {
  wasteDetected: boolean;
  resultLabel: WasteResultLabel;
  explanation: string;
}

export type ReportStatus =
  | "Analyzed"
  | "Reported via WhatsApp"
  | "Reported via Phone Call"
  | "Draft";

export interface CivicReport {
  id: string;
  image: string; // Base64 data URL
  location: string; // Human-readable address
  latitude: number | null;
  longitude: number | null;
  remarks: string;
  timestamp: string; // ISO 8601 string
  aiResult: AIAnalysisResult;
  status: ReportStatus;
}

export type ViewState =
  | "dashboard"
  | "report-waste"
  | "result"
  | "reports"
  | "report-detail"
  | "acts";

export interface GeoSearchResult {
  place_id: number;
  lat: string;
  lon: string;
  display_name: string;
}

export interface AddressSuggestion {
  place_id: number | string;
  lat: string;
  lon: string;
  display_name: string;
  title: string;
  subtitle: string;
  type?: string;
  road?: string;
  suburb?: string;
  city?: string;
  postcode?: string;
}
