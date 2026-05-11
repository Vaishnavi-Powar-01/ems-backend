const express = require("express");
const cors = require("cors");

const db = require("./config/db");

const app = express();
console.log("🔥 app.js is loaded");

// Support multiple origins
const allowedOrigins = [
  'https://ems-frontend-three-ivory.vercel.app',
  'https://ems-frontend-iq55ma1ot-vaishnavi-powar-01s-projects.vercel.app',
  // Add any other valid frontend URLs
];

// Or read from environment variable as comma-separated list
const clientUrls = process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',') : [];

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    
    // Check if origin is allowed
    if (allowedOrigins.indexOf(origin) !== -1 || clientUrls.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log(`Blocked CORS request from: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
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