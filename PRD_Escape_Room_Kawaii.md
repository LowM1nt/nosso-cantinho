# PRD — Escape Room Digital "Jardim dos Laços" 🎀

**Documento de Requisitos de Produto**
**Versão:** 1.0
**Tipo de projeto:** Presente personalizado / Single Page Application (SPA)
**Tema:** Aniversário de 2 anos de namoro
**Estética:** Kawaii / Sanrio (Hello Kitty)

---

## 1. Visão Geral

### 1.1 Resumo Executivo
Aplicação web do tipo *escape room digital* que distribui uma experiência gamificada ao longo de uma semana (terça a sábado). A usuária resolve um enigma por dia, coletando um "fragmento" por fase. O acesso aos dias é controlado por **time-gating** (bloqueio temporal validado por servidor), criando antecipação. No sábado, ela reúne os 4 fragmentos no **Cofre Final** para liberar o prêmio: um voucher de 2 dias em um hotel de luxo.

### 1.2 Problema que Resolve
Um presente de aniversário entregue de uma vez só acaba em segundos. Este produto transforma a entrega em uma **jornada de 5 dias**, gerando engajamento diário, antecipação e memórias afetivas antes da revelação do prêmio.

### 1.3 Objetivo Único de Sucesso (North Star)
A usuária completa as 5 fases ao longo da semana e desbloqueia o voucher no sábado, sem frustração técnica e sem conseguir "pular" os bloqueios temporais facilmente.

---

## 2. Persona & Contexto de Uso

| Atributo | Detalhe |
|---|---|
| Usuária | Adulta, namorada do desenvolvedor, sem conhecimento técnico |
| Dispositivo provável | Celular e/ou notebook pessoal |
| Frequência | 1 sessão curta por dia (5–15 min) |
| Estado emocional desejado | Curiosidade, encantamento, surpresa crescente |
| Nível de tolerância a bug | Baixíssimo — é um presente, qualquer erro quebra a magia |

> **Premissa de design:** prefira robustez e fallback gracioso a recursos sofisticados que possam falhar. Um bug aqui não é um ticket de suporte, é um momento afetivo arruinado.

---

## 3. Objetivos e Não-Objetivos

### 3.1 Objetivos
- Entregar uma SPA leve, responsiva (mobile-first) e visualmente coesa na estética Hello Kitty.
- Implementar progressão persistente e time-gating confiável.
- Garantir que cada fase tenha solução clara, com dicas de fallback para evitar travamento.
- Revelar o voucher de forma memorável no sábado.

### 3.2 Não-Objetivos (fora de escopo)
- Sistema multiusuário / autenticação real / contas.
- Segurança de nível bancário (o "anti-cheat" é dissuasório, não inviolável).
- Backend pesado ou banco de dados (persistência é client-side + APIs públicas).
- Suporte a navegadores legados (IE11 etc.).

---

## 4. Stack Técnica

| Camada | Escolha recomendada | Alternativa |
|---|---|---|
| Camada | Escolha **DEFINIDA** | Observação |
|---|---|---|
| Estrutura | **HTML5 + JS Vanilla (SPA)** ✅ | Sem build step — ideal pra GitHub Pages |
| Estilo | **Tailwind via Play CDN** ✅ | `<script src="cdn.tailwindcss.com">` direto no HTML, sem compilar |
| Tipografia | Quicksand / Fredoka (Google Fonts via `<link>`) | — |
| Animações | CSS keyframes + JS puro | `float`, `bounce`, `page-flip` |
| Confetes | `canvas-confetti` (via CDN) | — |
| Time-gating | Fetch a API de horário pública | com cascata de fallback |
| Notificações | **Webhook → WhatsApp** ✅ | ver Seção 9.3 |
| Hospedagem | **GitHub Pages** ✅ | link enviado direto pra ela |

> **Por que Vanilla e não React+Vite?** Como o site será hospedado no **GitHub Pages** e o link enviado direto pra ela, Vanilla é a melhor escolha: **não exige build nem configuração de `base path`** (React+Vite num subdiretório `usuario.github.io/repo/` exige ajustar `vite.config` e dá dor de cabeça com rotas/assets). Com Vanilla + Tailwind CDN, basta dar `push` dos arquivos e o site está no ar.

