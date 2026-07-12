import { NextRequest, NextResponse } from "next/server";
import { getLatestAuthTokenHash } from "@/shared/db/queries/auth";
import { SESSION_COOKIE } from "@/shared/auth/token";

// Next.js docs recommend Proxy do an *optimistic* cookie-presence check only
// (no DB) since it runs on every request, including prefetches, and push the
// real check down into a Data Access Layer. This app is a single-user local
// demo with one Postgres SELECT to make — the simplicity of one real check
// here outweighs that scaling concern, so we verify against the DB directly.
export async function proxy(request: NextRequest) {
  const cookie = request.cookies.get(SESSION_COOKIE)?.value;
  const storedHash = await getLatestAuthTokenHash();

  if (!storedHash || cookie !== storedHash) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!login|api/auth|_next/static|_next/image|favicon.ico).*)"],
};
