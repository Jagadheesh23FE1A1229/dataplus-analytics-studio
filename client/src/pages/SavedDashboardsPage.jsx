import React, { useEffect, useState } from "react";
import {
  BarChart3,
  PlusCircle,
  Copy,
  Trash2,
  Sliders,
  Eye,
  Calendar,
  Layers,
  Search,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { api } from "../api/client.js";
import { useToast } from "../context/ToastContext.jsx";

export const SavedDashboardsPage = () => {
  const { success, error, info } = useToast();

  const [dashboards, setDashboards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchDashboards = async () => {
    try {
      setLoading(true);
      const res = await api.getDashboards();
      if (res.success) {
        setDashboards(res.dashboards || []);
      }
    } catch (err) {
      error("Failed to fetch saved dashboards.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboards();
  }, []);

  const handleDuplicate = async (id, title) => {
    try {
      const res = await api.duplicateDashboard(id);
      if (res.success && res.dashboard) {
        success(`Duplicated "${title}" successfully!`);
        fetchDashboards();
      }
    } catch (err) {
      error("Failed to duplicate dashboard.");
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete dashboard "${title}"?`)) {
      return;
    }

    try {
      const res = await api.deleteDashboard(id);
      if (res.success) {
        success(`Dashboard "${title}" removed.`);
        setDashboards((prev) => prev.filter((d) => d._id !== id));
      }
    } catch (err) {
      error("Failed to delete dashboard.");
    }
  };

  const filtered = dashboards.filter((d) =>
    d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (d.dataset?.name || d.datasetName || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in-50">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Saved Dashboards</h1>
          <p className="text-xs text-slate-400 mt-1">
            Access, present, duplicate, or customize your saved analytics dashboards.
          </p>
        </div>

        <a
          href="#/builder"
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 rounded-xl shadow-lg shadow-brand-600/30 transition-all hover:scale-105"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Dashboard</span>
        </a>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search saved dashboards..."
          className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-brand-500"
        />
      </div>

      {/* Grid of Dashboards */}
      {loading ? (
        <div className="p-16 text-center text-slate-400 text-xs">
          <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          Loading your dashboards...
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-16 text-center glass-card rounded-3xl border border-slate-800">
          <BarChart3 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No Dashboards Found</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            {searchQuery
              ? `No saved dashboards matching "${searchQuery}".`
              : "You haven't saved any customized dashboards yet. Launch the builder to configure and save your first dashboard."}
          </p>
          <a
            href="#/builder"
            className="mt-5 inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 rounded-xl transition-all shadow-md"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Launch Visual Builder</span>
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((dash) => {
            const datasetTitle = dash.dataset?.name || dash.datasetName || "Dataset";
            const kpiCount = (dash.widgets || []).filter((w) => w.type === "kpi").length;
            const chartCount = (dash.widgets || []).filter((w) => w.type !== "kpi").length;

            return (
              <div
                key={dash._id}
                className="p-5 rounded-2xl glass-card border border-slate-800 hover:border-slate-700/80 transition-all flex flex-col justify-between shadow-xl group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[10px] font-mono uppercase bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded border border-indigo-500/20 font-bold truncate max-w-[180px]">
                      {datasetTitle}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {dash.updatedAt ? new Date(dash.updatedAt).toLocaleDateString() : ""}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-white group-hover:text-brand-300 transition-colors line-clamp-1">
                    {dash.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {dash.description || "Interactive multi-metric analytics workspace."}
                  </p>

                  <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center gap-3 text-[11px] text-slate-400">
                    <span>{kpiCount} KPIs</span>
                    <span>•</span>
                    <span>{chartCount} Charts</span>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleDuplicate(dash._id, dash.title)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                      title="Duplicate Dashboard"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(dash._id, dash.title)}
                      className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
                      title="Delete Dashboard"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={`#/view/${dash._id}`}
                      className="px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-850 hover:bg-slate-800 border border-slate-750 rounded-lg transition-colors flex items-center gap-1.5"
                    >
                      <Eye className="w-3 h-3" />
                      <span>Present</span>
                    </a>
                    <a
                      href={`#/builder?dashboardId=${dash._id}`}
                      className="px-3 py-1.5 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-500 rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
                    >
                      <Sliders className="w-3 h-3" />
                      <span>Edit</span>
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
