-- Kiela AI · segurança (Row Level Security)
-- A chave "anon" é pública, por isso é ESTAS políticas que protegem os dados.
-- Regra: cada pessoa só vê e escreve o que é seu. Ninguém apaga nem edita nada pela web.

alter table public.conversas enable row level security;
alter table public.mensagens enable row level security;
alter table public.feedback  enable row level security;

-- Conversas ---------------------------------------------------------------
drop policy if exists "conversas: ler as minhas"  on public.conversas;
drop policy if exists "conversas: criar a minha"  on public.conversas;
create policy "conversas: ler as minhas" on public.conversas
  for select to authenticated using (utilizador_id = auth.uid());
create policy "conversas: criar a minha" on public.conversas
  for insert to authenticated with check (utilizador_id = auth.uid());

-- Mensagens ---------------------------------------------------------------
drop policy if exists "mensagens: ler as minhas"  on public.mensagens;
drop policy if exists "mensagens: criar nas minhas" on public.mensagens;
create policy "mensagens: ler as minhas" on public.mensagens
  for select to authenticated using (
    exists (select 1 from public.conversas c where c.id = conversa_id and c.utilizador_id = auth.uid())
  );
create policy "mensagens: criar nas minhas" on public.mensagens
  for insert to authenticated with check (
    exists (select 1 from public.conversas c where c.id = conversa_id and c.utilizador_id = auth.uid())
  );

-- Feedback ----------------------------------------------------------------
drop policy if exists "feedback: ler o meu"   on public.feedback;
drop policy if exists "feedback: criar o meu" on public.feedback;
drop policy if exists "feedback: alterar o meu" on public.feedback;
create policy "feedback: ler o meu" on public.feedback
  for select to authenticated using (utilizador_id = auth.uid());
create policy "feedback: criar o meu" on public.feedback
  for insert to authenticated with check (
    utilizador_id = auth.uid()
    and exists (
      select 1 from public.mensagens m
      join public.conversas c on c.id = m.conversa_id
      where m.id = mensagem_id and c.utilizador_id = auth.uid()
    )
  );
-- Necessária porque o front usa upsert (a pessoa pode mudar de ideias).
create policy "feedback: alterar o meu" on public.feedback
  for update to authenticated using (utilizador_id = auth.uid()) with check (utilizador_id = auth.uid());

-- Para analisar os resultados do estudo, use o SQL Editor (corre com privilégios totais):
--   select util, count(*) from public.feedback group by util;
