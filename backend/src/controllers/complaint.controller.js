const pool = require("../db");

// CREATE COMPLAINT (Protected)
exports.createComplaint = async (req, res, next) => {
  const { category, description, latitude, longitude, photo_url } = req.body;

  if (!category || !description || !latitude || !longitude) {
    return res.status(400).json({ error: "Category, description, latitude and longitude are required" });
  }

  try {
    const result = await pool.query(
      `INSERT INTO complaints 
      (user_id, category, description, latitude, longitude, photo_url, status)
      VALUES ($1,$2,$3,$4,$5,$6,'open')
      RETURNING *`,
      [
        req.user.user_id,
        category,
        description,
        parseFloat(latitude),
        parseFloat(longitude),
        photo_url || null,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

// GET MY COMPLAINTS (Protected — citizen sees only their own)
exports.getMyComplaints = async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT complaints.*, users.name AS reporter_name
       FROM complaints
       JOIN users ON complaints.user_id = users.id
       WHERE complaints.user_id = $1
       ORDER BY complaints.created_at DESC`,
      [req.user.user_id]
    );

    res.json(result.rows);
  } catch (err) {
    next(err);
  }
};

// GET ALL COMPLAINTS (Admin Only)
exports.getAllComplaints = async (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Access denied" });
  }

  try {
    const result = await pool.query(
      `SELECT complaints.*, users.name AS reporter_name, users.email AS reporter_email
       FROM complaints
       JOIN users ON complaints.user_id = users.id
       ORDER BY complaints.created_at DESC`
    );

    res.json(result.rows);
  } catch (err) {
    next(err);
  }
};

// GET PUBLIC COMPLAINTS (No auth needed — used by PublicMap)
exports.getAllPublic = async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT id, category, description, latitude, longitude, status, created_at
       FROM complaints
       ORDER BY created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
};

// UPDATE STATUS (Admin Only)
exports.updateStatus = async (req, res, next) => {
  const { id } = req.params;
  const { new_status } = req.body;

  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Access denied" });
  }

  const VALID_STATUSES = ["open", "under_review", "in_progress", "resolved", "rejected"];
  if (!VALID_STATUSES.includes(new_status)) {
    return res.status(400).json({ error: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}` });
  }

  try {
    // Get old status first
    const oldResult = await pool.query(
      "SELECT status FROM complaints WHERE id = $1",
      [id]
    );

    if (oldResult.rows.length === 0) {
      return res.status(404).json({ error: "Complaint not found" });
    }

    const oldStatus = oldResult.rows[0].status;

    // Update the complaint
    const updated = await pool.query(
      `UPDATE complaints 
       SET status = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [new_status, id]
    );

    // Record history
    await pool.query(
      `INSERT INTO complaint_history 
       (complaint_id, old_status, new_status, changed_by)
       VALUES ($1, $2, $3, $4)`,
      [id, oldStatus, new_status, req.user.user_id]
    );

    res.json({
      message: "Status updated",
      complaint: updated.rows[0],
    });
  } catch (err) {
    next(err);
  }
};