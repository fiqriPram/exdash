"use client";

import React, { useState } from "react";
import {
  FileText,
  Download,
  Printer,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
} from "lucide-react";
import { ProcessedData, ReportConfig, ReportTemplate } from "@/types";
import { exportToPDF, exportToExcel } from "@/utils/export";

interface ReportViewerProps {
  processedData: ProcessedData;
  config: ReportConfig;
  template: ReportTemplate;
  onExport?: (format: "pdf" | "excel") => void;
}

export default function ReportViewer({
  processedData,
  config,
  template,
  onExport,
}: ReportViewerProps) {
  const [showPreview, setShowPreview] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const { rawData, mappings, summary, errors } = processedData;

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      exportToPDF(processedData, config);
      onExport?.("pdf");
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportExcel = async () => {
    setIsExporting(true);
    try {
      exportToExcel(processedData, config);
      onExport?.("excel");
    } finally {
      setIsExporting(false);
    }
  };

  const formatValue = (value: unknown, dataType: string): string => {
    if (value === undefined || value === null || value === "") {
      return "-";
    }

    switch (dataType) {
      case "currency":
        return new Intl.NumberFormat("id-ID", {
          style: "currency",
          currency: "IDR",
          minimumFractionDigits: 0,
        }).format(Number(value));
      case "date":
        const date = new Date(String(value));
        return isNaN(date.getTime())
          ? String(value)
          : date.toLocaleDateString("id-ID");
      case "number":
        return Number(value).toLocaleString("id-ID");
      default:
        return String(value);
    }
  };

  const previewData = rawData.slice(0, 100); // Limit preview to 100 rows

  return (
    <div className="w-full space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold">Report Preview</h3>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExportPDF}
            disabled={isExporting}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export PDF
          </button>
          <button
            onClick={handleExportExcel}
            disabled={isExporting}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export Excel
          </button>
        </div>
      </div>

      {/* Report Info */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-semibold text-gray-900">{config.title}</h4>
        <p className="text-sm text-gray-600">Template: {template.name}</p>
        <p className="text-sm text-gray-600">
          Period: {config.period || summary.period || "N/A"}
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-blue-600 font-medium">Total Records</p>
          <p className="text-2xl font-bold text-blue-900">
            {summary.totalRows.toLocaleString()}
          </p>
        </div>
        {summary.totalAmount !== undefined && (
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-green-600 font-medium">Total Amount</p>
            <p className="text-2xl font-bold text-green-900">
              {new Intl.NumberFormat("id-ID", {
                style: "currency",
                currency: "IDR",
                minimumFractionDigits: 0,
              }).format(summary.totalAmount)}
            </p>
          </div>
        )}
        {summary.averageAmount !== undefined && (
          <div className="bg-purple-50 p-4 rounded-lg">
            <p className="text-sm text-purple-600 font-medium">
              Average Amount
            </p>
            <p className="text-2xl font-bold text-purple-900">
              {new Intl.NumberFormat("id-ID", {
                style: "currency",
                currency: "IDR",
                minimumFractionDigits: 0,
              }).format(summary.averageAmount)}
            </p>
          </div>
        )}
      </div>

      {/* Validation Errors */}
      {errors.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-yellow-800">
                {errors.length} validation error{errors.length > 1 ? "s" : ""}{" "}
                found
              </p>
              <p className="text-sm text-yellow-700 mt-1">
                Some data may need correction. Review the errors before
                exporting.
              </p>
              <ul className="mt-2 space-y-1 text-sm text-yellow-700">
                {errors.slice(0, 5).map((error, index) => (
                  <li key={index}>
                    Row {error.row}, Column "{error.column}": {error.message}
                  </li>
                ))}
                {errors.length > 5 && (
                  <li>... and {errors.length - 5} more errors</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Data Preview */}
      <div className="border rounded-lg overflow-hidden">
        <button
          onClick={() => setShowPreview(!showPreview)}
          className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
        >
          <span className="font-medium">
            Data Preview ({previewData.length} of {rawData.length} rows)
          </span>
          {showPreview ? (
            <ChevronUp className="w-5 h-5 text-gray-500" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-500" />
          )}
        </button>

        {showPreview && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 border-b">
                <tr>
                  {mappings.map((mapping, index) => (
                    <th
                      key={index}
                      className="px-4 py-3 text-left font-medium text-gray-700 whitespace-nowrap"
                    >
                      {mapping.targetField}
                      <span className="block text-xs text-gray-500 font-normal">
                        ({mapping.sourceColumn})
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {previewData.map((row, rowIndex) => (
                  <tr key={rowIndex} className="hover:bg-gray-50">
                    {mappings.map((mapping, colIndex) => (
                      <td
                        key={colIndex}
                        className="px-4 py-3 text-gray-700 whitespace-nowrap"
                      >
                        {formatValue(
                          row[mapping.sourceColumn],
                          mapping.dataType,
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Category Breakdown */}
      {summary.categories && Object.keys(summary.categories).length > 0 && (
        <div className="border rounded-lg p-4">
          <h4 className="font-semibold mb-4">Category Breakdown</h4>
          <div className="space-y-2">
            {Object.entries(summary.categories)
              .sort(([, a], [, b]) => b - a)
              .map(([category, count]) => (
                <div
                  key={category}
                  className="flex items-center justify-between"
                >
                  <span className="text-gray-700">{category}</span>
                  <div className="flex items-center gap-4">
                    <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{
                          width: `${(count / summary.totalRows) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-12 text-right">
                      {count}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
