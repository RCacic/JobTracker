const router = require("express").Router();
const db = require("../db");
const authMiddleware = require("../middleware/auth");

// All routes require auth
router.use(authMiddleware);

// GET /api/jobs — get all jobs for logged in user
router.get("/", async (req, res) => {
  try {
    const [jobs] = await db.query(
      "SELECT * FROM jobs WHERE user_id = ? ORDER BY created_at DESC",
      [req.user.id]
    );
    // Attach timeline entries to each job
    const jobIds = jobs.map(j => j.id);
    if (jobIds.length === 0) return res.json([]);

    const [timeline] = await db.query(
      `SELECT * FROM timeline_entries WHERE job_id IN (${jobIds.map(() => "?").join(",")}) ORDER BY entry_date ASC`,
      jobIds
    );

    const result = jobs.map(j => ({
      ...j,
      timeline: timeline.filter(t => t.job_id === j.id),
    }));

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST /api/jobs — create a new job
router.post("/", async (req, res) => {
  const { company, role, status, date, notes, url, source, timeline } = req.body;
  if (!company || !role) return res.status(400).json({ error: "Company and role required" });

  try {
    const [result] = await db.query(
      "INSERT INTO jobs (user_id, company, role, status, date_applied, notes, url, source) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [req.user.id, company, role, status || "Applied", date || null, notes || "", url || "", source || ""]
    );
    const jobId = result.insertId;

    // Insert initial timeline entry
    if (timeline?.length) {
      for (const entry of timeline) {
        await db.query(
          "INSERT INTO timeline_entries (job_id, status, entry_date, note) VALUES (?, ?, ?, ?)",
          [jobId, entry.status, entry.date || new Date().toISOString().split("T")[0], entry.note || ""]
        );
      }
    } else {
      await db.query(
        "INSERT INTO timeline_entries (job_id, status, entry_date, note) VALUES (?, ?, ?, ?)",
        [jobId, status || "Applied", date || new Date().toISOString().split("T")[0], "Application submitted"]
      );
    }

    const [rows] = await db.query("SELECT * FROM jobs WHERE id = ?", [jobId]);
    const [tl] = await db.query("SELECT * FROM timeline_entries WHERE job_id = ?", [jobId]);
    res.status(201).json({ ...rows[0], timeline: tl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// PUT /api/jobs/:id — update a job
router.put("/:id", async (req, res) => {
  const { company, role, status, date, notes, url, source, timeline } = req.body;

  try {
    // Verify ownership
    const [rows] = await db.query("SELECT * FROM jobs WHERE id = ? AND user_id = ?", [req.params.id, req.user.id]);
    if (!rows.length) return res.status(404).json({ error: "Job not found" });

    await db.query(
      "UPDATE jobs SET company=?, role=?, status=?, date_applied=?, notes=?, url=?, source=? WHERE id=?",
      [company, role, status, date || null, notes || "", url || "", source || "", req.params.id]
    );

    // Replace timeline entries
    if (timeline) {
      await db.query("DELETE FROM timeline_entries WHERE job_id = ?", [req.params.id]);
      for (const entry of timeline) {
        await db.query(
          "INSERT INTO timeline_entries (job_id, status, entry_date, note) VALUES (?, ?, ?, ?)",
          [req.params.id, entry.status, entry.date, entry.note || ""]
        );
      }
    }

    const [updated] = await db.query("SELECT * FROM jobs WHERE id = ?", [req.params.id]);
    const [tl] = await db.query("SELECT * FROM timeline_entries WHERE job_id = ? ORDER BY entry_date ASC", [req.params.id]);
    res.json({ ...updated[0], timeline: tl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// PATCH /api/jobs/:id/status — quick status update (used by drag & drop)
router.patch("/:id/status", async (req, res) => {
  const { status } = req.body;
  if (!status) return res.status(400).json({ error: "Status required" });

  try {
    const [rows] = await db.query("SELECT * FROM jobs WHERE id = ? AND user_id = ?", [req.params.id, req.user.id]);
    if (!rows.length) return res.status(404).json({ error: "Job not found" });

    await db.query("UPDATE jobs SET status = ? WHERE id = ?", [status, req.params.id]);
    await db.query(
      "INSERT INTO timeline_entries (job_id, status, entry_date, note) VALUES (?, ?, ?, ?)",
      [req.params.id, status, new Date().toISOString().split("T")[0], "Status updated"]
    );

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// DELETE /api/jobs/:id
router.delete("/:id", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM jobs WHERE id = ? AND user_id = ?", [req.params.id, req.user.id]);
    if (!rows.length) return res.status(404).json({ error: "Job not found" });

    await db.query("DELETE FROM timeline_entries WHERE job_id = ?", [req.params.id]);
    await db.query("DELETE FROM jobs WHERE id = ?", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
