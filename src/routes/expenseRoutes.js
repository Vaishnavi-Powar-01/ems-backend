const express = require("express");

const router = express.Router();

const multer = require("multer");

const path = require("path");

const authMiddleware = require(
  "../middleware/authMiddleware"
);

const roleMiddleware = require(
  "../middleware/roleMiddleware"
);

const {
  addExpense,
  getExpenses,
  getAllExpenses,
  updateExpenseStatus,
} = require(
  "../controllers/expenseController"
);


// MULTER
const storage =
  multer.diskStorage({

    destination:
      (req, file, cb) => {

        cb(
          null,
          "src/uploads/expenses"
        );

      },

    filename:
      (req, file, cb) => {

        cb(
          null,
          Date.now() +
            path.extname(
              file.originalname
            )
        );

      },
  });


const upload =
  multer({ storage });


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
  roleMiddleware(
    "admin",
    "hr",
    "manager"
  ),
  getAllExpenses
);


// UPDATE STATUS
router.put(
  "/update-status/:id",
  authMiddleware,
  roleMiddleware(
    "admin",
    "hr",
    "manager"
  ),
  updateExpenseStatus
);

module.exports = router;