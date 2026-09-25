import crypto from "crypto";

// Resilient in-memory database fallback for seamless testing/evaluation
class MemoryStore {
  constructor() {
    this.users = [];
    this.datasets = [];
    this.dashboards = [];
  }

  // --- Users ---
  findUserByEmail(email) {
    return this.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  findUserById(id) {
    return this.users.find((u) => u._id.toString() === id.toString());
  }

  saveUser(userData) {
    const user = {
      _id: userData._id || crypto.randomUUID(),
      name: userData.name,
      email: userData.email.toLowerCase(),
      password: userData.password,
      role: userData.role || "user",
      createdAt: new Date(),
    };
    this.users.push(user);
    return user;
  }

  // --- Datasets ---
  getDatasetsByUser(userId) {
    return this.datasets
      .filter((d) => d.user.toString() === userId.toString())
      .map((d) => ({
        _id: d._id,
        user: d.user,
        name: d.name,
        originalFilename: d.originalFilename,
        fileSize: d.fileSize,
        rowCount: d.rowCount,
        columnCount: d.columnCount,
        columns: d.columns,
        createdAt: d.createdAt,
      }));
  }

  getDatasetById(id) {
    return this.datasets.find((d) => d._id.toString() === id.toString());
  }

  saveDataset(datasetData) {
    const dataset = {
      _id: datasetData._id || crypto.randomUUID(),
      user: datasetData.user,
      name: datasetData.name,
      originalFilename: datasetData.originalFilename || `${datasetData.name}.csv`,
      fileSize: datasetData.fileSize || 0,
      rowCount: datasetData.rowCount || 0,
      columnCount: datasetData.columnCount || 0,
      columns: datasetData.columns || [],
      data: datasetData.data || [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.datasets.push(dataset);
    return dataset;
  }

  deleteDataset(id, userId) {
    const index = this.datasets.findIndex(
      (d) => d._id.toString() === id.toString() && d.user.toString() === userId.toString()
    );
    if (index !== -1) {
      this.datasets.splice(index, 1);
      // Also cascade delete related dashboards
      this.dashboards = this.dashboards.filter((dash) => dash.dataset.toString() !== id.toString());
      return true;
    }
    return false;
  }

  // --- Dashboards ---
  getDashboardsByUser(userId) {
    return this.dashboards
      .filter((dash) => dash.user.toString() === userId.toString())
      .map((dash) => {
        const dataset = this.getDatasetById(dash.dataset);
        return {
          ...dash,
          datasetName: dataset ? dataset.name : "Dataset",
        };
      });
  }

  getDashboardById(id) {
    const dashboard = this.dashboards.find((dash) => dash._id.toString() === id.toString());
    if (!dashboard) return null;
    const dataset = this.getDatasetById(dashboard.dataset);
    return {
      ...dashboard,
      datasetName: dataset ? dataset.name : "Dataset",
    };
  }

  saveDashboard(dashboardData) {
    const dashboard = {
      _id: dashboardData._id || crypto.randomUUID(),
      user: dashboardData.user,
      dataset: dashboardData.dataset,
      title: dashboardData.title,
      description: dashboardData.description || "",
      widgets: dashboardData.widgets || [],
      filters: dashboardData.filters || {},
      isPublic: !!dashboardData.isPublic,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.dashboards.push(dashboard);
    return dashboard;
  }

  updateDashboard(id, userId, updates) {
    const dashboard = this.dashboards.find(
      (dash) => dash._id.toString() === id.toString() && dash.user.toString() === userId.toString()
    );
    if (!dashboard) return null;

    Object.assign(dashboard, updates, { updatedAt: new Date() });
    return dashboard;
  }

  deleteDashboard(id, userId) {
    const index = this.dashboards.findIndex(
      (dash) => dash._id.toString() === id.toString() && dash.user.toString() === userId.toString()
    );
    if (index !== -1) {
      this.dashboards.splice(index, 1);
      return true;
    }
    return false;
  }
}

export const memoryStore = new MemoryStore();
