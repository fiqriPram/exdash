"use client";

import React, { useState } from "react";
import {
  FileText,
  Settings,
  BarChart3,
  ChevronRight,
  CheckCircle2,
  LogOut,
  User,
  Shield,
  History,
  Database,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import FileUpload from "@/components/FileUpload";
import ColumnMapper from "@/components/ColumnMapper";
import ReportViewer from "@/components/ReportViewer";
import ReportHistoryViewer from "@/components/ReportHistoryViewer";
import BackupRestore from "@/components/BackupRestore";
import UserManagement from "@/components/UserManagement";
import SavedMappings from "@/components/SavedMappings";
import LoginPage from "@/components/LoginPage";
import {
  DataRow,
  ColumnMapping,
  ReportTemplate,
  ProcessedData,
  ReportConfig,
  REPORT_TEMPLATES,
} from "@/types";
import { processData } from "@/utils/dataParser";
import { useAuth } from "@/contexts/AuthContext";
import { addReportToHistory, getSettings } from "@/utils/storage";
import { ModeToggle } from "@/components/mode-toggle";

const TABS = [
  { id: "report", label: "New Report", icon: FileText },
  { id: "history", label: "History", icon: History },
  { id: "settings", label: "Settings", icon: Database },
  { id: "admin", label: "Admin", icon: Users, adminOnly: true },
];

const STEPS = [
  { id: "upload", label: "Upload Data", icon: FileText },
  { id: "map", label: "Map Columns", icon: Settings },
  { id: "preview", label: "Preview & Export", icon: BarChart3 },
];

export default function Dashboard() {
  const { isAuthenticated, user, isAdmin, logout } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("report");
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<DataRow[]>([]);
  const [fileName, setFileName] = useState<string>("");
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate>(
    REPORT_TEMPLATES[0],
  );
  const [mappings, setMappings] = useState<ColumnMapping[]>([]);
  const [processedData, setProcessedData] = useState<ProcessedData | null>(
    null,
  );
  const [reportConfig, setReportConfig] = useState<ReportConfig>({
    title: "",
    period: "",
    template: REPORT_TEMPLATES[0],
    includeCharts: false,
    deleteAfterExport: getSettings().deleteAfterExport,
  });
  const [error, setError] = useState<string>("");

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const handleDataLoaded = (loadedData: DataRow[], name: string) => {
    setData(loadedData);
    setFileName(name);
    setError("");
    setCurrentStep(1);
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
  };

  const handleMappingComplete = (newMappings: ColumnMapping[]) => {
    setMappings(newMappings);
  };

  const handleGenerateReport = () => {
    if (mappings.length === 0) {
      setError("Please configure column mappings first");
      return;
    }

    const processed = processData(data, mappings);
    setProcessedData(processed);

    const title =
      reportConfig.title || `${selectedTemplate.name} - ${fileName}`;
    setReportConfig((prev) => ({
      ...prev,
      title,
      template: selectedTemplate,
    }));

    setCurrentStep(2);
    setError("");
  };

  const handleExport = (format: "pdf" | "excel") => {
    if (!processedData || !user) return;

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
        setData([]);
        setProcessedData(null);
        setMappings([]);
        setFileName("");
      }, 1000);
    }
  };

  const allRequiredFieldsMapped = selectedTemplate.requiredFields.every(
    (field) => mappings.some((m) => m.targetField === field),
  );

  const resetReport = () => {
    setCurrentStep(0);
    setData([]);
    setMappings([]);
    setProcessedData(null);
    setFileName("");
    setReportConfig({
      title: "",
      period: "",
      template: selectedTemplate,
      includeCharts: false,
      deleteAfterExport: getSettings().deleteAfterExport,
    });
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
            <div
              className="flex items-center gap-3 cursor-pointer"
              onClick={handleLogoClick}
            >
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">
                  AutoReport
                </h1>
                <p className="text-xs text-muted-foreground">
                  Automated Reporting & Data Recap System
                </p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              {/* Navigation Tabs */}
              <nav className="hidden md:flex items-center gap-1">
                {TABS.filter((tab) => !tab.adminOnly || isAdmin).map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        activeTab === tab.id
                          ? "bg-primary/10 text-primary dark:bg-primary/20"
                          : "text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>

              {/* Theme Toggle */}
              <div className="flex items-center">
                <ModeToggle />
              </div>

              {/* User Menu */}
              <div className="flex items-center gap-3 pl-6 border-l border-border">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-foreground">
                    {user?.name}
                  </p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
                    {isAdmin ? (
                      <>
                        <Shield className="w-3 h-3" /> Admin
                      </>
                    ) : (
                      <>
                        <User className="w-3 h-3" /> User
                      </>
                    )}
                  </p>
                </div>
                <button
                  onClick={logout}
                  className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                  title="Logout"
                >
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
          {TABS.filter((tab) => !tab.adminOnly || isAdmin).map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? "text-primary border-b-2 border-primary"
                    : "text-muted-foreground"
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
                        <div
                          className={`flex items-center gap-2 ${isActive ? "text-primary" : isCompleted ? "text-green-600 dark:text-green-400" : "text-muted-foreground"}`}
                        >
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center ${isActive ? "bg-primary/10" : isCompleted ? "bg-green-100 dark:bg-green-900/30" : "bg-muted"}`}
                          >
                            {isCompleted ? (
                              <CheckCircle2 className="w-5 h-5" />
                            ) : (
                              <Icon className="w-4 h-4" />
                            )}
                          </div>
                          <span className="text-sm font-medium hidden sm:block">
                            {step.label}
                          </span>
                        </div>
                        {index < STEPS.length - 1 && (
                          <ChevronRight className="w-5 h-5 text-border mx-2" />
                        )}
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
                  <h2 className="text-2xl font-bold text-foreground mb-2">
                    Upload Your Data
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    Start by uploading your Excel or CSV file. We&apos;ll
                    automatically detect the structure and help you map the
                    columns.
                  </p>
                  <FileUpload
                    onDataLoaded={handleDataLoaded}
                    onError={handleError}
                  />
                </div>
                <div className="bg-background rounded-xl shadow-sm border border-border p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">
                    Select Report Template
                  </h3>
                  <div className="space-y-3">
                    {REPORT_TEMPLATES.map((template) => (
                      <label
                        key={template.id}
                        className={`flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          selectedTemplate.id === template.id
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-muted-foreground"
                        }`}
                      >
                        <input
                          type="radio"
                          name="template"
                          value={template.id}
                          checked={selectedTemplate.id === template.id}
                          onChange={() => setSelectedTemplate(template)}
                          className="mt-1 w-4 h-4 text-primary"
                        />
                        <div>
                          <p className="font-semibold text-foreground">
                            {template.name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {template.description}
                          </p>
                          <div className="mt-2 flex flex-wrap gap-1">
                            {template.requiredFields.map((field) => (
                              <span
                                key={field}
                                className="px-2 py-0.5 bg-destructive/10 text-destructive text-xs rounded"
                              >
                                {field} *
                              </span>
                            ))}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Map Columns */}
            {currentStep === 1 && (
              <div className="max-w-5xl mx-auto">
                <div className="bg-background rounded-xl shadow-sm border border-border p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-foreground">
                        Map Columns
                      </h2>
                      <p className="text-muted-foreground">
                        File: <span className="font-medium">{fileName}</span> (
                        {data.length.toLocaleString()} rows)
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setCurrentStep(0)}
                        className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        Back
                      </button>
                      <button
                        onClick={handleGenerateReport}
                        disabled={!allRequiredFieldsMapped}
                        className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Generate Report
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
                      columns={Object.keys(data[0] || {})}
                      template={selectedTemplate}
                      onMappingComplete={handleMappingComplete}
                      data={data}
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
                      <h2 className="text-2xl font-bold text-foreground">
                        Report Preview
                      </h2>
                      <p className="text-muted-foreground">
                        Review your report and export it in your preferred
                        format
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setCurrentStep(1)}
                        className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        Back
                      </button>
                      <button
                        onClick={resetReport}
                        className="px-4 py-2 text-primary hover:text-primary/80 transition-colors"
                      >
                        New Report
                      </button>
                    </div>
                  </div>
                  <div className="mb-6 p-4 bg-muted rounded-lg border border-border">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1">
                          Report Title
                        </label>
                        <input
                          type="text"
                          value={reportConfig.title}
                          onChange={(e) =>
                            setReportConfig((prev) => ({
                              ...prev,
                              title: e.target.value,
                            }))
                          }
                          className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-ring text-foreground"
                          placeholder="Enter report title"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1">
                          Period
                        </label>
                        <select
                          value={reportConfig.period}
                          onChange={(e) =>
                            setReportConfig((prev) => ({
                              ...prev,
                              period: e.target.value,
                            }))
                          }
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
                          onChange={(e) =>
                            setReportConfig((prev) => ({
                              ...prev,
                              deleteAfterExport: e.target.checked,
                            }))
                          }
                          className="w-4 h-4 text-primary rounded focus:ring-ring"
                        />
                        <span className="text-sm text-foreground">
                          Delete uploaded data after export (for privacy)
                        </span>
                      </label>
                    </div>
                  </div>
                  <ReportViewer
                    processedData={processedData}
                    config={reportConfig}
                    template={selectedTemplate}
                    onExport={handleExport}
                  />
                </div>
              </div>
            )}
          </>
        )}

        {/* History Tab */}
        {activeTab === "history" && <ReportHistoryViewer />}

        {/* Settings Tab */}
        {activeTab === "settings" && <BackupRestore />}

        {/* Admin Tab */}
        {activeTab === "admin" && isAdmin && <UserManagement />}
      </div>

      {/* Footer */}
      <footer className="bg-background border-t mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-sm text-muted-foreground">
            Automated Reporting & Data Recap System • Built for schools,
            offices, and SMEs
          </p>
        </div>
      </footer>
    </main>
  );
}
