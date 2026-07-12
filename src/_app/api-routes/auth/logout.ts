import { NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/shared/auth/token";

export async function postLogout() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete(SESSION_COOKIE);
  return response;
}
