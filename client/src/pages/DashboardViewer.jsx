import React, { useEffect, useState, useMemo } from "react";
import {
  ArrowLeft,
  Sliders,
  Printer,
  Download,
  Maximize2,
  Minimize2,
  RefreshCw,
  Calendar,
  Filter,
  X,
  Database,
  BarChart3,
  Layers,
  Sparkles,
  Share2,
  Check,
} from "lucide-react";
import { api } from "../api/client.js";
import { useToast } from "../context/ToastContext.jsx";
import { KPICard } from "../components/KPICard.jsx";
import { ChartWidget } from "../components/ChartWidget.jsx";
import {
  filterRows,
  computeMetric,
  computeGroupedData,
  exportDataToCsv,
} from "../utils/analyticsEngine.js";

export const DashboardViewer = ({ dashboardId, onBack }) => {
  const { success, error, info } = useToast();

  const [dashboard, setDashboard] = useState(null);
  const [dataset, setDataset] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Interactive filters
  const [dateColumn, setDateColumn] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [categoryColumn, setCategoryColumn] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);

  // Fetch Dashboard and Dataset
  const fetchDashboardData = async () => {
    if (!dashboardId) return;
    try {
      setLoading(true);
      const res = await api.getDashboardById(dashboardId);
      if (res.success && res.dashboard) {
        const d = res.dashboard;
        setDashboard(d);

        // Populate filters if saved
        if (d.filters?.dateRange) {
          setDateColumn(d.filters.dateRange.column || "");
          setStartDate(d.filters.dateRange.startDate || "");
          setEndDate(d.filters.dateRange.endDate || "");
        }
        if (d.filters?.categoryFilter) {
          setCategoryColumn(d.filters.categoryFilter.column || "");
          setSelectedCategories(d.filters.categoryFilter.selectedValues || []);
        }

        // Fetch dataset records
        const targetDatasetId = d.dataset?._id || d.dataset;
        if (targetDatasetId) {
          const dsRes = await api.getDatasetById(targetDatasetId);
          if (dsRes.success && dsRes.dataset) {
            setDataset(dsRes.dataset);
          }
        }
      } else {
        error("Dashboard not found or unauthorized.");
      }
    } catch (err) {
      error("Failed to load dashboard: " + (err.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [dashboardId]);

  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    success("Dashboard link copied to clipboard!");
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  // Compute unique values for categorical filter
  const categoryValues = useMemo(() => {
    if (!categoryColumn || !dataset?.data) return [];
    const vals = new Set();
    dataset.data.forEach((r) => {
      const val = r[categoryColumn];
      if (val !== undefined && val !== null && val !== "") {
        vals.add(val.toString().trim());
      }
    });
    return Array.from(vals).slice(0, 100);
  }, [categoryColumn, dataset]);

  // Filter dataset rows
  const filteredRows = useMemo(() => {
    if (!dataset?.data) return [];
    return filterRows(dataset.data, {
      dateColumn,
      startDate,
      endDate,
      categoryColumn,
      selectedCategories,
    });
  }, [dataset, dateColumn, startDate, endDate, categoryColumn, selectedCategories]);

  // Split widgets into KPIs and Charts
  const kpiWidgets = useMemo(() => {
    return (dashboard?.widgets || []).filter((w) => w.type === "kpi");
  }, [dashboard]);

  const chartWidgets = useMemo(() => {
    return (dashboard?.widgets || []).filter((w) => w.type !== "kpi");
  }, [dashboard]);

  const handleExportCsv = () => {
    if (!filteredRows || filteredRows.length === 0) {
      info("No data available to export.");
      return;
    }
    const safeTitle = (dashboard?.title || "dashboard_data").replace(/[^a-z0-9]/gi, "_").toLowerCase();
    exportDataToCsv(filteredRows, `${safeTitle}_filtered_records.csv`);
    success(`Exported ${filteredRows.length} records to CSV.`);
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-8">
        <div className="w-10 h-10 border-3 border-brand-500 border-t-transparent rounded-full animate-spin mb-4" />
        <h3 className="text-base font-bold text-white">Rendering Executive Presentation...</h3>
        <p className="text-xs text-slate-400 mt-1">Aggregating records and compiling chart views.</p>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-8">
        <BarChart3 className="w-12 h-12 text-slate-600 mb-3" />
        <h3 className="text-lg font-bold text-white">Dashboard Unavailable</h3>
        <p className="text-xs text-slate-400 mt-1 max-w-sm">
          The requested dashboard could not be found or you do not have permission to view it.
        </p>
        <button
          onClick={onBack || (() => (window.location.hash = "#/dashboards"))}
          className="mt-5 inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-500 rounded-xl transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Saved Dashboards</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in-50 print-area">
      {/* Top Header Toolbar */}
      <div className="p-5 sm:p-6 rounded-3xl glass-panel border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <button
              onClick={onBack || (() => (window.location.hash = "#/dashboards"))}
              className="no-print p-2 rounded-xl text-slate-400 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all mt-0.5"
              title="Return to Workspace"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            <div>
              <div className="flex flex-wrap items-center gap-2.5 mb-1.5">
                <span className="text-[10px] font-mono uppercase bg-indigo-500/10 text-indigo-400 px-2.5 py-0.5 rounded-full border border-indigo-500/20 font-bold flex items-center gap-1.5">
                  <Database className="w-3 h-3" />
                  {dataset?.name || "Dataset"}
                </span>
                <span className="text-[11px] text-slate-400">
                  {filteredRows.length} active records
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {dashboard.title}
              </h1>
              {dashboard.description && (
                <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
                  {dashboard.description}
                </p>
              )}
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="no-print flex flex-wrap items-center gap-2">
            <button
              onClick={fetchDashboardData}
              className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all"
              title="Refresh Data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl transition-all"
              title="Copy share link"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{copiedLink ? "Copied!" : "Share"}</span>
            </button>

            <button
              onClick={handleExportCsv}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl transition-all"
              title="Export filtered records"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl transition-all"
              title="Print executive report or export to PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Print / PDF</span>
            </button>

            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all"
              title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            <a
              href={`#/builder?dashboardId=${dashboard._id}`}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 rounded-xl shadow-md shadow-brand-600/30 transition-all hover:scale-105"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Edit Builder</span>
            </a>
          </div>
        </div>
      </div>

      {/* Global Interactive Filter Bar (no-print) */}
      {(dateColumn || (categoryColumn && categoryValues.length > 0)) && (
        <div className="no-print p-4 rounded-2xl glass-card border border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-1.5 text-brand-400 font-bold uppercase tracking-wider text-[11px]">
              <Filter className="w-3.5 h-3.5" />
              <span>Executive Filters:</span>
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
                  defaultValue=""
                >
                  <option value="" disabled className="bg-slate-900 text-slate-400">
                    Filter by {categoryColumn}...
                  </option>
                  {categoryValues.map((v) => (
                    <option key={v} value={v} className="bg-slate-900 text-white">
                      {v}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Selected category chips */}
            {selectedCategories.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5">
                {selectedCategories.map((c) => (
                  <span
                    key={c}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-300 text-[11px] border border-brand-500/30 font-medium"
                  >
                    <span>{c}</span>
                    <button
                      onClick={() => setSelectedCategories(selectedCategories.filter((x) => x !== c))}
                      className="hover:text-white"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {(startDate || endDate || selectedCategories.length > 0) && (
            <button
              onClick={() => {
                setStartDate("");
                setEndDate("");
                setSelectedCategories([]);
              }}
              className="text-slate-400 hover:text-white underline text-[11px]"
            >
              Reset Filters
            </button>
          )}
        </div>
      )}

      {/* KPI Cards Row */}
      {kpiWidgets.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {kpiWidgets.map((w) => {
            const val = computeMetric(filteredRows, w.metricColumn, w.aggregation);
            return (
              <KPICard
                key={w.id}
                widget={w}
                value={val}
                isBuilderMode={false}
              />
            );
          })}
        </div>
      )}

      {/* Chart Widgets Grid */}
      {chartWidgets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {chartWidgets.map((w) => {
            const chartData = computeGroupedData(
              filteredRows,
              w.categoryColumn,
              w.metricColumn,
              w.aggregation,
              w.colorPalette,
              w.type,
              w.sortBy || "value-desc"
            );

            return (
              <div
                key={w.id}
                className={w.colSpan === 2 ? "md:col-span-2 chart-container" : "chart-container"}
              >
                <ChartWidget
                  widget={w}
                  chartData={chartData}
                  isBuilderMode={false}
                />
              </div>
            );
          })}
        </div>
      ) : (
        kpiWidgets.length === 0 && (
          <div className="p-16 text-center glass-card rounded-3xl border border-slate-800">
            <Layers className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white">No Widgets Configured</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              This dashboard does not contain any KPI cards or charts yet. Switch to the builder to add analytics widgets.
            </p>
            <a
              href={`#/builder?dashboardId=${dashboard._id}`}
              className="mt-5 inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 rounded-xl transition-all shadow-md"
            >
              <Sliders className="w-4 h-4" />
              <span>Open Visual Builder</span>
            </a>
          </div>
        )
      )}
    </div>
  );
};
