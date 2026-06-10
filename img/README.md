# Pasta de imagens 🎀

PNGs com **fundo transparente** que a UI usa.
Se algum arquivo faltar, o site mostra um emoji no lugar — nada quebra.

| Arquivo | Onde aparece | Fallback se faltar |
|---|---|---|
| `kitty-waving.png` | Login (grande), Hub (cabeçalho) e Cofre (comemoração) | 🐱🎀 |
| `kitty-sleeping-bed.png` | Tela de bloqueio ("Hora do Soninho") | 🌙⭐😴🎀 |
| `kitty-strawberry.png` | Fase 1 — Receita Secreta (cripto 🍓) | 🍓 |
| `kitty-glasses.png` | Fase 3 — Organizador de Laços (quarto/detetive) | 🔍🎀 |

> Os PNGs originais `[CITYPNG.COM]...` ficam guardados aqui como fonte; a UI usa as cópias de nome limpo acima.

Depois de adicionar/remover imagens: `git add -A && git commit -m "imagens" && git push`.
