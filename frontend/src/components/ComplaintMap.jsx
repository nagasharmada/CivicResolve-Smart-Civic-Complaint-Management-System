import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { useEffect, useRef } from "react";
import "leaflet.heat";

// ── Status colour map ──
const STATUS_COLORS = {
  open:         { hex: "#ef4444", heat: 1.5 },
  under_review: { hex: "#f59e0b", heat: 1.2 },
  in_progress:  { hex: "#3b82f6", heat: 1.0 },
  resolved:     { hex: "#22c55e", heat: 0.3 },
  rejected:     { hex: "#6b7280", heat: 0.2 },
  escalated:    { hex: "#ef4444", heat: 1.5 },
  pending:      { hex: "#f59e0b", heat: 1.2 },
};

const DEFAULT_COLOR = { hex: "#f59e0b", heat: 1.0 };
const getStatusColor = (status) => STATUS_COLORS[status] || DEFAULT_COLOR;

// ── SVG pin icon ──
const getIcon = (status) => {
  const { hex } = getStatusColor(status);
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="40" viewBox="0 0 28 40">
      <filter id="shadow">
        <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="rgba(0,0,0,0.4)"/>
      </filter>
      <path d="M14 0C6.268 0 0 6.268 0 14c0 9.333 14 26 14 26S28 23.333 28 14C28 6.268 21.732 0 14 0z"
        fill="${hex}" filter="url(#shadow)"/>
      <circle cx="14" cy="14" r="6" fill="white" opacity="0.9"/>
    </svg>`;
  return L.divIcon({
    html: svg,
    className: "",
    iconSize: [28, 40],
    iconAnchor: [14, 40],
    popupAnchor: [0, -42],
  });
};

// ── Force map resize ──
function FixLeafletSize({ complaints }) {
  const map = useMap();
  
  useEffect(() => {
    // This forces Leaflet to recalculate the container dimensions
    map.invalidateSize();
  }, [map, complaints]); // Trigger every time the map instance or data changes

  return null;
}

// ── Heatmap layer ──
function HeatLayer({ complaints }) {
  const map = useMap();

  useEffect(() => {
    if (!map || !complaints.length) return;

    // Guard: skip if container has no size yet
    const container = map.getContainer();
    if (!container || container.offsetWidth === 0 || container.offsetHeight === 0) return;

    const points = complaints
      .filter(c => c.latitude && c.longitude)
      .map(c => [
        parseFloat(c.latitude),
        parseFloat(c.longitude),
        getStatusColor(c.status).heat,
      ]);

    if (!points.length) return;

    let layer;
    try {
      layer = L.heatLayer(points, {
        radius: 28,
        blur: 18,
        maxZoom: 17,
        gradient: {
          0.0: "#22c55e",
          0.4: "#fbbf24",
          0.7: "#f97316",
          1.0: "#ef4444",
        },
      }).addTo(map);
    } catch (e) {
      console.warn("Heatmap draw skipped:", e.message);
      return;
    }

    return () => {
      if (layer) {
        try { map.removeLayer(layer); } catch (_) {}
      }
    };
  }, [complaints, map]);

  return null;
}

// ── Popup CSS ──
const POPUP_CSS = `
  .civic-popup .leaflet-popup-content-wrapper {
    background: #161b22;
    border: 1px solid #21262d;
    border-radius: 8px;
    box-shadow: 0 8px 24px rgba(0,0,0,0.5);
    padding: 0;
    overflow: hidden;
  }
  .civic-popup .leaflet-popup-content {
    margin: 0;
    width: 220px !important;
  }
  .civic-popup .leaflet-popup-tip { background: #161b22; }
  .civic-popup .leaflet-popup-close-button {
    color: #6b7280 !important;
    font-size: 18px !important;
    top: 8px !important;
    right: 8px !important;
  }
  .cp-head {
    padding: 10px 14px;
    border-bottom: 1px solid #21262d;
    display: flex; align-items: center; gap: 8px;
  }
  .cp-icon { font-size: 18px; line-height: 1; }
  .cp-cat {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 14px; font-weight: 700;
    text-transform: uppercase; letter-spacing: 0.04em;
    color: #e8eaf0;
  }
  .cp-body { padding: 10px 14px; }
  .cp-desc { font-size: 12px; color: #9ca3af; line-height: 1.5; margin-bottom: 10px; }
  .cp-status {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 3px 8px; border-radius: 10px;
    font-size: 10px; font-weight: 700;
    text-transform: uppercase; letter-spacing: 0.06em;
  }
  .cp-status-dot { width: 6px; height: 6px; border-radius: 50%; }
  .cp-id { margin-top: 8px; font-size: 10px; color: #4b5563; }
`;

const CAT_ICONS = {
  "Pothole / Road Damage": "🕳",
  "Broken Street Light":   "💡",
  "Garbage / Waste":       "🗑",
  "Sewage / Drainage":     "🚰",
  "Water Supply":          "💧",
  "Encroachment":          "🚧",
  "Noise Pollution":       "🔊",
  "Park / Public Space":   "🌳",
  "Traffic Signal":        "🚦",
  "Other":                 "📌",
};

const STATUS_LABELS = {
  open:         "Open",
  under_review: "Under Review",
  in_progress:  "In Progress",
  resolved:     "Resolved",
  rejected:     "Rejected",
  escalated:    "Escalated",
  pending:      "Pending",
};

// -- Auto-centers map when "selected" prop changes --
function MapRecenter({ selected }) {
  const map = useMap();
  useEffect(() => {
    if (selected && selected.latitude && selected.longitude) {
      map.setView(
        [parseFloat(selected.latitude), parseFloat(selected.longitude)], 
        15, // Zoom level for specific complaint
        { animate: true }
      );
    }
  }, [selected, map]);
  return null;
}
function ComplaintMap({ complaints = [] },selected=null) {
  const mapRef = useRef();

  useEffect(() => {
    if (document.getElementById("civic-popup-css")) return;
    const style = document.createElement("style");
    style.id = "civic-popup-css";
    style.textContent = POPUP_CSS;
    document.head.appendChild(style);
  }, []);

  const valid = complaints.filter(
    c => c.latitude && c.longitude &&
         !isNaN(parseFloat(c.latitude)) &&
         !isNaN(parseFloat(c.longitude))
  );

  return (
    <MapContainer
      center={[20.5937, 78.9629]}
      zoom={5}
      style={{ height: "100%", width: "100%" }}
      ref={mapRef}
    >
      <FixLeafletSize complaints={complaints} />
      <MapRecenter selected={selected} />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {valid.map((c) => {
        const { hex } = getStatusColor(c.status);
        const statusLabel = STATUS_LABELS[c.status] || c.status;
        return (
          <Marker
            key={c.id}
            position={[parseFloat(c.latitude), parseFloat(c.longitude)]}
            icon={getIcon(c.status)}
          >
            <Popup className="civic-popup" minWidth={220}>
              <div className="cp-head">
                <span className="cp-icon">{CAT_ICONS[c.category] || "📌"}</span>
                <span className="cp-cat">{c.category || "Unknown"}</span>
              </div>
              <div className="cp-body">
                <div className="cp-desc">{c.description || "No description provided."}</div>
                <span className="cp-status" style={{ background: `${hex}18`, color: hex }}>
                  <span className="cp-status-dot" style={{ background: hex }} />
                  {statusLabel}
                </span>
                <div className="cp-id">
                  #CPE-{String(c.id).padStart(4, "0")}
                  {c.created_at && (
                    <> &nbsp;·&nbsp; {new Date(c.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</>
                  )}
                </div>
              </div>
            </Popup>
          </Marker>
        );
      })}

      {valid.length > 0 && <HeatLayer complaints={valid} />}
    </MapContainer>
  );
}

export default ComplaintMap;