> **HTTPS — boa notícia:** domínios `*.github.io` já servem por **HTTPS automaticamente**. Logo, a **webcam (Fada Scanner)** funciona normalmente no GitHub Pages. ✅

> **⚠️ Alerta crítico de progresso (GitHub Pages + localStorage):** o progresso fica salvo no localStorage **do navegador/dispositivo onde ela abrir o link**. Se ela abrir no celular na terça e no notebook na quarta, **o progresso NÃO acompanha** — ela veria o jogo "do zero". **Mitigação obrigatória:** ver Seção 5.3.

---

## 5. Modelo de Dados (Estado / localStorage)

Chave única no localStorage: `escapeRoomState`.

```json
{
  "versao": 1,
  "faseAtual": 1,
  "fragmentosColetados": [],
  "diasConcluidos": {
    "terca": false,
    "quarta": false,
    "quinta": false,
    "sexta": false
  },
  "tentativasErradas": { "fase1": 0, "fase2": 0, "fase3": 0, "fase4": 0 },
  "easterEggDestravado": false,
  "scannerConcluido": false,
  "cofreAberto": false,
  "dataInicio": "2026-XX-XXT00:00:00Z"
}
```

### 5.1 Fragmentos (ordem de coleta)
| Fase | Dia | Fragmento | Valor |
|---|---|---|---|
| 1 | Terça | A | `HOT` |
| 2 | Quarta | B | `EL` |
| 3 | Quinta | C | `DE` |
| 4 | Sexta | D | `LUXO` |

> A junção forma **HOTEL DE LUXO** — a senha conceitual do Cofre Final.

### 5.2 Regras de Estado
- Estado é lido na inicialização; se ausente ou corrompido, inicializa default.
- Sempre salvar após: acertar enigma, errar tentativa, destravar easter egg.
- `versao` permite migração futura sem quebrar saves antigos.

### 5.3 Continuidade entre Dispositivos (decorrente do GitHub Pages) ⚠️
Como não há backend, o localStorage não sincroniza entre dispositivos. Estratégias possíveis (em ordem de esforço):

1. **Orientação simples (recomendado):** combinar com ela "use sempre o mesmo aparelho" — ex: avisar no primeiro acesso *"Joguinho do mesmo celular todo dia, tá? 🎀"*. Zero código extra.
2. **Save por URL/código:** ao concluir cada fase, gerar um "código de princesa" (estado codificado em Base64) que ela pode colar se trocar de aparelho. Mais robusto, custo médio.
3. **Backend leve grátis:** usar um serviço tipo Firebase/Supabase free tier pra guardar o progresso por um "ID secreto". Mais robusto, mais trabalho — provavelmente exagero pra um presente.

> **Decisão sugerida:** opção 1 (orientação) + opção 2 (código de backup) como rede de segurança. Confirmar preferência.

---

## 6. Lógica de Time-Gating (núcleo do produto)

### 6.1 Validação de Data
1. Ao carregar o Hub, fazer `fetch` assíncrono para API de horário pública.
2. Comparar o dia retornado pela API com o cronograma de fases.
3. **NUNCA** confiar no `new Date()` local para liberar fases (burlável mudando o relógio).

### 6.2 Mapeamento Dia ↔ Fase
| Dia da semana | Fase liberada |
|---|---|
| Segunda (pré-início) | Apenas Login disponível, Hub bloqueado |
| Terça | Fase 1 |
| Quarta | Fase 2 |
| Quinta | Fase 3 |
| Sexta | Fase 4 |
| Sábado | Cofre Final |

### 6.3 Fallback de Rede (CRÍTICO)
`worldtimeapi.org` tem histórico de instabilidade. Estratégia em cascata:

1. Tentar API primária (ex: `worldtimeapi.org/api/timezone/America/Sao_Paulo`).
2. Se falhar, tentar API secundária (ex: `timeapi.io`) ou ler o header HTTP `Date` de um `fetch` HEAD a um domínio confiável.
3. Se **tudo** falhar (offline), exibir tela fofa: *"A nuvenzinha do tempo está dormindo 💤 Verifique sua internet e volte!"* — **não liberar fase** nem cair no relógio local.

