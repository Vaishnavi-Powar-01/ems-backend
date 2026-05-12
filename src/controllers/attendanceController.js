const db = require("../config/db");

const {
  OFFICE_LOCATION,
  ALLOWED_RADIUS,
} = require("../config/officeLocation");


// -------------------- DISTANCE FUNCTION --------------------
function getDistanceInMeters(lat1, lon1, lat2, lon2) {
  const toRad = (value) => (value * Math.PI) / 180;

  const R = 6371e3;

  const φ1 = toRad(lat1);
  const φ2 = toRad(lat2);
  const Δφ = toRad(lat2 - lat1);
  const Δλ = toRad(lon2 - lon1);

  const a =
    Math.sin(Δφ / 2) ** 2 +
    Math.cos(φ1) *
      Math.cos(φ2) *
      Math.sin(Δλ / 2) ** 2;

  const c =
    2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}


// -------------------- SAFE LAT LNG --------------------
function parseLatLng(latitude, longitude) {
  const lat = Number(latitude);
  const lng = Number(longitude);

  if (isNaN(lat) || isNaN(lng)) return null;

  return { lat, lng };
}


// -------------------- IST TODAY DATE FIX --------------------
function getTodayDate() {
  return new Date().toLocaleDateString("en-CA", {
    timeZone: "Asia/Kolkata",
  });
}


// ===================== PUNCH IN =====================
exports.punchIn = (req, res) => {
  const user_id = req.user.id;
  const { latitude, longitude } = req.body;
  const selfie = req.file ? req.file.filename : null;

  const coords = parseLatLng(latitude, longitude);
  if (!coords) {
    return res.status(400).json({ message: "Invalid GPS coordinates" });
  }

  // GEO CHECK
  const distance = getDistanceInMeters(
    OFFICE_LOCATION.latitude,
    OFFICE_LOCATION.longitude,
    coords.lat,
    coords.lng
  );

  if (distance > ALLOWED_RADIUS) {
    return res.status(400).json({
      message: `You are ${Math.round(distance)}m away. Allowed 500m only.`,
    });
  }

  const today = getTodayDate();

  const checkQuery = `
    SELECT id FROM attendance
    WHERE user_id = ? AND attendance_date = ?
    LIMIT 1
  `;

  db.query(checkQuery, [user_id, today], (err, result) => {
    if (err) return res.status(500).json(err);

    if (result.length > 0) {
      return res.status(400).json({
        message: "Already punched in today",
      });
    }

    const insertQuery = `
      INSERT INTO attendance
      (user_id, attendance_date, punch_in, punch_in_selfie, punch_in_latitude, punch_in_longitude)
      VALUES (?, ?, NOW(), ?, ?, ?)
    `;

    db.query(
      insertQuery,
      [user_id, today, selfie, coords.lat, coords.lng],
      (err) => {
        if (err) return res.status(500).json(err);

        res.status(201).json({
          message: "Punch In Successful",
        });
      }
    );
  });
};


// ===================== PUNCH OUT =====================
exports.punchOut = (req, res) => {
  const user_id = req.user.id;
  const { latitude, longitude } = req.body;
  const selfie = req.file ? req.file.filename : null;

  const coords = parseLatLng(latitude, longitude);
  if (!coords) {
    return res.status(400).json({ message: "Invalid GPS coordinates" });
  }

  const today = getTodayDate();

  const getQuery = `
    SELECT * FROM attendance
    WHERE user_id = ? AND attendance_date = ?
    LIMIT 1
  `;

  db.query(getQuery, [user_id, today], (err, result) => {
    if (err) return res.status(500).json(err);

    if (result.length === 0) {
      return res.status(400).json({
        message: "Please punch in first",
      });
    }

    const attendance = result[0];

    if (attendance.punch_out) {
      return res.status(400).json({
        message: "Already punched out",
      });
    }

    // GEO CHECK
    const distance = getDistanceInMeters(
      OFFICE_LOCATION.latitude,
      OFFICE_LOCATION.longitude,
      coords.lat,
      coords.lng
    );

    if (distance > ALLOWED_RADIUS) {
      return res.status(400).json({
        message: `You are ${Math.round(distance)}m away. Cannot punch out.`,
      });
    }

    const punchInTime = new Date(attendance.punch_in);
    const punchOutTime = new Date();

    const diffMs = punchOutTime - punchInTime;

    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    const work_hours = `${hours}h ${minutes}m`;

    const updateQuery = `
      UPDATE attendance
      SET
        punch_out = NOW(),
        punch_out_selfie = ?,
        punch_out_latitude = ?,
        punch_out_longitude = ?,
        work_hours = ?
      WHERE id = ?
    `;

    db.query(
      updateQuery,
      [
        selfie,
        coords.lat,
        coords.lng,
        work_hours,
        attendance.id,
      ],
      (err) => {
        if (err) return res.status(500).json(err);

        res.status(200).json({
          message: "Punch Out Successful",
        });
      }
    );
  });
};


// ===================== MY ATTENDANCE =====================
exports.getMyAttendance = (req, res) => {
  const user_id = req.user.id;

  const query = `
    SELECT * FROM attendance
    WHERE user_id = ?
    ORDER BY attendance_date DESC
  `;

  db.query(query, [user_id], (err, result) => {
    if (err) return res.status(500).json(err);

    res.status(200).json(result);
  });
};


// ===================== ADMIN ATTENDANCE =====================
exports.getAllAttendance = (req, res) => {
  const query = `
    SELECT attendance.*, users.name, users.department
    FROM attendance
    JOIN users ON attendance.user_id = users.id
    ORDER BY attendance_date DESC
  `;

  db.query(query, (err, result) => {
    if (err) return res.status(500).json(err);

    res.status(200).json(result);
  });
};