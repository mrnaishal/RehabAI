import { useState, useEffect } from "react";
import { fetchClients, fetchClient, documentSession } from "../../services/api";
import StatusBadge from "../Shared/StatusBadge";

const DEMO_NOTES = {
  "client-001": `Marcus came in agitated today. Said his boss gave him a written warning on Friday. Couldn't sleep all weekend. He went to the bar parking lot on Saturday night but says he didn't go in — called his sponsor after and talked for 30 minutes. Only went to 1 meeting this week. He's angry — at his boss, at himself. We talked about how anger is a trigger for him. Did a safety check — no SI, but he said 'what's the point of all this if I'm gonna lose my job anyway.' We rebuilt his crisis plan and updated his trigger list.`,
  "client-002": `Sarah is having a good week. Hit 60 days at work — she's proud. Anxiety is less frequent, maybe 2-3 times a week instead of daily. Weekly calls with Rachel are happening. She brought up wanting to go back to community college in the fall for graphic design. NA attendance steady at 2x/week. She's made a friend in the women's group named Kesha. Suboxone still 100%. No cravings.`,
};

function Accordion({ title, icon, children, defaultOpen = false, accentColor = "#38bdf8", badge = null }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={`riq-accordion ${open ? "open" : ""}`} style={{ "--accent": accentColor }}>
      <button className="riq-accordion-header" onClick={() => setOpen(!open)}>
        <span className="riq-accordion-icon">{icon}</span>
        <span className="riq-accordion-title">{title}</span>
        {badge && <span className="riq-accordion-badge">{badge}</span>}
        <span className="riq-accordion-chevron" style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}>
          ▾
        </span>
      </button>
      {open && <div className="riq-accordion-body">{children}</div>}
    </div>
  );
}

function TagPill({ label, color, bg }) {
  return (
    <span className="riq-tag-pill" style={{ "--pill-color": color, "--pill-bg": bg }}>
      {label}
    </span>
  );
}

