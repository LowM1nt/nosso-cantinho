// js/config.js — conteúdo personalizado. Itens ainda pendentes marcados // FALTA.

export const CONFIG = {
  // --- Cronograma: terça em que a semana do jogo começa ---
  // Usado só para texto/datas; a liberação real vem da API de horário.
  dataInicio: '2026-06-09T00:00:00Z',   // terça 09/06/2026 (hoje)
  timezone: 'America/Sao_Paulo',

  // --- Tela 1: Login ---
  // Aceita variações sem acento/maiúscula E com ou sem espaços ("meu amor" = "meuamor").
  senhaLogin: 'meuamor',
  senhaRecuperacao: 'doisanosdeamor',    // senha mestra de emergência (só você usa) — troque se quiser

  // --- Fragmentos (ordem fixa) -> HOTEL DE LUXO ---
  fragmentos: { fase1: 'HOT', fase2: 'EL', fase3: 'DE', fase4: 'LUXO' },

  // --- Fase 1: Criptografia (emoji -> letra). Palavra secreta: "euteamo" ---
  fase1: {
    legenda: { '🍓': 'E', '⭐': 'U', '🎀': 'T', '🌸': 'A', '🍰': 'M', '💖': 'O' },
    desafios: [
      { dica: '🍓⭐🎀🍓🌸🍰💖', resposta: 'euteamo' }, // 🍓E ⭐U 🎀T 🍓E 🌸A 🍰M 💖O
    ],
  },

  // --- Fase 2: Mapa (coordenadas internas 0..100; fundo estilizado, não geo real) ---
  fase2: {
    alvo: { x: 62, y: 38 },     // alvo no fundo estilizado (clique tem tolerância generosa)
    raioAcertoPct: 10,          // tolerância: 10% da largura
    nomeLocal: 'nosso primeiro encontro, no Shopping Iguatemi',
  },

  // --- Fase 3: Quarto virtual (parser de comandos). Pista final na escrivaninha ---
  fase3: {
    pistaFinal: {
      palavrasChave: ['escrivaninha', 'escritorio', 'mesa', 'gaveta'],
      texto: 'Na escrivaninha, dentro de uma gavetinha secreta, um bilhete dobrado: 💌 fragmento "DE" — guarde com carinho!',
    },
    // objetos-decoy só pra ambientar (pode editar/adicionar):
    comandos: [
      { palavrasChave: ['cama', 'embaixo'], resposta: 'Embaixo da cama: só poeira fofa e um chinelo de coelho 🐰' },
      { palavrasChave: ['janela', 'cortina'], resposta: 'Pela janela, o céu cor-de-rosa do entardecer... mas nenhuma pista aqui 🌸' },
      { palavrasChave: ['guarda-roupa', 'armario', 'roupa'], resposta: 'No guarda-roupa, seus vestidos mais fofos. Nada escondido 👗' },
    ],
  },

  // --- Fase 4: Caixinha de música. "Slow Down" — Chase Atlantic ---
  fase4: {
    musicas: [
      { arquivo: 'audio/slow-down.mp3', resposta: 'slow down' }, // FALTA: colocar o arquivo audio/slow-down.mp3
    ],
  },

  // --- Cofre Final / Voucher ---
  voucher: {
    titulo: 'Voucher de Princesa: 2 Dias no Reino dos Sonhos',
    hotel: 'Comfort Suites — São José do Rio Preto',
    inclui: 'Suíte de Sábado 14h a Domingo 12h · Piscina · Pizza caseira · muito amor ❤️',
    validade: 'Sábado 13/06/2026 (14h) → Domingo 14/06/2026 (12h)',
    dedicatoria: 'Dois anos atrás meu mundo ficou cor-de-rosa quando você chegou. Cada dia ao seu lado é a minha aventura favorita — e essa caixinha de surpresas é só um pedacinho do quanto eu te amo. Que venham infinitos fins de semana só nossos. Feliz 2 anos, meu maior laço. 🎀💖',
  },

  // --- Mural de fotos (Polaroids no Cofre Final). Edite as legendas à vontade 🎀 ---
  fotos: [
    { arquivo: 'img/fotos/foto-1.jpg', legenda: 'euteamo 🌺' },
    { arquivo: 'img/fotos/foto-2.jpg', legenda: 'nós dois 💖' },
    { arquivo: 'img/fotos/foto-3.jpg', legenda: 'formatura 🎓' },
    { arquivo: 'img/fotos/foto-4.jpg', legenda: 'nosso mundo 🌸' },
    { arquivo: 'img/fotos/foto-5.jpg', legenda: 'nosso passeio 🎀' },
    { arquivo: 'img/fotos/foto-6.jpg', legenda: 'nosso date ✨' },
  ],

  // --- Webhook WhatsApp (CallMeBot) ---
  whatsapp: {
    ativo: false,                         // FALTA: mude para true depois de colar a apikey
    phone: '5517991732889',
    apikey: 'COLE_SUA_APIKEY_AQUI',       // FALTA: pegue no CallMeBot (instruções no chat)
  },
};
