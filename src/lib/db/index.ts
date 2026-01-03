import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = import.meta.env.DATABASE_URL || process.env.DATABASE_URL;

if (!connectionString) {
  console.warn("DATABASE_URL not set. Database features will be unavailable.");
}

const client = connectionString ? postgres(connectionString) : null;

export const db = client ? drizzle(client, { schema }) : null;

export * from "./schema";
