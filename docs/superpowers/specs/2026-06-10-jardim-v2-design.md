# Jardim dos Laços v2 — Design

**Data:** 2026-06-10
**Objetivo:** Deixar o sistema com visual moderno (glassmorphism no mesmo rosa) e tornar
**quinta, sexta e sábado** bem mais difíceis (mirando ~1h+ por dia), com fragmentos vindos de
um passo bônus e uma rede de segurança de dicas progressivas.

## Princípios

1. **Romântico e engraçado** — todo texto tem carinho e humor. Sem formulário pro usuário: eu
   escrevo o conteúdo.
2. **Nenhuma resposta depende de fato privado desconhecido.** Respostas são (a) fatos já conhecidos
   da história do casal, ou (b) deriváveis das pistas do próprio enigma. Isso mantém os puzzles
   *justos* (ela sempre consegue) sem eu precisar de dados que não tenho.
3. **Difícil, nunca frustrante.** Dicas progressivas por tempo real + tentativas garantem progresso.
4. **Tudo calibrável num lugar só** (`js/config.js` + `js/content.js`), pra ajustar tom/dificuldade depois.
5. **Terça e quarta continuam leves** (rampa de entrada). Só qui/sex/sáb ficam pesadas.

## Inventário de fatos conhecidos (matéria-prima)

- Dois anos de namoro · senha do amor "meu amor"
- Primeiro encontro: Shopping Iguatemi
- Música do casal: "Slow Down" — Chase Atlantic (`audio/slow-down.mp3` já existe)
- Viagem-presente: Comfort Suites, São José do Rio Preto, 13–14/06/2026
- Ela ama Hello Kitty · fotos: cosplay/anime, formatura, restaurante, passeio no shopping
- Cofre final: "HOTEL DE LUXO" (fragmentos HOT·EL·DE·LUXO)

> Sem áudios novos (usuário sem tempo): a fase de música usa o áudio existente + camadas em texto.

## 1. Visual — Vidro Fosco (Glassmorphism)

- Nova classe utilitária `.glass` em `css/styles.css`:
  `background: rgba(255,255,255,.30)`, `backdrop-filter: blur(10px)`, borda
  `1px solid rgba(255,255,255,.6)`, `box-shadow` suave, brilho interno sutil.
- Fundo: gradiente rosa suave por cima do starfield atual (mantém estrelas).
- Aplicar nos cards de **todas** as telas (Login, Hub, Enigma, Bloqueio, Cofre), trocando
  `bg-marfim` por `.glass` onde fizer sentido. Paleta atual preservada (rosa/marfim/cereja/marrom).
- Micro-animações: hover-lift nos cards/botões, fade-in ao trocar de etapa, brilho no botão primário.
- `prefers-reduced-motion` continua respeitado.

## 2. Motor de fases (`js/engine/phaseEngine.js`)

Roda uma fase difícil descrita como **dados** (lista de etapas). Responsabilidades:

- **Etapas sequenciais** com barra de progresso ("Etapa 2/3 🎀").
- **Validação** por etapa (cada etapa tem `check(input)`), com feedback fofo no erro.
- **Dicas progressivas** por etapa: array de 3 dicas que destravam por **tempo real OU tentativas**:
  - nível 1: após 3 erros *ou* 4 min
  - nível 2: após 6 erros *ou* 8 min
  - nível 3 (quase-resposta): após 10 erros *ou* 15 min
  - Um botão "🎀 pedir dicinha" aparece quando há dica disponível; nunca trava de vez.
- **Passo bônus → fragmento:** após a última etapa, aparece um "baú secreto" com 1 mini-enigma extra;
  só ao resolvê-lo o fragmento é coletado.
- **Persistência:** etapa atual + flags salvos em `localStorage` (ela fecha e volta no mesmo ponto).
- **Saída mestra:** senha de recuperação (já existe) e `?bypass` continuam pulando tudo.

Cada fase difícil vira um arquivo de **conteúdo** (`js/content.js` central, ou um por fase) com:
título, etapas (enunciado + pistas + resposta + dicas), e o enigma bônus. O `enigma.js` passa a
delegar fases 3/4/5 pro motor; mantém 1/2 como hoje (com glow-up visual).

## 3. Conteúdo concreto dos puzzles

> Texto final será mais caprichado; abaixo é o esqueleto pra validar tom e respostas.

### Quinta — Fase 3 · "Detetive do Amor" 🔍 (~1h)

