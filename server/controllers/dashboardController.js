import Dashboard from "../models/Dashboard.js";
import Dataset from "../models/Dataset.js";
import { memoryStore } from "../utils/memoryStore.js";
import mongoose from "mongoose";

// @desc    Create a new dashboard
// @route   POST /api/dashboards
// @access  Private
export const createDashboard = async (req, res, next) => {
  try {
    const { title, description, datasetId, widgets, filters } = req.body;

    if (!title || !datasetId) {
      return res.status(400).json({
        success: false,
        message: "Title and datasetId are required to create a dashboard.",
      });
    }

    const isConnected = mongoose.connection.readyState === 1;

    // Verify dataset exists and belongs to user
    let dataset;
    if (isConnected) {
      dataset = await Dataset.findById(datasetId);
    } else {
      dataset = memoryStore.getDatasetById(datasetId);
    }

    if (!dataset) {
      return res.status(404).json({
        success: false,
        message: "Referenced dataset not found.",
      });
    }

    if (dataset.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only create dashboards for your own datasets.",
      });
    }

    const dashboardPayload = {
      user: req.user._id,
      dataset: datasetId,
      title: title.trim(),
      description: description?.trim() || "",
      widgets: widgets || [],
      filters: filters || {},
      isPublic: false,
    };

    let savedDashboard;
    if (isConnected) {
      savedDashboard = await Dashboard.create(dashboardPayload);
    } else {
      savedDashboard = memoryStore.saveDashboard(dashboardPayload);
    }

    res.status(201).json({
      success: true,
      message: "Dashboard created successfully",
      dashboard: savedDashboard,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all dashboards for logged-in user
// @route   GET /api/dashboards
// @access  Private
export const getDashboards = async (req, res, next) => {
  try {
    const isConnected = mongoose.connection.readyState === 1;
    let dashboards;

    if (isConnected) {
      dashboards = await Dashboard.find({ user: req.user._id })
        .populate("dataset", "name originalFilename rowCount columnCount")
        .sort({ updatedAt: -1 });
    } else {
      dashboards = memoryStore.getDashboardsByUser(req.user._id);
    }

    res.json({
      success: true,
      count: dashboards.length,
      dashboards,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single dashboard by ID
// @route   GET /api/dashboards/:id
// @access  Private
export const getDashboardById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const isConnected = mongoose.connection.readyState === 1;
    let dashboard;

    if (isConnected) {
      dashboard = await Dashboard.findById(id).populate("dataset");
    } else {
      dashboard = memoryStore.getDashboardById(id);
      if (dashboard) {
        dashboard.dataset = memoryStore.getDatasetById(dashboard.dataset);
      }
    }

    if (!dashboard) {
      return res.status(404).json({
        success: false,
        message: "Dashboard not found.",
      });
    }

    // Check ownership unless public
    if (!dashboard.isPublic && dashboard.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view this private dashboard.",
      });
    }

    res.json({
      success: true,
      dashboard,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a dashboard
// @route   PUT /api/dashboards/:id
// @access  Private
export const updateDashboard = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, widgets, filters, isPublic } = req.body;
    const isConnected = mongoose.connection.readyState === 1;

    let dashboard;
    if (isConnected) {
      dashboard = await Dashboard.findById(id);
      if (!dashboard) {
        return res.status(404).json({ success: false, message: "Dashboard not found." });
      }

      if (dashboard.user.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: "Not authorized." });
      }

      if (title !== undefined) dashboard.title = title;
      if (description !== undefined) dashboard.description = description;
      if (widgets !== undefined) dashboard.widgets = widgets;
      if (filters !== undefined) dashboard.filters = filters;
      if (isPublic !== undefined) dashboard.isPublic = isPublic;

      dashboard = await dashboard.save();
    } else {
      dashboard = memoryStore.updateDashboard(id, req.user._id, {
        title,
        description,
        widgets,
        filters,
        isPublic,
      });

      if (!dashboard) {
        return res.status(404).json({ success: false, message: "Dashboard not found or unauthorized." });
      }
    }

    res.json({
      success: true,
      message: "Dashboard updated successfully",
      dashboard,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Duplicate an existing dashboard
// @route   POST /api/dashboards/:id/duplicate
// @access  Private
export const duplicateDashboard = async (req, res, next) => {
  try {
    const { id } = req.params;
    const isConnected = mongoose.connection.readyState === 1;

    let original;
    if (isConnected) {
      original = await Dashboard.findById(id);
    } else {
      original = memoryStore.getDashboardById(id);
    }

    if (!original) {
      return res.status(404).json({ success: false, message: "Dashboard not found." });
    }

    if (original.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized." });
    }

    const copyPayload = {
      user: req.user._id,
      dataset: original.dataset,
      title: `${original.title} (Copy)`,
      description: original.description,
      widgets: JSON.parse(JSON.stringify(original.widgets)),
      filters: JSON.parse(JSON.stringify(original.filters || {})),
      isPublic: false,
    };

    let duplicated;
    if (isConnected) {
      duplicated = await Dashboard.create(copyPayload);
    } else {
      duplicated = memoryStore.saveDashboard(copyPayload);
    }

    res.status(201).json({
      success: true,
      message: "Dashboard duplicated successfully",
      dashboard: duplicated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a dashboard
// @route   DELETE /api/dashboards/:id
// @access  Private
export const deleteDashboard = async (req, res, next) => {
  try {
    const { id } = req.params;
    const isConnected = mongoose.connection.readyState === 1;

    if (isConnected) {
      const dashboard = await Dashboard.findById(id);
      if (!dashboard) {
        return res.status(404).json({ success: false, message: "Dashboard not found." });
      }

      if (dashboard.user.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: "Not authorized." });
      }

      await dashboard.deleteOne();
    } else {
      const success = memoryStore.deleteDashboard(id, req.user._id);
      if (!success) {
        return res.status(404).json({ success: false, message: "Dashboard not found or unauthorized." });
      }
    }

    res.json({
      success: true,
      message: "Dashboard deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get system overview stats for logged in user
// @route   GET /api/dashboards/stats/overview
// @access  Private
export const getOverviewStats = async (req, res, next) => {
  try {
    const isConnected = mongoose.connection.readyState === 1;
    let datasetCount = 0;
    let dashboardCount = 0;
    let totalWidgets = 0;
    let totalRowsAnalyzed = 0;

    if (isConnected) {
      const datasets = await Dataset.find({ user: req.user._id });
      const dashboards = await Dashboard.find({ user: req.user._id });

      datasetCount = datasets.length;
      dashboardCount = dashboards.length;
      totalWidgets = dashboards.reduce((acc, d) => acc + (d.widgets?.length || 0), 0);
      totalRowsAnalyzed = datasets.reduce((acc, d) => acc + (d.rowCount || 0), 0);
    } else {
      const datasets = memoryStore.getDatasetsByUser(req.user._id);
      const dashboards = memoryStore.getDashboardsByUser(req.user._id);

      datasetCount = datasets.length;
      dashboardCount = dashboards.length;
      totalWidgets = dashboards.reduce((acc, d) => acc + (d.widgets?.length || 0), 0);
      totalRowsAnalyzed = datasets.reduce((acc, d) => acc + (d.rowCount || 0), 0);
    }

    res.json({
      success: true,
      stats: {
        datasetCount,
        dashboardCount,
        totalWidgets,
        totalRowsAnalyzed,
      },
    });
  } catch (error) {
    next(error);
  }
};
