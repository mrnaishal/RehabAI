import { useState, useEffect } from "react";
import { login } from "../../services/api";

export default function Login({ onLoggedIn, darkMode, onToggleDark }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("rivera@rehab.com"); // Prefilled for hackathon
  const [password, setPassword] = useState("password"); // Prefilled for hackathon
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [spinToggle, setSpinToggle] = useState(false);

  // When switching modes, clear error and adjust initial values
  useEffect(() => {
    setError("");
    if (isSignUp) {
      setEmail("");
      setPassword("");
    } else {
      // Re-fill dummy credentials on standard Sign In
      setEmail("rivera@rehab.com");
      setPassword("password");
    }
  }, [isSignUp]);

  function handleToggleDark() {
    setSpinToggle(true);
    onToggleDark();
    setTimeout(() => setSpinToggle(false), 500);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      if (isSignUp) {
        // Enforce the hackathon dummy rule frontend-side for clarity
        if (!email.toLowerCase().endsWith("@rehabiq.com") && !email.toLowerCase().endsWith("@rehab.com")) {
          throw new Error("Demo signups require a @rehabiq.com or @rehab.com email address.");
        }
      }
      
      // Both sign-up and sign-in hit the same logic now thanks to the backend hackathon bypass
      await login(email.trim(), password);
      onLoggedIn();
    } catch (err) {
      setError(err.message || "Could not sign in");
    } finally {
      setSubmitting(false);
    }
  }

  const inputStyle = {
    width: "100%",
    boxSizing: "border-box",
    borderRadius: "10px",
    border: "1.5px solid var(--clr-border)",
    background: "var(--bg-page)",
    padding: "11px 14px",
    fontSize: "14px",
    fontFamily: "'DM Sans', system-ui, sans-serif",
    color: "var(--text-primary)",
    outline: "none",
    transition: "border-color 0.2s ease, box-shadow 0.2s ease",
  };

  return (
    <div
      className="min-h-screen flex flex-col relative"
      style={{
        background: "var(--bg-page)",
        backgroundImage:
          "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(82, 183, 136, 0.12), transparent)",
      }}
    >
      {/* Theme toggle */}
      <div style={{ position: "absolute", top: "20px", right: "24px", zIndex: 10 }}>
        <button
          type="button"
          onClick={handleToggleDark}
          title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "10px",
            border: "1.5px solid #d6e8db",
            background: "var(--bg-card)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "16px",
            boxShadow: "var(--card-shadow)",
            transition: "border-color 0.2s ease, transform 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "var(--green-accent)";
            e.currentTarget.style.transform = "translateY(-1px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "#d6e8db";
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          <span
            style={{
              display: "inline-block",
              animation: spinToggle ? "spin360 0.5s ease forwards" : "none",
            }}
          >
            {darkMode ? "☀️" : "🌙"}
          </span>
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div style={{ width: "100%", maxWidth: "420px" }}>
          
          {/* Mode Toggle Tabs */}
          <div style={{ display: "flex", gap: "10px", marginBottom: "16px" }}>
            <button
              onClick={() => setIsSignUp(false)}
              style={{
                flex: 1,
                padding: "10px",
                borderRadius: "12px",
                border: "none",
                fontWeight: 600,
                fontSize: "14px",
                cursor: "pointer",
                fontFamily: "'DM Sans', system-ui, sans-serif",
                background: !isSignUp ? "var(--bg-card)" : "transparent",
                color: !isSignUp ? "var(--green-dark)" : "var(--text-muted)",
                boxShadow: !isSignUp ? "var(--card-shadow)" : "none",
                transition: "all 0.2s ease",
              }}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsSignUp(true)}
              style={{
                flex: 1,
                padding: "10px",
                borderRadius: "12px",
                border: "none",
                fontWeight: 600,
                fontSize: "14px",
                cursor: "pointer",
                fontFamily: "'DM Sans', system-ui, sans-serif",
                background: isSignUp ? "var(--bg-card)" : "transparent",
                color: isSignUp ? "var(--green-dark)" : "var(--text-muted)",
                boxShadow: isSignUp ? "var(--card-shadow)" : "none",
                transition: "all 0.2s ease",
              }}
            >
              Sign Up
            </button>
          </div>

          <div
            style={{
              borderRadius: "16px",
              background: "var(--bg-card)",
              boxShadow: "var(--card-shadow-md)",
              border: "1px solid rgba(27,61,47,0.06)",
              padding: "28px 28px 32px",
            }}
          >
            {/* Brand */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "10px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "var(--green-dark)",
                  color: "white",
                  fontWeight: "800",
                  fontSize: "18px",
                  fontFamily: "'DM Sans', system-ui, sans-serif",
                  userSelect: "none",
                  flexShrink: 0,
                }}
              >
                R
              </div>
              <div>
                <div
                  style={{
                    fontFamily: "'DM Sans', system-ui, sans-serif",
                    fontWeight: 700,
                    fontSize: "17px",
                    color: "var(--text-primary)",
                    letterSpacing: "-0.02em",
                  }}
                >
                  RehabIQ
                </div>
                <div style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 400, marginTop: "2px" }}>
                  Clinical Suite
                </div>
              </div>
            </div>

            <h1
              style={{
                fontFamily: "'DM Sans', system-ui, sans-serif",
                fontWeight: 700,
                fontSize: "18px",
                color: "var(--text-primary)",
                marginBottom: "6px",
              }}
            >
              {isSignUp ? "Create new account" : "Welcome back"}
            </h1>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "22px", lineHeight: 1.45 }}>
              {isSignUp ? "Register as a practitioner using your @rehabiq.com address." : "Sign in with your demo counselor account to open the clinical suite."}
            </p>

            <form onSubmit={handleSubmit}>
              {isSignUp && (
                <>
                  <label
                    style={{
                      display: "block",
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "var(--text-secondary)",
                      marginBottom: "6px",
                      fontFamily: "'DM Sans', system-ui, sans-serif",
                    }}
                  >
                    Full Name
                  </label>
                  <input
                    type="text"
                    autoComplete="name"
                    placeholder="Dr. Jane Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    disabled={submitting}
                    style={{ ...inputStyle, marginBottom: "16px" }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "var(--green-accent)";
                      e.target.style.boxShadow = "0 0 0 3px rgba(82, 183, 136, 0.2)";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "var(--clr-border)";
                      e.target.style.boxShadow = "none";
                    }}
                  />
                </>
              )}

              <label
                style={{
                  display: "block",
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "var(--text-secondary)",
                  marginBottom: "6px",
                  fontFamily: "'DM Sans', system-ui, sans-serif",
                }}
              >
                Email
              </label>
              <input
                type="email"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={isSignUp ? "name@rehabiq.com" : ""}
                required
                disabled={submitting}
                style={inputStyle}
                onFocus={(e) => {
                  e.target.style.borderColor = "var(--green-accent)";
                  e.target.style.boxShadow = "0 0 0 3px rgba(82, 183, 136, 0.2)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "var(--clr-border)";
                  e.target.style.boxShadow = "none";
                }}
              />

              <label
                style={{
                  display: "block",
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "var(--text-secondary)",
                  marginTop: "16px",
                  marginBottom: "6px",
                  fontFamily: "'DM Sans', system-ui, sans-serif",
                }}
              >
                Password
              </label>
              <input
                type="password"
                autoComplete={isSignUp ? "new-password" : "current-password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={submitting}
                style={inputStyle}
                onFocus={(e) => {
                  e.target.style.borderColor = "var(--green-accent)";
                  e.target.style.boxShadow = "0 0 0 3px rgba(82, 183, 136, 0.2)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "var(--clr-border)";
                  e.target.style.boxShadow = "none";
                }}
              />

              {error && (
                <p
                  role="alert"
                  style={{
                    marginTop: "14px",
                    fontSize: "13px",
                    color: "var(--clr-danger)",
                    background: "var(--clr-danger-light)",
                    border: "1px solid var(--clr-danger-border)",
                    borderRadius: "10px",
                    padding: "10px 12px",
                  }}
                >
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                style={{
                  width: "100%",
                  marginTop: "22px",
                  padding: "12px 16px",
                  borderRadius: "12px",
                  border: "none",
                  cursor: submitting ? "wait" : "pointer",
                  fontFamily: "'DM Sans', system-ui, sans-serif",
                  fontWeight: 700,
                  fontSize: "14px",
                  color: "#fff",
                  background: "linear-gradient(135deg, var(--clr-primary), var(--green-accent))",
                  boxShadow: "var(--shadow-primary)",
                  opacity: submitting ? 0.85 : 1,
                  transition: "transform 0.15s ease, box-shadow 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  if (!submitting) e.currentTarget.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                {submitting ? (isSignUp ? "Creating account…" : "Signing in…") : (isSignUp ? "Sign up" : "Sign in")}
              </button>
            </form>

            {!isSignUp && (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", margin: "20px 0 16px" }}>
                  <div style={{ flex: 1, height: "1px", background: "var(--clr-border)" }} />
                  <span style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "'DM Sans', system-ui, sans-serif", whiteSpace: "nowrap" }}>
                    or skip straight to the demo
                  </span>
                  <div style={{ flex: 1, height: "1px", background: "var(--clr-border)" }} />
                </div>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={async () => {
                    setError("");
                    setSubmitting(true);
                    try {
                      await login("rivera@rehab.com", "password");
                      onLoggedIn();
                    } catch (err) {
                      setError(err.message || "Could not sign in");
                    } finally {
                      setSubmitting(false);
                    }
                  }}
                  style={{
                    width: "100%",
                    padding: "11px 16px",
                    borderRadius: "12px",
                    border: "1.5px solid var(--clr-border)",
                    cursor: submitting ? "wait" : "pointer",
                    fontFamily: "'DM Sans', system-ui, sans-serif",
                    fontWeight: 600,
                    fontSize: "14px",
                    color: "var(--green-dark)",
                    background: "var(--bg-page)",
                    transition: "border-color 0.2s ease, transform 0.15s ease, box-shadow 0.15s ease",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                  }}
                  onMouseEnter={(e) => {
                    if (!submitting) {
                      e.currentTarget.style.borderColor = "var(--green-accent)";
                      e.currentTarget.style.transform = "translateY(-1px)";
                      e.currentTarget.style.boxShadow = "0 4px 12px rgba(82,183,136,0.15)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "var(--clr-border)";
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  {submitting ? "Entering…" : (
                    <>
                      <span style={{ fontSize: "15px" }}>▶</span>
                      Try Demo — no account needed
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
