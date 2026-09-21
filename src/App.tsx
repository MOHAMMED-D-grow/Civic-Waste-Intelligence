import React, { useState, useEffect } from "react";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { DashboardPage } from "./pages/DashboardPage";
import { ReportWastePage } from "./pages/ReportWastePage";
import { ResultPage } from "./pages/ResultPage";
import { ReportsPage } from "./pages/ReportsPage";
import { ReportDetailPage } from "./pages/ReportDetailPage";
import { ActsPage } from "./pages/ActsPage";
import { CivicReport, ViewState } from "./types";
import { getStoredReports, saveReport } from "./utils/storage";

export default function App() {
  const getInitialView = (): ViewState => {
    try {
      const hash = window.location.hash.replace(/^#\/?/, "");
      if (["dashboard", "report-waste", "reports", "acts"].includes(hash)) {
        return hash as ViewState;
      }
      const saved = sessionStorage.getItem("cleanwatch_current_view");
      if (saved && ["dashboard", "report-waste", "reports", "acts"].includes(saved)) {
        return saved as ViewState;
      }
    } catch {
      // ignore
    }
    return "dashboard";
  };

  const [currentView, setCurrentView] = useState<ViewState>(getInitialView);
  const [reports, setReports] = useState<CivicReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<CivicReport | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Synchronize hash changes
  useEffect(() => {
    const handleHashChange = () => {
      try {
        const hash = window.location.hash.replace(/^#\/?/, "");
        if (["dashboard", "report-waste", "reports", "acts"].includes(hash)) {
          setCurrentView(hash as ViewState);
        }
      } catch {
        // ignore
      }
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  // Load persisted reports from browser localStorage
  const refreshReports = () => {
    try {
      const loaded = getStoredReports();
      setReports(loaded);
    } catch (err) {
      console.error("Failed to load stored reports:", err);
      setReports([]);
    }
  };

  useEffect(() => {
    refreshReports();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleNavigate = (view: ViewState) => {
    setCurrentView(view);
    try {
      window.location.hash = view;
      sessionStorage.setItem("cleanwatch_current_view", view);
    } catch {
      // ignore
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleReportCreated = (newReport: CivicReport) => {
    saveReport(newReport);
    refreshReports();
    setSelectedReport(newReport);
    setCurrentView("result");
    showToast("Incident report successfully verified & saved locally!");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSelectReport = (report: CivicReport) => {
    setSelectedReport(report);
    setCurrentView("report-detail");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleReportUpdated = (updated: CivicReport) => {
    setSelectedReport(updated);
    refreshReports();
    showToast("Report status updated!");
  };

  const handleReportDeleted = () => {
    refreshReports();
    showToast("Report removed from local storage.");
  };

  return (
    <div className="min-h-screen bg-[#050c08] text-[#e8f2ec] flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#091f15] border border-emerald-500/60 shadow-[0_0_25px_rgba(16,185,129,0.35)] text-emerald-200 text-xs sm:text-sm font-medium px-4 py-2.5 rounded-xl flex items-center gap-2 animate-bounce">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar
        currentView={currentView}
        onNavigate={handleNavigate}
        savedReportsCount={reports.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-10">
        {currentView === "dashboard" && (
          <DashboardPage
            onNavigate={handleNavigate}
            recentReports={reports}
            onSelectReport={handleSelectReport}
          />
        )}

        {currentView === "report-waste" && (
          <ReportWastePage onReportCreated={handleReportCreated} />
        )}

        {currentView === "result" && (
          selectedReport ? (
            <ResultPage
              report={selectedReport}
              onNavigate={handleNavigate}
              onReportUpdated={handleReportUpdated}
            />
          ) : (
            <div className="text-center py-16 space-y-4">
              <p className="text-sm text-emerald-300/70">No report selected for viewing.</p>
              <button
                type="button"
                onClick={() => handleNavigate("reports")}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold"
              >
                Go to Reports
              </button>
            </div>
          )
        )}

        {currentView === "reports" && (
          <ReportsPage
            reports={reports}
            onSelectReport={handleSelectReport}
            onNavigate={handleNavigate}
            onRefreshReports={refreshReports}
          />
        )}

        {currentView === "report-detail" && (
          selectedReport ? (
            <ReportDetailPage
              report={selectedReport}
              onNavigate={handleNavigate}
              onReportDeleted={handleReportDeleted}
              onReportUpdated={handleReportUpdated}
            />
          ) : (
            <div className="text-center py-16 space-y-4">
              <p className="text-sm text-emerald-300/70">Report not found or removed.</p>
              <button
                type="button"
                onClick={() => handleNavigate("reports")}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold"
              >
                Return to Registry
              </button>
            </div>
          )
        )}

        {currentView === "acts" && <ActsPage onNavigate={handleNavigate} />}
      </main>

      {/* Footer */}
      <Footer onNavigate={handleNavigate} />
    </div>
  );
}
