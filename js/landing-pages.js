// ================================================================
// LANDING PAGES PERSONALIZADAS DOS LEADS (JIT - JUST IN TIME)
// Portal do Cliente sob Login (E-mail) e Senha (CNPJ)
// ================================================================

// Template padrão oficial MiCRO Automação (Válvula de Sopro PET)
const TEMPLATE_PADRAO_SOPRO_PET = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nova Válvula de Sopro PET | MiCRO Automação - Proposta Exclusiva {{empresa}}</title>
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;600;700;800;900&family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        :root {
            --micro-blue: #0057a8;
            --micro-blue-dark: #003d75;
            --micro-orange: #f26522;
            --micro-orange-light: #ff7a33;
            --micro-black: #1a1a1a;
            --micro-dark: #2d2d2d;
            --micro-gray: #6b6b6b;
            --micro-light: #f5f5f5;
            --micro-white: #ffffff;
            --success: #28a745;
        }
        body {
            font-family: 'Roboto', sans-serif;
            line-height: 1.6;
            color: var(--micro-dark);
            overflow-x: hidden;
            background: #fff;
        }
        h1, h2, h3, h4, h5 { font-family: 'Montserrat', sans-serif; }
        .container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
        
        .navbar {
            background: var(--micro-white);
            padding: 15px 0;
            position: fixed;
            width: 100%;
            top: 0;
            z-index: 1000;
            box-shadow: 0 2px 15px rgba(0,0,0,0.1);
            border-bottom: 3px solid var(--micro-orange);
        }
        .navbar .container {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .logo-micro {
            display: flex;
            align-items: center;
            gap: 12px;
            text-decoration: none;
        }
        .logo-blue {
            background: var(--micro-blue);
            color: white;
            padding: 8px 18px;
            font-family: 'Montserrat', sans-serif;
            font-weight: 900;
            font-size: 1.6em;
            letter-spacing: 2px;
            border-radius: 4px;
        }
        .logo-blue span {
            font-weight: 400;
            font-size: 0.5em;
            display: block;
            letter-spacing: 3px;
            text-transform: lowercase;
        }
        .nav-cta {
            background: var(--micro-orange);
            color: white;
            padding: 12px 28px;
            border-radius: 4px;
            text-decoration: none;
            font-weight: 700;
            font-size: 0.9em;
            transition: all 0.3s;
            font-family: 'Montserrat', sans-serif;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .nav-cta:hover {
            background: var(--micro-orange-light);
            transform: translateY(-2px);
            box-shadow: 0 4px 15px rgba(242, 101, 34, 0.4);
        }
        
        .hero {
            background: linear-gradient(135deg, var(--micro-black) 0%, var(--micro-dark) 100%);
            color: white;
            padding: 140px 0 80px;
            position: relative;
            overflow: hidden;
        }
        .hero::before {
            content: '';
            position: absolute;
            top: 0; left: 0; right: 0; bottom: 0;
            background: 
                radial-gradient(circle at 20% 50%, rgba(0, 87, 168, 0.35) 0%, transparent 50%),
                radial-gradient(circle at 80% 50%, rgba(242, 101, 34, 0.25) 0%, transparent 50%);
        }
        .hero-content {
            display: grid;
            grid-template-columns: 1.1fr 0.9fr;
            gap: 50px;
            align-items: center;
            position: relative;
            z-index: 1;
        }
        .hero-text .badge-exclusive {
            display: inline-block;
            background: var(--micro-orange);
            color: white;
            padding: 8px 20px;
            border-radius: 4px;
            font-weight: 700;
            font-size: 0.85em;
            text-transform: uppercase;
            letter-spacing: 2px;
            margin-bottom: 25px;
            font-family: 'Montserrat', sans-serif;
            box-shadow: 0 4px 12px rgba(242, 101, 34, 0.3);
        }
        .hero h1 {
            font-size: 3em;
            font-weight: 900;
            line-height: 1.15;
            margin-bottom: 20px;
            text-transform: uppercase;
        }
        .hero h1 .highlight-orange { color: var(--micro-orange); display: block; }
        .hero h1 .highlight-blue {
            color: var(--micro-blue);
            background: white;
            padding: 4px 16px;
            display: inline-block;
            border-radius: 4px;
            font-size: 0.7em;
            letter-spacing: 1px;
            vertical-align: middle;
            margin-top: 6px;
        }
        .hero .subtitle {
            font-size: 1.25em;
            margin-bottom: 30px;
            opacity: 0.95;
            font-weight: 300;
            line-height: 1.5;
        }
        .hero-benefits {
            display: flex;
            flex-wrap: wrap;
            gap: 12px;
            margin-bottom: 35px;
        }
        .hero-benefit {
            background: rgba(255,255,255,0.12);
            padding: 10px 18px;
            border-radius: 4px;
            font-size: 0.9em;
            border-left: 3px solid var(--micro-orange);
            font-family: 'Montserrat', sans-serif;
            font-weight: 600;
        }
        .hero-buttons { display: flex; gap: 15px; flex-wrap: wrap; }
        .cta-button {
            display: inline-block;
            background: var(--micro-orange);
            color: white;
            padding: 16px 32px;
            border-radius: 4px;
            text-decoration: none;
            font-weight: 700;
            font-size: 0.95em;
            transition: all 0.3s;
            font-family: 'Montserrat', sans-serif;
            text-transform: uppercase;
            letter-spacing: 1px;
            border: none;
            cursor: pointer;
            text-align: center;
        }
        .cta-button:hover {
            transform: translateY(-3px);
            box-shadow: 0 6px 25px rgba(242, 101, 34, 0.45);
            background: var(--micro-orange-light);
        }
        .cta-button.blue { background: var(--micro-blue); }
        .cta-button.blue:hover {
            background: var(--micro-blue-dark);
            box-shadow: 0 6px 25px rgba(0, 87, 168, 0.45);
        }
        .cta-button.outline {
            background: transparent;
            border: 2px solid white;
        }
        .cta-button.outline:hover {
            background: white;
            color: var(--micro-black);
        }
        .hero-image {
            position: relative;
            display: flex;
            justify-content: center;
            align-items: center;
        }
        .valve-card-showcase {
            width: 100%;
            background: linear-gradient(145deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02));
            border: 1px solid rgba(255,255,255,0.15);
            border-radius: 12px;
            padding: 30px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.6);
            text-align: center;
        }
        .valve-svg-wrap {
            width: 100%;
            max-width: 320px;
            margin: 0 auto 15px;
        }
        .badge-nacional {
            position: absolute;
            top: -15px;
            left: -15px;
            background: var(--micro-orange);
            color: white;
            width: 95px;
            height: 95px;
            border-radius: 50%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            font-weight: 900;
            font-size: 0.72em;
            text-transform: uppercase;
            font-family: 'Montserrat', sans-serif;
            box-shadow: 0 5px 20px rgba(242, 101, 34, 0.5);
            animation: pulse 2s infinite;
            text-align: center;
            line-height: 1.2;
            z-index: 2;
        }
        @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.06); }
        }
        .badge-nacional span { font-size: 1.35em; }
        
        .social-proof {
            background: var(--micro-blue);
            color: white;
            padding: 36px 0;
        }
        .social-proof-content {
            display: flex;
            justify-content: space-around;
            align-items: center;
            flex-wrap: wrap;
            gap: 25px;
        }
        .proof-item { text-align: center; }
        .proof-number {
            font-size: 2.8em;
            font-weight: 900;
            color: var(--micro-orange);
            font-family: 'Montserrat', sans-serif;
            line-height: 1;
        }
        .proof-label {
            font-size: 0.85em;
            opacity: 0.95;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-top: 5px;
            font-family: 'Montserrat', sans-serif;
            font-weight: 600;
        }
        
        .problem { padding: 80px 0; background: var(--micro-light); }
        .section-header { text-align: center; margin-bottom: 50px; }
        .section-header .tag {
            display: inline-block;
            background: var(--micro-orange);
            color: white;
            padding: 6px 18px;
            border-radius: 4px;
            font-size: 0.8em;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 2px;
            margin-bottom: 15px;
            font-family: 'Montserrat', sans-serif;
        }
        .section-header h2 {
            font-size: 2.4em;
            color: var(--micro-black);
            margin-bottom: 12px;
            text-transform: uppercase;
        }
        .section-header p {
            font-size: 1.15em;
            color: var(--micro-gray);
            max-width: 700px;
            margin: 0 auto;
        }
        .problem-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 25px;
        }
        .problem-card {
            background: white;
            padding: 35px 30px;
            border-radius: 8px;
            box-shadow: 0 5px 20px rgba(0,0,0,0.06);
            border-top: 4px solid var(--micro-orange);
            transition: transform 0.3s;
        }
        .problem-card:hover { transform: translateY(-6px); }
        .problem-card .icon { font-size: 2.5em; margin-bottom: 15px; }
        .problem-card h3 {
            color: var(--micro-black);
            margin-bottom: 10px;
            font-size: 1.25em;
            text-transform: uppercase;
        }
        
        .solution { padding: 80px 0; background: white; }
        .solution-content {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 60px;
            align-items: center;
        }
        .solution-text h2 {
            font-size: 2.3em;
            color: var(--micro-black);
            margin-bottom: 18px;
            text-transform: uppercase;
        }
        .solution-text h2 span { color: var(--micro-orange); }
        .solution-text .lead {
            font-size: 1.1em;
            color: var(--micro-gray);
            margin-bottom: 25px;
        }
        .feature-list { list-style: none; }
        .feature-list li {
            padding: 12px 0;
            display: flex;
            align-items: center;
            gap: 15px;
            font-size: 1.05em;
            border-bottom: 1px solid #eee;
        }
        .feature-list li:last-child { border-bottom: none; }
        .feature-list .check {
            background: var(--micro-blue);
            color: white;
            width: 28px;
            height: 28px;
            border-radius: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            flex-shrink: 0;
            font-family: 'Montserrat', sans-serif;
            font-size: 0.9em;
        }
        
        .compatibility {
            padding: 80px 0;
            background: var(--micro-black);
            color: white;
        }
        .compatibility-content {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 50px;
            align-items: center;
        }
        .compatibility-box {
            background: rgba(255,255,255,0.05);
            border: 2px solid var(--micro-orange);
            border-radius: 8px;
            padding: 30px;
            text-align: center;
        }
        .compatibility-text h3 {
            font-size: 2.1em;
            margin-bottom: 20px;
            text-transform: uppercase;
        }
        .compatibility-text h3 span { color: var(--micro-orange); }
        .compatibility-text p {
            font-size: 1.1em;
            margin-bottom: 18px;
            opacity: 0.92;
            line-height: 1.7;
        }
        .norgren-badge {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            background: rgba(255,255,255,0.1);
            padding: 10px 18px;
            border-radius: 4px;
            font-weight: 600;
            margin: 5px 6px 5px 0;
            border: 1px solid rgba(255,255,255,0.2);
            font-family: 'Montserrat', sans-serif;
            font-size: 0.9em;
        }
        .norgren-badge .dot { width: 8px; height: 8px; background: var(--success); border-radius: 50%; }
        
        .advantages { padding: 80px 0; background: var(--micro-light); }
        .advantages-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 25px;
        }
        .advantage-card {
            background: white;
            padding: 35px 25px;
            border-radius: 8px;
            box-shadow: 0 8px 30px rgba(0,0,0,0.06);
            text-align: center;
            transition: all 0.3s;
            border-bottom: 4px solid transparent;
        }
        .advantage-card:hover {
            transform: translateY(-6px);
            border-bottom-color: var(--micro-orange);
            box-shadow: 0 12px 40px rgba(0,0,0,0.12);
        }
        .advantage-icon { font-size: 2.8em; margin-bottom: 15px; }
        .advantage-card h3 {
            color: var(--micro-black);
            margin-bottom: 12px;
            font-size: 1.25em;
            text-transform: uppercase;
        }
        .advantage-card p { color: var(--micro-gray); line-height: 1.65; }
        .advantage-tag {
            display: inline-block;
            background: var(--micro-blue);
            color: white;
            padding: 6px 14px;
            border-radius: 4px;
            font-weight: 700;
            font-size: 0.78em;
            margin-top: 15px;
            font-family: 'Montserrat', sans-serif;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .price-card {
            background: linear-gradient(135deg, var(--micro-orange), var(--micro-orange-light));
            color: white;
        }
        .price-card h3 { color: white; }
        .price-card p { color: rgba(255,255,255,0.95); }
        .price-tag {
            display: inline-block;
            background: white;
            color: var(--micro-orange);
            padding: 6px 16px;
            border-radius: 4px;
            font-weight: 800;
            font-size: 0.9em;
            margin-top: 15px;
            font-family: 'Montserrat', sans-serif;
        }
        
        /* SEÇÃO ITENS / PROPOSTA PERSONALIZADA (JIT) */
        .proposta-itens-section {
            padding: 70px 0;
            background: #fff;
            border-top: 1px solid #eaeaea;
        }
        .proposta-box {
            background: #fafafa;
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            padding: 30px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.05);
        }
        .itens-tabela-custom {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            font-size: 0.95em;
        }
        .itens-tabela-custom th {
            background: var(--micro-blue);
            color: white;
            text-align: left;
            padding: 12px 16px;
            font-family: 'Montserrat', sans-serif;
            font-size: 0.85em;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .itens-tabela-custom td {
            padding: 12px 16px;
            border-bottom: 1px solid #e5e5e5;
            color: #333;
        }
        .itens-tabela-custom tr:nth-child(even) { background: #fdfdfd; }
        
        .personal-message {
            background: var(--micro-light);
            padding: 60px 0;
            border-top: 4px solid var(--micro-orange);
            border-bottom: 4px solid var(--micro-orange);
        }
        .personal-message .container { max-width: 850px; }
        .message-box {
            background: white;
            padding: 40px;
            border-radius: 8px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.08);
            border-left: 5px solid var(--micro-blue);
        }
        .message-box h3 {
            color: var(--micro-black);
            font-size: 1.45em;
            margin-bottom: 15px;
            text-transform: uppercase;
        }
        .message-box p {
            font-size: 1.08em;
            color: var(--micro-gray);
            line-height: 1.75;
            margin-bottom: 15px;
        }
        .message-box .signature {
            margin-top: 25px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            font-family: 'Montserrat', sans-serif;
        }
        .message-box .signature strong { color: var(--micro-blue); font-size: 1.15em; }
        .message-box .signature .role { color: var(--micro-gray); font-size: 0.9em; line-height: 1.5; display: block; }
        
        .cta-final {
            padding: 90px 0;
            background: linear-gradient(135deg, var(--micro-blue) 0%, var(--micro-blue-dark) 100%);
            color: white;
            text-align: center;
            position: relative;
        }
        .cta-final h2 {
            font-size: 2.6em;
            margin-bottom: 15px;
            font-weight: 900;
            text-transform: uppercase;
        }
        .cta-final h2 span { color: var(--micro-orange); }
        .cta-final .subtitle {
            font-size: 1.25em;
            margin-bottom: 30px;
            opacity: 0.95;
        }
        .urgency-box {
            background: var(--micro-orange);
            color: white;
            padding: 14px 35px;
            border-radius: 4px;
            display: inline-block;
            margin: 15px 0 25px;
            font-weight: 700;
            font-size: 1em;
            font-family: 'Montserrat', sans-serif;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .cta-buttons-final {
            display: flex;
            gap: 18px;
            justify-content: center;
            flex-wrap: wrap;
            margin-top: 20px;
        }
        .guarantee {
            margin-top: 35px;
            display: flex;
            justify-content: center;
            gap: 30px;
            flex-wrap: wrap;
        }
        .guarantee-item {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 0.9em;
            opacity: 0.9;
            font-family: 'Montserrat', sans-serif;
            font-weight: 600;
        }
        .guarantee-item .check { color: var(--micro-orange); font-size: 1.2em; font-weight: bold; }
        
        footer {
            background: var(--micro-black);
            color: white;
            padding: 50px 0 25px;
        }
        .footer-content {
            display: grid;
            grid-template-columns: 2fr 1fr 1fr;
            gap: 40px;
            margin-bottom: 35px;
        }
        .footer-brand .logo-blue { display: inline-block; margin-bottom: 15px; }
        .footer-brand p { opacity: 0.8; font-size: 0.92em; line-height: 1.7; }
        .footer-links h4 {
            margin-bottom: 15px;
            color: var(--micro-orange);
            text-transform: uppercase;
            font-family: 'Montserrat', sans-serif;
            font-size: 0.95em;
            letter-spacing: 1px;
        }
        .footer-links ul { list-style: none; }
        .footer-links li { padding: 6px 0; }
        .footer-links a { color: white; text-decoration: none; opacity: 0.8; font-size: 0.9em; transition: opacity 0.2s; }
        .footer-links a:hover { opacity: 1; color: var(--micro-orange); }
        .footer-bottom {
            border-top: 1px solid rgba(255,255,255,0.1);
            padding-top: 25px;
            text-align: center;
            opacity: 0.7;
            font-size: 0.82em;
        }
        
        @media (max-width: 868px) {
            .hero-content, .solution-content, .compatibility-content, .footer-content { grid-template-columns: 1fr; }
            .hero h1 { font-size: 2.2em; }
            .hero { padding: 110px 0 60px; }
            .badge-nacional { width: 75px; height: 75px; font-size: 0.6em; }
        }
    </style>
</head>
<body>

    <!-- NAVBAR -->
    <nav class="navbar">
        <div class="container">
            <div class="logo-micro">
                <div class="logo-blue">
                    MiCRO
                    <span>automação</span>
                </div>
            </div>
            <a href="#proposta" class="nav-cta">Solicitar Proposta</a>
        </div>
    </nav>

    <!-- HERO SECTION -->
    <section class="hero">
        <div class="container">
            <div class="hero-content">
                <div class="hero-text">
                    <span class="badge-exclusive">🎯 Proposta Exclusiva para {{empresa}}</span>
                    <h1>
                        NOVA VÁLVULA DE
                        <span class="highlight-orange">SOPRO PET</span>
                        <span class="highlight-blue">Produto Nacional</span>
                    </h1>
                    <p class="subtitle">
                        Manutenção simples e de <strong>baixo custo</strong> dos reparos. 
                        Tecnologia validada com foco em praticidade, custo e tempo de manutenção.
                    </p>
                    <div class="hero-benefits">
                        <span class="hero-benefit">✓ Fácil Instalação</span>
                        <span class="hero-benefit">✓ Alta Vazão</span>
                        <span class="hero-benefit">✓ 1W Consumo</span>
                        <span class="hero-benefit">✓ Preço Imbatível</span>
                    </div>
                    <div class="hero-buttons">
                        <a href="#proposta" class="cta-button">QUERO UMA PROPOSTA</a>
                        <a href="https://web.whatsapp.com/send?phone={{vendedor_whatsapp_digits}}&text=Ol%C3%A1%20{{vendedor_nome}},%20sou%20da%20{{empresa}}%20e%20gostaria%20de%20saber%20mais%20sobre%20as%20v%C3%A1lvulas%20de%20sopro%20PET." class="cta-button outline" target="_blank">FALAR COM {{vendedor_nome}}</a>
                    </div>
                </div>
                <div class="hero-image">
                    <div class="valve-card-showcase">
                        <div class="valve-svg-wrap">
                            <!-- SVG de Alta Definição da Válvula Industrial MiCRO -->
                            <svg viewBox="0 0 320 280" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;filter:drop-shadow(0 15px 25px rgba(0,0,0,0.5));">
                                <rect x="70" y="70" width="180" height="150" rx="14" fill="#2d3748" stroke="#4a5568" stroke-width="4"/>
                                <rect x="95" y="40" width="130" height="35" rx="6" fill="#0057a8" stroke="#003d75" stroke-width="3"/>
                                <rect x="135" y="15" width="50" height="28" rx="4" fill="#f26522"/>
                                <circle cx="160" cy="29" r="6" fill="#ffffff"/>
                                <rect x="90" y="95" width="140" height="100" rx="8" fill="#1a202c"/>
                                <text x="160" y="135" fill="#f26522" font-family="Montserrat, sans-serif" font-weight="900" font-size="15" text-anchor="middle" letter-spacing="2">MiCRO PET</text>
                                <text x="160" y="155" fill="#ffffff" font-family="Roboto, sans-serif" font-weight="500" font-size="11" text-anchor="middle">SOPRO HIGH-FLOW 40 BAR</text>
                                <circle cx="160" cy="175" r="7" fill="#28a745"/>
                                <rect x="30" y="125" width="45" height="40" rx="6" fill="#718096" stroke="#4a5568" stroke-width="3"/>
                                <rect x="245" y="125" width="45" height="40" rx="6" fill="#718096" stroke="#4a5568" stroke-width="3"/>
                                <rect x="120" y="215" width="80" height="35" rx="6" fill="#4a5568"/>
                                <circle cx="140" cy="232" r="6" fill="#cbd5e0"/>
                                <circle cx="180" cy="232" r="6" fill="#cbd5e0"/>
                            </svg>
                        </div>
                        <div style="font-family:'Montserrat',sans-serif;font-weight:700;font-size:1.05em;color:#fff;">Válvula de Sopro PET MiCRO</div>
                        <div style="font-size:0.85em;color:#cbd5e0;margin-top:4px;">Alta vazão • Baixo consumo 1W • Compatibilidade Norgren</div>
                    </div>
                    <div class="badge-nacional">
                        <span>PRODUTO</span>
                        NACIONAL
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- SOCIAL PROOF BAR -->
    <section class="social-proof">
        <div class="container">
            <div class="social-proof-content">
                <div class="proof-item">
                    <div class="proof-number">60%</div>
                    <div class="proof-label">Menos Manutenção</div>
                </div>
                <div class="proof-item">
                    <div class="proof-number">+50</div>
                    <div class="proof-label">Plantas Equipadas</div>
                </div>
                <div class="proof-item">
                    <div class="proof-number">24h</div>
                    <div class="proof-label">Peças de Reposição</div>
                </div>
                <div class="proof-item">
                    <div class="proof-number">100%</div>
                    <div class="proof-label">Compatível Norgren</div>
                </div>
            </div>
        </div>
    </section>

    <!-- PROBLEM SECTION -->
    <section class="problem">
        <div class="container">
            <div class="section-header">
                <span class="tag">Diagnóstico</span>
                <h2>Sua operação enfrenta esses desafios?</h2>
                <p>Se você usa válvulas de sopro convencionais, provavelmente já lidou com:</p>
            </div>
            <div class="problem-grid">
                <div class="problem-card">
                    <div class="icon">⏱️</div>
                    <h3>Tempo de Parada Elevado</h3>
                    <p>Manutenções complexas que param sua produção por horas, gerando prejuízo e atrasos na entrega.</p>
                </div>
                <div class="problem-card">
                    <div class="icon">💸</div>
                    <h3>Custo de Reposição Alto</h3>
                    <p>Peças importadas com preços elevados e lead time longo, impactando seu orçamento operacional.</p>
                </div>
                <div class="problem-card">
                    <div class="icon">⚙️</div>
                    <h3>Complexidade na Troca</h3>
                    <p>Instalações complicadas que exigem mão de obra especializada e tempo precioso da equipe.</p>
                </div>
            </div>
        </div>
    </section>

    <!-- SOLUTION SECTION -->
    <section class="solution">
        <div class="container">
            <div class="solution-content">
                <div class="solution-text">
                    <h2>A Solução Definitiva para <span>Sua Linha PET</span></h2>
                    <p class="lead">
                        Nossa válvula de sopro PET foi desenvolvida com foco em <strong>praticidade, custo e tempo de manutenção</strong>. 
                        Tecnologia validada em diversas plantas industriais, funcionando em conjunto com Norgren.
                    </p>
                    <ul class="feature-list">
                        <li>
                            <span class="check">✓</span>
                            <span><strong>Fácil Instalação</strong> - Plug and play, sem complicações</span>
                        </li>
                        <li>
                            <span class="check">✓</span>
                            <span><strong>Construção Robusta</strong> - Durabilidade comprovada em campo</span>
                        </li>
                        <li>
                            <span class="check">✓</span>
                            <span><strong>Alta Capacidade de Vazão</strong> - Performance superior</span>
                        </li>
                        <li>
                            <span class="check">✓</span>
                            <span><strong>Alta Eficiência e Repetibilidade</strong> - Qualidade constante</span>
                        </li>
                        <li>
                            <span class="check">✓</span>
                            <span><strong>Excelente Tempo de Resposta</strong> - Precisão em cada ciclo</span>
                        </li>
                        <li>
                            <span class="check">✓</span>
                            <span><strong>Sistema por Despressurização</strong> - Tecnologia avançada</span>
                        </li>
                        <li>
                            <span class="check">✓</span>
                            <span><strong>Baixo Consumo (1W)</strong> - Economia de energia contínua</span>
                        </li>
                    </ul>
                </div>
                <div>
                    <div style="background:#f8f9fa;border:1px solid #e2e8f0;border-radius:12px;padding:35px;box-shadow:0 10px 30px rgba(0,0,0,0.06);">
                        <div style="font-family:'Montserrat',sans-serif;font-weight:800;font-size:1.4em;color:var(--micro-blue);margin-bottom:15px;text-transform:uppercase;">
                            Destaques Técnicos MiCRO
                        </div>
                        <p style="color:var(--micro-gray);margin-bottom:20px;">
                            Projetada para suportar a cadência agressiva das sopradoras industriais rotativas e lineares mais exigentes do Brasil.
                        </p>
                        <div style="display:grid;grid-template-columns:1fr 1fr;gap:15px;">
                            <div style="background:#fff;padding:15px;border-radius:6px;border-left:4px solid var(--micro-blue);">
                                <div style="font-size:0.8em;color:#888;text-transform:uppercase;font-weight:700;">Pressão de Trabalho</div>
                                <strong style="color:var(--micro-dark);font-size:1.1em;">Até 40 Bar</strong>
                            </div>
                            <div style="background:#fff;padding:15px;border-radius:6px;border-left:4px solid var(--micro-orange);">
                                <div style="font-size:0.8em;color:#888;text-transform:uppercase;font-weight:700;">Consumo Elétrico</div>
                                <strong style="color:var(--micro-dark);font-size:1.1em;">Apenas 1W</strong>
                            </div>
                            <div style="background:#fff;padding:15px;border-radius:6px;border-left:4px solid var(--success);">
                                <div style="font-size:0.8em;color:#888;text-transform:uppercase;font-weight:700;">Manutenção</div>
                                <strong style="color:var(--micro-dark);font-size:1.1em;">Reparo Fácil</strong>
                            </div>
                            <div style="background:#fff;padding:15px;border-radius:6px;border-left:4px solid var(--micro-blue);">
                                <div style="font-size:0.8em;color:#888;text-transform:uppercase;font-weight:700;">Garantia & Suporte</div>
                                <strong style="color:var(--micro-dark);font-size:1.1em;">Nacional Direto</strong>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- COMPATIBILITY SECTION -->
    <section class="compatibility">
        <div class="container">
            <div class="section-header">
                <span class="tag" style="background: var(--micro-blue);">Compatibilidade</span>
                <h2 style="color:#fff;">Funciona com Seu Parque Atual</h2>
                <p style="color:rgba(255,255,255,0.85);">Instalada e operando em conjunto com sistemas Norgren em diversas plantas</p>
            </div>
            <div class="compatibility-content">
                <div class="compatibility-box">
                    <div style="font-family:'Montserrat',sans-serif;font-weight:900;font-size:1.8em;color:var(--micro-orange);margin-bottom:12px;">
                        100% PLUG & PLAY
                    </div>
                    <p style="opacity:0.9;font-size:1.05em;margin-bottom:20px;">
                        Substituição direta sem necessidade de adaptações estruturais ou alterações mecânicas no bloco de sopro.
                    </p>
                    <div style="display:flex;justify-content:center;gap:10px;flex-wrap:wrap;">
                        <span class="norgren-badge"><span class="dot"></span> Compatível Norgren</span>
                        <span class="norgren-badge"><span class="dot"></span> Plug & Play</span>
                        <span class="norgren-badge"><span class="dot"></span> Sem Adaptações</span>
                    </div>
                </div>
                <div class="compatibility-text">
                    <h3>{{decisor}}, <span>Já Estamos na Sua Planta!</span></h3>
                    <p>
                        Acreditamos que a <strong>{{empresa}}</strong> já possui ou tem total afinidade com a tecnologia das nossas válvulas em operação, 
                        inclusive funcionando em conjunto com sistemas <strong>Norgren</strong>.
                    </p>
                    <p>
                        Que tal expandir essa tecnologia para toda a sua linha de produção e 
                        colher os benefícios em escala? Preço realmente imbatível pelo que entregamos.
                    </p>
                    <a href="#proposta" class="cta-button" style="margin-top: 15px;">
                        EXPANDIR PARA TODA LINHA
                    </a>
                </div>
            </div>
        </div>
    </section>

    <!-- ADVANTAGES SECTION -->
    <section class="advantages">
        <div class="container">
            <div class="section-header">
                <span class="tag">Diferenciais</span>
                <h2>Vantagens Competitivas Reais</h2>
                <p>Não é só discurso. São resultados que impactam seu bottom line:</p>
            </div>
            <div class="advantages-grid">
                <div class="advantage-card price-card">
                    <div class="advantage-icon">🤑</div>
                    <h3>Preço Imbatível</h3>
                    <p>O melhor custo-benefício do mercado. Economia comprovada desde o primeiro mês. Realmente imbatível pelo que entregamos!</p>
                    <span class="price-tag">💰 ECONOMIA REAL</span>
                </div>
                <div class="advantage-card">
                    <div class="advantage-icon">🚀</div>
                    <h3>Peças de Reposição Rápidas</h3>
                    <p>Velocidade em peças de reposição. Estoque local e entrega ágil. Sua produção nunca mais vai parar.</p>
                    <span class="advantage-tag">⚡ ENTREGA RÁPIDA</span>
                </div>
                <div class="advantage-card">
                    <div class="advantage-icon">🔧</div>
                    <h3>Manutenção Simplificada</h3>
                    <p>Foco na praticidade. Design inteligente que facilita a vida do seu time de manutenção.</p>
                    <span class="advantage-tag">✓ FÁCIL TROCA</span>
                </div>
                <div class="advantage-card">
                    <div class="advantage-icon">📊</div>
                    <h3>Mais Produtividade</h3>
                    <p>Menos tempo de manutenção = mais horas de produção = mais lucro para a {{empresa}}.</p>
                    <span class="advantage-tag">📈 +PRODUTIVIDADE</span>
                </div>
                <div class="advantage-card">
                    <div class="advantage-icon">🇧🇷</div>
                    <h3>Produto Nacional</h3>
                    <p>Sem dependência de importação. Suporte técnico local e atendimento personalizado.</p>
                    <span class="advantage-tag">🇧🇷 MADE IN BRAZIL</span>
                </div>
                <div class="advantage-card">
                    <div class="advantage-icon">✅</div>
                    <h3>Validada em Campo</h3>
                    <p>Válvulas já testadas e aprovadas em diversas plantas, com performance superior comprovada.</p>
                    <span class="advantage-tag">✓ VALIDADA</span>
                </div>
            </div>
        </div>
    </section>

    <!-- SEÇÃO PERSONALIZADA: ITENS DA PROPOSTA / OPORTUNIDADE (RENDERIZADA JUST-IN-TIME) -->
    <section class="proposta-itens-section">
        <div class="container">
            <div class="proposta-box">
                <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:15px;margin-bottom:15px;">
                    <div>
                        <span style="font-size:0.8em;font-weight:700;color:var(--micro-orange);text-transform:uppercase;letter-spacing:1px;">Resumo Comercial</span>
                        <h3 style="font-size:1.6em;color:var(--micro-black);text-transform:uppercase;margin:4px 0 0;">Proposta Comercial para {{empresa}}</h3>
                    </div>
                    <div style="text-align:right;">
                        <div style="font-size:0.85em;color:var(--micro-gray);">Oportunidade / Pedido: <strong>{{numero_pedido}}</strong></div>
                        <div style="font-size:1.4em;font-weight:900;color:var(--micro-blue);font-family:'Montserrat',sans-serif;">{{valor}}</div>
                    </div>
                </div>
                {{itens_tabela}}
            </div>
        </div>
    </section>

    <!-- PERSONAL MESSAGE -->
    <section class="personal-message">
        <div class="container">
            <div class="message-box">
                <h3>👋 {{decisor}}, uma mensagem direta para você:</h3>
                <p>
                    Acreditamos que a <strong>{{empresa}}</strong> busca sempre elevar a eficiência da sua linha reduzindo custos operacionais. 
                    Gostaríamos de entender se faz sentido para vocês usufruírem das nossas vantagens competitivas 
                    de forma <strong>exclusiva</strong>.
                </p>
                <p>
                    Nosso atrativo é a <strong>facilidade</strong>, e nosso preço é realmente 💰 <strong>IMBATÍVEL</strong> 💰 pelo que estamos entregando! 
                    Contamos com velocidade em peças de reposição e uma série de melhorias focadas em praticidade, 
                    custo e tempo de manutenção.
                </p>
                <p>
                    Como estão as suas válvulas atuais? Vamos conversar sobre como podemos ajudar a {{empresa}} 
                    a reduzir custos e aumentar a produtividade.
                </p>
                <div class="signature">
                    <strong>{{vendedor_nome}}</strong><br>
                    <span class="role">MiCRO Automação | Válvulas de Sopro PET</span>
                    <span class="role">📱 {{vendedor_telefone}} | ✉️ {{vendedor_email}}</span>
                </div>
            </div>
        </div>
    </section>

    <!-- CTA FINAL SECTION -->
    <section class="cta-final" id="proposta">
        <div class="container">
            <h2>{{decisor}}, <span>Faz Sentido para a {{empresa}}?</span></h2>
            <p class="subtitle">
                Descubra quanto você pode economizar migrando para nossas válvulas de sopro PET
            </p>
            
            <div class="urgency-box">
                ⏰ PROPOSTA EM CARÁTER EXCLUSIVO
            </div>
            
            <div class="cta-buttons-final">
                <a href="mailto:{{vendedor_email}}?subject=Proposta%20Exclusiva%20{{empresa}}%20-%20V%C3%A1lvulas%20PET%20MiCRO&body=Ol%C3%A1%20{{vendedor_nome}},%20gostaria%20de%20receber%20a%20proposta%20exclusiva%20para%20a%20{{empresa}}." class="cta-button" style="padding:18px 36px;font-size:1.05em;">
                    ✉️ SOLICITAR PROPOSTA COMERCIAL
                </a>
                <a href="https://web.whatsapp.com/send?phone={{vendedor_whatsapp_digits}}&text=Ol%C3%A1%20{{vendedor_nome}},%20sou%20da%20{{empresa}}%20e%20gostaria%20de%20conversar%20sobre%20a%20proposta%20de%20v%C3%A1lvulas%20PET." class="cta-button outline" style="padding:18px 36px;font-size:1.05em;" target="_blank">
                    📱 WHATSAPP {{vendedor_nome}}
                </a>
            </div>
            
            <div class="guarantee">
                <div class="guarantee-item">
                    <span class="check">✓</span>
                    <span>Resposta em até 24h</span>
                </div>
                <div class="guarantee-item">
                    <span class="check">✓</span>
                    <span>Proposta personalizada</span>
                </div>
                <div class="guarantee-item">
                    <span class="check">✓</span>
                    <span>Sem compromisso</span>
                </div>
                <div class="guarantee-item">
                    <span class="check">✓</span>
                    <span>Diagnóstico gratuito</span>
                </div>
            </div>
        </div>
    </section>

    <!-- FOOTER -->
    <footer>
        <div class="container">
            <div class="footer-content">
                <div class="footer-brand">
                    <div class="logo-blue">
                        MiCRO
                        <span>automação</span>
                    </div>
                    <p>
                        Soluções em válvulas de sopro PET com tecnologia nacional, 
                        preço imbatível e suporte local. Sua produção nunca mais para.
                    </p>
                </div>
                <div class="footer-links">
                    <h4>Contato Comercial</h4>
                    <div style="font-size:0.95em;margin-bottom:8px;"><strong>{{vendedor_nome}}</strong></div>
                    <div style="font-size:0.9em;opacity:0.9;margin-bottom:6px;">📱 {{vendedor_telefone}}</div>
                    <div style="font-size:0.9em;opacity:0.9;margin-bottom:6px;">✉️ {{vendedor_email}}</div>
                    <div style="font-size:0.9em;opacity:0.9;">🌐 www.microautomacao.com.br</div>
                </div>
                <div class="footer-links">
                    <h4>Links Rápidos</h4>
                    <ul>
                        <li><a href="#proposta">Solicitar Proposta</a></li>
                        <li><a href="https://web.whatsapp.com/send?phone={{vendedor_whatsapp_digits}}" target="_blank">WhatsApp Direto</a></li>
                        <li><a href="https://www.microautomacao.com.br" target="_blank">Site MiCRO</a></li>
                        <li><a href="mailto:{{vendedor_email}}">E-mail Comercial</a></li>
                    </ul>
                </div>
            </div>
            <div class="footer-bottom">
                <p>© {{ano_atual}} MiCRO Automação - Todos os direitos reservados | Proposta Exclusiva {{empresa}} | CNPJ: {{cnpj}}</p>
            </div>
        </div>
    </footer>

</body>
</html>`;

// Template complementar institucional
const TEMPLATE_COMPLEMENTAR_INSTITUCIONAL = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Apresentação Técnica & Portfólio | MiCRO Automação para {{empresa}}</title>
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800;900&family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet">
    <style>
        * { margin:0; padding:0; box-sizing:border-box; }
        body { font-family:'Roboto', sans-serif; color:#2d2d2d; background:#f8fafc; line-height:1.6; }
        h1, h2, h3 { font-family:'Montserrat', sans-serif; }
        .nav { background:#fff; padding:18px 30px; border-bottom:3px solid #f26522; display:flex; justify-content:space-between; align-items:center; }
        .logo { background:#0057a8; color:#fff; padding:8px 18px; font-weight:900; font-family:'Montserrat', sans-serif; letter-spacing:2px; font-size:1.4em; border-radius:4px; }
        .logo span { font-size:0.5em; display:block; font-weight:400; letter-spacing:3px; }
        .hero { background:linear-gradient(135deg, #0f172a, #1e293b); color:#fff; padding:90px 20px; text-align:center; }
        .hero .tag { background:#f26522; color:#fff; font-size:0.85em; font-weight:700; padding:6px 16px; border-radius:4px; text-transform:uppercase; display:inline-block; margin-bottom:15px; font-family:'Montserrat',sans-serif; }
        .hero h1 { font-size:2.8em; text-transform:uppercase; margin-bottom:15px; }
        .hero h1 span { color:#f26522; }
        .hero p { font-size:1.2em; max-width:750px; margin:0 auto 30px; opacity:0.9; }
        .container { max-width:1140px; margin:0 auto; padding:60px 20px; }
        .grid { display:grid; grid-template-columns:repeat(auto-fit, minmax(260px, 1fr)); gap:25px; margin-top:35px; }
        .card { background:#fff; padding:30px; border-radius:8px; box-shadow:0 4px 15px rgba(0,0,0,0.06); border-top:4px solid #0057a8; }
        .card h3 { font-size:1.25em; margin-bottom:10px; color:#0f172a; }
        .card p { color:#64748b; font-size:0.95em; }
        .cta { background:#0057a8; color:#fff; padding:60px 20px; text-align:center; }
        .cta h2 { font-size:2.2em; margin-bottom:15px; }
        .btn-orange { background:#f26522; color:#fff; padding:15px 35px; border-radius:4px; text-decoration:none; font-weight:700; font-family:'Montserrat',sans-serif; display:inline-block; text-transform:uppercase; margin-top:20px; }
    </style>
</head>
<body>
    <div class="nav">
        <div class="logo">MiCRO<span>automação</span></div>
        <div style="font-weight:700;color:#0057a8;">Portal Exclusivo: {{empresa}}</div>
    </div>
    <div class="hero">
        <span class="tag">Soluções Industriais Personalizadas</span>
        <h1>Automação Pneumática de Alta Performance para <span>{{empresa}}</span></h1>
        <p>Prezado(a) {{decisor}}, conheça nossa linha completa de cilindros, válvulas, tratamento de ar e tecnologia sob medida com suporte nacional ágil.</p>
        <a href="#contato" class="btn-orange">Falar com Consultor</a>
    </div>
    <div class="container">
        <h2 style="text-align:center;font-size:2em;text-transform:uppercase;color:#0f172a;">Linhas de Produtos MiCRO</h2>
        <div class="grid">
            <div class="card">
                <h3>Válvulas & Ilhas de Válvulas</h3>
                <p>Direcionais, solenóides e de alta vazão para automação de processos contínuos.</p>
            </div>
            <div class="card">
                <h3>Atuadores & Cilindros</h3>
                <p>Linha normalizada ISO, compactos e especiais com resistência mecânica superior.</p>
            </div>
            <div class="card">
                <h3>Preparação de Ar (FRL)</h3>
                <p>Filtros, reguladores e lubrificadores garantindo ar limpo e confiabilidade operacional.</p>
            </div>
            <div class="card">
                <h3>Conexões & Acessórios</h3>
                <p>Engates rápidos, tubos flexíveis e conexões instantâneas em latão niquelado e polímero.</p>
            </div>
        </div>

        <div style="margin-top:50px;background:#fff;padding:35px;border-radius:8px;box-shadow:0 4px 15px rgba(0,0,0,0.05);border-left:5px solid #f26522;">
            <h3 style="font-size:1.4em;margin-bottom:10px;">Proposta Comercial & Condições para {{empresa}}</h3>
            <p style="color:#64748b;margin-bottom:15px;">Decisor responsável: <strong>{{decisor}}</strong> | Local: <strong>{{cidade_uf}}</strong> | CNPJ: <strong>{{cnpj}}</strong></p>
            {{itens_tabela}}
        </div>
    </div>
    <div class="cta" id="contato">
        <h2>Vamos otimizar sua linha de produção?</h2>
        <p>Consultor Comercial: <strong>{{vendedor_nome}}</strong> | {{vendedor_telefone}} | {{vendedor_email}}</p>
        <a href="https://web.whatsapp.com/send?phone={{vendedor_whatsapp_digits}}" class="btn-orange" target="_blank">Conversar pelo WhatsApp</a>
    </div>
</body>
</html>`;

// ================================================================
// TEMPLATE: TECNOLOGIA DE VÁCUO SCHMALZ & MICRO AUTOMAÇÃO
// ================================================================
const TEMPLATE_SCHMALZ_MICRO_VACUO = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tecnologia em Vácuo Schmalz & MiCRO Automação | Proposta Exclusiva para {{empresa}}</title>
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800;900&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
        :root {
            --schmalz-blue: #005aa9;
            --schmalz-dark: #0a2540;
            --schmalz-light-blue: #0080f0;
            --micro-orange: #f26522;
            --schmalz-gray-bg: #f4f7fb;
            --schmalz-card-border: #e2e8f0;
            --text-dark: #1e293b;
            --text-muted: #64748b;
        }
        * { margin:0; padding:0; box-sizing:border-box; }
        body { font-family:'Inter', sans-serif; color:var(--text-dark); background:var(--schmalz-gray-bg); line-height:1.6; }
        h1, h2, h3, h4 { font-family:'Montserrat', sans-serif; font-weight:800; }
        
        /* HEADER / NAVBAR */
        .schmalz-nav {
            background:#ffffff;
            border-bottom:3px solid var(--schmalz-blue);
            padding:16px 32px;
            display:flex;
            justify-content:space-between;
            align-items:center;
            box-shadow:0 2px 10px rgba(0,0,0,0.05);
            position:sticky;
            top:0;
            z-index:100;
        }
        .schmalz-logos {
            display:flex;
            align-items:center;
            gap:18px;
        }
        .brand-pill {
            background:var(--schmalz-blue);
            color:#fff;
            padding:6px 14px;
            border-radius:4px;
            font-family:'Montserrat', sans-serif;
            font-weight:900;
            font-size:1.15em;
            letter-spacing:1px;
            display:flex;
            align-items:center;
            gap:6px;
        }
        .brand-pill.micro {
            background:#0057a8;
            border-left:4px solid var(--micro-orange);
        }
        .brand-separator {
            color:#cbd5e1;
            font-size:1.4em;
            font-weight:300;
        }
        .nav-contact-btn {
            background:var(--micro-orange);
            color:#fff;
            padding:10px 22px;
            border-radius:6px;
            text-decoration:none;
            font-weight:700;
            font-size:0.9em;
            transition:background 0.2s, transform 0.1s;
            display:inline-flex;
            align-items:center;
            gap:8px;
        }
        .nav-contact-btn:hover {
            background:#d95413;
            transform:translateY(-1px);
        }

        /* HERO SECTION */
        .schmalz-hero {
            background:linear-gradient(135deg, #07192f 0%, #0a2540 60%, #005aa9 100%);
            color:#ffffff;
            padding:80px 24px 70px;
            position:relative;
            overflow:hidden;
        }
        .schmalz-hero::after {
            content:'';
            position:absolute;
            bottom:0;
            left:0;
            right:0;
            height:6px;
            background:linear-gradient(90deg, var(--schmalz-blue), var(--schmalz-light-blue), var(--micro-orange));
        }
        .hero-container {
            max-width:1140px;
            margin:0 auto;
            display:grid;
            grid-template-columns:1.3fr 0.9fr;
            gap:40px;
            align-items:center;
        }
        .hero-badge {
            display:inline-flex;
            align-items:center;
            gap:8px;
            background:rgba(255,255,255,0.12);
            border:1px solid rgba(255,255,255,0.25);
            padding:6px 14px;
            border-radius:20px;
            font-size:0.85em;
            font-weight:700;
            text-transform:uppercase;
            letter-spacing:1px;
            color:#bae6fd;
            margin-bottom:20px;
        }
        .schmalz-hero h1 {
            font-size:2.6em;
            line-height:1.2;
            margin-bottom:18px;
            letter-spacing:-0.5px;
        }
        .schmalz-hero h1 span {
            color:var(--schmalz-light-blue);
        }
        .schmalz-hero p {
            font-size:1.15em;
            line-height:1.7;
            color:#cbd5e1;
            margin-bottom:30px;
        }
        .hero-actions {
            display:flex;
            gap:14px;
            flex-wrap:wrap;
        }
        .btn-schmalz-primary {
            background:var(--schmalz-light-blue);
            color:#ffffff;
            font-weight:700;
            padding:14px 28px;
            border-radius:6px;
            text-decoration:none;
            display:inline-flex;
            align-items:center;
            gap:8px;
            transition:all 0.2s;
        }
        .btn-schmalz-primary:hover {
            background:#006ecc;
            transform:translateY(-2px);
        }
        .btn-schmalz-whatsapp {
            background:#25d366;
            color:#ffffff;
            font-weight:700;
            padding:14px 28px;
            border-radius:6px;
            text-decoration:none;
            display:inline-flex;
            align-items:center;
            gap:8px;
            transition:all 0.2s;
        }
        .btn-schmalz-whatsapp:hover {
            background:#1eb956;
            transform:translateY(-2px);
        }
        
        .hero-card-destaque {
            background:rgba(255,255,255,0.08);
            border:1px solid rgba(255,255,255,0.18);
            border-radius:12px;
            padding:28px;
            backdrop-filter:blur(8px);
        }
        .hero-card-destaque h3 {
            font-size:1.25em;
            color:#fff;
            margin-bottom:14px;
            display:flex;
            align-items:center;
            gap:10px;
        }
        .hero-card-destaque ul {
            list-style:none;
            margin-bottom:20px;
        }
        .hero-card-destaque li {
            padding:8px 0;
            border-bottom:1px solid rgba(255,255,255,0.08);
            color:#e2e8f0;
            font-size:0.95em;
            display:flex;
            align-items:center;
            gap:10px;
        }
        .hero-card-destaque li:last-child { border-bottom:none; }
        
        /* CONTAINER PRINCIPAL */
        .container {
            max-width:1140px;
            margin:0 auto;
            padding:60px 24px;
        }
        
        .section-header {
            text-align:center;
            max-width:760px;
            margin:0 auto 45px;
        }
        .section-header .tag {
            color:var(--schmalz-blue);
            font-weight:800;
            text-transform:uppercase;
            font-size:0.85em;
            letter-spacing:1.5px;
            margin-bottom:8px;
            display:block;
        }
        .section-header h2 {
            font-size:2.2em;
            color:var(--schmalz-dark);
            margin-bottom:12px;
        }
        .section-header p {
            color:var(--text-muted);
            font-size:1.05em;
        }

        /* GRID DE PRODUTOS / PILARES SCHMALZ */
        .schmalz-grid {
            display:grid;
            grid-template-columns:repeat(auto-fit, minmax(260px, 1fr));
            gap:24px;
            margin-bottom:50px;
        }
        .schmalz-card {
            background:#ffffff;
            border:1px solid var(--schmalz-card-border);
            border-radius:10px;
            padding:26px;
            box-shadow:0 4px 15px rgba(0,0,0,0.03);
            border-top:4px solid var(--schmalz-blue);
            transition:transform 0.2s, box-shadow 0.2s;
            display:flex;
            flex-direction:column;
        }
        .schmalz-card:hover {
            transform:translateY(-4px);
            box-shadow:0 8px 24px rgba(0,90,169,0.12);
        }
        .card-icon {
            font-size:2em;
            margin-bottom:14px;
            display:inline-block;
        }
        .schmalz-card h3 {
            font-size:1.2em;
            color:var(--schmalz-dark);
            margin-bottom:10px;
        }
        .schmalz-card p {
            color:var(--text-muted);
            font-size:0.92em;
            line-height:1.6;
            margin-bottom:16px;
            flex-grow:1;
        }
        .card-features {
            font-size:0.82em;
            color:var(--schmalz-blue);
            font-weight:700;
            list-style:none;
            padding-top:10px;
            border-top:1px dashed #e2e8f0;
        }
        .card-features li {
            padding:3px 0;
            display:flex;
            align-items:center;
            gap:6px;
        }

        /* CARD DE PROPOSTA PERSONALIZADA (ITENS COTADOS) */
        .proposta-container {
            background:#ffffff;
            border-radius:12px;
            border:1px solid var(--schmalz-card-border);
            box-shadow:0 8px 30px rgba(0,0,0,0.06);
            padding:36px;
            margin-top:20px;
            position:relative;
            overflow:hidden;
        }
        .proposta-container::before {
            content:'';
            position:absolute;
            top:0;
            left:0;
            right:0;
            height:5px;
            background:linear-gradient(90deg, var(--schmalz-blue), var(--micro-orange));
        }
        .proposta-meta {
            display:flex;
            justify-content:space-between;
            align-items:flex-start;
            flex-wrap:wrap;
            gap:20px;
            padding-bottom:24px;
            margin-bottom:24px;
            border-bottom:1px solid #e2e8f0;
        }
        .proposta-meta h3 {
            font-size:1.6em;
            color:var(--schmalz-dark);
            margin-bottom:6px;
        }
        .proposta-meta p {
            color:var(--text-muted);
            font-size:0.95em;
        }
        .proposta-pill {
            background:#e0f2fe;
            color:#0369a1;
            padding:8px 16px;
            border-radius:20px;
            font-weight:700;
            font-size:0.9em;
            border:1px solid #bae6fd;
        }

        /* TABELA DE ITENS ESTILIZADA SCHMALZ */
        .itens-tabela-custom {
            width:100%;
            border-collapse:collapse;
            margin-top:16px;
            font-size:0.92em;
        }
        .itens-tabela-custom th {
            background:#f1f5f9;
            color:var(--schmalz-dark);
            font-weight:700;
            text-align:left;
            padding:12px 14px;
            border-bottom:2px solid var(--schmalz-blue);
        }
        .itens-tabela-custom td {
            padding:12px 14px;
            border-bottom:1px solid #e2e8f0;
            color:#334155;
        }
        .itens-tabela-custom tr:hover {
            background:#f8fafc;
        }

        /* SEÇÃO DIFERENCIAIS SCHMALZ */
        .diferenciais-strip {
            background:linear-gradient(135deg, #0a2540, #005aa9);
            color:#fff;
            padding:50px 24px;
            border-radius:12px;
            margin-top:50px;
        }
        .diferenciais-grid {
            display:grid;
            grid-template-columns:repeat(auto-fit, minmax(220px, 1fr));
            gap:24px;
            margin-top:30px;
        }
        .diferencial-item {
            background:rgba(255,255,255,0.07);
            border:1px solid rgba(255,255,255,0.15);
            border-radius:8px;
            padding:20px;
            text-align:center;
        }
        .diferencial-item .num {
            font-size:2.2em;
            font-weight:900;
            color:var(--schmalz-light-blue);
            margin-bottom:6px;
            font-family:'Montserrat',sans-serif;
        }
        .diferencial-item h4 {
            font-size:1.05em;
            margin-bottom:6px;
        }
        .diferencial-item p {
            font-size:0.85em;
            color:#cbd5e1;
        }

        /* CTA FINAL & CONSULTOR */
        .schmalz-cta-box {
            background:#ffffff;
            border:2px solid var(--schmalz-blue);
            border-radius:12px;
            padding:40px;
            text-align:center;
            margin-top:50px;
            box-shadow:0 10px 30px rgba(0,90,169,0.08);
        }
        .schmalz-cta-box h2 {
            font-size:2em;
            color:var(--schmalz-dark);
            margin-bottom:12px;
        }
        .schmalz-cta-box p {
            font-size:1.05em;
            color:var(--text-muted);
            max-width:650px;
            margin:0 auto 24px;
        }
        .consultor-card {
            display:inline-flex;
            align-items:center;
            gap:14px;
            background:#f8fafc;
            border:1px solid #e2e8f0;
            padding:12px 24px;
            border-radius:30px;
            margin-bottom:24px;
        }
        .consultor-avatar {
            width:40px;
            height:40px;
            background:var(--schmalz-blue);
            color:#fff;
            border-radius:50%;
            display:flex;
            align-items:center;
            justify-content:center;
            font-weight:800;
        }
        .consultor-info {
            text-align:left;
            font-size:0.9em;
        }
        .consultor-info strong {
            display:block;
            color:var(--schmalz-dark);
        }

        /* FOOTER */
        .schmalz-footer {
            background:#07192f;
            color:#94a3b8;
            padding:40px 24px 30px;
            margin-top:70px;
            font-size:0.9em;
        }
        .footer-content {
            max-width:1140px;
            margin:0 auto;
            display:flex;
            justify-content:space-between;
            align-items:center;
            flex-wrap:wrap;
            gap:20px;
            border-bottom:1px solid #1e293b;
            padding-bottom:24px;
            margin-bottom:20px;
        }
        .footer-legal {
            max-width:1140px;
            margin:0 auto;
            text-align:center;
            font-size:0.8em;
            color:#64748b;
        }

        @media (max-width: 768px) {
            .hero-container { grid-template-columns:1fr; }
            .schmalz-hero h1 { font-size:2em; }
            .proposta-container { padding:20px; }
            .schmalz-cta-box { padding:24px; }
        }
    </style>
</head>
<body>

    <!-- NAVBAR -->
    <header class="schmalz-nav">
        <div class="schmalz-logos">
            <div class="brand-pill">SCHMALZ</div>
            <span class="brand-separator">&amp;</span>
            <div class="brand-pill micro">MiCRO</div>
        </div>
        <div style="display:flex;align-items:center;gap:12px;">
            <div style="font-size:0.85em;color:var(--text-muted);display:none;font-weight:600;" id="clientNotice">Proposta Exclusiva {{empresa}}</div>
            <a href="https://web.whatsapp.com/send?phone={{vendedor_whatsapp_digits}}&text={{whatsapp_link}}" target="_blank" class="nav-contact-btn">
                💬 Falar com Especialista
            </a>
        </div>
    </header>

    <!-- HERO SECTION -->
    <section class="schmalz-hero">
        <div class="hero-container">
            <div>
                <div class="hero-badge">⚡ Engenharia em Automação por Vácuo</div>
                <h1>Soluções em Vácuo Schmalz &amp; MiCRO para <span>{{empresa}}</span></h1>
                <p>Prezado(a) <strong>{{decisor}}</strong>, aumente a eficiência, a segurança de pega e a produtividade da sua linha com a líder mundial em tecnologia de vácuo Schmalz, distribuída com o suporte de engenharia especializada da MiCRO Automação.</p>
                <div class="hero-actions">
                    <a href="#proposta" class="btn-schmalz-primary">🔍 Visualizar Proposta Comercial</a>
                    <a href="https://web.whatsapp.com/send?phone={{vendedor_whatsapp_digits}}&text=Ol%C3%A1%20{{vendedor_nome}}%2C%20gostaria%20de%20tirar%20d%C3%BAvidas%20sobre%20as%20solu%C3%A7%C3%B5es%20em%20V%C3%A1cuo%20Schmalz%20para%20a%20{{empresa}}." target="_blank" class="btn-schmalz-whatsapp">
                        📱 WhatsApp {{vendedor_nome}}
                    </a>
                </div>
            </div>

            <div class="hero-card-destaque">
                <h3>💎 Pilares Tecnológicos Schmalz</h3>
                <ul>
                    <li>🔹 <strong>Ventosas Industriais de Alta Precisão:</strong> Aplicações em embalagens, chapas metálicas, vidro, plástico e madeira.</li>
                    <li>🔹 <strong>Geradores de Vácuo Ecoeficientes:</strong> Ejetores com silenciamento e economia de ar comprimido de até 80%.</li>
                    <li>🔹 <strong>Garras de Vácuo de Área Extensa:</strong> Manipulação confiável de camadas completas de caixas e produtos irregulares.</li>
                    <li>🔹 <strong>Suporte Técnico e Peças Originais:</strong> Dimensionamento assertivo com atendimento MiCRO nacional.</li>
                </ul>
            </div>
        </div>
    </section>

    <!-- CONTEÚDO PRINCIPAL -->
    <main class="container">

        <!-- INTRODUÇÃO À LINHA SCHMALZ -->
        <div class="section-header">
            <span class="tag">Portfólio de Alta Performance</span>
            <h2>Tecnologia Alemã de Vácuo para Máxima Disponibilidade</h2>
            <p>Conheça os componentes dimensionados para as demandas mais exigentes de robótica, empacotamento e automação industrial.</p>
        </div>

        <div class="schmalz-grid">
            <div class="schmalz-card">
                <span class="card-icon">🔵</span>
                <h3>Ventosas &amp; Elementos de Fixação</h3>
                <p>Ampla variedade de formatos planos, fole e garras específicas para embalagens cartonadas, flow-pack, sacos e peças oleadas com vedação perfeita.</p>
                <ul class="card-features">
                    <li>✔ Materiais: NBR, Silicone, HT1 e Elastodur</li>
                    <li>✔ Pega rápida sem marcas na peça</li>
                </ul>
            </div>

            <div class="schmalz-card">
                <span class="card-icon">⚡</span>
                <h3>Geradores de Vácuo &amp; Ejetores</h3>
                <p>Ejetores compactos com tecnologia multiestágio e sistemas inteligentes de economia de ar que interrompem o consumo quando o vácuo nominal é atingido.</p>
                <ul class="card-features">
                    <li>✔ Até 80% de redução no uso de ar</li>
                    <li>✔ Monitoramento de pressão e IO-Link</li>
                </ul>
            </div>

            <div class="schmalz-card">
                <span class="card-icon">🤖</span>
                <h3>Sistemas de Garras de Vácuo (FXP/FMC)</h3>
                <p>Sistemas modulares para paletização e manuseio automático de caixas, peças deformadas ou com furações, mesmo com cobertura parcial da garra.</p>
                <ul class="card-features">
                    <li>✔ Válvulas de retenção inteligentes</li>
                    <li>✔ Integração com robôs industriais e cobots</li>
                </ul>
            </div>

            <div class="schmalz-card">
                <span class="card-icon">🎛️</span>
                <h3>Válvulas, Sensores &amp; Filtros</h3>
                <p>Segurança operacional com filtros de vácuo de alta vazão, válvulas de alívio rápido e sensores digitais para feedback instantâneo ao CLP da linha.</p>
                <ul class="card-features">
                    <li>✔ Proteção total contra particulados</li>
                    <li>✔ Display digital com programação simples</li>
                </ul>
            </div>
        </div>

        <!-- SEÇÃO PERSONALIZADA: ITENS DA PROPOSTA / OPORTUNIDADE (RENDERIZADA JUST-IN-TIME) -->
        <section class="proposta-container" id="proposta">
            <div class="proposta-meta">
                <div>
                    <h3>Proposta Comercial Exclusiva — {{empresa}}</h3>
                    <p>Cotação Nº: <strong>{{numero_orcamento}}</strong> &nbsp;|&nbsp; Emitida para: <strong>{{decisor}}</strong> &nbsp;|&nbsp; CNPJ: <strong>{{cnpj}}</strong></p>
                    <p style="margin-top:4px;color:#005aa9;">Localização do Cliente: <strong>{{cidade_uf}}</strong> &nbsp;|&nbsp; Data: <strong>{{data_hoje}}</strong></p>
                </div>
                <div class="proposta-pill">
                    Valor Total: {{valor_formatado}}
                </div>
            </div>

            <div>
                <h4 style="font-size:1.15em;color:var(--schmalz-dark);margin-bottom:12px;">Especificação Técnica dos Itens Cotados</h4>
                {{itens_tabela}}
            </div>

            <!-- OPÇÃO DE ASSINATURA / ACEITE DIGITAL -->
            <div style="margin-top:24px;padding:20px;background:#f8fafc;border-radius:8px;border:1px dashed var(--schmalz-blue);display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:16px;">
                <div>
                    <strong style="color:var(--schmalz-dark);font-size:1.05em;display:block;">Assinatura Digital &amp; Aprovação da Proposta</strong>
                    <span style="font-size:0.9em;color:var(--text-muted);">Confirme os termos técnicos e libere a emissão do pedido de forma ágil e segura.</span>
                </div>
                <div style="display:flex;gap:10px;">
                    <a href="{{link_assinador_oficial}}" class="btn-schmalz-primary" style="background:#005aa9;">
                        ✍️ Assinar Proposta Online
                    </a>
                </div>
            </div>
        </section>

        <!-- NÚMEROS E DIFERENCIAIS -->
        <section class="diferenciais-strip">
            <div style="text-align:center;">
                <h2 style="font-size:1.9em;margin-bottom:8px;">Por que escolher Schmalz com a MiCRO Automação?</h2>
                <p style="color:#cbd5e1;max-width:700px;margin:0 auto;">A união da referência alemã em vácuo com o know-how de engenharia de campo e estoque da MiCRO no Brasil.</p>
            </div>
            <div class="diferenciais-grid">
                <div class="diferencial-item">
                    <div class="num">+110</div>
                    <h4>Anos de Inovação</h4>
                    <p>Pioneirismo em sistemas inteligentes de manipulação por vácuo.</p>
                </div>
                <div class="diferencial-item">
                    <div class="num">80%</div>
                    <h4>Economia Energética</h4>
                    <p>Ejetores com tecnologia Eco-Nozzle para reduzir drasticamente seu consumo de ar.</p>
                </div>
                <div class="diferencial-item">
                    <div class="num">100%</div>
                    <h4>Engenharia Dedicada</h4>
                    <p>Dimensionamento preciso para sua aplicação específica por consultores MiCRO.</p>
                </div>
                <div class="diferencial-item">
                    <div class="num">Ágil</div>
                    <h4>Suporte e Reposição</h4>
                    <p>Peças originais e pronta entrega nos principais polos industriais do país.</p>
                </div>
            </div>
        </section>

        <!-- CTA & CONTATO DIRETO -->
        <section class="schmalz-cta-box">
            <h2>Pronto para otimizar sua linha com a tecnologia Schmalz?</h2>
            <p>Seu consultor de engenharia e vendas técnicas está à disposição para validação de testes práticos, suporte de catálogo e negociação de prazos.</p>
            
            <div class="consultor-card">
                <div class="consultor-avatar">M</div>
                <div class="consultor-info">
                    <strong>{{vendedor_nome}}</strong>
                    <span>Especialista Comercial MiCRO | {{vendedor_telefone}} | {{vendedor_email}}</span>
                </div>
            </div>

            <div style="display:flex;justify-content:center;gap:14px;flex-wrap:wrap;">
                <a href="https://web.whatsapp.com/send?phone={{vendedor_whatsapp_digits}}&text=Ol%C3%A1%20{{vendedor_nome}}%2C%20recebi%20a%20proposta%20Schmalz%20para%20a%20{{empresa}}%20e%20gostaria%20de%20conversar." target="_blank" class="btn-schmalz-whatsapp" style="font-size:1.05em;padding:16px 36px;">
                    📱 Iniciar Conversa no WhatsApp
                </a>
                <a href="mailto:{{vendedor_email}}?subject=D%C3%BAvidas%20sobre%20Proposta%20Schmalz%20-%20{{empresa}}" class="btn-schmalz-primary" style="background:var(--schmalz-dark);font-size:1.05em;padding:16px 36px;">
                    ✉️ Enviar Mensagem por E-mail
                </a>
            </div>
        </section>

    </main>

    <!-- FOOTER -->
    <footer class="schmalz-footer">
        <div class="footer-content">
            <div class="schmalz-logos">
                <div class="brand-pill" style="font-size:1em;">SCHMALZ</div>
                <span class="brand-separator">&amp;</span>
                <div class="brand-pill micro" style="font-size:1em;">MiCRO</div>
            </div>
            <div>
                <span>Portal de Propostas Comerciais Schmalz &amp; MiCRO Automação</span>
            </div>
        </div>
        <div class="footer-legal">
            <p>© {{ano_atual}} MiCRO Automação &amp; Schmalz do Brasil. Todos os direitos reservados. Proposta técnica e comercial exclusiva para {{empresa}} (CNPJ: {{cnpj}}). Proibida a reprodução sem autorização prévia.</p>
        </div>
    </footer>

</body>
</html>`;


// ================================================================
// TEMPLATE: VISUALIZADOR DE ORÇAMENTO COM ASSINATURA DIGITAL & PORTAL DO CLIENTE
// ================================================================
const TEMPLATE_VISUALIZADOR_ORCAMENTO = `<!DOCTYPE html>
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
            <button type="button" class="btn-tool btn-tool-sign" id="btnTopoAssinar" onclick="abrirAssinadorOficialNovaAba()" title="Abrir assinador de proposta oficial em nova aba">
                ✍️ Assinar Proposta Oficial
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
                        <span>🛡️</span> Autorização de Emissão de Pedido & Assinatura Oficial
                    </h3>
                    <div class="assinatura-hash" id="docHashDisplay">
                        CHAVE: {{autorizacao_token}}
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

                    <!-- Assinatura do Cliente / Assinador Oficial em Nova Aba -->
                    <div class="assinatura-box-cliente" id="boxFormularioAssinatura">
                        <div>
                            <span style="display:inline-block;background:#eff6ff;color:#0057a8;font-size:11px;font-weight:700;padding:3px 8px;border-radius:4px;margin-bottom:8px;">
                                📜 ASSINADOR DE PROPOSTA OFICIAL
                            </span>
                            <p style="font-size:12px;color:#1e293b;font-weight:700;margin-bottom:4px;">
                                Autorização de Pedido com Certificação Jurídica
                            </p>
                            <p style="font-size:11px;color:#475569;margin-bottom:12px;line-height:1.4;">
                                A assinatura desta proposta utiliza o <strong>Assinador Oficial MiCRO</strong> em uma nova aba segura, certificando seu nome completo, carimbo oficial de data/hora, endereço IP e gerando o Certificado Digital de Autenticação.
                            </p>
                            <div style="background:#f8fafc;padding:10px 12px;border-radius:6px;border:1px solid #e2e8f0;margin-bottom:14px;font-size:11px;color:#334155;">
                                <div><strong>Cliente:</strong> {{empresa}}</div>
                                <div><strong>Decisor / Signatário:</strong> {{decisor}}</div>
                                <div><strong>Status:</strong> <span id="txtStatusAssinaturaCard" style="color:#d97706;font-weight:700;">Pendente de assinatura</span></div>
                            </div>
                        </div>
                        <button type="button" class="btn-assinar-digital" onclick="abrirAssinadorOficialNovaAba()" style="display:flex;align-items:center;justify-content:center;gap:8px;">
                            <span>✍️</span> Abrir Assinador em Nova Aba para Assinar
                        </button>
                        <div style="font-size:10px;color:#64748b;text-align:center;margin-top:6px;">
                            🔒 Ao concluir a assinatura na nova aba, este portal atualiza automaticamente para <strong>Assinado</strong>.
                        </div>
                    </div>

                    <!-- Carimbo de Assinatura Concluída com Sucesso -->
                    <div class="carimbo-sucesso-box" id="boxSucessoAssinatura" style="grid-column: 1 / -1; display:none;">
                        <span class="carimbo-selo">✅ PROPOSTA ASSINADA DIGITALMENTE</span>
                        <h4 style="font-size:16px;color:#15803d;margin-bottom:6px;font-weight:700;">Aceite Eletrônico & Pedido Autorizado com Sucesso!</h4>
                        <p style="font-size:12px;color:#1e293b;" id="resumoAssinaturaConfirmada"></p>
                        <div style="margin-top:14px;display:flex;justify-content:center;gap:10px;flex-wrap:wrap;">
                            <button type="button" class="btn-tool btn-tool-sign" onclick="abrirAssinadorOficialNovaAba()" style="background:#0057a8;">
                                📜 Ver Certificado Digital na Nova Aba
                            </button>
                            <button type="button" class="btn-tool btn-tool-print" onclick="window.print()">
                                🖨️ Imprimir Comprovante
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
                    <a href="https://web.whatsapp.com/send?phone={{vendedor_whatsapp_digits}}&text=Ol%C3%A1%2C%20gostaria%20de%20informa%C3%A7%C3%B5es%20t%C3%A9cnicas%20sobre%20a%20V%C3%A1lvula%20de%20Sopro%20PET%20da%20MiCRO." target="_blank" class="ad-card-btn orange">
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
                    <a href="https://web.whatsapp.com/send?phone={{vendedor_whatsapp_digits}}&text=Ol%C3%A1%2C%20gostaria%20de%20consultar%20o%20cat%C3%A1logo%20de%20Cilindros%20ISO%20MiCRO." target="_blank" class="ad-card-btn">
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
                    <a href="https://web.whatsapp.com/send?phone={{vendedor_whatsapp_digits}}&text=Ol%C3%A1%2C%20gostaria%20de%20saber%20mais%20sobre%20as%20unidades%20FRL%20da%20MiCRO." target="_blank" class="ad-card-btn">
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
            const raw = atob(base64.replace(/\\s/g, ''));
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
            }
        }

        function abrirAssinadorOficialNovaAba() {
            const url = '{{link_assinador_oficial}}';
            if (url) {
                window.open(url, '_blank');
            } else {
                alert('Link oficial de autorização/assinatura não disponível.');
            }
        }

        function verificarCertificacaoAssinatura(eventoOuDados) {
            const statusInicial = '{{autorizacao_status}}';
            if (statusInicial === 'assinado' || (eventoOuDados && eventoOuDados.status === 'assinado')) {
                aplicarVisualAssinado(eventoOuDados);
                return;
            }

            // Verifica no localStorage se foi assinado na nova aba
            try {
                const raw = localStorage.getItem('feitosacrm_dados');
                if (raw) {
                    const db = JSON.parse(raw);
                    const leadIdAtual = '{{lead_id}}';
                    const tokenAtual = '{{autorizacao_token}}';
                    const l = (db.leads || []).find(it => (leadIdAtual && it.id === leadIdAtual) || (tokenAtual && it.autorizacaoPedidoId === tokenAtual));
                    if (l && l.autorizacaoPedidoStatus === 'assinado') {
                        aplicarVisualAssinado(l.autorizacaoAssinatura || { nome: l.decisor });
                        return;
                    }
                }
            } catch (e) {}

            // Verifica evento recente de assinatura disparado pela aba de autorização
            try {
                const rawEvt = localStorage.getItem('feitosacrm_evento_assinatura');
                if (rawEvt) {
                    const evt = JSON.parse(rawEvt);
                    const tokenAtual = '{{autorizacao_token}}';
                    const leadIdAtual = '{{lead_id}}';
                    if (evt && evt.status === 'assinado' && (evt.token === tokenAtual || evt.leadId === leadIdAtual)) {
                        aplicarVisualAssinado(evt);
                        return;
                    }
                }
            } catch (e) {}
        }

        function aplicarVisualAssinado(dadosAssinatura) {
            const boxForm = document.getElementById('boxFormularioAssinatura');
            const boxSucesso = document.getElementById('boxSucessoAssinatura');
            const resumo = document.getElementById('resumoAssinaturaConfirmada');
            const headerPill = document.getElementById('portalHeaderStatus');
            const txtPill = document.getElementById('txtStatusPill');
            const btnTopo = document.getElementById('btnTopoAssinar');
            const txtStatusCard = document.getElementById('txtStatusAssinaturaCard');

            if (boxForm) boxForm.style.display = 'none';
            if (boxSucesso) boxSucesso.style.display = 'block';

            if (headerPill) headerPill.classList.add('aprovado');
            if (txtPill) txtPill.textContent = 'Proposta Assinada Digitalmente';

            if (btnTopo) {
                btnTopo.textContent = '✓ Proposta Assinada';
                btnTopo.style.background = '#15803d';
            }

            if (txtStatusCard) {
                txtStatusCard.textContent = 'Assinado digitalmente';
                txtStatusCard.style.color = '#15803d';
            }

            const nome = (dadosAssinatura && dadosAssinatura.nome) ? dadosAssinatura.nome : '{{decisor}}';
            const dataHora = (dadosAssinatura && (dadosAssinatura.dataHora || dadosAssinatura.data_hora))
                ? (dadosAssinatura.dataHora || dadosAssinatura.data_hora)
                : new Date().toLocaleString('pt-BR');
            const hash = (dadosAssinatura && (dadosAssinatura.hash || dadosAssinatura.assinatura_hash))
                ? (dadosAssinatura.hash || dadosAssinatura.assinatura_hash)
                : '{{autorizacao_token}}';

            const metodoEnvio = (dadosAssinatura && (dadosAssinatura.metodoEnvio || dadosAssinatura.metodo_envio))
                ? (dadosAssinatura.metodoEnvio || dadosAssinatura.metodo_envio)
                : ('{{metodo_envio}}' || 'Não informado');

            if (resumo) {
                resumo.innerHTML = 'Signatário Certificado: <strong>' + nome + '</strong><br>' +
                                   'Empresa: <strong>{{empresa}}</strong> | CNPJ: {{cnpj}}<br>' +
                                   'Método de Envio: <strong style="color:#0057a8;">' + metodoEnvio + '</strong><br>' +
                                   'Data/Hora da Assinatura: <strong>' + dataHora + '</strong><br>' +
                                   'Chave do Certificado Digital: <code>' + hash + '</code>';
            }

            const btnWhats = document.getElementById('btnNotificarWhatsAceite');
            if (btnWhats) {
                const msg = encodeURIComponent(
                    'Olá, {{vendedor_nome}}! Confirmo que a proposta comercial {{numero_orcamento}} da MiCRO para a empresa {{empresa}} foi ASSINADA DIGITALMENTE via Assinador Oficial por ' + nome + ' (Método de Envio: ' + metodoEnvio + ') sob o certificado ' + hash + '.'
                );
                btnWhats.href = 'https://web.whatsapp.com/send?phone={{vendedor_whatsapp_digits}}?text=' + msg;
            }
        }

        // Listener de sincronização multi-abas em tempo real para certificar a assinatura
        window.addEventListener('storage', function(e) {
            if (e.key === 'feitosacrm_evento_assinatura' || e.key === 'feitosacrm_dados') {
                verificarCertificacaoAssinatura();
            }
        });

        window.addEventListener('focus', function() {
            verificarCertificacaoAssinatura();
        });

        setTimeout(function() {
            verificarCertificacaoAssinatura();
        }, 300);

        setInterval(function() {
            verificarCertificacaoAssinatura();
        }, 2000);

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
</html>`;

// ================================================================
// PERSISTÊNCIA NO SUPABASE (tabela landing_page_modelos)
// Guarda apenas o MOLDE (html/css/js com {{tags}}) — nunca a página já
// renderizada. A montagem final acontece sob demanda (JIT), ver mais abaixo.
// ================================================================
function modeloLPParaSupabase(m) {
    let htmlContent = m.html || '';
    const extraConfig = {
        tipo: m.tipo || 'integrado',
        urlExterna: m.urlExterna || '',
        variaveisFlags: m.variaveisFlags || []
    };
    const marcador = `<!-- LP_CONFIG:${encodeURIComponent(JSON.stringify(extraConfig))} -->`;
    htmlContent = htmlContent.replace(/<!-- LP_CONFIG:[^>]* -->\s*/g, '');
    htmlContent = marcador + '\n' + htmlContent;

    return {
        id: m.id,
        nome: m.nome || '',
        descricao: m.descricao || '',
        padrao: !!m.padrao,
        html: htmlContent,
        css: m.css || '',
        js: m.js || '',
        hero_img: m.heroImg || '',
        logo_img: m.logoImg || '',
        cor_primaria: m.corPrimaria || '#0057a8',
        imagens: m.imagens || [],
        usuario_id: m.usuarioId || (typeof usuarioAtual !== 'undefined' && usuarioAtual ? usuarioAtual.id : null)
    };
}

function linhaSupabaseParaModeloLP(r) {
    let rawHtml = r.html || '';
    let extraConfig = {};
    const match = rawHtml.match(/<!-- LP_CONFIG:([^>]+) -->/);
    if (match && match[1]) {
        try {
            extraConfig = JSON.parse(decodeURIComponent(match[1].trim()));
            rawHtml = rawHtml.replace(/<!-- LP_CONFIG:[^>]* -->\s*/g, '');
        } catch(e) {}
    }

    return {
        id: r.id,
        nome: r.nome || '',
        descricao: r.descricao || '',
        padrao: !!r.padrao,
        html: rawHtml,
        css: r.css || '',
        js: r.js || '',
        heroImg: r.hero_img || '',
        logoImg: r.logo_img || '',
        corPrimaria: r.cor_primaria || '#0057a8',
        imagens: r.imagens || [],
        usuarioId: r.usuario_id || null,
        tipo: extraConfig.tipo || r.tipo || (r.url_externa ? 'externo' : 'integrado'),
        urlExterna: extraConfig.urlExterna || r.url_externa || '',
        variaveisFlags: extraConfig.variaveisFlags || r.variaveis_flags || ['empresa', 'decisor', 'cnpj', 'valor', 'itens_tabela'],
        criadoEm: r.created_at || new Date().toISOString(),
        atualizadoEm: r.updated_at || new Date().toISOString()
    };
}

// Upsert de um modelo no banco (chamado ao salvar/duplicar/definir padrão).
// "Fire and forget": não trava a UI, que já foi atualizada localmente antes.
async function sincronizarModeloLandingPageNoBanco(modelo) {
    if (!modelo || typeof supabaseClient === 'undefined' || !supabaseClient.from) return false;
    try {
        const { error } = await supabaseClient
            .from('landing_page_modelos')
            .upsert(modeloLPParaSupabase(modelo), { onConflict: 'id' });
        if (error) {
            console.warn('Falha ao sincronizar modelo de Landing Page no Supabase:', error.message);
            return false;
        }
        return true;
    } catch (e) {
        console.warn('Erro de rede ao sincronizar modelo de Landing Page:', e);
        return false;
    }
}

async function excluirModeloLandingPageDoBanco(modeloId) {
    if (!modeloId || typeof supabaseClient === 'undefined' || !supabaseClient.from) return false;
    try {
        const { error } = await supabaseClient
            .from('landing_page_modelos')
            .delete()
            .eq('id', modeloId);
        if (error) console.warn('Falha ao excluir modelo de Landing Page no Supabase:', error.message);
        return !error;
    } catch (e) {
        console.warn('Erro de rede ao excluir modelo de Landing Page:', e);
        return false;
    }
}

// ================================================================
// CONTROLE DE MODELOS EXCLUÍDOS (PERSISTÊNCIA ANTI-RESSURREIÇÃO)
// Impede que modelos excluídos pelo usuário voltem a aparecer
// ao rodar inicializadores de presets ou sincronização com Supabase.
// ================================================================
function registrarModeloLandingPageExcluido(modeloId) {
    if (!modeloId) return;
    try {
        const excluidos = JSON.parse(localStorage.getItem('crm_lp_modelos_excluidos') || '[]');
        if (!excluidos.includes(modeloId)) {
            excluidos.push(modeloId);
            localStorage.setItem('crm_lp_modelos_excluidos', JSON.stringify(excluidos));
        }
    } catch (e) {
        console.warn('Erro ao registrar modelo excluído no localStorage:', e);
    }
}

function desregistrarModeloLandingPageExcluido(modeloId) {
    if (!modeloId) return;
    try {
        const excluidos = JSON.parse(localStorage.getItem('crm_lp_modelos_excluidos') || '[]');
        const filtrados = excluidos.filter(id => id !== modeloId);
        localStorage.setItem('crm_lp_modelos_excluidos', JSON.stringify(filtrados));
    } catch (e) {
        console.warn('Erro ao desregistrar modelo excluído no localStorage:', e);
    }
}

function isModeloLandingPageExcluido(modeloId) {
    if (!modeloId) return false;
    try {
        const excluidos = JSON.parse(localStorage.getItem('crm_lp_modelos_excluidos') || '[]');
        return excluidos.includes(modeloId);
    } catch (e) {
        return false;
    }
}

// Carrega TODOS os modelos do banco para o painel de gestão (aba Marketing),
// mesclando com o array local. Não é usado no caminho do Portal do Cliente —
// lá a busca é individual e sob demanda (ver buscarModeloLandingPageJIT).
// Guardas anti-loop: só busca uma vez por sessão e nunca re-renderiza o
// painel se nada realmente mudou (evita re-render em cascata dos cards).
let _lpBancoCarregadoUmaVez = false;
let _lpBancoCarregando = false;
async function carregarModelosLandingPageDoBanco() {
    if (_lpBancoCarregando) return;
    if (typeof supabaseClient === 'undefined' || !supabaseClient.from) return;
    _lpBancoCarregando = true;
    try {
        const { data, error } = await supabaseClient.from('landing_page_modelos').select('*');
        if (error || !data) return;
        // Filtra registros que o usuário já excluiu neste navegador
        const remotos = data
            .map(linhaSupabaseParaModeloLP)
            .filter(r => r.id !== '__feitosa_crm_templates__' && !isModeloLandingPageExcluido(r.id));
        const mapaLocal = new Map((modelosLandingPage || []).filter(m => !isModeloLandingPageExcluido(m.id)).map(m => [m.id, m]));
        const assinaturaAntes = JSON.stringify(Array.from(mapaLocal.entries()).sort());
        
        remotos.forEach(r => {
            const local = mapaLocal.get(r.id);
            if (!local) {
                mapaLocal.set(r.id, r);
            } else {
                const timeLocal = local.atualizadoEm ? new Date(local.atualizadoEm).getTime() : 0;
                const timeRemoto = r.atualizadoEm ? new Date(r.atualizadoEm).getTime() : 0;
                if (timeLocal >= timeRemoto) {
                    mapaLocal.set(r.id, { ...r, ...local });
                } else {
                    mapaLocal.set(r.id, { ...local, ...r });
                }
            }
        });
        const assinaturaDepois = JSON.stringify(Array.from(mapaLocal.entries()).sort());
        const mudou = assinaturaAntes !== assinaturaDepois;

        modelosLandingPage = Array.from(mapaLocal.values());
        if (mudou) {
            if (typeof salvarDados === 'function') salvarDados();
            if (typeof renderizarPainelLandingPagesMarketing === 'function') {
                try { renderizarPainelLandingPagesMarketing(); } catch (e) {}
            }
        }
    } catch (e) {
        console.warn('Erro de rede ao carregar modelos de Landing Page do Supabase:', e);
    } finally {
        _lpBancoCarregando = false;
        _lpBancoCarregadoUmaVez = true;
    }
}

// ================================================================
// BUSCA JUST-IN-TIME DE UM ÚNICO MODELO (uso no Portal do Cliente)
// Não depende do array modelosLandingPage estar carregado em memória:
// busca no Supabase apenas o registro necessário, no instante do login do
// cliente. Cai para o array local e, por fim, para os templates padrão
// embutidos no código caso não haja rede/registro (garante que o portal
// nunca fica sem página para mostrar).
// ================================================================
async function buscarModeloLandingPageJIT(modeloId) {
    if (modeloId && typeof supabaseClient !== 'undefined' && supabaseClient.from) {
        try {
            const { data, error } = await supabaseClient
                .from('landing_page_modelos')
                .select('*')
                .eq('id', modeloId)
                .maybeSingle();
            if (!error && data) return linhaSupabaseParaModeloLP(data);
        } catch (e) {
            console.warn('Portal do Cliente: sem rede para buscar modelo no Supabase, usando fallback local.', e);
        }
    }

    // Sem id, sem registro no banco, ou offline: tenta o array local
    if (modeloId) {
        const local = (modelosLandingPage || []).find(m => m.id === modeloId);
        if (local) return local;
    }

    // Nenhum modelo específico: busca o padrão no banco
    if (typeof supabaseClient !== 'undefined' && supabaseClient.from) {
        try {
            const { data, error } = await supabaseClient
                .from('landing_page_modelos')
                .select('*')
                .eq('padrao', true)
                .limit(1)
                .maybeSingle();
            if (!error && data) return linhaSupabaseParaModeloLP(data);
        } catch (e) {}
    }

    return (modelosLandingPage || []).find(m => m.padrao) || (modelosLandingPage || [])[0] || null;
}

// Versão assíncrona de renderizarLandingPageJIT: busca o modelo (banco →
// local → padrão embutido) e só então monta o HTML final em memória.
async function renderizarLandingPageJITAsync(modeloIdOuObjeto, lead) {
    let modelo = modeloIdOuObjeto;
    if (typeof modeloIdOuObjeto === 'string' || !modeloIdOuObjeto) {
        modelo = await buscarModeloLandingPageJIT(modeloIdOuObjeto);
    }
    return renderizarLandingPageJIT(modelo, lead);
}

// ================================================================
// INICIALIZAÇÃO DE MODELOS DE LANDING PAGE
// ================================================================
function inicializarModelosLandingPageExemplo() {
    if (!modelosLandingPage || modelosLandingPage.length === 0) {
        const modelosIniciaisPadrao = [
            {
                id: 'lp_sopro_pet_oficial',
                nome: 'Válvula de Sopro PET - Proposta Exclusiva MiCRO',
                descricao: 'Modelo oficial MiCRO para indústrias de sopro PET com compatibilidade Norgren e argumentos de redução de custos.',
                padrao: true,
                html: TEMPLATE_PADRAO_SOPRO_PET,
                css: '',
                js: '',
                imagens: [],
                criadoEm: new Date().toISOString(),
                atualizadoEm: new Date().toISOString()
            },
            {
                id: 'lp_visualizador_orcamento',
                nome: 'Visualizador de Orçamento',
                descricao: 'Portal do cliente com visualizador de proposta em anexo estilo PDF, aceite/assinatura digital, impressão A4 e vitrine lateral de produtos MiCRO.',
                padrao: false,
                html: TEMPLATE_VISUALIZADOR_ORCAMENTO,
                css: '',
                js: '',
                imagens: [],
                criadoEm: new Date().toISOString(),
                atualizadoEm: new Date().toISOString()
            },
            {
                id: 'lp_institucional_completa',
                nome: 'Apresentação Geral & Linha de Automação MiCRO',
                descricao: 'Apresentação corporativa para clientes gerais e cotações de pneumática, FRL, atuadores e válvulas.',
                padrao: false,
                html: TEMPLATE_COMPLEMENTAR_INSTITUCIONAL,
                css: '',
                js: '',
                imagens: [],
                criadoEm: new Date().toISOString(),
                atualizadoEm: new Date().toISOString()
            },
            {
                id: 'lp_schmalz_micro_vacuo',
                nome: 'Schmalz & MiCRO - Tecnologia em Vácuo & Garras',
                descricao: 'Portal especializado em automação por vácuo Schmalz (ventosas, ejetores ecoeficientes, garras FXP/FMC, robótica e proposta personalizada).',
                padrao: false,
                tipo: 'externo',
                urlExterna: 'https://schmalz-micro-vacuo.fernandomicroautomac.chatgpt.site/',
                variaveisFlags: ['empresa', 'decisor', 'cnpj', 'valor', 'numero_orcamento'],
                html: TEMPLATE_SCHMALZ_MICRO_VACUO,
                css: '',
                js: '',
                imagens: [],
                criadoEm: new Date().toISOString(),
                atualizadoEm: new Date().toISOString()
            }
        ];

        // Filtra modelos que o usuário já excluiu deliberadamente
        modelosLandingPage = modelosIniciaisPadrao.filter(m => !isModeloLandingPageExcluido(m.id));
        if (modelosLandingPage.length === 0) {
            modelosLandingPage = [modelosIniciaisPadrao[0]];
        }
        if (!modelosLandingPage.some(m => m.padrao)) {
            modelosLandingPage[0].padrao = true;
        }

        if (typeof salvarDados === 'function') salvarDados();
        modelosLandingPage.forEach(m => sincronizarModeloLandingPageNoBanco(m));
    } else {
        // Remove da memória caso algum modelo excluído ainda esteja presente
        const qtdAntes = modelosLandingPage.length;
        modelosLandingPage = modelosLandingPage.filter(m => !isModeloLandingPageExcluido(m.id));
        if (modelosLandingPage.length !== qtdAntes && typeof salvarDados === 'function') {
            salvarDados();
        }

        // Garante que o modelo "Visualizador de Orçamento" exista (apenas se NÃO foi excluído)
        if (!isModeloLandingPageExcluido('lp_visualizador_orcamento')) {
            const idxVis = modelosLandingPage.findIndex(m => m.id === 'lp_visualizador_orcamento' || m.nome === 'Visualizador de Orçamento');
            if (idxVis === -1) {
                modelosLandingPage.push({
                    id: 'lp_visualizador_orcamento',
                    nome: 'Visualizador de Orçamento',
                    descricao: 'Portal do cliente com visualizador de proposta em anexo estilo PDF em alta fidelidade com PDF.js, aceite/assinatura digital, impressão A4 e vitrine lateral de produtos MiCRO.',
                    padrao: false,
                    html: TEMPLATE_VISUALIZADOR_ORCAMENTO,
                    css: '',
                    js: '',
                    imagens: [],
                    criadoEm: new Date().toISOString(),
                    atualizadoEm: new Date().toISOString()
                });
                if (typeof salvarDados === 'function') salvarDados();
                sincronizarModeloLandingPageNoBanco(modelosLandingPage[modelosLandingPage.length - 1]);
            } else {
                if (!modelosLandingPage[idxVis].html) {
                    modelosLandingPage[idxVis].html = TEMPLATE_VISUALIZADOR_ORCAMENTO;
                    modelosLandingPage[idxVis].atualizadoEm = new Date().toISOString();
                    sincronizarModeloLandingPageNoBanco(modelosLandingPage[idxVis]);
                }
            }
        }

        // Garante que o modelo Schmalz & MiCRO Vácuo exista (apenas se NÃO foi excluído)
        if (!isModeloLandingPageExcluido('lp_schmalz_micro_vacuo')) {
            const idxSchmalz = modelosLandingPage.findIndex(m => m.id === 'lp_schmalz_micro_vacuo' || m.nome?.includes('Schmalz'));
            const urlSchmalzExterna = 'https://schmalz-micro-vacuo.fernandomicroautomac.chatgpt.site/';
            const flagsPadrao = ['empresa', 'decisor', 'cnpj', 'valor', 'numero_orcamento'];

            if (idxSchmalz === -1) {
                modelosLandingPage.push({
                    id: 'lp_schmalz_micro_vacuo',
                    nome: 'Schmalz & MiCRO - Tecnologia em Vácuo & Garras (Site Externo)',
                    descricao: 'Template externo de alta velocidade com passagem de flags de variáveis personalizadas (empresa, decisor, cnpj, valor, itens_tabela, etc).',
                    padrao: false,
                    tipo: 'externo',
                    urlExterna: urlSchmalzExterna,
                    variaveisFlags: flagsPadrao,
                    html: TEMPLATE_SCHMALZ_MICRO_VACUO,
                    css: '',
                    js: '',
                    imagens: [],
                    criadoEm: new Date().toISOString(),
                    atualizadoEm: new Date().toISOString()
                });
                if (typeof salvarDados === 'function') salvarDados();
                sincronizarModeloLandingPageNoBanco(modelosLandingPage[modelosLandingPage.length - 1]);
            } else {
                if (!modelosLandingPage[idxSchmalz].urlExterna) {
                    modelosLandingPage[idxSchmalz].urlExterna = urlSchmalzExterna;
                    modelosLandingPage[idxSchmalz].tipo = 'externo';
                    modelosLandingPage[idxSchmalz].variaveisFlags = flagsPadrao;
                    modelosLandingPage[idxSchmalz].atualizadoEm = new Date().toISOString();
                    sincronizarModeloLandingPageNoBanco(modelosLandingPage[idxSchmalz]);
                }
            }
        }
    }

    // Garante que haja ao menos um modelo marcado como padrão
    if (modelosLandingPage.length > 0 && !modelosLandingPage.some(m => m.padrao)) {
        modelosLandingPage[0].padrao = true;
        if (typeof salvarDados === 'function') salvarDados();
        sincronizarModeloLandingPageNoBanco(modelosLandingPage[0]);
    }

    // Puxa do banco só na primeira vez (evita loop: esta função roda toda
    // vez que o painel é (re)renderizado, mas o fetch do banco só precisa
    // acontecer uma vez por carregamento da página).
    if (!_lpBancoCarregadoUmaVez && typeof carregarModelosLandingPageDoBanco === 'function') {
        carregarModelosLandingPageDoBanco();
    }
}

// ================================================================
// OBTENÇÃO E RESOLUÇÃO INTELIGENTE DO DECISOR / CONTATO DO LEAD
// ================================================================
function obterDecisorLead(lead) {
    if (!lead) return '';
    if (typeof lead === 'string') {
        const encontrado = (typeof leads !== 'undefined' && Array.isArray(leads))
            ? leads.find(l => l.id === lead)
            : null;
        if (encontrado) lead = encontrado;
        else return '';
    }

    // 1. Campo explícito lead.decisor no cadastro do lead
    if (lead.decisor && typeof lead.decisor === 'string') {
        const d = lead.decisor.trim();
        if (d && d !== '—' && d !== 'N/A' && d !== 'Não informado' && d !== 'Contato não especificado') {
            return d;
        }
    }
    // 2. Contatos alternativos do lead
    if (lead.contato && typeof lead.contato === 'string' && lead.contato.trim()) {
        return lead.contato.trim();
    }
    if (lead.contatoResponsavel && typeof lead.contatoResponsavel === 'string' && lead.contatoResponsavel.trim()) {
        return lead.contatoResponsavel.trim();
    }
    if (lead.contato_responsavel && typeof lead.contato_responsavel === 'string' && lead.contato_responsavel.trim()) {
        return lead.contato_responsavel.trim();
    }
    if (lead.comprador && typeof lead.comprador === 'string' && lead.comprador.trim()) {
        return lead.comprador.trim();
    }
    // 3. Questionário / Sondagem Comercial
    if (lead.questionario?.contatoNome && typeof lead.questionario.contatoNome === 'string' && lead.questionario.contatoNome.trim()) {
        return lead.questionario.contatoNome.trim();
    }
    // 4. Metadados e dados extraídos de PDF
    const extraidos = lead.orcamentoPdfPrincipal?.dadosExtraidos;
    if (extraidos) {
        const cPdf = extraidos.contato || extraidos.comprador || extraidos.solicitante || extraidos.decisor;
        if (cPdf && typeof cPdf === 'string' && cPdf.trim()) {
            return cPdf.trim();
        }
    }
    // 5. Tabela Pessoas vinculadas a esta empresa ou lead
    if (typeof pessoas !== 'undefined' && Array.isArray(pessoas) && (lead.id || lead.empresa)) {
        const pDecisor = pessoas.find(p => (p.leadId === lead.id || (p.empresa && p.empresa.toLowerCase() === (lead.empresa || '').toLowerCase())) && (p.decisor === 'sim' || p.decisor === 'influenciador'));
        if (pDecisor && pDecisor.nome && pDecisor.nome.trim()) return pDecisor.nome.trim();

        const pQualquer = pessoas.find(p => p.leadId === lead.id || (p.empresa && p.empresa.toLowerCase() === (lead.empresa || '').toLowerCase()));
        if (pQualquer && pQualquer.nome && pQualquer.nome.trim()) return pQualquer.nome.trim();
    }
    return '';
}

// ================================================================
// MONTAGEM DE VARIÁVEIS DO LEAD (COMPARTILHADA POR MODELOS INTEGRADOS E EXTERNOS)
// ================================================================
function extrairDadosLeadParaVariaveis(lead) {
    if (typeof lead === 'string') {
        const encontrado = (typeof leads !== 'undefined' && Array.isArray(leads))
            ? leads.find(l => l.id === lead)
            : null;
        if (encontrado) lead = encontrado;
    }
    if (lead && typeof lead === 'object') {
        const decisorReal = obterDecisorLead(lead);
        return {
            ...lead,
            decisor: decisorReal || ''
        };
    }
    return {
        id: 'exemplo',
        empresa: 'Vemaplastic Indústria e Comércio',
        decisor: 'Thomaz',
        cnpj: '12.345.678/0001-90',
        email: 'thomaz@vemaplastic.com.br',
        telefone: '(19) 3888-0000',
        whatsapp: '(19) 98888-0000',
        cidade: 'Campinas',
        estado: 'SP',
        valor: 35000,
        numeroPedido: 'ORC-2026-089',
        itens: [
            { descricao: 'Válvula de Sopro PET High-Flow 40 Bar MiCRO Compatível Norgren', quantidade: 4, preco: 4500 },
            { descricao: 'Kit de Reparo e Vedação Rápida para Válvula de Sopro', quantidade: 8, preco: 850 },
            { descricao: 'Bloco de Distribuição Pneumático Despressurização Rápida', quantidade: 2, preco: 5100 }
        ]
    };
}

function montarMapaVariaveisLead(lead) {
    const leadData = extrairDadosLeadParaVariaveis(lead);
    const decisorLead = (lead ? (obterDecisorLead(leadData) || 'Diretoria') : (obterDecisorLead(leadData) || 'Thomaz'));

    // Vendedor responsável
    let vendedor = (typeof usuarios !== 'undefined' && Array.isArray(usuarios))
        ? usuarios.find(u => u.id === leadData.usuarioId)
        : null;

    const vendedorNome = vendedor?.nome || (typeof usuarioAtual !== 'undefined' && usuarioAtual?.nome) || 'Fernando Feitosa';
    const vendedorEmail = vendedor?.email || (typeof usuarioAtual !== 'undefined' && usuarioAtual?.email) || 'vendas4.cps@microautomacao.com.br';
    const vendedorTelefone = '(19) 98440-0195';
    const vendedorWhatsappDigits = '5519984400195';

    // Montagem da tabela de itens (se houver itens cotados)
    let itensTabelaHtml = '';
    const itensArray = leadData.itens || (leadData.orcamentoPdfPrincipal?.dadosExtraidos?.itens) || [];
    if (Array.isArray(itensArray) && itensArray.length > 0) {
        let totalCalculado = 0;
        const linhasHtml = itensArray.map((it, idx) => {
            const desc = it.descricao || it.produto || `Item ${idx + 1}`;
            const qtd = Number(it.quantidade || it.qtd || 1);
            const preco = Number(it.preco || it.valorUnitario || it.unitario || 0);
            const subtotal = qtd * preco;
            totalCalculado += subtotal;
            return `
                <tr>
                    <td style="padding:10px 14px;border-bottom:1px solid #e2e8f0;font-weight:600;">${desc}</td>
                    <td style="padding:10px 14px;border-bottom:1px solid #e2e8f0;text-align:center;">${qtd}</td>
                    <td style="padding:10px 14px;border-bottom:1px solid #e2e8f0;text-align:right;">${typeof formatarMoeda === 'function' ? formatarMoeda(preco) : 'R$ ' + preco.toFixed(2)}</td>
                    <td style="padding:10px 14px;border-bottom:1px solid #e2e8f0;text-align:right;font-weight:700;color:#0057a8;">${typeof formatarMoeda === 'function' ? formatarMoeda(subtotal) : 'R$ ' + subtotal.toFixed(2)}</td>
                </tr>
            `;
        }).join('');

        const totalFinalFormatado = typeof formatarMoeda === 'function'
            ? formatarMoeda(leadData.valor || totalCalculado)
            : 'R$ ' + (leadData.valor || totalCalculado).toFixed(2);

        itensTabelaHtml = `
            <div style="overflow-x:auto;margin:15px 0;">
                <table class="itens-tabela-custom" style="width:100%;border-collapse:collapse;font-size:0.92em;background:#fff;border-radius:6px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.04);">
                    <thead>
                        <tr style="background:#0057a8;color:#fff;text-align:left;">
                            <th style="padding:12px 14px;">Produto / Descrição</th>
                            <th style="padding:12px 14px;text-align:center;">Qtd</th>
                            <th style="padding:12px 14px;text-align:right;">Unitário</th>
                            <th style="padding:12px 14px;text-align:right;">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${linhasHtml}
                    </tbody>
                    <tfoot>
                        <tr style="background:#f1f5f9;font-weight:700;">
                            <td colspan="3" style="padding:12px 14px;text-align:right;color:#1e293b;">Total Geral da Proposta:</td>
                            <td style="padding:12px 14px;text-align:right;color:#f26522;font-size:1.15em;">${totalFinalFormatado}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        `;
    } else {
        itensTabelaHtml = `
            <div style="background:#f8fafc;padding:20px;border-radius:6px;border:1px dashed #cbd5e1;text-align:center;color:#64748b;margin:15px 0;">
                <div style="font-size:1.4em;margin-bottom:6px;">📦</div>
                <div style="font-weight:600;color:#334155;">Proposta Comercial Personalizada Sob Consulta</div>
                <div style="font-size:0.9em;margin-top:4px;">Nossos consultores técnicos configuram as quantidades ideais de válvulas e sobressalentes para a capacidade das suas sopradoras.</div>
            </div>
        `;
    }

    // Formatações
    const cnpjLimpo = (leadData.cnpj || '').replace(/\D/g, '');
    let cnpjFormatado = leadData.cnpj || '';
    if (cnpjLimpo.length === 14) {
        cnpjFormatado = cnpjLimpo.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
    }

    const valorFormatado = (typeof formatarMoeda === 'function')
        ? formatarMoeda(leadData.valor || 0)
        : 'R$ ' + Number(leadData.valor || 0).toFixed(2);

    const hojeStr = new Date().toLocaleDateString('pt-BR');
    const anoAtualStr = String(new Date().getFullYear());
    const cidadeUf = [leadData.cidade, leadData.estado].filter(Boolean).join(' - ') || 'Brasil';

    // Obtenção do PDF
    let pdfDataUrl = '';
    let pdfNomeArquivo = leadData.numeroPedido ? `078311avance.pdf` : 'Proposta_Comercial_MiCRO.pdf';

    if (leadData.orcamentoPdfPrincipal && leadData.orcamentoPdfPrincipal.dataUrl) {
        pdfDataUrl = leadData.orcamentoPdfPrincipal.dataUrl;
        if (leadData.orcamentoPdfPrincipal.nome) pdfNomeArquivo = leadData.orcamentoPdfPrincipal.nome;
    } else if (Array.isArray(leadData.orcamentoAnexos) && leadData.orcamentoAnexos.length > 0) {
        const anexoPdf = leadData.orcamentoAnexos.find(a => a.tipo === 'application/pdf' || (a.nome && a.nome.toLowerCase().endsWith('.pdf')));
        if (anexoPdf && anexoPdf.dataUrl) {
            pdfDataUrl = anexoPdf.dataUrl;
            pdfNomeArquivo = anexoPdf.nome || pdfNomeArquivo;
        }
    }

    if (!pdfDataUrl && leadData.id && typeof leads !== 'undefined' && Array.isArray(leads)) {
        const leadCompleto = leads.find(l => l.id === leadData.id);
        if (leadCompleto?.orcamentoPdfPrincipal?.dataUrl) {
            pdfDataUrl = leadCompleto.orcamentoPdfPrincipal.dataUrl;
            if (leadCompleto.orcamentoPdfPrincipal.nome) pdfNomeArquivo = leadCompleto.orcamentoPdfPrincipal.nome;
        } else if (Array.isArray(leadCompleto?.orcamentoAnexos)) {
            const anexo = leadCompleto.orcamentoAnexos.find(a => a.tipo === 'application/pdf' || (a.nome && a.nome.toLowerCase().endsWith('.pdf')));
            if (anexo?.dataUrl) {
                pdfDataUrl = anexo.dataUrl;
                if (anexo.nome) pdfNomeArquivo = anexo.nome;
            }
        }
    }

    if (!pdfDataUrl && typeof itensEditLeadId !== 'undefined' && itensEditLeadId === leadData.id && typeof itensEditPdfPrincipal !== 'undefined' && itensEditPdfPrincipal?.dataUrl) {
        pdfDataUrl = itensEditPdfPrincipal.dataUrl;
        if (itensEditPdfPrincipal.nome) pdfNomeArquivo = itensEditPdfPrincipal.nome;
    }

    // Link oficial de autorização/assinatura de pedido
    let tokenAutorizacao = leadData.autorizacaoPedidoId;
    if (!tokenAutorizacao && leadData.id) {
        tokenAutorizacao = 'AUT-' + String(leadData.id).slice(0, 8) + '-' + Math.abs(String(leadData.id).split('').reduce((a,b)=>(((a<<5)-a)+b.charCodeAt(0))|0,0)).toString(36).toUpperCase();
        leadData.autorizacaoPedidoId = tokenAutorizacao;
        if (!leadData.autorizacaoPedidoStatus) {
            leadData.autorizacaoPedidoStatus = 'pendente';
        }
    }
    const baseUrlOrigin = (typeof window !== 'undefined' && window.location && window.location.origin) ? window.location.origin : '';
    const linkAssinadorOficial = `${baseUrlOrigin}/autorizacao.html?token=${encodeURIComponent(tokenAutorizacao || leadData.id || '')}&leadId=${encodeURIComponent(leadData.id || '')}`;

    return {
        pdf_nome_arquivo: pdfNomeArquivo,
        pdf_data_url: pdfDataUrl,
        empresa: leadData.empresa || 'Sua Empresa',
        decisor: decisorLead,
        cnpj: cnpjFormatado || 'Consulte seu consultor',
        cnpj_formatado: cnpjFormatado || '',
        cnpj_limpo: cnpjLimpo || '',
        email: leadData.email || 'comercial@microautomacao.com.br',
        telefone: leadData.telefone || '(19) 98440-0195',
        whatsapp: leadData.whatsapp || '(19) 98440-0195',
        cidade: leadData.cidade || 'Campinas',
        estado: leadData.estado || 'SP',
        cidade_uf: cidadeUf,
        valor: valorFormatado,
        valor_formatado: valorFormatado,
        numero_pedido: leadData.numeroPedido || `PROP-${leadData.id ? String(leadData.id).slice(0, 6).toUpperCase() : '2026'}`,
        numero_orcamento: leadData.numeroPedido || `PROP-${leadData.id ? String(leadData.id).slice(0, 6).toUpperCase() : '2026'}`,
        itens_tabela: itensTabelaHtml,
        vendedor_nome: vendedorNome,
        vendedor_email: vendedorEmail,
        vendedor_telefone: vendedorTelefone,
        vendedor_whatsapp: vendedorTelefone,
        vendedor_whatsapp_digits: vendedorWhatsappDigits,
        whatsapp_link: `https://web.whatsapp.com/send?phone=${vendedorWhatsappDigits}&text=${encodeURIComponent('Olá, gostaria de falar sobre a proposta comercial da MiCRO Automação.')}`,
        data_hoje: hojeStr,
        ano_atual: anoAtualStr,
        link_assinador_oficial: linkAssinadorOficial,
        autorizacao_token: tokenAutorizacao || 'AUT-PENDENTE',
        autorizacao_status: leadData.autorizacaoPedidoStatus || 'pendente',
        autorizacao_status_label: (leadData.autorizacaoPedidoStatus === 'assinado') ? 'Assinado Digitalmente' : 'Pendente de Assinatura',
        metodo_envio: leadData.metodoEnvio || leadData.metodo_envio || '',
        lead_id: leadData.id || ''
    };
}

