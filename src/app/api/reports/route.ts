import { NextResponse } from "next/server";
import { getReportHistory } from "@/modules/report";
import { HTTP_STATUS } from "@/lib/constants";
import { createLogger } from "@/lib/logger";

const logger = createLogger("api:reports");

export async function GET() {
  try {
    const reports = await getReportHistory();

    // Map to the format expected by this endpoint
    const formattedReports = reports.map((r) => ({
      reportId: r.reportId,
      summary: r.summary,
      generatedAt: r.generatedAt,
      fileId: r.id, // This endpoint expects fileId but our service uses id as reportId
    }));

    return NextResponse.json({ reports: formattedReports });

  } catch (error) {
    logger.error("Get reports error", error);
    return NextResponse.json(
      { error: "Failed to fetch reports" },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}
