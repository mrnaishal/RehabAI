import { useState, useEffect } from "react";
import { fetchClient, fetchBriefing, fetchOutcomes } from "../../services/api";
import LoadingState from "../Shared/LoadingState";

const TREND_CONFIG = {
  improving: { icon: "↑", color: "#10b981", label: "Improving" },
  "cautiously-improving": { icon: "↗", color: "#10b981", label: "Cautiously improving" },
  "stable-positive": { icon: "→", color: "#10b981", label: "Stable positive" },
  stable: { icon: "→", color: "#94a3b8", label: "Stable" },
  "cautiously-stable": { icon: "→", color: "#f59e0b", label: "Cautiously stable" },
  mixed: { icon: "~", color: "#f59e0b", label: "Mixed" },
  declining: { icon: "↓", color: "#ef4444", label: "Declining" },
  concerning: { icon: "↓", color: "#ef4444", label: "Concerning" },
  "on-track": { icon: "✓", color: "#10b981", label: "On track" },
  "in-progress": { icon: "◎", color: "#38bdf8", label: "In progress" },
  "at-risk": { icon: "⚠", color: "#ef4444", label: "At risk" },
  plateau: { icon: "▬", color: "#f59e0b", label: "Plateau" },
  "not-started": { icon: "○", color: "#475569", label: "Not started" },
  stalled: { icon: "⏸", color: "#f59e0b", label: "Stalled" },
  achieved: { icon: "✓", color: "#10b981", label: "Achieved" },
  effective: { icon: "✓", color: "#10b981", label: "Effective" },
  "partially-effective": { icon: "~", color: "#f59e0b", label: "Partially effective" },
  "limited-response": { icon: "↓", color: "#ef4444", label: "Limited response" },
  "too-early-to-assess": { icon: "–", color: "#475569", label: "Too early" },
};

function TrendBadge({ status }) {
  const cfg = TREND_CONFIG[status] || { icon: "–", color: "#475569", label: status };
  return (
    <span className="riq-cv-badge" style={{ "--bc": cfg.color }}>
      {cfg.icon} {cfg.label || status?.replace(/-/g, " ")}
    </span>
  );
}

