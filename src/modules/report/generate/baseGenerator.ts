/**
 * Base report generator
 */
import path from "path";
import * as XLSX from "xlsx";
import { parse } from "csv-parse/sync";
import { createLogger } from "@/lib/logger";
import { 
  readJsonFile, 
  writeJsonFile, 
  getTempDir, 
  type FileMetadata 
} from "@/lib/db";
import { MAX_PREVIEW_ROWS, MAX_STORED_ROWS } from "@/lib/constants";

const logger = createLogger("report:generate:base");

export interface MappedRow {
  _rowIndex: number;
  [key: string]: unknown;
}

export interface GenerateReportInput {
  fileId: string;
  reportType?: "monthly" | "weekly" | "daily" | "yearly";
}

export interface ReportGenerationResult {
  reportId: string;
  summary: {
    total: number;
    count: number;
    average?: number;
    period?: string;
    categories?: Record<string, number>;
  };
  data: MappedRow[];
  fileId: string;
  mapping: Record<string, string>;
}

/**
 * Read file metadata
 */
export async function readFileMetadata(fileId: string): Promise<FileMetadata | null> {
  const tempDir = getTempDir();
  const metadataPath = path.join(tempDir, `${fileId}.json`);
  return readJsonFile<FileMetadata>(metadataPath);
}

/**
 * Parse CSV file content
 */
export function parseCsvFile(fileBuffer: Buffer, columns: string[]): Array<Record<string, string | number>> {
  const content = fileBuffer.toString("utf-8").replace(/^\uFEFF/, "").replace(/\r\n/g, "\n");
  const records = parse(content, {
    columns: true,
    skip_empty_lines: true,
  }) as Array<Record<string, unknown>>;

  return records.map((record) => {
    const row: Record<string, string | number> = {};
    columns.forEach((col) => {
      const value = record[col];
      row[col] = value !== undefined && value !== null ? String(value) : "";
    });
    return row;
  });
}

/**
 * Parse Excel file content
 */
export function parseExcelFile(fileBuffer: Buffer): Array<Record<string, string | number>> {
  const workbook = XLSX.read(fileBuffer, { type: "buffer" });
  const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
  const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

  const headers = jsonData[0] as string[];
  const rows = jsonData.slice(1) as (string | number)[][];

  return rows.map((row) => {
    const obj: Record<string, string | number> = {};
    headers.forEach((header, index) => {
      obj[header] = row[index] ?? "";
    });
    return obj;
  });
}

/**
 * Read and parse file data
 */
export async function readFileData(
  metadata: FileMetadata
): Promise<Array<Record<string, string | number>>> {
  const fs = await import("fs");
  const fileBuffer = await fs.promises.readFile(metadata.filePath);

  if (metadata.fileType === "csv") {
    return parseCsvFile(fileBuffer, metadata.columns);
  } else {
    return parseExcelFile(fileBuffer);
  }
}

/**
 * Apply column mapping to data
 */
export function applyMapping(
  data: Array<Record<string, string | number>>,
  mapping: Record<string, string>
): MappedRow[] {
  return data.map((row, index) => {
    const mappedRow: MappedRow = { _rowIndex: index + 1 };
    Object.entries(mapping).forEach(([targetField, sourceColumn]) => {
      mappedRow[targetField] = row[sourceColumn];
    });
    return mappedRow;
  });
}

/**
 * Generate unique report ID
 */
export function generateReportId(): string {
  return `report_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Save report to file
 */
export async function saveReport(
  reportId: string,
  fileId: string,
  summary: ReportGenerationResult["summary"],
  data: MappedRow[],
  mapping: Record<string, string>
): Promise<void> {
  const tempDir = getTempDir();
  const reportPath = path.join(tempDir, `${reportId}.json`);

  await writeJsonFile(reportPath, {
    reportId,
    fileId,
    summary,
    data: data.slice(0, MAX_STORED_ROWS), // Limit stored data
    mapping,
    generatedAt: new Date().toISOString(),
  });

  logger.info("Report saved", { reportId, rowCount: data.length });
}

/**
 * Load report from file
 */
export async function loadReport(
  reportId: string
): Promise<{
  reportId: string;
  fileId: string;
  summary: ReportGenerationResult["summary"];
  data: MappedRow[];
  mapping: Record<string, string>;
  generatedAt: string;
} | null> {
  const tempDir = getTempDir();
  const reportPath = path.join(tempDir, `${reportId}.json`);
  return readJsonFile(reportPath);
}

/**
 * Base report generator
 */
export async function generateBaseReport(
  input: GenerateReportInput
): Promise<ReportGenerationResult> {
  logger.info("Starting report generation", { fileId: input.fileId });

  // Read metadata
  const metadata = await readFileMetadata(input.fileId);
  if (!metadata) {
    throw new Error("File not found or expired");
  }

  if (!metadata.mapping) {
    throw new Error("No column mapping found. Please map columns first.");
  }

  logger.debug("Metadata loaded", { 
    fileType: metadata.fileType, 
    columns: metadata.columns.length 
  });

  // Read and parse file
  const rawData = await readFileData(metadata);
  logger.debug("File parsed", { rowCount: rawData.length });

  // Apply mapping
  const mappedData = applyMapping(rawData, metadata.mapping);
  logger.debug("Mapping applied");

  return {
    reportId: generateReportId(),
    summary: {
      total: 0,
      count: rawData.length,
    },
    data: mappedData,
    fileId: input.fileId,
    mapping: metadata.mapping,
  };
}
