import { fileURLToPath } from "node:url";
import { loadEnv } from "vite";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    // Carga .env.local para la prueba de RLS contra Supabase.
    env: loadEnv("test", process.cwd(), ""),
  },
});
