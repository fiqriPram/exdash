import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { exportReport, exportRequestSchema } from "@/modules/report";
import { ERROR_MESSAGES, HTTP_STATUS } from "@/lib/constants";
import { createLogger } from "@/lib/logger";

const logger = createLogger("api:export");

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedInput = exportRequestSchema.parse(body);

    const result = await exportReport(validatedInput);

    return NextResponse.json(result);

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.INVALID_REQUEST_DATA, details: error.issues },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    if (error instanceof Error && error.message === "Report not found") {
      return NextResponse.json(
        { error: ERROR_MESSAGES.REPORT_NOT_FOUND },
        { status: HTTP_STATUS.NOT_FOUND }
      );
    }

    logger.error("Export error", error);
    return NextResponse.json(
      { error: ERROR_MESSAGES.EXPORT_FAILED },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}
