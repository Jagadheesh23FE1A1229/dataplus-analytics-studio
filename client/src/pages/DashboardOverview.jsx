import React, { useEffect, useState } from "react";
import {
  Database,
  BarChart3,
  Layers,
  Sparkles,
  ArrowRight,
  PlusCircle,
  FileSpreadsheet,
  Clock,
  ExternalLink,
  Table,
} from "lucide-react";
import { api } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";

export const DashboardOverview = ({ onOpenUpload, onLoadSample, isSampleLoading }) => {
  const { user } = useAuth();
  const { error } = useToast();

  const [stats, setStats] = useState({
    datasetCount: 0,
    dashboardCount: 0,
    totalWidgets: 0,
    totalRowsAnalyzed: 0,
  });
  const [datasets, setDatasets] = useState([]);
  const [dashboards, setDashboards] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOverviewData = async () => {
    try {
      setLoading(true);
      const [statsRes, datasetsRes, dashboardsRes] = await Promise.all([
        api.getOverviewStats().catch(() => ({ stats: {} })),
        api.getDatasets().catch(() => ({ datasets: [] })),
        api.getDashboards().catch(() => ({ dashboards: [] })),
      ]);

      if (statsRes.success) setStats(statsRes.stats);
      if (datasetsRes.success) setDatasets(datasetsRes.datasets || []);
      if (dashboardsRes.success) setDashboards(dashboardsRes.dashboards || []);
    } catch (err) {
      error("Failed to load dashboard overview data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverviewData();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in-50">
      {/* Welcome Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-brand-950/70 via-indigo-950/50 to-slate-900 border border-brand-500/20 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5 text-brand-400" />
              <span>Full-Stack Business Intelligence Platform</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Welcome back, {user?.name || "Analyst"}!
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl leading-relaxed">
              Upload spreadsheets or analyze loaded business records. Generate interactive charts,
              monitor KPI cards, and export high-resolution presentations.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenUpload}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-xl transition-all shadow-md"
            >
              <Database className="w-4 h-4 text-brand-400" />
              <span>Upload CSV</span>
            </button>

            <a
              href="#/builder"
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 rounded-xl shadow-lg shadow-brand-600/30 transition-all hover:scale-105"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Open Visual Builder</span>
            </a>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="p-5 rounded-2xl glass-card border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Datasets</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <Database className="w-4 h-4" />
            </div>
          </div>
          <span className="text-3xl font-extrabold text-white font-mono">
            {stats.datasetCount}
          </span>
          <p className="text-[11px] text-slate-400 mt-1">Uploaded & analyzed</p>
        </div>

        <div className="p-5 rounded-2xl glass-card border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Dashboards</span>
            <div className="w-8 h-8 rounded-lg bg-brand-500/10 text-brand-400 flex items-center justify-center">
              <BarChart3 className="w-4 h-4" />
            </div>
          </div>
          <span className="text-3xl font-extrabold text-white font-mono">
            {stats.dashboardCount}
          </span>
          <p className="text-[11px] text-slate-400 mt-1">Saved custom workspaces</p>
        </div>

        <div className="p-5 rounded-2xl glass-card border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Widgets</span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <span className="text-3xl font-extrabold text-white font-mono">
            {stats.totalWidgets}
          </span>
          <p className="text-[11px] text-slate-400 mt-1">Charts and KPI cards</p>
        </div>

        <div className="p-5 rounded-2xl glass-card border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Rows Processed</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
          </div>
          <span className="text-3xl font-extrabold text-white font-mono">
            {stats.totalRowsAnalyzed.toLocaleString()}
          </span>
          <p className="text-[11px] text-slate-400 mt-1">Data points ingested</p>
        </div>
      </div>

      {/* Main Sections: Recent Datasets & Saved Dashboards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Datasets */}
        <div className="p-6 rounded-3xl glass-card border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <Database className="w-5 h-5 text-brand-400" />
                <h3 className="text-sm font-bold text-white">Your Datasets</h3>
              </div>
              <a
                href="#/datasets"
                className="text-xs text-brand-400 hover:text-brand-300 font-semibold flex items-center gap-1"
              >
                <span>View All ({datasets.length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>

            {datasets.length === 0 ? (
              <div className="text-center py-10 px-4">
                <FileSpreadsheet className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                <p className="text-xs font-semibold text-slate-300">No datasets uploaded yet</p>
                <p className="text-[11px] text-slate-500 mt-1 max-w-xs mx-auto">
                  Upload your own CSV or test immediately with our pre-loaded sales dataset.
                </p>
                <div className="mt-4 flex items-center justify-center gap-3">
                  <button
                    onClick={onLoadSample}
                    disabled={isSampleLoading}
                    className="px-3.5 py-1.5 text-xs font-semibold text-brand-300 bg-brand-500/10 hover:bg-brand-500/20 border border-brand-500/30 rounded-lg transition-colors"
                  >
                    Load Sample Sales Data
                  </button>
                  <button
                    onClick={onOpenUpload}
                    className="px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    Upload CSV
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {datasets.slice(0, 4).map((d) => (
                  <div
                    key={d._id}
                    className="p-3.5 rounded-xl bg-slate-850/60 border border-slate-800 hover:border-slate-700 flex items-center justify-between transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-brand-500/10 text-brand-400 flex items-center justify-center shrink-0">
                        <FileSpreadsheet className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white truncate max-w-[180px] sm:max-w-xs">
                          {d.name}
                        </h4>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {d.rowCount} rows • {d.columnCount} columns
                        </p>
                      </div>
                    </div>
                    <a
                      href={`#/builder?datasetId=${d._id}`}
                      className="px-3 py-1.5 text-[11px] font-semibold text-white bg-brand-600/80 hover:bg-brand-600 rounded-lg transition-colors flex items-center gap-1.5"
                    >
                      <span>Build</span>
                      <ArrowRight className="w-3 h-3" />
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Saved Dashboards */}
        <div className="p-6 rounded-3xl glass-card border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <BarChart3 className="w-5 h-5 text-purple-400" />
                <h3 className="text-sm font-bold text-white">Saved Dashboards</h3>
              </div>
              <a
                href="#/dashboards"
                className="text-xs text-brand-400 hover:text-brand-300 font-semibold flex items-center gap-1"
              >
                <span>View All ({dashboards.length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>

            {dashboards.length === 0 ? (
              <div className="text-center py-10 px-4">
                <BarChart3 className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                <p className="text-xs font-semibold text-slate-300">No saved dashboards yet</p>
                <p className="text-[11px] text-slate-500 mt-1 max-w-xs mx-auto">
                  Pick a dataset and assemble your customized charts and KPI cards.
                </p>
                <a
                  href="#/builder"
                  className="mt-4 inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-500 rounded-lg transition-all"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Create Dashboard</span>
                </a>
              </div>
            ) : (
              <div className="space-y-3">
                {dashboards.slice(0, 4).map((dash) => (
                  <div
                    key={dash._id}
                    className="p-3.5 rounded-xl bg-slate-850/60 border border-slate-800 hover:border-slate-700 flex items-center justify-between transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0">
                        <BarChart3 className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white truncate max-w-[180px] sm:max-w-xs">
                          {dash.title}
                        </h4>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {dash.widgets?.length || 0} widgets • {dash.dataset?.name || dash.datasetName || "Dataset"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <a
                        href={`#/view/${dash._id}`}
                        className="px-2.5 py-1.5 text-[11px] font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                      >
                        Present
                      </a>
                      <a
                        href={`#/builder?dashboardId=${dash._id}`}
                        className="px-2.5 py-1.5 text-[11px] font-semibold text-white bg-brand-600/80 hover:bg-brand-600 rounded-lg transition-colors"
                      >
                        Edit
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
