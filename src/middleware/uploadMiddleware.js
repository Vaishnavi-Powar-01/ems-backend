const multer = require("multer");

const path = require("path");


// STORAGE
const storage = multer.diskStorage({
  
  destination: (req, file, cb) => {
    cb(null, "src/uploads/selfies");
  },

  filename: (req, file, cb) => {
    cb(
      null,
      Date.now() + path.extname(file.originalname)
    );
  },
});


// FILE FILTER
const fileFilter = (req, file, cb) => {
  
  if (
    file.mimetype.startsWith("image")
  ) {
    cb(null, true);
  } else {
    cb(
      new Error("Only images allowed"),
      false
    );
  }
};


const upload = multer({
  storage,
  fileFilter,
});

module.exports = upload;