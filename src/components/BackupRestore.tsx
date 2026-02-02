"use client";

import React, { useState, useRef } from "react";
import {
  Download,
  Upload,
  Database,
  Trash2,
  AlertCircle,
  Check,
} from "lucide-react";
import {
  exportAllData,
  importAllData,
  clearAllData,
  getSettings,
  saveSettings,
} from "@/utils/storage";

export default function BackupRestore() {
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [settings, setSettings] = useState(getSettings());
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const data = exportAllData();
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `autoreport-backup-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setMessage({ type: "success", text: "Backup exported successfully!" });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (importAllData(content)) {
        setMessage({
          type: "success",
          text: "Data restored successfully! Please refresh the page.",
        });
      } else {
        setMessage({
          type: "error",
          text: "Failed to restore data. Invalid backup file.",
        });
      }
      setTimeout(() => setMessage(null), 5000);
    };
    reader.readAsText(file);
    e.target.value = ""; // Reset input
  };

  const handleClearAll = () => {
    if (
      confirm(
        "WARNING: This will delete ALL data including users, mappings, and report history. Are you sure?",
      )
    ) {
      clearAllData();
      setMessage({
        type: "success",
        text: "All data cleared. Please refresh the page.",
      });
      setTimeout(() => setMessage(null), 5000);
    }
  };

  const handleSettingChange = (
    key: keyof typeof settings,
    value: boolean | string,
  ) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center gap-2 mb-6">
        <Database className="w-5 h-5 text-gray-600" />
        <h3 className="text-lg font-semibold">Data Management</h3>
      </div>

      {message && (
        <div
          className={`mb-6 p-4 rounded-lg flex items-center gap-2 ${
            message.type === "success"
              ? "bg-green-50 text-green-700"
              : "bg-red-50 text-red-700"
          }`}
        >
          {message.type === "success" ? (
            <Check className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          {message.text}
        </div>
      )}

      {/* Settings */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium mb-4">Settings</h4>
        <div className="space-y-3">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={settings.deleteAfterExport}
              onChange={(e) =>
                handleSettingChange("deleteAfterExport", e.target.checked)
              }
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <span className="text-sm">
              Delete uploaded data after export (for privacy)
            </span>
          </label>
          <div className="flex items-center gap-3">
            <span className="text-sm">Default Period View:</span>
            <select
              value={settings.defaultPeriod}
              onChange={(e) =>
                handleSettingChange("defaultPeriod", e.target.value)
              }
              className="px-3 py-1 border rounded text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
        </div>
      </div>

      {/* Backup & Restore */}
      <div className="space-y-4">
        <h4 className="font-medium">Backup & Restore</h4>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export Backup
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Upload className="w-4 h-4" />
            Import Backup
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />
        </div>

        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>Tip:</strong> Regularly export backups to prevent data loss.
            Backup includes users, saved mappings, and report history.
          </p>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="mt-8 pt-6 border-t">
        <h4 className="font-medium text-red-600 mb-4">Danger Zone</h4>
        <button
          onClick={handleClearAll}
          className="flex items-center gap-2 px-4 py-2 border-2 border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          Clear All Data
        </button>
        <p className="text-sm text-gray-500 mt-2">
          This will permanently delete all users, mappings, and report history.
        </p>
      </div>
    </div>
  );
}
