import React, { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import { ToastProvider, useToast } from "./context/ToastContext.jsx";
import { Navbar } from "./components/Navbar.jsx";
import { Sidebar } from "./components/Sidebar.jsx";
import { DatasetUploadModal } from "./components/DatasetUploadModal.jsx";

// Pages
import { LandingPage } from "./pages/LandingPage.jsx";
import { LoginPage } from "./pages/LoginPage.jsx";
import { RegisterPage } from "./pages/RegisterPage.jsx";
import { DashboardOverview } from "./pages/DashboardOverview.jsx";
import { DatasetsPage } from "./pages/DatasetsPage.jsx";
import { SavedDashboardsPage } from "./pages/SavedDashboardsPage.jsx";
import { DashboardBuilder } from "./pages/DashboardBuilder.jsx";
import { DashboardViewer } from "./pages/DashboardViewer.jsx";
import { api } from "./api/client.js";

// Inner router and shell
const AppContent = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const { success, error, info } = useToast();

  const [currentHash, setCurrentHash] = useState(() => window.location.hash || "#/");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isSampleLoading, setIsSampleLoading] = useState(false);

  // Sync hash routing
  useEffect(() => {
    const handleHashChange = () => {
      setCurrentHash(window.location.hash || "#/");
      setIsSidebarOpen(false);
      window.scrollTo(0, 0);
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  // Parse path and query parameters from hash
  const parseHash = () => {
    const raw = currentHash.replace(/^#\/?/, "");
    const [pathPart, queryPart] = raw.split("?");
    const pathSegments = (pathPart || "").split("/").filter(Boolean);
    const queryParams = new URLSearchParams(queryPart || "");

    const baseRoute = pathSegments[0] || "landing";
    const routeParam = pathSegments[1] || null;

    return { baseRoute, routeParam, queryParams, rawQuery: queryPart || "" };
  };

  const { baseRoute, routeParam, queryParams, rawQuery } = parseHash();

  // Load sample superstore dataset helper
  const handleLoadSample = async () => {
    try {
      setIsSampleLoading(true);
      const res = await api.loadSampleDataset();
      if (res.success && res.dataset) {
        success("Demo Global Superstore Sales dataset loaded successfully!");
        // Navigate straight to builder with this dataset
        window.location.hash = `#/builder?datasetId=${res.dataset.id}`;
      }
    } catch (err) {
      error(err.message || "Failed to load demo dataset.");
    } finally {
      setIsSampleLoading(false);
    }
  };

  // Callback when a dataset is successfully uploaded via modal
  const handleDatasetUploaded = (newDataset) => {
    setIsUploadModalOpen(false);
    success(`Dataset "${newDataset.name}" uploaded successfully!`);
    window.location.hash = `#/builder?datasetId=${newDataset.id}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400">
        <div className="w-10 h-10 border-3 border-brand-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-semibold text-slate-300">Initializing DataPulse Studio...</p>
      </div>
    );
  }

  // Auth Protection guard
  const isPublicRoute =
    baseRoute === "landing" ||
    baseRoute === "" ||
    baseRoute === "login" ||
    baseRoute === "register" ||
    baseRoute === "view";

  if (!isAuthenticated && !isPublicRoute) {
    return (
      <div className="min-h-screen bg-slate-950">
        <LoginPage
          onSwitchToRegister={() => (window.location.hash = "#/register")}
          onSuccess={() => (window.location.hash = "#/overview")}
        />
      </div>
    );
  }

  // Render standalone non-workspace pages
  if (baseRoute === "landing" || baseRoute === "") {
    return (
      <LandingPage
        onGetStarted={() => {
          if (isAuthenticated) {
            window.location.hash = "#/overview";
          } else {
            window.location.hash = "#/register";
          }
        }}
        onLogin={() => (window.location.hash = "#/login")}
      />
    );
  }

  if (baseRoute === "login") {
    return (
      <LoginPage
        onSwitchToRegister={() => (window.location.hash = "#/register")}
        onSuccess={() => (window.location.hash = "#/overview")}
      />
    );
  }

  if (baseRoute === "register") {
    return (
      <RegisterPage
        onSwitchToLogin={() => (window.location.hash = "#/login")}
        onSuccess={() => (window.location.hash = "#/overview")}
      />
    );
  }

  // Standalone Presentation / Viewer Mode (Full page without sidebar)
  if (baseRoute === "view") {
    const viewDashboardId = routeParam || queryParams.get("id");
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8">
        <DashboardViewer
          dashboardId={viewDashboardId}
          onBack={() => (window.location.hash = "#/dashboards")}
        />
      </div>
    );
  }

  // Workspace Layout for Overview, Datasets, Dashboards, and Visual Builder
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-brand-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        onOpenUpload={() => setIsUploadModalOpen(true)}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        isSidebarOpen={isSidebarOpen}
      />

      {/* Main Workspace Area with Sidebar */}
      <div className="flex-1 flex max-w-[1600px] w-full mx-auto">
        {/* Left Sidebar */}
        <Sidebar
          currentRoute={baseRoute}
          onLoadSample={handleLoadSample}
          isSampleLoading={isSampleLoading}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* Dynamic Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden min-w-0">
          {baseRoute === "overview" && (
            <DashboardOverview
              onOpenUpload={() => setIsUploadModalOpen(true)}
              onLoadSample={handleLoadSample}
              isSampleLoading={isSampleLoading}
            />
          )}

          {baseRoute === "datasets" && (
            <DatasetsPage
              onOpenUpload={() => setIsUploadModalOpen(true)}
              onLoadSample={handleLoadSample}
              isSampleLoading={isSampleLoading}
            />
          )}

          {baseRoute === "dashboards" && <SavedDashboardsPage />}

          {baseRoute === "builder" && (
            <DashboardBuilder
              key={currentHash}
              onLoadSample={handleLoadSample}
              isSampleLoading={isSampleLoading}
            />
          )}
        </main>
      </div>

      {/* Global Dataset Upload Modal */}
      <DatasetUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onDatasetUploaded={handleDatasetUploaded}
        onLoadSample={handleLoadSample}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </AuthProvider>
  );
}
