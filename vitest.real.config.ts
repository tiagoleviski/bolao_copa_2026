import { defineConfig } from "vitest/config";
import { resolve } from "path";
import dotenv from "dotenv";

// Carrega as variáveis do banco real antes de qualquer teste
dotenv.config({ path: ".env.local" });

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    include: ["src/__tests__/real-db/**/*.test.ts"],
    testTimeout: 15000, // operações de banco podem ser lentas
    hookTimeout: 15000,
    // Roda em série — evita conflitos de seed/cleanup paralelo
    singleFork: true,
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
      "server-only": resolve(
        __dirname,
        "./src/__tests__/__mocks__/server-only.ts",
      ),
    },
  },
});
