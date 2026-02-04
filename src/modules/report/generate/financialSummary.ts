/**
 * Financial summary generation
 */
import { format } from "date-fns";
import { createLogger } from "@/lib/logger";

const logger = createLogger("report:generate:financialSummary");

export interface FinancialSummary {
  total: number;
  count: number;
  average?: number;
  period?: string;
  categories?: Record<string, number>;
}

export interface SummaryOptions {
  amountField?: string;
  dateField?: string;
  categoryField?: string;
}

/**
 * Find amount field from mapping
 */
function findAmountField(mapping: Record<string, string>): string | undefined {
  return Object.entries(mapping).find(
    ([key]) => key.toLowerCase().includes("amount") || key.toLowerCase().includes("total")
  )?.[0];
}

/**
 * Find date field from mapping
 */
function findDateField(mapping: Record<string, string>): string | undefined {
  return Object.entries(mapping).find(
    ([key]) => key.toLowerCase().includes("date") || key.toLowerCase().includes("time")
  )?.[0];
}

/**
 * Find category field from mapping
 */
function findCategoryField(mapping: Record<string, string>): string | undefined {
  return Object.entries(mapping).find(
    ([key]) => key.toLowerCase().includes("category") || key.toLowerCase().includes("type")
  )?.[0];
}

/**
 * Parse amount value from string
 */
function parseAmount(value: unknown): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const cleaned = value.replace(/[^0-9.-]/g, "");
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}

/**
 * Parse date value
 */
function parseDate(value: unknown): Date | null {
  if (value instanceof Date) return isNaN(value.getTime()) ? null : value;
  if (typeof value === "string") {
    const parsed = new Date(value);
    return isNaN(parsed.getTime()) ? null : parsed;
  }
  if (typeof value === "number") {
    const parsed = new Date(value);
    return isNaN(parsed.getTime()) ? null : parsed;
  }
  return null;
}

/**
 * Calculate total amount from data
 */
function calculateTotal(
  data: Array<Record<string, unknown>>,
  amountField: string
): { total: number; validCount: number } {
  let total = 0;
  let validCount = 0;

  for (const row of data) {
    const value = parseAmount(row[amountField]);
    if (value !== 0 || row[amountField]) {
      total += value;
      validCount++;
    }
  }

  return { total, validCount };
}

/**
 * Extract period from date field
 */
function extractPeriod(
  data: Array<Record<string, unknown>>,
  dateField: string
): string | undefined {
  const dates: Date[] = [];

  for (const row of data) {
    const date = parseDate(row[dateField]);
    if (date) {
      dates.push(date);
    }
  }

  if (dates.length < 2) {
    return undefined;
  }

  dates.sort((a, b) => a.getTime() - b.getTime());

  return `${format(dates[0], "yyyy-MM-dd")} - ${format(
    dates[dates.length - 1],
    "yyyy-MM-dd"
  )}`;
}

/**
 * Calculate category breakdown
 */
function calculateCategories(
  data: Array<Record<string, unknown>>,
  categoryField: string
): Record<string, number> {
  const categories: Record<string, number> = {};

  for (const row of data) {
    const category = String(row[categoryField] || "Uncategorized");
    categories[category] = (categories[category] || 0) + 1;
  }

  return categories;
}

/**
 * Generate financial summary from mapped data
 */
export function generateFinancialSummary(
  data: Array<Record<string, unknown>>,
  mapping: Record<string, string>,
  options?: SummaryOptions
): FinancialSummary {
  logger.debug("Generating financial summary", { rowCount: data.length });

  const summary: FinancialSummary = {
    total: 0,
    count: data.length,
  };

  // Calculate totals if amount field exists
  const amountField = options?.amountField || findAmountField(mapping);

  if (amountField) {
    const { total, validCount } = calculateTotal(data, amountField);
    summary.total = total;
    summary.average = validCount > 0 ? total / validCount : 0;
    logger.debug("Amount calculated", { total, average: summary.average });
  }

  // Extract period from date field
  const dateField = options?.dateField || findDateField(mapping);

  if (dateField && data.length > 0) {
    const period = extractPeriod(data, dateField);
    if (period) {
      summary.period = period;
      logger.debug("Period extracted", { period });
    }
  }

  // Category breakdown
  const categoryField = options?.categoryField || findCategoryField(mapping);

  if (categoryField) {
    summary.categories = calculateCategories(data, categoryField);
    logger.debug("Categories calculated", { 
      categoryCount: Object.keys(summary.categories).length 
    });
  }

  logger.info("Financial summary generated", {
    count: summary.count,
    total: summary.total,
    hasCategories: !!summary.categories,
  });

  return summary;
}
