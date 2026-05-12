const db = require("../config/db");

// ================= GET USERS =================
exports.getUsers = (req, res) => {
  const query = `
    SELECT 
      u.id,
      u.name,
      u.email,
      u.role_id,
      u.department_id,
      r.name AS role_name,
      d.department_name,
      u.created_at
    FROM users u
    LEFT JOIN roles r ON u.role_id = r.id
    LEFT JOIN departments d ON u.department_id = d.id
    ORDER BY u.created_at DESC
  `;

  db.query(query, (err, result) => {
    if (err) return res.status(500).json(err);
    res.status(200).json(result);
  });
};


// ================= CREATE USER =================
exports.createUser = (req, res) => {
  const { name, email, password, role_id, department_id } = req.body;

  const query = `
    INSERT INTO users (name, email, password, role_id, department_id)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(
    query,
    [name, email, password, role_id, department_id || null],
    (err) => {
      if (err) return res.status(500).json(err);

      res.status(201).json({ message: "User created successfully" });
    }
  );
};


// ================= UPDATE USER =================
exports.updateUser = (req, res) => {
  const { id } = req.params;
  const { name, email, password, role_id, department_id } = req.body;

  let query = `
    UPDATE users
    SET name=?, email=?, role_id=?, department_id=?
  `;

  const params = [name, email, role_id, department_id || null];

  if (password) {
    query += `, password=?`;
    params.push(password);
  }

  query += ` WHERE id=?`;
  params.push(id);

  db.query(query, params, (err) => {
    if (err) return res.status(500).json(err);

    res.status(200).json({ message: "User updated successfully" });
  });
};


// ================= DELETE USER =================
exports.deleteUser = (req, res) => {
  const { id } = req.params;

  const query = "DELETE FROM users WHERE id = ?";

  db.query(query, [id], (err) => {
    if (err) return res.status(500).json(err);

    res.status(200).json({ message: "User deleted successfully" });
  });
};