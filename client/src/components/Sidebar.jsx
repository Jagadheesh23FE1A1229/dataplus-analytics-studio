import React from "react";
import {
  LayoutDashboard,
  Database,
  BarChart3,
  Sliders,
  FileSpreadsheet,
  Sparkles,
  HelpCircle,
  ExternalLink,
} from "lucide-react";

export const Sidebar = ({ currentRoute, onLoadSample, isSampleLoading, isOpen, onClose }) => {
  const navItems = [
    {
      id: "overview",
      label: "Overview",
      href: "#/overview",
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: "datasets",
      label: "Datasets",
      href: "#/datasets",
      icon: Database,
      badge: null,
    },
    {
      id: "dashboards",
      label: "Saved Dashboards",
      href: "#/dashboards",
      icon: BarChart3,
      badge: null,
    },
    {
      id: "builder",
      label: "Visual Builder",
      href: "#/builder",
      icon: Sliders,
      badge: "Active",
    },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-30 md:hidden"
        />
      )}

      <aside
        className={`fixed md:sticky top-16 z-35 h-[calc(100vh-4rem)] w-64 glass-panel border-r border-slate-800/80 bg-slate-950/95 flex flex-col justify-between transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="p-4 space-y-6 overflow-y-auto">
          {/* Main Navigation */}
          <div>
            <p className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Workspace
            </p>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentRoute === item.id;

                return (
                  <a
                    key={item.id}
                    href={item.href}
                    onClick={() => onClose?.()}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? "bg-brand-600 text-white shadow-lg shadow-brand-600/30"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/80"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                          isActive
                            ? "bg-white/20 text-white"
                            : "bg-brand-500/10 text-brand-400 border border-brand-500/20"
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </a>
                );
              })}
            </nav>
          </div>

          {/* Quick Demo Dataset Card */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-indigo-950/60 via-slate-900/80 to-slate-950 border border-brand-500/20 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-brand-500/10 rounded-full blur-xl pointer-events-none" />
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-brand-400 animate-pulse" />
              <span className="text-xs font-bold text-slate-100">Need Demo Data?</span>
            </div>
            <p className="text-[11px] text-slate-400 mb-3 leading-relaxed">
              Load our pre-packaged Superstore Sales dataset to explore all charts & KPIs instantly.
            </p>
            <button
              onClick={() => {
                onLoadSample?.();
                onClose?.();
              }}
              disabled={isSampleLoading}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold text-white bg-brand-600/80 hover:bg-brand-600 rounded-xl transition-all disabled:opacity-50 shadow-md shadow-brand-600/20"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>{isSampleLoading ? "Loading..." : "Load Demo Dataset"}</span>
            </button>
          </div>
        </div>

        {/* Footer info & Viva helper */}
        <div className="p-4 border-t border-slate-800/80 text-[11px] text-slate-400 space-y-2 bg-slate-950">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-medium text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              Engine Online
            </span>
            <span className="text-[10px] font-mono bg-slate-900 px-1.5 py-0.5 rounded text-slate-400 border border-slate-800">
              v1.0.0
            </span>
          </div>
          <p className="text-[10px] text-slate-400 leading-tight">
            Final Year B.Tech IT Capstone Project
          </p>
        </div>
      </aside>
    </>
  );
};
