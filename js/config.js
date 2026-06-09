// js/config.js — TODO conteúdo personalizável vive aqui. Troque os valores marcados // TROCAR.

export const CONFIG = {
  // --- Cronograma: data de início da semana do jogo (terça-feira) ---
  // Usado só para texto/datas; a liberação real vem da API de horário.
  dataInicio: '2026-06-09T00:00:00Z',   // TROCAR (terça da semana do presente)
  timezone: 'America/Sao_Paulo',

  // --- Tela 1: Login ---
  // Aceita variações sem acento/maiúscula (comparado via normalizeText).
  senhaLogin: 'primeiro beijo',          // TROCAR
  senhaRecuperacao: 'laco secreto',      // TROCAR (senha mestra caso localStorage seja limpo)

  // --- Fragmentos (ordem fixa) ---
  fragmentos: { fase1: 'HOT', fase2: 'EL', fase3: 'DE', fase4: 'LUXO' },

  // --- Fase 1: Criptografia (emoji -> letra) ---
  fase1: {
    legenda: { '🍓': 'A', '⭐': 'M', '🎀': 'O', '🌸': 'R', '🍰': 'G' }, // TROCAR
    // palavras que ela deve decifrar (em emojis) e a resposta normalizada:
    desafios: [
      { dica: '🍓⭐🍓🌸', resposta: 'amar' },   // TROCAR (exemplo: 🍓=A ⭐=M 🍓=A 🌸=R)
    ],
  },

  // --- Fase 2: Mapa (coordenadas internas 0..100, não geo real) ---
  fase2: {
    alvo: { x: 62, y: 38 },     // TROCAR (posição do primeiro encontro no SVG/imagem)
    raioAcertoPct: 8,           // tolerância: 8% da largura
    nomeLocal: 'a praça onde nos conhecemos', // TROCAR
  },

  // --- Fase 3: Quarto virtual (parser de comandos) ---
  fase3: {
    // objeto que esconde a pista final + palavras-chave que o disparam:
    pistaFinal: { palavrasChave: ['caixinha', 'caixa'], texto: 'Dentro da caixinha: 💌 fragmento DE' }, // TROCAR
    // respostas a comandos exploratórios (palavra-chave -> resposta):
    comandos: [
      { palavrasChave: ['escrivaninha', 'mesa'], resposta: 'Sobre a escrivaninha há um bilhete rabiscado...' }, // TROCAR
      { palavrasChave: ['cama', 'embaixo'], resposta: 'Embaixo da cama, só poeira fofa e um chinelo de coelho.' }, // TROCAR
    ],
  },

  // --- Fase 4: Caixinha de música ---
  fase4: {
    // arquivos em /audio (uso pessoal). resposta normalizada via normalizeText.
    musicas: [
      { arquivo: 'audio/musica1.mp3', resposta: 'nossa musica' }, // TROCAR
    ],
  },

  // --- Cofre Final / Voucher ---
  voucher: {
    titulo: 'Voucher de Princesa: 2 Dias no Reino dos Sonhos', // TROCAR
    hotel: 'Hotel (nome/local)',          // TROCAR
    inclui: 'Suíte 2 dias · Piscina · Pizza · ❤️', // TROCAR
    validade: 'definir',                  // TROCAR
    dedicatoria: 'Pra você, meu maior laço. Feliz 2 anos. 🎀', // TROCAR
  },

  // --- Webhook WhatsApp (CallMeBot) ---
  whatsapp: {
    ativo: false,                         // TROCAR -> true quando tiver apikey
    phone: '55XXXXXXXXXXX',               // TROCAR (seu número, com DDI)
    apikey: 'SUA_APIKEY',                 // TROCAR
  },
};
