import * as pdfjsLib from "pdfjs-dist";
import Tesseract from "tesseract.js";
import { DataRow } from "@/types";

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export async function parsePDFFile(file: File): Promise<DataRow[]> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  
  let allText: string[] = [];
  let hasTextContent = false;
  
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item: unknown) => {
        const textItem = item as { str?: string };
        return textItem.str || "";
      })
      .join(" ");
    
    if (pageText.trim().length > 10) {
      hasTextContent = true;
    }
    allText.push(pageText);
  }
  
  let rows = extractTableRows(allText);
  
  if (rows.length === 0 || !hasTextContent) {
    console.log("No text content found, trying OCR...");
    allText = await performOCR(pdf);
    rows = extractTableRows(allText);
  }
  
  if (rows.length === 0) {
    throw new Error("No table data found in PDF. The PDF may be empty or have an unreadable format.");
  }
  
  return rows;
}

async function performOCR(pdf: pdfjsLib.PDFDocumentProxy): Promise<string[]> {
  const allText: string[] = [];
  const numPages = pdf.numPages;
  
  for (let i = 1; i <= numPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 2.0 });
    
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    canvas.height = viewport.height;
    canvas.width = viewport.width;
    
    if (!context) continue;
    
    await page.render({
      canvasContext: context,
      viewport: viewport,
    } as Parameters<typeof page.render>[0]).promise;
    
    try {
      const result = await Tesseract.recognize(canvas, "eng", {
        logger: () => {},
      });
      
      const pageText = result.data.text;
      allText.push(pageText);
    } catch (error) {
      console.error(`OCR failed for page ${i}:`, error);
    }
  }
  
  return allText;
}

function extractTableRows(textContent: string[]): DataRow[] {
  const rows: DataRow[] = [];
  
  for (const pageText of textContent) {
    const lines = pageText.split(/\n|\r/).filter(line => line.trim());
    
    if (lines.length < 2) continue;
    
    const headerLine = lines[0];
    const headers = parseRow(headerLine);
    
    if (headers.length === 0) continue;
    
    for (let i = 1; i < lines.length; i++) {
      const values = parseRow(lines[i]);
      
      if (values.length === headers.length || values.length > 0) {
        const row: DataRow = {};
        const minLength = Math.min(headers.length, values.length);
        
        for (let j = 0; j < minLength; j++) {
          row[headers[j]] = values[j];
        }
        
        if (Object.keys(row).length > 0) {
          rows.push(row);
        }
      }
    }
  }
  
  return rows;
}

function parseRow(line: string): string[] {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;
  
  for (const char of line) {
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if ((char === "\t" || char === ",") && !inQuotes) {
      if (current.trim() || values.length > 0) {
        values.push(current.trim());
      }
      current = "";
    } else {
      current += char;
    }
  }
  
  if (current.trim() || values.length > 0) {
    values.push(current.trim());
  }
  
  return values;
}
