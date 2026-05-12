const express = require("express");
const cors = require("cors");

const db = require("./config/db");

const app = express();
const path = require("path");
console.log("🔥 app.js is loaded");

// ===================== CORS =====================

app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://ems-frontend-sooty.vercel.app"
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
}));

// ===================== MIDDLEWARE =====================

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"))
);
 

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

/* ===================== TEST ROUTE ===================== */

app.get("/test-db", (req, res) => {
  db.query("SELECT NOW()", (err, result) => {

    if (err) {
      return res.status(500).json(err);
    }

    res.json({
      success: true,
      database_time: result,
    });
  });
});

/* ===================== HOME ROUTE ===================== */

app.get("/", (req, res) => {
  res.send("EMS API Running...");
});

module.exports = app;