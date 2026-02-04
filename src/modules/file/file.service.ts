/**
 * File upload and parsing service
 */
import path from "path";
import * as XLSX from "xlsx";
import { parse } from "csv-parse/sync";
import { z } from "zod";
import { createLogger } from "@/lib/logger";
import { 
  getTempDir, 
  writeJsonFile, 
  readJsonFile,
  deleteFile,
  type FileMetadata 
} from "@/lib/db";
import { MAX_FILE_SIZE, ALLOWED_EXTENSIONS, ERROR_MESSAGES, HTTP_STATUS } from "@/lib/constants";

const logger = createLogger("file:service");

export const uploadRequestSchema = z.object({
  file: z.instanceof(File),
});

export const parseRequestSchema = z.object({
  fileId: z.string(),
});

export interface UploadResult {
  fileId: string;
  columns: string[];
  originalName: string;
}

export interface ParseResult {
  preview: Record<string, string | number>[];
  columns: string[];
  totalRows: number;
}

/**
 * Validate file
 */
export function validateFile(file: File): { valid: boolean; error?: string; status: number } {
  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: ERROR_MESSAGES.FILE_TOO_LARGE,
      status: HTTP_STATUS.BAD_REQUEST,
    };
  }

  // Validate file type
  const fileExtension = file.name.split(".").pop()?.toLowerCase();
  if (!fileExtension || !ALLOWED_EXTENSIONS.includes(`.${fileExtension}`)) {
    return {
      valid: false,
      error: ERROR_MESSAGES.INVALID_FILE_TYPE,
      status: HTTP_STATUS.BAD_REQUEST,
    };
  }

  return { valid: true, status: HTTP_STATUS.OK };
}

/**
 * Generate unique file ID
 */
export function generateFileId(): string {
  return `${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

/**
 * Extract columns from CSV buffer
 */
export function extractCsvColumns(buffer: Buffer): string[] {
  const content = buffer.toString("utf-8").replace(/^\uFEFF/, "").replace(/\r\n/g, "\n");
  const records = parse(content, {
    columns: true,
    skip_empty_lines: true,
    to: 1,
  }) as Array<Record<string, unknown>>;
  return Object.keys(records[0] || {});
}

/**
 * Extract columns from Excel buffer
 */
export function extractExcelColumns(buffer: Buffer): string[] {
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
  const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
  return (jsonData[0] as string[]) || [];
}

/**
 * Parse CSV preview rows
 */
export function parseCsvPreview(buffer: Buffer, columns: string[], limit: number = 10): Record<string, string | number>[] {
  const content = buffer.toString("utf-8").replace(/^\uFEFF/, "").replace(/\r\n/g, "\n");
  const records = parse(content, {
    columns: true,
    skip_empty_lines: true,
    to: limit,
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
 * Parse Excel preview rows
 */
export function parseExcelPreview(buffer: Buffer, limit: number = 10): Record<string, string | number>[] {
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
  const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

  const headers = jsonData[0] as string[];
  const rows = jsonData.slice(1, limit + 1) as (string | number)[][];

  return rows.map((row) => {
    const obj: Record<string, string | number> = {};
    headers.forEach((header, index) => {
      obj[header] = row[index] ?? "";
    });
    return obj;
  });
}

/**
 * Upload file and store metadata
 */
export async function uploadFile(file: File): Promise<UploadResult> {
  const validation = validateFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const fileExtension = file.name.split(".").pop()?.toLowerCase() || "";
  const fileId = generateFileId();
  const tempDir = getTempDir();
  const filePath = path.join(tempDir, `${fileId}.${fileExtension}`);

  // Convert File to Buffer and save
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const fs = await import("fs");
  await fs.promises.writeFile(filePath, buffer);

  // Extract columns based on file type
  let columns: string[] = [];

  if (fileExtension === "csv") {
    columns = extractCsvColumns(buffer);
  } else {
    columns = extractExcelColumns(buffer);
  }

  if (columns.length === 0) {
    await deleteFile(filePath);
    throw new Error("No columns found in file");
  }

  // Store metadata
  const metadata: FileMetadata = {
    fileId,
    originalName: file.name,
    filePath,
    fileType: fileExtension,
    columns,
    uploadedAt: new Date().toISOString(),
  };

  const metadataPath = path.join(tempDir, `${fileId}.json`);
  await writeJsonFile(metadataPath, metadata);

  logger.info("File uploaded", { fileId, originalName: file.name, columns: columns.length });

  return {
    fileId,
    columns,
    originalName: file.name,
  };
}

/**
 * Parse file and return preview data
 */
export async function parseFile(fileId: string, previewLimit: number = 10): Promise<ParseResult> {
  const tempDir = getTempDir();
  
  // Read metadata
  const metadata = await readJsonFile<FileMetadata>(path.join(tempDir, `${fileId}.json`));
  if (!metadata) {
    throw new Error(ERROR_MESSAGES.FILE_NOT_FOUND);
  }

  // Read file content
  const fs = await import("fs");
  const fileBuffer = await fs.promises.readFile(metadata.filePath);

  let preview: Record<string, string | number>[] = [];

  if (metadata.fileType === "csv") {
    preview = parseCsvPreview(fileBuffer, metadata.columns, previewLimit);
  } else {
    preview = parseExcelPreview(fileBuffer, previewLimit);
  }

  logger.debug("File parsed", { fileId, previewRows: preview.length });

  return {
    preview,
    columns: metadata.columns,
    totalRows: preview.length,
  };
}

/**
 * Get file metadata
 */
export async function getFileMetadata(fileId: string): Promise<FileMetadata | null> {
  const tempDir = getTempDir();
  return readJsonFile<FileMetadata>(path.join(tempDir, `${fileId}.json`));
}

/**
 * Delete file and its metadata
 */
export async function deleteUploadedFile(fileId: string): Promise<boolean> {
  const tempDir = getTempDir();
  
  const metadata = await readJsonFile<FileMetadata>(path.join(tempDir, `${fileId}.json`));
  if (!metadata) {
    return false;
  }

  // Delete file
  await deleteFile(metadata.filePath);
  
  // Delete metadata
  await deleteFile(path.join(tempDir, `${fileId}.json`));

  logger.info("File deleted", { fileId });

  return true;
}
