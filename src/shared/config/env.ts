import { z } from "zod";

const envSchema = z.object({
  VITE_API_URL: z.string().url(),
  VITE_KEYCLOAK_URL: z.string().url(),
  VITE_KEYCLOAK_REALM: z.string().min(1),
  VITE_KEYCLOAK_CLIENT_ID: z.string().min(1),
});

const fallbackTestEnv = {
  VITE_API_URL: "http://localhost:3000",
  VITE_KEYCLOAK_URL: "http://localhost:8181",
  VITE_KEYCLOAK_REALM: "test",
  VITE_KEYCLOAK_CLIENT_ID: "test-client",
};

const source =
  import.meta.env.MODE === "test" ? { ...fallbackTestEnv, ...import.meta.env } : import.meta.env;

const parsed = envSchema.safeParse(source);

if (!parsed.success) {
  const missingKeys = parsed.error.issues.map((issue) => issue.path.join(".")).join(", ");
  throw new Error(
    `Invalid environment configuration. Define required Vite variables in .env: ${missingKeys}`,
  );
}

export const env = parsed.data;
