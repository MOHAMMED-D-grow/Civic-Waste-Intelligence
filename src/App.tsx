import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate, useLocation, useParams } from "react-router-dom";
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

// Wrapper component to handle route-based report detail loading
function ReportDetailWrapper({
  reports,
  selectedReport,
  onNavigate,
  onReportDeleted,
  onReportUpdated,
}: {
  reports: CivicReport[];
  selectedReport: CivicReport | null;
  onNavigate: (view: ViewState) => void;
  onReportDeleted: () => void;
  onReportUpdated: (updated: CivicReport) => void;
}) {
  const { id } = useParams<{ id: string }>();
  const report = selectedReport || reports.find((r) => r.id === id);

  if (!report) {
    return (
      <div className="text-center py-16 space-y-4">
        <p className="text-sm text-emerald-300/70">Report not found or removed.</p>
        <button
          type="button"
          onClick={() => onNavigate("reports")}
          className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-500 transition"
        >
          Return to Registry
        </button>
      </div>
    );
  }

  return (
    <ReportDetailPage
      report={report}
      onNavigate={onNavigate}
      onReportDeleted={onReportDeleted}
      onReportUpdated={onReportUpdated}
    />
  );
}

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();

  const [reports, setReports] = useState<CivicReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<CivicReport | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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

  // Derive currentView from location pathname for Navbar/Footer highlighting
  const getCurrentView = (): ViewState => {
    const p = location.pathname;
    if (p === "/" || p === "/dashboard") return "dashboard";
    if (p === "/report" || p === "/report-waste") return "report-waste";
    if (p === "/reports") return "reports";
    if (p === "/act" || p === "/acts") return "acts";
    if (p === "/result") return "result";
    if (p === "/report-detail" || p.startsWith("/report/")) return "report-detail";
    return "dashboard";
  };

  const currentView = getCurrentView();

  const handleNavigate = (view: ViewState) => {
    if (view === "dashboard") navigate("/");
    else if (view === "report-waste") navigate("/report");
    else if (view === "reports") navigate("/reports");
    else if (view === "acts") navigate("/act");
    else if (view === "result") navigate("/result");
    else if (view === "report-detail") navigate("/report-detail");
    else navigate("/");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleReportCreated = (newReport: CivicReport) => {
    saveReport(newReport);
    refreshReports();
    setSelectedReport(newReport);
    navigate("/result");
    showToast("Incident report successfully verified & saved locally!");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSelectReport = (report: CivicReport) => {
    setSelectedReport(report);
    navigate(`/report/${report.id}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleReportUpdated = (updated: CivicReport) => {
    setSelectedReport(updated);
    refreshReports();
    showToast("Report status updated!");
  };

  const handleReportDeleted = () => {
    refreshReports();
    setSelectedReport(null);
    showToast("Report removed from local storage.");
    navigate("/reports");
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
        <Routes>
          <Route
            path="/"
            element={
              <DashboardPage
                onNavigate={handleNavigate}
                recentReports={reports}
                onSelectReport={handleSelectReport}
              />
            }
          />
          <Route path="/dashboard" element={<Navigate to="/" replace />} />

          <Route
            path="/report"
            element={<ReportWastePage onReportCreated={handleReportCreated} />}
          />
          <Route path="/report-waste" element={<Navigate to="/report" replace />} />

          <Route
            path="/reports"
            element={
              <ReportsPage
                reports={reports}
                onSelectReport={handleSelectReport}
                onNavigate={handleNavigate}
                onRefreshReports={refreshReports}
              />
            }
          />

          <Route path="/act" element={<ActsPage onNavigate={handleNavigate} />} />
          <Route path="/acts" element={<Navigate to="/act" replace />} />

          <Route
            path="/result"
            element={
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
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-500 transition"
                  >
                    Go to Reports
                  </button>
                </div>
              )
            }
          />

          <Route
            path="/report/:id"
            element={
              <ReportDetailWrapper
                reports={reports}
                selectedReport={selectedReport}
                onNavigate={handleNavigate}
                onReportDeleted={handleReportDeleted}
                onReportUpdated={handleReportUpdated}
              />
            }
          />
          <Route
            path="/report-detail"
            element={
              <ReportDetailWrapper
                reports={reports}
                selectedReport={selectedReport}
                onNavigate={handleNavigate}
                onReportDeleted={handleReportDeleted}
                onReportUpdated={handleReportUpdated}
              />
            }
          />

          {/* Catch-all route redirects back to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Footer */}
      <Footer onNavigate={handleNavigate} />
    </div>
  );
}
