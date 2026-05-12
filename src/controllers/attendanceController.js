const db = require("../config/db");
const { OFFICE_LOCATION, ALLOWED_RADIUS } = require("../config/officeLocation");


// ================= DISTANCE FUNCTION =================
function getDistanceInMeters(lat1, lon1, lat2, lon2) {
  const toRad = (v) => (v * Math.PI) / 180;

  const R = 6371e3;

  const φ1 = toRad(lat1);
  const φ2 = toRad(lat2);
  const Δφ = toRad(lat2 - lat1);
  const Δλ = toRad(lon2 - lon1);

  const a =
    Math.sin(Δφ / 2) ** 2 +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) ** 2;

  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}


// ================= SAFE DATE =================
function getToday() {
  return new Date().toISOString().split("T")[0];
}


// ================= SAFE LAT LNG =================
function parseLatLng(lat, lng) {
  const latitude = Number(lat);
  const longitude = Number(lng);

  if (isNaN(latitude) || isNaN(longitude)) return null;

  return { latitude, longitude };
}


// ================= PUNCH IN =================
exports.punchIn = (req, res) => {
  try {
    const user_id = req.user?.id;
    if (!user_id) return res.status(401).json({ message: "Unauthorized" });

    const { latitude, longitude } = req.body;
    const selfie = req.file?.filename;

    const coords = parseLatLng(latitude, longitude);
    if (!coords) return res.status(400).json({ message: "Invalid location" });

    const distance = getDistanceInMeters(
      OFFICE_LOCATION.latitude,
      OFFICE_LOCATION.longitude,
      coords.latitude,
      coords.longitude
    );

    if (distance > ALLOWED_RADIUS) {
      return res.status(400).json({
        message: `Outside allowed range (${Math.round(distance)}m)`
      });
    }

    const today = getToday();

    const checkQuery =
      "SELECT * FROM attendance WHERE user_id=? AND attendance_date=?";

    db.query(checkQuery, [user_id, today], (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "DB error" });
      }

      if (result.length > 0) {
        return res.status(400).json({ message: "Already punched in" });
      }

      const insertQuery = `
        INSERT INTO attendance
        (user_id, attendance_date, punch_in, punch_in_selfie, punch_in_latitude, punch_in_longitude)
        VALUES (?, ?, NOW(), ?, ?, ?)
      `;

      db.query(
        insertQuery,
        [
          user_id,
          today,
          selfie,
          coords.latitude,
          coords.longitude,
        ],
        (err) => {
          if (err) {
            console.error(err);
            return res.status(500).json({ message: "Insert failed" });
          }

          res.json({ message: "Punch In Successful" });
        }
      );
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server crash" });
  }
};


// ================= PUNCH OUT =================
exports.punchOut = (req, res) => {
  try {
    const user_id = req.user?.id;
    if (!user_id) return res.status(401).json({ message: "Unauthorized" });

    const { latitude, longitude } = req.body;
    const selfie = req.file?.filename;

    const coords = parseLatLng(latitude, longitude);
    if (!coords) return res.status(400).json({ message: "Invalid location" });

    const today = getToday();

    const getQuery =
      "SELECT * FROM attendance WHERE user_id=? AND attendance_date=?";

    db.query(getQuery, [user_id, today], (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "DB error" });
      }

      if (!result.length) {
        return res.status(400).json({ message: "Punch in first" });
      }

      const record = result[0];

      if (record.punch_out) {
        return res.status(400).json({ message: "Already punched out" });
      }

      const distance = getDistanceInMeters(
        OFFICE_LOCATION.latitude,
        OFFICE_LOCATION.longitude,
        coords.latitude,
        coords.longitude
      );

      if (distance > ALLOWED_RADIUS) {
        return res.status(400).json({
          message: `Outside allowed range (${Math.round(distance)}m)`
        });
      }

      const diff = new Date() - new Date(record.punch_in);

      const hours = Math.floor(diff / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);

      const work_hours = `${hours}h ${minutes}m`;

      const updateQuery = `
        UPDATE attendance
        SET punch_out = NOW(),
            punch_out_selfie=?,
            punch_out_latitude=?,
            punch_out_longitude=?,
            work_hours=?
        WHERE id=?
      `;

      db.query(
        updateQuery,
        [
          selfie,
          coords.latitude,
          coords.longitude,
          work_hours,
          record.id,
        ],
        (err) => {
          if (err) {
            console.error(err);
            return res.status(500).json({ message: "Update failed" });
          }

          res.json({ message: "Punch Out Successful" });
        }
      );
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server crash" });
  }
};


// ================= MY ATTENDANCE =================
exports.getMyAttendance = (req, res) => {
  const user_id = req.user.id;

  const query = `
    SELECT * FROM attendance
    WHERE user_id = ?
    ORDER BY attendance_date DESC
  `;

  db.query(query, [user_id], (err, result) => {
    if (err) return res.status(500).json({ message: "DB error" });

    res.json(result);
  });
};


// ================= ALL ATTENDANCE =================
exports.getAllAttendance = (req, res) => {
  const query = `
    SELECT attendance.*, users.name, users.email
    FROM attendance
    JOIN users ON users.id = attendance.user_id
    ORDER BY attendance_date DESC
  `;

  db.query(query, (err, result) => {
    if (err) return res.status(500).json({ message: "DB error" });

    res.json(result);
  });
};