### 6.4 Anti-Burla
- Validação sempre no carregamento do Hub e antes de abrir qualquer fase.
- Conclusão de fase trava o dia (não dá pra refazer e nem adiantar o próximo).
- Aceitar a realidade: localStorage é editável via DevTools. O objetivo é **dissuadir**, não blindar. Aceitável para um presente.

---

## 7. Fluxo de Telas

```
[Tela 1: Login Diário] 
        │ (senha correta)
        ▼
[Tela 2: Hub Jardim dos Laços] ──► clique em dia FUTURO ──► [Tela 4: Bloqueio Soninho]
        │ (clique no dia atual)
        ▼
[Tela 3: Enigma do Dia] ──► (acerto) ──► coleta fragmento ──► [Tela 4: Bloqueio até amanhã]
        │
        ▼ (sábado, com 4 fragmentos)
[Tela 5: Cofre Final] ──► voucher revelado 🎉
```

### 7.1 Tela 1 — Login (Diário Secreto)
- **Visual:** capa de diário rosa com cadeado dourado, laço e brilhos.
- **Input:** campo em formato de nuvem; botão em formato de laço.
- **Senha inicial:** definida pelo desenvolvedor (ex: data do primeiro beijo, apelido carinhoso). *Sugestão: aceitar variações sem acento/maiúscula.*
- **Acerto:** animação de página virando (page-flip) → transição ao Hub.
- **Erro:** o cadeado "treme" (shake), mensagem fofa: *"Hmm, essa chavinha não abriu 🔑 Tenta de novo!"*

### 7.2 Tela 2 — Hub (Jardim dos Laços)
- **Visual:** linha do tempo (vertical no mobile, horizontal no desktop) com nuvens flutuantes = dias de terça a sábado.
- **Estados visuais por dia:**
  - **Futuro:** Hello Kitty dormindo + cadeado, nuvem acinzentada.
  - **Atual:** nuvem brilhando/pulsando, chamativa.
  - **Concluído (passado):** arco-íris sobre a nuvem + check de coração.
- **Sábado:** representado por um baú/cofre fechado até os 4 fragmentos existirem.

### 7.3 Tela 3 — Enigma Dinâmico
- Componente que carrega o puzzle correspondente ao dia atual (ver Seção 8).
- Header com título do dia + contador de fragmentos coletados.
- Botão "voltar ao jardim".

### 7.4 Tela 4 — Bloqueio (Hora do Soninho)
- **Gatilho:** tentar acessar dia futuro **ou** após concluir o enigma do dia.
- **Visual:** Hello Kitty dormindo, lua, estrelas.
- **Cronômetro regressivo:** horas:minutos:segundos exatos até a **meia-noite do próximo dia** (00:00 horário de São Paulo). Atualiza a cada segundo.
- **Mensagem:** *"A Kitty foi dormir 😴 Volte amanhã para a próxima aventura!"*

### 7.5 Tela 5 — Cofre Final (Sábado)
- Ver Seção 10.

---

## 8. Especificação dos Enigmas

### 8.1 Fase 1 — Terça — Criptografia ("Receita Secreta")
- **Mecânica:** decifrar ingredientes de um bolo, substituindo emojis/símbolos por letras (cifra de substituição simples).
- **Exemplo:** 🍓=A, ⭐=M, 🎀=O … montar palavras de ingredientes.
- **Interação:** legenda visível + campos de input para as palavras decifradas.
- **Recompensa:** Fragmento **A = "HOT"**.
- **Dica de fallback:** após 3 erros, revelar mais uma letra da legenda.

### 8.2 Fase 2 — Quarta — Mapa dos Encontros
- **Mecânica:** mapa em estilo ilustrado pastel; ela clica perto do local do primeiro encontro.
- **Cálculo:** distância euclidiana entre clique e ponto-alvo (coordenadas internas, não geo real).
- **Feedback:** *"Quase lá! Faltam ~X passos 👣"* (escala fictícia "km/passos" só pra ambientar).
- **Tolerância:** raio de acerto generoso (ex: 8% da largura do mapa) — não exigir precisão de pixel.
- **Recompensa:** Fragmento **B = "EL"**.

