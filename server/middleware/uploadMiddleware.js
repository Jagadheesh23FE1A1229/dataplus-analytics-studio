import multer from "multer";
import path from "path";

// Store file in memory buffer so we can parse directly with stream
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const fileExt = path.extname(file.originalname).toLowerCase();
  const isCsvExt = fileExt === ".csv";
  const isCsvMime =
    file.mimetype === "text/csv" ||
    file.mimetype === "application/vnd.ms-excel" ||
    file.mimetype === "text/plain" ||
    file.mimetype === "application/octet-stream";

  if (isCsvExt || isCsvMime) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only CSV (.csv) files are supported."), false);
  }
};

export const uploadCsv = multer({
  storage,
  limits: {
    fileSize: 15 * 1024 * 1024, // 15MB limit
  },
  fileFilter,
});
