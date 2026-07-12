import { desc } from "drizzle-orm";
import { db } from "@/shared/db/client";
import { authTokens } from "@/shared/db/schema";

/** The current login token's hash (most recent, if more than one was ever generated). */
export async function getLatestAuthTokenHash() {
  const [row] = await db
    .select({ tokenHash: authTokens.tokenHash })
    .from(authTokens)
    .orderBy(desc(authTokens.createdAt))
    .limit(1);

  return row?.tokenHash ?? null;
}

export async function insertAuthTokenHash(tokenHash: string) {
  await db.insert(authTokens).values({ tokenHash });
}
