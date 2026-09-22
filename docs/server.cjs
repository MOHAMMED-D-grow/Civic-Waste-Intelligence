var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_vite = require("vite");
var import_dotenv = __toESM(require("dotenv"), 1);
var import_genai = require("@google/genai");
import_dotenv.default.config();
var app = (0, import_express.default)();
var PORT = 3e3;
app.use(import_express.default.json({ limit: "25mb" }));
app.use(import_express.default.urlencoded({ extended: true, limit: "25mb" }));
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is missing");
  }
  return new import_genai.GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build"
      }
    }
  });
}
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "CleanWatch AI Server",
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
});
app.post("/api/analyze-waste", async (req, res) => {
  try {
    const { imageBase64, mimeType } = req.body;
    if (!imageBase64 || typeof imageBase64 !== "string") {
      return res.status(400).json({
        error: "Missing image data. Please provide a valid base64 image string."
      });
    }
    const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z+]+;base64,/, "");
    const safeMimeType = mimeType && typeof mimeType === "string" ? mimeType : "image/jpeg";
    const ai = getGeminiClient();
    const prompt = `You are an automated civic waste verification system for municipal corporations.
Your task is to examine the provided photo of an open area or public space and determine whether meaningful visible open-area waste, garbage accumulation, dumped litter, or uncollected solid waste is present.

STRICT GUIDELINES:
1. Examine ONLY the visual evidence in the image.
2. If open-area waste, dumped garbage, scattered plastic litter, roadside refuse piles, overflowing garbage containers, or municipal solid waste is clearly visible, return wasteDetected = true, resultLabel = "WASTE DETECTED". Provide a clear, objective 1-2 sentence explanation of the visible waste detected.
3. If no significant open-area waste is visible (for example: clean streets, manicured parks, indoor interiors, ordinary vehicles/objects, or landscape without litter), return wasteDetected = false, resultLabel = "NO SIGNIFICANT WASTE DETECTED". Provide a clear 1-2 sentence explanation explaining that no meaningful visible waste accumulation was observed.
4. STRICT PROHIBITION: Do NOT output any severity rating, risk score, priority level, impact score, confidence percentage, danger level, or arbitrary numerical scoring. Keep the response factual, concise, and focused on the visible evidence.`;
    const contents = [
      {
        inlineData: {
          mimeType: safeMimeType,
          data: cleanBase64
        }
      },
      {
        text: prompt
      }
    ];
    const config = {
      responseMimeType: "application/json",
      responseSchema: {
        type: import_genai.Type.OBJECT,
        properties: {
          wasteDetected: {
            type: import_genai.Type.BOOLEAN,
            description: "Whether meaningful visible open-area waste is present in the image"
          },
          resultLabel: {
            type: import_genai.Type.STRING,
            enum: ["WASTE DETECTED", "NO SIGNIFICANT WASTE DETECTED"],
            description: "The official binary determination label"
          },
          explanation: {
            type: import_genai.Type.STRING,
            description: "A factual 1-2 sentence explanation of what was visually detected or absence thereof"
          }
        },
        required: ["wasteDetected", "resultLabel", "explanation"]
      }
    };
    const candidateModels = ["gemini-3.8-flash", "gemini-3.1-flash-lite", "gemini-flash-latest"];
    let responseText = "";
    let lastError = null;
    for (const modelName of candidateModels) {
      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          const response = await ai.models.generateContent({
            model: modelName,
            contents,
            config
          });
          if (response && response.text) {
            responseText = response.text;
            break;
          }
        } catch (err) {
          lastError = err;
          const errMsg = err instanceof Error ? err.message : String(err);
          const isTransient = errMsg.includes("503") || errMsg.includes("high demand") || errMsg.includes("UNAVAILABLE") || errMsg.includes("429") || errMsg.includes("ResourceExhausted");
          console.warn(`Model ${modelName} attempt ${attempt} notice:`, errMsg);
          if (isTransient && attempt < 2) {
            await new Promise((resolve) => setTimeout(resolve, 1e3 * attempt));
            continue;
          }
          break;
        }
      }
      if (responseText) {
        break;
      }
    }
    if (!responseText) {
      throw lastError || new Error("No response received from any AI model candidate");
    }
    const parsed = JSON.parse(responseText.trim());
    const isDetected = Boolean(parsed.wasteDetected);
    const label = isDetected ? "WASTE DETECTED" : "NO SIGNIFICANT WASTE DETECTED";
    const explanation = typeof parsed.explanation === "string" && parsed.explanation.trim().length > 0 ? parsed.explanation.trim() : isDetected ? "Visible open-area waste and refuse accumulation was detected in the submitted evidence." : "No significant accumulation of open-area waste or litter was detected in the image.";
    return res.json({
      wasteDetected: isDetected,
      resultLabel: label,
      explanation
    });
  } catch (error) {
    console.error("Waste analysis error:", error);
    let errorMessage = error instanceof Error ? error.message : "Unknown error during AI analysis";
    if (errorMessage.includes("503") || errorMessage.includes("high demand") || errorMessage.includes("UNAVAILABLE")) {
      errorMessage = "The AI vision model is currently experiencing temporary high demand across the region. Please retry in a few seconds.";
    } else {
      try {
        const jsonMatch = errorMessage.match(/\{.*"message"\s*:\s*"([^"]+)".*\}/);
        if (jsonMatch && jsonMatch[1]) {
          errorMessage = jsonMatch[1];
        }
      } catch {
      }
    }
    return res.status(503).json({
      error: "Failed to analyze image with AI",
      details: errorMessage
    });
  }
});
var geocodeCache = /* @__PURE__ */ new Map();
var CACHE_TTL_MS = 15 * 60 * 1e3;
function getFromGeocodeCache(key) {
  const entry = geocodeCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    geocodeCache.delete(key);
    return null;
  }
  return entry.data;
}
function setInGeocodeCache(key, data) {
  if (geocodeCache.size > 300) {
    const oldestKey = geocodeCache.keys().next().value;
    if (oldestKey) geocodeCache.delete(oldestKey);
  }
  geocodeCache.set(key, { timestamp: Date.now(), data });
}
var COIMBATORE_FALLBACK_SUGGESTIONS = [
  {
    place_id: "cb-1",
    lat: "11.0169",
    lon: "76.9602",
    title: "Cross Cut Road",
    subtitle: "Gandhipuram, Central Zone, Coimbatore, 641012",
    display_name: "Cross Cut Road, Gandhipuram, Central Zone, Coimbatore, Tamil Nadu, 641012, India",
    type: "road",
    road: "Cross Cut Road",
    suburb: "Gandhipuram",
    city: "Coimbatore",
    postcode: "641012"
  },
  {
    place_id: "cb-2",
    lat: "11.0090",
    lon: "76.9510",
    title: "DB Road (Diwan Bahadur Road)",
    subtitle: "RS Puram, West Zone, Coimbatore, 641002",
    display_name: "Diwan Bahadur Road, RS Puram, West Zone, Coimbatore, Tamil Nadu, 641002, India",
    type: "road",
    road: "DB Road",
    suburb: "RS Puram",
    city: "Coimbatore",
    postcode: "641002"
  },
  {
    place_id: "cb-3",
    lat: "11.0334",
    lon: "77.0320",
    title: "Avinashi Road",
    subtitle: "Peelamedu, East Zone, Coimbatore, 641004",
    display_name: "Avinashi Road, Peelamedu, East Zone, Coimbatore, Tamil Nadu, 641004, India",
    type: "road",
    road: "Avinashi Road",
    suburb: "Peelamedu",
    city: "Coimbatore",
    postcode: "641004"
  },
  {
    place_id: "cb-4",
    lat: "11.0055",
    lon: "76.9710",
    title: "Race Course Road",
    subtitle: "Gopalapuram, Central Zone, Coimbatore, 641018",
    display_name: "Race Course Road, Gopalapuram, Central Zone, Coimbatore, Tamil Nadu, 641018, India",
    type: "road",
    road: "Race Course Road",
    suburb: "Race Course",
    city: "Coimbatore",
    postcode: "641018"
  },
  {
    place_id: "cb-5",
    lat: "10.9930",
    lon: "76.9610",
    title: "Ukkadam Bus Stand & Lake Road",
    subtitle: "South Zone, Coimbatore, 641001",
    display_name: "Ukkadam Bus Stand Road, South Zone, Coimbatore, Tamil Nadu, 641001, India",
    type: "amenity",
    road: "Ukkadam Main Road",
    suburb: "Ukkadam",
    city: "Coimbatore",
    postcode: "641001"
  },
  {
    place_id: "cb-6",
    lat: "11.0305",
    lon: "76.9450",
    title: "NSR Road",
    subtitle: "Saibaba Colony, West Zone, Coimbatore, 641011",
    display_name: "NSR Road, Saibaba Colony, West Zone, Coimbatore, Tamil Nadu, 641011, India",
    type: "road",
    road: "NSR Road",
    suburb: "Saibaba Colony",
    city: "Coimbatore",
    postcode: "641011"
  }
];
app.get("/api/geocode/autocomplete", async (req, res) => {
  try {
    const rawQuery = req.query.q || "";
    const query = rawQuery.trim();
    if (!query || query.length < 2) {
      return res.json([]);
    }
    const cacheKey = `ac_${query.toLowerCase()}_${req.query.lat || ""}_${req.query.lon || ""}`;
    const cached = getFromGeocodeCache(cacheKey);
    if (cached) {
      return res.json(cached);
    }
    let searchTarget = query;
    const lowerQuery = query.toLowerCase();
    const hasCity = lowerQuery.includes("coimbatore") || lowerQuery.includes("kovai") || lowerQuery.includes("tamil");
    if (!hasCity && !lowerQuery.includes("india")) {
      searchTarget = `${query}, Coimbatore`;
    }
    let nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      searchTarget
    )}&limit=7&addressdetails=1&countrycodes=in`;
    const lat = parseFloat(req.query.lat);
    const lon = parseFloat(req.query.lon);
    if (!isNaN(lat) && !isNaN(lon)) {
      const delta = 0.4;
      nominatimUrl += `&viewbox=${(lon - delta).toFixed(4)},${(lat + delta).toFixed(4)},${(lon + delta).toFixed(4)},${(lat - delta).toFixed(4)}`;
    }
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4500);
    let items = [];
    try {
      const response = await fetch(nominatimUrl, {
        signal: controller.signal,
        headers: {
          "User-Agent": "CleanWatch-AI-Civic-App/1.0 (OpenStreetMap Civic Waste Reporting)",
          "Accept-Language": "en"
        }
      });
      clearTimeout(timeoutId);
      if (response.ok) {
        items = await response.json();
      }
    } catch (fetchErr) {
      clearTimeout(timeoutId);
      console.warn("Nominatim fetch warning:", fetchErr);
    }
    if ((!items || items.length === 0) && searchTarget !== query) {
      try {
        const fallbackUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query
        )}&limit=6&addressdetails=1&countrycodes=in`;
        const res2 = await fetch(fallbackUrl, {
          headers: {
            "User-Agent": "CleanWatch-AI-Civic-App/1.0",
            "Accept-Language": "en"
          }
        });
        if (res2.ok) {
          items = await res2.json();
        }
      } catch {
      }
    }
    let suggestions = (items || []).map((item) => {
      const addr = item.address || {};
      const road = addr.road || addr.pedestrian || addr.footway || addr.path || addr.street || addr.residential || addr.commercial;
      const placeName = item.name || road || addr.suburb || addr.neighbourhood || addr.quarter || addr.amenity || item.display_name.split(",")[0];
      const title = placeName.trim();
      const subtitleParts = [
        addr.suburb || addr.neighbourhood || addr.city_district,
        addr.city || addr.town || addr.municipality || "Coimbatore",
        addr.postcode
      ].filter((part) => part && !title.toLowerCase().includes(part.toLowerCase()));
      const subtitle = subtitleParts.length > 0 ? subtitleParts.join(", ") : item.display_name.split(",").slice(1, 4).join(", ").trim();
      return {
        place_id: item.place_id,
        lat: item.lat,
        lon: item.lon,
        display_name: item.display_name,
        title,
        subtitle: subtitle || "Verified OpenStreetMap Coordinates",
        type: item.type || item.class || "street_address",
        road: road || "",
        suburb: addr.suburb || addr.neighbourhood || "",
        city: addr.city || addr.town || "Coimbatore",
        postcode: addr.postcode || ""
      };
    });
    if (suggestions.length === 0) {
      const matchedFallbacks = COIMBATORE_FALLBACK_SUGGESTIONS.filter(
        (s) => s.title.toLowerCase().includes(lowerQuery) || s.subtitle.toLowerCase().includes(lowerQuery) || s.road.toLowerCase().includes(lowerQuery)
      );
      if (matchedFallbacks.length > 0) {
        suggestions = matchedFallbacks;
      }
    }
    setInGeocodeCache(cacheKey, suggestions);
    return res.json(suggestions);
  } catch (err) {
    console.error("Autocomplete error:", err);
    return res.json([]);
  }
});
app.get("/api/geocode/search", async (req, res) => {
  try {
    const query = req.query.q;
    if (!query || query.trim().length < 2) {
      return res.json([]);
    }
    const cacheKey = `search_${query.toLowerCase()}`;
    const cached = getFromGeocodeCache(cacheKey);
    if (cached) {
      return res.json(cached);
    }
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      query
    )}&limit=6&addressdetails=1`;
    const response = await fetch(url, {
      headers: {
        "User-Agent": "CleanWatch-AI-Civic-App/1.0",
        "Accept-Language": "en"
      }
    });
    if (!response.ok) {
      return res.json([]);
    }
    const data = await response.json();
    setInGeocodeCache(cacheKey, data);
    return res.json(data);
  } catch (err) {
    console.error("Geocode search error:", err);
    return res.json([]);
  }
});
app.get("/api/geocode/reverse", async (req, res) => {
  try {
    const lat = req.query.lat;
    const lon = req.query.lon;
    if (!lat || !lon) {
      return res.status(400).json({ error: "lat and lon required" });
    }
    const cacheKey = `rev_${lat}_${lon}`;
    const cached = getFromGeocodeCache(cacheKey);
    if (cached) {
      return res.json(cached);
    }
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${encodeURIComponent(
      lat
    )}&lon=${encodeURIComponent(lon)}&zoom=18&addressdetails=1`;
    const response = await fetch(url, {
      headers: {
        "User-Agent": "CleanWatch-AI-Civic-App/1.0",
        "Accept-Language": "en"
      }
    });
    if (!response.ok) {
      return res.status(502).json({ error: "Failed to reverse geocode" });
    }
    const data = await response.json();
    setInGeocodeCache(cacheKey, data);
    return res.json(data);
  } catch (err) {
    console.error("Reverse geocode error:", err);
    return res.status(500).json({ error: "Internal error during reverse geocoding" });
  }
});
async function start() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`CleanWatch AI Server running on http://0.0.0.0:${PORT}`);
  });
}
start();
//# sourceMappingURL=server.cjs.map
