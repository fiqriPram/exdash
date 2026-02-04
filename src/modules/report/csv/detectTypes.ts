/**
 * Detect data types from column values
 */
export type DataType = "string" | "number" | "date" | "currency" | "unknown";

export function detectType(values: (string | number)[]): DataType {
  const nonEmptyValues = values.filter((v) => v !== "" && v !== undefined && v !== null);

  if (nonEmptyValues.length === 0) return "unknown";

  // Check for dates
  const dateRegex = /^\d{4}-\d{2}-\d{2}|^\d{2}\/\d{2}\/\d{4}/;
  const allDates = nonEmptyValues.every((v) => dateRegex.test(String(v)));
  if (allDates) return "date";

  // Check for currency (contains currency symbols or patterns)
  const currencyRegex = /[Rp$€£¥]|IDR|USD|EUR/;
  const hasCurrency = nonEmptyValues.some((v) => currencyRegex.test(String(v)));
  if (hasCurrency) return "currency";

  // Check for numbers
  const numberRegex = /^-?\d+(\.\d+)?$/;
  const allNumbers = nonEmptyValues.every((v) =>
    numberRegex.test(String(v).replace(/,/g, ""))
  );
  if (allNumbers) return "number";

  return "string";
}

/**
 * Infer data types for all columns in a dataset
 */
export function detectColumnTypes(
  rows: Array<Record<string, string | number>>
): Record<string, DataType> {
  if (rows.length === 0) return {};

  const columns = Object.keys(rows[0]);
  const types: Record<string, DataType> = {};

  columns.forEach((col) => {
    const values = rows.map((row) => row[col]);
    types[col] = detectType(values);
  });

  return types;
}
