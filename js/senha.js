// =============================================================
// MOSTRAR / ESCONDER SENHA (botão de olho)
// Funciona em qualquer botão com a classe "botao-olho".
// O atributo aria-controls do botão diz qual campo ele controla.
// =============================================================
document.querySelectorAll(".botao-olho").forEach((botao) => {
  botao.addEventListener("click", () => {
    const campo = document.getElementById(botao.getAttribute("aria-controls"));
    const mostrar = campo.type === "password";

    // "text" mostra a senha, "password" esconde com bolinhas
    campo.type = mostrar ? "text" : "password";

    botao.innerHTML = mostrar
      ? '<i class="bi bi-eye-slash" aria-hidden="true"></i>'
      : '<i class="bi bi-eye" aria-hidden="true"></i>';
    botao.setAttribute("aria-label", mostrar ? "Esconder senha" : "Mostrar senha");
  });
});
