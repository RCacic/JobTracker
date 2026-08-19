import { useState, useEffect } from "react";
import { api } from "./api";
import AuthScreen from "./AuthScreen";

// ── Constants ────────────────────────────────────────────────────────────────

const STATUSES = ["Applied", "Interview", "Technical Test", "Offer", "Rejected"];

const STATUS_CONFIG = {
  Applied:          { color: "#4A9EFF", bg: "#0d1f3c" },
  Interview:        { color: "#F5A623", bg: "#2d1f08" },
  "Technical Test": { color: "#A78BFA", bg: "#1e1530" },
  Offer:            { color: "#34D399", bg: "#0a2e1f" },
  Rejected:         { color: "#F87171", bg: "#2e0f0f" },
};

const VIEWS = ["Applications", "Pipeline", "Analytics", "Cover Letter"];

const emptyForm = { company: "", role: "", status: "Applied", date: "", notes: "", url: "", source: "SEEK Grad", timeline: [] };

// ── Small shared components ──────────────────────────────────────────────────

function StatusBadge({ status }) {
  const c = STATUS_CONFIG[status];
  return (
    <span style={{ background: c.bg, color: c.color, border: `1px solid ${c.color}33`, borderRadius: "6px", padding: "3px 10px", fontSize: "11px", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", whiteSpace: "nowrap" }}>
      {status}
    </span>
  );
}

function StatCard({ label, value, color }) {
  return (
    <div style={{ background: "#0f0f13", border: "1px solid #1e1e2a", borderRadius: "12px", padding: "18px 20px", flex: 1, minWidth: "80px" }}>
      <div style={{ fontSize: "26px", fontWeight: 800, color: color || "#fff", fontFamily: "'DM Mono', monospace" }}>{value}</div>
      <div style={{ fontSize: "10px", color: "#555", marginTop: "3px", letterSpacing: "0.08em", textTransform: "uppercase" }}>{label}</div>
    </div>
  );
}

const sharedInp = { width: "100%", background: "#0f0f13", border: "1px solid #2a2a38", borderRadius: "8px", color: "#e8e8f0", padding: "10px 14px", fontSize: "14px", fontFamily: "inherit", outline: "none", boxSizing: "border-box" };

// ── Job Modal ────────────────────────────────────────────────────────────────

function Modal({ job, onClose, onSave, saving }) {
  const [form, setForm] = useState(job || emptyForm);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const addTimeline = () => setForm(f => ({ ...f, timeline: [...(f.timeline || []), { status: f.status, date: new Date().toISOString().split("T")[0], note: "" }] }));

  return (
    <div style={{ position: "fixed", inset: 0, background: "#000000cc", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }} onClick={onClose}>
      <div style={{ background: "#13131a", border: "1px solid #2a2a38", borderRadius: "16px", padding: "28px", width: "100%", maxWidth: "520px", boxShadow: "0 24px 64px #00000099", maxHeight: "90vh", overflowY: "auto" }} onClick={e => e.stopPropagation()}>
        <h2 style={{ margin: "0 0 20px", fontSize: "17px", color: "#e8e8f0", fontFamily: "'DM Mono', monospace" }}>{job?.id ? "Edit Application" : "New Application"}</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {[["Company", "company"], ["Role / Position", "role"], ["Job URL", "url"]].map(([label, key]) => (
            <div key={key}>
              <label style={{ fontSize: "11px", color: "#555", letterSpacing: "0.08em", textTransform: "uppercase", display: "block", marginBottom: "5px" }}>{label}</label>
              <input style={sharedInp} value={form[key]} onChange={e => set(key, e.target.value)} placeholder={label} />
            </div>
          ))}
          <div style={{ display: "flex", gap: "10px" }}>
            {[["Status", "status", STATUSES], ["Source", "source", ["SEEK Grad", "LinkedIn", "Direct", "Referral", "Recruiter", "Other"]]].map(([label, key, opts]) => (
              <div key={key} style={{ flex: 1 }}>
                <label style={{ fontSize: "11px", color: "#555", letterSpacing: "0.08em", textTransform: "uppercase", display: "block", marginBottom: "5px" }}>{label}</label>
                <select style={{ ...sharedInp, cursor: "pointer" }} value={form[key]} onChange={e => set(key, e.target.value)}>
                  {opts.map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
            ))}
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: "11px", color: "#555", letterSpacing: "0.08em", textTransform: "uppercase", display: "block", marginBottom: "5px" }}>Date</label>
              <input type="date" style={sharedInp} value={form.date} onChange={e => set("date", e.target.value)} />
            </div>
          </div>
          <div>
            <label style={{ fontSize: "11px", color: "#555", letterSpacing: "0.08em", textTransform: "uppercase", display: "block", marginBottom: "5px" }}>Notes</label>
            <textarea style={{ ...sharedInp, minHeight: "70px", resize: "vertical" }} value={form.notes} onChange={e => set("notes", e.target.value)} placeholder="Salary, recruiter, next steps..." />
          </div>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <label style={{ fontSize: "11px", color: "#555", letterSpacing: "0.08em", textTransform: "uppercase" }}>Activity Log</label>
              <button onClick={addTimeline} style={{ background: "#1a1a24", border: "1px solid #2a2a38", borderRadius: "6px", color: "#888", padding: "4px 10px", cursor: "pointer", fontSize: "11px", fontFamily: "inherit" }}>+ Add Entry</button>
            </div>
            {(form.timeline || []).map((entry, i) => (
              <div key={i} style={{ display: "flex", gap: "8px", marginBottom: "6px" }}>
                <select style={{ ...sharedInp, width: "130px", fontSize: "12px", padding: "7px 10px" }} value={entry.status}
                  onChange={e => { const tl = [...form.timeline]; tl[i] = { ...tl[i], status: e.target.value }; setForm(f => ({ ...f, timeline: tl })); }}>
                  {STATUSES.map(s => <option key={s}>{s}</option>)}
                </select>
                <input type="date" style={{ ...sharedInp, width: "130px", fontSize: "12px", padding: "7px 10px" }} value={entry.date}
                  onChange={e => { const tl = [...form.timeline]; tl[i] = { ...tl[i], date: e.target.value }; setForm(f => ({ ...f, timeline: tl })); }} />
                <input style={{ ...sharedInp, fontSize: "12px", padding: "7px 10px" }} placeholder="Note..." value={entry.note}
                  onChange={e => { const tl = [...form.timeline]; tl[i] = { ...tl[i], note: e.target.value }; setForm(f => ({ ...f, timeline: tl })); }} />
                <button onClick={() => setForm(f => ({ ...f, timeline: f.timeline.filter((_, j) => j !== i) }))} style={{ background: "transparent", border: "none", color: "#F87171", cursor: "pointer", fontSize: "16px" }}>×</button>
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
          <button onClick={onClose} style={{ flex: 1, background: "transparent", border: "1px solid #2a2a38", borderRadius: "8px", color: "#666", padding: "11px", cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
          <button onClick={() => onSave(form)} disabled={saving} style={{ flex: 2, background: saving ? "#1a2a3a" : "#4A9EFF", border: "none", borderRadius: "8px", color: saving ? "#555" : "#000", padding: "11px", cursor: saving ? "default" : "pointer", fontSize: "14px", fontWeight: 700, fontFamily: "inherit" }}>
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Timeline Panel ───────────────────────────────────────────────────────────

function TimelinePanel({ job, onClose }) {
  const tl = job?.timeline || [];
  return (
    <div style={{ position: "fixed", inset: 0, background: "#000000bb", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }} onClick={onClose}>
      <div style={{ background: "#13131a", border: "1px solid #2a2a38", borderRadius: "16px", padding: "28px", width: "100%", maxWidth: "420px" }} onClick={e => e.stopPropagation()}>
        <div style={{ marginBottom: "20px" }}>
          <div style={{ fontSize: "11px", color: "#4A9EFF", fontFamily: "'DM Mono', monospace", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "4px" }}>{job?.company}</div>
          <div style={{ fontSize: "17px", fontWeight: 700, color: "#e8e8f0" }}>{job?.role}</div>
        </div>
        {tl.length === 0 ? <div style={{ color: "#444", fontSize: "13px" }}>No activity logged yet.</div> : (
          <div style={{ position: "relative" }}>
            <div style={{ position: "absolute", left: "10px", top: 0, bottom: 0, width: "1px", background: "#1e1e2a" }} />
            {tl.map((entry, i) => {
              const cfg = STATUS_CONFIG[entry.status];
              return (
                <div key={i} style={{ display: "flex", gap: "16px", marginBottom: "18px" }}>
                  <div style={{ width: "20px", height: "20px", borderRadius: "50%", background: cfg.bg, border: `2px solid ${cfg.color}`, flexShrink: 0, marginTop: "1px", zIndex: 1 }} />
                  <div>
                    <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "2px" }}>
                      <StatusBadge status={entry.status} />
                      <span style={{ fontSize: "11px", color: "#444", fontFamily: "'DM Mono', monospace" }}>{entry.entry_date || entry.date}</span>
                    </div>
                    {entry.note && <div style={{ fontSize: "12px", color: "#888", marginTop: "3px" }}>{entry.note}</div>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <button onClick={onClose} style={{ marginTop: "8px", width: "100%", background: "transparent", border: "1px solid #2a2a38", borderRadius: "8px", color: "#666", padding: "11px", cursor: "pointer", fontFamily: "inherit" }}>Close</button>
      </div>
    </div>
  );
}

// ── Analytics ────────────────────────────────────────────────────────────────

function Analytics({ jobs }) {
  const total = jobs.length;
  const byStatus = STATUSES.reduce((a, s) => ({ ...a, [s]: jobs.filter(j => j.status === s).length }), {});
  const bySource = ["SEEK Grad", "LinkedIn", "Direct", "Referral", "Recruiter", "Other"]
    .map(s => ({ source: s, count: jobs.filter(j => j.source === s).length })).filter(x => x.count > 0);
  const maxBar = Math.max(...bySource.map(x => x.count), 1);
  const interviewRate = total ? Math.round(((byStatus["Interview"] + byStatus["Technical Test"] + byStatus["Offer"]) / total) * 100) : 0;
  const offerRate = total ? Math.round((byStatus["Offer"] / total) * 100) : 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
        <StatCard label="Total" value={total} color="#fff" />
        <StatCard label="Interview Rate" value={`${interviewRate}%`} color="#F5A623" />
        <StatCard label="Offer Rate" value={`${offerRate}%`} color="#34D399" />
        <StatCard label="Active" value={jobs.filter(j => j.status !== "Rejected").length} color="#4A9EFF" />
      </div>

      {[
        { title: "Status Breakdown", items: STATUSES.map(s => ({ label: s, value: byStatus[s], pct: total ? (byStatus[s] / total) * 100 : 0, color: STATUS_CONFIG[s].color })) },
        { title: "Applications by Source", items: bySource.map(({ source, count }) => ({ label: source, value: count, pct: (count / maxBar) * 100, color: "#4A9EFF" })) },
      ].map(({ title, items }) => (
        <div key={title} style={{ background: "#0f0f13", border: "1px solid #1e1e2a", borderRadius: "14px", padding: "22px" }}>
          <div style={{ fontSize: "11px", color: "#444", letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "'DM Mono', monospace", marginBottom: "18px" }}>{title}</div>
          {items.map(({ label, value, pct, color }) => (
            <div key={label} style={{ marginBottom: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                <span style={{ fontSize: "12px", color: "#888" }}>{label}</span>
                <span style={{ fontSize: "12px", color, fontFamily: "'DM Mono', monospace" }}>{value} ({Math.round(pct)}%)</span>
              </div>
              <div style={{ background: "#1a1a24", borderRadius: "4px", height: "6px" }}>
                <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: "4px", transition: "width 0.6s ease" }} />
              </div>
            </div>
          ))}
        </div>
      ))}

      {/* Funnel */}
      <div style={{ background: "#0f0f13", border: "1px solid #1e1e2a", borderRadius: "14px", padding: "22px" }}>
        <div style={{ fontSize: "11px", color: "#444", letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "'DM Mono', monospace", marginBottom: "18px" }}>Conversion Funnel</div>
        {[
          { label: "Applied", value: total, color: "#4A9EFF" },
          { label: "Got Interview", value: byStatus["Interview"] + byStatus["Technical Test"] + byStatus["Offer"], color: "#F5A623" },
          { label: "Technical Test", value: byStatus["Technical Test"] + byStatus["Offer"], color: "#A78BFA" },
          { label: "Received Offer", value: byStatus["Offer"], color: "#34D399" },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "10px" }}>
            <div style={{ width: "110px", fontSize: "12px", color: "#666", flexShrink: 0 }}>{label}</div>
            <div style={{ flex: 1, background: "#1a1a24", borderRadius: "4px", height: "24px", overflow: "hidden" }}>
              <div style={{ width: `${total ? (value / total) * 100 : 0}%`, height: "100%", background: color + "33", borderRight: `2px solid ${color}`, display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: "8px" }}>
                <span style={{ fontSize: "11px", color, fontFamily: "'DM Mono', monospace", fontWeight: 700 }}>{value}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── AI Cover Letter ──────────────────────────────────────────────────────────

function CoverLetter({ jobs, user }) {
  const [selectedJobId, setSelectedJobId] = useState(jobs[0]?.id || "");
  const [jobDescription, setJobDescription] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const generate = async () => {
    const job = jobs.find(j => j.id === parseInt(selectedJobId) || j.id === selectedJobId);
    if (!job || !jobDescription.trim()) { setError("Select a job and paste the description."); return; }
    setError(""); setLoading(true); setResult("");
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{
            role: "user",
            content: `Write a tailored, professional cover letter for this job application. Be specific and compelling, no filler phrases.

APPLICANT:
Name: ${user?.name || "Ryan Cacic"}
Degree: Bachelor of Information and Communication Technology (Software Development), Swinburne University, graduating 2026
Skills: JavaScript, React, Node.js, PHP, Python, Kotlin, MySQL, AWS, Git, Android Studio, KNIME, basic ML
Achievements: HD in Advanced Web Development (86%), HD in ICT Project B (80%), Distinctions in Data Visualisation, Mobile Dev, OOP, Interface Design
Work Experience: Technical Assistant at Akron Engineering (IT support, workflow optimisation), Produce Team Member at Woolworths

APPLYING FOR:
Company: ${job.company}
Role: ${job.role}
Notes: ${job.notes}

JOB DESCRIPTION:
${jobDescription}

Write 3-4 paragraphs. Address "Dear Hiring Manager". Sign off as ${user?.name || "Ryan Cacic"} with email and phone.`
          }]
        })
      });
      const data = await res.json();
      setResult(data.content?.map(b => b.text || "").join("") || "");
    } catch { setError("Failed to generate. Try again."); }
    setLoading(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <div style={{ background: "#0f0f13", border: "1px solid #1e1e2a", borderRadius: "14px", padding: "22px" }}>
        <div style={{ fontSize: "11px", color: "#444", letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "'DM Mono', monospace", marginBottom: "16px" }}>AI Cover Letter Generator</div>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div>
            <label style={{ fontSize: "11px", color: "#555", letterSpacing: "0.08em", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>Select Application</label>
            <select style={{ ...sharedInp, cursor: "pointer" }} value={selectedJobId} onChange={e => setSelectedJobId(e.target.value)}>
              {jobs.map(j => <option key={j.id} value={j.id}>{j.company} — {j.role}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: "11px", color: "#555", letterSpacing: "0.08em", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>Paste Job Description</label>
            <textarea style={{ ...sharedInp, minHeight: "130px", resize: "vertical" }} value={jobDescription} onChange={e => setJobDescription(e.target.value)} placeholder="Paste the full job description here..." />
          </div>
          {error && <div style={{ fontSize: "13px", color: "#F87171" }}>{error}</div>}
          <button onClick={generate} disabled={loading} style={{ background: loading ? "#1a2a3a" : "#4A9EFF", border: "none", borderRadius: "8px", color: loading ? "#555" : "#000", padding: "12px", cursor: loading ? "default" : "pointer", fontSize: "14px", fontWeight: 700, fontFamily: "inherit" }}>
            {loading ? "Generating..." : "✦ Generate Cover Letter"}
          </button>
        </div>
      </div>
      {result && (
        <div style={{ background: "#0f0f13", border: "1px solid #34D39933", borderRadius: "14px", padding: "22px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <div style={{ fontSize: "11px", color: "#34D399", letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "'DM Mono', monospace" }}>Generated</div>
            <button onClick={() => navigator.clipboard.writeText(result)} style={{ background: "#1a2e1a", border: "1px solid #34D39944", borderRadius: "6px", color: "#34D399", padding: "6px 12px", cursor: "pointer", fontSize: "11px", fontFamily: "inherit" }}>Copy</button>
          </div>
          <div style={{ fontSize: "13px", color: "#c8c8d8", lineHeight: "1.75", whiteSpace: "pre-wrap" }}>{result}</div>
        </div>
      )}
    </div>
  );
}

// ── Drag & Drop Pipeline ─────────────────────────────────────────────────────

function Pipeline({ jobs, onUpdateStatus }) {
  const [dragging, setDragging] = useState(null);
  const [dragOver, setDragOver] = useState(null);

  return (
    <div style={{ display: "flex", gap: "10px", overflowX: "auto", paddingBottom: "8px", minHeight: "400px" }}>
      {STATUSES.map(status => {
        const cfg = STATUS_CONFIG[status];
        const statusJobs = jobs.filter(j => j.status === status);
        const isOver = dragOver === status;
        return (
          <div key={status}
            onDragOver={e => { e.preventDefault(); setDragOver(status); }}
            onDragLeave={() => setDragOver(null)}
            onDrop={() => { if (dragging && dragging.status !== status) onUpdateStatus(dragging.id, status); setDragging(null); setDragOver(null); }}
            style={{ minWidth: "180px", flex: 1, background: isOver ? "#13131e" : "#0f0f13", border: `1px solid ${isOver ? cfg.color + "55" : "#1e1e2a"}`, borderTop: `2px solid ${cfg.color}`, borderRadius: "10px", padding: "14px", transition: "all 0.15s" }}
          >
            <div style={{ fontSize: "11px", color: cfg.color, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "12px", fontFamily: "'DM Mono', monospace" }}>
              {status} <span style={{ color: "#444" }}>({statusJobs.length})</span>
            </div>
            {statusJobs.map(j => (
              <div key={j.id} draggable
                onDragStart={() => setDragging(j)}
                onDragEnd={() => { setDragging(null); setDragOver(null); }}
                style={{ background: dragging?.id === j.id ? "#1e1e2a" : "#13131a", border: "1px solid #1e1e2a", borderRadius: "8px", padding: "11px 13px", marginBottom: "8px", cursor: "grab", opacity: dragging?.id === j.id ? 0.5 : 1 }}
              >
                <div style={{ fontWeight: 700, fontSize: "12px", color: "#e8e8f0" }}>{j.company}</div>
                <div style={{ fontSize: "11px", color: "#555", marginTop: "2px" }}>{j.role.slice(0, 28)}{j.role.length > 28 ? "…" : ""}</div>
                {j.source && <div style={{ fontSize: "10px", color: "#333", marginTop: "5px" }}>{j.source}</div>}
              </div>
            ))}
            {statusJobs.length === 0 && (
              <div style={{ fontSize: "11px", color: isOver ? cfg.color + "88" : "#2a2a38", textAlign: "center", padding: "20px 0", border: `1px dashed ${isOver ? cfg.color + "44" : "#1e1e2a"}`, borderRadius: "8px" }}>
                {isOver ? "Drop here" : "Empty"}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Main App ─────────────────────────────────────────────────────────────────

export default function App() {
  const [user, setUser] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [view, setView] = useState("Applications");
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null);
  const [timelineJob, setTimelineJob] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load fonts
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Sora:wght@400;600;700;800&display=swap";
    document.head.appendChild(link);
  }, []);

  // Check for existing token on mount
  useEffect(() => {
    const token = localStorage.getItem("jt_token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        if (payload.exp * 1000 > Date.now()) {
          setUser({ id: payload.id, name: payload.name, email: payload.email });
        } else {
          localStorage.removeItem("jt_token");
        }
      } catch { localStorage.removeItem("jt_token"); }
    }
    setLoading(false);
  }, []);

  // Fetch jobs when user is set
  useEffect(() => {
    if (!user) return;
    api.getJobs().then(setJobs).catch(console.error);
  }, [user]);

  const handleAuth = (u) => setUser(u);

  const handleLogout = () => {
    localStorage.removeItem("jt_token");
    setUser(null);
    setJobs([]);
  };

  const saveJob = async (form) => {
    setSaving(true);
    try {
      if (form.id) {
        const updated = await api.updateJob(form.id, form);
        setJobs(js => js.map(j => j.id === form.id ? updated : j));
      } else {
        const created = await api.createJob(form);
        setJobs(js => [created, ...js]);
      }
      setModal(null);
    } catch (e) { console.error(e); }
    setSaving(false);
  };

  const updateStatus = async (id, status) => {
    setJobs(js => js.map(j => j.id === id ? { ...j, status } : j));
    try { await api.updateStatus(id, status); } catch { api.getJobs().then(setJobs); }
  };

  const deleteJob = async (id) => {
    setJobs(js => js.filter(j => j.id !== id));
    setDeleteId(null);
    try { await api.deleteJob(id); } catch { api.getJobs().then(setJobs); }
  };

  if (loading) return <div style={{ minHeight: "100vh", background: "#0a0a0f", display: "flex", alignItems: "center", justifyContent: "center", color: "#444", fontFamily: "sans-serif" }}>Loading...</div>;
  if (!user) return <AuthScreen onAuth={handleAuth} />;

  const counts = STATUSES.reduce((a, s) => ({ ...a, [s]: jobs.filter(j => j.status === s).length }), {});
  const filtered = jobs.filter(j => {
    const mS = filter === "All" || j.status === filter;
    const mQ = !search || j.company.toLowerCase().includes(search.toLowerCase()) || j.role.toLowerCase().includes(search.toLowerCase());
    return mS && mQ;
  });

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", color: "#e8e8f0", fontFamily: "'Sora', sans-serif" }}>
      {/* Header */}
      <div style={{ borderBottom: "1px solid #1a1a24", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#0a0a0f", position: "sticky", top: 0, zIndex: 10 }}>
        <div>
          <div style={{ fontSize: "10px", color: "#4A9EFF", letterSpacing: "0.15em", textTransform: "uppercase", fontFamily: "'DM Mono', monospace", marginBottom: "2px" }}>{user.name}</div>
          <h1 style={{ margin: 0, fontSize: "18px", fontWeight: 800, color: "#fff" }}>Application Tracker</h1>
        </div>
        <div style={{ display: "flex", gap: "6px", alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ display: "flex", gap: "3px", background: "#0f0f13", border: "1px solid #1e1e2a", borderRadius: "10px", padding: "4px" }}>
            {VIEWS.map(v => (
              <button key={v} onClick={() => setView(v)} style={{ background: view === v ? "#1e1e2a" : "transparent", border: "none", borderRadius: "7px", color: view === v ? "#e8e8f0" : "#555", padding: "6px 11px", cursor: "pointer", fontSize: "11px", fontWeight: view === v ? 700 : 400, fontFamily: "inherit", whiteSpace: "nowrap" }}>{v}</button>
            ))}
          </div>
          <button onClick={() => setModal("new")} style={{ background: "#4A9EFF", border: "none", borderRadius: "8px", color: "#000", padding: "8px 16px", fontWeight: 700, fontSize: "12px", cursor: "pointer", fontFamily: "inherit" }}>+ Add</button>
          <button onClick={handleLogout} style={{ background: "transparent", border: "1px solid #2a2a38", borderRadius: "8px", color: "#555", padding: "8px 12px", fontSize: "11px", cursor: "pointer", fontFamily: "inherit" }}>Sign out</button>
        </div>
      </div>

      <div style={{ padding: "20px 24px", maxWidth: "1200px", margin: "0 auto" }}>
        {/* Stats */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "20px", flexWrap: "wrap" }}>
          <StatCard label="Total" value={jobs.length} color="#fff" />
          <StatCard label="Active" value={jobs.filter(j => j.status !== "Rejected").length} color="#4A9EFF" />
          <StatCard label="Interviews" value={counts["Interview"]} color="#F5A623" />
          <StatCard label="Tests" value={counts["Technical Test"]} color="#A78BFA" />
          <StatCard label="Offers" value={counts["Offer"]} color="#34D399" />
        </div>

        {/* Applications Table */}
        {view === "Applications" && (
          <>
            <div style={{ display: "flex", gap: "6px", marginBottom: "14px", flexWrap: "wrap", alignItems: "center" }}>
              <input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} style={{ background: "#0f0f13", border: "1px solid #2a2a38", borderRadius: "8px", color: "#e8e8f0", padding: "7px 12px", fontSize: "13px", fontFamily: "inherit", outline: "none", width: "160px" }} />
              {["All", ...STATUSES].map(s => (
                <button key={s} onClick={() => setFilter(s)} style={{ background: filter === s ? "#4A9EFF" : "#0f0f13", border: `1px solid ${filter === s ? "#4A9EFF" : "#2a2a38"}`, borderRadius: "6px", color: filter === s ? "#000" : "#666", padding: "5px 11px", fontSize: "11px", fontWeight: filter === s ? 700 : 400, cursor: "pointer", fontFamily: "inherit" }}>
                  {s}{s !== "All" ? ` (${counts[s] || 0})` : ""}
                </button>
              ))}
            </div>
            <div style={{ background: "#0f0f13", border: "1px solid #1e1e2a", borderRadius: "14px", overflow: "hidden" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 140px 90px 90px 100px", padding: "10px 16px", borderBottom: "1px solid #1e1e2a", fontSize: "10px", color: "#444", letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: "'DM Mono', monospace" }}>
                <span>Company</span><span>Role</span><span>Status</span><span>Source</span><span>Date</span><span style={{ textAlign: "right" }}>Actions</span>
              </div>
              {filtered.length === 0
                ? <div style={{ padding: "40px", textAlign: "center", color: "#333", fontSize: "13px" }}>No applications yet. Add your first one!</div>
                : filtered.map((job, i) => (
                  <div key={job.id} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 140px 90px 90px 100px", padding: "13px 16px", borderBottom: i < filtered.length - 1 ? "1px solid #1a1a24" : "none", alignItems: "center" }}
                    onMouseEnter={e => e.currentTarget.style.background = "#13131e"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >
                    <div>
                      <div style={{ fontWeight: 700, fontSize: "13px", color: "#e8e8f0" }}>{job.company}</div>
                      {job.notes && <div style={{ fontSize: "10px", color: "#444", marginTop: "1px" }}>{job.notes.slice(0, 35)}{job.notes.length > 35 ? "…" : ""}</div>}
                    </div>
                    <div style={{ fontSize: "12px", color: "#777" }}>{job.role}</div>
                    <div><StatusBadge status={job.status} /></div>
                    <div style={{ fontSize: "11px", color: "#555" }}>{job.source || "—"}</div>
                    <div style={{ fontSize: "11px", color: "#555", fontFamily: "'DM Mono', monospace" }}>
                      {job.date_applied ? new Date(job.date_applied).toLocaleDateString("en-AU", { day: "numeric", month: "short" }) : job.date ? new Date(job.date).toLocaleDateString("en-AU", { day: "numeric", month: "short" }) : "—"}
                    </div>
                    <div style={{ display: "flex", gap: "4px", justifyContent: "flex-end" }}>
                      <button onClick={() => setTimelineJob(job)} style={{ background: "#1a1a24", border: "none", borderRadius: "5px", color: "#888", padding: "5px 7px", cursor: "pointer", fontSize: "11px" }} title="Timeline">⏱</button>
                      <button onClick={() => setModal(job)} style={{ background: "#1a1a24", border: "none", borderRadius: "5px", color: "#888", padding: "5px 8px", cursor: "pointer", fontSize: "11px" }}>Edit</button>
                      <button onClick={() => setDeleteId(job.id)} style={{ background: "#1a0a0a", border: "none", borderRadius: "5px", color: "#F87171", padding: "5px 7px", cursor: "pointer", fontSize: "11px" }}>✕</button>
                    </div>
                  </div>
                ))}
            </div>
          </>
        )}

        {view === "Pipeline" && <Pipeline jobs={jobs} onUpdateStatus={updateStatus} />}
        {view === "Analytics" && <Analytics jobs={jobs} />}
        {view === "Cover Letter" && <CoverLetter jobs={jobs} user={user} />}
      </div>

      {modal && <Modal job={modal === "new" ? null : modal} onClose={() => setModal(null)} onSave={saveJob} saving={saving} />}
      {timelineJob && <TimelinePanel job={timelineJob} onClose={() => setTimelineJob(null)} />}

      {deleteId && (
        <div style={{ position: "fixed", inset: 0, background: "#000000cc", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setDeleteId(null)}>
          <div style={{ background: "#13131a", border: "1px solid #2a2a38", borderRadius: "14px", padding: "28px", maxWidth: "320px", textAlign: "center" }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: "16px", fontWeight: 700, marginBottom: "8px" }}>Delete application?</div>
            <div style={{ fontSize: "13px", color: "#666", marginBottom: "20px" }}>This can't be undone.</div>
            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={() => setDeleteId(null)} style={{ flex: 1, background: "transparent", border: "1px solid #2a2a38", borderRadius: "8px", color: "#666", padding: "10px", cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
              <button onClick={() => deleteJob(deleteId)} style={{ flex: 1, background: "#F87171", border: "none", borderRadius: "8px", color: "#000", padding: "10px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
