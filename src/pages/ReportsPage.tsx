import React, { useState } from "react";
import {
  FileText,
  Search,
  Trash2,
  ExternalLink,
  MapPin,
  Clock,
  PlusCircle,
  AlertCircle,
  AlertTriangle,
  X,
} from "lucide-react";
import { CivicReport, ViewState } from "../types";
import { deleteReport, clearAllReports } from "../utils/storage";

interface ReportsPageProps {
  reports: CivicReport[];
  onSelectReport: (report: CivicReport) => void;
  onNavigate: (view: ViewState) => void;
  onRefreshReports: () => void;
}

export const ReportsPage: React.FC<ReportsPageProps> = ({
  reports,
  onSelectReport,
  onNavigate,
  onRefreshReports,
}) => {
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<"ALL" | "WASTE_DETECTED" | "CLEAN" | "REPORTED">("ALL");
  const [reportToDelete, setReportToDelete] = useState<CivicReport | null>(null);
  const [showClearAllModal, setShowClearAllModal] = useState(false);

  const confirmDelete = () => {
    if (reportToDelete) {
      deleteReport(reportToDelete.id);
      setReportToDelete(null);
      onRefreshReports();
    }
  };

  const confirmClearAll = () => {
    clearAllReports();
    setShowClearAllModal(false);
    onRefreshReports();
  };

  // Filter and search logic
  const filtered = reports.filter((rep) => {
    // Search match
    const query = search.toLowerCase();
    const matchesSearch =
      rep.location.toLowerCase().includes(query) ||
      rep.remarks.toLowerCase().includes(query) ||
      rep.id.toLowerCase().includes(query);

    if (!matchesSearch) return false;

    // Type filter
    if (filterType === "WASTE_DETECTED") return rep.aiResult.wasteDetected;
    if (filterType === "CLEAN") return !rep.aiResult.wasteDetected;
    if (filterType === "REPORTED")
      return (
        rep.status === "Reported via WhatsApp" ||
        rep.status === "Reported via Phone Call"
      );

    return true;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-emerald-900/40 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-mono uppercase text-emerald-400 font-semibold">
            <FileText className="w-3.5 h-3.5" />
            <span>Civic Audit Registry</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Saved Incident Reports
          </h1>
          <p className="text-xs sm:text-sm text-emerald-300/70">
            {reports.length} verified evidence {reports.length === 1 ? "log" : "logs"} stored locally in your browser.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {reports.length > 0 && (
            <button
              type="button"
              onClick={() => setShowClearAllModal(true)}
              className="px-3.5 py-2 rounded-xl text-xs font-medium text-red-300 bg-red-950/40 hover:bg-red-900/60 border border-red-800/60 transition flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear All</span>
            </button>
          )}

          <button
            id="reports-new-incident-btn"
            type="button"
            onClick={() => onNavigate("report-waste")}
            className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.3)] flex items-center gap-2 transition active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Report</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <input
            id="reports-search-input"
            type="text"
            placeholder="Search by location, remarks, or report ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#0a1711] border border-emerald-900/60 focus:border-emerald-500 rounded-lg px-3 py-2 pl-9 text-xs sm:text-sm text-[#e8f2ec] placeholder-emerald-700/60 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
          />
          <Search className="w-4 h-4 text-emerald-600 absolute left-3 top-2.5" />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            type="button"
            onClick={() => setFilterType("ALL")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              filterType === "ALL"
                ? "bg-emerald-800/60 text-white border border-emerald-600/50"
                : "bg-[#091811] text-emerald-300/70 hover:text-emerald-200 border border-emerald-950"
            }`}
          >
            All ({reports.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterType("WASTE_DETECTED")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              filterType === "WASTE_DETECTED"
                ? "bg-emerald-800/60 text-white border border-emerald-600/50"
                : "bg-[#091811] text-emerald-300/70 hover:text-emerald-200 border border-emerald-950"
            }`}
          >
            Waste Detected
          </button>
          <button
            type="button"
            onClick={() => setFilterType("REPORTED")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              filterType === "REPORTED"
                ? "bg-emerald-800/60 text-white border border-emerald-600/50"
                : "bg-[#091811] text-emerald-300/70 hover:text-emerald-200 border border-emerald-950"
            }`}
          >
            Reported
          </button>
          <button
            type="button"
            onClick={() => setFilterType("CLEAN")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              filterType === "CLEAN"
                ? "bg-emerald-800/60 text-white border border-emerald-600/50"
                : "bg-[#091811] text-emerald-300/70 hover:text-emerald-200 border border-emerald-950"
            }`}
          >
            No Waste
          </button>
        </div>
      </div>

      {/* Reports Grid */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-emerald-900/50 bg-[#06120b] p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-emerald-950/60 border border-emerald-800/50 mx-auto flex items-center justify-center text-emerald-500">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-semibold text-emerald-200">
              {reports.length === 0 ? "No reports found in local storage" : "No reports matched your search filters"}
            </p>
            <p className="text-xs text-emerald-500/70">
              {reports.length === 0
                ? "You have deleted all incident reports. You can file a new report at any time."
                : "Try adjusting your search terms or clearing your current filter."}
            </p>
          </div>
          <div className="pt-2">
            {reports.length === 0 ? (
              <button
                type="button"
                onClick={() => onNavigate("report-waste")}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs rounded-xl transition"
              >
                File an Incident Report
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setFilterType("ALL");
                }}
                className="text-xs font-medium text-emerald-400 hover:underline"
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((report) => {
            const isDetected = report.aiResult.wasteDetected;
            return (
              <div
                key={report.id}
                role="button"
                tabIndex={0}
                onClick={() => onSelectReport(report)}
                onKeyDown={(e) => e.key === "Enter" && onSelectReport(report)}
                className="rounded-2xl border border-emerald-900/40 bg-[#07160f]/90 p-4 space-y-3.5 hover:border-emerald-600/60 transition cursor-pointer flex flex-col justify-between group shadow-md relative"
              >
                <div className="space-y-3">
                  {/* Photo Preview */}
                  <div className="relative aspect-video rounded-xl overflow-hidden bg-black/60 border border-emerald-950">
                    <img
                      src={report.image}
                      alt="Incident Evidence"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Result Badge */}
                    <div className="absolute top-2.5 left-2.5">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider uppercase ${
                          isDetected
                            ? "bg-emerald-950/90 text-emerald-300 border border-emerald-500/50 shadow"
                            : "bg-teal-950/90 text-teal-300 border border-teal-500/50 shadow"
                        }`}
                      >
                        {report.aiResult.resultLabel}
                      </span>
                    </div>

                    {/* Status Badge */}
                    <div className="absolute top-2.5 right-2.5">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono bg-black/70 backdrop-blur-sm text-emerald-300 border border-emerald-900/70">
                        {report.status}
                      </span>
                    </div>
                  </div>

                  {/* Location & Remarks */}
                  <div className="space-y-1.5">
                    <div className="flex items-start gap-1.5 text-xs font-semibold text-white">
                      <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span className="line-clamp-2 leading-tight">{report.location}</span>
                    </div>

                    {report.remarks && (
                      <p className="text-xs text-emerald-200/70 line-clamp-2 leading-relaxed">
                        {report.remarks}
                      </p>
                    )}

                    <p className="text-[11px] text-emerald-400/80 line-clamp-2 bg-emerald-950/30 p-2 rounded-lg border border-emerald-950">
                      <strong>AI:</strong> {report.aiResult.explanation}
                    </p>
                  </div>
                </div>

                {/* Footer with Timestamp and Delete button */}
                <div className="pt-2.5 border-t border-emerald-900/40 flex items-center justify-between text-[11px] text-emerald-400/70 font-mono">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-emerald-500" />
                    <span>{new Date(report.timestamp).toLocaleDateString()}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      title="Delete Report"
                      onClick={(e) => {
                        e.stopPropagation();
                        setReportToDelete(report);
                      }}
                      className="px-2 py-1 text-xs text-red-300 hover:text-white bg-red-950/60 hover:bg-red-800 border border-red-800/80 rounded-lg transition flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                    <span className="text-emerald-300 font-semibold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                      <span>Details</span>
                      <ExternalLink className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* IN-APP DELETE CONFIRMATION MODAL */}
      {reportToDelete && (
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
                onClick={() => setReportToDelete(null)}
                className="text-emerald-500 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">Delete Incident Report?</h3>
              <p className="text-xs text-emerald-300/80 leading-relaxed">
                Are you sure you want to delete this incident report from your local browser storage? This action cannot be undone.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-black/40 border border-emerald-950 space-y-1.5 text-xs">
              <div className="font-mono text-[11px] text-emerald-400">
                ID: {reportToDelete.id}
              </div>
              <div className="text-emerald-200 line-clamp-1 font-medium">
                {reportToDelete.location}
              </div>
              <div className="text-[11px] text-emerald-400/70">
                Status: {reportToDelete.status}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setReportToDelete(null)}
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

      {/* CLEAR ALL MODAL */}
      {showClearAllModal && (
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
                onClick={() => setShowClearAllModal(false)}
                className="text-emerald-500 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">Clear All Incident Reports?</h3>
              <p className="text-xs text-emerald-300/80 leading-relaxed">
                This will remove all {reports.length} reports from your browser local storage.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowClearAllModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-emerald-300 bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-800/60 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmClearAll}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-red-600 hover:bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.4)] transition flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Yes, Clear All</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
