// Todo o conteúdo das fases difíceis. Edite à vontade pra ajustar tom/respostas. 🎀
export const CONTENT = {
  fase3: {
    objetos: [
      { chaves: ['porta', 'retrato', 'foto'], texto: 'Um porta-retrato nosso. Atrás, rabiscado: "13". 💕' },
      { chaves: ['calendario', 'parede', 'mes'], texto: 'No calendário, um mês todo coberto de coraçõezinhos: o "06". 🗓️' },
      { chaves: ['travesseiro', 'cama', 'almofada'], texto: 'Sob o travesseiro, um bilhete: "junta os números na ordem que achou e sonha alto." ✨' },
      { chaves: ['meia', 'gaveta'], texto: 'Gaveta de meias: só meias órfãs e um chiclete fóssil de 2021. 🦴 Foco, detetive!' },
      { chaves: ['guarda', 'roupa', 'armario'], texto: 'No guarda-roupa, seu moletom favorito (que na verdade é meu). 😏' },
    ],
    codigo: '1306',
    cifra: {
      legenda: { '🎀': 'V', '🍓': 'I', '⭐': 'A', '🌸': 'G', '💖': 'E', '🍰': 'M' },
      cifrado: '🎀🍓⭐🌸💖🍰',
      resposta: 'viagem',
    },
    bonus: { cifrado: '🎀 = D   💖 = E', resposta: 'DE', dica: 'Junta as duas letrinhas do bilhete. 💌' },
    hints1: ['Procure coisas que guardam datas (fotos, calendário).', 'São dois números: dia e mês.', 'O código é 1306 — dia 13, mês 06. 🗓️'],
    hints2: ['Use a legenda emoji→letra.', 'Começa com V e termina com M.', 'A palavra é VIAGEM. ✈️'],
  },
  fase4: {
    musicaResposta: ['slow down', 'slowdown'],
    acrostico: {
      titulos: ['Amanhecer', 'Meu Mundo', 'Olhar de Volta', 'Refúgio'],
      decoy: 'Sofá & Pizza (nosso hino) 🍕',
      resposta: 'amor',
    },
    verso: { texto: 'Devagar, sem pressa... porque com você até o tempo quer ____', resposta: ['ficar', 'slow down', 'parar'] },
    bonus: { acrostico: ['Linda', 'Única', 'Xodó', 'Original'], resposta: 'LUXO', dica: 'Pega a primeira letra de cada elogio. 😍' },
    hints1: ['Chase Atlantic 🎧', 'O nome manda "ir devagar"…', 'É "Slow Down". 🐢'],
    hintsAcrostico: ['Olhe a PRIMEIRA letra de cada título.', 'A-M-O-...', 'A palavra é AMOR. 💖'],
    hintsVerso: ['Rima com "lugar".', 'Quando é bom, a gente quer que dure.', 'É "ficar". 🥰'],
  },
  fase5: {
    cadeados: [
      { charada: 'Onde nossos olhos se cruzaram pela 1ª vez, num templo do consumo 🛍️', resposta: ['iguatemi', 'shopping iguatemi'], hints: ['Tem loja, praça de alimentação e cinema.', 'Começa com "Igua".', 'Shopping Iguatemi. 🛍️'] },
      { charada: 'Nossa trilha sonora oficial 🎵', resposta: ['slow down', 'slowdown'], hints: ['Chase Atlantic.', 'Manda ir devagar.', 'Slow Down. 🎶'] },
      { charada: 'A gata mais famosa que mora no seu coração (e na sua bolsa) 🎀', resposta: ['hello kitty', 'hellokitty', 'kitty'], hints: ['Branquinha, laço vermelho.', 'Sanrio…', 'Hello Kitty! 🎀'] },
      { charada: "Quantos anos de 'sim' a gente comemora? ⏳", resposta: ['dois anos', '2 anos', 'dois'], hints: ['Mais que um, menos que três.', 'Dois.', 'Dois anos! 💍'] },
    ],
    montagem: { dica: 'O sonho de toda princesa cansada: um _ _ _ _ _ + _ _ + _ _ _ _', resposta: 'HOTEL DE LUXO' },
  },
};
