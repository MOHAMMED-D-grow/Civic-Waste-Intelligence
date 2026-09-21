import { AIAnalysisResult } from "../types";

export async function analyzeWasteEvidence(
  imageBase64: string,
  mimeType: string = "image/jpeg"
): Promise<AIAnalysisResult> {
  if (!imageBase64) {
    throw new Error("No image evidence provided for analysis.");
  }

  const response = await fetch("/api/analyze-waste", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      imageBase64,
      mimeType,
    }),
  });

  if (!response.ok) {
    let errorDetails = "Unable to complete AI analysis at this moment.";
    try {
      const errorJson = await response.json();
      if (errorJson.details) {
        errorDetails = errorJson.details;
      } else if (errorJson.error) {
        errorDetails = errorJson.error;
      }
    } catch {
      errorDetails = `Network error (HTTP ${response.status}): Please check connection and retry.`;
    }

    // Clean up any remaining raw JSON strings
    if (errorDetails.includes("503") || errorDetails.includes("high demand") || errorDetails.includes("UNAVAILABLE")) {
      errorDetails = "The AI vision model is currently experiencing high demand. Please try again in a few moments.";
    }

    throw new Error(errorDetails);
  }

  const data = await response.json();

  if (typeof data.wasteDetected !== "boolean" || !data.resultLabel) {
    throw new Error("Invalid response format received from waste analysis engine.");
  }

  return {
    wasteDetected: data.wasteDetected,
    resultLabel: data.wasteDetected ? "WASTE DETECTED" : "NO SIGNIFICANT WASTE DETECTED",
    explanation: data.explanation || (data.wasteDetected
      ? "Meaningful visible open-area waste or discarded material was detected in the evidence."
      : "No significant accumulation of visible open-area waste was detected in the evidence."),
  };
}
