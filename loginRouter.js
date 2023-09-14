const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt'); // for hashing passwords
const jwt = require('jsonwebtoken'); // for generating JWT tokens
const db = require('./db'); // Import the db object

require("dotenv").config()

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check if the user exists in the Users table
    const checkUserQuery = 'SELECT * FROM Users WHERE username = ?';
    db.query(checkUserQuery, [username], async (error, results) => {
      if (error) {
        console.error('Error checking user:', error);
        return res.status(500).json({ status: 'Internal server error', status_code: 500 });
      }

      if (results.length === 0) {
        // User not found
        return res.status(401).json({
          status: 'Incorrect username/password provided. Please retry',
          status_code: 401,
        });
      }

      // Verify the provided password with the hashed password in the database
      const user = results[0];
      const passwordMatch = await bcrypt.compare(password, user.password);

      if (!passwordMatch) {
        // Incorrect password
        return res.status(401).json({
          status: 'Incorrect username/password provided. Please retry',
          status_code: 401,
        });
      }

      // Generate a JWT token for the user
      const token = jwt.sign({ user_id: user.user_id }, process.env.JWT_SECRET);

      res.status(200).json({
        status: 'Login successful',
        status_code: 200,
        user_id: user.user_id,
        access_token: token,
      });
    });
  } catch (error) {
    console.error('Error logging in user:', error);
    res.status(500).json({ status: 'Internal server error', status_code: 500 });
  }
});

module.exports = router;