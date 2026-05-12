const mysql = require("mysql2");

// CREATE POOL
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || "defaultdb",
  port: parseInt(process.env.DB_PORT) || 19519,

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,

  ssl: {
    rejectUnauthorized: false,
  },
});

// TEST CONNECTION
pool.getConnection((err, connection) => {

  if (err) {
    console.error("❌ Database connection failed:");
    console.error(err.message);
    return;
  }

  console.log("✅ Database connected successfully");

  connection.release();
});

module.exports = pool;