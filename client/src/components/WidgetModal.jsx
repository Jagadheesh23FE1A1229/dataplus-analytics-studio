import React, { useState, useEffect } from "react";
import {
  X,
  BarChart3,
  TrendingUp,
  PieChart,
  LineChart,
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  Award,
  Activity,
  Check,
  AlignLeft,
} from "lucide-react";
import { PALETTES } from "../utils/analyticsEngine.js";

const WIDGET_TYPES = [
  { id: "kpi", label: "KPI Metric Card", icon: TrendingUp },
  { id: "bar", label: "Vertical Bar", icon: BarChart3 },
  { id: "horizontal-bar", label: "Horizontal Bar", icon: AlignLeft },
  { id: "line", label: "Trend Line", icon: LineChart },
  { id: "pie", label: "Pie Chart", icon: PieChart },
  { id: "doughnut", label: "Doughnut Chart", icon: PieChart },
];

const KPI_ICONS = [
  { id: "TrendingUp", label: "Growth", icon: TrendingUp },
  { id: "DollarSign", label: "Revenue", icon: DollarSign },
  { id: "ShoppingCart", label: "Orders", icon: ShoppingCart },
  { id: "Users", label: "Customers", icon: Users },
  { id: "Package", label: "Products", icon: Package },
  { id: "Award", label: "Performance", icon: Award },
  { id: "Activity", label: "Activity", icon: Activity },
];

