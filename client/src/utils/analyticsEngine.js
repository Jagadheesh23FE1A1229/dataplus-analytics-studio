import Papa from "papaparse";

// Curated aesthetic color schemes
export const PALETTES = {
  indigo: {
    name: "Modern Indigo",
    primary: "rgba(99, 102, 241, 0.85)",
    border: "rgba(99, 102, 241, 1)",
    accent: "#6366f1",
    colors: [
      "rgba(99, 102, 241, 0.85)",
      "rgba(139, 92, 246, 0.85)",
      "rgba(168, 85, 247, 0.85)",
      "rgba(79, 70, 229, 0.85)",
      "rgba(59, 130, 246, 0.85)",
      "rgba(14, 165, 233, 0.85)",
      "rgba(217, 70, 239, 0.85)",
      "rgba(96, 165, 250, 0.85)",
    ],
    borderColors: [
      "#6366f1",
      "#8b5cf6",
      "#a855f7",
      "#4f46e5",
      "#3b82f6",
      "#0ea5e9",
      "#d946ef",
      "#60a5fa",
    ],
  },
  emerald: {
    name: "Emerald Mint",
    primary: "rgba(16, 185, 129, 0.85)",
    border: "rgba(16, 185, 129, 1)",
    accent: "#10b981",
    colors: [
      "rgba(16, 185, 129, 0.85)",
      "rgba(20, 184, 166, 0.85)",
      "rgba(6, 182, 212, 0.85)",
      "rgba(52, 211, 153, 0.85)",
      "rgba(45, 212, 191, 0.85)",
      "rgba(101, 163, 13, 0.85)",
      "rgba(132, 204, 22, 0.85)",
    ],
    borderColors: [
      "#10b981",
      "#14b8a6",
      "#06b6d4",
      "#34d399",
      "#2dd4bf",
      "#65a30d",
      "#84cc16",
    ],
  },
  sunset: {
    name: "Sunset Glow",
    primary: "rgba(244, 63, 94, 0.85)",
    border: "rgba(244, 63, 94, 1)",
    accent: "#f43f5e",
    colors: [
      "rgba(244, 63, 94, 0.85)",
      "rgba(249, 115, 22, 0.85)",
      "rgba(234, 179, 8, 0.85)",
      "rgba(236, 72, 153, 0.85)",
      "rgba(251, 146, 60, 0.85)",
      "rgba(248, 113, 113, 0.85)",
      "rgba(245, 158, 11, 0.85)",
    ],
    borderColors: [
      "#f43f5e",
      "#f97316",
      "#eab308",
      "#ec4899",
      "#fb923c",
      "#f87171",
      "#f59e0b",
    ],
  },
  neon: {
    name: "Cyber Neon",
    primary: "rgba(6, 182, 212, 0.85)",
    border: "rgba(6, 182, 212, 1)",
    accent: "#06b6d4",
    colors: [
      "rgba(6, 182, 212, 0.85)",
      "rgba(217, 70, 239, 0.85)",
      "rgba(132, 204, 22, 0.85)",
      "rgba(244, 63, 94, 0.85)",
      "rgba(59, 130, 246, 0.85)",
      "rgba(250, 204, 21, 0.85)",
    ],
    borderColors: [
      "#06b6d4",
      "#d946ef",
      "#84cc16",
      "#f43f5e",
      "#3b82f6",
      "#facc15",
    ],
  },
  ocean: {
    name: "Deep Ocean",
    primary: "rgba(14, 165, 233, 0.85)",
    border: "rgba(14, 165, 233, 1)",
    accent: "#0ea5e9",
    colors: [
      "rgba(14, 165, 233, 0.85)",
      "rgba(59, 130, 246, 0.85)",
      "rgba(99, 102, 241, 0.85)",
      "rgba(2, 132, 199, 0.85)",
      "rgba(30, 58, 138, 0.85)",
      "rgba(56, 189, 248, 0.85)",
    ],
    borderColors: [
      "#0ea5e9",
      "#3b82f6",
      "#6366f1",
      "#0284c7",
      "#1e3a8a",
      "#38bdf8",
    ],
  },
};

// Helper: Safely parse a value as float
export const parseCleanNumber = (val) => {
  if (val === undefined || val === null) return 0;
  if (typeof val === "number") return val;
  const str = val.toString().replace(/[$,€£%,\s]/g, "");
  const num = parseFloat(str);
  return isNaN(num) ? 0 : num;
};

