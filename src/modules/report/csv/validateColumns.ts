/**
 * Validates that all required columns exist in the CSV
 * Performs case-insensitive matching with trimmed whitespace
 */
export interface ColumnValidationResult {
  valid: boolean;
  missing: string[];
  available: string[];
}

export function validateColumns(
  csvColumns: string[],
  requiredColumns: string[]
): ColumnValidationResult {
  // Normalize CSV columns: lowercase and trim
  const normalizedCsvColumns = csvColumns.map((col) =>
    col.toLowerCase().trim()
  );

  // Normalize required columns: lowercase and trim
  const normalizedRequiredColumns = requiredColumns.map((col) =>
    col.toLowerCase().trim()
  );

  // Find missing columns
  const missing = normalizedRequiredColumns.filter(
    (requiredCol) => !normalizedCsvColumns.includes(requiredCol)
  );

  return {
    valid: missing.length === 0,
    missing,
    available: csvColumns,
  };
}
