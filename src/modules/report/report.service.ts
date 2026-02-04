/**
 * Report service - high-level report operations
 */
import path from "path";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { z } from "zod";
import { createLogger } from "@/lib/logger";
import { 
  getTempDir, 
  getReportsDir, 
  listFiles, 
  readJsonFile,
  ensureDir,
  type FileMetadata 
} from "@/lib/db";
import { 
  generateBaseReport, 
  readFileMetadata, 
  readFileData, 
  applyMapping,
  saveReport,
  loadReport,
  generateReportId,
  type GenerateReportInput,
  type MappedRow 
} from "./generate/baseGenerator";
import { generateFinancialSummary, type FinancialSummary } from "./generate/financialSummary";
import { validateMapping, mappingRequestSchema, type MappingInput } from "./mapping/validateMapping";
import { autoMapColumns } from "./mapping/autoMap";
import { validateColumns } from "./csv/validateColumns";
import { MAX_PREVIEW_ROWS, SUPPORTED_EXPORT_FORMATS, type ExportFormat } from "@/lib/constants";

const logger = createLogger("report:service");

export const generateRequestSchema = z.object({
  fileId: z.string(),
  reportType: z.enum(["monthly", "weekly", "daily", "yearly"]).optional(),
});

export const exportRequestSchema = z.object({
  reportId: z.string(),
  format: z.enum(SUPPORTED_EXPORT_FORMATS),
});

export type GenerateReportRequest = z.infer<typeof generateRequestSchema>;
export type ExportReportRequest = z.infer<typeof exportRequestSchema>;

export interface ReportSummary {
  id: string;
  reportId: string;
  generatedAt: string;
  summary: FinancialSummary;
}

export interface ReportDetail {
  id: string;
  reportId: string;
  fileId: string;
  summary: FinancialSummary;
  data: MappedRow[];
  mapping: Record<string, string>;
  generatedAt: string;
}

/**
 * Generate report with financial summary
 */
export async function generateReport(
  input: GenerateReportRequest
): Promise<{ reportId: string; summary: FinancialSummary; data: MappedRow[] }> {
  logger.info("Generating report", { fileId: input.fileId });

  // Generate base report
  const baseResult = await generateBaseReport(input);
  
  // Generate financial summary
  const summary = generateFinancialSummary(baseResult.data, baseResult.mapping);
  
  // Merge summary
  const fullSummary = { ...baseResult.summary, ...summary };
  
  // Save report
  await saveReport(
    baseResult.reportId,
    baseResult.fileId,
    fullSummary,
    baseResult.data,
    baseResult.mapping
  );

  logger.info("Report generated successfully", { reportId: baseResult.reportId });

  return {
    reportId: baseResult.reportId,
    summary: fullSummary,
    data: baseResult.data.slice(0, MAX_PREVIEW_ROWS),
  };
}

/**
 * Get report by ID
 */
export async function getReport(reportId: string): Promise<ReportDetail | null> {
  const report = await loadReport(reportId);
  if (!report) return null;

  return {
    id: report.reportId,
    reportId: report.reportId,
    fileId: report.fileId,
    summary: report.summary,
    data: report.data,
    mapping: report.mapping,
    generatedAt: report.generatedAt,
  };
}

/**
 * Get report history
 */
