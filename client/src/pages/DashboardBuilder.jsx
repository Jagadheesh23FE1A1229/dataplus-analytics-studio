import React, { useEffect, useState, useMemo } from "react";
import {
  Save,
  PlusCircle,
  FileSpreadsheet,
  Download,
  Printer,
  Sparkles,
  Sliders,
  Filter,
  Calendar,
  X,
  Copy,
  Layers,
  BarChart3,
  TrendingUp,
  Database,
  ArrowRight,
  Eye,
  Check,
} from "lucide-react";
import { api } from "../api/client.js";
import { useToast } from "../context/ToastContext.jsx";
import { KPICard } from "../components/KPICard.jsx";
import { ChartWidget } from "../components/ChartWidget.jsx";
import { WidgetModal } from "../components/WidgetModal.jsx";
import {
  filterRows,
  computeMetric,
  computeGroupedData,
  exportDataToCsv,
} from "../utils/analyticsEngine.js";

export const DashboardBuilder = ({ onLoadSample, isSampleLoading }) => {
  const { success, error, info } = useToast();

  // URL Query param parsing for direct dataset or dashboard loading
  const searchParams = useMemo(() => new URLSearchParams(window.location.hash.split("?")[1] || ""), []);
  const initialDatasetId = searchParams.get("datasetId");
  const initialDashboardId = searchParams.get("dashboardId");

  const [datasets, setDatasets] = useState([]);
  const [selectedDatasetId, setSelectedDatasetId] = useState(initialDatasetId || "");
  const [activeDataset, setActiveDataset] = useState(null);
  const [isLoadingDataset, setIsLoadingDataset] = useState(false);

  // Dashboard configuration
  const [dashboardId, setDashboardId] = useState(initialDashboardId || null);
  const [title, setTitle] = useState("Executive Business Analytics Dashboard");
  const [description, setDescription] = useState("Sales, profits, orders, and regional distribution insights.");
  const [widgets, setWidgets] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  // Global Interactive Filters
  const [dateColumn, setDateColumn] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [categoryColumn, setCategoryColumn] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);

  // Modal State
  const [isWidgetModalOpen, setIsWidgetModalOpen] = useState(false);
  const [editingWidget, setEditingWidget] = useState(null);

  // 1. Fetch user's datasets on mount
  useEffect(() => {
    const fetchDatasets = async () => {
      try {
        const res = await api.getDatasets();
        if (res.success && res.datasets) {
          setDatasets(res.datasets);
          if (!selectedDatasetId && res.datasets.length > 0) {
            setSelectedDatasetId(res.datasets[0]._id);
          }
        }
      } catch (err) {
        console.error("Failed to fetch datasets list:", err);
      }
    };
    fetchDatasets();
  }, []);

  // 2. Fetch Dashboard if dashboardId is in URL
  useEffect(() => {
    if (initialDashboardId) {
      const loadDashboard = async () => {
        try {
          const res = await api.getDashboardById(initialDashboardId);
          if (res.success && res.dashboard) {
            const d = res.dashboard;
            setDashboardId(d._id);
            setTitle(d.title);
            setDescription(d.description || "");
            setWidgets(d.widgets || []);
            if (d.dataset?._id || d.dataset) {
              setSelectedDatasetId(d.dataset?._id || d.dataset);
            }
          }
        } catch (err) {
          error("Could not load specified dashboard.");
        }
      };
      loadDashboard();
    }
  }, [initialDashboardId]);

  // 3. Fetch full dataset records when selectedDatasetId changes
  useEffect(() => {
    if (!selectedDatasetId) return;

    const loadDatasetData = async () => {
      try {
        setIsLoadingDataset(true);
        const res = await api.getDatasetById(selectedDatasetId);
        if (res.success && res.dataset) {
          setActiveDataset(res.dataset);

          // Auto-detect default date and categorical columns
          const dateCol = res.dataset.columns?.find((c) => c.type === "date");
          if (dateCol) setDateColumn(dateCol.name);

          const catCol = res.dataset.columns?.find(
            (c) =>
              c.type === "string" &&
              (c.name.toLowerCase().includes("category") ||
                c.name.toLowerCase().includes("region") ||
                c.name.toLowerCase().includes("segment"))
          );
          if (catCol) setCategoryColumn(catCol.name);

          // If no widgets exist yet, initialize default starter widgets
          if (widgets.length === 0 && !dashboardId) {
            initializeStarterWidgets(res.dataset);
          }
        }
      } catch (err) {
        error("Failed to load dataset rows.");
      } finally {
        setIsLoadingDataset(false);
      }
    };

    loadDatasetData();
  }, [selectedDatasetId]);

  // Helper: Auto-populate starter widgets for instant wow effect
  const initializeStarterWidgets = (dataset) => {
    const numericCols = dataset.columns?.filter((c) => c.type === "number") || [];
    const catCols = dataset.columns?.filter((c) => c.type !== "number") || [];

    const salesCol = numericCols.find((c) => c.name.toLowerCase().includes("sales"))?.name || numericCols[0]?.name || "Sales";
    const profitCol = numericCols.find((c) => c.name.toLowerCase().includes("profit"))?.name || numericCols[1]?.name || salesCol;
    const qtyCol = numericCols.find((c) => c.name.toLowerCase().includes("quantity"))?.name || numericCols[2]?.name || salesCol;

    const catCol = catCols.find((c) => c.name.toLowerCase().includes("category"))?.name || catCols[0]?.name || "Category";
    const regionCol = catCols.find((c) => c.name.toLowerCase().includes("region"))?.name || catCols[1]?.name || catCol;
    const dateCol = catCols.find((c) => c.type === "date")?.name || catCols[2]?.name || catCol;

    const starterWidgets = [
      {
        id: "kpi_1",
        type: "kpi",
        title: `Total ${salesCol}`,
        metricColumn: salesCol,
        aggregation: "sum",
        prefix: "$",
        suffix: "",
        icon: "DollarSign",
        colorPalette: "indigo",
        colSpan: 1,
      },
      {
        id: "kpi_2",
        type: "kpi",
        title: `Total ${profitCol}`,
        metricColumn: profitCol,
        aggregation: "sum",
        prefix: "$",
        suffix: "",
        icon: "TrendingUp",
        colorPalette: "emerald",
        colSpan: 1,
      },
      {
        id: "kpi_3",
        type: "kpi",
        title: "Total Transactions",
        metricColumn: "",
        aggregation: "count",
        prefix: "",
        suffix: " orders",
        icon: "ShoppingCart",
        colorPalette: "sunset",
        colSpan: 1,
      },
      {
        id: "kpi_4",
        type: "kpi",
        title: `Average ${salesCol}`,
        metricColumn: salesCol,
        aggregation: "avg",
        prefix: "$",
        suffix: "",
        icon: "Award",
        colorPalette: "ocean",
        colSpan: 1,
      },
      {
        id: "chart_1",
        type: "bar",
        title: `${salesCol} by ${catCol}`,
        metricColumn: salesCol,
        categoryColumn: catCol,
        aggregation: "sum",
        colorPalette: "indigo",
        colSpan: 1,
      },
      {
        id: "chart_2",
        type: "doughnut",
        title: `${profitCol} Distribution by ${regionCol}`,
        metricColumn: profitCol,
        categoryColumn: regionCol,
        aggregation: "sum",
        colorPalette: "sunset",
        colSpan: 1,
      },
      {
        id: "chart_3",
        type: "line",
        title: `${salesCol} Trend Timeline`,
        metricColumn: salesCol,
        categoryColumn: dateCol,
        aggregation: "sum",
        colorPalette: "neon",
        colSpan: 2,
      },
    ];

    setWidgets(starterWidgets);
  };

  // Distinct category values for filter dropdown
  const categoryValues = useMemo(() => {
    if (!activeDataset?.data || !categoryColumn) return [];
    const vals = new Set();
    activeDataset.data.forEach((row) => {
      const val = row[categoryColumn];
      if (val !== undefined && val !== null && val.toString().trim() !== "") {
        vals.add(val.toString().trim());
      }
    });
    return Array.from(vals).sort();
  }, [activeDataset, categoryColumn]);

  // Apply real-time dynamic filters to raw rows
  const filteredRows = useMemo(() => {
    if (!activeDataset?.data) return [];
    return filterRows(activeDataset.data, {
      dateRange: {
        column: dateColumn,
        startDate,
        endDate,
      },
      categoryFilter: {
        column: categoryColumn,
        selectedValues: selectedCategories,
      },
    });
  }, [activeDataset, dateColumn, startDate, endDate, categoryColumn, selectedCategories]);

  // Save or update dashboard in backend
  const handleSaveDashboard = async () => {
    if (!title.trim()) {
      error("Dashboard title cannot be empty.");
      return;
    }

    if (!selectedDatasetId) {
      error("Please select a dataset to attach to this dashboard.");
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        datasetId: selectedDatasetId,
        widgets,
        filters: {
          dateRange: { column: dateColumn, startDate, endDate },
          categoryFilter: { column: categoryColumn, selectedValues: selectedCategories },
        },
      };

      if (dashboardId) {
        const res = await api.updateDashboard(dashboardId, payload);
        if (res.success) {
          success("Dashboard updated successfully!");
        }
      } else {
        const res = await api.createDashboard(payload);
        if (res.success && res.dashboard) {
          setDashboardId(res.dashboard._id);
          success("Dashboard saved to your repository!");
        }
      }
    } catch (err) {
      error(err.message || "Failed to save dashboard.");
    } finally {
      setIsSaving(false);
    }
  };

  // Export filtered dataset to CSV
  const handleExportCsv = () => {
    if (!filteredRows || filteredRows.length === 0) {
      error("No records available to export.");
      return;
    }
    const filename = `${title.toLowerCase().replace(/\s+/g, "_")}_export.csv`;
    exportDataToCsv(filename, filteredRows);
    success("Filtered dataset downloaded as CSV!");
  };

  // Print / PDF Export
  const handlePrint = () => {
    window.print();
  };

  // Widget management handlers
  const handleAddWidget = (newWidget) => {
    setWidgets((prev) => [...prev, newWidget]);
    success("Widget added to dashboard!");
  };

  const handleUpdateWidget = (updatedWidget) => {
    setWidgets((prev) => prev.map((w) => (w.id === updatedWidget.id ? updatedWidget : w)));
    success("Widget configuration updated!");
  };

  const handleDeleteWidget = (id) => {
    setWidgets((prev) => prev.filter((w) => w.id !== id));
    info("Widget removed.");
  };

  const handleDuplicateWidget = (widgetToDuplicate) => {
    const copy = {
      ...widgetToDuplicate,
      id: "widget_" + Date.now(),
      title: `${widgetToDuplicate.title} (Copy)`,
    };
    setWidgets((prev) => [...prev, copy]);
    success("Widget duplicated!");
  };

  const handleToggleColSpan = (id) => {
    setWidgets((prev) =>
      prev.map((w) => (w.id === id ? { ...w, colSpan: w.colSpan === 2 ? 1 : 2 } : w))
    );
  };

  const handleOpenEdit = (widget) => {
    setEditingWidget(widget);
    setIsWidgetModalOpen(true);
  };

  const handleOpenAdd = () => {
    setEditingWidget(null);
    setIsWidgetModalOpen(true);
  };

  // Separate KPI widgets and Chart widgets
  const kpiWidgets = widgets.filter((w) => w.type === "kpi");
  const chartWidgets = widgets.filter((w) => w.type !== "kpi");

  return (
    <div className="space-y-6 animate-in fade-in-50 print-area">
      {/* Top Header & Actions Bar (no-print) */}
      <div className="no-print p-6 rounded-3xl glass-card border border-slate-800 shadow-2xl space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex-1 max-w-xl">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-xl sm:text-2xl font-extrabold text-white bg-transparent border-b border-transparent hover:border-slate-700 focus:border-brand-500 focus:outline-none w-full transition-colors tracking-tight"
              placeholder="Dashboard Title"
            />
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="text-xs text-slate-400 bg-transparent border-b border-transparent hover:border-slate-700 focus:border-brand-500 focus:outline-none w-full mt-1 transition-colors"
              placeholder="Add dashboard notes or description..."
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-md shadow-indigo-600/20 transition-all hover:scale-105"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Add Widget</span>
            </button>

            <button
              onClick={handleExportCsv}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-850 hover:bg-slate-800 border border-slate-750 rounded-xl transition-all"
              title="Download filtered records as CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-850 hover:bg-slate-800 border border-slate-750 rounded-xl transition-all"
              title="Print dashboard or export to PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Print / PDF</span>
            </button>

            {dashboardId && (
              <a
                href={`#/view/${dashboardId}`}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-850 hover:bg-slate-800 border border-slate-750 rounded-xl transition-all"
                title="Fullscreen presentation view"
              >
                <Eye className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Present</span>
              </a>
            )}

            <button
              onClick={handleSaveDashboard}
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 rounded-xl shadow-lg shadow-brand-600/30 transition-all disabled:opacity-50"
            >
              {isSaving ? (
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Save className="w-3.5 h-3.5" />
              )}
              <span>{dashboardId ? "Update Dashboard" : "Save Dashboard"}</span>
            </button>
          </div>
        </div>

        {/* Dataset Selector row */}
        <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <Database className="w-4 h-4 text-brand-400" />
            <span className="font-semibold text-slate-300">Active Dataset:</span>
            <select
              value={selectedDatasetId}
              onChange={(e) => setSelectedDatasetId(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-slate-850 border border-slate-750 text-white font-medium focus:outline-none focus:border-brand-500"
            >
              {datasets.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.name} ({d.rowCount} rows)
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-md bg-brand-500/10 text-brand-300 font-mono text-[11px] font-semibold border border-brand-500/20">
              Showing {filteredRows.length} of {activeDataset?.rowCount || 0} records
            </span>
          </div>
        </div>
      </div>

      {/* Global Interactive Filter Bar (no-print) */}
      <div className="no-print p-4 rounded-2xl glass-card border border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5 text-brand-400 font-bold uppercase tracking-wider text-[11px]">
            <Filter className="w-3.5 h-3.5" />
            <span>Interactive Filters:</span>
          </div>

          {/* Date Range Filter */}
          {dateColumn && (
            <div className="flex items-center gap-2 bg-slate-850 px-2.5 py-1.5 rounded-xl border border-slate-750">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[11px] text-slate-400">{dateColumn}:</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-transparent text-white text-[11px] focus:outline-none"
              />
              <span className="text-slate-500">to</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-transparent text-white text-[11px] focus:outline-none"
              />
            </div>
          )}

          {/* Category Filter Multi-Select */}
          {categoryColumn && categoryValues.length > 0 && (
            <div className="flex items-center gap-2 bg-slate-850 px-2.5 py-1.5 rounded-xl border border-slate-750">
              <span className="text-[11px] text-slate-400">{categoryColumn}:</span>
              <select
                onChange={(e) => {
                  const val = e.target.value;
                  if (val && !selectedCategories.includes(val)) {
                    setSelectedCategories([...selectedCategories, val]);
                  }
                }}
                className="bg-transparent text-white text-[11px] focus:outline-none cursor-pointer"
              >
                <option value="" className="bg-slate-900 text-slate-400">
                  Select {categoryColumn}...
                </option>
                {categoryValues.map((v) => (
                  <option key={v} value={v} className="bg-slate-900 text-white">
                    {v}
                  </option>
                ))}
              </select>

              {/* Badges for selected categories */}
              <div className="flex flex-wrap gap-1">
                {selectedCategories.map((cat) => (
                  <span
                    key={cat}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-brand-600/30 text-brand-300 text-[10px] font-medium border border-brand-500/40"
                  >
                    <span>{cat}</span>
                    <button
                      onClick={() => setSelectedCategories(selectedCategories.filter((c) => c !== cat))}
                      className="hover:text-white"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Clear Filters Button */}
        {(startDate || endDate || selectedCategories.length > 0) && (
          <button
            onClick={() => {
              setStartDate("");
              setEndDate("");
              setSelectedCategories([]);
            }}
            className="text-[11px] text-rose-400 hover:text-rose-300 font-semibold hover:underline"
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Presentation Header (Visible when printing / in print view) */}
      <div className="hidden print:block text-slate-900 mb-6">
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="text-sm text-slate-600">{description}</p>
        <p className="text-xs text-slate-500 mt-1">
          Dataset: {activeDataset?.name} • Records: {filteredRows.length} • Generated by DataPulse Analytics
        </p>
      </div>

      {/* KPI Cards Grid */}
      {kpiWidgets.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpiWidgets.map((widget) => {
            const val = computeMetric(filteredRows, widget.metricColumn, widget.aggregation);
            return (
              <KPICard
                key={widget.id}
                widget={widget}
                value={val}
                isBuilderMode={true}
                onEdit={handleOpenEdit}
                onDelete={handleDeleteWidget}
              />
            );
          })}
        </div>
      )}

      {/* Charts Grid */}
      {chartWidgets.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {chartWidgets.map((widget) => {
            const chartData = computeGroupedData(
              filteredRows,
              widget.categoryColumn,
              widget.metricColumn,
              widget.aggregation,
              widget.sortBy || "value-desc",
              10
            );

            return (
              <ChartWidget
                key={widget.id}
                widget={widget}
                chartData={chartData}
                isBuilderMode={true}
                onEdit={handleOpenEdit}
                onDuplicate={handleDuplicateWidget}
                onDelete={handleDeleteWidget}
                onToggleColSpan={handleToggleColSpan}
              />
            );
          })}
        </div>
      ) : (
        <div className="p-12 text-center glass-card rounded-2xl border border-slate-800">
          <BarChart3 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-white">No Charts Added Yet</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Click "Add Widget" to create Bar, Line, Pie, or Doughnut visualizations.
          </p>
          <button
            onClick={handleOpenAdd}
            className="mt-4 px-4 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 rounded-xl transition-all"
          >
            Add First Chart
          </button>
        </div>
      )}

      {/* Widget Modal */}
      <WidgetModal
        isOpen={isWidgetModalOpen}
        onClose={() => {
          setIsWidgetModalOpen(false);
          setEditingWidget(null);
        }}
        onSave={editingWidget ? handleUpdateWidget : handleAddWidget}
        editWidget={editingWidget}
        datasetColumns={activeDataset?.columns || []}
      />
    </div>
  );
};
