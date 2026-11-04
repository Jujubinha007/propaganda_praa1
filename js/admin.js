// =============================================================
// PAINEL DO PROFESSOR (admin.html)
// =============================================================

// O "crachá" do admin fica salvo só enquanto a aba estiver aberta
const CHAVE_ADMIN = "concurso2026_admin";
let tokenAdmin = sessionStorage.getItem(CHAVE_ADMIN);
let avaliacoes = []; // guardado para gerar a planilha

const areaLogin = document.getElementById("areaLogin");
const areaPainel = document.getElementById("areaPainel");
const botaoEntrarAdmin = document.getElementById("botaoEntrarAdmin");

// Procura o vídeo pelo id (para mostrar o título)
function acharVideo(id) {
  return VIDEOS.find((video) => video.id === id) || { titulo: `Vídeo ${id}`, produto: "" };
}

// Média com vírgula: 4.5 -> "4,50"
function formatarMedia(media) {
  return media.toFixed(2).replace(".", ",");
}

// =============================================================
// LOGIN
// =============================================================
document.getElementById("formAdmin").addEventListener("submit", async (evento) => {
  evento.preventDefault();
  botaoEntrarAdmin.disabled = true;
  botaoEntrarAdmin.textContent = "Entrando...";

  try {
    tokenAdmin = await chamarBanco("login_admin", {
      p_email: document.getElementById("emailAdmin").value,
      p_senha: document.getElementById("senhaAdmin").value,
    });
    sessionStorage.setItem(CHAVE_ADMIN, tokenAdmin);
    await carregarResultados();
  } catch (erro) {
    alert(erro.message);
  }

  botaoEntrarAdmin.disabled = false;
  botaoEntrarAdmin.textContent = "Entrar";
});

function sairAdmin() {
  sessionStorage.removeItem(CHAVE_ADMIN);
  tokenAdmin = null;
  areaPainel.hidden = true;
  areaLogin.hidden = false;
}

document.getElementById("botaoSairAdmin").addEventListener("click", sairAdmin);
document.getElementById("botaoAtualizar").addEventListener("click", carregarResultados);
document.getElementById("botaoPlanilha").addEventListener("click", baixarPlanilha);

// =============================================================
// RESULTADOS
// =============================================================
async function carregarResultados() {
  let dados;
  try {
    dados = await chamarBanco("resultados_admin", { p_token: tokenAdmin });
  } catch (erro) {
    sairAdmin();
    alert(erro.message);
    return;
  }

  areaLogin.hidden = true;
  areaPainel.hidden = false;
  avaliacoes = dados.avaliacoes;

  document.getElementById("totalParticipantes").textContent = dados.participantes;
  document.getElementById("totalAvaliacoes").textContent = avaliacoes.length;

  mostrarRanking(dados.ranking);
  mostrarAvaliacoes();
}

// Cria uma célula <td> com texto (textContent evita código malicioso nos nomes)
function adicionarCelula(linha, texto) {
  const celula = document.createElement("td");
  celula.textContent = texto;
  linha.appendChild(celula);
  return celula;
}

function mostrarRanking(rankingDoBanco) {
  // Junta a lista de vídeos com as médias do banco (vídeo sem voto = média 0)
  const ranking = VIDEOS.map((video) => {
    const resultado = rankingDoBanco.find((item) => item.video_id === video.id);
    return {
      ...video,
      quantidade: resultado ? resultado.quantidade : 0,
      media: resultado ? Number(resultado.media) : 0,
    };
  });

  // Maior média primeiro; empate -> mais votos primeiro
  ranking.sort((a, b) => b.media - a.media || b.quantidade - a.quantidade);

  const tabela = document.getElementById("tabelaRanking");
  tabela.innerHTML = "";

  ranking.forEach((video, posicao) => {
    const linha = document.createElement("tr");
    adicionarCelula(linha, `${posicao + 1}º`);

    const celulaTitulo = adicionarCelula(linha, video.titulo);
    const produto = document.createElement("small");
    produto.textContent = video.produto;
    celulaTitulo.appendChild(document.createElement("br"));
    celulaTitulo.appendChild(produto);

    adicionarCelula(linha, video.quantidade);
    adicionarCelula(linha, formatarMedia(video.media));

    // Barrinha da média (0 a 5)
    const celulaBarra = adicionarCelula(linha, "");
    const barra = document.createElement("div");
    barra.className = "barra";
    const preenchimento = document.createElement("div");
    preenchimento.style.width = `${(video.media / 5) * 100}%`;
    barra.appendChild(preenchimento);
    celulaBarra.appendChild(barra);

    tabela.appendChild(linha);
  });
}

function mostrarAvaliacoes() {
  const tabela = document.getElementById("tabelaAvaliacoes");
  tabela.innerHTML = "";

  if (avaliacoes.length === 0) {
    const linha = document.createElement("tr");
    const celula = adicionarCelula(linha, "Nenhuma avaliação ainda.");
    celula.colSpan = 5;
    tabela.appendChild(linha);
    return;
  }

  avaliacoes.forEach((avaliacao) => {
    const linha = document.createElement("tr");
    adicionarCelula(linha, avaliacao.nome);
    adicionarCelula(linha, avaliacao.email);
    adicionarCelula(linha, acharVideo(avaliacao.video_id).titulo);
    adicionarCelula(linha, `${avaliacao.nota} – ${ESCALA[avaliacao.nota]}`);
    adicionarCelula(linha, new Date(avaliacao.atualizado_em).toLocaleString("pt-BR"));
    tabela.appendChild(linha);
  });
}

// Gera um arquivo .csv (abre no Excel / Google Planilhas)
function baixarPlanilha() {
  const linhas = [["Nome", "E-mail", "Propaganda", "Nota", "Data"]];
  avaliacoes.forEach((avaliacao) => {
    linhas.push([
      avaliacao.nome,
      avaliacao.email,
      acharVideo(avaliacao.video_id).titulo,
      avaliacao.nota,
      new Date(avaliacao.atualizado_em).toLocaleString("pt-BR"),
    ]);
  });

  // Cada valor entre aspas, separados por ponto e vírgula (padrão do Excel no Brasil)
  const texto = linhas
    .map((linha) => linha.map((valor) => `"${String(valor).replace(/"/g, '""')}"`).join(";"))
    .join("\n");

  const arquivo = new Blob(["﻿" + texto], { type: "text/csv;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(arquivo);
  link.download = "avaliacoes-concurso-2026.csv";
  link.click();
}

// Se já entrou antes nesta aba, carrega direto
if (tokenAdmin) {
  carregarResultados();
}
