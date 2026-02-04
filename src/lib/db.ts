/**
 * Database utilities for file-based storage
 */
import { promises as fs } from "fs";
import path from "path";

const TEMP_DIR = path.join(process.cwd(), "tmp");
const REPORTS_DIR = path.join(process.cwd(), "public", "reports");

/**
 * Ensure directory exists
 */
export async function ensureDir(dir: string): Promise<void> {
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch {
    // Directory might already exist
  }
}

/**
 * Initialize storage directories
 */
export async function initializeStorage(): Promise<void> {
  await ensureDir(TEMP_DIR);
  await ensureDir(REPORTS_DIR);
}

/**
 * Get temp directory path
 */
export function getTempDir(): string {
  return TEMP_DIR;
}

/**
 * Get reports directory path
 */
export function getReportsDir(): string {
  return REPORTS_DIR;
}

/**
 * Read JSON file with type safety
 */
export async function readJsonFile<T>(filePath: string): Promise<T | null> {
  try {
    const content = await fs.readFile(filePath, "utf-8");
    return JSON.parse(content) as T;
  } catch {
    return null;
  }
}

/**
 * Write JSON file
 */
export async function writeJsonFile(filePath: string, data: unknown): Promise<void> {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
}

/**
 * Delete file
 */
export async function deleteFile(filePath: string): Promise<boolean> {
  try {
    await fs.unlink(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * List files in directory matching pattern
 */
export async function listFiles(
  dir: string,
  filter?: (filename: string) => boolean
): Promise<string[]> {
  try {
    const files = await fs.readdir(dir);
    return filter ? files.filter(filter) : files;
  } catch {
    return [];
  }
}

/**
 * File metadata interface
 */
export interface FileMetadata {
  fileId: string;
  originalName: string;
  filePath: string;
  fileType: string;
  columns: string[];
  uploadedAt: string;
  mapping?: Record<string, string>;
}

/**
 * Report data interface
 */
export interface ReportData {
  reportId: string;
  fileId: string;
  summary: {
    total: number;
    count: number;
    average?: number;
    period?: string;
    categories?: Record<string, number>;
  };
  data: Array<Record<string, unknown>>;
  mapping: Record<string, string>;
  generatedAt: string;
}
