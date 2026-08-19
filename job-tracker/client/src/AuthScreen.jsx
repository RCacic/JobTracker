import { useState } from "react";
import { api } from "./api";

const inp = {
  width: "100%",
  background: "#0f0f13",
  border: "1px solid #2a2a38",
  borderRadius: "8px",
  color: "#e8e8f0",
  padding: "11px 14px",
  fontSize: "14px",
  fontFamily: "inherit",
  outline: "none",
  boxSizing: "border-box",
};

export default function AuthScreen({ onAuth }) {
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setError(""); setLoading(true);
    try {
      const data = mode === "login"
        ? await api.login(email, password)
        : await api.register(name, email, password);
      localStorage.setItem("jt_token", data.token);
      onAuth(data.user);
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", fontFamily: "'Sora', sans-serif" }}>
      <div style={{ width: "100%", maxWidth: "400px" }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <div style={{ fontSize: "10px", color: "#4A9EFF", letterSpacing: "0.2em", textTransform: "uppercase", fontFamily: "'DM Mono', monospace", marginBottom: "8px" }}>Job Tracker</div>
          <h1 style={{ margin: 0, fontSize: "28px", fontWeight: 800, color: "#fff" }}>Track your hunt.</h1>
          <p style={{ color: "#444", fontSize: "13px", marginTop: "8px" }}>Log applications, track progress, land the role.</p>
        </div>

        <div style={{ background: "#0f0f13", border: "1px solid #1e1e2a", borderRadius: "16px", padding: "28px" }}>
          {/* Toggle */}
          <div style={{ display: "flex", background: "#0a0a0f", borderRadius: "8px", padding: "4px", marginBottom: "22px" }}>
            {["login", "register"].map(m => (
              <button key={m} onClick={() => { setMode(m); setError(""); }} style={{ flex: 1, background: mode === m ? "#1e1e2a" : "transparent", border: "none", borderRadius: "6px", color: mode === m ? "#e8e8f0" : "#555", padding: "8px", cursor: "pointer", fontSize: "13px", fontWeight: mode === m ? 700 : 400, fontFamily: "inherit", textTransform: "capitalize" }}>
                {m === "login" ? "Sign In" : "Register"}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {mode === "register" && (
              <div>
                <label style={{ fontSize: "11px", color: "#555", letterSpacing: "0.08em", textTransform: "uppercase", display: "block", marginBottom: "5px" }}>Full Name</label>
                <input style={inp} value={name} onChange={e => setName(e.target.value)} placeholder="Ryan Cacic" />
              </div>
            )}
            <div>
              <label style={{ fontSize: "11px", color: "#555", letterSpacing: "0.08em", textTransform: "uppercase", display: "block", marginBottom: "5px" }}>Email</label>
              <input style={inp} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@email.com" />
            </div>
            <div>
              <label style={{ fontSize: "11px", color: "#555", letterSpacing: "0.08em", textTransform: "uppercase", display: "block", marginBottom: "5px" }}>Password</label>
              <input style={inp} type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" onKeyDown={e => e.key === "Enter" && submit()} />
            </div>
            {error && <div style={{ fontSize: "13px", color: "#F87171", background: "#2e0f0f", border: "1px solid #F8717133", borderRadius: "7px", padding: "10px 13px" }}>{error}</div>}
            <button onClick={submit} disabled={loading} style={{ background: loading ? "#1a2a3a" : "#4A9EFF", border: "none", borderRadius: "8px", color: loading ? "#555" : "#000", padding: "12px", cursor: loading ? "default" : "pointer", fontSize: "14px", fontWeight: 700, fontFamily: "inherit", marginTop: "4px" }}>
              {loading ? "Loading..." : mode === "login" ? "Sign In" : "Create Account"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
