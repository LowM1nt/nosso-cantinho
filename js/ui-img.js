// <img> com fallback gracioso: se o arquivo não existir, vira um emoji no mesmo lugar.
// (regra do presente: nunca quebrar a magia se uma imagem faltar)

export function installImgFallback(win = window, doc = document) {
  win.__imgFb = (el) => {
    const s = doc.createElement('span');
    s.className = el.getAttribute('data-fbcls') || '';
    s.textContent = el.getAttribute('data-fb') || '🎀';
    el.replaceWith(s);
  };
}

// Retorna o HTML de uma imagem que, ao falhar, é trocada pelo emoji `fb`
// (herdando as classes `fbCls`, pra ficar no mesmo lugar/tamanho).
export function imgFb(src, { alt = '', cls = '', fb = '🎀', fbCls = '' } = {}) {
  return `<img src="${src}" alt="${alt}" class="${cls}" data-fb="${fb}" data-fbcls="${fbCls}"`
       + ` onerror="window.__imgFb(this)" />`;
}

// Mural de Polaroids: cada foto vira uma fotinha impressa (moldura branca + legenda).
// `fotos` = [{ arquivo, legenda }]. Se uma imagem faltar, mostra 📷 no lugar (não quebra).
export function polaroidWall(fotos = []) {
  if (!fotos.length) return '';
  const cards = fotos.map(f => `
    <figure class="polaroid">
      <img src="${f.arquivo}" alt="${f.legenda || 'foto do casal'}" loading="lazy"
           data-fb="📷" data-fbcls="polaroid-fb" onerror="window.__imgFb(this)" />
      <figcaption>${f.legenda || '💖'}</figcaption>
    </figure>`).join('');
  return `<div class="mural">${cards}</div>`;
}
