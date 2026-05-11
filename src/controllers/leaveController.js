const db = require("../config/db");


// APPLY LEAVE
exports.applyLeave = (req, res) => {

  const user_id = req.user.id;

  const {
    leave_type,
    from_date,
    to_date,
    reason,
  } = req.body;


  // DOCUMENT
  const document =
    req.file
      ? req.file.filename
      : null;


  if (
    !leave_type ||
    !from_date ||
    !to_date ||
    !reason
  ) {

    return res.status(400).json({
      message:
        "All fields are required",
    });

  }


  const start =
    new Date(from_date);

  const end =
    new Date(to_date);


  const diffTime =
    Math.abs(end - start);


  const total_days =
    Math.ceil(
      diffTime /
        (1000 * 60 * 60 * 24)
    ) + 1;


  const query = `
    INSERT INTO leaves
    (
      user_id,
      leave_type,
      from_date,
      to_date,
      total_days,
      reason,
      document
    )
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;


  db.query(
    query,
    [
      user_id,
      leave_type,
      from_date,
      to_date,
      total_days,
      reason,
      document,
    ],
    (err, result) => {

      if (err) {

        console.log(err);

        return res.status(500).json(err);

      }

      res.status(201).json({
        message:
          "Leave Applied Successfully",
      });

    }
  );
};


// GET MY LEAVES
exports.getLeaves = (
  req,
  res
) => {

  const user_id = req.user.id;

  const query = `
    SELECT *
    FROM leaves
    WHERE user_id = ?
    ORDER BY created_at DESC
  `;

  db.query(
    query,
    [user_id],
    (err, result) => {

      if (err) {

        console.log(err);

        return res.status(500).json(err);

      }

      res.status(200).json(result);

    }
  );
};


// GET ALL LEAVES
exports.getAllLeaves = (
  req,
  res
) => {

  const query = `
    SELECT
      leaves.*,
      users.name,
      users.department
    FROM leaves
    JOIN users
    ON leaves.user_id = users.id
    ORDER BY leaves.created_at DESC
  `;

  db.query(
    query,
    (err, result) => {

      if (err) {

        console.log(err);

        return res.status(500).json(err);

      }

      res.status(200).json(result);

    }
  );
};


// UPDATE LEAVE STATUS
exports.updateLeaveStatus = (
  req,
  res
) => {

  const { id } = req.params;

  const {
    status,
    admin_comment,
  } = req.body;

  const approved_by =
    req.user.id;


  const query = `
    UPDATE leaves
    SET
      status = ?,
      admin_comment = ?,
      approved_by = ?
    WHERE id = ?
  `;


  db.query(
    query,
    [
      status,
      admin_comment,
      approved_by,
      id,
    ],
    (err, result) => {

      if (err) {

        console.log(err);

        return res.status(500).json(err);

      }

      res.status(200).json({
        message:
          "Leave Status Updated",
      });

    }
  );
};