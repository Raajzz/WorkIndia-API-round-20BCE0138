const express = require('express');
const router = express.Router();
const db = require('./db'); // Import the db object

// Get Seat Availability endpoint for users
router.get('/availability', (req, res) => {
  try {
    const { source, destination } = req.query;

    // Query the database to get trains between the specified source and destination
    const sql = 'SELECT train_id, train_name, available_seats FROM Trains WHERE source_station = ? AND destination_station = ?';
    db.query(sql, [source, destination], (error, results) => {
      if (error) {
        console.error('Error fetching train availability:', error);
        return res.status(500).json({ status: 'Internal server error', status_code: 500 });
      }

      res.status(200).json(results);
    });
  } catch (error) {
    console.error('Error fetching train availability:', error);
    res.status(500).json({ status: 'Internal server error', status_code: 500 });
  }
});

module.exports = router;
