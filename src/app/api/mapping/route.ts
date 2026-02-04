import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { saveMapping, mappingRequestSchema } from "@/modules/report";
import { ERROR_MESSAGES, HTTP_STATUS } from "@/lib/constants";
import { createLogger } from "@/lib/logger";

const logger = createLogger("api:mapping");

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedInput = mappingRequestSchema.parse(body);

    const result = await saveMapping(validatedInput);

    return NextResponse.json(result);

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
      if (error.message.startsWith("Invalid columns:")) {
        return NextResponse.json(
          { error: error.message },
          { status: HTTP_STATUS.BAD_REQUEST }
        );
      }
    }

    logger.error("Mapping error", error);
    return NextResponse.json(
      { error: ERROR_MESSAGES.MAPPING_FAILED },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}
