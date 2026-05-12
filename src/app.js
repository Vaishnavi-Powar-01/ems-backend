const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const db = require("./config/db");

const app = express();

console.log("🔥 app.js is loaded");

// ✅ FIX: Ensure uploads folder exists at startup (process.cwd() = project root on Render)
const uploadsPath = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
  console.log("📁 Created uploads folder at:", uploadsPath);
}

console.log("📂 Serving static files from:", uploadsPath);

// ===================== CORS =====================

app.use(
  cors({
    origin: ["http://localhost:5173", "https://ems-frontend-sooty.vercel.app"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  }),
);

// ===================== MIDDLEWARE =====================

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ FIX: Serve uploads using absolute path via process.cwd()
// Files accessible at: https://ems-backend-nwjj.onrender.com/uploads/attendance/filename.jpg
app.use("/uploads", express.static(uploadsPath));

/* ===================== IMPORT ROUTES ===================== */

const attendanceRoutes = require("./routes/attendanceRoutes");
const authRoutes = require("./routes/authRoutes");
const departmentRoutes = require("./routes/departmentRoutes");
const userRoutes = require("./routes/userRoutes");
const expenseRoutes = require("./routes/expenseRoutes");
const leaveRoutes = require("./routes/leaveRoutes");
const roleRoutes = require("./routes/roleRoutes");

/* ===================== API ROUTES ===================== */

app.use("/api/attendance", attendanceRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/users", userRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/leaves", leaveRoutes);
app.use("/api/roles", roleRoutes);

/* ===================== DEBUG ROUTE ===================== */
// Visit /debug-paths on your backend to confirm folders & files on Render
app.get("/debug-paths", (req, res) => {
  const uploadDir = path.join(process.cwd(), "uploads");
  let files = {};

  try {
    const walk = (dir) =>
      fs.readdirSync(dir).map((f) => {
        const full = path.join(dir, f);
        return fs.statSync(full).isDirectory() ? { [f]: walk(full) } : f;
      });
    files = walk(uploadDir);
  } catch (e) {
    files = { error: e.message };
  }

  res.json({
    cwd: process.cwd(),
    __dirname,
    uploadsPath: uploadDir,
    exists: fs.existsSync(uploadDir),
    files,
  });
});

/* ===================== TEST ROUTE ===================== */

app.get("/test-db", (req, res) => {
  db.query("SELECT NOW()", (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ success: true, database_time: result });
  });
});

/* ===================== HOME ROUTE ===================== */

app.get("/", (req, res) => {
  res.send("EMS API Running...");
});

module.exports = app;
