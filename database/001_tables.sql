-- Kiela AI · tabelas
-- Execute no Supabase: SQL Editor > New query > colar > Run.
-- Antes disso, active "Anonymous sign-ins" em Authentication > Sign In / Providers.

create extension if not exists pgcrypto;

-- Uma conversa pertence a um utilizador (anónimo ou não).
create table if not exists public.conversas (
  id           uuid primary key default gen_random_uuid(),
  utilizador_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  criada_em    timestamptz not null default now()
);

-- Mensagens da conversa (do utilizador e do assistente).
create table if not exists public.mensagens (
  id                   uuid primary key default gen_random_uuid(),
  conversa_id          uuid not null references public.conversas (id) on delete cascade,
  papel                text not null check (papel in ('utilizador', 'assistente')),
  conteudo             text not null check (char_length(conteudo) between 1 and 8000),
  fontes               jsonb not null default '[]'::jsonb,
  procurar_assistencia boolean not null default false,
  criada_em            timestamptz not null default now()
);

-- Feedback sobre as respostas ("foi útil" / "não foi útil").
-- Serve para avaliar a eficácia do agente. Um voto por pessoa e mensagem.
create table if not exists public.feedback (
  id            uuid primary key default gen_random_uuid(),
  mensagem_id   uuid not null references public.mensagens (id) on delete cascade,
  utilizador_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  util          boolean not null,
  criado_em     timestamptz not null default now(),
  unique (mensagem_id, utilizador_id)
);

create index if not exists idx_conversas_utilizador on public.conversas (utilizador_id);
create index if not exists idx_mensagens_conversa   on public.mensagens (conversa_id, criada_em);
create index if not exists idx_feedback_mensagem    on public.feedback (mensagem_id);
