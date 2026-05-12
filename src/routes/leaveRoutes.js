const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const {
  applyLeave,
  getLeaves,
  getAllLeaves,
  updateLeaveStatus,
} = require("../controllers/leaveController");


// ✅ MULTER STORAGE - uses process.cwd() like your main multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dest = path.join(process.cwd(), "uploads", "leaves");

    // Auto-create folder if it doesn't exist
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }

    cb(null, dest);
  },

  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  },
});


// ✅ FILE FILTER - allows both images AND PDFs
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "application/pdf",
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPG, PNG, and PDF files are allowed"), false);
  }
};


// ✅ MULTER INSTANCE
const upload = multer({ storage, fileFilter });


// APPLY LEAVE
router.post(
  "/apply",
  authMiddleware,
  upload.single("document"),
  applyLeave
);

// MY LEAVES
router.get(
  "/my-leaves",
  authMiddleware,
  getLeaves
);

// ADMIN GET ALL LEAVES
router.get(
  "/all",
  authMiddleware,
  roleMiddleware("admin", "hr", "manager"),
  getAllLeaves
);

// UPDATE LEAVE STATUS
router.put(
  "/update-status/:id",
  authMiddleware,
  roleMiddleware("admin", "hr", "manager"),
  updateLeaveStatus
);

module.exports = router;