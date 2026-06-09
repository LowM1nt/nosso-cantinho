# Escape Room "Jardim dos Laços" — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a single-page kawaii "escape room" gift web app that releases one puzzle per day (Tue–Sat) via server-validated time-gating, persists progress in localStorage, and reveals a hotel voucher in a final vault on Saturday.

**Architecture:** Zero-build static SPA. `index.html` holds every screen as a hidden `<section>`; a tiny router shows/hides them. All *pure logic* (state, time-gating, normalization, puzzle validation) lives in ES modules under `js/` that are unit-tested with Node's built-in test runner (`node --test`, no dependencies, no build). DOM/screen modules consume that logic and are verified manually in a local server + browser. All personalizable content lives in one `js/config.js`.

**Tech Stack:** HTML5, Vanilla JS (ES modules), Tailwind via Play CDN, Google Fonts (Fredoka/Quicksand), `canvas-confetti` (CDN), CallMeBot webhook (WhatsApp), GitHub Pages hosting. Tests: `node --test` (Node 18+, zero deps).

---

## Why this structure

- **No build step (PRD §4, §17):** production ships raw `.html/.css/.js`. `git push` → live on GitHub Pages.
- **Testable logic without a bundler:** pure functions exported as ES modules run in both the browser (`<script type="module">`) and Node (`node --test`). UI screens import the same modules.
- **Local dev needs a server:** ES module imports don't work over `file://`. Use `npx serve .` or `python -m http.server 8000` then open `http://localhost:8000`. (GitHub Pages serves over HTTPS, so this matches production and unlocks the webcam in §9.2.)

## File Structure

```
/
├── index.html                  # All 5 screens as hidden <section>s; CDN <script> tags; bootstraps main.js
├── css/
│   └── styles.css              # @keyframes (float, bounce, shimmer, page-flip, shake); prefers-reduced-motion
├── js/
│   ├── config.js               # ALL personalizable content (passwords, puzzle data, voucher, whatsapp). EXAMPLE values, marked // TROCAR
│   ├── normalize.js            # normalizeText() — lowercase, strip accents/punctuation/extra spaces
│   ├── state.js                # load/save/reset/migrate localStorage state; helpers (collectFragment, markDay…)
│   ├── timeGating.js           # fetchServerDate() cascade; mapDateToPhase(); phaseForToday()
│   ├── router.js               # showScreen(id) — toggles hidden sections
│   ├── notify.js               # sendWhatsApp(text) — CallMeBot fire-and-forget
│   ├── fragments.js            # validateVaultCombo() — checks the 4 final fragments
│   ├── puzzles/
│   │   ├── fase1-cripto.js     # decodeCipher(), checkFase1()
│   │   ├── fase2-mapa.js       # distance(), checkFase2()
│   │   ├── fase3-quarto.js     # parseCommand(), checkFase3()
│   │   └── fase4-musica.js     # checkSong()
│   ├── screens/
│   │   ├── login.js            # renders/handles Tela 1
│   │   ├── hub.js              # renders Tela 2 timeline + day states
│   │   ├── enigma.js           # loads correct puzzle UI for today (Tela 3)
│   │   ├── bloqueio.js         # Tela 4 countdown to next midnight (America/Sao_Paulo)
│   │   └── cofre.js            # Tela 5 vault + voucher reveal
│   ├── effects/
│   │   ├── cuteOverflow.js     # Quinta easter egg
│   │   └── fadaScanner.js      # Sexta webcam scanner + skip fallback
│   └── main.js                 # bootstrap: load state, validate time, route to screen
└── tests/
    ├── normalize.test.js
    ├── state.test.js
    ├── timeGating.test.js
    ├── fragments.test.js
    ├── fase1-cripto.test.js
    ├── fase2-mapa.test.js
    ├── fase3-quarto.test.js
    └── fase4-musica.test.js
```

**Run all tests:** `node --test` (from project root). **Run one:** `node --test tests/state.test.js`.

---

## SPRINT 0 — Foundation

### Task 0: Project scaffold + tooling

**Files:**
- Create: `package.json`
- Create: `.nojekyll` (empty — tells GitHub Pages to serve files starting with `_`/folders as-is)
- Create: `README.md`

- [ ] **Step 1: Create `package.json`** (only metadata + test script; no runtime deps)

```json
{
  "name": "jardim-dos-lacos",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "test": "node --test",
    "serve": "npx --yes serve ."
  }
}
```

- [ ] **Step 2: Create empty `.nojekyll`**

```
```

- [ ] **Step 3: Create `README.md`**

```markdown
# Jardim dos Laços 🎀

Escape room digital — presente de 2 anos de namoro.

## Rodar localmente
ES modules exigem servidor (não abra via file://):

    npm run serve      # ou: python -m http.server 8000

Abra http://localhost:8000

## Testar a lógica
    npm test           # node --test, sem dependências

## Publicar
git push → GitHub Pages (Settings → Pages → branch main). HTTPS automático.

## Personalizar
Todo o conteúdo (senhas, enigmas, voucher, WhatsApp) está em `js/config.js`.
```

- [ ] **Step 4: Verify Node version**

Run: `node --version`
Expected: `v18.x` or higher (needed for stable `node --test`).

- [ ] **Step 5: Commit**

```bash
git init
git add package.json .nojekyll README.md
git commit -m "chore: project scaffold (no-build static SPA + node --test)"
```

---

### Task 1: `normalize.js` — text normalization (TDD)

Used by login, puzzle parsers, song check, vault. Single source of truth for "ignore accents/case/punctuation".

**Files:**
- Create: `js/normalize.js`
- Test: `tests/normalize.test.js`

- [ ] **Step 1: Write the failing test**

```js
// tests/normalize.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalizeText } from '../js/normalize.js';

test('lowercases and strips accents', () => {
  assert.equal(normalizeText('Coração'), 'coracao');
  assert.equal(normalizeText('ÁÉÍÓÚ'), 'aeiou');
});

test('trims and collapses internal whitespace', () => {
  assert.equal(normalizeText('  olhar   escrivaninha  '), 'olhar escrivaninha');
});

test('removes punctuation', () => {
  assert.equal(normalizeText('Hotel, de Luxo!'), 'hotel de luxo');
});

test('handles empty and non-string input', () => {
  assert.equal(normalizeText(''), '');
  assert.equal(normalizeText(null), '');
  assert.equal(normalizeText(undefined), '');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/normalize.test.js`
Expected: FAIL — cannot find module `../js/normalize.js`.

- [ ] **Step 3: Write minimal implementation**

```js
// js/normalize.js
export function normalizeText(input) {
  if (typeof input !== 'string') return '';
  return input
    .normalize('NFD')                    // split accents from letters
    .replace(/[̀-ͯ]/g, '')     // drop accent marks
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')        // punctuation -> space
    .replace(/\s+/g, ' ')                // collapse whitespace
    .trim();
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/normalize.test.js`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add js/normalize.js tests/normalize.test.js
git commit -m "feat: normalizeText util with tests"
```

---

### Task 2: `config.js` — all personalizable content

Single file the gift-giver edits. Ships with **working example values** so the app runs end-to-end; each is marked `// TROCAR`.

**Files:**
- Create: `js/config.js`

- [ ] **Step 1: Create `js/config.js`**

```js
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
```

- [ ] **Step 2: Sanity check it parses**

Run: `node -e "import('./js/config.js').then(m => console.log(Object.keys(m.CONFIG)))"`
Expected: prints the array of config keys (`dataInicio`, `timezone`, …).

- [ ] **Step 3: Commit**

```bash
git add js/config.js
git commit -m "feat: central config.js with example content"
```

---

### Task 3: `state.js` — localStorage model (TDD)

**Files:**
- Create: `js/state.js`
- Test: `tests/state.test.js`

State shape (PRD §5):

```js
{ versao:1, faseAtual:1, fragmentosColetados:[],
  diasConcluidos:{terca:false,quarta:false,quinta:false,sexta:false},
  tentativasErradas:{fase1:0,fase2:0,fase3:0,fase4:0},
  easterEggDestravado:false, scannerConcluido:false, cofreAberto:false,
  dataInicio:null }
```

`state.js` accepts an injected storage object so it's testable in Node (no real localStorage).

- [ ] **Step 1: Write the failing test**

