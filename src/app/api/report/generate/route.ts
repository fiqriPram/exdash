import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { 
  generateReport, 
  generateRequestSchema 
} from "@/modules/report";
import { ERROR_MESSAGES, HTTP_STATUS } from "@/lib/constants";
import { createLogger } from "@/lib/logger";

const logger = createLogger("api:report:generate");

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedInput = generateRequestSchema.parse(body);

    const result = await generateReport(validatedInput);

    return NextResponse.json({
      reportId: result.reportId,
      summary: result.summary,
      data: result.data,
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.INVALID_REQUEST_DATA, details: error.issues },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    if (error instanceof Error) {
      if (error.message === "File not found or expired") {
        return NextResponse.json(
          { error: ERROR_MESSAGES.FILE_NOT_FOUND },
          { status: HTTP_STATUS.NOT_FOUND }
        );
      }
      if (error.message === "No column mapping found. Please map columns first.") {
        return NextResponse.json(
          { error: ERROR_MESSAGES.MISSING_MAPPING },
          { status: HTTP_STATUS.BAD_REQUEST }
        );
      }
    }

    logger.error("Generate report error", error);
    return NextResponse.json(
      { error: ERROR_MESSAGES.GENERATION_FAILED },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}
