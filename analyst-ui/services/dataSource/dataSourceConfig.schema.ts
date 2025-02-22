import { z } from "zod";

// Helper function to trim and validate space
const trimAndValidateSpace = (value: string) => {
  const trimmed = value.trim();
  if (trimmed.includes(" ")) {
    throw new Error("Value cannot contain spaces");
  }
  return trimmed;
};

// Postgres Config
export const PostgresConfigSchema = z.object({
  host: z.string().transform(trimAndValidateSpace),
  port: z.coerce.number(),
  database: z.string().transform(trimAndValidateSpace),
  username: z.string().transform(trimAndValidateSpace),
  password: z.string().transform(trimAndValidateSpace),
  ssl_mode: z.string().default("require").optional(),
  connect_timeout: z.number().default(10).optional(),
});

// MySQL Config
export const MySQLConfigSchema = z.object({
  host: z.string().transform(trimAndValidateSpace),
  port: z.coerce.number(),
  database: z.string().transform(trimAndValidateSpace),
  username: z.string().transform(trimAndValidateSpace),
  password: z.string().transform(trimAndValidateSpace),
  ssl_ca: z.string().optional(),
  connect_timeout: z.number().default(10).optional(),
});

// Snowflake Config
export const SnowflakeConfigSchema = z.object({
  account_identifier: z.string().transform(trimAndValidateSpace),
  username: z.string().transform(trimAndValidateSpace),
  password: z.string().transform(trimAndValidateSpace),
  database: z.string().transform(trimAndValidateSpace),
  warehouse: z.string().transform(trimAndValidateSpace),
  schema: z.string().transform(trimAndValidateSpace).optional().nullable(),
  role: z.string().optional().nullable(),
});

// SQLite Config
export const SQLiteConfigSchema = z.object({
  database_path: z.string().transform(trimAndValidateSpace),
});
