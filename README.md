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
