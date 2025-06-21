import { z } from 'zod';

const stringArraySchema = z
  .string()
  .default('[]')
  .transform((val) => {
    const parsed: unknown = JSON.parse(val);
    if (
      !Array.isArray(parsed) ||
      !parsed.every((item) => typeof item === 'string')
    ) {
      throw new z.ZodError([
        {
          code: z.ZodIssueCode.custom,
          path: [],
          message: 'Must be a JSON array of strings',
        },
      ]);
    }
    return parsed;
  });

export const envSchema = z.object({
  HOST: z.string().default('localhost'),
  PORT: z.string().default('3000'),
  GITHUB_TOKEN: z.string().min(1, 'GITHUB_TOKEN is required'),
  OWNER: z.string().min(1, 'OWNER is required'),
  REPOSITORIES: stringArraySchema,
  CORS_ORIGINS: stringArraySchema.default('["http://localhost:5173"]'),
});

export type EnvironmentVariables = z.infer<typeof envSchema>;