### 8.3 Fase 3 — Quinta — Organizador de Laços (Quarto Virtual)
- **Mecânica:** parser de comandos de texto numa barra de busca fofa.
- **Comandos esperados:** `olhar escrivaninha`, `abrir caixinha`, `olhar embaixo da cama`, etc.
- **Parser:** normalizar (lowercase, sem acento), buscar por palavras-chave (não exigir frase exata).
- **Recompensa:** Fragmento **C = "DE"** ao encontrar a pista final.
- **Easter Egg vinculado:** ver Seção 9.1 (Cute Overflow).

### 8.4 Fase 4 — Sexta — Caixinha de Música
- **Mecânica:** player rosa retrô toca trechos de músicas do casal em versão "caixinha de música" / desacelerada.
- **Interação:** ela digita o nome da música; validar com normalização (sem acento, ignorar "feat", etc.).
- **Áudio:** arquivos hospedados localmente (cuidado com direitos autorais — uso privado/pessoal).
- **Recompensa:** Fragmento **D = "LUXO"**.
- **Scanner vinculado:** ver Seção 9.2 (Fada Scanner).

---

## 9. Efeitos Especiais

### 9.1 Cute Overflow (Quinta)
- **Gatilho:** ao tentar "forçar" o terminal do quarto virtual (comando inválido repetido / palavra "hackear").
- **Efeito:** tela inundada de morangos e laços caindo (animação canvas/CSS).
- **Erro falso:** `CUTE_OVERFLOW_ERROR: Nível de fofura excedeu os limites. Dê um abraço no namorado para reiniciar 🍓🎀`
- **Recompensa oculta:** uma estrelinha escondida fica clicável e destrava algo (ex: dica bônus ou easter egg). Salvar `easterEggDestravado: true`.

### 9.2 Fada Scanner (Sexta)
- **Gatilho:** botão "Confirmar identidade de princesa".
- **Fluxo:** pedir permissão de webcam (`getUserMedia`) → exibir vídeo com moldura de espelho mágico + filtros CSS (orelhas de gato, brilho) → barra de scan animada passando.
- **Resultado:** *"Identidade confirmada: Princesa Oficial 👑✨"* → `scannerConcluido: true`.
- **Privacidade & fallback (OBRIGATÓRIO):**
  - **Nada é gravado nem enviado.** Apenas exibição local.
  - Se ela **negar a câmera**, oferecer botão *"Pular — toda princesa é reconhecida do mesmo jeito 💕"* que conclui a etapa sem bloquear o progresso.
  - Exige HTTPS para funcionar.

### 9.3 Webhook de Notificação — **WhatsApp** ✅
- **Objetivo:** te avisar no WhatsApp quando ela **passa de fase** ou **erra +3 vezes** numa fase.
- **Como mandar WhatsApp de um site estático (GitHub Pages):**

| Opção | Como funciona | Esforço | Custo |
|---|---|---|---|
| **CallMeBot** (recomendado) | API que manda mensagem no SEU WhatsApp via um `fetch` GET simples. Você se cadastra mandando 1 mensagem pro bot e ganha uma `apikey`. | Baixíssimo | Grátis |
| **Make.com / Zapier** | Webhook `POST` → cenário que dispara WhatsApp (via Twilio/Cloud API) | Médio | Grátis/limitado |
| **Twilio WhatsApp API** | API oficial, mais robusta | Alto | Pago |

- **Recomendação:** **CallMeBot** — é o caminho mais simples pra um projeto pessoal. Uma chamada do tipo `fetch("https://api.callmebot.com/whatsapp.php?phone=...&text=...&apikey=...")`.
- **Payload de exemplo (mensagem):** `🎀 Ela passou da Fase 2 (Mapa)!` ou `😅 Ela errou 4x na Fase 3...`
- **Cuidados:**
  - **Fire-and-forget:** o `fetch` jamais bloqueia a UI dela; se falhar, o jogo segue normal.
  - Não enviar dados sensíveis — só aviso de progresso. Contexto consensual de presente.
  - A `apikey` ficará visível no código-fonte (GitHub Pages é público). Como ela só envia mensagens **pra você mesmo**, o risco é baixo (no máximo alguém te mandaria spam). Se quiser esconder, usar Make.com com webhook ofuscado.

