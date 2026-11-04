// =============================================================
// TEMA CLARO / ESCURO
// Este arquivo é carregado no <head> de todas as páginas.
// - Na primeira visita, segue o tema do celular/computador.
// - Se a pessoa clicar no botão (lua/sol), a escolha fica salva.
// As cores de cada tema ficam no topo do css/style.css.
// =============================================================
const CHAVE_TEMA = "concurso2026_tema";

function temaInicial() {
  const salvo = localStorage.getItem(CHAVE_TEMA);
  if (salvo) {
    return salvo;
  }
  const sistemaEscuro = window.matchMedia("(prefers-color-scheme: dark)").matches;
  return sistemaEscuro ? "escuro" : "claro";
}

function aplicarTema(tema) {
  document.documentElement.dataset.tema = tema;

  // Atualiza o ícone e o texto do(s) botão(ões) de tema
  document.querySelectorAll(".botao-tema").forEach((botao) => {
    const escuro = tema === "escuro";
    botao.innerHTML = escuro
      ? '<i class="bi bi-sun-fill" aria-hidden="true"></i>'
      : '<i class="bi bi-moon-fill" aria-hidden="true"></i>';
    botao.setAttribute("aria-label", escuro ? "Ativar modo claro" : "Ativar modo escuro");
    botao.setAttribute("title", escuro ? "Modo claro" : "Modo escuro");
  });
}

// Aplica o tema antes da página aparecer (evita "piscar" branco)
aplicarTema(temaInicial());

// Quando a página terminar de carregar, liga o clique dos botões
document.addEventListener("DOMContentLoaded", () => {
  aplicarTema(document.documentElement.dataset.tema);

  document.querySelectorAll(".botao-tema").forEach((botao) => {
    botao.addEventListener("click", () => {
      const novoTema = document.documentElement.dataset.tema === "escuro" ? "claro" : "escuro";
      localStorage.setItem(CHAVE_TEMA, novoTema);
      aplicarTema(novoTema);
    });
  });
});
