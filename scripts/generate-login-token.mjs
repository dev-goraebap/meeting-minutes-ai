// One-off script: generates a 30-char login token, stores its sha256 hash
// in the auth_tokens table, and writes the plaintext to a local tmp/ file
// (never committed, never stored in the DB) so the operator can read it once.
//
// Usage: node scripts/generate-login-token.mjs
// (uses process.env.DATABASE_URL if set — e.g. `docker run --env-file` in
// production — otherwise falls back to reading .env.local for local dev)

import { createHash, randomBytes } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import postgres from "postgres";

const repoRoot = path.resolve(fileURLToPath(new URL(".", import.meta.url)), "..");

let dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  const envContent = readFileSync(path.join(repoRoot, ".env.local"), "utf8");
  dbUrl = envContent.match(/^DATABASE_URL=(.*)$/m)?.[1]?.trim();
}
if (!dbUrl) throw new Error("DATABASE_URL을 찾을 수 없어요 (env var 또는 .env.local).");

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
