import React, { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import {
  BarChart3,
  PlusCircle,
  LogOut,
  User,
  ChevronDown,
  LayoutDashboard,
  Database,
  Sparkles,
  Menu,
  X,
} from "lucide-react";

export const Navbar = ({ onOpenUpload, onToggleSidebar, isSidebarOpen }) => {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80 bg-slate-950/80">
      <div className="flex items-center justify-between h-16 px-4 md:px-6">
        {/* Left: Mobile menu toggle + Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/60 transition-colors md:hidden"
            aria-label="Toggle Navigation"
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <a href="#/overview" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-brand-500/25 group-hover:scale-105 transition-transform">
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
          </a>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Quick upload dataset button */}
          <button
            onClick={onOpenUpload}
            className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-brand-300 bg-brand-500/10 hover:bg-brand-500/20 border border-brand-500/30 rounded-lg transition-all"
          >
            <Database className="w-3.5 h-3.5" />
            Upload CSV
          </button>

          {/* Quick New Dashboard button */}
          <a
            href="#/builder"
            className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 rounded-lg shadow-md shadow-brand-600/30 transition-all hover:scale-[1.02]"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Dashboard</span>
          </a>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-800/60 transition-colors border border-transparent hover:border-slate-700/60"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-brand-700 flex items-center justify-center font-bold text-white text-xs uppercase shadow-sm">
                {user?.name ? user.name.substring(0, 2) : "U"}
              </div>
              <div className="hidden lg:flex flex-col text-left">
                <span className="text-xs font-semibold text-slate-200 leading-tight">
                  {user?.name || "User"}
                </span>
                <span className="text-[10px] text-slate-400 leading-none truncate max-w-[120px]">
                  {user?.email || "user@analytics.com"}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
            </button>

            {dropdownOpen && (
              <div
                className="absolute right-0 mt-2 w-56 rounded-xl glass-card border border-slate-700/80 bg-slate-900/95 shadow-2xl py-1.5 z-50 animate-in fade-in-50 zoom-in-95"
                onMouseLeave={() => setDropdownOpen(false)}
              >
                <div className="px-4 py-2.5 border-b border-slate-800">
                  <p className="text-xs font-medium text-slate-400">Signed in as</p>
                  <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
                  <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                </div>

                <div className="py-1">
                  <a
                    href="#/overview"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors"
                  >
                    <LayoutDashboard className="w-4 h-4 text-slate-400" />
                    Dashboard Overview
                  </a>
                  <a
                    href="#/datasets"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors"
                  >
                    <Database className="w-4 h-4 text-slate-400" />
                    My Datasets
                  </a>
                </div>

                <div className="pt-1 border-t border-slate-800">
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-rose-400 hover:bg-rose-500/10 transition-colors text-left font-medium"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
