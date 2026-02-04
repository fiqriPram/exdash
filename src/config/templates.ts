import { ReportTemplate } from "@/types";

/**
 * Report Templates Configuration
 * 
 * Each template defines the structure and requirements for generating reports.
 * Templates are used for:
 * - Column validation
 * - Auto-mapping suggestions
 * - Report generation
 */

export const REPORT_TEMPLATES: ReportTemplate[] = [
  {
    id: "financial-summary",
    name: "Financial Summary",
    description:
      "Generate financial reports with income, expenses, and balance calculations",
    type: "financial",
    requiredFields: ["date", "amount", "category"],
    optionalFields: ["description", "reference", "notes"],
  },
  {
    id: "attendance-report",
    name: "Attendance Report",
    description: "Track attendance records with summaries by person and date",
    type: "attendance",
    requiredFields: ["date", "name", "status"],
    optionalFields: ["check_in", "check_out", "department", "notes"],
  },
  {
    id: "inventory-report",
    name: "Inventory Report",
    description: "Monitor inventory levels, stock movements, and valuations",
    type: "inventory",
    requiredFields: ["item_name", "quantity", "unit_price"],
    optionalFields: ["category", "sku", "location", "date"],
  },
];

/**
 * Get a template by ID
 */
export function getTemplateById(id: string): ReportTemplate | undefined {
  return REPORT_TEMPLATES.find((t) => t.id === id);
}

/**
 * Get all required fields for a template
 */
export function getRequiredFields(templateId: string): string[] {
  const template = getTemplateById(templateId);
  return template?.requiredFields || [];
}

/**
 * Check if a field is required for a template
 */
export function isFieldRequired(templateId: string, field: string): boolean {
  const requiredFields = getRequiredFields(templateId);
  return requiredFields.includes(field.toLowerCase());
}
