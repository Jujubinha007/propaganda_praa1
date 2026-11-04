// =============================================================
// LISTA DE PROPAGANDAS
//
// Para ADICIONAR um vídeo:
//   1. Coloque o arquivo .mp4 na pasta "videos".
//   2. Copie um bloco { ... } abaixo e cole no final da lista.
//   3. Use um "id" novo (nunca repita nem troque o id de um vídeo
//      que já recebeu notas, senão as notas vão para o vídeo errado).
//
// "capa" é opcional: caminho de uma imagem (ex.: "img/capas/pringles.jpg").
// Se ficar vazia (""), o navegador mostra o primeiro quadro do vídeo.
// =============================================================
const VIDEOS = [
  {
    id: 1,
    titulo: "Um sabor de Pringles para cada momento especial",
    produto: "Pringles - batatas sabor tomate e cebola",
    video: "videos/pringles.mov",
    capa: "img/capas/pringles.png",
  },
  {
    id: 2,
    titulo: "Um pouco de cor muda tudo",
    produto: "M&M - Confeitos de chocolate",
    video: "videos/mms.mp4",
    capa: "img/capas/mms.png",
  },
  {
    id: 3,
    titulo: "Não dá pra resistir",
    produto: "Nestlé - Chocolate ao leite",
    video: "videos/nestle.mov",
    capa: "img/capas/nestle.png",
  },
  {
    id: 4,
    titulo: "Revele o seu lado mais marcante",
    produto: "Carolina Herrera - Perfume Good Girl",
    video: "videos/carolina-herrera.mp4",
    capa: "img/capas/carolina-herrera.png",
  },
  {
    id: 5,
    titulo: "Seu corpo mais energizado",
    produto: "Gandhi power - garrafa térmica e energética",
    video: "videos/gandhi-power.mp4",
    capa: "img/capas/gandhi-power.png",
  },
  {
    id: 6,
    titulo: "Vista o tempo com elegância",
    produto: "Lunor - relógio de ponteiro",
    video: "videos/relogio.mp4",
    capa: "img/capas/relogio.png",
  },
  {
    id: 7,
    titulo: "Todo dia é uma ocasião especial",
    produto: "O Boticário - perfume Egeo Blue",
    video: "videos/malbec.mp4",
    capa: "img/capas/malbec.png",
  },
  {
    id: 8,
    titulo: "Viva cada detalhe",
    produto: "Armani exchange - Óculos",
    video: "videos/oculos.mp4",
    capa: "img/capas/oculos.png",
  },
];

// Escala de avaliação (nota: descrição)
const ESCALA = {
  5: "Excelente",
  4: "Muito Bom",
  3: "Regular",
  2: "Ruim",
  1: "Muito Ruim",
  0: "Nulo",
};
