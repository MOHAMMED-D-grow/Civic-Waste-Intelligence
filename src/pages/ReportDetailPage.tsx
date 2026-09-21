import React, { useState } from "react";
import {
  ArrowLeft,
  MapPin,
  Clock,
  MessageCircle,
  Phone,
  ShieldAlert,
  ShieldCheck,
  AlertCircle,
  AlertTriangle,
  ChevronDown,
  Trash2,
  CheckCircle2,
  X,
} from "lucide-react";
import { CivicReport, ReportStatus, ViewState } from "../types";
import { LocationPickerMap } from "../components/LocationPickerMap";
import { deleteReport, updateReportStatus } from "../utils/storage";

interface ReportDetailPageProps {
  report: CivicReport;
  onNavigate: (view: ViewState) => void;
  onReportDeleted: () => void;
  onReportUpdated: (updated: CivicReport) => void;
}

const CCMC_PHONE_NUMBERS = [
  { label: "CCMC Line 1 (Main Office)", tel: "04222390261", display: "0422-2390261" },
  { label: "CCMC Line 2 (Sanitation & Health)", tel: "04222390262", display: "0422-2390262" },
  { label: "CCMC Line 3 (Control Room)", tel: "04222390263", display: "0422-2390263" },
];

export const ReportDetailPage: React.FC<ReportDetailPageProps> = ({
  report,
  onNavigate,
  onReportDeleted,
  onReportUpdated,
}) => {
  const [showPhoneDropdown, setShowPhoneDropdown] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<ReportStatus>(report.status);

  const isWaste = report.aiResult.wasteDetected;

  const handleStatusChange = (newStatus: ReportStatus) => {
    updateReportStatus(report.id, newStatus);
    setCurrentStatus(newStatus);
    onReportUpdated({ ...report, status: newStatus });
  };

  const confirmDelete = () => {
    deleteReport(report.id);
    setShowDeleteModal(false);
    onReportDeleted();
    onNavigate("reports");
  };

  // Build formatted grievance message
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
*Incident ID:* ${report.id}
*Timestamp:* ${new Date(report.timestamp).toLocaleString()}

*Location:*
${report.location}
*GPS Coordinates:* ${coordsStr}
${osmLink ? `*Map Location:* ${osmLink}\n` : ""}
*Citizen Remarks:*
${report.remarks || "Open-area waste accumulation requiring municipal clearance."}

*Visual Evidence Finding:*
${report.aiResult.explanation}
━━━━━━━━━━━━━━━━━━━━━
_Coimbatore City Municipal Corporation Grievance Desk_`;
  };

  const handleWhatsAppAction = () => {
    const text = generateGrievanceText();
    const encoded = encodeURIComponent(text);
    const waUrl = `https://wa.me/918190000200?text=${encoded}`;
    handleStatusChange("Reported via WhatsApp");
    window.open(waUrl, "_blank", "noopener,noreferrer");
  };

  const handleCallAction = (phoneNum: string) => {
    handleStatusChange("Reported via Phone Call");
    window.location.href = `tel:${phoneNum}`;
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-emerald-900/40 pb-4">
        <button
          type="button"
          onClick={() => onNavigate("reports")}
          className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5 transition self-start"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Reports</span>
        </button>

        <div className="flex items-center gap-3">
          {/* Status selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-emerald-400/80 font-mono">Status:</span>
            <select
              value={currentStatus}
              onChange={(e) => handleStatusChange(e.target.value as ReportStatus)}
              className="bg-[#0a1711] border border-emerald-800/80 rounded-lg px-2.5 py-1 text-xs text-emerald-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
            >
              <option value="Analyzed">Analyzed (Pending Civic Action)</option>
              <option value="Reported via WhatsApp">Reported via WhatsApp</option>
              <option value="Reported via Phone Call">Reported via Phone Call</option>
              <option value="Draft">Draft</option>
            </select>
          </div>

          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            title="Delete this report"
            className="px-2.5 py-1 text-xs text-red-300 hover:text-white bg-red-950/60 hover:bg-red-850 border border-red-800/80 rounded-lg transition flex items-center gap-1"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {/* Result Status Banner */}
      <div
        className={`rounded-2xl border p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
          isWaste
            ? "border-emerald-500/50 bg-gradient-to-br from-[#082619] to-[#05130d] shadow-[0_0_30px_rgba(16,185,129,0.15)]"
            : "border-teal-600/50 bg-gradient-to-br from-[#072426] to-[#051214] shadow-[0_0_30px_rgba(20,184,166,0.15)]"
        }`}
      >
        <div className="flex items-start gap-4">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${
              isWaste
                ? "bg-emerald-500/20 border-emerald-400/40 text-emerald-300"
                : "bg-teal-500/20 border-teal-400/40 text-teal-300"
            }`}
          >
            {isWaste ? (
              <ShieldAlert className="w-6 h-6 text-emerald-400" />
            ) : (
              <ShieldCheck className="w-6 h-6 text-teal-300" />
            )}
          </div>
          <div>
            <div className="text-[11px] font-mono uppercase tracking-widest text-emerald-400/90 font-semibold">
              Determination
            </div>
            <h1 className="text-xl sm:text-2xl font-bold font-mono text-white">
              {report.aiResult.resultLabel}
            </h1>
            <p className="text-xs text-emerald-200/80 mt-1 leading-relaxed">
              {report.aiResult.explanation}
            </p>
          </div>
        </div>

        <div className="text-right shrink-0">
          <div className="text-[11px] font-mono text-emerald-500/80">Report ID</div>
          <div className="text-xs font-mono font-semibold text-emerald-300">{report.id}</div>
        </div>
      </div>

      {/* Visual Evidence & Information */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Photo Evidence Card */}
        <div className="lg:col-span-6 space-y-3">
          <h2 className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-semibold">
            Evidence Photo
          </h2>
          <div className="rounded-2xl overflow-hidden border border-emerald-900/60 bg-black/60 shadow-lg relative group">
            <img
              src={report.image}
              alt="Visual Evidence"
              className="w-full h-auto max-h-[380px] object-contain mx-auto"
            />
          </div>

          <div className="rounded-xl border border-emerald-950 bg-[#07160f]/60 p-4 space-y-2 text-xs">
            <div className="flex items-center gap-1.5 text-emerald-400 font-mono text-[11px]">
              <Clock className="w-3.5 h-3.5" />
              <span>Timestamp:</span>
            </div>
            <div className="font-mono text-white text-xs">
              {new Date(report.timestamp).toLocaleString("en-IN", {
                dateStyle: "full",
                timeStyle: "medium",
              })}
            </div>
          </div>
        </div>

        {/* Location & Map Card */}
        <div className="lg:col-span-6 space-y-3">
          <h2 className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-semibold">
            Location & Geographic Coordinates
          </h2>

          <LocationPickerMap
            latitude={report.latitude}
            longitude={report.longitude}
            address={report.location}
            onLocationChange={() => {}}
            onAddressChange={() => {}}
            readOnly={true}
          />

          {/* Remarks Section */}
          <div className="rounded-xl border border-emerald-900/60 bg-[#07160f]/80 p-4 space-y-2">
            <div className="text-xs font-mono uppercase text-emerald-400 font-semibold">
              Citizen Remarks
            </div>
            <p className="text-xs text-emerald-100/90 leading-relaxed italic">
              {report.remarks || "No additional remarks were submitted for this incident."}
            </p>
          </div>
        </div>
      </div>

      {/* Municipal Civic Action Section */}
      <section className="rounded-2xl border border-emerald-700/60 bg-gradient-to-b from-[#091f15] via-[#07160f] to-[#050f0a] p-6 sm:p-8 space-y-5 shadow-[0_0_30px_rgba(16,185,129,0.15)]">
        <div className="space-y-1">
          <h3 className="text-lg sm:text-xl font-bold text-white">
            Civic Action Dispatch
          </h3>
          <p className="text-xs sm:text-sm text-emerald-300/80">
            Submit or follow up on this waste incident with Coimbatore City Municipal Corporation (CCMC).
          </p>
        </div>

        {/* WhatsApp Attachment Reminder */}
        <div className="rounded-xl border border-amber-500/40 bg-amber-950/30 p-3.5 flex items-start gap-2.5 text-xs text-amber-200/90">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <span>
            <strong>Reminder:</strong> WhatsApp does not support auto-attaching local files. Please attach the evidence photo from your phone's photo library into the opened chat.
          </span>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-1">
          <button
            type="button"
            onClick={handleWhatsAppAction}
            className="flex-1 px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.4)] flex items-center justify-center gap-2.5 transition active:scale-95"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Send to CCMC WhatsApp (8190000200)</span>
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() => setShowPhoneDropdown(!showPhoneDropdown)}
              className="w-full sm:w-auto px-6 py-3.5 bg-teal-900/60 hover:bg-teal-800/70 border border-teal-600/60 text-teal-100 font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition"
            >
              <Phone className="w-4 h-4 text-teal-300" />
              <span>Call CCMC Office</span>
              <ChevronDown className="w-4 h-4 text-teal-300" />
            </button>

            {showPhoneDropdown && (
              <div className="absolute left-0 right-0 sm:left-auto sm:right-0 mt-2 w-full sm:w-80 rounded-xl bg-[#091a13] border border-teal-700/60 shadow-2xl p-3 z-30 space-y-1.5">
                <div className="text-[11px] font-mono uppercase tracking-wider text-teal-300 font-semibold px-2 pb-1 border-b border-teal-900/50">
                  Official CCMC Contacts
                </div>
                {CCMC_PHONE_NUMBERS.map((phone, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      handleCallAction(phone.tel);
                      setShowPhoneDropdown(false);
                    }}
                    className="w-full text-left p-2.5 rounded-lg bg-teal-950/40 hover:bg-teal-900/60 text-xs text-teal-100 flex items-center justify-between group transition border border-teal-900/40"
                  >
                    <div>
                      <div className="font-semibold text-white group-hover:text-teal-200">
                        {phone.display}
                      </div>
                      <div className="text-[10px] text-teal-400/80">{phone.label}</div>
                    </div>
                    <Phone className="w-3.5 h-3.5 text-teal-400 group-hover:scale-110 transition-transform" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* In-app Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div
            className="w-full max-w-md rounded-2xl border border-red-900/80 bg-[#0c1511] p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-xl bg-red-950/70 border border-red-800/60 flex items-center justify-center text-red-400 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="text-emerald-500 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">Permanently Delete Report?</h3>
              <p className="text-xs text-emerald-300/80 leading-relaxed">
                This will delete report <strong className="text-white font-mono">{report.id}</strong> from your local browser storage. This action cannot be reversed.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-black/40 border border-emerald-950 space-y-1 text-xs">
              <div className="text-emerald-200 line-clamp-1 font-medium">
                {report.location}
              </div>
              <div className="text-[11px] text-emerald-400/70">
                Logged: {new Date(report.timestamp).toLocaleString()}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-emerald-300 bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-800/60 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-red-600 hover:bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.4)] transition flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Yes, Delete Report</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