export const WidgetModal = ({
  isOpen,
  onClose,
  onSave,
  editWidget = null,
  datasetColumns = [],
}) => {
  const [type, setType] = useState("bar");
  const [title, setTitle] = useState("");
  const [metricColumn, setMetricColumn] = useState("");
  const [categoryColumn, setCategoryColumn] = useState("");
  const [aggregation, setAggregation] = useState("sum");
  const [colorPalette, setColorPalette] = useState("indigo");
  const [colSpan, setColSpan] = useState(1);
  const [prefix, setPrefix] = useState("");
  const [suffix, setSuffix] = useState("");
  const [icon, setIcon] = useState("TrendingUp");

  // Filter column lists by inferred types
  const numericColumns = datasetColumns.filter(
    (c) => c.type === "number" || c.name.toLowerCase().includes("sales") || c.name.toLowerCase().includes("profit")
  );
  const categoricalColumns = datasetColumns.filter((c) => c.type !== "number");

  useEffect(() => {
    if (editWidget) {
      setType(editWidget.type || "bar");
      setTitle(editWidget.title || "");
      setMetricColumn(editWidget.metricColumn || "");
      setCategoryColumn(editWidget.categoryColumn || "");
      setAggregation(editWidget.aggregation || "sum");
      setColorPalette(editWidget.colorPalette || "indigo");
      setColSpan(editWidget.colSpan || 1);
      setPrefix(editWidget.prefix || "");
      setSuffix(editWidget.suffix || "");
      setIcon(editWidget.icon || "TrendingUp");
    } else {
      // Default initialization
      setType("bar");
      setTitle("Sales by Category");
      const defaultMetric = numericColumns[0]?.name || datasetColumns[0]?.name || "";
      const defaultCat = categoricalColumns[0]?.name || datasetColumns[0]?.name || "";
      setMetricColumn(defaultMetric);
      setCategoryColumn(defaultCat);
      setAggregation("sum");
      setColorPalette("indigo");
      setColSpan(1);
      setPrefix("");
      setSuffix("");
      setIcon("TrendingUp");
    }
  }, [editWidget, isOpen]);

  // Update default title dynamically when user selects fields
  const handleTypeChange = (newType) => {
    setType(newType);
    if (!editWidget) {
      if (newType === "kpi") {
        setTitle(`Total ${metricColumn || "Sales"}`);
        setPrefix("$");
      } else {
        setTitle(`${metricColumn || "Sales"} by ${categoryColumn || "Category"}`);
        setPrefix("");
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const widgetData = {
      id: editWidget?.id || "widget_" + Date.now(),
      type,
      title: title.trim(),
      metricColumn,
      categoryColumn: type === "kpi" ? "" : categoryColumn,
      aggregation,
      colorPalette,
      colSpan: type === "kpi" ? 1 : colSpan,
      prefix,
      suffix,
      icon,
    };

    onSave(widgetData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-8 animate-in fade-in-50 zoom-in-95">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/60">
          <div>
            <h3 className="text-base font-bold text-white">
              {editWidget ? "Configure Widget" : "Add Visualization / KPI"}
            </h3>
            <p className="text-xs text-slate-400">
              Customize chart aggregation, dimension groupings, and color styling.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Widget Type Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2.5">
              Select Widget Type
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {WIDGET_TYPES.map((wt) => {
                const Icon = wt.icon;
                const isSelected = type === wt.id;
                return (
                  <button
                    type="button"
                    key={wt.id}
                    onClick={() => handleTypeChange(wt.id)}
                    className={`flex items-center gap-2.5 p-3 rounded-xl border text-left text-xs font-semibold transition-all ${
                      isSelected
                        ? "bg-brand-600/20 border-brand-500 text-white shadow-lg shadow-brand-500/10"
                        : "bg-slate-850 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700"
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isSelected ? "text-brand-400" : "text-slate-400"}`} />
                    <span>{wt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Widget Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Total Revenue by Region"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-850 border border-slate-750 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-brand-500 transition-colors"
            />
          </div>

          {/* Metric & Aggregation Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Metric Column (Numerical)
              </label>
              <select
                value={metricColumn}
                onChange={(e) => setMetricColumn(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-850 border border-slate-750 text-white text-sm focus:outline-none focus:border-brand-500 transition-colors"
              >
                {numericColumns.length > 0 ? (
                  numericColumns.map((col) => (
                    <option key={col.name} value={col.name}>
                      {col.name} (Numeric)
                    </option>
                  ))
                ) : (
                  datasetColumns.map((col) => (
                    <option key={col.name} value={col.name}>
                      {col.name}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Aggregation Function
              </label>
              <select
                value={aggregation}
                onChange={(e) => setAggregation(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-850 border border-slate-750 text-white text-sm focus:outline-none focus:border-brand-500 transition-colors font-mono"
              >
                <option value="sum">SUM (Total value)</option>
                <option value="avg">AVERAGE (Mean value)</option>
                <option value="count">COUNT (Number of records)</option>
                <option value="min">MIN (Lowest value)</option>
                <option value="max">MAX (Highest value)</option>
              </select>
            </div>
          </div>

          {/* Dimension Column (For Charts only) */}
          {type !== "kpi" && (
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Dimension / Group By Column (Categories, Dates, Regions)
              </label>
              <select
                value={categoryColumn}
                onChange={(e) => setCategoryColumn(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-850 border border-slate-750 text-white text-sm focus:outline-none focus:border-brand-500 transition-colors"
              >
                {categoricalColumns.length > 0 ? (
                  categoricalColumns.map((col) => (
                    <option key={col.name} value={col.name}>
                      {col.name} ({col.type})
                    </option>
                  ))
                ) : (
                  datasetColumns.map((col) => (
                    <option key={col.name} value={col.name}>
                      {col.name}
                    </option>
                  ))
                )}
              </select>
            </div>
          )}

          {/* KPI Specific Options */}
          {type === "kpi" && (
            <div className="p-4 rounded-xl bg-slate-850/60 border border-slate-800 space-y-4">
              <span className="text-xs font-bold text-brand-400 uppercase tracking-wider">
                KPI Display Customization
              </span>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">
                    Value Prefix (e.g. $, ₹, €)
                  </label>
                  <input
                    type="text"
                    value={prefix}
                    onChange={(e) => setPrefix(e.target.value)}
                    placeholder="$"
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-750 text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">
                    Value Suffix (e.g. %, units, /mo)
                  </label>
                  <input
                    type="text"
                    value={suffix}
                    onChange={(e) => setSuffix(e.target.value)}
                    placeholder="units"
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-750 text-white text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-2">
                  Select Card Icon
                </label>
                <div className="flex flex-wrap gap-2">
                  {KPI_ICONS.map((item) => {
                    const Icon = item.icon;
                    const isSelected = icon === item.id;
                    return (
                      <button
                        type="button"
                        key={item.id}
                        onClick={() => setIcon(item.id)}
                        className={`p-2.5 rounded-xl border flex items-center gap-1.5 text-xs transition-colors ${
                          isSelected
                            ? "bg-brand-600 border-brand-500 text-white"
                            : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Color Palette Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2.5">
              Theme Color Palette
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {Object.keys(PALETTES).map((pKey) => {
                const p = PALETTES[pKey];
                const isSelected = colorPalette === pKey;
                return (
                  <button
                    type="button"
                    key={pKey}
                    onClick={() => setColorPalette(pKey)}
                    className={`p-3 rounded-xl border flex items-center justify-between text-xs font-medium transition-all ${
                      isSelected
                        ? "bg-slate-800 border-brand-500 text-white shadow-md shadow-brand-500/10"
                        : "bg-slate-850 border-slate-800 text-slate-400 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-1">
                        {p.borderColors.slice(0, 3).map((c, i) => (
                          <div
                            key={i}
                            className="w-3.5 h-3.5 rounded-full border border-slate-900"
                            style={{ backgroundColor: c }}
                          />
                        ))}
                      </div>
                      <span>{p.name}</span>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-brand-400" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Width Size (For charts) */}
          {type !== "kpi" && (
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Card Width
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setColSpan(1)}
                  className={`p-3 rounded-xl border text-xs font-semibold text-center transition-all ${
                    colSpan === 1
                      ? "bg-brand-600/20 border-brand-500 text-white"
                      : "bg-slate-850 border-slate-800 text-slate-400"
                  }`}
                >
                  Standard Width (1 Column)
                </button>
                <button
                  type="button"
                  onClick={() => setColSpan(2)}
                  className={`p-3 rounded-xl border text-xs font-semibold text-center transition-all ${
                    colSpan === 2
                      ? "bg-brand-600/20 border-brand-500 text-white"
                      : "bg-slate-850 border-slate-800 text-slate-400"
                  }`}
                >
                  Wide Width (2 Columns)
                </button>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-500 rounded-xl shadow-lg shadow-brand-600/30 transition-all"
            >
              {editWidget ? "Update Widget" : "Add to Dashboard"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
