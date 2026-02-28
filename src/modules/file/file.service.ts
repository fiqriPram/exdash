/**
 * File upload and parsing service
 */
import path from "path";
import * as XLSX from "xlsx";
import { parse } from "csv-parse/sync";
import PDFParser from "pdf2json";
import { createWorker } from "tesseract.js";
import { createCanvas } from "canvas";
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
 * Extract columns from PDF buffer
 */
export async function extractPdfColumns(buffer: Buffer): Promise<string[]> {
  // First try text extraction
  const textColumns = await extractPdfTextColumns(buffer);
  
  if (textColumns.length > 0) {
    return textColumns;
  }
  
  // If no text found, try OCR
  logger.info("No text found in PDF, attempting OCR...");
  const ocrColumns = await extractPdfOcrColumns(buffer);
  
  return ocrColumns;
}

/**
 * Extract columns from PDF using text extraction
 */
async function extractPdfTextColumns(buffer: Buffer): Promise<string[]> {
  return new Promise((resolve) => {
    try {
      const pdfParser = new PDFParser();
      
      pdfParser.on("pdfParser_dataReady", (pdfData: any) => {
        if (!pdfData || !pdfData.pages) {
          resolve([]);
          return;
        }
        
        let allText = "";
        for (const page of pdfData.pages) {
          if (page.Texts) {
            for (const textItem of page.Texts) {
              if (textItem.R) {
                for (const run of textItem.R) {
                  if (run.T) {
                    allText += decodeURIComponent(run.T as string) + " ";
                  }
                }
              }
            }
          }
        }
        
        const lines = allText.split(/\n|\r/).filter(line => line.trim());
        if (lines.length === 0) {
          resolve([]);
          return;
        }
        
        const firstLine = lines[0];
        const columns = firstLine.split(/[\t,]+/).map(col => col.trim().replace(/^"|"$/g, "")).filter(col => col);
        
        resolve(columns.length > 0 ? columns : []);
      });
      
      pdfParser.on("pdfParser_dataError", () => {
        resolve([]);
      });
      
      pdfParser.parseBuffer(buffer);
    } catch (error) {
      logger.error("PDF parsing error", error);
      resolve([]);
    }
  });
}

/**
 * Extract columns from PDF using OCR
 */
async function extractPdfOcrColumns(buffer: Buffer): Promise<string[]> {
  try {
    const pdfjs = await import("pdfjs-dist");
    pdfjs.GlobalWorkerOptions.workerSrc = "";
    
    const pdf = await pdfjs.getDocument({ data: buffer }).promise;
    const worker = await createWorker("eng");
    
    let allText = "";
    
    for (let i = 1; i <= Math.min(pdf.numPages, 3); i++) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: 2.0 });
      
      const canvas = createCanvas(viewport.width, viewport.height);
      const ctx = canvas.getContext("2d") as any;
      if (!ctx) continue;
      
      await page.render({
        canvasContext: ctx,
        viewport: viewport,
      } as any).promise;
      
      const imageBuffer = canvas.toBuffer("image/png");
      const { data: { text } } = await worker.recognize(imageBuffer);
      allText += text + "\n";
    }
    
    await worker.terminate();
    
    const lines = allText.split(/\n|\r/).filter(line => line.trim());
    if (lines.length === 0) {
      return [];
    }
    
    const firstLine = lines[0];
    const columns = firstLine.split(/[\t,]+/).map(col => col.trim().replace(/^"|"$/g, "")).filter(col => col);
    
    return columns.length > 0 ? columns : [];
  } catch (error) {
    logger.error("PDF OCR error", error);
    return [];
  }
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
 * Parse PDF preview rows
 */
export async function parsePdfPreview(buffer: Buffer, columns: string[], limit: number = 10): Promise<Record<string, string | number>[]> {
  // First try text extraction
  const textRows = await extractPdfTextPreview(buffer, columns, limit);
  
  if (textRows.length > 0) {
    return textRows;
  }
  
  // If no text found, try OCR
  logger.info("No text found in PDF preview, attempting OCR...");
  const ocrRows = await extractPdfOcrPreview(buffer, columns, limit);
  
  return ocrRows;
}

/**
 * Extract preview rows from PDF using text extraction
 */
async function extractPdfTextPreview(buffer: Buffer, columns: string[], limit: number): Promise<Record<string, string | number>[]> {
  return new Promise((resolve) => {
    try {
      const pdfParser = new PDFParser();
      
      pdfParser.on("pdfParser_dataReady", (pdfData: any) => {
        if (!pdfData || !pdfData.pages) {
          resolve([]);
          return;
        }
        
        let allText = "";
        for (const page of pdfData.pages) {
          if (page.Texts) {
            for (const textItem of page.Texts) {
              if (textItem.R) {
                for (const run of textItem.R) {
                  if (run.T) {
                    allText += decodeURIComponent(run.T as string) + "\n";
                  }
                }
              }
            }
          }
        }
        
        const lines = allText.split(/\n|\r/).filter(line => line.trim());
        if (lines.length <= 1) {
          resolve([]);
          return;
        }
        
        const rows: Record<string, string | number>[] = [];
        const headers = columns;
        
        for (let i = 1; i < Math.min(lines.length, limit + 1); i++) {
          const values = lines[i].split(/[\t,]+/).map(v => v.trim().replace(/^"|"$/g, ""));
          const row: Record<string, string | number> = {};
          
          for (let j = 0; j < Math.min(headers.length, values.length); j++) {
            row[headers[j]] = values[j];
          }
          
          if (Object.keys(row).length > 0) {
            rows.push(row);
          }
        }
        
        resolve(rows);
      });
      
      pdfParser.on("pdfParser_dataError", () => {
        resolve([]);
      });
      
      pdfParser.parseBuffer(buffer);
    } catch (error) {
      logger.error("PDF preview parsing error", error);
      resolve([]);
    }
  });
}

