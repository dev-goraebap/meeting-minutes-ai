import { createHash, randomBytes } from "node:crypto";

export const LOGIN_TOKEN_LENGTH = 30;
export const SESSION_COOKIE = "mm_session";

// Excludes visually ambiguous characters (0/O, 1/l/I) since this token is
// meant to be typed in by hand.
const CHARSET = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";

export function generateLoginToken(): string {
  const bytes = randomBytes(LOGIN_TOKEN_LENGTH);
  let token = "";
  for (let i = 0; i < LOGIN_TOKEN_LENGTH; i++) {
    token += CHARSET[bytes[i] % CHARSET.length];
  }
  return token;
}

export function hashLoginToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}