function CollapsibleSession({ session }) {
  const [open, setOpen] = useState(false);
  const sentCfg = TREND_CONFIG[session.tags?.sessionSentiment] || { icon: "→", color: "#94a3b8" };
  const riskCount = session.tags?.riskIndicators?.length || 0;

  const dapData = session.dapNote?.data;
  const dapAssessment = session.dapNote?.assessment;
  const dapPlan = session.dapNote?.plan;

  const dataText = Array.isArray(dapData?.observations)
    ? dapData.observations.join(" ")
    : typeof dapData === "string" ? dapData : dapData ? String(dapData) : "";

  const assessmentText = typeof dapAssessment === "string"
    ? dapAssessment
    : dapAssessment?.clinicalSummary ?? "";

  const planItems = Array.isArray(dapPlan?.items)
    ? dapPlan.items
    : typeof dapPlan === "string"
    ? dapPlan.split(/\d+\.\s+/).filter(Boolean).map(t => ({ action: t.trim() }))
    : dapPlan ? [{ action: String(dapPlan) }] : [];

  const flags = (session.followUpFlags ?? []).map(f =>
    typeof f === "string"
      ? { flag: f, priority: f.startsWith("URGENT:") || f.startsWith("PRIORITY:") ? "urgent" : "routine" }
      : f
  );

  return (
    <div className={`riq-session-card ${open ? "open" : ""}`} style={{ "--sent-color": sentCfg.color }}>
      <button className="riq-session-card-header" onClick={() => setOpen(!open)}>
        <div className="riq-session-card-left">
          <div className="riq-session-dot" />
          <div>
            <div className="riq-session-num">Session {session.sessionNumber}</div>
            <div className="riq-session-date">{session.date}</div>
          </div>
        </div>
        <div className="riq-session-card-right">
          <TrendBadge status={session.tags?.sessionSentiment} />
          {riskCount > 0 && (
            <span className="riq-risk-flag-badge">{riskCount} risk flag{riskCount > 1 ? "s" : ""}</span>
          )}
          <span className="riq-chevron" style={{ transform: open ? "rotate(180deg)" : "none" }}>▾</span>
        </div>
      </button>

      {open && (
        <div className="riq-session-card-body">
          {/* Risk indicators */}
          {riskCount > 0 && (
            <div className="riq-session-risk-strip">
              <span style={{ color: "#ef4444", fontWeight: 700 }}>🔴 Risk indicators:</span>
              {session.tags.riskIndicators.map((r, i) => (
                <span key={i} className="riq-risk-text">
                  {typeof r === "string" ? r : r.indicator}
                </span>
              ))}
            </div>
          )}

          {/* DAP */}
          <div className="riq-dap-grid">
            {[
              { key: "D", label: "Data", text: dataText, color: "#38bdf8" },
              { key: "A", label: "Assessment", text: assessmentText, color: "#818cf8" },
            ].map(({ key, label, text, color }) => text && (
              <div key={key} className="riq-dap-block">
                <div className="riq-dap-block-label" style={{ color }}>{key} — {label}</div>
                <div className="riq-dap-block-text">{text}</div>
              </div>
            ))}
          </div>

          {planItems.length > 0 && (
            <div className="riq-dap-block">
              <div className="riq-dap-block-label" style={{ color: "#10b981" }}>P — Plan</div>
              <ol className="riq-plan-list">
                {planItems.map((item, i) => (
                  <li key={i}>{typeof item === "string" ? item : item.action}</li>
                ))}
              </ol>
            </div>
          )}

          {/* Tags row */}
          <div className="riq-session-tags">
            {session.tags?.moodIndicators?.length > 0 && (
              <div className="riq-session-tag-group">
                <span className="riq-stg-label">Mood</span>
                <div className="riq-stg-pills">
                  {(Array.isArray(session.tags.moodIndicators) ? session.tags.moodIndicators : [session.tags.moodIndicators]).map((m, i) => (
                    <span key={i} className="riq-pill" style={{ "--pc": "#818cf8", "--pbg": "rgba(129,140,248,0.1)" }}>{m}</span>
                  ))}
                </div>
              </div>
            )}
            {session.tags?.triggersIdentified?.length > 0 && (
              <div className="riq-session-tag-group">
                <span className="riq-stg-label">Triggers</span>
                <div className="riq-stg-pills">
                  {session.tags.triggersIdentified.map((t, i) => (
                    <span key={i} className="riq-pill" style={{ "--pc": "#f59e0b", "--pbg": "rgba(245,158,11,0.1)" }}>{t}</span>
                  ))}
                </div>
              </div>
            )}
            {session.tags?.copingStrategiesDiscussed?.length > 0 && (
              <div className="riq-session-tag-group">
                <span className="riq-stg-label">Coping</span>
                <div className="riq-stg-pills">
                  {(Array.isArray(session.tags.copingStrategiesDiscussed) ? session.tags.copingStrategiesDiscussed : [session.tags.copingStrategiesDiscussed]).map((c, i) => (
                    <span key={i} className="riq-pill" style={{ "--pc": "#10b981", "--pbg": "rgba(16,185,129,0.1)" }}>{c}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Key quotes */}
          {session.tags?.keyQuotes?.length > 0 && (
            <div className="riq-quotes">
              {session.tags.keyQuotes.map((q, i) => (
                <div key={i} className="riq-quote-block">
                  "{typeof q === "string" ? q : q.quote}"
                </div>
              ))}
            </div>
          )}

          {/* Flags */}
          {flags.length > 0 && (
            <div className="riq-flags-row">
              {flags.map((f, i) => {
                const urgent = f.priority === "urgent" || f.priority === "priority";
                return (
                  <div key={i} className={`riq-flag-chip ${urgent ? "urgent" : ""}`}>
                    {urgent ? "🔴" : "→"} {f.flag ?? f}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function ClientView({ clientId, onBack, onDocumentSession }) {
  const [client, setClient] = useState(null);
  const [tab, setTab] = useState("briefing");
  const [briefing, setBriefing] = useState(null);
  const [outcomes, setOutcomes] = useState(null);
  const [loadingBriefing, setLoadingBriefing] = useState(false);
  const [loadingOutcomes, setLoadingOutcomes] = useState(false);

  useEffect(() => {
    if (clientId) {
      fetchClient(clientId).then(setClient).catch(console.error);
    }
  }, [clientId]);

  function loadBriefing() {
    if (briefing) return;
    setLoadingBriefing(true);
    fetchBriefing(clientId)
      .then((data) => setBriefing(data.briefing))
      .catch(console.error)
      .finally(() => setLoadingBriefing(false));
  }

  function loadOutcomes() {
    if (outcomes) return;
    setLoadingOutcomes(true);
    fetchOutcomes(clientId)
      .then((data) => setOutcomes(data.outcomes))
      .catch(console.error)
      .finally(() => setLoadingOutcomes(false));
  }

  useEffect(() => {
    if (tab === "briefing" && clientId) loadBriefing();
    if (tab === "outcomes" && clientId) loadOutcomes();
  }, [tab, clientId]);

  if (!client) {
    return (
      <div className="p-8">
        <div className="shimmer h-8 w-48 mb-4" />
        <div className="shimmer h-64 rounded-xl" />
      </div>
    );
  }

  const tabs = [
    { id: "briefing", label: "Pre-session briefing" },
    { id: "timeline", label: "Session timeline" },
    { id: "outcomes", label: "Outcome insights" },
  ];

  return (
    <div className="p-8 max-w-[1100px]">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <button onClick={onBack} className="text-sm transition-base"
          style={{ color: "#9ca3af" }}
          onMouseEnter={(e) => e.target.style.color = "var(--clr-primary)"}
          onMouseLeave={(e) => e.target.style.color = "#9ca3af"}>
          ← Caseload
        </button>
      </div>

      {/* Client header card */}
      <div className="rounded-xl border p-5 mb-6"
        style={{ background: "var(--clr-card)", borderColor: "var(--clr-border)" }}>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-xl font-semibold" style={{ color: "var(--clr-slate)" }}>{client.name}</h2>
              <StatusBadge status={client.riskLevel} />
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs" style={{ color: "#9ca3af" }}>
              <span>{client.age} years old • {client.gender}</span>
              <span>{client.diagnosis}</span>
              {client.coOccurring && <span>Co-occurring: {client.coOccurring}</span>}
              <span>{client.programType} • Day {client.programDay}</span>
              {client.mat && <span>MAT: {client.mat}</span>}
            </div>
          </div>
          <button
            onClick={() => onDocumentSession(clientId)}
            className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-base"
            style={{ background: "var(--clr-primary)" }}>
            Document session
          </button>
        </div>

        {/* Treatment plan objectives */}
        <div className="mt-4 pt-4 border-t" style={{ borderColor: "var(--clr-border)" }}>
          <p className="text-[11px] font-medium uppercase tracking-wider mb-2" style={{ color: "#9ca3af" }}>
            Treatment plan objectives
          </p>
          <div className="grid grid-cols-2 gap-2">
            {client.treatmentPlan.objectives.map((obj) => (
              <div key={obj.id} className="flex items-center gap-2 text-xs">
                <StatusBadge status={obj.status} />
                <span style={{ color: "#4b5563" }}>{obj.description}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 mb-6 p-1 rounded-lg" style={{ background: "#f3f4f6" }}>
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className="flex-1 py-2 rounded-md text-sm font-medium transition-base"
            style={{
              background: tab === t.id ? "var(--clr-card)" : "transparent",
              color: tab === t.id ? "var(--clr-primary)" : "#9ca3af",
              boxShadow: tab === t.id ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
            }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === "briefing" && (
        <BriefingPanel briefing={briefing} loading={loadingBriefing} />
      )}
      {tab === "timeline" && (
        <TimelinePanel sessions={client.sessions} expandedSession={expandedSession}
          setExpandedSession={setExpandedSession} />
      )}
      {tab === "outcomes" && (
        <OutcomesPanel outcomes={outcomes} loading={loadingOutcomes} />
      )}
    </div>
  );
}

/* ==================== BRIEFING PANEL ==================== */
function BriefingPanel({ briefing, loading }) {
  if (loading) {
    return (
      <div className="rounded-xl border p-6" style={{ borderColor: "var(--clr-border)", background: "var(--clr-card)" }}>
        <LoadingState message="Claude is preparing the pre-session briefing..." lines={8} />
      </div>
    );
  }
  if (!briefing) return null;

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Snapshot */}
      <div className="rounded-xl border p-5" style={{ borderColor: "var(--clr-border)", background: "var(--clr-card)" }}>
        <h3 className="text-sm font-semibold mb-2" style={{ color: "var(--clr-slate)" }}>Client snapshot</h3>
        <p className="text-sm leading-relaxed" style={{ color: "#4b5563" }}>{briefing.clientSnapshot}</p>
      </div>

      {/* Trajectory */}
      <div className="rounded-xl border p-5" style={{ borderColor: "var(--clr-border)", background: "var(--clr-card)" }}>
        <h3 className="text-sm font-semibold mb-2" style={{ color: "var(--clr-slate)" }}>Recent trajectory</h3>
        <p className="text-sm leading-relaxed" style={{ color: "#4b5563" }}>{briefing.recentTrajectory}</p>
      </div>

      {/* Pattern Alerts */}
      {briefing.patternAlerts?.length > 0 && (
        <div className="rounded-xl border p-5" style={{ borderColor: "var(--clr-border)", background: "var(--clr-card)" }}>
          <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--clr-slate)" }}>Pattern alerts</h3>
          <div className="space-y-3">
            {briefing.patternAlerts.map((alert, i) => (
              <div key={i} className="rounded-lg p-3 border-l-3"
                style={{
                  background: alert.type === "concern" ? "var(--clr-danger-light)"
                    : alert.type === "positive" ? "var(--clr-success-light)" : "#f9fafb",
                  borderLeftColor: alert.type === "concern" ? "var(--clr-danger)"
                    : alert.type === "positive" ? "var(--clr-success)" : "var(--clr-primary)",
                  borderLeftWidth: "3px",
                }}>
                <p className="text-sm font-medium mb-1" style={{
                  color: alert.type === "concern" ? "var(--clr-danger)"
                    : alert.type === "positive" ? "var(--clr-success)" : "var(--clr-slate)",
                }}>
                  {alert.type === "concern" ? "⚠ " : alert.type === "positive" ? "✓ " : ""}
                  {alert.pattern}
                </p>
                <p className="text-xs" style={{ color: "#6b7280" }}>{alert.clinicalImplication}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Treatment Plan Progress */}
      {briefing.treatmentPlanProgress?.length > 0 && (
        <div className="rounded-xl border p-5" style={{ borderColor: "var(--clr-border)", background: "var(--clr-card)" }}>
          <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--clr-slate)" }}>Treatment plan progress</h3>
          <div className="space-y-3">
            {briefing.treatmentPlanProgress.map((obj, i) => (
              <div key={i} className="flex items-start gap-3">
                <StatusBadge status={obj.status} />
                <div>
                  <p className="text-sm font-medium" style={{ color: "var(--clr-slate)" }}>{obj.objective}</p>
                  <p className="text-xs mt-0.5" style={{ color: "#6b7280" }}>{obj.evidence}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Suggested Focus */}
      {briefing.suggestedFocus?.length > 0 && (
        <div className="rounded-xl border-2 p-5" style={{ borderColor: "var(--clr-primary)", background: "var(--clr-primary-light)" }}>
          <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--clr-primary-dark)" }}>
            Suggested session focus
          </h3>
          <ul className="space-y-2">
            {briefing.suggestedFocus.map((item, i) => (
              <li key={i} className="text-sm flex items-start gap-2" style={{ color: "var(--clr-primary-dark)" }}>
                <span className="mt-0.5">→</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Strengths */}
      {briefing.strengthsToReinforce?.length > 0 && (
        <div className="rounded-xl border p-5" style={{ borderColor: "var(--clr-border)", background: "var(--clr-success-light)" }}>
          <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--clr-success)" }}>
            Strengths to reinforce
          </h3>
          {briefing.strengthsToReinforce.map((s, i) => (
            <p key={i} className="text-sm mb-1 last:mb-0" style={{ color: "#065f46" }}>✓ {s}</p>
          ))}
        </div>
      )}
    </div>
  );
}

/* ==================== TIMELINE PANEL ==================== */
function TimelinePanel({ sessions, expandedSession, setExpandedSession }) {
  const reversed = [...sessions].reverse();

  return (
    <div className="space-y-3 animate-fade-in">
      {reversed.map((session) => {
        const expanded = expandedSession === session.id;
        const sentimentColor = {
          improving: "var(--clr-success)",
          "cautiously-improving": "var(--clr-warning)",
          stable: "#9ca3af",
          "stable-positive": "var(--clr-success)",
          declining: "var(--clr-danger)",
          concerning: "var(--clr-danger)",
          mixed: "var(--clr-warning)",
          "cautiously-stable": "var(--clr-warning)",
        }[session.tags.sessionSentiment] || "#9ca3af";

        return (
          <div key={session.id} className="rounded-xl border transition-base"
            style={{ borderColor: expanded ? "var(--clr-primary)" : "var(--clr-border)", background: "var(--clr-card)" }}>
            {/* Header - always visible */}
            <button
              onClick={() => setExpandedSession(expanded ? null : session.id)}
              className="w-full p-4 flex items-center justify-between text-left">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: sentimentColor }} />
                <div>
                  <span className="text-sm font-semibold" style={{ color: "var(--clr-slate)" }}>
                    Session {session.sessionNumber}
                  </span>
                  <span className="text-xs ml-3" style={{ color: "#9ca3af" }}>{session.date}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={session.tags.sessionSentiment} showIcon />
                {session.tags.riskIndicators?.length > 0 && (
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                    style={{ background: "var(--clr-danger-light)", color: "var(--clr-danger)" }}>
                    {session.tags.riskIndicators.length} risk flag{session.tags.riskIndicators.length > 1 ? "s" : ""}
                  </span>
                )}
                <span className="text-xs" style={{ color: "#9ca3af" }}>{expanded ? "▲" : "▼"}</span>
              </div>
            </button>

            {/* Expanded content */}
            {expanded && (
              <div className="px-4 pb-4 border-t animate-fade-in" style={{ borderColor: "var(--clr-border)" }}>
                {/* DAP Note */}
                <div className="mt-4 space-y-3">
                  {["data", "assessment", "plan"].map((key) => (
                    <div key={key}>
                      <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "var(--clr-primary)" }}>
                        {key}
                      </span>
                      <p className="text-sm leading-relaxed mt-0.5" style={{ color: "#4b5563" }}>
                        {session.dapNote[key]}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Tags grid */}
                <div className="mt-4 pt-4 border-t grid grid-cols-2 gap-3 text-xs" style={{ borderColor: "var(--clr-border)" }}>
                  <div>
                    <span className="font-medium" style={{ color: "#9ca3af" }}>Mood: </span>
                    <span style={{ color: "#4b5563" }}>{session.tags.moodIndicators.join(", ")}</span>
                  </div>
                  {session.tags.triggersIdentified?.length > 0 && (
                    <div>
                      <span className="font-medium" style={{ color: "#9ca3af" }}>Triggers: </span>
                      <span style={{ color: "#4b5563" }}>{session.tags.triggersIdentified.join(", ")}</span>
                    </div>
                  )}
                  <div>
                    <span className="font-medium" style={{ color: "#9ca3af" }}>Coping: </span>
                    <span style={{ color: "#4b5563" }}>{session.tags.copingStrategiesDiscussed.join(", ")}</span>
                  </div>
                  <div>
                    <span className="font-medium" style={{ color: "#9ca3af" }}>Support: </span>
                    <span style={{ color: "#4b5563" }}>{session.tags.supportNetworkChanges}</span>
                  </div>
                </div>

                {/* Risk indicators */}
                {session.tags.riskIndicators?.length > 0 && (
                  <div className="mt-3 rounded-lg p-3" style={{ background: "var(--clr-danger-light)" }}>
                    <p className="text-xs font-semibold mb-1" style={{ color: "var(--clr-danger)" }}>Risk indicators:</p>
                    {session.tags.riskIndicators.map((r, i) => (
                      <p key={i} className="text-xs" style={{ color: "var(--clr-danger)" }}>• {r}</p>
                    ))}
                  </div>
                )}

                {/* Key quotes */}
                {session.tags.keyQuotes?.length > 0 && (
                  <div className="mt-3">
                    {session.tags.keyQuotes.map((q, i) => (
                      <blockquote key={i} className="text-xs italic border-l-2 pl-3 py-1 mb-1"
                        style={{ borderColor: "var(--clr-primary)", color: "#6b7280" }}>
                        "{q}"
                      </blockquote>
                    ))}
                  </div>
                )}

                {/* Follow-ups */}
                <div className="mt-3 pt-3 border-t" style={{ borderColor: "var(--clr-border)" }}>
                  <p className="text-[11px] font-medium uppercase tracking-wider mb-1.5" style={{ color: "#9ca3af" }}>
                    Follow-up flags
                  </p>
                  {session.followUpFlags.map((f, i) => {
                    const urgent = f.startsWith("PRIORITY:") || f.startsWith("URGENT:");
                    return (
                      <p key={i} className="text-xs mb-1" style={{
                        color: urgent ? "var(--clr-danger)" : "#4b5563",
                        fontWeight: urgent ? 600 : 400,
                      }}>
                        {urgent ? "🔴 " : "→ "}{f}
                      </p>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ==================== OUTCOMES PANEL ==================== */
function OutcomesPanel({ outcomes, loading }) {
  if (loading) {
    return (
      <div className="rounded-xl border p-6" style={{ borderColor: "var(--clr-border)", background: "var(--clr-card)" }}>
        <LoadingState message="Claude is analyzing clinical outcomes and intervention effectiveness..." lines={10} />
      </div>
    );
  }
  if (!outcomes) return null;

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Intervention Effectiveness */}
      {outcomes.interventionEffectiveness?.length > 0 && (
        <div className="rounded-xl border p-5" style={{ borderColor: "var(--clr-border)", background: "var(--clr-card)" }}>
          <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--clr-slate)" }}>
            Intervention effectiveness
          </h3>
          <div className="space-y-4">
            {outcomes.interventionEffectiveness.map((intv, i) => (
              <div key={i} className="rounded-lg border p-4" style={{ borderColor: "var(--clr-border)" }}>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-semibold" style={{ color: "var(--clr-slate)" }}>
                    {intv.intervention}
                  </h4>
                  <StatusBadge status={intv.effectiveness} />
                </div>
                <p className="text-xs mb-2" style={{ color: "#6b7280" }}>
                  Used in sessions: {intv.sessionsUsed?.join(", ")}
                </p>
                <p className="text-xs mb-2" style={{ color: "#4b5563" }}>
                  {intv.progressIndicators}
                </p>
                <div className="rounded-md p-2 text-xs" style={{ background: "#f9fafb", color: "var(--clr-primary-dark)" }}>
                  <span className="font-medium">Recommendation:</span> {intv.recommendation}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Outcome Trends */}
      {outcomes.outcomeTrends && (
        <div className="rounded-xl border p-5" style={{ borderColor: "var(--clr-border)", background: "var(--clr-card)" }}>
          <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--clr-slate)" }}>
            Outcome trends
          </h3>
          <div className="space-y-4">
            {Object.entries(outcomes.outcomeTrends).map(([key, val]) => (
              <div key={key}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold capitalize" style={{ color: "var(--clr-slate)" }}>
                    {key.replace(/([A-Z])/g, " $1").trim()}
                  </span>
                  <StatusBadge status={val.trend} showIcon />
                </div>
                <p className="text-xs leading-relaxed" style={{ color: "#6b7280" }}>
                  {val.evidence || val.summary}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Evidence-Based Recommendations */}
      {outcomes.evidenceBasedRecommendations?.length > 0 && (
        <div className="rounded-xl border-2 p-5" style={{ borderColor: "var(--clr-primary)", background: "var(--clr-primary-light)" }}>
          <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--clr-primary-dark)" }}>
            Evidence-based recommendations
          </h3>
          <div className="space-y-3">
            {outcomes.evidenceBasedRecommendations.map((rec, i) => (
              <div key={i} className="rounded-lg p-3" style={{ background: "rgba(255,255,255,0.6)" }}>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs font-medium" style={{ color: "var(--clr-slate)" }}>{rec.observation}</p>
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                    style={{
                      background: rec.priority === "high" ? "var(--clr-danger-light)" : rec.priority === "medium" ? "var(--clr-amber-light)" : "#f3f4f6",
                      color: rec.priority === "high" ? "var(--clr-danger)" : rec.priority === "medium" ? "var(--clr-warning)" : "#9ca3af",
                    }}>
                    {rec.priority} priority
                  </span>
                </div>
                <p className="text-xs mb-1" style={{ color: "var(--clr-primary-dark)" }}>
                  → {rec.recommendation}
                </p>
                <p className="text-[11px] italic" style={{ color: "#6b7280" }}>
                  Basis: {rec.clinicalBasis}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Supervision Talking Points */}
      {outcomes.supervisionTalkingPoints?.length > 0 && (
        <div className="rounded-xl border p-5" style={{ borderColor: "var(--clr-border)", background: "var(--clr-card)" }}>
          <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--clr-slate)" }}>
            Supervision talking points
          </h3>
          {outcomes.supervisionTalkingPoints.map((point, i) => (
            <p key={i} className="text-sm mb-2 last:mb-0 flex items-start gap-2" style={{ color: "#4b5563" }}>
              <span style={{ color: "var(--clr-primary)" }}>•</span>
              {point}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
