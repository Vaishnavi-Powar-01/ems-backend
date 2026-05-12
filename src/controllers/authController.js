const db = require("../config/db");
const bcrypt = require("bcryptjs");
const generateToken = require("../utils/generateToken");

// Role mapping (adjust these IDs based on your roles table)
const roleMap = {
  1: 'admin',
  2: 'superadmin',
  3: 'hr',
  4: 'manager',
  5: 'employee'
};

// REGISTER
exports.register = async (req, res) => {
  try {

    let {
      name,
      email,
      password,
      role,
      department
    } = req.body;

    // ROLE MAPPING
    if (role && !isNaN(role)) {
      role = roleMap[role] || "employee";
    }

    // VALIDATE ROLE
    const validRoles = [
      "admin",
      "superadmin",
      "hr",
      "manager",
      "employee"
    ];

    if (role && !validRoles.includes(role)) {
      return res.status(400).json({
        message: "Invalid role"
      });
    }

    // CHECK USER
    const checkUserQuery =
      "SELECT * FROM users WHERE email = ?";

    const [existingUsers] =
      await db.promise().query(
        checkUserQuery,
        [email]
      );

    if (existingUsers.length > 0) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    // HASH PASSWORD
    const hashedPassword =
      await bcrypt.hash(password, 10);

    // INSERT USER
    const insertQuery = `
      INSERT INTO users
      (name, email, password, role, department)
      VALUES (?, ?, ?, ?, ?)
    `;

    await db.promise().query(
      insertQuery,
      [
        name,
        email,
        hashedPassword,
        role,
        department,
      ]
    );

    res.status(201).json({
      message: "User registered successfully",
    });

  } catch (error) {

    console.error("Registration error:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// LOGIN
exports.login = (req, res) => {
  try {
    const { email, password } = req.body;

    const query = "SELECT * FROM users WHERE email = ?";

    db.query(query, [email], async (err, result) => {
      if (err) {
        return res.status(500).json(err);
      }

      if (result.length === 0) {
        return res.status(404).json({
          message: "User not found",
        });
      }

      const user = result[0];

      // CHECK PASSWORD
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(400).json({
          message: "Invalid credentials",
        });
      }

      // TOKEN
      const token = generateToken(user);

      res.status(200).json({
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          department: user.department,
        },
      });
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json(error);
  }
};