---

## 10. O Cofre Final (Sábado)

- **Pré-condição:** dia = sábado (validado por API) **E** 4 fragmentos coletados.
- **Visual:** caixinha de joias 3D (CSS transform / Three.js opcional) com 4 slots de coração.
- **Interação:** ela digita os 4 fragmentos (`HOT`, `EL`, `DE`, `LUXO`) nos slots.
- **Validação:** normalizar (uppercase, trim). Aceitar em qualquer ordem? → **Não**: cada slot é fixo, mas mostrar dica de qual vai onde.
- **Sucesso:**
  1. Som de brilho ✨
  2. Caixinha gira e abre
  3. `canvas-confetti` com formato de coração
  4. Revela o **voucher estilizado**: hotel de luxo, piscina, pizza, 2 dias, datas.
- **Erro:** caixinha treme + *"Hmm, faltou um laço! Confere os fragmentos 🎀"*.

### 10.1 Conteúdo do Voucher
| Campo | Exemplo |
|---|---|
| Título | "Voucher de Princesa: 2 Dias no Reino dos Sonhos" |
| Hotel | (nome/local) |
| Inclui | Suíte 2 dias · Piscina · Pizza · ❤️ |
| Validade | (definir) |
| Mensagem | dedicatória personalizada |

---

## 11. Diretrizes de UI/UX

### 11.1 Paleta
| Cor | Hex | Uso |
|---|---|---|
| Rosa pastel | `#FFD1DC` | fundos, cards |
| Branco marfim | `#FFFDD0` | superfícies, texto-base claro |
| Vermelho cereja | `#D72638` (sugestão) | detalhes, botões de ação |
| Marrom suave | `#6B4F4F` (sugestão) | tipografia |

### 11.2 Tipografia
- Títulos: **Fredoka** (arredondada, divertida).
- Corpo: **Quicksand** (legível, suave).

### 11.3 Elementos & Animações
- Gráficos: laços, corações, estrelas cadentes, nuvens flutuantes.
- Animações: `float` (sobe/desce suave), `bounce` (botões), `shimmer` (dia atual), `page-flip` (transições).
- Performance: animações via CSS `transform`/`opacity` (não `top`/`left`), respeitando `prefers-reduced-motion`.

---

## 12. Requisitos Não-Funcionais

| Categoria | Requisito |
|---|---|
| Responsividade | Mobile-first; funcional de 320px a desktop |
| Performance | Carregamento inicial < 3s; animações a 60fps |
| Disponibilidade | Funcionar mesmo com webhook/scanner indisponíveis (degradação graciosa) |
| Compatibilidade | Chrome, Safari, Firefox, Edge atuais (desktop + mobile) |
| Acessibilidade | Contraste mínimo de texto; alt text; `prefers-reduced-motion` |
| Persistência | Progresso sobrevive a refresh e fechamento do navegador (mesmo dispositivo/navegador) |
| Segurança | HTTPS obrigatório; bloqueio anti-cheat dissuasório |

---

## 13. "Anti-Cheat" — Escopo e Honestidade Técnica

O pedido inclui bloquear F12 / clique direito e limpar a tela se o console abrir. **Importante alinhar expectativas:**

- Bloquear F12, clique direito e detectar DevTools são **dissuasores leves**, contornáveis por qualquer pessoa técnica. Para uma usuária não-técnica, cumprem o objetivo (manter a magia).
- O bloqueio **não deve nunca** impedir a usuária de jogar — se a detecção der falso positivo, ela não pode ficar travada.
- Recomendado: implementar como "camada de charme" (mensagem fofa ao tentar inspecionar) e não como segurança real.
- Mensagem sugerida ao abrir console: *"Ei, espiã! 👀 Sem trapacear no jardim secreto 🎀"*.

---

## 14. Critérios de Aceitação (por feature)

**Login**
- [ ] Senha correta abre o Hub com animação de page-flip.
- [ ] Senha errada mostra shake + mensagem, sem travar.
- [ ] Aceita variação sem acento/caixa.

