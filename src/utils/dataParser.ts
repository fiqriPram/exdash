import * as XLSX from "xlsx";
import {
  DataRow,
  ColumnMapping,
  ValidationError,
  DataSummary,
  ProcessedData,
} from "@/types";

export function parseExcelFile(file: File): Promise<DataRow[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) {
          reject(new Error("Failed to read file"));
          return;
        }

        const workbook = XLSX.read(data, { type: "binary" });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json<DataRow>(firstSheet, {
          header: 1,
        });

        if (jsonData.length < 2) {
          reject(
            new Error(
              "File must contain at least a header row and one data row",
            ),
          );
          return;
        }

        // Convert array of arrays to array of objects using header row
        const headers = jsonData[0] as unknown as string[];
        const rows = jsonData.slice(1).map((row: unknown) => {
          const rowArray = row as (string | number | Date)[];
          const obj: DataRow = {};
          headers.forEach((header, index) => {
            obj[header] = rowArray[index] ?? "";
          });
          return obj;
        });

        resolve(rows);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsBinaryString(file);
  });
}

export function parseCSVFile(file: File): Promise<DataRow[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        if (!text) {
          reject(new Error("Failed to read file"));
          return;
        }

        const lines = text.split("\n").filter((line) => line.trim());
        if (lines.length < 2) {
          reject(
            new Error(
              "File must contain at least a header row and one data row",
            ),
          );
          return;
        }

        const headers = lines[0]
          .split(",")
          .map((h) => h.trim().replace(/^"|"$/g, ""));
        const rows = lines.slice(1).map((line) => {
          const values = line
            .split(",")
            .map((v) => v.trim().replace(/^"|"$/g, ""));
          const obj: DataRow = {};
          headers.forEach((header, index) => {
            obj[header] = values[index] ?? "";
          });
          return obj;
        });

        resolve(rows);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsText(file);
  });
}

export function validateData(
  data: DataRow[],
  mappings: ColumnMapping[],
): ValidationError[] {
  const errors: ValidationError[] = [];

  data.forEach((row, rowIndex) => {
    mappings.forEach((mapping) => {
      const value = row[mapping.sourceColumn];

      if (value === undefined || value === null || value === "") {
        errors.push({
          row: rowIndex + 1,
          column: mapping.sourceColumn,
          message: `Missing value for ${mapping.targetField}`,
          value: value,
        });
        return;
      }

      switch (mapping.dataType) {
        case "number":
        case "currency":
          if (isNaN(Number(value))) {
            errors.push({
              row: rowIndex + 1,
              column: mapping.sourceColumn,
              message: `Invalid number format for ${mapping.targetField}`,
              value: value,
            });
          }
          break;
        case "date":
          if (isNaN(Date.parse(String(value)))) {
            errors.push({
              row: rowIndex + 1,
              column: mapping.sourceColumn,
              message: `Invalid date format for ${mapping.targetField}`,
              value: value,
            });
          }
          break;
      }
    });
  });

  return errors;
}

export function generateSummary(
  data: DataRow[],
  mappings: ColumnMapping[],
): DataSummary {
  const amountMapping = mappings.find(
    (m) => m.targetField === "amount" || m.dataType === "currency",
  );
  const categoryMapping = mappings.find((m) => m.targetField === "category");
  const dateMapping = mappings.find(
    (m) => m.targetField === "date" || m.dataType === "date",
  );

  let totalAmount = 0;
  let amountCount = 0;
  const categories: { [key: string]: number } = {};

  if (amountMapping) {
    data.forEach((row) => {
      const value = Number(row[amountMapping.sourceColumn]);
      if (!isNaN(value)) {
        totalAmount += value;
        amountCount++;
      }
    });
  }

  if (categoryMapping) {
    data.forEach((row) => {
      const category = String(
        row[categoryMapping.sourceColumn] || "Uncategorized",
      );
      categories[category] = (categories[category] || 0) + 1;
    });
  }

  let period = "";
  if (dateMapping && data.length > 0) {
    const dates = data
      .map((row) => new Date(row[dateMapping.sourceColumn] as string))
      .filter((d) => !isNaN(d.getTime()))
      .sort((a, b) => a.getTime() - b.getTime());

    if (dates.length >= 2) {
      period = `${dates[0].toLocaleDateString()} - ${dates[dates.length - 1].toLocaleDateString()}`;
    }
  }

  return {
    totalRows: data.length,
    totalAmount: amountCount > 0 ? totalAmount : undefined,
    averageAmount: amountCount > 0 ? totalAmount / amountCount : undefined,
    period: period || undefined,
    categories: Object.keys(categories).length > 0 ? categories : undefined,
  };
}

export function processData(
  data: DataRow[],
  mappings: ColumnMapping[],
): ProcessedData {
  const columns = Object.keys(data[0] || {});
  const errors = validateData(data, mappings);
  const summary = generateSummary(data, mappings);

  return {
    rawData: data,
    columns,
    mappings,
    summary,
    errors,
  };
}

export function autoMapColumns(
  columns: string[],
  requiredFields: string[],
): ColumnMapping[] {
  const mappings: ColumnMapping[] = [];

  const fieldPatterns: {
    [key: string]: { keywords: string[]; dataType: ColumnMapping["dataType"] };
  } = {
    date: {
      keywords: ["date", "tanggal", "tgl", "time", "waktu"],
      dataType: "date",
    },
    amount: {
      keywords: [
        "amount",
        "total",
        "nominal",
        "harga",
        "price",
        "value",
        "jumlah",
      ],
      dataType: "currency",
    },
    category: {
      keywords: ["category", "kategori", "type", "jenis", "group"],
      dataType: "string",
    },
    description: {
      keywords: [
        "description",
        "deskripsi",
        "detail",
        "keterangan",
        "notes",
        "catatan",
      ],
      dataType: "string",
    },
    name: {
      keywords: ["name", "nama", "person", "student", "employee"],
      dataType: "string",
    },
    status: { keywords: ["status", "state", "condition"], dataType: "string" },
    quantity: {
      keywords: ["quantity", "qty", "jumlah", "count"],
      dataType: "number",
    },
  };

  requiredFields.forEach((field) => {
    const pattern = fieldPatterns[field];
    if (!pattern) return;

    const matchedColumn = columns.find((col) =>
      pattern.keywords.some((keyword) =>
        col.toLowerCase().includes(keyword.toLowerCase()),
      ),
    );

    if (matchedColumn) {
      mappings.push({
        sourceColumn: matchedColumn,
        targetField: field,
        dataType: pattern.dataType,
      });
    }
  });

  return mappings;
}
