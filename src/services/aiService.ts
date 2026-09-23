import * as tf from "@tensorflow/tfjs";
import * as mobilenet from "@tensorflow-models/mobilenet";
import { AIAnalysisResult } from "../types";

export interface AnalysisProgressCallback {
  (stage: "loading_model" | "analyzing_image"): void;
}

// Singleton cached model instance
let cachedModel: mobilenet.MobileNet | null = null;
let modelLoadingPromise: Promise<mobilenet.MobileNet> | null = null;

/**
 * Loads the browser-compatible MobileNet model.
 * If already loaded, returns cached instance.
 */
export async function getOrLoadModel(
  onProgress?: AnalysisProgressCallback
): Promise<mobilenet.MobileNet> {
  if (cachedModel) {
    return cachedModel;
  }

  if (modelLoadingPromise) {
    onProgress?.("loading_model");
    return await modelLoadingPromise;
  }

  onProgress?.("loading_model");

  modelLoadingPromise = (async () => {
    try {
      // Ensure tf is ready (initializes WebGL or CPU backend)
      await tf.ready();
      // Load MobileNet v2 with alpha 0.5 for fast, lightweight browser inference
      const model = await mobilenet.load({
        version: 2,
        alpha: 0.5,
      });
      cachedModel = model;
      return model;
    } catch (err) {
      modelLoadingPromise = null;
      cachedModel = null;
      console.error("Failed to load browser waste detection model:", err);
      throw new Error(
        "Waste analysis is temporarily unavailable on this device. Please try again."
      );
    }
  })();

  return await modelLoadingPromise;
}

/**
 * Decode image base64 into an HTMLImageElement in memory
 */
function loadImageElement(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () =>
      reject(new Error("Unable to decode photographic evidence for analysis."));
    img.src = dataUrl;
  });
}

/**
 * Analyzes visual clutter and local spatial entropy from the image.
 * Open-area waste piles exhibit high local chromatic variance and edge irregularity,
 * whereas clean pavements/roads/lawns have high spatial uniformity.
 */
function computeVisualClutterMetrics(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D
): { entropy: number; edgeVariance: number; irregularColorSpread: number } {
  const width = canvas.width;
  const height = canvas.height;
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;

  const blockSize = 16;
  const blocksX = Math.floor(width / blockSize);
  const blocksY = Math.floor(height / blockSize);
  const blockAverages: number[] = [];

  let edgeDiffSum = 0;
  let colorDiffSum = 0;

  for (let by = 0; by < blocksY; by++) {
    for (let bx = 0; bx < blocksX; bx++) {
      let blockLumSum = 0;
      let rMin = 255, rMax = 0;
      let gMin = 255, gMax = 0;
      let bMin = 255, bMax = 0;

      for (let y = by * blockSize; y < (by + 1) * blockSize; y++) {
        for (let x = bx * blockSize; x < (bx + 1) * blockSize; x++) {
          const idx = (y * width + x) * 4;
          const r = data[idx];
          const g = data[idx + 1];
          const b = data[idx + 2];
          const lum = 0.299 * r + 0.587 * g + 0.114 * b;
          blockLumSum += lum;

          if (r < rMin) rMin = r;
          if (r > rMax) rMax = r;
          if (g < gMin) gMin = g;
          if (g > gMax) gMax = g;
          if (b < bMin) bMin = b;
          if (b > bMax) bMax = b;

          // Horizontal gradient
          if (x + 1 < width) {
            const nextIdx = (y * width + (x + 1)) * 4;
            const diff = Math.abs(lum - (0.299 * data[nextIdx] + 0.587 * data[nextIdx + 1] + 0.114 * data[nextIdx + 2]));
            edgeDiffSum += diff;
          }
        }
      }

      colorDiffSum += (rMax - rMin) + (gMax - gMin) + (bMax - bMin);
      blockAverages.push(blockLumSum / (blockSize * blockSize));
    }
  }

  // Variance of block luminance averages
  const meanLum = blockAverages.reduce((acc, v) => acc + v, 0) / blockAverages.length;
  const lumVariance =
    blockAverages.reduce((acc, v) => acc + Math.pow(v - meanLum, 2), 0) /
    blockAverages.length;

  const totalPixels = width * height;
  const edgeVariance = edgeDiffSum / totalPixels;
  const irregularColorSpread = colorDiffSum / (blocksX * blocksY);

  return {
    entropy: lumVariance,
    edgeVariance,
    irregularColorSpread,
  };
}

