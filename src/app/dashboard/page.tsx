"use client";

import React, { useState, useCallback } from "react";
import {
  FileText,
  Settings,
  BarChart3,
  ChevronRight,
  CheckCircle2,
  LogOut,
  User,
  History,
  Database,
  Upload,
  FileSpreadsheet,
  AlertCircle,
  Check,
  Loader2,
  Download,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import { useRouter } from "next/navigation";
import ColumnMapper from "@/components/forms/ColumnMapper";
import ReportHistoryViewer from "@/components/report/ReportHistoryViewer";
import BackupRestore from "@/components/admin/BackupRestore";
import SavedMappings from "@/components/report/SavedMappings";
import LoginPage from "@/components/forms/LoginPage";
import {
  DataRow,
  ColumnMapping,
  ReportTemplate,
  ProcessedData,
  ReportConfig,
  REPORT_TEMPLATES,
} from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { addReportToHistory, getSettings } from "@/utils/storage";
import { ModeToggle } from "@/components/layout/mode-toggle";

const TABS = [
  { id: "report", label: "New Report", icon: FileText },
  { id: "history", label: "History", icon: History },
  { id: "settings", label: "Settings", icon: Database },
];

const STEPS = [
  { id: "upload", label: "Upload Data", icon: FileText },
  { id: "map", label: "Map Columns", icon: Settings },
  { id: "preview", label: "Preview & Export", icon: BarChart3 },
];

// FileUpload component that uses API
function FileUploadAPI({
  onUploadComplete,
  onError,
}: {
  onUploadComplete: (fileId: string, columns: string[]) => void;
  onError: (error: string) => void;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    setIsUploading(true);
    setUploadedFile(null);

    try {
      const fileExtension = file.name.split(".").pop()?.toLowerCase();
      if (!["xlsx", "xls", "csv", "pdf"].includes(fileExtension || "")) {
        throw new Error("Unsupported file format. Please upload .xlsx, .xls, .csv, or .pdf files.");
      }

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to upload file");
      }

      const data = await response.json();
      setUploadedFile(file.name);
      onUploadComplete(data.fileId, data.columns);
    } catch (error) {
      onError(error instanceof Error ? error.message : "Failed to upload file");
    } finally {
      setIsUploading(false);
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
          ${isDragging ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30" : "border-border hover:border-muted-foreground bg-muted/50"}
          ${isUploading ? "opacity-50 pointer-events-none" : ""}
        `}
      >
        <input
          type="file"
          accept=".xlsx,.xls,.csv,.pdf"
          onChange={onFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isUploading}
        />
        <div className="flex flex-col items-center gap-4">
          {isUploading ? (
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-12 h-12 text-primary animate-spin" />
              <p className="text-muted-foreground">Uploading file...</p>
            </div>
          ) : uploadedFile ? (
            <>
              <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                <Check className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-lg font-medium text-foreground">{uploadedFile}</p>
                <p className="text-sm text-muted-foreground">Click or drag to upload a different file</p>
              </div>
            </>
          ) : (
            <>
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Upload className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-lg font-medium text-foreground">Drop your file here, or click to browse</p>
                <p className="text-sm text-muted-foreground mt-1">Supports Excel (.xlsx, .xls), CSV and PDF files (max 5MB)</p>
              </div>
            </>
          )}
        </div>
      </div>
      <div className="mt-4 flex gap-4 justify-center">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <FileSpreadsheet className="w-4 h-4" />
          <span>Excel files</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <FileText className="w-4 h-4" />
          <span>CSV files</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <FileText className="w-4 h-4" />
          <span>PDF files</span>
        </div>
      </div>
      <div className="mt-4 flex items-start gap-2 text-sm text-muted-foreground bg-muted p-3 rounded-lg">
        <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
        <p>Make sure your file has a header row with column names. First row will be used as column headers.</p>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { isAuthenticated, user, logout } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("report");
  const [currentStep, setCurrentStep] = useState(0);
  
  // API-based state
  const [fileId, setFileId] = useState<string>("");
  const [columns, setColumns] = useState<string[]>([]);
  const [previewData, setPreviewData] = useState<DataRow[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate>(REPORT_TEMPLATES[0]);
  const [mappings, setMappings] = useState<ColumnMapping[]>([]);
  const [reportId, setReportId] = useState<string>("");
  const [processedData, setProcessedData] = useState<ProcessedData | null>(null);
  const [reportConfig, setReportConfig] = useState<ReportConfig>({
    title: "",
    period: "",
    template: REPORT_TEMPLATES[0],
    includeCharts: false,
    deleteAfterExport: getSettings().deleteAfterExport,
  });
  
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const handleUploadComplete = async (uploadedFileId: string, fileColumns: string[]) => {
    setFileId(uploadedFileId);
    setColumns(fileColumns);
    setError("");
    
    // Auto-detect template based on file columns
    const lowerColumns = fileColumns.map(c => c.toLowerCase());
    
    const findBestTemplate = () => {
      let bestMatch = REPORT_TEMPLATES[0];
      let maxMatches = 0;
      
      for (const template of REPORT_TEMPLATES) {
        const matches = template.requiredFields.filter(field => 
          lowerColumns.some(col => col.includes(field.toLowerCase().replace('_', '')) || col.includes(field.toLowerCase()))
        ).length;
        
        if (matches > maxMatches) {
          maxMatches = matches;
          bestMatch = template;
        }
      }
      return bestMatch;
    };
    
    const detectedTemplate = findBestTemplate();
    setSelectedTemplate(detectedTemplate);
    setReportConfig(prev => ({ ...prev, template: detectedTemplate }));
    
    const requiredColumns = detectedTemplate.requiredFields;
    
    try {
      const validationResponse = await fetch("/api/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileId: uploadedFileId,
          requiredColumns,
        }),
      });

      if (!validationResponse.ok) {
        const errorData = await validationResponse.json();
        if (errorData.missing && errorData.missing.length > 0) {
          setError(
            `Note: Some expected columns were not found: ${errorData.missing.join(", ")}. The system will try to generate the ${detectedTemplate.name} report with available columns.`
          );
        }
      }

      // Proceed to mapping step regardless of validation
      setCurrentStep(1);
      
      // Fetch preview data
      const response = await fetch("/api/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileId: uploadedFileId }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setPreviewData(data.preview);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to validate CSV columns");
    }
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
  };

  const handleMappingComplete = (newMappings: ColumnMapping[]) => {
    setMappings(newMappings);
  };

  const handleSaveMappingAndGenerate = async () => {
    if (!fileId || mappings.length === 0) {
      setError("Please upload a file and configure column mappings first");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Convert ColumnMapping[] to the format expected by API
      const mappingObject: Record<string, string> = {};
      mappings.forEach((m) => {
        mappingObject[m.targetField] = m.sourceColumn;
      });

      // Save mapping
      const mappingResponse = await fetch("/api/mapping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileId,
          mapping: mappingObject,
        }),
      });

      if (!mappingResponse.ok) {
        const error = await mappingResponse.json();
        throw new Error(error.error || "Failed to save mapping");
      }

      // Generate report
      const generateResponse = await fetch("/api/report/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileId,
          reportType: "monthly",
        }),
      });

      if (!generateResponse.ok) {
        const error = await generateResponse.json();
        throw new Error(error.error || "Failed to generate report");
      }

      const reportData = await generateResponse.json();
      setReportId(reportData.reportId);
      
      // Convert API response to ProcessedData format
      const processed: ProcessedData = {
        rawData: reportData.data || [],
        columns: Object.keys(reportData.data?.[0] || {}),
        mappings,
        summary: {
          totalRows: reportData.summary?.count || 0,
          totalAmount: reportData.summary?.total,
          averageAmount: reportData.summary?.average,
          period: reportData.summary?.period,
          categories: reportData.summary?.categories,
        },
        errors: [],
      };
      
      setProcessedData(processed);
      
      const title = reportConfig.title || `${selectedTemplate.name} - ${fileId}`;
      setReportConfig((prev) => ({
        ...prev,
        title,
        template: selectedTemplate,
      }));
      
      setCurrentStep(2);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate report");
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async (format: "pdf" | "excel") => {
    if (!reportId || !processedData || !user) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reportId,
          format: format === "excel" ? "xlsx" : "pdf",
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to export report");
      }

      const data = await response.json();
      
      // Trigger download
      window.open(data.downloadUrl, "_blank");
      
      // Add to history
      addReportToHistory(
        {
          title: reportConfig.title,
          templateName: selectedTemplate.name,
          period: reportConfig.period || processedData.summary.period || "N/A",
          totalRows: processedData.summary.totalRows,
          totalAmount: processedData.summary.totalAmount,
          exportedFormats: [format],
          config: reportConfig,
          mappings: mappings,
          summary: processedData.summary,
        },
        user.id,
      );

      if (reportConfig.deleteAfterExport) {
        setTimeout(() => {
          setFileId("");
          setColumns([]);
          setPreviewData([]);
          setMappings([]);
          setReportId("");
          setProcessedData(null);
          setCurrentStep(0);
        }, 1000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to export report");
    } finally {
      setIsLoading(false);
    }
  };

  const allRequiredFieldsMapped = selectedTemplate.requiredFields.every((field) =>
    mappings.some((m) => m.targetField === field)
  );

  const resetReport = () => {
    setCurrentStep(0);
    setFileId("");
    setColumns([]);
    setPreviewData([]);
    setMappings([]);
    setReportId("");
    setProcessedData(null);
    setReportConfig({
      title: "",
      period: "",
      template: selectedTemplate,
      includeCharts: false,
      deleteAfterExport: getSettings().deleteAfterExport,
    });
    setError("");
  };

  const handleLogoClick = () => {
    router.push("/");
  };

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-background border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3 cursor-pointer" onClick={handleLogoClick}>
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">AutoReport</h1>
                <p className="text-xs text-muted-foreground">Automated Reporting & Data Recap System</p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <nav className="hidden md:flex items-center gap-1">
                {TABS.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        activeTab === tab.id
                          ? "bg-primary/10 text-primary dark:bg-primary/20"
                          : "text-muted-foreground hover:bg-muted/60 dark:hover:bg-muted/40"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
              <ModeToggle />
              <div className="flex items-center gap-3 pl-6 border-l border-border">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-foreground">{user?.name}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
                    {<><User className="w-3 h-3" /> User</>}
                  </p>
                </div>
                <button onClick={logout} className="p-2 text-muted-foreground hover:text-destructive transition-colors" title="Logout">
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      <div className="md:hidden bg-background border-b">
        <div className="flex overflow-x-auto">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab.id ? "text-primary border-b-2 border-primary" : "text-muted-foreground"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive">
            {error}
          </div>
        )}

        {/* Report Tab */}
        {activeTab === "report" && (
          <>
            {/* Progress Steps */}
            <div className="bg-background border border-border rounded-lg mb-6">
              <div className="px-4 sm:px-6 py-4">
                <div className="flex items-center">
                  {STEPS.map((step, index) => {
                    const Icon = step.icon;
                    const isActive = index === currentStep;
                    const isCompleted = index < currentStep;
                    return (
                      <React.Fragment key={step.id}>
                        <div className={`flex items-center gap-2 ${isActive ? "text-primary" : isCompleted ? "text-green-600 dark:text-green-400" : "text-muted-foreground"}`}>
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isActive ? "bg-primary/10" : isCompleted ? "bg-green-100 dark:bg-green-900/30" : "bg-muted"}`}>
                            {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-4 h-4" />}
                          </div>
                          <span className="text-sm font-medium hidden sm:block">{step.label}</span>
                        </div>
                        {index < STEPS.length - 1 && <ChevronRight className="w-5 h-5 text-border mx-2" />}
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Step 1: Upload */}
            {currentStep === 0 && (
              <div className="max-w-2xl mx-auto">
                <div className="bg-background rounded-xl shadow-sm border border-border p-6 mb-6">
                  <h2 className="text-2xl font-bold text-foreground mb-2">Upload Your Data</h2>
                  <p className="text-muted-foreground mb-6">
                    Start by uploading your Excel or CSV file. We&apos;ll process it on the server
                    and extract the column headers for mapping.
                  </p>
                  <FileUploadAPI onUploadComplete={handleUploadComplete} onError={handleError} />
                </div>
              </div>
            )}

            {/* Step 2: Map Columns */}
            {currentStep === 1 && (
              <div className="max-w-5xl mx-auto">
                <div className="bg-background rounded-xl shadow-sm border border-border p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-foreground">Map Columns</h2>
                      <p className="text-muted-foreground">
                        File ID: <code className="bg-muted px-1 py-0.5 rounded text-xs">{fileId}</code>
                        {previewData.length > 0 && <span className="ml-2">({previewData.length} preview rows)</span>}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => setCurrentStep(0)} className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2">
                        <ArrowLeft className="w-4 h-4" /> Back
                      </button>
                      <button
                        onClick={handleSaveMappingAndGenerate}
                        disabled={!fileId || mappings.length === 0 || isLoading}
                        className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                      >
                        {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</> : <><ArrowRight className="w-4 h-4" /> Generate Report</>}
                      </button>
                    </div>
                  </div>
                  <SavedMappings
                    template={selectedTemplate}
                    currentMappings={mappings}
                    onLoadMapping={handleMappingComplete}
                  />
                  <div className="mt-6">
                    <ColumnMapper
                      columns={columns}
                      template={selectedTemplate}
                      onMappingComplete={handleMappingComplete}
                      data={previewData}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Preview & Export */}
            {currentStep === 2 && processedData && (
              <div className="max-w-6xl mx-auto">
                <div className="bg-background rounded-xl shadow-sm border border-border p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-foreground">Report Preview</h2>
                      <p className="text-muted-foreground">
                        Report ID: <code className="bg-muted px-1 py-0.5 rounded text-xs">{reportId}</code>
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => setCurrentStep(1)} className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2">
                        <ArrowLeft className="w-4 h-4" /> Back
                      </button>
                      <button onClick={resetReport} className="px-4 py-2 text-primary hover:text-primary/80 transition-colors">
                        New Report
                      </button>
                    </div>
                  </div>
                  
                  {/* Report Config */}
                  <div className="mb-6 p-4 bg-muted rounded-lg border border-border">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1">Report Title</label>
                        <input
                          type="text"
                          value={reportConfig.title}
                          onChange={(e) => setReportConfig((prev) => ({ ...prev, title: e.target.value }))}
                          className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-ring text-foreground"
                          placeholder="Enter report title"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1">Period</label>
                        <select
                          value={reportConfig.period}
                          onChange={(e) => setReportConfig((prev) => ({ ...prev, period: e.target.value }))}
                          className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-ring text-foreground"
                        >
                          <option value="">Select Period</option>
                          <option value="Daily">Daily</option>
                          <option value="Weekly">Weekly</option>
                          <option value="Monthly">Monthly</option>
                          <option value="Yearly">Yearly</option>
                        </select>
                      </div>
                    </div>
                    <div className="mt-4">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={reportConfig.deleteAfterExport}
                          onChange={(e) => setReportConfig((prev) => ({ ...prev, deleteAfterExport: e.target.checked }))}
                          className="w-4 h-4 text-primary rounded focus:ring-ring"
                        />
                        <span className="text-sm text-foreground">Delete uploaded data after export (for privacy)</span>
                      </label>
                    </div>
                  </div>

                  {/* Export Buttons */}
                  <div className="flex gap-2 mb-6">
                    <button
                      onClick={() => handleExport("pdf")}
                      disabled={isLoading}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                    >
                      <Download className="w-4 h-4" /> Export PDF
                    </button>
                    <button
                      onClick={() => handleExport("excel")}
                      disabled={isLoading}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                    >
                      <Download className="w-4 h-4" /> Export Excel
                    </button>
                  </div>

                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg">
                      <p className="text-sm text-blue-600 font-medium">Total Records</p>
                      <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{processedData.summary.totalRows.toLocaleString()}</p>
                    </div>
                    {processedData.summary.totalAmount !== undefined && (
                      <div className="bg-green-50 dark:bg-green-950/30 p-4 rounded-lg">
                        <p className="text-sm text-green-600 font-medium">Total Amount</p>
                        <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                          {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(processedData.summary.totalAmount)}
                        </p>
                      </div>
                    )}
                    {processedData.summary.averageAmount !== undefined && (
                      <div className="bg-purple-50 dark:bg-purple-950/30 p-4 rounded-lg">
                        <p className="text-sm text-purple-600 font-medium">Average Amount</p>
                        <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                          {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(processedData.summary.averageAmount)}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Data Preview */}
                  <div className="border rounded-lg overflow-hidden">
                    <div className="bg-muted p-4 border-b">
                      <p className="font-medium">Data Preview ({processedData.rawData.length} rows)</p>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-muted border-b">
                          <tr>
                            {mappings.map((mapping, index) => (
                              <th key={index} className="px-4 py-3 text-left font-medium whitespace-nowrap">
                                {mapping.targetField}
                                <span className="block text-xs text-muted-foreground font-normal">({mapping.sourceColumn})</span>
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {processedData.rawData.slice(0, 10).map((row, rowIndex) => (
                            <tr key={rowIndex} className="hover:bg-muted/50">
                              {mappings.map((mapping, colIndex) => (
                                <td key={colIndex} className="px-4 py-3 whitespace-nowrap">
                                  {String(row[mapping.targetField] ?? "")}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Category Breakdown */}
                  {processedData.summary.categories && Object.keys(processedData.summary.categories).length > 0 && (
                    <div className="mt-6 border rounded-lg p-4">
                      <h4 className="font-semibold mb-4">Category Breakdown</h4>
                      <div className="space-y-2">
                        {Object.entries(processedData.summary.categories)
                          .sort(([, a], [, b]) => b - a)
                          .map(([category, count]) => (
                            <div key={category} className="flex items-center justify-between">
                              <span className="text-foreground">{category}</span>
                              <div className="flex items-center gap-4">
                                <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                                  <div className="h-full bg-primary rounded-full" style={{ width: `${(count / processedData.summary.totalRows) * 100}%` }} />
                                </div>
                                <span className="text-sm font-medium w-12 text-right">{count}</span>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {/* History Tab */}
        {activeTab === "history" && <ReportHistoryViewer />}

        {/* Settings Tab */}
        {activeTab === "settings" && <BackupRestore />}
      </div>

      {/* Footer */}
      <footer className="bg-background border-t mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-sm text-muted-foreground">
            Automated Reporting & Data Recap System • Built for schools, offices, and SMEs
          </p>
        </div>
      </footer>
    </main>
  );
}