// ================================================================
// MONTAGEM DE URL EXTERNA PERSONALIZADA COM FLAGS DE VARIÁVEIS
// ================================================================
function montarUrlExternaComVariaveis(urlBase, flagsArray, lead) {
    if (!urlBase) return '';
    let urlLimpa = urlBase.trim();
    if (!urlLimpa.startsWith('http://') && !urlLimpa.startsWith('https://')) {
        urlLimpa = 'https://' + urlLimpa;
    }

    const mapa = montarMapaVariaveisLead(lead);
    const decisorReal = obterDecisorLead(lead);
    const flags = (Array.isArray(flagsArray) && flagsArray.length > 0)
        ? flagsArray
        : ['empresa', 'decisor', 'cnpj', 'valor', 'numero_orcamento'];

    try {
        const urlObj = new URL(urlLimpa);
        flags.forEach(flag => {
            const chave = flag.trim();
            if (chave && mapa[chave] !== undefined && mapa[chave] !== null && mapa[chave] !== '') {
                // Se a chave for decisor e o lead real não possuir decisor preenchido, omite para não exibir nome falso
                if (chave === 'decisor' && lead && !decisorReal) {
                    return;
                }
                let valor = String(mapa[chave]);
                // Se contiver tags HTML (ex: itens_tabela), sanitiza para texto plano limpo
                // para não quebrar a URL nem ativar firewalls WAF / bloqueios de login no ChatGPT
                if (valor.includes('<') && valor.includes('>')) {
                    const temp = document.createElement('div');
                    temp.innerHTML = valor;
                    valor = (temp.textContent || temp.innerText || '').replace(/\s+/g, ' ').trim();
                    if (valor.length > 250) {
                        valor = valor.slice(0, 250) + '...';
                    }
                }
                urlObj.searchParams.set(chave, valor);
            }
        });
        return urlObj.toString();
    } catch (e) {
        // Fallback se URL for relativa ou tiver sintaxe não padrão
        const separador = urlLimpa.includes('?') ? '&' : '?';
        const params = flags
            .filter(f => {
                if (f === 'decisor' && lead && !decisorReal) return false;
                return mapa[f] !== undefined && mapa[f] !== null && mapa[f] !== '';
            })
            .map(f => {
                let val = String(mapa[f]);
                if (val.includes('<') && val.includes('>')) {
                    const temp = document.createElement('div');
                    temp.innerHTML = val;
                    val = (temp.textContent || temp.innerText || '').replace(/\s+/g, ' ').trim();
                    if (val.length > 250) val = val.slice(0, 250) + '...';
                }
                return `${encodeURIComponent(f)}=${encodeURIComponent(val)}`;
            })
            .join('&');
        return `${urlLimpa}${separador}${params}`;
    }
}