// Waste, litter, trash and discarded packaging classification keywords in ImageNet
const WASTE_OBJECT_KEYWORDS = [
  "ashcan",
  "trash",
  "garbage",
  "wastebasket",
  "dustbin",
  "ashbin",
  "litter",
  "rubbish",
  "refuse",
  "plastic bag",
  "shopping bag",
  "carrier bag",
  "carton",
  "cardboard",
  "can",
  "tin can",
  "beer can",
  "bottle",
  "beer bottle",
  "wine bottle",
  "pop bottle",
  "water bottle",
  "pill bottle",
  "paper towel",
  "toilet tissue",
  "toilet paper",
  "packet",
  "packet",
  "envelope",
  "cup",
  "coffee mug",
  "plate",
  "saucer",
  "bowl",
  "bucket",
  "pail",
  "tub",
  "crate",
  "barrel",
  "debris",
  "rubble",
  "wreck",
  "scrap",
  "shoe",
  "sneaker",
  "sandal",
  "boot",
  "broom",
  "mop",
];

/**
 * Main client-side waste-presence analyzer for CleanWatch AI.
 * Runs 100% locally in the browser with machine learning.
 * Does NOT call any backend API route or expose any API keys.
 */
export async function analyzeWasteEvidence(
  imageBase64: string,
  _mimeType: string = "image/jpeg",
  onProgress?: AnalysisProgressCallback
): Promise<AIAnalysisResult> {
  if (!imageBase64) {
    throw new Error("No image evidence provided for analysis.");
  }

  // 1. Model Loading Stage
  let model: mobilenet.MobileNet;
  try {
    model = await getOrLoadModel(onProgress);
  } catch (err) {
    console.error("Error obtaining machine learning model:", err);
    throw new Error(
      "Waste analysis is temporarily unavailable on this device. Please try again."
    );
  }

  // 2. Image Analysis Stage
  onProgress?.("analyzing_image");

  try {
    const imgElement = await loadImageElement(imageBase64);

    // Prepare offscreen canvas (224x224 matches MobileNet input dimension)
    const canvas = document.createElement("canvas");
    canvas.width = 224;
    canvas.height = 224;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) {
      throw new Error("Canvas context is not available in browser.");
    }
    ctx.drawImage(imgElement, 0, 0, 224, 224);

    // Run MobileNet inference
    const predictions = await model.classify(canvas, 10);

    // Check if any detected class relates to waste, packaging, debris, or refuse
    let detectedWasteObject = false;
    for (const pred of predictions) {
      const labelLower = pred.className.toLowerCase();
      for (const kw of WASTE_OBJECT_KEYWORDS) {
        if (labelLower.includes(kw)) {
          detectedWasteObject = true;
          break;
        }
      }
      if (detectedWasteObject) break;
    }

    // Also analyze visual clutter & scatter metrics
    const metrics = computeVisualClutterMetrics(canvas, ctx);

    // Deterministic waste-presence decision based ONLY on image features:
    // Either a recognized discarded item/trash container was identified,
    // or the visual scatter/edge/color clutter of the scene indicates irregular scattered waste
    // rather than clean, uniform civic infrastructure.
    const isHighVisualClutter =
      metrics.edgeVariance > 18 &&
      metrics.irregularColorSpread > 180 &&
      metrics.entropy > 450;

    const wasteDetected = detectedWasteObject || isHighVisualClutter;

    return {
      wasteDetected,
      resultLabel: wasteDetected
        ? "WASTE DETECTED"
        : "NO SIGNIFICANT WASTE DETECTED",
      explanation: wasteDetected
        ? "Visible municipal solid waste accumulation and discarded materials identified in the submitted photographic evidence."
        : "No significant accumulation of visible open-area solid waste or hazardous refuse was detected in the evidence.",
    };
  } catch (err: unknown) {
    console.error("Machine learning inference failed:", err);
    if (err instanceof Error && err.message.includes("Waste analysis is temporarily")) {
      throw err;
    }
    throw new Error(
      "Waste analysis is temporarily unavailable on this device. Please try again."
    );
  }
}
