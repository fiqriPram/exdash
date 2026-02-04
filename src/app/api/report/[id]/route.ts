import { NextRequest, NextResponse } from "next/server";
import { getReport } from "@/modules/report";
import { ERROR_MESSAGES, HTTP_STATUS } from "@/lib/constants";
import { createLogger } from "@/lib/logger";

const logger = createLogger("api:report:detail");

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const report = await getReport(id);

    if (!report) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.REPORT_NOT_FOUND },
        { status: HTTP_STATUS.NOT_FOUND }
      );
    }

    return NextResponse.json({
      report: {
        id: report.reportId,
        reportId: report.reportId,
        fileId: report.fileId,
        summary: report.summary,
        data: report.data,
        mapping: report.mapping,
        generatedAt: report.generatedAt,
      },
    });

  } catch (error) {
    logger.error("Get report error", error);
    return NextResponse.json(
      { error: "Failed to fetch report" },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}
