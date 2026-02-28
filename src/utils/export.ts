import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { ProcessedData, ReportConfig, DataRow, ColumnMapping } from "@/types";

export function exportToPDF(
  processedData: ProcessedData,
  config: ReportConfig,
): void {
  const doc = new jsPDF();
  const { rawData, mappings, summary } = processedData;

  // Title
  doc.setFontSize(20);
  doc.text(config.title, 14, 20);

  // Period
  doc.setFontSize(12);
  doc.text(`Period: ${config.period || summary.period || "N/A"}`, 14, 30);

  // Summary section
  doc.setFontSize(14);
  doc.text("Summary", 14, 45);

  doc.setFontSize(10);
  let yPos = 55;
  doc.text(`Total Records: ${summary.totalRows}`, 14, yPos);
  yPos += 6;

  if (summary.totalAmount !== undefined) {
    doc.text(`Total Amount: ${formatCurrency(summary.totalAmount)}`, 14, yPos);
    yPos += 6;
  }

  if (summary.averageAmount !== undefined) {
    doc.text(
      `Average Amount: ${formatCurrency(summary.averageAmount)}`,
      14,
      yPos,
    );
    yPos += 6;
  }

  // Table data - data already has targetField keys from the API
  const tableHeaders = mappings.map((m) => m.targetField);
  const tableData = rawData.map((row) =>
    mappings.map((m) => formatValue(row[m.targetField] ?? row[m.sourceColumn], m.dataType)),
  );

  // Generate table
  autoTable(doc, {
    head: [tableHeaders],
    body: tableData,
    startY: yPos + 10,
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    alternateRowStyles: { fillColor: [245, 245, 245] },
  });

  // Category breakdown if available
  if (summary.categories && Object.keys(summary.categories).length > 0) {
    const finalY =
      (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable
        ?.finalY || 150;

    doc.setFontSize(14);
    doc.text("Category Breakdown", 14, finalY + 15);

    const categoryData = Object.entries(summary.categories).map(
      ([category, count]) => [category, count.toString()],
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
      `Generated on ${new Date().toLocaleString()} - Page ${i} of ${pageCount}`,
      14,
      doc.internal.pageSize.height - 10,
    );
  }

  // Download
  doc.save(
    `${config.title.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.pdf`,
  );
}

export function exportToExcel(
  processedData: ProcessedData,
  config: ReportConfig,
): void {
  const { rawData, mappings, summary } = processedData;

  // Create workbook
  const wb = XLSX.utils.book_new();

  // Main data sheet - data already has targetField keys from the API
  const mappedData = rawData.map((row) => {
    const mappedRow: DataRow = {};
    mappings.forEach((m) => {
      // Use targetField since API returns data with mapped keys
      mappedRow[m.targetField] = row[m.targetField] ?? row[m.sourceColumn];
    });
    return mappedRow;
  });

  const ws = XLSX.utils.json_to_sheet(mappedData);
  XLSX.utils.book_append_sheet(wb, ws, "Data");

  // Summary sheet
  const summaryData = [
    ["Report Title", config.title],
    ["Period", config.period || summary.period || "N/A"],
    ["Total Records", summary.totalRows],
    ["Total Amount", summary.totalAmount || "N/A"],
    ["Average Amount", summary.averageAmount || "N/A"],
    [""],
    ["Category Breakdown"],
    ["Category", "Count"],
    ...Object.entries(summary.categories || {}),
  ];

  const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, summaryWs, "Summary");

  // Download
  XLSX.writeFile(
    wb,
    `${config.title.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.xlsx`,
  );
}

function formatValue(value: unknown, dataType: string): string {
  if (value === undefined || value === null || value === "") {
    return "-";
  }

  switch (dataType) {
    case "currency":
      return formatCurrency(Number(value));
    case "date":
      const date = new Date(String(value));
      return isNaN(date.getTime()) ? String(value) : date.toLocaleDateString();
    case "number":
      return Number(value).toLocaleString();
    default:
      return String(value);
  }
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}
