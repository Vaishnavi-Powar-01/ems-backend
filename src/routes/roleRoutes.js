const express = require("express");
const router = express.Router();
const db = require("../config/db");

/* ===================== HELPER ===================== */
// Safely parses permissions — handles JSON array OR old comma-separated string
// e.g. '["user.create","user.view"]' OR "user.create,user.view"
function parsePermissions(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  const str = String(raw).trim();
  if (str.startsWith("[")) {
    try { return JSON.parse(str); } catch { /* fall through */ }
  }
  // Fallback: old comma-separated format
  return str.split(",").map((s) => s.trim()).filter(Boolean);
}

/* ===================== CREATE ROLE ===================== */
router.post("/", (req, res) => {
  const { name, description, status, permissions } = req.body;

  if (!name) {
    return res.status(400).json({
      success: false,
      message: "Role name is required",
    });
  }

  // Check duplicate role
  db.query(
    "SELECT id FROM roles WHERE role_name = ?",
    [name],
    (error, results) => {
      if (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Server Error" });
      }

      if (results.length > 0) {
        return res.status(400).json({ success: false, message: "Role already exists" });
      }

      // Insert role — always store as JSON array string
      db.query(
        `INSERT INTO roles (role_name, description, status, permissions)
         VALUES (?, ?, ?, ?)`,
        [
          name,
          description || "",
          status || "Active",
          JSON.stringify(Array.isArray(permissions) ? permissions : []),
        ],
        (error, result) => {
          if (error) {
            console.log(error);
            return res.status(500).json({ success: false, message: error.message });
          }

          res.json({
            success: true,
            message: "Role Added Successfully",
            id: result.insertId,
          });
        }
      );
    }
  );
});

/* ===================== GET ALL ROLES ===================== */
router.get("/", (req, res) => {
  db.query(
    `SELECT r.*, 
      COUNT(DISTINCT ur.user_id) AS users_count
     FROM roles r
     LEFT JOIN user_roles ur ON r.id = ur.role_id
     GROUP BY r.id
     ORDER BY r.id DESC`,
    (error, results) => {
      if (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Server Error" });
      }

      const formatted = results.map((role) => {
        // parsePermissions handles both JSON and old comma-separated safely
        const permissions = parsePermissions(role.permissions);

        return {
          id: role.id,
          name: role.role_name,
          description: role.description,
          status: role.status,
          permissions,
          permissions_count: permissions.length,
          users_count: role.users_count || 0,
          created_at: role.created_at || null,
        };
      });

      res.json(formatted);
    }
  );
});

/* ===================== GET SINGLE ROLE ===================== */
router.get("/:id", (req, res) => {
  db.query(
    "SELECT * FROM roles WHERE id = ?",
    [req.params.id],
    (error, results) => {
      if (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Server Error" });
      }

      if (results.length === 0) {
        return res.status(404).json({ success: false, message: "Role not found" });
      }

      const role = results[0];

      // Use parsePermissions — this was the crash point with old comma-separated data
      const permissions = parsePermissions(role.permissions);

      res.json({
        id: role.id,
        name: role.role_name,
        description: role.description,
        status: role.status,
        permissions,
        created_at: role.created_at || null,
      });
    }
  );
});

/* ===================== UPDATE ROLE ===================== */
router.put("/:id", (req, res) => {
  const { name, description, status, permissions } = req.body;

  db.query(
    `UPDATE roles 
     SET role_name=?, description=?, status=?, permissions=?
     WHERE id=?`,
    [
      name,
      description || "",
      status || "Active",
      // Always write back as clean JSON — this fixes old comma-separated rows on next save
      JSON.stringify(Array.isArray(permissions) ? permissions : []),
      req.params.id,
    ],
    (error) => {
      if (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Server Error" });
      }

      res.json({ success: true, message: "Role Updated Successfully" });
    }
  );
});

/* ===================== DELETE ROLE ===================== */
router.delete("/:id", (req, res) => {
  db.query(
    "DELETE FROM roles WHERE id = ?",
    [req.params.id],
    (error) => {
      if (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Server Error" });
      }

      res.json({ success: true, message: "Role Deleted Successfully" });
    }
  );
});

module.exports = router;