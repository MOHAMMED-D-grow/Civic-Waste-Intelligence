import React, { useEffect, useRef, useState, useCallback } from "react";
import L from "leaflet";
import {
  MapPin,
  Navigation,
  Search,
  AlertCircle,
  RefreshCw,
  X,
  Compass,
  Check,
  Building,
  Sparkles,
} from "lucide-react";
import { AddressSuggestion, GeoSearchResult } from "../types";

interface LocationPickerMapProps {
  latitude: number | null;
  longitude: number | null;
  address: string;
  onLocationChange: (lat: number, lon: number, newAddress?: string) => void;
  onAddressChange: (newAddress: string) => void;
  readOnly?: boolean;
}

// Default center: Coimbatore City Municipal Corporation, Tamil Nadu
const DEFAULT_LAT = 11.0168;
const DEFAULT_LON = 76.9558;

// Popular Coimbatore civic zones for instant 1-tap street lookup
const POPULAR_COIMBATORE_ZONES = [
  { name: "Gandhipuram", query: "Gandhipuram, Coimbatore" },
  { name: "RS Puram", query: "DB Road, RS Puram, Coimbatore" },
  { name: "Race Course", query: "Race Course Road, Coimbatore" },
  { name: "Peelamedu", query: "Avinashi Road, Peelamedu, Coimbatore" },
  { name: "Town Hall", query: "Town Hall, Coimbatore" },
  { name: "Saibaba Colony", query: "NSR Road, Saibaba Colony, Coimbatore" },
  { name: "Singanallur", query: "Trichy Road, Singanallur, Coimbatore" },
  { name: "Ukkadam", query: "Ukkadam Bus Stand, Coimbatore" },
  { name: "Saravanampatti", query: "Sathy Road, Saravanampatti, Coimbatore" },
];

// Create custom glowing emerald pin for Leaflet
function createCustomMarkerIcon(isDraggable: boolean) {
  const html = `
    <div class="relative -translate-x-1/2 -translate-y-full flex flex-col items-center group cursor-grab">
      <div class="w-8 h-8 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.5)] transition-transform group-hover:scale-110">
        <div class="w-3.5 h-3.5 rounded-full bg-emerald-400 animate-pulse"></div>
      </div>
      <div class="w-1 h-3 bg-emerald-400 -mt-0.5 rounded-b-full"></div>
      ${
        isDraggable
          ? '<span class="absolute -bottom-6 text-[10px] font-mono tracking-wider font-semibold uppercase px-1.5 py-0.5 bg-black/85 border border-emerald-500/40 text-emerald-300 rounded whitespace-nowrap shadow pointer-events-none">Drag to Adjust</span>'
          : ""
      }
    </div>
  `;
  return L.divIcon({
    html,
    className: "cleanwatch-marker-div",
    iconSize: [32, 42],
    iconAnchor: [16, 38],
  });
}

