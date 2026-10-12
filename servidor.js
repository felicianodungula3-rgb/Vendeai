const http = require('http');

const PORT = process.env.PORT || 3000;

const servidor = http.createServer((pedido, resposta) => {
    resposta.writeHead(200, {
        'Content-Type': 'text/html; charset=utf-8'
    });

    resposta.end(`
<!DOCTYPE html>
<html lang="pt">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Vendeai - Assistente de Vendas</title>
    <style>
        * {
            box-sizing: border-box;
        }

        body {
            margin: 0;
            font-family: Arial, sans-serif;
            background: #f3f6fb;
            color: #172033;
        }

        header {
            background: #123c69;
            color: white;
            padding: 25px 18px;
            text-align: center;
        }

        header h1 {
            margin: 0;
            font-size: 30px;
        }

        header p {
            margin-bottom: 0;
        }

        main {
            max-width: 650px;
            margin: 25px auto;
            padding: 20px;
        }

        .cartao {
            background: white;
            padding: 22px;
            border-radius: 15px;
            box-shadow: 0 4px 15px #00000010;
        }

        label {
            display: block;
            margin-top: 16px;
            font-weight: bold;
        }

        input, textarea, select, button {
            width: 100%;
            padding: 13px;
            margin-top: 8px;
            border-radius: 8px;
            font-size: 16px;
        }

        input, textarea, select {
            border: 1px solid #ccd3df;
            background: white;
        }

        textarea {
            min-height: 100px;
            resize: vertical;
        }

        button {
            border: none;
            background: #147d50;
            color: white;
            font-weight: bold;
            cursor: pointer;
        }

        #resultado {
            margin-top: 20px;
            padding: 15px;
            background: #edf5ff;
            border-radius: 10px;
            white-space: pre-wrap;
            overflow-wrap: anywhere;
        }

        .nota {
            font-size: 13px;
            color: #586579;
            line-height: 1.5;
        }

        footer {
            text-align: center;
            padding: 20px;
            color: #586579;
        }
    </style>
</head>
<body>

<header>
    <h1>Vendeai</h1>
    <p>O teu assistente inteligente de vendas</p>
</header>

<main>
    <section class="cartao">
        <h2>Cria o teu anúncio</h2>

        <p>
            Preenche os campos para preparar um anúncio
            mais organizado para os teus clientes.
        </p>

        <form id="formulario">
            <label for="produto">Nome do produto ou serviço</label>
            <input id="produto" required
                   placeholder="Ex.: Telemóvel Samsung">

            <label for="preco">Preço em kwanzas (Kz)</label>
            <input id="preco" type="number" min="0" required
                   placeholder="Ex.: 85000">

            <label for="publico">Tipo de cliente</label>
            <select id="publico">
                <option>Clientes em geral</option>
                <option>Jovens</option>
                <option>Empresas</option>
                <option>Revendedores</option>
            </select>

            <label for="detalhes">Detalhes do produto</label>
            <textarea id="detalhes" required
                      placeholder="Descreve o produto, as vantagens e o estado..."></textarea>

            <button type="submit">Preparar anúncio</button>
        </form>

        <div id="resultado" hidden></div>

        <button id="copiar" hidden>Copiar anúncio</button>

        <p class="nota">
            Esta é a primeira versão experimental do Vendeai.
            A criação do anúncio é feita no teu dispositivo.
            A inteligência artificial será integrada numa etapa posterior.
        </p>
    </section>
</main>

<footer>
    Vendeai © 2026 — Assistente de vendas
</footer>

<script>
    const formulario = document.getElementById('formulario');
    const resultado = document.getElementById('resultado');
    const botaoCopiar = document.getElementById('copiar');

    formulario.addEventListener('submit', function(evento) {
        evento.preventDefault();

        const produto = document.getElementById('produto').value.trim();
        const preco = document.getElementById('preco').value;
        const publico = document.getElementById('publico').value;
        const detalhes = document.getElementById('detalhes').value.trim();

        const precoFormatado = Number(preco).toLocaleString('pt-PT');

        const anuncio =
            '🔥 ' + produto.toUpperCase() + ' 🔥\\n\\n' +
            detalhes + '\\n\\n' +
            '💰 Preço: ' + precoFormatado + ' Kz\\n' +
            '🎯 Ideal para: ' + publico + '\\n\\n' +
            '📩 Contacta-nos para mais informações!';

        resultado.textContent = anuncio;
        resultado.hidden = false;
        botaoCopiar.hidden = false;
    });

    botaoCopiar.addEventListener('click', async function() {
        try {
            await navigator.clipboard.writeText(resultado.textContent);
            botaoCopiar.textContent = 'Anúncio copiado!';
        } catch (erro) {
            const campo = document.createElement('textarea');
            campo.value = resultado.textContent;
            document.body.appendChild(campo);
            campo.select();
            document.execCommand('copy');
            campo.remove();
            botaoCopiar.textContent = 'Anúncio copiado!';
        }
    });
</script>

</body>
</html>
    `);
});

servidor.listen(PORT, '0.0.0.0', () => {
    console.log('Vendeai disponível na porta ' + PORT);
});
