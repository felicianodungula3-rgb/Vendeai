const http = require("http");

const PORT = process.env.PORT || 3000;

const page = `<!DOCTYPE html>
<html lang="pt">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>VendeAI - Assistente de Vendas</title>
<style>
*{box-sizing:border-box}
body{margin:0;background:#f3f6fb;color:#172033;font-family:Arial,sans-serif}
header{background:#153b70;color:white;padding:25px 18px;text-align:center}
header h1{margin:0;font-size:30px}
header p{margin:10px 0 0}
main{max-width:600px;margin:25px auto;padding:20px}
.card{background:white;padding:22px;border-radius:16px;box-shadow:0 5px 20px #0001}
label{display:block;font-weight:bold;margin:17px 0 7px}
input,select,textarea{width:100%;padding:13px;border:1px solid #ccd4e0;border-radius:9px;font-size:16px}
button{width:100%;padding:15px;background:#1769e0;color:white;border:0;border-radius:9px;font-size:17px;font-weight:bold;margin-top:20px}
#resultado{white-space:pre-wrap;line-height:1.6;margin-top:20px;overflow-wrap:anywhere}
footer{text-align:center;color:#667085;padding:20px;font-size:13px}
</style>
</head>
<body>
<header>
<h1>VendeAI 🤖</h1>
<p>Transforma os teus produtos em oportunidades de venda.</p>
</header>
<main>
<div class="card">
<h2>O que queres vender hoje?</h2>
<p>Preenche os campos e prepara o teu conteúdo comercial.</p>
<form id="form">
<label for="produto">Nome do produto ou serviço</label>
<input id="produto" required placeholder="Ex.: sapatos, roupa, telemóveis">
<label for="preco">Preço (opcional)</label>
<input id="preco" placeholder="Ex.: 15000 Kz">
<label for="publico">Público-alvo</label>
<input id="publico" placeholder="Ex.: jovens, famílias, empresas">
<label for="tipo">Tipo de conteúdo</label>
<select id="tipo">
<option>Anúncio para redes sociais</option>
<option>Mensagem para WhatsApp</option>
<option>Descrição de produto</option>
<option>Oferta promocional</option>
<option>Legenda para Instagram</option>
</select>
<button id="botao" type="submit">✨ Gerar conteúdo</button>
</form>
<div id="resultado"></div>
<button id="copiar" hidden type="button">Copiar conteúdo</button>
</div>
</main>
<footer>VendeAI — Mais criatividade para o teu negócio.</footer>
<script>
const form=document.getElementById('form');
const resultado=document.getElementById('resultado');
const botao=document.getElementById('botao');
const copiar=document.getElementById('copiar');

form.addEventListener('submit',async function(e){
e.preventDefault();
botao.disabled=true;
botao.textContent='A preparar...';
resultado.textContent='';
copiar.hidden=true;

try{
const resposta=await fetch('/api/generate',{
method:'POST',
headers:{'Content-Type':'application/json'},
body:JSON.stringify({
produto:document.getElementById('produto').value,
preco:document.getElementById('preco').value,
publico:document.getElementById('publico').value,
tipo:document.getElementById('tipo').value
})
});
const dados=await resposta.json();
if(!resposta.ok) throw new Error(dados.error||'Não foi possível gerar o conteúdo.');
resultado.textContent=dados.text;
copiar.hidden=false;
}catch(err){
resultado.textContent=err.message;
}
finally{
botao.disabled=false;
botao.textContent='✨ Gerar conteúdo';
}
});

copiar.addEventListener('click',async()=>{
try{
await navigator.clipboard.writeText(resultado.textContent);
copiar.textContent='Copiado!';
setTimeout(()=>copiar.textContent='Copiar conteúdo',2000);
}catch(e){
resultado.focus?.();
alert('Mantém o dedo sobre o texto para o copiar.');
}
});
</script>
</body>
</html>`;

const server = http.createServer(async (req, res) => {
  res.setHeader("X-Content-Type-Options", "nosniff");

  if (req.method === "GET" && req.url === "/") {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    return res.end(page);
  }

  if (req.method === "POST" && req.url === "/api/generate") {
    let body = "";

    req.on("data", chunk => {
      body += chunk;
      if (body.length > 10000) req.destroy();
    });

    req.on("end", async () => {
      const json = (status, data) => {
        res.writeHead(status, {
          "Content-Type": "application/json; charset=utf-8"
        });
        res.end(JSON.stringify(data));
      };

      try {
        const input = JSON.parse(body);
        const produto = String(input.produto || "").trim();
        const preco = String(input.preco || "").trim();
        const publico = String(input.publico || "clientes interessados").trim();
        const tipo = String(input.tipo || "Anúncio comercial").trim();

        if (!produto || produto.length > 200) {
          return json(400, { error: "Indica um produto válido." });
        }

        const key = process.env.OPENAI_API_KEY;

        if (!key) {
          return json(503, {
            error: "A aplicação está online, mas a IA ainda não foi configurada. É necessário adicionar a chave da API no servidor."
          });
        }

        const ai = await fetch("https://api.openai.com/v1/responses", {
          method: "POST",
          headers: {
            "Authorization": "Bearer " + key,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
            instructions: "És o VendeAI, um assistente comercial profissional. Escreve em português natural, claro e convincente. Não inventes características do produto, garantias ou descontos. Cria apenas o conteúdo solicitado.",
            input: "Cria: " + tipo +
              ". Produto: " + produto +
              ". Preço: " + (preco || "não indicado") +
              ". Público-alvo: " + publico +
              ". Produz um texto pronto a utilizar, com chamada à ação."
          })
        });

        const data = await ai.json();

        if (!ai.ok) {
          console.error("Erro da API:", ai.status);
          return json(502, {
            error: "Não foi possível gerar o conteúdo. Verifica a configuração da API."
          });
        }

        const text = (data.output || [])
          .flatMap(item => item.content || [])
          .filter(item => item.type === "output_text")
          .map(item => item.text)
          .join("\n");

        if (!text) {
          return json(502, { error: "A IA não devolveu texto. Tenta novamente." });
        }

        return json(200, { text });
      } catch (err) {
        console.error(err);
        return json(400, { error: "Pedido inválido. Tenta novamente." });
      }
    });

    return;
  }

  res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
  res.end("Página não encontrada");
});

server.listen(PORT, "0.0.0.0", () => {
  console.log("VendeAI iniciado na porta " + PORT);
});