/**
 * Extract preview rows from PDF using OCR
 */
async function extractPdfOcrPreview(buffer: Buffer, columns: string[], limit: number): Promise<Record<string, string | number>[]> {
  try {
    const pdfjs = await import("pdfjs-dist");
    pdfjs.GlobalWorkerOptions.workerSrc = "";
    
    const pdf = await pdfjs.getDocument({ data: buffer }).promise;
    const worker = await createWorker("eng");
    
    let allText = "";
    
    for (let i = 1; i <= Math.min(pdf.numPages, 3); i++) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: 2.0 });
      
      const canvas = createCanvas(viewport.width, viewport.height);
      const ctx = canvas.getContext("2d") as any;
      if (!ctx) continue;
      
      await page.render({
        canvasContext: ctx,
        viewport: viewport,
      } as any).promise;
      
      const imageBuffer = canvas.toBuffer("image/png");
      const { data: { text } } = await worker.recognize(imageBuffer);
      allText += text + "\n";
    }
    
    await worker.terminate();
    
    const lines = allText.split(/\n|\r/).filter(line => line.trim());
    if (lines.length <= 1) {
      return [];
    }
    
    const rows: Record<string, string | number>[] = [];
    const headers = columns;
    
    for (let i = 1; i < Math.min(lines.length, limit + 1); i++) {
      const values = lines[i].split(/[\t,]+/).map(v => v.trim().replace(/^"|"$/g, ""));
      const row: Record<string, string | number> = {};
      
      for (let j = 0; j < Math.min(headers.length, values.length); j++) {
        row[headers[j]] = values[j];
      }
      
      if (Object.keys(row).length > 0) {
        rows.push(row);
      }
    }
    
    return rows;
  } catch (error) {
    logger.error("PDF OCR preview error", error);
    return [];
  }
}

/**
 * Upload file and store metapdfData
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
  } else if (fileExtension === "pdf") {
    columns = await extractPdfColumns(buffer);
  } else {
    columns = extractExcelColumns(buffer);
  }

  if (columns.length === 0) {
    await deleteFile(filePath);
    throw new Error("No columns found in file");
  }

  // Store metapdfData
  const metapdfData: FileMetadata = {
    fileId,
    originalName: file.name,
    filePath,
    fileType: fileExtension,
    columns,
    uploadedAt: new Date().toISOString(),
  };

  const metapdfDataPath = path.join(tempDir, `${fileId}.json`);
  await writeJsonFile(metapdfDataPath, metapdfData);

  logger.info("File uploaded", { fileId, originalName: file.name, columns: columns.length });

  return {
    fileId,
    columns,
    originalName: file.name,
  };
}

/**
 * Parse file and return preview pdfData
 */
export async function parseFile(fileId: string, previewLimit: number = 10): Promise<ParseResult> {
  const tempDir = getTempDir();
  
  // Read metapdfData
  const metapdfData = await readJsonFile<FileMetadata>(path.join(tempDir, `${fileId}.json`));
  if (!metapdfData) {
    throw new Error(ERROR_MESSAGES.FILE_NOT_FOUND);
  }

  // Read file content
  const fs = await import("fs");
  const fileBuffer = await fs.promises.readFile(metapdfData.filePath);

  let preview: Record<string, string | number>[] = [];

  if (metapdfData.fileType === "csv") {
    preview = parseCsvPreview(fileBuffer, metapdfData.columns, previewLimit);
  } else if (metapdfData.fileType === "pdf") {
    preview = await parsePdfPreview(fileBuffer, metapdfData.columns, previewLimit);
  } else {
    preview = parseExcelPreview(fileBuffer, previewLimit);
  }

  logger.debug("File parsed", { fileId, previewRows: preview.length });

  return {
    preview,
    columns: metapdfData.columns,
    totalRows: preview.length,
  };
}

/**
 * Get file metapdfData
 */
export async function getFileMetadata(fileId: string): Promise<FileMetadata | null> {
  const tempDir = getTempDir();
  return readJsonFile<FileMetadata>(path.join(tempDir, `${fileId}.json`));
}

/**
 * Delete file and its metapdfData
 */
export async function deleteUploadedFile(fileId: string): Promise<boolean> {
  const tempDir = getTempDir();
  
  const metapdfData = await readJsonFile<FileMetadata>(path.join(tempDir, `${fileId}.json`));
  if (!metapdfData) {
    return false;
  }

  // Delete file
  await deleteFile(metapdfData.filePath);
  
  // Delete metapdfData
  await deleteFile(path.join(tempDir, `${fileId}.json`));

  logger.info("File deleted", { fileId });

  return true;
}
