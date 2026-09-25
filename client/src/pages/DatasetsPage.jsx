import React, { useEffect, useState } from "react";
import {
  Database,
  FileSpreadsheet,
  PlusCircle,
  Trash2,
  Eye,
  Sliders,
  Sparkles,
  Search,
  Calendar,
  X,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import { api } from "../api/client.js";
import { useToast } from "../context/ToastContext.jsx";

export const DatasetsPage = ({ onOpenUpload, onLoadSample, isSampleLoading }) => {
  const { success, error } = useToast();

  const [datasets, setDatasets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Inspect modal state
  const [inspectDataset, setInspectDataset] = useState(null);
  const [inspectLoading, setInspectLoading] = useState(false);
  const [inspectPage, setInspectPage] = useState(1);
  const [inspectSearch, setInspectSearch] = useState("");
  const rowsPerPage = 10;

  const fetchDatasets = async () => {
    try {
      setLoading(true);
      const res = await api.getDatasets();
      if (res.success) {
        setDatasets(res.datasets || []);
      }
    } catch (err) {
      error("Failed to load datasets.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDatasets();
  }, []);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete dataset "${name}" and all linked dashboards?`)) {
      return;
    }

    try {
      const res = await api.deleteDataset(id);
      if (res.success) {
        success(`Dataset "${name}" deleted.`);
        setDatasets((prev) => prev.filter((d) => d._id !== id));
      }
    } catch (err) {
      error(err.message || "Failed to delete dataset.");
    }
  };

  const handleInspect = async (id) => {
    try {
      setInspectLoading(true);
      const res = await api.getDatasetById(id);
      if (res.success) {
        setInspectDataset(res.dataset);
        setInspectPage(1);
        setInspectSearch("");
      }
    } catch (err) {
      error("Failed to fetch full dataset details.");
    } finally {
      setInspectLoading(false);
    }
  };

  // Filter datasets list
  const filteredDatasets = datasets.filter((d) =>
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.originalFilename?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter inspect rows
  const inspectRows = (inspectDataset?.data || []).filter((row) => {
    if (!inspectSearch.trim()) return true;
    return Object.values(row).some((val) =>
      val?.toString().toLowerCase().includes(inspectSearch.toLowerCase())
    );
  });

  const totalPages = Math.ceil(inspectRows.length / rowsPerPage) || 1;
  const paginatedInspectRows = inspectRows.slice(
    (inspectPage - 1) * rowsPerPage,
    inspectPage * rowsPerPage
  );

  return (
    <div className="space-y-6 animate-in fade-in-50">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Dataset Repository</h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage your uploaded CSV business datasets and explore detected schemas.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onLoadSample}
            disabled={isSampleLoading}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-brand-300 bg-brand-500/10 hover:bg-brand-500/20 border border-brand-500/30 rounded-xl transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-brand-400" />
            <span>Load Demo Data</span>
          </button>
          <button
            onClick={onOpenUpload}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 rounded-xl shadow-lg shadow-brand-600/30 transition-all hover:scale-105"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Upload CSV</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search datasets by name..."
          className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-brand-500"
        />
      </div>

      {/* Datasets Table */}
      <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            Loading datasets...
          </div>
        ) : filteredDatasets.length === 0 ? (
          <div className="p-12 text-center">
            <FileSpreadsheet className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-white">No Datasets Found</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              {searchQuery
                ? `No datasets matching "${searchQuery}".`
                : "You haven't uploaded any business datasets yet. Upload a CSV or load our demo dataset to begin."}
            </p>
            <div className="mt-5 flex items-center justify-center gap-3">
              <button
                onClick={onOpenUpload}
                className="px-4 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-500 rounded-xl transition-all"
              >
                Upload Your CSV
              </button>
              <button
                onClick={onLoadSample}
                className="px-4 py-2 text-xs font-semibold text-brand-300 bg-brand-500/10 hover:bg-brand-500/20 border border-brand-500/30 rounded-xl transition-all"
              >
                Load Demo Sales Data
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/90 text-slate-400 uppercase tracking-wider text-[10px] font-bold border-b border-slate-800">
                <tr>
                  <th className="px-5 py-3.5">Dataset Name</th>
                  <th className="px-5 py-3.5">File Details</th>
                  <th className="px-5 py-3.5">Dimensions</th>
                  <th className="px-5 py-3.5">Uploaded</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredDatasets.map((d) => (
                  <tr key={d._id} className="hover:bg-slate-850/50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-brand-500/10 text-brand-400 flex items-center justify-center shrink-0">
                          <FileSpreadsheet className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="font-bold text-white text-sm block">{d.name}</span>
                          <span className="text-[11px] text-slate-400">{d.originalFilename}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-slate-300 font-mono text-[11px]">
                        {d.fileSize ? `${(d.fileSize / 1024).toFixed(1)} KB` : "CSV"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 text-[10px] font-bold font-mono">
                          {d.rowCount} rows
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-400 text-[10px] font-bold font-mono">
                          {d.columnCount} cols
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-400 text-[11px]">
                      {d.createdAt ? new Date(d.createdAt).toLocaleDateString() : "Recent"}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleInspect(d._id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                          title="Inspect Data & Schema"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <a
                          href={`#/builder?datasetId=${d._id}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-500 rounded-lg shadow-sm transition-all"
                        >
                          <Sliders className="w-3.5 h-3.5" />
                          <span>Build Dashboard</span>
                        </a>
                        <button
                          onClick={() => handleDelete(d._id, d.name)}
                          className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
                          title="Delete Dataset"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Dataset Inspection & Schema Modal */}
      {inspectDataset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-6 max-h-[90vh] flex flex-col animate-in fade-in-50 zoom-in-95">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/80">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-brand-600/20 text-brand-400 flex items-center justify-center border border-brand-500/30">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">{inspectDataset.name}</h3>
                  <p className="text-xs text-slate-400">
                    {inspectDataset.rowCount} Rows • {inspectDataset.columnCount} Columns • Schema & Data Explorer
                  </p>
                </div>
              </div>
              <button
                onClick={() => setInspectDataset(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              {/* Column Schema Summary */}
              <div>
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
                  Detected Column Schema & Types
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {(inspectDataset.columns || []).map((col, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-850 border border-slate-800">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-white truncate max-w-[120px]">
                          {col.name}
                        </span>
                        <span
                          className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded font-bold ${
                            col.type === "number"
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : col.type === "date"
                              ? "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                              : "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                          }`}
                        >
                          {col.type}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 flex items-center justify-between">
                        <span>Missing: {col.missingCount || 0}</span>
                        <span>Sample: {col.sampleValues?.[0] || "-"}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Table Data Viewer with search & pagination */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Raw Records ({inspectRows.length} filtered)
                  </h4>
                  <div className="relative max-w-xs w-full">
                    <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={inspectSearch}
                      onChange={(e) => {
                        setInspectSearch(e.target.value);
                        setInspectPage(1);
                      }}
                      placeholder="Search row values..."
                      className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-850 border border-slate-750 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-brand-500"
                    />
                  </div>
                </div>

                <div className="rounded-xl border border-slate-800 overflow-x-auto max-h-72">
                  <table className="w-full text-left text-[11px] text-slate-300 font-mono">
                    <thead className="bg-slate-850 text-slate-400 sticky top-0 border-b border-slate-750">
                      <tr>
                        {(inspectDataset.columns || []).map((col, i) => (
                          <th key={i} className="px-3 py-2 font-semibold truncate">
                            {col.name}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80 bg-slate-900/60">
                      {paginatedInspectRows.map((row, rIdx) => (
                        <tr key={rIdx} className="hover:bg-slate-800/40">
                          {(inspectDataset.columns || []).map((col, cIdx) => (
                            <td key={cIdx} className="px-3 py-1.5 truncate max-w-[150px]">
                              {row[col.name] !== undefined ? String(row[col.name]) : "-"}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Controls */}
                <div className="flex items-center justify-between text-xs text-slate-400 pt-2">
                  <span>
                    Page {inspectPage} of {totalPages}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setInspectPage((p) => Math.max(p - 1, 1))}
                      disabled={inspectPage <= 1}
                      className="p-1 rounded-lg hover:bg-slate-800 text-slate-300 disabled:opacity-40"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setInspectPage((p) => Math.min(p + 1, totalPages))}
                      disabled={inspectPage >= totalPages}
                      className="p-1 rounded-lg hover:bg-slate-800 text-slate-300 disabled:opacity-40"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-800 bg-slate-900 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                Ready to build interactive visualizations?
              </span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setInspectDataset(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
                >
                  Close
                </button>
                <a
                  href={`#/builder?datasetId=${inspectDataset._id}`}
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 rounded-xl shadow-lg shadow-brand-600/30 transition-all"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Launch Visual Builder</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
