import { useEffect, useState, useRef } from "react";
import API from "../services/api";
import { jwtDecode } from "jwt-decode";
import ComplaintMap from "../components/ComplaintMap";

const CATEGORIES = [
  "Pothole / Road Damage", "Broken Street Light", "Garbage / Waste",
  "Sewage / Drainage", "Water Supply", "Encroachment",
  "Noise Pollution", "Park / Public Space", "Traffic Signal", "Other",
];

const STATUS_META = {
  open:         { label: "Open",         color: "#ef4444", bg: "rgba(239,68,68,0.1)"   },
  under_review: { label: "Under Review", color: "#f59e0b", bg: "rgba(245,158,11,0.1)"  },
  in_progress:  { label: "In Progress",  color: "#3b82f6", bg: "rgba(59,130,246,0.1)"  },
  resolved:     { label: "Resolved",     color: "#22c55e", bg: "rgba(34,197,94,0.1)"   },
  rejected:     { label: "Rejected",     color: "#6b7280", bg: "rgba(107,114,128,0.1)" },
};

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

function timeAgo(dateStr) {
  if (!dateStr) return "—";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;800&family=Barlow:wght@300;400;500;600&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #0d1117; --surface: #161b22; --surface2: #1c2128;
    --border: #21262d; --amber: #fbbf24; --amber-dim: rgba(251,191,36,0.08);
    --text: #e8eaf0; --muted: #6b7280;
    --font-head: 'Barlow Condensed', sans-serif;
    --font-body: 'Barlow', sans-serif;
  }

  body { background: var(--bg); color: var(--text); font-family: var(--font-body); }

  .pm-root {
    height: 100vh;
    display: flex;
    flex-direction: column;
    background: var(--bg);
    overflow: hidden;
  }

  /* ── topbar ── */
  .pm-topbar {
    height: 58px;
    min-height: 58px;
    background: var(--surface);
    border-bottom: 1px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 24px;
    flex-shrink: 0;
    z-index: 50;
    animation: slideDown 0.4s ease both;
  }

  .pm-brand {
    display: flex; align-items: center; gap: 10px;
  }

  .pm-brand-icon {
    width: 32px; height: 32px;
    background: var(--amber);
    border-radius: 6px;
    display: flex; align-items: center; justify-content: center;
  }

  .pm-brand-icon svg { width: 16px; height: 16px; color: #0d1117; }

  .pm-brand-name {
    font-family: var(--font-head);
    font-size: 17px; font-weight: 700;
    letter-spacing: 0.1em; text-transform: uppercase;
  }
  .pm-brand-name span { color: var(--amber); }

  .pm-title-badge {
    padding: 4px 10px;
    background: var(--amber-dim);
    border: 1px solid rgba(251,191,36,0.15);
    border-radius: 20px;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--amber);
  }

  .pm-topbar-right { display: flex; align-items: center; gap: 10px; }

  .pm-stat-pill {
    display: flex; align-items: center; gap: 6px;
    padding: 5px 12px;
    background: var(--surface2);
    border: 1px solid var(--border);
    border-radius: 20px;
    font-size: 12px;
    color: var(--muted);
  }

  .pm-stat-pill strong { color: var(--text); font-weight: 600; }
  .pm-stat-dot { width: 6px; height: 6px; border-radius: 50%; }

  .btn-login {
    padding: 7px 16px;
    background: var(--amber);
    color: #0d1117;
    border: none;
    border-radius: 6px;
    font-family: var(--font-head);
    font-size: 13px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    cursor: pointer;
    transition: background 0.15s, box-shadow 0.15s;
  }

  .btn-login:hover {
    background: #f59e0b;
    box-shadow: 0 0 16px rgba(251,191,36,0.3);
  }

  /* ── body ── */
 .pm-body {
 flex: 1;
    display: flex;
    overflow: hidden;
}

  /* ── sidebar ── */
  .pm-sidebar {
 width: 380px;
    min-width: 380px;
    display: flex;
    flex-direction: column;
    border-right: 1px solid var(--border);
    background: var(--surface);
    z-index: 10;
}
  /* ── filter bar ── */
  .pm-filters {
    padding: 12px 16px;
    border-bottom: 1px solid var(--border);
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .pm-search {
    display: flex;
    align-items: center;
    gap: 8px;
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: 6px;
    padding: 0 12px;
    transition: border-color 0.2s;
  }

  .pm-search:focus-within { border-color: var(--amber); }
  .pm-search svg { color: var(--muted); flex-shrink: 0; }

  .pm-search input {
    flex: 1;
    background: none;
    border: none;
    outline: none;
    font-family: var(--font-body);
    font-size: 14px;
    color: var(--text);
    padding: 10px 0;
  }

  .pm-search input::placeholder { color: #374151; }

  .filter-chips {
    display: flex; gap: 6px; flex-wrap: wrap;
  }

  .fchip {
    padding: 4px 10px;
    border-radius: 16px;
    font-size: 11px;
    font-weight: 600;
    cursor: pointer;
    border: 1px solid var(--border);
    background: none;
    color: var(--muted);
    white-space: nowrap;
    transition: all 0.15s;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .fchip:hover { color: var(--text); border-color: var(--muted); }
  .fchip.active { background: var(--amber); color: #0d1117; border-color: var(--amber); }

  /* ── list header ── */
  .pm-list-head {
    padding: 10px 16px;
    border-bottom: 1px solid var(--border);
    display: flex; align-items: center; justify-content: space-between;
    font-size: 12px;
    color: var(--muted);
  }

  .pm-list-head strong { color: var(--text); }

  .pm-sort {
    background: none; border: none; cursor: pointer;
    color: var(--muted); font-size: 12px; font-family: var(--font-body);
    display: flex; align-items: center; gap: 4px;
    transition: color 0.15s;
  }

  .pm-sort:hover { color: var(--text); }

  /* ── complaint list ── */
  .pm-list {
    overflow-y: auto;
    max-height: 340px;
  }

  .pm-list::-webkit-scrollbar { width: 3px; }
  .pm-list::-webkit-scrollbar-thumb { background: var(--border); }

  .pm-item {
    display: flex; align-items: flex-start; gap: 12px;
    padding: 14px 16px;
    border-bottom: 1px solid var(--border);
    cursor: pointer;
    transition: background 0.12s;
    animation: fadeUp 0.3s ease both;
  }

  .pm-item:hover { background: var(--surface2); }
  .pm-item.selected { background: var(--amber-dim); border-left: 2px solid var(--amber); }

  .pm-item-icon {
    width: 36px; height: 36px;
    background: var(--surface2);
    border: 1px solid var(--border);
    border-radius: 7px;
    display: flex; align-items: center; justify-content: center;
    font-size: 16px; flex-shrink: 0;
  }

  .pm-item-body { flex: 1; min-width: 0; }

  .pm-item-top {
    display: flex; align-items: center; justify-content: space-between; gap: 6px;
    margin-bottom: 3px;
  }

  .pm-item-cat {
    font-family: var(--font-head);
    font-size: 13px; font-weight: 600;
    text-transform: uppercase; letter-spacing: 0.04em;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }

  .status-dot {
    width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0;
  }

  .pm-item-desc {
    font-size: 12px; color: var(--muted);
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    margin-bottom: 5px;
  }

  .pm-item-meta {
    display: flex; gap: 10px; font-size: 11px; color: #4b5563;
  }

  .pm-item-meta span { display: flex; align-items: center; gap: 3px; }

  /* ── detail panel (inside sidebar) ── */
  .pm-detail {
    border-top: 2px solid var(--amber);
    background: var(--surface2);
    overflow: hidden;
    animation: slideDetailIn 0.25s ease both;
    flex-shrink: 0;
  }

  @keyframes slideDetailIn {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .pm-detail-head {
    padding: 14px 16px;
    border-bottom: 1px solid var(--border);
    display: flex; align-items: center; justify-content: space-between;
  }

  .pm-detail-cat {
    display: flex; align-items: center; gap: 8px;
  }

  .pm-detail-icon {
    width: 32px; height: 32px;
    background: var(--surface2);
    border-radius: 6px;
    display: flex; align-items: center; justify-content: center;
    font-size: 15px;
  }

  .pm-detail-name {
    font-family: var(--font-head);
    font-size: 14px; font-weight: 700;
    text-transform: uppercase; letter-spacing: 0.04em;
  }

  .pm-detail-close {
    background: none; border: none; cursor: pointer;
    color: var(--muted); font-size: 16px; line-height: 1;
    padding: 2px; border-radius: 3px;
    transition: color 0.15s;
  }
  .pm-detail-close:hover { color: var(--text); }

  .pm-detail-body { padding: 14px 16px; }

  .pm-detail-desc {
    font-size: 13px; color: #9ca3af;
    line-height: 1.5; margin-bottom: 12px;
  }

  .pm-detail-row {
    display: flex; justify-content: space-between;
    padding: 5px 0;
    font-size: 12px;
    border-bottom: 1px solid rgba(33,38,45,0.6);
  }

  .pm-detail-row:last-child { border-bottom: none; }
  .pm-detail-row-label { color: var(--muted); }
  .pm-detail-row-val { color: var(--text); font-weight: 500; }

  .status-badge-sm {
    padding: 3px 8px;
    border-radius: 10px;
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  /* ── map area ── */
 .pm-map {
    flex: 1; /* This tells the map to take up ALL remaining horizontal space */
    position: relative;
    background: #0a0f14;
    height: 100%;

  display: flex;
  justify-content: flex-end;   /* pushes map to the right */
}

  .pm-map > * {
  width: 100% !important;
  height: 100% !important;
}

  /* ── legend ── */
  .pm-legend {
    position: absolute;
    bottom: 20px;
    left: 16px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 12px 14px;
    z-index: 20;
    min-width: 160px;
    animation: fadeUp 0.4s ease 0.3s both;
  }

  .pm-legend-title {
    font-size: 10px; font-weight: 700;
    text-transform: uppercase; letter-spacing: 0.1em;
    color: var(--muted); margin-bottom: 10px;
  }

  .pm-legend-item {
    display: flex; align-items: center; gap: 8px;
    font-size: 12px; color: var(--muted);
    padding: 3px 0;
    cursor: pointer;
    transition: color 0.15s;
  }

  .pm-legend-item:hover { color: var(--text); }
  .pm-legend-item.active { color: var(--text); font-weight: 600; }

  .pm-legend-dot {
    width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0;
  }

  /* ── stats bar ── */
  .pm-stats-bar {
    position: absolute;
    top: 16px;
    left: 16px;
    display: flex;
    flex-direction: column;
    gap: 6px;
    z-index: 20;
    animation: fadeUp 0.4s ease 0.2s both;
  }

  .pm-mini-stat {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 6px;
    padding: 8px 12px;
    font-size: 12px;
    display: flex; align-items: center; gap: 8px;
    min-width: 130px;
  }

  .pm-mini-stat-num {
    font-family: var(--font-head);
    font-size: 20px; font-weight: 800;
    line-height: 1;
  }

  .pm-mini-stat-label { color: var(--muted); font-size: 11px; }

  /* ── empty ── */
  .pm-empty {
    flex: 1;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    color: var(--muted); padding: 40px; text-align: center; gap: 8px;
  }

  .pm-empty-icon { font-size: 36px; opacity: 0.3; }
  .pm-empty-title { font-family: var(--font-head); font-size: 15px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; }
  .pm-empty-sub { font-size: 12px; color: #4b5563; }

  /* ── loading bar ── */
  .pm-loading-bar {
    height: 2px;
    background: linear-gradient(90deg, transparent, var(--amber), transparent);
    background-size: 200% 100%;
    animation: shimmer 1.2s linear infinite;
    position: absolute; top: 0; left: 0; right: 0; z-index: 100;
  }

  @keyframes shimmer { from { background-position: -200% 0; } to { background-position: 200% 0; } }
  @keyframes slideDown { from { opacity: 0; transform: translateY(-16px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes slideRight { from { opacity: 0; transform: translateX(-16px); } to { opacity: 1; transform: translateX(0); } }
  @keyframes slideLeft { from { opacity: 0; transform: translateX(16px); } to { opacity: 1; transform: translateX(0); } }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes scaleIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* ── complaint modal ── */
  .modal-overlay {
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.75);
    backdrop-filter: blur(4px);
    z-index: 99999;
    display: flex; align-items: center; justify-content: center;
    padding: 20px;
    animation: fadeIn 0.2s ease both;
    isolation: isolate;
  }

  .modal {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 12px;
    width: 100%; max-width: 520px;
    overflow: hidden;
    animation: scaleIn 0.2s ease both;
    position: relative;
    z-index: 99999;
  }

  .modal-head {
    padding: 18px 24px;
    border-bottom: 1px solid var(--border);
    display: flex; align-items: center; justify-content: space-between;
  }

  .modal-title {
    font-family: var(--font-head);
    font-size: 18px; font-weight: 700;
    text-transform: uppercase; letter-spacing: 0.06em;
  }

  .modal-close {
    background: none; border: none; cursor: pointer;
    color: var(--muted); font-size: 20px; line-height: 1;
    padding: 4px; border-radius: 4px;
    transition: color 0.15s;
  }
  .modal-close:hover { color: var(--text); }

  .modal-body { padding: 22px 24px; }

  .form-group { margin-bottom: 16px; }

  .form-label {
    display: block; font-size: 11px; font-weight: 600;
    text-transform: uppercase; letter-spacing: 0.1em;
    color: var(--muted); margin-bottom: 7px;
  }

  .form-input, .form-select, .form-textarea {
    width: 100%;
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: 6px;
    padding: 11px 14px;
    font-family: var(--font-body); font-size: 14px;
    color: var(--text); outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
  }

  .form-input::placeholder, .form-textarea::placeholder { color: #374151; }

  .form-input:focus, .form-select:focus, .form-textarea:focus {
    border-color: var(--amber);
    box-shadow: 0 0 0 3px rgba(251,191,36,0.08);
  }

  .form-select {
    cursor: pointer; appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
    background-repeat: no-repeat; background-position: right 14px center;
  }

  .form-select option { background: var(--surface); }

  .form-textarea { resize: vertical; min-height: 80px; }

  .form-row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

  .loc-btn {
    width: 100%; margin-top: 8px; padding: 10px;
    background: var(--amber-dim);
    border: 1px dashed rgba(251,191,36,0.25);
    border-radius: 6px; color: var(--amber);
    font-family: var(--font-head); font-size: 13px; font-weight: 600;
    text-transform: uppercase; letter-spacing: 0.08em;
    cursor: pointer; transition: background 0.15s;
    display: flex; align-items: center; justify-content: center; gap: 6px;
  }
  .loc-btn:hover { background: rgba(251,191,36,0.12); }
  .loc-btn:disabled { opacity: 0.5; cursor: not-allowed; }

  .modal-foot {
    padding: 14px 24px;
    border-top: 1px solid var(--border);
    display: flex; justify-content: flex-end; gap: 10px;
  }

  .btn-cancel {
    padding: 9px 18px;
    background: none; border: 1px solid var(--border);
    border-radius: 6px; color: var(--muted);
    font-family: var(--font-body); font-size: 14px;
    cursor: pointer; transition: all 0.15s;
  }
  .btn-cancel:hover { color: var(--text); border-color: var(--muted); }

  .btn-primary {
    background: var(--amber); color: #0d1117;
    border: none; border-radius: 6px; padding: 9px 20px;
    font-family: var(--font-head); font-size: 14px; font-weight: 700;
    text-transform: uppercase; letter-spacing: 0.08em;
    cursor: pointer; transition: background 0.15s, box-shadow 0.15s;
    display: flex; align-items: center; gap: 6px;
  }
  .btn-primary:hover { background: #f59e0b; box-shadow: 0 0 20px rgba(251,191,36,0.25); }
  .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

  .btn-loader {
    display: inline-block; width: 14px; height: 14px;
    border: 2px solid #0d1117; border-top-color: transparent;
    border-radius: 50%; animation: spin 0.7s linear infinite;
  }

  /* ── auth gate modal ── */
  .auth-gate {
    text-align: center; padding: 32px 24px;
  }

  .auth-gate-icon { font-size: 40px; margin-bottom: 14px; }

  .auth-gate-title {
    font-family: var(--font-head);
    font-size: 22px; font-weight: 800;
    text-transform: uppercase; letter-spacing: 0.04em;
    margin-bottom: 8px;
  }

  .auth-gate-sub {
    font-size: 14px; color: var(--muted);
    line-height: 1.6; margin-bottom: 24px;
  }

  .auth-gate-btns { display: flex; flex-direction: column; gap: 10px; }

  .btn-gate-primary {
    width: 100%; padding: 13px;
    background: var(--amber); color: #0d1117;
    border: none; border-radius: 6px;
    font-family: var(--font-head); font-size: 15px; font-weight: 700;
    text-transform: uppercase; letter-spacing: 0.1em;
    cursor: pointer; transition: background 0.15s, box-shadow 0.15s;
  }
  .btn-gate-primary:hover { background: #f59e0b; box-shadow: 0 0 20px rgba(251,191,36,0.3); }

  .btn-gate-secondary {
    width: 100%; padding: 12px;
    background: none; color: var(--muted);
    border: 1px solid var(--border); border-radius: 6px;
    font-family: var(--font-body); font-size: 14px;
    cursor: pointer; transition: all 0.15s;
  }
  .btn-gate-secondary:hover { color: var(--text); border-color: var(--muted); }

  .auth-gate-login {
    margin-top: 14px; font-size: 12px; color: var(--muted);
  }
  .auth-gate-login a { color: var(--amber); text-decoration: none; font-weight: 600; }
  .auth-gate-login a:hover { text-decoration: underline; }

  /* ── toast ── */
  .pm-toast {
    position: fixed; bottom: 24px; right: 24px;
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 8px; padding: 11px 16px;
    font-size: 13px; z-index: 400;
    display: flex; align-items: center; gap: 10px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.4);
    animation: fadeUp 0.3s ease both;
  }
  .pm-toast.success { border-color: rgba(34,197,94,0.3); }
  .pm-toast.error   { border-color: rgba(239,68,68,0.3); }
  .pm-toast-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
  .pm-toast.success .pm-toast-dot { background: #22c55e; }
  .pm-toast.error   .pm-toast-dot { background: #ef4444; }

  @media (max-width: 768px) {
    .pm-sidebar { width: 100%; position: absolute; bottom: 0; left: 0; right: 0; height: 50%; z-index: 40; border-right: none; border-top: 1px solid var(--border); }
    .pm-map { height: 50vh; }
    .pm-stats-bar { display: none; }
    .pm-legend { bottom: 56vh; }
    .pm-detail { display: none; }
  }
`;

export default function PublicMap() {
  // ── auth detection ──
  const token = localStorage.getItem("token");
  const isLoggedIn = !!token;
  const decoded = (() => {
    if (!token) return null;
    try { return jwtDecode(token); } catch { return null; }
  })();
  // Backend sends role as 'admin' or 'user' — normalise
  const userRole = decoded?.role === "admin" ? "admin" : "citizen";

  // ── complaint modal state ──
  const [showModal,    setShowModal]    = useState(false);
  const [showAuthGate, setShowAuthGate] = useState(false);
  const [submitting,   setSubmitting]   = useState(false);
  const [locating,     setLocating]     = useState(false);
  const [toast,        setToast]        = useState(null);
  const toastTimer = useRef(null);
  const [form, setForm] = useState({
    category: "", description: "", latitude: "", longitude: "",
  });

  const [complaints,  setComplaints]  = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [search,      setSearch]      = useState("");
  const [statusFilter,setStatusFilter]= useState("all");
  const [selected,    setSelected]    = useState(null);
  const [sortBy,      setSortBy]      = useState("newest");

  const showToast = (msg, type = "success") => {
    clearTimeout(toastTimer.current);
    setToast({ msg, type });
    toastTimer.current = setTimeout(() => setToast(null), 3200);
  };

  const handleReportClick = () => {
    if (isLoggedIn) {
      setShowModal(true);
    } else {
      setShowAuthGate(true);
    }
  };

  const useMyLocation = () => {
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      pos => {
        setForm(f => ({
          ...f,
          latitude: pos.coords.latitude.toFixed(6),
          longitude: pos.coords.longitude.toFixed(6),
        }));
        setLocating(false);
        showToast("Location detected!");
      },
      () => { showToast("Could not get location", "error"); setLocating(false); }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.category || !form.description || !form.latitude || !form.longitude) {
      showToast("Please fill in all fields", "error"); return;
    }
    setSubmitting(true);
    try {
      await API.post("/complaints", form);
      setForm({ category: "", description: "", latitude: "", longitude: "" });
      setShowModal(false);
      showToast("Complaint submitted! It will appear on the map shortly.");
      // Refresh public complaints
      const res = await API.get("/complaints/public");
      setComplaints(res.data);
    } catch {
      showToast("Failed to submit. Please try again.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const res = await API.get("/complaints/public");
        setComplaints(res.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* derived */
  const filtered = complaints
    .filter(c => {
      const matchStatus = statusFilter === "all" || c.status === statusFilter;
      const q = search.toLowerCase();
      const matchSearch = !q || c.category?.toLowerCase().includes(q) || c.description?.toLowerCase().includes(q);
      return matchStatus && matchSearch;
    })
    .sort((a, b) => {
      if (sortBy === "newest") return new Date(b.created_at) - new Date(a.created_at);
      if (sortBy === "oldest") return new Date(a.created_at) - new Date(b.created_at);
      return 0;
    });

  const stats = {
    total:    complaints.length,
    open:     complaints.filter(c => c.status === "open").length,
    resolved: complaints.filter(c => c.status === "resolved").length,
    rate:     complaints.length
      ? Math.round((complaints.filter(c => c.status === "resolved").length / complaints.length) * 100)
      : 0,
  };

  return (
    <>
      <style>{styles}</style>
      <div className="pm-root">

        {/* ── Topbar ── */}
        <div className="pm-topbar">
          <div className="pm-brand" style={{ cursor: "pointer" }} onClick={() => window.location.href = "/dashboard"}>
            <div className="pm-brand-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </div>
            <span className="pm-brand-name">Civic<span>Engine</span></span>
            <span className="pm-title-badge">Live Public Map</span>
          </div>

          <div className="pm-topbar-right">
            {[
              { label: "Total", val: stats.total, color: "#fbbf24" },
              { label: "Open",  val: stats.open,  color: "#ef4444" },
              { label: "Resolved", val: stats.resolved, color: "#22c55e" },
            ].map(s => (
              <div className="pm-stat-pill" key={s.label}>
                <div className="pm-stat-dot" style={{ background: s.color }} />
                <strong>{s.val}</strong> {s.label}
              </div>
            ))}
            <button className="btn-login" onClick={() => window.location.href = "/login"}>
              Sign In
            </button>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="pm-body">

          {/* ── Sidebar ── */}
          <div className="pm-sidebar">
            {loading && <div className="pm-loading-bar" />}

            {/* Filters */}
            <div className="pm-filters">
              <div className="pm-search">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <input
                  placeholder="Search complaints..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
                {search && (
                  <button onClick={() => setSearch("")} style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer", fontSize: 14 }}>✕</button>
                )}
              </div>

              <div className="filter-chips">
                {["all", "open", "under_review", "in_progress", "resolved"].map(s => (
                  <button
                    key={s}
                    className={`fchip ${statusFilter === s ? "active" : ""}`}
                    onClick={() => setStatusFilter(s)}
                  >
                    {s === "all" ? "All" : s.replace("_", " ")}
                  </button>
                ))}
              </div>
            </div>

            {/* List header */}
            <div className="pm-list-head">
              <span><strong>{filtered.length}</strong> complaints</span>
              <button className="pm-sort" onClick={() => setSortBy(s => s === "newest" ? "oldest" : "newest")}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/>
                  <line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/>
                  <line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
                </svg>
                {sortBy === "newest" ? "Newest first" : "Oldest first"}
              </button>
            </div>

            {/* List */}
            <div className="pm-list">
              {loading ? (
                <div className="pm-empty">
                  <div className="pm-empty-icon">⏳</div>
                  <div className="pm-empty-title">Loading map data...</div>
                </div>
              ) : filtered.length === 0 ? (
                <div className="pm-empty">
                  <div className="pm-empty-icon">🔍</div>
                  <div className="pm-empty-title">No Results</div>
                  <div className="pm-empty-sub">Try adjusting your search or filters</div>
                </div>
              ) : (
                filtered.map((c, i) => {
                  const sm = STATUS_META[c.status] || STATUS_META.open;
                  return (
                    <div
                      key={c.id}
                      className={`pm-item ${selected?.id === c.id ? "selected" : ""}`}
                      style={{ animationDelay: `${Math.min(i * 0.03, 0.4)}s` }}
                      onClick={() => setSelected(prev => prev?.id === c.id ? null : c)}
                    >
                      <div className="pm-item-icon">
                        {CAT_ICONS[c.category] || "📌"}
                      </div>
                      <div className="pm-item-body">
                        <div className="pm-item-top">
                          <div className="pm-item-cat">{c.category || "Unknown"}</div>
                          <div className="status-dot" style={{ background: sm.color }} title={sm.label} />
                        </div>
                        <div className="pm-item-desc">{c.description}</div>
                        <div className="pm-item-meta">
                          <span>
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                            </svg>
                            {timeAgo(c.created_at)}
                          </span>
                          <span style={{ color: sm.color }}>{sm.label}</span>
                          {c.latitude && (
                            <span>
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                              </svg>
                              {parseFloat(c.latitude).toFixed(2)}°
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* ── Detail panel inside sidebar ── */}
            {selected && (
              <div className="pm-detail">
                <div className="pm-detail-head">
                  <div className="pm-detail-cat">
                    <div className="pm-detail-icon">{CAT_ICONS[selected.category] || "📌"}</div>
                    <div>
                      <div className="pm-detail-name">{selected.category}</div>
                      <span
                        className="status-badge-sm"
                        style={{
                          background: STATUS_META[selected.status]?.bg,
                          color: STATUS_META[selected.status]?.color,
                        }}
                      >
                        {STATUS_META[selected.status]?.label}
                      </span>
                    </div>
                  </div>
                  <button className="pm-detail-close" onClick={() => setSelected(null)}>✕</button>
                </div>
                <div className="pm-detail-body">
                  <div className="pm-detail-desc">{selected.description}</div>
                  <div className="pm-detail-row">
                    <span className="pm-detail-row-label">ID</span>
                    <span className="pm-detail-row-val">#CPE-{String(selected.id).padStart(4, "0")}</span>
                  </div>
                  <div className="pm-detail-row">
                    <span className="pm-detail-row-label">Reported</span>
                    <span className="pm-detail-row-val">{timeAgo(selected.created_at)}</span>
                  </div>
                  {selected.latitude && (
                    <div className="pm-detail-row">
                      <span className="pm-detail-row-label">Coordinates</span>
                      <span className="pm-detail-row-val">
                        {parseFloat(selected.latitude).toFixed(4)}, {parseFloat(selected.longitude).toFixed(4)}
                      </span>
                    </div>
                  )}
                  <div style={{ marginTop: 12, paddingTop: 10, borderTop: "1px solid var(--border)" }}>
                    <button
                      onClick={handleReportClick}
                      style={{
                        display: "block", width: "100%",
                        textAlign: "center", padding: "8px",
                        background: "var(--amber-dim)",
                        border: "1px solid rgba(251,191,36,0.2)",
                        borderRadius: 6, color: "var(--amber)",
                        cursor: "pointer", fontSize: 12, fontWeight: 600,
                        fontFamily: "var(--font-head)",
                        textTransform: "uppercase", letterSpacing: "0.06em",
                      }}
                    >
                      {isLoggedIn ? "📍 Report a Similar Issue" : "Sign up to report similar issues →"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Sidebar footer */}
            <div style={{
              padding: "12px 16px",
              borderTop: "1px solid var(--border)",
              fontSize: 11,
              color: "var(--muted)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}>
              <span>Resolution rate: <strong style={{ color: "#22c55e" }}>{stats.rate}%</strong></span>
              <button
                onClick={handleReportClick}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--amber)", fontWeight: 600, fontSize: 11, padding: 0, fontFamily: "var(--font-body)" }}
              >
                Report an issue →
              </button>
            </div>
          </div>

          {/* ── Map ── */}
          <div className="pm-map" style={{ position: "relative", height: "100%" }}>
            <ComplaintMap complaints={filtered} selected={selected} />

            {/* Mini stats overlay */}
            <div className="pm-stats-bar">
              {[
                { num: stats.total, label: "Total Issues", color: "#fbbf24" },
                { num: stats.open, label: "Unresolved", color: "#ef4444" },
                { num: `${stats.rate}%`, label: "Resolved", color: "#22c55e" },
              ].map(s => (
                <div className="pm-mini-stat" key={s.label}>
                  <div className="pm-mini-stat-num" style={{ color: s.color }}>{s.num}</div>
                  <div className="pm-mini-stat-label">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="pm-legend">
              <div className="pm-legend-title">Status Legend</div>
              {Object.entries(STATUS_META).map(([key, sm]) => (
                <div
                  key={key}
                  className={`pm-legend-item ${statusFilter === key ? "active" : ""}`}
                  onClick={() => setStatusFilter(prev => prev === key ? "all" : key)}
                >
                  <div className="pm-legend-dot" style={{ background: sm.color }} />
                  {sm.label}
                  <span style={{ marginLeft: "auto", fontSize: 10, color: "var(--muted)" }}>
                    {complaints.filter(c => c.status === key).length}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* ── Complaint Modal (logged-in users) ── */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-head">
              <div className="modal-title">📍 File New Complaint</div>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Category *</label>
                  <select
                    className="form-select"
                    value={form.category}
                    onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  >
                    <option value="">Select a category...</option>
                    {CATEGORIES.map(c => (
                      <option key={c} value={c}>{CAT_ICONS[c]} {c}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Description *</label>
                  <textarea
                    className="form-textarea"
                    placeholder="Describe the issue in detail — what, where, how severe..."
                    value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Location Coordinates *</label>
                  <div className="form-row-2">
                    <input
                      className="form-input"
                      placeholder="Latitude (e.g. 17.3850)"
                      value={form.latitude}
                      onChange={e => setForm(f => ({ ...f, latitude: e.target.value }))}
                    />
                    <input
                      className="form-input"
                      placeholder="Longitude (e.g. 78.4867)"
                      value={form.longitude}
                      onChange={e => setForm(f => ({ ...f, longitude: e.target.value }))}
                    />
                  </div>
                  <button type="button" className="loc-btn" onClick={useMyLocation} disabled={locating}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/>
                      <line x1="12" y1="2" x2="12" y2="5"/><line x1="12" y1="19" x2="12" y2="22"/>
                      <line x1="2" y1="12" x2="5" y2="12"/><line x1="19" y1="12" x2="22" y2="12"/>
                    </svg>
                    {locating ? "Detecting..." : "Use My Current Location"}
                  </button>
                </div>
              </div>
              <div className="modal-foot">
                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting && <span className="btn-loader" />}
                  {submitting ? "Submitting..." : "Submit Complaint"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Auth Gate Modal (logged-out users) ── */}
      {showAuthGate && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowAuthGate(false)}>
          <div className="modal">
            <div className="modal-head">
              <div className="modal-title">Report an Issue</div>
              <button className="modal-close" onClick={() => setShowAuthGate(false)}>✕</button>
            </div>
            <div className="auth-gate">
              <div className="auth-gate-icon">🏛️</div>
              <div className="auth-gate-title">Join CivicEngine</div>
              <div className="auth-gate-sub">
                You need a free account to file complaints. It takes under 30 seconds — and your report goes directly to the relevant authorities.
              </div>
              <div className="auth-gate-btns">
                <button className="btn-gate-primary" onClick={() => window.location.href = "/signup"}>
                  Create Free Account →
                </button>
                <button className="btn-gate-secondary" onClick={() => window.location.href = "/login"}>
                  I already have an account — Sign In
                </button>
              </div>
              <div className="auth-gate-login">
                Already registered? <a href="/login">Sign in here</a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Toast ── */}
      {toast && (
        <div className={`pm-toast ${toast.type}`}>
          <div className="pm-toast-dot" />
          {toast.msg}
        </div>
      )}
    </>
  );
}