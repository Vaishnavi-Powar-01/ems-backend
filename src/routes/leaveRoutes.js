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
  applyLeave,
  getLeaves,
  getAllLeaves,
  updateLeaveStatus,
} = require(
  "../controllers/leaveController"
);


// MULTER STORAGE
const storage =
  multer.diskStorage({

    destination:
      (req, file, cb) => {

        cb(
          null,
          "src/uploads/leaves"
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


// MULTER
const upload =
  multer({ storage });

  


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
  roleMiddleware(
    "admin",
    "hr",
    "manager"
  ),
  getAllLeaves
);


// UPDATE LEAVE STATUS
router.put(
  "/update-status/:id",
  authMiddleware,
  roleMiddleware(
    "admin",
    "hr",
    "manager"
  ),
  updateLeaveStatus
);

module.exports = router;