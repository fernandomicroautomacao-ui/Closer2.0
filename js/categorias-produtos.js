/**
 * Módulo de Categorias de Produtos Hierárquicas & Inteligência de Segmentação Comercial
 * Hierarquia: Categoria -> Subcategoria -> Subsubcategoria -> Produtos
 */

(function(window) {
    'use strict';

    const CategoriasProdutos = {
        dados: {
            categorias: [],
            subcategorias: [],
            subsubcategorias: [],
            produtos: [],
            recomendacoes: [],
            eventosAprendizado: []
        },

        filtroAtual: {
            busca: '',
            categoriaId: '',
            subcategoriaId: '',
            subsubcategoriaId: '',
            clienteAlvo: ''
        },

        init() {
            this.carregarDados();
            this.renderizarPainel();
            this.vincularEventos();
            console.log('Módulo de Categorias de Produtos & Inteligência inicializado.');
        },

        carregarDados() {
            const salvo = localStorage.getItem('crm_catalogo_hierarquico');
            if (salvo) {
                try {
                    this.dados = JSON.parse(salvo);
                } catch(e) {
                    console.error('Erro ao ler dados de categorias:', e);
                }
            }

            // Se não houver dados, inicializar com a base demonstrativa completa solicitada no prompt
            if (!this.dados.categorias || this.dados.categorias.length === 0) {
                this.inicializarDadosPadrao();
            }
        },

        salvarDados() {
            localStorage.setItem('crm_catalogo_hierarquico', JSON.stringify(this.dados));
        },

        inicializarDadosPadrao() {
            const catPneumaticaId = 'cat-pneumatica-01';
            const catVacuoId = 'cat-vacuo-02';
            const catSensoresId = 'cat-sensores-03';

            // 1. Categorias
            this.dados.categorias = [
                {
                    id: catPneumaticaId,
                    nome: 'Automação Pneumática',
                    descricao: 'Equipamentos e sistemas acionados por ar comprimido para movimentação industrial.',
                    icone: 'zap',
                    clientesAlvo: [
                        'Fabricantes de máquinas especiais',
                        'Fabricantes de máquinas de embalagem',
                        'Fabricantes de máquinas de envase',
                        'Indústria automotiva',
                        'Metalúrgicas',
                        'Indústria alimentícia'
                    ],
                    cnaesRelacionados: ['28.29-1', '28.69-1', '29.10-7', '10.81-3'],
                    segmentosRelacionados: ['Máquinas e Equipamentos', 'Embalagem', 'Automotivo', 'Alimentício'],
                    palavrasChave: ['embalagem', 'envase', 'máquina', 'automação', 'montagem', 'ar comprimido', 'cilindro', 'movimentação'],
                    ordem: 1,
                    ativo: true
                },
                {
                    id: catVacuoId,
                    nome: 'Automação por Vácuo',
                    descricao: 'Tecnologia de sucção e manuseio delicado para paletização, cartonagem e pick-and-place.',
                    icone: 'layers',
                    clientesAlvo: [
                        'Fabricantes de máquinas de embalagem',
                        'Indústria de cartonagem',
                        'Indústria alimentícia',
                        'Indústria farmacêutica',
                        'Integradores de robótica e paletização'
                    ],
                    cnaesRelacionados: ['28.29-1', '17.31-1', '21.21-1'],
                    segmentosRelacionados: ['Embalagem e Cartonagem', 'Farmacêutico', 'Robótica Industrial'],
                    palavrasChave: ['vácuo', 'ventosa', 'pega', 'paletizadora', 'encartuchadora', 'manipulação'],
                    ordem: 2,
                    ativo: true
                },
                {
                    id: catSensoresId,
                    nome: 'Sensoriamento Industrial',
                    descricao: 'Sensores de proximidade, indutivo, fotoelétrico e magnético para automação.',
                    icone: 'eye',
                    clientesAlvo: [
                        'Fabricantes de máquinas especiais',
                        'Empresas de manutenção industrial',
                        'Integradores de automação',
                        'Indústria alimentícia'
                    ],
                    cnaesRelacionados: ['28.29-1', '33.21-0', '26.51-5'],
                    segmentosRelacionados: ['Montagem de Máquinas', 'Manutenção Industrial', 'Controle de Processo'],
                    palavrasChave: ['sensor', 'detecção', 'magnético', 'posição', 'presença', 'indutivo'],
                    ordem: 3,
                    ativo: true
                }
            ];

            // 2. Subcategorias
            const subAtuadoresId = 'sub-atuadores-01';
            const subValvulasId = 'sub-valvulas-02';
            const subTratamentoArId = 'sub-tratamento-03';
            const subVentosasId = 'sub-ventosas-04';

            this.dados.subcategorias = [
                {
                    id: subAtuadoresId,
                    categoriaId: catPneumaticaId,
                    nome: 'Atuadores Pneumáticos',
                    descricao: 'Cilindros e acionadores mecânicos operados por ar.',
                    clientesAlvo: ['Fabricantes de máquinas especiais', 'Fabricantes de máquinas de embalagem', 'Metalúrgicas'],
                    palavrasChave: ['cilindro', 'haste', 'movimento linear', 'prensa', 'avanço'],
                    ordem: 1,
                    ativo: true
                },
                {
                    id: subValvulasId,
                    categoriaId: catPneumaticaId,
                    nome: 'Válvulas Pneumáticas',
                    descricao: 'Direcionais, estranguladoras, ilhas de válvulas com barramento de campo.',
                    clientesAlvo: ['Fabricantes de máquinas de envase', 'Indústria de processos', 'Integradores'],
                    palavrasChave: ['solenoide', 'piloto', 'ilha', 'distribuição', 'fluxo'],
                    ordem: 2,
                    ativo: true
                },
                {
                    id: subTratamentoArId,
                    categoriaId: catPneumaticaId,
                    nome: 'Tratamento de Ar (FRL)',
                    descricao: 'Filtros, reguladores de pressão e lubrificadores.',
                    clientesAlvo: ['Empresas de manutenção industrial', 'Fabricantes de máquinas', 'Indústria automotiva'],
                    palavrasChave: ['frl', 'filtro', 'regulador', 'lubrificador', 'purga'],
                    ordem: 3,
                    ativo: true
                },
                {
                    id: subVentosasId,
                    categoriaId: catVacuoId,
                    nome: 'Ventosas e Ejetores',
                    descricao: 'Componentes de sucção e geração de vácuo tipo Venturi.',
                    clientesAlvo: ['Fabricantes de máquinas de embalagem', 'Indústria de cartonagem'],
                    palavrasChave: ['ventosa', 'fole', 'silicone', 'sucção', 'ejetor'],
                    ordem: 1,
                    ativo: true
                }
            ];

            // 3. Subsubcategorias
            const subsubCilindrosISO = 'subsub-cil-iso-01';
            const subsubCilCompactos = 'subsub-cil-comp-02';
            const subsubIlhasValvulas = 'subsub-ilhas-03';
            const subsubFRL = 'subsub-frl-04';

            this.dados.subsubcategorias = [
                {
                    id: subsubCilindrosISO,
                    subcategoriaId: subAtuadoresId,
                    nome: 'Cilindros ISO (15552 / 6431)',
                    descricao: 'Cilindros normalizados com tirantes e perfil limpo.',
                    clientesAlvo: ['Fabricantes de máquinas especiais', 'Metalúrgicas', 'Linhas de montagem'],
                    palavrasChave: ['iso', '15552', 'tirantes', 'curso longo', 'robusto'],
                    ordem: 1,
                    ativo: true
                },
                {
                    id: subsubCilCompactos,
                    subcategoriaId: subAtuadoresId,
                    nome: 'Cilindros Compactos (ISO 21287)',
                    descricao: 'Cilindros de curso curto com economia de espaço.',
                    clientesAlvo: ['Fabricantes de máquinas de embalagem', 'Montagens eletrônicas'],
                    palavrasChave: ['compacto', 'espaço reduzido', 'bloqueio', 'clamp'],
                    ordem: 2,
                    ativo: true
                },
                {
                    id: subsubIlhasValvulas,
                    subcategoriaId: subValvulasId,
                    nome: 'Ilhas de Válvulas Modulares',
                    descricao: 'Blocos integrados com acionamento multipol e protocolos industriais.',
                    clientesAlvo: ['Fabricantes de máquinas de envase', 'Linhas de alta cadência'],
                    palavrasChave: ['profibus', 'ethernet/ip', 'io-link', 'bloco'],
                    ordem: 1,
                    ativo: true
                },
                {
                    id: subsubFRL,
                    subcategoriaId: subTratamentoArId,
                    nome: 'Unidades Preparadoras FRL',
                    descricao: 'Sistemas combinados de filtragem e regulação.',
                    clientesAlvo: ['Manutenção industrial', 'Instalação de compressores'],
                    palavrasChave: ['manômetro', 'coalescente', 'dreno automático'],
                    ordem: 1,
                    ativo: true
                }
            ];

            // 4. Produtos no nível direto
            this.dados.produtos = [
                {
                    id: 'prod-01',
                    subsubcategoriaId: subsubCilindrosISO,
                    nome: 'Cilindro ISO 15552 Diâmetro 63mm Curso 200mm',
                    codigo: 'ISO-063-0200',
                    descricao: 'Cilindro de dupla ação amortecido, com êmbolo magnético integrado para sensores de proximidade.',
                    precoBase: 485.00,
                    unidade: 'UN',
                    clientesAlvo: ['Fabricantes de máquinas especiais', 'Metalúrgicas', 'Indústria automotiva'],
                    palavrasChave: ['cilindro iso', 'dupla ação', 'magnético', 'alta durabilidade'],
                    aplicacoesIndustriais: ['Avanço de prensas leves', 'Alimentadores de peças', 'Portas de enclausuramento'],
                    ativo: true
                },
                {
                    id: 'prod-02',
                    subsubcategoriaId: subsubCilCompactos,
                    nome: 'Cilindro Compacto ISO 21287 Diâm. 32mm Curso 25mm',
                    codigo: 'CMP-032-0025',
                    descricao: 'Ideal para máquinas de embalagem e encaixotamento com espaço limitado.',
                    precoBase: 195.00,
                    unidade: 'UN',
                    clientesAlvo: ['Fabricantes de máquinas de embalagem', 'Indústria farmacêutica'],
                    palavrasChave: ['compacto', 'encaixotamento', 'dobradeira'],
                    aplicacoesIndustriais: ['Dobra de abas de caixas', 'Fixação de frascos', 'Empurradores'],
                    ativo: true
                },
                {
                    id: 'prod-03',
                    subsubcategoriaId: subsubIlhasValvulas,
                    nome: 'Ilha de Válvulas Plug-in 8 Vias com Comunicação IO-Link',
                    codigo: 'ILH-8V-IOL',
                    descricao: 'Sistema flexível para máquinas de envase e esteiras automáticas com diagnóstico de ciclo.',
                    precoBase: 2450.00,
                    unidade: 'UN',
                    clientesAlvo: ['Fabricantes de máquinas de envase', 'Indústria de bebidas', 'Indústria alimentícia'],
                    palavrasChave: ['envase', 'io-link', 'alta velocidade', 'alimentício'],
                    aplicacoesIndustriais: ['Bicos dosadores', 'Rotulagem contínua', 'Separação de garrafas'],
                    ativo: true
                },
                {
                    id: 'prod-04',
                    subsubcategoriaId: subsubFRL,
                    nome: 'Conjunto de Preparação de Ar FRL 1/2" com Dreno Automático',
                    codigo: 'FRL-012-AUTO',
                    descricao: 'Proteção essencial contra umidade e partículas sólidas na rede de ar.',
                    precoBase: 380.00,
                    unidade: 'UN',
                    clientesAlvo: ['Empresas de manutenção industrial', 'Fabricantes de máquinas'],
                    palavrasChave: ['tratamento de ar', 'qualidade do ar', 'manutenção'],
                    aplicacoesIndustriais: ['Entrada de ar de máquinas', 'Cabines de pintura'],
                    ativo: true
                }
            ];

            this.salvarDados();
        },

        // Renderiza a tela principal de gestão de categorias
        renderizarPainel() {
            const container = document.getElementById('section-categorias-produtos');
            if (!container) return;

            const totalCategorias = this.dados.categorias.length;
            const totalSubcategorias = this.dados.subcategorias.length;
            const totalSubsub = this.dados.subsubcategorias.length;
            const totalProdutos = this.dados.produtos.length;

            container.innerHTML = `
                <div class="section-header" style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:1rem; margin-bottom:1.5rem;">
                    <div>
                        <div style="display:flex; align-items:center; gap:0.5rem;">
                            <span style="font-size:1.5rem;">🏷️</span>
                            <h2 style="margin:0; font-size:1.5rem; font-weight:700; color:#1e293b;">Categorias de Produtos & Segmentação Comercial</h2>
                        </div>
                        <p style="margin:0.35rem 0 0 0; color:#64748b; font-size:0.92rem;">
                            Estrutura hierárquica em 4 níveis (Categoria ➔ Subcategoria ➔ Subsubcategoria ➔ Produtos) com clientes-alvo estratégicos e aprendizado comercial.
                        </p>
                    </div>
                    <div style="display:flex; gap:0.5rem; flex-wrap:wrap;">
                        <button class="btn btn-primary" id="btn-nova-categoria" style="display:flex; align-items:center; gap:0.4rem; padding:0.5rem 1rem;">
                            <span>➕</span> Nova Categoria
                        </button>
                        <button class="btn btn-secondary" id="btn-novo-produto" style="display:flex; align-items:center; gap:0.4rem; padding:0.5rem 1rem;">
                            <span>📦</span> Novo Produto
                        </button>
                        <button class="btn btn-outline" id="btn-regras-compatibilidade" style="display:flex; align-items:center; gap:0.4rem; padding:0.5rem 1rem;">
                            <span>🎯</span> Painel de Clientes-Alvo
                        </button>
                    </div>
                </div>

                <!-- Métricas do Catálogo -->
                <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:1rem; margin-bottom:1.5rem;">
                    <div class="card" style="padding:1rem; border-left:4px solid #3b82f6; background:#ffffff;">
                        <span style="font-size:0.8rem; color:#64748b; font-weight:600; text-transform:uppercase;">Nível 1 • Categorias</span>
                        <div style="font-size:1.75rem; font-weight:700; color:#1e293b; margin-top:0.25rem;">${totalCategorias}</div>
                        <div style="font-size:0.75rem; color:#3b82f6;">Áreas mestras de tecnologia</div>
                    </div>
                    <div class="card" style="padding:1rem; border-left:4px solid #10b981; background:#ffffff;">
                        <span style="font-size:0.8rem; color:#64748b; font-weight:600; text-transform:uppercase;">Nível 2 • Subcategorias</span>
                        <div style="font-size:1.75rem; font-weight:700; color:#1e293b; margin-top:0.25rem;">${totalSubcategorias}</div>
                        <div style="font-size:0.75rem; color:#10b981;">Grupos funcionais</div>
                    </div>
                    <div class="card" style="padding:1rem; border-left:4px solid #8b5cf6; background:#ffffff;">
                        <span style="font-size:0.8rem; color:#64748b; font-weight:600; text-transform:uppercase;">Nível 3 • Subsubcategorias</span>
                        <div style="font-size:1.75rem; font-weight:700; color:#1e293b; margin-top:0.25rem;">${totalSubsub}</div>
                        <div style="font-size:0.75rem; color:#8b5cf6;">Famílias e normas técnicas</div>
                    </div>
                    <div class="card" style="padding:1rem; border-left:4px solid #f59e0b; background:#ffffff;">
                        <span style="font-size:0.8rem; color:#64748b; font-weight:600; text-transform:uppercase;">Nível 4 • Produtos em Catálogo</span>
                        <div style="font-size:1.75rem; font-weight:700; color:#1e293b; margin-top:0.25rem;">${totalProdutos}</div>
                        <div style="font-size:0.75rem; color:#f59e0b;">Itens prontos para oferta</div>
                    </div>
                </div>

                <!-- Barra de Filtro e Pesquisa -->
                <div class="card" style="padding:1rem; margin-bottom:1.5rem; background:#ffffff;">
                    <div style="display:flex; flex-wrap:wrap; gap:0.75rem; align-items:center;">
                        <div style="flex:1; min-width:240px;">
                            <input type="text" id="filtro-busca-catalogo" class="form-control" placeholder="🔍 Pesquisar por categoria, produto, código, CNAE ou cliente-alvo..." value="${this.filtroAtual.busca}">
                        </div>
                        <div style="min-width:180px;">
                            <select id="filtro-categoria-select" class="form-control">
                                <option value="">Todas as Categorias</option>
                                ${this.dados.categorias.map(c => `<option value="${c.id}" ${this.filtroAtual.categoriaId === c.id ? 'selected' : ''}>${c.nome}</option>`).join('')}
                            </select>
                        </div>
                        <div style="display:flex; gap:0.5rem;">
                            <button class="btn btn-outline" id="btn-limpar-filtros-catalogo">Limpar</button>
                            <button class="btn btn-secondary" id="btn-alternar-visualizacao">Modo Árvore / Lista</button>
                        </div>
                    </div>
                </div>

                <!-- Lista / Árvore Hierárquica -->
                <div id="container-arvore-catalogo">
                    ${this.renderizarArvoreHierarquica()}
                </div>
            `;
        },

        renderizarArvoreHierarquica() {
            const busca = this.filtroAtual.busca.toLowerCase().trim();
            const catFiltro = this.filtroAtual.categoriaId;

            let categorias = this.dados.categorias.filter(c => {
                if (catFiltro && c.id !== catFiltro) return false;
                if (!busca) return true;
                return c.nome.toLowerCase().includes(busca) || 
                       (c.clientesAlvo && c.clientesAlvo.some(ca => ca.toLowerCase().includes(busca))) ||
                       (c.palavrasChave && c.palavrasChave.some(pc => pc.toLowerCase().includes(busca)));
            });

            if (categorias.length === 0) {
                return `
                    <div class="card" style="padding:3rem; text-align:center; color:#64748b;">
                        <div style="font-size:2.5rem; margin-bottom:0.75rem;">📂</div>
                        <h4 style="color:#334155; margin-bottom:0.5rem;">Nenhuma categoria localizada</h4>
                        <p style="margin:0;">Experimente ajustar seus termos de pesquisa ou adicione uma nova categoria de produto.</p>
                    </div>
                `;
            }

            return `
                <div style="display:flex; flex-direction:column; gap:1.25rem;">
                    ${categorias.map(cat => this.renderizarCardCategoria(cat, busca)).join('')}
                </div>
            `;
        },

        renderizarCardCategoria(cat, busca) {
            const subcategorias = this.dados.subcategorias.filter(s => s.categoriaId === cat.id);

            return `
                <div class="card" style="padding:1.25rem; border:1px solid #e2e8f0; border-radius:10px; background:#ffffff; box-shadow:0 1px 3px rgba(0,0,0,0.05);">
                    <!-- Topo da Categoria (Nível 1) -->
                    <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:0.5rem; padding-bottom:1rem; border-bottom:1px solid #f1f5f9;">
                        <div>
                            <div style="display:flex; align-items:center; gap:0.5rem;">
                                <span style="background:#eff6ff; color:#2563eb; font-weight:700; font-size:0.75rem; padding:0.2rem 0.6rem; border-radius:4px; text-transform:uppercase;">Nível 1 • Categoria</span>
                                <h3 style="margin:0; font-size:1.25rem; font-weight:700; color:#0f172a;">${cat.nome}</h3>
                            </div>
                            <p style="margin:0.25rem 0 0 0; color:#64748b; font-size:0.875rem;">${cat.descricao || 'Sem descrição informada.'}</p>
                            
                            <!-- Clientes-Alvo da Categoria -->
                            <div style="display:flex; flex-wrap:wrap; gap:0.35rem; align-items:center; margin-top:0.5rem;">
                                <span style="font-size:0.75rem; font-weight:600; color:#475569;">🎯 Clientes-Alvo:</span>
                                ${(cat.clientesAlvo || []).map(ca => `
                                    <span style="background:#e0f2fe; color:#0369a1; font-size:0.72rem; padding:0.15rem 0.45rem; border-radius:12px; font-weight:500;">${ca}</span>
                                `).join('')}
                            </div>

                            <!-- CNAEs e Segmentos -->
                            ${cat.cnaesRelacionados && cat.cnaesRelacionados.length > 0 ? `
                                <div style="display:flex; flex-wrap:wrap; gap:0.35rem; align-items:center; margin-top:0.35rem;">
                                    <span style="font-size:0.75rem; font-weight:600; color:#475569;">🏭 CNAEs Compatíveis:</span>
                                    ${cat.cnaesRelacionados.map(cnae => `
                                        <span style="background:#f1f5f9; color:#334155; font-size:0.7rem; padding:0.1rem 0.4rem; border-radius:4px; font-family:monospace;">${cnae}</span>
                                    `).join('')}
                                </div>
                            ` : ''}
                        </div>
                        <div style="display:flex; gap:0.35rem;">
                            <button class="btn btn-sm btn-outline" onclick="CategoriasProdutos.abrirModalSubcategoria('${cat.id}')" title="Adicionar Subcategoria">
                                ➕ Subcategoria
                            </button>
                            <button class="btn btn-sm btn-secondary" onclick="CategoriasProdutos.abrirModalCategoria('${cat.id}')" title="Editar Categoria">
                                ✏️
                            </button>
                            <button class="btn btn-sm btn-outline" style="color:#ef4444; border-color:#fecaca;" onclick="CategoriasProdutos.excluirCategoria('${cat.id}')" title="Excluir Categoria">
                                🗑️
                            </button>
                        </div>
                    </div>

                    <!-- Subcategorias (Nível 2) -->
                    <div style="padding-left:1.5rem; margin-top:1rem; border-left:2px solid #e2e8f0; display:flex; flex-direction:column; gap:1rem;">
                        ${subcategorias.length === 0 ? `
                            <div style="color:#94a3b8; font-size:0.85rem; font-style:italic;">Nenhuma subcategoria vinculada. Clique em "➕ Subcategoria" para cadastrar.</div>
                        ` : subcategorias.map(sub => this.renderizarCardSubcategoria(sub, cat, busca)).join('')}
                    </div>
                </div>
            `;
        },

        renderizarCardSubcategoria(sub, cat, busca) {
            const subsubs = this.dados.subsubcategorias.filter(ss => ss.subcategoriaId === sub.id);

            return `
                <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:1rem;">
                    <!-- Cabeçalho Subcategoria -->
                    <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:0.5rem;">
                        <div>
                            <div style="display:flex; align-items:center; gap:0.4rem;">
                                <span style="background:#dcfce7; color:#15803d; font-weight:700; font-size:0.7rem; padding:0.15rem 0.5rem; border-radius:4px; text-transform:uppercase;">Nível 2 • Subcategoria</span>
                                <h4 style="margin:0; font-size:1.05rem; font-weight:600; color:#1e293b;">${sub.nome}</h4>
                            </div>
                            <div style="font-size:0.82rem; color:#64748b; margin-top:0.2rem;">${sub.descricao || ''}</div>
                            
                            ${sub.clientesAlvo && sub.clientesAlvo.length > 0 ? `
                                <div style="display:flex; flex-wrap:wrap; gap:0.3rem; margin-top:0.3rem;">
                                    ${sub.clientesAlvo.map(ca => `<span style="background:#f0fdf4; color:#166534; font-size:0.7rem; padding:0.1rem 0.4rem; border-radius:8px;">${ca}</span>`).join('')}
                                </div>
                            ` : ''}
                        </div>
                        <div style="display:flex; gap:0.3rem;">
                            <button class="btn btn-sm btn-outline" onclick="CategoriasProdutos.abrirModalSubsubcategoria('${sub.id}')">
                                ➕ Subsubcategoria
                            </button>
                            <button class="btn btn-sm btn-outline" onclick="CategoriasProdutos.abrirModalSubcategoria('${cat.id}', '${sub.id}')">
                                ✏️
                            </button>
                            <button class="btn btn-sm btn-outline" style="color:#ef4444;" onclick="CategoriasProdutos.excluirSubcategoria('${sub.id}')">
                                🗑️
                            </button>
                        </div>
                    </div>

                    <!-- Subsubcategorias (Nível 3) -->
                    <div style="padding-left:1.5rem; margin-top:0.85rem; border-left:2px solid #cbd5e1; display:flex; flex-direction:column; gap:0.85rem;">
                        ${subsubs.length === 0 ? `
                            <div style="color:#94a3b8; font-size:0.8rem; font-style:italic;">Nenhuma subsubcategoria cadastrada neste nível.</div>
                        ` : subsubs.map(ss => this.renderizarCardSubsubcategoria(ss, sub, cat, busca)).join('')}
                    </div>
                </div>
            `;
        },

        renderizarCardSubsubcategoria(ss, sub, cat, busca) {
            const prods = this.dados.produtos.filter(p => p.subsubcategoriaId === ss.id);

            return `
                <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:6px; padding:0.85rem;">
                    <!-- Cabeçalho Nível 3 -->
                    <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:0.4rem;">
                        <div>
                            <div style="display:flex; align-items:center; gap:0.4rem;">
                                <span style="background:#f3e8ff; color:#7e22ce; font-weight:700; font-size:0.68rem; padding:0.12rem 0.45rem; border-radius:4px; text-transform:uppercase;">Nível 3 • Subsubcategoria</span>
                                <h5 style="margin:0; font-size:0.95rem; font-weight:600; color:#334155;">${ss.nome}</h5>
                            </div>
                            <div style="font-size:0.8rem; color:#64748b; margin-top:0.15rem;">${ss.descricao || ''}</div>
                        </div>
                        <div style="display:flex; gap:0.25rem;">
                            <button class="btn btn-sm btn-primary" style="padding:0.2rem 0.5rem; font-size:0.75rem;" onclick="CategoriasProdutos.abrirModalProduto('${ss.id}')">
                                ➕ Adicionar Produto
                            </button>
                            <button class="btn btn-sm btn-outline" style="padding:0.2rem 0.4rem;" onclick="CategoriasProdutos.abrirModalSubsubcategoria('${sub.id}', '${ss.id}')">
                                ✏️
                            </button>
                            <button class="btn btn-sm btn-outline" style="padding:0.2rem 0.4rem; color:#ef4444;" onclick="CategoriasProdutos.excluirSubsubcategoria('${ss.id}')">
                                🗑️
                            </button>
                        </div>
                    </div>

                    <!-- Nível 4: Produtos Relacionados -->
                    <div style="margin-top:0.75rem;">
                        <div style="font-size:0.75rem; font-weight:700; color:#64748b; text-transform:uppercase; margin-bottom:0.4rem;">
                            📦 Produtos Vinculados (${prods.length}):
                        </div>
                        ${prods.length === 0 ? `
                            <div style="color:#94a3b8; font-size:0.78rem; font-style:italic;">Nenhum produto cadastrado nesta subsubcategoria.</div>
                        ` : `
                            <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(260px, 1fr)); gap:0.6rem;">
                                ${prods.map(p => this.renderizarItemProduto(p, ss, sub, cat)).join('')}
                            </div>
                        `}
                    </div>
                </div>
            `;
        },

        renderizarItemProduto(prod, ss, sub, cat) {
            return `
                <div style="background:#f8fafc; border:1px solid #cbd5e1; border-radius:6px; padding:0.65rem; display:flex; flex-direction:column; justify-content:space-between;">
                    <div>
                        <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:0.25rem;">
                            <strong style="font-size:0.85rem; color:#0f172a;">${prod.nome}</strong>
                            <span style="font-size:0.7rem; background:#f1f5f9; padding:0.1rem 0.35rem; border-radius:3px; font-family:monospace;">${prod.codigo || 'S/C'}</span>
                        </div>
                        <p style="margin:0.25rem 0; font-size:0.78rem; color:#64748b; line-height:1.3;">${prod.descricao || ''}</p>
                        
                        <div style="margin-top:0.35rem; font-size:0.8rem; font-weight:700; color:#16a34a;">
                            R$ ${(prod.precoBase || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>

                        ${prod.clientesAlvo && prod.clientesAlvo.length > 0 ? `
                            <div style="display:flex; flex-wrap:wrap; gap:0.2rem; margin-top:0.35rem;">
                                ${prod.clientesAlvo.map(ca => `<span style="background:#fef3c7; color:#92400e; font-size:0.68rem; padding:0.05rem 0.35rem; border-radius:6px;">🎯 ${ca}</span>`).join('')}
                            </div>
                        ` : ''}
                    </div>
                    
                    <div style="display:flex; justify-content:flex-end; gap:0.3rem; margin-top:0.6rem; padding-top:0.4rem; border-top:1px solid #e2e8f0;">
                        <button class="btn btn-sm btn-outline" style="padding:0.15rem 0.4rem; font-size:0.72rem;" onclick="CategoriasProdutos.abrirModalProduto('${ss.id}', '${prod.id}')">
                            Editar
                        </button>
                        <button class="btn btn-sm btn-outline" style="padding:0.15rem 0.4rem; font-size:0.72rem; color:#ef4444;" onclick="CategoriasProdutos.excluirProduto('${prod.id}')">
                            Excluir
                        </button>
                    </div>
                </div>
            `;
        },

        // Modais de Criação e Edição
        abrirModalCategoria(id = null) {
            const cat = id ? this.dados.categorias.find(c => c.id === id) : null;
            const titulo = cat ? 'Editar Categoria' : 'Nova Categoria de Produtos';

            const modalHtml = `
                <div class="modal active" id="modal-crud-categoria" style="display:flex;">
                    <div class="modal-content" style="max-width:550px; width:90%; padding:1.5rem; background:#fff; border-radius:10px;">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem; border-bottom:1px solid #e2e8f0; padding-bottom:0.5rem;">
                            <h3 style="margin:0; font-size:1.2rem; font-weight:700;">${titulo}</h3>
                            <button class="modal-close" onclick="CategoriasProdutos.fecharModal('modal-crud-categoria')">&times;</button>
                        </div>
                        <form id="form-crud-categoria">
                            <input type="hidden" id="cat-form-id" value="${cat ? cat.id : ''}">
                            <div class="form-group" style="margin-bottom:0.85rem;">
                                <label style="display:block; font-size:0.85rem; font-weight:600; margin-bottom:0.25rem;">Nome da Categoria *</label>
                                <input type="text" id="cat-form-nome" class="form-control" required placeholder="Ex: Automação Pneumática" value="${cat ? cat.nome : ''}">
                            </div>
                            <div class="form-group" style="margin-bottom:0.85rem;">
                                <label style="display:block; font-size:0.85rem; font-weight:600; margin-bottom:0.25rem;">Descrição</label>
                                <textarea id="cat-form-descricao" class="form-control" rows="2" placeholder="Resumo técnico da tecnologia">${cat ? (cat.descricao || '') : ''}</textarea>
                            </div>
                            <div class="form-group" style="margin-bottom:0.85rem;">
                                <label style="display:block; font-size:0.85rem; font-weight:600; margin-bottom:0.25rem;">🎯 Clientes-Alvo (separados por vírgula)</label>
                                <input type="text" id="cat-form-clientes-alvo" class="form-control" placeholder="Ex: Fabricantes de máquinas, Indústria automotiva, Metalúrgica" value="${cat && cat.clientesAlvo ? cat.clientesAlvo.join(', ') : ''}">
                                <small style="color:#64748b; font-size:0.75rem;">Esses perfis orientam o algoritmo de recomendação automática no CRM.</small>
                            </div>
                            <div class="form-group" style="margin-bottom:0.85rem;">
                                <label style="display:block; font-size:0.85rem; font-weight:600; margin-bottom:0.25rem;">🏭 CNAEs Relacionados (separados por vírgula)</label>
                                <input type="text" id="cat-form-cnaes" class="form-control" placeholder="Ex: 28.29-1, 28.69-1, 29.10-7" value="${cat && cat.cnaesRelacionados ? cat.cnaesRelacionados.join(', ') : ''}">
                            </div>
                            <div class="form-group" style="margin-bottom:1rem;">
                                <label style="display:block; font-size:0.85rem; font-weight:600; margin-bottom:0.25rem;">🔑 Palavras-Chave Estratégicas</label>
                                <input type="text" id="cat-form-palavras-chave" class="form-control" placeholder="Ex: embalagem, envase, cilindro, ar comprimido" value="${cat && cat.palavrasChave ? cat.palavrasChave.join(', ') : ''}">
                            </div>
                            <div style="display:flex; justify-content:flex-end; gap:0.5rem;">
                                <button type="button" class="btn btn-outline" onclick="CategoriasProdutos.fecharModal('modal-crud-categoria')">Cancelar</button>
                                <button type="submit" class="btn btn-primary">Salvar Categoria</button>
                            </div>
                        </form>
                    </div>
                </div>
            `;
            this.injetarModal(modalHtml, 'modal-crud-categoria');

            document.getElementById('form-crud-categoria').addEventListener('submit', (e) => {
                e.preventDefault();
                const formId = document.getElementById('cat-form-id').value;
                const nome = document.getElementById('cat-form-nome').value.trim();
                const descricao = document.getElementById('cat-form-descricao').value.trim();
                const clientesAlvo = document.getElementById('cat-form-clientes-alvo').value.split(',').map(s => s.trim()).filter(Boolean);
                const cnaesRelacionados = document.getElementById('cat-form-cnaes').value.split(',').map(s => s.trim()).filter(Boolean);
                const palavrasChave = document.getElementById('cat-form-palavras-chave').value.split(',').map(s => s.trim()).filter(Boolean);

                if (formId) {
                    const idx = this.dados.categorias.findIndex(c => c.id === formId);
                    if (idx !== -1) {
                        this.dados.categorias[idx] = {
                            ...this.dados.categorias[idx],
                            nome, descricao, clientesAlvo, cnaesRelacionados, palavrasChave
                        };
                    }
                } else {
                    const novaCat = {
                        id: 'cat-' + Date.now(),
                        nome, descricao, clientesAlvo, cnaesRelacionados, palavrasChave,
                        ordem: this.dados.categorias.length + 1,
                        ativo: true
                    };
                    this.dados.categorias.push(novaCat);
                }

                this.salvarDados();
                this.fecharModal('modal-crud-categoria');
                this.renderizarPainel();
                this.mostrarAlerta('Categoria salva com sucesso!');
            });
        },

        abrirModalSubcategoria(categoriaId, subId = null) {
            const sub = subId ? this.dados.subcategorias.find(s => s.id === subId) : null;
            const titulo = sub ? 'Editar Subcategoria' : 'Nova Subcategoria';

            const modalHtml = `
                <div class="modal active" id="modal-crud-subcategoria" style="display:flex;">
                    <div class="modal-content" style="max-width:500px; width:90%; padding:1.5rem; background:#fff; border-radius:10px;">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem; border-bottom:1px solid #e2e8f0; padding-bottom:0.5rem;">
                            <h3 style="margin:0; font-size:1.15rem; font-weight:700;">${titulo}</h3>
                            <button class="modal-close" onclick="CategoriasProdutos.fecharModal('modal-crud-subcategoria')">&times;</button>
                        </div>
                        <form id="form-crud-subcategoria">
                            <input type="hidden" id="sub-form-id" value="${sub ? sub.id : ''}">
                            <input type="hidden" id="sub-form-cat-id" value="${categoriaId}">
                            <div class="form-group" style="margin-bottom:0.85rem;">
                                <label style="display:block; font-size:0.85rem; font-weight:600; margin-bottom:0.25rem;">Nome da Subcategoria *</label>
                                <input type="text" id="sub-form-nome" class="form-control" required placeholder="Ex: Atuadores Pneumáticos" value="${sub ? sub.nome : ''}">
                            </div>
                            <div class="form-group" style="margin-bottom:0.85rem;">
                                <label style="display:block; font-size:0.85rem; font-weight:600; margin-bottom:0.25rem;">Descrição</label>
                                <textarea id="sub-form-descricao" class="form-control" rows="2">${sub ? (sub.descricao || '') : ''}</textarea>
                            </div>
                            <div class="form-group" style="margin-bottom:1rem;">
                                <label style="display:block; font-size:0.85rem; font-weight:600; margin-bottom:0.25rem;">🎯 Clientes-Alvo Específicos (opcional, vírgula)</label>
                                <input type="text" id="sub-form-clientes-alvo" class="form-control" placeholder="Ex: Fabricantes de máquinas de embalagem" value="${sub && sub.clientesAlvo ? sub.clientesAlvo.join(', ') : ''}">
                            </div>
                            <div style="display:flex; justify-content:flex-end; gap:0.5rem;">
                                <button type="button" class="btn btn-outline" onclick="CategoriasProdutos.fecharModal('modal-crud-subcategoria')">Cancelar</button>
                                <button type="submit" class="btn btn-primary">Salvar Subcategoria</button>
                            </div>
                        </form>
                    </div>
                </div>
            `;
            this.injetarModal(modalHtml, 'modal-crud-subcategoria');

            document.getElementById('form-crud-subcategoria').addEventListener('submit', (e) => {
                e.preventDefault();
                const formId = document.getElementById('sub-form-id').value;
                const catId = document.getElementById('sub-form-cat-id').value;
                const nome = document.getElementById('sub-form-nome').value.trim();
                const descricao = document.getElementById('sub-form-descricao').value.trim();
                const clientesAlvo = document.getElementById('sub-form-clientes-alvo').value.split(',').map(s => s.trim()).filter(Boolean);

                if (formId) {
                    const idx = this.dados.subcategorias.findIndex(s => s.id === formId);
                    if (idx !== -1) {
                        this.dados.subcategorias[idx] = { ...this.dados.subcategorias[idx], nome, descricao, clientesAlvo };
                    }
                } else {
                    this.dados.subcategorias.push({
                        id: 'sub-' + Date.now(),
                        categoriaId: catId,
                        nome, descricao, clientesAlvo,
                        ordem: this.dados.subcategorias.length + 1,
                        ativo: true
                    });
                }

                this.salvarDados();
                this.fecharModal('modal-crud-subcategoria');
                this.renderizarPainel();
                this.mostrarAlerta('Subcategoria salva com sucesso!');
            });
        },

        abrirModalSubsubcategoria(subcategoriaId, subsubId = null) {
            const ss = subsubId ? this.dados.subsubcategorias.find(s => s.id === subsubId) : null;
            const titulo = ss ? 'Editar Subsubcategoria' : 'Nova Subsubcategoria (Nível 3)';

            const modalHtml = `
                <div class="modal active" id="modal-crud-subsub" style="display:flex;">
                    <div class="modal-content" style="max-width:500px; width:90%; padding:1.5rem; background:#fff; border-radius:10px;">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem; border-bottom:1px solid #e2e8f0; padding-bottom:0.5rem;">
                            <h3 style="margin:0; font-size:1.15rem; font-weight:700;">${titulo}</h3>
                            <button class="modal-close" onclick="CategoriasProdutos.fecharModal('modal-crud-subsub')">&times;</button>
                        </div>
                        <form id="form-crud-subsub">
                            <input type="hidden" id="ss-form-id" value="${ss ? ss.id : ''}">
                            <input type="hidden" id="ss-form-sub-id" value="${subcategoriaId}">
                            <div class="form-group" style="margin-bottom:0.85rem;">
                                <label style="display:block; font-size:0.85rem; font-weight:600; margin-bottom:0.25rem;">Nome da Subsubcategoria *</label>
                                <input type="text" id="ss-form-nome" class="form-control" required placeholder="Ex: Cilindros ISO ou Cilindros Compactos" value="${ss ? ss.nome : ''}">
                            </div>
                            <div class="form-group" style="margin-bottom:0.85rem;">
                                <label style="display:block; font-size:0.85rem; font-weight:600; margin-bottom:0.25rem;">Descrição Técnica</label>
                                <textarea id="ss-form-descricao" class="form-control" rows="2">${ss ? (ss.descricao || '') : ''}</textarea>
                            </div>
                            <div class="form-group" style="margin-bottom:1rem;">
                                <label style="display:block; font-size:0.85rem; font-weight:600; margin-bottom:0.25rem;">🎯 Clientes-Alvo Relacionados</label>
                                <input type="text" id="ss-form-clientes-alvo" class="form-control" placeholder="Ex: Fabricantes de máquinas especiais" value="${ss && ss.clientesAlvo ? ss.clientesAlvo.join(', ') : ''}">
                            </div>
                            <div style="display:flex; justify-content:flex-end; gap:0.5rem;">
                                <button type="button" class="btn btn-outline" onclick="CategoriasProdutos.fecharModal('modal-crud-subsub')">Cancelar</button>
                                <button type="submit" class="btn btn-primary">Salvar Subsubcategoria</button>
                            </div>
                        </form>
                    </div>
                </div>
            `;
            this.injetarModal(modalHtml, 'modal-crud-subsub');

            document.getElementById('form-crud-subsub').addEventListener('submit', (e) => {
                e.preventDefault();
                const formId = document.getElementById('ss-form-id').value;
                const subId = document.getElementById('ss-form-sub-id').value;
                const nome = document.getElementById('ss-form-nome').value.trim();
                const descricao = document.getElementById('ss-form-descricao').value.trim();
                const clientesAlvo = document.getElementById('ss-form-clientes-alvo').value.split(',').map(s => s.trim()).filter(Boolean);

                if (formId) {
                    const idx = this.dados.subsubcategorias.findIndex(s => s.id === formId);
                    if (idx !== -1) {
                        this.dados.subsubcategorias[idx] = { ...this.dados.subsubcategorias[idx], nome, descricao, clientesAlvo };
                    }
                } else {
                    this.dados.subsubcategorias.push({
                        id: 'subsub-' + Date.now(),
                        subcategoriaId: subId,
                        nome, descricao, clientesAlvo,
                        ordem: this.dados.subsubcategorias.length + 1,
                        ativo: true
                    });
                }

                this.salvarDados();
                this.fecharModal('modal-crud-subsub');
                this.renderizarPainel();
                this.mostrarAlerta('Subsubcategoria salva com sucesso!');
            });
        },

        abrirModalProduto(subsubId = null, produtoId = null) {
            const prod = produtoId ? this.dados.produtos.find(p => p.id === produtoId) : null;
            const titulo = prod ? 'Editar Produto' : 'Cadastrar Novo Produto';
            const subsubSelecionada = subsubId || (prod ? prod.subsubcategoriaId : (this.dados.subsubcategorias[0]?.id || ''));

            const modalHtml = `
                <div class="modal active" id="modal-crud-produto" style="display:flex;">
                    <div class="modal-content" style="max-width:600px; width:90%; padding:1.5rem; background:#fff; border-radius:10px;">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem; border-bottom:1px solid #e2e8f0; padding-bottom:0.5rem;">
                            <h3 style="margin:0; font-size:1.2rem; font-weight:700;">${titulo}</h3>
                            <button class="modal-close" onclick="CategoriasProdutos.fecharModal('modal-crud-produto')">&times;</button>
                        </div>
                        <form id="form-crud-produto">
                            <input type="hidden" id="prod-form-id" value="${prod ? prod.id : ''}">
                            
                            <div class="form-group" style="margin-bottom:0.85rem;">
                                <label style="display:block; font-size:0.85rem; font-weight:600; margin-bottom:0.25rem;">Subsubcategoria Vinculada (Nível 3) *</label>
                                <select id="prod-form-subsub-id" class="form-control" required>
                                    ${this.dados.subsubcategorias.map(ss => {
                                        const sub = this.dados.subcategorias.find(s => s.id === ss.subcategoriaId);
                                        const cat = sub ? this.dados.categorias.find(c => c.id === sub.categoriaId) : null;
                                        const rotulo = `${cat ? cat.nome + ' > ' : ''}${sub ? sub.nome + ' > ' : ''}${ss.nome}`;
                                        return `<option value="${ss.id}" ${ss.id === subsubSelecionada ? 'selected' : ''}>${rotulo}</option>`;
                                    }).join('')}
                                </select>
                            </div>

                            <div style="display:grid; grid-template-columns:2fr 1fr; gap:0.75rem; margin-bottom:0.85rem;">
                                <div class="form-group">
                                    <label style="display:block; font-size:0.85rem; font-weight:600; margin-bottom:0.25rem;">Nome do Produto *</label>
                                    <input type="text" id="prod-form-nome" class="form-control" required placeholder="Ex: Cilindro ISO 15552 com sensor magnético" value="${prod ? prod.nome : ''}">
                                </div>
                                <div class="form-group">
                                    <label style="display:block; font-size:0.85rem; font-weight:600; margin-bottom:0.25rem;">Código / SKU</label>
                                    <input type="text" id="prod-form-codigo" class="form-control" placeholder="ISO-15552-63" value="${prod ? (prod.codigo || '') : ''}">
                                </div>
                            </div>

                            <div class="form-group" style="margin-bottom:0.85rem;">
                                <label style="display:block; font-size:0.85rem; font-weight:600; margin-bottom:0.25rem;">Descrição e Benefícios Comerciais</label>
                                <textarea id="prod-form-descricao" class="form-control" rows="2" placeholder="Diferenciais e aplicação">${prod ? (prod.descricao || '') : ''}</textarea>
                            </div>

                            <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.75rem; margin-bottom:0.85rem;">
                                <div class="form-group">
                                    <label style="display:block; font-size:0.85rem; font-weight:600; margin-bottom:0.25rem;">Preço Base (R$)</label>
                                    <input type="number" step="0.01" id="prod-form-preco" class="form-control" placeholder="0.00" value="${prod ? prod.precoBase : ''}">
                                </div>
                                <div class="form-group">
                                    <label style="display:block; font-size:0.85rem; font-weight:600; margin-bottom:0.25rem;">Unidade</label>
                                    <input type="text" id="prod-form-unidade" class="form-control" placeholder="UN, PC, KIT" value="${prod ? prod.unidade : 'UN'}">
                                </div>
                            </div>

                            <div class="form-group" style="margin-bottom:0.85rem;">
                                <label style="display:block; font-size:0.85rem; font-weight:600; margin-bottom:0.25rem;">🎯 Clientes-Alvo do Produto (separados por vírgula)</label>
                                <input type="text" id="prod-form-clientes-alvo" class="form-control" placeholder="Ex: Fabricantes de máquinas especiais, Metalúrgicas" value="${prod && prod.clientesAlvo ? prod.clientesAlvo.join(', ') : ''}">
                            </div>

                            <div class="form-group" style="margin-bottom:1rem;">
                                <label style="display:block; font-size:0.85rem; font-weight:600; margin-bottom:0.25rem;">⚙️ Aplicações Industriais Típicas (vírgula)</label>
                                <input type="text" id="prod-form-aplicacoes" class="form-control" placeholder="Ex: Avanço de prensas, dosagem de fluidos, manipulação" value="${prod && prod.aplicacoesIndustriais ? prod.aplicacoesIndustriais.join(', ') : ''}">
                            </div>

                            <div style="display:flex; justify-content:flex-end; gap:0.5rem;">
                                <button type="button" class="btn btn-outline" onclick="CategoriasProdutos.fecharModal('modal-crud-produto')">Cancelar</button>
                                <button type="submit" class="btn btn-primary">Salvar Produto</button>
                            </div>
                        </form>
                    </div>
                </div>
            `;
            this.injetarModal(modalHtml, 'modal-crud-produto');

            document.getElementById('form-crud-produto').addEventListener('submit', (e) => {
                e.preventDefault();
                const formId = document.getElementById('prod-form-id').value;
                const subsubId = document.getElementById('prod-form-subsub-id').value;
                const nome = document.getElementById('prod-form-nome').value.trim();
                const codigo = document.getElementById('prod-form-codigo').value.trim();
                const descricao = document.getElementById('prod-form-descricao').value.trim();
                const precoBase = parseFloat(document.getElementById('prod-form-preco').value) || 0;
                const unidade = document.getElementById('prod-form-unidade').value.trim() || 'UN';
                const clientesAlvo = document.getElementById('prod-form-clientes-alvo').value.split(',').map(s => s.trim()).filter(Boolean);
                const aplicacoesIndustriais = document.getElementById('prod-form-aplicacoes').value.split(',').map(s => s.trim()).filter(Boolean);

                if (formId) {
                    const idx = this.dados.produtos.findIndex(p => p.id === formId);
                    if (idx !== -1) {
                        this.dados.produtos[idx] = {
                            ...this.dados.produtos[idx],
                            subsubcategoriaId: subsubId,
                            nome, codigo, descricao, precoBase, unidade, clientesAlvo, aplicacoesIndustriais
                        };
                    }
                } else {
                    this.dados.produtos.push({
                        id: 'prod-' + Date.now(),
                        subsubcategoriaId: subsubId,
                        nome, codigo, descricao, precoBase, unidade, clientesAlvo, aplicacoesIndustriais,
                        ativo: true
                    });
                }

                this.salvarDados();
                this.fecharModal('modal-crud-produto');
                this.renderizarPainel();
                this.mostrarAlerta('Produto salvo com sucesso no catálogo!');
            });
        },

        excluirCategoria(id) {
            if (!confirm('Tem certeza que deseja excluir esta categoria? Todas as subcategorias, subsubcategorias e produtos vinculados serão removidos.')) return;
            this.dados.categorias = this.dados.categorias.filter(c => c.id !== id);
            const subsRemover = this.dados.subcategorias.filter(s => s.categoriaId === id).map(s => s.id);
            this.dados.subcategorias = this.dados.subcategorias.filter(s => s.categoriaId !== id);
            const subsubsRemover = this.dados.subsubcategorias.filter(ss => subsRemover.includes(ss.subcategoriaId)).map(ss => ss.id);
            this.dados.subsubcategorias = this.dados.subsubcategorias.filter(ss => !subsRemover.includes(ss.subcategoriaId));
            this.dados.produtos = this.dados.produtos.filter(p => !subsubsRemover.includes(p.subsubcategoriaId));
            this.salvarDados();
            this.renderizarPainel();
            this.mostrarAlerta('Categoria excluída com sucesso.');
        },

        excluirSubcategoria(id) {
            if (!confirm('Deseja excluir esta subcategoria e seus itens subordinados?')) return;
            this.dados.subcategorias = this.dados.subcategorias.filter(s => s.id !== id);
            const subsubsRemover = this.dados.subsubcategorias.filter(ss => ss.subcategoriaId === id).map(ss => ss.id);
            this.dados.subsubcategorias = this.dados.subsubcategorias.filter(ss => ss.subcategoriaId !== id);
            this.dados.produtos = this.dados.produtos.filter(p => !subsubsRemover.includes(p.subsubcategoriaId));
            this.salvarDados();
            this.renderizarPainel();
            this.mostrarAlerta('Subcategoria excluída com sucesso.');
        },

        excluirSubsubcategoria(id) {
            if (!confirm('Deseja excluir esta subsubcategoria e seus produtos?')) return;
            this.dados.subsubcategorias = this.dados.subsubcategorias.filter(ss => ss.id !== id);
            this.dados.produtos = this.dados.produtos.filter(p => p.subsubcategoriaId !== id);
            this.salvarDados();
            this.renderizarPainel();
            this.mostrarAlerta('Subsubcategoria excluída.');
        },

        excluirProduto(id) {
            if (!confirm('Deseja remover este produto do catálogo?')) return;
            this.dados.produtos = this.dados.produtos.filter(p => p.id !== id);
            this.salvarDados();
            this.renderizarPainel();
            this.mostrarAlerta('Produto removido.');
        },

        injetarModal(html, id) {
            const elAntigo = document.getElementById(id);
            if (elAntigo) elAntigo.remove();
            document.body.insertAdjacentHTML('beforeend', html);
        },

        fecharModal(id) {
            const el = document.getElementById(id);
            if (el) el.remove();
        },

        mostrarAlerta(msg) {
            if (window.mostrarToast) {
                window.mostrarToast(msg);
            } else {
                alert(msg);
            }
        },

        vincularEventos() {
            document.addEventListener('click', (e) => {
                if (e.target.id === 'btn-nova-categoria' || e.target.closest('#btn-nova-categoria')) {
                    this.abrirModalCategoria();
                }
                if (e.target.id === 'btn-novo-produto' || e.target.closest('#btn-novo-produto')) {
                    this.abrirModalProduto();
                }
                if (e.target.id === 'btn-regras-compatibilidade' || e.target.closest('#btn-regras-compatibilidade')) {
                    this.abrirModalPainelRelacionamentos();
                }
                if (e.target.id === 'btn-limpar-filtros-catalogo') {
                    this.filtroAtual = { busca: '', categoriaId: '', subcategoriaId: '', subsubcategoriaId: '', clienteAlvo: '' };
                    this.renderizarPainel();
                }
            });

            document.addEventListener('input', (e) => {
                if (e.target.id === 'filtro-busca-catalogo') {
                    this.filtroAtual.busca = e.target.value;
                    const container = document.getElementById('container-arvore-catalogo');
                    if (container) container.innerHTML = this.renderizarArvoreHierarquica();
                }
            });

            document.addEventListener('change', (e) => {
                if (e.target.id === 'filtro-categoria-select') {
                    this.filtroAtual.categoriaId = e.target.value;
                    const container = document.getElementById('container-arvore-catalogo');
                    if (container) container.innerHTML = this.renderizarArvoreHierarquica();
                }
            });
        },

        abrirModalPainelRelacionamentos() {
            const modalHtml = `
                <div class="modal active" id="modal-painel-relacionamentos" style="display:flex;">
                    <div class="modal-content" style="max-width:700px; width:90%; padding:1.5rem; background:#fff; border-radius:10px;">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem; border-bottom:1px solid #e2e8f0; padding-bottom:0.5rem;">
                            <h3 style="margin:0; font-size:1.2rem; font-weight:700;">🎯 Painel de Clientes-Alvo & Relações de Match</h3>
                            <button class="modal-close" onclick="CategoriasProdutos.fecharModal('modal-painel-relacionamentos')">&times;</button>
                        </div>
                        <div style="max-height:65vh; overflow-y:auto;">
                            <p style="font-size:0.875rem; color:#475569;">
                                Este painel exibe o mapa de compatibilidade entre <strong>Classificação das Empresas</strong> e <strong>Categorias de Produtos</strong>. O motor calcula pontuações (0-100%) baseado em CNAEs, segmentos industriais, processos produtivos e palavras-chave.
                            </p>
                            <table class="table" style="width:100%; font-size:0.85rem; margin-top:1rem; border-collapse:collapse;">
                                <thead>
                                    <tr style="background:#f1f5f9; text-align:left;">
                                        <th style="padding:0.6rem;">Categoria</th>
                                        <th style="padding:0.6rem;">Clientes-Alvo Estratégicos</th>
                                        <th style="padding:0.6rem;">CNAEs</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${this.dados.categorias.map(c => `
                                        <tr style="border-bottom:1px solid #e2e8f0;">
                                            <td style="padding:0.6rem; font-weight:600; color:#1e293b;">${c.nome}</td>
                                            <td style="padding:0.6rem;">${(c.clientesAlvo || []).join(' • ')}</td>
                                            <td style="padding:0.6rem; font-family:monospace; color:#475569;">${(c.cnaesRelacionados || []).join(', ') || 'Nenhum'}</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                        <div style="display:flex; justify-content:flex-end; margin-top:1.25rem;">
                            <button class="btn btn-primary" onclick="CategoriasProdutos.fecharModal('modal-painel-relacionamentos')">Entendido</button>
                        </div>
                    </div>
                </div>
            `;
            this.injetarModal(modalHtml, 'modal-painel-relacionamentos');
        }
    };

    window.CategoriasProdutos = CategoriasProdutos;
})(window);
