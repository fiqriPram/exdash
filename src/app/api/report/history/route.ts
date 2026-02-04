import { NextResponse } from "next/server";
import { getReportHistory } from "@/modules/report";
import { HTTP_STATUS } from "@/lib/constants";
import { createLogger } from "@/lib/logger";

const logger = createLogger("api:report:history");

export async function GET() {
  try {
    const reports = await getReportHistory();

    return NextResponse.json({ reports });

  } catch (error) {
    logger.error("Get report history error", error);
    return NextResponse.json(
      { error: "Failed to fetch report history" },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}
