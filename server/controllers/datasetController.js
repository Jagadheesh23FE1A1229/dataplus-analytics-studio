import fs from "fs";
import path from "path";
import { Readable } from "stream";
import csvParser from "csv-parser";
import Dataset from "../models/Dataset.js";
import Dashboard from "../models/Dashboard.js";
import { memoryStore } from "../utils/memoryStore.js";
import mongoose from "mongoose";

// Helper: Infer column data type and extract stats
export const analyzeDatasetColumns = (rows) => {
  if (!rows || rows.length === 0) return [];

  const headers = Object.keys(rows[0]);
  const sampleSize = Math.min(rows.length, 100);

  return headers.map((col) => {
    let numericCount = 0;
    let dateCount = 0;
    let missingCount = 0;
    const uniqueValues = new Set();
    const sampleValues = [];

    for (let i = 0; i < rows.length; i++) {
      const val = rows[i][col];

      if (val === undefined || val === null || val.toString().trim() === "") {
        missingCount++;
        continue;
      }

      const strVal = val.toString().trim();
      if (sampleValues.length < 5 && !sampleValues.includes(strVal)) {
        sampleValues.push(strVal);
      }

      if (i < 500) {
        uniqueValues.add(strVal);
      }

      // Check numeric
      const cleanNum = strVal.replace(/[$,€£%]/g, "").trim();
      if (cleanNum !== "" && !isNaN(Number(cleanNum))) {
        numericCount++;
      } else {
        // Check date
        const dateParsed = Date.parse(strVal);
        if (
          !isNaN(dateParsed) &&
          strVal.length >= 8 &&
          (strVal.includes("-") || strVal.includes("/") || strVal.includes("T"))
        ) {
          dateCount++;
        }
      }
    }

    const validEntries = rows.length - missingCount;
    let inferredType = "string";

    if (validEntries > 0) {
      if (numericCount / validEntries >= 0.8) {
        inferredType = "number";
      } else if (dateCount / validEntries >= 0.8) {
        inferredType = "date";
      }
    }

    return {
      name: col,
      type: inferredType,
      sampleValues,
      uniqueCount: uniqueValues.size,
      missingCount,
    };
  });
};

// Helper: Parse CSV buffer into JSON array of row objects
const parseCsvBuffer = (buffer) => {
  return new Promise((resolve, reject) => {
    const results = [];
    const stream = Readable.from(buffer);

    stream
      .pipe(
        csvParser({
          mapHeaders: ({ header }) => header.trim().replace(/^["']|["']$/g, ""),
          mapValues: ({ value }) => (typeof value === "string" ? value.trim() : value),
        })
      )
      .on("data", (data) => results.push(data))
      .on("end", () => resolve(results))
      .on("error", (error) => reject(error));
  });
};

// @desc    Upload CSV Dataset
// @route   POST /api/datasets/upload
// @access  Private
export const uploadDataset = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No CSV file uploaded. Please select a .csv file.",
      });
    }

    const customName = req.body.name?.trim() || req.file.originalname.replace(/\.[^/.]+$/, "");
    const parsedRows = await parseCsvBuffer(req.file.buffer);

    if (parsedRows.length === 0) {
      return res.status(400).json({
        success: false,
        message: "The uploaded CSV file is empty or formatted incorrectly.",
      });
    }

    const columns = analyzeDatasetColumns(parsedRows);
    const isConnected = mongoose.connection.readyState === 1;

    const datasetPayload = {
      user: req.user._id,
      name: customName,
      originalFilename: req.file.originalname,
      fileSize: req.file.size,
      rowCount: parsedRows.length,
      columnCount: columns.length,
      columns,
      data: parsedRows,
    };

    let savedDataset;
    if (isConnected) {
      savedDataset = await Dataset.create(datasetPayload);
    } else {
      savedDataset = memoryStore.saveDataset(datasetPayload);
    }

    res.status(201).json({
      success: true,
      message: "Dataset uploaded and analyzed successfully",
      dataset: {
        id: savedDataset._id,
        name: savedDataset.name,
        originalFilename: savedDataset.originalFilename,
        rowCount: savedDataset.rowCount,
        columnCount: savedDataset.columnCount,
        columns: savedDataset.columns,
        createdAt: savedDataset.createdAt,
      },
    });
  } catch (error) {
    console.error("CSV Upload error:", error);
    next(error);
  }
};

