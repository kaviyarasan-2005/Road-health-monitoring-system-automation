const db = require("../config/db");

// SIGNUP
exports.signup = (req, res) => {
  const { name, email, password } = req.body;

  db.query(
    "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
    [name, email, password],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: "Signup failed" });
      }

      res.json({
        message: "User registered successfully"
      });
    }
  );
};

// LOGIN
exports.login = (req, res) => {

  const { email, password } = req.body;

  db.query(
    "SELECT * FROM users WHERE email = ? AND password = ?",
    [email, password],
    (err, results) => {

      if (err) {
        return res.status(500).json({ message: "Server error" });
      }

      if (results.length === 0) {
        return res.status(401).json({
          message: "Invalid email or password"
        });
      }

      const user = results[0];

      res.json({
        message: "Login successful",
        role: user.role
      });

    }
  );

};