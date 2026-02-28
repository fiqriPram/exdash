"use client";

import React, { useState, useEffect } from "react";
import { Settings, Check, AlertCircle, Wand2 } from "lucide-react";
import { ColumnMapping, DataRow, ReportTemplate } from "@/types";
import { autoMapColumns } from "@/utils/dataParser";

interface ColumnMapperProps {
  columns: string[];
  template: ReportTemplate;
  onMappingComplete: (mappings: ColumnMapping[]) => void;
  data: DataRow[];
}

const DATA_TYPES = [
  { value: "string", label: "Text" },
  { value: "number", label: "Number" },
  { value: "date", label: "Date" },
  { value: "currency", label: "Currency" },
];

export default function ColumnMapper({
  columns,
  template,
  onMappingComplete,
  data,
}: ColumnMapperProps) {
  const [mappings, setMappings] = useState<ColumnMapping[]>([]);
  const [autoMapped, setAutoMapped] = useState(false);

  useEffect(() => {
    // Auto-map on initial load
    if (columns.length > 0 && mappings.length === 0 && !autoMapped) {
      handleAutoMap();
    }
  }, [columns]);

  const handleAutoMap = () => {
    const targetFields = template?.requiredFields 
      ? [...template.requiredFields, ...(template.optionalFields || [])]
      : [];
    
    const autoMappings = autoMapColumns(columns, targetFields);
    setMappings(autoMappings);
    setAutoMapped(true);

    // Always call callback to update UI
    onMappingComplete(autoMappings);
  };

  const handleMappingChange = (
    index: number,
    field: keyof ColumnMapping,
    value: string,
  ) => {
    const newMappings = [...mappings];
    newMappings[index] = {
      ...newMappings[index],
      [field]: value,
    };
    setMappings(newMappings);
    onMappingComplete(newMappings);
  };

  const addMapping = () => {
    const newMapping: ColumnMapping = {
      sourceColumn: columns[0] || "",
      targetField: "",
      dataType: "string",
    };
    const newMappings = [...mappings, newMapping];
    setMappings(newMappings);
  };

  const removeMapping = (index: number) => {
    const newMappings = mappings.filter((_, i) => i !== index);
    setMappings(newMappings);
    onMappingComplete(newMappings);
  };

  const getFieldStatus = (fieldName: string) => {
    const isRequired = template.requiredFields.includes(fieldName);
    const isOptional = template.optionalFields.includes(fieldName);
    const isMapped = mappings.some((m) => m.targetField === fieldName);

    if (isRequired) {
      return { status: isMapped ? "mapped" : "missing", label: "Required" };
    } else if (isOptional) {
      return { status: isMapped ? "mapped" : "optional", label: "Optional" };
    }
    return { status: "custom", label: "Custom" };
  };

  const allRequiredFieldsMapped = template.requiredFields.every((field) =>
    mappings.some((m) => m.targetField === field),
  );

  const previewValue = (sourceColumn: string) => {
    if (data.length === 0 || !sourceColumn) return "";
    const value = data[0][sourceColumn];
    return value !== undefined ? String(value).substring(0, 30) : "";
  };

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-muted-foreground" />
          <h3 className="text-lg font-semibold text-foreground">Column Mapping</h3>
        </div>
        <button
          type="button"
          onClick={handleAutoMap}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary bg-primary/10 rounded-lg hover:bg-primary/20 dark:hover:bg-primary/30 transition-colors"
        >
          <Wand2 className="w-4 h-4" />
          Auto-Map Columns
        </button>
      </div>

      <p className="text-sm text-muted-foreground">
        Map your file columns to the required fields for the {template.name}{" "}
        template.
      </p>

      {/* Field Status */}
      <div className="flex flex-wrap gap-2">
        {template.requiredFields.map((field) => {
          const { status } = getFieldStatus(field);
          return (
            <span
              key={field}
              className={`px-3 py-1 text-xs font-medium rounded-full ${
                status === "mapped"
                  ? "bg-green-500/20 text-green-400"
                  : "bg-red-500/20 text-red-400"
              }`}
            >
              {status === "mapped" ? (
                <Check className="w-3 h-3 inline mr-1" />
              ) : (
                <AlertCircle className="w-3 h-3 inline mr-1" />
              )}
              {field}
            </span>
          );
        })}
        {template.optionalFields.map((field) => {
          const { status } = getFieldStatus(field);
          if (status !== "mapped") return null;
          return (
            <span
              key={field}
              className="px-3 py-1 text-xs font-medium rounded-full bg-blue-500/20 text-blue-400"
            >
              <Check className="w-3 h-3 inline mr-1" />
              {field}
            </span>
          );
        })}
      </div>

      {/* Mapping Table */}
      <div className="border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <tbody className="divide-y divide-border">
            {mappings.map((mapping, index) => (
              <tr key={index} className="hover:bg-muted/50 dark:hover:bg-muted/20">
                <td className="px-4 py-3">
                  <select
                    value={mapping.sourceColumn}
                    onChange={(e) =>
                      handleMappingChange(index, "sourceColumn", e.target.value)
                    }
                    className="w-full px-3 py-2 bg-background border border-input rounded-md focus:ring-2 focus:ring-ring focus:border-ring text-foreground"
                  >
                    {columns.map((col) => (
                      <option key={col} value={col}>
                        {col}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3">
                  <input
                    type="text"
                    value={mapping.targetField}
                    onChange={(e) =>
                      handleMappingChange(index, "targetField", e.target.value)
                    }
                    placeholder="Field name"
                    className="w-full px-3 py-2 bg-background border border-input rounded-md focus:ring-2 focus:ring-ring focus:border-ring text-foreground"
                    list="target-fields"
                  />
                  <datalist id="target-fields">
                    {[
                      ...template.requiredFields,
                      ...template.optionalFields,
                    ].map((field) => (
                      <option key={field} value={field} />
                    ))}
                  </datalist>
                </td>
                <td className="px-4 py-3">
                  <select
                    value={mapping.dataType}
                    onChange={(e) =>
                      handleMappingChange(index, "dataType", e.target.value)
                    }
                    className="w-full px-3 py-2 bg-background border border-input rounded-md focus:ring-2 focus:ring-ring focus:border-ring text-foreground"
                  >
                    {DATA_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3 text-muted-foreground text-xs">
                  {previewValue(mapping.sourceColumn)}
                </td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => removeMapping(index)}
                    className="text-red-500 hover:text-red-700 font-medium"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Mapping Button */}
      <button
        type="button"
        onClick={addMapping}
        className="w-full py-3 border-2 border-dashed border-border rounded-lg text-muted-foreground font-medium hover:border-muted-foreground hover:text-foreground transition-colors"
      >
        + Add Column Mapping
      </button>

      {/* Validation Message */}
      {!allRequiredFieldsMapped && (
        <div className="flex items-start gap-2 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
          <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-yellow-500">
              Required fields not mapped
            </p>
            <p className="text-sm text-yellow-500/80">
              Please map all required fields:{" "}
              {template.requiredFields
                .filter((f) => !mappings.some((m) => m.targetField === f))
                .join(", ")}
            </p>
          </div>
        </div>
      )}

      {allRequiredFieldsMapped && (
        <div className="flex items-center gap-2 p-4 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400">
          <Check className="w-5 h-5" />
          <span className="font-medium">All required fields are mapped!</span>
        </div>
      )}
    </div>
  );
}
