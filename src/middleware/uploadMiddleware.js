const multer = require("multer");
const path = require("path");
const fs = require("fs");

// ✅ FIX: Use process.cwd() so path is always relative to where node server.js runs
// This resolves to /opt/render/project/src/uploads on Render
// and to your local project root/uploads locally
const BASE_UPLOAD_PATH = path.join(process.cwd(), "uploads");

// ✅ Auto-create all needed subfolders on startup
const subFolders = ["attendance", "leaves", "expenses"];

subFolders.forEach((folder) => {
  const fullPath = path.join(BASE_UPLOAD_PATH, folder);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
    console.log(`📁 Created upload folder: ${fullPath}`);
  }
});

// ✅ Dynamically pick subfolder based on route
// Routes must include a hint in req.baseUrl or req.originalUrl
// e.g. /api/attendance → saves to uploads/attendance/
//      /api/leaves     → saves to uploads/leaves/
//      /api/expenses   → saves to uploads/expenses/
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const url = req.originalUrl || "";

    let subFolder = "misc"; // fallback

    if (url.includes("attendance")) subFolder = "attendance";
    else if (url.includes("leave"))  subFolder = "leaves";
    else if (url.includes("expense")) subFolder = "expenses";

    const dest = path.join(BASE_UPLOAD_PATH, subFolder);

    // Ensure folder exists (safety net)
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

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new Error("Only images allowed"), false);
  }
};

module.exports = multer({ storage, fileFilter });