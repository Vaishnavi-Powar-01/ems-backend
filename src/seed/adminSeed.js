const bcrypt = require("bcryptjs");
const db = require("../config/db");

const seedAdmin = async () => {
  try {
    const email = "admin@gmail.com";

    // CHECK EXISTING
    db.query(
      "SELECT * FROM users WHERE email = ?",
      [email],
      async (err, result) => {
        if (err) {
          console.log(err);
          process.exit();
        }

        if (result.length > 0) {
          console.log("Admin already exists");
          process.exit();
        }

        // HASH PASSWORD
        const hashedPassword = await bcrypt.hash("admin123", 10);

        // INSERT ADMIN
        const query = `
          INSERT INTO users
          (name, email, password, role, department)
          VALUES (?, ?, ?, ?, ?)
        `;

        db.query(
          query,
          [
            "Admin User",
            "admin@gmail.com",
            hashedPassword,
            "admin",
            "IT"
          ],
          (err, result) => {
            if (err) {
              console.log(err);
              process.exit();
            }

            console.log("Admin created successfully");
            process.exit();
          }
        );
      }
    );
  } catch (error) {
    console.log(error);
  }
};

seedAdmin();