export default function SessionDoc({ clientId, onBack, onViewClient }) {
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [activeClientId, setActiveClientId] = useState(clientId);
  const [rawNotes, setRawNotes] = useState("");
  const [charCount, setCharCount] = useState(0);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [step, setStep] = useState(1); // 1=input, 2=result

  useEffect(() => {
    fetchClients().then(setClients).catch(console.error);
  }, []);

  useEffect(() => {
    if (activeClientId) {
      fetchClient(activeClientId).then(setSelectedClient).catch(console.error);
      const demo = DEMO_NOTES[activeClientId] || "";
      setRawNotes(demo);
      setCharCount(demo.length);
      setResult(null);
      setError(null);
      setStep(1);
    }
  }, [activeClientId]);

  async function handleSubmit() {
    if (!activeClientId || !rawNotes.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const session = await documentSession(activeClientId, rawNotes, selectedClient ? selectedClient.sessions.length + 1 : 1);
      setResult(session);
      setStep(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const riskColor = { high: "#ef4444", moderate: "#f59e0b", low: "#10b981" };
  const clientRisk = selectedClient ? riskColor[selectedClient.riskLevel] || "#38bdf8" : "#38bdf8";

  return (
    <div className="riq-session">
      <style>{`
        .riq-session {
          min-height: 100vh;
          background: #0a0e1a;
          color: #e2e8f0;
          font-family: 'Sora', 'DM Sans', sans-serif;
          padding: 40px 48px;
          max-width: 1200px;
        }

        /* Header */
        .riq-session-header {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 32px;
        }
        .riq-back-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          border-radius: 10px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.07);
          color: #64748b;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s ease;
          font-family: inherit;
        }
        .riq-back-btn:hover {
          background: rgba(255,255,255,0.07);
          color: #94a3b8;
        }
        .riq-session-title {
          font-size: 24px;
          font-weight: 800;
          color: #f1f5f9;
          letter-spacing: -0.5px;
        }
        .riq-session-title span {
          background: linear-gradient(135deg, #38bdf8, #818cf8);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        /* Steps indicator */
        .riq-steps {
          display: flex;
          align-items: center;
          gap: 0;
          margin-bottom: 32px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 14px;
          padding: 16px 24px;
        }
        .riq-step {
          display: flex;
          align-items: center;
          gap: 10px;
          flex: 1;
        }
        .riq-step-num {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 700;
          background: rgba(255,255,255,0.06);
          color: #475569;
          transition: all 0.3s ease;
          flex-shrink: 0;
        }
        .riq-step.active .riq-step-num {
          background: linear-gradient(135deg, #0ea5e9, #6366f1);
          color: #fff;
          box-shadow: 0 0 16px rgba(14,165,233,0.3);
        }
        .riq-step.done .riq-step-num {
          background: rgba(16,185,129,0.2);
          color: #10b981;
        }
        .riq-step-label {
          font-size: 12px;
          font-weight: 500;
          color: #334155;
        }
        .riq-step.active .riq-step-label { color: #94a3b8; }
        .riq-step.done .riq-step-label { color: #10b981; }
        .riq-step-divider {
          height: 1px;
          flex: 0.4;
          background: rgba(255,255,255,0.06);
          margin: 0 16px;
        }

        /* Layout grid */
        .riq-session-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        /* Panel */
        .riq-panel {
          background: rgba(255,255,255,0.025);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 18px;
          overflow: hidden;
        }
        .riq-panel-header {
          padding: 16px 20px;
          border-bottom: 1px solid rgba(255,255,255,0.04);
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .riq-panel-icon {
          width: 28px;
          height: 28px;
          border-radius: 8px;
          background: rgba(14,165,233,0.12);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
        }
        .riq-panel-title {
          font-size: 13px;
          font-weight: 700;
          color: #94a3b8;
          letter-spacing: 0.2px;
        }
        .riq-panel-body {
          padding: 20px;
        }

        /* Client selector */
        .riq-select-label {
          font-size: 10px;
          font-weight: 600;
          color: #334155;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 6px;
          display: block;
        }
        .riq-select {
          width: 100%;
          padding: 10px 14px;
          border-radius: 10px;
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.04);
          color: #94a3b8;
          font-size: 13px;
          font-family: inherit;
          outline: none;
          transition: all 0.15s ease;
          cursor: pointer;
          margin-bottom: 16px;
        }
        .riq-select:focus {
          border-color: rgba(56,189,248,0.3);
          background: rgba(56,189,248,0.05);
        }
        .riq-select option { background: #0f172a; }

        /* Client context card */
        .riq-client-ctx {
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.06);
          background: rgba(255,255,255,0.02);
          overflow: hidden;
          margin-bottom: 16px;
          animation: fadeSlide 0.25s ease;
        }
        .riq-client-ctx-header {
          padding: 12px 16px;
          border-bottom: 1px solid rgba(255,255,255,0.04);
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .riq-client-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: var(--client-color, #38bdf8);
          opacity: 0.15;
          position: absolute;
          inset: 0;
          border-radius: 50%;
        }
        .riq-client-initials {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: rgba(var(--client-rgb, "56,189,248"), 0.15);
          border: 1px solid rgba(var(--client-rgb, "56,189,248"), 0.25);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 700;
          color: var(--client-color, #38bdf8);
          flex-shrink: 0;
        }
        .riq-client-ctx-name {
          font-size: 14px;
          font-weight: 700;
          color: #f1f5f9;
          flex: 1;
        }
        .riq-client-ctx-body {
          padding: 12px 16px;
        }
        .riq-client-detail-row {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin-bottom: 10px;
        }
        .riq-detail-chip {
          font-size: 11px;
          padding: 3px 10px;
          border-radius: 6px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.06);
          color: #64748b;
        }
        .riq-objective-row {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 6px;
        }
        .riq-obj-status {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          flex-shrink: 0;
        }
        .riq-obj-text {
          font-size: 11px;
          color: #475569;
        }

        /* Textarea */
        .riq-textarea-wrap {
          position: relative;
        }
        .riq-textarea {
          width: 100%;
          padding: 14px 16px;
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.03);
          color: #cbd5e1;
          font-size: 13px;
          font-family: 'DM Sans', inherit;
          line-height: 1.7;
          resize: none;
          outline: none;
          transition: all 0.15s ease;
        }
        .riq-textarea:focus {
          border-color: rgba(56,189,248,0.3);
          background: rgba(56,189,248,0.03);
        }
        .riq-textarea::placeholder { color: #334155; }
        .riq-char-count {
          position: absolute;
          bottom: 10px;
          right: 12px;
          font-size: 11px;
          color: #334155;
        }

        /* Submit button */
        .riq-submit-btn {
          width: 100%;
          margin-top: 14px;
          padding: 13px;
          border-radius: 12px;
          border: none;
          cursor: pointer;
          font-family: inherit;
          font-size: 14px;
          font-weight: 700;
          letter-spacing: 0.2px;
          transition: all 0.2s ease;
          position: relative;
          overflow: hidden;
        }
        .riq-submit-btn:not(:disabled) {
          background: linear-gradient(135deg, #0ea5e9, #6366f1);
          color: #fff;
          box-shadow: 0 4px 20px rgba(14,165,233,0.3);
        }
        .riq-submit-btn:not(:disabled):hover {
          box-shadow: 0 6px 30px rgba(14,165,233,0.45);
          transform: translateY(-1px);
        }
        .riq-submit-btn:disabled {
          background: rgba(255,255,255,0.05);
          color: #334155;
          cursor: not-allowed;
        }
        .riq-submit-shimmer {
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
          animation: shimmerBtn 1.8s infinite;
        }
        @keyframes shimmerBtn {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        /* Loading */
        .riq-loading-panel {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 40px;
          text-align: center;
          gap: 16px;
        }
        .riq-spinner-ring {
          width: 52px;
          height: 52px;
          border-radius: 50%;
          border: 3px solid rgba(255,255,255,0.06);
          border-top-color: #38bdf8;
          animation: spin 0.9s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .riq-loading-text {
          font-size: 14px;
          font-weight: 600;
          color: #475569;
        }
        .riq-loading-sub {
          font-size: 12px;
          color: #334155;
        }
        .riq-loading-dots {
          display: flex;
          gap: 6px;
        }
        .riq-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #38bdf8;
          animation: dotBounce 1.4s ease-in-out infinite;
        }
        .riq-dot:nth-child(2) { animation-delay: 0.2s; }
        .riq-dot:nth-child(3) { animation-delay: 0.4s; }
        @keyframes dotBounce {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }

        /* Empty state */
        .riq-empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 32px;
          text-align: center;
          gap: 12px;
        }
        .riq-empty-ring {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          border: 2px dashed rgba(255,255,255,0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
        }
        .riq-empty-title {
          font-size: 15px;
          font-weight: 600;
          color: #334155;
        }
        .riq-empty-sub {
          font-size: 12px;
          color: #1e293b;
          max-width: 240px;
          line-height: 1.6;
        }

        /* Result output */
        .riq-result {
          animation: fadeSlide 0.3s ease;
        }
        .riq-draft-banner {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          border-radius: 10px;
          background: rgba(245,158,11,0.08);
          border: 1px solid rgba(245,158,11,0.15);
          font-size: 12px;
          color: #f59e0b;
          margin-bottom: 14px;
          font-weight: 500;
        }

        /* Accordion */
        .riq-accordion {
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.06);
          background: rgba(255,255,255,0.02);
          overflow: hidden;
          margin-bottom: 10px;
          transition: border-color 0.2s ease;
        }
        .riq-accordion.open {
          border-color: rgba(var(--accent-rgb, "56,189,248"), 0.2);
        }
        .riq-accordion-header {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 13px 16px;
          background: transparent;
          border: none;
          cursor: pointer;
          text-align: left;
          font-family: inherit;
          transition: background 0.15s ease;
        }
        .riq-accordion-header:hover {
          background: rgba(255,255,255,0.02);
        }
        .riq-accordion-icon {
          font-size: 14px;
          width: 24px;
          text-align: center;
          flex-shrink: 0;
        }
        .riq-accordion-title {
          font-size: 13px;
          font-weight: 700;
          color: #94a3b8;
          flex: 1;
        }
        .riq-accordion-badge {
          font-size: 10px;
          padding: 2px 8px;
          border-radius: 100px;
          background: rgba(56,189,248,0.1);
          border: 1px solid rgba(56,189,248,0.2);
          color: #38bdf8;
          font-weight: 600;
        }
        .riq-accordion-chevron {
          font-size: 12px;
          color: #334155;
          transition: transform 0.2s ease;
          flex-shrink: 0;
        }
        .riq-accordion-body {
          padding: 0 16px 16px;
          border-top: 1px solid rgba(255,255,255,0.04);
          animation: fadeSlide 0.2s ease;
        }

        /* DAP Note sections */
        .riq-dap-section {
          margin-top: 14px;
        }
        .riq-dap-label {
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #38bdf8;
          margin-bottom: 6px;
        }
        .riq-dap-text {
          font-size: 13px;
          color: #94a3b8;
          line-height: 1.7;
        }
        .riq-dap-divider {
          height: 1px;
          background: rgba(255,255,255,0.04);
          margin: 12px 0;
        }

        /* Tags */
        .riq-tags-grid {
          display: flex;
          flex-direction: column;
          gap: 10px;
          padding-top: 14px;
        }
        .riq-tag-row {
          display: flex;
          align-items: flex-start;
          gap: 10px;
        }
        .riq-tag-row-label {
          font-size: 10px;
          font-weight: 600;
          color: #334155;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          min-width: 70px;
          padding-top: 4px;
          flex-shrink: 0;
        }
        .riq-tag-pills {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }
        .riq-tag-pill {
          font-size: 11px;
          font-weight: 500;
          padding: 3px 10px;
          border-radius: 100px;
          background: var(--pill-bg, rgba(56,189,248,0.1));
          color: var(--pill-color, #38bdf8);
          border: 1px solid transparent;
        }

        /* Risk panel */
        .riq-risk-panel {
          border-radius: 12px;
          padding: 14px 16px;
          background: rgba(239,68,68,0.06);
          border: 1px solid rgba(239,68,68,0.2);
          margin-bottom: 10px;
          animation: fadeSlide 0.2s ease;
        }
        .riq-risk-header {
          font-size: 12px;
          font-weight: 700;
          color: #ef4444;
          margin-bottom: 8px;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .riq-risk-item {
          font-size: 12px;
          color: #fca5a5;
          display: flex;
          gap: 8px;
          margin-bottom: 4px;
          line-height: 1.5;
        }

        /* Flags */
        .riq-flag-item {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 10px 0;
          border-bottom: 1px solid rgba(255,255,255,0.04);
        }
        .riq-flag-item:last-child { border-bottom: none; }
        .riq-flag-icon {
          font-size: 12px;
          flex-shrink: 0;
          margin-top: 1px;
        }
        .riq-flag-text {
          font-size: 12px;
          color: #94a3b8;
          line-height: 1.5;
        }
        .riq-flag-text.urgent {
          color: #ef4444;
          font-weight: 600;
        }

        /* Quotes */
        .riq-quote {
          border-left: 2px solid rgba(56,189,248,0.3);
          padding: 8px 14px;
          margin-bottom: 8px;
          font-size: 12px;
          font-style: italic;
          color: #64748b;
          line-height: 1.6;
        }
        .riq-quote:last-child { margin-bottom: 0; }

        /* Action row */
        .riq-result-actions {
          display: flex;
          gap: 10px;
          margin-top: 16px;
        }
        .riq-action-btn {
          flex: 1;
          padding: 11px;
          border-radius: 10px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          font-family: inherit;
          transition: all 0.15s ease;
          border: none;
        }
        .riq-action-btn.outline {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          color: #64748b;
        }
        .riq-action-btn.outline:hover {
          background: rgba(255,255,255,0.07);
          color: #94a3b8;
        }
        .riq-action-btn.filled {
          background: linear-gradient(135deg, #0ea5e9, #6366f1);
          color: #fff;
          box-shadow: 0 2px 12px rgba(14,165,233,0.25);
        }
        .riq-action-btn.filled:hover {
          box-shadow: 0 4px 20px rgba(14,165,233,0.4);
          transform: translateY(-1px);
        }

        /* Error */
        .riq-error {
          padding: 16px;
          border-radius: 12px;
          background: rgba(239,68,68,0.07);
          border: 1px solid rgba(239,68,68,0.2);
          font-size: 13px;
          color: #f87171;
          animation: fadeSlide 0.2s ease;
        }

        @keyframes fadeSlide {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack} className="text-sm flex items-center gap-1 transition-base"
          style={{ color: "#9ca3af" }}
          onMouseEnter={(e) => e.target.style.color = "var(--clr-primary)"}
          onMouseLeave={(e) => e.target.style.color = "#9ca3af"}>
          ← Back
        </button>
        <h2 className="text-xl font-semibold" style={{ color: "var(--clr-slate)" }}>
          Document session
        </h2>
      </div>

      {/* Main grid */}
      <div className="riq-session-grid">
        {/* Left: Input */}
        <div>
          {/* Client selector */}
          <label className="block text-xs font-medium mb-2 uppercase tracking-wider" style={{ color: "#9ca3af" }}>
            Client
          </label>
          <select
            value={activeClientId || ""}
            onChange={(e) => setActiveClientId(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg border text-sm mb-4 outline-none"
            style={{
              borderColor: "var(--clr-border)",
              background: "var(--clr-card)",
              color: "var(--clr-slate)",
            }}
          >
            <option value="">Select client...</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} — Day {c.programDay}
              </option>
            ))}
          </select>

          {/* Client context card */}
          {selectedClient && (
            <div className="rounded-lg border p-4 mb-4 text-xs animate-fade-in"
              style={{ borderColor: "var(--clr-border)", background: "var(--clr-card)" }}>
              <div className="flex items-center gap-2 mb-2">
                <span className="font-semibold text-sm" style={{ color: "var(--clr-slate)" }}>
                  {selectedClient.name}
                </span>
                <StatusBadge status={selectedClient.riskLevel} />
              </div>
              <div className="space-y-1" style={{ color: "#9ca3af" }}>
                <p>{selectedClient.diagnosis}</p>
                <p>{selectedClient.programType} • Day {selectedClient.programDay}</p>
                {selectedClient.coOccurring && <p>Co-occurring: {selectedClient.coOccurring}</p>}
                {selectedClient.mat && <p>MAT: {selectedClient.mat}</p>}
              </div>
              <div className="mt-3 pt-3 border-t" style={{ borderColor: "var(--clr-border)" }}>
                <p className="font-medium mb-1" style={{ color: "var(--clr-slate)" }}>Active objectives:</p>
                {selectedClient.treatmentPlan.objectives.map((obj) => (
                  <div key={obj.id} className="flex items-center gap-2 mt-1">
                    <StatusBadge status={obj.status} />
                    <span>{obj.description}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes input */}
          <label className="block text-xs font-medium mb-2 uppercase tracking-wider" style={{ color: "#9ca3af" }}>
            Session notes (raw)
          </label>
          <textarea
            value={rawNotes}
            onChange={(e) => setRawNotes(e.target.value)}
            placeholder="Type or paste your rough session notes here..."
            rows={12}
            className="w-full px-4 py-3 rounded-lg border text-sm outline-none resize-none leading-relaxed"
            style={{
              borderColor: "var(--clr-border)",
              background: "var(--clr-card)",
              color: "var(--clr-slate)",
            }}
            onFocus={(e) => e.target.style.borderColor = "var(--clr-primary)"}
            onBlur={(e) => e.target.style.borderColor = "var(--clr-border)"}
          />

          <button
            onClick={handleSubmit}
            disabled={loading || !rawNotes.trim() || !activeClientId}
            className="mt-4 w-full py-3 rounded-lg text-sm font-medium text-white transition-base"
            style={{
              background: loading ? "#9ca3af" : "var(--clr-primary)",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: (!rawNotes.trim() || !activeClientId) ? 0.5 : 1,
            }}
          >
            {loading ? "Generating documentation..." : "Generate clinical documentation"}
          </button>
        </div>

        {/* Right: Output */}
        <div>
          {loading && (
            <div className="rounded-xl border p-6" style={{ borderColor: "var(--clr-border)", background: "var(--clr-card)" }}>
              <LoadingState message="Claude is generating clinical documentation..." lines={6} />
            </div>
          )}

          {error && (
            <div className="rounded-xl border p-5 animate-fade-in" style={{ background: "var(--clr-danger-light)", borderColor: "var(--clr-danger)" }}>
              <p className="text-sm font-medium" style={{ color: "var(--clr-danger)" }}>Error: {error}</p>
            </div>
          )}

          {result && !loading && (
            <div className="space-y-4 animate-fade-in">
              {/* Draft watermark */}
              <div className="rounded-lg px-3 py-2 text-xs font-medium flex items-center gap-2"
                style={{ background: "var(--clr-amber-light)", color: "var(--clr-warning)" }}>
                <span>⚠</span> Draft — counselor review required before finalizing
              </div>

              {/* Risk flags — shown first if present */}
              {result.tags?.riskIndicators?.length > 0 && (
                <div className="riq-risk-panel">
                  <div className="riq-risk-header">🔴 Risk indicators identified</div>
                  {result.tags.riskIndicators.map((r, i) => (
                    <div key={i} className="riq-risk-item">
                      <span>•</span>
                      <span>{r}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* DAP Note */}
              <div className="rounded-xl border p-5" style={{ borderColor: "var(--clr-border)", background: "var(--clr-card)" }}>
                <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--clr-slate)" }}>
                  DAP Note — Session {result.sessionNumber}
                </h3>

                {[
                  { key: "data", label: "Data", desc: "Observable facts and client statements" },
                  { key: "assessment", label: "Assessment", desc: "Clinical interpretation" },
                  { key: "plan", label: "Plan", desc: "Next steps and follow-up" },
                ].map((section) => (
                  <div key={section.key} className="mb-4 last:mb-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--clr-primary)" }}>
                        {section.label}
                      </span>
                      <span className="text-[10px]" style={{ color: "#9ca3af" }}>{section.desc}</span>
                    </div>
                    <p className="text-sm leading-relaxed" style={{ color: "#4b5563" }}>
                      {result.dapNote[section.key]}
                    </p>
                  </div>
                ))}
              </Accordion>

              {/* Clinical Tags */}
              <div className="rounded-xl border p-5" style={{ borderColor: "var(--clr-border)", background: "var(--clr-card)" }}>
                <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--clr-slate)" }}>
                  Clinical tags
                </h3>
                <div className="space-y-3 text-xs">
                  <TagRow label="Mood" items={result.tags.moodIndicators} color="var(--clr-primary)" bg="var(--clr-primary-light)" />
                  <TagRow label="Triggers" items={result.tags.triggersIdentified} color="var(--clr-warning)" bg="var(--clr-amber-light)" />
                  <TagRow label="Coping strategies" items={result.tags.copingStrategiesDiscussed} color="var(--clr-success)" bg="var(--clr-success-light)" />
                  {result.tags.substancesMentioned?.length > 0 && (
                    <TagRow label="Substances" items={result.tags.substancesMentioned} color="var(--clr-danger)" bg="var(--clr-danger-light)" />
                  )}
                  <div>
                    <span className="font-medium" style={{ color: "#9ca3af" }}>Support network: </span>
                    <span style={{ color: "#4b5563" }}>{result.tags.supportNetworkChanges}</span>
                  </div>
                  <div>
                    <span className="font-medium" style={{ color: "#9ca3af" }}>Sentiment: </span>
                    <StatusBadge status={result.tags.sessionSentiment} showIcon />
                  </div>
                  {result.tags.objectivesAddressed?.length > 0 && (
                    <div>
                      <span className="font-medium" style={{ color: "#9ca3af" }}>Objectives addressed: </span>
                      <span style={{ color: "#4b5563" }}>{result.tags.objectivesAddressed.join(", ")}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Risk Indicators */}
              {result.tags.riskIndicators?.length > 0 && (
                <div className="rounded-xl border-2 p-5 animate-fade-in"
                  style={{ borderColor: "var(--clr-danger)", background: "var(--clr-danger-light)" }}>
                  <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--clr-danger)" }}>
                    ⚠ Risk indicators identified
                  </h3>
                  <ul className="space-y-1.5">
                    {result.tags.riskIndicators.map((r, i) => (
                      <li key={i} className="text-xs flex items-start gap-2" style={{ color: "var(--clr-danger)" }}>
                        <span className="mt-0.5">•</span>
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Accordion>

              {/* Follow-up Flags */}
              <div className="rounded-xl border p-5" style={{ borderColor: "var(--clr-border)", background: "var(--clr-card)" }}>
                <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--clr-slate)" }}>
                  Follow-up flags
                </h3>
                <ul className="space-y-2">
                  {result.followUpFlags.map((flag, i) => {
                    const isPriority = flag.startsWith("PRIORITY:") || flag.startsWith("URGENT:");
                    return (
                      <li key={i} className="text-xs flex items-start gap-2">
                        <span className={`mt-0.5 ${isPriority ? "pulse-soft" : ""}`}
                          style={{ color: isPriority ? "var(--clr-danger)" : "var(--clr-primary)" }}>
                          {isPriority ? "🔴" : "→"}
                        </span>
                        <span style={{ color: isPriority ? "var(--clr-danger)" : "#4b5563", fontWeight: isPriority ? 600 : 400 }}>
                          {flag}
                        </span>
                      </li>
                    );
                  })}
                </div>
              </Accordion>

              {/* Key Quotes */}
              {result.tags.keyQuotes?.length > 0 && (
                <div className="rounded-xl border p-5" style={{ borderColor: "var(--clr-border)", background: "var(--clr-card)" }}>
                  <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--clr-slate)" }}>
                    Key client statements
                  </h3>
                  {result.tags.keyQuotes.map((q, i) => (
                    <blockquote key={i} className="text-sm italic border-l-2 pl-3 py-1 mb-2 last:mb-0"
                      style={{ borderColor: "var(--clr-primary)", color: "#4b5563" }}>
                      "{q}"
                    </blockquote>
                  ))}
                </div>
              )}

              {/* Action buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => onViewClient(activeClientId)}
                  className="flex-1 py-2.5 rounded-lg text-sm font-medium border transition-base"
                  style={{ borderColor: "var(--clr-primary)", color: "var(--clr-primary)" }}>
                  View client timeline
                </button>
                <button
                  onClick={() => { setResult(null); setRawNotes(""); }}
                  className="flex-1 py-2.5 rounded-lg text-sm font-medium text-white transition-base"
                  style={{ background: "var(--clr-primary)" }}>
                  Document another session
                </button>
              </div>
            </div>
          )}

          {!result && !loading && !error && (
            <div className="rounded-xl border-2 border-dashed p-12 flex flex-col items-center justify-center text-center"
              style={{ borderColor: "#d1d5db" }}>
              <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4"
                style={{ background: "var(--clr-primary-light)" }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--clr-primary)" strokeWidth="1.8">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
              </div>
              <p className="text-sm font-medium mb-1" style={{ color: "var(--clr-slate)" }}>
                Clinical documentation will appear here
              </p>
              <p className="text-xs" style={{ color: "#9ca3af" }}>
                Select a client and enter your session notes to generate structured documentation
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TagRow({ label, items, color, bg }) {
  if (!items || items.length === 0) return null;
  return (
    <div>
      <span className="font-medium" style={{ color: "#9ca3af" }}>{label}: </span>
      <div className="inline-flex flex-wrap gap-1.5 mt-1">
        {items.map((item, i) => (
          <span key={i} className="px-2 py-0.5 rounded-full" style={{ background: bg, color }}>{item}</span>
        ))}
      </div>
    </div>
  );
}
