const db = require('../config/db');

// Get all reports
const getAllReports = (req, res) => {
  db.query('SELECT * FROM reports ORDER BY created_at DESC', (err, results) => {
    if (err) {
      console.error('Error fetching reports:', err);
      return res.status(500).json({ error: 'Failed to fetch reports' });
    }
    res.json(results);
  });
};

// Resolve a report (mark as resolved)
const resolveReport = (req, res) => {
  const id = req.params.id;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ error: 'Status is required' });
  }

  db.query(
    'UPDATE reports SET status = ? WHERE id = ?',
    [status, id],
    (err, result) => {
      if (err) {
        console.error('Error updating report:', err);
        return res.status(500).json({ error: 'Failed to update report' });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Report not found' });
      }

      res.json({ message: 'Report updated successfully', reportId: id });
    }
  );
};

// Delete a report
const deleteReport = (req, res) => {
  const id = req.params.id;

  db.query('DELETE FROM reports WHERE id = ?', [id], (err, result) => {
    if (err) {
      console.error('Error deleting report:', err);
      return res.status(500).json({ error: 'Failed to delete report' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Report not found' });
    }

    res.json({ message: 'Report deleted successfully', reportId: id });
  });
};

// Get report statistics
const getReportStats = (req, res) => {
  db.query(
    'SELECT status, COUNT(*) as count FROM reports GROUP BY status',
    (err, results) => {
      if (err) {
        console.error('Error fetching stats:', err);
        return res.status(500).json({ error: 'Failed to fetch statistics' });
      }

      res.json(results);
    }
  );
};

// Get all users
const getAllUsers = (req, res) => {
  db.query('SELECT id, name, email, role FROM users', (err, results) => {
    if (err) {
      console.error('Error fetching users:', err);
      return res.status(500).json({ error: 'Failed to fetch users' });
    }

    res.json(results);
  });
};

// Update user role
const updateUserRole = (req, res) => {
  const userId = req.params.id;
  const { role } = req.body;

  if (!role) {
    return res.status(400).json({ error: 'Role is required' });
  }

  db.query(
    'UPDATE users SET role = ? WHERE id = ?',
    [role, userId],
    (err, result) => {
      if (err) {
        console.error('Error updating user:', err);
        return res.status(500).json({ error: 'Failed to update user' });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({ message: 'User role updated successfully', userId });
    }
  );
};

module.exports = {
  getAllReports,
  resolveReport,
  deleteReport,
  getReportStats,
  getAllUsers,
  updateUserRole
};