```js
// tests/state.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { defaultState, loadState, saveState, collectFragment, markDayDone, recordWrongAttempt } from '../js/state.js';

function fakeStorage() {
  const m = new Map();
  return { getItem: k => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, v), removeItem: k => m.delete(k) };
}

test('loadState returns default when empty', () => {
  const s = loadState(fakeStorage());
  assert.equal(s.versao, 1);
  assert.equal(s.faseAtual, 1);
  assert.deepEqual(s.fragmentosColetados, []);
  assert.equal(s.diasConcluidos.terca, false);
});

test('loadState recovers from corrupted JSON', () => {
  const st = fakeStorage();
  st.setItem('escapeRoomState', '{not valid json');
  const s = loadState(st);
  assert.deepEqual(s, defaultState());
});

test('saveState then loadState round-trips', () => {
  const st = fakeStorage();
  const s = defaultState();
  s.faseAtual = 3;
  saveState(st, s);
  assert.equal(loadState(st).faseAtual, 3);
});

test('collectFragment appends once and advances phase', () => {
  let s = defaultState();
  s = collectFragment(s, 1, 'HOT');
  assert.deepEqual(s.fragmentosColetados, ['HOT']);
  assert.equal(s.diasConcluidos.terca, true);
  assert.equal(s.faseAtual, 2);
  // idempotent: collecting the same phase again does nothing
  s = collectFragment(s, 1, 'HOT');
  assert.deepEqual(s.fragmentosColetados, ['HOT']);
});

test('recordWrongAttempt increments per phase', () => {
  let s = defaultState();
  s = recordWrongAttempt(s, 3);
  s = recordWrongAttempt(s, 3);
  assert.equal(s.tentativasErradas.fase3, 2);
});

test('markDayDone sets the right day', () => {
  let s = markDayDone(defaultState(), 2);
  assert.equal(s.diasConcluidos.quarta, true);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/state.test.js`
Expected: FAIL — module not found.

- [ ] **Step 3: Write minimal implementation**

```js
// js/state.js
const KEY = 'escapeRoomState';
const DAY_BY_PHASE = { 1: 'terca', 2: 'quarta', 3: 'quinta', 4: 'sexta' };

export function defaultState() {
  return {
    versao: 1,
    faseAtual: 1,
    fragmentosColetados: [],
    diasConcluidos: { terca: false, quarta: false, quinta: false, sexta: false },
    tentativasErradas: { fase1: 0, fase2: 0, fase3: 0, fase4: 0 },
    easterEggDestravado: false,
    scannerConcluido: false,
    cofreAberto: false,
    dataInicio: null,
  };
}

export function loadState(storage) {
  const raw = storage.getItem(KEY);
  if (!raw) return defaultState();
  try {
    const parsed = JSON.parse(raw);
    return migrate({ ...defaultState(), ...parsed });
  } catch {
    return defaultState();
  }
}

function migrate(s) {
  // versao permite migração futura; por enquanto só garante v1.
  s.versao = 1;
  return s;
}

export function saveState(storage, state) {
  storage.setItem(KEY, JSON.stringify(state));
  return state;
}

export function collectFragment(state, fase, valor) {
  const day = DAY_BY_PHASE[fase];
  if (state.diasConcluidos[day]) return state; // already done -> idempotent
  return {
    ...state,
    fragmentosColetados: [...state.fragmentosColetados, valor],
    diasConcluidos: { ...state.diasConcluidos, [day]: true },
    faseAtual: Math.min(fase + 1, 5),
  };
}

export function markDayDone(state, fase) {
  const day = DAY_BY_PHASE[fase];
  return { ...state, diasConcluidos: { ...state.diasConcluidos, [day]: true } };
}

export function recordWrongAttempt(state, fase) {
  const k = `fase${fase}`;
  return { ...state, tentativasErradas: { ...state.tentativasErradas, [k]: (state.tentativasErradas[k] || 0) + 1 } };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/state.test.js`
Expected: PASS (6 tests).

- [ ] **Step 5: Commit**

```bash
git add js/state.js tests/state.test.js
git commit -m "feat: localStorage state model with tests"
```

---

### Task 4: `index.html` shell + Tailwind/fonts/CDN + `styles.css`

**Files:**
- Create: `index.html`
- Create: `css/styles.css`

- [ ] **Step 1: Create `index.html`** (all screens hidden except login; CDN scripts; design tokens via Tailwind config)

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Jardim dos Laços 🎀</title>

  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@400;600;700&family=Quicksand:wght@400;500;600&display=swap" rel="stylesheet" />

  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            rosa: '#FFD1DC',
            marfim: '#FFFDD0',
            cereja: '#D72638',
            marrom: '#6B4F4F',
          },
          fontFamily: {
            titulo: ['Fredoka', 'sans-serif'],
            corpo: ['Quicksand', 'sans-serif'],
          },
        },
      },
    };
  </script>
  <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.3/dist/confetti.browser.min.js"></script>
  <link rel="stylesheet" href="css/styles.css" />
</head>
<body class="font-corpo text-marrom bg-rosa min-h-screen">

  <!-- Tela 1: Login -->
  <section id="screen-login" class="screen"></section>

  <!-- Tela 2: Hub -->
  <section id="screen-hub" class="screen hidden"></section>

  <!-- Tela 3: Enigma -->
  <section id="screen-enigma" class="screen hidden"></section>

  <!-- Tela 4: Bloqueio -->
  <section id="screen-bloqueio" class="screen hidden"></section>

  <!-- Tela 5: Cofre -->
  <section id="screen-cofre" class="screen hidden"></section>

  <script type="module" src="js/main.js"></script>
