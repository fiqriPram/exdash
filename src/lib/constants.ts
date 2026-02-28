/**
 * Application constants
 */

// Authentication
export const VALID_CREDENTIALS = {
  username: "user",
  password: "user",
  name: "AutoReport User",
};

export const SESSION_COOKIE_NAME = "autoreport_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

// File Upload
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const ALLOWED_FILE_TYPES = ["text/csv", "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "application/pdf"];
export const ALLOWED_EXTENSIONS = [".csv", ".xls", ".xlsx", ".pdf"];

// Report Generation
export const MAX_PREVIEW_ROWS = 100;
export const MAX_STORED_ROWS = 1000;

// Export
export const SUPPORTED_EXPORT_FORMATS = ["xlsx", "pdf"] as const;
export type ExportFormat = typeof SUPPORTED_EXPORT_FORMATS[number];

// Date formats
export const DATE_FORMATS = {
  display: "yyyy-MM-dd",
  displayWithTime: "yyyy-MM-dd HH:mm",
  iso: "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'",
};

// Currency
export const CURRENCY_CONFIG = {
  locale: "id-ID",
  currency: "IDR",
  minimumFractionDigits: 0,
};

// HTTP Status codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
} as const;

// Error messages
export const ERROR_MESSAGES = {
  INVALID_CREDENTIALS: "Invalid username or password",
  SESSION_EXPIRED: "Session has expired",
  FILE_NOT_FOUND: "File not found or expired",
  REPORT_NOT_FOUND: "Report not found",
  INVALID_FILE_TYPE: "Invalid file type. Please upload CSV, Excel, or PDF files only.",
  FILE_TOO_LARGE: "File is too large. Maximum size is 10MB.",
  INVALID_REQUEST_DATA: "Invalid request data",
  MISSING_MAPPING: "No column mapping found. Please map columns first.",
  EXPORT_FAILED: "Failed to export report",
  GENERATION_FAILED: "Failed to generate report",
  VALIDATION_FAILED: "Failed to validate CSV columns",
  MAPPING_FAILED: "Failed to save mapping",
};
