import { parse } from "csv-parse/sync";
import { normalizeCsvContent } from "./removeBom";

export interface CsvParseOptions {
  columns?: boolean;
  skipEmptyLines?: boolean;
  to?: number;
}

export interface ParsedCsv {
  headers: string[];
  rows: Array<Record<string, string | number>>;
}

/**
 * Parse CSV content with BOM handling and normalization
 */
export function parseCsv(
  content: string,
  options: CsvParseOptions = {}
): ParsedCsv {
  const cleanContent = normalizeCsvContent(content);

  const records = parse(cleanContent, {
    columns: options.columns ?? true,
    skip_empty_lines: options.skipEmptyLines ?? true,
    to: options.to,
  }) as unknown as Array<Record<string, unknown>>;

  const headers = Object.keys(records[0] || {});

  const rows = records.map((record) => {
    const row: Record<string, string | number> = {};
    headers.forEach((col) => {
      const value = record[col];
      row[col] = value !== undefined && value !== null ? String(value) : "";
    });
    return row;
  });

  return { headers, rows };
}

/**
 * Parse CSV content to extract only headers (for validation)
 */
export function extractCsvHeaders(content: string): string[] {
  const cleanContent = normalizeCsvContent(content);
  const records = parse(cleanContent, {
    columns: true,
    skip_empty_lines: true,
    to: 1,
  }) as Array<Record<string, unknown>>;

  return Object.keys(records[0] || {});
}
