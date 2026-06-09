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