// ================================================================
// RENDERIZAÇÃO SOB DEMANDA (JUST-IN-TIME - ZERO DESPERDÍCIO DE MEMÓRIA)
// ================================================================
function renderizarLandingPageJIT(modeloIdOuObjeto, lead) {
    let modelo = null;
    if (typeof modeloIdOuObjeto === 'object' && modeloIdOuObjeto !== null) {
        modelo = modeloIdOuObjeto;
    } else if (typeof modeloIdOuObjeto === 'string') {
        modelo = (modelosLandingPage || []).find(m => m.id === modeloIdOuObjeto);
    }

    if (!modelo) {
        modelo = (modelosLandingPage || []).find(m => m.padrao) || (modelosLandingPage || [])[0];
    }

    if (!modelo) {
        inicializarModelosLandingPageExemplo();
        modelo = modelosLandingPage[0];
    }

    const leadData = extrairDadosLeadParaVariaveis(lead);
    const variaveis = montarMapaVariaveisLead(leadData);

    // SE FOR MODELO DE LINK EXTERNO (MOLDE DE ECONOMIA DE ESPAÇO)
    if (modelo.tipo === 'externo' || modelo.urlExterna) {
        const urlDestino = montarUrlExternaComVariaveis(modelo.urlExterna, modelo.variaveisFlags, leadData);
        return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${modelo.nome || 'Proposta Comercial'} - ${variaveis.empresa}</title>
    <style>
        * { box-sizing: border-box; margin:0; padding:0; }
        html, body { width:100%; height:100%; overflow:hidden; background:#0f172a; font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif; }
        .lp-ext-bar { height:46px; background:#1e293b; border-bottom:2px solid #0057a8; display:flex; align-items:center; justify-content:space-between; padding:0 16px; color:#fff; font-size:12.5px; }
        .lp-ext-bar a { color:#38bdf8; text-decoration:none; font-weight:600; }
        .lp-ext-iframe { width:100%; height:calc(100% - 46px); border:none; background:#ffffff; }
    </style>
</head>
<body>
    <div class="lp-ext-bar">
        <div>
            <span>Proposta Exclusiva: <strong>${variaveis.empresa}</strong></span>
            <span style="opacity:0.6;margin-left:8px;">(${variaveis.decisor})</span>
        </div>
        <div style="display:flex;align-items:center;gap:12px;">
            <span style="color:#22c55e;font-weight:700;">${variaveis.valor}</span>
            <a href="${urlDestino}" target="_blank" title="Abrir landing page original em tela cheia">Abrir em Nova Aba ↗</a>
        </div>
    </div>
    <iframe class="lp-ext-iframe" src="${urlDestino}" allow="camera; microphone; geolocation; clipboard-write;" sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-top-navigation-by-user-activation"></iframe>
</body>
</html>`;
    }

    // SE FOR MODELO DE CÓDIGO HTML INTEGRADO
    let htmlFinal = TEMPLATE_PADRAO_SOPRO_PET;
    if (modelo?.id === 'lp_visualizador_orcamento' || modeloIdOuObjeto === 'lp_visualizador_orcamento' || modelo?.nome === 'Visualizador de Orçamento') {
        htmlFinal = TEMPLATE_VISUALIZADOR_ORCAMENTO;
    } else if (modelo?.id === 'lp_schmalz_micro_vacuo' || modeloIdOuObjeto === 'lp_schmalz_micro_vacuo' || modelo?.nome?.includes('Schmalz')) {
        htmlFinal = modelo?.html || TEMPLATE_SCHMALZ_MICRO_VACUO;
    } else if (modelo?.id === 'lp_institucional_completa' || modeloIdOuObjeto === 'lp_institucional_completa') {
        htmlFinal = modelo?.html || TEMPLATE_COMPLEMENTAR_INSTITUCIONAL;
    } else if (modelo && modelo.html) {
        htmlFinal = modelo.html;
    }

    // Substituição das variáveis em regex case-insensitive {{ variavel }}
    Object.keys(variaveis).forEach(key => {
        const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'gi');
        htmlFinal = htmlFinal.replace(regex, variaveis[key]);
    });

    // Injeção do PDF original diretamente no script da página
    if (htmlFinal.includes('/*__ORCAMENTO_PDF_INJECT__*/')) {
        const scriptInjecao = `window.ORCAMENTO_PDF_DATA_URL = ${JSON.stringify(variaveis.pdf_data_url)};\nwindow.ORCAMENTO_PDF_NOME = ${JSON.stringify(variaveis.pdf_nome_arquivo)};`;
        htmlFinal = htmlFinal.replace('/*__ORCAMENTO_PDF_INJECT__*/', scriptInjecao);
    }

    // Injeção de CSS adicional se houver
    if (modelo.css && modelo.css.trim()) {
        htmlFinal = htmlFinal.replace('</head>', `<style id="lp-custom-css">\n${modelo.css}\n</style>\n</head>`);
    }

    // Injeção de JS adicional se houver
    if (modelo.js && modelo.js.trim()) {
        htmlFinal = htmlFinal.replace('</body>', `<script id="lp-custom-js">\n${modelo.js}\n</script>\n</body>`);
    }

    return htmlFinal;
}

// ================================================================
// GESTÃO NA ABA DE MARKETING
// ================================================================
function alternarSubabaMarketing(subaba) {
    const btnEmail = document.getElementById('subtabBtnEmailMarketing');
    const btnLP = document.getElementById('subtabBtnLandingPages');
    const painelEmail = document.getElementById('painelMarketingEmail');
    const painelLP = document.getElementById('painelMarketingLandingPages');

    if (!painelEmail || !painelLP) return;

    if (subaba === 'landing_pages') {
        btnEmail?.classList.remove('btn-primary');
        btnEmail?.classList.add('btn-outline');
        btnLP?.classList.remove('btn-outline');
        btnLP?.classList.add('btn-primary');
        painelEmail.style.display = 'none';
        painelLP.style.display = 'block';
        renderizarPainelLandingPagesMarketing();
    } else {
        btnLP?.classList.remove('btn-primary');
        btnLP?.classList.add('btn-outline');
        btnEmail?.classList.remove('btn-outline');
        btnEmail?.classList.add('btn-primary');
        painelLP.style.display = 'none';
        painelEmail.style.display = 'block';
    }
}

function renderizarPainelLandingPagesMarketing() {
    inicializarModelosLandingPageExemplo();

    // Atualiza contadores
    const elTotalModelos = document.getElementById('lpTotalModelos');
    const elTotalLeadsAtivos = document.getElementById('lpTotalLeadsAtivos');
    const elTotalViews = document.getElementById('lpTotalViews');

    const totalModelos = (modelosLandingPage || []).length;
    const leadsComLp = (typeof leads !== 'undefined' ? leads : []).filter(l => l.landingPageAtiva !== false).length;
    const viewsTotais = (typeof leads !== 'undefined' ? leads : []).reduce((acc, l) => acc + (Number(l.landingPageViews) || 0), 0);

    if (elTotalModelos) elTotalModelos.textContent = totalModelos;
    if (elTotalLeadsAtivos) elTotalLeadsAtivos.textContent = leadsComLp;
    if (elTotalViews) elTotalViews.textContent = viewsTotais;

    const listaContainer = document.getElementById('lpModelosList');
    if (!listaContainer) return;

    if (!modelosLandingPage || modelosLandingPage.length === 0) {
        listaContainer.innerHTML = `
            <div class="empty-state compact">
                <span class="emoji-big">🌐</span>
                <p class="text-sm">Nenhum modelo de landing page criado ainda.</p>
                <button class="btn btn-primary btn-sm mt-8" onclick="abrirModalEditorLandingPage()">Criar Primeiro Modelo</button>
            </div>
        `;
        return;
    }

    listaContainer.innerHTML = modelosLandingPage.map(m => {
        return `
            <div class="marketing-lp-card" style="background:var(--card-bg, #fff);border:1px solid var(--border-color, #e2e8f0);border-radius:8px;padding:18px;display:flex;flex-direction:column;justify-content:space-between;gap:12px;position:relative;box-shadow:0 2px 8px rgba(0,0,0,0.04);">
                <div>
                    <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;">
                        <h4 style="font-size:15px;font-weight:700;margin:0;color:var(--text-primary);display:flex;align-items:center;gap:6px;">
                            <span>${m.tipo === 'externo' || m.urlExterna ? '🔗' : '🌐'}</span> ${m.nome}
                        </h4>
                        <div style="display:flex;gap:4px;align-items:center;">
                            ${m.tipo === 'externo' || m.urlExterna ? `<span class="badge" style="background:#0284c7;color:#fff;font-size:10px;padding:2px 8px;border-radius:12px;font-weight:700;" title="Link externo com flags de variáveis">🔗 Link Externo</span>` : `<span class="badge" style="background:#64748b;color:#fff;font-size:10px;padding:2px 8px;border-radius:12px;font-weight:600;">💻 HTML</span>`}
                            ${m.padrao ? `<span class="badge" style="background:var(--success, #16a34a);color:#fff;font-size:10px;padding:2px 8px;border-radius:12px;font-weight:700;">★ PADRÃO</span>` : ''}
                        </div>
                    </div>
                    <p class="text-xs text-muted" style="margin:8px 0 0;line-height:1.5;">${m.descricao || 'Sem descrição informada.'}</p>
                    ${(m.tipo === 'externo' || m.urlExterna) && m.urlExterna ? `<div style="margin-top:6px;font-size:11px;color:#0284c7;font-family:monospace;word-break:break-all;">URL Base: ${m.urlExterna}</div>` : ''}
                </div>
                <div style="border-top:1px solid var(--border-color, #eee);padding-top:12px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">
                    <div class="text-xs text-muted">
                        ${m.tipo === 'externo' || m.urlExterna ? '🔗 Redirecionamento / Iframe JIT com Flags' : '⚡ Renderização JIT sob demanda'}
                    </div>
                    <div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center;">
                        <button type="button" class="btn btn-outline btn-xs" onclick="abrirPreviewLandingPage('${m.id}')" title="Testar e simular este modelo com qualquer lead">👁️ Simular</button>
                        <button type="button" class="btn btn-primary btn-xs" onclick="abrirModalEditorLandingPage('${m.id}')" title="Editar código HTML, CSS, JS ou link externo">✏️ Editar</button>
                        <button type="button" class="btn btn-outline btn-xs" onclick="duplicarModeloLandingPage('${m.id}')" title="Duplicar modelo">📋 Copiar</button>
                        ${!m.padrao ? `<button type="button" class="btn btn-outline btn-xs" onclick="definirModeloLandingPagePadrao('${m.id}')" title="Definir como modelo padrão do sistema">⭐ Padrão</button>` : ''}
                        ${modelosLandingPage.length > 1 ? `<button type="button" class="btn btn-danger btn-xs" onclick="abrirModalConfirmacaoExcluirModeloLP('${m.id}')" title="Excluir este modelo de Landing Page">🗑️ Excluir</button>` : ''}
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// ================================================================
// EDITOR DE LANDING PAGE (HTML, CSS, JS, IMAGENS)
// ================================================================
let lpModeloEmEdicaoId = null;
let lpAbaEditorAtual = 'html';
let lpModoVisualizacaoEditor = 'split'; // 'split', 'codigo', 'preview'
let lpDebouncePreviewTimer = null;

function alternarTipoModeloLandingPage(tipo) {
    const radioExterno = document.getElementById('lpTipoLinkExterno');
    const radioIntegrado = document.getElementById('lpTipoHtmlIntegrado');
    const boxExterno = document.getElementById('lpBoxConfigLinkExterno');
    const boxIntegrado = document.getElementById('lpBoxCodigoIntegrado');

    const tipoFinal = tipo || (radioExterno && radioExterno.checked ? 'externo' : 'integrado');

    if (tipoFinal === 'externo') {
        if (radioExterno) radioExterno.checked = true;
        if (boxExterno) boxExterno.style.display = 'flex';
        if (boxIntegrado) boxIntegrado.style.display = 'none';
    } else {
        if (radioIntegrado) radioIntegrado.checked = true;
        if (boxExterno) boxExterno.style.display = 'none';
        if (boxIntegrado) boxIntegrado.style.display = 'flex';
    }

    atualizarPreviewUrlExternaMontada();
    atualizarLivePreviewEditorLP();
}

function aplicarUrlExternaPredefinida(url, nomeSugerido) {
    const inputUrl = document.getElementById('lpEditorUrlExterna');
    const inputNome = document.getElementById('lpEditorNome');
    const inputDesc = document.getElementById('lpEditorDescricao');
    const radioExterno = document.getElementById('lpTipoLinkExterno');

    if (radioExterno) {
        radioExterno.checked = true;
        alternarTipoModeloLandingPage('externo');
    }
    if (inputUrl) {
        inputUrl.value = url;
    }
    if (inputNome && (!inputNome.value || inputNome.value.trim() === '')) {
        inputNome.value = nomeSugerido || 'Schmalz & MiCRO - Tecnologia em Vácuo & Garras (Site Externo)';
    }
    if (inputDesc && (!inputDesc.value || inputDesc.value.trim() === '')) {
        inputDesc.value = 'Template externo de alta velocidade com leitura das flags personalizáveis do cliente em tempo real.';
    }

    marcarTodasVariaveisExternas(true);
    atualizarPreviewUrlExternaMontada();
    atualizarLivePreviewEditorLP();
    showToast('Template externo Schmalz preenchido no editor!', 'info');
}

function marcarTodasVariaveisExternas(marcar = true) {
    const checks = document.querySelectorAll('.lp-flag-var');
    checks.forEach(c => c.checked = marcar);
    atualizarPreviewUrlExternaMontada();
    atualizarLivePreviewEditorLP();
}

function obterFlagsVariaveisSelecionadas() {
    const checks = document.querySelectorAll('.lp-flag-var');
    const flags = [];
    checks.forEach(c => {
        if (c.checked && c.dataset.var) {
            flags.push(c.dataset.var);
        }
    });
    return flags;
}

function definirFlagsVariaveisSelecionadas(flagsArray) {
    const flags = Array.isArray(flagsArray) && flagsArray.length > 0
        ? flagsArray
        : ['empresa', 'decisor', 'cnpj', 'valor', 'itens_tabela'];
    const checks = document.querySelectorAll('.lp-flag-var');
    checks.forEach(c => {
        c.checked = flags.includes(c.dataset.var);
    });
}

function atualizarPreviewUrlExternaMontada() {
    const inputUrl = document.getElementById('lpEditorUrlExterna');
    const elExemplo = document.getElementById('lpExemploUrlExternaMontada');
    if (!elExemplo) return;

    const urlBase = (inputUrl && inputUrl.value.trim()) ? inputUrl.value.trim() : 'https://seu-template.site/';
    const flags = obterFlagsVariaveisSelecionadas();

    // Obtém lead para simulação do seletor ou fallback
    const selLead = document.getElementById('lpEditorSimularLeadId') || document.getElementById('editorLpSimuladorLeadSelect');
    const leadId = selLead ? selLead.value : null;
    const leadObj = (typeof leads !== 'undefined' && Array.isArray(leads)) ? leads.find(l => l.id === leadId) : null;

    const montada = montarUrlExternaComVariaveis(urlBase, flags, leadObj);
    elExemplo.textContent = montada || 'Informe a URL acima para gerar o link do cliente';
}

function abrirModalEditorLandingPage(modeloId = null) {
    inicializarModelosLandingPageExemplo();
    lpModeloEmEdicaoId = modeloId;

    const titulo = document.getElementById('lpEditorModalTitle') || document.getElementById('editorLpModalTitle');
    const inputId = document.getElementById('lpEditorModeloId');
    const inputNome = document.getElementById('lpEditorNome') || document.getElementById('editorLpNome');
    const inputDescricao = document.getElementById('lpEditorDescricao') || document.getElementById('editorLpDescricao');
    const inputUrlExterna = document.getElementById('lpEditorUrlExterna');
    const txtHtml = document.getElementById('lpEditorHtml') || document.getElementById('editorLpHtml');
    const txtCss = document.getElementById('lpEditorCss') || document.getElementById('editorLpCss');
    const txtJs = document.getElementById('lpEditorJs') || document.getElementById('editorLpJs');
    const checkPadrao = document.getElementById('lpEditorPadrao') || document.getElementById('editorLpPadrao');
    const inputHeroImg = document.getElementById('lpEditorHeroImg');
    const inputLogoImg = document.getElementById('lpEditorLogoImg');
    const inputCorPrimaria = document.getElementById('lpEditorCorPrimaria');

    if (inputId) inputId.value = modeloId || '';

    if (modeloId) {
        const modelo = (modelosLandingPage || []).find(m => m.id === modeloId);
        if (!modelo) {
            showToast('Modelo de Landing Page não encontrado.', 'error');
            return;
        }
        if (titulo) titulo.textContent = `Editar Landing Page: ${modelo.nome}`;
        if (inputNome) inputNome.value = modelo.nome || '';
        if (inputDescricao) inputDescricao.value = modelo.descricao || '';
        if (inputUrlExterna) inputUrlExterna.value = modelo.urlExterna || '';
        if (txtHtml) txtHtml.value = modelo.html || TEMPLATE_PADRAO_SOPRO_PET;
        if (txtCss) txtCss.value = modelo.css || '';
        if (txtJs) txtJs.value = modelo.js || '';
        if (checkPadrao) checkPadrao.checked = Boolean(modelo.padrao);
        if (inputHeroImg) inputHeroImg.value = modelo.heroImg || '';
        if (inputLogoImg) inputLogoImg.value = modelo.logoImg || '';
        if (inputCorPrimaria) inputCorPrimaria.value = modelo.corPrimaria || '#0057a8';

        definirFlagsVariaveisSelecionadas(modelo.variaveisFlags);
        alternarTipoModeloLandingPage(modelo.tipo || (modelo.urlExterna ? 'externo' : 'integrado'));
    } else {
        if (titulo) titulo.textContent = 'Novo Modelo de Landing Page Comercial';
        if (inputNome) inputNome.value = 'Nova Proposta Comercial Personalizada';
        if (inputDescricao) inputDescricao.value = 'Modelo para apresentação técnica e comercial aos clientes';
        if (inputUrlExterna) inputUrlExterna.value = '';
        if (txtHtml) txtHtml.value = TEMPLATE_PADRAO_SOPRO_PET;
        if (txtCss) txtCss.value = '';
        if (txtJs) txtJs.value = '';
        if (checkPadrao) checkPadrao.checked = (modelosLandingPage || []).length === 0;
        if (inputHeroImg) inputHeroImg.value = '';
        if (inputLogoImg) inputLogoImg.value = '';
        if (inputCorPrimaria) inputCorPrimaria.value = '#0057a8';

        definirFlagsVariaveisSelecionadas(['empresa', 'decisor', 'cnpj', 'valor', 'itens_tabela']);
        alternarTipoModeloLandingPage('externo');
    }

    // Preenche seletor de leads para simulação ao vivo
    popularSeletorLeadsSimulacaoEditor();

    // Configura listeners de digitação em tempo real (se ainda não registrados)
    configurarListenersEdicaoAoVivo();

    // Inicia na aba HTML se for integrado
    alternarAbaEditorLP('html');

    // Botão de exclusão rápida no rodapé do editor (apenas quando editando modelo existente e se houver mais de um)
    const btnExcluir = document.getElementById('btnLpEditorExcluir');
    if (btnExcluir) {
        if (modeloId && (modelosLandingPage || []).length > 1) {
            btnExcluir.style.display = 'inline-flex';
        } else {
            btnExcluir.style.display = 'none';
        }
    }

    // Reseta visualização split se necessário
    const colCodigo = document.getElementById('lpEditorColunaCodigo');
    const colPreview = document.getElementById('lpEditorColunaPreview');
    if (colCodigo) colCodigo.style.display = 'flex';
    if (colPreview) colPreview.style.display = 'flex';
    lpModoVisualizacaoEditor = 'split';

    // Atualiza o preview e exemplo de URL
    atualizarPreviewUrlExternaMontada();
    atualizarLivePreviewEditorLP();

    // Abre o modal
    abrirModal('editorLandingPageModal');
}

function excluirModeloLandingPageAtualDoEditor() {
    const inputId = document.getElementById('lpEditorModeloId');
    const modeloId = inputId ? inputId.value.trim() : lpModeloEmEdicaoId;
    if (modeloId) {
        abrirModalConfirmacaoExcluirModeloLP(modeloId);
    }
}

function carregarPresetNoEditor() {
    const sel = document.getElementById('lpEditorSelectPreset');
    if (!sel) return;
    const modeloId = sel.value;
    let templateHtml = '';
    let nomeSugerido = '';
    let descSugerida = '';

    if (modeloId === 'lp_visualizador_orcamento') {
        templateHtml = TEMPLATE_VISUALIZADOR_ORCAMENTO;
        nomeSugerido = 'Visualizador de Orçamento';
        descSugerida = 'Portal do cliente com visualizador de proposta em anexo estilo PDF, aceite/assinatura digital, impressão A4 e vitrine lateral de produtos MiCRO.';
    } else if (modeloId === 'lp_institucional_completa') {
        templateHtml = TEMPLATE_COMPLEMENTAR_INSTITUCIONAL;
        nomeSugerido = 'Apresentação Geral & Linha de Automação MiCRO';
        descSugerida = 'Apresentação corporativa para clientes gerais e cotações de pneumática, FRL, atuadores e válvulas.';
    } else {
        templateHtml = TEMPLATE_PADRAO_SOPRO_PET;
        nomeSugerido = 'Válvula de Sopro PET - Proposta Exclusiva MiCRO';
        descSugerida = 'Modelo oficial MiCRO para indústrias de sopro PET com compatibilidade Norgren e argumentos de redução de custos.';
    }

    const txtHtml = document.getElementById('lpEditorHtml');
    const inputNome = document.getElementById('lpEditorNome');
    const inputDescricao = document.getElementById('lpEditorDescricao');

    if (txtHtml) txtHtml.value = templateHtml;
    if (inputNome && (!inputNome.value || inputNome.value.startsWith('Nova Proposta') || inputNome.value === 'Visualizador de Orçamento')) {
        inputNome.value = nomeSugerido;
    }
    if (inputDescricao && (!inputDescricao.value || inputDescricao.value.startsWith('Modelo para') || inputDescricao.value.startsWith('Portal do cliente'))) {
        inputDescricao.value = descSugerida;
    }

    alternarAbaEditorLP('html');
    atualizarLivePreviewEditorLP();
    if (typeof showToast === 'function') {
        showToast(`Modelo "${nomeSugerido}" carregado no editor!`, 'success');
    }
}

function popularSeletorLeadsSimulacaoEditor() {
    const sel = document.getElementById('lpEditorSimularLeadId') || document.getElementById('editorLpSimuladorLeadSelect');
    if (!sel) return;

    const leadsLista = (typeof leads !== 'undefined' && Array.isArray(leads)) ? leads : [];
    if (leadsLista.length === 0) {
        sel.innerHTML = '<option value="">Lead de Demonstração (Vemaplastic)</option>';
        return;
    }

    sel.innerHTML = `
        <option value="">Lead de Demonstração (Vemaplastic)</option>
        ${leadsLista.map(l => `<option value="${l.id}">${l.empresa} (${l.decisor || 'Decisor'})</option>`).join('')}
    `;
}

function configurarListenersEdicaoAoVivo() {
    const campos = ['lpEditorHtml', 'lpEditorCss', 'lpEditorJs', 'lpEditorHeroImg', 'lpEditorLogoImg', 'lpEditorCorPrimaria'];
    campos.forEach(id => {
        const el = document.getElementById(id);
        if (el && !el.dataset.listenerLp) {
            el.dataset.listenerLp = 'true';
            el.addEventListener('input', () => {
                clearTimeout(lpDebouncePreviewTimer);
                lpDebouncePreviewTimer = setTimeout(atualizarLivePreviewEditorLP, 200);
            });
        }
    });
}

function alternarAbaEditorLP(aba) {
    lpAbaEditorAtual = aba;

    // Atualiza botões das abas
    const tabs = [
        { id: 'btnTabEditorHtml', panel: 'lpEditorPainelHtml', name: 'html' },
        { id: 'btnTabEditorCss', panel: 'lpEditorPainelCss', name: 'css' },
        { id: 'btnTabEditorJs', panel: 'lpEditorPainelJs', name: 'js' },
        { id: 'btnTabEditorImagens', panel: 'lpEditorPainelImagens', name: 'imagens' }
    ];

    tabs.forEach(t => {
        const btn = document.getElementById(t.id);
        const panel = document.getElementById(t.panel);
        const isActive = t.name === aba;

        if (btn) btn.classList.toggle('active', isActive);
        if (panel) panel.style.display = isActive ? 'flex' : 'none';
    });
}

function inserirTagEditor(tag) {
    // Localiza o textarea ativo
    let target = document.getElementById('lpEditorHtml');
    if (lpAbaEditorAtual === 'css') {
        target = document.getElementById('lpEditorCss');
    } else if (lpAbaEditorAtual === 'js') {
        target = document.getElementById('lpEditorJs');
    }

    if (!target) return;

    const start = target.selectionStart ?? target.value.length;
    const end = target.selectionEnd ?? target.value.length;
    const text = target.value;

    target.value = text.substring(0, start) + tag + text.substring(end);
    target.focus();
    target.selectionStart = target.selectionEnd = start + tag.length;

    atualizarLivePreviewEditorLP();
}

function setEditorViewport(width) {
    const iframe = document.getElementById('lpEditorIframe');
    if (!iframe) return;

    iframe.style.width = width;

    const btns = [
        { id: 'btnViewportDesktop', width: '100%' },
        { id: 'btnViewportTablet', width: '768px' },
        { id: 'btnViewportMobile', width: '375px' }
    ];

    btns.forEach(b => {
        const btn = document.getElementById(b.id);
        if (btn) btn.classList.toggle('active', b.width === width);
    });
}

function alternarPreviewEditorLP() {
    const colCodigo = document.getElementById('lpEditorColunaCodigo');
    const colPreview = document.getElementById('lpEditorColunaPreview');
    if (!colCodigo || !colPreview) return;

    if (lpModoVisualizacaoEditor === 'split') {
        lpModoVisualizacaoEditor = 'preview';
        colCodigo.style.display = 'none';
        colPreview.style.display = 'flex';
        colPreview.style.flex = '1';
    } else if (lpModoVisualizacaoEditor === 'preview') {
        lpModoVisualizacaoEditor = 'codigo';
        colCodigo.style.display = 'flex';
        colCodigo.style.flex = '1';
        colPreview.style.display = 'none';
    } else {
        lpModoVisualizacaoEditor = 'split';
        colCodigo.style.display = 'flex';
        colCodigo.style.flex = '1';
        colPreview.style.display = 'flex';
        colPreview.style.flex = '1';
    }
}

function atualizarLivePreviewEditorLP() {
    const iframe = document.getElementById('lpEditorIframe') || document.getElementById('editorLpLivePreviewIframe');
    if (!iframe) return;

    const selLead = document.getElementById('lpEditorSimularLeadId') || document.getElementById('editorLpSimuladorLeadSelect');
    const leadId = selLead ? selLead.value : null;
    const leadObj = (typeof leads !== 'undefined' && Array.isArray(leads)) ? leads.find(l => l.id === leadId) : null;

    const radioExterno = document.getElementById('lpTipoLinkExterno');
    const isExterno = radioExterno ? radioExterno.checked : false;

    const inputUrlExterna = document.getElementById('lpEditorUrlExterna');
    const flags = obterFlagsVariaveisSelecionadas();

    const txtHtml = document.getElementById('lpEditorHtml') || document.getElementById('editorLpHtml');
    const txtCss = document.getElementById('lpEditorCss') || document.getElementById('editorLpCss');
    const txtJs = document.getElementById('lpEditorJs') || document.getElementById('editorLpJs');
    const inputHeroImg = document.getElementById('lpEditorHeroImg');
    const inputLogoImg = document.getElementById('lpEditorLogoImg');
    const inputCorPrimaria = document.getElementById('lpEditorCorPrimaria');

    const modeloTemp = {
        tipo: isExterno ? 'externo' : 'integrado',
        urlExterna: inputUrlExterna ? inputUrlExterna.value.trim() : '',
        variaveisFlags: flags,
        html: (txtHtml && txtHtml.value.trim()) ? txtHtml.value : TEMPLATE_PADRAO_SOPRO_PET,
        css: txtCss ? txtCss.value : '',
        js: txtJs ? txtJs.value : '',
        heroImg: inputHeroImg ? inputHeroImg.value.trim() : '',
        logoImg: inputLogoImg ? inputLogoImg.value.trim() : '',
        corPrimaria: inputCorPrimaria ? inputCorPrimaria.value : '#0057a8'
    };

    const renderedHtml = renderizarLandingPageJIT(modeloTemp, leadObj);
    iframe.srcdoc = renderedHtml;
}

function salvarModeloLandingPage(event) {
    if (event) event.preventDefault();

    const idInput = document.getElementById('lpEditorModeloId');
    const nomeInput = document.getElementById('lpEditorNome');
    const descInput = document.getElementById('lpEditorDescricao');
    const padraoInput = document.getElementById('lpEditorPadrao');
    const radioExterno = document.getElementById('lpTipoLinkExterno');
    const isExterno = radioExterno ? radioExterno.checked : false;
    const tipo = isExterno ? 'externo' : 'integrado';
    const inputUrlExterna = document.getElementById('lpEditorUrlExterna');
    const urlExterna = inputUrlExterna ? inputUrlExterna.value.trim() : '';
    const variaveisFlags = obterFlagsVariaveisSelecionadas();

    const htmlInput = document.getElementById('lpEditorHtml');
    const cssInput = document.getElementById('lpEditorCss');
    const jsInput = document.getElementById('lpEditorJs');
    const heroImgInput = document.getElementById('lpEditorHeroImg');
    const logoImgInput = document.getElementById('lpEditorLogoImg');
    const corPrimariaInput = document.getElementById('lpEditorCorPrimaria');

    const modeloId = idInput ? idInput.value.trim() : lpModeloEmEdicaoId;
    const nome = nomeInput ? nomeInput.value.trim() : '';
    const descricao = descInput ? descInput.value.trim() : '';
    const padrao = padraoInput ? padraoInput.checked : false;
    const html = htmlInput ? htmlInput.value.trim() : '';
    const css = cssInput ? cssInput.value.trim() : '';
    const js = jsInput ? jsInput.value.trim() : '';
    const heroImg = heroImgInput ? heroImgInput.value.trim() : '';
    const logoImg = logoImgInput ? logoImgInput.value.trim() : '';
    const corPrimaria = corPrimariaInput ? corPrimariaInput.value : '#0057a8';

    if (!nome) {
        showToast('Por favor, informe o nome do modelo de Landing Page.', 'warning');
        if (nomeInput) nomeInput.focus();
        return;
    }

    if (tipo === 'externo') {
        if (!urlExterna) {
            showToast('Por favor, informe o link de acesso da Landing Page externa.', 'warning');
            if (inputUrlExterna) inputUrlExterna.focus();
            return;
        }
    } else {
        if (!html) {
            showToast('O código HTML não pode estar em branco.', 'warning');
            return;
        }
    }

    if (padrao) {
        (modelosLandingPage || []).forEach(m => m.padrao = false);
    }

    if (modeloId) {
        const idx = (modelosLandingPage || []).findIndex(m => m.id === modeloId);
        if (idx !== -1) {
            modelosLandingPage[idx] = {
                ...modelosLandingPage[idx],
                nome,
                descricao,
                padrao: Boolean(padrao),
                tipo,
                urlExterna,
                variaveisFlags,
                html: html || modelosLandingPage[idx].html || '',
                css,
                js,
                heroImg,
                logoImg,
                corPrimaria,
                atualizadoEm: new Date().toISOString()
            };
            if (!modelosLandingPage.some(m => m.padrao)) {
                modelosLandingPage[0].padrao = true;
            }
            desregistrarModeloLandingPageExcluido(modeloId);
            showToast(`Modelo "${nome}" atualizado com sucesso!`, 'success');
            sincronizarModeloLandingPageNoBanco(modelosLandingPage[idx]);
        }
    } else {
        const novoId = 'lp_' + Date.now();
        desregistrarModeloLandingPageExcluido(novoId);
        const novoModelo = {
            id: novoId,
            nome,
            descricao,
            padrao: Boolean(padrao) || (modelosLandingPage || []).length === 0,
            tipo,
            urlExterna,
            variaveisFlags,
            html: html || '',
            css,
            js,
            heroImg,
            logoImg,
            corPrimaria,
            criadoEm: new Date().toISOString(),
            atualizadoEm: new Date().toISOString()
        };
        modelosLandingPage.push(novoModelo);
        if (!modelosLandingPage.some(m => m.padrao)) {
            modelosLandingPage[0].padrao = true;
        }
        showToast(`Novo modelo "${nome}" criado com sucesso!`, 'success');
        sincronizarModeloLandingPageNoBanco(novoModelo);
    }

    // Persistência forçada
    if (typeof salvarDados === 'function') salvarDados();

    fecharModal('editorLandingPageModal');
    renderizarPainelLandingPagesMarketing();
    if (typeof renderizarLandingPagePadraoAdmin === 'function') renderizarLandingPagePadraoAdmin();
}

function duplicarModeloLandingPage(modeloId) {
    const original = (modelosLandingPage || []).find(m => m.id === modeloId);
    if (!original) {
        showToast('Modelo original não encontrado.', 'error');
        return;
    }

    const novoId = 'lp_' + Date.now();
    desregistrarModeloLandingPageExcluido(novoId);

    const novoModelo = {
        ...JSON.parse(JSON.stringify(original)),
        id: novoId,
        nome: `${original.nome} (Cópia)`,
        padrao: false,
        criadoEm: new Date().toISOString(),
        atualizadoEm: new Date().toISOString()
    };

    modelosLandingPage.push(novoModelo);
    if (typeof salvarDados === 'function') salvarDados();
    renderizarPainelLandingPagesMarketing();
    if (typeof renderizarLandingPagePadraoAdmin === 'function') renderizarLandingPagePadraoAdmin();
    showToast(`Modelo copiado como "${novoModelo.nome}"!`, 'success');
    sincronizarModeloLandingPageNoBanco(novoModelo);
}

function definirModeloLandingPagePadrao(modeloId) {
    let anteriorPadrao = null;
    let novoPadrao = null;

    (modelosLandingPage || []).forEach(m => {
        if (m.padrao && m.id !== modeloId) anteriorPadrao = m;
        m.padrao = (m.id === modeloId);
        if (m.padrao) novoPadrao = m;
    });

    if (typeof salvarDados === 'function') salvarDados();
    renderizarPainelLandingPagesMarketing();
    if (typeof renderizarLandingPagePadraoAdmin === 'function') renderizarLandingPagePadraoAdmin();
    showToast('Modelo padrão atualizado!', 'success');

    if (anteriorPadrao) sincronizarModeloLandingPageNoBanco(anteriorPadrao);
    if (novoPadrao) sincronizarModeloLandingPageNoBanco(novoPadrao);
}

// ================================================================
// EXCLUSÃO DE MODELOS DE LANDING PAGE COM MODAL DEDICADO
// Não depende de window.confirm() (garante funcionamento no iframe)
// e limpa vínculos de leads e banco com persistência imediata.
// ================================================================
let _lpModeloPendenteExclusaoId = null;

function abrirModalConfirmacaoExcluirModeloLP(modeloId) {
    if (!modeloId) return;

    if ((modelosLandingPage || []).length <= 1) {
        showToast('Você deve manter pelo menos um modelo de Landing Page no sistema.', 'warning');
        return;
    }

    const modelo = (modelosLandingPage || []).find(m => m.id === modeloId);
    if (!modelo) {
        showToast('Modelo de Landing Page não encontrado.', 'error');
        return;
    }

    _lpModeloPendenteExclusaoId = modeloId;

    const inputId = document.getElementById('lpExcluirModeloId');
    const elNome = document.getElementById('lpExcluirModeloNome');
    if (inputId) inputId.value = modeloId;
    if (elNome) elNome.textContent = `"${modelo.nome}"`;

    abrirModal('modalConfirmarExclusaoModeloLP');
}

// Retrocompatibilidade para chamadas diretas da função antiga
function excluirModeloLandingPage(modeloId) {
    abrirModalConfirmacaoExcluirModeloLP(modeloId);
}

async function confirmarExclusaoModeloLPFinal() {
    const inputId = document.getElementById('lpExcluirModeloId');
    const modeloId = inputId?.value || _lpModeloPendenteExclusaoId;

    if (!modeloId) {
        fecharModal('modalConfirmarExclusaoModeloLP');
        return;
    }

    if ((modelosLandingPage || []).length <= 1) {
        showToast('Você deve manter pelo menos um modelo de Landing Page no sistema.', 'warning');
        fecharModal('modalConfirmarExclusaoModeloLP');
        return;
    }

    const modelo = (modelosLandingPage || []).find(m => m.id === modeloId);
    const nomeModelo = modelo ? modelo.nome : 'Modelo';

    // 1. Marca modelo como excluído no blacklist local (evita ressuscitar nos presets e sync)
    registrarModeloLandingPageExcluido(modeloId);

    // 2. Remove do array em memória
    modelosLandingPage = (modelosLandingPage || []).filter(m => m.id !== modeloId);

    // 3. Se era o padrão, elege o primeiro modelo restante como padrão
    let novoPadraoDefinido = null;
    if (!modelosLandingPage.some(m => m.padrao) && modelosLandingPage.length > 0) {
        modelosLandingPage[0].padrao = true;
        novoPadraoDefinido = modelosLandingPage[0];
    }

    // 4. Redireciona leads que apontavam para este modelo excluído (para seguir o padrão)
    if (typeof leads !== 'undefined' && Array.isArray(leads)) {
        let afetados = 0;
        leads.forEach(l => {
            if (l.landingPageModeloId === modeloId) {
                l.landingPageModeloId = '';
                l.atualizadoEm = new Date().toISOString();
                l._modificadoLocal = true;
                afetados++;
                if (typeof salvarLeadNoBanco === 'function') salvarLeadNoBanco(l);
            }
        });
        if (afetados > 0 && typeof salvarCacheLocalImediato === 'function') {
            salvarCacheLocalImediato();
        }
    }

    // 5. Salva no storage local (IndexedDB e localStorage)
    if (typeof salvarDados === 'function') salvarDados();

    // 6. Fecha modais
    fecharModal('modalConfirmarExclusaoModeloLP');
    fecharModal('editorLandingPageModal');

    // 7. Renderiza o painel atualizado e as telas vinculadas
    renderizarPainelLandingPagesMarketing();
    if (typeof renderizarLandingPagePadraoAdmin === 'function') renderizarLandingPagePadraoAdmin();

    showToast(`Modelo "${nomeModelo}" excluído com sucesso!`, 'info');

    // 8. Sincroniza exclusão no Supabase em background
    if (novoPadraoDefinido) {
        sincronizarModeloLandingPageNoBanco(novoPadraoDefinido);
    }
    excluirModeloLandingPageDoBanco(modeloId);
}

// ================================================================
// MODAL DE PREVIEW DA LANDING PAGE COM QUALQUER LEAD
// ================================================================
let lpPreviewModeloId = null;

function abrirPreviewLandingPage(modeloId = null, leadId = null) {
    inicializarModelosLandingPageExemplo();
    lpPreviewModeloId = modeloId;

    const selModelo = document.getElementById('lpPreviewSelectModelo');
    const selLead = document.getElementById('lpPreviewSelectLead');

    if (selModelo) {
        selModelo.innerHTML = (modelosLandingPage || []).map(m => {
            const isSelected = modeloId ? (m.id === modeloId) : Boolean(m.padrao);
            return `<option value="${m.id}" ${isSelected ? 'selected' : ''}>${m.nome} ${m.padrao ? '(Padrão)' : ''}</option>`;
        }).join('');
    }

    if (selLead) {
        const leadsLista = (typeof leads !== 'undefined' && Array.isArray(leads)) ? leads : [];
        if (leadsLista.length === 0) {
            selLead.innerHTML = '<option value="">Lead Demonstração Vemaplastic</option>';
        } else {
            selLead.innerHTML = `
                <option value="">Lead Demonstração Vemaplastic</option>
                ${leadsLista.map(l => `<option value="${l.id}" ${leadId === l.id ? 'selected' : ''}>${l.empresa} (${l.decisor || 'Decisor'})</option>`).join('')}
            `;
        }
    }

    recarregarPreviewModalLP();
    setModalPreviewViewport('100%');
    abrirModal('previewLandingPageModal');
}

function recarregarPreviewModalLP() {
    const iframe = document.getElementById('lpPreviewModalIframe') || document.getElementById('previewLpIframe');
    if (!iframe) return;

    const selModelo = document.getElementById('lpPreviewSelectModelo');
    const selLead = document.getElementById('lpPreviewSelectLead');

    const modeloId = selModelo ? selModelo.value : lpPreviewModeloId;
    const leadId = selLead ? selLead.value : null;

    const modelo = (modelosLandingPage || []).find(m => m.id === modeloId);
    const leadObj = (typeof leads !== 'undefined' && Array.isArray(leads)) ? leads.find(l => l.id === leadId) : null;

    if (modelo && (modelo.tipo === 'externo' || Boolean(modelo.urlExterna))) {
        const urlMontada = montarUrlExternaComVariaveis(modelo.urlExterna, modelo.variaveisFlags, leadObj);
        iframe.srcdoc = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0f172a; color: #f8fafc; padding: 24px; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 80vh; text-align: center; }
        .card { background: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 28px; max-width: 600px; width: 100%; box-shadow: 0 10px 25px rgba(0,0,0,0.3); }
        .badge { display: inline-block; padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; background: #0284c7; color: #fff; margin-bottom: 12px; text-transform: uppercase; }
        h2 { font-size: 18px; margin-bottom: 8px; color: #38bdf8; }
        p { font-size: 13px; color: #94a3b8; line-height: 1.5; margin-bottom: 16px; }
        .url-box { background: #090d16; border: 1px solid #1e293b; padding: 12px; border-radius: 8px; font-family: monospace; font-size: 12px; color: #7dd3fc; word-break: break-all; margin-bottom: 20px; text-align: left; }
        .btn-open { display: inline-block; background: #0284c7; color: #fff; padding: 10px 22px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 13px; }
    </style>
</head>
<body>
    <div class="card">
        <span class="badge">🔗 Template Externo Ativo</span>
        <h2>${modelo.nome}</h2>
        <p>Este modelo é carregado no servidor externo com tags do cliente em tempo real, sem restrição de autenticação.</p>
        <div class="url-box">${urlMontada}</div>
        <a href="${urlMontada}" target="_blank" class="btn-open">🚀 Abrir Template Externo em Nova Aba</a>
    </div>
</body>
</html>`;
        return;
    }

    const rendered = renderizarLandingPageJIT(modelo, leadObj);
    iframe.srcdoc = rendered;
}

function setModalPreviewViewport(width) {
    const iframe = document.getElementById('lpPreviewModalIframe');
    if (!iframe) return;

    iframe.style.width = width;

    const btns = [
        { id: 'btnModalVpDesktop', width: '100%' },
        { id: 'btnModalVpTablet', width: '768px' },
        { id: 'btnModalVpMobile', width: '375px' }
    ];

    btns.forEach(b => {
        const btn = document.getElementById(b.id);
        if (btn) btn.classList.toggle('active', b.width === width);
    });
}

function abrirPreviewEmNovaAba() {
    const selModelo = document.getElementById('lpPreviewSelectModelo');
    const selLead = document.getElementById('lpPreviewSelectLead');

    const modeloId = selModelo ? selModelo.value : lpPreviewModeloId;
    const leadId = selLead ? selLead.value : null;

    const modelo = (modelosLandingPage || []).find(m => m.id === modeloId);
    const leadObj = (typeof leads !== 'undefined' && Array.isArray(leads)) ? leads.find(l => l.id === leadId) : null;

    if (modelo && (modelo.tipo === 'externo' || Boolean(modelo.urlExterna))) {
        const urlMontada = montarUrlExternaComVariaveis(modelo.urlExterna, modelo.variaveisFlags, leadObj);
        window.open(urlMontada, '_blank');
        return;
    }

    const rendered = renderizarLandingPageJIT(modelo, leadObj);

    const win = window.open('', '_blank');
    if (win) {
        win.document.open();
        win.document.write(rendered);
        win.document.close();
    } else {
        const blob = new Blob([rendered], { type: 'text/html;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
    }
}

// ================================================================
// AÇÕES DO LEAD NO CRM (PIPELINE / MODAL DO LEAD)
// ================================================================
let leadLpModalAtivoId = null;

// Monta a URL do Portal / Landing Page do Lead.
// Se o modelo for externo (ex: ChatGPT Site da Schmalz ou template com urlExterna),
// retorna DIRETAMENTE a URL externa já montada com as variáveis/tags do lead.
// Isso elimina qualquer bloqueio de login/autenticação prejudicial e atende perfeitamente ao formato esperado.
function montarLinkPortalLead(leadId, modeloId) {
    const lead = (typeof leads !== 'undefined' && Array.isArray(leads)) ? leads.find(l => l.id === leadId) : null;

    let modelo = null;
    const lista = (typeof modelosLandingPage !== 'undefined' && Array.isArray(modelosLandingPage)) ? modelosLandingPage : [];

    if (modeloId) {
        modelo = lista.find(m => m.id === modeloId);
    }
    if (!modelo && lead && lead.landingPageModeloId) {
        modelo = lista.find(m => m.id === lead.landingPageModeloId);
    }
    if (!modelo) {
        modelo = lista.find(m => m.padrao) || lista.find(m => m.id === 'lp_schmalz_micro_vacuo') || lista[0];
    }

    // Se o modelo for externo (ou tiver urlExterna)
    if (modelo && (modelo.tipo === 'externo' || Boolean(modelo.urlExterna))) {
        return montarUrlExternaComVariaveis(modelo.urlExterna, modelo.variaveisFlags, lead);
    }

    // Se for modelo interno hospedado no CRM
    const baseUrl = `${window.location.origin}${window.location.pathname}`;
    let url = `${baseUrl}?lp=${leadId}`;
    if (modeloId) url += `&modelo=${encodeURIComponent(modeloId)}`;
    return url;
}

// Recalcula e escreve no campo de URL o link correspondente ao modelo
// selecionado agora no <select>. Chamado ao abrir o modal e a cada troca
// de opção (onchange), para o link responder na hora.
function atualizarLinkLeadConformeModelo() {
    const elId = document.getElementById('lpLeadId');
    const selModelo = document.getElementById('lpLeadModeloId');
    const elUrl = document.getElementById('lpLeadUrl');
    const labelUrl = document.getElementById('lpLeadUrlLabel');
    if (!elId || !elUrl) return;

    const modeloId = selModelo ? selModelo.value : '';
    const novaUrl = montarLinkPortalLead(elId.value, modeloId);
    elUrl.value = novaUrl;

    if (labelUrl) {
        const isExterno = novaUrl.includes('chatgpt.site') || (novaUrl.startsWith('http') && !novaUrl.includes(window.location.origin));
        labelUrl.textContent = isExterno
            ? 'Link Exclusivo do Cliente (URL Montada com Tags Dinâmicas)'
            : 'Link Exclusivo do Cliente (Portal Web Integrado)';
    }
}

function abrirModalLandingPageLead(leadId) {
    const lead = (typeof leads !== 'undefined' && Array.isArray(leads)) ? leads.find(l => l.id === leadId) : null;
    if (!lead) {
        showToast('Lead não encontrado.', 'error');
        return;
    }

    leadLpModalAtivoId = leadId;
    inicializarModelosLandingPageExemplo();

    // Preenche campos do modal
    const elId = document.getElementById('lpLeadId');
    const elEmpresa = document.getElementById('lpLeadEmpresa');
    const elDecisor = document.getElementById('lpLeadDecisor');
    const elEmail = document.getElementById('lpLeadEmail');
    const elCnpj = document.getElementById('lpLeadCnpj');
    const elTotalViews = document.getElementById('lpLeadTotalViews');
    const elUltimoAcesso = document.getElementById('lpLeadUltimoAcesso');
    const selModelo = document.getElementById('lpLeadModeloId');
    const elUrl = document.getElementById('lpLeadUrl');
    const elMsg = document.getElementById('lpLeadMensagemCustomizada');
    const labelUrl = document.getElementById('lpLeadUrlLabel');

    if (elId) elId.value = lead.id;
    if (elEmpresa) elEmpresa.textContent = lead.empresa;
    if (elDecisor) elDecisor.textContent = obterDecisorLead(lead) || 'Contato não especificado';
    if (elEmail) elEmail.textContent = lead.email || 'Não informado';

    const cnpjLimpo = (lead.cnpj || '').replace(/\D/g, '');
    if (elCnpj) elCnpj.textContent = lead.cnpj ? `${lead.cnpj} (${cnpjLimpo})` : 'CNPJ não informado';

    if (elTotalViews) elTotalViews.textContent = lead.landingPageViews || 0;
    if (elUltimoAcesso) {
        elUltimoAcesso.textContent = lead.landingPageUltimoAcesso
            ? new Date(lead.landingPageUltimoAcesso).toLocaleString('pt-BR')
            : 'Nunca acessou';
    }

    // URL Exclusiva do Cliente com as tags já montadas
    const clientUrl = montarLinkPortalLead(lead.id, lead.landingPageModeloId || '');
    if (elUrl) elUrl.value = clientUrl;

    if (labelUrl) {
        const isExterno = clientUrl.includes('chatgpt.site') || (clientUrl.startsWith('http') && !clientUrl.includes(window.location.origin));
        labelUrl.textContent = isExterno
            ? 'Link Exclusivo do Cliente (URL Montada com Tags Dinâmicas)'
            : 'Link Exclusivo do Cliente (Portal Web Integrado)';
    }

    if (elMsg) elMsg.value = lead.landingPageMensagem || '';

    // Seletor de modelos com auto-salvamento imediato ao trocar (sem necessitar clicar botão)
    if (selModelo) {
        const seguindoPadrao = !lead.landingPageModeloId;
        const opcaoPadraoDinamico = `<option value="" ${seguindoPadrao ? 'selected' : ''}>🔄 Seguir sempre o modelo Padrão atual</option>`;
        const opcoesModelos = (modelosLandingPage || []).map(m => {
            const isSelected = lead.landingPageModeloId === m.id;
            const prefix = (m.tipo === 'externo' || m.urlExterna) ? '🔗 [Externo] ' : '💻 [HTML] ';
            return `<option value="${m.id}" ${isSelected ? 'selected' : ''}>${prefix}${m.nome} ${m.padrao ? '(Padrão atual)' : ''}</option>`;
        }).join('');
        selModelo.innerHTML = opcaoPadraoDinamico + opcoesModelos;

        // Ao trocar: salva na hora, atualiza o link com as tags e avisa o usuário (sem precisar de botão!)
        selModelo.onchange = function() {
            lead.landingPageModeloId = selModelo.value || null;
            lead.atualizadoEm = new Date().toISOString();
            lead._modificadoLocal = true;

            atualizarLinkLeadConformeModelo();

            if (typeof salvarCacheLocalImediato === 'function') salvarCacheLocalImediato();
            if (typeof salvarDados === 'function') salvarDados();
            if (typeof salvarLeadNoBanco === 'function') salvarLeadNoBanco(lead);

            mostrarIndicadorAutoSaveModalLP('✓ Modelo alterado e salvo automaticamente');
        };
    }

    // Mensagem customizada com auto-salvamento em tempo real
    if (elMsg) {
        let timeoutMsg = null;
        elMsg.oninput = function() {
            clearTimeout(timeoutMsg);
            timeoutMsg = setTimeout(() => {
                lead.landingPageMensagem = elMsg.value.trim();
                lead.atualizadoEm = new Date().toISOString();
                lead._modificadoLocal = true;
                if (typeof salvarCacheLocalImediato === 'function') salvarCacheLocalImediato();
                if (typeof salvarDados === 'function') salvarDados();
                if (typeof salvarLeadNoBanco === 'function') salvarLeadNoBanco(lead);
                mostrarIndicadorAutoSaveModalLP('✓ Mensagem salva automaticamente');
            }, 350);
        };
        elMsg.onblur = function() {
            clearTimeout(timeoutMsg);
            lead.landingPageMensagem = elMsg.value.trim();
            lead.atualizadoEm = new Date().toISOString();
            lead._modificadoLocal = true;
            if (typeof salvarCacheLocalImediato === 'function') salvarCacheLocalImediato();
            if (typeof salvarDados === 'function') salvarDados();
            if (typeof salvarLeadNoBanco === 'function') salvarLeadNoBanco(lead);
            mostrarIndicadorAutoSaveModalLP('✓ Salvo automaticamente');
        };
    }

    mostrarIndicadorAutoSaveModalLP('✓ Salvo automaticamente ao alterar');
    abrirModal('landingPageLeadModal');
}

function salvarLandingPageLead(event) {
    if (event) event.preventDefault();

    const leadId = document.getElementById('lpLeadId')?.value || leadLpModalAtivoId;
    const lead = (typeof leads !== 'undefined' && Array.isArray(leads)) ? leads.find(l => l.id === leadId) : null;
    if (!lead) return;

    const selModelo = document.getElementById('lpLeadModeloId');
    const elMsg = document.getElementById('lpLeadMensagemCustomizada');

    if (selModelo) lead.landingPageModeloId = selModelo.value || null;
    if (elMsg) lead.landingPageMensagem = elMsg.value.trim();

    lead.atualizadoEm = new Date().toISOString();
    lead._modificadoLocal = true;

    if (typeof salvarCacheLocalImediato === 'function') salvarCacheLocalImediato();
    if (typeof salvarDados === 'function') salvarDados();
    if (typeof salvarLeadNoBanco === 'function') salvarLeadNoBanco(lead);

    mostrarIndicadorAutoSaveModalLP('✓ Salvo com sucesso!');
    showToast(`Configurações de Landing Page salvas para ${lead.empresa}!`, 'success');
    fecharModal('landingPageLeadModal');

    if (typeof renderizarPipeline === 'function') renderizarPipeline();
    if (typeof renderizarClientes === 'function') renderizarClientes();
}

function mostrarIndicadorAutoSaveModalLP(msg = '✓ Salvo automaticamente') {
    const statusEl = document.getElementById('lpLeadAutoSaveStatus');
    if (statusEl) {
        statusEl.innerHTML = `<span style="color:#10b981;font-weight:700;">✓</span> <span style="color:#10b981;">${msg}</span>`;
        statusEl.style.opacity = '1';
    }
}

function visualizarModeloSelecionadoLead() {
    const selModelo = document.getElementById('lpLeadModeloId');
    const modeloId = selModelo ? selModelo.value : null;
    const leadId = document.getElementById('lpLeadId')?.value || leadLpModalAtivoId;
    abrirPreviewLandingPage(modeloId, leadId);
}

function copiarLinkAcessoLead() {
    const elUrl = document.getElementById('lpLeadUrl');
    if (!elUrl || !elUrl.value) return;

    navigator.clipboard.writeText(elUrl.value).then(() => {
        showToast('Link exclusivo do cliente copiado com sucesso!', 'success');
    }).catch(() => {
        elUrl.select();
        document.execCommand('copy');
        showToast('Link copiado!', 'success');
    });
}

function copiarConviteWhatsAppLead() {
    const leadId = document.getElementById('lpLeadId')?.value || leadLpModalAtivoId;
    const lead = (typeof leads !== 'undefined' && Array.isArray(leads)) ? leads.find(l => l.id === leadId) : null;
    if (!lead) return;

    // Reaproveita o link já calculado no campo (reflete o modelo selecionado)
    const elUrlAtual = document.getElementById('lpLeadUrl');
    const selModeloAtual = document.getElementById('lpLeadModeloId');
    const clientUrl = (elUrlAtual && elUrlAtual.value)
        ? elUrlAtual.value
        : montarLinkPortalLead(lead.id, selModeloAtual ? selModeloAtual.value : (lead.landingPageModeloId || ''));
    const decisor = obterDecisorLead(lead) || 'Diretoria';
    const msgCustom = document.getElementById('lpLeadMensagemCustomizada')?.value.trim();

    const isExterno = clientUrl.includes('chatgpt.site') || (clientUrl.startsWith('http') && !clientUrl.includes(window.location.origin));
    let texto = isExterno
        ? `Olá, ${decisor}! Preparamos a proposta comercial personalizada da Schmalz & MiCRO para a ${lead.empresa}.\n\n🌐 Acesse a apresentação interativa no link exclusivo:\n${clientUrl}`
        : `Olá, ${decisor}! Preparamos uma proposta comercial personalizada e exclusiva para a ${lead.empresa} na MiCRO Automação.\n\n🌐 Acesse sua proposta comercial no link:\n${clientUrl}`;

    if (msgCustom) {
        texto += `\n\n📌 Observação do Consultor: ${msgCustom}`;
    }

    texto += `\n\nQualquer dúvida, estou à disposição!`;

    navigator.clipboard.writeText(texto).then(() => {
        showToast('Mensagem de convite copiada! Pronta para colar no WhatsApp.', 'success');
    }).catch(() => {
        prompt('Copie a mensagem de convite abaixo:', texto);
    });
}

function enviarLinkLandingPageWhatsApp() {
    const leadId = document.getElementById('lpLeadId')?.value || leadLpModalAtivoId;
    const lead = (typeof leads !== 'undefined' && Array.isArray(leads)) ? leads.find(l => l.id === leadId) : null;
    if (!lead) return;

    const elUrl = document.getElementById('lpLeadUrl');
    const selModelo = document.getElementById('lpLeadModeloId');
    const modeloId = selModelo ? selModelo.value : lead.landingPageModeloId;
    const clientUrl = (elUrl && elUrl.value) ? elUrl.value : montarLinkPortalLead(lead.id, modeloId);
    const decisor = obterDecisorLead(lead) || 'Diretoria';
    const orcNumero = lead.numeroPedido || lead.orcamentoPdfPrincipal?.dadosExtraidos?.numero || 'da sua cotação';
    const msgCustom = document.getElementById('lpLeadMensagemCustomizada')?.value.trim();

    const isExterno = clientUrl.includes('chatgpt.site') || (clientUrl.startsWith('http') && !clientUrl.includes(window.location.origin));
    let texto = isExterno
        ? `Olá, ${decisor}! Preparamos a proposta comercial personalizada da Schmalz & MiCRO para a ${lead.empresa}.\n\n🌐 Acesse a apresentação interativa no link exclusivo:\n${clientUrl}`
        : `Olá, ${decisor}! Preparamos a proposta comercial personalizada (${orcNumero}) para a ${lead.empresa} na MiCRO Automação.\n\n🌐 Acesse sua proposta no link:\n${clientUrl}`;

    if (msgCustom) {
        texto += `\n\n📌 Observação do Consultor: ${msgCustom}`;
    }
    texto += `\n\nQualquer dúvida, estou à disposição!`;

    const telefone = lead.whatsapp || lead.telefone;
    const digits = telefone ? telefone.replace(/\D/g, '') : '';
    let waUrl = '';
    if (digits.length >= 10) {
        const ddi = digits.startsWith('55') ? digits : ('55' + digits);
        waUrl = `https://wa.me/${ddi}?text=${encodeURIComponent(texto)}`;
    } else {
        waUrl = `https://wa.me/?text=${encodeURIComponent(texto)}`;
    }

    navigator.clipboard.writeText(texto).then(() => {
        showToast('Texto copiado! Abrindo WhatsApp...', 'success');
        window.open(waUrl, '_blank');
    }).catch(() => {
        window.open(waUrl, '_blank');
    });
}

function visualizarLandingPageLeadComoCliente() {
    const leadId = document.getElementById('lpLeadId')?.value || leadLpModalAtivoId;
    const lead = (typeof leads !== 'undefined' && Array.isArray(leads)) ? leads.find(l => l.id === leadId) : null;
    if (!lead) return;

    const selModelo = document.getElementById('lpLeadModeloId');
    const modeloId = selModelo ? selModelo.value : lead.landingPageModeloId;
    const clientUrl = montarLinkPortalLead(lead.id, modeloId);

    // Se for URL externa (ex: site ChatGPT ou template com urlExterna), abre diretamente em nova aba
    // sem iframe, evitando qualquer restrição de X-Frame-Options ou solicitação de autenticação
    if (clientUrl && (clientUrl.startsWith('http://') || clientUrl.startsWith('https://')) && !clientUrl.includes(window.location.origin)) {
        window.open(clientUrl, '_blank');
        return;
    }

    const rendered = renderizarLandingPageJIT(modeloId, lead);

    const win = window.open('', '_blank');
    if (win) {
        win.document.open();
        win.document.write(rendered);
        win.document.close();
    } else {
        const blob = new Blob([rendered], { type: 'text/html;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
    }
}

// Aliases de retrocompatibilidade
const salvarModeloLandingPageDoEditor = salvarModeloLandingPage;
const alternarAbaEditorLandingPage = alternarAbaEditorLP;
const inserirVariavelEditorLp = inserirTagEditor;
const atualizarLivePreviewEditor = atualizarLivePreviewEditorLP;
const alternarDispositivoPreviewEditor = setEditorViewport;
const salvarConfigLandingPageLead = salvarLandingPageLead;
const copiarLinkLandingPageLead = copiarLinkAcessoLead;
const abrirLandingPageComoCliente = visualizarLandingPageLeadComoCliente;
const abrirNovaAbaPreviewModal = abrirPreviewEmNovaAba;

function copiarLinkLandingPageLeadRapido(leadId) {
    const link = montarLinkPortalLead(leadId);
    if (!link) return;
    navigator.clipboard.writeText(link).then(() => {
        showToast('Link da Landing Page / Proposta copiado com sucesso!', 'success');
    }).catch(() => {
        prompt('Copie o link da Landing Page:', link);
    });
}

function abrirLandingPageLeadRapido(leadId) {
    const link = montarLinkPortalLead(leadId);
    if (!link) return;
    window.open(link, '_blank');
}

// ================================================================
// CONTROLE DA LANDING PAGE NA TELA DE ITENS / ORÇAMENTO
// ================================================================
function atualizarUILandingPageOrcamento(lead) {
    const wrap = document.getElementById('orcamentoLpEnvioWrap');
    if (!wrap) return;

    if (!lead) {
        wrap.style.display = 'none';
        return;
    }
    wrap.style.display = 'block';

    inicializarModelosLandingPageExemplo();

    const select = document.getElementById('orcLpModeloSelect');
    const inputUrl = document.getElementById('orcLpUrlInput');
    const viewsEl = document.getElementById('orcLpViewsQtd');
    const ultimoAcessoEl = document.getElementById('orcLpUltimoAcesso');

    // Modelo ativo do lead ou padrão do sistema
    const modeloPadrao = (modelosLandingPage || []).find(m => m.padrao) || (modelosLandingPage || [])[0];
    const modeloAtualId = lead.landingPageModeloId || (modeloPadrao ? modeloPadrao.id : 'lp_visualizador_orcamento');

    if (select) {
        select.innerHTML = (modelosLandingPage || []).map(m => {
            const isSelected = m.id === modeloAtualId;
            const prefix = m.tipo === 'externo' || m.urlExterna ? '🔗 [Externo] ' : '💻 [HTML] ';
            return `<option value="${m.id}" ${isSelected ? 'selected' : ''}>${prefix}${m.nome} ${m.padrao ? '(Padrão Admin)' : ''}</option>`;
        }).join('');
    }

    const clientUrl = montarLinkPortalLead(lead.id, modeloAtualId);
    if (inputUrl) {
        inputUrl.value = clientUrl;
    }

    if (viewsEl) {
        viewsEl.textContent = lead.landingPageViews || 0;
    }
    if (ultimoAcessoEl) {
        ultimoAcessoEl.textContent = lead.landingPageUltimoAcesso
            ? new Date(lead.landingPageUltimoAcesso).toLocaleString('pt-BR')
            : 'Nunca acessou';
    }
}

function alterarModeloLpOrcamentoAtual() {
    const lead = (typeof leads !== 'undefined' && Array.isArray(leads) && typeof itensEditLeadId !== 'undefined')
        ? leads.find(l => l.id === itensEditLeadId)
        : null;
    if (!lead) return;

    const select = document.getElementById('orcLpModeloSelect');
    if (!select) return;

    lead.landingPageModeloId = select.value;
    lead.atualizadoEm = new Date().toISOString();
    lead._modificadoLocal = true;

    // Atualiza o input de URL na hora
    const inputUrl = document.getElementById('orcLpUrlInput');
    if (inputUrl) {
        inputUrl.value = montarLinkPortalLead(lead.id, select.value);
    }

    if (typeof salvarCacheLocalImediato === 'function') salvarCacheLocalImediato();
    if (typeof salvarDados === 'function') salvarDados();
    if (typeof salvarLeadNoBanco === 'function') salvarLeadNoBanco(lead);

    const modeloObj = (modelosLandingPage || []).find(m => m.id === select.value);
    showToast(`Modelo de Landing Page do orçamento alterado para "${modeloObj ? modeloObj.nome : select.value}"!`, 'info');
}

function copiarLinkLpOrcamentoAtual() {
    const inputUrl = document.getElementById('orcLpUrlInput');
    const url = inputUrl?.value;
    if (!url) return;

    navigator.clipboard.writeText(url).then(() => {
        showToast('Link da Landing Page / Visualização copiado!', 'success');
    }).catch(() => {
        if (inputUrl) {
            inputUrl.select();
            document.execCommand('copy');
            showToast('Link da Landing Page copiado!', 'success');
        }
    });
}

function visualizarLpOrcamentoAtual() {
    const lead = (typeof leads !== 'undefined' && Array.isArray(leads) && typeof itensEditLeadId !== 'undefined')
        ? leads.find(l => l.id === itensEditLeadId)
        : null;
    if (!lead) return;

    const select = document.getElementById('orcLpModeloSelect');
    const modeloId = select ? select.value : (lead.landingPageModeloId || 'lp_visualizador_orcamento');
    const clientUrl = montarLinkPortalLead(lead.id, modeloId);

    // Se for URL externa, abre diretamente em nova aba sem bloqueios
    if (clientUrl && (clientUrl.startsWith('http://') || clientUrl.startsWith('https://')) && !clientUrl.includes(window.location.origin)) {
        window.open(clientUrl, '_blank');
        return;
    }

    const rendered = renderizarLandingPageJIT(modeloId, lead);
    const win = window.open('', '_blank');
    if (win) {
        win.document.open();
        win.document.write(rendered);
        win.document.close();
    } else {
        const blob = new Blob([rendered], { type: 'text/html;charset=utf-8' });
        const blobUrl = URL.createObjectURL(blob);
        window.open(blobUrl, '_blank');
    }
}

function enviarLpOrcamentoWhatsApp() {
    const lead = (typeof leads !== 'undefined' && Array.isArray(leads) && typeof itensEditLeadId !== 'undefined')
        ? leads.find(l => l.id === itensEditLeadId)
        : null;
    if (!lead) return;

    const select = document.getElementById('orcLpModeloSelect');
    const inputUrl = document.getElementById('orcLpUrlInput');
    const modeloId = select ? select.value : lead.landingPageModeloId;
    const clientUrl = (inputUrl && inputUrl.value) ? inputUrl.value : montarLinkPortalLead(lead.id, modeloId);
    const decisor = obterDecisorLead(lead) || 'Diretoria';
    const orcNumero = lead.numeroPedido || lead.orcamentoPdfPrincipal?.dadosExtraidos?.numero || 'da sua cotação';

    const isExterno = clientUrl.includes('chatgpt.site') || (clientUrl.startsWith('http') && !clientUrl.includes(window.location.origin));
    const texto = isExterno
        ? `Olá, ${decisor}! Preparamos a proposta comercial personalizada da Schmalz & MiCRO para a ${lead.empresa}.\n\n🌐 Acesse a apresentação interativa no link exclusivo:\n${clientUrl}\n\nQualquer dúvida, estou à disposição!`
        : `Olá, ${decisor}! Preparamos a proposta comercial personalizada (${orcNumero}) para a ${lead.empresa} na MiCRO Automação.\n\n🌐 Acesse sua proposta com visualizador e aprovação digital no link:\n${clientUrl}\n\nVocê pode analisar todas as especificações técnicas e assinar digitalmente o documento diretamente no portal. Qualquer dúvida, estou à disposição!`;

    // Se o lead tiver telefone ou WhatsApp cadastrado, tenta abrir direto
    const telefone = lead.whatsapp || lead.telefone;
    const digits = telefone ? telefone.replace(/\D/g, '') : '';
    let waUrl = '';
    if (digits.length >= 10) {
        const ddi = digits.startsWith('55') ? digits : ('55' + digits);
        waUrl = `https://wa.me/${ddi}?text=${encodeURIComponent(texto)}`;
    } else {
        waUrl = `https://wa.me/?text=${encodeURIComponent(texto)}`;
    }

    navigator.clipboard.writeText(texto).then(() => {
        showToast('Texto copiado! Abrindo WhatsApp...', 'success');
        window.open(waUrl, '_blank');
    }).catch(() => {
        window.open(waUrl, '_blank');
    });
}


// ================================================================
// PORTAL DO CLIENTE COM LOGIN (E-MAIL) E SENHA (CNPJ)
// ================================================================
// ACESSO DIRETO AO PORTAL DO CLIENTE (SEM LOGIN/SENHA)
// ================================================================
let leadClienteAutenticado = null;

async function buscarLeadParaAcessoDireto(leadId) {
    if (!leadId) return null;
    if (typeof leads !== 'undefined' && Array.isArray(leads) && leads.length > 0) {
        const l = leads.find(it => it.id === leadId);
        if (l) return l;
    }
    try {
        const raw = localStorage.getItem('feitosacrm_dados');
        if (raw) {
            const db = JSON.parse(raw);
            const l = (db.leads || []).find(it => it.id === leadId);
            if (l) return l;
        }
    } catch (e) {}

    if (typeof supabaseClient !== 'undefined' && supabaseClient.from) {
        try {
            const { data } = await supabaseClient.from('leads').select('*').eq('id', leadId).limit(1);
            if (data && data.length > 0) {
                const r = data[0];
                return (typeof linhaSupabaseParaLead === 'function') ? linhaSupabaseParaLead(r) : {
                    id: r.id,
                    empresa: r.empresa,
                    decisor: r.decisor,
                    email: r.email,
                    telefone: r.telefone,
                    cnpj: r.cnpj,
                    cidade: r.cidade,
                    estado: r.estado,
                    valor: r.valor,
                    condicoes: r.condicoes || r.card_obs || '',
                    obsOrcamento: r.obs_orcamento || '',
                    metodoEnvio: r.metodo_envio || '',
                    orcamentoPdfPrincipal: r.orcamento_pdf_principal,
                    orcamentoAnexos: r.orcamento_anexos,
                    autorizacaoPedidoId: r.autorizacao_pedido_id,
                    autorizacaoPedidoStatus: r.autorizacao_pedido_status,
                    landingPageModeloId: r.landing_page_modelo_id || null
                };
            }
        } catch (e) {}
    }
    return null;
}

async function verificarAcessoPortalCliente() {
    const urlParams = new URLSearchParams(window.location.search);
    const lpParam = urlParams.get('lp') || urlParams.get('portal');
    const modeloParam = urlParams.get('modelo') || '';
    const hash = window.location.hash;

    let leadIdDetectado = lpParam;
    if (!leadIdDetectado && hash.startsWith('#lp/')) {
        leadIdDetectado = hash.replace('#lp/', '').trim();
    }

    if (!leadIdDetectado) {
        return false;
    }

    // Quem tem o link abre a página diretamente sem login nem senha
    const crmLogin = document.getElementById('loginScreen');
    const appWrapper = document.getElementById('appWrapper');
    const portalLogin = document.getElementById('clientePortalLoginScreen');
    if (crmLogin) crmLogin.style.display = 'none';
    if (appWrapper) appWrapper.style.display = 'none';
    if (portalLogin) portalLogin.style.display = 'none';

    let lead = await buscarLeadParaAcessoDireto(leadIdDetectado);
    if (lead) {
        iniciarSessaoPortalCliente(lead, true, modeloParam);
        return true;
    }

    // Aguarda sincronização assíncrona dos dados e abre assim que estiver pronto
    setTimeout(async () => {
        lead = await buscarLeadParaAcessoDireto(leadIdDetectado);
        if (lead) {
            iniciarSessaoPortalCliente(lead, true, modeloParam);
        }
    }, 700);

    return true;
}

function exibirTelaLoginCliente(leadIdOpcional) {
    // Mantido apenas como compatibilidade caso chamado manualmente
    if (leadIdOpcional) {
        buscarLeadParaAcessoDireto(leadIdOpcional).then(l => {
            if (l) iniciarSessaoPortalCliente(l, true);
        });
    }
}

function autenticarClientePortal(event) {
    if (event) event.preventDefault();
    const inputLeadId = document.getElementById('clienteLoginLeadId')?.value.trim();
    if (inputLeadId) {
        buscarLeadParaAcessoDireto(inputLeadId).then(l => {
            if (l) iniciarSessaoPortalCliente(l, true);
        });
    }
}

async function iniciarSessaoPortalCliente(lead, registrarAcesso = true, modeloIdOverride = '') {
    leadClienteAutenticado = lead;

    sessionStorage.setItem('crm_cliente_sessao', JSON.stringify({
        leadId: lead.id,
        empresa: lead.empresa,
        email: lead.email,
        loginEm: new Date().toISOString()
    }));

    if (registrarAcesso) {
        lead.landingPageViews = (lead.landingPageViews || 0) + 1;
        lead.landingPageUltimoAcesso = new Date().toISOString();

        if (!lead.historico) lead.historico = [];
        lead.historico.push({
            id: 'h_' + Date.now(),
            data: new Date().toISOString().split('T')[0],
            hora: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            tipo: 'Portal / Landing Page',
            descricao: `Cliente ${lead.empresa} acessou a Landing Page pelo portal (visualização #${lead.landingPageViews}).`,
            usuario: 'Cliente (Portal)'
        });

        if (typeof salvarDados === 'function') salvarDados();
        if (typeof salvarLeadNoBanco === 'function') salvarLeadNoBanco(lead);
    }

    // Oculta telas de login e exibe a Landing Page
    const portalLogin = document.getElementById('clientePortalLoginScreen');
    const crmLogin = document.getElementById('loginScreen');
    const appWrapper = document.getElementById('appWrapper');
    const portalView = document.getElementById('clientePortalView');
    const iframe = document.getElementById('clienteLandingPageIframe');
    const nomeEmpresaTopo = document.getElementById('clientePortalTopoEmpresa');

    if (portalLogin) portalLogin.style.display = 'none';
    if (crmLogin) crmLogin.style.display = 'none';
    if (appWrapper) appWrapper.style.display = 'none';

    if (nomeEmpresaTopo) nomeEmpresaTopo.textContent = lead.empresa;

    if (portalView) portalView.style.display = 'block';

    if (iframe) {
        // Prioridade: modelo vindo na própria URL (?modelo=...) > modelo
        // salvo no lead > modelo Padrão atual. Busca sob demanda (Supabase →
        // cache local → padrão embutido) e só então monta o HTML em memória.
        const modeloParaUsar = modeloIdOverride || lead.landingPageModeloId;
        const rendered = await renderizarLandingPageJITAsync(modeloParaUsar, lead);
        iframe.srcdoc = rendered;
    }
}

function sairPortalCliente() {
    sessionStorage.removeItem('crm_cliente_sessao');
    leadClienteAutenticado = null;
    const portalView = document.getElementById('clientePortalView');
    if (portalView) portalView.style.display = 'none';

    // Se estiver com query param, limpa a query ou volta ao login do portal
    if (window.location.search.includes('lp=') || window.location.search.includes('portal=')) {
        window.location.href = window.location.pathname;
    } else {
        document.getElementById('loginScreen').style.display = 'flex';
    }
}

function voltarAoLoginCrmColaborador() {
    sessionStorage.removeItem('crm_cliente_sessao');
    const portalLogin = document.getElementById('clientePortalLoginScreen');
    const portalView = document.getElementById('clientePortalView');
    const crmLogin = document.getElementById('loginScreen');

    if (portalLogin) portalLogin.style.display = 'none';
    if (portalView) portalView.style.display = 'none';
    if (crmLogin) crmLogin.style.display = 'flex';
}

// ============================================
// AUDITORIA E RELATÓRIO DE VISUALIZAÇÕES DE CLIENTES
// ============================================

function obterLeadsComVisualizacoes() {
    const lista = (typeof leads !== 'undefined' && Array.isArray(leads)) ? leads : [];
    return lista.filter(l => (Number(l.landingPageViews) > 0) || Boolean(l.landingPageUltimoAcesso));
}

function abrirModalRelatorioVisualizacoesLP(leadIdFoco = null) {
    const inputBusca = document.getElementById('modalLpBuscaCliente');
    const selectEtapa = document.getElementById('modalLpFiltroEtapa');
    const selectOrdem = document.getElementById('modalLpOrdenacao');

    if (inputBusca) {
        if (leadIdFoco) {
            const leadFoco = (typeof leads !== 'undefined') ? leads.find(l => l.id === leadIdFoco) : null;
            inputBusca.value = leadFoco ? leadFoco.empresa : '';
        } else {
            inputBusca.value = '';
        }
    }
    if (selectEtapa) selectEtapa.value = '';
    if (selectOrdem) selectOrdem.value = 'ultimo_acesso';

    atualizarResumoMetricasVisualizacoesLP();
    filtrarTabelaVisualizacoesLP();
    abrirModal('modalRelatorioVisualizacoesLP');
}

function atualizarResumoMetricasVisualizacoesLP() {
    const leadsViram = obterLeadsComVisualizacoes();
    const totalViews = leadsViram.reduce((acc, l) => acc + (Number(l.landingPageViews) || 0), 0);
    const totalClientes = leadsViram.length;

    const hojeStr = new Date().toISOString().split('T')[0];
    const viramHoje = leadsViram.filter(l => l.landingPageUltimoAcesso && l.landingPageUltimoAcesso.startsWith(hojeStr)).length;
    const valorPipeline = leadsViram.reduce((acc, l) => acc + (Number(l.valor) || 0), 0);

    const elTotalViews = document.getElementById('modalLpTotalVisualizacoes');
    const elTotalClientes = document.getElementById('modalLpTotalClientesViram');
    const elViramHoje = document.getElementById('modalLpVisualizaramHoje');
    const elValorPipeline = document.getElementById('modalLpValorPipelineInteressado');

    if (elTotalViews) elTotalViews.textContent = totalViews;
    if (elTotalClientes) elTotalClientes.textContent = totalClientes;
    if (elViramHoje) elViramHoje.textContent = viramHoje;
    if (elValorPipeline) elValorPipeline.textContent = formatarMoeda(valorPipeline);
}

function filtrarTabelaVisualizacoesLP() {
    const tbody = document.getElementById('modalLpTabelaCorpo');
    if (!tbody) return;

    const termoBusca = (document.getElementById('modalLpBuscaCliente')?.value || '').toLowerCase().trim();
    const etapaFiltro = document.getElementById('modalLpFiltroEtapa')?.value || '';
    const ordenacao = document.getElementById('modalLpOrdenacao')?.value || 'ultimo_acesso';

    let lista = obterLeadsComVisualizacoes();

    if (etapaFiltro) {
        lista = lista.filter(l => l.etapa === etapaFiltro);
    }

    if (termoBusca) {
        lista = lista.filter(l => {
            const empresa = (l.empresa || '').toLowerCase();
            const decisor = (l.decisor || '').toLowerCase();
            const telefone = (l.telefone || '').replace(/\D/g, '');
            const whatsapp = (l.whatsapp || '').replace(/\D/g, '');
            const email = (l.email || '').toLowerCase();
            const cnpj = (l.cnpj || '').replace(/\D/g, '');
            const vend = (typeof usuarios !== 'undefined') ? (usuarios.find(u => u.id === l.usuarioId)?.nome || '').toLowerCase() : '';
            return empresa.includes(termoBusca) ||
                   decisor.includes(termoBusca) ||
                   email.includes(termoBusca) ||
                   telefone.includes(termoBusca) ||
                   whatsapp.includes(termoBusca) ||
                   cnpj.includes(termoBusca) ||
                   vend.includes(termoBusca);
        });
    }

    // Ordenação
    lista.sort((a, b) => {
        if (ordenacao === 'ultimo_acesso') {
            const dataA = a.landingPageUltimoAcesso ? new Date(a.landingPageUltimoAcesso).getTime() : 0;
            const dataB = b.landingPageUltimoAcesso ? new Date(b.landingPageUltimoAcesso).getTime() : 0;
            return dataB - dataA;
        } else if (ordenacao === 'mais_views') {
            return (Number(b.landingPageViews) || 0) - (Number(a.landingPageViews) || 0);
        } else if (ordenacao === 'maior_valor') {
            return (Number(b.valor) || 0) - (Number(a.valor) || 0);
        } else if (ordenacao === 'empresa') {
            return (a.empresa || '').localeCompare(b.empresa || '');
        }
        return 0;
    });

    if (lista.length === 0) {
        const totalSemFiltro = obterLeadsComVisualizacoes().length;
        if (totalSemFiltro === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align:center;padding:48px 16px;color:var(--text-muted);">
                        <span style="font-size:36px;display:block;margin-bottom:8px;">👀</span>
                        <strong style="font-size:15px;color:var(--text-primary);display:block;margin-bottom:4px;">Nenhuma visualização de cliente registrada até agora</strong>
                        <p style="font-size:13px;max-width:540px;margin:0 auto 16px;line-height:1.5;">
                            Quando você envia o link exclusivo da Landing Page ou Orçamento para o cliente via WhatsApp ou E-mail, cada vez que ele abrir o link, o CRM registra o momento exato e contabiliza a visualização aqui automaticamente.
                        </p>
                    </td>
                </tr>
            `;
        } else {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align:center;padding:32px 16px;color:var(--text-muted);">
                        <span style="font-size:24px;display:block;margin-bottom:6px;">🔍</span>
                        Nenhum cliente encontrado com os critérios de busca aplicados.
                    </td>
                </tr>
            `;
        }
        return;
    }

    const hojeStr = new Date().toISOString().split('T')[0];

    tbody.innerHTML = lista.map(lead => {
        const vendedor = (typeof usuarios !== 'undefined') ? usuarios.find(u => u.id === lead.usuarioId) : null;
        const etapaNome = (typeof ETAPA_NOMES !== 'undefined' && ETAPA_NOMES[lead.etapa]) || lead.etapa || 'Lead';
        const numViews = Number(lead.landingPageViews) || 0;

        // Formatação de data/hora do último acesso
        let dataHoraFormatada = '<span style="color:var(--text-muted);">Sem registro</span>';
        let ehHoje = false;
        if (lead.landingPageUltimoAcesso) {
            try {
                const dt = new Date(lead.landingPageUltimoAcesso);
                const dtIso = lead.landingPageUltimoAcesso.split('T')[0];
                ehHoje = (dtIso === hojeStr);
                const horaMin = dt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                if (ehHoje) {
                    dataHoraFormatada = `<span style="background:#dcfce7;color:#15803d;padding:3px 8px;border-radius:6px;font-weight:700;display:inline-flex;align-items:center;gap:4px;">🟢 Hoje às ${horaMin}</span>`;
                } else {
                    dataHoraFormatada = `<span style="color:var(--text-primary);font-weight:600;">${dt.toLocaleDateString('pt-BR')} às ${horaMin}</span>`;
                }
            } catch (e) {
                dataHoraFormatada = String(lead.landingPageUltimoAcesso);
            }
        }

        // WhatsApp do decisor ou telefone
        const foneWhats = (lead.whatsapp || lead.telefone || '').replace(/\D/g, '');
        let whatsBtn = '';
        if (foneWhats) {
            const msgWhats = encodeURIComponent(`Olá ${lead.decisor || ''}, tudo bem? Notei que estava avaliando nossa apresentação e proposta comercial para a ${lead.empresa}. Gostaria de tirar alguma dúvida técnica ou alinhar os próximos passos?`);
            whatsBtn = `
                <a href="https://wa.me/55${foneWhats}?text=${msgWhats}" target="_blank" class="btn btn-success btn-xs" title="Chamar decisor no WhatsApp agora" style="display:inline-flex;align-items:center;gap:3px;text-decoration:none;">
                    <span>💬</span> WhatsApp
                </a>
            `;
        }

        return `
            <tr style="border-bottom:1px solid var(--border-color, #e2e8f0);transition:background 0.15s;">
                <td style="padding:12px 14px;vertical-align:middle;">
                    <div style="font-weight:700;color:var(--text-primary);font-size:13px;">${lead.empresa}</div>
                    <div style="font-size:11px;color:var(--text-muted);margin-top:2px;">
                        ${lead.cnpj ? `CNPJ: ${lead.cnpj}` : ''} ${lead.cidade ? `• ${lead.cidade}/${lead.estado || ''}` : ''}
                    </div>
                </td>
                <td style="padding:12px 14px;vertical-align:middle;">
                    <div style="font-weight:600;color:var(--text-primary);">${lead.decisor || '—'}</div>
                    <div style="font-size:11px;color:var(--text-muted);margin-top:2px;">
                        ${lead.telefone || lead.whatsapp || lead.email || 'Sem contato direto'}
                    </div>
                </td>
                <td style="padding:12px 14px;vertical-align:middle;">
                    <div style="display:flex;align-items:center;gap:6px;">
                        <span class="badge" style="background:#e0f2fe;color:#0369a1;font-size:11px;padding:2px 6px;border-radius:4px;font-weight:600;">${etapaNome}</span>
                        <strong style="color:var(--stage-pedido, #059669);font-size:12px;">${formatarMoeda(lead.valor || 0)}</strong>
                    </div>
                    <div style="font-size:11px;color:var(--text-muted);margin-top:2px;">
                        Resp: ${vendedor ? vendedor.nome : 'Sem vendedor'}
                    </div>
                </td>
                <td style="padding:12px 14px;vertical-align:middle;text-align:center;">
                    <span class="badge" style="background:${numViews > 2 ? '#2563eb' : '#0284c7'};color:#fff;font-size:12px;font-weight:700;padding:4px 10px;border-radius:12px;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
                        👁️ ${numViews}x
                    </span>
                </td>
                <td style="padding:12px 14px;vertical-align:middle;">
                    ${dataHoraFormatada}
                </td>
                <td style="padding:12px 14px;vertical-align:middle;text-align:center;">
                    <div style="display:flex;gap:4px;justify-content:center;align-items:center;flex-wrap:wrap;">
                        ${whatsBtn}
                        <button type="button" class="btn btn-primary btn-xs" onclick="fecharModal('modalRelatorioVisualizacoesLP');abrirAtividade('${lead.id}')" title="Abrir histórico e atividades do lead">
                            📋 Ficha
                        </button>
                        <button type="button" class="btn btn-outline btn-xs" onclick="fecharModal('modalRelatorioVisualizacoesLP');abrirModalLandingPageLead('${lead.id}')" title="Configurar ou copiar link da Landing Page">
                            🌐 Link LP
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

function exportarRelatorioVisualizacoesCSV() {
    const lista = obterLeadsComVisualizacoes();
    if (!lista || lista.length === 0) {
        showToast('Nenhum dado de visualização disponível para exportar.', 'warning');
        return;
    }

    const cabecalho = ['Empresa', 'CNPJ', 'Cidade', 'Estado', 'Decisor', 'Telefone', 'WhatsApp', 'Email', 'Vendedor', 'Etapa', 'Valor', 'Visualizacoes', 'Ultimo_Acesso'];
    const linhas = lista.map(l => {
        const vend = (typeof usuarios !== 'undefined') ? (usuarios.find(u => u.id === l.usuarioId)?.nome || '') : '';
        const etapaNome = (typeof ETAPA_NOMES !== 'undefined' && ETAPA_NOMES[l.etapa]) || l.etapa || '';
        return [
            `"${(l.empresa || '').replace(/"/g, '""')}"`,
            `"${(l.cnpj || '').replace(/"/g, '""')}"`,
            `"${(l.cidade || '').replace(/"/g, '""')}"`,
            `"${(l.estado || '').replace(/"/g, '""')}"`,
            `"${(l.decisor || '').replace(/"/g, '""')}"`,
            `"${(l.telefone || '').replace(/"/g, '""')}"`,
            `"${(l.whatsapp || '').replace(/"/g, '""')}"`,
            `"${(l.email || '').replace(/"/g, '""')}"`,
            `"${vend.replace(/"/g, '""')}"`,
            `"${etapaNome.replace(/"/g, '""')}"`,
            Number(l.valor || 0).toFixed(2),
            Number(l.landingPageViews || 0),
            `"${(l.landingPageUltimoAcesso || '').replace(/"/g, '""')}"`
        ].join(';');
    });

    const csvContent = '\uFEFF' + cabecalho.join(';') + '\n' + linhas.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `visualizacoes_clientes_crm_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Relatório de visualizações exportado com sucesso!', 'success');
}

// Inicializa modelos se ainda não inicializado
inicializarModelosLandingPageExemplo();
