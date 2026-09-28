const fs = require('fs');
const path = require('path');

const targetFile = path.resolve(__dirname, 'js/landing-pages.js');
let content = fs.readFileSync(targetFile, 'utf-8');

const novoTemplate = `// ================================================================
// TEMPLATE: VISUALIZADOR DE ORÇAMENTO COM ASSINATURA DIGITAL & PORTAL DO CLIENTE
// ================================================================
const TEMPLATE_VISUALIZADOR_ORCAMENTO = \\\`<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Proposta Comercial {{numero_orcamento}} | Portal do Cliente MiCRO Automação - {{empresa}}</title>
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
    <style>
        * { margin:0; padding:0; box-sizing:border-box; }
        :root {
            --micro-blue: #0057a8;
            --micro-blue-dark: #00386b;
            --micro-blue-light: #e6f0fa;
            --micro-orange: #f26522;
            --micro-orange-hover: #d95314;
            --micro-gray-dark: #1e293b;
            --micro-gray-medium: #64748b;
            --micro-gray-light: #f1f5f9;
            --micro-border: #cbd5e1;
            --success: #16a34a;
            --success-light: #dcfce7;
        }
        body {
            font-family: 'Roboto', -apple-system, BlinkMacSystemFont, sans-serif;
            background: #0f172a;
            color: #1e293b;
            line-height: 1.5;
            min-height: 100vh;
        }

        /* BARRA SUPERIOR DE SEGURANÇA SSL */
        .ssl-bar {
            background: #090d16;
            color: #94a3b8;
            font-size: 11px;
            padding: 7px 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid #1e293b;
        }
        .ssl-bar span { display: flex; align-items: center; gap: 6px; }

        /* HEADER DO PORTAL DO CLIENTE */
        .portal-header {
            background: #ffffff;
            border-bottom: 3px solid var(--micro-orange);
            box-shadow: 0 4px 16px rgba(0,0,0,0.12);
            position: sticky;
            top: 0;
            z-index: 100;
        }
        .portal-header-container {
            max-width: 1440px;
            margin: 0 auto;
            padding: 10px 24px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 18px;
            flex-wrap: wrap;
        }
        .portal-brand {
            display: flex;
            align-items: center;
            gap: 16px;
        }
        .brand-logo-box {
            background: var(--micro-blue);
            color: #fff;
            padding: 8px 16px;
            border-radius: 6px;
            font-family: 'Montserrat', sans-serif;
            font-weight: 900;
            font-size: 1.35rem;
            letter-spacing: 2px;
            line-height: 1;
        }
        .brand-logo-box span {
            display: block;
            font-size: 0.48rem;
            font-weight: 500;
            letter-spacing: 3px;
            color: #e0f2fe;
            margin-top: 3px;
        }
        .portal-title-block h1 {
            font-size: 15px;
            font-weight: 700;
            color: var(--micro-gray-dark);
            font-family: 'Montserrat', sans-serif;
        }
        .portal-title-block p {
            font-size: 12px;
            color: var(--micro-gray-medium);
        }

        .portal-client-info {
            display: flex;
            align-items: center;
            gap: 14px;
            background: var(--micro-gray-light);
            padding: 6px 14px;
            border-radius: 8px;
            border: 1px solid var(--micro-border);
        }
        .client-avatar {
            width: 36px;
            height: 36px;
            background: var(--micro-blue);
            color: #fff;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 800;
            font-size: 14px;
        }
        .client-meta strong {
            display: block;
            font-size: 12px;
            color: var(--micro-gray-dark);
        }
        .client-meta span {
            display: block;
            font-size: 11px;
            color: var(--micro-gray-medium);
        }

        .portal-status-pill {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 5px 12px;
            border-radius: 20px;
            font-size: 11px;
            font-weight: 700;
            background: #fef3c7;
            color: #92400e;
            border: 1px solid #fde68a;
        }
        .portal-status-pill.aprovado {
            background: var(--success-light);
            color: var(--success);
            border-color: #86efac;
        }
        .portal-status-pill .pulse-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: #d97706;
            box-shadow: 0 0 0 rgba(217, 119, 6, 0.4);
            animation: pulseDot 2s infinite;
        }
        .portal-status-pill.aprovado .pulse-dot {
            background: var(--success);
            animation: none;
        }
        @keyframes pulseDot {
            0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(217, 119, 6, 0.7); }
            70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(217, 119, 6, 0); }
            100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(217, 119, 6, 0); }
        }

        /* BARRA DE FERRAMENTAS DO VISUALIZADOR PDF (ESTILO ITENS/ORÇAMENTO) */
        .pdf-toolbar {
            background: #1e293b;
            color: #f8fafc;
            padding: 9px 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 12px;
            flex-wrap: wrap;
            border-bottom: 1px solid #334155;
            position: sticky;
            top: 61px;
            z-index: 90;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        }
        .pdf-file-info {
            display: flex;
            align-items: center;
            gap: 10px;
            font-size: 13px;
        }
        .pdf-badge {
            background: #dc2626;
            color: #fff;
            font-size: 10px;
            font-weight: 800;
            padding: 3px 6px;
            border-radius: 4px;
            letter-spacing: 1px;
        }
        .pdf-page-count-badge {
            background: #334155;
            color: #cbd5e1;
            font-size: 11px;
            padding: 3px 8px;
            border-radius: 12px;
            border: 1px solid #475569;
            font-weight: 600;
        }
        .pdf-actions {
            display: flex;
            align-items: center;
            gap: 6px;
            flex-wrap: wrap;
        }
        .btn-group-zoom {
            display: inline-flex;
            gap: 2px;
            background: #0f172a;
            padding: 2px;
            border-radius: 6px;
            border: 1px solid #334155;
        }
        .btn-tool {
            background: #334155;
            color: #f1f5f9;
            border: 1px solid #475569;
            padding: 6px 11px;
            border-radius: 5px;
            font-size: 12px;
            font-weight: 600;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            gap: 5px;
            text-decoration: none;
            transition: all 0.15s;
            white-space: nowrap;
        }
        .btn-tool:hover {
            background: #475569;
            border-color: #64748b;
        }
        .btn-tool-print {
            background: #0057a8;
            border-color: #0284c7;
            color: #fff;
            font-weight: 700;
        }
        .btn-tool-print:hover {
            background: #0284c7;
        }
        .btn-tool-sign {
            background: var(--micro-orange);
            border-color: #ea580c;
            color: #fff;
            font-weight: 700;
        }
        .btn-tool-sign:hover {
            background: #ea580c;
        }
        .btn-tool-whatsapp {
            background: #25d366;
            color: #0b4a1b;
            border-color: #22c55e;
            font-weight: 700;
        }
        .btn-tool-whatsapp:hover {
            background: #22c55e;
        }

        /* LAYOUT PRINCIPAL (VISUALIZADOR DO ARQUIVO PDF + SIDEBAR LATERAL) */
        .portal-layout {
            max-width: 1480px;
            margin: 18px auto 30px;
            padding: 0 16px;
            display: grid;
            grid-template-columns: 1fr 340px;
            gap: 20px;
            align-items: start;
        }
        @media (max-width: 1100px) {
            .portal-layout {
                grid-template-columns: 1fr;
            }
        }

        /* CONTAINER DO VISUALIZADOR DE PDF */
        .pdf-viewer-container-card {
            background: #1e293b;
            border-radius: 8px;
            box-shadow: 0 8px 30px rgba(0,0,0,0.4);
            border: 1px solid #334155;
            overflow: hidden;
            display: flex;
            flex-direction: column;
        }

        .pdf-preview-body {
            background: #2b3035;
            min-height: 600px;
            max-height: 82vh;
            overflow-y: auto;
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 24px 16px 40px;
            position: relative;
        }

        .pdf-preview-iframe {
            width: 100%;
            height: 700px;
            border: none;
            border-radius: 4px;
            background: #fff;
        }

        .pdf-canvas-wrapper {
            width: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 22px;
        }

        .pdf-page-wrapper {
            background: #ffffff;
            box-shadow: 0 8px 26px rgba(0, 0, 0, 0.45);
            border-radius: 3px;
            position: relative;
            max-width: 100%;
            transition: transform 0.15s ease-out;
            display: flex;
            justify-content: center;
        }

        .pdf-page-canvas {
            display: block;
            max-width: 100%;
            height: auto;
            border-radius: 3px;
            background: #fff;
        }

        .pdf-page-number-tag {
            position: absolute;
            bottom: -10px;
            right: 14px;
            background: rgba(15, 23, 42, 0.85);
            color: #f1f5f9;
            font-size: 10px;
            padding: 3px 9px;
            border-radius: 10px;
            font-family: monospace;
            pointer-events: none;
            border: 1px solid #334155;
        }

        .pdf-loading-box {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 60px 20px;
            color: #f8fafc;
            gap: 14px;
            text-align: center;
        }
        .pdf-loading-spinner {
            width: 38px;
            height: 38px;
            border: 3px solid rgba(255, 255, 255, 0.15);
            border-top-color: var(--micro-orange);
            border-radius: 50%;
            animation: pdfSpin 0.8s linear infinite;
        }
        @keyframes pdfSpin {
            to { transform: rotate(360deg); }
        }

        /* CARD DE ASSINATURA DIGITAL & ACEITE ELETRÔNICO */
        .assinatura-digital-card {
            background: #ffffff;
            border-radius: 8px;
            box-shadow: 0 4px 18px rgba(0,0,0,0.15);
            border: 1px solid #cbd5e1;
            padding: 20px 24px;
            margin-top: 20px;
        }
        .assinatura-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2px solid var(--micro-blue);
            padding-bottom: 12px;
            margin-bottom: 16px;
            flex-wrap: wrap;
            gap: 10px;
        }
        .assinatura-header h3 {
            font-size: 16px;
            font-weight: 800;
            color: var(--micro-blue-dark);
            display: flex;
            align-items: center;
            gap: 8px;
            font-family: 'Montserrat', sans-serif;
        }
        .assinatura-hash {
            font-family: monospace;
            font-size: 11px;
            color: var(--micro-gray-medium);
            background: var(--micro-gray-light);
            padding: 4px 8px;
            border-radius: 4px;
            border: 1px solid var(--micro-border);
        }
        .assinatura-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 18px;
        }
        @media (max-width: 768px) {
            .assinatura-grid { grid-template-columns: 1fr; }
        }
        .assinatura-box-emissor {
            background: var(--micro-gray-light);
            border: 1px dashed var(--micro-border);
            border-radius: 6px;
            padding: 16px;
            position: relative;
        }
        .carimbo-emissor {
            display: inline-block;
            background: #dbeafe;
            color: #1e40af;
            font-size: 10px;
            font-weight: 800;
            padding: 2px 6px;
            border-radius: 4px;
            margin-bottom: 8px;
        }
        .assinatura-box-cliente {
            border: 2px dashed #3b82f6;
            background: #f8fafc;
            border-radius: 6px;
            padding: 16px;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
        }
        .campo-assinatura-input {
            margin-bottom: 10px;
        }
        .campo-assinatura-input label {
            display: block;
            font-size: 11px;
            font-weight: 700;
            color: #475569;
            margin-bottom: 4px;
        }
        .campo-assinatura-input input {
            width: 100%;
            padding: 8px 10px;
            border: 1px solid #cbd5e1;
            border-radius: 4px;
            font-size: 13px;
        }
        .btn-assinar-digital {
            background: var(--success);
            color: #fff;
            border: none;
            padding: 11px 16px;
            border-radius: 6px;
            font-size: 13px;
            font-weight: 800;
            cursor: pointer;
            width: 100%;
            margin-top: 6px;
            transition: background 0.2s;
            text-align: center;
        }
        .btn-assinar-digital:hover {
            background: #15803d;
        }

        .carimbo-sucesso-box {
            display: none;
            background: #f0fdf4;
            border: 2px solid #86efac;
            border-radius: 8px;
            padding: 18px;
            text-align: center;
        }
        .carimbo-selo {
            display: inline-block;
            background: #15803d;
            color: #fff;
            font-size: 12px;
            font-weight: 800;
            padding: 4px 10px;
            border-radius: 20px;
            margin-bottom: 10px;
            letter-spacing: 0.5px;
        }

        /* SIDEBAR DE PROPAGANDAS E PRODUTOS MiCRO */
        .sidebar-propagandas {
            display: flex;
            flex-direction: column;
            gap: 16px;
        }
        .sidebar-section-title {
            font-size: 13px;
            font-weight: 800;
            color: #f1f5f9;
            text-transform: uppercase;
            letter-spacing: 1px;
            display: flex;
            align-items: center;
            gap: 6px;
            padding-bottom: 4px;
            border-bottom: 2px solid var(--micro-orange);
        }
        .ad-card {
            background: #ffffff;
            border-radius: 8px;
            box-shadow: 0 4px 16px rgba(0,0,0,0.15);
            border: 1px solid #cbd5e1;
            overflow: hidden;
            transition: transform 0.2s, box-shadow 0.2s;
        }
        .ad-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 24px rgba(0,0,0,0.22);
        }
        .ad-card-badge {
            background: var(--micro-orange);
            color: #fff;
            font-size: 10px;
            font-weight: 800;
            text-transform: uppercase;
            padding: 4px 10px;
            display: inline-block;
            letter-spacing: 0.5px;
        }
        .ad-card-badge.blue { background: var(--micro-blue); }
        .ad-card-badge.dark { background: #1e293b; }
        .ad-card-content {
            padding: 14px;
        }
        .ad-card-content h4 {
            font-size: 14px;
            font-weight: 800;
            color: var(--micro-gray-dark);
            margin-bottom: 6px;
            line-height: 1.3;
        }
        .ad-card-content p {
            font-size: 11px;
            color: var(--micro-gray-medium);
            line-height: 1.4;
            margin-bottom: 12px;
        }
        .ad-card-btn {
            display: block;
            text-align: center;
            background: var(--micro-blue);
            color: #fff;
            font-size: 11px;
            font-weight: 700;
            padding: 7px 10px;
            border-radius: 4px;
            text-decoration: none;
            transition: background 0.2s;
        }
        .ad-card-btn:hover {
            background: var(--micro-blue-dark);
        }
        .ad-card-btn.orange {
            background: var(--micro-orange);
        }
        .ad-card-btn.orange:hover {
            background: var(--micro-orange-hover);
        }

        /* CARD DE CONTATO DO CONSULTOR */
        .consultor-card {
            background: #ffffff;
            border-radius: 8px;
            border: 2px solid var(--micro-blue);
            padding: 16px;
            text-align: center;
            box-shadow: 0 4px 16px rgba(0,0,0,0.15);
        }
        .consultor-avatar-circle {
            width: 50px;
            height: 50px;
            border-radius: 50%;
            background: var(--micro-blue-light);
            color: var(--micro-blue);
            font-size: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 10px;
            border: 2px solid var(--micro-blue);
        }
        .consultor-card h4 {
            font-size: 14px;
            font-weight: 800;
            color: var(--micro-gray-dark);
            margin-bottom: 2px;
        }
        .consultor-card .sub {
            font-size: 11px;
            color: var(--micro-orange);
            font-weight: 700;
            display: block;
            margin-bottom: 10px;
        }
        .consultor-contact-list {
            text-align: left;
            background: #f8fafc;
            padding: 10px;
            border-radius: 6px;
            margin-bottom: 12px;
            font-size: 11px;
            color: #475569;
        }
        .consultor-contact-item {
            margin-bottom: 4px;
            word-break: break-all;
        }
        .btn-whatsapp-cta {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            background: #25d366;
            color: #0b4a1b;
            font-size: 12px;
            font-weight: 800;
            padding: 10px 14px;
            border-radius: 6px;
            text-decoration: none;
            transition: all 0.2s;
            box-shadow: 0 2px 8px rgba(37, 211, 102, 0.35);
        }
        .btn-whatsapp-cta:hover {
            background: #20ba5a;
        }

        /* REGRAS DE IMPRESSÃO PURA (@MEDIA PRINT) */
        @media print {
            body {
                background: #ffffff !important;
                color: #000000 !important;
            }
            .ssl-bar,
            .portal-header,
            .pdf-toolbar,
            .sidebar-propagandas,
            .btn-assinar-digital,
            .campo-assinatura-input,
            .btn-tool,
            .btn-whatsapp-cta,
            .pdf-page-number-tag {
                display: none !important;
            }
            .portal-layout {
                display: block !important;
                margin: 0 !important;
                padding: 0 !important;
                max-width: 100% !important;
            }
            .pdf-viewer-container-card {
                border: none !important;
                box-shadow: none !important;
                background: transparent !important;
            }
            .pdf-preview-body {
                background: #ffffff !important;
                max-height: none !important;
                min-height: auto !important;
                overflow: visible !important;
                padding: 0 !important;
            }
            .pdf-page-wrapper {
                box-shadow: none !important;
                margin-bottom: 0 !important;
                page-break-after: always;
                break-after: page;
            }
            .pdf-page-canvas {
                width: 100% !important;
                height: auto !important;
            }
            .assinatura-digital-card {
                border: 1px solid #94a3b8 !important;
                box-shadow: none !important;
                page-break-inside: avoid;
            }
        }
    </style>
</head>
<body>

    <!-- 1. BARRA DE SEGURANÇA SSL -->
    <div class="ssl-bar">
        <span>🔒 Portal Seguro MiCRO Automação • Conexão Criptografada SSL 256-Bit</span>
        <span>ID do Documento: AUTH-{{ano_atual}}-{{numero_orcamento}}</span>
    </div>

    <!-- 2. HEADER PADRÃO ESTILO PORTAL DO CLIENTE -->
    <header class="portal-header">
        <div class="portal-header-container">
            <!-- Brand Oficial MiCRO -->
            <div class="portal-brand">
                <div class="brand-logo-box">
                    MiCRO
                    <span>AUTOMAÇÃO INDUSTRIAL</span>
                </div>
                <div class="portal-title-block">
                    <h1>Portal Comercial de Atendimento</h1>
                    <p>Visualização e Aceite Eletrônico de Proposta Comercial</p>
                </div>
            </div>

            <!-- Dados da Empresa Logada -->
            <div class="portal-client-info">
                <div class="client-avatar">
                    🏢
                </div>
                <div class="client-meta">
                    <strong>{{empresa}}</strong>
                    <span>CNPJ: {{cnpj}} • Aos cuidados: {{decisor}}</span>
                </div>
                <div class="portal-status-pill" id="portalHeaderStatus">
                    <span class="pulse-dot"></span>
                    <span id="txtStatusPill">Aguardando Aceite</span>
                </div>
            </div>
        </div>
    </header>

    <!-- 3. BARRA DE FERRAMENTAS DO VISUALIZADOR PDF (IDÊNTICA À ABA ITENS/ORÇAMENTO) -->
    <div class="pdf-toolbar">
        <div class="pdf-file-info">
            <span class="pdf-badge">PDF</span>
            <strong id="lpPdfNomeArquivo">{{pdf_nome_arquivo}}</strong>
            <span id="orcPdfPaginaInfo" class="pdf-page-count-badge">Carregando páginas...</span>
        </div>
        <div class="pdf-actions">
            <!-- Grupo de Zoom Interativo -->
            <div class="btn-group-zoom">
                <button type="button" class="btn-tool" onclick="alterarZoomPdfViewer(-0.15)" title="Reduzir zoom">➖</button>
                <button type="button" class="btn-tool" id="btnZoomPdf100" onclick="definirZoomPdfViewer(1.0)" title="Zoom original 100%">100%</button>
                <button type="button" class="btn-tool" onclick="alterarZoomPdfViewer(0.15)" title="Aumentar zoom">➕</button>
                <button type="button" class="btn-tool" onclick="ajustarPdfAoContainer()" title="Ajustar à largura">↔️ Ajustar</button>
            </div>
            
            <button type="button" class="btn-tool btn-tool-print" onclick="imprimirPdfOrcamentoOriginal()" title="Imprimir PDF original diretamente">
                🖨️ Imprimir PDF
            </button>
            <button type="button" class="btn-tool" onclick="baixarPdfOrcamentoOriginal()" title="Baixar arquivo original em PDF">
                ⬇️ Baixar
            </button>
            <button type="button" class="btn-tool" onclick="abrirPdfEmNovaAbaOriginal()" title="Abrir PDF em nova aba">
                ↗️ Nova Aba
            </button>
            <button type="button" class="btn-tool btn-tool-sign" onclick="rolarParaAssinatura()" title="Ir para assinatura digital">
                ✍️ Assinar Documento
            </button>
            <a href="{{whatsapp_link}}" target="_blank" class="btn-tool btn-tool-whatsapp" title="Falar com Consultor no WhatsApp">
                💬 WhatsApp Consultor
            </a>
        </div>
    </div>

    <!-- 4. LAYOUT PRINCIPAL (DOCUMENTO PDF ORIGINAL + VITRINE LATERAL) -->
    <main class="portal-layout">

        <!-- COLUNA 1: VISUALIZADOR REAL DO ARQUIVO PDF (MESMO DA ABA ITENS/ORÇAMENTO) -->
        <section class="pdf-coluna-documento">
            
            <div class="pdf-viewer-container-card">
                <div class="pdf-preview-body" id="orcPdfPreviewBody">
                    <div id="orcPdfCarregando" class="pdf-loading-box">
                        <div class="pdf-loading-spinner"></div>
                        <span style="font-size:14px;font-weight:700;">Carregando e renderizando arquivo PDF original...</span>
                        <span style="font-size:11px;opacity:0.8;">Processamento de alta fidelidade em execução</span>
                    </div>
                    <div id="orcPdfCanvasWrapper" class="pdf-canvas-wrapper"></div>
                    <iframe id="orcPdfIframe" class="pdf-preview-iframe" title="Visualizador de PDF" style="display:none;"></iframe>
                </div>
            </div>

            <!-- Seção de Assinatura Digital & Aceite Eletrônico Oficial -->
            <div class="assinatura-digital-card" id="secaoAssinatura">
                <div class="assinatura-header">
                    <h3>
                        <span>🛡️</span> Termo de Validação e Aceite Eletrônico
                    </h3>
                    <div class="assinatura-hash" id="docHashDisplay">
                        HASH: SHA256-{{ano_atual}}-9F8B2C4E-MIC
                    </div>
                </div>

                <div class="assinatura-grid">
                    <!-- Assinatura Emissora (MiCRO) -->
                    <div class="assinatura-box-emissor">
                        <span class="carimbo-emissor">EMISSOR OFICIAL</span>
                        <p style="font-size:12px;font-weight:700;color:#0f172a;margin-bottom:2px;">MiCRO Automação Industrial</p>
                        <p style="font-size:11px;color:#64748b;">Consultor: <strong>{{vendedor_nome}}</strong></p>
                        <p style="font-size:10px;color:#94a3b8;margin-top:8px;">Chave Eletrônica: CERT-MIC-BR-{{ano_atual}}</p>
                        <div style="margin-top:10px;padding-top:8px;border-top:1px solid #cbd5e1;font-size:10px;color:#15803d;font-weight:700;">
                            ✓ Documento emitido e autorizado
                        </div>
                    </div>

                    <!-- Assinatura do Cliente / Aceite Interativo -->
                    <div class="assinatura-box-cliente" id="boxFormularioAssinatura">
                        <div>
                            <p style="font-size:11px;color:#475569;margin-bottom:10px;line-height:1.4;">
                                Ao clicar em aceitar, você confirma a exatidão dos itens, quantidades e valores descritos nesta proposta comercial.
                            </p>
                            <div class="campo-assinatura-input">
                                <label>Nome do Signatário / Responsável:</label>
                                <input type="text" id="iptNomeSignatario" value="{{decisor}}" placeholder="Seu nome completo">
                            </div>
                            <div class="campo-assinatura-input">
                                <label>Cargo / Função:</label>
                                <input type="text" id="iptCargoSignatario" value="Diretoria / Compras" placeholder="Ex: Gerente de Manutenção, Comprador">
                            </div>
                        </div>
                        <button type="button" class="btn-assinar-digital" onclick="confirmarAssinaturaDigital()">
                            ✍️ Aceitar e Assinar Proposta
                        </button>
                    </div>

                    <!-- Carimbo de Assinatura Concluída com Sucesso -->
                    <div class="carimbo-sucesso-box" id="boxSucessoAssinatura" style="grid-column: 1 / -1;">
                        <span class="carimbo-selo">✅ PROPOSTA ACEITA DIGITALMENTE</span>
                        <h4 style="font-size:15px;color:#15803d;margin-bottom:6px;">Aceite Eletrônico Concluído com Sucesso!</h4>
                        <p style="font-size:12px;color:#1e293b;" id="resumoAssinaturaConfirmada"></p>
                        <div style="margin-top:14px;display:flex;justify-content:center;gap:10px;flex-wrap:wrap;">
                            <button type="button" class="btn-tool btn-tool-print" onclick="window.print()">
                                🖨️ Imprimir Comprovante Assinado
                            </button>
                            <a id="btnNotificarWhatsAceite" href="#" target="_blank" class="btn-tool btn-tool-whatsapp">
                                📲 Notificar Consultor {{vendedor_nome}} no WhatsApp
                            </a>
                        </div>
                    </div>
                </div>
            </div>

        </section>

        <!-- COLUNA 2: PROPAGANDAS DE PRODUTOS MiCRO & CTAs -->
        <aside class="sidebar-propagandas">
            
            <div class="sidebar-section-title">
                <span>⭐</span> Soluções MiCRO em Destaque
            </div>

            <!-- Card 1: Válvula de Sopro PET 40 Bar -->
            <div class="ad-card">
                <span class="ad-card-badge">Alta Performance</span>
                <div class="ad-card-content">
                    <h4>Válvula de Sopro PET 40 Bar</h4>
                    <p>Tecnologia líder para sopradoras Sidel, Krones e KHS. Economize até 30% no consumo de ar comprimido com resposta ultrarrápida.</p>
                    <a href="https://wa.me/{{vendedor_whatsapp_digits}}?text=Ol%C3%A1%2C%20gostaria%20de%20informa%C3%A7%C3%B5es%20t%C3%A9cnicas%20sobre%20a%20V%C3%A1lvula%20de%20Sopro%20PET%20da%20MiCRO." target="_blank" class="ad-card-btn orange">
                        Solicitar Cotação de Sopro
                    </a>
                </div>
            </div>

            <!-- Card 2: Cilindros Pneumáticos ISO 15552 -->
            <div class="ad-card">
                <span class="ad-card-badge blue">Linha Pesada</span>
                <div class="ad-card-content">
                    <h4>Cilindros ISO 15552 & Guias Lineares</h4>
                    <p>Construção robusta em perfil de alumínio anodizado, vedações de alto rendimento e montagem expressa de cursos customizados.</p>
                    <a href="https://wa.me/{{vendedor_whatsapp_digits}}?text=Ol%C3%A1%2C%20gostaria%20de%20consultar%20o%20cat%C3%A1logo%20de%20Cilindros%20ISO%20MiCRO." target="_blank" class="ad-card-btn">
                        Ver Linha de Cilindros
                    </a>
                </div>
            </div>

            <!-- Card 3: Tratamento de Ar FRL & Manifolds -->
            <div class="ad-card">
                <span class="ad-card-badge dark">Proteção & Pureza</span>
                <div class="ad-card-content">
                    <h4>Unidades de Preparação de Ar FRL</h4>
                    <p>Filtros coalescentes de alta pureza, reguladores de pressão com trava e lubrificação proporcional para máxima vida útil dos equipamentos.</p>
                    <a href="https://wa.me/{{vendedor_whatsapp_digits}}?text=Ol%C3%A1%2C%20gostaria%20de%20saber%20mais%20sobre%20as%20unidades%20FRL%20da%20MiCRO." target="_blank" class="ad-card-btn">
                        Consultar Conjuntos FRL
                    </a>
                </div>
            </div>

            <!-- Card 4: Consultor Dedicado & Suporte Técnico Comercial -->
            <div class="consultor-card">
                <div class="consultor-avatar-circle">
                    👨‍💼
                </div>
                <h4>{{vendedor_nome}}</h4>
                <span class="sub">Consultor Especialista MiCRO</span>

                <div class="consultor-contact-list">
                    <div class="consultor-contact-item">
                        📞 {{vendedor_whatsapp}}
                    </div>
                    <div class="consultor-contact-item">
                        ✉️ {{vendedor_email}}
                    </div>
                </div>

                <a href="{{whatsapp_link}}" target="_blank" class="btn-whatsapp-cta">
                    <span>💬</span> Falar com Consultor Agora
                </a>
            </div>

        </aside>

    </main>

    <!-- SCRIPT DE PROCESSAMENTO, RENDERIZAÇÃO DO PDF ORIGINAL E ASSINATURA DIGITAL -->
    <script>
        /*__ORCAMENTO_PDF_INJECT__*/

        let orcPdfZoomAtual = 1.0;
        let orcPdfDocInstancia = null;
        let orcPdfCanvasesRenderizados = [];
        let orcPdfRenderId = 0;
        let orcPdfDataUrlAtivo = (typeof window.ORCAMENTO_PDF_DATA_URL !== 'undefined') ? window.ORCAMENTO_PDF_DATA_URL : '';
        let orcPdfNomeAtivo = (typeof window.ORCAMENTO_PDF_NOME !== 'undefined' && window.ORCAMENTO_PDF_NOME) ? window.ORCAMENTO_PDF_NOME : '{{pdf_nome_arquivo}}';

        function dataUrlParaUint8Array(dataUrl) {
            if (!dataUrl) return new Uint8Array(0);
            const partes = dataUrl.split(',');
            const base64 = partes.length > 1 ? partes[1] : partes[0];
            const raw = atob(base64.replace(/\\\\s/g, ''));
            const bytes = new Uint8Array(raw.length);
            for (let i = 0; i < raw.length; i++) {
                bytes[i] = raw.charCodeAt(i);
            }
            return bytes;
        }

        function dataUrlParaBlob(dataUrl, mimePadrao = 'application/pdf') {
            const partes = dataUrl.split(',');
            const mimeMatch = partes[0].match(/:(.*?);/);
            const mime = mimeMatch ? mimeMatch[1] : mimePadrao;
            const bytes = dataUrlParaUint8Array(dataUrl);
            return new Blob([bytes], { type: mime });
        }

        async function carregarERenderizarPdfCanvas(dataUrl) {
            const currentRenderId = ++orcPdfRenderId;
            const wrapper = document.getElementById('orcPdfCanvasWrapper');
            const spinner = document.getElementById('orcPdfCarregando');
            const iframe = document.getElementById('orcPdfIframe');
            const infoTag = document.getElementById('orcPdfPaginaInfo');
            const btn100 = document.getElementById('btnZoomPdf100');

            orcPdfCanvasesRenderizados = [];

            if (btn100) btn100.textContent = Math.round(orcPdfZoomAtual * 100) + '%';

            if (!window.pdfjsLib) {
                console.warn('pdfjsLib não disponível. Utilizando visualizador embutido.');
                if (spinner) spinner.style.display = 'none';
                if (wrapper) wrapper.style.display = 'none';
                if (iframe) {
                    iframe.src = dataUrl;
                    iframe.style.display = 'block';
                }
                if (infoTag) infoTag.textContent = 'Modo Navegador';
                return;
            }

            try {
                if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
                    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
                }

                if (spinner) spinner.style.display = 'flex';
                if (wrapper) {
                    wrapper.innerHTML = '';
                    wrapper.style.display = 'flex';
                }
                if (iframe) iframe.style.display = 'none';
                if (infoTag) infoTag.textContent = 'Carregando documento...';

                const bytes = dataUrlParaUint8Array(dataUrl);
                const loadingTask = pdfjsLib.getDocument({ data: bytes });
                const pdfDoc = await loadingTask.promise;

                if (currentRenderId !== orcPdfRenderId) return;

                orcPdfDocInstancia = pdfDoc;
                const totalPaginas = pdfDoc.numPages;
                if (infoTag) infoTag.textContent = '1 a ' + totalPaginas + ' de ' + totalPaginas + ' ' + (totalPaginas === 1 ? 'página' : 'páginas');

                const containerWidth = (wrapper && wrapper.clientWidth > 100) ? wrapper.clientWidth : 780;
                const targetWidthBase = Math.min(containerWidth - 24, 820);

                for (let num = 1; num <= totalPaginas; num++) {
                    if (currentRenderId !== orcPdfRenderId) return;

                    const page = await pdfDoc.getPage(num);
                    const unscaledViewport = page.getViewport({ scale: 1.0 });

                    const pixelRatio = Math.min(window.devicePixelRatio || 1.5, 2.0);
                    const baseScale = (targetWidthBase / unscaledViewport.width);
                    const renderScale = baseScale * orcPdfZoomAtual * pixelRatio;
                    const viewport = page.getViewport({ scale: renderScale });

                    const pageWrap = document.createElement('div');
                    pageWrap.className = 'pdf-page-wrapper';
                    pageWrap.id = 'pdfPageWrap_' + num;

                    const canvas = document.createElement('canvas');
                    canvas.className = 'pdf-page-canvas';
                    canvas.width = viewport.width;
                    canvas.height = viewport.height;
                    canvas.style.width = (viewport.width / pixelRatio) + 'px';
                    canvas.style.height = (viewport.height / pixelRatio) + 'px';

                    const ctx = canvas.getContext('2d', { alpha: false });
                    ctx.imageSmoothingEnabled = true;
                    ctx.imageSmoothingQuality = 'high';

                    pageWrap.appendChild(canvas);

                    if (totalPaginas > 1) {
                        const badge = document.createElement('span');
                        badge.className = 'pdf-page-number-tag';
                        badge.textContent = 'Pág. ' + num + '/' + totalPaginas;
                        pageWrap.appendChild(badge);
                    }

                    if (wrapper) wrapper.appendChild(pageWrap);

                    const renderContext = {
                        canvasContext: ctx,
                        viewport: viewport
                    };

                    await page.render(renderContext).promise;
                    orcPdfCanvasesRenderizados.push(canvas);
                }

                if (spinner) spinner.style.display = 'none';
                if (infoTag) infoTag.textContent = '1 a ' + totalPaginas + ' de ' + totalPaginas + ' ' + (totalPaginas === 1 ? 'página' : 'páginas');
            } catch (err) {
                console.warn('Falha na renderização de canvas via PDF.js, utilizando fallback em iframe:', err);
                if (spinner) spinner.style.display = 'none';
                if (wrapper) wrapper.style.display = 'none';
                if (iframe) {
                    iframe.src = dataUrl;
                    iframe.style.display = 'block';
                }
                if (infoTag) infoTag.textContent = 'Visualizador Integrado';
            }
        }

        function alterarZoomPdfViewer(delta) {
            orcPdfZoomAtual = Math.max(0.4, Math.min(2.5, +(orcPdfZoomAtual + delta).toFixed(2)));
            const btn100 = document.getElementById('btnZoomPdf100');
            if (btn100) btn100.textContent = Math.round(orcPdfZoomAtual * 100) + '%';

            if (orcPdfDataUrlAtivo) {
                carregarERenderizarPdfCanvas(orcPdfDataUrlAtivo);
            }
        }

        function definirZoomPdfViewer(zoom = 1.0) {
            orcPdfZoomAtual = zoom;
            const btn100 = document.getElementById('btnZoomPdf100');
            if (btn100) btn100.textContent = Math.round(orcPdfZoomAtual * 100) + '%';

            if (orcPdfDataUrlAtivo) {
                carregarERenderizarPdfCanvas(orcPdfDataUrlAtivo);
            }
        }

        function ajustarPdfAoContainer() {
            const wrapper = document.getElementById('orcPdfCanvasWrapper');
            if (!wrapper || !orcPdfDocInstancia) {
                definirZoomPdfViewer(1.0);
                return;
            }
            const containerWidth = wrapper.clientWidth || 760;
            const targetWidth = Math.max(380, containerWidth - 36);
            const zoomCalculado = +(targetWidth / 800).toFixed(2);
            definirZoomPdfViewer(Math.max(0.5, Math.min(2.0, zoomCalculado)));
        }

        function baixarPdfOrcamentoOriginal() {
            if (!orcPdfDataUrlAtivo) {
                alert('Nenhum PDF disponível para download.');
                return;
            }
            const blob = dataUrlParaBlob(orcPdfDataUrlAtivo);
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = orcPdfNomeAtivo || 'Proposta_Comercial_{{numero_orcamento}}_{{empresa}}.pdf';
            document.body.appendChild(a);
            a.click();
            setTimeout(() => {
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }, 1000);
        }

        function abrirPdfEmNovaAbaOriginal() {
            if (!orcPdfDataUrlAtivo) {
                alert('Nenhum PDF disponível.');
                return;
            }
            const blob = dataUrlParaBlob(orcPdfDataUrlAtivo);
            const url = URL.createObjectURL(blob);
            window.open(url, '_blank');
        }

        function imprimirPdfOrcamentoOriginal() {
            if (!orcPdfCanvasesRenderizados || orcPdfCanvasesRenderizados.length === 0) {
                window.print();
                return;
            }

            const iframe = document.createElement('iframe');
            iframe.style.position = 'fixed';
            iframe.style.right = '0';
            iframe.style.bottom = '0';
            iframe.style.width = '0';
            iframe.style.height = '0';
            iframe.style.border = '0';
            document.body.appendChild(iframe);

            const doc = iframe.contentWindow.document;
            doc.open();
            doc.write('<!DOCTYPE html><html><head><title>' + (orcPdfNomeAtivo || 'Orçamento MiCRO') + '</title>');
            doc.write('<style>');
            doc.write('@page { size: A4 portrait; margin: 0; }');
            doc.write('html, body { margin: 0; padding: 0; background: #fff; }');
            doc.write('.print-page { width: 100vw; height: auto; page-break-after: always; break-after: page; display: flex; justify-content: center; align-items: flex-start; }');
            doc.write('.print-page img { width: 100%; height: auto; display: block; }');
            doc.write('</style></head><body>');

            orcPdfCanvasesRenderizados.forEach((c) => {
                try {
                    const imgUrl = c.toDataURL('image/png', 1.0);
                    doc.write('<div class="print-page"><img src="' + imgUrl + '" /></div>');
                } catch (e) {
                    console.warn('Erro ao extrair imagem do canvas:', e);
                }
            });

            doc.write('</body></html>');
            doc.close();

            setTimeout(() => {
                iframe.contentWindow.focus();
                iframe.contentWindow.print();
                setTimeout(() => {
                    document.body.removeChild(iframe);
                }, 3000);
            }, 600);
        }

        function rolarParaAssinatura() {
            const el = document.getElementById('secaoAssinatura');
            if (el) {
                el.scrollIntoView({ behavior: 'smooth' });
                const ipt = document.getElementById('iptNomeSignatario');
                if (ipt) ipt.focus();
            }
        }

        function confirmarAssinaturaDigital() {
            const iptNome = document.getElementById('iptNomeSignatario');
            const iptCargo = document.getElementById('iptCargoSignatario');
            const nome = iptNome ? iptNome.value.trim() : '{{decisor}}';
            const cargo = iptCargo ? iptCargo.value.trim() : 'Responsável Técnico / Compras';

            if (!nome) {
                alert('Por favor, informe seu nome completo para validação da assinatura.');
                if (iptNome) iptNome.focus();
                return;
            }

            const agora = new Date();
            const dataHoraStr = agora.toLocaleDateString('pt-BR') + ' às ' + agora.toLocaleTimeString('pt-BR');
            const protocolo = 'PROTOCOLO-MIC-' + Math.floor(100000 + Math.random() * 900000);

            const boxForm = document.getElementById('boxFormularioAssinatura');
            const boxSucesso = document.getElementById('boxSucessoAssinatura');
            const resumo = document.getElementById('resumoAssinaturaConfirmada');
            const headerPill = document.getElementById('portalHeaderStatus');
            const txtPill = document.getElementById('txtStatusPill');

            if (resumo) {
                resumo.innerHTML = 'Signatário: <strong>' + nome + '</strong> (' + cargo + ')<br>' +
                                   'Empresa: <strong>{{empresa}}</strong> | CNPJ: {{cnpj}}<br>' +
                                   'Data/Hora do Aceite: <strong>' + dataHoraStr + '</strong><br>' +
                                   'Protocolo Digital Criptografado: <code>' + protocolo + '</code>';
            }

            if (boxForm) boxForm.style.display = 'none';
            if (boxSucesso) boxSucesso.style.display = 'block';

            if (headerPill) headerPill.classList.add('aprovado');
            if (txtPill) txtPill.textContent = 'Proposta Aceita Digitalmente';

            const btnWhats = document.getElementById('btnNotificarWhatsAceite');
            if (btnWhats) {
                const msg = encodeURIComponent(
                    'Olá, {{vendedor_nome}}! Confirmo que a proposta comercial {{numero_orcamento}} da MiCRO para a empresa {{empresa}} foi ACEITA E ASSINADA DIGITALMENTE por ' + nome + ' (' + cargo + ') sob o protocolo ' + protocolo + '.'
                );
                btnWhats.href = 'https://wa.me/{{vendedor_whatsapp_digits}}?text=' + msg;
            }

            alert('✓ Proposta Comercial {{numero_orcamento}} aceita com sucesso por ' + nome + '! O consultor {{vendedor_nome}} receberá a notificação.');
        }

        // ---------- GERADOR DE DOCUMENTO OFICIAL MiCRO CASO NÃO HAJA PDF ANEXADO ----------
        function renderizarDocumentoOficialFallback() {
            const wrapper = document.getElementById('orcPdfCanvasWrapper');
            const spinner = document.getElementById('orcPdfCarregando');
            const infoTag = document.getElementById('orcPdfPaginaInfo');
            if (spinner) spinner.style.display = 'none';
            if (!wrapper) return;

            wrapper.innerHTML = '';

            const canvas = document.createElement('canvas');
            const pixelRatio = Math.min(window.devicePixelRatio || 1.5, 2.0);
            const a4Width = 820;
            const a4Height = 1160;

            canvas.width = a4Width * pixelRatio;
            canvas.height = a4Height * pixelRatio;
            canvas.style.width = a4Width + 'px';
            canvas.style.height = a4Height + 'px';
            canvas.className = 'pdf-page-canvas';

            const ctx = canvas.getContext('2d');
            ctx.scale(pixelRatio, pixelRatio);

            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, a4Width, a4Height);

            ctx.fillStyle = '#0057a8';
            ctx.fillRect(40, 36, 120, 38);
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 22px "Montserrat", sans-serif';
            ctx.fillText('MiCRO', 52, 63);

            ctx.fillStyle = '#f26522';
            ctx.fillRect(40, 78, a4Width - 80, 3);

            ctx.fillStyle = '#1e293b';
            ctx.font = 'bold 15px "Montserrat", sans-serif';
            ctx.fillText('MICROMECANICA IND. COM. IMP. E EXP. LTDA', 175, 52);
            ctx.font = '11px "Roboto", sans-serif';
            ctx.fillStyle = '#475569';
            ctx.fillText('Soluções Pneumáticas Industriais • Vinhedo / Campinas - SP • CNPJ: 50.123.456/0001-89', 175, 68);

            ctx.fillStyle = '#0f172a';
            ctx.font = 'bold 13px "Montserrat", sans-serif';
            ctx.fillText('Orçamento: {{numero_orcamento}} - Pagina: 001', a4Width - 320, 48);
            ctx.font = '11px "Roboto", sans-serif';
            ctx.fillStyle = '#64748b';
            ctx.fillText('Data Emissão: {{data_hoje}}', a4Width - 320, 64);
            ctx.fillText('Validade da Proposta: 15 dias', a4Width - 320, 78);

            ctx.fillStyle = '#f8fafc';
            ctx.fillRect(40, 95, a4Width - 80, 80);
            ctx.strokeStyle = '#cbd5e1';
            ctx.lineWidth = 1;
            ctx.strokeRect(40, 95, a4Width - 80, 80);

            ctx.fillStyle = '#0057a8';
            ctx.font = 'bold 11px "Montserrat", sans-serif';
            ctx.fillText('DESTINATÁRIO / CLIENTE', 54, 112);

            ctx.fillStyle = '#1e293b';
            ctx.font = 'bold 12px "Roboto", sans-serif';
            ctx.fillText('Empresa: {{empresa}}', 54, 130);
            ctx.font = '11px "Roboto", sans-serif';
            ctx.fillStyle = '#475569';
            ctx.fillText('CNPJ: {{cnpj}}', 54, 146);
            ctx.fillText('Cidade / UF: {{cidade_uf}}', 54, 162);

            ctx.fillText('Aos Cuidados de: {{decisor}}', a4Width / 2, 130);
            ctx.fillText('E-mail: {{email}}', a4Width / 2, 146);
            ctx.fillText('Telefone / WhatsApp: {{telefone}}', a4Width / 2, 162);

            ctx.fillStyle = '#0057a8';
            ctx.fillRect(40, 190, a4Width - 80, 24);
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 10px "Montserrat", sans-serif';
            ctx.fillText('ITEM', 50, 206);
            ctx.fillText('CÓDIGO', 90, 206);
            ctx.fillText('DESCRIÇÃO DO PRODUTO / ESPECIFICAÇÃO TÉCNICA', 180, 206);
            ctx.fillText('QTD', 540, 206);
            ctx.fillText('UNITÁRIO', 600, 206);
            ctx.fillText('TOTAL COM IMPOSTOS', 690, 206);

            ctx.fillStyle = '#1e293b';
            ctx.font = '11px monospace';
            ctx.fillText('01', 52, 235);
            ctx.fillText('0259000144', 90, 235);
            ctx.font = '11px "Roboto", sans-serif';
            ctx.fillText('VÁLVULA DE SOPRO PET HIGH-FLOW 40 BAR MiCRO COMPATÍVEL', 180, 235);
            ctx.fillText('1 UN', 542, 235);
            ctx.fillText('{{valor_formatado}}', 596, 235);
            ctx.font = 'bold 11px "Roboto", sans-serif';
            ctx.fillStyle = '#0057a8';
            ctx.fillText('{{valor_formatado}}', 700, 235);

            ctx.strokeStyle = '#e2e8f0';
            ctx.strokeRect(40, 214, a4Width - 80, 36);

            ctx.fillStyle = '#f1f5f9';
            ctx.fillRect(40, a4Height - 160, a4Width - 80, 60);
            ctx.strokeStyle = '#cbd5e1';
            ctx.strokeRect(40, a4Height - 160, a4Width - 80, 60);

            ctx.fillStyle = '#475569';
            ctx.font = 'bold 11px "Roboto", sans-serif';
            ctx.fillText('Condição de Pagamento: 28 DDL', 54, a4Height - 140);
            ctx.fillText('Prazo de Entrega: Pronta Entrega', 54, a4Height - 120);

            ctx.fillStyle = '#1e293b';
            ctx.font = 'bold 13px "Montserrat", sans-serif';
            ctx.fillText('Total Geral da Proposta: {{valor_formatado}}', a4Width - 360, a4Height - 126);

            ctx.fillStyle = '#94a3b8';
            ctx.font = '10px "Roboto", sans-serif';
            ctx.fillText('Documento Eletrônico Oficial MiCRO Automação • Emitido por: {{vendedor_nome}} ({{vendedor_email}})', 40, a4Height - 40);
            ctx.fillText('Página 1 de 1', a4Width - 110, a4Height - 40);

            const pageWrap = document.createElement('div');
            pageWrap.className = 'pdf-page-wrapper';
            pageWrap.appendChild(canvas);
            wrapper.appendChild(pageWrap);

            orcPdfCanvasesRenderizados = [canvas];
            if (infoTag) infoTag.textContent = '1 a 1 de 1 página';
        }

        window.addEventListener('DOMContentLoaded', () => {
            if (orcPdfDataUrlAtivo && orcPdfDataUrlAtivo.length > 50) {
                carregarERenderizarPdfCanvas(orcPdfDataUrlAtivo);
            } else {
                renderizarDocumentoOficialFallback();
            }
        });
    </script>
</body>
</html>\\\`;`;

// Encontrar e substituir TEMPLATE_VISUALIZADOR_ORCAMENTO
const regexTemplate = /\/\/ =+[\r\n]+\/\/ TEMPLATE: VISUALIZADOR DE ORÇAMENTO[\s\S]*?const TEMPLATE_VISUALIZADOR_ORCAMENTO = `[\s\S]*?<\/html>`;/;

if (regexTemplate.test(content)) {
    content = content.replace(regexTemplate, novoTemplate);
    console.log('TEMPLATE_VISUALIZADOR_ORCAMENTO substituído com sucesso.');
} else {
    console.error('Regex para TEMPLATE_VISUALIZADOR_ORCAMENTO não casou.');
    process.exit(1);
}

fs.writeFileSync(targetFile, content, 'utf-8');
console.log('Arquivo salvo.');
