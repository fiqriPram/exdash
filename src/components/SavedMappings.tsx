"use client";

import React, { useState, useEffect } from "react";
import { Save, FolderOpen, Trash2, Check, AlertCircle } from "lucide-react";
import { SavedMapping, ColumnMapping, ReportTemplate } from "@/types";
import { getSavedMappings, saveMapping, deleteMapping } from "@/utils/storage";
import { useAuth } from "@/contexts/AuthContext";

interface SavedMappingsProps {
  template: ReportTemplate;
  currentMappings: ColumnMapping[];
  onLoadMapping: (mappings: ColumnMapping[]) => void;
}

export default function SavedMappings({
  template,
  currentMappings,
  onLoadMapping,
}: SavedMappingsProps) {
  const { user } = useAuth();
  const [mappings, setMappings] = useState<SavedMapping[]>([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [mappingName, setMappingName] = useState("");
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    if (user) {
      loadMappings();
    }
  }, [user, template.id]);

  const loadMappings = () => {
    const allMappings = getSavedMappings(user?.id);
    const templateMappings = allMappings.filter(
      (m) => m.templateId === template.id,
    );
    setMappings(templateMappings);
  };

  const handleSaveMapping = () => {
    if (!mappingName.trim() || !user) return;

    saveMapping(
      {
        name: mappingName,
        templateId: template.id,
        mappings: currentMappings,
      },
      user.id,
    );

    setMessage({ type: "success", text: "Mapping saved successfully!" });
    setShowSaveDialog(false);
    setMappingName("");
    loadMappings();

    setTimeout(() => setMessage(null), 3000);
  };

  const handleLoadMapping = (mapping: SavedMapping) => {
    onLoadMapping(mapping.mappings);
    setMessage({ type: "success", text: `Loaded mapping: ${mapping.name}` });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleDeleteMapping = (id: string) => {
    if (confirm("Are you sure you want to delete this saved mapping?")) {
      deleteMapping(id);
      loadMappings();
    }
  };

  return (
    <div className="space-y-4">
      {message && (
        <div
          className={`p-3 rounded-lg flex items-center gap-2 ${
            message.type === "success"
              ? "bg-green-50 text-green-700"
              : "bg-red-50 text-red-700"
          }`}
        >
          {message.type === "success" ? (
            <Check className="w-4 h-4" />
          ) : (
            <AlertCircle className="w-4 h-4" />
          )}
          {message.text}
        </div>
      )}

      <div className="flex items-center gap-2">
        <button
          onClick={() => setShowSaveDialog(true)}
          disabled={currentMappings.length === 0}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          <Save className="w-4 h-4" />
          Save Current Mapping
        </button>
      </div>

      {showSaveDialog && (
        <div className="p-4 bg-gray-50 rounded-lg">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Mapping Name
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={mappingName}
              onChange={(e) => setMappingName(e.target.value)}
              placeholder="e.g., January 2024 Financial"
              className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleSaveMapping}
              disabled={!mappingName.trim()}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              Save
            </button>
            <button
              onClick={() => setShowSaveDialog(false)}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {mappings.length > 0 && (
        <div className="border rounded-lg overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b">
            <div className="flex items-center gap-2">
              <FolderOpen className="w-4 h-4 text-gray-600" />
              <span className="font-medium">
                Saved Mappings for {template.name}
              </span>
            </div>
          </div>
          <div className="divide-y">
            {mappings.map((mapping) => (
              <div
                key={mapping.id}
                className="px-4 py-3 flex items-center justify-between hover:bg-gray-50"
              >
                <div>
                  <p className="font-medium text-gray-900">{mapping.name}</p>
                  <p className="text-sm text-gray-500">
                    {mapping.mappings.length} columns mapped •{" "}
                    {new Date(mapping.updatedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleLoadMapping(mapping)}
                    className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                  >
                    Load
                  </button>
                  <button
                    onClick={() => handleDeleteMapping(mapping.id)}
                    className="p-1 text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
