import mongoose from "mongoose";

const columnSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ["number", "string", "date"], default: "string" },
  sampleValues: [{ type: String }],
  uniqueCount: { type: Number, default: 0 },
  missingCount: { type: Number, default: 0 },
});

const datasetSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: [true, "Dataset name is required"],
      trim: true,
    },
    originalFilename: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
      default: 0,
    },
    rowCount: {
      type: Number,
      required: true,
    },
    columnCount: {
      type: Number,
      required: true,
    },
    columns: [columnSchema],
    data: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient user queries
datasetSchema.index({ user: 1, createdAt: -1 });

const Dataset = mongoose.model("Dataset", datasetSchema);
export default Dataset;
