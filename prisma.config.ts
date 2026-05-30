import { config } from "dotenv";
import { defineConfig } from "prisma/config";

config({ path: ".env.local" });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Conexão direta (sem pooler) para o CLI de migrations
    // O app em runtime usa o Supabase client, não o Prisma Client
    url: process.env["DIRECT_URL"]!,
  },
});
