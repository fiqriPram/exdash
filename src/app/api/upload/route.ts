import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { uploadFile } from "@/modules/file";
import { ERROR_MESSAGES, HTTP_STATUS } from "@/lib/constants";
import { createLogger } from "@/lib/logger";

const logger = createLogger("api:upload");

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    const result = await uploadFile(file);

    return NextResponse.json({
      fileId: result.fileId,
      columns: result.columns,
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.INVALID_REQUEST_DATA, details: error.issues },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    if (error instanceof Error) {
      if (error.message === ERROR_MESSAGES.FILE_TOO_LARGE) {
        return NextResponse.json(
          { error: error.message },
          { status: HTTP_STATUS.BAD_REQUEST }
        );
      }
      if (error.message === ERROR_MESSAGES.INVALID_FILE_TYPE) {
        return NextResponse.json(
          { error: error.message },
          { status: HTTP_STATUS.BAD_REQUEST }
        );
      }
      if (error.message === "No columns found in file") {
        return NextResponse.json(
          { error: error.message },
          { status: HTTP_STATUS.BAD_REQUEST }
        );
      }
    }

    logger.error("Upload error", error);
    return NextResponse.json(
      { error: "Failed to process file upload" },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}
