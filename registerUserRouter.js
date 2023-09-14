const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt'); // for hashing passwords
const jwt = require('jsonwebtoken'); // for generating JWT tokens
const db = require('./db'); // Import the db object

require("dotenv").config();

// Registration endpoint
router.post('/signup', async (req, res) => {
  try {
    const { username, password, email } = req.body;

    // Hash the user's password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert the user into the Users table
    const sql = 'INSERT INTO Users (username, password, email) VALUES (?, ?, ?)';
    db.query(sql, [username, hashedPassword, email], (error, results) => {
      if (error) {
        console.error('Error registering user:', error);
        return res.status(500).json({ status: 'Error registering user', status_code: 500 });
      }

      // Generate a JWT token for the user
      const token = jwt.sign({ user_id: results.insertId }, process.env.JWT_SECRET);

      res.status(200).json({
        status: 'Account successfully created',
        status_code: 200,
        user_id: results.insertId,
        token
      });
    });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ status: 'Error registering user', status_code: 500 });
  }
});

module.exports = router;
