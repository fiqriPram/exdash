import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { parseFile, parseRequestSchema } from "@/modules/file";
import { ERROR_MESSAGES, HTTP_STATUS } from "@/lib/constants";
import { createLogger } from "@/lib/logger";

const logger = createLogger("api:parse");

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fileId } = parseRequestSchema.parse(body);

    const result = await parseFile(fileId);

    return NextResponse.json({ preview: result.preview });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.INVALID_REQUEST_DATA, details: error.issues },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    if (error instanceof Error && error.message === ERROR_MESSAGES.FILE_NOT_FOUND) {
      return NextResponse.json(
        { error: error.message },
        { status: HTTP_STATUS.NOT_FOUND }
      );
    }

    logger.error("Parse error", error);
    return NextResponse.json(
      { error: "Failed to parse file" },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}