**Time-gating**
- [ ] Dia liberado conforme data do servidor, não do relógio local.
- [ ] Mudar o relógio do PC não libera fases.
- [ ] API offline → tela fofa, sem liberar fase indevidamente.

**Hub**
- [ ] Dias futuros bloqueados (Kitty dormindo + cadeado).
- [ ] Dia atual brilha.
- [ ] Dias concluídos exibem arco-íris.

**Enigmas (cada fase)**
- [ ] Acerto coleta o fragmento correto e trava o dia.
- [ ] Dicas de fallback após 3 erros.
- [ ] Estado persiste após refresh.

**Cofre Final**
- [ ] Só abre no sábado com 4 fragmentos.
- [ ] Combinação correta → confetes + voucher.
- [ ] Combinação errada → feedback fofo sem travar.

**Efeitos**
- [ ] Cute Overflow dispara e destrava estrela oculta.
- [ ] Fada Scanner funciona e tem opção de pular se a câmera for negada.

---

## 15. Roadmap de Desenvolvimento (sugerido)

| Fase de build | Entrega |
|---|---|
| **Sprint 0 — Fundação** | Setup (Vite/Tailwind), design tokens (cores/fontes), estrutura de estado + localStorage, **Tela 1 (Login)** ✅ *(escopo inicial pedido)* |
| **Sprint 1 — Navegação** | Hub (Jardim dos Laços) + Tela 4 (Bloqueio) + lógica de time-gating com fallback |
| **Sprint 2 — Enigmas** | Fases 1 e 2 (Criptografia + Mapa) |
| **Sprint 3 — Enigmas + Efeitos** | Fases 3 e 4 (Quarto + Caixinha) + Cute Overflow + Fada Scanner |
| **Sprint 4 — Clímax** | Cofre Final + confetes + voucher |
| **Sprint 5 — Polimento** | Webhook opcional, anti-cheat de charme, testes em devices reais, ajustes de acessibilidade |

> **Escopo imediato (conforme pedido):** começar pelo layout base (HTML/Tailwind), estado do localStorage e Tela 1 (Login do Diário Secreto) — corresponde ao Sprint 0.

---

## 16. Riscos & Mitigações

| Risco | Impacto | Mitigação |
|---|---|---|
| API de horário fora do ar | Alto (trava jogo) | Cascata de APIs + tela offline fofa |
| Webcam não permitida | Médio | Botão "pular" obrigatório |
| Direitos autorais das músicas | Médio | Uso pessoal/privado; trechos curtos |
| localStorage limpo pela usuária | Alto | Senha de "recuperação" manual conhecida pelo dev |
| Ela trocar de dispositivo | Alto | Avisar para usar sempre o mesmo navegador; ou progresso via URL/code |
| Falso positivo no anti-DevTools | Alto | Nunca travar o jogo; apenas mensagem |
| Webhook falhar | Baixo | Fire-and-forget, não bloquear UI |

---

## 17. Decisões em Aberto

### ✅ Decididas
- **Stack:** HTML + JS Vanilla + Tailwind CDN (por causa do GitHub Pages).
- **Hospedagem:** GitHub Pages (link enviado direto pra ela; HTTPS automático).
- **Webhook:** Sim, **WhatsApp** (recomendado via CallMeBot).

### ⏳ Pendentes (conteúdo — precisam de você)
1. Senha inicial do diário (Tela 1).
2. **Fase 1 (Criptografia):** ingredientes do bolo + qual legenda emoji→letra.
3. **Fase 2 (Mapa):** qual é o local do primeiro encontro (pra eu posicionar no mapa).
4. **Fase 3 (Quarto):** quais comandos/pistas e qual objeto esconde a pista final.
5. **Fase 4 (Caixinha de Música):** lista de músicas do casal.
6. Texto da dedicatória + dados do voucher (hotel, datas, o que inclui).
7. **Continuidade entre dispositivos (Seção 5.3):** só orientar "use o mesmo aparelho", ou também gerar código de backup?
8. Seu número de WhatsApp / preferência de método (CallMeBot vs Make.com).

---

*Feito com muito 🎀 para um aniversário de 2 anos.*