export async function getReportHistory(): Promise<ReportSummary[]> {
  const tempDir = getTempDir();
  
  const reportFiles = await listFiles(
    tempDir,
    (f) => f.startsWith("report_") && f.endsWith(".json")
  );

  const reports = await Promise.all(
    reportFiles.map(async (file) => {
      try {
        const data = await readJsonFile<{
          reportId: string;
          generatedAt: string;
          summary: FinancialSummary;
        }>(path.join(tempDir, file));
        
        if (!data) return null;
        
        return {
          id: data.reportId,
          reportId: data.reportId,
          generatedAt: data.generatedAt,
          summary: data.summary,
        };
      } catch {
        return null;
      }
    })
  );

  // Filter out nulls and sort by date (newest first)
  return reports
    .filter((r): r is NonNullable<typeof r> => r !== null)
    .sort((a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime());
}

/**
 * Save column mapping
 */
export async function saveMapping(
  input: MappingInput
): Promise<{ status: string }> {
  const { fileId, mapping } = mappingRequestSchema.parse(input);

  // Read metadata
  const metadata = await readFileMetadata(fileId);
  if (!metadata) {
    throw new Error("File not found or expired");
  }

  // Validate mapping
  const validation = validateMapping(mapping, metadata.columns);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  // Update metadata with mapping
  metadata.mapping = mapping;
  
  const tempDir = getTempDir();
  const { writeJsonFile } = await import("@/lib/db");
  await writeJsonFile(path.join(tempDir, `${fileId}.json`), metadata);

  logger.info("Mapping saved", { fileId });

  return { status: "success" };
}

/**
 * Auto-map columns for a file
 */
export async function autoMapFileColumns(fileId: string): Promise<{
  mapping: Record<string, string>;
  confidence: Record<string, number>;
  unmatched: string[];
}> {
  const metadata = await readFileMetadata(fileId);
  if (!metadata) {
    throw new Error("File not found or expired");
  }

  const result = autoMapColumns(metadata.columns);
  
  logger.info("Auto-mapping completed", { fileId, mappedCount: Object.keys(result.mapping).length });
  
  return result;
}

/**
 * Validate columns for a file
 */
export async function validateFileColumns(
  fileId: string,
  requiredColumns: string[]
): Promise<{ valid: boolean; message?: string; missing?: string[]; available?: string[] }> {
  const metadata = await readFileMetadata(fileId);
  if (!metadata) {
    throw new Error("File not found or expired");
  }

  const result = validateColumns(metadata.columns, requiredColumns);
  
  return {
    valid: result.valid,
    message: result.valid ? "All required columns present" : "Missing required columns",
    missing: result.missing,
    available: result.available,
  };
}

/**
 * Export report to file
 */
export async function exportReport(
  input: ExportReportRequest
): Promise<{ downloadUrl: string }> {
  const { reportId, format } = exportRequestSchema.parse(input);

  // Load report
  const report = await loadReport(reportId);
  if (!report) {
    throw new Error("Report not found");
  }

  // Ensure reports directory exists
  const reportsDir = getReportsDir();
  await ensureDir(reportsDir);

  const timestamp = new Date().toISOString().split("T")[0];
  const exportFileName = `${reportId}_${timestamp}.${format}`;
  const exportPath = path.join(reportsDir, exportFileName);

  if (format === "xlsx") {
    await exportToExcel(report, exportPath);
  } else if (format === "pdf") {
    await exportToPdf(report, exportPath);
  }

  logger.info("Report exported", { reportId, format, fileName: exportFileName });

  return {
    downloadUrl: `/reports/${exportFileName}`,
  };
}

/**
 * Export report to Excel
 */
async function exportToExcel(
  report: {
    reportId: string;
    summary: FinancialSummary;
    data: MappedRow[];
    mapping: Record<string, string>;
    generatedAt: string;
  },
  exportPath: string
): Promise<void> {
  const wb = XLSX.utils.book_new();

  // Main data sheet
  const mappedData = report.data.map((row) => {
    const mappedRow: Record<string, unknown> = {};
    Object.entries(report.mapping).forEach(([targetField]) => {
      mappedRow[targetField] = row[targetField];
    });
    delete mappedRow._rowIndex;
    return mappedRow;
  });

  const ws = XLSX.utils.json_to_sheet(mappedData);
  XLSX.utils.book_append_sheet(wb, ws, "Report Data");

  // Summary sheet
  const summaryData = [
    ["Report ID", report.reportId],
    ["Generated At", new Date(report.generatedAt).toLocaleString()],
    ["Total Records", report.summary.count],
    [""],
    ["Summary"],
    ["Total Amount", report.summary.total],
    ["Average Amount", report.summary.average || "N/A"],
    ["Period", report.summary.period || "N/A"],
    [""],
    ["Category Breakdown"],
    ["Category", "Count"],
    ...Object.entries(report.summary.categories || {}),
  ];

  const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, summaryWs, "Summary");

  // Write file
  XLSX.writeFile(wb, exportPath);
}

/**
 * Export report to PDF
 */
async function exportToPdf(
  report: {
    reportId: string;
    summary: FinancialSummary;
    data: MappedRow[];
    mapping: Record<string, string>;
    generatedAt: string;
  },
  exportPath: string
): Promise<void> {
  const doc = new jsPDF();
  const { data, summary, mapping } = report;

  // Title
  doc.setFontSize(20);
  doc.text("Report", 14, 20);

  // Period
  doc.setFontSize(12);
  doc.text(`Period: ${summary.period || "N/A"}`, 14, 30);
  doc.text(`Generated: ${new Date(report.generatedAt).toLocaleString()}`, 14, 38);

  // Summary section
  doc.setFontSize(14);
  doc.text("Summary", 14, 50);

  doc.setFontSize(10);
  let yPos = 60;
  doc.text(`Total Records: ${summary.count}`, 14, yPos);
  yPos += 6;
  doc.text(`Total Amount: ${formatCurrency(summary.total)}`, 14, yPos);
  yPos += 6;
  if (summary.average) {
    doc.text(`Average Amount: ${formatCurrency(summary.average)}`, 14, yPos);
    yPos += 6;
  }

  // Table data
  const headers = Object.keys(mapping);
  const tableData = data.map((row) =>
    headers.map((header) => formatValue(row[header]))
  );

  // Generate table
  autoTable(doc, {
    head: [headers],
    body: tableData,
    startY: yPos + 10,
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    alternateRowStyles: { fillColor: [245, 245, 245] },
  });

  // Category breakdown if available
  if (summary.categories && Object.keys(summary.categories).length > 0) {
    const finalY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable
      ?.finalY || 150;

    doc.setFontSize(14);
    doc.text("Category Breakdown", 14, finalY + 15);

    const categoryData = Object.entries(summary.categories).map(
      ([category, count]) => [category, count.toString()]
    );

    autoTable(doc, {
      head: [["Category", "Count"]],
      body: categoryData,
      startY: finalY + 20,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    });
  }

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.text(
      `Page ${i} of ${pageCount}`,
      14,
      doc.internal.pageSize.height - 10
    );
  }

  // Save PDF
  doc.save(exportPath);
}

/**
 * Format value for display
 */
function formatValue(value: unknown): string {
  if (value === undefined || value === null) {
    return "-";
  }
  return String(value);
}

/**
 * Format currency value
 */
function formatCurrency(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);
}
