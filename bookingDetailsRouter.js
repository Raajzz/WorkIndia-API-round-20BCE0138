const express = require('express');
const router = express.Router();
const db = require('./db'); // Import the db object
const jwt = require('jsonwebtoken'); // for verifying JWT tokens

require("dotenv").config()


// Middleware to verify the Authorization Token
function verifyAuthToken(req, res, next) {
  const { authorization } = req.headers;
  if (!authorization || !authorization.startsWith('Bearer ')) {
    return res.status(401).json({ status: 'Unauthorized', status_code: 401 });
  }
  const token = authorization.split(' ')[1];
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.log("hello");
      return res.status(401).json({ status: 'Unauthorized', status_code: 401 });
    }
    req.user_id = decoded.user_id;
    next();
  });
}

// Get Specific Booking Details endpoint for users
router.get('/bookings/:booking_id', verifyAuthToken, (req, res) => {
  try {
    const { booking_id } = req.params;

    // Query the database to get booking details for the specified booking ID
    const sql = `
      SELECT 
        B.booking_id, 
        B.train_id, 
        T.train_name, 
        B.user_id, 
        B.number_of_seats, 
        T.arrival_time_at_source, 
        T.arrival_time_at_destination 
      FROM Bookings AS B
      JOIN Trains AS T ON B.train_id = T.train_id
      WHERE B.booking_id = ? AND B.user_id = ?
    `;
    db.query(sql, [booking_id, req.user_id], (error, results) => {
      if (error) {
        console.error('Error fetching booking details:', error);
        return res.status(500).json({ status: 'Internal server error', status_code: 500 });
      }

      if (results.length === 0) {
        return res.status(404).json({ status: 'Booking not found', status_code: 404 });
      }

      const bookingDetails = results[0];

      res.status(200).json(bookingDetails);
    });
  } catch (error) {
    console.error('Error fetching booking details:', error);
    res.status(500).json({ status: 'Internal server error', status_code: 500 });
  }
});

module.exports = router;