// @desc    Load Pre-packaged Sample Sales Dataset
// @route   POST /api/datasets/sample
// @access  Private
export const loadSampleDataset = async (req, res, next) => {
  try {
    // Look for sample file in sample_data directory
    const samplePath = path.resolve(process.cwd(), "../sample_data/global_superstore_sample.csv");
    let fileBuffer;

    if (fs.existsSync(samplePath)) {
      fileBuffer = fs.readFileSync(samplePath);
    } else {
      // Local fallback in server
      const localSamplePath = path.resolve(process.cwd(), "sample_data/global_superstore_sample.csv");
      if (fs.existsSync(localSamplePath)) {
        fileBuffer = fs.readFileSync(localSamplePath);
      } else {
        return res.status(404).json({
          success: false,
          message: "Sample dataset file not found on server.",
        });
      }
    }

    const parsedRows = await parseCsvBuffer(fileBuffer);
    const columns = analyzeDatasetColumns(parsedRows);
    const isConnected = mongoose.connection.readyState === 1;

    const datasetPayload = {
      user: req.user._id,
      name: "Global Superstore Sales (Demo)",
      originalFilename: "global_superstore_sample.csv",
      fileSize: fileBuffer.length,
      rowCount: parsedRows.length,
      columnCount: columns.length,
      columns,
      data: parsedRows,
    };

    let savedDataset;
    if (isConnected) {
      savedDataset = await Dataset.create(datasetPayload);
    } else {
      savedDataset = memoryStore.saveDataset(datasetPayload);
    }

    res.status(201).json({
      success: true,
      message: "Sample dataset loaded successfully",
      dataset: {
        id: savedDataset._id,
        name: savedDataset.name,
        originalFilename: savedDataset.originalFilename,
        rowCount: savedDataset.rowCount,
        columnCount: savedDataset.columnCount,
        columns: savedDataset.columns,
        createdAt: savedDataset.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all datasets for current user
// @route   GET /api/datasets
// @access  Private
export const getDatasets = async (req, res, next) => {
  try {
    const isConnected = mongoose.connection.readyState === 1;
    let datasets;

    if (isConnected) {
      datasets = await Dataset.find({ user: req.user._id })
        .select("-data")
        .sort({ createdAt: -1 });
    } else {
      datasets = memoryStore.getDatasetsByUser(req.user._id);
    }

    res.json({
      success: true,
      count: datasets.length,
      datasets,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single dataset by ID with full data
// @route   GET /api/datasets/:id
// @access  Private
export const getDatasetById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const isConnected = mongoose.connection.readyState === 1;
    let dataset;

    if (isConnected) {
      dataset = await Dataset.findById(id);
    } else {
      dataset = memoryStore.getDatasetById(id);
    }

    if (!dataset) {
      return res.status(404).json({
        success: false,
        message: "Dataset not found",
      });
    }

    // Check ownership
    if (dataset.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to access this dataset",
      });
    }

    res.json({
      success: true,
      dataset,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a dataset and linked dashboards
// @route   DELETE /api/datasets/:id
// @access  Private
export const deleteDataset = async (req, res, next) => {
  try {
    const { id } = req.params;
    const isConnected = mongoose.connection.readyState === 1;

    if (isConnected) {
      const dataset = await Dataset.findById(id);
      if (!dataset) {
        return res.status(404).json({ success: false, message: "Dataset not found" });
      }

      if (dataset.user.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: "Not authorized" });
      }

      // Delete linked dashboards
      await Dashboard.deleteMany({ dataset: id });
      await dataset.deleteOne();
    } else {
      const success = memoryStore.deleteDataset(id, req.user._id);
      if (!success) {
        return res.status(404).json({ success: false, message: "Dataset not found or unauthorized" });
      }
    }

    res.json({
      success: true,
      message: "Dataset and associated dashboards removed successfully",
    });
  } catch (error) {
    next(error);
  }
};
