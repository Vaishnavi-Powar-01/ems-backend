const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
} = require("../controllers/userController");

// ================= GET ALL USERS =================
router.get(
  "/",
  authMiddleware,
  roleMiddleware("admin"),
  getUsers
);

// ================= CREATE USER =================
router.post(
  "/",
  authMiddleware,
  roleMiddleware("admin"),
  createUser
);

// ================= UPDATE USER =================
router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("admin"),
  updateUser
);

// ================= DELETE USER =================
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("admin"),
  deleteUser
);

module.exports = router;