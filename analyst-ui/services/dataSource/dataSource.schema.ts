import { z } from "zod";
import {
  MySQLConfigSchema,
  PostgresConfigSchema,
  SnowflakeConfigSchema,
  SQLiteConfigSchema,
} from "./dataSourceConfig.schema";

export const DataSourceTypeSchema = z.enum(["postgres", "mysql", "sqlite", "snowflake"]);

export const DataSourceCreateSchema = z
  .object({
    name: z.string().min(1),
    type: DataSourceTypeSchema,
    config: PostgresConfigSchema.or(MySQLConfigSchema).or(SnowflakeConfigSchema).or(SQLiteConfigSchema),
  })
  .superRefine((data, ctx) => {
    if (data.type === "postgres") {
      const result = PostgresConfigSchema.safeParse(data.config);
      if (!result.success) {
        result.error.issues.forEach((issue) => {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Invalid Postgres config: ${issue.message}`,
            path: ["config", ...issue.path],
          });
        });
      }
    } else if (data.type === "mysql") {
      const result = MySQLConfigSchema.safeParse(data.config);
      if (!result.success) {
        result.error.issues.forEach((issue) => {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Invalid MySQL config: ${issue.message}`,
            path: ["config", ...issue.path],
          });
        });
      }
    } else if (data.type === "sqlite") {
      const result = SQLiteConfigSchema.safeParse(data.config);
      if (!result.success) {
        result.error.issues.forEach((issue) => {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Invalid SQLite config: ${issue.message}`,
            path: ["config", ...issue.path],
          });
        });
      }
    } else if (data.type === "snowflake") {
      const result = SnowflakeConfigSchema.safeParse(data.config);
      if (!result.success) {
        result.error.issues.forEach((issue) => {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Invalid Snowflake config: ${issue.message}`,
            path: ["config", ...issue.path],
          });
        });
      }
    }
  });

export const DataSourceUpdateSchema = DataSourceCreateSchema;

export const DataSourceSchema = z.object({
  id: z.number(),
  name: z.string(),
  type: DataSourceTypeSchema,
  config: PostgresConfigSchema.or(MySQLConfigSchema).or(SnowflakeConfigSchema).or(SQLiteConfigSchema),
});

export const DataSourceListResponseSchema = z.object({
  id: z.number(),
  name: z.string(),
  type: z.string(),
});

export type DataSource = z.infer<typeof DataSourceSchema>;
export type DataSourceCreate = z.infer<typeof DataSourceCreateSchema>;
export type DataSourceUpdate = z.infer<typeof DataSourceUpdateSchema>;
export type DataSourceType = z.infer<typeof DataSourceTypeSchema>;
