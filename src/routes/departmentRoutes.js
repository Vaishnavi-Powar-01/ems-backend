const express = require("express");
const router = express.Router();
const db = require("../config/db");

// ===================== GET ALL =====================
router.get("/", (req, res) => {
  const query = "SELECT * FROM departments ORDER BY id DESC";

  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: err.message,
      });
    }

    res.json(results);
  });
});


// ===================== GET ONE =====================
router.get("/:id", (req, res) => {
  const { id } = req.params;

  db.query(
    "SELECT * FROM departments WHERE id = ?",
    [id],
    (err, results) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: err.message,
        });
      }

      if (results.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Department not found",
        });
      }

      res.json(results[0]);
    }
  );
});


// ===================== CREATE =====================
router.post("/add", (req, res) => {
  const { departmentName, departmentCode, managerName, description } =
    req.body;

  if (!departmentName) {
    return res.status(400).json({
      success: false,
      message: "Department name required",
    });
  }

  const query = `
    INSERT INTO departments 
    (department_name, department_code, manager_name, description)
    VALUES (?, ?, ?, ?)
  `;

  db.query(
    query,
    [departmentName, departmentCode, managerName, description],
    (err, result) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: err.message,
        });
      }

      res.json({
        success: true,
        message: "Department created",
        id: result.insertId,
      });
    }
  );
});


// ===================== UPDATE =====================
router.put("/:id", (req, res) => {
  const { id } = req.params;
  const {
    departmentName,
    departmentCode,
    managerName,
    description,
  } = req.body;

  const query = `
    UPDATE departments 
    SET department_name=?, department_code=?, manager_name=?, description=?
    WHERE id=?
  `;

  db.query(
    query,
    [
      departmentName,
      departmentCode,
      managerName,
      description,
      id,
    ],
    (err) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: err.message,
        });
      }

      res.json({
        success: true,
        message: "Department updated successfully",
      });
    }
  );
});


// ===================== DELETE =====================
router.delete("/:id", (req, res) => {
  db.query(
    "DELETE FROM departments WHERE id=?",
    [req.params.id],
    (err) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: err.message,
        });
      }

      res.json({
        success: true,
        message: "Department deleted successfully",
      });
    }
  );
});

module.exports = router;