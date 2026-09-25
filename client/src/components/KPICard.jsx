import React from "react";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  Award,
  BarChart3,
  Edit2,
  Trash2,
  MoreVertical,
  Activity,
} from "lucide-react";
import { formatDisplayValue, PALETTES } from "../utils/analyticsEngine.js";

const ICON_MAP = {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  Award,
  BarChart3,
  Activity,
};

export const KPICard = ({
  widget,
  value,
  onEdit,
  onDelete,
  isBuilderMode = false,
}) => {
  const {
    title = "Metric",
    metricColumn = "",
    aggregation = "sum",
    prefix = "",
    suffix = "",
    icon = "TrendingUp",
    colorPalette = "indigo",
  } = widget;

  const IconComponent = ICON_MAP[icon] || TrendingUp;
  const palette = PALETTES[colorPalette] || PALETTES.indigo;

  const displayVal = formatDisplayValue(value, prefix, suffix);

  return (
    <div className="relative group p-5 rounded-2xl glass-card border border-slate-800/80 hover:border-brand-500/40 transition-all duration-300 shadow-xl overflow-hidden">
      {/* Background ambient glow */}
      <div
        className="absolute -top-12 -right-12 w-28 h-28 rounded-full blur-2xl opacity-20 pointer-events-none transition-opacity group-hover:opacity-40"
        style={{ backgroundColor: palette.accent }}
      />

      {/* Top row: Icon + Title + Builder Actions */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-105"
            style={{
              background: `linear-gradient(135deg, ${palette.primary}, rgba(15, 23, 42, 0.9))`,
              borderColor: palette.border,
            }}
          >
            <IconComponent className="w-5 h-5 text-white" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              {title}
            </h4>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[10px] font-mono uppercase bg-slate-900 px-1.5 py-0.5 rounded text-slate-400 border border-slate-800">
                {aggregation.toUpperCase()}
              </span>
              {metricColumn && (
                <span className="text-[10px] text-slate-400 truncate max-w-[100px]">
                  {metricColumn}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Builder controls */}
        {isBuilderMode && (
          <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onEdit?.(widget)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
              title="Edit Widget"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onDelete?.(widget.id)}
              className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
              title="Remove Widget"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Big Value Display */}
      <div className="mt-2">
        <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-mono">
          {displayVal}
        </span>
      </div>

      {/* Sub-bar / Trend indicator */}
      <div className="mt-3 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs">
        <span className="flex items-center gap-1 text-emerald-400 font-medium text-[11px]">
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Active Metric</span>
        </span>
        <span className="text-[11px] text-slate-400">
          Filtered dataset
        </span>
      </div>
    </div>
  );
};
