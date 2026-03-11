import { useEffect, useState, useRef } from "react";
import API from "../services/api";
import { jwtDecode } from "jwt-decode";
import ComplaintMap from "../components/ComplaintMap";

/* ─── helpers ─────────────────────────────────────────────── */
const CATEGORIES = [
  "Pothole / Road Damage",
  "Broken Street Light",
  "Garbage / Waste",
  "Sewage / Drainage",
  "Water Supply",
  "Encroachment",
  "Noise Pollution",
  "Park / Public Space",
  "Traffic Signal",
  "Other",
];

const STATUS_FLOW = ["open", "under_review", "in_progress", "resolved", "rejected"];

const STATUS_META = {
  open:         { label: "Open",         color: "#ef4444", bg: "rgba(239,68,68,0.1)",    icon: "●" },
  under_review: { label: "Under Review", color: "#f59e0b", bg: "rgba(245,158,11,0.1)",   icon: "◐" },
  in_progress:  { label: "In Progress",  color: "#3b82f6", bg: "rgba(59,130,246,0.1)",   icon: "◑" },
  resolved:     { label: "Resolved",     color: "#22c55e", bg: "rgba(34,197,94,0.1)",    icon: "✓" },
  rejected:     { label: "Rejected",     color: "#6b7280", bg: "rgba(107,114,128,0.1)",  icon: "✕" },
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
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

/* ─── styles ───────────────────────────────────────────────── */
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;800&family=Barlow:wght@300;400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg:        #0d1117;
    --surface:   #161b22;
    --surface2:  #1c2128;
    --border:    #21262d;
    --amber:     #fbbf24;
    --amber-dim: rgba(251,191,36,0.08);
    --text:      #e8eaf0;
    --muted:     #6b7280;
    --font-head: 'Barlow Condensed', sans-serif;
    --font-body: 'Barlow', sans-serif;
  }

  body { background: var(--bg); color: var(--text); font-family: var(--font-body); }

  /* ── layout ── */
  .db-root { display: flex; min-height: 100vh; background: var(--bg); }

  /* ── sidebar ── */
  .sidebar {
    width: 240px;
    background: var(--surface);
    border-right: 1px solid var(--border);
    display: flex;
    flex-direction: column;
    position: fixed;
    top: 0; left: 0; bottom: 0;
    z-index: 100;
    animation: slideRight 0.4s ease both;
  }

  .sidebar-brand {
    padding: 24px 20px 20px;
    border-bottom: 1px solid var(--border);
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .brand-icon {
    width: 34px; height: 34px;
    background: var(--amber);
    border-radius: 7px;
    display: flex; align-items: center; justify-content: center;
  }

  .brand-icon svg { width: 18px; height: 18px; color: #0d1117; }

  .brand-name {
    font-family: var(--font-head);
    font-size: 17px; font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }

  .brand-name span { color: var(--amber); }

  .sidebar-nav {
    flex: 1;
    padding: 16px 12px;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .nav-label {
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: var(--muted);
    padding: 12px 8px 6px;
  }

  .nav-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 9px 12px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    color: var(--muted);
    transition: all 0.15s;
    border: none;
    background: none;
    width: 100%;
    text-align: left;
  }

  .nav-item:hover { background: var(--surface2); color: var(--text); }

  .nav-item.active {
    background: var(--amber-dim);
    color: var(--amber);
    border: 1px solid rgba(251,191,36,0.15);
  }

  .nav-item svg { width: 16px; height: 16px; flex-shrink: 0; }

  .nav-badge {
    margin-left: auto;
    background: var(--amber);
    color: #0d1117;
    font-size: 10px;
    font-weight: 700;
    padding: 1px 6px;
    border-radius: 10px;
  }

  .sidebar-user {
    padding: 16px 20px;
    border-top: 1px solid var(--border);
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .user-avatar {
    width: 34px; height: 34px;
    background: var(--amber-dim);
    border: 1px solid rgba(251,191,36,0.2);
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-family: var(--font-head);
    font-size: 14px;
    font-weight: 700;
    color: var(--amber);
    flex-shrink: 0;
  }

  .user-info { flex: 1; min-width: 0; }

  .user-name {
    font-size: 13px;
    font-weight: 600;
    color: var(--text);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .user-role {
    font-size: 11px;
    color: var(--muted);
    text-transform: capitalize;
  }

  .btn-logout {
    background: none; border: none; cursor: pointer;
    color: var(--muted); padding: 4px;
    border-radius: 4px;
    transition: color 0.15s;
  }
  .btn-logout:hover { color: #ef4444; }

  /* ── main content ── */
  .main {
    margin-left: 240px;
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  /* ── topbar ── */
  .topbar {
    height: 60px;
    background: var(--surface);
    border-bottom: 1px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 28px;
    position: sticky;
    top: 0;
    z-index: 50;
  }

  .topbar-title {
    font-family: var(--font-head);
    font-size: 20px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  .topbar-actions { display: flex; align-items: center; gap: 10px; }

  .btn-primary {
    background: var(--amber);
    color: #0d1117;
    border: none;
    border-radius: 6px;
    padding: 8px 16px;
    font-family: var(--font-head);
    font-size: 13px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    cursor: pointer;
    transition: background 0.15s, box-shadow 0.15s;
    display: flex; align-items: center; gap: 6px;
  }

  .btn-primary:hover {
    background: #f59e0b;
    box-shadow: 0 0 20px rgba(251,191,36,0.25);
  }

  .btn-icon {
    background: var(--surface2);
    border: 1px solid var(--border);
    color: var(--muted);
    border-radius: 6px;
    padding: 8px;
    cursor: pointer;
    display: flex; align-items: center;
    transition: color 0.15s, border-color 0.15s;
  }

  .btn-icon:hover { color: var(--text); border-color: var(--muted); }
  .btn-icon svg { width: 16px; height: 16px; }

  /* ── page content ── */
  .page-content { padding: 28px; }

  /* ── stats grid ── */
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    margin-bottom: 28px;
    animation: fadeUp 0.5s ease 0.1s both;
  }

  .stat-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 20px;
    transition: border-color 0.2s;
  }

  .stat-card:hover { border-color: rgba(251,191,36,0.2); }

  .stat-header {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 12px;
  }

  .stat-icon {
    width: 36px; height: 36px;
    border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    font-size: 16px;
  }

  .stat-trend {
    font-size: 11px;
    font-weight: 600;
    padding: 3px 7px;
    border-radius: 12px;
  }

  .trend-up   { background: rgba(34,197,94,0.1);  color: #4ade80; }
  .trend-down { background: rgba(239,68,68,0.1);  color: #f87171; }
  .trend-neu  { background: rgba(107,114,128,0.1);color: #9ca3af; }

  .stat-num {
    font-family: var(--font-head);
    font-size: 36px;
    font-weight: 800;
    line-height: 1;
    margin-bottom: 4px;
  }

  .stat-label {
    font-size: 12px;
    font-weight: 500;
    color: var(--muted);
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  /* ── two-col layout ── */
  .content-grid {
    display: grid;
    grid-template-columns: 1fr 380px;
    gap: 20px;
    animation: fadeUp 0.5s ease 0.2s both;
  }

  /* ── section card ── */
  .section-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 10px;
    overflow: hidden;
  }

  .section-head {
    padding: 16px 20px;
    border-bottom: 1px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .section-title {
    font-family: var(--font-head);
    font-size: 15px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  .section-count {
    font-size: 12px;
    color: var(--muted);
    background: var(--surface2);
    padding: 3px 9px;
    border-radius: 10px;
  }

  /* ── filter bar ── */
  .filter-bar {
    display: flex;
    gap: 8px;
    padding: 12px 20px;
    border-bottom: 1px solid var(--border);
    overflow-x: auto;
    scrollbar-width: none;
  }

  .filter-bar::-webkit-scrollbar { display: none; }

  .filter-chip {
    padding: 5px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    border: 1px solid var(--border);
    background: none;
    color: var(--muted);
    white-space: nowrap;
    transition: all 0.15s;
  }

  .filter-chip:hover { color: var(--text); border-color: var(--muted); }
  .filter-chip.active { background: var(--amber); color: #0d1117; border-color: var(--amber); font-weight: 600; }

  /* ── complaint list ── */
  .complaint-list { overflow-y: auto; max-height: 520px; }

  .complaint-item {
    display: flex;
    align-items: flex-start;
    gap: 14px;
    padding: 16px 20px;
    border-bottom: 1px solid var(--border);
    cursor: pointer;
    transition: background 0.15s;
    animation: fadeUp 0.3s ease both;
  }

  .complaint-item:last-child { border-bottom: none; }
  .complaint-item:hover { background: var(--surface2); }
  .complaint-item.selected { background: var(--amber-dim); border-left: 2px solid var(--amber); }

  .complaint-cat-icon {
    width: 40px; height: 40px;
    background: var(--surface2);
    border: 1px solid var(--border);
    border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    font-size: 18px;
    flex-shrink: 0;
  }

  .complaint-body { flex: 1; min-width: 0; }

  .complaint-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    margin-bottom: 4px;
  }

  .complaint-cat {
    font-family: var(--font-head);
    font-size: 14px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .status-badge {
    font-size: 10px;
    font-weight: 600;
    padding: 3px 8px;
    border-radius: 10px;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    white-space: nowrap;
    flex-shrink: 0;
  }

  .complaint-desc {
    font-size: 13px;
    color: var(--muted);
    line-height: 1.45;
    margin-bottom: 8px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .complaint-meta {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 11px;
    color: #4b5563;
  }

  .complaint-meta span { display: flex; align-items: center; gap: 4px; }

  /* ── complaint detail panel ── */
  .detail-panel {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 10px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .detail-empty {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: var(--muted);
    padding: 40px;
    text-align: center;
    gap: 12px;
  }

  .detail-empty-icon {
    font-size: 40px;
    opacity: 0.3;
  }

  .detail-empty p { font-size: 13px; line-height: 1.5; }

  .detail-content { flex: 1; overflow-y: auto; padding: 20px; }

  .detail-cat-row {
    display: flex; align-items: center; gap: 12px;
    margin-bottom: 16px;
  }

  .detail-cat-icon {
    width: 48px; height: 48px;
    background: var(--surface2);
    border: 1px solid var(--border);
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    font-size: 22px;
  }

  .detail-cat-name {
    font-family: var(--font-head);
    font-size: 18px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .detail-desc {
    font-size: 14px;
    color: #9ca3af;
    line-height: 1.6;
    margin-bottom: 20px;
    padding-bottom: 20px;
    border-bottom: 1px solid var(--border);
  }

  .detail-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 0;
    font-size: 13px;
    border-bottom: 1px solid rgba(33,38,45,0.5);
  }

  .detail-row-label { color: var(--muted); font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; }
  .detail-row-val { color: var(--text); font-weight: 500; }

  /* ── status timeline ── */
  .status-timeline {
    margin: 20px 0;
    display: flex;
    flex-direction: column;
    gap: 0;
  }

  .timeline-step {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 8px 0;
    position: relative;
  }

  .timeline-step:not(:last-child)::after {
    content: '';
    position: absolute;
    left: 11px;
    top: 28px;
    width: 2px;
    height: calc(100% - 8px);
    background: var(--border);
  }

  .timeline-dot {
    width: 24px; height: 24px;
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 11px;
    flex-shrink: 0;
    border: 2px solid var(--border);
    background: var(--surface2);
    color: var(--muted);
    z-index: 1;
  }

  .timeline-dot.done {
    background: rgba(34,197,94,0.15);
    border-color: #22c55e;
    color: #4ade80;
  }

  .timeline-dot.current {
    background: var(--amber-dim);
    border-color: var(--amber);
    color: var(--amber);
    box-shadow: 0 0 10px rgba(251,191,36,0.2);
  }

  .timeline-info { padding-top: 2px; }

  .timeline-label {
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  .timeline-label.done    { color: #4ade80; }
  .timeline-label.current { color: var(--amber); }
  .timeline-label.future  { color: #374151; }

  /* ── admin controls ── */
  .admin-controls {
    padding: 16px 20px;
    border-top: 1px solid var(--border);
    background: var(--surface2);
  }

  .admin-controls-title {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--muted);
    margin-bottom: 10px;
  }

  .status-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .btn-status {
    padding: 6px 12px;
    border-radius: 6px;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    cursor: pointer;
    border: 1px solid var(--border);
    background: var(--surface);
    color: var(--muted);
    transition: all 0.15s;
  }

  .btn-status:hover { color: var(--text); border-color: var(--muted); }

  .btn-status.danger { border-color: rgba(239,68,68,0.3); color: #f87171; }
  .btn-status.danger:hover { background: rgba(239,68,68,0.1); }
  .btn-status.success { border-color: rgba(34,197,94,0.3); color: #4ade80; }
  .btn-status.success:hover { background: rgba(34,197,94,0.1); }

  /* ── new complaint modal ── */
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.7);
    backdrop-filter: blur(4px);
    z-index: 200;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    animation: fadeIn 0.2s ease both;
  }

  .modal {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 12px;
    width: 100%;
    max-width: 540px;
    overflow: hidden;
    animation: scaleIn 0.2s ease both;
  }

  .modal-head {
    padding: 20px 24px;
    border-bottom: 1px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .modal-title {
    font-family: var(--font-head);
    font-size: 18px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  .modal-close {
    background: none; border: none; cursor: pointer;
    color: var(--muted); font-size: 20px; line-height: 1;
    padding: 4px;
    border-radius: 4px;
    transition: color 0.15s;
  }
  .modal-close:hover { color: var(--text); }

  .modal-body { padding: 24px; }

  .form-group { margin-bottom: 16px; }

  .form-label {
    display: block;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--muted);
    margin-bottom: 7px;
  }

  .form-input, .form-select, .form-textarea {
    width: 100%;
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: 6px;
    padding: 11px 14px;
    font-family: var(--font-body);
    font-size: 14px;
    color: var(--text);
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
  }

  .form-input::placeholder, .form-textarea::placeholder { color: #374151; }

  .form-input:focus, .form-select:focus, .form-textarea:focus {
    border-color: var(--amber);
    box-shadow: 0 0 0 3px rgba(251,191,36,0.08);
  }

  .form-select {
    cursor: pointer;
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 14px center;
  }

  .form-textarea { resize: vertical; min-height: 80px; }

  .form-row-2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }

  .loc-btn {
    width: 100%;
    margin-top: 8px;
    padding: 10px;
    background: var(--amber-dim);
    border: 1px dashed rgba(251,191,36,0.25);
    border-radius: 6px;
    color: var(--amber);
    font-family: var(--font-head);
    font-size: 13px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    cursor: pointer;
    transition: background 0.15s;
    display: flex; align-items: center; justify-content: center; gap: 6px;
  }

  .loc-btn:hover { background: rgba(251,191,36,0.12); }

  .modal-foot {
    padding: 16px 24px;
    border-top: 1px solid var(--border);
    display: flex;
    justify-content: flex-end;
    gap: 10px;
  }

  .btn-cancel {
    padding: 9px 18px;
    background: none;
    border: 1px solid var(--border);
    border-radius: 6px;
    color: var(--muted);
    font-family: var(--font-body);
    font-size: 14px;
    cursor: pointer;
    transition: all 0.15s;
  }
  .btn-cancel:hover { color: var(--text); border-color: var(--muted); }

  .btn-loader {
    display: inline-block;
    width: 14px; height: 14px;
    border: 2px solid #0d1117;
    border-top-color: transparent;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
    vertical-align: middle;
    margin-right: 6px;
  }

  /* ── map section ── */
  .map-section {
    margin-top: 20px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 10px;
    overflow: hidden;
    animation: fadeUp 0.5s ease 0.3s both;
  }

  .map-section .section-head { padding: 14px 20px; }

  /* ── empty state ── */
  .empty-state {
    text-align: center;
    padding: 48px 24px;
    color: var(--muted);
  }

  .empty-icon { font-size: 40px; margin-bottom: 12px; opacity: 0.4; }
  .empty-title { font-family: var(--font-head); font-size: 16px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 6px; }
  .empty-sub { font-size: 13px; line-height: 1.5; color: #4b5563; }

  /* ── toast ── */
  .toast {
    position: fixed;
    bottom: 28px; right: 28px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 12px 18px;
    font-size: 13px;
    z-index: 300;
    display: flex;
    align-items: center;
    gap: 10px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.4);
    animation: slideToast 0.3s ease both;
  }

  .toast.success { border-color: rgba(34,197,94,0.3); }
  .toast.error   { border-color: rgba(239,68,68,0.3); }
  .toast-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
  .toast.success .toast-dot { background: #22c55e; }
  .toast.error   .toast-dot { background: #ef4444; }

  /* ── admin badge ── */
  .admin-banner {
    margin-bottom: 20px;
    padding: 10px 16px;
    background: rgba(251,191,36,0.05);
    border: 1px solid rgba(251,191,36,0.15);
    border-radius: 8px;
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 13px;
    color: var(--amber);
    animation: fadeUp 0.4s ease both;
  }

  /* ── keyframes ── */
  @keyframes slideRight {
    from { transform: translateX(-20px); opacity: 0; }
    to   { transform: translateX(0);     opacity: 1; }
  }
  @keyframes fadeUp {
    from { transform: translateY(16px); opacity: 0; }
    to   { transform: translateY(0);    opacity: 1; }
  }
  @keyframes fadeIn {
    from { opacity: 0; } to { opacity: 1; }
  }
  @keyframes scaleIn {
    from { transform: scale(0.95); opacity: 0; }
    to   { transform: scale(1);    opacity: 1; }
  }
  @keyframes slideToast {
    from { transform: translateY(16px); opacity: 0; }
    to   { transform: translateY(0);    opacity: 1; }
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* ── scrollbar ── */
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }

  /* ── responsive ── */
  @media (max-width: 1100px) {
    .content-grid { grid-template-columns: 1fr; }
    .detail-panel { display: none; }
  }
  @media (max-width: 768px) {
    .sidebar { transform: translateX(-100%); }
    .main { margin-left: 0; }
    .stats-grid { grid-template-columns: repeat(2, 1fr); }
  }
`;

/* ─── component ────────────────────────────────────────────── */
export default function Dashboard() {
  const token = localStorage.getItem("token");
  const decoded = token ? jwtDecode(token) : null;

  // Backend sends role as 'admin' or 'user' — normalise
  const rawRole  = decoded?.role || "user";
  const role     = rawRole === "admin" ? "admin" : "citizen";
  const userName = decoded?.name || decoded?.email || `User #${decoded?.user_id || ""}`;
  const userId   = decoded?.user_id || decoded?.id || null;

  const [complaints,    setComplaints]    = useState([]);
  const [filter,        setFilter]        = useState("all");
  const [selected,      setSelected]      = useState(null);
  const [showModal,     setShowModal]     = useState(false);
  const [loading,       setLoading]       = useState(false);
  const [submitting,    setSubmitting]    = useState(false);
  const [toast,         setToast]         = useState(null);
  // Admin lands on "admin" view (all complaints), citizen lands on "complaints"
  const [activeView,    setActiveView]    = useState(role === "admin" ? "admin" : "complaints");
  const [locating,      setLocating]      = useState(false);
  const toastTimer = useRef(null);

  const [form, setForm] = useState({
    category: "", description: "", latitude: "", longitude: "",
  });

  useEffect(() => { fetchComplaints(); }, [role]);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      // role is normalised to "admin" or "citizen" above
      const endpoint = role === "admin" ? "/complaints/all" : "/complaints/my";
      const res = await API.get(endpoint);
      setComplaints(res.data);
    } catch {
      showToast("Failed to load complaints", "error");
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg, type = "success") => {
    clearTimeout(toastTimer.current);
    setToast({ msg, type });
    toastTimer.current = setTimeout(() => setToast(null), 3200);
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
      fetchComplaints();
      showToast("Complaint submitted successfully!");
    } catch {
      showToast("Failed to submit complaint", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await API.put(`/complaints/${id}/status`, { new_status: status });
      fetchComplaints();
      setSelected(prev => prev ? { ...prev, status } : prev);
      showToast(`Status updated to "${STATUS_META[status]?.label}"`);
    } catch {
      showToast("Failed to update status", "error");
    }
  };

  const useMyLocation = () => {
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
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

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  /* derived */
  const filtered = filter === "all"
    ? complaints
    : complaints.filter(c => c.status === filter);

  const stats = {
    total:    complaints.length,
    open:     complaints.filter(c => c.status === "open").length,
    progress: complaints.filter(c => c.status === "in_progress" || c.status === "under_review").length,
    resolved: complaints.filter(c => c.status === "resolved").length,
  };

  const resolutionRate = stats.total
    ? Math.round((stats.resolved / stats.total) * 100)
    : 0;

  const statusIdx = selected ? STATUS_FLOW.indexOf(selected.status) : -1;

  /* nav items */
  const navItems = [
    { id: "complaints", label: "Complaints", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>, badge: stats.open || null },
    { id: "map",        label: "Map View",   icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/><line x1="9" y1="3" x2="9" y2="18"/><line x1="15" y1="6" x2="15" y2="21"/></svg> },
    { id: "public",     label: "Public Map", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20"/></svg> },
  ];

  return (
    <>
      <style>{styles}</style>

      <div className="db-root">
        {/* ── Sidebar ── */}
        <aside className="sidebar">
          <div className="sidebar-brand" style={{ cursor: "pointer" }} onClick={() => window.location.href = "/dashboard"}>
            <div className="brand-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </div>
            <div className="brand-name">Civic<span>Engine</span></div>
          </div>

          <nav className="sidebar-nav">
            <div className="nav-label">Navigation</div>
            {navItems.map(item => (
              <button
                key={item.id}
                className={`nav-item ${activeView === item.id ? "active" : ""}`}
                onClick={() => setActiveView(item.id)}
              >
                {item.icon}
                {item.label}
                {item.badge ? <span className="nav-badge">{item.badge}</span> : null}
              </button>
            ))}

            {role === "admin" && (
              <>
                <div className="nav-label" style={{ marginTop: 8 }}>Admin</div>
                <button
                  className={`nav-item ${activeView === "admin" ? "active" : ""}`}
                  onClick={() => setActiveView("admin")}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  </svg>
                  All Complaints
                  <span className="nav-badge">{stats.total}</span>
                </button>
              </>
            )}

            <div className="nav-label" style={{ marginTop: 8 }}>Quick Links</div>
            <button className="nav-item" onClick={() => window.location.href = "/public-map"}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
                <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
              </svg>
              Public Map
            </button>
          </nav>

          <div className="sidebar-user">
            <div className="user-avatar" style={{ background: role === "admin" ? "rgba(251,191,36,0.2)" : "var(--amber-dim)", borderColor: role === "admin" ? "var(--amber)" : "rgba(251,191,36,0.2)" }}>
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="user-info">
              <div className="user-name">{userName}</div>
              <div className="user-role" style={{ display: "flex", alignItems: "center", gap: 5 }}>
                {role === "admin" && (
                  <span style={{
                    background: "var(--amber)", color: "#0d1117",
                    fontSize: 9, fontWeight: 800, padding: "1px 5px",
                    borderRadius: 3, letterSpacing: "0.08em",
                    fontFamily: "var(--font-head)",
                  }}>ADMIN</span>
                )}
                {role === "admin" ? "Administrator" : "Citizen"}
              </div>
            </div>
            <button className="btn-logout" onClick={handleLogout} title="Logout">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
                <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            </button>
          </div>
        </aside>

        {/* ── Main ── */}
        <main className="main">
          {/* Topbar */}
          <div className="topbar">
            <div className="topbar-title" style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {activeView === "complaints" && "My Complaints"}
              {activeView === "map" && "Map View"}
              {activeView === "public" && "Public Map"}
              {activeView === "admin" && "All Complaints"}
              {role === "admin" && (
                <span style={{
                  background: "var(--amber)", color: "#0d1117",
                  fontSize: 10, fontWeight: 800,
                  padding: "2px 8px", borderRadius: 4,
                  fontFamily: "var(--font-head)", letterSpacing: "0.1em",
                }}>ADMIN</span>
              )}
            </div>
            <div className="topbar-actions">
              <button className="btn-icon" onClick={fetchComplaints} title="Refresh">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/>
                  <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
                </svg>
              </button>
              {/* Admins can also file complaints, citizens too */}
              <button className="btn-primary" onClick={() => setShowModal(true)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                {role === "admin" ? "File Complaint" : "New Complaint"}
              </button>
            </div>
          </div>

          <div className="page-content">
            {/* Admin banner */}
            {role === "admin" && (
              <div className="admin-banner">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
                Admin Mode — You can update the status of any complaint in the system.
              </div>
            )}

            {/* Stats */}
            <div className="stats-grid">
              {[
                { num: stats.total,    label: "Total Reported",  icon: "📋", bg: "rgba(251,191,36,0.08)", trend: "+3 this week", cls: "trend-neu" },
                { num: stats.open,     label: "Open Issues",     icon: "🔴", bg: "rgba(239,68,68,0.08)",  trend: "Needs action",   cls: "trend-down" },
                { num: stats.progress, label: "In Progress",     icon: "🔵", bg: "rgba(59,130,246,0.08)", trend: "Being handled",  cls: "trend-neu" },
                { num: `${resolutionRate}%`, label: "Resolution Rate", icon: "✅", bg: "rgba(34,197,94,0.08)", trend: stats.resolved + " resolved", cls: "trend-up" },
              ].map((s, i) => (
                <div className="stat-card" key={i}>
                  <div className="stat-header">
                    <div className="stat-icon" style={{ background: s.bg }}>{s.icon}</div>
                    <span className={`stat-trend ${s.cls}`}>{s.trend}</span>
                  </div>
                  <div className="stat-num">{s.num}</div>
                  <div className="stat-label">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Map view */}
            {(activeView === "map" || activeView === "public") && (
              <div className="map-section">
                <div className="section-head">
                  <div className="section-title">
                    {activeView === "map" ? "Your Complaints — Map" : "Public Complaints Map"}
                  </div>
                </div>
                <div style={{ height: 500 }}>
                  <ComplaintMap complaints={complaints} />
                </div>
              </div>
            )}

            {/* Complaints view */}
            {(activeView === "complaints" || activeView === "admin") && (
              <div className="content-grid">
                {/* List */}
                <div className="section-card">
                  <div className="section-head">
                    <div className="section-title">
                      {role === "admin" ? "All Complaints" : "My Complaints"}
                    </div>
                    <span className="section-count">{filtered.length} shown</span>
                  </div>

                  {/* Filter chips */}
                  <div className="filter-bar">
                    {["all", "open", "under_review", "in_progress", "resolved", "rejected"].map(f => (
                      <button
                        key={f}
                        className={`filter-chip ${filter === f ? "active" : ""}`}
                        onClick={() => setFilter(f)}
                      >
                        {f === "all" ? "All" : STATUS_META[f]?.label}
                      </button>
                    ))}
                  </div>

                  <div className="complaint-list">
                    {loading ? (
                      <div className="empty-state">
                        <div style={{ fontSize: 28 }}>⏳</div>
                        <div className="empty-title">Loading...</div>
                      </div>
                    ) : filtered.length === 0 ? (
                      <div className="empty-state">
                        <div className="empty-icon">📭</div>
                        <div className="empty-title">No Complaints Found</div>
                        <div className="empty-sub">
                          {filter !== "all"
                            ? `No complaints with status "${STATUS_META[filter]?.label}"`
                            : "You haven't filed any complaints yet. Hit \"New Complaint\" to get started."}
                        </div>
                      </div>
                    ) : (
                      filtered.map((c, i) => {
                        const sm = STATUS_META[c.status] || STATUS_META.open;
                        return (
                          <div
                            key={c.id}
                            className={`complaint-item ${selected?.id === c.id ? "selected" : ""}`}
                            style={{ animationDelay: `${i * 0.04}s` }}
                            onClick={() => setSelected(c)}
                          >
                            <div className="complaint-cat-icon">
                              {CAT_ICONS[c.category] || "📌"}
                            </div>
                            <div className="complaint-body">
                              <div className="complaint-top">
                                <div className="complaint-cat">{c.category || "Uncategorised"}</div>
                                <span
                                  className="status-badge"
                                  style={{ background: sm.bg, color: sm.color }}
                                >
                                  {sm.icon} {sm.label}
                                </span>
                              </div>
                              <div className="complaint-desc">{c.description}</div>
                              <div className="complaint-meta">
                                <span>
                                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                                  </svg>
                                  {c.created_at ? timeAgo(c.created_at) : "—"}
                                </span>
                                {c.latitude && (
                                  <span>
                                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
                                    </svg>
                                    {parseFloat(c.latitude).toFixed(3)}, {parseFloat(c.longitude).toFixed(3)}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Detail panel */}
                <div className="detail-panel">
                  {!selected ? (
                    <div className="detail-empty">
                      <div className="detail-empty-icon">👆</div>
                      <p>Select a complaint from the list to view details and manage its status.</p>
                    </div>
                  ) : (
                    <>
                      <div className="detail-content">
                        <div className="detail-cat-row">
                          <div className="detail-cat-icon">
                            {CAT_ICONS[selected.category] || "📌"}
                          </div>
                          <div>
                            <div className="detail-cat-name">{selected.category}</div>
                            <span
                              className="status-badge"
                              style={{
                                background: STATUS_META[selected.status]?.bg,
                                color: STATUS_META[selected.status]?.color,
                                fontSize: 11,
                              }}
                            >
                              {STATUS_META[selected.status]?.icon} {STATUS_META[selected.status]?.label}
                            </span>
                          </div>
                        </div>

                        <div className="detail-desc">{selected.description}</div>

                        <div className="detail-row">
                          <span className="detail-row-label">Complaint ID</span>
                          <span className="detail-row-val">#CPE-{String(selected.id).padStart(4, "0")}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-row-label">Filed</span>
                          <span className="detail-row-val">{selected.created_at ? new Date(selected.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-row-label">Location</span>
                          <span className="detail-row-val">
                            {selected.latitude
                              ? `${parseFloat(selected.latitude).toFixed(4)}, ${parseFloat(selected.longitude).toFixed(4)}`
                              : "Not specified"}
                          </span>
                        </div>

                        {/* Status timeline */}
                        <div style={{ marginTop: 20, marginBottom: 8 }}>
                          <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--muted)", marginBottom: 12 }}>
                            Status Timeline
                          </div>
                          <div className="status-timeline">
                            {STATUS_FLOW.filter(s => s !== "rejected").map((s, i) => {
                              const currentIdx = STATUS_FLOW.indexOf(selected.status === "rejected" ? "rejected" : selected.status);
                              const isDone = i < currentIdx && selected.status !== "rejected";
                              const isCurrent = s === selected.status || (selected.status === "rejected" && s === STATUS_FLOW[currentIdx]);
                              const sm = STATUS_META[s];
                              return (
                                <div className="timeline-step" key={s}>
                                  <div className={`timeline-dot ${isDone ? "done" : isCurrent ? "current" : ""}`}>
                                    {isDone ? "✓" : isCurrent ? sm.icon : i + 1}
                                  </div>
                                  <div className="timeline-info">
                                    <div className={`timeline-label ${isDone ? "done" : isCurrent ? "current" : "future"}`}>
                                      {sm.label}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Admin controls */}
                      {role === "admin" && (
                        <div className="admin-controls">
                          <div className="admin-controls-title">Update Status</div>
                          <div className="status-buttons">
                            {STATUS_FLOW.map(s => (
                              <button
                                key={s}
                                className={`btn-status ${s === "resolved" ? "success" : s === "rejected" ? "danger" : ""}`}
                                onClick={() => updateStatus(selected.id, s)}
                                disabled={selected.status === s}
                                style={{ opacity: selected.status === s ? 0.4 : 1 }}
                              >
                                {STATUS_META[s].icon} {STATUS_META[s].label}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* ── New Complaint Modal ── */}
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
                    name="category"
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
                    name="description"
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

      {/* ── Toast ── */}
      {toast && (
        <div className={`toast ${toast.type}`}>
          <div className="toast-dot" />
          {toast.msg}
        </div>
      )}
    </>
  );
}