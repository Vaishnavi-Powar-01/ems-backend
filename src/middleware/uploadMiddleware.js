const multer = require("multer");
const path = require("path");
const fs = require("fs");

const BASE_UPLOAD_PATH = path.join(process.cwd(), "uploads");

// Auto-create all needed subfolders on startup
const subFolders = ["attendance", "leaves", "expenses", "misc"];

subFolders.forEach((folder) => {
  const fullPath = path.join(BASE_UPLOAD_PATH, folder);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
    console.log(`📁 Created upload folder: ${fullPath}`);
  }
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const url = req.originalUrl || "";

    let subFolder = "misc";

    if (url.includes("attendance")) subFolder = "attendance";
    else if (url.includes("leave")) subFolder = "leaves";
    else if (url.includes("expense")) subFolder = "expenses";

    const dest = path.join(BASE_UPLOAD_PATH, subFolder);

    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }

    cb(null, dest);
  },

  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  },
});

// ✅ FIXED: attendance = images only | leaves & expenses = images + PDF
const fileFilter = (req, file, cb) => {
  const url = req.originalUrl || "";

  const isImage = file.mimetype.startsWith("image");
  const isPDF = file.mimetype === "application/pdf";

  if (url.includes("attendance")) {
    // Selfies only — no PDFs
    if (isImage) {
      cb(null, true);
    } else {
      cb(new Error("Only images allowed for attendance"), false);
    }
  } else if (url.includes("leave") || url.includes("expense")) {
    // Medical certificates, receipts — images + PDF allowed
    if (isImage || isPDF) {
      cb(null, true);
    } else {
      cb(new Error("Only JPG, PNG, and PDF files are allowed"), false);
    }
  } else {
    // Fallback: images only
    if (isImage) {
      cb(null, true);
    } else {
      cb(new Error("Only images allowed"), false);
    }
  }
};

module.exports = multer({ storage, fileFilter });