</body>
</html>
```

- [ ] **Step 2: Create `css/styles.css`** (keyframes + reduced-motion)

```css
/* css/styles.css — animações além do Tailwind */
@keyframes float   { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
@keyframes bounce2 { 0%,100% { transform: scale(1); } 50% { transform: scale(1.06); } }
@keyframes shimmer { 0%,100% { filter: brightness(1); } 50% { filter: brightness(1.25); } }
@keyframes shake   { 0%,100% { transform: translateX(0); } 25% { transform: translateX(-6px); } 75% { transform: translateX(6px); } }
@keyframes pageflip{ from { transform: rotateY(0); opacity:1; } to { transform: rotateY(-90deg); opacity:0; } }

.anim-float   { animation: float 3s ease-in-out infinite; }
.anim-bounce  { animation: bounce2 1.2s ease-in-out infinite; }
.anim-shimmer { animation: shimmer 2s ease-in-out infinite; }
.anim-shake   { animation: shake 0.4s ease-in-out; }
.anim-flip    { animation: pageflip 0.5s ease-in forwards; }

@media (prefers-reduced-motion: reduce) {
  .anim-float, .anim-bounce, .anim-shimmer, .anim-shake, .anim-flip { animation: none !important; }
}
```

- [ ] **Step 3: Verify it loads**

Run: `npm run serve` then open `http://localhost:8000`.
Expected: blank pink page, no console errors (Tailwind + fonts + confetti load). `main.js` 404 is expected until Task 8 — note it and continue.

- [ ] **Step 4: Commit**

```bash
git add index.html css/styles.css
git commit -m "feat: HTML shell with Tailwind CDN, fonts, design tokens"
```

---

### Task 5: `router.js` (TDD-lite) + `login.js` screen

**Files:**
- Create: `js/router.js`
- Create: `js/screens/login.js`
- Test: `tests/router.test.js`

- [ ] **Step 1: Write the failing test for router** (uses a fake document)

```js
// tests/router.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { showScreen } from '../js/router.js';

function fakeDoc(ids) {
  const els = new Map(ids.map(id => [id, { id, classList: new Set(),
    add(c){this.classList.add(c);}, remove(c){this.classList.delete(c);} }]));
  // wire classList methods properly
  for (const el of els.values()) {
    el.classList = { _s: new Set(['hidden']),
      add(c){this._s.add(c);}, remove(c){this._s.delete(c);}, contains(c){return this._s.has(c);} };
  }
  return { querySelectorAll: () => [...els.values()], getElementById: id => els.get(id) };
}

test('showScreen reveals target and hides the rest', () => {
  const doc = fakeDoc(['screen-login', 'screen-hub']);
  showScreen('screen-hub', doc);
  assert.equal(doc.getElementById('screen-hub').classList.contains('hidden'), false);
  assert.equal(doc.getElementById('screen-login').classList.contains('hidden'), true);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/router.test.js`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `js/router.js`**

```js
// js/router.js
export function showScreen(id, doc = document) {
  doc.querySelectorAll('.screen').forEach(el => el.classList.add('hidden'));
  const target = doc.getElementById(id);
  if (target) target.classList.remove('hidden');
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/router.test.js`
Expected: PASS (1 test).

- [ ] **Step 5: Implement `js/screens/login.js`** (DOM; verified manually)

```js
// js/screens/login.js
import { CONFIG } from '../config.js';
import { normalizeText } from '../normalize.js';

// onSuccess() is called after the page-flip animation completes.
export function renderLogin(onSuccess, doc = document) {
  const el = doc.getElementById('screen-login');
  el.className = 'screen flex flex-col items-center justify-center min-h-screen p-6';
  el.innerHTML = `
    <div id="login-card" class="bg-marfim rounded-3xl shadow-xl p-8 w-full max-w-sm text-center anim-float">
      <div class="text-6xl mb-2">🔒🎀</div>
      <h1 class="font-titulo text-2xl text-cereja mb-1">Diário Secreto</h1>
      <p class="text-sm mb-5">Sussurre a chavinha do nosso jardim 🌸</p>
      <input id="login-input" type="text" autocomplete="off"
        class="w-full rounded-full border-2 border-rosa px-4 py-3 text-center outline-none focus:border-cereja"
        placeholder="..." />
      <button id="login-btn"
        class="mt-4 w-full rounded-full bg-cereja text-marfim font-titulo py-3 anim-bounce">🎀 Abrir 🎀</button>
      <p id="login-msg" class="text-sm text-cereja mt-3 h-5"></p>
    </div>`;

  const input = doc.getElementById('login-input');
  const card  = doc.getElementById('login-card');
  const msg   = doc.getElementById('login-msg');

  function tryUnlock() {
    const guess = normalizeText(input.value);
    const ok = guess === normalizeText(CONFIG.senhaLogin)
            || guess === normalizeText(CONFIG.senhaRecuperacao);
    if (ok) {
      card.classList.add('anim-flip');
      setTimeout(onSuccess, 500);
    } else {
      card.classList.remove('anim-shake'); void card.offsetWidth; card.classList.add('anim-shake');
      msg.textContent = 'Hmm, essa chavinha não abriu 🔑 Tenta de novo!';
    }
  }

  doc.getElementById('login-btn').addEventListener('click', tryUnlock);
  input.addEventListener('keydown', e => { if (e.key === 'Enter') tryUnlock(); });
}
```

- [ ] **Step 6: Manual verification**

Temporarily add to `js/main.js` (create it): `import { renderLogin } from './screens/login.js'; renderLogin(() => alert('OK'));`
Run: `npm run serve`, open the page.
Expected: diary card; wrong password → shake + message; `CONFIG.senhaLogin` (e.g. "Primeiro Beijo" with caps/accents) → flip + alert. Confirms accent/case tolerance (Acceptance §14 Login).

- [ ] **Step 7: Commit**

```bash
git add js/router.js js/screens/login.js tests/router.test.js
git commit -m "feat: router + login screen with accent-tolerant password"
```

---

## SPRINT 1 — Navigation & Time-Gating

### Task 6: `timeGating.js` — server date cascade + day→phase (TDD)

**Files:**
- Create: `js/timeGating.js`
- Test: `tests/timeGating.test.js`

Pure mapping logic is tested directly; the network cascade is exercised with an injected `fetch`.

- [ ] **Step 1: Write the failing test**

```js
// tests/timeGating.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mapWeekdayToPhase, fetchServerDate } from '../js/timeGating.js';

test('mapWeekdayToPhase maps Tue..Sat to phases, blocks Sun/Mon', () => {
  // 0=Sun,1=Mon,2=Tue,3=Wed,4=Thu,5=Fri,6=Sat
  assert.deepEqual(mapWeekdayToPhase(1), { tipo: 'bloqueado' });          // segunda
  assert.deepEqual(mapWeekdayToPhase(2), { tipo: 'fase', fase: 1 });      // terça
  assert.deepEqual(mapWeekdayToPhase(3), { tipo: 'fase', fase: 2 });
  assert.deepEqual(mapWeekdayToPhase(4), { tipo: 'fase', fase: 3 });
  assert.deepEqual(mapWeekdayToPhase(5), { tipo: 'fase', fase: 4 });
  assert.deepEqual(mapWeekdayToPhase(6), { tipo: 'cofre' });              // sábado
  assert.deepEqual(mapWeekdayToPhase(0), { tipo: 'bloqueado' });          // domingo
});

test('fetchServerDate falls back to secondary API when primary fails', async () => {
  const calls = [];
  const fakeFetch = async (url) => {
    calls.push(url);
    if (url.includes('worldtimeapi')) throw new Error('down');
    return { ok: true, json: async () => ({ dateTime: '2026-06-10T10:00:00-03:00' }) };
  };
  const d = await fetchServerDate(fakeFetch);
  assert.ok(d instanceof Date);
  assert.equal(calls.length, 2); // tried primary then secondary
});

test('fetchServerDate returns null when everything fails (never local clock)', async () => {
  const fakeFetch = async () => { throw new Error('offline'); };
  assert.equal(await fetchServerDate(fakeFetch), null);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/timeGating.test.js`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `js/timeGating.js`**

```js
// js/timeGating.js
// NUNCA usa new Date() local para liberar fases (PRD §6.1).

export function mapWeekdayToPhase(weekday) {
  switch (weekday) {
    case 2: return { tipo: 'fase', fase: 1 };
    case 3: return { tipo: 'fase', fase: 2 };
    case 4: return { tipo: 'fase', fase: 3 };
    case 5: return { tipo: 'fase', fase: 4 };
    case 6: return { tipo: 'cofre' };
    default: return { tipo: 'bloqueado' }; // domingo/segunda
  }
}

// Cascade: worldtimeapi -> timeapi.io -> null. Each parses its own shape.
export async function fetchServerDate(fetchFn = fetch) {
  // 1) worldtimeapi
  try {
    const r = await fetchFn('https://worldtimeapi.org/api/timezone/America/Sao_Paulo');
    if (r.ok) { const j = await r.json(); if (j.datetime || j.dateTime) return new Date(j.datetime || j.dateTime); }
  } catch { /* fall through */ }
  // 2) timeapi.io
  try {
    const r = await fetchFn('https://timeapi.io/api/Time/current/zone?timeZone=America/Sao_Paulo');
    if (r.ok) { const j = await r.json(); if (j.dateTime) return new Date(j.dateTime); }
  } catch { /* fall through */ }
  return null; // offline -> caller shows cute screen, does NOT release a phase
}

// Returns the weekday (0..6) in America/Sao_Paulo for a given Date.
export function saoPauloWeekday(date) {
  const fmt = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Sao_Paulo', weekday: 'short' });
  const map = { Sun:0, Mon:1, Tue:2, Wed:3, Thu:4, Fri:5, Sat:6 };
  return map[fmt.format(date)];
}
```

> Note: `worldtimeapi` returns `datetime`; the test's secondary uses `dateTime` — both handled.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/timeGating.test.js`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add js/timeGating.js tests/timeGating.test.js
git commit -m "feat: time-gating cascade + weekday->phase mapping with tests"
```

---

### Task 7: `bloqueio.js` — countdown screen (Tela 4)

**Files:**
- Create: `js/screens/bloqueio.js`
- Create: `js/time-helpers.js`
- Test: `tests/time-helpers.test.js`

- [ ] **Step 1: Write the failing test for the countdown math**

```js
// tests/time-helpers.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { msUntilNextMidnightSP, formatHMS } from '../js/time-helpers.js';

test('formatHMS pads correctly', () => {
  assert.equal(formatHMS(0), '00:00:00');
  assert.equal(formatHMS(3661 * 1000), '01:01:01');
  assert.equal(formatHMS(5 * 1000), '00:00:05');
});

test('msUntilNextMidnightSP is positive and < 24h', () => {
  const now = new Date('2026-06-10T15:30:00-03:00');
  const ms = msUntilNextMidnightSP(now);
  assert.ok(ms > 0 && ms <= 24 * 3600 * 1000);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/time-helpers.test.js`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `js/time-helpers.js`**

```js
// js/time-helpers.js
export function formatHMS(ms) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = String(Math.floor(total / 3600)).padStart(2, '0');
  const m = String(Math.floor((total % 3600) / 60)).padStart(2, '0');
  const s = String(total % 60).padStart(2, '0');
  return `${h}:${m}:${s}`;
}

// Milliseconds from `now` until the next 00:00 in America/Sao_Paulo.
export function msUntilNextMidnightSP(now) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Sao_Paulo', hour12: false,
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  }).formatToParts(now);
  const get = t => Number(parts.find(p => p.type === t).value);
  let h = get('hour'); if (h === 24) h = 0;
  const secsIntoDay = h * 3600 + get('minute') * 60 + get('second');
  return (24 * 3600 - secsIntoDay) * 1000;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/time-helpers.test.js`
Expected: PASS (2 tests).

- [ ] **Step 5: Implement `js/screens/bloqueio.js`** (DOM)

```js
// js/screens/bloqueio.js
import { msUntilNextMidnightSP, formatHMS } from '../time-helpers.js';