export const LocationPickerMap: React.FC<LocationPickerMapProps> = ({
  latitude,
  longitude,
  address,
  onLocationChange,
  onAddressChange,
  readOnly = false,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const [mapFailed, setMapFailed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [isLocating, setIsLocating] = useState(false);
  const [reverseGeocoding, setReverseGeocoding] = useState(false);
  const [lastSelectedStreet, setLastSelectedStreet] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  const activeLat = latitude ?? DEFAULT_LAT;
  const activeLon = longitude ?? DEFAULT_LON;

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    try {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }

      const map = L.map(mapContainerRef.current, {
        center: [activeLat, activeLon],
        zoom: latitude && longitude ? 16 : 14,
        zoomControl: true,
      });

      // Standard OpenStreetMap tiles
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors',
      }).addTo(map);

      // Add draggable Marker
      const icon = createCustomMarkerIcon(!readOnly);
      const marker = L.marker([activeLat, activeLon], {
        icon,
        draggable: !readOnly,
      }).addTo(map);

      if (!readOnly) {
        marker.on("dragend", async () => {
          const pos = marker.getLatLng();
          handleMarkerMoved(pos.lat, pos.lng);
        });

        map.on("click", (e: L.LeafletMouseEvent) => {
          marker.setLatLng(e.latlng);
          handleMarkerMoved(e.latlng.lat, e.latlng.lng);
        });
      }

      markerRef.current = marker;
      mapInstanceRef.current = map;
      setMapFailed(false);

      // Invalidate size once DOM mounts
      setTimeout(() => {
        try {
          map.invalidateSize();
        } catch {
          // ignore
        }
      }, 250);
    } catch (err) {
      console.error("Leaflet initialization failed:", err);
      setMapFailed(true);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [readOnly]);

  // Update marker position when lat/lon props change from external components
  useEffect(() => {
    if (latitude !== null && longitude !== null && mapInstanceRef.current && markerRef.current) {
      const currentPos = markerRef.current.getLatLng();
      if (
        Math.abs(currentPos.lat - latitude) > 0.0001 ||
        Math.abs(currentPos.lng - longitude) > 0.0001
      ) {
        markerRef.current.setLatLng([latitude, longitude]);
        mapInstanceRef.current.setView([latitude, longitude], 16, { animate: true });
      }
    }
  }, [latitude, longitude]);

  // Handle marker drag or map click (Reverse Geocoding via Nominatim with static fallback)
  const handleMarkerMoved = async (lat: number, lon: number) => {
    setReverseGeocoding(true);
    try {
      let displayName = "";
      try {
        const res = await fetch(`/api/geocode/reverse?lat=${lat}&lon=${lon}`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.display_name) {
            displayName = data.display_name;
          }
        }
      } catch {
        // Backend proxy not reachable (e.g. static GitHub Pages), fallback to direct OSM
      }

      if (!displayName) {
        try {
          const directRes = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`,
            { headers: { "Accept-Language": "en" } }
          );
          if (directRes.ok) {
            const data = await directRes.json();
            if (data && data.display_name) {
              displayName = data.display_name;
            }
          }
        } catch {
          // ignore
        }
      }

      if (displayName) {
        onLocationChange(lat, lon, displayName);
        setLastSelectedStreet(displayName.split(",")[0]);
      } else {
        onLocationChange(lat, lon);
      }
    } catch (err) {
      console.warn("Reverse geocode failed:", err);
      onLocationChange(lat, lon);
    } finally {
      setReverseGeocoding(false);
    }
  };

  // Debounced auto-complete query runner with static fallback
  const fetchAutocompleteSuggestions = useCallback(
    async (queryText: string) => {
      const trimmed = queryText.trim();
      if (trimmed.length < 2) {
        setSuggestions([]);
        setIsSearching(false);
        return;
      }

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const controller = new AbortController();
      abortControllerRef.current = controller;
      setIsSearching(true);

      try {
        let loadedSuggestions: AddressSuggestion[] = [];

        // 1. Attempt via server-side proxy
        try {
          const queryParams = new URLSearchParams({
            q: trimmed,
            lat: String(latitude ?? DEFAULT_LAT),
            lon: String(longitude ?? DEFAULT_LON),
          });

          const res = await fetch(`/api/geocode/autocomplete?${queryParams.toString()}`, {
            signal: controller.signal,
          });

          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data) && data.length > 0) {
              loadedSuggestions = data;
            }
          }
        } catch {
          // Server endpoint not reachable, fallback to direct OSM
        }

        // 2. Direct fallback to OpenStreetMap Nominatim if static/client-only
        if (loadedSuggestions.length === 0) {
          try {
            const target = trimmed.toLowerCase().includes("coimbatore")
              ? trimmed
              : `${trimmed}, Coimbatore`;
            const directUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
              target
            )}&limit=6&addressdetails=1&countrycodes=in`;
            const directRes = await fetch(directUrl, {
              signal: controller.signal,
              headers: { "Accept-Language": "en" },
            });
            if (directRes.ok) {
              const items = await directRes.json();
              if (Array.isArray(items)) {
                loadedSuggestions = items.map((item: any) => {
                  const addr = item.address || {};
                  const road = addr.road || addr.street || addr.residential || "";
                  const title = item.name || road || item.display_name.split(",")[0];
                  const subtitle = [addr.suburb || addr.neighbourhood, addr.city || "Coimbatore", addr.postcode]
                    .filter(Boolean)
                    .join(", ");
                  return {
                    place_id: item.place_id,
                    lat: item.lat,
                    lon: item.lon,
                    display_name: item.display_name,
                    title: title.trim(),
                    subtitle: subtitle || "OpenStreetMap Coordinates",
                    type: item.type || item.class || "street_address",
                    road,
                    suburb: addr.suburb || "",
                    city: addr.city || "Coimbatore",
                    postcode: addr.postcode || "",
                  };
                });
              }
            }
          } catch {
            // ignore
          }
        }

        setSuggestions(loadedSuggestions);
        setShowDropdown(true);
        setSelectedIndex(-1);
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }
        console.warn("Autocomplete fetch error:", err);
      } finally {
        setIsSearching(false);
      }
    },
    [latitude, longitude]
  );

  // Debounce input changes
  useEffect(() => {
    if (!searchQuery) {
      setSuggestions([]);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(() => {
      fetchAutocompleteSuggestions(searchQuery);
    }, 320);

    return () => clearTimeout(timer);
  }, [searchQuery, fetchAutocompleteSuggestions]);

  // Click outside to dismiss auto-complete dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle selecting an auto-complete suggestion
  const handleSelectSuggestion = (suggestion: AddressSuggestion | GeoSearchResult) => {
    const lat = parseFloat(suggestion.lat);
    const lon = parseFloat(suggestion.lon);

    if (!isNaN(lat) && !isNaN(lon)) {
      onLocationChange(lat, lon, suggestion.display_name);

      const titleName =
        "title" in suggestion && suggestion.title
          ? suggestion.title
          : suggestion.display_name.split(",")[0];

      setLastSelectedStreet(titleName);
      setSearchQuery(titleName);
      setShowDropdown(false);
      setSuggestions([]);

      if (mapInstanceRef.current && markerRef.current) {
        markerRef.current.setLatLng([lat, lon]);
        mapInstanceRef.current.setView([lat, lon], 16, { animate: true });
      }
    }
  };

  // Keyboard navigation for auto-complete suggestions
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown || suggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
        handleSelectSuggestion(suggestions[selectedIndex]);
      }
    } else if (e.key === "Escape") {
      setShowDropdown(false);
    }
  };

  // Current GPS Geolocation
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        handleMarkerMoved(lat, lon);
        if (mapInstanceRef.current && markerRef.current) {
          markerRef.current.setLatLng([lat, lon]);
          mapInstanceRef.current.setView([lat, lon], 16, { animate: true });
        }
      },
      (err) => {
        setIsLocating(false);
        console.warn("Geolocation error:", err.message);
        alert(
          "Unable to retrieve current location. Please check browser permissions or search street manually."
        );
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="space-y-4">
      {/* SECTION 1: Address Auto-Complete Search Bar */}
      {!readOnly && (
        <div className="space-y-2 relative">
          <div className="flex items-center justify-between">
            <label
              htmlFor="nominatim-autocomplete-input"
              className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-semibold flex items-center gap-1.5"
            >
              <Search className="w-3.5 h-3.5 text-emerald-400" />
              <span>Street Address Auto-Complete (OpenStreetMap / Nominatim)</span>
            </label>
            <span className="text-[10px] font-mono text-emerald-500/70 hidden sm:inline">
              Type street, landmark or road name
            </span>
          </div>

          <div className="flex gap-2 relative">
            <div className="relative flex-1">
              <input
                ref={searchInputRef}
                id="nominatim-autocomplete-input"
                type="text"
                autoComplete="off"
                placeholder="Type street or landmark (e.g., Cross Cut Road, Gandhipuram, RS Puram)..."
                value={searchQuery}
                onFocus={() => setShowDropdown(true)}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowDropdown(true);
                }}
                onKeyDown={handleKeyDown}
                className="w-full bg-[#0a1711] border border-emerald-800/80 focus:border-emerald-400 rounded-xl px-3.5 py-2.5 pl-10 pr-10 text-sm text-[#e8f2ec] placeholder-emerald-700/60 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 shadow-inner transition"
              />
              <Search className="w-4 h-4 text-emerald-400 absolute left-3.5 top-3" />

              {/* Status / Clear icons */}
              <div className="absolute right-3 top-2.5 flex items-center gap-1.5">
                {isSearching && (
                  <RefreshCw className="w-4 h-4 text-emerald-400 animate-spin" />
                )}
                {searchQuery && !isSearching && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setSuggestions([]);
                      setShowDropdown(false);
                      if (searchInputRef.current) searchInputRef.current.focus();
                    }}
                    className="p-0.5 text-emerald-500 hover:text-white rounded transition"
                    title="Clear street search"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* GPS Location Button */}
            <button
              id="use-current-location-btn"
              type="button"
              onClick={handleUseCurrentLocation}
              disabled={isLocating}
              title="Use device GPS location"
              className="px-3.5 py-2.5 bg-teal-950/60 hover:bg-teal-900/70 border border-teal-700/60 text-teal-300 text-xs sm:text-sm font-semibold rounded-xl flex items-center gap-1.5 transition active:scale-95 disabled:opacity-50 shrink-0 shadow-sm"
            >
              <Navigation
                className={`w-4 h-4 ${isLocating ? "animate-spin text-teal-200" : ""}`}
              />
              <span className="hidden sm:inline">My GPS</span>
            </button>
          </div>

          {/* Auto-Complete Dropdown */}
          {showDropdown && (
            <div
              ref={dropdownRef}
              className="absolute left-0 right-0 top-full mt-1.5 z-30 bg-[#091711] border border-emerald-700/70 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-md animate-in fade-in zoom-in-95 duration-100 divide-y divide-emerald-950/80"
            >
              {/* Header */}
              <div className="px-3.5 py-2 bg-[#050f0b] flex items-center justify-between text-[11px] font-mono text-emerald-400">
                <span className="flex items-center gap-1.5 font-semibold">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  {suggestions.length > 0
                    ? `Nominatim Street Suggestions (${suggestions.length})`
                    : searchQuery.trim().length >= 2
                    ? "Searching OpenStreetMap Nominatim..."
                    : "Popular Coimbatore Civic Localities"}
                </span>
                <span className="text-[10px] text-emerald-600">OpenStreetMap API</span>
              </div>

              {/* Suggestions List */}
              {suggestions.length > 0 ? (
                <ul className="max-h-64 overflow-y-auto divide-y divide-emerald-950/60">
                  {suggestions.map((item, index) => {
                    const isSelected = selectedIndex === index;
                    return (
                      <li key={item.place_id || index}>
                        <button
                          type="button"
                          onClick={() => handleSelectSuggestion(item)}
                          className={`w-full text-left px-4 py-3 flex items-start gap-3 transition ${
                            isSelected
                              ? "bg-emerald-900/50 text-white"
                              : "text-emerald-100 hover:bg-emerald-900/30"
                          }`}
                        >
                          <div className="w-7 h-7 rounded-lg bg-emerald-950/80 border border-emerald-800/60 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                            <MapPin className="w-3.5 h-3.5" />
                          </div>

                          <div className="flex-1 min-w-0 space-y-0.5">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-xs sm:text-sm font-bold text-white truncate">
                                {item.title}
                              </span>
                              {item.type && (
                                <span className="px-1.5 py-0.2 rounded text-[10px] font-mono uppercase bg-emerald-950 text-emerald-400 border border-emerald-800/50 shrink-0">
                                  {item.type}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-emerald-300/80 line-clamp-1">
                              {item.subtitle}
                            </p>
                            <p className="text-[10px] font-mono text-emerald-500/60 truncate">
                              {item.lat}, {item.lon}
                            </p>
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              ) : searchQuery.trim().length >= 2 && !isSearching ? (
                <div className="p-4 text-center space-y-1">
                  <p className="text-xs font-medium text-emerald-200">
                    No matching street address found on OpenStreetMap
                  </p>
                  <p className="text-[11px] text-emerald-400/70">
                    Try typing the landmark or road name, or drag the green pin directly on the map.
                  </p>
                </div>
              ) : (
                /* Quick Locality chips for instant selection */
                <div className="p-3 space-y-2 bg-[#081812]/90">
                  <div className="text-[11px] font-mono text-emerald-400/90 font-medium">
                    Quick-select Coimbatore civic zone:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {POPULAR_COIMBATORE_ZONES.map((zone) => (
                      <button
                        key={zone.name}
                        type="button"
                        onClick={() => {
                          setSearchQuery(zone.query);
                          fetchAutocompleteSuggestions(zone.query);
                        }}
                        className="px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-800/60 text-emerald-200 transition"
                      >
                        {zone.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* SECTION 2: Interactive Map Container */}
      <div className="relative rounded-2xl overflow-hidden border border-emerald-900/60 bg-[#07130d] shadow-inner">
        {mapFailed ? (
          <div className="p-8 text-center flex flex-col items-center justify-center min-h-[280px] space-y-3">
            <AlertCircle className="w-8 h-8 text-amber-400/80" />
            <div className="text-sm font-medium text-emerald-200">
              Interactive Map Tile Loading Notice
            </div>
            <p className="text-xs text-emerald-400/70 max-w-md leading-relaxed">
              Network tile loading was restricted in this container environment. You can still use the auto-complete address service above, or enter coordinates manually below.
            </p>
          </div>
        ) : (
          <div
            ref={mapContainerRef}
            className="w-full h-64 sm:h-76 z-0"
            style={{ minHeight: "270px" }}
          />
        )}

        {/* Live Coordinates Badge Overlay */}
        <div className="absolute top-2.5 right-2.5 z-10 pointer-events-none flex items-center gap-2 bg-[#050c08]/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-emerald-800/60 text-xs font-mono text-emerald-300 shadow-md">
          <MapPin className="w-3.5 h-3.5 text-emerald-400" />
          <span>
            {latitude !== null && longitude !== null
              ? `${latitude.toFixed(5)}° N, ${longitude.toFixed(5)}° E`
              : "Coordinates Not Set"}
          </span>
          {reverseGeocoding && <RefreshCw className="w-3 h-3 text-teal-300 animate-spin ml-1" />}
        </div>

        {/* Guidance Tip Overlay */}
        {!readOnly && !mapFailed && (
          <div className="absolute bottom-2.5 left-2.5 z-10 pointer-events-none bg-[#050c08]/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-emerald-800/60 text-[11px] text-emerald-300/90 shadow-md flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Click map or drag the glowing pin to pinpoint exact street coordinates</span>
          </div>
        )}
      </div>

      {/* SECTION 3: Human-readable Civic Address Field */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label
            htmlFor="civic-address-input"
            className="block text-xs font-mono uppercase tracking-wider text-emerald-400 font-semibold"
          >
            Verified Street Address / Civic Landmark
          </label>
          {!readOnly && (
            <button
              type="button"
              onClick={() => {
                if (latitude !== null && longitude !== null) {
                  handleMarkerMoved(latitude, longitude);
                }
              }}
              disabled={reverseGeocoding}
              className="text-[11px] font-mono text-emerald-400 hover:text-emerald-200 flex items-center gap-1 transition"
              title="Reverse geocode current pin coordinates"
            >
              <RefreshCw
                className={`w-3 h-3 ${reverseGeocoding ? "animate-spin" : ""}`}
              />
              <span>Detect from Pin</span>
            </button>
          )}
        </div>

        <textarea
          id="civic-address-input"
          rows={2}
          disabled={readOnly}
          value={address}
          onChange={(e) => onAddressChange(e.target.value)}
          placeholder="Enter the specific street, landmark, road name or door number where waste is accumulated..."
          className="w-full bg-[#0a1711] border border-emerald-800/70 focus:border-emerald-400 rounded-xl px-3.5 py-2.5 text-sm text-[#e8f2ec] placeholder-emerald-700/60 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 transition disabled:opacity-80 shadow-inner"
        />

        <div className="flex items-center justify-between text-[11px] font-mono text-emerald-500/70 pt-0.5">
          <span>
            {lastSelectedStreet
              ? `Calibrated near: ${lastSelectedStreet}`
              : "Nominatim Reverse-Geocoding Enabled"}
          </span>
          <span className="flex items-center gap-1">
            <Building className="w-3 h-3 text-emerald-500" />
            Coimbatore City Municipal Jurisdiction
          </span>
        </div>
      </div>

      {/* SECTION 4: Latitude / Longitude Manual Decimal Adjustments */}
      {!readOnly && (
        <div className="grid grid-cols-2 gap-3 pt-1">
          <div>
            <label
              htmlFor="latitude-input"
              className="block text-[11px] font-mono text-emerald-400/90 uppercase"
            >
              Latitude (Decimal)
            </label>
            <input
              id="latitude-input"
              type="number"
              step="0.0001"
              value={latitude ?? ""}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                onLocationChange(isNaN(val) ? DEFAULT_LAT : val, longitude ?? DEFAULT_LON);
              }}
              placeholder="11.0168"
              className="w-full bg-[#0a1711] border border-emerald-900/80 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs font-mono text-[#e8f2ec] focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
            />
          </div>
          <div>
            <label
              htmlFor="longitude-input"
              className="block text-[11px] font-mono text-emerald-400/90 uppercase"
            >
              Longitude (Decimal)
            </label>
            <input
              id="longitude-input"
              type="number"
              step="0.0001"
              value={longitude ?? ""}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                onLocationChange(latitude ?? DEFAULT_LAT, isNaN(val) ? DEFAULT_LON : val);
              }}
              placeholder="76.9558"
              className="w-full bg-[#0a1711] border border-emerald-900/80 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs font-mono text-[#e8f2ec] focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
            />
          </div>
        </div>
      )}
    </div>
  );
};
