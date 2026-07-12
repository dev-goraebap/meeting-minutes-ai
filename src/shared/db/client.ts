import { mkdirSync } from "node:fs";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

const DB_DIR = "./data/db";
mkdirSync(DB_DIR, { recursive: true });

const client = createClient({ url: `file:${DB_DIR}/app.db` });

export const db = drizzle(client, { schema });