let timer = null;

// motivo: 'futuro' (tentou dia futuro) | 'concluido' (terminou enigma do dia)
export function renderBloqueio(motivo, doc = document) {
  const el = doc.getElementById('screen-bloqueio');
  const msg = motivo === 'concluido'
    ? 'Que delícia de aventura! A Kitty foi dormir 😴 Volte amanhã!'
    : 'A Kitty ainda está sonhando com esse dia 💤 Volte quando o sol nascer!';
  el.className = 'screen flex flex-col items-center justify-center min-h-screen p-6 text-center';
  el.innerHTML = `
    <div class="text-7xl mb-3 anim-float">😴🌙⭐</div>
    <h2 class="font-titulo text-2xl text-cereja mb-2">Hora do Soninho</h2>
    <p class="max-w-xs mb-4">${msg}</p>
    <div id="bloqueio-timer" class="font-titulo text-3xl bg-marfim rounded-2xl px-6 py-3 shadow">--:--:--</div>
    <p class="text-xs mt-2">Próxima aventura à meia-noite 🎀</p>`;

  const out = doc.getElementById('bloqueio-timer');
  function tick() {
    const ms = msUntilNextMidnightSP(new Date());
    out.textContent = formatHMS(ms);
  }
  tick();
  if (timer) clearInterval(timer);
  timer = setInterval(tick, 1000);
}

export function stopBloqueio() { if (timer) { clearInterval(timer); timer = null; } }
```

> The countdown's display uses the local clock only for the *visual* tick; phase release still comes from `timeGating.fetchServerDate` (PRD §6.1).

- [ ] **Step 6: Commit**

```bash
git add js/time-helpers.js js/screens/bloqueio.js tests/time-helpers.test.js
git commit -m "feat: bloqueio countdown screen + tested time helpers"
```

---

### Task 8: `hub.js` (Tela 2) + `main.js` bootstrap + `notify.js`

**Files:**
- Create: `js/screens/hub.js`
- Create: `js/notify.js`
- Create/replace: `js/main.js`

- [ ] **Step 1: Implement `js/notify.js`** (fire-and-forget)

```js
// js/notify.js
import { CONFIG } from './config.js';

// Never blocks UI; swallow all errors (PRD §9.3).
export function sendWhatsApp(text) {
  if (!CONFIG.whatsapp.ativo) return;
  const { phone, apikey } = CONFIG.whatsapp;
  const url = `https://api.callmebot.com/whatsapp.php?phone=${encodeURIComponent(phone)}`
            + `&text=${encodeURIComponent(text)}&apikey=${encodeURIComponent(apikey)}`;
  try { fetch(url, { mode: 'no-cors' }).catch(() => {}); } catch { /* ignore */ }
}
```

- [ ] **Step 2: Implement `js/screens/hub.js`** (timeline with per-day visual states)

```js
// js/screens/hub.js
const DIAS = [
  { fase: 1, key: 'terca',  nome: 'Terça',  emoji: '🍓' },
  { fase: 2, key: 'quarta', nome: 'Quarta', emoji: '🗺️' },
  { fase: 3, key: 'quinta', nome: 'Quinta', emoji: '🎀' },
  { fase: 4, key: 'sexta',  nome: 'Sexta',  emoji: '🎵' },
  { fase: 5, key: 'sabado', nome: 'Sábado', emoji: '🔐' },
];

// onPickDay(fase) called when she clicks a day. faseHoje = liberada pela API (1..5 or 0 if none).
export function renderHub(state, faseHoje, onPickDay, doc = document) {
  const el = doc.getElementById('screen-hub');
  el.className = 'screen min-h-screen p-6';
  const cards = DIAS.map(d => {
    const concluido = d.key !== 'sabado' && state.diasConcluidos[d.key];
    const atual = d.fase === faseHoje;
    let visual, label;
    if (concluido)      { visual = 'bg-marfim border-4 border-emerald-300'; label = '🌈 💚'; }
    else if (atual)     { visual = 'bg-marfim border-4 border-cereja anim-shimmer cursor-pointer'; label = '✨ Hoje!'; }
    else                { visual = 'bg-gray-200 text-gray-400'; label = '😴🔒'; }
    return `<button data-fase="${d.fase}" data-atual="${atual}"
        class="rounded-3xl shadow p-5 flex flex-col items-center anim-float ${visual}">
        <span class="text-4xl mb-1">${d.emoji}</span>
        <span class="font-titulo">${d.nome}</span>
        <span class="text-sm mt-1">${label}</span>
      </button>`;
  }).join('');

  el.innerHTML = `
    <h1 class="font-titulo text-2xl text-cereja text-center mb-1">Jardim dos Laços 🎀</h1>
    <p class="text-center text-sm mb-5">Fragmentos: ${state.fragmentosColetados.join(' ') || '—'}</p>
    <div class="grid grid-cols-1 sm:grid-cols-5 gap-4 max-w-3xl mx-auto">${cards}</div>`;

  el.querySelectorAll('button[data-fase]').forEach(btn => {
    btn.addEventListener('click', () => onPickDay(Number(btn.dataset.fase), btn.dataset.atual === 'true'));
  });
}
```

- [ ] **Step 3: Implement `js/main.js`** (bootstrap + routing brain)

```js
// js/main.js
import { CONFIG } from './config.js';
import { loadState, saveState } from './state.js';
import { showScreen } from './router.js';
import { fetchServerDate, saoPauloWeekday, mapWeekdayToPhase } from './timeGating.js';
import { renderLogin } from './screens/login.js';
import { renderHub } from './screens/hub.js';
import { renderBloqueio } from './screens/bloqueio.js';
import { renderEnigma } from './screens/enigma.js';
import { renderCofre } from './screens/cofre.js';

const storage = window.localStorage;
let state = loadState(storage);
if (!state.dataInicio) { state.dataInicio = CONFIG.dataInicio; saveState(storage, state); }

function persist() { saveState(storage, state); }

function showOffline() {
  const el = document.getElementById('screen-hub');
  el.className = 'screen min-h-screen flex flex-col items-center justify-center p-6 text-center';
  el.innerHTML = `<div class="text-7xl mb-3 anim-float">☁️💤</div>
    <h2 class="font-titulo text-2xl text-cereja mb-2">A nuvenzinha do tempo está dormindo 💤</h2>
    <p>Verifique sua internet e volte!</p>`;
  showScreen('screen-hub');
}

async function enterHub() {
  const serverDate = await fetchServerDate();
  if (!serverDate) return showOffline();          // never release on offline (PRD §6.3)
  const phase = mapWeekdayToPhase(saoPauloWeekday(serverDate));
  const faseHoje = phase.tipo === 'fase' ? phase.fase : (phase.tipo === 'cofre' ? 5 : 0);

  renderHub(state, faseHoje, (fase, atual) => {
    if (fase === 5 && phase.tipo === 'cofre') return goCofre();
    if (!atual) return goBloqueio('futuro');       // clicked a future/locked day
    if (state.diasConcluidos[dayKey(fase)]) return goBloqueio('concluido');
    goEnigma(fase);
  });
  showScreen('screen-hub');
}

function dayKey(fase) { return ['', 'terca', 'quarta', 'quinta', 'sexta'][fase]; }

function goBloqueio(motivo) { renderBloqueio(motivo); showScreen('screen-bloqueio'); }

function goEnigma(fase) {
  renderEnigma(fase, state, persist, {
    onSolved: () => { state = loadState(storage); goBloqueio('concluido'); },
    onBack: enterHub,
  });
  showScreen('screen-enigma');
}

function goCofre() { renderCofre(state, persist); showScreen('screen-cofre'); }

