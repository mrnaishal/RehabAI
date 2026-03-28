export default function Sidebar({ currentView, onNavigate }) {
  const navItems = [
    {
      id: "dashboard",
      label: "Caseload",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="3" width="7" height="7" rx="1.5" />
          <rect x="3" y="14" width="7" height="7" rx="1.5" />
          <rect x="14" y="14" width="7" height="7" rx="1.5" />
        </svg>
      ),
    },
    {
      id: "session",
      label: "Document",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
      ),
    },
  ];

  return (
    <aside className="w-[220px] h-screen flex flex-col border-r"
      style={{ borderColor: "var(--clr-border)", background: "var(--clr-card)" }}>
      {/* Logo */}
      <div className="px-5 pt-6 pb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-semibold text-sm"
            style={{ background: "var(--clr-primary)" }}>
            R
          </div>
          <div>
            <h1 className="text-[17px] font-semibold tracking-tight" style={{ color: "var(--clr-slate)" }}>
              RehabIQ
            </h1>
            <p className="text-[11px] leading-tight" style={{ color: "#9ca3af" }}>
              Clinical Intelligence
            </p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3">
        <p className="px-2 mb-2 text-[11px] font-medium uppercase tracking-wider" style={{ color: "#9ca3af" }}>
          Menu
        </p>
        {navItems.map((item) => {
          const active = currentView === item.id || (item.id === "dashboard" && currentView === "client");
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 text-sm font-medium transition-base"
              style={{
                background: active ? "var(--clr-primary-light)" : "transparent",
                color: active ? "var(--clr-primary)" : "#6b7280",
              }}
            >
              {item.icon}
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t" style={{ borderColor: "var(--clr-border)" }}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium text-white"
            style={{ background: "var(--clr-primary)" }}>
            DR
          </div>
          <div>
            <p className="text-sm font-medium" style={{ color: "var(--clr-slate)" }}>Dr. Rivera</p>
            <p className="text-[11px]" style={{ color: "#9ca3af" }}>Counselor</p>
          </div>
        </div>
      </div>
    </aside>
  );
}