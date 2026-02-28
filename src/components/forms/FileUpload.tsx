"use client";

import React, { useState, useCallback } from "react";
import {
  Upload,
  FileSpreadsheet,
  FileText,
  AlertCircle,
  Check,
} from "lucide-react";
import { parseExcelFile, parseCSVFile, parsePDFFile } from "@/utils/dataParser";
import { DataRow } from "@/types";

interface FileUploadProps {
  onDataLoaded: (data: DataRow[], fileName: string) => void;
  onError: (error: string) => void;
}

export default function FileUpload({ onDataLoaded, onError }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    setIsLoading(true);
    setUploadedFile(null);

    try {
      const fileExtension = file.name.split(".").pop()?.toLowerCase();
      let data: DataRow[];

      if (fileExtension === "xlsx" || fileExtension === "xls") {
        data = await parseExcelFile(file);
      } else if (fileExtension === "csv") {
        data = await parseCSVFile(file);
      } else if (fileExtension === "pdf") {
        data = await parsePDFFile(file);
      } else {
        throw new Error(
          "Unsupported file format. Please upload .xlsx, .xls, .csv, or .pdf files.",
        );
      }

      if (data.length === 0) {
        throw new Error("No data found in the file.");
      }

      setUploadedFile(file.name);
      onDataLoaded(data, file.name);
    } catch (error) {
      onError(
        error instanceof Error ? error.message : "Failed to process file",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  }, []);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const onFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  return (
    <div className="w-full">
      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        className={`
          relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 cursor-pointer
          ${
            isDragging
              ? "border-blue-500 bg-blue-50"
              : "border-border hover:border-muted-foreground/50 bg-muted/30"
          }
          ${isLoading ? "opacity-50 pointer-events-none" : ""}
        `}
      >
        <input
          type="file"
          accept=".xlsx,.xls,.csv,.pdf"
          onChange={onFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isLoading}
        />

        <div className="flex flex-col items-center gap-4">
          {isLoading ? (
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          ) : uploadedFile ? (
            <>
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <Check className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-lg font-medium text-gray-900">
                  {uploadedFile}
                </p>
                <p className="text-sm text-gray-500">
                  Click or drag to upload a different file
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Upload className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-lg font-medium text-gray-900">
                  Drop your file here, or click to browse
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Supports Excel (.xlsx, .xls), CSV and PDF files
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="mt-4 flex gap-4 justify-center">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <FileSpreadsheet className="w-4 h-4" />
          <span>Excel files</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <FileText className="w-4 h-4" />
          <span>CSV files</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <FileText className="w-4 h-4" />
          <span>PDF files</span>
        </div>
      </div>

      <div className="mt-4 flex items-start gap-2 text-sm text-gray-500 bg-gray-100 p-3 rounded-lg">
        <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
        <p>
          Make sure your file has a header row with column names. First row will
          be used as column headers.
        </p>
      </div>
    </div>
  );
}
