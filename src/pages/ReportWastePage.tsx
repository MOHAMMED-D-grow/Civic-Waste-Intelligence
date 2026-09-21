import React, { useState, useRef } from "react";
import {
  Upload,
  Image as ImageIcon,
  Trash2,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  Check,
  RefreshCw,
  Info,
  Camera,
  MapPin,
} from "lucide-react";
import { LocationPickerMap } from "../components/LocationPickerMap";
import { analyzeWasteEvidence } from "../services/aiService";
import { AIAnalysisResult, CivicReport } from "../types";

interface ReportWastePageProps {
  onReportCreated: (report: CivicReport) => void;
}

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

// Sample test scenes for quick demonstration
const SAMPLE_WASTE_IMAGE =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='800' height='500' viewBox='0 0 800 500'><rect width='800' height='500' fill='%2308150e'/><rect x='0' y='360' width='800' height='140' fill='%231b261d'/><line x1='0' y1='360' x2='800' y2='360' stroke='%23334d3a' stroke-width='4'/><rect x='180' y='270' width='160' height='100' rx='8' fill='%23334155'/><rect x='280' y='250' width='120' height='120' rx='6' fill='%23475569'/><ellipse cx='260' cy='360' rx='80' ry='25' fill='%23064e3b'/><ellipse cx='380' cy='370' rx='90' ry='28' fill='%23047857'/><path d='M210,310 L280,260 L350,330 L260,370 Z' fill='%231e3a8a'/><circle cx='460' cy='365' r='18' fill='%23f59e0b'/><path d='M140,360 L190,320 L230,375 Z' fill='%23ef4444'/><text x='400' y='180' fill='%23ecfdf5' font-family='sans-serif' font-size='20' font-weight='bold' text-anchor='middle'>SAMPLE EVIDENCE: OPEN WASTE ACCUMULATION</text><text x='400' y='215' fill='%236ee7b7' font-family='sans-serif' font-size='14' text-anchor='middle'>Plastic Bags, Cardboard & Refuse on Civic Roadside</text></svg>";

const SAMPLE_CLEAN_IMAGE =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='800' height='500' viewBox='0 0 800 500'><rect width='800' height='500' fill='%2306161c'/><rect x='0' y='320' width='800' height='180' fill='%230f2922'/><line x1='0' y1='320' x2='800' y2='320' stroke='%2310b981' stroke-width='2' stroke-dasharray='12,8'/><circle cx='120' cy='220' r='50' fill='%23059669' opacity='0.3'/><circle cx='680' cy='240' r='60' fill='%23059669' opacity='0.3'/><rect x='340' y='220' width='120' height='100' rx='4' fill='%231e293b'/><text x='400' y='160' fill='%23f0fdf4' font-family='sans-serif' font-size='20' font-weight='bold' text-anchor='middle'>SAMPLE EVIDENCE: CLEAN CIVIC INFRASTRUCTURE</text><text x='400' y='195' fill='%23a7f3d0' font-family='sans-serif' font-size='14' text-anchor='middle'>Paved Pedestrian Walkway, No Litter or Dumps</text></svg>";

