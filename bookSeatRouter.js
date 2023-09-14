const express = require('express');
const router = express.Router();
const db = require('./db'); // Import the db object
const jwt = require('jsonwebtoken'); // for verifying JWT tokens

require("dotenv").config()

// Middleware to verify the authorization Token
function verifyAuthToken(req, res, next) {
  console.log(req.headers);
  const { authorization } = req.headers;
  console.log(authorization)
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

// Book a Seat endpoint for users
router.post('/:train_id/book', verifyAuthToken, (req, res) => {
  try {
    const { train_id } = req.params;
    const { user_id, no_of_seats } = req.body;

    // Check if the requested number of seats is available on the train
    const checkAvailabilitySql = 'SELECT available_seats FROM Trains WHERE train_id = ?';
    db.query(checkAvailabilitySql, [train_id], (error, results) => {
      if (error) {
        console.error('Error checking seat availability:', error);
        return res.status(500).json({ status: 'Internal server error', status_code: 500 });
      }

      const availableSeats = results[0].available_seats;
      if (availableSeats < no_of_seats) {
        return res.status(400).json({ status: 'Not enough seats available', status_code: 400 });
      }

      // Book the requested seats
      const bookingSql = 'INSERT INTO Bookings (user_id, train_id, booking_date, number_of_seats) VALUES (?, ?, NOW(), ?)';
      db.query(bookingSql, [user_id, train_id, no_of_seats], (error, result) => {
        if (error) {
          console.error('Error booking seats:', error);
          return res.status(500).json({ status: 'Internal server error', status_code: 500 });
        }

        const bookingId = result.insertId;
        const seatNumbers = Array.from({ length: no_of_seats }, (_, i) => i + 1);

        // Update available seats count on the train
        const updateSeatsSql = 'UPDATE Trains SET available_seats = available_seats - ? WHERE train_id = ?';
        db.query(updateSeatsSql, [no_of_seats, train_id], (error) => {
          if (error) {
            console.error('Error updating seat count on the train:', error);
            return res.status(500).json({ status: 'Internal server error', status_code: 500 });
          }

          res.status(200).json({
            message: 'Seat booked successfully',
            booking_id: bookingId,
            seat_numbers: seatNumbers,
          });
        });
      });
    });
  } catch (error) {
    console.error('Error booking seats:', error);
    res.status(500).json({ status: 'Internal server error', status_code: 500 });
  }
});

module.exports = router;
