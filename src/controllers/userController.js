const db = require("../config/db");

// GET USERS (FIXED WITH JOIN)
exports.getUsers = (req, res) => {
  const query = `
    SELECT 
      u.id,
      u.name,
      u.email,
      u.role_id,
      u.department_id,
      r.name AS role_name,
      d.department_name AS department_name,
      u.created_at
    FROM users u
    LEFT JOIN roles r ON u.role_id = r.id
    LEFT JOIN departments d ON u.department_id = d.id
    ORDER BY u.created_at DESC
  `;

  db.query(query, (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
};

// CREATE USER
exports.createUser = (req, res) => {
  const { name, email, password, role_id, department_id } = req.body;

  const query = `
    INSERT INTO users (name, email, password, role_id, department_id)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(
    query,
    [name, email, password, role_id, department_id],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "User created" });
    }
  );
};

// UPDATE USER
exports.updateUser = (req, res) => {
  const { id } = req.params;
  const { name, email, password, role_id, department_id } = req.body;

  let query = `
    UPDATE users 
    SET name=?, email=?, role_id=?, department_id=?
  `;

  const values = [name, email, role_id, department_id];

  if (password) {
    query += `, password=?`;
    values.push(password);
  }

  query += ` WHERE id=?`;
  values.push(id);

  db.query(query, values, (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Updated" });
  });
};

// DELETE
exports.deleteUser = (req, res) => {
  db.query("DELETE FROM users WHERE id=?", [req.params.id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Deleted" });
  });
};