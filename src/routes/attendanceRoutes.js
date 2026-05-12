const express = require("express");
const router = express.Router();

const multer = require("multer");
const path = require("path");
const fs = require("fs");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const {
  punchIn,
  punchOut,
  getMyAttendance,
  getAllAttendance,
} = require("../controllers/attendanceController");


// ================= CREATE UPLOAD FOLDER SAFELY =================
const uploadDir = "uploads/attendance";

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}


// ================= MULTER CONFIG =================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });


// ================= ROUTES =================

// PUNCH IN
router.post(
  "/punch-in",
  authMiddleware,
  upload.single("selfie"),
  punchIn
);

// PUNCH OUT
router.put(
  "/punch-out",
  authMiddleware,
  upload.single("selfie"),
  punchOut
);

// MY ATTENDANCE
router.get(
  "/my-attendance",
  authMiddleware,
  getMyAttendance
);

// ALL ATTENDANCE (ADMIN/HR/MANAGER)
router.get(
  "/all",
  authMiddleware,
  roleMiddleware("admin", "hr", "manager"),
  getAllAttendance
);

module.exports = router;