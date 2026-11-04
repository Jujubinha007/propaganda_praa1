// =============================================================
// TELA DE LOGIN (index.html)
// =============================================================

// Se a pessoa já entrou antes, vai direto para a votação
if (lerSessao()) {
  location.replace("votacao.html");
}

const formLogin = document.getElementById("formLogin");
const botaoEntrar = document.getElementById("botaoEntrar");

formLogin.addEventListener("submit", async (evento) => {
  evento.preventDefault(); // não recarrega a página

  botaoEntrar.disabled = true;
  botaoEntrar.textContent = "Entrando...";

  try {
    // O banco confere a senha e devolve { token, nome, email }
    const sessao = await chamarBanco("login", {
      p_nome: document.getElementById("nome").value,
      p_email: document.getElementById("email").value,
      p_senha: document.getElementById("senha").value,
    });
    salvarSessao(sessao);
    location.href = "votacao.html";
  } catch (erro) {
    alert(erro.message);
    botaoEntrar.disabled = false;
    botaoEntrar.textContent = "Entrar";
  }
});
