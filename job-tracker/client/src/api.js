const BASE = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

function getToken() {
  return localStorage.getItem("jt_token");
}

function headers() {
  return {
    "Content-Type": "application/json",
    ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
  };
}

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, { ...options, headers: headers() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

export const api = {
  // Auth
  register: (name, email, password) =>
    request("/auth/register", { method: "POST", body: JSON.stringify({ name, email, password }) }),
  login: (email, password) =>
    request("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),

  // Jobs
  getJobs: () => request("/jobs"),
  createJob: (job) => request("/jobs", { method: "POST", body: JSON.stringify(job) }),
  updateJob: (id, job) => request(`/jobs/${id}`, { method: "PUT", body: JSON.stringify(job) }),
  updateStatus: (id, status) => request(`/jobs/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) }),
  deleteJob: (id) => request(`/jobs/${id}`, { method: "DELETE" }),
};
