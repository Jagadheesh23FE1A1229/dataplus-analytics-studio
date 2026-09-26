import React from "react";
import {
  BarChart3,
  TrendingUp,
  FileSpreadsheet,
  Layers,
  Sparkles,
  ShieldCheck,
  Zap,
  ArrowRight,
  CheckCircle,
  Database,
  PieChart,
  Download,
  Share2,
  Code2,
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

export const LandingPage = ({ onGetStarted, onLogin }) => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950/40 text-slate-100 selection:bg-brand-500 selection:text-white">
      {/* Top Header */}
      <header className="sticky top-0 z-50 glass-panel border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-brand-500/25">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-brand-300 bg-clip-text text-transparent">
                DataPulse
              </span>
              <span className="text-[10px] text-slate-400 font-medium -mt-1 tracking-wider uppercase">
                Analytics Studio
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <a
                href="#/overview"
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 rounded-xl shadow-lg shadow-brand-600/30 transition-all hover:scale-105"
              >
                Go to Workspace
                <ArrowRight className="w-4 h-4" />
              </a>
            ) : (
              <>
                <button
                  onClick={onLogin}
                  className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={onGetStarted}
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 rounded-xl shadow-lg shadow-brand-600/30 transition-all hover:scale-105"
                >
                  Get Started Free
                  <ArrowRight className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 md:pt-24 md:pb-28 overflow-hidden">
        {/* Glow gradients in background */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-brand-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/25 text-brand-300 text-xs font-semibold mb-6 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-brand-400" />
            <span>Final-Year B.Tech IT Capstone & Placement Portfolio</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight sm:leading-none">
            Transform Raw CSV Datasets into{" "}
            <span className="bg-gradient-to-r from-brand-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
              High-Impact Analytics
            </span>{" "}
            in Seconds.
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Drag and drop business spreadsheets, compute SUM, AVG, MIN, MAX aggregations, generate
            interactive Chart.js visual graphs, and construct customizable BI dashboards with zero
            code.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={onGetStarted}
              className="inline-flex items-center gap-2.5 px-6 py-3.5 text-sm font-bold text-white bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 hover:from-brand-500 hover:to-indigo-500 rounded-xl shadow-xl shadow-brand-600/30 transition-all hover:scale-105"
            >
              <span>Build Your First Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onLogin}
              className="inline-flex items-center gap-2 px-6 py-3.5 text-sm font-semibold text-slate-300 hover:text-white bg-slate-900/80 hover:bg-slate-850 border border-slate-750 rounded-xl transition-all"
            >
              <span>Explore Demo Workspace</span>
            </button>
          </div>

          {/* Feature Highlights Grid */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
            <div className="p-4 rounded-2xl glass-card border border-slate-800">
              <Zap className="w-5 h-5 text-amber-400 mb-2" />
              <h4 className="text-xs font-bold text-white">Instant CSV Ingestion</h4>
              <p className="text-[11px] text-slate-400 mt-1">
                Schema detection & missing value analyzer.
              </p>
            </div>
            <div className="p-4 rounded-2xl glass-card border border-slate-800">
              <TrendingUp className="w-5 h-5 text-brand-400 mb-2" />
              <h4 className="text-xs font-bold text-white">Aggregation Engine</h4>
              <p className="text-[11px] text-slate-400 mt-1">
                SUM, AVG, MIN, MAX & grouping logic.
              </p>
            </div>
            <div className="p-4 rounded-2xl glass-card border border-slate-800">
              <PieChart className="w-5 h-5 text-emerald-400 mb-2" />
              <h4 className="text-xs font-bold text-white">Rich Chart Library</h4>
              <p className="text-[11px] text-slate-400 mt-1">
                Bar, Line, Pie, Doughnut with palettes.
              </p>
            </div>
            <div className="p-4 rounded-2xl glass-card border border-slate-800">
              <ShieldCheck className="w-5 h-5 text-indigo-400 mb-2" />
              <h4 className="text-xs font-bold text-white">Secure MERN Stack</h4>
              <p className="text-[11px] text-slate-400 mt-1">
                JWT bearer auth with user data isolation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Workflow Section */}
      <section className="py-20 border-t border-slate-900/60 bg-slate-950/40 backdrop-blur-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold text-brand-400 uppercase tracking-widest mb-2">
              End-to-End Workflow
            </h2>
            <p className="text-2xl sm:text-3xl font-extrabold text-white">
              From Raw Data to Executive Visuals in 4 Simple Steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl glass-card border border-slate-800 relative">
              <div className="w-8 h-8 rounded-full bg-brand-500/20 text-brand-400 font-bold text-xs flex items-center justify-center mb-4">
                01
              </div>
              <h3 className="text-sm font-bold text-white mb-2">Upload Dataset</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Drop your CSV spreadsheet. The system automatically infers column data types
                (number, string, date).
              </p>
            </div>

            <div className="p-6 rounded-2xl glass-card border border-slate-800 relative">
              <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 font-bold text-xs flex items-center justify-center mb-4">
                02
              </div>
              <h3 className="text-sm font-bold text-white mb-2">Configure Metrics</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Choose quantitative metrics like Sales, Revenue, or Profit, and aggregate using
                SUM, AVERAGE, MIN, or MAX.
              </p>
            </div>

            <div className="p-6 rounded-2xl glass-card border border-slate-800 relative">
              <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 font-bold text-xs flex items-center justify-center mb-4">
                03
              </div>
              <h3 className="text-sm font-bold text-white mb-2">Build Layouts</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Arrange KPI cards and multi-column visual charts. Customize color themes, prefixes,
                and legends.
              </p>
            </div>

            <div className="p-6 rounded-2xl glass-card border border-slate-800 relative">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs flex items-center justify-center mb-4">
                04
              </div>
              <h3 className="text-sm font-bold text-white mb-2">Export & Share</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Filter across dates and categories, download processed data to CSV, or print
                presentation-ready PDF reports.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack Banner for B.Tech Viva & Placement */}
      <section className="py-16 border-t border-slate-900/60 bg-slate-900/20 backdrop-blur-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">
            Industry Standard Full-Stack Architecture
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6">
            {[
              "React 18",
              "Vite",
              "Tailwind CSS",
              "Chart.js",
              "Node.js",
              "Express.js",
              "MongoDB Atlas",
              "Mongoose",
              "JWT Auth",
              "bcryptjs",
              "PapaParse",
            ].map((tech) => (
              <span
                key={tech}
                className="px-3.5 py-1.5 rounded-xl bg-slate-850 border border-slate-800 text-xs font-mono text-slate-300 font-semibold shadow-sm"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-slate-900 text-center text-xs text-slate-400">
        <p>© 2026 DataPulse Analytics Builder • Designed for Academic & Career Excellence</p>
      </footer>
    </div>
  );
};
