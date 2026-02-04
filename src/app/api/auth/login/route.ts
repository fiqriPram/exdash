import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { authenticate, setSessionCookie } from "@/modules/auth";
import { ERROR_MESSAGES, HTTP_STATUS } from "@/lib/constants";
import { createLogger } from "@/lib/logger";

const logger = createLogger("api:auth:login");

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = loginSchema.parse(body);

    const result = await authenticate({ username, password });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: result.status }
      );
    }

    // Create response with session cookie
    const response = NextResponse.json({
      success: true,
      user: result.user,
    });

    // Set session cookie
    if (result.user) {
      const { createSession } = await import("@/modules/auth");
      const session = createSession(result.user.username, result.user.name);
      setSessionCookie(response, session);
    }

    return response;

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: ERROR_MESSAGES.INVALID_REQUEST_DATA },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    logger.error("Login error", error);
    return NextResponse.json(
      { success: false, error: "Login failed" },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}
