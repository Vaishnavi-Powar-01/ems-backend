const db = require("../config/db");

// GET ALL USERS
exports.getUsers = (req, res) => {
  const query = `
    SELECT 
      u.id,
      u.name,
      u.email,
      u.role,
      u.department,
      u.created_at,
      r.name as role_name,
      d.department_name
    FROM users u
    LEFT JOIN roles r ON u.role = r.name
    LEFT JOIN departments d ON u.department = d.id
    ORDER BY u.created_at DESC
  `;

  db.query(query, (err, result) => {
    if (err) return res.status(500).json(err);
    res.status(200).json(result);
  });
};

// CREATE USER
exports.createUser = (req, res) => {
  const { name, email, role, department, password } = req.body;

  // Check if user already exists
  const checkQuery = "SELECT id FROM users WHERE email = ?";
  db.query(checkQuery, [email], (err, results) => {
    if (err) return res.status(500).json(err);
    
    if (results.length > 0) {
      return res.status(400).json({ message: "User with this email already exists" });
    }

    // Insert new user
    const insertQuery = `
      INSERT INTO users (name, email, password, role, department)
      VALUES (?, ?, ?, ?, ?)
    `;
    
    db.query(insertQuery, [name, email, password, role, department], (err, result) => {
      if (err) return res.status(500).json(err);
      res.status(201).json({ message: "User created successfully", userId: result.insertId });
    });
  });
};

// UPDATE USER
exports.updateUser = (req, res) => {
  const { id } = req.params;
  const { name, email, role, department, password } = req.body;

  let query;
  let params;

  if (password) {
    // Update with password
    query = `
      UPDATE users
      SET name = ?, email = ?, role = ?, department = ?, password = ?
      WHERE id = ?
    `;
    params = [name, email, role, department, password, id];
  } else {
    // Update without password
    query = `
      UPDATE users
      SET name = ?, email = ?, role = ?, department = ?
      WHERE id = ?
    `;
    params = [name, email, role, department, id];
  }

  db.query(query, params, (err, result) => {
    if (err) return res.status(500).json(err);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.status(200).json({ message: "User updated successfully" });
  });
};

// DELETE USER
exports.deleteUser = (req, res) => {
  const { id } = req.params;

  const query = "DELETE FROM users WHERE id = ?";
  
  db.query(query, [id], (err, result) => {
    if (err) return res.status(500).json(err);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.status(200).json({ message: "User deleted successfully" });
  });
};