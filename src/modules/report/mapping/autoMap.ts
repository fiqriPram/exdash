/**
 * Report mapping utilities
 */
import { createLogger } from "@/lib/logger";

const logger = createLogger("report:mapping:autoMap");

/**
 * Target fields that can be auto-mapped
 */
export const TARGET_FIELDS = [
  "date",
  "amount",
  "category",
  "description",
  "reference",
  "notes",
  "name",
  "status",
  "check_in",
  "check_out",
  "department",
  "item_name",
  "quantity",
  "unit_price",
  "sku",
  "location",
];

/**
 * Common column name patterns for auto-mapping
 */
const COLUMN_PATTERNS: Record<string, RegExp[]> = {
  date: [/date/i, /time/i, /tanggal/i, /waktu/i, /tgl/i],
  amount: [/amount/i, /total/i, /price/i, /cost/i, /value/i, /harga/i, /jumlah/i, /nilai/i],
  category: [/category/i, /type/i, /kategori/i, /jenis/i, /tipe/i],
  description: [/description/i, /desc/i, /detail/i, /keterangan/i, /deskripsi/i],
  reference: [/reference/i, /ref/i, /id/i, /no/i, /number/i, /nomor/i],
  notes: [/notes/i, /note/i, /remark/i, /comment/i, /komentar/i, /catatan/i],
  name: [/name/i, /nama/i, /person/i, /employee/i, /karyawan/i, /pegawai/i],
  status: [/status/i, /state/i, /condition/i],
  check_in: [/check.?in/i, /masuk/i, /start/i, /begin/i],
  check_out: [/check.?out/i, /keluar/i, /end/i, /finish/i],
  department: [/department/i, /dept/i, /division/i, /divisi/i, /departemen/i],
  item_name: [/item/i, /product/i, /barang/i, /produk/i, /nama.*barang/i],
  quantity: [/quantity/i, /qty/i, /count/i, /jumlah/i, /kuantitas/i],
  unit_price: [/unit.?price/i, /price/i, /harga.*satuan/i, /harga/i],
  sku: [/sku/i, /code/i, /kode/i],
  location: [/location/i, /loc/i, /place/i, /lokasi/i, /tempat/i],
};

export interface AutoMapResult {
  mapping: Record<string, string>;
  confidence: Record<string, number>;
  unmatched: string[];
}

/**
 * Calculate match score between column name and patterns
 */
function calculateMatchScore(columnName: string, patterns: RegExp[]): number {
  const normalizedColumn = columnName.toLowerCase().trim();
  
  for (const pattern of patterns) {
    if (pattern.test(normalizedColumn)) {
      // Higher score for exact matches
      const match = normalizedColumn.match(pattern);
      if (match && match[0].length === normalizedColumn.length) {
        return 1.0; // Exact match
      }
      return 0.8; // Partial match
    }
  }
  
  // Check for partial word matches
  for (const pattern of patterns) {
    const patternStr = pattern.source.replace(/\\?./g, (char) => {
      if (char === "\\") return "";
      return char;
    }).replace(/\?/g, "").replace(/\[.*?\]/g, "");
    
    if (normalizedColumn.includes(patternStr.toLowerCase())) {
      return 0.5;
    }
  }
  
  return 0;
}

/**
 * Auto-map columns to target fields
 */
export function autoMapColumns(columns: string[]): AutoMapResult {
  const mapping: Record<string, string> = {};
  const confidence: Record<string, number> = {};
  const matchedColumns = new Set<string>();
  
  logger.debug("Starting auto-mapping", { columns });
  
  // Score all possible matches
  const scores: Array<{ target: string; column: string; score: number }> = [];
  
  for (const target of TARGET_FIELDS) {
    const patterns = COLUMN_PATTERNS[target];
    if (!patterns) continue;
    
    for (const column of columns) {
      const score = calculateMatchScore(column, patterns);
      if (score > 0) {
        scores.push({ target, column, score });
      }
    }
  }
  
  // Sort by score descending
  scores.sort((a, b) => b.score - a.score);
  
  // Assign mappings (best match first, one column per target)
  for (const { target, column, score } of scores) {
    // Skip if column already matched or target already has a better match
    if (matchedColumns.has(column) || mapping[target]) {
      continue;
    }
    
    mapping[target] = column;
    confidence[target] = score;
    matchedColumns.add(column);
    
    logger.debug("Mapped column", { target, column, score });
  }
  
  // Find unmatched columns
  const unmatched = columns.filter((col) => !matchedColumns.has(col));
  
  logger.info("Auto-mapping complete", { 
    mapped: Object.keys(mapping).length, 
    unmatched: unmatched.length 
  });
  
  return { mapping, confidence, unmatched };
}

/**
 * Suggest mapping for a specific target field
 */
export function suggestMapping(
  targetField: string,
  columns: string[],
  currentMapping?: Record<string, string>
): Array<{ column: string; score: number }> {
  const patterns = COLUMN_PATTERNS[targetField];
  if (!patterns) return [];
  
  const suggestions: Array<{ column: string; score: number }> = [];
  const usedColumns = new Set(Object.values(currentMapping || {}));
  
  for (const column of columns) {
    if (usedColumns.has(column)) continue;
    
    const score = calculateMatchScore(column, patterns);
    if (score > 0) {
      suggestions.push({ column, score });
    }
  }
  
  return suggestions.sort((a, b) => b.score - a.score);
}
