import { NextRequest, NextResponse } from "next/server";
import { getLatestAuthTokenHash } from "@/shared/db/queries/auth";
import { hashLoginToken, SESSION_COOKIE } from "@/shared/auth/token";

export async function postLogin(request: NextRequest) {
  const { token } = await request.json().catch(() => ({ token: "" }));

  if (typeof token !== "string" || token.trim() === "") {
    return NextResponse.json({ error: "토큰을 입력해주세요." }, { status: 400 });
  }

  const storedHash = await getLatestAuthTokenHash();
  const inputHash = hashLoginToken(token.trim());

  if (!storedHash || inputHash !== storedHash) {
    return NextResponse.json({ error: "토큰이 올바르지 않아요." }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  // The cookie *is* the proof of auth — its value is only derivable by
  // whoever already knows the plaintext token, so no server-side session
  // store is needed for this single-credential demo app.
  response.cookies.set(SESSION_COOKIE, inputHash, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });
  return response;
}
