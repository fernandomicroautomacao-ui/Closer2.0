-- ==============================================================================
-- MIGRAÇÃO SUPABASE: PERSISTÊNCIA COMPLETA DAS CLASSIFICAÇÕES DE LEADS
-- Projeto: Feitosa CRM / Micro Automação
-- ==============================================================================
-- Esta migration garante que a coluna 'classificacao' e os rótulos de
-- segmentação dos leads persistam perfeitamente na tabela public.leads,
-- sem serem descartados pelo cache de esquema do Supabase (PostgREST PGRST204).
--
-- RÓTULOS SUPORTADOS:
--   • 'consumidor'      -> Consumidor Final
--   • 'revendedor'      -> Revendedor / Comércio
--   • 'distribuidor'    -> Distribuidor
--   • 'industrializacao'-> Industrialização
--   • 'outros'          -> Outros
--
-- COMO APLICAR NO SUPABASE:
-- 1. Abra o painel do seu projeto no Supabase: https://supabase.com/dashboard
-- 2. No menu lateral esquerdo, clique em "SQL Editor"
-- 3. Clique em "New query"
-- 4. Cole este script e clique no botão verde "Run"
-- ==============================================================================

-- 1. Adiciona a coluna classificacao na tabela public.leads caso ainda não exista
ALTER TABLE IF EXISTS public.leads 
  ADD COLUMN IF NOT EXISTS classificacao text DEFAULT 'outros';

-- 2. Adiciona colunas complementares de metadados se necessário
ALTER TABLE IF EXISTS public.leads 
  ADD COLUMN IF NOT EXISTS cnpj text DEFAULT '',
  ADD COLUMN IF NOT EXISTS orcamento_pdf_principal jsonb DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS orcamento_modo text DEFAULT 'pdf',
  ADD COLUMN IF NOT EXISTS itens jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS orcamento_anexos jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS pedidos jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS numero_pedido text DEFAULT '',
  ADD COLUMN IF NOT EXISTS card_obs text DEFAULT '',
  ADD COLUMN IF NOT EXISTS autorizacao_pedido_id text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS autorizacao_pedido_status text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS orcamento_reset_em timestamptz DEFAULT NULL;

-- 3. Atualiza registros que porventura estejam nulos ou vazios para 'outros'
UPDATE public.leads 
SET classificacao = 'outros' 
WHERE classificacao IS NULL OR TRIM(classificacao) = '';

-- 4. Cria índice B-tree para consultas ultrarrápidas por classificação e relatórios
CREATE INDEX IF NOT EXISTS idx_leads_classificacao ON public.leads(classificacao);

-- 5. Comentário descritivo na coluna
COMMENT ON COLUMN public.leads.classificacao IS 'Rótulo de classificação do lead: consumidor, revendedor, distribuidor, industrializacao, outros';

-- 6. Recarrega o cache do PostgREST para o Supabase reconhecer a coluna imediatamente sem erro PGRST204
NOTIFY pgrst, 'reload schema';

DO $$
BEGIN
  RAISE NOTICE 'Coluna classificacao e rótulos de leads persistidos com sucesso no Supabase!';
END $$;
