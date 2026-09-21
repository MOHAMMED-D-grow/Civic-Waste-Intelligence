import React, { useState } from "react";
import {
  ShieldAlert,
  ShieldCheck,
  MapPin,
  Clock,
  MessageCircle,
  Phone,
  ArrowLeft,
  Share2,
  CheckCircle2,
  AlertCircle,
  Copy,
  ExternalLink,
  ChevronDown,
} from "lucide-react";
import { CivicReport, ViewState } from "../types";
import { updateReportStatus } from "../utils/storage";

interface ResultPageProps {
  report: CivicReport;
  onNavigate: (view: ViewState) => void;
  onReportUpdated?: (updated: CivicReport) => void;
}

const CCMC_PHONE_NUMBERS = [
  { label: "Line 1 (Main Office)", tel: "04222390261", display: "0422-2390261" },
  { label: "Line 2 (Public Health & Grievance)", tel: "04222390262", display: "0422-2390262" },
  { label: "Line 3 (Control Room)", tel: "04222390263", display: "0422-2390263" },
];

export const ResultPage: React.FC<ResultPageProps> = ({
  report,
  onNavigate,
  onReportUpdated,
}) => {
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(report.status);

  const isWasteDetected = report.aiResult.wasteDetected;

  // Build formatted text for WhatsApp
  const generateGrievanceText = () => {
    const coordsStr =
      report.latitude !== null && report.longitude !== null
        ? `${report.latitude.toFixed(5)}, ${report.longitude.toFixed(5)}`
        : "Not provided";

    const osmLink =
      report.latitude !== null && report.longitude !== null
        ? `https://www.openstreetmap.org/?mlat=${report.latitude}&mlon=${report.longitude}#map=18/${report.latitude}/${report.longitude}`
        : "";

    return `*CLEANWATCH AI — CIVIC WASTE INCIDENT REPORT*
━━━━━━━━━━━━━━━━━━━━━
*Verification:* ${report.aiResult.resultLabel}
*Report ID:* ${report.id}
*Timestamp:* ${new Date(report.timestamp).toLocaleString()}

*Location:*
${report.location}
*GPS Coordinates:* ${coordsStr}
${osmLink ? `*Map Location:* ${osmLink}\n` : ""}
*Citizen Remarks:*
${report.remarks ? report.remarks : "Open-area waste accumulation requiring municipal sanitation attention."}

*Visual Evidence Finding:*
${report.aiResult.explanation}
━━━━━━━━━━━━━━━━━━━━━
_Coimbatore City Municipal Corporation Grievance Desk_`;
  };

  const handleWhatsAppAction = () => {
    const text = generateGrievanceText();
    const encoded = encodeURIComponent(text);
    const waUrl = `https://wa.me/918190000200?text=${encoded}`;

    // Update status
    updateReportStatus(report.id, "Reported via WhatsApp");
    setCurrentStatus("Reported via WhatsApp");
    if (onReportUpdated) {
      onReportUpdated({ ...report, status: "Reported via WhatsApp" });
    }

    window.open(waUrl, "_blank", "noopener,noreferrer");
  };

  const handlePhoneCallAction = (phoneNum: string) => {
    updateReportStatus(report.id, "Reported via Phone Call");
    setCurrentStatus("Reported via Phone Call");
    if (onReportUpdated) {
      onReportUpdated({ ...report, status: "Reported via Phone Call" });
    }
    window.location.href = `tel:${phoneNum}`;
  };

  const handleCopySummary = () => {
    navigator.clipboard.writeText(generateGrievanceText());
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Top Bar Nav */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => onNavigate("reports")}
          className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Reports</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-emerald-500/80">
            ID: <span className="text-emerald-300">{report.id}</span>
          </span>
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-emerald-950 border border-emerald-800 text-emerald-300">
            {currentStatus}
          </span>
        </div>
      </div>

      {/* RESULT BANNER */}
      <section
        className={`rounded-2xl border p-6 sm:p-8 space-y-3 transition ${
          isWasteDetected
            ? "border-emerald-500/50 bg-gradient-to-br from-[#072418] to-[#05140d] shadow-[0_0_40px_rgba(16,185,129,0.18)]"
            : "border-teal-700/50 bg-gradient-to-br from-[#062021] to-[#051114] shadow-[0_0_40px_rgba(20,184,166,0.15)]"
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border ${
                isWasteDetected
                  ? "bg-emerald-500/20 border-emerald-400/50 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                  : "bg-teal-500/20 border-teal-400/50 text-teal-300 shadow-[0_0_20px_rgba(20,184,166,0.3)]"
              }`}
            >
              {isWasteDetected ? (
                <ShieldAlert className="w-8 h-8 text-emerald-400" />
              ) : (
                <ShieldCheck className="w-8 h-8 text-teal-300" />
              )}
            </div>

            <div className="space-y-1">
              <div className="text-xs font-mono tracking-widest uppercase text-emerald-400/90 font-semibold">
                AI Determination
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white font-mono">
                {report.aiResult.resultLabel}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopySummary}
              className="px-3.5 py-2 bg-[#0a1b13] hover:bg-[#0e271b] border border-emerald-800 text-emerald-300 rounded-lg text-xs font-medium flex items-center gap-1.5 transition"
            >
              {copiedText ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Report Text</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="pt-2 border-t border-emerald-900/40 text-sm text-emerald-100/90 leading-relaxed">
          {report.aiResult.explanation}
        </div>
      </section>

      {/* EVIDENCE & LOCATION DETAILS */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Uploaded Evidence Photo */}
        <div className="md:col-span-6 space-y-3">
          <h2 className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-semibold">
            Uploaded Evidence Photo
          </h2>
          <div className="rounded-2xl overflow-hidden border border-emerald-900/60 bg-black/60 shadow-lg group relative">
            <img
              src={report.image}
              alt="Uploaded civic waste evidence"
              className="w-full h-auto max-h-96 object-contain"
            />
            <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-sm px-2.5 py-1 rounded text-[11px] font-mono text-emerald-300 border border-emerald-900">
              Verified Evidence Asset
            </div>
          </div>
        </div>

        {/* Location, Metadata & Remarks */}
        <div className="md:col-span-6 space-y-4">
          <h2 className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-semibold">
            Incident Specification
          </h2>

          <div className="rounded-2xl border border-emerald-900/60 bg-[#07160f]/80 p-5 space-y-4">
            {/* Location */}
            <div className="space-y-1">
              <span className="text-[11px] font-mono uppercase text-emerald-400/80 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                <span>Civic Location</span>
              </span>
              <p className="text-sm font-medium text-white leading-relaxed">
                {report.location}
              </p>
            </div>

            {/* Coordinates */}
            <div className="space-y-1 pt-1 border-t border-emerald-950">
              <span className="text-[11px] font-mono uppercase text-emerald-400/80">
                Geographic Coordinates
              </span>
              <div className="text-xs font-mono text-emerald-300">
                {report.latitude !== null && report.longitude !== null ? (
                  <span>
                    {report.latitude.toFixed(5)}° N, {report.longitude.toFixed(5)}° E
                  </span>
                ) : (
                  <span className="text-emerald-500/70">Not specified</span>
                )}
              </div>
            </div>

            {/* Timestamp */}
            <div className="space-y-1 pt-1 border-t border-emerald-950">
              <span className="text-[11px] font-mono uppercase text-emerald-400/80 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                <span>Date & Time of Report</span>
              </span>
              <p className="text-xs font-mono text-emerald-200">
                {new Date(report.timestamp).toLocaleString("en-IN", {
                  dateStyle: "full",
                  timeStyle: "medium",
                })}
              </p>
            </div>

            {/* Remarks */}
            <div className="space-y-1 pt-1 border-t border-emerald-950">
              <span className="text-[11px] font-mono uppercase text-emerald-400/80">
                Citizen Remarks
              </span>
              <p className="text-xs text-emerald-100/80 leading-relaxed italic bg-black/30 p-3 rounded-lg border border-emerald-950">
                {report.remarks || "No supplementary remarks provided."}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CIVIC ACTION SECTION */}
      <section className="rounded-2xl border border-emerald-700/60 bg-gradient-to-b from-[#0a1e14] via-[#07170f] to-[#050f0a] p-6 sm:p-8 space-y-6 shadow-[0_0_35px_rgba(16,185,129,0.15)]">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 text-xs font-mono uppercase text-emerald-400 font-bold tracking-wider">
            <span>Civic Action Desk</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white">
            Dispatch Evidence to Municipal Authority
          </h2>
          <p className="text-xs sm:text-sm text-emerald-300/80 max-w-2xl">
            Transmit this incident report to the Coimbatore City Municipal Corporation (CCMC) via their official grievance lines.
          </p>
        </div>

        {/* WhatsApp Manual Attachment Notice (Mandatory Requirement) */}
        <div className="rounded-xl border border-amber-500/40 bg-amber-950/30 p-4 flex items-start gap-3 text-xs text-amber-200/90 leading-relaxed">
          <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <strong className="text-amber-300 block font-semibold">
              Media Attachment Advisory:
            </strong>
            <span>
              WhatsApp links will automatically populate the location, coordinates, and report text, but <strong>WhatsApp does not permit websites to automatically attach local images</strong>. Please attach the evidence photo manually from your device gallery once WhatsApp opens.
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
          {/* WhatsApp Button */}
          <button
            id="report-whatsapp-btn"
            type="button"
            onClick={handleWhatsAppAction}
            className="flex-1 px-6 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm sm:text-base rounded-xl shadow-[0_0_25px_rgba(16,185,129,0.4)] flex items-center justify-center gap-3 transition transform active:scale-95"
          >
            <MessageCircle className="w-5 h-5" />
            <span>Report via WhatsApp (8190000200)</span>
          </button>

          {/* Call Municipal Office Button */}
          <div className="relative">
            <button
              id="call-municipal-btn"
              type="button"
              onClick={() => setShowPhoneModal(!showPhoneModal)}
              className="w-full sm:w-auto px-6 py-4 bg-teal-900/60 hover:bg-teal-800/70 border border-teal-600/60 text-teal-100 font-bold text-sm sm:text-base rounded-xl flex items-center justify-center gap-2.5 transition"
            >
              <Phone className="w-5 h-5 text-teal-300" />
              <span>Call Municipal Office</span>
              <ChevronDown className="w-4 h-4 text-teal-300" />
            </button>

            {/* Dropdown for CCMC Phone Numbers */}
            {showPhoneModal && (
              <div className="absolute left-0 right-0 sm:left-auto sm:right-0 mt-2 w-full sm:w-80 rounded-xl bg-[#091a13] border border-teal-700/60 shadow-2xl p-3 z-30 space-y-2">
                <div className="text-[11px] font-mono uppercase tracking-wider text-teal-300 font-semibold px-2 pb-1 border-b border-teal-900/50">
                  CCMC Main Grievance Lines
                </div>
                <div className="space-y-1.5">
                  {CCMC_PHONE_NUMBERS.map((phone, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        handlePhoneCallAction(phone.tel);
                        setShowPhoneModal(false);
                      }}
                      className="w-full text-left p-2.5 rounded-lg bg-teal-950/40 hover:bg-teal-900/60 text-xs text-teal-100 flex items-center justify-between group transition border border-teal-900/40"
                    >
                      <div>
                        <div className="font-semibold text-white group-hover:text-teal-200">
                          {phone.display}
                        </div>
                        <div className="text-[10px] text-teal-400/80">{phone.label}</div>
                      </div>
                      <Phone className="w-4 h-4 text-teal-400 group-hover:scale-110 transition-transform" />
                    </button>
                  ))}
                </div>
                <div className="text-[10px] text-teal-400/70 px-2 pt-1">
                  Standard landline rates apply. Available during CCMC working hours.
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-emerald-900/40">
          <button
            type="button"
            onClick={() => onNavigate("report-waste")}
            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition"
          >
            + File Another Incident
          </button>
          <button
            type="button"
            onClick={() => onNavigate("reports")}
            className="text-xs font-semibold text-emerald-300 hover:text-white transition"
          >
            Go to Saved Reports Archive &rarr;
          </button>
        </div>
      </section>
    </div>
  );
};
