const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const {
  addExpense,
  getExpenses,
  getAllExpenses,
  updateExpenseStatus,
} = require("../controllers/expenseController");


// ✅ MULTER STORAGE - uses process.cwd() to work on both local and Render
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dest = path.join(process.cwd(), "uploads", "expenses");

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


// ✅ FILE FILTER - images only for expense bills
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPG and PNG images are allowed for bills"), false);
  }
};


// ✅ MULTER INSTANCE
const upload = multer({ storage, fileFilter });


// ADD EXPENSE
router.post(
  "/add",
  authMiddleware,
  upload.single("bill"),
  addExpense
);

// MY EXPENSES
router.get(
  "/my-expenses",
  authMiddleware,
  getExpenses
);

// ADMIN ALL EXPENSES
router.get(
  "/all",
  authMiddleware,
  roleMiddleware("admin", "hr", "manager"),
  getAllExpenses
);

// UPDATE STATUS
router.put(
  "/update-status/:id",
  authMiddleware,
  roleMiddleware("admin", "hr", "manager"),
  updateExpenseStatus
);

module.exports = router;