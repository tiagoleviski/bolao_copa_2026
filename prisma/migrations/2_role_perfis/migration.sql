-- Migration 2: coluna de role na tabela perfis
-- Permite controle de acesso sem depender de emails hardcoded

ALTER TABLE "perfis"
  ADD COLUMN IF NOT EXISTS "role" TEXT NOT NULL DEFAULT 'user'
  CHECK ("role" IN ('user', 'admin'));

-- Para tornar alguém admin, execute no SQL Editor do Supabase:
-- UPDATE perfis SET role = 'admin' WHERE email = 'seu@email.com';