export const ReportWastePage: React.FC<ReportWastePageProps> = ({ onReportCreated }) => {
  // Step 1: Image
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imageMimeType, setImageMimeType] = useState<string>("image/jpeg");
  const [imageFileName, setImageFileName] = useState<string>("");
  const [imageFileSize, setImageFileSize] = useState<number>(0);
  const [isDragging, setIsDragging] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Step 2: Location
  const [latitude, setLatitude] = useState<number>(11.0168);
  const [longitude, setLongitude] = useState<number>(76.9558);
  const [address, setAddress] = useState<string>(
    "Near Gandhipuram Bus Stand, Cross Cut Road, Coimbatore, Tamil Nadu"
  );

  // Step 3: Remarks
  const [remarks, setRemarks] = useState<string>("");

  // Step 4: AI Analysis & Submission
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const REMARK_SUGGESTIONS = [
    "Garbage has accumulated near the roadside.",
    "Waste has been present for several days.",
    "Bad smell and mosquitoes are being noticed.",
    "Open dumping of plastic wrappers and food packaging.",
  ];

  // Process selected file
  const handleFileProcess = (file: File) => {
    setImageError(null);
    setAnalysisError(null);

    if (!ALLOWED_TYPES.includes(file.type)) {
      setImageError("Please upload a valid JPG, JPEG, PNG, or WEBP image file.");
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setImageError("Image file size exceeds 10MB limit. Please choose a smaller image.");
      return;
    }

    setImageFileName(file.name);
    setImageFileSize(file.size);
    setImageMimeType(file.type);

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setImageBase64(result);
    };
    reader.onerror = () => {
      setImageError("Failed to read image file from device.");
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleRemoveImage = () => {
    setImageBase64(null);
    setImageFileName("");
    setImageFileSize(0);
    setImageError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const loadSample = (type: "waste" | "clean") => {
    setImageError(null);
    setAnalysisError(null);
    if (type === "waste") {
      setImageBase64(SAMPLE_WASTE_IMAGE);
      setImageFileName("sample_open_waste_evidence.svg");
      setImageFileSize(18400);
      setImageMimeType("image/svg+xml");
      setRemarks("Garbage has accumulated near the roadside for several days.");
    } else {
      setImageBase64(SAMPLE_CLEAN_IMAGE);
      setImageFileName("sample_clean_civic_pathway.svg");
      setImageFileSize(15200);
      setImageMimeType("image/svg+xml");
      setRemarks("Clean pedestrian walkway inspection.");
    }
  };

  // Perform AI Analysis
  const handleAnalyze = async () => {
    if (!imageBase64) {
      setImageError("Please upload an evidence photo before analyzing.");
      return;
    }

    setIsAnalyzing(true);
    setAnalysisError(null);

    try {
      const aiResult: AIAnalysisResult = await analyzeWasteEvidence(imageBase64, imageMimeType);

      // Create new Civic Report
      const newReport: CivicReport = {
        id: `rep-${Date.now()}`,
        image: imageBase64,
        location: address.trim() || "Location specified by coordinates",
        latitude,
        longitude,
        remarks: remarks.trim(),
        timestamp: new Date().toISOString(),
        aiResult,
        status: "Analyzed",
      };

      onReportCreated(newReport);
    } catch (err: unknown) {
      console.error("AI Analysis failed:", err);
      const msg = err instanceof Error ? err.message : "Failed to complete AI waste analysis.";
      setAnalysisError(msg);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="space-y-2 border-b border-emerald-900/40 pb-5">
        <div className="inline-flex items-center gap-2 text-xs font-mono uppercase text-emerald-400 font-semibold tracking-wider">
          <Camera className="w-3.5 h-3.5" />
          <span>New Civic Incident</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
          Report Open-Area Waste
        </h1>
        <p className="text-xs sm:text-sm text-emerald-300/70">
          Complete the four-step evidence collection below. The AI will strictly evaluate the image to verify waste presence before civic dispatch.
        </p>
      </div>

      {/* STEP 1: EVIDENCE PHOTO */}
      <section className="rounded-2xl border border-emerald-900/50 bg-[#07150f]/80 p-5 sm:p-7 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-xs font-mono font-bold text-emerald-300">
              1
            </div>
            <div>
              <h2 className="text-base font-bold text-white uppercase tracking-wide">
                STEP 1 — EVIDENCE PHOTO
              </h2>
              <p className="text-xs text-emerald-400/70">
                Upload clear photograph of the open-area waste or dumped refuse.
              </p>
            </div>
          </div>

          {/* Sample Loader helper for testing */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => loadSample("waste")}
              className="text-[11px] font-mono px-2.5 py-1 rounded bg-emerald-950/80 border border-emerald-800/60 text-emerald-300 hover:bg-emerald-900/40 transition"
            >
              Load Waste Sample
            </button>
            <button
              type="button"
              onClick={() => loadSample("clean")}
              className="text-[11px] font-mono px-2.5 py-1 rounded bg-teal-950/80 border border-teal-800/60 text-teal-300 hover:bg-teal-900/40 transition hidden sm:inline-block"
            >
              Load Clean Sample
            </button>
          </div>
        </div>

        {imageError && (
          <div className="p-3 rounded-lg bg-red-950/50 border border-red-800/60 flex items-center gap-2.5 text-xs text-red-200">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{imageError}</span>
          </div>
        )}

        {!imageBase64 ? (
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`border-2 border-dashed rounded-xl p-8 sm:p-12 text-center transition flex flex-col items-center justify-center space-y-3 ${
              isDragging
                ? "border-emerald-400 bg-emerald-950/40"
                : "border-emerald-900/60 hover:border-emerald-700/60 bg-[#050e09]"
            }`}
          >
            <input
              id="waste-file-input"
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => {
                if (e.target.value && e.target.files && e.target.files[0]) {
                  handleFileProcess(e.target.files[0]);
                }
              }}
            />

            <div className="w-14 h-14 rounded-2xl bg-emerald-950/80 border border-emerald-800/60 flex items-center justify-center text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.15)]">
              <Upload className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <p className="text-sm font-semibold text-white">
                Drag and drop your waste photo here, or{" "}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-emerald-400 hover:text-emerald-300 underline font-semibold focus:outline-none"
                >
                  browse device
                </button>
              </p>
              <p className="text-xs text-emerald-500/70">
                Supports JPG, JPEG, PNG, WEBP (Max 10MB). Image stays local until analysis.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="relative rounded-xl overflow-hidden border border-emerald-800/60 bg-black/60 max-h-96 flex items-center justify-center">
              <img
                src={imageBase64}
                alt="Uploaded waste evidence"
                className="w-full h-auto max-h-80 object-contain rounded-lg"
              />
              <button
                type="button"
                onClick={handleRemoveImage}
                title="Remove photo"
                className="absolute top-3 right-3 p-2 bg-red-950/80 hover:bg-red-900 border border-red-700 text-red-200 rounded-lg transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center justify-between text-xs text-emerald-400/80 px-1 font-mono">
              <span className="truncate max-w-xs">{imageFileName || "Selected Image"}</span>
              <span>{(imageFileSize / 1024).toFixed(1)} KB</span>
            </div>
          </div>
        )}
      </section>

      {/* STEP 2: LOCATION */}
      <section className="rounded-2xl border border-emerald-900/50 bg-[#07150f]/80 p-5 sm:p-7 space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-xs font-mono font-bold text-emerald-300">
            2
          </div>
          <div>
            <h2 className="text-base font-bold text-white uppercase tracking-wide">
              STEP 2 — LOCATION
            </h2>
            <p className="text-xs text-emerald-400/70">
              Interactive map with OpenStreetMap Nominatim street auto-complete and draggable pin.
            </p>
          </div>
        </div>

        <LocationPickerMap
          latitude={latitude}
          longitude={longitude}
          address={address}
          onLocationChange={(newLat, newLon, newAddr) => {
            setLatitude(newLat);
            setLongitude(newLon);
            if (newAddr) {
              setAddress(newAddr);
            }
          }}
          onAddressChange={(newAddr) => setAddress(newAddr)}
        />
      </section>

      {/* STEP 3: REMARKS */}
      <section className="rounded-2xl border border-emerald-900/50 bg-[#07150f]/80 p-5 sm:p-7 space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-xs font-mono font-bold text-emerald-300">
            3
          </div>
          <div>
            <h2 className="text-base font-bold text-white uppercase tracking-wide">
              STEP 3 — REMARKS (OPTIONAL)
            </h2>
            <p className="text-xs text-emerald-400/70">
              Describe the situation (e.g. odor, duration, drainage block).
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <textarea
            id="remarks-textarea"
            rows={3}
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="Describe the waste situation (e.g., Garbage has accumulated near the roadside, waste has been present for several days...)"
            className="w-full bg-[#0a1711] border border-emerald-900/60 focus:border-emerald-500 rounded-lg p-3 text-sm text-[#e8f2ec] placeholder-emerald-700/60 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition"
          />

          {/* Quick insertion suggestion chips */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            <span className="text-[11px] text-emerald-500/70 self-center mr-1">Quick Add:</span>
            {REMARK_SUGGESTIONS.map((sug, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setRemarks((prev) => (prev ? `${prev} ${sug}` : sug));
                }}
                className="text-[11px] px-2.5 py-1 rounded-md bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-800/50 text-emerald-300 transition"
              >
                + {sug}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* STEP 4: ANALYSE WASTE */}
      <section className="rounded-2xl border border-emerald-800/60 bg-gradient-to-b from-[#091b12] to-[#06140e] p-6 sm:p-8 space-y-4 shadow-[0_0_30px_rgba(16,185,129,0.12)]">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-xs font-mono font-bold text-emerald-300">
            4
          </div>
          <div>
            <h2 className="text-base font-bold text-white uppercase tracking-wide">
              STEP 4 — ANALYSE WASTE
            </h2>
            <p className="text-xs text-emerald-300/70">
              Run server-side AI vision analysis on the uploaded photo.
            </p>
          </div>
        </div>

        {analysisError && (
          <div className="p-4 rounded-xl bg-red-950/60 border border-red-700/70 space-y-2 text-xs text-red-200">
            <div className="flex items-center gap-2 font-semibold text-red-300">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>AI Analysis Encountered An Issue</span>
            </div>
            <p className="leading-relaxed">{analysisError}</p>
            <p className="text-[11px] text-red-300/70">
              Note: CleanWatch AI strictly refuses to invent or hallucinate a result. Please verify your connection or click retry below.
            </p>
            <button
              type="button"
              onClick={handleAnalyze}
              className="mt-1 px-3 py-1.5 bg-red-900 hover:bg-red-800 text-white rounded text-xs font-medium flex items-center gap-1.5 transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry Analysis</span>
            </button>
          </div>
        )}

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-emerald-400/80 flex items-center gap-2">
            <Info className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              Deterministic verdict: <strong className="text-white">WASTE DETECTED</strong> or{" "}
              <strong className="text-white">NO SIGNIFICANT WASTE DETECTED</strong>. No artificial scores.
            </span>
          </div>

          <button
            id="analyse-waste-btn"
            type="button"
            disabled={isAnalyzing || !imageBase64}
            onClick={handleAnalyze}
            className={`w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-sm sm:text-base flex items-center justify-center gap-2.5 transition transform active:scale-95 shadow-lg ${
              !imageBase64
                ? "bg-emerald-950/50 text-emerald-600 border border-emerald-900/40 cursor-not-allowed"
                : isAnalyzing
                ? "bg-emerald-800 text-emerald-200 cursor-wait"
                : "bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white shadow-[0_0_25px_rgba(16,185,129,0.35)]"
            }`}
          >
            {isAnalyzing ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>Analyzing Evidence Image...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>Analyse Waste</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </section>
    </div>
  );
};
