import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/modules/auth";
import { HTTP_STATUS } from "@/lib/constants";

export async function GET(request: NextRequest) {
  const user = await getCurrentUser(request);

  if (!user) {
    return NextResponse.json(
      { authenticated: false },
      { status: HTTP_STATUS.UNAUTHORIZED }
    );
  }

  return NextResponse.json({
    authenticated: true,
    user,
  });
}