// Entry point: always start at Login.
renderLogin(enterHub);
showScreen('screen-login');
```

> `enigma.js` and `cofre.js` are created in later tasks. Until then, stub them so the app loads — see Step 4.

- [ ] **Step 4: Create temporary stubs so the page loads**

```js
// js/screens/enigma.js  (TEMP STUB — replaced in Task 13)
export function renderEnigma(fase, state, persist, handlers) {
  document.getElementById('screen-enigma').innerHTML =
    `<div class="p-6 text-center"><p>Enigma ${fase} em construção</p>
     <button id="stub-back" class="underline">voltar</button></div>`;
  document.getElementById('stub-back').addEventListener('click', handlers.onBack);
}
```

```js
// js/screens/cofre.js  (TEMP STUB — replaced in Task 14)
export function renderCofre() {
  document.getElementById('screen-cofre').innerHTML = `<div class="p-6 text-center">Cofre em construção</div>`;
}
```

- [ ] **Step 5: Manual verification**

Run: `npm run serve`, open the page, log in.
Expected: Hub renders 5 cards; today's card shimmers (depends on real weekday + API); clicking a locked/future day → countdown screen; clicking today's day → enigma stub. If offline (kill wifi), Hub shows the sleeping-cloud screen and never opens a phase (Acceptance §14 Time-gating).

- [ ] **Step 6: Commit**

```bash
git add js/notify.js js/screens/hub.js js/main.js js/screens/enigma.js js/screens/cofre.js
git commit -m "feat: hub + bootstrap routing + whatsapp notify (enigma/cofre stubbed)"
```

---

## SPRINT 2 — Puzzles 1 & 2

### Task 9: `fase1-cripto.js` logic (TDD)

**Files:**
- Create: `js/puzzles/fase1-cripto.js`
- Test: `tests/fase1-cripto.test.js`

- [ ] **Step 1: Write the failing test**

```js
// tests/fase1-cripto.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { decodeCipher, checkFase1 } from '../js/puzzles/fase1-cripto.js';

const legenda = { '🍓': 'A', '⭐': 'M', '🌸': 'R' };

test('decodeCipher maps emojis to letters', () => {
  assert.equal(decodeCipher('🍓⭐🍓🌸', legenda), 'AMAR');
});

