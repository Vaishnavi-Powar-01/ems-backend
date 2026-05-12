const db = require("../config/db");

// GET ALL USERS (Updated with JOINs to get names)
exports.getUsers = (req, res) => {
  const query = `
    SELECT 
      u.id, 
      u.name, 
      u.email, 
      u.role_id, 
      u.department_id, 
      r.name AS role_name, 
      d.department_name 
    FROM users u
    LEFT JOIN roles r ON u.role_id = r.id
    LEFT JOIN departments d ON u.department_id = d.id
    ORDER BY u.created_at DESC
  `;

  db.query(query, (err, result) => {
    if (err) {
      console.error("Fetch Users Error:", err);
      return res.status(500).json({ message: "Database error", error: err });
    }
    res.status(200).json(result);
  });
};

// CREATE USER
exports.createUser = (req, res) => {
  // Destructure names as they are sent from the frontend payload
  const { name, email, password, role_id, department_id } = req.body;

  const query = `
    INSERT INTO users (name, email, password, role_id, department_id) 
    VALUES (?, ?, ?, ?, ?)
  `;

  // Note: In a real app, hash the password here using bcrypt
  db.query(query, [name, email, password, role_id, department_id], (err) => {
    if (err) {
      console.error("Create User Error:", err);
      return res.status(500).json({ message: "Failed to create user" });
    }
    res.status(201).json({ message: "User created successfully" });
  });
};

// UPDATE USER
exports.updateUser = (req, res) => {
  const { id } = req.params;
  const { name, email, role_id, department_id, password } = req.body;

  // If password is provided, update it; otherwise, keep the old one
  let query;
  let params;

  if (password) {
    query = `UPDATE users SET name=?, email=?, role_id=?, department_id=?, password=? WHERE id=?`;
    params = [name, email, role_id, department_id, password, id];
  } else {
    query = `UPDATE users SET name=?, email=?, role_id=?, department_id=? WHERE id=?`;
    params = [name, email, role_id, department_id, id];
  }

  db.query(query, params, (err) => {
    if (err) {
      console.error("Update User Error:", err);
      return res.status(500).json({ message: "Failed to update user" });
    }
    res.status(200).json({ message: "User updated successfully" });
  });
};

// DELETE USER
exports.deleteUser = (req, res) => {
  const { id } = req.params;
  const query = "DELETE FROM users WHERE id = ?";

  db.query(query, [id], (err) => {
    if (err) return res.status(500).json(err);
    res.status(200).json({ message: "User deleted successfully" });
  });
};