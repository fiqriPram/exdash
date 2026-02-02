"use client";

import React, { useState, useEffect } from "react";
import {
  History,
  Download,
  Trash2,
  FileText,
  Calendar,
  Database,
} from "lucide-react";
import { ReportHistory } from "@/types";
import {
  getReportHistory,
  deleteReportFromHistory,
  clearReportHistory,
} from "@/utils/storage";
import { useAuth } from "@/contexts/AuthContext";
import { exportToPDF, exportToExcel } from "@/utils/export";
import { ProcessedData } from "@/types";

export default function ReportHistoryViewer() {
  const { user } = useAuth();
  const [history, setHistory] = useState<ReportHistory[]>([]);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    if (user) {
      loadHistory();
    }
  }, [user]);

  const loadHistory = () => {
    const reports = getReportHistory(user?.id);
    setHistory(reports);
  };

  const handleDelete = (id: string) => {
    if (confirm("Delete this report from history?")) {
      deleteReportFromHistory(id);
      loadHistory();
    }
  };

  const handleClearAll = () => {
    if (confirm("Clear all report history? This cannot be undone.")) {
      clearReportHistory(user?.id);
      loadHistory();
    }
  };

  const handleReExport = (report: ReportHistory, format: "pdf" | "excel") => {
    // Recreate processed data from stored info
    const processedData: ProcessedData = {
      rawData: [], // We don't store raw data for privacy
      columns: report.mappings.map((m) => m.sourceColumn),
      mappings: report.mappings,
      summary: report.summary,
      errors: [],
    };

    if (format === "pdf") {
      exportToPDF(processedData, report.config);
    } else {
      exportToExcel(processedData, report.config);
    }
  };

  const filteredHistory = history.filter(
    (report) =>
      report.title.toLowerCase().includes(filter.toLowerCase()) ||
      report.templateName.toLowerCase().includes(filter.toLowerCase()),
  );

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold">Report History</h3>
        </div>
        {history.length > 0 && (
          <button
            onClick={handleClearAll}
            className="flex items-center gap-2 px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm"
          >
            <Trash2 className="w-4 h-4" />
            Clear All
          </button>
        )}
      </div>

      <input
        type="text"
        placeholder="Search reports..."
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className="w-full px-4 py-2 border rounded-lg mb-4 focus:ring-2 focus:ring-blue-500"
      />

      {filteredHistory.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>No reports in history yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredHistory.map((report) => (
            <div
              key={report.id}
              className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{report.title}</h4>
                  <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(report.exportedAt).toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Database className="w-3 h-3" />
                      {report.totalRows} rows
                    </span>
                    {report.totalAmount && (
                      <span>
                        Total:{" "}
                        {new Intl.NumberFormat("id-ID", {
                          style: "currency",
                          currency: "IDR",
                          minimumFractionDigits: 0,
                        }).format(report.totalAmount)}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    Template: {report.templateName}
                  </p>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => handleReExport(report, "pdf")}
                    className="px-3 py-1.5 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                  >
                    <Download className="w-3 h-3 inline mr-1" />
                    PDF
                  </button>
                  <button
                    onClick={() => handleReExport(report, "excel")}
                    className="px-3 py-1.5 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                  >
                    <Download className="w-3 h-3 inline mr-1" />
                    Excel
                  </button>
                  <button
                    onClick={() => handleDelete(report.id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
