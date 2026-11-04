// =============================================================
// PÁGINA DE VOTAÇÃO (votacao.html)
// =============================================================

// Sem login? Volta para a tela de login.
const sessao = lerSessao();
if (!sessao) {
  location.replace("index.html");
}

// ----- Estado da página -----
let notas = {};          // notas que ESTA pessoa já deu. Ex.: { 1: 5, 3: 2 }
let totalVotos = 0;      // total de votos de todo mundo
let atual = 0;           // posição do vídeo que está na tela (0 = primeiro)

// ----- Elementos da página -----
const player = document.getElementById("player");
const sobreposicao = document.getElementById("sobreposicao");
const botaoAssistir = document.getElementById("botaoAssistir");
const botaoAnterior = document.getElementById("botaoAnterior");
const botaoProximo = document.getElementById("botaoProximo");
const formNota = document.getElementById("formNota");
const opcoes = document.getElementById("opcoes");
const botaoEnviar = document.getElementById("botaoEnviar");
const aviso = document.getElementById("aviso");

// =============================================================
// VÍDEOS JÁ ABERTOS
// A pessoa só pode votar depois de abrir o vídeo.
// A lista de vídeos abertos fica salva no navegador.
// =============================================================
const CHAVE_ABERTOS = "concurso2026_abertos_" + (sessao ? sessao.email : "");

function videosAbertos() {
  return JSON.parse(localStorage.getItem(CHAVE_ABERTOS) || "[]");
}

function marcarComoAberto(id) {
  const abertos = videosAbertos();
  if (!abertos.includes(id)) {
    abertos.push(id);
    localStorage.setItem(CHAVE_ABERTOS, JSON.stringify(abertos));
  }
}

function podeAvaliar(id) {
  // Pode avaliar se abriu o vídeo OU se já tinha votado nele antes
  return videosAbertos().includes(id) || notas[id] !== undefined;
}

// =============================================================
// INÍCIO
// =============================================================
async function iniciar() {
  document.getElementById("nomeUsuario").textContent = sessao.nome;
  document.getElementById("totalVideos").textContent = VIDEOS.length;
  criarPontos();
  mostrarVideo();
  await carregarDados();
}

// Busca no banco as notas desta pessoa e o total de votos
async function carregarDados() {
  try {
    notas = await chamarBanco("minhas_notas", { p_token: sessao.token });
    totalVotos = await chamarBanco("total_avaliacoes");
  } catch (erro) {
    if (erro.message.includes("Sessão")) {
      sair();
      return;
    }
    mostrarAviso(erro.message, "erro");
  }
  atualizarCards();
  mostrarVideo();
}

// =============================================================
// MOSTRAR NA TELA
// =============================================================

// Atualiza os 3 cards (total de votos, vídeos e status)
function atualizarCards() {
  const avaliados = VIDEOS.filter((video) => notas[video.id] !== undefined).length;
  const faltam = VIDEOS.length - avaliados;

  document.getElementById("totalVotos").textContent = totalVotos;
  document.getElementById("statusUsuario").textContent = `${avaliados} de ${VIDEOS.length}`;

  let texto;
  if (faltam === 0) {
    texto = "Você avaliou todos os vídeos!";
  } else if (faltam === 1) {
    texto = "Falta 1 vídeo para avaliar";
  } else {
    texto = `Faltam ${faltam} vídeos para avaliar`;
  }
  document.getElementById("statusTexto").textContent = texto;

  atualizarPontos();
}

// Coloca o vídeo da posição "atual" no card
function mostrarVideo() {
  const video = VIDEOS[atual];

  // Reinicia o player e mostra o botão "Assistir vídeo"
  player.pause();
  player.removeAttribute("controls");
  player.src = video.video;
  player.poster = video.capa;
  sobreposicao.classList.remove("escondido");

  // Textos
  document.getElementById("contador").textContent = `Vídeo ${atual + 1} de ${VIDEOS.length}`;
  document.getElementById("tituloVideo").textContent = video.titulo;
  document.getElementById("produtoVideo").textContent = video.produto;

  // Marca a nota que a pessoa já deu (se já votou)
  document.querySelectorAll('input[name="nota"]').forEach((radio) => {
    radio.checked = Number(radio.value) === notas[video.id];
  });

  // Setas: desliga no primeiro e no último vídeo
  botaoAnterior.disabled = atual === 0;
  botaoProximo.disabled = atual === VIDEOS.length - 1;

  mostrarAviso("");
  atualizarStatusVideo();
  atualizarFormulario();
  atualizarPontos();
}

