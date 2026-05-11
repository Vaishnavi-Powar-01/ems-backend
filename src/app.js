const express = require("express");
const cors = require("cors");

require("./config/db");

const app = express();

// Middleware
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://your-frontend-domain.vercel.app"
  ],
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

/* ===================== TEST ROUTE ===================== */

app.get("/", (req, res) => {
  res.send("EMS API Running...");
});

module.exports = app;