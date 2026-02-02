"use client";

import React from "react";
import Link from "next/link";
import {
  BarChart3,
  Upload,
  Settings,
  FileText,
  Download,
  CheckCircle2,
  Clock,
  Shield,
  Zap,
  ArrowRight,
  Mail,
  Phone,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">AutoReport</h1>
              </div>
            </Link>
            <Link
              href="/dashboard"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Simplify Your Reporting,{" "}
              <span className="text-blue-600">Save Time</span>
            </h1>
            <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto">
              Upload Excel/CSV, map columns, and generate accurate PDF or Excel
              reports automatically. Perfect for schools, offices, and small
              businesses.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-semibold text-lg shadow-lg hover:shadow-xl"
              >
                Get Started
                <ArrowRight className="w-5 h-5" />
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-gray-700 border-2 border-gray-200 rounded-xl hover:border-gray-300 hover:bg-gray-50 transition-all font-semibold text-lg"
              >
                Learn More
              </a>
            </div>

            {/* Stats */}
            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <p className="text-4xl font-bold text-blue-600">70-90%</p>
                <p className="text-gray-600 mt-1">Time Saved</p>
              </div>
              <div className="text-center">
                <p className="text-4xl font-bold text-blue-600">&lt; 5 min</p>
                <p className="text-gray-600 mt-1">Report Generation</p>
              </div>
              <div className="text-center">
                <p className="text-4xl font-bold text-blue-600">100%</p>
                <p className="text-gray-600 mt-1">Error Reduction</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need for Effortless Reporting
            </h2>
            <p className="text-xl text-gray-600">
              Powerful features designed for non-technical users
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1 */}
            <div className="p-6 bg-gray-50 rounded-2xl hover:bg-blue-50 transition-colors">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Fast & Automated
              </h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                  Generate reports in under 5 minutes
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                  Automatic calculations & summaries
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                  Reduce human errors drastically
                </li>
              </ul>
            </div>

            {/* Feature 2 */}
            <div className="p-6 bg-gray-50 rounded-2xl hover:bg-blue-50 transition-colors">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                <Upload className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Easy Upload & Mapping
              </h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                  Upload .xlsx / .csv files
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                  Map your columns in a few clicks
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                  Preview data instantly
                </li>
              </ul>
            </div>

            {/* Feature 3 */}
            <div className="p-6 bg-gray-50 rounded-2xl hover:bg-blue-50 transition-colors">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                <Download className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Export & Download
              </h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                  Export reports as PDF or Excel
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                  Download instantly
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                  Optional local storage for backup
                </li>
              </ul>
            </div>

            {/* Feature 4 */}
            <div className="p-6 bg-gray-50 rounded-2xl hover:bg-blue-50 transition-colors">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Flexible Templates
              </h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                  Financial reports
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                  Attendance reports
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                  Inventory reports
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600">
              Get your first report in just 5 simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {[
              {
                step: 1,
                icon: Upload,
                title: "Upload Your File",
                desc: "Excel or CSV format",
                color: "blue",
              },
              {
                step: 2,
                icon: Settings,
                title: "Map Columns",
                desc: "Assign data columns for date, category, and amounts",
                color: "green",
              },
              {
                step: 3,
                icon: CheckCircle2,
                title: "Preview Data",
                desc: "Check for errors or missing values",
                color: "purple",
              },
              {
                step: 4,
                icon: FileText,
                title: "Generate Report",
                desc: "Automatically create PDF or Excel",
                color: "orange",
              },
              {
                step: 5,
                icon: Download,
                title: "Download & Share",
                desc: "Save or share reports instantly",
                color: "red",
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.step} className="relative">
                  <div className="bg-white p-6 rounded-2xl shadow-sm h-full">
                    <div
                      className={`w-12 h-12 bg-${item.color}-100 rounded-xl flex items-center justify-center mb-4`}
                    >
                      <Icon className={`w-6 h-6 text-${item.color}-600`} />
                    </div>
                    <div className="text-sm font-semibold text-blue-600 mb-1">
                      Step {item.step}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {item.title}
                    </h3>
                    <p className="text-sm text-gray-600">{item.desc}</p>
                  </div>
                  {item.step < 5 && (
                    <div className="hidden md:block absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                      <ArrowRight className="w-6 h-6 text-gray-300" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose AutoReport?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div className="flex items-start gap-4 p-6 bg-blue-50 rounded-2xl">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Save 70–90% of Time
                </h3>
                <p className="text-gray-600">
                  No more manual data entry and complex Excel formulas. Automate
                  your reporting workflow and focus on what matters.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-6 bg-green-50 rounded-2xl">
              <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Eliminate Calculation Errors
                </h3>
                <p className="text-gray-600">
                  Automated validation and calculations ensure 100% accuracy. No
                  more copy-paste mistakes or formula errors.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-6 bg-purple-50 rounded-2xl">
              <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <Settings className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No Complex Setup
                </h3>
                <p className="text-gray-600">
                  Runs on your browser or local server. No installation, no
                  technical expertise required. Get started in minutes.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-6 bg-orange-50 rounded-2xl">
              <div className="w-12 h-12 bg-orange-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No Subscription Needed
                </h3>
                <p className="text-gray-600">
                  One-time setup, no payment gateway or cloud-based SaaS
                  required. Your data stays on your local system.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-indigo-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Automate Your Reports?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join hundreds of schools, offices, and small businesses saving time
            with AutoReport
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 px-10 py-5 bg-white text-blue-600 rounded-xl hover:bg-gray-100 transition-all font-semibold text-lg shadow-lg"
          >
            Upload Your File Now
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white">AutoReport</h3>
              </div>
              <p className="text-sm">
                Automated Reporting & Data Recap System for schools, offices,
                and SMEs.
              </p>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-white mb-4">
                Contact / Support
              </h4>
              <div className="space-y-2">
                <a
                  href="mailto:support@yourdomain.com"
                  className="flex items-center gap-2 hover:text-white transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  support@yourdomain.com
                </a>
                <a
                  href="tel:+6281234567890"
                  className="flex items-center gap-2 hover:text-white transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  +62 812-3456-7890
                </a>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-white mb-4">
                Quick Links
              </h4>
              <div className="space-y-2">
                <Link
                  href="/dashboard"
                  className="block hover:text-white transition-colors"
                >
                  Get Started
                </Link>
                <a
                  href="#how-it-works"
                  className="block hover:text-white transition-colors"
                >
                  How It Works
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8">
            <p className="text-sm text-center">
              This system is designed for internal use, small offices, schools,
              and SMEs. It simplifies reporting without the need for payment
              gateways or cloud-based SaaS.
            </p>
            <p className="text-sm text-center mt-4 text-gray-500">
              © {new Date().getFullYear()} AutoReport. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