test('checkFase1 accepts the right word ignoring case/accents', () => {
  assert.equal(checkFase1('Amar', 'amar'), true);
  assert.equal(checkFase1('AMAR', 'amar'), true);
  assert.equal(checkFase1('amor', 'amar'), false);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/fase1-cripto.test.js`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `js/puzzles/fase1-cripto.js`**

```js
// js/puzzles/fase1-cripto.js
import { normalizeText } from '../normalize.js';

export function decodeCipher(emojiString, legenda) {
  return [...emojiString].map(ch => legenda[ch] ?? ch).join('');
}

export function checkFase1(userInput, respostaEsperada) {
  return normalizeText(userInput) === normalizeText(respostaEsperada);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/fase1-cripto.test.js`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add js/puzzles/fase1-cripto.js tests/fase1-cripto.test.js
git commit -m "feat: fase1 cipher logic with tests"
```

---

### Task 10: `fase2-mapa.js` logic (TDD)

**Files:**
- Create: `js/puzzles/fase2-mapa.js`
- Test: `tests/fase2-mapa.test.js`

- [ ] **Step 1: Write the failing test**

```js
// tests/fase2-mapa.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { distance, checkFase2 } from '../js/puzzles/fase2-mapa.js';

test('distance is euclidean', () => {
  assert.equal(distance({x:0,y:0}, {x:3,y:4}), 5);
});

test('checkFase2 true within radius, false outside', () => {
  const alvo = { x: 50, y: 50 };
  assert.equal(checkFase2({ x: 53, y: 52 }, alvo, 8), true);   // dist ~3.6 < 8
  assert.equal(checkFase2({ x: 70, y: 70 }, alvo, 8), false);  // dist ~28 > 8
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/fase2-mapa.test.js`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `js/puzzles/fase2-mapa.js`**

```js
// js/puzzles/fase2-mapa.js
export function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

// click & alvo em coordenadas 0..100; raio = % da largura.
export function checkFase2(click, alvo, raioPct) {
  return distance(click, alvo) <= raioPct;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/fase2-mapa.test.js`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add js/puzzles/fase2-mapa.js tests/fase2-mapa.test.js
git commit -m "feat: fase2 map distance logic with tests"
```

---

## SPRINT 3 — Puzzles 3 & 4 + Effects

### Task 11: `fase3-quarto.js` parser (TDD)

**Files:**
- Create: `js/puzzles/fase3-quarto.js`
- Test: `tests/fase3-quarto.test.js`

- [ ] **Step 1: Write the failing test**

```js
// tests/fase3-quarto.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseCommand, isHackAttempt } from '../js/puzzles/fase3-quarto.js';

const cfg = {
  pistaFinal: { palavrasChave: ['caixinha', 'caixa'], texto: 'achou o fragmento DE' },
  comandos: [
    { palavrasChave: ['escrivaninha', 'mesa'], resposta: 'um bilhete' },
    { palavrasChave: ['cama', 'embaixo'], resposta: 'poeira fofa' },
  ],
};

test('matches keyword regardless of accent/case/extra words', () => {
  assert.deepEqual(parseCommand('Olhar a ESCRIVANINHA', cfg), { tipo: 'comando', texto: 'um bilhete' });
  assert.deepEqual(parseCommand('abrir a caixinha', cfg),      { tipo: 'pista', texto: 'achou o fragmento DE' });
});

test('unknown command returns nao-encontrado', () => {
  assert.deepEqual(parseCommand('voar pela janela', cfg), { tipo: 'nada' });
});

test('isHackAttempt detects hack words', () => {
  assert.equal(isHackAttempt('hackear o sistema'), true);
  assert.equal(isHackAttempt('olhar mesa'), false);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/fase3-quarto.test.js`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `js/puzzles/fase3-quarto.js`**

```js
// js/puzzles/fase3-quarto.js
import { normalizeText } from '../normalize.js';

const HACK_WORDS = ['hackear', 'hack', 'sudo', 'cheat', 'trapacear'];

export function isHackAttempt(input) {
  const n = normalizeText(input);
  return HACK_WORDS.some(w => n.includes(w));
}

function matches(input, palavras) {
  const n = normalizeText(input);
  return palavras.some(p => n.includes(normalizeText(p)));
}

export function parseCommand(input, cfg) {
  if (matches(input, cfg.pistaFinal.palavrasChave)) return { tipo: 'pista', texto: cfg.pistaFinal.texto };
  for (const c of cfg.comandos) {
    if (matches(input, c.palavrasChave)) return { tipo: 'comando', texto: c.resposta };
  }
  return { tipo: 'nada' };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/fase3-quarto.test.js`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add js/puzzles/fase3-quarto.js tests/fase3-quarto.test.js
git commit -m "feat: fase3 room command parser with tests"
```

---

### Task 12: `fase4-musica.js` (TDD) + `cuteOverflow.js` + `fadaScanner.js`

**Files:**
- Create: `js/puzzles/fase4-musica.js`
- Test: `tests/fase4-musica.test.js`
- Create: `js/effects/cuteOverflow.js`
- Create: `js/effects/fadaScanner.js`

- [ ] **Step 1: Write the failing test for song matching**

```js
// tests/fase4-musica.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkSong } from '../js/puzzles/fase4-musica.js';

test('checkSong ignores accents, case, and feat', () => {
  assert.equal(checkSong('Nossa Música', 'nossa musica'), true);
  assert.equal(checkSong('nossa musica (feat. alguem)', 'nossa musica'), true);
  assert.equal(checkSong('outra cancao', 'nossa musica'), false);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/fase4-musica.test.js`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `js/puzzles/fase4-musica.js`**

```js
// js/puzzles/fase4-musica.js
import { normalizeText } from '../normalize.js';

function stripFeat(s) { return s.replace(/\bfeat\b.*$/, '').replace(/\(.*?\)/g, ''); }

export function checkSong(userInput, respostaEsperada) {
  return normalizeText(stripFeat(userInput)) === normalizeText(stripFeat(respostaEsperada));
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/fase4-musica.test.js`
Expected: PASS (1 test).

- [ ] **Step 5: Implement `js/effects/cuteOverflow.js`**

```js
// js/effects/cuteOverflow.js
// Disparado por hack attempt na fase 3. Inunda a tela e revela estrela secreta.
export function triggerCuteOverflow(onEasterEgg, doc = document) {
  const overlay = doc.createElement('div');
  overlay.className = 'fixed inset-0 pointer-events-none z-50 overflow-hidden';
  doc.body.appendChild(overlay);

  for (let i = 0; i < 40; i++) {
    const drop = doc.createElement('div');
    drop.textContent = Math.random() < 0.5 ? '🍓' : '🎀';
    drop.style.position = 'absolute';
    drop.style.left = `${Math.random() * 100}%`;
    drop.style.top = '-40px';
    drop.style.fontSize = '28px';
    drop.style.transition = 'transform 3s linear, opacity 3s linear';
    overlay.appendChild(drop);
    requestAnimationFrame(() => {
      drop.style.transform = `translateY(${doc.documentElement.clientHeight + 80}px)`;
      drop.style.opacity = '0.2';
    });
  }

  const err = doc.createElement('div');
  err.className = 'fixed top-1/3 left-1/2 -translate-x-1/2 bg-marfim text-cereja font-titulo '
    + 'rounded-2xl shadow-xl p-5 text-center z-50 max-w-xs pointer-events-auto';
  err.innerHTML = `CUTE_OVERFLOW_ERROR 🍓🎀<br><span class="text-sm font-corpo">
    Nível de fofura excedeu os limites. Dê um abraço no namorado para reiniciar.</span>
    <button id="cute-star" class="block mx-auto mt-3 text-3xl anim-bounce">⭐</button>`;
  doc.body.appendChild(err);

  err.querySelector('#cute-star').addEventListener('click', () => {
    onEasterEgg();
    err.querySelector('#cute-star').insertAdjacentHTML('afterend',
      '<p class="text-sm mt-2">✨ Você achou a estrelinha secreta! Dica bônus desbloqueada 💕</p>');
  });

  setTimeout(() => overlay.remove(), 3200);
}
```

- [ ] **Step 6: Implement `js/effects/fadaScanner.js`** (webcam + mandatory skip)

```js
// js/effects/fadaScanner.js
// PRD §9.2: nada é gravado/enviado; botão "pular" obrigatório se câmera negada.
export function renderFadaScanner(onConcluido, doc = document) {
  const host = doc.getElementById('screen-enigma');
  const box = doc.createElement('div');
  box.id = 'scanner-box';
  box.className = 'mt-4 bg-marfim rounded-2xl p-4 text-center';
  box.innerHTML = `
    <h3 class="font-titulo text-cereja mb-2">Espelho Mágico 🪞✨</h3>
    <video id="scanner-video" autoplay playsinline
      class="rounded-xl mx-auto max-w-xs w-full" style="filter:saturate(1.3) brightness(1.1)"></video>
    <div id="scanner-controls" class="mt-3">
      <button id="scanner-start" class="rounded-full bg-cereja text-marfim font-titulo px-5 py-2">
        Confirmar identidade de princesa 👑</button>
      <button id="scanner-skip" class="block mx-auto mt-2 text-sm underline">
        Pular — toda princesa é reconhecida do mesmo jeito 💕</button>
    </div>
    <p id="scanner-msg" class="text-sm mt-2 h-5"></p>`;
  host.appendChild(box);

  const video = box.querySelector('#scanner-video');
  const msg = box.querySelector('#scanner-msg');

  box.querySelector('#scanner-skip').addEventListener('click', () => finish('Toda princesa é reconhecida 💕'));

  box.querySelector('#scanner-start').addEventListener('click', async () => {
    if (!navigator.mediaDevices?.getUserMedia) return msg.textContent = 'Câmera indisponível — use Pular 💕';
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      video.srcObject = stream;
      msg.textContent = 'Escaneando... ✨';
      setTimeout(() => {
        stream.getTracks().forEach(t => t.stop());     // stop camera immediately after
        finish('Identidade confirmada: Princesa Oficial 👑✨');
      }, 2500);
    } catch {
      msg.textContent = 'Tudo bem! Toque em Pular 💕';   // permission denied -> skip stays available
    }
  });

  function finish(text) { msg.textContent = text; setTimeout(onConcluido, 900); }
}
```

- [ ] **Step 7: Commit**

```bash
git add js/puzzles/fase4-musica.js tests/fase4-musica.test.js js/effects/cuteOverflow.js js/effects/fadaScanner.js
git commit -m "feat: fase4 song check + cute overflow + fada scanner effects"
```

---

### Task 13: `enigma.js` — real puzzle UIs (replaces stub)

**Files:**
- Replace: `js/screens/enigma.js`

This screen dispatches by `fase` and wires each puzzle's logic + fallback hints + WhatsApp notifications.

- [ ] **Step 1: Replace `js/screens/enigma.js`**

```js
// js/screens/enigma.js
import { CONFIG } from '../config.js';
import { collectFragment, recordWrongAttempt, saveState } from '../state.js';
import { sendWhatsApp } from '../notify.js';
import { decodeCipher, checkFase1 } from '../puzzles/fase1-cripto.js';
import { checkFase2 } from '../puzzles/fase2-mapa.js';
import { parseCommand, isHackAttempt } from '../puzzles/fase3-quarto.js';
import { checkSong } from '../puzzles/fase4-musica.js';
import { triggerCuteOverflow } from '../effects/cuteOverflow.js';
import { renderFadaScanner } from '../effects/fadaScanner.js';

const NOMES = { 1: 'Receita Secreta', 2: 'Mapa dos Encontros', 3: 'Organizador de Laços', 4: 'Caixinha de Música' };

// handlers: { onSolved, onBack }; persist() saves the (closure-captured) state.
export function renderEnigma(fase, state, persist, handlers, doc = document) {
  const el = doc.getElementById('screen-enigma');
  el.className = 'screen min-h-screen p-6';
  el.innerHTML = `
    <header class="flex justify-between items-center mb-4 max-w-lg mx-auto">
      <button id="enigma-back" class="text-sm underline">← jardim</button>
      <h2 class="font-titulo text-cereja">${NOMES[fase]}</h2>
      <span class="text-sm">${state.fragmentosColetados.length}/4 🎀</span>
    </header>
    <div id="enigma-body" class="max-w-lg mx-auto bg-marfim rounded-3xl p-6"></div>
    <p id="enigma-msg" class="text-center text-cereja mt-3 h-6"></p>`;
  doc.getElementById('enigma-back').addEventListener('click', handlers.onBack);

  const body = doc.getElementById('enigma-body');
  const msg = doc.getElementById('enigma-msg');

  function win() {
    const fragmento = CONFIG.fragmentos[`fase${fase}`];
    const next = collectFragment(state, fase, fragmento);
    Object.assign(state, next);
    persist();
    sendWhatsApp(`🎀 Ela passou da Fase ${fase} (${NOMES[fase]})!`);
    msg.textContent = `Fragmento ${fragmento} coletado! 🎉`;
    setTimeout(handlers.onSolved, 1200);
  }

  function wrong() {
    const next = recordWrongAttempt(state, fase);
    Object.assign(state, next);
    persist();
    const n = state.tentativasErradas[`fase${fase}`];
    if (n === 4) sendWhatsApp(`😅 Ela errou ${n}x na Fase ${fase}...`);
    return n;
  }

  if (fase === 1) renderFase1(body, msg, win, wrong);
  if (fase === 2) renderFase2(body, msg, win, wrong);
  if (fase === 3) renderFase3(body, msg, win, wrong, state, persist);
  if (fase === 4) renderFase4(body, msg, win, wrong, handlers);
}

// ---------- Fase 1: Criptografia ----------
function renderFase1(body, msg, win, wrong) {
  const { legenda, desafios } = CONFIG.fase1;
  const desafio = desafios[0];
  const legendaHTML = Object.entries(legenda).map(([e, l]) => `${e}=${l}`).join(' &nbsp; ');
  body.innerHTML = `
    <p class="mb-2">Decifre o ingrediente secreto 🍰</p>
    <p class="text-xl mb-1">${desafio.dica}</p>
    <p id="f1-legenda" class="text-sm mb-3">${legendaHTML}</p>
    <input id="f1-input" class="w-full rounded-full border-2 border-rosa px-4 py-2 text-center" placeholder="palavra" />
    <button id="f1-btn" class="mt-3 w-full rounded-full bg-cereja text-marfim font-titulo py-2">Conferir</button>`;
  body.querySelector('#f1-btn').addEventListener('click', () => {
    if (checkFase1(body.querySelector('#f1-input').value, desafio.resposta)) return win();
    const n = wrong();
    msg.textContent = 'Hmm, não foi dessa vez 🍓';
    if (n >= 3) {
      // dica de fallback: revela a decodificação completa (PRD §8.1)
      body.querySelector('#f1-legenda').textContent = `Dica: ${decodeCipher(desafio.dica, legenda)}`;
    }
  });
}

// ---------- Fase 2: Mapa ----------
function renderFase2(body, msg, win, wrong) {
  const { alvo, raioAcertoPct, nomeLocal } = CONFIG.fase2;
  body.innerHTML = `
    <p class="mb-2">Onde foi ${nomeLocal}? Toque no mapa 🗺️👣</p>
    <div id="f2-map" class="relative w-full aspect-video rounded-2xl bg-gradient-to-br from-rosa to-marfim cursor-crosshair overflow-hidden">
      <span class="absolute inset-0 flex items-center justify-center text-5xl opacity-40">🗺️</span>
    </div>`;
  const map = body.querySelector('#f2-map');
  map.addEventListener('click', e => {
    const r = map.getBoundingClientRect();
    const click = { x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 };
    if (checkFase2(click, alvo, raioAcertoPct)) return win();
    wrong();
    const d = Math.round(Math.hypot(click.x - alvo.x, click.y - alvo.y));
    msg.textContent = `Quase lá! Faltam ~${d} passos 👣`;
  });
}

// ---------- Fase 3: Quarto ----------
function renderFase3(body, msg, win, wrong, state, persist) {
  body.innerHTML = `
    <p class="mb-2">Explore o quarto digitando comandos (ex: "olhar escrivaninha") 🎀</p>
    <div id="f3-log" class="text-sm bg-rosa/30 rounded-xl p-3 h-32 overflow-y-auto mb-2"></div>
    <input id="f3-input" class="w-full rounded-full border-2 border-rosa px-4 py-2" placeholder="o que fazer?" />`;
  const log = body.querySelector('#f3-log');
  const input = body.querySelector('#f3-input');
  function append(t) { log.insertAdjacentHTML('beforeend', `<p>› ${t}</p>`); log.scrollTop = log.scrollHeight; }

  input.addEventListener('keydown', e => {
    if (e.key !== 'Enter') return;
    const val = input.value; input.value = '';
    if (isHackAttempt(val)) {
      append('Tentou hackear? 🍓');
      triggerCuteOverflow(() => { state.easterEggDestravado = true; persist(); });
      return;
    }
    const r = parseCommand(val, CONFIG.fase3);
    if (r.tipo === 'pista') { append(r.texto); return win(); }
    if (r.tipo === 'comando') return append(r.texto);
    append('Não encontrei nada por aí... 🌸');
    wrong();
  });
}

// ---------- Fase 4: Caixinha de Música ----------
function renderFase4(body, msg, win, wrong, handlers) {
  const musica = CONFIG.fase4.musicas[0];
  body.innerHTML = `
    <p class="mb-2">Que música é essa, em caixinha? 🎵</p>
    <audio controls src="${musica.arquivo}" class="w-full mb-3"></audio>
    <input id="f4-input" class="w-full rounded-full border-2 border-rosa px-4 py-2 text-center" placeholder="nome da música" />
    <button id="f4-btn" class="mt-3 w-full rounded-full bg-cereja text-marfim font-titulo py-2">Conferir</button>`;
  body.querySelector('#f4-btn').addEventListener('click', () => {
    if (checkSong(body.querySelector('#f4-input').value, musica.resposta)) {
      // scanner da fada antes de concluir (PRD §9.2)
      body.innerHTML = '<p class="text-center">Música certa! Falta só uma coisinha... ✨</p>';
      renderFadaScanner(win);
    } else {
      wrong();
      msg.textContent = 'Hmm, escuta de novo 🎶';
    }
  });
}
```

- [ ] **Step 2: Manual verification (each phase)**

Run: `npm run serve`. To test a specific phase regardless of weekday, temporarily force `faseHoje` in `main.js` `enterHub` (e.g. `const faseHoje = 1;`) — **revert after testing**.
Expected per phase:
- F1: wrong 3× reveals decoded hint; correct word → "Fragmento HOT coletado".
- F2: clicking near `CONFIG.fase2.alvo` wins; far click shows "~N passos".
- F3: `olhar escrivaninha` → response; `hackear` → strawberry/bow rain + clickable star sets easter egg; pista keyword → win.
- F4: correct song → fada scanner appears; start uses webcam then confirms; "Pular" works without camera.

- [ ] **Step 3: Commit**

```bash
git add js/screens/enigma.js
git commit -m "feat: full enigma screen wiring all 4 puzzles + effects + notify"
```

---

## SPRINT 4 — Climax (Cofre Final)

### Task 14: `fragments.js` validation (TDD)

**Files:**
- Create: `js/fragments.js`
- Test: `tests/fragments.test.js`

- [ ] **Step 1: Write the failing test**

```js
// tests/fragments.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateVaultCombo } from '../js/fragments.js';

const esperado = { fase1: 'HOT', fase2: 'EL', fase3: 'DE', fase4: 'LUXO' };

test('accepts correct slots (case/space-insensitive)', () => {
  assert.equal(validateVaultCombo([' hot ', 'el', 'De', 'luxo'], esperado), true);
});

test('rejects wrong or out-of-order entries', () => {
  assert.equal(validateVaultCombo(['EL', 'HOT', 'DE', 'LUXO'], esperado), false);
  assert.equal(validateVaultCombo(['HOT', 'EL', 'DE', ''], esperado), false);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/fragments.test.js`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `js/fragments.js`**

```js
// js/fragments.js
// Slots fixos e ordenados (PRD §10): HOT | EL | DE | LUXO -> "HOTEL DE LUXO".
export function validateVaultCombo(inputs, esperado) {
  const want = [esperado.fase1, esperado.fase2, esperado.fase3, esperado.fase4];
  return inputs.length === 4 && want.every((w, i) =>
    String(inputs[i] ?? '').trim().toUpperCase() === w.toUpperCase());
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/fragments.test.js`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add js/fragments.js tests/fragments.test.js
git commit -m "feat: vault combo validation with tests"
```

---

### Task 15: `cofre.js` — vault + voucher reveal (replaces stub)

**Files:**
- Replace: `js/screens/cofre.js`

- [ ] **Step 1: Replace `js/screens/cofre.js`**

```js
// js/screens/cofre.js
import { CONFIG } from '../config.js';
import { validateVaultCombo } from '../fragments.js';
import { sendWhatsApp } from '../notify.js';

export function renderCofre(state, persist, doc = document) {
  const el = doc.getElementById('screen-cofre');
  el.className = 'screen min-h-screen p-6 flex flex-col items-center justify-center';

  // Pré-condição: 4 fragmentos (sábado já validado pelo roteador em main.js).
  if (state.fragmentosColetados.length < 4) {
    el.innerHTML = `<div class="text-center"><div class="text-6xl mb-3">🔐</div>
      <p>O cofre só abre com os 4 fragmentos, princesa 🎀</p></div>`;
    return;
  }

  el.innerHTML = `
    <div class="text-6xl mb-3 anim-float">💎🔐</div>
    <h2 class="font-titulo text-2xl text-cereja mb-1">Cofre Final</h2>
    <p class="text-sm mb-4">Monte a senha: 🎀 _ _ _ 🎀</p>
    <div class="grid grid-cols-4 gap-2 mb-3">
      ${['HOT','EL','DE','LUXO'].map((hint,i) =>
        `<input id="slot-${i}" maxlength="6" placeholder="${hint}"
          class="w-full rounded-xl border-2 border-rosa px-2 py-3 text-center uppercase font-titulo" />`).join('')}
    </div>
    <button id="cofre-btn" class="rounded-full bg-cereja text-marfim font-titulo px-8 py-3 anim-bounce">Abrir 💖</button>
    <p id="cofre-msg" class="text-cereja mt-3 h-6"></p>
    <div id="voucher" class="hidden mt-6 bg-marfim rounded-3xl shadow-xl p-6 max-w-sm text-center"></div>`;

  const msg = doc.getElementById('cofre-msg');
  doc.getElementById('cofre-btn').addEventListener('click', () => {
    const inputs = [0,1,2,3].map(i => doc.getElementById(`slot-${i}`).value);
    if (!validateVaultCombo(inputs, CONFIG.fragmentos)) {
      msg.textContent = 'Hmm, faltou um laço! Confere os fragmentos 🎀';
      el.querySelector('.anim-float').classList.add('anim-shake');
      setTimeout(() => el.querySelector('.anim-float').classList.remove('anim-shake'), 400);
      return;
    }
    state.cofreAberto = true; persist();
    sendWhatsApp('🎉 Ela abriu o Cofre Final! HOTEL DE LUXO revelado 💖');
    revealVoucher(doc);
  });

  if (state.cofreAberto) revealVoucher(doc); // re-entrar já aberto
}

function revealVoucher(doc) {
  const v = CONFIG.voucher;
  const box = doc.getElementById('voucher');
  box.classList.remove('hidden');
  box.innerHTML = `
    <div class="text-5xl mb-2">🏨✨</div>
    <h3 class="font-titulo text-xl text-cereja mb-2">${v.titulo}</h3>
    <p class="mb-1"><strong>Hotel:</strong> ${v.hotel}</p>
    <p class="mb-1"><strong>Inclui:</strong> ${v.inclui}</p>
    <p class="mb-1"><strong>Validade:</strong> ${v.validade}</p>
    <p class="mt-3 italic">${v.dedicatoria}</p>`;
  if (window.confetti) {
    const heart = window.confetti.shapeFromText ? window.confetti.shapeFromText({ text: '❤️' }) : undefined;
    window.confetti({ particleCount: 150, spread: 90, origin: { y: 0.6 }, shapes: heart ? [heart] : undefined });
  }
}
```

- [ ] **Step 2: Manual verification**

To reach the vault off-Saturday, temporarily set `phase.tipo='cofre'` handling or seed state in DevTools:
`localStorage.setItem('escapeRoomState', JSON.stringify({versao:1,faseAtual:5,fragmentosColetados:['HOT','EL','DE','LUXO'],diasConcluidos:{terca:true,quarta:true,quinta:true,sexta:true},tentativasErradas:{fase1:0,fase2:0,fase3:0,fase4:0},easterEggDestravado:false,scannerConcluido:true,cofreAberto:false,dataInicio:null}))`
then in `main.js` force `goCofre()` once. **Revert forces after.**
Expected: 4 slots; wrong combo → shake + message; `HOT/EL/DE/LUXO` → confetti + voucher card with `CONFIG.voucher` content.

- [ ] **Step 3: Commit**

```bash
git add js/screens/cofre.js
git commit -m "feat: final vault with combo validation, confetti, voucher reveal"
```

---

## SPRINT 5 — Polish

### Task 16: Anti-cheat "charm layer" (never blocks play)

**Files:**
- Create: `js/effects/charmGuard.js`
- Modify: `js/main.js` (import + call once)

- [ ] **Step 1: Implement `js/effects/charmGuard.js`**

```js
// js/effects/charmGuard.js
// PRD §13: dissuasor de charme. NUNCA trava o jogo.
export function installCharmGuard(doc = document) {
  doc.addEventListener('contextmenu', e => {
    e.preventDefault();
    flash('Ei, espiã! 👀 Sem trapacear no jardim secreto 🎀', doc);
  });
  doc.addEventListener('keydown', e => {
    const blocked = e.key === 'F12'
      || (e.ctrlKey && e.shiftKey && ['I','J','C'].includes(e.key.toUpperCase()))
      || (e.ctrlKey && e.key.toUpperCase() === 'U');
    if (blocked) { e.preventDefault(); flash('Ei, espiã! 👀 Sem trapacear no jardim secreto 🎀', doc); }
  });
}

function flash(text, doc) {
  let t = doc.getElementById('charm-toast');
  if (!t) {
    t = doc.createElement('div');
    t.id = 'charm-toast';
    t.className = 'fixed bottom-4 left-1/2 -translate-x-1/2 bg-marfim text-cereja '
      + 'font-titulo rounded-full px-5 py-2 shadow-lg z-50 transition-opacity';
    doc.body.appendChild(t);
  }
  t.textContent = text; t.style.opacity = '1';
  setTimeout(() => { t.style.opacity = '0'; }, 1800);
}
```

- [ ] **Step 2: Wire into `js/main.js`** — add near the top imports and call after bootstrap

Add import with the others:
```js
import { installCharmGuard } from './effects/charmGuard.js';
```
Add just before `renderLogin(enterHub);`:
```js
installCharmGuard();
```

- [ ] **Step 3: Manual verification**

Run page; right-click and press F12 → fofo toast appears, but DevTools/menu intent is only *discouraged* — gameplay never blocks (Acceptance §13/§14).

- [ ] **Step 4: Commit**

```bash
git add js/effects/charmGuard.js js/main.js
git commit -m "feat: charm-layer anti-cheat (non-blocking)"
```

---

### Task 17: Accessibility + full regression + deploy

**Files:**
- Modify: `index.html` (lang, meta description, alt/aria touches if missing)

- [ ] **Step 1: Run the full test suite**

Run: `node --test`
Expected: all suites PASS (normalize, state, router, timeGating, time-helpers, fase1–4, fragments).

- [ ] **Step 2: Accessibility pass**

Confirm in `index.html` and screens: every interactive control is a real `<button>`/`<input>` (already true); add `aria-label` to icon-only buttons (e.g. cofre slots have `placeholder`; add `aria-label="fragmento ${i+1}"`). Verify `prefers-reduced-motion` kills animations (DevTools → Rendering → emulate). Check text contrast: cereja `#D72638` on marfim `#FFFDD0` passes for large/bold titles.

- [ ] **Step 3: Cross-device smoke test (manual checklist)**

- [ ] 320px width (mobile): no horizontal scroll; hub stacks vertically.
- [ ] Refresh mid-game: progress persists (localStorage).
- [ ] Offline: Hub shows sleeping-cloud, no phase opens.
- [ ] Webcam denied: "Pular" finishes Fase 4.

- [ ] **Step 4: Deploy to GitHub Pages**

```bash
git branch -M main
git remote add origin https://github.com/<user>/<repo>.git
git push -u origin main
```
Then GitHub → Settings → Pages → Source: `main` / root. Wait for the green check; open `https://<user>.github.io/<repo>/`.

- [ ] **Step 5: Production verification**

On the live HTTPS URL: login works, webcam prompt appears on Fase 4 (HTTPS unlocks it), confetti fires on the vault. Send the link to the recipient with the reminder: *"Joguinho do mesmo celular todo dia, tá? 🎀"* (PRD §5.3 option 1).

- [ ] **Step 6: Commit any a11y tweaks**

```bash
git add index.html
git commit -m "chore: accessibility tweaks + deploy verification"
```

---

## Self-Review — Spec Coverage Check

| PRD Section | Covered by |
|---|---|
| §4 Stack (Vanilla, Tailwind CDN, GH Pages, no build) | Task 0, 4, 17 |
| §5 State model / localStorage | Task 3 |
| §5.3 Device continuity (orientation) | Task 17 Step 5 (reminder message) |
| §6 Time-gating + cascade + offline | Task 6, 8 (`showOffline`) |
| §6.4 Conclusão trava o dia | Task 3 (`collectFragment` idempotent) + Task 8 routing |
| §7.1 Login (page-flip, shake, accent-tolerant) | Task 5 |
| §7.2 Hub (future/atual/concluído visuals) | Task 8 |
| §7.4 Bloqueio countdown to SP midnight | Task 7 |
| §8.1 Fase 1 cipher + 3-error hint | Task 9, 13 |
| §8.2 Fase 2 map + euclidean + tolerance | Task 10, 13 |
| §8.3 Fase 3 command parser | Task 11, 13 |
| §8.4 Fase 4 song normalize (feat) | Task 12, 13 |
| §9.1 Cute Overflow + hidden star | Task 12, 13 |
| §9.2 Fada Scanner + mandatory skip | Task 12, 13 |
| §9.3 WhatsApp CallMeBot fire-and-forget | Task 8, wired in 13 & 15 |
| §10 Cofre (fixed slots, confetti, voucher) | Task 14, 15 |
| §11 UI tokens (palette, fonts, animations) | Task 4 |
| §12 NFRs (responsive, persistence, HTTPS) | Task 4, 17 |
| §13 Anti-cheat charm (non-blocking) | Task 16 |
| §14 Acceptance criteria | verified across Tasks 5–17 |
| §16 Risks (API down, webcam, localStorage cleared via senhaRecuperacao) | Task 6, 12, config `senhaRecuperacao` |

**Pending content (PRD §17)** is isolated in `js/config.js` (Task 2) with working example values marked `// TROCAR`. The app runs end-to-end on examples; the gift-giver swaps in real data with zero code changes. Items needing your input: login password, Fase 1 cipher words, Fase 2 location coords, Fase 3 commands/clue, Fase 4 song files, voucher text, WhatsApp number/apikey.

---

*Plano gerado a partir do PRD v1.0 — feito com 🎀.*
