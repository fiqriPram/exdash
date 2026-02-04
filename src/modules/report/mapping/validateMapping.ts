/**
 * Mapping validation utilities
 */
import { z } from "zod";
import { createLogger } from "@/lib/logger";
import { ERROR_MESSAGES } from "@/lib/constants";

const logger = createLogger("report:mapping:validate");

export const mappingRequestSchema = z.object({
  fileId: z.string(),
  mapping: z.record(z.string(), z.string()),
});

export type MappingInput = z.infer<typeof mappingRequestSchema>;

export interface ValidationResult {
  valid: boolean;
  error?: string;
  invalidColumns?: string[];
}

/**
 * Validate mapping against available columns
 */
export function validateMapping(
  mapping: Record<string, string>,
  availableColumns: string[]
): ValidationResult {
  const sourceColumns = Object.values(mapping);
  const invalidColumns = sourceColumns.filter(
    (col) => !availableColumns.includes(col)
  );

  if (invalidColumns.length > 0) {
    logger.warn("Invalid columns in mapping", { invalidColumns });
    return {
      valid: false,
      error: `Invalid columns: ${invalidColumns.join(", ")}`,
      invalidColumns,
    };
  }

  return { valid: true };
}

/**
 * Validate required fields are mapped
 */
export function validateRequiredFields(
  mapping: Record<string, string>,
  requiredFields: string[]
): ValidationResult {
  const mappedTargets = Object.keys(mapping);
  const missingFields = requiredFields.filter(
    (field) => !mappedTargets.includes(field)
  );

  if (missingFields.length > 0) {
    logger.warn("Required fields not mapped", { missingFields });
    return {
      valid: false,
      error: `Required fields not mapped: ${missingFields.join(", ")}`,
    };
  }

  return { valid: true };
}

/**
 * Merge two mappings (existing + new)
 */
export function mergeMappings(
  existing: Record<string, string>,
  newMapping: Record<string, string>
): Record<string, string> {
  return { ...existing, ...newMapping };
}

/**
 * Create reverse mapping (source -> target)
 */
export function reverseMapping(
  mapping: Record<string, string>
): Record<string, string> {
  const reversed: Record<string, string> = {};
  for (const [target, source] of Object.entries(mapping)) {
    reversed[source] = target;
  }
  return reversed;
}

/**
 * Check if mapping is empty
 */
export function isMappingEmpty(mapping: Record<string, string>): boolean {
  return Object.keys(mapping).length === 0;
}

/**
 * Get mapping statistics
 */
export function getMappingStats(
  mapping: Record<string, string>,
  requiredFields: string[],
  optionalFields: string[]
): {
  total: number;
  requiredMapped: number;
  optionalMapped: number;
  requiredTotal: number;
  optionalTotal: number;
  completion: number;
} {
  const mappedTargets = Object.keys(mapping);
  const requiredMapped = requiredFields.filter((f) => mappedTargets.includes(f)).length;
  const optionalMapped = optionalFields.filter((f) => mappedTargets.includes(f)).length;

  const requiredTotal = requiredFields.length;
  const optionalTotal = optionalFields.length;
  const totalFields = requiredTotal + optionalTotal;
  const totalMapped = requiredMapped + optionalMapped;

  return {
    total: totalMapped,
    requiredMapped,
    optionalMapped,
    requiredTotal,
    optionalTotal,
    completion: totalFields > 0 ? Math.round((totalMapped / totalFields) * 100) : 0,
  };
}
