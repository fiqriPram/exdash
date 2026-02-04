/**
 * Removes UTF-8 BOM (Byte Order Mark) from content
 * BOM is represented as \uFEFF and appears at the start of files from Excel/Sheets
 */
export function removeBom(content: string): string {
  return content.replace(/^\uFEFF/, "");
}

/**
 * Normalizes line endings from Windows (\r\n) to Unix (\n)
 */
export function normalizeLineEndings(content: string): string {
  return content.replace(/\r\n/g, "\n");
}

/**
 * Full CSV content normalization pipeline
 */
export function normalizeCsvContent(content: string): string {
  return normalizeLineEndings(removeBom(content));
}
