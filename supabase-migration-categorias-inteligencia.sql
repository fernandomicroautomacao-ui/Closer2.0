-- ============================================================================
-- MIGRAÇÃO V4: CATEGORIAS HIERÁRQUICAS DE PRODUTOS E INTELIGÊNCIA COMERCIAL
-- ============================================================================

-- 1. Categorias Principais
CREATE TABLE IF NOT EXISTS product_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    descricao TEXT,
    icone TEXT DEFAULT 'box',
    clientes_alvo TEXT[] DEFAULT '{}',
    cnaes_relacionados TEXT[] DEFAULT '{}',
    segmentos_relacionados TEXT[] DEFAULT '{}',
    palavras_chave TEXT[] DEFAULT '{}',
    ordem INTEGER DEFAULT 0,
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Subcategorias
CREATE TABLE IF NOT EXISTS product_subcategories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    categoria_id UUID NOT NULL REFERENCES product_categories(id) ON DELETE CASCADE,
    nome TEXT NOT NULL,
    descricao TEXT,
    clientes_alvo TEXT[] DEFAULT '{}',
    palavras_chave TEXT[] DEFAULT '{}',
    ordem INTEGER DEFAULT 0,
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Subsubcategorias
CREATE TABLE IF NOT EXISTS product_subsubcategories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subcategoria_id UUID NOT NULL REFERENCES product_subcategories(id) ON DELETE CASCADE,
    nome TEXT NOT NULL,
    descricao TEXT,
    clientes_alvo TEXT[] DEFAULT '{}',
    palavras_chave TEXT[] DEFAULT '{}',
    ordem INTEGER DEFAULT 0,
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Produtos
CREATE TABLE IF NOT EXISTS products_catalog (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subsubcategoria_id UUID NOT NULL REFERENCES product_subsubcategories(id) ON DELETE CASCADE,
    nome TEXT NOT NULL,
    codigo TEXT,
    descricao TEXT,
    especificacoes JSONB DEFAULT '{}',
    preco_base NUMERIC(15,2) DEFAULT 0,
    unidade TEXT DEFAULT 'UN',
    clientes_alvo TEXT[] DEFAULT '{}',
    palavras_chave TEXT[] DEFAULT '{}',
    aplicacoes_industriais TEXT[] DEFAULT '{}',
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Classificação Estratégica e Inteligência da Empresa (Campos complementares)
ALTER TABLE empresas 
ADD COLUMN IF NOT EXISTS segmento_atuacao TEXT,
ADD COLUMN IF NOT EXISTS cnae_principal TEXT,
ADD COLUMN IF NOT EXISTS cnaes_secundarios TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS tipo_industria TEXT,
ADD COLUMN IF NOT EXISTS mercado_atendido TEXT,
ADD COLUMN IF NOT EXISTS processo_produtivo TEXT,
ADD COLUMN IF NOT EXISTS produtos_fabricados TEXT,
ADD COLUMN IF NOT EXISTS classificacao_estrategica TEXT,
ADD COLUMN IF NOT EXISTS perfil_comercial TEXT;

-- 6. Recomendações e Aprendizado Comercial por Empresa
CREATE TABLE IF NOT EXISTS company_product_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    produto_id UUID REFERENCES products_catalog(id) ON DELETE CASCADE,
    categoria_id UUID REFERENCES product_categories(id) ON DELETE CASCADE,
    score_compatibilidade NUMERIC(5,2) DEFAULT 0,
    nivel_potencial TEXT DEFAULT 'MEDIO', -- MUITO ALTO, ALTO, MEDIO, BAIXO
    justificativa TEXT,
    status TEXT DEFAULT 'recomendado', -- recomendado, apresentado, interesse, convertido, descartado
    oportunidade_id UUID REFERENCES oportunidades(id) ON DELETE SET NULL,
    observacoes TEXT,
    concorrente_identificado TEXT,
    interagido_por TEXT,
    interagido_em TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Histórico de Aprendizado Comercial (Eventos de Feedback)
CREATE TABLE IF NOT EXISTS commercial_learning_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    produto_id UUID REFERENCES products_catalog(id) ON DELETE CASCADE,
    categoria_id UUID REFERENCES product_categories(id) ON DELETE CASCADE,
    tipo_evento TEXT NOT NULL, -- visualizado, apresentado, interesse, convertido, descartado
    cnae_empresa TEXT,
    segmento_empresa TEXT,
    metadados JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para alta performance em buscas e recomendações
CREATE INDEX IF NOT EXISTS idx_subcat_categoria ON product_subcategories(categoria_id);
CREATE INDEX IF NOT EXISTS idx_subsubcat_subcat ON product_subsubcategories(subcategoria_id);
CREATE INDEX IF NOT EXISTS idx_prod_subsubcat ON products_catalog(subsubcategoria_id);
CREATE INDEX IF NOT EXISTS idx_rec_empresa ON company_product_recommendations(empresa_id);
CREATE INDEX IF NOT EXISTS idx_rec_produto ON company_product_recommendations(produto_id);
