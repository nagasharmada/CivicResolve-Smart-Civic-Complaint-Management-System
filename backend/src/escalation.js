const pool = require("./db");

const ESCALATION_DAYS = 0;

const runEscalation = async () => {
  try {
    const result = await pool.query(
      `SELECT * FROM complaints
       WHERE status = 'pending'
       AND created_at < NOW() - INTERVAL '${ESCALATION_DAYS} days'`
    );

    for (const complaint of result.rows) {
      // Update complaint status
      await pool.query(
        `UPDATE complaints
         SET status = 'escalated', updated_at = NOW()
         WHERE id = $1`,
        [complaint.id]
      );

      // Insert history
      await pool.query(
        `INSERT INTO complaint_history
         (complaint_id, old_status, new_status, changed_by)
         VALUES ($1, $2, $3, $4)`,
        [complaint.id, "pending", "escalated", null]
      );
    }

    if (result.rows.length > 0) {
      console.log(`Escalated ${result.rows.length} complaints`);
    }

  } catch (err) {
    console.error("Escalation error:", err.message);
  }
};

module.exports = runEscalation;