// Dynamic data filtering engine
export const filterRows = (rows, filters = {}) => {
  if (!rows || !Array.isArray(rows)) return [];
  if (!filters) return rows;

  return rows.filter((row) => {
    // 1. Date Range Filter
    if (filters.dateRange?.column && (filters.dateRange.startDate || filters.dateRange.endDate)) {
      const col = filters.dateRange.column;
      const rowVal = row[col];
      if (rowVal) {
        const rowTime = new Date(rowVal).getTime();
        if (!isNaN(rowTime)) {
          if (filters.dateRange.startDate) {
            const startTime = new Date(filters.dateRange.startDate).getTime();
            if (rowTime < startTime) return false;
          }
          if (filters.dateRange.endDate) {
            const endTime = new Date(filters.dateRange.endDate).getTime();
            // Include end of day
            if (rowTime > endTime + 86400000) return false;
          }
        }
      }
    }

    // 2. Category Filter
    if (
      filters.categoryFilter?.column &&
      Array.isArray(filters.categoryFilter.selectedValues) &&
      filters.categoryFilter.selectedValues.length > 0
    ) {
      const col = filters.categoryFilter.column;
      const rowVal = (row[col] ?? "").toString().trim();
      if (!filters.categoryFilter.selectedValues.includes(rowVal)) {
        return false;
      }
    }

    return true;
  });
};

// Statistical calculation engine (SUM, COUNT, AVERAGE, MIN, MAX)
export const computeMetric = (rows, metricColumn, aggregation = "sum") => {
  if (!rows || rows.length === 0) return 0;

  if (aggregation === "count") {
    if (!metricColumn) return rows.length;
    return rows.filter(
      (r) => r[metricColumn] !== undefined && r[metricColumn] !== null && r[metricColumn] !== ""
    ).length;
  }

  const values = rows
    .map((r) => parseCleanNumber(r[metricColumn]))
    .filter((v) => !isNaN(v));

  if (values.length === 0) return 0;

  switch (aggregation.toLowerCase()) {
    case "sum":
      return values.reduce((acc, curr) => acc + curr, 0);

    case "avg":
    case "average":
      const sum = values.reduce((acc, curr) => acc + curr, 0);
      return sum / values.length;

    case "min":
      return Math.min(...values);

    case "max":
      return Math.max(...values);

    default:
      return values.reduce((acc, curr) => acc + curr, 0);
  }
};

// Grouping and Chart.js dataset generator
export const computeGroupedData = (
  rows,
  categoryColumn,
  metricColumn,
  aggregation = "sum",
  sortBy = "value-desc",
  limit = 10
) => {
  if (!rows || rows.length === 0 || !categoryColumn) {
    return { labels: [], values: [] };
  }

  const groups = {};

  rows.forEach((row) => {
    let cat = row[categoryColumn];
    if (cat === undefined || cat === null || cat.toString().trim() === "") {
      cat = "(Empty)";
    } else {
      cat = cat.toString().trim();
    }

    if (!groups[cat]) {
      groups[cat] = [];
    }

    if (metricColumn) {
      groups[cat].push(parseCleanNumber(row[metricColumn]));
    } else {
      groups[cat].push(1);
    }
  });

  const processed = Object.keys(groups).map((category) => {
    const vals = groups[category];
    let val = 0;

    if (aggregation === "count") {
      val = vals.length;
    } else if (aggregation === "avg" || aggregation === "average") {
      val = vals.reduce((a, b) => a + b, 0) / (vals.length || 1);
    } else if (aggregation === "min") {
      val = Math.min(...vals);
    } else if (aggregation === "max") {
      val = Math.max(...vals);
    } else {
      // Default: sum
      val = vals.reduce((a, b) => a + b, 0);
    }

    return { category, value: val };
  });

  // Sorting
  if (sortBy === "value-desc") {
    processed.sort((a, b) => b.value - a.value);
  } else if (sortBy === "value-asc") {
    processed.sort((a, b) => a.value - b.value);
  } else if (sortBy === "alpha") {
    processed.sort((a, b) => a.category.localeCompare(b.category));
  }

  // Top N grouping
  let finalItems = processed;
  if (limit > 0 && processed.length > limit) {
    const top = processed.slice(0, limit);
    const rest = processed.slice(limit);
    const othersVal = rest.reduce((acc, curr) => acc + curr.value, 0);
    finalItems = [...top, { category: "Other", value: othersVal }];
  }

  return {
    labels: finalItems.map((item) => item.category),
    values: finalItems.map((item) => Math.round(item.value * 100) / 100),
  };
};

// Formatter for KPI values
export const formatDisplayValue = (val, prefix = "", suffix = "", decimals = 2) => {
  if (val === undefined || val === null || isNaN(val)) return "0";

  let formatted = "";
  const abs = Math.abs(val);

  if (abs >= 1_000_000_000) {
    formatted = (val / 1_000_000_000).toFixed(decimals) + "B";
  } else if (abs >= 1_000_000) {
    formatted = (val / 1_000_000).toFixed(decimals) + "M";
  } else if (abs >= 10_000) {
    formatted = (val / 1_000).toFixed(1) + "k";
  } else {
    formatted = val.toLocaleString(undefined, {
      minimumFractionDigits: val % 1 === 0 ? 0 : Math.min(decimals, 2),
      maximumFractionDigits: decimals,
    });
  }

  return `${prefix}${formatted}${suffix}`;
};

// CSV Export helper
export const exportDataToCsv = (filename, rows) => {
  if (!rows || rows.length === 0) return;
  const csv = Papa.unparse(rows);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename.endsWith(".csv") ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
