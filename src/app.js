const express = require("express");
const cors = require("cors");

const db = require("./config/db");

const app = express();
console.log("🔥 app.js is loaded");

// Support multiple origins
const allowedOrigins = [
  "http://localhost:5173",
  process.env.CLIENT_URL
];

app.use(cors({
  origin: function (origin, callback) {

    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    console.log("Blocked by CORS:", origin);

    callback(new Error("Not allowed by CORS"));
  },

  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static("uploads"));

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

/* ===================== TEST ROUTE (ADD THIS HERE) ===================== */
 // IMPORTANT ADD THIS

app.get("/test-db", (req, res) => {
  db.query("SELECT NOW()", (err, result) => {
    if (err) return res.json(err);
    res.json(result);
  });
});

/* ===================== HOME ROUTE ===================== */

app.get("/", (req, res) => {
  res.send("EMS API Running...");
});

module.exports = app;