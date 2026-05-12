const db = require("../config/db");


// ADD EXPENSE
exports.addExpense = (
  req,
  res
) => {

  const user_id = req.user.id;

  const {
    category,
    vendor,
    description,
    amount,
    expense_date,
  } = req.body;

  const bill_image =
    req.file
      ? req.file.filename
      : null;

  const expense_no =
    `EXP-${Date.now()}`;


  const query = `
    INSERT INTO expenses
    (
      user_id,
      expense_no,
      category,
      vendor,
      description,
      amount,
      expense_date,
      bill_image
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;


  db.query(
    query,
    [
      user_id,
      expense_no,
      category,
      vendor,
      description,
      amount,
      expense_date,
      bill_image,
    ],
    (err, result) => {

      if (err) {

        console.log(err);

        return res.status(500).json(err);

      }

      res.status(201).json({
        message:
          "Expense Added Successfully",
      });

    }
  );
};


// GET MY EXPENSES
exports.getExpenses = (
  req,
  res
) => {

  const user_id = req.user.id;

 const query = `
  SELECT
    expenses.*,
    users.name
  FROM expenses
  JOIN users
  ON expenses.user_id = users.id
  WHERE expenses.user_id = ?
  ORDER BY expenses.created_at DESC
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


// ADMIN GET ALL EXPENSES
exports.getAllExpenses = (
  req,
  res
) => {

  const query = `
    SELECT
      expenses.*,
      users.name
    FROM expenses
    JOIN users
    ON expenses.user_id = users.id
    ORDER BY expenses.created_at DESC
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


// UPDATE EXPENSE STATUS
exports.updateExpenseStatus = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const approved_by = req.user.id;

  // ✅ validate status
  const allowedStatus = ["pending", "approved", "rejected"];

  if (!allowedStatus.includes(status)) {
    return res.status(400).json({
      message: "Invalid status value",
    });
  }

  const query = `
    UPDATE expenses
    SET status = ?, approved_by = ?
    WHERE id = ?
  `;

  db.query(query, [status, approved_by, id], (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json(err);
    }

    // ✅ IMPORTANT: check if row updated
    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Expense not found",
      });
    }

    res.status(200).json({
      message: "Expense Updated Successfully",
      updated: true,
    });
  });
};