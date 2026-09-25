import express from "express";
import {
  uploadDataset,
  loadSampleDataset,
  getDatasets,
  getDatasetById,
  deleteDataset,
} from "../controllers/datasetController.js";
import { protect } from "../middleware/authMiddleware.js";
import { uploadCsv } from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.use(protect); // All dataset routes require authentication

router.post("/upload", uploadCsv.single("file"), uploadDataset);
router.post("/sample", loadSampleDataset);
router.get("/", getDatasets);
router.get("/:id", getDatasetById);
router.delete("/:id", deleteDataset);

export default router;
