import { z } from "zod";

const publicEnvironmentSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.url(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(20),
});

const serverSupabaseEnvironmentSchema = publicEnvironmentSchema.extend({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(20),
});

export type SupabaseEnvironment = z.infer<typeof publicEnvironmentSchema>;
export type ServerSupabaseEnvironment = z.infer<
  typeof serverSupabaseEnvironmentSchema
>;

export function getSupabaseEnvironment(
  environment: NodeJS.ProcessEnv = process.env,
): SupabaseEnvironment | null {
  const result = publicEnvironmentSchema.safeParse(environment);
  if (!result.success) return null;

  const isPlaceholder =
    result.data.NEXT_PUBLIC_SUPABASE_URL.includes("your-project-ref") ||
    result.data.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY === "your-publishable-key";

  return isPlaceholder ? null : result.data;
}

export function requireSupabaseEnvironment() {
  const environment = getSupabaseEnvironment();
  if (!environment) {
    throw new Error(
      "Supabase public environment variables are not configured.",
    );
  }
  return environment;
}

export function requireServerSupabaseEnvironment(
  environment: NodeJS.ProcessEnv = process.env,
): ServerSupabaseEnvironment {
  const result = serverSupabaseEnvironmentSchema.safeParse(environment);
  if (!result.success) {
    throw new Error(
      "Supabase server environment variables are not configured.",
    );
  }
  return result.data;
}

export function getSiteUrl(environment: NodeJS.ProcessEnv = process.env) {
  const candidate = environment.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const result = z.url().safeParse(candidate);
  if (!result.success) return "http://localhost:3000";
  return result.data.replace(/\/$/, "");
}
