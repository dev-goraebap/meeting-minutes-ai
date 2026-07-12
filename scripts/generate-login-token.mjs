// One-off script: generates a 30-char login token, stores its sha256 hash
// in the auth_tokens table, and writes the plaintext to a local tmp/ file
// (never committed, never stored in the DB) so the operator can read it once.
//
// Usage: node scripts/generate-login-token.mjs
// (reads DATABASE_URL from .env.local at the repo root)

import { createHash, randomBytes } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import postgres from "postgres";

const repoRoot = path.resolve(fileURLToPath(new URL(".", import.meta.url)), "..");

const envContent = readFileSync(path.join(repoRoot, ".env.local"), "utf8");
const dbUrl = envContent.match(/^DATABASE_URL=(.*)$/m)?.[1]?.trim();
if (!dbUrl) throw new Error(".env.local에 DATABASE_URL이 없어요.");

const CHARSET = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
const TOKEN_LENGTH = 30;

function generateToken() {
  const bytes = randomBytes(TOKEN_LENGTH);
  let token = "";
  for (let i = 0; i < TOKEN_LENGTH; i++) token += CHARSET[bytes[i] % CHARSET.length];
  return token;
}

const sql = postgres(dbUrl);
const token = generateToken();
const tokenHash = createHash("sha256").update(token).digest("hex");

await sql`insert into auth_tokens (id, token_hash) values (gen_random_uuid()::text, ${tokenHash})`;
await sql.end();

const outDir = process.env.LOGIN_TOKEN_OUT_DIR ?? path.join(repoRoot, "tmp");
mkdirSync(outDir, { recursive: true });
const outPath = path.join(outDir, "login-token.txt");
writeFileSync(
  outPath,
  `회의록 자동화 데모 로그인 토큰\n생성 시각: ${new Date().toISOString()}\n\n${token}\n`,
  "utf8",
);

console.log(`로그인 토큰을 생성해서 DB에 해시로 저장했어요.`);
console.log(`평문 토큰: ${outPath}`);