- **Etapa 1 — Vasculhe o quarto.** Parser melhorado, mais objetos. 3 objetos escondem números que
  formam **1306** (a data da viagem 💕). Ex.: porta-retrato → "13", calendário rabiscado → "06",
  bilhete no travesseiro → confirma a ordem. Decoys engraçados (gaveta de meias: "só meias órfãs
  e um chiclete fóssil de 2021 🦴").
- **Etapa 2 — Diário trancado (código 1306).** Abre um diário com uma **cifra** (legenda emoji→letra)
  que decodifica para **VIAGEM**.
- **Etapa 3 — Palavra-chave "viagem"** abre a gavetinha secreta.
- **Bônus → fragmento "DE":** bilhete cifrado embaixo da cama.

### Sexta — Fase 4 · "Caixinha de Música" 🎵 (~1h)

- **Etapa 1 — Que música é essa?** Áudio atual → **Slow Down** (como hoje, com dicas).
- **Etapa 2 — Acróstico "playlist de você".** 4 títulos fofos que eu escrevo; as iniciais formam
  uma palavra (ex.: **A**manhecer · **M**eu Mundo · **O**lhar · **R**efúgio → **AMOR**). Um decoy
  engraçado ("Sofá & Pizza — nosso hino 🍕").
- **Etapa 3 — Complete o verso** que falta (linha fofa com lacuna; dicas escalam).
- **Bônus → fragmento "LUXO":** acróstico-piada sobre ela (**L**inda · **U**nica · **X**odó ·
  **O**riginal → **LUXO**).

### Sábado — Fase 5 · "Cofre Final" 🔐 (~1h+)

  > Os 4 fragmentos (HOT·EL·DE·LUXO) **já foram coletados** nas fases ter/qua/qui/sex. No sábado eles
  > não são revelados de novo — o desafio é *destravar os slots* e *montar a senha*.
- **Etapa 1 — 4 cadeados (charadas → fatos conhecidos).** Cada acerto **destrava um slot** do cofre
  (a difículdade está em responder; o fragmento ela já tem):
  1. "Onde nossos olhos se cruzaram, num templo do consumo 🛍️" → **Iguatemi** (destrava slot 1)
  2. "Nossa trilha sonora oficial 🎵" → **Slow Down** (slot 2)
  3. "A gata mais famosa que mora no seu coração (e na sua bolsa) 🎀" → **Hello Kitty** (slot 3)
  4. "Quantos anos de 'sim' a gente comemora? ⏳" → **dois anos** (slot 4)
- **Etapa 2 — Monte a senha.** Com os 4 slots destravados, ela digita os fragmentos coletados, com
  uma charada de ordem: "o sonho de toda princesa cansada: um _ _ _ _ _ + _ _ + _ _ _ _" →
  **HOTEL DE LUXO**.
- **Final** → revela voucher + mural de fotos (já existe), com confete.

## 4. Justiça e segurança

- Toda resposta é fato conhecido ou dedutível das pistas.
- Dicas escalam por tempo real → ninguém fica >~15–20 min travado num passo.
- Senha mestra (recuperação) e `?bypass` pulam qualquer coisa, pra teste e emergência.
- Calibragem (tempos de dica, tolerâncias) centralizada pra afrouxar depois do teste.

## 5. Arquitetura / arquivos

- `css/styles.css` — classes `.glass`, animações novas.
- `js/engine/phaseEngine.js` — motor (etapas, dicas, bônus, persistência).
- `js/content.js` — todo o texto/respostas das fases difíceis (editável).
- `js/screens/enigma.js` — passa a delegar fases 3/4/5 ao motor; 1/2 ganham só glow-up visual.
- `js/state.js` — estende persistência (progresso por etapa).
- Telas (`login/hub/bloqueio/cofre`) — aplicar `.glass`.
- Testes (`tests/`) — unidade pro motor (dicas, avanço de etapa, validação) e pros checks novos.

## 6. Fora de escopo / riscos

- **Sem áudios novos** (música usa o existente + texto).
- **1h+ é muito**: começamos "difícil e gostoso" e afrouxamos após teste real.
- Linha do tempo cronológica foi **descartada** (dependeria de datas que eu não sei); o sábado
  fica difícil via os 4 cadeados + charada de montagem.

## 7. Plano de entrega (incremental)

1. Visual vidro fosco (todas as telas) — baixo risco, alta visibilidade.
2. Motor de fases + persistência + testes.
3. Fase 3 (quinta) no motor.
4. Fase 4 (sexta) no motor.
5. Fase 5 (sábado) no motor.
6. Polimento de tom (romance/piada) + calibragem.
