import { useState, useEffect } from "react";
import { fetchClients } from "../../services/api";
import StatusBadge from "../Shared/StatusBadge";

const RISK_ORDER = { high: 0, moderate: 1, low: 2 };

const RISK_META = {
  high: { color: "#ef4444", bg: "rgba(239,68,68,0.08)", border: "rgba(239,68,68,0.2)", label: "High", dot: "#ef4444" },
  moderate: { color: "#f59e0b", bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.2)", label: "Moderate", dot: "#f59e0b" },
  low: { color: "#10b981", bg: "rgba(16,185,129,0.08)", border: "rgba(16,185,129,0.2)", label: "Low", dot: "#10b981" },
};

const SENTIMENT_ICON = {
  improving: { icon: "↑", color: "#10b981" },
  "cautiously-improving": { icon: "↗", color: "#10b981" },
  "stable-positive": { icon: "→", color: "#10b981" },
  stable: { icon: "→", color: "#94a3b8" },
  "cautiously-stable": { icon: "→", color: "#f59e0b" },
  mixed: { icon: "~", color: "#f59e0b" },
  declining: { icon: "↓", color: "#ef4444" },
  concerning: { icon: "↓", color: "#ef4444" },
};

function SkeletonCard() {
  return (
    <div className="riq-card riq-skeleton-card">
      <div className="riq-skeleton" style={{ height: 18, width: "40%", marginBottom: 12 }} />
      <div className="riq-skeleton" style={{ height: 13, width: "70%", marginBottom: 8 }} />
      <div className="riq-skeleton" style={{ height: 13, width: "55%" }} />
    </div>
  );
}

export default function Dashboard({ onSelectClient, onDocumentSession, onAddClient }) {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredId, setHoveredId] = useState(null);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchClients().then(setClients).catch(console.error).finally(() => setLoading(false));
  }, []);

  const riskOrder = { high: 0, moderate: 1, low: 2 };
  const sorted = [...clients].sort((a, b) => (riskOrder[a.riskLevel] ?? 3) - (riskOrder[b.riskLevel] ?? 3));

  const stats = {
    total: clients.length,
    high: clients.filter((c) => c.riskLevel === "high").length,
    moderate: clients.filter((c) => c.riskLevel === "moderate").length,
    low: clients.filter((c) => c.riskLevel === "low").length,
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="shimmer h-8 w-48 mb-6" />
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map((i) => <div key={i} className="shimmer h-24 rounded-xl" />)}
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => <div key={i} className="shimmer h-32 rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-[1100px]">
      {/* Header */}
      <div className="mb-7">
        <h2 className="text-2xl font-semibold tracking-tight" style={{ color: "var(--clr-slate)" }}>
          Good morning, Dr. Rivera
        </h2>
        <p className="text-sm mt-1" style={{ color: "#9ca3af" }}>
          Here's your caseload overview for today
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total clients", val: stats.total, color: "var(--clr-primary)", bg: "var(--clr-primary-light)" },
          { label: "High risk", val: stats.high, color: "var(--clr-danger)", bg: "var(--clr-danger-light)" },
          { label: "Moderate", val: stats.moderate, color: "var(--clr-warning)", bg: "var(--clr-warning-light)" },
          { label: "Low risk", val: stats.low, color: "var(--clr-success)", bg: "var(--clr-success-light)" },
        ].map((s, i) => (
          <div key={i} className="rounded-xl p-4 border" style={{ background: "var(--clr-card)", borderColor: "var(--clr-border)" }}>
            <p className="text-[11px] uppercase tracking-wider font-medium mb-1" style={{ color: "#9ca3af" }}>{s.label}</p>
            <p className="text-3xl font-semibold" style={{ color: s.color }}>{s.val}</p>
          </div>
        ))}
      </div>

      {/* Client cards */}
      <div className="space-y-3">
        {sorted.map((client, idx) => (
          <div
            key={client.id}
            className="rounded-xl border p-5 transition-base cursor-pointer animate-fade-in"
            style={{
              background: "var(--clr-card)",
              borderColor: "var(--clr-border)",
              animationDelay: `${idx * 60}ms`,
              animationFillMode: "both",
            }}
            onClick={() => onSelectClient(client.id)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-base font-semibold" style={{ color: "var(--clr-slate)" }}>
                    {client.name}
                  </h3>
                  <StatusBadge status={client.riskLevel} />
                  <StatusBadge status={client.lastSessionSentiment} showIcon />
                </div>
                <div className="flex items-center gap-4 text-xs" style={{ color: "#9ca3af" }}>
                  <span>{client.age} yo</span>
                  <span>•</span>
                  <span>{client.diagnosis}</span>
                  <span>•</span>
                  <span>{client.programType}</span>
                  <span>•</span>
                  <span>Day {client.programDay}</span>
                  <span>•</span>
                  <span>{client.totalSessions} sessions</span>
                </div>
                {client.nextObjectiveAtRisk && (
                  <div className="mt-3 flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg"
                    style={{ background: "var(--clr-amber-light)", color: "var(--clr-warning)" }}>
                    <span>⚠</span>
                    <span className="font-medium">
                      {client.nextObjectiveAtRisk.status === "at-risk" ? "At risk" : "Plateau"}:
                    </span>
                    <span>{client.nextObjectiveAtRisk.description}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2 ml-4">
                <button
                  onClick={(e) => { e.stopPropagation(); onDocumentSession(client.id); }}
                  className="px-3 py-2 rounded-lg text-xs font-medium border transition-base"
                  style={{
                    borderColor: "var(--clr-primary)",
                    color: "var(--clr-primary)",
                    background: "transparent",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = "var(--clr-primary)";
                    e.target.style.color = "#fff";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = "transparent";
                    e.target.style.color = "var(--clr-primary)";
                  }}
                >
                  Document session
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onSelectClient(client.id); }}
                  className="px-3 py-2 rounded-lg text-xs font-medium text-white transition-base"
                  style={{ background: "var(--clr-primary)" }}
                  onMouseEnter={(e) => e.target.style.background = "var(--clr-primary-dark)"}
                  onMouseLeave={(e) => e.target.style.background = "var(--clr-primary)"}
                >
                  View details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}