import React, { useState, useRef } from "react";
import Papa from "papaparse";
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  X,
  Sparkles,
  ArrowRight,
  Database,
} from "lucide-react";
import { api } from "../api/client.js";
import { useToast } from "../context/ToastContext.jsx";

export const DatasetUploadModal = ({
  isOpen,
  onClose,
  onDatasetUploaded,
  onLoadSample,
}) => {
  const { success, error, warning } = useToast();
  const fileInputRef = useRef(null);

  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [datasetName, setDatasetName] = useState("");
  const [previewData, setPreviewData] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  if (!isOpen) return null;

  const handleFileSelection = (file) => {
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".csv")) {
      error("Only CSV files (.csv) are supported.");
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      error("File size exceeds 15MB limit.");
      return;
    }

    setSelectedFile(file);
    setDatasetName(file.name.replace(/\.[^/.]+$/, ""));

    // Quick client-side preview parse with PapaParse
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      preview: 5,
      complete: (results) => {
        if (results.data && results.data.length > 0) {
          const headers = Object.keys(results.data[0]);
          setPreviewData({
            headers,
            rows: results.data,
            approxRows: "Estimating...",
          });
        }
      },
      error: (err) => {
        warning(`Preview warning: ${err.message}`);
      },
    });
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      error("Please choose a CSV file to upload.");
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("name", datasetName || selectedFile.name);

      const res = await api.uploadDataset(formData);
      if (res.success) {
        success("Dataset analyzed and uploaded successfully!");
        onDatasetUploaded(res.dataset);
        handleClose();
      }
    } catch (err) {
      error(err.message || "Failed to upload dataset.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setDatasetName("");
    setPreviewData(null);
    setIsUploading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-8 animate-in fade-in-50 zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-600/20 text-brand-400 flex items-center justify-center border border-brand-500/30">
              <UploadCloud className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Import Business Dataset</h3>
              <p className="text-xs text-slate-400">
                Upload CSV files to automatically detect schemas and build dashboards.
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Quick Demo CTA Bar */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-gradient-to-r from-brand-950/40 via-indigo-950/40 to-slate-900 border border-brand-500/30">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-brand-400 shrink-0" />
              <div className="text-left">
                <p className="text-xs font-bold text-white">Don't have a CSV handy?</p>
                <p className="text-[11px] text-slate-400">
                  Instant 1-click Superstore Sales dataset (Orders, Profit, Categories)
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                onLoadSample?.();
                handleClose();
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-500 rounded-lg shadow-sm transition-all shrink-0"
            >
              <span>Load Demo Data</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {/* Drag & Drop Area */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
              dragActive
                ? "border-brand-500 bg-brand-500/10 scale-[1.01]"
                : selectedFile
                ? "border-emerald-500/50 bg-emerald-500/5"
                : "border-slate-700/80 hover:border-brand-500/60 bg-slate-850/50 hover:bg-slate-850"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={(e) => handleFileSelection(e.target.files[0])}
              className="hidden"
            />

            <div className="flex flex-col items-center justify-center space-y-3">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${
                  selectedFile
                    ? "bg-emerald-500/20 text-emerald-400"
                    : "bg-slate-800 text-slate-300"
                }`}
              >
                {selectedFile ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                ) : (
                  <FileSpreadsheet className="w-6 h-6 text-brand-400" />
                )}
              </div>

              {selectedFile ? (
                <div>
                  <p className="text-sm font-bold text-white">{selectedFile.name}</p>
                  <p className="text-xs text-slate-400">
                    {(selectedFile.size / 1024).toFixed(1)} KB • Ready for analysis
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-sm font-semibold text-slate-200">
                    Drag and drop your <span className="text-brand-400">.csv</span> file here, or{" "}
                    <span className="text-brand-400 underline">browse</span>
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Supports Sales, Financial, E-Commerce, and Operations datasets up to 15MB.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Dataset Name Input */}
          {selectedFile && (
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Dataset Name
              </label>
              <input
                type="text"
                required
                value={datasetName}
                onChange={(e) => setDatasetName(e.target.value)}
                placeholder="Dataset Name"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-850 border border-slate-750 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-brand-500"
              />
            </div>
          )}

          {/* PapaParse Instant Preview Table */}
          {previewData && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-semibold text-slate-300">
                  Data Preview ({previewData.headers.length} Columns Detected)
                </span>
                <span>First 5 rows displayed</span>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-800 max-h-40">
                <table className="w-full text-left text-[11px] text-slate-300 font-mono">
                  <thead className="bg-slate-800/80 text-slate-400 sticky top-0">
                    <tr>
                      {previewData.headers.map((h, i) => (
                        <th key={i} className="px-3 py-2 font-semibold truncate border-b border-slate-700">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 bg-slate-900/50">
                    {previewData.rows.map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-slate-800/40">
                        {previewData.headers.map((h, cIdx) => (
                          <td key={cIdx} className="px-3 py-1.5 truncate max-w-[140px]">
                            {row[h] || "-"}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Footer actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!selectedFile || isUploading}
              className="flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-500 rounded-xl shadow-lg shadow-brand-600/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Processing CSV...</span>
                </>
              ) : (
                <>
                  <Database className="w-4 h-4" />
                  <span>Upload & Analyze</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
