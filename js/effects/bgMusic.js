// Música de fundo em loop, com botão de mudo e "ducking":
// quando algum outro áudio toca (ex.: a Fase 4 / Slow Down), a música de fundo pausa
// e volta sozinha quando aquele áudio termina/pausa. Lembra a preferência de mudo.
export function installBgMusic(src, { win = window, doc = document, volume = 0.32 } = {}) {
  const audio = doc.createElement('audio');
  audio.src = src;
  audio.loop = true;
  audio.preload = 'auto';
  audio.volume = volume;
  audio.id = 'bg-music';
  doc.body.appendChild(audio);

  let muted = false;
  try { muted = win.localStorage?.getItem('bgMusicMuted') === '1'; } catch { /* ignore */ }

  // botão flutuante de mudo
  const btn = doc.createElement('button');
  btn.id = 'bg-music-toggle';
  btn.className = 'fixed bottom-4 right-4 z-50 glass rounded-full w-11 h-11 text-xl hover-lift';
  btn.setAttribute('aria-label', 'ligar ou desligar a música de fundo');
  const paint = () => { btn.textContent = muted ? '🔇' : '🎵'; };
  paint();
  doc.body.appendChild(btn);

  const tryPlay = () => { if (!muted) audio.play().catch(() => { /* autoplay bloqueado: espera gesto */ }); };

  // navegadores bloqueiam autoplay com som até o 1º gesto do usuário
  const kick = () => { tryPlay(); win.removeEventListener('pointerdown', kick); win.removeEventListener('keydown', kick); };
  win.addEventListener('pointerdown', kick);
  win.addEventListener('keydown', kick);
  tryPlay();

  // ducking: pausa a música quando outro áudio toca; retoma quando ele para
  const isOther = e => e.target && e.target !== audio && e.target.tagName === 'AUDIO';
  doc.addEventListener('play', e => { if (isOther(e)) audio.pause(); }, true);
  doc.addEventListener('pause', e => { if (isOther(e)) tryPlay(); }, true);
  doc.addEventListener('ended', e => { if (isOther(e)) tryPlay(); }, true);

  btn.addEventListener('click', e => {
    e.stopPropagation();
    muted = !muted;
    try { win.localStorage?.setItem('bgMusicMuted', muted ? '1' : '0'); } catch { /* ignore */ }
    paint();
    if (muted) audio.pause(); else tryPlay();
  });
}
