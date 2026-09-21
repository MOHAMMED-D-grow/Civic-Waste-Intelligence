import React from "react";
import {
  Upload,
  Cpu,
  MapPin,
  Send,
  ArrowRight,
  ShieldCheck,
  Phone,
  MessageCircle,
  FileCheck2,
  BookOpen,
  CheckCircle2,
} from "lucide-react";
import { CivicReport, ViewState } from "../types";

interface DashboardPageProps {
  onNavigate: (view: ViewState) => void;
  recentReports: CivicReport[];
  onSelectReport: (report: CivicReport) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onNavigate,
  recentReports,
  onSelectReport,
}) => {
  return (
    <div className="space-y-12 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl border border-emerald-900/50 bg-gradient-to-b from-[#0a1b13]/80 via-[#07140e]/90 to-[#050c08] p-6 sm:p-10 lg:p-12 shadow-[0_0_50px_rgba(16,185,129,0.08)]">
        {/* Subtle grid and ambient green glow */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-72 h-72 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono tracking-wide uppercase bg-emerald-950/80 border border-emerald-800/60 text-emerald-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Civic Environmental Intelligence</span>
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
              CLEANWATCH <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">AI</span>
            </h1>
            <p className="text-base sm:text-xl text-emerald-100/90 font-medium">
              AI-Powered Open-Area Waste Detection & Smart Civic Reporting
            </p>
          </div>

          <p className="text-sm sm:text-base text-emerald-200/70 leading-relaxed max-w-2xl">
            Empowering citizens to document open-area garbage accumulation with tamper-proof visual evidence, precise geographic coordinates, and automated AI validation before submitting directly to municipal authorities.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              id="hero-report-waste-btn"
              type="button"
              onClick={() => onNavigate("report-waste")}
              className="px-6 py-3.5 bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-semibold text-sm sm:text-base rounded-xl shadow-[0_0_25px_rgba(16,185,129,0.35)] flex items-center gap-2.5 transition transform active:scale-95"
            >
              <Upload className="w-5 h-5" />
              <span>Report Waste Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              id="hero-view-reports-btn"
              type="button"
              onClick={() => onNavigate("reports")}
              className="px-5 py-3.5 bg-emerald-950/40 hover:bg-emerald-900/40 border border-emerald-800/60 text-emerald-200 font-medium text-sm sm:text-base rounded-xl flex items-center gap-2 transition"
            >
              <FileCheck2 className="w-4 h-4 text-emerald-400" />
              <span>View Saved Reports</span>
            </button>

            <button
              id="hero-acts-btn"
              type="button"
              onClick={() => onNavigate("acts")}
              className="px-5 py-3.5 bg-transparent hover:bg-emerald-950/30 text-emerald-300/80 hover:text-emerald-200 font-medium text-sm rounded-xl flex items-center gap-2 transition"
            >
              <BookOpen className="w-4 h-4" />
              <span>Acts & Citizen Rules</span>
            </button>
          </div>
        </div>
      </section>

      {/* Core Workflow Pillars (What CleanWatch AI does) */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-emerald-900/40 pb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
              <span>How CleanWatch AI Operates</span>
            </h2>
            <p className="text-xs sm:text-sm text-emerald-300/70 mt-1">
              A transparent, evidence-first pipeline designed to convert citizen observation into accountable municipal action.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Pillar 1 */}
          <div className="rounded-2xl border border-emerald-900/40 bg-gradient-to-b from-[#0a1a12]/60 to-[#07140e]/80 p-6 space-y-3 relative hover:border-emerald-700/60 transition group">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
              <Upload className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <div className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-semibold">Step 01</div>
              <h3 className="text-base font-semibold text-white">Upload Waste Evidence</h3>
            </div>
            <p className="text-xs text-emerald-200/70 leading-relaxed">
              Capture or upload genuine photographic evidence of open-area garbage accumulation, roadside litter, or uncollected refuse.
            </p>
          </div>

          {/* Pillar 2 */}
          <div className="rounded-2xl border border-emerald-900/40 bg-gradient-to-b from-[#0a1a12]/60 to-[#07140e]/80 p-6 space-y-3 relative hover:border-emerald-700/60 transition group">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
              <Cpu className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <div className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-semibold">Step 02</div>
              <h3 className="text-base font-semibold text-white">AI Analysis</h3>
            </div>
            <p className="text-xs text-emerald-200/70 leading-relaxed">
              Computer vision examines the image strictly for open-area municipal solid waste, delivering a binary verdict without arbitrary numerical scores.
            </p>
          </div>

          {/* Pillar 3 */}
          <div className="rounded-2xl border border-emerald-900/40 bg-gradient-to-b from-[#0a1a12]/60 to-[#07140e]/80 p-6 space-y-3 relative hover:border-emerald-700/60 transition group">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
              <MapPin className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <div className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-semibold">Step 03</div>
              <h3 className="text-base font-semibold text-white">Location Verification</h3>
            </div>
            <p className="text-xs text-emerald-200/70 leading-relaxed">
              Pinpoint precise coordinates on a free interactive OpenStreetMap map, draggable marker, and human-readable address with graceful offline fallback.
            </p>
          </div>

          {/* Pillar 4 */}
          <div className="rounded-2xl border border-emerald-900/40 bg-gradient-to-b from-[#0a1a12]/60 to-[#07140e]/80 p-6 space-y-3 relative hover:border-emerald-700/60 transition group">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
              <Send className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <div className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-semibold">Step 04</div>
              <h3 className="text-base font-semibold text-white">Civic Reporting</h3>
            </div>
            <p className="text-xs text-emerald-200/70 leading-relaxed">
              Dispatch formatted evidence directly to municipal grievance channels via official WhatsApp or direct telephone lines.
            </p>
          </div>
        </div>
      </section>

      {/* Official Municipal Civic Channel Preview (Coimbatore City Municipal Corporation) */}
      <section className="rounded-2xl border border-emerald-800/40 bg-[#081710]/70 p-6 sm:p-8 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 text-xs font-mono uppercase text-emerald-400 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Direct Civic Integration</span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-white">
              Coimbatore City Municipal Corporation (CCMC) Grievance Desk
            </h3>
            <p className="text-xs sm:text-sm text-emerald-300/70 max-w-2xl">
              Reports generated via CleanWatch AI are formatted to align with CCMC standard grievance submission protocols.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a
              id="ccmc-whatsapp-link"
              href="https://wa.me/918190000200"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-emerald-900/40 hover:bg-emerald-800/50 border border-emerald-600/40 text-emerald-200 text-xs sm:text-sm font-medium rounded-lg flex items-center gap-2 transition"
            >
              <MessageCircle className="w-4 h-4 text-emerald-400" />
              <span>CCMC WhatsApp: 8190000200</span>
            </a>

            <a
              id="ccmc-call-link"
              href="tel:04222390261"
              className="px-4 py-2 bg-teal-950/40 hover:bg-teal-900/50 border border-teal-700/40 text-teal-200 text-xs sm:text-sm font-medium rounded-lg flex items-center gap-2 transition"
            >
              <Phone className="w-4 h-4 text-teal-400" />
              <span>Helpline: 0422-2390261</span>
            </a>
          </div>
        </div>
      </section>

      {/* Recent Civic Reports Carousel / Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white">Recent Saved Reports</h2>
            <p className="text-xs text-emerald-300/70">
              Locally persisted waste audits and verified evidence documents in your browser.
            </p>
          </div>
          <button
            id="view-all-reports-header-btn"
            type="button"
            onClick={() => onNavigate("reports")}
            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition"
          >
            <span>View All ({recentReports.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentReports.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-emerald-900/50 p-8 text-center space-y-3 bg-[#06120b]">
            <p className="text-sm text-emerald-300/60">No civic reports filed yet.</p>
            <button
              type="button"
              onClick={() => onNavigate("report-waste")}
              className="px-4 py-2 bg-emerald-600 text-white text-xs font-medium rounded-lg inline-flex items-center gap-2"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Create First Waste Report</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentReports.slice(0, 3).map((report) => (
              <div
                key={report.id}
                role="button"
                tabIndex={0}
                onClick={() => onSelectReport(report)}
                onKeyDown={(e) => e.key === "Enter" && onSelectReport(report)}
                className="rounded-xl border border-emerald-900/40 bg-[#07160f]/80 p-4 space-y-3 hover:border-emerald-600/50 transition cursor-pointer group flex flex-col justify-between"
              >
                <div className="space-y-2.5">
                  <div className="relative aspect-video rounded-lg overflow-hidden bg-black/40 border border-emerald-950">
                    <img
                      src={report.image}
                      alt="Waste Evidence"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 left-2">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider ${
                          report.aiResult.wasteDetected
                            ? "bg-emerald-950/90 text-emerald-300 border border-emerald-500/50"
                            : "bg-teal-950/90 text-teal-300 border border-teal-500/50"
                        }`}
                      >
                        {report.aiResult.resultLabel}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="text-xs text-emerald-400 flex items-center gap-1 font-medium line-clamp-1">
                      <MapPin className="w-3 h-3 shrink-0" />
                      <span>{report.location || "Coordinates specified"}</span>
                    </div>
                    {report.remarks && (
                      <p className="text-xs text-emerald-200/70 line-clamp-2 leading-relaxed">
                        {report.remarks}
                      </p>
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t border-emerald-900/40 flex items-center justify-between text-[11px] text-emerald-400/60 font-mono">
                  <span>{new Date(report.timestamp).toLocaleDateString()}</span>
                  <span className="text-emerald-300 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                    <span>View Evidence</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
