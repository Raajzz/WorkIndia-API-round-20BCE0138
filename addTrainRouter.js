const express = require('express');
const router = express.Router();
const db = require('./db'); // Import the db object
const jwt = require('jsonwebtoken'); // for verifying JWT tokens

require("dotenv").config()

// Middleware to verify the API key
function verifyApiKey(req, res, next) {
  const { api_key } = req.headers;
  if (api_key !== process.env.API_KEY) {
    return res.status(401).json({ status: 'Unauthorized', status_code: 401 });
  }
  next();
}

// Middleware to verify the Authorization Token
function verifyAuthToken(req, res, next) {
  const { authorization } = req.headers;
  if (!authorization || !authorization.startsWith('Bearer ')) {
    return res.status(401).json({ status: 'Unauthorized', status_code: 401 });
  }
  const token = authorization.split(' ')[1];
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ status: 'Unauthorized', status_code: 401 });
    }
    req.user_id = decoded.user_id;
    next();
  });
}

// Create a new train endpoint (admin only)
router.post('/create', verifyApiKey, (req, res) => {
  try {
    const { train_name, source, destination, seat_capacity, arrival_time_at_source, arrival_time_at_destination } = req.body;
    const source_station = source;
    const destination_station = destination;
    const available_seats = seat_capacity;
    // Insert the new train into the Trains table
    const sql = 'INSERT INTO Trains (train_name, source_station, destination_station, seat_capacity, available_seats, arrival_time_at_source, arrival_time_at_destination) VALUES (?, ?, ?, ?, ?, ?, ?)';
    db.query(sql, [train_name, source_station, destination_station, seat_capacity, available_seats, arrival_time_at_source, arrival_time_at_destination], (error, results) => {
      if (error) {
        console.error('Error adding train:', error);
        return res.status(500).json({ status: 'Internal server error', status_code: 500 });
      }

      res.status(200).json({
        message: 'Train added successfully',
        train_id: results.insertId,
      });
    });
  } catch (error) {
    console.error('Error adding train:', error);
    res.status(500).json({ status: 'Internal server error', status_code: 500 });
  }
});

module.exports = router;
