import React from "react";
import { ShieldAlert, FileText, PlusCircle, BookOpen, Home, PhoneCall } from "lucide-react";
import { ViewState } from "../types";

interface NavbarProps {
  currentView: ViewState;
  onNavigate: (view: ViewState) => void;
  savedReportsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  savedReportsCount,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-emerald-900/40 bg-[#050c08]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div
            id="brand-logo-btn"
            role="button"
            tabIndex={0}
            onClick={() => onNavigate("dashboard")}
            onKeyDown={(e) => e.key === "Enter" && onNavigate("dashboard")}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-600/10 border border-emerald-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.2)] group-hover:border-emerald-400/60 transition">
              <ShieldAlert className="w-5 h-5 text-emerald-400 group-hover:scale-105 transition-transform" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-base font-bold tracking-tight text-white group-hover:text-emerald-300 transition">
                  CLEANWATCH<span className="text-emerald-400 ml-1">AI</span>
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-emerald-950 border border-emerald-800/60 text-emerald-300">
                  CIVIC TECH
                </span>
              </div>
              <p className="text-[11px] text-emerald-500/75 hidden md:block tracking-wide">
                Smart Open-Area Waste Detection & Reporting
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex items-center gap-1 sm:gap-2">
            <button
              id="nav-dashboard-btn"
              type="button"
              onClick={() => onNavigate("dashboard")}
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition flex items-center gap-1.5 ${
                currentView === "dashboard"
                  ? "bg-emerald-900/40 text-emerald-300 border border-emerald-700/50"
                  : "text-emerald-200/70 hover:text-emerald-200 hover:bg-emerald-950/40"
              }`}
            >
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">Overview</span>
            </button>

            <button
              id="nav-reports-btn"
              type="button"
              onClick={() => onNavigate("reports")}
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition flex items-center gap-1.5 ${
                currentView === "reports" || currentView === "report-detail"
                  ? "bg-emerald-900/40 text-emerald-300 border border-emerald-700/50"
                  : "text-emerald-200/70 hover:text-emerald-200 hover:bg-emerald-950/40"
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Reports</span>
              {savedReportsCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-mono font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {savedReportsCount}
                </span>
              )}
            </button>

            <button
              id="nav-acts-btn"
              type="button"
              onClick={() => onNavigate("acts")}
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition flex items-center gap-1.5 ${
                currentView === "acts"
                  ? "bg-emerald-900/40 text-emerald-300 border border-emerald-700/50"
                  : "text-emerald-200/70 hover:text-emerald-200 hover:bg-emerald-950/40"
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span className="hidden md:inline">Acts & Waste Rules</span>
              <span className="md:hidden">Acts</span>
            </button>

            {/* Primary Action Button */}
            <button
              id="nav-report-waste-btn"
              type="button"
              onClick={() => onNavigate("report-waste")}
              className="ml-1 sm:ml-2 px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs sm:text-sm font-semibold rounded-lg shadow-[0_0_15px_rgba(16,185,129,0.3)] flex items-center gap-1.5 transition active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Report Waste</span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};
