import mongoose from "mongoose";

const widgetSchema = new mongoose.Schema({
  id: { type: String, required: true },
  type: {
    type: String,
    enum: ["kpi", "bar", "horizontal-bar", "line", "pie", "doughnut"],
    required: true,
  },
  title: { type: String, default: "Widget" },
  colSpan: { type: Number, default: 1 }, // 1 = half width (or 1/3), 2 = full width
  metricColumn: { type: String, default: "" },
  categoryColumn: { type: String, default: "" },
  aggregation: {
    type: String,
    enum: ["sum", "avg", "count", "min", "max"],
    default: "sum",
  },
  colorPalette: { type: String, default: "indigo" },
  prefix: { type: String, default: "" },
  suffix: { type: String, default: "" },
  icon: { type: String, default: "TrendingUp" },
  sortBy: { type: String, default: "value-desc" },
  notes: { type: String, default: "" },
});

const dashboardSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    dataset: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Dataset",
      required: true,
    },
    title: {
      type: String,
      required: [true, "Dashboard title is required"],
      trim: true,
      maxlength: [120, "Title cannot exceed 120 characters"],
    },
    description: {
      type: String,
      default: "",
      maxlength: [300, "Description cannot exceed 300 characters"],
    },
    widgets: [widgetSchema],
    filters: {
      dateRange: {
        startDate: { type: String, default: "" },
        endDate: { type: String, default: "" },
        column: { type: String, default: "" },
      },
      categoryFilter: {
        column: { type: String, default: "" },
        selectedValues: [{ type: String }],
      },
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient user queries
dashboardSchema.index({ user: 1, createdAt: -1 });

const Dashboard = mongoose.model("Dashboard", dashboardSchema);
export default Dashboard;
