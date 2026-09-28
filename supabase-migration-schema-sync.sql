-- =========================================================================
-- Feitosa CRM: Alinhamento de Schema do Supabase (Leads e Landing Pages)
-- Execute este script no SQL Editor do seu projeto Supabase caso deseje
-- que as novas propriedades fiquem em colunas SQL nativas além do JSON.
-- =========================================================================

-- 1. Colunas adicionais na tabela `leads`
alter table if exists public.leads add column if not exists cnpj text;
alter table if exists public.leads add column if not exists valor_produtos numeric default 0;
alter table if exists public.leads add column if not exists landing_page_modelo_id text;
alter table if exists public.leads add column if not exists landing_page_mensagem text;
alter table if exists public.leads add column if not exists landing_page_views integer default 0;
alter table if exists public.leads add column if not exists landing_page_ultimo_acesso timestamptz;
alter table if exists public.leads add column if not exists metodo_envio text;
alter table if exists public.leads add column if not exists updated_at timestamptz default now();

-- 2. Colunas adicionais na tabela `landing_page_modelos`
alter table if exists public.landing_page_modelos add column if not exists tipo text default 'integrado';
alter table if exists public.landing_page_modelos add column if not exists url_externa text;
alter table if exists public.landing_page_modelos add column if not exists variaveis_flags jsonb default '["empresa","decisor","cnpj","valor","itens_tabela"]'::jsonb;

-- 3. Atualizar política RLS para permitir que usuários autenticados realizem upsert com segurança
create policy if not exists "landing_page_modelos_select_all"
on public.landing_page_modelos for select
to public using (true);

create policy if not exists "landing_page_modelos_insert_auth"
on public.landing_page_modelos for insert
to authenticated with check (true);

create policy if not exists "landing_page_modelos_update_auth"
on public.landing_page_modelos for update
to authenticated using (true);
