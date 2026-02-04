import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { validateFileColumns } from "@/modules/report";
import { ERROR_MESSAGES, HTTP_STATUS } from "@/lib/constants";
import { createLogger } from "@/lib/logger";

const logger = createLogger("api:validate");

const validateRequestSchema = z.object({
  fileId: z.string(),
  requiredColumns: z.array(z.string()),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fileId, requiredColumns } = validateRequestSchema.parse(body);

    const result = await validateFileColumns(fileId, requiredColumns);

    if (!result.valid) {
      return NextResponse.json(
        {
          error: "Missing required columns",
          missing: result.missing,
          available: result.available,
        },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    return NextResponse.json({
      valid: true,
      message: result.message,
      columns: result.available,
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.INVALID_REQUEST_DATA, details: error.issues },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    if (error instanceof Error && error.message === "File not found or expired") {
      return NextResponse.json(
        { error: ERROR_MESSAGES.FILE_NOT_FOUND },
        { status: HTTP_STATUS.NOT_FOUND }
      );
    }

    logger.error("Validation error", error);
    return NextResponse.json(
      { error: ERROR_MESSAGES.VALIDATION_FAILED },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}
