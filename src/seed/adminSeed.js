const db = require("../config/db");
const bcrypt = require("bcrypt");

const createAdmin = async () => {
  try {
    const email = "admin@gmail.com";

    // check if admin already exists
    const [rows] = await db.promise().query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (rows.length > 0) {
      console.log("Admin already exists");
      return;
    }

    const hashedPassword = await bcrypt.hash("admin123", 10);

    await db.promise().query(
      `INSERT INTO users (name, email, password, role)
       VALUES (?, ?, ?, ?)`,
      ["Admin", email, hashedPassword, "superadmin"]
    );

    console.log("Default admin created successfully");
  } catch (err) {
    console.log("Error creating admin:", err);
  }
};

module.exports = createAdmin;