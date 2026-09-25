import React, { useRef } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Bar, Line, Pie, Doughnut } from "react-chartjs-2";
import {
  Download,
  Edit2,
  Trash2,
  Copy,
  Maximize2,
  Columns,
  Square,
} from "lucide-react";
import { PALETTES } from "../utils/analyticsEngine.js";

// Register Chart.js modules
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export const ChartWidget = ({
  widget,
  chartData,
  onEdit,
  onDuplicate,
  onDelete,
  onToggleColSpan,
  isBuilderMode = false,
}) => {
  const chartRef = useRef(null);

  const {
    id,
    type = "bar",
    title = "Chart",
    colSpan = 1,
    metricColumn = "",
    categoryColumn = "",
    aggregation = "sum",
    colorPalette = "indigo",
  } = widget;

  const palette = PALETTES[colorPalette] || PALETTES.indigo;

  // Prepare Chart.js dataset config
  const labels = chartData?.labels || [];
  const values = chartData?.values || [];

  const isPieOrDoughnut = type === "pie" || type === "doughnut";
  const isLine = type === "line";
  const isHorizontalBar = type === "horizontal-bar";

  const chartJsData = {
    labels,
    datasets: [
      {
        label: `${aggregation.toUpperCase()} of ${metricColumn || "Count"}`,
        data: values,
        backgroundColor: isPieOrDoughnut
          ? palette.colors.slice(0, Math.max(labels.length, 1))
          : isLine
          ? (context) => {
              const ctx = context.chart.ctx;
              const gradient = ctx.createLinearGradient(0, 0, 0, 300);
              gradient.addColorStop(0, palette.primary.replace("0.85", "0.45"));
              gradient.addColorStop(1, "rgba(15, 23, 42, 0)");
              return gradient;
            }
          : palette.colors.slice(0, Math.max(labels.length, 1)),
        borderColor: isPieOrDoughnut
          ? palette.borderColors.slice(0, Math.max(labels.length, 1))
          : isLine
          ? palette.border
          : palette.borderColors.slice(0, Math.max(labels.length, 1)),
        borderWidth: isPieOrDoughnut ? 2 : 1.5,
        borderRadius: type === "bar" || isHorizontalBar ? 6 : 0,
        fill: isLine,
        tension: 0.35,
        pointBackgroundColor: palette.border,
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: isHorizontalBar ? "y" : "x",
    plugins: {
      legend: {
        display: isPieOrDoughnut,
        position: "bottom",
        labels: {
          color: "#94a3b8",
          font: { family: "Plus Jakarta Sans, sans-serif", size: 11 },
          padding: 12,
          usePointStyle: true,
        },
      },
      tooltip: {
        backgroundColor: "rgba(15, 23, 42, 0.95)",
        titleColor: "#f8fafc",
        bodyColor: "#cbd5e1",
        borderColor: "rgba(99, 102, 241, 0.3)",
        borderWidth: 1,
        padding: 10,
        cornerRadius: 8,
        displayColors: isPieOrDoughnut,
      },
    },
    scales: isPieOrDoughnut
      ? {}
      : {
          x: {
            grid: { color: "rgba(255, 255, 255, 0.05)", drawBorder: false },
            ticks: {
              color: "#94a3b8",
              font: { family: "Plus Jakarta Sans, sans-serif", size: 10 },
              maxRotation: 45,
            },
          },
          y: {
            grid: { color: "rgba(255, 255, 255, 0.05)", drawBorder: false },
            ticks: {
              color: "#94a3b8",
              font: { family: "Plus Jakarta Sans, sans-serif", size: 10 },
            },
          },
        },
  };

  // Download chart as PNG image
  const handleDownloadPng = () => {
    if (chartRef.current) {
      const url = chartRef.current.toBase64Image();
      const link = document.createElement("a");
      link.download = `${title.toLowerCase().replace(/\s+/g, "_")}_chart.png`;
      link.href = url;
      link.click();
    }
  };

  return (
    <div
      className={`glass-card p-5 rounded-2xl border border-slate-800/80 hover:border-slate-700/80 transition-all flex flex-col justify-between shadow-xl ${
        colSpan === 2 ? "col-span-1 lg:col-span-2" : "col-span-1"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800/60">
        <div>
          <h3 className="text-sm font-bold text-white tracking-tight">{title}</h3>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {categoryColumn} • <span className="font-mono uppercase">{aggregation}</span>({metricColumn || "Count"})
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={handleDownloadPng}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
            title="Download PNG image"
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          {isBuilderMode && (
            <>
              <button
                onClick={() => onToggleColSpan?.(id)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
                title={colSpan === 2 ? "Switch to Half Width" : "Switch to Full Width"}
              >
                {colSpan === 2 ? <Columns className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => onDuplicate?.(widget)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
                title="Duplicate Chart"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onEdit?.(widget)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
                title="Edit Configuration"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onDelete?.(id)}
                className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
                title="Delete Chart"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Chart Canvas Area */}
      <div className="w-full h-64 sm:h-72 relative flex items-center justify-center">
        {labels.length === 0 ? (
          <div className="text-center text-slate-400 text-xs">
            No data points match current filters.
          </div>
        ) : type === "bar" || isHorizontalBar ? (
          <Bar ref={chartRef} data={chartJsData} options={chartOptions} />
        ) : isLine ? (
          <Line ref={chartRef} data={chartJsData} options={chartOptions} />
        ) : type === "pie" ? (
          <Pie ref={chartRef} data={chartJsData} options={chartOptions} />
        ) : type === "doughnut" ? (
          <Doughnut ref={chartRef} data={chartJsData} options={chartOptions} />
        ) : null}
      </div>
    </div>
  );
};
