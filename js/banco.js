// =============================================================
// FUNÇÕES QUE CONVERSAM COM O BANCO DE DADOS (Supabase)
// e que guardam quem está logado no navegador.
// =============================================================

// Chama uma função do banco (as que estão no arquivo setup.sql).
// Exemplo: await chamarBanco("enviar_nota", { p_token: "...", p_video: 1, p_nota: 5 })
async function chamarBanco(nomeDaFuncao, dados = {}) {
  let resposta;
  try {
    resposta = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${nomeDaFuncao}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_CHAVE,
      },
      body: JSON.stringify(dados),
    });
  } catch (erro) {
    throw new Error("Não foi possível conectar ao servidor. Verifique sua internet.");
  }

  const texto = await resposta.text();
  const resultado = texto ? JSON.parse(texto) : null;

  if (!resposta.ok) {
    throw new Error(resultado && resultado.message ? resultado.message : "Erro no servidor.");
  }
  return resultado;
}

// ----- Sessão do participante (fica salva no navegador) -----
const CHAVE_SESSAO = "concurso2026_sessao";

function salvarSessao(sessao) {
  localStorage.setItem(CHAVE_SESSAO, JSON.stringify(sessao));
}

function lerSessao() {
  try {
    return JSON.parse(localStorage.getItem(CHAVE_SESSAO));
  } catch (erro) {
    return null;
  }
}

function sair() {
  localStorage.removeItem(CHAVE_SESSAO);
  location.href = "index.html";
}
