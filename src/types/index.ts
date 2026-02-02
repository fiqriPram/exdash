export interface DataRow {
  [key: string]: string | number | Date;
}

export interface ColumnMapping {
  sourceColumn: string;
  targetField: string;
  dataType: "string" | "number" | "date" | "currency";
}

export interface SavedMapping {
  id: string;
  name: string;
  templateId: string;
  mappings: ColumnMapping[];
  createdAt: string;
  updatedAt: string;
}

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  type: "financial" | "attendance" | "inventory";
  requiredFields: string[];
  optionalFields: string[];
}

export interface ProcessedData {
  rawData: DataRow[];
  columns: string[];
  mappings: ColumnMapping[];
  summary: DataSummary;
  errors: ValidationError[];
}

export interface DataSummary {
  totalRows: number;
  totalAmount?: number;
  averageAmount?: number;
  period?: string;
  categories?: { [key: string]: number };
}

export interface ValidationError {
  row: number;
  column: string;
  message: string;
  value: unknown;
}

export interface ReportConfig {
  title: string;
  period: string;
  template: ReportTemplate;
  includeCharts: boolean;
  groupBy?: string;
  deleteAfterExport?: boolean;
}

export interface ReportHistory {
  id: string;
  title: string;
  templateName: string;
  period: string;
  totalRows: number;
  totalAmount?: number;
  exportedAt: string;
  exportedFormats: ("pdf" | "excel")[];
  config: ReportConfig;
  mappings: ColumnMapping[];
  summary: DataSummary;
}

export type UserRole = "admin" | "user";

export interface User {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  createdAt: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
}

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
