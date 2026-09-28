-- ==============================================================================
-- MIGRAÇÃO SUPABASE: ATUALIZAÇÃO PARA PERSISTÊNCIA DO EXTRATOR DE PDF & ITENS
-- Projeto: Feitosa CRM / Micro Automação
-- ==============================================================================
-- Esta migration adiciona à tabela public.leads as colunas necessárias para
-- persistir os dados extraídos dos PDFs de propostas (metadados, itens,
-- visualizador embutido e metadados fiscais/comerciais) e garantir que as
-- consultas e relatórios funcionem sem perda de dados entre dispositivos.
--
-- COMO APLICAR:
-- 1. Abra o painel do seu projeto no Supabase (https://supabase.com/dashboard)
-- 2. No menu lateral esquerdo, clique em "SQL Editor"
-- 3. Clique em "New query"
-- 4. Cole este script e clique no botão verde "Run"
-- ==============================================================================

-- 1. Colunas do Extrator de PDF, Proposta e Itens na tabela public.leads
ALTER TABLE IF EXISTS public.leads 
  ADD COLUMN IF NOT EXISTS orcamento_pdf_principal jsonb DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS orcamento_modo text DEFAULT 'pdf',
  ADD COLUMN IF NOT EXISTS itens jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS orcamento_anexos jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS pedidos jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS numero_pedido text DEFAULT '',
  ADD COLUMN IF NOT EXISTS obs_orcamento text DEFAULT '',
  ADD COLUMN IF NOT EXISTS condicoes text DEFAULT '',
  ADD COLUMN IF NOT EXISTS desconto numeric(14,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS frete numeric(14,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS valor numeric(14,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS classificacao text DEFAULT 'outros',
  ADD COLUMN IF NOT EXISTS cnpj text DEFAULT '',
  ADD COLUMN IF NOT EXISTS card_obs text DEFAULT '',
  ADD COLUMN IF NOT EXISTS autorizacao_pedido_id text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS autorizacao_pedido_status text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS orcamento_reset_em timestamptz DEFAULT NULL;

-- 2. Índices de performance para busca e relatórios
CREATE INDEX IF NOT EXISTS idx_leads_classificacao ON public.leads(classificacao);
CREATE INDEX IF NOT EXISTS idx_leads_etapa ON public.leads(etapa);
CREATE INDEX IF NOT EXISTS idx_leads_data_criacao ON public.leads(data_criacao);
CREATE INDEX IF NOT EXISTS idx_leads_numero_pedido ON public.leads(numero_pedido);

-- Índice GIN para consultas rápidas dentro do JSONB de itens e do PDF extraído
CREATE INDEX IF NOT EXISTS idx_leads_itens_gin ON public.leads USING gin(itens);
CREATE INDEX IF NOT EXISTS idx_leads_pdf_gin ON public.leads USING gin(orcamento_pdf_principal);

-- 3. Comentários para documentação das colunas no catálogo do Supabase
COMMENT ON COLUMN public.leads.orcamento_pdf_principal IS 'Objeto JSON com nome do arquivo, metadados extraídos (cliente, número, validade, vendedor) e preview do PDF';
COMMENT ON COLUMN public.leads.itens IS 'Array JSON com lista de produtos extraídos do PDF (código, descrição, quantidade, preço unitário, total, NCM, prazo)';
COMMENT ON COLUMN public.leads.orcamento_modo IS 'Modo de orçamento utilizado (pdf ou manual)';
COMMENT ON COLUMN public.leads.classificacao IS 'Classificação do lead (consumidor, revendedor, distribuidor, industrializacao, outros)';

-- 4. Notificação de conclusão
DO $$
BEGIN
  RAISE NOTICE 'Migration do Extrator de PDF e Itens aplicada com sucesso na tabela public.leads!';
END $$;