// Mostra se a pessoa já votou neste vídeo e qual nota deu
function atualizarStatusVideo() {
  const status = document.getElementById("statusVideo");
  const nota = notas[VIDEOS[atual].id];

  if (nota === undefined) {
    status.textContent = "Você ainda não avaliou este vídeo.";
    status.className = "status-video pendente";
  } else {
    status.textContent = `Sua avaliação: ${nota} – ${ESCALA[nota]}`;
    status.className = "status-video avaliado";
  }
}

// Libera ou bloqueia as notas, dependendo se o vídeo já foi aberto
function atualizarFormulario() {
  const liberado = podeAvaliar(VIDEOS[atual].id);
  opcoes.disabled = !liberado;
  botaoEnviar.disabled = !liberado;
  if (!liberado) {
    mostrarAviso("Assista ao vídeo para liberar a avaliação.");
  }
}

function mostrarAviso(texto, tipo = "") {
  aviso.textContent = texto;
  aviso.className = "aviso " + tipo;
}

// Bolinhas embaixo do card (uma para cada vídeo)
function criarPontos() {
  const pontos = document.getElementById("pontos");
  VIDEOS.forEach((video, posicao) => {
    const ponto = document.createElement("button");
    ponto.className = "ponto";
    ponto.setAttribute("aria-label", `Ir para o vídeo ${posicao + 1}`);
    ponto.addEventListener("click", () => irPara(posicao));
    pontos.appendChild(ponto);
  });
}

function atualizarPontos() {
  document.querySelectorAll(".ponto").forEach((ponto, posicao) => {
    ponto.classList.toggle("ativo", posicao === atual);
    ponto.classList.toggle("avaliado", notas[VIDEOS[posicao].id] !== undefined);
  });
}

// =============================================================
// AÇÕES DO USUÁRIO
// =============================================================

function irPara(posicao) {
  if (posicao >= 0 && posicao < VIDEOS.length) {
    atual = posicao;
    mostrarVideo();
  }
}

botaoAnterior.addEventListener("click", () => irPara(atual - 1));
botaoProximo.addEventListener("click", () => irPara(atual + 1));

// Setas do teclado também trocam de vídeo
document.addEventListener("keydown", (evento) => {
  if (evento.key === "ArrowLeft") irPara(atual - 1);
  if (evento.key === "ArrowRight") irPara(atual + 1);
});

// Botão "Assistir vídeo"
botaoAssistir.addEventListener("click", () => {
  sobreposicao.classList.add("escondido");
  player.setAttribute("controls", "");
  player.play().catch(() => {});
  marcarComoAberto(VIDEOS[atual].id);
  mostrarAviso("");
  atualizarFormulario();
});

// Botão "Enviar"
formNota.addEventListener("submit", async (evento) => {
  evento.preventDefault();

  const marcado = document.querySelector('input[name="nota"]:checked');
  if (!marcado) {
    mostrarAviso("Escolha uma nota antes de enviar.", "erro");
    return;
  }

  const video = VIDEOS[atual];
  const nota = Number(marcado.value);

  botaoEnviar.disabled = true;
  botaoEnviar.textContent = "Enviando...";

  try {
    await chamarBanco("enviar_nota", { p_token: sessao.token, p_video: video.id, p_nota: nota });
    notas[video.id] = nota;
    totalVotos = await chamarBanco("total_avaliacoes");
    atualizarCards();
    atualizarStatusVideo();
    mostrarAviso("Avaliação enviada! Você pode mudar a nota quando quiser.", "sucesso");
  } catch (erro) {
    mostrarAviso(erro.message, "erro");
  }

  botaoEnviar.disabled = false;
  botaoEnviar.textContent = "Enviar";
});

document.getElementById("botaoSair").addEventListener("click", sair);

// Começa tudo
if (sessao) {
  iniciar();
}
