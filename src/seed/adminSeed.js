const bcrypt = require("bcrypt");
const db = require("../config/db"); // adjust path if needed

const seedAdmin = async () => {
  const name = "Admin User";
  const email = "admin@gmail.com";
  const password = "admin123";

  const hashedPassword = await bcrypt.hash(password, 10);

  db.query(
    "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
    [name, email, hashedPassword, "superadmin"],
    (err) => {
      if (err) {
        console.log("Error / already exists:", err.message);
      } else {
        console.log("Admin created successfully");
      }
      process.exit();
    }
  );
};

seedAdmin();