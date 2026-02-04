/**
 * Authentication service
 */
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { 
  VALID_CREDENTIALS, 
  SESSION_COOKIE_NAME, 
  SESSION_MAX_AGE,
  ERROR_MESSAGES,
  HTTP_STATUS 
} from "@/lib/constants";
import { createLogger } from "@/lib/logger";

const logger = createLogger("auth:service");

export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export interface Session {
  user: {
    id: string;
    username: string;
    name: string;
  };
  loggedInAt: string;
}

export interface AuthResult {
  success: boolean;
  user?: Session["user"];
  error?: string;
  status: number;
}

/**
 * Validate user credentials
 */
export function validateCredentials(username: string, password: string): boolean {
  return username === VALID_CREDENTIALS.username && password === VALID_CREDENTIALS.password;
}

/**
 * Create a new session
 */
export function createSession(username: string, name: string): Session {
  return {
    user: {
      id: "single-user",
      username,
      name,
    },
    loggedInAt: new Date().toISOString(),
  };
}

/**
 * Authenticate user and return result
 */
export async function authenticate(input: LoginInput): Promise<AuthResult> {
  try {
    const { username, password } = loginSchema.parse(input);

    if (!validateCredentials(username, password)) {
      logger.warn("Authentication failed", { username });
      return {
        success: false,
        error: ERROR_MESSAGES.INVALID_CREDENTIALS,
        status: HTTP_STATUS.UNAUTHORIZED,
      };
    }

    const session = createSession(VALID_CREDENTIALS.username, VALID_CREDENTIALS.name);
    
    logger.info("User authenticated successfully", { username: session.user.username });

    return {
      success: true,
      user: session.user,
      status: HTTP_STATUS.OK,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.warn("Invalid login request data", { errors: error.issues });
      return {
        success: false,
        error: ERROR_MESSAGES.INVALID_REQUEST_DATA,
        status: HTTP_STATUS.BAD_REQUEST,
      };
    }

    logger.error("Authentication error", error);
    return {
      success: false,
      error: "Login failed",
      status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
    };
  }
}

/**
 * Get session from request cookies
 */
export async function getSessionFromRequest(request: Request): Promise<Session | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);

  if (!sessionCookie) {
    return null;
  }

  try {
    return JSON.parse(sessionCookie.value) as Session;
  } catch {
    return null;
  }
}

/**
 * Get current user from request
 */
export async function getCurrentUser(request: Request): Promise<Session["user"] | null> {
  const session = await getSessionFromRequest(request);
  return session?.user ?? null;
}

/**
 * Set session cookie on response
 */
export function setSessionCookie(response: NextResponse, session: Session): void {
  response.cookies.set(SESSION_COOKIE_NAME, JSON.stringify(session), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
  });
}

/**
 * Clear session cookie
 */
export function clearSessionCookie(response: NextResponse): void {
  response.cookies.delete(SESSION_COOKIE_NAME);
}
