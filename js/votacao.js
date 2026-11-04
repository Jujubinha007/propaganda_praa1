// =============================================================
// PÁGINA DE VOTAÇÃO (votacao.html)
// =============================================================

// Sem login? Volta para a tela de login.
const sessao = lerSessao();
if (!sessao) {
  location.replace("index.html");
}

// =============================================================
// ORDEM DOS VÍDEOS (embaralhada para cada pessoa)
// A ordem é sorteada uma vez e fica salva no navegador,
// para não mudar toda vez que a página recarregar.
// =============================================================

// Embaralha uma lista (algoritmo de Fisher-Yates)
function embaralhar(lista) {
  const copia = [...lista];
  for (let i = copia.length - 1; i > 0; i--) {
    const sorteado = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[sorteado]] = [copia[sorteado], copia[i]];
  }
  return copia;
}

function ordemDoUsuario() {
  const chave = "concurso2026_ordem_" + sessao.email;
  let ids = JSON.parse(localStorage.getItem(chave) || "null");

  // Sorteia uma ordem nova se ainda não existe ou se a lista de vídeos mudou
  const listaMudou = !ids || ids.length !== VIDEOS.length || !VIDEOS.every((video) => ids.includes(video.id));
  if (listaMudou) {
    ids = embaralhar(VIDEOS.map((video) => video.id));
    localStorage.setItem(chave, JSON.stringify(ids));
  }

  return ids.map((id) => VIDEOS.find((video) => video.id === id));
}

// ----- Estado da página -----
const listaVideos = sessao ? ordemDoUsuario() : []; // vídeos na ordem desta pessoa
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
const areaVoto = document.getElementById("areaVoto");
const jaVotado = document.getElementById("jaVotado");

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

function jaVotou(id) {
  return notas[id] !== undefined;
}

// =============================================================
// INÍCIO
// =============================================================
async function iniciar() {
  document.getElementById("nomeUsuario").textContent = sessao.nome;
  document.getElementById("totalVideos").textContent = listaVideos.length;
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
  const avaliados = listaVideos.filter((video) => jaVotou(video.id)).length;
  const faltam = listaVideos.length - avaliados;

  document.getElementById("totalVotos").textContent = totalVotos;
  document.getElementById("statusUsuario").textContent = `${avaliados} de ${listaVideos.length}`;

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
  const video = listaVideos[atual];

  // Reinicia o player e mostra o botão "Assistir vídeo"
  player.pause();
  player.removeAttribute("controls");
  player.src = video.video;
  player.poster = video.capa;
  player.setAttribute("aria-label", `Vídeo: ${video.titulo}`);
  sobreposicao.classList.remove("escondido");

  // Textos
  document.getElementById("contador").textContent = `Vídeo ${atual + 1} de ${listaVideos.length}`;
  document.getElementById("tituloVideo").textContent = video.titulo;
  document.getElementById("produtoVideo").textContent = video.produto;

  // Desmarca as notas
  document.querySelectorAll('input[name="nota"]').forEach((radio) => {
    radio.checked = false;
  });

  // Setas: desliga no primeiro e no último vídeo
  botaoAnterior.disabled = atual === 0;
  botaoProximo.disabled = atual === listaVideos.length - 1;

  mostrarAviso("");
  atualizarLadoDireito();
  atualizarPontos();
}

// Já votou? Mostra só "Vídeo já votado". Senão, mostra as notas.
function atualizarLadoDireito() {
  const id = listaVideos[atual].id;
  const votado = jaVotou(id);

  areaVoto.hidden = votado;
  jaVotado.hidden = !votado;

  if (!votado) {
    // As notas só ficam liberadas depois de abrir o vídeo
    const liberado = videosAbertos().includes(id);
    opcoes.disabled = !liberado;
    botaoEnviar.disabled = !liberado;
    if (!liberado) {
      mostrarAviso("Assista ao vídeo para liberar a avaliação.");
    }
  }
}

function mostrarAviso(texto, tipo = "") {
  aviso.textContent = texto;
  aviso.className = "aviso " + tipo;
}

// Bolinhas embaixo do card (uma para cada vídeo)
function criarPontos() {
  const pontos = document.getElementById("pontos");
  listaVideos.forEach((video, posicao) => {
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
    ponto.setAttribute("aria-current", posicao === atual ? "true" : "false");
    ponto.classList.toggle("avaliado", jaVotou(listaVideos[posicao].id));
  });
}

// =============================================================
// AÇÕES DO USUÁRIO
// =============================================================

function irPara(posicao) {
  if (posicao >= 0 && posicao < listaVideos.length) {
    atual = posicao;
    mostrarVideo();
  }
}

botaoAnterior.addEventListener("click", () => irPara(atual - 1));
botaoProximo.addEventListener("click", () => irPara(atual + 1));

// Setas do teclado também trocam de vídeo
document.addEventListener("keydown", (evento) => {
  // Nas notas e no vídeo as setas já têm outra função (escolher nota / avançar o vídeo)
  if (evento.target.matches("input, video")) return;

  if (evento.key === "ArrowLeft") irPara(atual - 1);
  if (evento.key === "ArrowRight") irPara(atual + 1);
});

// Botão "Assistir vídeo"
botaoAssistir.addEventListener("click", () => {
  sobreposicao.classList.add("escondido");
  player.setAttribute("controls", "");
  player.play().catch(() => {});
  marcarComoAberto(listaVideos[atual].id);
  mostrarAviso("");
  atualizarLadoDireito();
});

// Botão "Enviar" (cada vídeo só pode ser votado uma vez)
formNota.addEventListener("submit", async (evento) => {
  evento.preventDefault();

  const marcado = document.querySelector('input[name="nota"]:checked');
  if (!marcado) {
    mostrarAviso("Escolha uma nota antes de enviar.", "erro");
    return;
  }

  const video = listaVideos[atual];
  const nota = Number(marcado.value);

  botaoEnviar.disabled = true;
  botaoEnviar.textContent = "Enviando...";

  try {
    await chamarBanco("enviar_nota", { p_token: sessao.token, p_video: video.id, p_nota: nota });
    notas[video.id] = nota;
    totalVotos = await chamarBanco("total_avaliacoes");
    atualizarCards();
    atualizarLadoDireito(); // troca o lado direito por "Vídeo já votado"
  } catch (erro) {
    if (erro.message.includes("já votou")) {
      // O banco diz que este vídeo já tinha voto: recarrega as notas
      await carregarDados();
    } else {
      mostrarAviso(erro.message, "erro");
    }
  }

  botaoEnviar.disabled = false;
  botaoEnviar.textContent = "Enviar";
});

document.getElementById("botaoSair").addEventListener("click", sair);

// Começa tudo
if (sessao) {
  iniciar();
}
