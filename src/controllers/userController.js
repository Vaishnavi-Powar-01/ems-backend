const db = require("../config/db");


// GET ALL USERS
exports.getUsers = (req, res) => {

  const query = `
    SELECT
      id,
      name,
      email,
      role,
      department,
      created_at
    FROM users
    ORDER BY created_at DESC
  `;

  db.query(query, (err, result) => {
    if (err) return res.status(500).json(err);

    res.status(200).json(result);
  });
};


// CREATE USER (NEW)
exports.createUser = (req, res) => {

  const { name, email, role, department } = req.body;

  const query = `
    INSERT INTO users (name, email, role, department)
    VALUES (?, ?, ?, ?)
  `;

  db.query(query, [name, email, role, department], (err) => {
    if (err) return res.status(500).json(err);

    res.status(201).json({ message: "User created successfully" });
  });
};


// UPDATE USER (NEW)
exports.updateUser = (req, res) => {

  const { id } = req.params;
  const { name, email, role, department } = req.body;

  const query = `
    UPDATE users
    SET name=?, email=?, role=?, department=?
    WHERE id=?
  `;

  db.query(query, [name, email, role, department, id], (err) => {
    if (err) return res.status(500).json(err);

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