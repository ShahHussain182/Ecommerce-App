import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]),
  MONGO_URL: z.string().url(),
  SESSION_SECRET: z.string().min(5),
  PORT: z.string().default("3000"),
});

export const config = envSchema.parse(process.env);
